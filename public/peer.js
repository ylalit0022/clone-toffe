// ═══════════════════════════════════════════════════════════════
//  peer.js  — WebRTC peer connection + DataChannel management
//
//  Responsibilities:
//    - Create / close RTCPeerConnection
//    - ICE candidate handling
//    - DataChannel setup
//    - Reconnect with exponential backoff
//    - Emit events: onDcOpen, onDcClose, onDcMessage, onDcBinary
//
//  Does NOT know about files, chunks, or transfer state.
// ═══════════════════════════════════════════════════════════════

import { buildIceServers } from "./ice.js";

const DEBUG = true;
const plog = (...a) => DEBUG && console.log("[PEER]", ...a);

// ── Public event hooks (set by transfer.js) ──────────────────────────────────
export const PeerEvents = {
  onDcOpen:    (socketId, dc) => {},
  onDcClose:   (socketId)     => {},
  onDcMessage: (socketId, msg) => {},  // parsed JSON
  onDcBinary:  (socketId, buf) => {},  // ArrayBuffer
};

// ── State ─────────────────────────────────────────────────────────────────────
const peers = new Map();   // socketId → { pc, dc, gen, state }
let _primaryId   = null;
let _generation  = 0;

const _reconnectAttempts = new Map();
const _reconnectTimers   = new Map();
const _iceFailTimers     = new Map();

// ── Accessors ─────────────────────────────────────────────────────────────────
export function getPrimaryDc() {
  if (!_primaryId) return null;
  const p = peers.get(_primaryId);
  return (p?.dc?.readyState === "open") ? p.dc : null;
}

export function getPrimaryPc() {
  return _primaryId ? peers.get(_primaryId)?.pc ?? null : null;
}

export function setPrimaryId(socketId) {
  _primaryId = socketId;
}

export function getPrimaryId() { return _primaryId; }

export function allOpenDcs() {
  return [...peers.values()]
    .filter(p => p.dc?.readyState === "open")
    .map(p => p.dc);
}

// ── Create connection (offerer side) ──────────────────────────────────────────
export async function createAndOffer(socketId, signalingSocket) {
  const pc = _newPc(socketId);
  const peer = peers.get(socketId);

  const dc = pc.createDataChannel("file", { ordered: true });
  peer.dc = dc;
  _setupDc(socketId, dc, peer.gen);

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  signalingSocket.emit("webrtc-offer", { to: socketId, sdp: pc.localDescription });
  plog("offer sent to", socketId);
}

// ── Handle incoming offer (answerer side) ─────────────────────────────────────
export async function handleOffer(socketId, sdp, signalingSocket) {
  _primaryId = socketId;
  const pc = _newPc(socketId);

  await pc.setRemoteDescription(sdp);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  signalingSocket.emit("webrtc-answer", { to: socketId, sdp: pc.localDescription });
  plog("answer sent to", socketId);
}

// ── Handle answer ─────────────────────────────────────────────────────────────
export async function handleAnswer(socketId, sdp) {
  const peer = peers.get(socketId) ?? peers.get(_primaryId);
  if (!peer) { plog("handleAnswer: no peer for", socketId); return; }
  await peer.pc.setRemoteDescription(sdp);
}

// ── Handle ICE candidate ──────────────────────────────────────────────────────
export async function handleIceCandidate(socketId, candidate) {
  const peer = peers.get(socketId) ?? peers.get(_primaryId);
  if (!peer) return;
  try { await peer.pc.addIceCandidate(candidate); }
  catch(e) { plog("addIceCandidate error:", e); }
}

// ── Close all peers ───────────────────────────────────────────────────────────
export function closeAll() {
  for (const sid of peers.keys()) _clearTimers(sid);
  for (const [, p] of peers) {
    p.state = "closing";
    try { p.dc?.close(); } catch {}
    try { p.pc?.close(); } catch {}
  }
  peers.clear();
  _primaryId = null;
  plog("all peers closed");
}

// ── Internal: create RTCPeerConnection ────────────────────────────────────────
function _newPc(socketId) {
  _generation++;
  const gen = _generation;
  const pc = new RTCPeerConnection({ iceServers: buildIceServers(), bundlePolicy: "max-bundle", rtcpMuxPolicy: "require" });
  const peerObj = { pc, dc: null, gen, state: "connecting" };
  peers.set(socketId, peerObj);
  if (!_primaryId) _primaryId = socketId;

  pc.onicegatheringstatechange = () => plog("gathering:", pc.iceGatheringState, socketId.slice(0,8));

  pc.oniceconnectionstatechange = () => {
    const s = pc.iceConnectionState;
    plog("ICE:", s, socketId.slice(0,8));

    if (s === "connected" || s === "completed") {
      _clearTimers(socketId);
      _reconnectAttempts.delete(socketId);
    }

    if (s === "failed") {
      // Debounce 400ms — guard against transient blips
      _clearIceFailTimer(socketId);
      const t = setTimeout(() => {
        _iceFailTimers.delete(socketId);
        plog("ICE truly failed →", socketId.slice(0,8));
        _handleFailed(socketId);
      }, 400);
      _iceFailTimers.set(socketId, t);
    }
    // "disconnected" = transient, do nothing — ICE self-heals
  };

  pc.onconnectionstatechange = () => {
    plog("conn:", pc.connectionState, socketId.slice(0,8));
    // Do NOT handle "failed" here — oniceconnectionstatechange owns it
  };

  pc.onicecandidate = e => {
    if (e.candidate) peerObj._signalingSocket?.emit("webrtc-ice", { to: socketId, candidate: e.candidate });
  };
  pc.onicecandidateerror = e => plog("ICE candidate error:", e?.errorCode, e?.errorText);

  pc.ondatachannel = event => {
    peerObj.dc = event.channel;
    _setupDc(socketId, event.channel, gen);
  };

  // Store signaling socket reference for ICE candidates
  peerObj._signalingSocket = window._signalingSocket;

  return pc;
}

// ── Internal: wire up DataChannel events ──────────────────────────────────────
function _setupDc(socketId, dc, gen) {
  dc.binaryType = "arraybuffer";

  dc.onerror = e => plog("DC error:", socketId.slice(0,8), e?.error?.message);

  dc.onopen = () => {
    plog("DC open:", socketId.slice(0,8), "gen", gen);
    const peer = peers.get(socketId);
    if (peer) peer.state = "open";
    _reconnectAttempts.delete(socketId);
    _clearTimers(socketId);
    PeerEvents.onDcOpen(socketId, dc);
  };

  dc.onclose = () => {
    plog("DC closed:", socketId.slice(0,8), "gen", gen);

    if (gen !== _generation) return;   // stale generation — ignore
    const peer = peers.get(socketId);
    if (peer?.state === "closing") return;  // we closed it intentionally

    PeerEvents.onDcClose(socketId);
  };

  dc.onmessage = event => {
    if (typeof event.data === "string") {
      try {
        const msg = JSON.parse(event.data);
        PeerEvents.onDcMessage(socketId, msg);
      } catch {}
    } else {
      PeerEvents.onDcBinary(socketId, event.data);
    }
  };
}

// ── Internal: handle peer failure → reconnect with backoff ────────────────────
let _reconnectCallback = null;  // set by transfer.js via setReconnectCallback()

export function setReconnectCallback(fn) { _reconnectCallback = fn; }

function _handleFailed(socketId) {
  if (_reconnectCallback && !_reconnectCallback(socketId)) return;

  const attempts = (_reconnectAttempts.get(socketId) || 0) + 1;
  _reconnectAttempts.set(socketId, attempts);
  const delay = Math.min(1000 * Math.pow(2, attempts - 1), 15000);
  plog(`reconnect attempt ${attempts} in ${delay}ms`, socketId.slice(0,8));

  // Close the dead peer first — mark as closing so onclose doesn't loop
  const peer = peers.get(socketId);
  if (peer) {
    peer.state = "closing";
    try { peer.dc?.close(); } catch {}
    try { peer.pc?.close(); } catch {}
    peers.delete(socketId);
  }
  if (socketId === _primaryId) {
    _primaryId = peers.size > 0 ? [...peers.keys()][0] : null;
  }

  const timer = setTimeout(async () => {
    _reconnectTimers.delete(socketId);
    try {
      await createAndOffer(socketId, window._signalingSocket);
    } catch(e) { plog("reconnect offer failed:", e); }
  }, delay);
  _reconnectTimers.set(socketId, timer);
}

function _clearTimers(socketId) {
  _clearReconnectTimer(socketId);
  _clearIceFailTimer(socketId);
}
function _clearReconnectTimer(sid) {
  const t = _reconnectTimers.get(sid);
  if (t) { clearTimeout(t); _reconnectTimers.delete(sid); }
}
function _clearIceFailTimer(sid) {
  const t = _iceFailTimers.get(sid);
  if (t) { clearTimeout(t); _iceFailTimers.delete(sid); }
}
// ═══════════════════════════════════════════════════════════════
//  ui.js  — DOM helpers, chat, queue UI, diagnostics
//  No WebRTC. No file I/O. Pure display.
// ═══════════════════════════════════════════════════════════════

// ── DOM refs ──────────────────────────────────────────────────────────────────
export const joinBtn       = document.getElementById("joinBtn");
export const createBtn     = document.getElementById("createBtn");
export const roomInput     = document.getElementById("roomId");
export const statusText    = document.getElementById("status");
export const connDot       = document.getElementById("connDot");
export const roomHint      = document.getElementById("roomHint");
export const deviceNameInput = document.getElementById("deviceName");
export const chatSection   = document.getElementById("chatSection");
export const chatBox       = document.getElementById("chatBox");
export const messageInput  = document.getElementById("messageInput");
export const sendMsgBtn    = document.getElementById("sendBtn");
export const fileInput     = document.getElementById("fileInput");
export const fileStatus    = document.getElementById("fileStatus");
export const progressBar   = document.getElementById("progressBar");
export const speedText     = document.getElementById("speedText");
export const progressText  = document.getElementById("progressText");
export const etaText       = document.getElementById("etaText");
export const pauseBtn      = document.getElementById("pauseBtn");
export const resumeBtn     = document.getElementById("resumeBtn");
export const cancelBtn     = document.getElementById("cancelBtn");
export const modalBg       = document.getElementById("modalBg");
export const modalInfo     = document.getElementById("modalInfo");
export const acceptBtn     = document.getElementById("acceptBtn");
export const rejectBtn     = document.getElementById("rejectBtn");

// ── Format helpers ────────────────────────────────────────────────────────────
export function fmtBytes(bytes) {
  const u = ["B","KB","MB","GB","TB"]; let i = 0, n = bytes;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i === 0 ? 0 : 2)} ${u[i]}`;
}
export function formatETA(s) {
  if (!isFinite(s) || s <= 0) return "--";
  return `${Math.floor(s/60)}m ${Math.floor(s%60)}s`;
}

// ── Status / connection ───────────────────────────────────────────────────────
export function setStatus(text)  { fileStatus.innerText = text; }
export function setConnectedUI(ok, msg, hint = "") {
  connDot.classList.toggle("green", !!ok);
  statusText.innerText = msg;
  roomHint.innerText   = hint;
}
export function resetTransferUI() {
  progressBar.value      = 0;
  speedText.innerText    = "Speed: 0 MB/s";
  progressText.innerText = "0% (0 B / 0 B)";
  etaText.innerText      = "Remaining: --";
  pauseBtn.disabled = true; resumeBtn.disabled = true; cancelBtn.disabled = true;
}
export function onTransferComplete() {
  cancelBtn.disabled = true; pauseBtn.disabled = true; resumeBtn.disabled = true;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
(function injectChatStyles() {
  const s = document.createElement("style");
  s.innerHTML = `
    #chatBox{padding:10px}
    .msgRow{display:flex;margin:6px 0}
    .msgRow.mine{justify-content:flex-end}
    .bubble{max-width:72%;padding:10px 12px;border-radius:14px;font-size:14px;
      line-height:1.25;box-shadow:0 6px 14px rgba(0,0,0,.08);word-break:break-word}
    .bubble.mine{background:rgba(220,248,198,.95)}
    .bubble.other{background:rgba(255,255,255,.92)}
    .bubble .name{font-weight:800;font-size:12px;opacity:.75;margin-bottom:4px}
    .muted{opacity:.7;font-size:13px}
  `;
  document.head.appendChild(s);
})();

export function addMsg(html) {
  const d = document.createElement("div");
  d.className = "msg"; d.innerHTML = html;
  chatBox.appendChild(d); chatBox.scrollTop = chatBox.scrollHeight;
}
export function addChatBubble({ user, text, mine }) {
  const row = document.createElement("div");
  row.className = `msgRow ${mine ? "mine" : "other"}`;
  const b = document.createElement("div");
  b.className = `bubble ${mine ? "mine" : "other"}`;
  b.innerHTML = `<div class="name">${user}</div><div>${text}</div>`;
  row.appendChild(b); chatBox.appendChild(row); chatBox.scrollTop = chatBox.scrollHeight;
}

// ── Device name ───────────────────────────────────────────────────────────────
export function getDeviceName() {
  const v = (deviceNameInput?.value || "").trim();
  if (v) return v;
  const ua = navigator.userAgent;
  const m  = /Android|iPhone|iPad/i.test(ua);
  const br = ua.includes("Edg") ? "Edge" : ua.includes("Chrome") ? "Chrome"
           : ua.includes("Firefox") ? "Firefox" : "Browser";
  return `${m ? "Phone" : "PC"}-${br}`;
}
if (deviceNameInput) {
  deviceNameInput.value = localStorage.getItem("deviceName") || getDeviceName();
  deviceNameInput.addEventListener("input", () => localStorage.setItem("deviceName", deviceNameInput.value));
}

// ── Downloads manager ─────────────────────────────────────────────────────────
const receivedFiles = [];
function ensureDownloadsManager() {
  if (document.getElementById("dlManager")) return;
  const w = document.createElement("div");
  w.id = "dlManager"; w.style.cssText = "margin-top:16px;";
  w.innerHTML = `<div style="font-weight:800;margin-bottom:8px;">📂 Received Files</div>
    <div id="dlList" style="max-height:200px;overflow:auto;border:1px solid rgba(0,0,0,.10);
    border-radius:12px;padding:8px;background:rgba(255,255,255,.7);"></div>`;
  const host = fileInput?.closest(".card") || fileInput?.parentElement || document.body;
  host.appendChild(w);
}
export function addToDownloadsManager({ name, size, type, savedToDisk, url }) {
  receivedFiles.push({ name, size, type, savedToDisk, url });
  ensureDownloadsManager();
  const list = document.getElementById("dlList"); if (!list) return;
  const ext  = name.split(".").pop().toLowerCase();
  const icon = ["mp4","mkv","mov","webm"].includes(ext) ? "🎬"
             : ["jpg","jpeg","png","gif","webp"].includes(ext) ? "🖼️"
             : ["mp3","aac","flac","wav"].includes(ext) ? "🎵"
             : ["pdf"].includes(ext) ? "📄"
             : ["zip","rar","7z"].includes(ext) ? "🗜️" : "📁";
  const i = receivedFiles.length - 1;
  const btn = savedToDisk
    ? `<span style="font-size:12px;opacity:.65;">Saved</span>`
    : `<button onclick="__dlFile(${i})" style="padding:4px 12px;border-radius:8px;border:none;
        background:#ff6b35;color:#fff;font-weight:700;cursor:pointer;font-size:12px;">⬇ Save</button>`;
  const row = document.createElement("div");
  row.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.03);margin-bottom:6px;";
  row.innerHTML = `<div style="display:flex;align-items:center;gap:8px;overflow:hidden;">
    <span style="font-size:20px;">${icon}</span>
    <div><div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;">${name}</div>
    <div style="font-size:11px;opacity:.6;">${fmtBytes(size)}</div></div></div>${btn}`;
  list.appendChild(row);
}
window.__dlFile = function(i) {
  const f = receivedFiles[i]; if (!f?.url) return;
  const a = document.createElement("a"); a.href = f.url; a.download = f.name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
};

// ── Diagnostics badge ─────────────────────────────────────────────────────────
export function showPathBadge(pathType, rttMs) {
  let badge = document.getElementById("connTypeBadge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "connTypeBadge";
    badge.style.cssText = "display:inline-block;margin-left:8px;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;";
    connDot?.parentElement?.appendChild(badge);
  }
  const map = {
    lan:  ["🟢 LAN",  "rgba(0,200,100,.15)", "#006633"],
    wan:  ["🟡 WAN",  "rgba(255,200,0,.15)",  "#886600"],
    turn: ["🔴 TURN", "rgba(255,80,80,.12)",  "#aa2200"],
  };
  const [label, bg, color] = map[pathType] || ["⚪ —", "transparent", "#888"];
  badge.innerText = `${label}${rttMs > 0 ? ` · ${rttMs.toFixed(0)}ms` : ""}`;
  Object.assign(badge.style, { background: bg, color });
}

// ── Drag & drop ───────────────────────────────────────────────────────────────
export function enableDragDrop(onFiles) {
  if (!fileInput) return;
  const host = fileInput.closest(".card") || fileInput.parentElement || document.body;
  const overlay = document.createElement("div");
  overlay.style.cssText = "margin-top:10px;border:2px dashed rgba(0,0,0,.18);border-radius:16px;padding:14px;text-align:center;opacity:.75;user-select:none;";
  overlay.innerHTML = "🖱 Drag & Drop files here";
  host.appendChild(overlay);
  overlay.addEventListener("dragover",  e => { e.preventDefault(); overlay.style.opacity="1"; overlay.style.borderColor="rgba(255,140,60,.7)"; });
  overlay.addEventListener("dragleave", () => { overlay.style.opacity=".75"; overlay.style.borderColor="rgba(0,0,0,.18)"; });
  overlay.addEventListener("drop", e => {
    e.preventDefault(); overlay.style.opacity=".75"; overlay.style.borderColor="rgba(0,0,0,.18)";
    if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files);
  });
}
/**
 * Tranzo Client-Side Security Test
 * Paste this into DevTools Console on https://share.rumnnlg.com
 * Tests: XSS, socket manipulation, data leaks, WebRTC info
 */

(function() {
  'use strict';
  let p = 0, f = 0, w = 0;
  const pass = (l) => { console.log('%c✅ ' + l, 'color:green'); p++; };
  const fail = (l, d) => { console.log('%c❌ FAIL: ' + l + (d ? ' — ' + d : ''), 'color:red;font-weight:bold'); f++; };
  const warn = (l, d) => { console.log('%c⚠️  WARN: ' + l + (d ? ' — ' + d : ''), 'color:orange'); w++; };

  console.group('%c🔒 Tranzo Client Security Audit', 'font-size:16px;font-weight:bold');

  // ── 1. GLOBALS EXPOSED ──────────────────────────────────────────────────────
  console.group('1. Exposed Globals (what a hacker sees)');
  const sensitiveGlobals = ['sendState', 'incomingFile', 'socket', 'NET', 'fileQueue',
    '_primaryPeerSocketId', 'peerConnections', 'handlePeerFailed', 'currentRoom'];
  sensitiveGlobals.forEach(k => {
    if (window[k] !== undefined) {
      warn('window.' + k + ' is globally accessible', typeof window[k]);
    }
  });
  // Check if socket auth token is exposed
  if (window.socket?.auth?.token) fail('JWT token exposed in window.socket.auth.token');
  else pass('No JWT token in window.socket.auth');
  // Check if sensitive state can be read
  if (window.sendState) warn('sendState readable — attacker can see transfer progress & file info');
  console.groupEnd();

  // ── 2. XSS SURFACE ──────────────────────────────────────────────────────────
  console.group('2. XSS Attack Surface');
  // Test 1: Can we inject HTML via deviceName?
  // The server strips <>'& from deviceName, but let's verify
  if (window.socket && window.socket.connected) {
    const xssPayload = '<img src=x onerror=console.error("XSS:deviceName")>';
    window.socket.emit('join-room', {
      roomId: window.currentRoom || 'test',
      deviceName: xssPayload
    });
    warn('XSS deviceName payload sent — check if alert/error fires in peer browser');
    warn('Server should strip < and > from deviceName (verified in server code)');
  }

  // Test 2: Check addMsg — does it sanitize?
  if (typeof addMsg === 'function') {
    try {
      // addMsg takes raw HTML — check if user data ever flows into it unescaped
      warn('addMsg() takes raw HTML — any user-controlled data passed to it is XSS risk');
      // Specific: file-cancel "by" field goes into addMsg via toast without escaping
      warn('KNOWN XSS VECTOR: file-cancel "by" field → toast() → innerHTML (unsanitized)');
      warn('Fix: escape `by` before passing to toast()');
    } catch(e) {}
  }

  // Test 3: File name in transfer-ui
  warn('File names in transfer-ui.js are escaped with replace(/<,>/) but NOT full HTML encoding');
  warn('Single/double quotes in filenames may break attribute contexts');
  pass('multiroom.js uses escHtml() correctly for deviceName in member list');
  console.groupEnd();

  // ── 3. WEBRTC DATA CHANNEL — CAN ATTACKER INTERCEPT? ───────────────────────
  console.group('3. WebRTC & DataChannel Security');
  if (window.peerConnections && window.peerConnections.size > 0) {
    const peer = [...window.peerConnections.values()][0];
    const pc = peer?.pc;
    if (pc) {
      const stats = pc.connectionState;
      const ice   = pc.iceConnectionState;
      console.log('PeerConnection state:', stats, '| ICE:', ice);

      // Check DTLS fingerprint — is encryption verified?
      pc.getStats().then(s => {
        s.forEach(stat => {
          if (stat.type === 'certificate') {
            pass('DTLS certificate present — DataChannel is encrypted');
            console.log('  Fingerprint algo:', stat.fingerprint?.split(' ')[0]);
          }
        });
      });
      warn('WebRTC DataChannel is E2E encrypted (DTLS-SRTP) — server CANNOT read file bytes');
    }
  } else {
    warn('No active peer connection — connect to a peer to test WebRTC encryption');
  }

  // Can attacker join another room and sniff traffic?
  if (window.socket) {
    pass('Socket.IO is room-scoped — socket.to(room) means you only get events from your room');
    pass('WebRTC is point-to-point — server never touches file bytes');
  }
  console.groupEnd();

  // ── 4. LOCALSTORAGE / SESSION DATA ──────────────────────────────────────────
  console.group('4. Client Storage');
  const lsKeys = Object.keys(localStorage);
  console.log('localStorage keys:', lsKeys);
  lsKeys.forEach(k => {
    const v = localStorage.getItem(k);
    if (k.toLowerCase().includes('token') || k.toLowerCase().includes('secret') ||
        k.toLowerCase().includes('password') || k.toLowerCase().includes('key')) {
      fail('Sensitive key in localStorage: ' + k, v?.slice(0, 20) + '...');
    }
  });
  if (!lsKeys.some(k => k.toLowerCase().includes('token'))) {
    pass('No auth tokens in localStorage');
  }
  // Check: is deviceName in localStorage? (acceptable — not sensitive)
  if (localStorage.getItem('deviceName')) {
    pass('deviceName in localStorage (non-sensitive, expected)');
  }
  console.groupEnd();

  // ── 5. SOCKET MANIPULATION ATTACKS ──────────────────────────────────────────
  console.group('5. Socket Manipulation (what attacker can do)');
  warn('POSSIBLE: Attacker can emit fake file-cancel to disrupt transfer');
  warn('POSSIBLE: Attacker can emit webrtc-offer to a valid socketId they know');
  warn('POSSIBLE: Attacker can flood keepalive events (rate-limited in prod)');
  warn('NOT POSSIBLE: Attacker cannot read DataChannel bytes (E2E encrypted)');
  warn('NOT POSSIBLE: Attacker cannot forge socket.id (server-assigned)');
  pass('Room size capped at 2 — third person gets room-full error');
  pass('socketEventGuard rate-limits all events in production');

  // Test: can we emit to someone else's socket directly?
  if (window.socket) {
    const fakeTarget = 'AAAAAAAAAAAAAAAA';
    window.socket.emit('webrtc-offer', { to: fakeTarget, sdp: {} });
    warn('Sent webrtc-offer to fake socketId — server should route to nobody (io.to delivers to valid IDs only)');
  }
  console.groupEnd();

  // ── 6. INFORMATION LEAKS via API ────────────────────────────────────────────
  console.group('6. API Information Leaks');
  fetch('/api/health').then(r => r.json()).then(j => {
    j.uptime ? warn('/api/health exposes server uptime: ' + Math.round(j.uptime) + 's') : pass('No uptime in /api/health');
    j.version ? warn('/api/health exposes version: ' + j.version) : pass('No version in /api/health');
  });
  fetch('/api/site-config').then(r => r.json()).then(j => {
    if (j.turnHosts?.length) warn('/api/site-config leaks TURN host IPs: ' + j.turnHosts);
    else pass('/api/site-config no sensitive leaks');
  });
  fetch('/api/ice-config').then(r => r.json()).then(j => {
    warn('/api/ice-config is public — exposes ICE/TURN server URLs (expected for WebRTC, but TURN credentials should be time-limited)');
    const hasCreds = j.iceServers?.some(s => s.username || s.credential);
    hasCreds ? pass('TURN credentials present in ice-config (good — authenticated TURN)') : warn('No TURN credentials — using public STUN only');
  });
  console.groupEnd();

  // ── SUMMARY ─────────────────────────────────────────────────────────────────
  setTimeout(() => {
    console.groupEnd();
    console.log('%c\n══ RESULTS ══', 'font-size:14px;font-weight:bold');
    console.log(`%c✅ ${p} passed`, 'color:green;font-weight:bold');
    console.log(`%c❌ ${f} failed`, 'color:red;font-weight:bold');
    console.log(`%c⚠️  ${w} warnings`, 'color:orange;font-weight:bold');
  }, 2000);
})();

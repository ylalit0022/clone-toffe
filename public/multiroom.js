// ═══════════════════════════════════════════════════════════════════════════
//  multiroom.js  — Multi-User Room Panel + File Accept Scoreboard
//
//  FIXES applied (see inline comments):
//    FIX-1  _mySocketId race condition — synced on every connect event
//    FIX-2  _totalJoined/Left counted self — self excluded from all counters
//    FIX-3  _leftLog grew forever — deduped by socketId
//    FIX-4  sock.emit monkey-patch fragility — guarded with symbol, always calls original first
//    FIX-5  Score panel never cleared — auto-clear resolved offers after 60s
//    FIX-6  peer-left marked as "rejected" — now shows "left" status badge
//    FIX-7  file-offer receiver pushed fake members — removed entirely
//    FIX-8  shouldShowModal() read stale count — computed fresh at call time
//    FIX-9  _soloFirstDone persisted across room re-entry — reset on room change
//
//  NEW:
//    • Sender name shown with file in scoreboard header
//    • Member count excludes self
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  "use strict";

  // ── Wait for socket ─────────────────────────────────────────────────────────
  function waitForSocket(cb, attempts) {
    attempts = attempts || 0;
    if (typeof socket !== "undefined") return cb(socket);
    if (attempts > 80) return console.warn("[multiroom] socket never ready");
    setTimeout(function () { waitForSocket(cb, attempts + 1); }, 100);
  }

  // ── State ───────────────────────────────────────────────────────────────────
  var _members    = [];
  var _mySocketId = null;   // FIX-1: kept fresh on every connect event
  var _myRoom     = null;

  var _totalJoined = 0;
  var _totalLeft   = 0;
  var _leftLog     = [];        // [{ deviceName, socketId }] — deduped (FIX-3)
  var _seenIds     = new Set();

  var _offerStatus = new Map(); // offerId → { fileName, fileSize, senderName, peers, ts }
  var _soloFirstDone = {};      // roomId → boolean — reset on room change (FIX-9)

  // ── DOM ──────────────────────────────────────────────────────────────────────
  var membersPanel = document.getElementById("membersPanel");
  var membersList  = document.getElementById("membersList");
  var scorePanel   = document.getElementById("scorePanel");
  var scoreList    = document.getElementById("fileScoreList");

  // ── Styles ───────────────────────────────────────────────────────────────────
  var style = document.createElement("style");
  style.textContent = [
    ".mr-stats-bar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center;}",
    ".mr-stat-pill{display:inline-flex;align-items:center;gap:5px;font-family:'Space Grotesk',sans-serif;",
    "  font-size:12px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;padding:4px 11px;border-radius:999px;}",
    ".mr-stat-joined{background:var(--emLight);color:var(--emDark);border:1px solid var(--borderEm);}",
    ".mr-stat-left{background:var(--roseLight);color:#B91C1C;border:1px solid rgba(239,68,68,.3);}",
    ".mr-stat-current{background:var(--surface);color:var(--muted);border:1px solid var(--border);}",
    ".mr-score-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px;}",
    ".mr-score-accept-count{font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;",
    "  padding:3px 11px;border-radius:999px;background:var(--emLight);color:var(--emDark);",
    "  border:1px solid var(--borderEm);white-space:nowrap;}",
    ".mr-score-accept-count.has-pending{background:var(--ambLight);color:var(--ambDark);border-color:var(--borderAmb);}",
    ".mr-member{display:inline-flex;align-items:center;gap:7px;background:var(--surface);",
    "  border:1px solid var(--border);border-radius:999px;padding:6px 14px 6px 10px;",
    "  font-size:13px;font-weight:600;color:var(--muted);margin:4px 4px 4px 0;",
    "  font-family:'Space Grotesk',sans-serif;box-shadow:var(--shadow-sm);}",
    ".mr-member.me{border-color:var(--borderEm);background:var(--emLight);color:var(--emDark);}",
    ".mr-dot{width:7px;height:7px;border-radius:50%;background:var(--em);",
    "  box-shadow:0 0 0 2px rgba(5,150,105,.18);flex-shrink:0;animation:dotPulse 2.5s infinite;}",
    ".mr-left-pill{display:inline-flex;align-items:center;gap:6px;background:var(--surface);",
    "  border:1px solid var(--border);border-radius:999px;padding:4px 12px 4px 9px;",
    "  font-size:12px;color:var(--muted2);font-family:'Space Grotesk',sans-serif;",
    "  font-weight:500;opacity:.75;margin:3px 3px 3px 0;}",
    ".mr-left-dot{width:7px;height:7px;border-radius:50%;background:var(--muted2);flex-shrink:0;}",
    ".mr-score-file{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border);}",
    ".mr-score-file:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}",
    ".mr-score-filename{font-family:'Bricolage Grotesque',sans-serif;font-size:14px;font-weight:700;",
    "  color:var(--text);margin-bottom:4px;display:flex;align-items:center;gap:8px;}",
    ".mr-score-filename span{font-weight:400;color:var(--muted);font-size:12px;font-family:'Plus Jakarta Sans',sans-serif;}",
    ".mr-score-sender{font-size:12px;color:var(--muted);margin-bottom:8px;font-family:'Plus Jakarta Sans',sans-serif;}",
    ".mr-peer-row{display:flex;align-items:center;justify-content:space-between;",
    "  padding:7px 12px;border-radius:var(--rSm);background:var(--surface);",
    "  border:1px solid var(--border);margin-bottom:5px;font-size:13px;box-shadow:var(--shadow-sm);}",
    ".mr-peer-name{font-weight:600;color:var(--text);font-family:'Space Grotesk',sans-serif;}",
    ".mr-status-badge{font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;",
    "  letter-spacing:.3px;padding:3px 10px;border-radius:999px;}",
    ".mr-status-pending{background:var(--ambLight);color:var(--ambDark);border:1px solid var(--borderAmb);}",
    ".mr-status-accepted{background:var(--emLight);color:var(--emDark);border:1px solid var(--borderEm);}",
    ".mr-status-rejected{background:var(--roseLight);color:#B91C1C;border:1px solid rgba(239,68,68,.3);}",
    ".mr-status-left{background:var(--surface);color:var(--muted);border:1px solid var(--border);}",
    ".mr-score-summary{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;}",
    ".mr-sum-pill{font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;}",
    ".mr-sum-accepted{background:var(--emLight);color:var(--emDark);}",
    ".mr-sum-rejected{background:var(--roseLight);color:#B91C1C;}",
    ".mr-sum-left{background:var(--surface);color:var(--muted);}",
    ".mr-sum-pending{background:var(--ambLight);color:var(--ambDark);}"
  ].join("\n");
  document.head.appendChild(style);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function escHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmtBytesLocal(b) {
    if (!b) return "";
    var u = ["B","KB","MB","GB"]; var i = 0; var n = Number(b);
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return n.toFixed(i ? 1 : 0) + " " + u[i];
  }

  // FIX-2: Count only OTHER peers (not self)
  function otherPeerCount() {
    return _members.filter(function (m) { return m.socketId !== _mySocketId; }).length;
  }

  // ── Render members ───────────────────────────────────────────────────────────
  function renderMembers() {
    if (!membersList) return;

    var othersOnline = _members.filter(function (m) { return m.socketId !== _mySocketId; }).length;

    if (_members.length === 0 && _totalJoined === 0) {
      if (membersPanel) membersPanel.classList.remove("is-visible");
      return;
    }
    if (membersPanel) membersPanel.classList.add("is-visible");

    // Stats bar — FIX-2: all counts exclude self
    var statsHtml = '<div class="mr-stats-bar">';
    if (_totalJoined > 0)  statsHtml += '<span class="mr-stat-pill mr-stat-joined">\uD83D\uDC65 ' + _totalJoined + ' joined</span>';
    if (_totalLeft > 0)    statsHtml += '<span class="mr-stat-pill mr-stat-left">\uD83D\uDEAA ' + _totalLeft + ' left</span>';
    if (othersOnline > 0)  statsHtml += '<span class="mr-stat-pill mr-stat-current">\uD83D\uDFE2 ' + othersOnline + ' in room</span>';
    statsHtml += '</div>';

    // Online member pills
    var pillsHtml = '<div style="display:flex;flex-wrap:wrap;">';
    _members.forEach(function (m) {
      var isMe = m.socketId === _mySocketId;
      pillsHtml += '<div class="mr-member' + (isMe ? ' me' : '') + '">'
        + '<span class="mr-dot"></span>'
        + escHtml(m.deviceName)
        + (isMe ? ' <em style="font-weight:400;font-size:11px;opacity:.65;">(you)</em>' : '')
        + '</div>';
    });
    pillsHtml += '</div>';

    // FIX-3: Left users — already deduped in peer-left handler
    var leftHtml = "";
    if (_leftLog.length > 0) {
      leftHtml = '<div style="margin-top:10px;display:flex;flex-wrap:wrap;">';
      _leftLog.forEach(function (l) {
        leftHtml += '<div class="mr-left-pill">'
          + '<span class="mr-left-dot"></span>'
          + escHtml(l.deviceName)
          + ' <em style="font-size:10px;opacity:.8;">left</em>'
          + '</div>';
      });
      leftHtml += '</div>';
    }

    membersList.innerHTML = statsHtml + pillsHtml + leftHtml;
  }

  // ── Render score panel ───────────────────────────────────────────────────────
  function renderScore() {
    if (!scoreList) return;
    if (_offerStatus.size === 0) {
      if (scorePanel) scorePanel.classList.remove("is-visible");
      return;
    }
    if (scorePanel) scorePanel.classList.add("is-visible");

    var html = "";

    _offerStatus.forEach(function (offer) {
      var accepted = 0, rejected = 0, leftCount = 0, pending = 0, total = 0;
      offer.peers.forEach(function (p) {
        total++;
        if      (p.status === "accepted")  accepted++;
        else if (p.status === "rejected")  rejected++;
        else if (p.status === "left")      leftCount++;
        else                               pending++;
      });

      var allResolved = (pending === 0);
      var countBadge  = '<span class="mr-score-accept-count' + (allResolved ? '' : ' has-pending') + '">'
        + accepted + ' of ' + total + ' accepted'
        + '</span>';

      html += '<div class="mr-score-file">'
        + '<div class="mr-score-header">'
        + '<div class="mr-score-filename">\uD83D\uDCC4 ' + escHtml(offer.fileName)
        + '<span>' + fmtBytesLocal(offer.fileSize) + '</span>'
        + '</div>' + countBadge + '</div>';

      // Sender name — new feature
      if (offer.senderName) {
        html += '<div class="mr-score-sender">\uD83D\uDCE4 Sent by: <strong>' + escHtml(offer.senderName) + '</strong></div>';
      }

      // Per-peer rows
      offer.peers.forEach(function (p) {
        var cls  = p.status === "accepted" ? "mr-status-accepted"
                 : p.status === "rejected" ? "mr-status-rejected"
                 : p.status === "left"     ? "mr-status-left"    // FIX-6
                 : "mr-status-pending";
        var text = p.status === "accepted" ? "\u2705 Accepted"
                 : p.status === "rejected" ? "\u274C Rejected"
                 : p.status === "left"     ? "\uD83D\uDEAA Left" // FIX-6
                 : "\u23F3 Waiting\u2026";
        html += '<div class="mr-peer-row">'
          + '<span class="mr-peer-name">' + escHtml(p.name) + '</span>'
          + '<span class="mr-status-badge ' + cls + '">' + text + '</span>'
          + '</div>';
      });

      // Summary
      html += '<div class="mr-score-summary">';
      if (accepted)  html += '<span class="mr-sum-pill mr-sum-accepted">\u2705 ' + accepted  + ' accepted</span>';
      if (rejected)  html += '<span class="mr-sum-pill mr-sum-rejected">\u274C ' + rejected  + ' rejected</span>';
      if (leftCount) html += '<span class="mr-sum-pill mr-sum-left">\uD83D\uDEAA '  + leftCount + ' left</span>';
      if (pending)   html += '<span class="mr-sum-pill mr-sum-pending">\u23F3 '  + pending   + ' waiting</span>';
      html += '</div></div>';
    });

    scoreList.innerHTML = html;
  }

  // FIX-5: Schedule auto-clear once all peers in an offer are resolved
  function scheduleScoreClear(offerId) {
    setTimeout(function () {
      var offer = _offerStatus.get(offerId);
      if (!offer) return;
      var anyPending = false;
      offer.peers.forEach(function (p) { if (p.status === "pending") anyPending = true; });
      if (!anyPending) {
        _offerStatus.delete(offerId);
        renderScore();
      }
    }, 60000);
  }

  // ── Modal rule ───────────────────────────────────────────────────────────────
  // FIX-8: Read otherPeerCount() fresh each time — not from stale closure
  function shouldShowModal() {
    if (otherPeerCount() >= 2) return true;
    if (!_myRoom) return true;
    if (_soloFirstDone[_myRoom]) return false;
    return true;
  }

  function markSoloFirstDone() {
    if (_myRoom && otherPeerCount() < 2) {
      _soloFirstDone[_myRoom] = true;
    }
  }

  // ── Socket wiring ─────────────────────────────────────────────────────────────
  waitForSocket(function (sock) {

    // FIX-1: Always stay current with socket.id — handles reconnects
    _mySocketId = sock.id;
    sock.on("connect", function () { _mySocketId = sock.id; });

    // Full member list
    sock.on("room-member-list", function (payload) {
      var incoming = payload.members || [];
      var newRoom  = (typeof currentRoom !== "undefined") ? currentRoom : payload.room;

      // FIX-9: Reset ALL per-room state when switching rooms
      if (newRoom !== _myRoom) {
        _totalJoined = 0;
        _totalLeft   = 0;
        _leftLog     = [];
        _seenIds     = new Set();
        delete _soloFirstDone[newRoom];   // fresh solo-tracking for new room session
      }
      _myRoom = newRoom;

      // FIX-2: Skip self when counting joined
      incoming.forEach(function (m) {
        if (m.socketId === _mySocketId) return;
        if (!_seenIds.has(m.socketId)) {
          _seenIds.add(m.socketId);
          _totalJoined++;
        }
      });

      _members = incoming;
      renderMembers();
    });

    // Peer left
    sock.on("peer-left", function (payload) {
      var socketId   = payload.socketId;
      var deviceName = payload.deviceName;

      // FIX-2: Skip self; FIX-3: deduplicate by socketId
      if (socketId !== _mySocketId && _seenIds.has(socketId)) {
        _totalLeft++;
        var alreadyLogged = _leftLog.some(function (l) { return l.socketId === socketId; });
        if (!alreadyLogged) {
          _leftLog.push({ deviceName: deviceName || "Unknown", socketId: socketId });
        }
      }

      _members = _members.filter(function (m) { return m.socketId !== socketId; });
      renderMembers();

      // FIX-6: Only mark as "left", not "rejected"
      _offerStatus.forEach(function (offer) {
        var p = offer.peers.get(socketId);
        if (p && p.status === "pending") {
          p.status = "left";
        }
      });
      renderScore();
    });

    // FIX-4: Safely wrap sock.emit using a guard symbol — never double-wraps,
    // always calls original first so signaling is never blocked by our code
    var GUARD = "__mr_emit_patched__";
    if (!sock[GUARD]) {
      sock[GUARD] = true;
      var _orig = sock.emit;
      sock.emit = function (event) {
        // Call original FIRST — our interception must never block real emit
        var result;
        try { result = _orig.apply(sock, arguments); } catch (e) { console.error("[multiroom] emit threw:", e); }

        if (event === "file-offer") {
          try {
            var p0      = arguments[1] || {};
            var offerId = p0.id || (p0.name + "|" + p0.size);
            var myName  = (typeof getDeviceName === "function") ? getDeviceName() : "Me";

            var peerMap = new Map();
            _members.forEach(function (m) {
              if (m.socketId !== _mySocketId) {
                peerMap.set(m.socketId, { name: m.deviceName, status: "pending" });
              }
            });
            if (peerMap.size > 0) {
              _offerStatus.set(offerId, {
                fileName:   p0.name,
                fileSize:   p0.size,
                senderName: myName,
                peers:      peerMap,
                ts:         Date.now(),
              });
              renderScore();
              scheduleScoreClear(offerId);  // FIX-5
            }
          } catch (inner) {
            console.warn("[multiroom] file-offer tap error:", inner);
          }
        }
        return result;
      };
    }

    // File answer → update scoreboard
    sock.on("file-answer", function (payload) {
      _offerStatus.forEach(function (offer) {
        if (offer.peers.has(payload.from)) {
          offer.peers.get(payload.from).status = payload.accepted ? "accepted" : "rejected";
        }
      });
      renderScore();
    });

    // FIX-7: No fake member push — server room-member-list already includes sender.
    // FIX-8: Compute shouldShowModal() fresh at offer receipt time.
    sock.on("file-offer", function () {
      _myRoom = (typeof currentRoom !== "undefined") ? currentRoom : _myRoom;
      window.__mrShouldShowModal = shouldShowModal();
    });

    // Mark solo-first-done on accept click
    document.addEventListener("click", function (e) {
      if (e.target && e.target.id === "acceptBtn") markSoloFirstDone();
    }, true);

  });

  // Expose for script.js
  window.multiroomGetShouldShowModal = function () { return window.__mrShouldShowModal !== false; };

})();
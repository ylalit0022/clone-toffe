// ═══════════════════════════════════════════════════════════════════════════════
//  enhancements.js  —  One-to-One Transfer Improvements for Tranzo
//
//  Integrates cleanly with monolithic script.js (no imports needed).
//  Also compatible with the modular app.js + peer.js + transfer.js system.
//
//  ✅ 1. Network Alerts         — ICE state toasts (connecting/unstable/lost)
//  ✅ 2. User Action Alerts     — cancel / pause / resume / reject toasts
//  ✅ 3. Adaptive Chunk Badge   — visual tier label (🐢 slow / 🌐 normal / ⚡ fast)
//  ✅ 4. Backpressure Indicator — shows throttle status when DC buffer is full
//  ✅ 5. Smart Retry            — stall detection → receiver requests missing chunk
//  ✅ 6. Keepalive Ping         — DC + socket ping every 10s
//  ✅ 7. Device Detection Icon  — peer device icon in accept modal
//  ✅ 8. Transfer Summary       — post-transfer stats panel (size / time / speed)
//
//  LOAD ORDER (index.njk):
//    <script src="multiroom.js"></script>
//    <script src="script.js"></script>
//    <script src="enhancements.js"></script>   ← add this line
// ═══════════════════════════════════════════════════════════════════════════════

(function (global) {
  "use strict";

  // ── tiny helpers ──────────────────────────────────────────────────────────────
  function fmtBytes(b) {
    var u = ["B","KB","MB","GB","TB"], i = 0, n = b || 0;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return n.toFixed(i === 0 ? 0 : 2) + " " + u[i];
  }
  function fmtDur(ms) {
    var s = Math.round(ms / 1000);
    if (s < 60) return s + "s";
    return Math.floor(s/60) + "m " + (s % 60) + "s";
  }
  function el(id) { return document.getElementById(id); }

  // ─────────────────────────────────────────────────────────────────────────────
  //  INJECT STYLES
  // ─────────────────────────────────────────────────────────────────────────────
  var styleEl = document.createElement("style");
  styleEl.textContent = [
    // Toast container
    "#enh-tc{position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:9999;",
      "display:flex;flex-direction:column;gap:8px;pointer-events:none;width:min(420px,92vw);}",
    ".enh-t{display:flex;align-items:center;gap:10px;padding:11px 16px;border-radius:12px;",
      "font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;line-height:1.3;",
      "box-shadow:0 6px 24px rgba(0,0,0,.13);backdrop-filter:blur(10px);",
      "pointer-events:auto;cursor:pointer;",
      "animation:enhIn .22s cubic-bezier(.34,1.36,.64,1);transition:opacity .28s,transform .28s;}",
    ".enh-t.enh-out{opacity:0;transform:translateY(-8px) scale(.97);}",
    ".enh-t-icon{font-size:15px;flex-shrink:0;}.enh-t-msg{flex:1;}",
    ".enh-info{background:rgba(5,150,105,.11);border:1px solid rgba(5,150,105,.28);color:#065f46;}",
    ".enh-success{background:rgba(5,150,105,.15);border:1px solid rgba(5,150,105,.38);color:#064e3b;}",
    ".enh-warn{background:rgba(217,119,6,.12);border:1px solid rgba(217,119,6,.3);color:#78350f;}",
    ".enh-error{background:rgba(239,68,68,.10);border:1px solid rgba(239,68,68,.28);color:#7f1d1d;}",
    "@keyframes enhIn{from{opacity:0;transform:translateY(-12px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}",
    // Summary panel
    "#enh-summary{display:none;margin-top:14px;border-radius:14px;",
      "background:rgba(5,150,105,.07);border:1px solid rgba(5,150,105,.22);",
      "padding:14px 18px;font-family:'Plus Jakarta Sans',sans-serif;animation:enhIn .3s ease;}",
    ".enh-sum-title{font-weight:800;font-size:14px;color:#065f46;margin-bottom:10px;",
      "display:flex;align-items:center;gap:6px;}",
    ".enh-sum-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}",
    ".enh-sum-cell{background:rgba(255,255,255,.75);border-radius:10px;padding:10px 12px;",
      "text-align:center;border:1px solid rgba(5,150,105,.1);}",
    ".enh-sum-val{font-size:15px;font-weight:800;color:#059669;display:block;line-height:1.2;}",
    ".enh-sum-lbl{font-size:11px;color:#6b7280;font-weight:600;margin-top:2px;}",
    // Device pill
    ".enh-dev-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;",
      "border-radius:999px;font-size:12px;font-weight:700;margin-top:8px;",
      "background:rgba(5,150,105,.1);color:#059669;border:1px solid rgba(5,150,105,.22);",
      "font-family:'Plus Jakarta Sans',sans-serif;}",
    // Chunk badge
    "#enh-chunk-badge{display:none;padding:2px 9px;border-radius:999px;",
      "font-size:11px;font-weight:700;margin-left:6px;vertical-align:middle;",
      "font-family:'Plus Jakarta Sans',sans-serif;}",
    // Backpressure indicator
    "#enh-bp{display:none;padding:4px 10px;border-radius:999px;font-size:11px;",
      "font-weight:700;margin-top:6px;background:rgba(217,119,6,.12);",
      "border:1px solid rgba(217,119,6,.3);color:#78350f;",
      "font-family:'Plus Jakarta Sans',sans-serif;}"
  ].join("");
  document.head.appendChild(styleEl);

  // ─────────────────────────────────────────────────────────────────────────────
  //  1 + 2 ── TOAST SYSTEM
  // ─────────────────────────────────────────────────────────────────────────────
  var _tc = null;
  function _getTC() {
    if (!_tc) { _tc = document.createElement("div"); _tc.id = "enh-tc"; document.body.appendChild(_tc); }
    return _tc;
  }
  var TICONS = { info:"ℹ️", success:"✅", warn:"⚠️", error:"❌" };

  function showAlert(msg, type, ms) {
    type = type || "info"; ms = (ms === undefined) ? 4500 : ms;
    var tc = _getTC();
    var t = document.createElement("div");
    t.className = "enh-t enh-" + type;
    t.innerHTML = '<span class="enh-t-icon">' + (TICONS[type]||"ℹ️") + '</span>' +
                  '<span class="enh-t-msg">' + msg + '</span>';
    tc.appendChild(t);
    function dismiss() {
      t.classList.add("enh-out");
      setTimeout(function(){ t.remove(); }, 300);
    }
    t.addEventListener("click", dismiss);
    if (ms > 0) setTimeout(dismiss, ms);
    return dismiss;
  }

  // Deduplicate: same message within 3 s = skip
  var _recent = {};
  function toast(msg, type, ms) {
    var key = (type||"info") + ":" + msg;
    if (_recent[key]) return;
    _recent[key] = true;
    setTimeout(function(){ delete _recent[key]; }, 3000);
    return showAlert(msg, type, ms);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  7 ── DEVICE DETECTION
  // ─────────────────────────────────────────────────────────────────────────────
  function detectDevice(ua) {
    ua = ua || navigator.userAgent;
    if (/iPad/i.test(ua))             return { icon:"🍎", label:"iPad" };
    if (/iPhone/i.test(ua))           return { icon:"🍎", label:"iPhone" };
    if (/Android.*Mobile/i.test(ua))  return { icon:"📱", label:"Android Phone" };
    if (/Android/i.test(ua))          return { icon:"📱", label:"Android Tablet" };
    if (/Macintosh/i.test(ua))        return { icon:"💻", label:"Mac" };
    if (/Windows/i.test(ua))          return { icon:"💻", label:"Windows PC" };
    return { icon:"💻", label:"Desktop" };
  }

  function _injectDevicePill(fromName) {
    var modalInfo = el("modalInfo");
    if (!modalInfo) return;
    var old = modalInfo.querySelector(".enh-dev-pill");
    if (old) old.remove();
    var dev;
    if (/phone|android|mobile/i.test(fromName))  dev = { icon:"📱", label:"Mobile" };
    else if (/iphone|ipad|ios/i.test(fromName))  dev = { icon:"🍎", label:"iPhone/iPad" };
    else if (/mac/i.test(fromName))              dev = { icon:"💻", label:"Mac" };
    else if (/windows|win/i.test(fromName))      dev = { icon:"💻", label:"Windows PC" };
    else                                          dev = detectDevice();
    var pill = document.createElement("div");
    pill.className = "enh-dev-pill";
    pill.textContent = dev.icon + " " + dev.label;
    modalInfo.appendChild(pill);
  }

  var modalBg = el("modalBg");
  if (modalBg) {
    new MutationObserver(function() {
      if (modalBg.style.display === "flex") {
        var modalInfo = el("modalInfo");
        var txt = modalInfo ? modalInfo.innerText : "";
        var m = txt.match(/From:\s*(.+)/);
        _injectDevicePill(m ? m[1].trim() : "");
      }
    }).observe(modalBg, { attributes:true, attributeFilter:["style"] });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  DC / PC ACCESSORS
  // ─────────────────────────────────────────────────────────────────────────────
  function _getDc() {
    if (global.__peer && global.__peer.getPrimaryDc) return global.__peer.getPrimaryDc();
    if (global.dc && global.dc.readyState === "open") return global.dc;
    return null;
  }
  function _getPc() {
    if (global.__peer && global.__peer.getPrimaryPc) return global.__peer.getPrimaryPc();
    return global.pc || null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  3 ── ADAPTIVE CHUNK BADGE
  // ─────────────────────────────────────────────────────────────────────────────
  var _lastTierIdx = -1;
  var CHUNK_TIERS = [
    { max:24*1024,   label:"🐢 Slow",    bg:"rgba(239,68,68,.1)",   col:"#7f1d1d" },
    { max:80*1024,   label:"🐢 16KB",    bg:"rgba(239,68,68,.1)",   col:"#7f1d1d" },
    { max:192*1024,  label:"🌐 64KB",    bg:"rgba(217,119,6,.12)",  col:"#78350f" },
    { max:300*1024,  label:"🌐 256KB",   bg:"rgba(5,150,105,.1)",   col:"#065f46" },
    { max:Infinity,  label:"⚡ Fast",    bg:"rgba(5,150,105,.14)",  col:"#064e3b" }
  ];

  function _getChunkSize() {
    // Try window.NET (exposed by bridge in index.njk)
    if (global.NET && global.NET.chunkSize) return global.NET.chunkSize;
    // Fallback: scrape diagnostics panel
    var diagEl = el("diagContent");
    if (diagEl) {
      var m = diagEl.innerHTML.match(/Chunk.*?(\d+)KB/i);
      if (m) return parseInt(m[1]) * 1024;
    }
    return 256*1024; // reasonable default
  }

  function _updateChunkBadge(inTransfer) {
    var cs = _getChunkSize();
    var tierIdx = CHUNK_TIERS.findIndex(function(t){ return cs <= t.max; });
    if (tierIdx < 0) tierIdx = CHUNK_TIERS.length - 1;
    if (tierIdx === _lastTierIdx) return;
    _lastTierIdx = tierIdx;

    var badge = el("enh-chunk-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "enh-chunk-badge";
      var speedEl = el("speedText");
      if (speedEl && speedEl.parentElement) speedEl.parentElement.appendChild(badge);
    }
    var t = CHUNK_TIERS[tierIdx];
    badge.style.display   = "inline";
    badge.style.background = t.bg;
    badge.style.color      = t.col;
    badge.style.border     = "1px solid " + t.col + "44";
    badge.textContent      = t.label + " — " + (cs/1024).toFixed(0) + "KB chunks";

    if (inTransfer) {
      if (tierIdx <= 1)      toast("Slow network detected — using " + (cs/1024).toFixed(0) + "KB chunks", "warn", 5000);
      else if (tierIdx === 2) toast("Network adjusted — " + (cs/1024).toFixed(0) + "KB chunks", "info", 4000);
      else if (tierIdx >= 3)  toast("Fast network — " + (cs/1024).toFixed(0) + "KB chunks ⚡", "success", 4000);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  4 ── BACKPRESSURE INDICATOR
  // ─────────────────────────────────────────────────────────────────────────────
  var _bpEl = null;
  var _bpShown = false;

  function _ensureBp() {
    if (_bpEl) return _bpEl;
    _bpEl = document.createElement("div");
    _bpEl.id = "enh-bp";
    _bpEl.textContent = "⏳ Buffer full — throttling send rate";
    var fs = el("fileStatus");
    if (fs && fs.parentElement) fs.parentElement.insertBefore(_bpEl, fs.nextSibling);
    return _bpEl;
  }

  function _pollBp() {
    var dc = _getDc();
    if (!dc || dc.readyState !== "open") {
      if (_bpShown) { _ensureBp().style.display = "none"; _bpShown = false; }
      return;
    }
    var hwm = (global.NET && global.NET.highWaterMark) || 4*1024*1024;
    var buf = dc.bufferedAmount || 0;
    var throttling = buf >= hwm * 0.75;
    var bpEl = _ensureBp();
    if (throttling && !_bpShown) {
      bpEl.textContent = "⏳ Buffer " + (buf/1024/1024).toFixed(1) + "MB — throttling send rate";
      bpEl.style.display = "block";
      _bpShown = true;
    } else if (!throttling && _bpShown) {
      bpEl.style.display = "none";
      _bpShown = false;
    } else if (throttling) {
      bpEl.textContent = "⏳ Buffer " + (buf/1024/1024).toFixed(1) + "MB — throttling send rate";
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  5 ── SMART RETRY (stall detection on receiver side)
  // ─────────────────────────────────────────────────────────────────────────────
  var _retryTimer = null, _lastRxBytes = 0, _retryCount = 0;
  var MAX_RETRIES = 5;

  function _startRetry() {
    _stopRetry();
    _lastRxBytes = 0; _retryCount = 0;
    _retryTimer = setInterval(function() {
      // read incomingFile exposed via window bridge (see integration guide)
      var inc = global.incomingFile;
      if (!inc || !inc.meta) { _stopRetry(); return; }
      if (inc.receivedBytes >= inc.meta.size) { _stopRetry(); return; }

      if (inc.receivedBytes === _lastRxBytes && inc.receivedBytes > 0) {
        if (_retryCount >= MAX_RETRIES) {
          toast("Transfer stalled — you may need to reconnect", "error", 8000);
          _stopRetry(); return;
        }
        _retryCount++;
        var chunkSize = (global.NET && global.NET.chunkSize) || 262144;
        var idx = Math.floor(inc.receivedBytes / chunkSize);
        var dc = _getDc();
        if (dc && dc.readyState === "open") {
          try {
            dc.send(JSON.stringify({ type:"retry-chunk", index:idx }));
            toast("Requesting missing chunk #" + idx, "warn", 3500);
          } catch(e) {}
        }
      } else {
        _retryCount = 0;
      }
      _lastRxBytes = inc.receivedBytes;
    }, 4000);
  }
  function _stopRetry() {
    clearInterval(_retryTimer); _retryTimer = null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  6 ── KEEPALIVE PING
  // ─────────────────────────────────────────────────────────────────────────────
  var _kaTimer = null;
  function _startKeepalive() {
    _stopKeepalive();
    _kaTimer = setInterval(function() {
      var dc = _getDc();
      if (dc && dc.readyState === "open") {
        try { dc.send(JSON.stringify({ type:"ping", ts:Date.now() })); } catch(e) {}
      }
      var sock = global.socket || global._signalingSocket;
      try { if (sock) sock.emit("keepalive"); } catch(e) {}
    }, 10000);
  }
  function _stopKeepalive() {
    clearInterval(_kaTimer); _kaTimer = null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  8 ── TRANSFER SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────
  var _sumStart = 0, _sumBytes = 0;

  function _ensureSum() {
    if (el("enh-summary")) return;
    var p = document.createElement("div");
    p.id = "enh-summary";
    p.innerHTML =
      '<div class="enh-sum-title">📊 Transfer Complete</div>' +
      '<div class="enh-sum-grid">' +
        '<div class="enh-sum-cell"><span class="enh-sum-val" id="enh-s-sz">—</span><div class="enh-sum-lbl">File Size</div></div>' +
        '<div class="enh-sum-cell"><span class="enh-sum-val" id="enh-s-tm">—</span><div class="enh-sum-lbl">Time Taken</div></div>' +
        '<div class="enh-sum-cell"><span class="enh-sum-val" id="enh-s-sp">—</span><div class="enh-sum-lbl">Avg Speed</div></div>' +
      '</div>';
    var fs = el("fileStatus");
    if (fs && fs.parentElement) fs.parentElement.insertBefore(p, fs.nextSibling);
    else document.body.appendChild(p);
  }

  function _showSum(bytes, ms) {
    _ensureSum();
    var p = el("enh-summary"); if (!p) return;
    var bps = ms > 0 ? bytes / (ms/1000) : 0;
    el("enh-s-sz").textContent = fmtBytes(bytes);
    el("enh-s-tm").textContent = fmtDur(ms);
    el("enh-s-sp").textContent = bps > 1024*1024
      ? (bps/1024/1024).toFixed(2) + " MB/s"
      : (bps/1024).toFixed(1) + " KB/s";
    p.style.display = "block";
    setTimeout(function(){ if(p) p.style.display="none"; }, 40000);
  }
  function _hideSum() { var p=el("enh-summary"); if(p) p.style.display="none"; }

  // ─────────────────────────────────────────────────────────────────────────────
  //  1 ── ICE / DC STATE WATCHERS (Network Alerts)
  // ─────────────────────────────────────────────────────────────────────────────
  var _iceState  = "";
  var _dcWasOpen = false;

  setInterval(function() {
    // ICE state
    var pc = _getPc();
    if (pc) {
      var s = pc.iceConnectionState;
      if (s !== _iceState) {
        _iceState = s;
        if (s === "checking")     toast("Connecting to peer…", "info", 5000);
        if (s === "disconnected") toast("Connection unstable — attempting recovery…", "warn", 6000);
        if (s === "failed")       toast("Connection lost — attempting to reconnect…", "error", 7000);
      }
    }

    // DC open/close
    var dc = _getDc();
    var open = dc && dc.readyState === "open";
    if (open && !_dcWasOpen) {
      _dcWasOpen = true;
      toast("Peer connected successfully ✅", "success", 4000);
      _hideSum();
      _startKeepalive();
    } else if (!open && _dcWasOpen) {
      _dcWasOpen = false;
      toast("Connection closed", "warn", 5000);
      _stopKeepalive();
    }
  }, 700);

  // ─────────────────────────────────────────────────────────────────────────────
  //  MASTER POLL — Transfer state from DOM (status text + progress)
  // ─────────────────────────────────────────────────────────────────────────────
  var _lastStatus   = "";
  var _inTransfer   = false;
  var _sumDone      = false;

  setInterval(function() {
    var statusEl  = el("fileStatus");
    var statusTxt = statusEl ? statusEl.innerText : "";
    var fillEl    = el("progressFill");
    var progVal   = fillEl ? parseFloat(fillEl.style.width||"0") : 0;

    // Transfer start
    var nowIn = /Sending|Receiving/i.test(statusTxt);
    if (nowIn && !_inTransfer) {
      _inTransfer = true; _sumDone = false;
      _sumStart = Date.now();
      _sumBytes = 0;
      _hideSum();
      _lastTierIdx = -1;
      _startRetry();
    }

    if (_inTransfer) {
      _updateChunkBadge(true);
      _pollBp();
    }

    // Transfer complete
    var isDone = (/✅/.test(statusTxt) || progVal >= 99.9) && _inTransfer;
    if (isDone && !_sumDone) {
      _sumDone = true; _inTransfer = false;
      var elapsed = Date.now() - _sumStart;
      var bytes   = _sumBytes > 0 ? _sumBytes : 0;
      if (!bytes && global.sendState && global.sendState.file) bytes = global.sendState.file.size;
      if (!bytes && global.incomingFile && global.incomingFile.meta) bytes = global.incomingFile.meta.size;
      if (bytes > 0 && elapsed > 0) _showSum(bytes, elapsed);
      toast("Transfer complete! 🎉", "success", 5000);
      _stopRetry();
      _stopKeepalive();
      setTimeout(function(){ var b=el("enh-chunk-badge"); if(b){b.style.display="none";_lastTierIdx=-1;} }, 3500);
    }

    // Cancel / error
    if (/❌/.test(statusTxt) && _inTransfer) {
      _inTransfer = false;
      _stopRetry(); _stopKeepalive();
      var b = el("enh-chunk-badge"); if(b){b.style.display="none";_lastTierIdx=-1;}
      var bpEl = el("enh-bp"); if(bpEl) bpEl.style.display="none";
    }

    // Pause detection
    if (/⏸/.test(statusTxt) && _lastStatus !== statusTxt) {
      toast("Transfer paused ⏸", "warn", 3500);
    }

    _lastStatus = statusTxt;
  }, 1000);

  // ─────────────────────────────────────────────────────────────────────────────
  //  2 ── BUTTON CLICK ALERTS  (additive listeners — original onclick preserved)
  // ─────────────────────────────────────────────────────────────────────────────
  function _patchButtons() {
    var pb = el("pauseBtn"),  rb = el("resumeBtn"),
        cb = el("cancelBtn"), ej = el("rejectBtn");
    if (pb) pb.addEventListener("click", function(){ if(!pb.disabled) toast("Transfer paused ⏸","warn",3500); });
    if (rb) rb.addEventListener("click", function(){ if(!rb.disabled) toast("Transfer resumed ▶","success",3500); });
    if (cb) cb.addEventListener("click", function(){ if(!cb.disabled) toast("Transfer cancelled by you","warn",4500); });
    if (ej) ej.addEventListener("click", function(){ toast("You rejected the file","warn",4000); });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  SOCKET EVENT ALERTS  (second listener — original handlers intact)
  // ─────────────────────────────────────────────────────────────────────────────
  function _patchSocket() {
    var sock = global.socket || global._signalingSocket;
    if (!sock || !sock.on) { setTimeout(_patchSocket, 600); return; }

    sock.on("file-cancel", function(data) {
      var by = (data && data.by) ? data.by : "Peer";
      toast("Transfer cancelled by " + by, "warn", 5000);
      _stopRetry(); _stopKeepalive();
    });

    sock.on("file-answer", function(ev) {
      if (ev && ev.accepted === false) {
        toast("Receiver rejected the file ❌", "error", 5000);
      } else if (ev && ev.accepted === true) {
        toast("File accepted — connecting P2P…", "info", 4000);
      }
    });

    // Handle incoming ping (pong back)
    // (we use the existing onmessage; just suppress ping from showing as an error)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  RETRY-CHUNK SENDER HANDLER (called from script.js onmessage)
  // ─────────────────────────────────────────────────────────────────────────────
  function handleRetryChunk(chunkIndex, channel) {
    var retransmits = global.sendState && global.sendState.pendingRetransmits;
    if (!retransmits) return;
    var buf = retransmits.get(chunkIndex);
    if (buf) {
      console.log("[ENH-RETRY] retransmitting chunk", chunkIndex);
      try { channel.send(buf); } catch(e) { console.warn("[ENH-RETRY]", e); }
    } else {
      console.warn("[ENH-RETRY] chunk", chunkIndex, "not in buffer (only last 64 kept)");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  INIT
  // ─────────────────────────────────────────────────────────────────────────────
  function init() {
    _patchButtons();
    _patchSocket();
    console.log("[ENH] enhancements.js loaded — 8 features active");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 0);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────────
  global.__enh = {
    showAlert      : showAlert,
    toast          : toast,
    detectDevice   : detectDevice,
    startKeepalive : _startKeepalive,
    stopKeepalive  : _stopKeepalive,
    handleRetryChunk: handleRetryChunk,
    onTransferStart: function(fileSize) {
      _sumBytes = fileSize || 0;
      _sumStart = Date.now();
      _sumDone  = false;
      _inTransfer = true;
      _hideSum();
    },
    onTransferComplete: function(fileSize) {
      if (_sumDone) return;
      _sumDone = true; _inTransfer = false;
      var bytes = fileSize || _sumBytes || 0;
      var ms    = Date.now() - _sumStart;
      if (bytes > 0 && ms > 0) _showSum(bytes, ms);
      toast("Transfer complete! 🎉", "success", 5000);
      _stopRetry(); _stopKeepalive();
    },
    onTransferCancelled: function(by) {
      toast(by === "self" ? "Transfer cancelled by you" : "Transfer cancelled by " + (by||"peer"), "warn", 5000);
      _stopRetry(); _stopKeepalive();
    },
  };

})(window);

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  INTEGRATION GUIDE                                                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ① In index.njk — load this file AFTER script.js and multiroom.js:          ║
║                                                                              ║
║     <script src="multiroom.js"></script>                                     ║
║     <script src="script.js"></script>                                        ║
║     <script src="enhancements.js"></script>   ← ADD THIS LINE               ║
║                                                                              ║
║  ② In index.njk — add this bridge AFTER the two scripts above,              ║
║     so enhancements.js can read script.js private variables:                 ║
║                                                                              ║
║     <script>                                                                 ║
║     // Bridge: expose script.js locals for enhancements.js                  ║
║     Object.defineProperty(window,'NET',{get:function(){                     ║
║       return typeof NET!=='undefined'?NET:null;}});                          ║
║     Object.defineProperty(window,'incomingFile',{get:function(){            ║
║       return typeof incomingFile!=='undefined'?incomingFile:null;}});        ║
║     Object.defineProperty(window,'sendState',{get:function(){               ║
║       return typeof sendState!=='undefined'?sendState:null;}});              ║
║     </script>                                                                ║
║                                                                              ║
║  ③ In script.js — add retry-chunk handler (ONE LINE in channel.onmessage):  ║
║     Find the block that handles msg.type === "nack" and add below it:       ║
║                                                                              ║
║       if (msg.type === "retry-chunk") {                                      ║
║         window.__enh?.handleRetryChunk(msg.index, channel); return;         ║
║       }                                                                      ║
║                                                                              ║
║  ④ OPTIONAL (for precise summary timing):                                    ║
║     In script.js finalizeIncomingFile(), after setStatus("✅ Received"):     ║
║       window.__enh?.onTransferComplete(meta.size);                           ║
║     In script.js finalizeSend(), after sendState.gotComplete:                ║
║       window.__enh?.onTransferComplete(file.size);                           ║
║                                                                              ║
║     Without step ④, summary still appears via DOM polling (slightly delayed).║
║                                                                              ║
║  All other features (toasts, device icon, keepalive, ICE watcher,            ║
║  backpressure indicator, chunk badge) are fully automatic — no code changes. ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

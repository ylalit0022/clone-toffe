// ═══════════════════════════════════════════════════════════════
//  transfer-alerts.js  — User-friendly transfer status alerts
//
//  Drop this file into your project and call:
//    TransferAlerts.init()   — once, after DOM is ready
//
//  Then replace your existing UIEvents hooks (in app.js or
//  script.js) with the wrappers at the bottom of this file.
//
//  What it fixes
//  ─────────────
//  The original code updated only `fileStatus.innerText` and
//  `progressBar.value`. During several real states — ICE/P2P
//  setup, buffer drain backpressure, SHA-256 verification,
//  between-file handshake, and finalization — nothing was shown
//  to the user, so the UI looked frozen/stuck.
//
//  States now surfaced with friendly messages
//  ───────────────────────────────────────────
//  SENDER side
//    queued          → "File added to queue"
//    connecting      → "Setting up a secure connection…"
//    waiting_ready   → "Waiting for the other side to confirm…"
//    sending         → "Sending your file…"  + live progress
//    buffer_drain    → "Catching up with the other device…"
//    reconnecting    → "Lost connection — trying to reconnect…"
//    between_files   → "Preparing next file…"
//    paused          → "Transfer paused"
//    done_sender     → "File delivered!"
//    canceled        → "Transfer canceled"
//    error           → per-error message
//
//  RECEIVER side
//    incoming_offer  → shown in accept modal (unchanged)
//    receiving       → "Receiving your file…" + live progress
//    processing      → "Almost done — saving your file…"  ← KEY FIX
//    done_receiver   → "File received and saved!"
//    integrity_fail  → "File may be damaged"
//
//  Multi-file
//    queue_summary   → "N files queued"
//    per-file rows with individual progress bars
// ═══════════════════════════════════════════════════════════════

const TransferAlerts = (() => {

  // ── Config ────────────────────────────────────────────────────
  const CONTAINER_ID  = "ta-container";
  const ALERT_ID      = "ta-main-alert";
  const QUEUE_ID      = "ta-queue";

  // ── Internal state ────────────────────────────────────────────
  let _queueItems  = [];   // { id, name, size, status, progress }
  let _currentFile = null; // { name, size }
  let _totalFiles  = 0;
  let _fileIndex   = 0;    // 1-based current index

  // ── Inject stylesheet once ────────────────────────────────────
  function _injectStyles() {
    if (document.getElementById("ta-styles")) return;
    const s = document.createElement("style");
    s.id = "ta-styles";
    s.textContent = `
      #${CONTAINER_ID} {
        margin: 12px 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .ta-alert {
        display: flex;
        align-items: flex-start;
        gap: 11px;
        padding: 13px 15px;
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,0.08);
        background: #ffffff;
        margin-bottom: 8px;
        position: relative;
        overflow: hidden;
        animation: ta-in .2s ease;
      }
      @media (prefers-color-scheme: dark) {
        .ta-alert { background: #1e1e1e; border-color: rgba(255,255,255,0.1); }
        .ta-text-primary   { color: #e8e8e8 !important; }
        .ta-text-secondary { color: #999 !important; }
        .ta-text-tertiary  { color: #666 !important; }
        .ta-row-bg         { background: rgba(255,255,255,0.05) !important; }
        .ta-tag-blue   { background: #0d3457 !important; color: #5badee !important; }
        .ta-tag-green  { background: #0a2e1a !important; color: #3dba82 !important; }
        .ta-tag-amber  { background: #2e1f00 !important; color: #e8a83b !important; }
        .ta-tag-gray   { background: #2a2a2a !important; color: #999 !important; }
        .ta-tag-red    { background: #2e0a0a !important; color: #e06060 !important; }
      }
      @keyframes ta-in { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }

      .ta-dot {
        width: 22px; height: 22px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; margin-top: 1px;
      }
      .ta-dot svg { width: 11px; height: 11px; fill: none; stroke: #fff; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }

      .ta-spinner {
        width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; margin-top: 3px;
        border: 2px solid transparent; animation: ta-spin .75s linear infinite;
      }
      @keyframes ta-spin { to { transform: rotate(360deg); } }

      .ta-body { flex: 1; min-width: 0; }
      .ta-row  { display: flex; align-items: flex-start; gap: 6px; }
      .ta-title {
        font-size: 14px; font-weight: 600; line-height: 1.4;
        color: #111; flex: 1;
      }
      .ta-desc {
        font-size: 12px; color: #666; margin-top: 3px; line-height: 1.55;
      }
      .ta-sub {
        font-size: 11px; color: #999; margin-top: 5px;
        display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
      }
      .ta-sub-dot {
        width: 3px; height: 3px; border-radius: 50%; background: #ccc; flex-shrink: 0;
      }
      .ta-tag {
        font-size: 10px; font-weight: 600; padding: 2px 9px; border-radius: 999px;
        white-space: nowrap; flex-shrink: 0; margin-top: 1px; align-self: flex-start;
      }
      .ta-tag-blue  { background: #deeeff; color: #185FA5; }
      .ta-tag-green { background: #d6f5e9; color: #0f6e56; }
      .ta-tag-amber { background: #fef2d9; color: #854f0b; }
      .ta-tag-gray  { background: #efefef; color: #555; }
      .ta-tag-red   { background: #fde8e8; color: #791f1f; }

      .ta-chip {
        display: inline-flex; align-items: center; gap: 5px;
        background: #f4f4f4; border: 1px solid rgba(0,0,0,0.07);
        border-radius: 6px; padding: 3px 8px;
        font-size: 11px; color: #555; margin-top: 6px;
        max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      @media (prefers-color-scheme: dark) {
        .ta-chip { background: #2a2a2a; border-color: rgba(255,255,255,0.1); color: #aaa; }
      }

      .ta-progress {
        height: 3px; border-radius: 2px; background: #eee;
        margin-top: 8px; overflow: hidden;
      }
      @media (prefers-color-scheme: dark) { .ta-progress { background: #333; } }
      .ta-progress-fill {
        height: 100%; border-radius: 2px; transition: width .4s ease;
      }

      /* Multi-file queue rows */
      .ta-queue-list { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
      .ta-queue-row {
        display: flex; align-items: center; gap: 8px;
        padding: 5px 8px; border-radius: 8px; background: #f7f7f7;
      }
      .ta-queue-row .ta-qname {
        font-size: 12px; color: #222; flex: 1;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .ta-queue-row .ta-qsize  { font-size: 11px; color: #999; flex-shrink: 0; }
      .ta-queue-row .ta-qstat  { font-size: 11px; font-weight: 600; flex-shrink: 0; }
      .ta-queue-bar  { height: 2px; border-radius: 1px; background: #e0e0e0; margin-top: 3px; }
      .ta-queue-fill { height: 100%; border-radius: 1px; transition: width .35s; }

      /* Pulse ring for connecting / reconnect states */
      .ta-pulse {
        position: absolute; right: -4px; top: -4px;
        width: 18px; height: 18px; border-radius: 50%;
        animation: ta-pulse 1.5s infinite; opacity: 0; pointer-events: none;
      }
      @keyframes ta-pulse { 0% { transform:scale(.5); opacity:.5; } 100% { transform:scale(2.4); opacity:0; } }
    `;
    document.head.appendChild(s);
  }

  // ── Ensure container exists ───────────────────────────────────
  // Inserts the alert container right after #fileStatus so it
  // sits naturally below the existing status text area.
  function _ensureContainer() {
    if (document.getElementById(CONTAINER_ID)) return;
    const anchor = document.getElementById("fileStatus")
      || document.getElementById("status")
      || document.querySelector(".card");
    if (!anchor) return;
    const div = document.createElement("div");
    div.id = CONTAINER_ID;
    anchor.insertAdjacentElement("afterend", div);
  }

  // ── Low-level render ──────────────────────────────────────────
  function _render({ dotBg, dotIcon, spinner, spinnerColor,
                     title, desc, sub, tag, chip, progress, pulse,
                     queueRows }) {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    // dot / spinner
    let iconEl = "";
    if (spinner) {
      const c = spinnerColor || "#378ADD";
      iconEl = `<div class="ta-spinner"
        style="border-top-color:${c};border-right-color:${c}44;border-bottom-color:${c}22;border-left-color:${c}44">
      </div>`;
    } else if (dotBg) {
      iconEl = `<div class="ta-dot" style="background:${dotBg}">${dotIcon || ""}</div>`;
    }

    // tag
    const tagClass = { blue:"ta-tag-blue", green:"ta-tag-green",
                       amber:"ta-tag-amber", gray:"ta-tag-gray",
                       red:"ta-tag-red" }[tag?.color] || "ta-tag-gray";
    const tagEl = tag
      ? `<div class="ta-tag ${tagClass}">${tag.label}</div>` : "";

    // chip
    const chipEl = chip ? `<div class="ta-chip">${chip}</div>` : "";

    // progress bar
    let progEl = "";
    if (progress != null) {
      const fill = progress >= 100 ? "#1D9E75" : "#378ADD";
      progEl = `<div class="ta-progress">
        <div class="ta-progress-fill" style="width:${Math.min(100,progress)}%;background:${fill}"></div>
      </div>`;
    }

    // sub-line
    const subEl = sub
      ? `<div class="ta-sub">${sub}</div>` : "";

    // pulse ring
    const pulseEl = pulse
      ? `<div class="ta-pulse" style="background:${pulse}"></div>` : "";

    // queue rows
    let qEl = "";
    if (queueRows && queueRows.length) {
      const rows = queueRows.map(r => {
        const sc = r.statusColor || "#999";
        const fc = r.fillColor   || "#378ADD";
        return `<div class="ta-queue-row ta-row-bg">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px">
              <span class="ta-qname ta-text-primary">${_esc(r.name)}</span>
              <span class="ta-qsize ta-text-tertiary">${_fmtBytes(r.size)}</span>
              <span class="ta-qstat" style="color:${sc}">${r.status}</span>
            </div>
            <div class="ta-queue-bar" style="margin-top:3px">
              <div class="ta-queue-fill" style="width:${r.progress||0}%;background:${fc}"></div>
            </div>
          </div>
        </div>`;
      }).join("");
      qEl = `<div class="ta-queue-list">${rows}</div>`;
    }

    container.innerHTML = `
      <div class="ta-alert" id="${ALERT_ID}">
        ${pulseEl}
        ${iconEl}
        <div class="ta-body">
          <div class="ta-row">
            <div style="flex:1">
              <div class="ta-title ta-text-primary">${title}</div>
              ${desc ? `<div class="ta-desc ta-text-secondary">${_esc(desc)}</div>` : ""}
            </div>
            ${tagEl}
          </div>
          ${chipEl}
          ${progEl}
          ${subEl}
          ${qEl}
        </div>
      </div>`;
  }

  // ── Utilities ─────────────────────────────────────────────────
  function _esc(s) {
    return String(s || "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  function _fmtBytes(b) {
    const u = ["B","KB","MB","GB"]; let i = 0, n = Number(b) || 0;
    while (n >= 1024 && i < 3) { n /= 1024; i++; }
    return n.toFixed(i === 0 ? 0 : 1) + " " + u[i];
  }
  function _sub(...parts) {
    return parts.filter(Boolean).join(`<span class="ta-sub-dot"></span>`);
  }
  function _svgCheck() {
    return `<svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg>`;
  }
  function _svgX() {
    return `<svg viewBox="0 0 12 12">
      <line x1="2" y1="2" x2="10" y2="10"/>
      <line x1="10" y1="2" x2="2" y2="10"/>
    </svg>`;
  }
  function _svgWarn() {
    return `<svg viewBox="0 0 12 12">
      <polyline points="6,2 6,7"/>
      <circle cx="6" cy="10" r="1" fill="white"/>
    </svg>`;
  }

  // ═══════════════════════════════════════════════════════════════
  //  PUBLIC API — call these from your UIEvents hooks and from
  //  the places in script.js / app.js listed below.
  // ═══════════════════════════════════════════════════════════════

  const pub = {};

  pub.init = function() {
    _injectStyles();
    _ensureContainer();
  };

  // ── Queue management ──────────────────────────────────────────

  /** Call when a file (or files) are added to fileQueue */
  pub.onFilesQueued = function(files) {
    _queueItems = Array.from(files).map(f => ({
      id:       f._id || f.name,
      name:     f.name,
      size:     f.size,
      status:   "Queued",
      progress: 0,
    }));
    _totalFiles = _queueItems.length;
    _fileIndex  = 0;

    if (_queueItems.length === 1) {
      const f = _queueItems[0];
      _render({
        spinner: true, spinnerColor: "#378ADD",
        title:   "File added — getting ready…",
        desc:    `We'll start sending ${f.name} as soon as the other device is ready.`,
        chip:    `📄 ${f.name} · ${_fmtBytes(f.size)}`,
        tag:     { label: "Queued", color: "blue" },
      });
    } else {
      _render({
        dotBg: "#378ADD", dotIcon: `<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" fill="white"/></svg>`,
        title: `${_queueItems.length} files queued`,
        desc:  "They'll be sent one by one in order. You can add more at any time.",
        tag:   { label: `${_queueItems.length} files`, color: "blue" },
        queueRows: _queueItems.map(q => ({
          name: q.name, size: q.size,
          status: "Queued", statusColor: "#999",
          progress: 0, fillColor: "#D3D1C7",
        })),
      });
    }
  };

  // ── Connection / handshake ────────────────────────────────────

  /** Call when P2P ICE/connection setup begins */
  pub.onConnecting = function(fileName) {
    _render({
      spinner: true, spinnerColor: "#378ADD",
      pulse: "#378ADD",
      title: "Setting up a secure connection…",
      desc:  "Finding the best route between your devices. Usually takes a few seconds.",
      tag:   { label: "Connecting", color: "blue" },
    });
  };

  /** Call when waiting for receiver's "ready" handshake.
   *  Mapped from: UIEvents.onStatus("Waiting for receiver...")  */
  pub.onWaitingForReady = function(fileName) {
    _render({
      spinner: true, spinnerColor: "#1D9E75",
      title: "Waiting for the other device to confirm…",
      desc:  "The other device needs to accept the file before we can start. Nudge them if it takes too long!",
      chip:  fileName ? `📄 ${_esc(fileName)}` : undefined,
      tag:   { label: "Waiting", color: "green" },
    });
  };

  // ── Active transfer ───────────────────────────────────────────

  /**
   * Call from UIEvents.onProgress + UIEvents.onSpeed + UIEvents.onETA combined.
   *
   * @param {object} opts
   * @param {number}  opts.done       bytes transferred so far
   * @param {number}  opts.total      total bytes
   * @param {number}  opts.speedMbps  current speed in MB/s
   * @param {number}  opts.etaSec     estimated seconds remaining
   * @param {boolean} opts.isSender   true = sending, false = receiving
   * @param {string}  opts.fileName
   * @param {number}  [opts.fileIndex]  1-based
   * @param {number}  [opts.totalFiles]
   */
  pub.onProgress = function(opts) {
    const { done, total, speedMbps, etaSec, isSender, fileName, fileIndex, totalFiles } = opts;
    const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
    const multi   = totalFiles > 1;
    const counter = multi ? `${fileIndex} / ${totalFiles}` : `${pct}%`;
    const direction = isSender ? "📤" : "📥";
    const verb      = isSender ? "Sending" : "Receiving";

    const etaStr  = (isFinite(etaSec) && etaSec > 0)
      ? `~${etaSec < 60 ? Math.ceil(etaSec) + "s" : Math.ceil(etaSec/60) + "m"} left`
      : null;
    const speedStr = (speedMbps > 0) ? `${speedMbps.toFixed(1)} MB/s` : null;

    const sub = _sub(
      `${direction} ${_fmtBytes(done)} of ${_fmtBytes(total)}`,
      speedStr,
      etaStr,
      multi ? `${totalFiles - fileIndex} more file${totalFiles - fileIndex !== 1 ? "s" : ""} waiting` : null
    );

    // Update the queue row if multi-file
    if (multi && _queueItems.length) {
      _queueItems.forEach(q => {
        if (q.id === opts.fileId || q.name === fileName) {
          q.status   = isSender ? "Sending…" : "Receiving…";
          q.progress = pct;
        }
      });
    }

    _render({
      spinner: true, spinnerColor: "#378ADD",
      title:   multi
        ? `${verb} file ${fileIndex} of ${totalFiles}…`
        : `${verb} your file…`,
      desc:    multi
        ? `${_esc(fileName)} is on its way. The remaining files follow automatically.`
        : "Keep this tab open and your screen on for best speed.",
      progress: pct,
      sub,
      tag: { label: counter, color: "blue" },
      queueRows: multi ? _queueItems.map(q => ({
        name: q.name, size: q.size,
        status:      q.progress >= 100 ? "✓ Done"
                   : q.status === "Sending…" || q.status === "Receiving…" ? q.status
                   : "Waiting",
        statusColor: q.progress >= 100 ? "#1D9E75"
                   : (q.status === "Sending…" || q.status === "Receiving…") ? "#185FA5"
                   : "#999",
        progress:  q.progress,
        fillColor: q.progress >= 100 ? "#1D9E75"
                 : (q.status === "Sending…" || q.status === "Receiving…") ? "#378ADD"
                 : "#D3D1C7",
      })) : null,
    });
  };

  // ── Buffer backpressure ───────────────────────────────────────

  /**
   * Call when dc.bufferedAmount >= NET.highWaterMark and we're waiting for drain.
   * In script.js this is the waitingDrain = true block in sendLoop().
   */
  pub.onBufferDrain = function(doneSoFar, total) {
    const pct = total > 0 ? Math.round((doneSoFar / total) * 100) : 0;
    _render({
      spinner: true, spinnerColor: "#BA7517",
      title: "Sending — catching up with the other device…",
      desc:  "The other side is processing incoming data. Your transfer hasn't stalled — we'll continue automatically.",
      progress: pct,
      sub: _sub(`${_fmtBytes(doneSoFar)} sent`, "Waiting for buffer to clear"),
      tag: { label: "Catching up", color: "amber" },
    });
  };

  // ── Processing / finalizing  (THE KEY FIX) ────────────────────

  /**
   * Call when transfer bytes are 100% received and finalizeReceive() /
   * SHA-256 verification / disk flush is running.
   *
   * In script.js: mapped from UIEvents.onStatus("⏳ Processing: ...")
   * In transfer.js: call after blob assembly starts, before UIEvents.onComplete
   */
  pub.onProcessing = function(fileName, fileSizeBytes) {
    _render({
      spinner: true, spinnerColor: "#1D9E75",
      title: "Almost done — saving your file…",
      desc:  "All the data has arrived! We're verifying it and saving it to your device. This only takes a moment.",
      progress: 100,
      sub: _sub("🔒 Checking the file is complete", "Should finish shortly"),
      chip: fileName ? `📄 ${_esc(fileName)}${fileSizeBytes ? " · " + _fmtBytes(fileSizeBytes) : ""}` : undefined,
      tag: { label: "Saving…", color: "green" },
    });
  };

  // ── Complete ──────────────────────────────────────────────────

  /**
   * Call from UIEvents.onComplete / after finalizeReceive() succeeds.
   *
   * @param {object} opts
   * @param {string}  opts.fileName
   * @param {number}  opts.fileSizeBytes
   * @param {boolean} opts.isSender
   * @param {number}  [opts.speedMbps]
   * @param {number}  [opts.elapsedSec]
   * @param {boolean} [opts.allDone]    true when fileQueue is now empty
   * @param {number}  [opts.totalFiles]
   */
  pub.onComplete = function(opts) {
    const { fileName, fileSizeBytes, isSender, speedMbps, elapsedSec, allDone, totalFiles } = opts;
    const speedStr   = speedMbps  ? `${speedMbps.toFixed(1)} MB/s average` : null;
    const elapsedStr = elapsedSec ? `${elapsedSec}s total` : null;

    // Mark all queue items done if session complete
    if (allDone && _queueItems.length) {
      _queueItems.forEach(q => { q.status = "✓ Done"; q.progress = 100; });
    }

    _render({
      dotBg: "#1D9E75", dotIcon: _svgCheck(),
      title: allDone && totalFiles > 1
        ? `All ${totalFiles} files ${isSender ? "delivered" : "received"}!`
        : `File ${isSender ? "delivered" : "received and saved"}!`,
      desc: allDone && totalFiles > 1
        ? `Every file has been ${isSender ? "sent successfully" : "saved to your device"}.`
        : isSender
          ? `${_esc(fileName)} was received by the other device.`
          : `${_esc(fileName)} is ready to open. Check your downloads folder.`,
      chip: (!allDone || totalFiles === 1)
        ? `📄 ${_esc(fileName)} · ${_fmtBytes(fileSizeBytes)} · ✓ Verified`
        : undefined,
      sub:  _sub(speedStr, elapsedStr),
      tag:  { label: allDone ? "All done!" : "Done", color: "green" },
      queueRows: allDone && _queueItems.length > 1 ? _queueItems.map(q => ({
        name: q.name, size: q.size,
        status: "✓ Done", statusColor: "#1D9E75",
        progress: 100, fillColor: "#1D9E75",
      })) : null,
    });
  };

  // ── Between-files gap (FIX for frozen UI between queue items) ─

  /**
   * Call in app.js between file completions, when the new P2P DC
   * setup has begun but the next file hasn't started yet.
   * Triggered when _pendingNextFile = true and DC is re-opening.
   */
  pub.onBetweenFiles = function(nextFileName, doneCount, totalCount) {
    // Update queue items
    if (_queueItems.length) {
      let doneIdx = 0;
      _queueItems.forEach((q, i) => {
        if (i < doneCount) { q.status = "✓ Done"; q.progress = 100; }
        else if (i === doneCount) { q.status = "Starting…"; doneIdx = i; }
        else { q.status = "Waiting"; }
      });
    }

    _render({
      spinner: true, spinnerColor: "#1D9E75",
      pulse: "#1D9E75",
      title: `Preparing file ${doneCount + 1} of ${totalCount}…`,
      desc:  `${_esc(nextFileName)} is up next. Setting things up — hang tight.`,
      tag:   { label: "Between files", color: "green" },
      queueRows: _queueItems.length > 1 ? _queueItems.map(q => ({
        name: q.name, size: q.size,
        status: q.status,
        statusColor: q.progress >= 100 ? "#1D9E75" : q.status === "Starting…" ? "#185FA5" : "#999",
        progress: q.progress,
        fillColor: q.progress >= 100 ? "#1D9E75" : q.status === "Starting…" ? "#B5D4F4" : "#D3D1C7",
      })) : null,
    });
  };

  // ── Paused ────────────────────────────────────────────────────

  pub.onPaused = function(doneSoFar, total) {
    const pct = total > 0 ? Math.round((doneSoFar / total) * 100) : 0;
    _render({
      dotBg: "#888780", dotIcon: `<svg viewBox="0 0 12 12"><rect x="2" y="2" width="3" height="8" rx="1" fill="white"/><rect x="7" y="2" width="3" height="8" rx="1" fill="white"/></svg>`,
      title: "Transfer paused",
      desc:  "Your transfer is on hold. Tap Resume whenever you're ready — we'll pick up right where we left off.",
      progress: pct,
      sub: _sub(`📍 ${_fmtBytes(doneSoFar)} sent so far`),
      tag: { label: "Paused", color: "gray" },
    });
  };

  // ── Reconnecting ──────────────────────────────────────────────

  /**
   * Call when ICE fails and reconnect backoff begins.
   * In peer.js: _handleFailed() → trigger this.
   */
  pub.onReconnecting = function(attempt, maxAttempts, doneSoFar, total) {
    const pct = total > 0 ? Math.round((doneSoFar / total) * 100) : 0;
    _render({
      spinner: true, spinnerColor: "#BA7517",
      pulse: "#EF9F27",
      title: "Lost connection — trying to reconnect…",
      desc:  "We'll automatically pick up from where we left off. Don't close this tab. If you're on mobile, keep the screen on.",
      progress: pct,
      sub: _sub(
        `🔄 Attempt ${attempt}${maxAttempts ? " of " + maxAttempts : ""}`,
        `${_fmtBytes(doneSoFar)} already sent — won't resend`
      ),
      tag: { label: "Reconnecting", color: "amber" },
    });
  };

  // ── Error states ──────────────────────────────────────────────

  /** Receiver didn't respond to file-offer in time (waitForReady timeout) */
  pub.onReceiverTimeout = function() {
    _render({
      dotBg: "#BA7517", dotIcon: _svgWarn(),
      title: "The other device didn't respond in time",
      desc:  "We waited but couldn't reach the receiver. Make sure they still have the app open, then try again.",
      sub:   _sub("💡 Ask them to refresh the page if this keeps happening"),
      tag:   { label: "Timed out", color: "amber" },
    });
  };

  /** Blob size mismatch after receive (transfer.js finalizeReceive) */
  pub.onIncompletFile = function(receivedBytes, expectedBytes, fileName) {
    _render({
      dotBg: "#A32D2D", dotIcon: _svgWarn(),
      title: "File arrived incomplete — please retry",
      desc:  `We received ${_fmtBytes(receivedBytes)} but expected ${_fmtBytes(expectedBytes)}. Something interrupted the transfer. Try again — it usually works straight away.`,
      chip:  fileName ? `📄 ${_esc(fileName)}` : undefined,
      tag:   { label: "Incomplete", color: "red" },
    });
  };

  /** SHA-256 hash mismatch */
  pub.onIntegrityFail = function(fileName) {
    _render({
      dotBg: "#A32D2D", dotIcon: _svgWarn(),
      title: "File may be damaged — integrity check failed",
      desc:  "The file arrived but the contents don't match what was sent. This can happen on unstable connections. Please ask the sender to resend it.",
      chip:  fileName ? `📄 ${_esc(fileName)} · ✗ Integrity check failed` : undefined,
      tag:   { label: "Possibly corrupt", color: "red" },
    });
  };

  /** File too large */
  pub.onFileTooLarge = function(fileName, fileSizeBytes, limitBytes) {
    _render({
      dotBg: "#A32D2D", dotIcon: _svgX(),
      title: "File is too large to send",
      desc:  `The maximum size is ${_fmtBytes(limitBytes)} per file. Try compressing or splitting it into smaller parts.`,
      chip:  `📄 ${_esc(fileName)} · ${_fmtBytes(fileSizeBytes)} · Limit: ${_fmtBytes(limitBytes)}`,
      tag:   { label: "Too large", color: "red" },
    });
  };

  /** User or peer canceled */
  pub.onCanceled = function(byPeer) {
    _render({
      dotBg: "#888780", dotIcon: _svgX(),
      title: byPeer ? "The other device canceled the transfer" : "Transfer canceled",
      desc:  "No files were saved on the other device. You can start a new transfer any time.",
      tag:   { label: "Canceled", color: "gray" },
    });
  };

  /** Generic error */
  pub.onError = function(message) {
    _render({
      dotBg: "#A32D2D", dotIcon: _svgWarn(),
      title: "Something went wrong",
      desc:  message || "An unexpected error occurred. Please try again.",
      tag:   { label: "Error", color: "red" },
    });
  };

  /** Clear the alert area (e.g. on room reset) */
  pub.clear = function() {
    const c = document.getElementById(CONTAINER_ID);
    if (c) c.innerHTML = "";
  };

  return pub;

})();


// ═══════════════════════════════════════════════════════════════
//  HOW TO WIRE THIS INTO YOUR EXISTING FILES
//  (copy the relevant snippet to each file)
// ═══════════════════════════════════════════════════════════════

/*
────────────────────────────────────────────────────────────
  1. Load order in index.njk (add BEFORE script.js / app.js)
────────────────────────────────────────────────────────────
  <script src="/transfer-alerts.js"></script>

────────────────────────────────────────────────────────────
  2. script.js  — replace / augment UIEvents hooks
────────────────────────────────────────────────────────────

// Near the top, after DOM ready:
TransferAlerts.init();

// Replace the UIEvents wiring block:
UIEvents.onStatus = (text) => {
  fileStatus.innerText = text;

  // Map internal status strings to friendly alerts
  if (text.startsWith("Waiting for receiver"))     TransferAlerts.onWaitingForReady(sendState.file?.name);
  if (text.startsWith("Sending:"))                 {} // onProgress handles active transfer
  if (text.includes("Processing") || text.includes("⏳")) {
    const name = (sendState.file || incomingFile?.meta)?.name;
    const size = (sendState.file || incomingFile?.meta)?.size;
    TransferAlerts.onProcessing(name, size);
  }
  if (text.startsWith("✅ Received") || text.startsWith("✅ Saved")) {
    // onComplete handles this — nothing to do here
  }
  if (text.includes("❌") || text.includes("⚠️ File incomplete")) {
    TransferAlerts.onError(text.replace(/[❌⚠️✅⏳]/g, "").trim());
  }
};

UIEvents.onProgress = (done, total) => {
  setProgressBytes(done, total);
  TransferAlerts.onProgress({
    done, total,
    speedMbps:  sendState.ackEma / 1024 / 1024 || 0,
    etaSec:     sendState.ackEma > 0 ? (total - done) / sendState.ackEma : NaN,
    isSender:   !!sendState.running,
    fileName:   (sendState.file || incomingFile?.meta)?.name,
    fileIndex:  window._fileIndex  || 1,     // set these when starting each file
    totalFiles: window._totalFiles || 1,
  });
};

UIEvents.onComplete = () => {
  cancelBtn.disabled = pauseBtn.disabled = resumeBtn.disabled = true;
  const dc = window.dc;
  try { dc?.send(JSON.stringify({ type: "complete" })); } catch {}
  TransferAlerts.onComplete({
    fileName:      (sendState.file || incomingFile?.meta)?.name,
    fileSizeBytes: (sendState.file || incomingFile?.meta)?.size,
    isSender:      !!sendState.running,
    speedMbps:     sendState.ackEma / 1024 / 1024 || 0,
    allDone:       (window.fileQueue?.length === 0),
    totalFiles:    window._totalFiles || 1,
  });
};

UIEvents.onError = (msg) => {
  fileStatus.innerText = "❌ " + msg;
  addMsg(`<span class="muted">❌ ${msg}</span>`);
  if (msg.includes("incomplete") || msg.includes("size")) {
    const meta = incomingFile?.meta;
    TransferAlerts.onIncompletFile(incomingFile?.receivedBytes, meta?.size, meta?.name);
  } else if (msg.includes("integrit") || msg.includes("SHA") || msg.includes("corrupt")) {
    TransferAlerts.onIntegrityFail(incomingFile?.meta?.name);
  } else {
    TransferAlerts.onError(msg);
  }
};

────────────────────────────────────────────────────────────
  3. app.js  — add to fileInput listener and startNextFile()
────────────────────────────────────────────────────────────

// In fileInput.addEventListener("change", ...):
TransferAlerts.onFilesQueued(fileInput.files);
window._totalFiles = fileQueue.length;
window._fileIndex  = 1;

// In startNextFile(), after fileQueue.shift():
window._fileIndex = (_totalFiles - fileQueue.length);
TransferAlerts.onWaitingForReady(file.name);

// When _pendingNextFile = true (between files), before DC reconnect:
const nextFile = fileQueue[0];
if (nextFile) {
  TransferAlerts.onBetweenFiles(
    nextFile.name,
    window._totalFiles - fileQueue.length - 1,
    window._totalFiles
  );
}

// In cancelTransfer():
TransferAlerts.onCanceled(false);

// socket.on("file-cancel"):
TransferAlerts.onCanceled(true);

────────────────────────────────────────────────────────────
  4. peer.js  — reconnect alerts
────────────────────────────────────────────────────────────

// In _handleFailed(), before the setTimeout reconnect:
if (typeof TransferAlerts !== "undefined") {
  const attempts = (_reconnectAttempts.get(socketId) || 0) + 1;
  TransferAlerts.onReconnecting(
    attempts, 5,
    window.sendState?.offset || 0,
    window.sendState?.file?.size || 0
  );
}

// In peer connection oniceconnectionstatechange when state === "connected":
if (typeof TransferAlerts !== "undefined" && window.sendState?.running) {
  // Back to normal — progress will resume via onProgress hook
}

────────────────────────────────────────────────────────────
  5. Validate file size before queuing (in fileInput handler)
────────────────────────────────────────────────────────────

const err = validateFile(f);
if (err) {
  if (err.includes("too large")) {
    TransferAlerts.onFileTooLarge(f.name, f.size, MAX_FILE_SIZE);
  } else {
    TransferAlerts.onError(err);
  }
  return;
}

────────────────────────────────────────────────────────────
  6. Pause / Resume buttons
────────────────────────────────────────────────────────────

pauseBtn.onclick = () => {
  sendState.paused = true;
  pauseBtn.disabled = true; resumeBtn.disabled = false;
  fileStatus.innerText = "⏸ Paused";
  workerRef.current?.postMessage({ type: "pause" });
  TransferAlerts.onPaused(sendState.offset, sendState.file?.size || 0);
};

resumeBtn.onclick = () => {
  sendState.paused = false;
  pauseBtn.disabled = false; resumeBtn.disabled = true;
  workerRef.current?.postMessage({ type: "resume" });
  for (let i = 0; i < NET.pipelineDepth; i++) workerRef.current?.postMessage({ type: "pull" });
  // onProgress will update the alert once chunks start flowing again
};

*/

// ═══════════════════════════════════════════════════════════════════════════════
//  transfer-ui.js  —  P2P Transfer UI (Tranzo design system)
//
//  Replaces #filePanel inner content with the minimal dial UI.
//  Matches base.njk + style.css tokens exactly:
//    - Fonts:   Plus Jakarta Sans (body), Space Grotesk (labels), Bricolage Grotesque (headings)
//    - Colors:  --em (#059669), --amb (#D97706), --text (#111827), --muted (#4B5563), --surface (#F8FAFB)
//    - Borders: var(--border) = rgba(17,24,39,.1)
//    - Radius:  --r (14px), --rSm (9px), --rXs (6px)
//    - Shadows: --shadow-sm, --shadow-md
//
//  Load order in index.njk:
//    <script src="multiroom.js"></script>
//    <script src="transfer-alerts.js"></script>
//    <script src="transfer-ui.js"></script>   ← this file
//    <script src="script.js"></script>
//    <script src="enhancements.js"></script>
//
//  No changes to script.js or any other file needed.
//  All original IDs remain in the DOM (hidden) so script.js works unchanged.
// ═══════════════════════════════════════════════════════════════════════════════

(function () {
  "use strict";

  // ── SVG dial geometry ───────────────────────────────────────────────────────
  // 270° arc starting at 135° (like a speedometer, gap at bottom)
  const R = 108, SIZE = 280, CX = 140, CY = 140;
  const SWEEP = 270, START = 135;
  const CIRC = 2 * Math.PI * R;
  const ARC  = (SWEEP / 360) * CIRC;   // visible arc length ≈ 508.94
  const GAP  = CIRC - ARC;             // invisible gap

  // ── Inject CSS ──────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("tui-css")) return;
    const s = document.createElement("style");
    s.id = "tui-css";
    s.textContent = `
/* ─── transfer-ui.js ─── */

#tui-root {
  padding: 0;
  width: 100%;
}

/* File name above dial */
#tui-filename {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 700;
  font-size: clamp(13px, 3.2vw, 15px);
  color: var(--text);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  min-height: 22px;
  margin-bottom: 18px;
  padding: 0 4px;
  transition: color .3s;
}
#tui-filename.tui-idle {
  color: var(--muted2);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 500;
  font-size: 13px;
}

/* Minimal drop zone — replaces the old heavy one during transfer */
#tui-dropzone {
  border: 2px dashed rgba(5,150,105,.22);
  border-radius: var(--r);
  padding: clamp(22px, 4vw, 32px) 16px;
  text-align: center;
  cursor: pointer;
  background: rgba(5,150,105,.025);
  position: relative;
  overflow: hidden;
  transition: border-color .25s, background .25s, box-shadow .25s;
  margin-bottom: 22px;
}
#tui-dropzone:hover, #tui-dropzone.tui-dragover {
  border-color: var(--em);
  background: var(--emLight);
  box-shadow: 0 0 0 4px rgba(5,150,105,.07);
}
#tui-dropzone input[type=file] {
  position: absolute; inset: 0; width: 100%; height: 100%;
  opacity: 0; cursor: pointer; z-index: 2;
}
#tui-dz-icon-wrap {
  width: 56px; height: 56px; border-radius: 14px;
  margin: 0 auto 12px;
  background: var(--emLight);
  border: 1px solid rgba(5,150,105,.2);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px var(--emGlow);
  transition: transform .25s, box-shadow .25s;
}
#tui-dropzone:hover #tui-dz-icon-wrap,
#tui-dropzone.tui-dragover #tui-dz-icon-wrap {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 24px var(--emGlow);
}
#tui-dz-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 700; font-size: 15px; color: var(--text); margin-bottom: 5px;
}
#tui-dz-sub {
  font-size: 13px; color: var(--muted); line-height: 1.6;
}

/* ── Progress bar block (replaces circular dial) ── */
#tui-dial-wrap {
  width: 100%;
  margin: 0 0 18px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Speed + pct header row */
#tui-pb-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}
#tui-speed-big {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  font-size: clamp(28px, 8vw, 42px);
  color: var(--text);
  line-height: 1; letter-spacing: -.03em;
}
#tui-speed-big.tui-idle { color: var(--muted2); font-size: clamp(22px, 6vw, 32px); }
#tui-speed-unit {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px; font-weight: 700;
  letter-spacing: .8px; text-transform: uppercase;
  color: var(--muted2); margin-left: 5px;
  align-self: flex-end; padding-bottom: 4px;
}
#tui-pb-pct {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px; font-weight: 700;
  color: var(--muted2); letter-spacing: .3px;
  transition: color .3s;
}
#tui-pb-pct.tui-active { color: var(--em); }

/* Track + fill */
#tui-pb-track {
  width: 100%; height: 10px;
  background: var(--surfaceHi, rgba(17,24,39,.08));
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,.06);
  margin-bottom: 14px;
}
#tui-pb-fill {
  height: 100%; border-radius: 999px;
  width: 0%;
  background: linear-gradient(90deg, var(--em) 0%, #10B981 60%, #34d399 100%);
  background-size: 200% 100%;
  transition: width .55s cubic-bezier(.4,0,.2,1);
  animation: tuiPbShimmer 2.2s linear infinite;
  will-change: width;
}
#tui-pb-fill.tui-paused {
  background: var(--muted2);
  animation: none;
}
#tui-pb-fill.tui-error {
  background: var(--rose, #f43f5e);
  animation: none;
}
#tui-pb-fill.tui-done {
  background: linear-gradient(90deg, var(--em), #10B981);
  animation: none;
}
@keyframes tuiPbShimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}

/* 4-stat grid below bar */
#tui-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border: 1px solid var(--border, rgba(17,24,39,.1));
  border-radius: var(--rSm, 9px);
  overflow: hidden;
}
#tui-stat-grid > div {
  padding: 9px 10px;
  border-right: 1px solid var(--border, rgba(17,24,39,.1));
}
#tui-stat-grid > div:last-child { border-right: none; }
.tui-stat-lbl {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 9px; font-weight: 700;
  letter-spacing: .7px; text-transform: uppercase;
  color: var(--muted2); line-height: 1.1;
  white-space: nowrap;
}
.tui-stat-val {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(11px, 2.6vw, 13px); font-weight: 600;
  color: var(--text); line-height: 1.3; margin-top: 3px;
  white-space: nowrap;
}

/* Hide the SVG — kept in DOM so setRing() never throws on missing element */
#tui-dial-svg { display: none; }

/* Status micro text */
#tui-status-text {
  text-align: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  color: var(--muted2);
  min-height: 18px; margin-bottom: 12px;
  transition: color .25s;
}
#tui-status-text.tui-status-active { color: var(--muted); }
#tui-status-text.tui-status-done   { color: var(--em); font-weight: 600; }
#tui-status-text.tui-status-error  { color: var(--rose); }

/* Controls row */
#tui-controls {
  display: flex; justify-content: center; align-items: center;
  gap: 12px; margin-bottom: 20px;
}
.tui-btn {
  width: 42px; height: 42px; border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--bg);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: border-color .18s, background .18s, box-shadow .18s, transform .15s;
  outline: none; flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}
.tui-btn:hover:not(:disabled) {
  border-color: var(--borderEm);
  background: var(--emLight);
  box-shadow: 0 0 0 3px rgba(5,150,105,.07);
}
.tui-btn:active:not(:disabled) { transform: scale(.93); }
.tui-btn:disabled { opacity: .3; cursor: default; box-shadow: none; }
.tui-btn svg {
  width: 15px; height: 15px; fill: none;
  stroke: var(--muted); stroke-width: 1.8;
  stroke-linecap: round; stroke-linejoin: round;
}
.tui-btn:hover:not(:disabled) svg { stroke: var(--em); }

/* Divider reuses existing .g-divider style if available */
.tui-sep { height: 1px; background: var(--border); margin: 4px 0 16px; }

/* File list */
#tui-file-list {
  width: 100%;
}
#tui-file-list-scroll {
  display: flex; flex-direction: column;
  max-height: 280px; overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(17,24,39,.1) transparent;
}
#tui-file-list-scroll::-webkit-scrollbar { width: 3px; }
#tui-file-list-scroll::-webkit-scrollbar-thumb {
  background: rgba(17,24,39,.12); border-radius: 2px;
}

.tui-frow {
  display: grid;
  grid-template-columns: 20px minmax(0,1fr) auto 68px;
  align-items: center; gap: 10px;
  padding: 11px 2px;
  border-bottom: 1px solid var(--border);
  transition: background .15s;
}
.tui-frow:last-child { border-bottom: none; }
.tui-frow.tui-frow-active { grid-template-rows: auto 4px; }

.tui-fi-ico {
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.tui-fi-ico svg { width: 16px; height: 16px; }

.tui-fi-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; font-weight: 500; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tui-fi-size {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px; font-weight: 600; letter-spacing: .3px;
  color: var(--muted2); white-space: nowrap; flex-shrink: 0;
}
.tui-fi-status {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px; font-weight: 700; letter-spacing: .4px;
  text-align: right; white-space: nowrap; flex-shrink: 0;
}

/* Mini progress bar row 2 for active item */
.tui-fi-bar {
  grid-column: 2 / -1; grid-row: 2;
  height: 3px; border-radius: 999px;
  background: var(--surfaceHi); overflow: hidden;
}
.tui-fi-bar-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, var(--em), #10B981);
  background-size: 200% 100%;
  transition: width .4s ease;
  animation: tuiBarShimmer 2.5s linear infinite;
}
@keyframes tuiBarShimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}

/* Spin animation for "Sending" icon */
@keyframes tuiSpin { to { transform: rotate(360deg); } }
.tui-spin {
  animation: tuiSpin .9s linear infinite;
  transform-origin: center;
  transform-box: fill-box;
  display: block;
}

/* Empty state */
.tui-empty {
  text-align: center; padding: 18px 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; color: var(--muted2);
}

/* Accessibility: hidden elements that script.js still reads/writes */
.tui-visually-hidden {
  position: absolute !important;
  width: 1px !important; height: 1px !important;
  padding: 0 !important; margin: -1px !important;
  overflow: hidden !important; clip: rect(0,0,0,0) !important;
  white-space: nowrap !important; border: 0 !important;
}

/* Responsive: very small phones */
@media (max-width: 360px) {
  #tui-controls   { gap: 8px; }
  .tui-btn        { width: 38px; height: 38px; }
  #tui-speed-big  { font-size: 24px; }
  #tui-stat-grid  { grid-template-columns: repeat(2, 1fr); }
  #tui-stat-grid > div:nth-child(2) { border-right: none; }
  #tui-stat-grid > div:nth-child(3),
  #tui-stat-grid > div:nth-child(4) { border-top: 1px solid var(--border, rgba(17,24,39,.1)); }
}
    `;
    document.head.appendChild(s);
  }

  // ── Build panel HTML ────────────────────────────────────────────────────────
  function buildHTML() {

    return `
<div id="tui-root">

  <!-- File name -->
  <div id="tui-filename" class="tui-idle">Waiting for connection…</div>

  <!-- Drop zone visual — click triggers real #fileInput via JS -->
  <div id="tui-dropzone">
    <div id="tui-dz-icon-wrap">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
           stroke="var(--em)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    </div>
    <div id="tui-dz-title">Drop files here, or click to browse</div>
    <div id="tui-dz-sub">Any type &middot; No size cap &middot; P2P &middot; Never stored</div>
    <input type="file" id="tui-file-trigger" multiple tabindex="-1"
           style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;z-index:2;" />
  </div>

  <!-- Progress bar block (replaces circular dial) -->
  <div id="tui-dial-wrap" role="region" aria-label="Transfer progress">

    <!-- Hidden SVG kept so setRing() never throws — display:none in CSS -->
    <svg id="tui-dial-svg" aria-hidden="true">
      <circle id="tui-ring-fill" />
    </svg>

    <!-- Speed headline + percentage -->
    <div id="tui-pb-header">
      <div style="display:flex;align-items:baseline;gap:0">
        <div id="tui-speed-big" class="tui-idle">—</div>
        <div id="tui-speed-unit">MB/s</div>
      </div>
      <div id="tui-pb-pct">0%</div>
    </div>

    <!-- Progress track -->
    <div id="tui-pb-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div id="tui-pb-fill"></div>
    </div>

    <!-- 4-stat grid -->
    <div id="tui-stat-grid">
      <div><div class="tui-stat-lbl">Avg Speed</div><div class="tui-stat-val" id="tui-avg">—</div></div>
      <div><div class="tui-stat-lbl">Transferred</div><div class="tui-stat-val" id="tui-done">—</div></div>
      <div><div class="tui-stat-lbl">Total Size</div><div class="tui-stat-val" id="tui-total">—</div></div>
      <div><div class="tui-stat-lbl">Remaining</div><div class="tui-stat-val" id="tui-rem">—</div></div>
    </div>

  </div>

  <!-- Status line -->
  <div id="tui-status-text" role="status" aria-live="polite">Idle</div>

  <!-- Visual controls — proxy clicks to real hidden buttons (pauseBtn etc.) -->
  <div id="tui-controls">
    <button class="tui-btn" id="tui-vbtn-pause"  data-proxy="pauseBtn"  disabled aria-label="Pause">
      <svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>
    </button>
    <button class="tui-btn" id="tui-vbtn-resume" data-proxy="resumeBtn" disabled aria-label="Resume">
      <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
    </button>
    <button class="tui-btn" id="tui-vbtn-cancel" data-proxy="cancelBtn" disabled aria-label="Cancel">
      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>

  <div class="tui-sep"></div>

  <div id="tui-file-list" role="list">
    <div id="tui-file-list-scroll"><div class="tui-empty">No files yet</div></div>
  </div>

</div>
`;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function fmtB(bytes) {
    const u = ["B","KB","MB","GB","TB"]; let i = 0, v = bytes || 0;
    while (v >= 1024 && i < 4) { v /= 1024; i++; }
    return v.toFixed(i === 0 ? 0 : 1) + " " + u[i];
  }

  function fmtETA(sec) {
    if (!isFinite(sec) || sec <= 0) return "—";
    if (sec < 60) return Math.ceil(sec) + "s";
    return Math.floor(sec / 60) + "m " + Math.floor(sec % 60) + "s";
  }

  function speedParts(mbps) {
    if (!mbps || mbps < 0.0005) return { n: "—", u: "MB/s" };
    if (mbps >= 1) return { n: mbps.toFixed(1), u: "MB/s" };
    const kb = mbps * 1024;
    if (kb >= 1) return { n: kb.toFixed(0), u: "KB/s" };
    return { n: (kb * 1024).toFixed(0), u: "B/s" };
  }

  // ── Progress bar control (replaces circular ring) ───────────────────────────
  // setRing() is called by the entire codebase with (pct, state) — API unchanged.
  // #tui-ring-fill is kept as a hidden <circle> stub so getElementbyId never
  // returns null; actual progress is shown via #tui-pb-fill (a plain <div>).
  function setRing(pct, state) {
    const clamped = Math.min(100, Math.max(0, pct || 0));

    // ── Progress bar fill ──────────────────────────────────────────────────
    const fill = document.getElementById("tui-pb-fill");
    if (fill) {
      fill.style.width = clamped + "%";
      fill.setAttribute("class",
        (state === "paused" ? "tui-paused" :
         state === "error"  ? "tui-error"  :
         state === "done"   ? "tui-done"   : ""));
    }

    // ── ARIA progressbar ───────────────────────────────────────────────────
    const track = document.getElementById("tui-pb-track");
    if (track) track.setAttribute("aria-valuenow", clamped);

    // ── Percentage label ───────────────────────────────────────────────────
    const pctEl = document.getElementById("tui-pb-pct");
    if (pctEl) {
      pctEl.textContent = clamped + "%";
      pctEl.classList.toggle("tui-active", clamped > 0 && state !== "error" && state !== "paused");
    }

    // ── Stub SVG element — kept in DOM so legacy callers never throw ───────
    const svgEl = document.getElementById("tui-ring-fill");
    if (svgEl) svgEl.setAttribute("class", "");  // no-op, just guards against errors
  }

  // ── Icon builders ────────────────────────────────────────────────────────────
  const ICO = {
    check: () =>
      `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
           stroke="var(--em)" stroke-width="2" stroke-linecap="round">
         <polyline points="2,8 6,12 14,4"/>
       </svg>`,

    spin: () =>
      `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
           stroke="var(--amb)" stroke-width="2" stroke-linecap="round">
         <path class="tui-spin" d="M8 2a6 6 0 1 1-3.5 10.9"/>
       </svg>`,

    wait: () =>
      `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
           stroke="var(--muted2)" stroke-width="1.8" stroke-linecap="round">
         <path d="M8 2v4l2.5 2.5"/>
         <circle cx="8" cy="8" r="6"/>
       </svg>`,

    fail: () =>
      `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
           stroke="var(--rose)" stroke-width="2" stroke-linecap="round">
         <line x1="4" y1="4" x2="12" y2="12"/>
         <line x1="12" y1="4" x2="4" y2="12"/>
       </svg>`,
  };

  // BUG-FIX-RECV-LABEL: Separate status maps for sender and receiver lists.
  // The shared STATUS_MAP had "done" → "Sent" which appeared on receiver rows too.
  // renderQueueUI (sender) and renderRecvQueueUI (receiver) now pass a context flag.
  const STATUS_MAP_SEND = {
    done:         { lbl: "Sent",         color: "var(--em)",      ico: ICO.check },
    sending:      { lbl: "Sending",      color: "var(--amb)",     ico: ICO.spin  },
    receiving:    { lbl: "Receiving",    color: "var(--amb)",     ico: ICO.spin  },
    reconnecting: { lbl: "Reconnecting", color: "var(--amb)",     ico: ICO.wait  },
    zipping:      { lbl: "Compressing",  color: "var(--amb)",     ico: ICO.spin  },
    pending:      { lbl: "Waiting",      color: "var(--muted2)",  ico: ICO.wait  },
    queued:       { lbl: "Queued",       color: "var(--muted2)",  ico: ICO.wait  },
    failed:       { lbl: "Failed",       color: "var(--rose)",    ico: ICO.fail  },
    canceled:     { lbl: "Canceled",     color: "var(--muted2)",  ico: ICO.fail  },
  };
  const STATUS_MAP_RECV = {
    done:         { lbl: "Received",     color: "var(--em)",      ico: ICO.check },
    sending:      { lbl: "Sending",      color: "var(--amb)",     ico: ICO.spin  },
    receiving:    { lbl: "Receiving",    color: "var(--amb)",     ico: ICO.spin  },
    reconnecting: { lbl: "Reconnecting", color: "var(--amb)",     ico: ICO.wait  },
    extracting:   { lbl: "Extracting",   color: "var(--amb)",     ico: ICO.spin  },
    pending:      { lbl: "Waiting",      color: "var(--muted2)",  ico: ICO.wait  },
    queued:       { lbl: "Queued",       color: "var(--muted2)",  ico: ICO.wait  },
    failed:       { lbl: "Failed",       color: "var(--rose)",    ico: ICO.fail  },
    canceled:     { lbl: "Canceled",     color: "var(--muted2)",  ico: ICO.fail  },
  };
  // Default alias keeps existing code paths working
  const STATUS_MAP = STATUS_MAP_SEND;

  // ── File list render ─────────────────────────────────────────────────────────
  function renderFileList(rows, isSender = true) {
    const wrap = document.getElementById("tui-file-list-scroll");
    if (!wrap) return;
    if (!rows || !rows.length) {
      wrap.innerHTML = `<div class="tui-empty">No files yet</div>`;
      return;
    }
    const MAP = isSender ? STATUS_MAP_SEND : STATUS_MAP_RECV;
    wrap.innerHTML = rows.map(r => {
      const st   = MAP[r.state] || { lbl: r.state || "—", color: "var(--muted2)", ico: ICO.wait };
      const active = r.state === "sending" || r.state === "receiving" || r.state === "reconnecting" || r.state === "zipping" || r.state === "extracting";
      const pct  = r.total > 0 ? Math.min(100, Math.floor((r.done / r.total) * 100)) : 0;
      const name = (r.name || "—");
      const safe = name.replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const short = name.length > 40 ? name.slice(0,38) + "…" : name;

      return `<div class="tui-frow${active ? " tui-frow-active" : ""}" role="listitem">
  <div class="tui-fi-ico">${st.ico()}</div>
  <div class="tui-fi-name" title="${safe}">${short.replace(/</g,"&lt;")}</div>
  <div class="tui-fi-size">${r.total > 0 ? fmtB(r.total) : ""}</div>
  <div class="tui-fi-status" style="color:${st.color}">${st.lbl}</div>
  ${active ? `<div class="tui-fi-bar"><div class="tui-fi-bar-fill" style="width:${pct}%"></div></div>` : ""}
</div>`;
    }).join("");
  }

  // ── EMA for displayed speed ───────────────────────────────────────────────────
  let _ema = 0;

  function updateDialSpeed(mbps, forceZero) {
    if (forceZero) { _ema = 0; }
    else if (mbps > 0) { _ema = _ema ? .72 * _ema + .28 * mbps : mbps; }

    const sp   = speedParts(_ema);
    const big  = document.getElementById("tui-speed-big");
    const unit = document.getElementById("tui-speed-unit");
    const avg  = document.getElementById("tui-avg");
    if (big)  { big.textContent = sp.n; big.classList.toggle("tui-idle", !_ema); }
    if (unit) unit.textContent  = sp.u;
    if (avg)  avg.textContent   = _ema > 0 ? speedParts(_ema).n + " " + speedParts(_ema).u : "—";
  }

  // ── Status line helper ───────────────────────────────────────────────────────
  function setStatusLine(text, variant) {
    const el = document.getElementById("tui-status-text");
    if (!el) return;
    el.textContent = text || "Idle";
    el.className = "tui-status-" + (variant || "");
  }

  // ── Mount UI into #tui-mount-target ─────────────────────────────────────────
  // The static HTML in index.njk already contains all required IDs (fileInput,
  // progressBar, fileStatus, etc.) in a hidden div so script.js never gets null.
  // We only inject the VISUAL dial UI here — no duplicate IDs.
  function mountUI() {
    // Try #tui-mount-target first (new index.njk), fall back to .g-card-body
    let target = document.getElementById("tui-mount-target");
    if (!target) {
      const panel = document.getElementById("filePanel");
      if (!panel) { setTimeout(mountUI, 40); return; }
      target = panel.querySelector(".g-card-body") ||
               panel.querySelector(".g-card")      ||
               panel;
    }

    // ── FIX: Preserve elements that script.js holds live const references to.
    // target.innerHTML = … destroys the existing DOM subtree, which orphans
    // #modalBg, #acceptBtn, #rejectBtn, #modalInfo and the bridge <span>/<button>
    // elements. script.js captures those as top-level consts at parse time, so
    // after the wipe those consts point to detached nodes — the Accept modal
    // fires modalBg.style.display="flex" on a ghost element nobody can see.
    //
    // Strategy: pull every at-risk element out of the subtree BEFORE wiping,
    // re-inject them into a visually-hidden vault AFTER, so they stay live in
    // the document and all existing event listeners + style mutations work.
    const PRESERVE_IDS = [
      "modalBg",                          // accept/reject modal  ← root cause
      "fileInput",                        // real file <input>
      "fileStatus", "speedText", "etaText", "progressBar",  // status bridge spans
      "pauseBtn", "resumeBtn", "cancelBtn",                  // control bridge btns
    ];
    const preserved = PRESERVE_IDS
      .map(id => document.getElementById(id))
      .filter(Boolean);

    target.innerHTML = buildHTML();

    // Re-attach preserved elements in a hidden vault appended to the target.
    // They remain part of the live document (getElementById finds them, events
    // fire, style changes render for positioned overlays like #modalBg) but are
    // invisible and non-interactive so they never affect the visible UI.
    if (preserved.length) {
      const vault = document.createElement("div");
      vault.id = "tui-preserved-vault";
      vault.style.cssText =
        "position:absolute;width:1px;height:1px;overflow:visible;" +
        "opacity:0;pointer-events:none;z-index:-1;";
      preserved.forEach(el => vault.appendChild(el));
      target.appendChild(vault);

      // #modalBg is a full-screen overlay — it must NOT be clipped by the vault.
      // Move it to <body> so it can cover the viewport when display:"flex" is set.
      const modalBg = document.getElementById("modalBg");
      if (modalBg) document.body.appendChild(modalBg);
    }

    // Drag highlight only — file forwarding and button proxies wired in patch()
    const dz = document.getElementById("tui-dropzone");
    if (dz) {
      ["dragenter","dragover"].forEach(ev =>
        dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("tui-dragover"); }));
      dz.addEventListener("dragleave", () => dz.classList.remove("tui-dragover"));
      // "drop" is handled in patch() after script.js loads
    }
  }


  // ── Patch script.js globals ──────────────────────────────────────────────────
  // Strategy:
  //   1. Wrap window.setProgressBytes  — direct function override, most reliable
  //   2. Wrap window.resetTransferUI   — reset dial on each new transfer
  //   3. MutationObserver on hidden <span>s — catches innerText writes without
  //      fighting browser internals (Object.defineProperty on innerText is
  //      unreliable in Chrome because innerText is a layout-dependent getter)
  //   4. 400ms poll of sendState / incomingFile — safety net, receiver dial works
  //      even when MutationObserver misses a write cycle

  function patch() {

    // 1 — setProgressBytes wrapper
    const origSPB = window.setProgressBytes;
    window.setProgressBytes = function(done, total) {
      if (typeof origSPB === "function") origSPB(done, total);
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      setRing(pct);
      const dEl = document.getElementById("tui-done");
      const tEl = document.getElementById("tui-total");
      if (dEl) dEl.textContent = done  > 0 ? fmtB(done)  : "—";
      if (tEl) tEl.textContent = total > 0 ? fmtB(total) : "—";
    };

    // 2 — resetTransferUI wrapper
    const origRTU = window.resetTransferUI;
    window.resetTransferUI = function() {
      if (typeof origRTU === "function") origRTU();
      setRing(0);
      _ema = 0;
      ["tui-done","tui-total","tui-rem","tui-avg"].forEach(id => {
        const el = document.getElementById(id); if (el) el.textContent = "—";
      });
      const big = document.getElementById("tui-speed-big");
      if (big) { big.textContent = "—"; big.classList.add("tui-idle"); }
      const unit = document.getElementById("tui-speed-unit");
      if (unit) unit.textContent = "MB/s";
      setStatusLine("Idle", "");
    };

    // 3 — MutationObserver helpers
    function watchEl(id, cb) {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.textContent) cb(el.textContent);
      new MutationObserver(() => cb(el.textContent || el.innerText || ""))
        .observe(el, { childList: true, characterData: true, subtree: true });
    }

    watchEl("speedText", v => {
      const m = String(v).match(/([\d.]+)\s*MB\/s/);
      const mbps = m ? parseFloat(m[1]) : 0;
      updateDialSpeed(mbps, mbps === 0 && String(v).includes("Speed: 0"));
    });

    watchEl("etaText", v => {
      const clean = String(v).replace(/^Remaining:\s*/i, "").trim();
      const el = document.getElementById("tui-rem");
      if (el) el.textContent = clean && clean !== "--" ? clean : "—";
    });

    watchEl("fileStatus", v => {
      const text = String(v || "");
      const fnEl = document.getElementById("tui-filename");
      let statusTxt = "Idle", variant = "";

      if (text.startsWith("🗜️") || text.includes("Compressing")) {
        // Sender: zipping multiple files into bundle
        const pctMatch = text.match(/(\d+)%/);
        statusTxt = pctMatch ? `Compressing… ${pctMatch[1]}%` : "Compressing files…";
        variant   = "active";
        if (fnEl) { fnEl.textContent = "Building ZIP bundle…"; fnEl.classList.remove("tui-idle"); }
        // Animate the progress bar with zip percent if available
        if (pctMatch) setRing(parseInt(pctMatch[1], 10));
      } else if (text.startsWith("📦") || text.includes("Extracting")) {
        // Receiver: extracting bundle
        statusTxt = "Extracting files…";
        variant   = "active";
        if (fnEl) { fnEl.textContent = "Extracting bundle…"; fnEl.classList.remove("tui-idle"); }
      } else if (text.startsWith("Sending:") || text.startsWith("Receiving:")) {
        const isSend = text.startsWith("Sending:");
        const name = text.split(":").slice(1).join(":").replace(/\s*\([^)]+\)\s*$/, "").trim();
        if (fnEl && name) { fnEl.textContent = name; fnEl.classList.remove("tui-idle"); }
        statusTxt = isSend ? "Sending…" : "Receiving…";
        variant   = "active";
      } else if (text.startsWith("✅")) {
        statusTxt = text.replace(/^✅\s*/, "").replace(/\s*\([^)]+\)/, "").trim();
        variant   = "done";
        if (fnEl) fnEl.classList.remove("tui-idle");
        setRing(100, "done");
      } else if (text.startsWith("⏳") || text.includes("Processing")) {
        statusTxt = "Saving file…"; variant = "active";
      } else if (text.startsWith("Waiting")) {
        statusTxt = "Waiting for the other device…"; variant = "active";
      } else if (text.startsWith("⏸")) {
        statusTxt = "Paused";
        setRing(null, "paused");
      } else if (text.startsWith("⚠️") || text.startsWith("❌")) {
        statusTxt = text.replace(/^[⚠️❌\s]+/, "").trim() || "Error";
        variant   = "error";
      } else if (text.startsWith("Accepted") || text.startsWith("Connecting")) {
        statusTxt = "Setting up connection…"; variant = "active";
      } else if (text === "Idle" || text === "") {
        if (fnEl) { fnEl.textContent = "Waiting for connection…"; fnEl.classList.add("tui-idle"); }
      } else if (text) {
        statusTxt = text.replace(/^[✅⚠️❌⏳⏸]+\s*/, "").trim() || "Idle";
      }

      setStatusLine(statusTxt, variant);
    });

    // 4 — 400ms poll: read sendState / incomingFile directly from script.js globals
    setInterval(() => {
      try {
        // Sender
        if (typeof sendState !== "undefined" && sendState?.running && sendState?.file) {
          const done  = sendState.ackBytes || 0;
          const total = sendState.file.size || 0;
          if (total > 0) {
            setRing(Math.round((done / total) * 100));
            const dEl = document.getElementById("tui-done");
            const tEl = document.getElementById("tui-total");
            if (dEl) dEl.textContent = fmtB(done);
            if (tEl) tEl.textContent = fmtB(total);
            if (sendState.ackEma > 0) {
              const mbps = sendState.ackEma / 1024 / 1024;
              updateDialSpeed(mbps, false);
              const remEl = document.getElementById("tui-rem");
              if (remEl) remEl.textContent = fmtETA((total - done) / sendState.ackEma);
            }
            const fnEl = document.getElementById("tui-filename");
            if (fnEl && fnEl.classList.contains("tui-idle")) {
              fnEl.textContent = sendState.file.name;
              fnEl.classList.remove("tui-idle");
            }
            setStatusLine("Sending…", "active");
          }
        }
        // Receiver
        if (typeof incomingFile !== "undefined" && incomingFile?.meta) {
          const done  = incomingFile.receivedBytes || 0;
          const total = incomingFile.meta.size     || 0;
          if (total > 0) {
            setRing(Math.round((done / total) * 100));
            const dEl = document.getElementById("tui-done");
            const tEl = document.getElementById("tui-total");
            if (dEl) dEl.textContent = fmtB(done);
            if (tEl) tEl.textContent = fmtB(total);
            if (incomingFile.ema > 0) {
              const mbps = incomingFile.ema / 1024 / 1024;
              updateDialSpeed(mbps, false);
              const remEl = document.getElementById("tui-rem");
              if (remEl) remEl.textContent = fmtETA((total - done) / incomingFile.ema);
            }
            const fnEl = document.getElementById("tui-filename");
            if (fnEl && fnEl.classList.contains("tui-idle")) {
              fnEl.textContent = incomingFile.meta.name;
              fnEl.classList.remove("tui-idle");
            }
            setStatusLine("Receiving…", "active");
          }
        }
      } catch(e) {}
    }, 400);

    // 5 — Visual proxy buttons → real hidden buttons
    [["tui-vbtn-pause","pauseBtn"],["tui-vbtn-resume","resumeBtn"],["tui-vbtn-cancel","cancelBtn"]]
    .forEach(([visId, realId]) => {
      const vis  = document.getElementById(visId);
      const real = document.getElementById(realId);
      if (!vis || !real) return;
      vis.disabled = real.disabled;
      vis.addEventListener("click", () => { if (!vis.disabled) real.click(); });
      new MutationObserver(() => { vis.disabled = real.disabled; })
        .observe(real, { attributes: true, attributeFilter: ["disabled"] });
    });

    // 6 — File input proxy
    // ── FIX: call enqueueFilesForSend DIRECTLY instead of proxying through
    // realInput via DataTransfer. The DataTransfer copy approach fails silently
    // in many browsers when files come from a second <input> — realInput.files
    // ends up empty or truncated, so multi-file selections never reached
    // enqueueFilesForSend as a batch → zipAndEnqueue was never triggered.
    // Direct call guarantees the full FileList arrives in one shot.
    const tuiTrigger = document.getElementById("tui-file-trigger");
    const realInput  = document.getElementById("fileInput");
    if (tuiTrigger) {
      tuiTrigger.addEventListener("change", () => {
        if (!tuiTrigger.files?.length) return;
        // Snapshot into Array BEFORE clearing input value.
        // FileList is a live object tied to the <input> — after value="",
        // the FileList becomes empty on many browsers, losing all selected files.
        const fileArr = Array.from(tuiTrigger.files);
        tuiTrigger.value = "";   // reset picker (safe now — fileArr is independent)
        if (typeof enqueueFilesForSend === "function") {
          enqueueFilesForSend(fileArr);
        } else if (realInput) {
          // Fallback: proxy through realInput if enqueueFilesForSend not yet defined
          try {
            const dt = new DataTransfer();
            fileArr.forEach(f => dt.items.add(f));
            realInput.files = dt.files;
          } catch {}
          realInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }

    // 7 — Drop zone → forward dropped files
    const dz = document.getElementById("tui-dropzone");
    if (dz) {
      dz.addEventListener("drop", e => {
        e.preventDefault();
        dz.classList.remove("tui-dragover");
        const files = e.dataTransfer?.files;
        if (!files?.length) return;
        if (typeof enqueueFilesForSend === "function") {
          enqueueFilesForSend(files);
        } else if (realInput) {
          try {
            const dt = new DataTransfer();
            Array.from(files).forEach(f => dt.items.add(f));
            realInput.files = dt.files;
          } catch {}
          realInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }
  }

  // ── Override queue rendering ─────────────────────────────────────────────────
  function installQueueOverrides() {
    window.ensureQueueUI    = function() {};
    window.ensureRecvQueueUI = function() {};

    window.renderQueueUI = function(currentFile) {
      // ── ZIP preview: show individual files while bundle is being built ──────
      // During zipAndEnqueue(), _zipPreviewRows is set with the original file
      // names so the user sees "Compressing" per-file rows, not a blank list.
      if (window._zipPreviewRows && window._zipPreviewRows.length) {
        renderFileList(window._zipPreviewRows);
        return;
      }

      const rows = [];

      // Files from sentHistory (already in localStorage)
      if (typeof sentHistory !== "undefined") {
        sentHistory.slice(-60).forEach(it => {
          // ── ZIP bundle display: expand bundle row to show constituent files ─
          // If this is a zip bundle entry, show a special label with file count.
          const isBundle = it.name && it.name.startsWith("tranzo-bundle-") && it.name.endsWith(".zip");
          rows.push({
            name:  isBundle ? `📦 Bundle (${it.name.match(/-(\d+)files/)?.[1] || "?"} files)` : it.name,
            state: it.state,
            done:  it.done  || 0,
            total: it.total || it.size || 0,
            isBundle,
          });
        });
      }

      // Actively sending file — ensure it appears as "sending"
      if (currentFile) {
        const isBundle = currentFile.name && currentFile.name.startsWith("tranzo-bundle-");
        const displayName = isBundle
          ? `📦 Bundle (${currentFile.name.match(/-(\d+)files/)?.[1] || "?"} files)`
          : currentFile.name;
        const idx = rows.findIndex(r =>
          r.name === displayName || (r.name === currentFile.name && r.total === currentFile.size));
        if (idx >= 0) rows[idx].state = "sending";
        else rows.push({ name: displayName, state: "sending", done: 0, total: currentFile.size, isBundle });
      }

      // Queued but not started
      if (typeof fileQueue !== "undefined") {
        fileQueue.forEach(f => {
          const isBundle = f.name && f.name.startsWith("tranzo-bundle-");
          const displayName = isBundle
            ? `📦 Bundle (${f.name.match(/-(\d+)files/)?.[1] || "?"} files)`
            : f.name;
          if (!rows.find(r => r.name === displayName && r.total === f.size)) {
            rows.push({ name: displayName, state: "queued", done: 0, total: f.size, isBundle });
          }
        });
      }

      renderFileList(rows.length ? rows : null);
    };

    window.renderRecvQueueUI = function() {
      if (typeof recvHistory === "undefined") return;
      const rows = [];

      recvHistory.slice(-60).forEach(it => {
        // ── ZIP bundle entry: while extracting show "Extracting bundle…" row ─
        const isBundle = it.name && it.name.startsWith("tranzo-bundle-") && it.name.endsWith(".zip");

        // BUG-FIX-RECV-PROGRESS: for actively-receiving items, pull live
        // receivedBytes from incomingFile rather than the stale recvHistory.done
        let liveDone = it.done || 0;
        if ((it.state === "receiving" || it.state === "extracting" || it.state === "reconnecting") &&
            typeof incomingFile !== "undefined" && incomingFile?.meta) {
          const sameId   = it.id && it.id === (incomingFile.meta.id || `${incomingFile.meta.name}|${incomingFile.meta.size}`);
          const sameName = it.name === incomingFile.meta.name && it.total === incomingFile.meta.size;
          if (sameId || sameName) liveDone = incomingFile.receivedBytes || 0;
        }

        if (isBundle) {
          const fileCount = it.name.match(/-(\d+)files/)?.[1] || "?";
          if (it.state === "extracting") {
            // Show as extracting bundle row
            rows.push({ name: `📦 Extracting bundle (${fileCount} files)…`, state: "extracting", done: liveDone, total: it.total || it.size || 0 });
          } else if (it.state === "done") {
            // Bundle done — show a summary row instead of the raw zip name
            rows.push({ name: `📦 Bundle — ${fileCount} files received`, state: "done", done: it.total || it.size || 0, total: it.total || it.size || 0 });
            // Also show individual extracted files from recvHistory (zip: prefix)
            recvHistory.filter(r => r.id && r.id.startsWith("zip:")).slice(-60).forEach(ef => {
              rows.push({ name: ef.name, state: ef.state, done: ef.done || 0, total: ef.total || ef.size || 0 });
            });
          } else {
            // receiving / reconnecting
            rows.push({ name: `📦 Receiving bundle (${fileCount} files)…`, state: it.state, done: liveDone, total: it.total || it.size || 0 });
          }
        } else if (it.id && it.id.startsWith("zip:")) {
          // Individual extracted file — already added inside the bundle done block above; skip duplicates
          // (only add if there's no bundle parent row for this session)
          const bundlePresent = recvHistory.some(r => r.name && r.name.startsWith("tranzo-bundle-") && r.state === "done");
          if (!bundlePresent) {
            rows.push({ name: it.name, state: it.state, done: it.done || 0, total: it.total || it.size || 0 });
          }
        } else {
          rows.push({ name: it.name, state: it.state, done: liveDone, total: it.total || it.size || 0 });
        }
      });

      // isSender=false → STATUS_MAP_RECV → shows "Received" instead of "Sent"
      renderFileList(rows.length ? rows : null, false);
    };
  }

  // ── Entry point ──────────────────────────────────────────────────────────────
  function init() {
    injectStyles();
    mountUI();

    function tryPatch() {
      if (typeof window.setProgressBytes === "function" ||
          typeof window.fmtBytes === "function") {
        patch();
        installQueueOverrides();
      } else {
        setTimeout(tryPatch, 80);
      }
    }

    if (document.readyState === "complete") {
      setTimeout(tryPatch, 100);
    } else {
      window.addEventListener("load", () => setTimeout(tryPatch, 100));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
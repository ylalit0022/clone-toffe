// TurnAnalyticsDashboard.jsx
// Phase 1 + Phase 2 — Base layout + StatsCard integration
// Design system: Tranzo Admin | Emerald + Amber | Plus Jakarta Sans + Space Grotesk

import StatsCard from "../pages/turnComponents/StatsCard";




// ─── Icons (inline SVG, no extra dependency) ─────────────────────────────────

function IconConnections() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
function IconTurn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
function IconStun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconBandwidth() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
function IconFallback() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconSuccess() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ─── Mock stats data ──────────────────────────────────────────────────────────

const STATS = [
  {
    title: "Active Connections",
    value: "3,842",
    trend: "up",
    trendValue: "+8.2%",
    subtext: "vs. last 24 hours",
    icon: <IconConnections />,
    accent: "green",
  },
  {
    title: "Active TURN Sessions",
    value: "1,204",
    trend: "up",
    trendValue: "+4.5%",
    subtext: "Relayed peer connections",
    icon: <IconTurn />,
    accent: "blue",
  },
  {
    title: "STUN Requests",
    value: "18,930",
    trend: "down",
    trendValue: "-2.1%",
    subtext: "Binding requests / hr",
    icon: <IconStun />,
    accent: "amber",
  },
  {
    title: "TURN Bandwidth Usage",
    value: "4.7 GB",
    trend: "up",
    trendValue: "+11.8%",
    subtext: "Total relayed today",
    icon: <IconBandwidth />,
    accent: "rose",
  },
  {
    title: "TURN Fallback Rate",
    value: "31.3%",
    trend: "down",
    trendValue: "-1.6%",
    subtext: "STUN → TURN escalations",
    icon: <IconFallback />,
    accent: "amber",
  },
  {
    title: "Connection Success Rate",
    value: "98.7%",
    trend: "up",
    trendValue: "+0.4%",
    subtext: "P2P + relay combined",
    icon: <IconSuccess />,
    accent: "green",
  },
];

// ─── Placeholder card for future phases ──────────────────────────────────────

function PlaceholderCard({ label, height = "200px" }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px dashed rgba(17,24,39,0.12)",
        borderRadius: "16px",
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        color: "#9CA3AF",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
      <span style={{ fontSize: "12px", fontWeight: 600 }}>{label}</span>
    </div>
  );
}

// ─── Status dot ──────────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "11px",
        fontWeight: 700,
        color: "#059669",
        background: "rgba(5,150,105,0.08)",
        borderRadius: "999px",
        padding: "4px 10px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "#059669",
          display: "inline-block",
          animation: "pulse 1.8s ease-in-out infinite",
        }}
      />
      LIVE
    </span>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function TurnAnalyticsDashboard() {
  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        minHeight: "100vh",
        background: "#F8FAFB",
        padding: "32px",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @media (max-width: 640px) {
          .dashboard-grid-stats { grid-template-columns: 1fr !important; }
          .dashboard-grid-charts { grid-template-columns: 1fr !important; }
          .dashboard-padding { padding: 16px !important; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .dashboard-grid-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .dashboard-grid-charts { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1280px", margin: "0 auto" }} className="dashboard-padding">

        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "26px",
                fontWeight: 800,
                color: "#111827",
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              TURN/STUN Analytics
            </h1>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px", fontWeight: 500 }}>
              Real-time relay server performance and connection diagnostics
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <LiveBadge />
            <select
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(17,24,39,0.1)",
                borderRadius: "10px",
                padding: "7px 12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#374151",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
        </div>

        {/* ── Stats Grid (Phase 2) ── */}
        <div
          className="dashboard-grid-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {STATS.map((s) => (
            <StatsCard key={s.title} {...s} />
          ))}
        </div>

        {/* ── Chart Placeholders (Phase 3–5) ── */}
        <div
          className="dashboard-grid-charts"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <PlaceholderCard label="Connection Trends (Phase 4)" height="240px" />
          <PlaceholderCard label="Bandwidth Over Time (Phase 5)" height="240px" />
        </div>

        {/* ── Bottom row: Status + Table placeholders ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "340px 1fr",
            gap: "16px",
          }}
        >
          <PlaceholderCard label="Status Panel (Phase 3)" height="280px" />
          <PlaceholderCard label="Data Table (Phase 6)" height="280px" />
        </div>

        {/* ── Footer note ── */}
        <p
          style={{
            marginTop: "24px",
            fontSize: "11px",
            color: "#D1D5DB",
            textAlign: "right",
            fontWeight: 500,
          }}
        >
          Tranzo Admin · TURN/STUN Analytics v1.0 · Phase 1–2 complete
        </p>
      </div>
    </div>
  );
}

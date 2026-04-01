// TurnAnalytics.jsx — Phase 7: Full integration
// Combines: StatsCard · StatusPanel · Charts · DataTable
// Tranzo design system | Recharts

import StatsCard from "./StatsCard";
import StatusPanel from "./StatusPanel";
import { TurnSessionsChart, StunVsTurnChart } from "./Charts";
import { BandwidthChart, ConnectionTypesPie, ConnectionsTable } from "./DataTable";

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icons = {
  Connections: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  Turn: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  ),
  Stun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Bandwidth: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  Fallback: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Success: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
};

// ─── Stats mock data ───────────────────────────────────────────────────────────

const STATS = [
  { title: "Active Connections",     value: "3,842", trend: "up",   trendValue: "+8.2%",  subtext: "vs. last 24 hours",         icon: <Icons.Connections />, accent: "green" },
  { title: "Active TURN Sessions",   value: "1,204", trend: "up",   trendValue: "+4.5%",  subtext: "Relayed peer connections",   icon: <Icons.Turn />,        accent: "blue"  },
  { title: "STUN Requests",          value: "18,930",trend: "down", trendValue: "-2.1%",  subtext: "Binding requests / hr",      icon: <Icons.Stun />,        accent: "amber" },
  { title: "TURN Bandwidth Usage",   value: "4.7 GB",trend: "up",   trendValue: "+11.8%", subtext: "Total relayed today",        icon: <Icons.Bandwidth />,   accent: "rose"  },
  { title: "TURN Fallback Rate",     value: "31.3%", trend: "down", trendValue: "-1.6%",  subtext: "STUN → TURN escalations",    icon: <Icons.Fallback />,    accent: "amber" },
  { title: "Connection Success Rate",value: "98.7%", trend: "up",   trendValue: "+0.4%",  subtext: "P2P + relay combined",       icon: <Icons.Success />,     accent: "green" },
];

// ─── Live badge ────────────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11, fontWeight: 700, color: "#059669",
      background: "rgba(5,150,105,0.08)", borderRadius: 999, padding: "4px 10px",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#059669", display: "inline-block", animation: "ta-pulse 1.8s ease-in-out infinite" }} />
      LIVE
    </span>
  );
}

// ─── Grid helpers ──────────────────────────────────────────────────────────────

function Grid({ cols = 3, gap = 16, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
      {children}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function TurnAnalytics() {
  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      minHeight: "100vh",
      background: "#F8FAFB",
      padding: "32px",
    }}>
      <style>{`
        @keyframes ta-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
        @media(max-width:640px){
          .ta-stats{grid-template-columns:1fr!important}
          .ta-charts{grid-template-columns:1fr!important}
          .ta-bottom{grid-template-columns:1fr!important}
          .ta-wrap{padding:16px!important}
        }
        @media(min-width:641px)and (max-width:1024px){
          .ta-stats{grid-template-columns:repeat(2,1fr)!important}
          .ta-bottom{grid-template-columns:1fr!important}
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto" }} className="ta-wrap">

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", margin: 0 }}>
              TURN/STUN Analytics
            </h1>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4, fontWeight: 500 }}>
              Real-time relay server performance and connection diagnostics
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LiveBadge />
            <select style={{
              background: "#FFFFFF", border: "1px solid rgba(17,24,39,0.1)", borderRadius: 10,
              padding: "7px 12px", fontSize: 12, fontWeight: 600, color: "#374151",
              fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", cursor: "pointer",
            }}>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="ta-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
          {STATS.map(s => <StatsCard key={s.title} {...s} />)}
        </div>

        {/* ── Status + Line chart ── */}
        <div className="ta-bottom" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, marginBottom: 20 }}>
          <StatusPanel systemStatus="healthy" turnStatus="healthy" stunStatus="warning" />
          <TurnSessionsChart />
        </div>

        {/* ── STUN vs TURN bar + Bandwidth area ── */}
        <div className="ta-charts" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 20 }}>
          <StunVsTurnChart />
          <BandwidthChart />
        </div>

        {/* ── Pie + Table ── */}
        <div className="ta-bottom" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, marginBottom: 24 }}>
          <ConnectionTypesPie />
          <ConnectionsTable />
        </div>

        {/* Footer */}
        <p style={{ fontSize: 11, color: "#D1D5DB", textAlign: "right", fontWeight: 500 }}>
          Tranzo Admin · TURN/STUN Analytics · Phase 1–7 complete
        </p>
      </div>
    </div>
  );
}

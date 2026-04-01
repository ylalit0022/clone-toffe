// TurnAnalyticsDashboard.jsx — Phase 1 + 2 + 8 (Deep Analytics)
// Route: /analytics/turn  (index.jsx se)
// Tranzo Admin | Plus Jakarta Sans + Space Grotesk

import StatsCard from "../pages/turnComponents/StatsCard";
import TurnDeepAnalytics from "../pages/turnComponents/TurnDeepAnalytics";
import StatusPanel from "./turnComponents/StatusPanel";
import { TurnSessionsChart, StunVsTurnChart } from "./turnComponents/Charts";
import { BandwidthChart, ConnectionTypesPie, ConnectionsTable } from "./turnComponents/DataTable";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconConnections() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}
function IconTurn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  );
}
function IconStun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
function IconBandwidth() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}
function IconFallback() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconSuccess() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

// ─── Stats mock data ──────────────────────────────────────────────────────────

const STATS = [
  { title: "Active Connections",      value: "3,842", trend: "up",   trendValue: "+8.2%",  subtext: "vs. last 24 hours",        icon: <IconConnections />, accent: "green" },
  { title: "Active TURN Sessions",    value: "1,204", trend: "up",   trendValue: "+4.5%",  subtext: "Relayed peer connections",  icon: <IconTurn />,        accent: "blue"  },
  { title: "STUN Requests",           value: "18,930",trend: "down", trendValue: "-2.1%",  subtext: "Binding requests / hr",     icon: <IconStun />,        accent: "amber" },
  { title: "TURN Bandwidth Usage",    value: "4.7 GB",trend: "up",   trendValue: "+11.8%", subtext: "Total relayed today",       icon: <IconBandwidth />,   accent: "rose"  },
  { title: "TURN Fallback Rate",      value: "31.3%", trend: "down", trendValue: "-1.6%",  subtext: "STUN → TURN escalations",   icon: <IconFallback />,    accent: "amber" },
  { title: "Connection Success Rate", value: "98.7%", trend: "up",   trendValue: "+0.4%",  subtext: "P2P + relay combined",      icon: <IconSuccess />,     accent: "green" },
];

// ─── Placeholder card ─────────────────────────────────────────────────────────

function PlaceholderCard({ label, height = "200px" }) {
  return (
    <div style={{
      background: "#FFFFFF", border: "1px dashed rgba(17,24,39,0.12)", borderRadius: 16,
      height, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 8, color: "#9CA3AF",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

// ─── Live badge ───────────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11,
      fontWeight: 700, color: "#059669", background: "rgba(5,150,105,0.08)",
      borderRadius: 999, padding: "4px 10px", fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#059669", display: "inline-block", animation: "tad-pulse 1.8s ease-in-out infinite" }} />
      LIVE
    </span>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────

function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(17,24,39,0.07)" }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(17,24,39,0.07)" }} />
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function TurnAnalyticsDashboard() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: "100vh", background: "#F8FAFB", padding: "32px" }}>
      <style>{`
        @keyframes tad-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
        @media(max-width:640px){
          .tad-stats{grid-template-columns:1fr!important}
          .tad-charts{grid-template-columns:1fr!important}
          .tad-bottom{grid-template-columns:1fr!important}
          .tad-wrap{padding:16px!important}
        }
        @media(min-width:641px)and(max-width:1024px){
          .tad-stats{grid-template-columns:repeat(2,1fr)!important}
          .tad-charts{grid-template-columns:1fr!important}
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto" }} className="tad-wrap">

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
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

        {/* ── Overview Stats (Phase 2) ── */}
        <SectionDivider label="Overview" />
        <div className="tad-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, margin: "14px 0 20px" }}>
          {STATS.map(s => <StatsCard key={s.title} {...s} />)}
        </div>

        {/* ── TURN Deep Analytics (Phase 8) ── */}
        <SectionDivider label="TURN Deep Analytics" />
        <div style={{ marginTop: 14, marginBottom: 20 }}>
          <TurnDeepAnalytics />
        </div>

        {/* ── Charts placeholder (Phase 4–5) ── */}
        <SectionDivider label="Charts · Phase 4–5" />
        <div className="tad-charts" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, margin: "14px 0 20px" }}>
          
          {/* <PlaceholderCard label="Connection Trends (Phase 4)" height="220px" />
          <PlaceholderCard label="Bandwidth Over Time (Phase 5)" height="220px" /> */}
        </div>

        {/* ── Status + Table placeholder (Phase 3 & 6) ── */}
        <SectionDivider label="Status & Table · Phase 3 & 6" />
        <div className="tad-bottom" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14, margin: "14px 0 28px" }}>
          <PlaceholderCard label="Status Panel (Phase 3)" height="260px" />
          <PlaceholderCard label="Data Table (Phase 6)" height="260px" />
        </div>

        <p style={{ fontSize: 11, color: "#D1D5DB", textAlign: "right", fontWeight: 500 }}>
          Tranzo Admin · TURN/STUN Analytics · Phase 1–2 + Phase 8 complete
        </p>
      </div>
    </div>
  );
}

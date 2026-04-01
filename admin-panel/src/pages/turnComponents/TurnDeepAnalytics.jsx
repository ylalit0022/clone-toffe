// TurnDeepAnalytics.jsx — Phase 8 (Deep TURN Analytics Section)
// Shows: Allocations, Active Relays, Avg Duration, Peak BW, Failed Attempts
// Tranzo design system | compact progress bar cards

import { useState, useEffect } from "react";

// ── Animated number hook ───────────────────────────────────────────────────────
function useAnimatedValue(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct, color = "#059669", bg = "rgba(5,150,105,0.1)" }) {
  return (
    <div style={{ height: 5, borderRadius: 999, background: "rgba(17,24,39,0.07)", overflow: "hidden", marginTop: 8 }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        borderRadius: 999,
        background: color,
        transition: "width 1s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

// ── Mini stat card ────────────────────────────────────────────────────────────
function StatMiniCard({ icon, label, value, unit, pct, color, colorBg, sublabel, badge }) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid rgba(17,24,39,0.08)",
      borderRadius: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      padding: "16px 18px",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* glow bg accent */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 64, height: 64, background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`, borderRadius: "0 14px 0 64px", pointerEvents: "none" }} />

      {/* top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: colorBg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {icon}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>{label}</span>
        </div>
        {badge && (
          <span style={{ fontSize: 10, fontWeight: 700, color: badge.color, background: badge.bg, borderRadius: 999, padding: "2px 8px" }}>
            {badge.label}
          </span>
        )}
      </div>

      {/* value */}
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", margin: 0 }}>
        {value}<span style={{ fontSize: 13, fontWeight: 500, color: "#9CA3AF", marginLeft: 3 }}>{unit}</span>
      </p>

      {/* progress */}
      {pct !== undefined && <ProgressBar pct={pct} color={color} />}

      {/* sublabel */}
      {sublabel && <p style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500, marginTop: 6 }}>{sublabel}</p>}
    </div>
  );
}

// ── Failed attempts breakdown ─────────────────────────────────────────────────
const FAILURE_REASONS = [
  { label: "Auth Failure",     count: 142, pct: 52, color: "#DC2626" },
  { label: "Quota Exceeded",   count: 78,  pct: 29, color: "#D97706" },
  { label: "Network Timeout",  count: 41,  pct: 15, color: "#3B82F6" },
  { label: "Server Overload",  count: 11,  pct: 4,  color: "#8B5CF6" },
];

function FailureBreakdown() {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid rgba(17,24,39,0.08)",
      borderRadius: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      padding: "16px 18px",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(220,38,38,0.08)", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Failed TURN Attempts</span>
        </div>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>272</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FAILURE_REASONS.map(r => (
          <div key={r.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{r.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280" }}>{r.count} <span style={{ fontWeight: 500, color: "#9CA3AF" }}>({r.pct}%)</span></span>
            </div>
            <ProgressBar pct={r.pct} color={r.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Relay server load table ───────────────────────────────────────────────────
const RELAY_SERVERS = [
  { name: "relay-as-south-01", load: 78, sessions: 312, status: "warning" },
  { name: "relay-us-east-01",  load: 54, sessions: 218, status: "healthy" },
  { name: "relay-eu-west-01",  load: 41, sessions: 164, status: "healthy" },
  { name: "relay-us-west-01",  load: 29, sessions: 116, status: "healthy" },
];

const STATUS_MAP = {
  healthy: { label: "OK",   color: "#059669", bg: "rgba(5,150,105,0.09)" },
  warning: { label: "High", color: "#D97706", bg: "rgba(217,119,6,0.09)" },
  critical:{ label: "Crit", color: "#DC2626", bg: "rgba(220,38,38,0.09)" },
};

function RelayServerLoad() {
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid rgba(17,24,39,0.08)",
      borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      padding: "16px 18px", fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, color: "#111827", margin: "0 0 14px" }}>
        Relay Server Load
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {RELAY_SERVERS.map(s => {
          const st = STATUS_MAP[s.status];
          const loadColor = s.load > 70 ? "#D97706" : s.load > 50 ? "#3B82F6" : "#059669";
          return (
            <div key={s.name}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#374151", fontFamily: "monospace" }}>{s.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: "#9CA3AF" }}>{s.sessions} sessions</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: st.color, background: st.bg, borderRadius: 999, padding: "1px 7px" }}>{st.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: loadColor }}>{s.load}%</span>
                </div>
              </div>
              <ProgressBar pct={s.load} color={loadColor} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

const CARDS = [
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    label: "Total TURN Allocations",
    value: "24,831",
    unit: "",
    pct: 71,
    color: "#059669",
    colorBg: "rgba(5,150,105,0.09)",
    sublabel: "71% of monthly quota used",
    badge: { label: "+12.4% MoM", color: "#059669", bg: "rgba(5,150,105,0.09)" },
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
    label: "Active Relays",
    value: "810",
    unit: "/ 1,200",
    pct: 68,
    color: "#3B82F6",
    colorBg: "rgba(59,130,246,0.09)",
    sublabel: "68% relay capacity in use",
    badge: { label: "68% capacity", color: "#3B82F6", bg: "rgba(59,130,246,0.09)" },
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    label: "Avg Session Duration",
    value: "8m 42s",
    unit: "",
    pct: 44,
    color: "#8B5CF6",
    colorBg: "rgba(139,92,246,0.09)",
    sublabel: "Target: 20m | P95: 34m 10s",
    badge: null,
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    label: "Peak Bandwidth",
    value: "1.2",
    unit: "Gbps",
    pct: 60,
    color: "#D97706",
    colorBg: "rgba(217,119,6,0.09)",
    sublabel: "Recorded at 18:40 IST · Cap: 2 Gbps",
    badge: { label: "60% of cap", color: "#D97706", bg: "rgba(217,119,6,0.09)" },
  },
];

export default function TurnDeepAnalytics() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>
            TURN Deep Analytics
          </h2>
          <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0", fontWeight: 500 }}>Relay allocation, capacity, and failure diagnostics</p>
        </div>
      </div>

      {/* Top 4 mini stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 12 }}>
        {CARDS.map(c => <StatMiniCard key={c.label} {...c} />)}
      </div>

      {/* Bottom row: failure breakdown + relay server load */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        <FailureBreakdown />
        <RelayServerLoad />
      </div>
    </div>
  );
}

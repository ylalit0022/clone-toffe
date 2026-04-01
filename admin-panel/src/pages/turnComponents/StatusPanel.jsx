// StatusPanel.jsx — Phase 3
// System status panel | Tranzo design system

import { useState, useEffect } from "react";

const STATUS_LEVELS = {
  healthy:  { label: "Healthy",  color: "#059669", bg: "rgba(5,150,105,0.09)",  dot: "#059669" },
  warning:  { label: "Warning",  color: "#D97706", bg: "rgba(217,119,6,0.09)",  dot: "#D97706" },
  critical: { label: "Critical", color: "#DC2626", bg: "rgba(220,38,38,0.09)",  dot: "#DC2626" },
};

function PulseDot({ color }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: color, opacity: 0.35,
        animation: "sp-ping 1.6s ease-in-out infinite",
      }} />
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "block" }} />
    </span>
  );
}

function StatusBadge({ level }) {
  const s = STATUS_LEVELS[level] || STATUS_LEVELS.healthy;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11, fontWeight: 700, color: s.color,
      background: s.bg, borderRadius: 999, padding: "3px 10px",
    }}>
      <PulseDot color={s.dot} />
      {s.label}
    </span>
  );
}

function MetricRow({ label, value, unit, level, isLast }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: isLast ? "none" : "1px solid rgba(17,24,39,0.06)",
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</span>
      {level
        ? <StatusBadge level={level} />
        : (
          <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "'Space Grotesk', sans-serif" }}>
            {value}<span style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF", marginLeft: 3 }}>{unit}</span>
          </span>
        )}
    </div>
  );
}

// ── Mock live data that ticks ──────────────────────────────────────────────────
function useLiveMetrics() {
  const [metrics, setMetrics] = useState({ latency: 42, packetLoss: 0.3 });
  useEffect(() => {
    const id = setInterval(() => {
      setMetrics({
        latency: Math.round(38 + Math.random() * 18),
        packetLoss: parseFloat((0.1 + Math.random() * 0.8).toFixed(2)),
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);
  return metrics;
}

// ── Uptime bar ────────────────────────────────────────────────────────────────
function UptimeBar({ pct }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>Uptime (30d)</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(17,24,39,0.07)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 999,
          background: "linear-gradient(90deg, #059669, #34D399)",
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

export default function StatusPanel({ systemStatus = "healthy", turnStatus = "healthy", stunStatus = "warning" }) {
  const { latency, packetLoss } = useLiveMetrics();

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid rgba(17,24,39,0.08)",
      borderRadius: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes sp-ping { 0%,100%{transform:scale(1);opacity:.35} 50%{transform:scale(1.9);opacity:0} }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "14px 20px", background: "#F8FAFB",
        borderBottom: "1px solid rgba(17,24,39,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>
          System Status
        </h3>
        <StatusBadge level={systemStatus} />
      </div>

      {/* Rows */}
      <div style={{ padding: "4px 20px 8px" }}>
        <MetricRow label="TURN Server"   level={turnStatus} />
        <MetricRow label="STUN Server"   level={stunStatus} />
        <MetricRow label="Latency"       value={latency}     unit="ms" />
        <MetricRow label="Packet Loss"   value={packetLoss}  unit="%" isLast />
      </div>

      {/* Uptime */}
      <div style={{ padding: "12px 20px 18px", borderTop: "1px solid rgba(17,24,39,0.06)" }}>
        <UptimeBar pct={99.7} />
      </div>
    </div>
  );
}

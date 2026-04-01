// Charts.jsx — Phase 4-5
// Line: TURN sessions over time | Bar: STUN vs TURN usage
// Uses Recharts | Tranzo design system

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// ── Mock data ─────────────────────────────────────────────────────────────────

const sessionData = [
  { time: "00:00", turn: 820 },  { time: "02:00", turn: 640 },
  { time: "04:00", turn: 410 },  { time: "06:00", turn: 530 },
  { time: "08:00", turn: 980 },  { time: "10:00", turn: 1240 },
  { time: "12:00", turn: 1380 }, { time: "14:00", turn: 1190 },
  { time: "16:00", turn: 1420 }, { time: "18:00", turn: 1560 },
  { time: "20:00", turn: 1300 }, { time: "22:00", turn: 1070 },
];

const usageData = [
  { region: "Asia",    stun: 4200, turn: 1800 },
  { region: "US-East", stun: 3800, turn: 2200 },
  { region: "EU-West", stun: 3100, turn: 1400 },
  { region: "US-West", stun: 2700, turn: 950  },
  { region: "LATAM",   stun: 1900, turn: 680  },
  { region: "Africa",  stun: 1100, turn: 420  },
];

// ── Shared chart card wrapper ─────────────────────────────────────────────────

export function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid rgba(17,24,39,0.08)",
      borderRadius: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      overflow: "hidden",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        padding: "14px 20px",
        background: "#F8FAFB",
        borderBottom: "1px solid rgba(17,24,39,0.07)",
      }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>
          {title}
        </h3>
        {subtitle && <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0", fontWeight: 500 }}>{subtitle}</p>}
      </div>
      <div style={{ padding: "20px 12px 12px" }}>{children}</div>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid rgba(17,24,39,0.1)",
      borderRadius: 10, padding: "8px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12,
    }}>
      <p style={{ fontWeight: 700, color: "#374151", marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 600, margin: "2px 0" }}>
          {p.name}: <span style={{ color: "#111827" }}>{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

// ── Line Chart — TURN sessions ────────────────────────────────────────────────

export function TurnSessionsChart() {
  return (
    <ChartCard title="TURN Sessions Over Time" subtitle="Active relay sessions · last 24 h">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={sessionData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.06)" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone" dataKey="turn" name="TURN Sessions"
            stroke="#059669" strokeWidth={2.5} dot={false}
            activeDot={{ r: 5, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── Bar Chart — STUN vs TURN by region ───────────────────────────────────────

export function StunVsTurnChart() {
  return (
    <ChartCard title="STUN vs TURN Usage by Region" subtitle="Total requests · all time">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={usageData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.06)" vertical={false} />
          <XAxis dataKey="region" tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Plus Jakarta Sans',sans-serif", paddingTop: 8 }} />
          <Bar dataKey="stun" name="STUN" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="turn" name="TURN" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── Default export: both charts together ──────────────────────────────────────

export default function Charts() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
      <TurnSessionsChart />
      <StunVsTurnChart />
    </div>
  );
}

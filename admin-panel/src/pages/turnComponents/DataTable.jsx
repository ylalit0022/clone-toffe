// DataTable.jsx — Phase 5 (Area + Pie charts)  &  Phase 6 (Connections table)
// Tranzo design system | Recharts

import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// ── Re-use ChartCard from Charts.jsx (or inline here for standalone use) ──────

function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid rgba(17,24,39,0.08)",
      borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ padding: "14px 20px", background: "#F8FAFB", borderBottom: "1px solid rgba(17,24,39,0.07)" }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0", fontWeight: 500 }}>{subtitle}</p>}
      </div>
      <div style={{ padding: "20px 12px 12px" }}>{children}</div>
    </div>
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const bandwidthData = [
  { time: "Mon", gb: 2.1 }, { time: "Tue", gb: 3.4 }, { time: "Wed", gb: 2.8 },
  { time: "Thu", gb: 4.7 }, { time: "Fri", gb: 5.2 }, { time: "Sat", gb: 3.9 },
  { time: "Sun", gb: 4.1 },
];

const connTypes = [
  { name: "Host",  value: 48, color: "#3B82F6" },
  { name: "STUN",  value: 31, color: "#D97706" },
  { name: "TURN",  value: 21, color: "#059669" },
];

const TABLE_ROWS = [
  { id: "usr_8a2f", type: "TURN",  ip: "203.0.113.42",  region: "Asia-South",  bw: "182 MB", duration: "14m 22s", status: "active"  },
  { id: "usr_3c91", type: "Host",  ip: "198.51.100.9",  region: "US-East",     bw: "23 MB",  duration: "2m 05s",  status: "active"  },
  { id: "usr_7d44", type: "STUN",  ip: "192.0.2.77",    region: "EU-West",     bw: "56 MB",  duration: "8m 48s",  status: "active"  },
  { id: "usr_1b80", type: "TURN",  ip: "203.0.113.118", region: "US-West",     bw: "340 MB", duration: "31m 10s", status: "idle"    },
  { id: "usr_5e63", type: "Host",  ip: "198.51.100.201",region: "LATAM",       bw: "11 MB",  duration: "0m 58s",  status: "active"  },
  { id: "usr_9f27", type: "STUN",  ip: "192.0.2.15",    region: "Africa",      bw: "8 MB",   duration: "1m 14s",  status: "dropped" },
  { id: "usr_2a55", type: "TURN",  ip: "203.0.113.99",  region: "Asia-East",   bw: "210 MB", duration: "22m 37s", status: "active"  },
  { id: "usr_6c18", type: "Host",  ip: "198.51.100.62", region: "EU-Central",  bw: "44 MB",  duration: "5m 31s",  status: "idle"    },
  { id: "usr_4d72", type: "STUN",  ip: "192.0.2.200",   region: "US-East",     bw: "19 MB",  duration: "3m 02s",  status: "active"  },
  { id: "usr_0e39", type: "TURN",  ip: "203.0.113.55",  region: "Asia-South",  bw: "127 MB", duration: "18m 55s", status: "dropped" },
];

const TYPE_COLORS = { TURN: { color: "#059669", bg: "rgba(5,150,105,0.09)" }, STUN: { color: "#3B82F6", bg: "rgba(59,130,246,0.09)" }, Host: { color: "#D97706", bg: "rgba(217,119,6,0.09)" } };
const STATUS_COLORS = { active: { color: "#059669", bg: "rgba(5,150,105,0.09)", label: "Active" }, idle: { color: "#D97706", bg: "rgba(217,119,6,0.09)", label: "Idle" }, dropped: { color: "#DC2626", bg: "rgba(220,38,38,0.09)", label: "Dropped" } };

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid rgba(17,24,39,0.1)", borderRadius: 10, padding: "8px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12 }}>
      <p style={{ fontWeight: 700, color: "#374151", marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color || "#059669", fontWeight: 600, margin: "2px 0" }}>
          {p.name}: <span style={{ color: "#111827" }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Area Chart — Bandwidth ────────────────────────────────────────────────────

export function BandwidthChart() {
  return (
    <ChartCard title="Bandwidth Usage" subtitle="GB relayed per day · last 7 days">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={bandwidthData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#059669" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.06)" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} unit=" GB" />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="gb" name="Bandwidth" stroke="#059669" strokeWidth={2.5} fill="url(#bwGrad)" activeDot={{ r: 5, fill: "#059669", stroke: "#fff", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── Pie Chart — Connection types ──────────────────────────────────────────────

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return percent > 0.1
    ? <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{`${(percent * 100).toFixed(0)}%`}</text>
    : null;
}

export function ConnectionTypesPie() {
  return (
    <ChartCard title="Connection Types" subtitle="Host · STUN · TURN distribution">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={connTypes} cx="50%" cy="50%" outerRadius={85} dataKey="value" labelLine={false} label={<PieLabel />}>
            {connTypes.map((c) => <Cell key={c.name} fill={c.color} />)}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Plus Jakarta Sans',sans-serif", paddingTop: 8 }} />
          <Tooltip formatter={(val, name) => [`${val}%`, name]} contentStyle={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, borderRadius: 10 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── Connections Data Table ────────────────────────────────────────────────────

const TH_STYLE = {
  padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#6B7280",
  textAlign: "left", whiteSpace: "nowrap", background: "#F8FAFB",
  position: "sticky", top: 0, zIndex: 1,
  borderBottom: "1px solid rgba(17,24,39,0.08)",
};
const TD_STYLE = { padding: "11px 14px", fontSize: 12, color: "#374151", whiteSpace: "nowrap" };

export function ConnectionsTable() {
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid rgba(17,24,39,0.08)",
      borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ padding: "14px 20px", background: "#F8FAFB", borderBottom: "1px solid rgba(17,24,39,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>Active Connections</h3>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF" }}>{TABLE_ROWS.length} sessions</span>
      </div>

      <div style={{ overflowX: "auto", maxHeight: 340, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr>
              {["User ID","Type","IP Address","Region","Bandwidth","Duration","Status"].map(h => (
                <th key={h} style={TH_STYLE}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map((row, i) => {
              const tc = TYPE_COLORS[row.type];
              const sc = STATUS_COLORS[row.status];
              return (
                <tr key={row.id} style={{ borderBottom: i < TABLE_ROWS.length - 1 ? "1px solid rgba(17,24,39,0.05)" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F8FAFB"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ ...TD_STYLE, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, color: "#111827" }}>{row.id}</td>
                  <td style={TD_STYLE}>
                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: tc.color, background: tc.bg, borderRadius: 999, padding: "2px 9px" }}>{row.type}</span>
                  </td>
                  <td style={{ ...TD_STYLE, fontFamily: "monospace", fontSize: 11 }}>{row.ip}</td>
                  <td style={TD_STYLE}>{row.region}</td>
                  <td style={{ ...TD_STYLE, fontWeight: 600 }}>{row.bw}</td>
                  <td style={TD_STYLE}>{row.duration}</td>
                  <td style={TD_STYLE}>
                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg, borderRadius: 999, padding: "2px 9px" }}>{sc.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Default export: charts + table ────────────────────────────────────────────

export default function DataTable() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <BandwidthChart />
        <ConnectionTypesPie />
      </div>
      <ConnectionsTable />
    </div>
  );
}

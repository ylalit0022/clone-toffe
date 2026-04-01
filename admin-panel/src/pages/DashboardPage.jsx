import { useState } from "react";

// ─── static data ─────────────────────────────────────────────────────────────

const STATS = {
  totalUsers:   { value: 2847,  delta: +12.4, label: "Total Users",   suffix: "",  period: "vs last month" },
  transfers:    { value: 18340, delta: +8.7,  label: "Transfers",     suffix: "",  period: "vs last month" },
  successRate:  { value: 97.3,  delta: +1.2,  label: "Success Rate",  suffix: "%", period: "vs last month" },
  turnUsage:    { value: 23.6,  delta: -4.1,  label: "TURN Usage",    suffix: "%", period: "vs last month" },
};

// 7-day sparkline points (relative 0–100) for each metric
const SPARKLINES = {
  totalUsers:  [62, 65, 68, 70, 75, 79, 84],
  transfers:   [50, 58, 53, 67, 72, 69, 80],
  successRate: [90, 91, 88, 93, 95, 96, 97],
  turnUsage:   [38, 34, 30, 28, 26, 25, 24],
};

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Bar chart data: daily transfers this week
const DAILY_TRANSFERS = [
  { day: "Mon", p2p: 2100, turn: 540 },
  { day: "Tue", p2p: 2450, turn: 610 },
  { day: "Wed", p2p: 1980, turn: 490 },
  { day: "Thu", p2p: 2780, turn: 720 },
  { day: "Fri", p2p: 3010, turn: 780 },
  { day: "Sat", p2p: 2350, turn: 580 },
  { day: "Sun", p2p: 1870, turn: 430 },
];

const RECENT_EVENTS = [
  { id: 1, type: "upgrade",  user: "arjun.mehta",    detail: "Free → Pro",         time: "2m ago" },
  { id: 2, type: "transfer", user: "sara.johansson",  detail: "847 MB via P2P",     time: "6m ago" },
  { id: 3, type: "turn",     user: "felix.bauer",     detail: "TURN relay used",    time: "11m ago" },
  { id: 4, type: "signup",   user: "yuki.tanaka",     detail: "New Ultra signup",   time: "18m ago" },
  { id: 5, type: "transfer", user: "dev.patel",       detail: "2.1 GB via P2P",     time: "24m ago" },
  { id: 6, type: "block",    user: "omar.hassan",     detail: "Account blocked",    time: "31m ago" },
  { id: 7, type: "upgrade",  user: "elena.kovac",     detail: "Pro → Ultra",        time: "45m ago" },
];

const EVENT_META = {
  upgrade:  { bg: "#D1FAE5", color: "#047857", icon: "↑" },
  transfer: { bg: "#DBEAFE", color: "#1D4ED8", icon: "⇄" },
  turn:     { bg: "#FEF3C7", color: "#B45309", icon: "⟳" },
  signup:   { bg: "#EDE9FE", color: "#6D28D9", icon: "+" },
  block:    { bg: "#FEE2E2", color: "#B91C1C", icon: "⊘" },
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(n, suffix = "") {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" + suffix;
  return n + suffix;
}

function sparkPath(points, w = 80, h = 28) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map((p) => h - ((p - min) / range) * h);
  return xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({ id, stat, sparkData }) {
  const isDown = stat.delta < 0;
  // TURN usage going down is actually good
  const isTurn = id === "turnUsage";
  const positive = isTurn ? isDown : !isDown;

  const path = sparkPath(sparkData);
  const strokeColor = positive ? "#059669" : "#EF4444";

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{
        background: "#fff",
        border: "1px solid rgba(17,24,39,0.07)",
        boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Top row: label + delta */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold text-gray-400 uppercase tracking-widest"
          style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.07em" }}
        >
          {stat.label}
        </span>
        <span
          className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            background: positive ? "#D1FAE5" : "#FEE2E2",
            color: positive ? "#047857" : "#B91C1C",
          }}
        >
          {isDown ? "▼" : "▲"} {Math.abs(stat.delta)}%
        </span>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <span
            className="text-4xl font-extrabold text-gray-900 leading-none"
            style={{ fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-0.04em" }}
          >
            {fmt(stat.value, stat.suffix)}
          </span>
          <p className="text-xs text-gray-400 mt-1.5" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {stat.period}
          </p>
        </div>

        {/* Sparkline */}
        <svg width="80" height="28" viewBox="0 0 80 28" fill="none" style={{ flexShrink: 0 }}>
          <path d={path} stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" fill="none" />
          <path d={path + ` L80,28 L0,28 Z`} fill={strokeColor} opacity="0.07" />
        </svg>
      </div>
    </div>
  );
}

function BarChart() {
  const maxVal = Math.max(...DAILY_TRANSFERS.map((d) => d.p2p + d.turn));

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3
            className="text-sm font-bold text-gray-900 leading-none"
            style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.01em" }}
          >
            Daily Transfers
          </h3>
          <p className="text-xs text-gray-400 mt-1">This week — P2P vs TURN relay</p>
        </div>
        <div className="flex items-center gap-3">
          {[["#059669", "P2P"], ["#D97706", "TURN"]].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              <span className="text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-2 h-32">
        {DAILY_TRANSFERS.map(({ day, p2p, turn }) => {
          const total = p2p + turn;
          const p2pH = Math.round((p2p / maxVal) * 128);
          const turnH = Math.round((turn / maxVal) * 128);
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: "112px" }}>
                <div className="w-full flex flex-col gap-0.5">
                  <div
                    className="w-full rounded-t-md transition-all duration-300"
                    style={{ height: `${turnH}px`, background: "linear-gradient(180deg,#F59E0B,#D97706)" }}
                  />
                  <div
                    className="w-full rounded-b-sm transition-all duration-300"
                    style={{ height: `${p2pH}px`, background: "linear-gradient(180deg,#059669,#047857)", borderRadius: p2pH > 0 ? "0 0 4px 4px" : "4px" }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlanDonut() {
  const plans = [
    { label: "Free",  value: 48, color: "#9CA3AF" },
    { label: "Pro",   value: 34, color: "#3B82F6" },
    { label: "Ultra", value: 18, color: "#059669" },
  ];

  // Simple SVG donut: each segment as a stroke-dasharray circle
  const r = 36, cx = 48, cy = 48, circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = plans.map((p) => {
    const dash = (p.value / 100) * circ;
    const gap = circ - dash;
    const seg = { ...p, dash, gap, offset };
    offset += dash;
    return seg;
  });

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
    >
      <h3
        className="text-sm font-bold text-gray-900 mb-4"
        style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.01em" }}
      >
        Plan Distribution
      </h3>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ flexShrink: 0 }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="12" />
          {segments.map((s) => (
            <circle
              key={s.label}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#111827" fontFamily="'Bricolage Grotesque',sans-serif">2.8k</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="'Space Grotesk',sans-serif">USERS</text>
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1">
          {plans.map((p) => (
            <div key={p.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                <span className="text-xs font-semibold text-gray-600" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{p.label}</span>
              </div>
              <span className="text-xs font-bold text-gray-800" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{p.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-bold text-gray-900"
          style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.01em" }}
        >
          Recent Activity
        </h3>
        <span
          className="text-xs font-semibold text-emerald-600 px-2 py-1 rounded-lg"
          style={{ background: "#D1FAE5", fontFamily: "'Space Grotesk',sans-serif" }}
        >
          Live
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {RECENT_EVENTS.map((ev) => {
          const m = EVENT_META[ev.type];
          return (
            <div key={ev.id} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: m.bg, color: m.color, fontFamily: "'Space Grotesk',sans-serif" }}
              >
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  <span className="text-gray-500">{ev.user}</span>
                  <span className="mx-1 text-gray-300">·</span>
                  {ev.detail}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-gray-400 flex-shrink-0" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                {ev.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [range, setRange] = useState("7d");

  return (
    <div
      className="p-6 lg:p-8"
      style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", maxWidth: "1040px", margin: "0 auto" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2
            className="text-xl font-extrabold text-gray-900 leading-none"
            style={{ fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-0.03em" }}
          >
            Analytics
          </h2>
          <p className="text-sm text-gray-400 mt-1">Platform overview — real-time snapshot</p>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
          {["24h", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                background: range === r ? "linear-gradient(135deg,#059669,#047857)" : "transparent",
                color: range === r ? "#fff" : "#6B7280",
                boxShadow: range === r ? "0 2px 8px rgba(5,150,105,0.25)" : "none",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {Object.entries(STATS).map(([id, stat]) => (
          <StatCard key={id} id={id} stat={stat} sparkData={SPARKLINES[id]} />
        ))}
      </div>

      {/* Second row: bar chart + donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <BarChart />
        </div>
        <PlanDonut />
      </div>

      {/* Third row: recent activity */}
      <RecentActivity />
    </div>
  );
}

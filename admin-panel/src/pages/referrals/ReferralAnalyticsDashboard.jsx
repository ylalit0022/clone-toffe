import { useState } from "react";

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#059669", height = 40 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200, h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  const fill = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBar({ data, color = "#059669" }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1" style={{ height: "40px" }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all duration-300" style={{
          height: `${(v / max) * 100}%`,
          background: i === data.length - 1 ? color : `${color}55`,
        }} />
      ))}
    </div>
  );
}

// ─── Large Line Chart ─────────────────────────────────────────────────────────
function LineChart({ data, labels, color = "#059669" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 600, H = 160;
  const pts = data.map((v, i) => {
    const x = 32 + (i / (data.length - 1)) * (W - 64);
    const y = 12 + H - ((v - min) / range) * (H - 20) - 10;
    return [x, y];
  });
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${pts[0][0]},${H + 12} ` + polyline + ` ${pts[pts.length - 1][0]},${H + 12}`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 36}`} className="w-full">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1="32" x2={W - 32} y1={12 + H - t * (H - 20) - 10} y2={12 + H - t * (H - 20) - 10}
          stroke="rgba(17,24,39,0.05)" strokeWidth="1" />
      ))}
      <polygon points={area} fill="url(#lineGrad)" />
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polyline} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
      ))}
      {labels.map((l, i) => {
        const x = 32 + (i / (labels.length - 1)) * (W - 64);
        return <text key={i} x={x} y={H + 30} textAnchor="middle" fontSize="10"
          fontFamily="'Space Grotesk',sans-serif" fill="#9CA3AF">{l}</text>;
      })}
    </svg>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, labels, color = "#059669" }) {
  const max = Math.max(...data);
  const W = 600, H = 160;
  const barW = (W - 64) / data.length - 8;
  return (
    <svg viewBox={`0 0 ${W} ${H + 36}`} className="w-full">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={`${color}88`} />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1="32" x2={W - 32} y1={12 + H - t * (H - 20) - 10} y2={12 + H - t * (H - 20) - 10}
          stroke="rgba(17,24,39,0.05)" strokeWidth="1" />
      ))}
      {data.map((v, i) => {
        const barH = ((v / max) * (H - 20));
        const x = 32 + i * ((W - 64) / data.length) + 4;
        const y = H + 2 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill="url(#barGrad)" opacity="0.9" />
          </g>
        );
      })}
      {labels.map((l, i) => {
        const x = 32 + i * ((W - 64) / data.length) + barW / 2 + 4;
        return <text key={i} x={x} y={H + 30} textAnchor="middle" fontSize="10"
          fontFamily="'Space Grotesk',sans-serif" fill="#9CA3AF">{l}</text>;
      })}
    </svg>
  );
}

// ─── Horizontal Bar ───────────────────────────────────────────────────────────
function HBarChart({ data }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{d.name}</span>
            <span className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{d.value}</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "rgba(17,24,39,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{
              width: `${(d.value / max) * 100}%`,
              background: i === 0 ? "#059669" : i === 1 ? "#047857" : i === 2 ? "#10B981" : "#34D399",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const lineData = [42, 58, 51, 73, 65, 88, 76, 95, 102, 118, 109, 134];
const lineLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const barData = [18400, 24200, 21800, 31500, 28700, 37200, 33100, 41800, 38500, 45200, 42100, 51300];
const topReferrers = [
  { name: "Priya Sharma", email: "priya.s@gmail.com", referrals: 48, earnings: "₹24,000", rate: "79%", spark: [3,7,5,9,8,11,10,14,12,16] },
  { name: "Rahul Mehta", email: "rahul.m@gmail.com", referrals: 41, earnings: "₹20,500", rate: "73%", spark: [5,4,8,7,10,9,13,11,15,13] },
  { name: "Sneha Kapoor", email: "sneha.k@gmail.com", referrals: 37, earnings: "₹18,500", rate: "68%", spark: [2,5,4,7,6,9,8,11,10,12] },
  { name: "Arjun Nair", email: "arjun.n@gmail.com", referrals: 29, earnings: "₹14,500", rate: "65%", spark: [1,3,5,4,7,6,9,8,10,9] },
  { name: "Deepika Verma", email: "deepika.v@gmail.com", referrals: 24, earnings: "₹12,000", rate: "58%", spark: [2,4,3,6,5,7,6,9,8,10] },
];
const topBarData = [
  { name: "Priya Sharma", value: 48 },
  { name: "Rahul Mehta", value: 41 },
  { name: "Sneha Kapoor", value: 37 },
  { name: "Arjun Nair", value: 29 },
  { name: "Deepika Verma", value: 24 },
];

const overviewCards = [
  { label: "Total Referrals", value: "1,248", trend: "↑ +38 this week", trendColor: "#059669", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", iconBg: "#D1FAE5", iconStroke: "#059669", spark: [3,5,4,7,6,9,8,11,10,13,12,15] },
  { label: "Successful Conversions", value: "834", trend: "66.8% conversion rate", trendColor: "#047857", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", iconBg: "#D1FAE5", iconStroke: "#059669", spark: [2,4,3,6,5,8,7,9,8,11,10,12] },
  { label: "Conversion Rate", value: "66.8%", trend: "↑ +2.1% vs last month", trendColor: "#059669", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", iconBg: "#FEF3C7", iconStroke: "#D97706", spark: [60,62,61,64,63,65,65,66,66,67,67,67] },
  { label: "Total Commission Paid", value: "₹41,700", trend: "Lifetime disbursed", trendColor: "#047857", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 8v1m-3-1H9m3-8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", iconBg: "#D1FAE5", iconStroke: "#059669", spark: [8,12,10,16,14,20,18,24,22,28,26,30] },
  { label: "Pending Rewards", value: "₹3,850", trend: "14 users awaiting payout", trendColor: "#D97706", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", iconBg: "#FEF3C7", iconStroke: "#D97706", spark: [5,3,6,4,7,5,4,6,5,4,5,4] },
  { label: "Avg Earnings / User", value: "₹33.4", trend: "Per referred conversion", trendColor: "#6B7280", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", iconBg: "#F8FAFB", iconStroke: "#6B7280", spark: [28,30,29,31,30,32,31,33,32,33,33,33] },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ReferralAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("last_30");
  const [status, setStatus] = useState("all");

  return (
    <div style={{ background: "#F8FAFB", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(17,24,39,0.07)", padding: "16px 24px" }}
        className="flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#D1FAE5" }}>
            <svg width="16" height="16" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", color: "#111827", lineHeight: 1 }}>
              Referral Analytics
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Performance overview & top referrers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range */}
          <select value={dateRange} onChange={e => setDateRange(e.target.value)}
            className="text-xs font-semibold text-gray-600 rounded-xl outline-none bg-white"
            style={{ border: "1.5px solid rgba(17,24,39,0.1)", height: 36, padding: "0 12px", fontFamily: "'Space Grotesk',sans-serif" }}>
            <option value="last_7">Last 7 days</option>
            <option value="last_30">Last 30 days</option>
            <option value="last_90">Last 90 days</option>
            <option value="this_year">This Year</option>
          </select>
          {/* Status */}
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="text-xs font-semibold text-gray-600 rounded-xl outline-none bg-white"
            style={{ border: "1.5px solid rgba(17,24,39,0.1)", height: 36, padding: "0 12px", fontFamily: "'Space Grotesk',sans-serif" }}>
            <option value="all">All Status</option>
            <option value="converted">Converted</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
          <button className="flex items-center gap-1.5 text-xs font-bold text-white rounded-xl px-4"
            style={{ height: 36, background: "linear-gradient(135deg,#059669,#047857)", boxShadow: "0 4px 12px rgba(5,150,105,0.3)", fontFamily: "'Space Grotesk',sans-serif" }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* SECTION 1: Overview Cards */}
        <div>
          <p className="text-xs font-bold mb-3" style={{ color: "#059669", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.05em" }}>
            OVERVIEW
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {overviewCards.map((c, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: c.iconBg }}>
                    <svg width="14" height="14" fill="none" stroke={c.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d={c.icon} />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.02em" }}>{c.label}</p>
                <p className="font-extrabold text-gray-900" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, letterSpacing: "-0.03em" }}>{c.value}</p>
                <Sparkline data={c.spark} color={c.iconStroke} height={28} />
                <p className="text-xs font-semibold mt-1" style={{ color: c.trendColor }}>{c.trend}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Charts */}
        <div>
          <p className="text-xs font-bold mb-3" style={{ color: "#059669", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.05em" }}>
            CHARTS
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Line Chart */}
            <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#D1FAE5" }}>
                    <svg width="14" height="14" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>Referrals Over Time</p>
                    <p className="text-xs text-gray-400">Monthly referral count — 2024</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#D1FAE5", color: "#047857", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.04em" }}>
                  ↑ +7.2%
                </div>
              </div>
              <LineChart data={lineData} labels={lineLabels} color="#059669" />
            </div>

            {/* Bar Chart */}
            <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FEF3C7" }}>
                    <svg width="14" height="14" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 8v1" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>Revenue from Referrals</p>
                    <p className="text-xs text-gray-400">Monthly revenue in ₹ — 2024</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#FEF3C7", color: "#B45309", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.04em" }}>
                  ₹4.15L total
                </div>
              </div>
              <BarChart data={barData} labels={lineLabels} color="#D97706" />
            </div>
          </div>

          {/* Top Referrers Chart */}
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#D1FAE5" }}>
                <svg width="14" height="14" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>Top Referrers by Volume</p>
                <p className="text-xs text-gray-400">Referral count comparison — all time</p>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
              <HBarChart data={topBarData} />
              <div className="hidden md:flex flex-col items-center justify-center" style={{ background: "#F0FDF4", borderRadius: 16, padding: "24px", border: "1.5px solid rgba(5,150,105,0.15)" }}>
                <p className="text-xs font-bold mb-1" style={{ color: "#059669", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.05em" }}>TOP PERFORMER</p>
                <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 22, color: "#111827", letterSpacing: "-0.03em" }}>Priya Sharma</p>
                <p className="text-xs text-gray-400 mb-3">priya.s@gmail.com</p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="text-center">
                    <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 20, color: "#059669", letterSpacing: "-0.03em" }}>48</p>
                    <p className="text-xs text-gray-400">referrals</p>
                  </div>
                  <div className="text-center">
                    <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 20, color: "#047857", letterSpacing: "-0.03em" }}>79%</p>
                    <p className="text-xs text-gray-400">conversion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Top Referrers Table */}
        <div>
          <p className="text-xs font-bold mb-3" style={{ color: "#059669", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.05em" }}>
            TOP REFERRERS
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(17,24,39,0.06)" }}>
                  {["User", "Trend", "Total Referrals", "Total Earnings", "Conversion Rate"].map((h, i) => (
                    <th key={i} className="text-left py-3 px-4 text-xs font-bold text-gray-400"
                      style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.04em", background: "#F8FAFB" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((r, i) => (
                  <tr key={i} style={{ borderBottom: i < topReferrers.length - 1 ? "1px solid rgba(17,24,39,0.05)" : "none" }}
                    className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: i === 0 ? "linear-gradient(135deg,#059669,#047857)" : i === 1 ? "linear-gradient(135deg,#D97706,#B45309)" : "linear-gradient(135deg,#6B7280,#4B5563)", fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                          {r.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{r.name}</p>
                          <p className="text-xs text-gray-400">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4" style={{ width: "100px" }}>
                      <Sparkline data={r.spark} color="#059669" height={28} />
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 16, letterSpacing: "-0.02em" }}>{r.referrals}</p>
                      <p className="text-xs text-gray-400">referrals</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 16, letterSpacing: "-0.02em" }}>{r.earnings}</p>
                      <p className="text-xs text-gray-400">earned</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full flex-1" style={{ background: "rgba(17,24,39,0.06)", maxWidth: 60 }}>
                          <div className="h-full rounded-full" style={{ width: r.rate, background: parseInt(r.rate) > 70 ? "#059669" : "#D97706" }} />
                        </div>
                        <span className="text-sm font-bold" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", color: parseInt(r.rate) > 70 ? "#059669" : "#D97706" }}>{r.rate}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

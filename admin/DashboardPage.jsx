import StatsCard from "../components/StatsCard";

const stats = [
  {
    title: "Total Users",
    value: "12,482",
    change: "8.2%",
    positive: true,
    accent: "emerald",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "File Transfers",
    value: "94,301",
    change: "13.5%",
    positive: true,
    accent: "amber",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    title: "Active Sessions",
    value: "1,847",
    change: "4.1%",
    positive: true,
    accent: "emerald",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Data Transferred",
    value: "8.4 TB",
    change: "2.3%",
    positive: false,
    accent: "amber",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
];

const recentUsers = [
  { name: "Priya Sharma", email: "priya@example.com", status: "Active", joined: "Mar 28, 2026", role: "Pro" },
  { name: "Arjun Mehta", email: "arjun@example.com", status: "Active", joined: "Mar 27, 2026", role: "Free" },
  { name: "Sneha Patel", email: "sneha@example.com", status: "Inactive", joined: "Mar 25, 2026", role: "Pro" },
  { name: "Rohan Verma", email: "rohan@example.com", status: "Active", joined: "Mar 24, 2026", role: "Free" },
  { name: "Meera Nair", email: "meera@example.com", status: "Active", joined: "Mar 22, 2026", role: "Pro" },
];

const activity = [
  { action: "New user registered", time: "2 min ago", accent: "emerald" },
  { action: "File transfer completed (2.3 GB)", time: "8 min ago", accent: "amber" },
  { action: "Session timeout: user_4821", time: "15 min ago", accent: "amber" },
  { action: "New Pro subscription activated", time: "31 min ago", accent: "emerald" },
  { action: "System backup completed", time: "1 hr ago", accent: "emerald" },
];

export default function DashboardPage() {
  return (
    <div className="p-5 lg:p-8 space-y-7" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatsCard key={s.title} {...s} />)}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Users Table */}
        <div
          className="xl:col-span-2 rounded-2xl overflow-hidden"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(17,24,39,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(17,24,39,0.07)" }}>
            <h2 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Recent Users
            </h2>
            <button
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "#059669", background: "#D1FAE5" }}
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F8FAFB" }}>
                  {["Name", "Status", "Role", "Joined"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr
                    key={u.email}
                    className="transition-colors hover:bg-emerald-50/40"
                    style={{ borderTop: i > 0 ? "1px solid rgba(17,24,39,0.06)" : "none" }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{ background: i % 2 === 0 ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#D97706,#B45309)" }}
                        >
                          {u.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">{u.name}</p>
                          <p className="text-gray-400 text-[11px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={u.status === "Active"
                          ? { background: "#D1FAE5", color: "#047857" }
                          : { background: "#FEE2E2", color: "#B91C1C" }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={u.role === "Pro"
                          ? { background: "#FEF3C7", color: "#B45309" }
                          : { background: "#EEF2F5", color: "#4B5563" }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(17,24,39,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <h2 className="font-bold text-gray-900 text-sm mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{
                    background: a.accent === "emerald" ? "#059669" : "#D97706",
                    boxShadow: a.accent === "emerald"
                      ? "0 0 0 3px rgba(5,150,105,0.15)"
                      : "0 0 0 3px rgba(217,119,6,0.15)",
                  }}
                />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{a.action}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

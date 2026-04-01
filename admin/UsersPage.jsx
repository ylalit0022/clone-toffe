const users = [
  { name: "Priya Sharma", email: "priya@example.com", role: "Pro", status: "Active", transfers: 312, joined: "Jan 4, 2026" },
  { name: "Arjun Mehta", email: "arjun@example.com", role: "Free", status: "Active", transfers: 87, joined: "Jan 12, 2026" },
  { name: "Sneha Patel", email: "sneha@example.com", role: "Pro", status: "Inactive", transfers: 204, joined: "Feb 3, 2026" },
  { name: "Rohan Verma", email: "rohan@example.com", role: "Free", status: "Active", transfers: 55, joined: "Feb 19, 2026" },
  { name: "Meera Nair", email: "meera@example.com", role: "Pro", status: "Active", transfers: 478, joined: "Mar 1, 2026" },
  { name: "Vikram Singh", email: "vikram@example.com", role: "Free", status: "Active", transfers: 19, joined: "Mar 10, 2026" },
  { name: "Ananya Das", email: "ananya@example.com", role: "Pro", status: "Inactive", transfers: 133, joined: "Mar 15, 2026" },
];

export default function UsersPage() {
  return (
    <div className="p-5 lg:p-8 space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
            All Users
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} total users registered</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg,#059669,#047857)", boxShadow: "0 4px 12px rgba(5,150,105,0.25)" }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add User
        </button>
      </div>

      {/* Table Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", border: "1px solid rgba(17,24,39,0.08)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "rgba(17,24,39,0.07)", background: "#F8FAFB" }}>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 flex-1 min-w-[160px]"
            style={{ background: "#FFFFFF", border: "1px solid rgba(17,24,39,0.1)" }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search users..." className="bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400 w-full" />
          </div>
          {["All", "Pro", "Free", "Inactive"].map((f) => (
            <button
              key={f}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={f === "All"
                ? { background: "#D1FAE5", color: "#047857" }
                : { background: "#FFFFFF", color: "#4B5563", border: "1px solid rgba(17,24,39,0.1)" }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F8FAFB", borderBottom: "1px solid rgba(17,24,39,0.07)" }}>
                {["User", "Role", "Status", "Transfers", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.email}
                  className="transition-colors hover:bg-emerald-50/30"
                  style={{ borderTop: "1px solid rgba(17,24,39,0.05)" }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: i % 2 === 0 ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#D97706,#B45309)" }}
                      >
                        {u.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={u.role === "Pro"
                        ? { background: "#FEF3C7", color: "#B45309" }
                        : { background: "#EEF2F5", color: "#4B5563" }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={u.status === "Active"
                        ? { background: "#D1FAE5", color: "#047857" }
                        : { background: "#FEE2E2", color: "#B91C1C" }}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 font-semibold text-sm">{u.transfers.toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{u.joined}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-5 py-3 border-t"
          style={{ borderColor: "rgba(17,24,39,0.07)", background: "#F8FAFB" }}
        >
          <p className="text-xs text-gray-400">Showing 1–7 of 7 users</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className="w-7 h-7 rounded-lg text-xs font-semibold transition-all"
                style={p === 1
                  ? { background: "#059669", color: "#fff" }
                  : { background: "#FFFFFF", color: "#6B7280", border: "1px solid rgba(17,24,39,0.1)" }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

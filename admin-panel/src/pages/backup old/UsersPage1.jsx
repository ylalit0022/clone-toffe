import { useState } from "react";

// ─── seed data ───────────────────────────────────────────────────────────────

const SEED_USERS = [
  { id: 1,  email: "arjun.mehta@gmail.com",      plan: "free",  status: "active" },
  { id: 2,  email: "priya.sharma@outlook.com",    plan: "pro",   status: "active" },
  { id: 3,  email: "lucas.ferreira@proton.me",    plan: "ultra", status: "active" },
  { id: 4,  email: "nina.walsh@company.io",       plan: "pro",   status: "blocked" },
  { id: 5,  email: "dev.patel@startupxyz.com",    plan: "free",  status: "active" },
  { id: 6,  email: "sara.johansson@mail.se",      plan: "ultra", status: "active" },
  { id: 7,  email: "omar.hassan@techcorp.net",    plan: "free",  status: "blocked" },
  { id: 8,  email: "elena.kovac@design.studio",   plan: "pro",   status: "active" },
  { id: 9,  email: "james.obi@freelance.dev",     plan: "free",  status: "active" },
  { id: 10, email: "yuki.tanaka@agency.jp",       plan: "ultra", status: "active" },
  { id: 11, email: "maria.santos@ventures.co",    plan: "pro",   status: "active" },
  { id: 12, email: "felix.bauer@consulting.de",   plan: "free",  status: "blocked" },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

const PLAN_META = {
  free:  { label: "Free",  bg: "#F3F4F6", color: "#6B7280", border: "rgba(107,114,128,0.2)" },
  pro:   { label: "Pro",   bg: "#DBEAFE", color: "#1D4ED8", border: "rgba(29,78,216,0.2)"  },
  ultra: { label: "Ultra", bg: "#D1FAE5", color: "#047857", border: "rgba(5,150,105,0.25)" },
};

const PLAN_ORDER = ["free", "pro", "ultra"];

function nextPlan(plan) {
  const idx = PLAN_ORDER.indexOf(plan);
  return idx < PLAN_ORDER.length - 1 ? PLAN_ORDER[idx + 1] : null;
}

function initials(email) {
  const name = email.split("@")[0].replace(/[._-]/g, " ");
  const parts = name.split(" ").filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  ["#DBEAFE", "#1D4ED8"], ["#D1FAE5", "#047857"], ["#EDE9FE", "#6D28D9"],
  ["#FEF3C7", "#B45309"], ["#FCE7F3", "#9D174D"], ["#CFFAFE", "#0E7490"],
];

function avatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

// ─── sub-components ──────────────────────────────────────────────────────────

function PlanBadge({ plan }) {
  const m = PLAN_META[plan];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{
        background: m.bg, color: m.color,
        border: `1px solid ${m.border}`,
        fontFamily: "'Space Grotesk',sans-serif",
        letterSpacing: "0.04em",
      }}
    >
      {plan === "ultra" && (
        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )}
      {plan === "pro" && (
        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {m.label}
    </span>
  );
}

function StatusDot({ status }) {
  const active = status === "active";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold"
      style={{ color: active ? "#047857" : "#B91C1C", fontFamily: "'Space Grotesk',sans-serif" }}>
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: active ? "#059669" : "#EF4444", boxShadow: active ? "0 0 0 3px rgba(5,150,105,0.15)" : "0 0 0 3px rgba(239,68,68,0.12)" }}
      />
      {active ? "Active" : "Blocked"}
    </span>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
      style={{
        fontFamily: "'Space Grotesk',sans-serif",
        background: active ? "linear-gradient(135deg,#059669,#047857)" : "transparent",
        color: active ? "#fff" : "#6B7280",
        border: active ? "none" : "1px solid rgba(17,24,39,0.1)",
        boxShadow: active ? "0 2px 8px rgba(5,150,105,0.25)" : "none",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </button>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState(SEED_USERS);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handleBlock = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "blocked" ? "active" : "blocked" }
          : u
      )
    );
    const u = users.find((x) => x.id === id);
    showToast(
      u.status === "blocked"
        ? `${u.email.split("@")[0]} unblocked`
        : `${u.email.split("@")[0]} blocked`,
      u.status === "blocked" ? "success" : "warning"
    );
  };

  const handleUpgrade = (id) => {
    const u = users.find((x) => x.id === id);
    const next = nextPlan(u.plan);
    if (!next) return;
    setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, plan: next } : x)));
    showToast(`${u.email.split("@")[0]} upgraded to ${PLAN_META[next].label}`);
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "all" || u.plan === filterPlan;
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    blocked: users.filter((u) => u.status === "blocked").length,
    ultra: users.filter((u) => u.plan === "ultra").length,
  };

  return (
    <div
      className="p-6 lg:p-8"
      style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", maxWidth: "960px", margin: "0 auto" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-xl font-extrabold text-gray-900 leading-none"
            style={{ fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-0.03em" }}
          >
            Users
          </h2>
          <p className="text-sm text-gray-400 mt-1">Manage accounts, plans and access</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: "#D1FAE5", color: "#047857",
            border: "1px solid rgba(5,150,105,0.25)",
            fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.04em",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#059669" }} />
          {stats.total} USERS
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, bg: "#F8FAFB", color: "#374151" },
          { label: "Active", value: stats.active, bg: "#D1FAE5", color: "#047857" },
          { label: "Blocked", value: stats.blocked, bg: "#FEE2E2", color: "#B91C1C" },
          { label: "Ultra", value: stats.ultra, bg: "#DBEAFE", color: "#1D4ED8" },
        ].map(({ label, value, bg, color }) => (
          <div
            key={label}
            className="rounded-xl px-4 py-3"
            style={{ background: bg, border: "1px solid rgba(17,24,39,0.06)" }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.04em", opacity: 0.8 }}>
              {label.toUpperCase()}
            </p>
            <p className="text-2xl font-extrabold" style={{ color, fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-0.03em" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
          style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.1)", minWidth: "180px", maxWidth: "280px" }}
        >
          <svg width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
          />
        </div>

        {/* Plan filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
          {["all", "free", "pro", "ultra"].map((p) => (
            <FilterBtn key={p} active={filterPlan === p} onClick={() => setFilterPlan(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </FilterBtn>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
          {["all", "active", "blocked"].map((s) => (
            <FilterBtn key={s} active={filterStatus === s} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </FilterBtn>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
      >
        {/* Table header */}
        <div
          className="grid items-center px-5 py-3"
          style={{
            gridTemplateColumns: "2.4fr 1fr 1fr 1fr",
            background: "#F8FAFB",
            borderBottom: "1px solid rgba(17,24,39,0.07)",
          }}
        >
          {["Email", "Plan", "Status", "Actions"].map((h) => (
            <span
              key={h}
              className="text-xs font-bold text-gray-400 uppercase"
              style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.06em" }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="mx-auto mb-3 text-gray-300" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <p className="text-sm font-semibold text-gray-400">No users match your filters</p>
          </div>
        ) : (
          filtered.map((user, i) => {
            const [avBg, avColor] = avatarColor(user.id);
            const canUpgrade = nextPlan(user.plan) !== null;
            const isBlocked = user.status === "blocked";
            return (
              <div
                key={user.id}
                className="grid items-center px-5 py-3.5 transition-colors duration-150 hover:bg-gray-50"
                style={{
                  gridTemplateColumns: "2.4fr 1fr 1fr 1fr",
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(17,24,39,0.05)" : "none",
                  opacity: isBlocked ? 0.7 : 1,
                }}
              >
                {/* Email + avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: avBg, color: avColor, fontFamily: "'Space Grotesk',sans-serif" }}
                  >
                    {initials(user.email)}
                  </div>
                  <span
                    className="text-sm font-semibold text-gray-800 truncate"
                    style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                  >
                    {user.email}
                  </span>
                </div>

                {/* Plan */}
                <div><PlanBadge plan={user.plan} /></div>

                {/* Status */}
                <div><StatusDot status={user.status} /></div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Block / Unblock */}
                  <button
                    onClick={() => handleBlock(user.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95"
                    style={{
                      fontFamily: "'Space Grotesk',sans-serif",
                      background: isBlocked ? "#FEF3C7" : "#FEE2E2",
                      color: isBlocked ? "#B45309" : "#B91C1C",
                      border: `1px solid ${isBlocked ? "rgba(180,83,9,0.2)" : "rgba(185,28,28,0.15)"}`,
                    }}
                  >
                    {isBlocked ? (
                      <>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Unblock
                      </>
                    ) : (
                      <>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                        Block
                      </>
                    )}
                  </button>

                  {/* Upgrade */}
                  <button
                    onClick={() => canUpgrade && handleUpgrade(user.id)}
                    disabled={!canUpgrade}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: "'Space Grotesk',sans-serif",
                      background: canUpgrade ? "linear-gradient(135deg,#059669,#047857)" : "#E5E7EB",
                      color: canUpgrade ? "#fff" : "#9CA3AF",
                      border: "none",
                      boxShadow: canUpgrade ? "0 2px 8px rgba(5,150,105,0.25)" : "none",
                    }}
                  >
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="17 1 21 5 17 9" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    </svg>
                    {canUpgrade ? `→ ${PLAN_META[nextPlan(user.plan)].label}` : "Max plan"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Result count */}
      {filtered.length > 0 && (
        <p className="mt-3 text-xs text-gray-400 text-right" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
          Showing {filtered.length} of {users.length} users
        </p>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg z-50 transition-all duration-300"
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            background: toast.type === "warning" ? "#FEF3C7" : "#D1FAE5",
            color: toast.type === "warning" ? "#B45309" : "#047857",
            border: `1px solid ${toast.type === "warning" ? "rgba(180,83,9,0.25)" : "rgba(5,150,105,0.25)"}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {toast.type === "warning" ? (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

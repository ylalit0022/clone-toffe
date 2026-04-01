import { useState } from "react";

// ─── seed data ───────────────────────────────────────────────────────────────

const SEED_USERS = [
  { id: 1,  email: "arjun.mehta@gmail.com",      plan: "free",  status: "active",   usage: { api: 340,  limit: 500  }, joined: "Jan 12, 2024", lastSeen: "2 hours ago",    location: "Mumbai, IN" },
  { id: 2,  email: "priya.sharma@outlook.com",    plan: "pro",   status: "active",   usage: { api: 1820, limit: 5000 }, joined: "Mar 3, 2024",  lastSeen: "5 mins ago",     location: "Delhi, IN" },
  { id: 3,  email: "lucas.ferreira@proton.me",    plan: "ultra", status: "active",   usage: { api: 8400, limit: 20000}, joined: "Nov 7, 2023",  lastSeen: "Just now",       location: "São Paulo, BR" },
  { id: 4,  email: "nina.walsh@company.io",       plan: "pro",   status: "blocked",  usage: { api: 990,  limit: 5000 }, joined: "Feb 18, 2024", lastSeen: "3 days ago",     location: "Dublin, IE" },
  { id: 5,  email: "dev.patel@startupxyz.com",    plan: "free",  status: "active",   usage: { api: 120,  limit: 500  }, joined: "Apr 1, 2024",  lastSeen: "1 day ago",      location: "Bangalore, IN" },
  { id: 6,  email: "sara.johansson@mail.se",      plan: "ultra", status: "active",   usage: { api: 14200,limit: 20000}, joined: "Sep 22, 2023", lastSeen: "30 mins ago",    location: "Stockholm, SE" },
  { id: 7,  email: "omar.hassan@techcorp.net",    plan: "free",  status: "blocked",  usage: { api: 480,  limit: 500  }, joined: "Jun 14, 2024", lastSeen: "12 days ago",    location: "Cairo, EG" },
  { id: 8,  email: "elena.kovac@design.studio",   plan: "pro",   status: "active",   usage: { api: 3100, limit: 5000 }, joined: "Dec 5, 2023",  lastSeen: "4 hours ago",    location: "Zagreb, HR" },
  { id: 9,  email: "james.obi@freelance.dev",     plan: "free",  status: "active",   usage: { api: 210,  limit: 500  }, joined: "May 28, 2024", lastSeen: "2 days ago",     location: "Lagos, NG" },
  { id: 10, email: "yuki.tanaka@agency.jp",       plan: "ultra", status: "active",   usage: { api: 17800,limit: 20000}, joined: "Oct 1, 2023",  lastSeen: "10 mins ago",    location: "Tokyo, JP" },
  { id: 11, email: "maria.santos@ventures.co",    plan: "pro",   status: "active",   usage: { api: 2450, limit: 5000 }, joined: "Jan 30, 2024", lastSeen: "Yesterday",      location: "Lisbon, PT" },
  { id: 12, email: "felix.bauer@consulting.de",   plan: "free",  status: "blocked",  usage: { api: 500,  limit: 500  }, joined: "Jul 9, 2024",  lastSeen: "20 days ago",    location: "Berlin, DE" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

const PLAN_META = {
  free:  { label: "Free",  bg: "#F3F4F6", color: "#6B7280", border: "rgba(107,114,128,0.2)", apiLimit: "500 calls/mo" },
  pro:   { label: "Pro",   bg: "#DBEAFE", color: "#1D4ED8", border: "rgba(29,78,216,0.2)",   apiLimit: "5,000 calls/mo" },
  ultra: { label: "Ultra", bg: "#D1FAE5", color: "#047857", border: "rgba(5,150,105,0.25)",  apiLimit: "20,000 calls/mo" },
};

const PLAN_ORDER = ["free", "pro", "ultra"];
const PLANS_ALL = [
  { key: "free",  label: "Free",  desc: "500 calls/mo" },
  { key: "pro",   label: "Pro",   desc: "5,000 calls/mo" },
  { key: "ultra", label: "Ultra", desc: "20,000 calls/mo" },
];

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

function avatarColor(id) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

// ─── sub-components ──────────────────────────────────────────────────────────

function PlanBadge({ plan }) {
  const m = PLAN_META[plan];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}`, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.04em" }}
    >
      {plan === "ultra" && <ZapIcon size={10} />}
      {plan === "pro" && <StarIcon size={10} />}
      {m.label}
    </span>
  );
}

function StatusDot({ status }) {
  const active = status === "active";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold"
      style={{ color: active ? "#047857" : "#B91C1C", fontFamily: "'Space Grotesk',sans-serif" }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: active ? "#059669" : "#EF4444", boxShadow: active ? "0 0 0 3px rgba(5,150,105,0.15)" : "0 0 0 3px rgba(239,68,68,0.12)" }} />
      {active ? "Active" : "Blocked"}
    </span>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
      style={{
        fontFamily: "'Space Grotesk',sans-serif",
        background: active ? "linear-gradient(135deg,#059669,#047857)" : "transparent",
        color: active ? "#fff" : "#6B7280",
        border: active ? "none" : "1px solid rgba(17,24,39,0.1)",
        boxShadow: active ? "0 2px 8px rgba(5,150,105,0.25)" : "none",
        letterSpacing: "0.02em",
      }}>{children}</button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ZapIcon = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const StarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CheckIcon = ({ size = 11 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const BlockIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
const ResetIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
  </svg>
);
const MailIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const LocationIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

// ─── Usage Bar ────────────────────────────────────────────────────────────────
function UsageBar({ used, limit }) {
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#059669";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{used.toLocaleString()} / {limit.toLocaleString()} calls</span>
        <span className="text-xs font-bold" style={{ color, fontFamily: "'Space Grotesk',sans-serif" }}>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: pct >= 90 ? "linear-gradient(90deg,#EF4444,#DC2626)" : pct >= 70 ? "linear-gradient(90deg,#F59E0B,#D97706)" : "linear-gradient(90deg,#059669,#047857)" }}
        />
      </div>
    </div>
  );
}

// ─── User Detail Panel ────────────────────────────────────────────────────────
function UserDetailPanel({ user, onClose, onUpdate, onToast }) {
  const [selectedPlan, setSelectedPlan] = useState(user.plan);
  const [confirmReset, setConfirmReset] = useState(false);
  const [planSaving, setPlanSaving] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);

  const [avBg, avColor] = avatarColor(user.id);
  const isBlocked = user.status === "blocked";

  const handleBlock = () => {
    onUpdate(user.id, { status: isBlocked ? "active" : "blocked" });
    onToast(
      isBlocked ? `${user.email.split("@")[0]} unblocked` : `${user.email.split("@")[0]} blocked`,
      isBlocked ? "success" : "warning"
    );
  };

  const handlePlanSave = async () => {
    if (selectedPlan === user.plan) return;
    setPlanSaving(true);
    await new Promise(r => setTimeout(r, 900));
    onUpdate(user.id, { plan: selectedPlan });
    onToast(`Plan updated to ${PLAN_META[selectedPlan].label}`, "success");
    setPlanSaving(false);
    setPlanSaved(true);
    setTimeout(() => setPlanSaved(false), 2000);
  };

  const handleResetUsage = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    onUpdate(user.id, { usage: { api: 0, limit: user.usage.limit } });
    onToast(`Usage reset for ${user.email.split("@")[0]}`, "success");
    setConfirmReset(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(17,24,39,0.25)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-hidden"
        style={{
          width: "min(420px, 100vw)",
          background: "#fff",
          boxShadow: "-8px 0 48px rgba(0,0,0,0.12)",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          animation: "slideIn 0.25s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

        {/* Panel Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(17,24,39,0.08)", background: "#FAFAFA" }}
        >
          <div>
            <h3 className="text-sm font-extrabold text-gray-900" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-0.02em" }}>
              User Details
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Manage plan, access & usage</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">

          {/* Profile Hero */}
          <div className="px-6 py-6" style={{ borderBottom: "1px solid rgba(17,24,39,0.07)" }}>
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold flex-shrink-0"
                style={{ background: avBg, color: avColor, fontFamily: "'Space Grotesk',sans-serif", fontSize: "15px", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}
              >
                {initials(user.email)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user.email.split("@")[0].replace(/[._-]/g, " ")}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 mt-2.5">
                  <PlanBadge plan={user.plan} />
                  <StatusDot status={user.status} />
                </div>
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {[
                { icon: <MailIcon />, label: user.email.split("@")[1] },
                { icon: <LocationIcon />, label: user.location },
                { icon: <CalendarIcon />, label: `Joined ${user.joined}` },
                { icon: <ClockIcon />, label: `Active ${user.lastSeen}` },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl"
                  style={{ background: "#F8FAFB", border: "1px solid rgba(17,24,39,0.07)" }}
                >
                  <span className="text-gray-400 flex-shrink-0">{item.icon}</span>
                  <span className="text-xs text-gray-600 truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Section */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(17,24,39,0.07)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.07em" }}>
                API Usage
              </p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
                {PLAN_META[user.plan].apiLimit}
              </span>
            </div>
            <UsageBar used={user.usage.api} limit={user.usage.limit} />

            {/* Reset Usage */}
            <div className="mt-4">
              {confirmReset ? (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "#FFF7ED", border: "1px solid rgba(217,119,6,0.25)" }}>
                  <p className="text-xs text-amber-700 flex-1">Reset API usage to 0?</p>
                  <button onClick={handleResetUsage} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#D97706,#B45309)" }}>
                    Confirm
                  </button>
                  <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleResetUsage}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid rgba(217,119,6,0.2)", fontFamily: "'Space Grotesk',sans-serif" }}
                >
                  <ResetIcon />
                  Reset Usage Counter
                </button>
              )}
            </div>
          </div>

          {/* Plan Management */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(17,24,39,0.07)" }}>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-3" style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.07em" }}>
              Change Plan
            </p>

            <div className="space-y-2">
              {PLANS_ALL.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setSelectedPlan(p.key)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left"
                  style={{
                    borderColor: selectedPlan === p.key ? "#059669" : "rgba(17,24,39,0.08)",
                    background: selectedPlan === p.key ? "rgba(5,150,105,0.04)" : "#FAFAFA",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: PLAN_META[p.key].bg }}
                    >
                      <span style={{ color: PLAN_META[p.key].color }}>
                        {p.key === "ultra" ? <ZapIcon size={11} /> : p.key === "pro" ? <StarIcon size={11} /> : <span className="text-[10px] font-bold">F</span>}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{p.label}</p>
                      <p className="text-[10px] text-gray-400">{p.desc}</p>
                    </div>
                  </div>
                  {selectedPlan === p.key && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#059669,#047857)" }}>
                      <CheckIcon />
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handlePlanSave}
              disabled={selectedPlan === user.plan || planSaving}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                background: planSaved ? "linear-gradient(135deg,#059669,#047857)" : selectedPlan !== user.plan ? "linear-gradient(135deg,#111827,#1F2937)" : "#E5E7EB",
                color: selectedPlan !== user.plan ? "#fff" : "#9CA3AF",
                boxShadow: selectedPlan !== user.plan ? "0 4px 14px rgba(17,24,39,0.2)" : "none",
              }}
            >
              {planSaving ? (
                <><span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: "#ffffff44", borderTopColor: "#fff" }} />Saving…</>
              ) : planSaved ? (
                <><CheckIcon size={13} />Plan Updated!</>
              ) : (
                `Apply ${PLAN_META[selectedPlan].label} Plan`
              )}
            </button>
          </div>

          {/* Block / Unblock */}
          <div className="px-6 py-5">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-3" style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.07em" }}>
              Access Control
            </p>

            <div
              className="flex items-start gap-3 p-4 rounded-xl mb-3"
              style={{ background: isBlocked ? "#FEE2E2" : "#F8FAFB", border: `1px solid ${isBlocked ? "rgba(239,68,68,0.2)" : "rgba(17,24,39,0.08)"}` }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: isBlocked ? "#FCA5A5" : "#D1FAE5" }}
              >
                {isBlocked
                  ? <BlockIcon />
                  : <svg width="13" height="13" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                }
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: isBlocked ? "#B91C1C" : "#047857" }}>
                  {isBlocked ? "Account Blocked" : "Account Active"}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: isBlocked ? "#EF4444" : "#6B7280" }}>
                  {isBlocked
                    ? "This user cannot log in or access the platform."
                    : "This user has full access to their plan features."}
                </p>
              </div>
            </div>

            <button
              onClick={handleBlock}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                background: isBlocked ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#DC2626,#B91C1C)",
                color: "#fff",
                boxShadow: isBlocked ? "0 4px 14px rgba(5,150,105,0.3)" : "0 4px 14px rgba(220,38,38,0.25)",
              }}
            >
              {isBlocked ? (
                <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Unblock User</>
              ) : (
                <><BlockIcon />Block User</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState(SEED_USERS);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handleUpdate = (id, patch) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u));
    // Keep panel in sync
    setSelectedUser((prev) => prev?.id === id ? { ...prev, ...patch } : prev);
  };

  const handleBlock = (id) => {
    const u = users.find((x) => x.id === id);
    handleUpdate(id, { status: u.status === "blocked" ? "active" : "blocked" });
    showToast(
      u.status === "blocked" ? `${u.email.split("@")[0]} unblocked` : `${u.email.split("@")[0]} blocked`,
      u.status === "blocked" ? "success" : "warning"
    );
  };

  const handleUpgrade = (id) => {
    const u = users.find((x) => x.id === id);
    const next = nextPlan(u.plan);
    if (!next) return;
    handleUpdate(id, { plan: next });
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
    <div className="p-6 lg:p-8" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", maxWidth: "960px", margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 leading-none" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-0.03em" }}>
            Users
          </h2>
          <p className="text-sm text-gray-400 mt-1">Manage accounts, plans and access</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: "#D1FAE5", color: "#047857", border: "1px solid rgba(5,150,105,0.25)", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.04em" }}>
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
          <div key={label} className="rounded-xl px-4 py-3" style={{ background: bg, border: "1px solid rgba(17,24,39,0.06)" }}>
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
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
          style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.1)", minWidth: "180px", maxWidth: "280px" }}>
          <svg width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search email…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
          {["all", "free", "pro", "ultra"].map((p) => (
            <FilterBtn key={p} active={filterPlan === p} onClick={() => setFilterPlan(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </FilterBtn>
          ))}
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
          {["all", "active", "blocked"].map((s) => (
            <FilterBtn key={s} active={filterStatus === s} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </FilterBtn>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
        {/* Header */}
        <div className="grid items-center px-5 py-3"
          style={{ gridTemplateColumns: "2.4fr 1fr 1fr 1fr", background: "#F8FAFB", borderBottom: "1px solid rgba(17,24,39,0.07)" }}>
          {["Email", "Plan", "Status", "Actions"].map((h) => (
            <span key={h} className="text-xs font-bold text-gray-400 uppercase"
              style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.06em" }}>{h}</span>
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
            const isSelected = selectedUser?.id === user.id;
            return (
              <div
                key={user.id}
                className="grid items-center px-5 py-3.5 transition-all duration-150 cursor-pointer"
                style={{
                  gridTemplateColumns: "2.4fr 1fr 1fr 1fr",
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(17,24,39,0.05)" : "none",
                  opacity: isBlocked ? 0.7 : 1,
                  background: isSelected ? "rgba(5,150,105,0.04)" : "transparent",
                  borderLeft: isSelected ? "3px solid #059669" : "3px solid transparent",
                }}
                onClick={() => setSelectedUser(user)}
              >
                {/* Email + avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: avBg, color: avColor, fontFamily: "'Space Grotesk',sans-serif" }}>
                    {initials(user.email)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate block">{user.email}</span>
                    <span className="text-[11px] text-gray-400">{user.location}</span>
                  </div>
                </div>

                <div><PlanBadge plan={user.plan} /></div>
                <div><StatusDot status={user.status} /></div>

                {/* Actions */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleBlock(user.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95"
                    style={{ fontFamily: "'Space Grotesk',sans-serif", background: isBlocked ? "#FEF3C7" : "#FEE2E2", color: isBlocked ? "#B45309" : "#B91C1C", border: `1px solid ${isBlocked ? "rgba(180,83,9,0.2)" : "rgba(185,28,28,0.15)"}` }}>
                    {isBlocked ? <><CheckIcon />Unblock</> : <><BlockIcon />Block</>}
                  </button>
                  <button onClick={() => canUpgrade && handleUpgrade(user.id)} disabled={!canUpgrade}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Space Grotesk',sans-serif", background: canUpgrade ? "linear-gradient(135deg,#059669,#047857)" : "#E5E7EB", color: canUpgrade ? "#fff" : "#9CA3AF", border: "none", boxShadow: canUpgrade ? "0 2px 8px rgba(5,150,105,0.25)" : "none" }}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    </svg>
                    {canUpgrade ? `→ ${PLAN_META[nextPlan(user.plan)].label}` : "Max plan"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <p className="mt-3 text-xs text-gray-400 text-right" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
          Showing {filtered.length} of {users.length} users · Click a row to view details
        </p>
      )}

      {/* Detail Panel */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={handleUpdate}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg z-[60] transition-all duration-300"
          style={{ fontFamily: "'Space Grotesk',sans-serif", background: toast.type === "warning" ? "#FEF3C7" : "#D1FAE5", color: toast.type === "warning" ? "#B45309" : "#047857", border: `1px solid ${toast.type === "warning" ? "rgba(180,83,9,0.25)" : "rgba(5,150,105,0.25)"}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          {toast.type === "warning"
            ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
            : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

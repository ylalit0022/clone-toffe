import { useState } from "react";

// ─── seed data ────────────────────────────────────────────────────────────────

const SEED_USERS = [
  { id: 1,  name: "Arjun Mehta",     email: "arjun.mehta@gmail.com",    plan: "free",  status: "active",  usage: { api: 340,   limit: 500   }, joined: "Jan 12, 2024", lastSeen: "2 hours ago",  location: "Mumbai, IN"    },
  { id: 2,  name: "Priya Sharma",    email: "priya.sharma@outlook.com",  plan: "pro",   status: "active",  usage: { api: 1820,  limit: 5000  }, joined: "Mar 3, 2024",  lastSeen: "5 mins ago",   location: "Delhi, IN"     },
  { id: 3,  name: "Lucas Ferreira",  email: "lucas.ferreira@proton.me",  plan: "ultra", status: "active",  usage: { api: 8400,  limit: 20000 }, joined: "Nov 7, 2023",  lastSeen: "Just now",     location: "São Paulo, BR" },
  { id: 4,  name: "Nina Walsh",      email: "nina.walsh@company.io",     plan: "pro",   status: "blocked", usage: { api: 990,   limit: 5000  }, joined: "Feb 18, 2024", lastSeen: "3 days ago",   location: "Dublin, IE"    },
  { id: 5,  name: "Dev Patel",       email: "dev.patel@startupxyz.com",  plan: "free",  status: "active",  usage: { api: 120,   limit: 500   }, joined: "Apr 1, 2024",  lastSeen: "1 day ago",    location: "Bangalore, IN" },
  { id: 6,  name: "Sara Johansson",  email: "sara.johansson@mail.se",    plan: "ultra", status: "active",  usage: { api: 14200, limit: 20000 }, joined: "Sep 22, 2023", lastSeen: "30 mins ago",  location: "Stockholm, SE" },
  { id: 7,  name: "Omar Hassan",     email: "omar.hassan@techcorp.net",  plan: "free",  status: "blocked", usage: { api: 480,   limit: 500   }, joined: "Jun 14, 2024", lastSeen: "12 days ago",  location: "Cairo, EG"     },
  { id: 8,  name: "Elena Kovac",     email: "elena.kovac@design.studio", plan: "pro",   status: "active",  usage: { api: 3100,  limit: 5000  }, joined: "Dec 5, 2023",  lastSeen: "4 hours ago",  location: "Zagreb, HR"    },
  { id: 9,  name: "James Obi",       email: "james.obi@freelance.dev",   plan: "free",  status: "active",  usage: { api: 210,   limit: 500   }, joined: "May 28, 2024", lastSeen: "2 days ago",   location: "Lagos, NG"     },
  { id: 10, name: "Yuki Tanaka",     email: "yuki.tanaka@agency.jp",     plan: "ultra", status: "active",  usage: { api: 17800, limit: 20000 }, joined: "Oct 1, 2023",  lastSeen: "10 mins ago",  location: "Tokyo, JP"     },
  { id: 11, name: "Maria Santos",    email: "maria.santos@ventures.co",  plan: "pro",   status: "active",  usage: { api: 2450,  limit: 5000  }, joined: "Jan 30, 2024", lastSeen: "Yesterday",    location: "Lisbon, PT"    },
  { id: 12, name: "Felix Bauer",     email: "felix.bauer@consulting.de", plan: "free",  status: "blocked", usage: { api: 500,   limit: 500   }, joined: "Jul 9, 2024",  lastSeen: "20 days ago",  location: "Berlin, DE"    },
];

// ─── constants / helpers ──────────────────────────────────────────────────────

const PLAN_META = {
  free:  { label: "Free",  bg: "#F3F4F6", color: "#6B7280", border: "rgba(107,114,128,0.2)", apiLimit: "500 calls/mo"    },
  pro:   { label: "Pro",   bg: "#DBEAFE", color: "#1D4ED8", border: "rgba(29,78,216,0.2)",   apiLimit: "5,000 calls/mo"  },
  ultra: { label: "Ultra", bg: "#D1FAE5", color: "#047857", border: "rgba(5,150,105,0.25)",  apiLimit: "20,000 calls/mo" },
};
const PLAN_ORDER = ["free", "pro", "ultra"];
const PLANS_ALL  = [
  { key: "free",  label: "Free",  desc: "500 calls/mo"    },
  { key: "pro",   label: "Pro",   desc: "5,000 calls/mo"  },
  { key: "ultra", label: "Ultra", desc: "20,000 calls/mo" },
];

function nextPlan(plan) {
  const idx = PLAN_ORDER.indexOf(plan);
  return idx < PLAN_ORDER.length - 1 ? PLAN_ORDER[idx + 1] : null;
}
function initials(name = "", email = "") {
  const src = name.trim() || email.split("@")[0].replace(/[._-]/g, " ");
  const parts = src.split(" ").filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : src.slice(0, 2).toUpperCase();
}
const AVATAR_COLORS = [
  ["#DBEAFE","#1D4ED8"],["#D1FAE5","#047857"],["#EDE9FE","#6D28D9"],
  ["#FEF3C7","#B45309"],["#FCE7F3","#9D174D"],["#CFFAFE","#0E7490"],
];
function avatarColor(id) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function tsNow() {
  return new Date().toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}
function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validatePassword(v) {
  if (!v) return null;
  if (v.length < 8)       return "Min 8 characters required";
  if (!/[A-Z]/.test(v))   return "Add at least one uppercase letter";
  if (!/[0-9]/.test(v))   return "Add at least one number";
  return null;
}
function passwordStrength(v) {
  if (!v) return 0;
  let s = 0;
  if (v.length >= 8)           s++;
  if (/[A-Z]/.test(v))         s++;
  if (/[0-9]/.test(v))         s++;
  if (/[^A-Za-z0-9]/.test(v))  s++;
  return s;
}
function auditMeta(type) {
  return {
    name_changed:   { icon:"✏️", color:"#6D28D9", bg:"#EDE9FE", label:"Name changed"    },
    email_changed:  { icon:"📧", color:"#0E7490", bg:"#CFFAFE", label:"Email changed"    },
    password_reset: { icon:"🔐", color:"#B45309", bg:"#FEF3C7", label:"Password reset"   },
    plan_changed:   { icon:"⬆️", color:"#1D4ED8", bg:"#DBEAFE", label:"Plan changed"     },
    status_changed: { icon:"🔒", color:"#B91C1C", bg:"#FEE2E2", label:"Status changed"   },
    usage_reset:    { icon:"🔄", color:"#047857", bg:"#D1FAE5", label:"Usage reset"      },
  }[type] || { icon:"📝", color:"#6B7280", bg:"#F3F4F6", label:"Action" };
}

// ─── icons ────────────────────────────────────────────────────────────────────
const I = {
  Zap:      ({ s=14 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Star:     ({ s=14 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Close:    ()         => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:    ({ s=11 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  Block:    ({ s=13 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Reset:    ({ s=13 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>,
  Edit:     ({ s=13 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Lock:     ({ s=13 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Eye:      ({ open }) => open
    ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Mail:     ({ s=13 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Location: ({ s=13 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Calendar: ({ s=13 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock:    ({ s=13 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Shield:   ({ s=13 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

// ─── shared UI pieces ─────────────────────────────────────────────────────────

function PlanBadge({ plan }) {
  const m = PLAN_META[plan];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background:m.bg, color:m.color, border:`1px solid ${m.border}`, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:"0.04em" }}>
      {plan==="ultra" && <I.Zap s={10}/>}
      {plan==="pro"   && <I.Star s={10}/>}
      {m.label}
    </span>
  );
}

function StatusDot({ status }) {
  const active = status === "active";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold"
      style={{ color: active ? "#047857" : "#B91C1C", fontFamily:"'Space Grotesk',sans-serif" }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: active ? "#059669" : "#EF4444", boxShadow: active ? "0 0 0 3px rgba(5,150,105,0.15)" : "0 0 0 3px rgba(239,68,68,0.12)" }}/>
      {active ? "Active" : "Blocked"}
    </span>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
      style={{ fontFamily:"'Space Grotesk',sans-serif", background: active ? "linear-gradient(135deg,#059669,#047857)" : "transparent", color: active ? "#fff" : "#6B7280", border: active ? "none" : "1px solid rgba(17,24,39,0.1)", boxShadow: active ? "0 2px 8px rgba(5,150,105,0.25)" : "none", letterSpacing:"0.02em" }}>
      {children}
    </button>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-150"
      style={{ fontFamily:"'Space Grotesk',sans-serif", background: active ? "#fff" : "transparent", color: active ? "#059669" : "#9CA3AF", boxShadow: active ? "0 1px 6px rgba(0,0,0,0.08)" : "none" }}>
      {children}
    </button>
  );
}

function FieldInput({ label, error, hint, children }) {
  return (
    <div className="space-y-1">
      {label && <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{label}</label>}
      {children}
      {error && <p className="text-[11px] text-red-400">⚠ {error}</p>}
      {hint  && !error && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

const INPUT_STYLE = (err) => ({
  background:"#F8FAFB",
  border:`1.5px solid ${err ? "#FCA5A5" : "rgba(17,24,39,0.1)"}`,
  fontFamily:"'Plus Jakarta Sans',sans-serif",
  color:"#111827",
});
function onFocusInput(e) { e.target.style.border="1.5px solid #059669"; e.target.style.boxShadow="0 0 0 3px rgba(5,150,105,0.1)"; }
function onBlurInput(err) { return e => { e.target.style.border=`1.5px solid ${err ? "#FCA5A5" : "rgba(17,24,39,0.1)"}`; e.target.style.boxShadow="none"; }; }

function StrengthBar({ value }) {
  const s = passwordStrength(value);
  const C = ["#E5E7EB","#EF4444","#F59E0B","#3B82F6","#059669"];
  const L = ["","Weak","Fair","Good","Strong"];
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: i<=s ? C[s] : "#E5E7EB" }}/>)}
      </div>
      {value && <p className="text-[10px] font-semibold" style={{ color:C[s] }}>{L[s]}</p>}
    </div>
  );
}

function UsageBar({ used, limit }) {
  const pct = Math.min((used/limit)*100, 100);
  const col = pct>=90 ? "#EF4444" : pct>=70 ? "#F59E0B" : "#059669";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{used.toLocaleString()} / {limit.toLocaleString()} calls</span>
        <span className="text-xs font-bold" style={{ color:col, fontFamily:"'Space Grotesk',sans-serif" }}>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background:"#F3F4F6" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width:`${pct}%`, background: pct>=90 ? "linear-gradient(90deg,#EF4444,#DC2626)" : pct>=70 ? "linear-gradient(90deg,#F59E0B,#D97706)" : "linear-gradient(90deg,#059669,#047857)" }}/>
      </div>
    </div>
  );
}

function SaveBtn({ saving, saved, disabled, onClick, idleLabel }) {
  return (
    <button onClick={onClick} disabled={disabled || saving}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      style={{ fontFamily:"'Space Grotesk',sans-serif", background: saved ? "linear-gradient(135deg,#059669,#047857)" : !disabled ? "linear-gradient(135deg,#111827,#1F2937)" : "#E5E7EB", color: !disabled ? "#fff" : "#9CA3AF", boxShadow: !disabled && !saved ? "0 4px 14px rgba(17,24,39,0.2)" : saved ? "0 4px 14px rgba(5,150,105,0.3)" : "none" }}>
      {saving ? <><span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor:"#ffffff44", borderTopColor:"#fff" }}/>Saving…</> : saved ? <><I.Check s={13}/>Saved!</> : idleLabel}
    </button>
  );
}

// ─── Tab 1 – Edit Info ────────────────────────────────────────────────────────

function EditInfoTab({ user, onSave, onToast }) {
  const [name,    setName]    = useState(user.name  || "");
  const [email,   setEmail]   = useState(user.email || "");
  const [location,setLocation]= useState(user.location || "");
  const [errs,    setErrs]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const dirty = name !== user.name || email !== user.email || location !== (user.location || "");

  const validate = () => {
    const e = {};
    if (!name.trim())          e.name  = "Name cannot be empty";
    if (!validateEmail(email)) e.email = "Enter a valid email address";
    setErrs(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const changes = [];
    if (name     !== user.name)     changes.push({ type:"name_changed",  detail:`"${user.name}" → "${name}"` });
    if (email    !== user.email)    changes.push({ type:"email_changed", detail:`${user.email} → ${email}` });
    onSave({ name, email, location }, changes);
    onToast("User details updated", "success");
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const field = (label, val, set, key, type="text", icon=null) => (
    <FieldInput label={label} error={errs[key]}>
      <div className="relative">
        <input type={type} value={val}
          onChange={e => { set(e.target.value); setErrs(p => ({ ...p, [key]:"" })); }}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
          style={{ ...INPUT_STYLE(errs[key]), paddingRight: icon ? "2rem" : undefined }}
          onFocus={onFocusInput} onBlur={onBlurInput(errs[key])}
        />
        {icon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">{icon}</span>}
      </div>
      {errs[key] && <p className="text-[11px] text-red-400 mt-1">⚠ {errs[key]}</p>}
    </FieldInput>
  );

  return (
    <div className="space-y-4">
      {field("Full Name",      name,     setName,     "name")}
      {field("Email Address",  email,    setEmail,    "email", "email", <I.Mail s={13}/>)}
      {field("Location",       location, setLocation, "location", "text", <I.Location s={13}/>)}

      <div className="p-3 rounded-xl flex items-start gap-2" style={{ background:"#F0FDF4", border:"1px solid rgba(5,150,105,0.15)" }}>
        <span className="text-emerald-500 mt-0.5"><I.Shield s={13}/></span>
        <p className="text-[11px] text-emerald-700">Every change is recorded in the audit trail and attributed to this admin session.</p>
      </div>

      <SaveBtn saving={saving} saved={saved} disabled={!dirty} onClick={handleSave}
        idleLabel={<><I.Edit s={13}/>Save Changes</>}/>
    </div>
  );
}

// ─── Tab 2 – Password Reset ───────────────────────────────────────────────────

function PasswordTab({ user, onLog, onToast }) {
  const [newPwd,    setNewPwd]     = useState("");
  const [confirmPwd,setConfirmPwd] = useState("");
  const [showNew,   setShowNew]    = useState(false);
  const [showConf,  setShowConf]   = useState(false);
  const [errs,      setErrs]       = useState({});
  const [saving,    setSaving]     = useState(false);
  const [saved,     setSaved]      = useState(false);

  const handleReset = async () => {
    const e = {};
    const pErr = validatePassword(newPwd);
    if (!newPwd)               e.newPwd = "Enter a new password";
    else if (pErr)             e.newPwd = pErr;
    if (newPwd !== confirmPwd) e.confirmPwd = "Passwords do not match";
    setErrs(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    onLog([{ type:"password_reset", detail:"Admin-initiated password reset" }]);
    onToast(`Password reset for ${user.name}`, "success");
    setSaving(false); setSaved(true);
    setNewPwd(""); setConfirmPwd("");
    setTimeout(() => setSaved(false), 2500);
  };

  const pwdInput = (label, val, set, key, show, setShow) => (
    <FieldInput label={label} error={errs[key]}>
      <div className="relative">
        <input type={show ? "text" : "password"} value={val}
          onChange={e => { set(e.target.value); setErrs(p => ({ ...p, [key]:"" })); }}
          placeholder={key==="newPwd" ? "Min 8 chars, 1 uppercase, 1 number" : "Re-enter new password"}
          className="w-full px-3 py-2 pr-9 rounded-xl text-sm outline-none transition-all"
          style={INPUT_STYLE(errs[key])}
          onFocus={onFocusInput} onBlur={onBlurInput(errs[key])}
        />
        <button onClick={() => setShow(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><I.Eye open={show}/></button>
      </div>
      {errs[key] && <p className="text-[11px] text-red-400 mt-1">⚠ {errs[key]}</p>}
    </FieldInput>
  );

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl flex items-start gap-2" style={{ background:"#FFF7ED", border:"1px solid rgba(217,119,6,0.25)" }}>
        <span className="text-amber-500 mt-0.5 flex-shrink-0"><I.Lock s={13}/></span>
        <p className="text-[11px] text-amber-700">You are setting a password on behalf of <strong>{user.name}</strong>. Inform them of the new credentials — they will need it on next login.</p>
      </div>

      {pwdInput("New Password",     newPwd,     setNewPwd,     "newPwd",     showNew,  setShowNew)}
      {newPwd && <StrengthBar value={newPwd}/>}
      {pwdInput("Confirm Password", confirmPwd, setConfirmPwd, "confirmPwd", showConf, setShowConf)}

      <button onClick={handleReset} disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98]"
        style={{ fontFamily:"'Space Grotesk',sans-serif", background: saved ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#7C3AED,#6D28D9)", color:"#fff", boxShadow: saved ? "0 4px 14px rgba(5,150,105,0.3)" : "0 4px 14px rgba(109,40,217,0.3)" }}>
        {saving ? <><span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor:"#ffffff44", borderTopColor:"#fff" }}/>Resetting…</> : saved ? <><I.Check s={13}/>Password Reset!</> : <><I.Lock s={13}/>Reset Password</>}
      </button>
    </div>
  );
}

// ─── Tab 3 – Manage (Plan + Usage + Block) ────────────────────────────────────

function ManageTab({ user, onUpdate, onLog, onToast }) {
  const [selectedPlan, setSelectedPlan] = useState(user.plan);
  const [planSaving,   setPlanSaving]   = useState(false);
  const [planSaved,    setPlanSaved]    = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const isBlocked = user.status === "blocked";

  const handlePlanSave = async () => {
    if (selectedPlan === user.plan) return;
    setPlanSaving(true);
    await new Promise(r => setTimeout(r, 900));
    onUpdate(user.id, { plan: selectedPlan });
    onLog([{ type:"plan_changed", detail:`${PLAN_META[user.plan].label} → ${PLAN_META[selectedPlan].label}` }]);
    onToast(`Plan updated to ${PLAN_META[selectedPlan].label}`, "success");
    setPlanSaving(false); setPlanSaved(true);
    setTimeout(() => setPlanSaved(false), 2000);
  };

  const handleBlock = () => {
    const ns = isBlocked ? "active" : "blocked";
    onUpdate(user.id, { status: ns });
    onLog([{ type:"status_changed", detail:`Status set to "${ns}"` }]);
    onToast(isBlocked ? `${user.name} unblocked` : `${user.name} blocked`, isBlocked ? "success" : "warning");
  };

  const handleUsageReset = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    onUpdate(user.id, { usage: { api:0, limit: user.usage.limit } });
    onLog([{ type:"usage_reset", detail:`Reset from ${user.usage.api.toLocaleString()} → 0` }]);
    onToast(`Usage reset for ${user.name}`, "success");
    setConfirmReset(false);
  };

  return (
    <div className="space-y-5">
      {/* Usage */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>API Usage</p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background:"#F3F4F6", color:"#9CA3AF" }}>{PLAN_META[user.plan].apiLimit}</span>
        </div>
        <UsageBar used={user.usage.api} limit={user.usage.limit}/>
        <div className="mt-2">
          {confirmReset ? (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background:"#FFF7ED", border:"1px solid rgba(217,119,6,0.25)" }}>
              <p className="text-xs text-amber-700 flex-1">Reset API calls to 0?</p>
              <button onClick={handleUsageReset} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background:"linear-gradient(135deg,#D97706,#B45309)" }}>Confirm</button>
              <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100">Cancel</button>
            </div>
          ) : (
            <button onClick={handleUsageReset}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all"
              style={{ background:"#FEF3C7", color:"#B45309", border:"1px solid rgba(217,119,6,0.2)", fontFamily:"'Space Grotesk',sans-serif" }}>
              <I.Reset s={13}/>Reset Usage Counter
            </button>
          )}
        </div>
      </div>

      <div style={{ borderTop:"1px solid rgba(17,24,39,0.07)" }}/>

      {/* Plan selector */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Change Plan</p>
        <div className="space-y-2">
          {PLANS_ALL.map(p => (
            <button key={p.key} onClick={() => setSelectedPlan(p.key)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left"
              style={{ borderColor: selectedPlan===p.key ? "#059669" : "rgba(17,24,39,0.08)", background: selectedPlan===p.key ? "rgba(5,150,105,0.04)" : "#FAFAFA" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background:PLAN_META[p.key].bg }}>
                  <span style={{ color:PLAN_META[p.key].color }}>
                    {p.key==="ultra" ? <I.Zap s={11}/> : p.key==="pro" ? <I.Star s={11}/> : <span className="text-[10px] font-bold">F</span>}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{p.label}</p>
                  <p className="text-[10px] text-gray-400">{p.desc}</p>
                </div>
              </div>
              {selectedPlan===p.key && <span className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background:"linear-gradient(135deg,#059669,#047857)" }}><I.Check/></span>}
            </button>
          ))}
        </div>
        <button onClick={handlePlanSave} disabled={selectedPlan===user.plan||planSaving}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{ fontFamily:"'Space Grotesk',sans-serif", background: planSaved ? "linear-gradient(135deg,#059669,#047857)" : selectedPlan!==user.plan ? "linear-gradient(135deg,#111827,#1F2937)" : "#E5E7EB", color: selectedPlan!==user.plan ? "#fff" : "#9CA3AF", boxShadow: selectedPlan!==user.plan ? "0 4px 14px rgba(17,24,39,0.2)" : "none" }}>
          {planSaving ? <><span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor:"#ffffff44", borderTopColor:"#fff" }}/>Saving…</> : planSaved ? <><I.Check s={13}/>Updated!</> : `Apply ${PLAN_META[selectedPlan].label} Plan`}
        </button>
      </div>

      <div style={{ borderTop:"1px solid rgba(17,24,39,0.07)" }}/>

      {/* Access control */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Access Control</p>
        <div className="flex items-start gap-3 p-3 rounded-xl mb-2"
          style={{ background: isBlocked ? "#FEE2E2" : "#F8FAFB", border:`1px solid ${isBlocked ? "rgba(239,68,68,0.2)" : "rgba(17,24,39,0.08)"}` }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isBlocked ? "#FCA5A5" : "#D1FAE5" }}>
            {isBlocked ? <I.Block s={12}/> : <svg width="12" height="12" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: isBlocked ? "#B91C1C" : "#047857" }}>{isBlocked ? "Account Blocked" : "Account Active"}</p>
            <p className="text-[11px] mt-0.5" style={{ color: isBlocked ? "#EF4444" : "#6B7280" }}>
              {isBlocked ? "User cannot log in or access the platform." : "User has full access to plan features."}
            </p>
          </div>
        </div>
        <button onClick={handleBlock}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ fontFamily:"'Space Grotesk',sans-serif", background: isBlocked ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#DC2626,#B91C1C)", color:"#fff", boxShadow: isBlocked ? "0 4px 14px rgba(5,150,105,0.3)" : "0 4px 14px rgba(220,38,38,0.25)" }}>
          {isBlocked ? <><I.Check s={13}/>Unblock User</> : <><I.Block s={13}/>Block User</>}
        </button>
      </div>
    </div>
  );
}

// ─── Tab 4 – Audit Log ────────────────────────────────────────────────────────

function AuditTab({ logs }) {
  if (!logs.length) return (
    <div className="py-14 text-center">
      <p className="text-3xl mb-2">🗂️</p>
      <p className="text-sm font-semibold text-gray-400">No changes recorded yet</p>
      <p className="text-xs text-gray-300 mt-1">All admin actions on this user will appear here</p>
    </div>
  );
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{logs.length} action{logs.length!==1?"s":""} recorded</p>
      {[...logs].reverse().map((entry, i) => {
        const m = auditMeta(entry.type);
        return (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background:"#FAFAFA", border:"1px solid rgba(17,24,39,0.06)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background:m.bg }}>{m.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-700" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{m.label}</p>
              <p className="text-[11px] text-gray-400 break-all mt-0.5">{entry.detail}</p>
              <p className="text-[10px] text-gray-300 mt-1 flex items-center gap-1"><I.Clock s={10}/>{entry.ts}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background:m.bg, color:m.color }}>Admin</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── User Detail Panel ────────────────────────────────────────────────────────

function UserDetailPanel({ user, auditLog, onClose, onUpdate, onLog, onToast }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [avBg, avColor] = avatarColor(user.id);

  return (
    <>
      <div className="fixed inset-0 z-40"
        style={{ background:"rgba(17,24,39,0.25)", backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)" }}
        onClick={onClose}/>

      <div className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-hidden"
        style={{ width:"min(440px,100vw)", background:"#fff", boxShadow:"-8px 0 48px rgba(0,0,0,0.12)", fontFamily:"'Plus Jakarta Sans',sans-serif", animation:"panelIn 0.25s cubic-bezier(0.22,1,0.36,1)" }}>
        <style>{`@keyframes panelIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom:"1px solid rgba(17,24,39,0.08)", background:"#FAFAFA" }}>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900" style={{ fontFamily:"'Bricolage Grotesque',sans-serif", letterSpacing:"-0.02em" }}>User Management</h3>
            <p className="text-xs text-gray-400 mt-0.5">Admin override · all actions are logged</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><I.Close/></button>
        </div>

        {/* Profile strip */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom:"1px solid rgba(17,24,39,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
              style={{ background:avBg, color:avColor, fontFamily:"'Space Grotesk',sans-serif", fontSize:"13px", boxShadow:"0 3px 10px rgba(0,0,0,0.08)" }}>
              {initials(user.name, user.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <PlanBadge plan={user.plan}/>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
            <StatusDot status={user.status}/>
            <span className="text-[11px] text-gray-400 flex items-center gap-1"><I.Calendar s={11}/>Joined {user.joined}</span>
            <span className="text-[11px] text-gray-400 flex items-center gap-1"><I.Location s={11}/>{user.location}</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="px-4 py-2 flex-shrink-0" style={{ borderBottom:"1px solid rgba(17,24,39,0.07)", background:"#F8FAFB" }}>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background:"#F3F4F6" }}>
            <TabBtn active={activeTab==="edit"}     onClick={() => setActiveTab("edit")}>✏️ Edit Info</TabBtn>
            <TabBtn active={activeTab==="password"} onClick={() => setActiveTab("password")}>🔐 Password</TabBtn>
            <TabBtn active={activeTab==="manage"}   onClick={() => setActiveTab("manage")}>⚙️ Manage</TabBtn>
            <TabBtn active={activeTab==="log"}      onClick={() => setActiveTab("log")}>
              🗂️ Log{auditLog.length>0 && <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-bold" style={{ background:"#059669" }}>{auditLog.length>9?"9+":auditLog.length}</span>}
            </TabBtn>
          </div>
        </div>

        {/* Tab body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {activeTab==="edit"     && <EditInfoTab  user={user} onSave={(patch,changes) => { onUpdate(user.id,patch); onLog(changes); }} onToast={onToast}/>}
          {activeTab==="password" && <PasswordTab  user={user} onLog={onLog} onToast={onToast}/>}
          {activeTab==="manage"   && <ManageTab    user={user} onUpdate={onUpdate} onLog={onLog} onToast={onToast}/>}
          {activeTab==="log"      && <AuditTab     logs={auditLog}/>}
        </div>
      </div>
    </>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users,        setUsers]        = useState(SEED_USERS);
  const [search,       setSearch]       = useState("");
  const [filterPlan,   setFilterPlan]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast,        setToast]        = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [auditLogs,    setAuditLogs]    = useState({});   // { userId: [{type,detail,ts}] }

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); };

  const handleUpdate = (id, patch) => {
    setUsers(prev => prev.map(u => u.id===id ? { ...u, ...patch } : u));
    setSelectedUser(prev => prev?.id===id ? { ...prev, ...patch } : prev);
  };

  const handleLog = (userId, entries) => {
    const ts = tsNow();
    setAuditLogs(prev => ({ ...prev, [userId]: [...(prev[userId]||[]), ...entries.map(e => ({ ...e, ts }))] }));
  };

  const handleQuickBlock = (id) => {
    const u = users.find(x => x.id===id);
    const ns = u.status==="blocked" ? "active" : "blocked";
    handleUpdate(id, { status:ns });
    handleLog(id, [{ type:"status_changed", detail:`Status set to "${ns}"` }]);
    showToast(ns==="active" ? `${u.name} unblocked` : `${u.name} blocked`, ns==="active" ? "success" : "warning");
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
      && (filterPlan==="all"   || u.plan===filterPlan)
      && (filterStatus==="all" || u.status===filterStatus);
  });

  const stats = {
    total:   users.length,
    active:  users.filter(u => u.status==="active").length,
    blocked: users.filter(u => u.status==="blocked").length,
    ultra:   users.filter(u => u.plan==="ultra").length,
  };

  return (
    <div className="p-6 lg:p-8" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", maxWidth:"960px", margin:"0 auto" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 leading-none" style={{ fontFamily:"'Bricolage Grotesque',sans-serif", letterSpacing:"-0.03em" }}>Users</h2>
          <p className="text-sm text-gray-400 mt-1">Manage accounts, credentials, plans and access</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background:"#D1FAE5", color:"#047857", border:"1px solid rgba(5,150,105,0.25)", fontFamily:"'Space Grotesk',sans-serif", letterSpacing:"0.04em" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background:"#059669" }}/>{stats.total} USERS
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label:"Total",   value:stats.total,   bg:"#F8FAFB", color:"#374151" },
          { label:"Active",  value:stats.active,  bg:"#D1FAE5", color:"#047857" },
          { label:"Blocked", value:stats.blocked, bg:"#FEE2E2", color:"#B91C1C" },
          { label:"Ultra",   value:stats.ultra,   bg:"#DBEAFE", color:"#1D4ED8" },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className="rounded-xl px-4 py-3" style={{ background:bg, border:"1px solid rgba(17,24,39,0.06)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:"0.04em", opacity:0.8 }}>{label.toUpperCase()}</p>
            <p className="text-2xl font-extrabold" style={{ color, fontFamily:"'Bricolage Grotesque',sans-serif", letterSpacing:"-0.03em" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
          style={{ background:"#fff", border:"1px solid rgba(17,24,39,0.1)", minWidth:"180px", maxWidth:"280px" }}>
          <svg width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
            style={{ fontFamily:"'Plus Jakarta Sans',sans-serif" }}/>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background:"#F3F4F6" }}>
          {["all","free","pro","ultra"].map(p => <FilterBtn key={p} active={filterPlan===p} onClick={() => setFilterPlan(p)}>{p.charAt(0).toUpperCase()+p.slice(1)}</FilterBtn>)}
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background:"#F3F4F6" }}>
          {["all","active","blocked"].map(s => <FilterBtn key={s} active={filterStatus===s} onClick={() => setFilterStatus(s)}>{s.charAt(0).toUpperCase()+s.slice(1)}</FilterBtn>)}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"#fff", border:"1px solid rgba(17,24,39,0.07)", boxShadow:"0 1px 12px rgba(0,0,0,0.04)" }}>
        <div className="grid items-center px-5 py-3"
          style={{ gridTemplateColumns:"2.6fr 1fr 1fr 1.1fr", background:"#F8FAFB", borderBottom:"1px solid rgba(17,24,39,0.07)" }}>
          {["User","Plan","Status","Actions"].map(h => (
            <span key={h} className="text-xs font-bold text-gray-400 uppercase" style={{ fontFamily:"'Space Grotesk',sans-serif", letterSpacing:"0.06em" }}>{h}</span>
          ))}
        </div>

        {filtered.length===0 ? (
          <div className="py-16 text-center">
            <svg className="mx-auto mb-3 text-gray-300" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <p className="text-sm font-semibold text-gray-400">No users match your filters</p>
          </div>
        ) : (
          filtered.map((user, i) => {
            const [avBg, avColor] = avatarColor(user.id);
            const isBlocked  = user.status==="blocked";
            const isSelected = selectedUser?.id===user.id;
            const logCount   = (auditLogs[user.id]||[]).length;
            return (
              <div key={user.id}
                className="grid items-center px-5 py-3.5 transition-all duration-150 cursor-pointer"
                style={{ gridTemplateColumns:"2.6fr 1fr 1fr 1.1fr", borderBottom: i<filtered.length-1 ? "1px solid rgba(17,24,39,0.05)" : "none", opacity: isBlocked ? 0.75 : 1, background: isSelected ? "rgba(5,150,105,0.04)" : "transparent", borderLeft: isSelected ? "3px solid #059669" : "3px solid transparent" }}
                onClick={() => setSelectedUser(user)}>

                {/* User cell */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ background:avBg, color:avColor, fontFamily:"'Space Grotesk',sans-serif" }}>
                      {initials(user.name, user.email)}
                    </div>
                    {logCount>0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background:"#059669" }}>
                        {logCount>9 ? "9+" : logCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate block">{user.name}</span>
                    <span className="text-[11px] text-gray-400 truncate block">{user.email}</span>
                  </div>
                </div>

                <div><PlanBadge plan={user.plan}/></div>
                <div><StatusDot status={user.status}/></div>

                {/* Actions */}
                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleQuickBlock(user.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                    style={{ fontFamily:"'Space Grotesk',sans-serif", background: isBlocked ? "#FEF3C7" : "#FEE2E2", color: isBlocked ? "#B45309" : "#B91C1C", border:`1px solid ${isBlocked ? "rgba(180,83,9,0.2)" : "rgba(185,28,28,0.15)"}` }}>
                    {isBlocked ? <><I.Check/>Unblock</> : <><I.Block s={11}/>Block</>}
                  </button>
                  <button onClick={() => setSelectedUser(user)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                    style={{ fontFamily:"'Space Grotesk',sans-serif", background:"linear-gradient(135deg,#059669,#047857)", color:"#fff", boxShadow:"0 2px 8px rgba(5,150,105,0.25)" }}>
                    <I.Edit s={11}/>Edit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filtered.length>0 && (
        <p className="mt-3 text-xs text-gray-400 text-right" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
          Showing {filtered.length} of {users.length} users · Click row or Edit to open panel
        </p>
      )}

      {/* Detail panel */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          auditLog={auditLogs[selectedUser.id]||[]}
          onClose={() => setSelectedUser(null)}
          onUpdate={handleUpdate}
          onLog={(entries) => handleLog(selectedUser.id, entries)}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg z-[60]"
          style={{ fontFamily:"'Space Grotesk',sans-serif", background: toast.type==="warning" ? "#FEF3C7" : "#D1FAE5", color: toast.type==="warning" ? "#B45309" : "#047857", border:`1px solid ${toast.type==="warning" ? "rgba(180,83,9,0.25)" : "rgba(5,150,105,0.25)"}`, boxShadow:"0 8px 24px rgba(0,0,0,0.12)" }}>
          {toast.type==="warning"
            ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

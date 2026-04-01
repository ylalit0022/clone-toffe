import { useState } from "react";

// ─── mock data ────────────────────────────────────────────────────────────────
const REFERRAL = {
  id: "REF-2024-00847",
  referrer: { name: "Arjun Mehta",   email: "arjun.mehta@gmail.com",   userId: "USR-10021" },
  referred: { name: "Priya Sharma",  email: "priya.sharma@outlook.com" },
  purchase: {
    plan: "Pro", amount: "₹2,499", paymentId: "pay_OKz9X3mT4QwBNv",
    status: "success", date: "28 Mar 2025, 04:12 PM",
  },
  commission: { type: "percent", rate: "15%", earned: "₹374.85", status: "pending" },
  fraud: { sameIp: false, sameDevice: false, riskLevel: "low" },
  link: { code: "ARJUN15", createdDate: "Jan 12, 2024", expiryStatus: "active" },
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const FONT_BODY    = "'Plus Jakarta Sans', sans-serif";
const FONT_DISPLAY = "'Bricolage Grotesque', sans-serif";
const FONT_MONO    = "'Space Grotesk', sans-serif";

const C = {
  green:    { bg:"#D1FAE5", text:"#047857", border:"rgba(5,150,105,0.25)",  dot:"#059669" },
  amber:    { bg:"#FEF3C7", text:"#B45309", border:"rgba(217,119,6,0.25)",  dot:"#D97706" },
  red:      { bg:"#FEE2E2", text:"#B91C1C", border:"rgba(239,68,68,0.2)",   dot:"#EF4444" },
  blue:     { bg:"#DBEAFE", text:"#1D4ED8", border:"rgba(29,78,216,0.2)",   dot:"#3B82F6" },
  gray:     { bg:"#F3F4F6", text:"#6B7280", border:"rgba(107,114,128,0.2)", dot:"#9CA3AF" },
  purple:   { bg:"#EDE9FE", text:"#6D28D9", border:"rgba(109,40,217,0.2)",  dot:"#7C3AED" },
};

function statusColor(key) {
  return { success:"green", pending:"amber", paid:"green", cancelled:"red", failed:"red",
           active:"green", expired:"red", low:"green", medium:"amber", high:"red" }[key] ?? "gray";
}

// ─── icons ────────────────────────────────────────────────────────────────────
const Ic = {
  User:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Hash:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  Zap:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  CreditCard: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Calendar:() => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Percent: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  Shield:  () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Link:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Check:   ({ s=14 }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  Block:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  AlertTri:() => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  XCircle: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  ArrowLeft: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Copy:    () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Coins:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><line x1="16.71" y1="13.88" x2="13.5" y2="18.02"/></svg>,
  Monitor: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Wifi:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
};

// ─── reusable components ──────────────────────────────────────────────────────

function Badge({ label, colorKey, dot = true }) {
  const col = C[colorKey] || C.gray;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}`, fontFamily: FONT_MONO, letterSpacing: "0.04em" }}>
      {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.dot }}/>}
      {label}
    </span>
  );
}

function Card({ title, icon, children, accentColor, className = "" }) {
  return (
    <div className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: "#fff", border: `1px solid ${accentColor ? accentColor + "33" : "rgba(17,24,39,0.08)"}`, boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid rgba(17,24,39,0.06)", background: accentColor ? `${accentColor}08` : "#FAFAFA" }}>
        {icon && (
          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: accentColor ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` : "linear-gradient(135deg,#059669,#047857)", boxShadow: `0 3px 10px ${accentColor || "#059669"}33` }}>
            {icon}
          </div>
        )}
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500"
          style={{ fontFamily: FONT_MONO, letterSpacing: "0.07em" }}>{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function DataRow({ icon, label, value, mono = false, copiable = false, valueColor }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    navigator.clipboard?.writeText(String(value)).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-start justify-between gap-3 py-2.5"
      style={{ borderBottom: "1px solid rgba(17,24,39,0.05)" }}>
      <div className="flex items-center gap-2 text-gray-400 flex-shrink-0 mt-0.5" style={{ minWidth: "110px" }}>
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ fontFamily: FONT_MONO, letterSpacing: "0.06em" }}>{label}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-1 justify-end">
        <span className={`text-sm font-semibold text-right ${mono ? "font-mono" : ""}`}
          style={{ fontFamily: mono ? FONT_MONO : FONT_BODY, color: valueColor || "#111827", wordBreak: "break-all" }}>
          {value}
        </span>
        {copiable && (
          <button onClick={doCopy}
            className="flex items-center justify-center w-5 h-5 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all flex-shrink-0"
            title="Copy">
            {copied ? <Ic.Check s={10}/> : <Ic.Copy/>}
          </button>
        )}
      </div>
    </div>
  );
}

function YesNoBadge({ value }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: value ? "#FEE2E2" : "#D1FAE5", color: value ? "#B91C1C" : "#047857", fontFamily: FONT_MONO, border: `1px solid ${value ? "rgba(239,68,68,0.2)" : "rgba(5,150,105,0.25)"}` }}>
      {value ? "⚠ Yes" : "✓ No"}
    </span>
  );
}

// ─── action buttons ───────────────────────────────────────────────────────────
function ActionBtn({ icon, label, style = "default", onClick, loading, done }) {
  const styles = {
    green:  { bg: "linear-gradient(135deg,#059669,#047857)", shadow: "rgba(5,150,105,0.3)",  text: "#fff" },
    red:    { bg: "linear-gradient(135deg,#DC2626,#B91C1C)", shadow: "rgba(220,38,38,0.25)", text: "#fff" },
    amber:  { bg: "linear-gradient(135deg,#D97706,#B45309)", shadow: "rgba(217,119,6,0.25)", text: "#fff" },
    ghost:  { bg: "#F3F4F6",                                 shadow: "none",                  text: "#6B7280" },
    default:{ bg: "linear-gradient(135deg,#111827,#1F2937)", shadow: "rgba(17,24,39,0.2)",    text: "#fff" },
  };
  const s = styles[style] || styles.default;
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
      style={{ fontFamily: FONT_MONO, background: done ? "linear-gradient(135deg,#059669,#047857)" : s.bg, color: s.text, boxShadow: s.shadow !== "none" ? `0 4px 14px ${s.shadow}` : "none", minWidth: "130px" }}>
      {loading
        ? <><span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor:"#ffffff44", borderTopColor:"#fff" }}/>Working…</>
        : done
        ? <><Ic.Check s={13}/>Done!</>
        : <>{icon}{label}</>}
    </button>
  );
}

// ─── toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const col = { success: C.green, warning: C.amber, error: C.red }[toast.type] || C.green;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold"
      style={{ fontFamily: FONT_MONO, background: col.bg, color: col.text, border: `1px solid ${col.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", animation: "fadeUp 0.25s ease" }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.dot }}/>
      {toast.msg}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function ReferralDetailPage() {
  const [data, setData] = useState(REFERRAL);
  const [toast, setToast] = useState(null);
  const [busy,  setBusy]  = useState({});
  const [done,  setDone]  = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const runAction = async (key, label, type = "success") => {
    setBusy(p => ({ ...p, [key]: true }));
    await new Promise(r => setTimeout(r, 1200));
    setBusy(p  => ({ ...p, [key]: false }));
    setDone(p  => ({ ...p, [key]: true }));
    showToast(label, type);
    setTimeout(() => setDone(p => ({ ...p, [key]: false })), 2500);
  };

  const { referrer, referred, purchase, commission, fraud, link } = data;
  const riskCol = { low: "green", medium: "amber", high: "red" }[fraud.riskLevel];

  return (
    <div className="min-h-full px-5 lg:px-8 py-7" style={{ fontFamily: FONT_BODY }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .card-in { animation: cardIn 0.35s ease both; }
      `}</style>

      {/* ── page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-7">
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white transition-all"
            style={{ border: "1px solid rgba(17,24,39,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <Ic.ArrowLeft/>
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight"
              style={{ fontFamily: FONT_DISPLAY, letterSpacing: "-0.03em" }}>
              Referral Details
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
              <span className="font-mono font-semibold text-gray-500" style={{ fontFamily: FONT_MONO }}>{data.id}</span>
              <span>·</span>
              <span>{purchase.date}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={`Risk: ${fraud.riskLevel.toUpperCase()}`} colorKey={riskCol}/>
          <Badge label={commission.status.toUpperCase()} colorKey={statusColor(commission.status)}/>
        </div>
      </div>

      {/* ── main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* left: referrer + referred + purchase */}
        <div className="lg:col-span-2 space-y-5">

          {/* SECTION 1 – Referrer */}
          <Card title="Referrer Info" icon={<Ic.User/>} accentColor="#059669" className="card-in" style={{ animationDelay:"0ms" }}>
            <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom:"1px solid rgba(17,24,39,0.06)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background:"linear-gradient(135deg,#D1FAE5,#A7F3D0)", color:"#047857", fontFamily:FONT_MONO, boxShadow:"0 4px 12px rgba(5,150,105,0.15)" }}>
                {referrer.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-900" style={{ fontFamily:FONT_DISPLAY, letterSpacing:"-0.02em" }}>{referrer.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{referrer.email}</p>
              </div>
            </div>
            <DataRow icon={<Ic.Mail/>}  label="Email"   value={referrer.email}  copiable/>
            <DataRow icon={<Ic.Hash/>}  label="User ID" value={referrer.userId} mono copiable/>
          </Card>

          {/* SECTION 2 – Referred User */}
          <Card title="Referred User" icon={<Ic.User/>} accentColor="#1D4ED8" className="card-in" style={{ animationDelay:"40ms" }}>
            <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom:"1px solid rgba(17,24,39,0.06)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background:"linear-gradient(135deg,#DBEAFE,#BFDBFE)", color:"#1D4ED8", fontFamily:FONT_MONO, boxShadow:"0 4px 12px rgba(29,78,216,0.12)" }}>
                {referred.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-900" style={{ fontFamily:FONT_DISPLAY, letterSpacing:"-0.02em" }}>{referred.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{referred.email}</p>
              </div>
            </div>
            <DataRow icon={<Ic.Mail/>} label="Email" value={referred.email} copiable/>
          </Card>

          {/* SECTION 3 – Purchase Details */}
          <Card title="Purchase Details" icon={<Ic.CreditCard/>} accentColor="#6D28D9" className="card-in" style={{ animationDelay:"80ms" }}>
            {/* amount highlight */}
            <div className="flex items-center justify-between mb-4 p-4 rounded-xl"
              style={{ background:"linear-gradient(135deg,rgba(109,40,217,0.06),rgba(109,40,217,0.02))", border:"1px solid rgba(109,40,217,0.12)" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1" style={{ fontFamily:FONT_MONO }}>Amount Paid</p>
                <p className="text-2xl font-extrabold text-gray-900" style={{ fontFamily:FONT_DISPLAY, letterSpacing:"-0.03em" }}>{purchase.amount}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5" style={{ fontFamily:FONT_MONO }}>Status</p>
                <Badge label={purchase.status.toUpperCase()} colorKey={statusColor(purchase.status)}/>
              </div>
            </div>
            <DataRow icon={<Ic.Zap/>}      label="Plan"       value={purchase.plan}/>
            <DataRow icon={<Ic.Hash/>}      label="Payment ID" value={purchase.paymentId} mono copiable/>
            <DataRow icon={<Ic.Calendar/>}  label="Date"       value={purchase.date}/>
          </Card>

          {/* SECTION 5 – Fraud Indicators */}
          <Card title="Fraud Indicators" icon={<Ic.Shield/>} accentColor={fraud.riskLevel==="high" ? "#DC2626" : fraud.riskLevel==="medium" ? "#D97706" : "#059669"} className="card-in" style={{ animationDelay:"160ms" }}>
            {fraud.riskLevel !== "low" && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl mb-4"
                style={{ background: fraud.riskLevel==="high" ? "#FEF2F2" : "#FFFBEB", border:`1px solid ${fraud.riskLevel==="high" ? "rgba(239,68,68,0.2)" : "rgba(217,119,6,0.25)"}` }}>
                <span style={{ color: fraud.riskLevel==="high" ? "#EF4444" : "#D97706" }} className="mt-0.5 flex-shrink-0"><Ic.AlertTri/></span>
                <p className="text-xs font-semibold" style={{ color: fraud.riskLevel==="high" ? "#B91C1C" : "#92400E" }}>
                  {fraud.riskLevel==="high" ? "High fraud risk detected. Immediate review required." : "Moderate risk signals found. Please verify before approving."}
                </p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon:<Ic.Wifi/>,    label:"Same IP",     value:<YesNoBadge value={fraud.sameIp}/> },
                { icon:<Ic.Monitor/>, label:"Same Device", value:<YesNoBadge value={fraud.sameDevice}/> },
                { icon:<Ic.Shield/>,  label:"Risk Level",  value:<Badge label={fraud.riskLevel.toUpperCase()} colorKey={riskCol}/> },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl text-center"
                  style={{ background:"#F8FAFB", border:"1px solid rgba(17,24,39,0.07)" }}>
                  <span className="text-gray-400">{item.icon}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400" style={{ fontFamily:FONT_MONO }}>{item.label}</p>
                  {item.value}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* right column */}
        <div className="space-y-5">

          {/* SECTION 4 – Commission */}
          <Card title="Commission Info" icon={<Ic.Coins/>} accentColor="#D97706" className="card-in" style={{ animationDelay:"120ms" }}>
            {/* big earned amount */}
            <div className="p-4 rounded-xl mb-4 text-center"
              style={{ background:"linear-gradient(135deg,#FEF3C7,#FDE68A22)", border:"1px solid rgba(217,119,6,0.2)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1" style={{ fontFamily:FONT_MONO }}>Commission Earned</p>
              <p className="text-2xl font-extrabold text-gray-900" style={{ fontFamily:FONT_DISPLAY, letterSpacing:"-0.03em" }}>{commission.earned}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge label={`${commission.rate} ${commission.type==="percent" ? "of purchase" : "fixed"}`} colorKey="amber" dot={false}/>
              </div>
            </div>
            <DataRow icon={<Ic.Percent/>} label="Type"   value={commission.type==="percent" ? "Percentage" : "Fixed Amount"}/>
            <DataRow icon={<Ic.Zap/>}     label="Rate"   value={commission.rate} mono/>
            <div className="flex items-center justify-between pt-2.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400" style={{ fontFamily:FONT_MONO }}>Status</span>
              <Badge label={commission.status.toUpperCase()} colorKey={statusColor(commission.status)}/>
            </div>
          </Card>

          {/* SECTION 6 – Referral Link */}
          <Card title="Referral Link Info" icon={<Ic.Link/>} accentColor="#0E7490" className="card-in" style={{ animationDelay:"200ms" }}>
            {/* code highlight */}
            <div className="flex items-center justify-between p-3 rounded-xl mb-4"
              style={{ background:"#F0FDFA", border:"1px solid rgba(14,116,144,0.2)" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-500 mb-0.5" style={{ fontFamily:FONT_MONO }}>Referral Code</p>
                <p className="text-lg font-extrabold tracking-widest text-teal-700" style={{ fontFamily:FONT_MONO, letterSpacing:"0.12em" }}>{link.code}</p>
              </div>
              <button className="w-8 h-8 rounded-xl flex items-center justify-center text-teal-400 hover:text-teal-700 hover:bg-teal-100 transition-all"
                onClick={() => { navigator.clipboard?.writeText(link.code).catch(()=>{}); showToast("Code copied!", "success"); }}>
                <Ic.Copy/>
              </button>
            </div>
            <DataRow icon={<Ic.Calendar/>} label="Created"  value={link.createdDate}/>
            <div className="flex items-center justify-between pt-2.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400" style={{ fontFamily:FONT_MONO }}>Expiry</span>
              <Badge label={link.expiryStatus.toUpperCase()} colorKey={statusColor(link.expiryStatus)}/>
            </div>
          </Card>

          {/* SECTION 7 – Admin Actions */}
          <Card title="Admin Actions" icon={<Ic.Shield/>} accentColor="#374151" className="card-in" style={{ animationDelay:"240ms" }}>
            <div className="space-y-2.5">
              <ActionBtn icon={<Ic.Check s={13}/>} label="Approve Reward"
                style="green" loading={busy.approve} done={done.approve}
                onClick={() => runAction("approve","Reward approved","success")}/>

              <ActionBtn icon={<Ic.Block/>} label="Block Referral"
                style="red" loading={busy.block} done={done.block}
                onClick={() => runAction("block","Referral blocked","warning")}/>

              <ActionBtn icon={<Ic.AlertTri/>} label="Mark as Fraud"
                style="amber" loading={busy.fraud} done={done.fraud}
                onClick={() => runAction("fraud","Marked as fraud","warning")}/>

              <ActionBtn icon={<Ic.XCircle/>} label="Cancel Reward"
                style="ghost" loading={busy.cancel} done={done.cancel}
                onClick={() => runAction("cancel","Reward cancelled","error")}/>
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <Ic.Shield/>
              All actions are logged to audit trail
            </p>
          </Card>
        </div>
      </div>

      <Toast toast={toast}/>
    </div>
  );
}

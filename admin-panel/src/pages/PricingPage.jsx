import { useState, useEffect } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const DS = {
  green: { primary: "#059669", dark: "#047857", light: "#D1FAE5", text: "#065F46" },
  amber: { primary: "#D97706", light: "#FEF3C7", text: "#B45309" },
  blue: { primary: "#3B82F6", dark: "#1D4ED8" },
  gray: {
    50: "#F8FAFB", 100: "#F3F4F6", 200: "#E5E7EB",
    400: "#9CA3AF", 500: "#6B7280", 700: "#374151", 900: "#111827",
  },
  fonts: {
    display: "'Bricolage Grotesque', sans-serif",
    body: "'Plus Jakarta Sans', sans-serif",
    mono: "'Space Grotesk', sans-serif",
  },
};

// ─── Default Plan Data ────────────────────────────────────────────────────────
const DEFAULT_PLANS = [
  {
    id: "free",
    name: "Free",
    icon: "◈",
    monthlyPrice: 0,
    yearlyPrice: 0,
    fileSize: "1 GB",
    speed: "Standard",
    color: "#6B7280",
    accent: "#374151",
    features: ["1 GB storage", "Standard transfer speed", "Basic analytics", "Community support", "1 user"],
    recommended: false,
    enabled: true,
    discount: { enabled: false, percentage: 0 },
    badge: null,
  },
  {
    id: "pro",
    name: "Pro",
    icon: "◆",
    monthlyPrice: 19,
    yearlyPrice: 15,
    fileSize: "50 GB",
    speed: "Fast",
    color: "#3B82F6",
    accent: "#1D4ED8",
    features: ["50 GB storage", "Fast transfer speed", "Advanced analytics", "Priority email support", "5 users", "Custom domain", "API access"],
    recommended: true,
    enabled: true,
    discount: { enabled: true, percentage: 20 },
    badge: "MOST POPULAR",
  },
  {
    id: "ultra",
    name: "Ultra",
    icon: "⬡",
    monthlyPrice: 49,
    yearlyPrice: 39,
    fileSize: "500 GB",
    speed: "Ultra-Fast",
    color: "#059669",
    accent: "#047857",
    features: ["500 GB storage", "Ultra-fast transfer", "Real-time analytics", "24/7 priority support", "Unlimited users", "Custom domain", "API access", "White-labeling", "SLA guarantee"],
    recommended: false,
    enabled: true,
    discount: { enabled: false, percentage: 0 },
    badge: "BEST VALUE",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function calcDiscounted(price, pct) {
  return Math.round(price * (1 - pct / 100));
}

// ─── Countdown Timer ─────────────────────────────────────────────────────────
function Countdown() {
  const [time, setTime] = useState({ h: 5, m: 47, s: 23 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: DS.fonts.mono }}>
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{
            background: "rgba(5,150,105,0.12)", color: DS.green.primary,
            padding: "2px 7px", borderRadius: "6px", fontWeight: "800", fontSize: "13px",
            border: "1px solid rgba(5,150,105,0.2)"
          }}>{v}</span>
          {i < 2 && <span style={{ color: DS.green.primary, fontWeight: "800", fontSize: "13px" }}>:</span>}
        </span>
      ))}
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          width: "14px", height: "14px", borderRadius: "50%", background: DS.gray[200],
          color: DS.gray[500], fontSize: "9px", fontWeight: "700", display: "inline-flex",
          alignItems: "center", justifyContent: "center", cursor: "help", marginLeft: "4px",
          fontFamily: DS.fonts.mono, flexShrink: 0,
        }}
      >?</span>
      {show && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
          background: DS.gray[900], color: "#fff", padding: "6px 10px", borderRadius: "8px",
          fontSize: "11px", whiteSpace: "nowrap", zIndex: 100, fontFamily: DS.fonts.body,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)", pointerEvents: "none",
        }}>{text}</span>
      )}
    </span>
  );
}

// ─── User Pricing Card ────────────────────────────────────────────────────────
function PricingCard({ plan, yearly, currentPlan, onUpgrade }) {
  const [hovered, setHovered] = useState(false);
  const basePrice = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const discounted = plan.discount.enabled ? calcDiscounted(basePrice, plan.discount.percentage) : basePrice;
  const isCurrent = currentPlan === plan.id;
  const isFree = plan.id === "free";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: plan.recommended ? `2px solid ${DS.green.primary}` : "1.5px solid rgba(17,24,39,0.08)",
        borderRadius: "20px",
        padding: "28px 24px",
        position: "relative",
        transition: "all 0.25s ease",
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.1)`
          : plan.recommended
          ? `0 4px 24px rgba(5,150,105,0.12)`
          : "0 1px 12px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px)" : plan.recommended ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Badges */}
      {plan.badge && (
        <div style={{ position: "absolute", top: "-13px", left: "20px" }}>
          <span style={{
            background: plan.recommended
              ? `linear-gradient(135deg, ${DS.green.primary}, ${DS.green.dark})`
              : `linear-gradient(135deg, ${DS.amber.primary}, #b45309)`,
            color: "#fff", padding: "4px 12px", borderRadius: "20px",
            fontSize: "10px", fontWeight: "800", letterSpacing: "0.06em",
            fontFamily: DS.fonts.mono, boxShadow: plan.recommended
              ? "0 2px 8px rgba(5,150,105,0.35)"
              : "0 2px 8px rgba(180,83,9,0.35)",
          }}>{plan.badge}</span>
        </div>
      )}

      {isCurrent && (
        <div style={{ position: "absolute", top: "-13px", right: "20px" }}>
          <span style={{
            background: DS.green.light, color: DS.green.text, border: `1px solid rgba(5,150,105,0.25)`,
            padding: "4px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "800",
            letterSpacing: "0.05em", fontFamily: DS.fonts.mono,
          }}>CURRENT PLAN</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "12px", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "18px",
          background: `linear-gradient(135deg, ${plan.color}, ${plan.accent})`,
          boxShadow: `0 4px 12px ${plan.color}40`, color: "#fff", flexShrink: 0,
        }}>{plan.icon}</div>
        <div>
          <p style={{ fontFamily: DS.fonts.display, fontWeight: "800", fontSize: "16px", color: DS.gray[900], letterSpacing: "-0.02em" }}>{plan.name}</p>
          <p style={{ fontFamily: DS.fonts.body, fontSize: "11px", color: DS.gray[400], marginTop: "1px" }}>{plan.fileSize} · {plan.speed}</p>
        </div>
      </div>

      {/* Price */}
      <div>
        {plan.discount.enabled && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{
              textDecoration: "line-through", color: DS.gray[400],
              fontSize: "15px", fontFamily: DS.fonts.mono, fontWeight: "600",
            }}>{isFree ? "Free" : fmt(basePrice)}</span>
            <span style={{
              background: DS.amber.light, color: DS.amber.text, padding: "2px 8px",
              borderRadius: "20px", fontSize: "10px", fontWeight: "800",
              fontFamily: DS.fonts.mono, letterSpacing: "0.04em",
              border: `1px solid rgba(180,83,9,0.2)`,
            }}>-{plan.discount.percentage}% OFF</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{
            fontFamily: DS.fonts.display, fontWeight: "900", fontSize: "38px",
            color: DS.gray[900], letterSpacing: "-0.04em", lineHeight: 1,
          }}>
            {isFree ? "Free" : fmt(plan.discount.enabled ? discounted : basePrice)}
          </span>
          {!isFree && (
            <span style={{ fontFamily: DS.fonts.body, fontSize: "13px", color: DS.gray[400], fontWeight: "500" }}>
              / {yearly ? "mo · billed yearly" : "month"}
            </span>
          )}
        </div>
        {yearly && !isFree && (
          <p style={{ fontFamily: DS.fonts.body, fontSize: "11px", color: DS.green.primary, fontWeight: "600", marginTop: "4px" }}>
            Save {fmt((plan.monthlyPrice - (plan.discount.enabled ? calcDiscounted(plan.yearlyPrice, plan.discount.percentage) : plan.yearlyPrice)) * 12)} per year
          </p>
        )}
      </div>

      {/* Features */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{
              width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
              background: plan.recommended ? DS.green.light : DS.gray[100],
              color: plan.recommended ? DS.green.primary : DS.gray[400],
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "9px", fontWeight: "900", marginTop: "1px",
            }}>✓</span>
            <span style={{ fontFamily: DS.fonts.body, fontSize: "13px", color: DS.gray[700], lineHeight: "1.4" }}>
              {f}
              {i === 0 && <Tooltip text={`Maximum storage capacity for ${plan.name} plan`} />}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        disabled={isCurrent}
        onClick={() => !isCurrent && onUpgrade(plan.id)}
        style={{
          width: "100%", padding: "13px", borderRadius: "12px", fontSize: "14px",
          fontWeight: "800", fontFamily: DS.fonts.mono, letterSpacing: "0.02em",
          border: "none", cursor: isCurrent ? "default" : "pointer",
          transition: "all 0.2s ease",
          background: isCurrent
            ? DS.gray[100]
            : plan.recommended
            ? `linear-gradient(135deg, ${DS.green.primary}, ${DS.green.dark})`
            : `linear-gradient(135deg, ${plan.color}, ${plan.accent})`,
          color: isCurrent ? DS.gray[400] : "#fff",
          boxShadow: isCurrent ? "none" : plan.recommended
            ? "0 4px 14px rgba(5,150,105,0.35)"
            : `0 4px 14px ${plan.color}50`,
          opacity: isCurrent ? 0.7 : 1,
        }}
      >
        {isCurrent ? "Current Plan" : isFree ? "Get Started Free" : `Upgrade to ${plan.name}`}
      </button>
    </div>
  );
}

// ─── Comparison Table ─────────────────────────────────────────────────────────
function ComparisonTable({ plans }) {
  const rows = [
    { label: "Storage", key: "fileSize" },
    { label: "Transfer Speed", key: "speed" },
    { label: "Users", values: ["1", "5", "Unlimited"] },
    { label: "API Access", values: [false, true, true] },
    { label: "Custom Domain", values: [false, true, true] },
    { label: "White-label", values: [false, false, true] },
    { label: "SLA Guarantee", values: [false, false, true] },
    { label: "Support", values: ["Community", "Priority Email", "24/7 Priority"] },
  ];

  return (
    <div style={{ overflowX: "auto", borderRadius: "16px", border: "1.5px solid rgba(17,24,39,0.07)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
        <thead>
          <tr style={{ background: DS.gray[50] }}>
            <th style={{ padding: "14px 20px", textAlign: "left", fontFamily: DS.fonts.mono, fontSize: "12px", color: DS.gray[500], fontWeight: "700", letterSpacing: "0.05em", borderBottom: "1px solid rgba(17,24,39,0.07)" }}>FEATURE</th>
            {plans.filter(p => p.enabled).map(p => (
              <th key={p.id} style={{ padding: "14px 20px", textAlign: "center", borderBottom: "1px solid rgba(17,24,39,0.07)" }}>
                <span style={{ fontFamily: DS.fonts.display, fontWeight: "800", fontSize: "14px", color: p.recommended ? DS.green.primary : DS.gray[700] }}>{p.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : DS.gray[50] }}>
              <td style={{ padding: "12px 20px", fontFamily: DS.fonts.body, fontSize: "13px", color: DS.gray[700], borderBottom: "1px solid rgba(17,24,39,0.05)" }}>{row.label}</td>
              {plans.filter(p => p.enabled).map((p, pi) => {
                const val = row.key ? p[row.key] : row.values[pi];
                return (
                  <td key={p.id} style={{ padding: "12px 20px", textAlign: "center", borderBottom: "1px solid rgba(17,24,39,0.05)" }}>
                    {val === true ? (
                      <span style={{ color: DS.green.primary, fontWeight: "700", fontSize: "16px" }}>✓</span>
                    ) : val === false ? (
                      <span style={{ color: DS.gray[300], fontWeight: "700", fontSize: "16px" }}>—</span>
                    ) : (
                      <span style={{ fontFamily: DS.fonts.mono, fontSize: "12px", fontWeight: "600", color: p.recommended ? DS.green.primary : DS.gray[600] }}>{val}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Admin: Feature List Editor ───────────────────────────────────────────────
function FeatureEditor({ features, onChange }) {
  const [newFeature, setNewFeature] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {features.map((f, i) => (
        <div key={i} style={{ display: "flex", gap: "6px" }}>
          <input
            value={f}
            onChange={(e) => { const arr = [...features]; arr[i] = e.target.value; onChange(arr); }}
            style={{ flex: 1, padding: "7px 10px", borderRadius: "8px", border: "1.5px solid rgba(17,24,39,0.1)", fontSize: "12px", fontFamily: DS.fonts.body, outline: "none", color: DS.gray[700] }}
          />
          <button
            onClick={() => onChange(features.filter((_, j) => j !== i))}
            style={{ padding: "7px 10px", borderRadius: "8px", border: "1.5px solid rgba(185,28,28,0.2)", background: "#FEE2E2", color: "#B91C1C", fontSize: "12px", cursor: "pointer", fontWeight: "700" }}
          >✕</button>
        </div>
      ))}
      <div style={{ display: "flex", gap: "6px" }}>
        <input
          value={newFeature}
          placeholder="Add feature…"
          onChange={(e) => setNewFeature(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && newFeature.trim()) { onChange([...features, newFeature.trim()]); setNewFeature(""); } }}
          style={{ flex: 1, padding: "7px 10px", borderRadius: "8px", border: `1.5px solid rgba(5,150,105,0.3)`, fontSize: "12px", fontFamily: DS.fonts.body, outline: "none", color: DS.gray[700] }}
        />
        <button
          onClick={() => { if (newFeature.trim()) { onChange([...features, newFeature.trim()]); setNewFeature(""); } }}
          style={{ padding: "7px 14px", borderRadius: "8px", background: DS.green.light, color: DS.green.text, fontSize: "12px", cursor: "pointer", fontWeight: "700", border: `1px solid rgba(5,150,105,0.25)` }}
        >+ Add</button>
      </div>
    </div>
  );
}

// ─── Admin Plan Card ──────────────────────────────────────────────────────────
function AdminPlanCard({ plan, onChange }) {
  const [open, setOpen] = useState(false);
  const discountedMonthly = plan.discount.enabled ? calcDiscounted(plan.monthlyPrice, plan.discount.percentage) : plan.monthlyPrice;
  const discountedYearly = plan.discount.enabled ? calcDiscounted(plan.yearlyPrice, plan.discount.percentage) : plan.yearlyPrice;

  const field = (label, val, setter, type = "text", min) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontFamily: DS.fonts.mono, fontSize: "11px", fontWeight: "700", color: DS.gray[500], letterSpacing: "0.05em" }}>{label}</label>
      <input
        type={type} min={min} value={val}
        onChange={(e) => setter(type === "number" ? Math.max(0, parseInt(e.target.value) || 0) : e.target.value)}
        style={{ padding: "8px 12px", borderRadius: "9px", border: "1.5px solid rgba(17,24,39,0.1)", fontSize: "13px", fontFamily: DS.fonts.body, outline: "none", color: DS.gray[900], background: "#fff" }}
      />
    </div>
  );

  return (
    <div style={{
      border: plan.recommended ? `2px solid ${DS.green.primary}` : "1.5px solid rgba(17,24,39,0.08)",
      borderRadius: "16px", overflow: "hidden",
      boxShadow: plan.recommended ? "0 2px 16px rgba(5,150,105,0.1)" : "0 1px 8px rgba(0,0,0,0.04)",
    }}>
      {/* Header row */}
      <div
        onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", background: plan.enabled ? "#fff" : DS.gray[50] }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: plan.enabled ? `linear-gradient(135deg,${plan.color},${plan.accent})` : DS.gray[200], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: plan.enabled ? "#fff" : DS.gray[400] }}>{plan.icon}</div>
          <div>
            <p style={{ fontFamily: DS.fonts.display, fontWeight: "800", fontSize: "14px", color: plan.enabled ? DS.gray[900] : DS.gray[400], letterSpacing: "-0.02em" }}>{plan.name}</p>
            <p style={{ fontFamily: DS.fonts.mono, fontSize: "11px", color: DS.gray[400] }}>
              {fmt(plan.monthlyPrice)}/mo · {fmt(plan.yearlyPrice)}/mo yearly
              {plan.discount.enabled && <span style={{ color: DS.amber.primary, marginLeft: "6px" }}>-{plan.discount.percentage}%</span>}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {plan.recommended && <span style={{ background: DS.green.light, color: DS.green.text, padding: "3px 9px", borderRadius: "20px", fontSize: "10px", fontWeight: "800", fontFamily: DS.fonts.mono }}>RECOMMENDED</span>}
          <label onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <div style={{
              width: "36px", height: "20px", borderRadius: "10px", position: "relative",
              background: plan.enabled ? DS.green.primary : DS.gray[300], transition: "background 0.2s",
            }}>
              <div style={{
                position: "absolute", top: "3px", left: plan.enabled ? "18px" : "3px",
                width: "14px", height: "14px", borderRadius: "50%", background: "#fff",
                transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
              <input type="checkbox" checked={plan.enabled} onChange={(e) => onChange({ ...plan, enabled: e.target.checked })} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
            </div>
          </label>
          <span style={{ fontSize: "14px", color: DS.gray[400], transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
        </div>
      </div>

      {/* Expanded editor */}
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(17,24,39,0.06)", background: "#FAFBFC" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "16px" }}>
            {field("Plan Name", plan.name, (v) => onChange({ ...plan, name: v }))}
            {field("Icon / Emoji", plan.icon, (v) => onChange({ ...plan, icon: v }))}
            {field("Monthly Price ($)", plan.monthlyPrice, (v) => onChange({ ...plan, monthlyPrice: v }), "number", 0)}
            {field("Yearly Price ($)", plan.yearlyPrice, (v) => onChange({ ...plan, yearlyPrice: v }), "number", 0)}
            {field("File Size Limit", plan.fileSize, (v) => onChange({ ...plan, fileSize: v }))}
            {field("Transfer Speed", plan.speed, (v) => onChange({ ...plan, speed: v }))}
          </div>

          {/* Toggles row */}
          <div style={{ display: "flex", gap: "20px", marginTop: "16px", flexWrap: "wrap" }}>
            {[
              { label: "Recommended", val: plan.recommended, key: "recommended" },
              { label: "Discount Active", val: plan.discount.enabled, key: null,
                setter: (v) => onChange({ ...plan, discount: { ...plan.discount, enabled: v } }) },
            ].map(({ label, val, key, setter }) => (
              <label key={label} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <div style={{ width: "36px", height: "20px", borderRadius: "10px", position: "relative", background: val ? DS.green.primary : DS.gray[300], transition: "background 0.2s" }}>
                  <div style={{ position: "absolute", top: "3px", left: val ? "18px" : "3px", width: "14px", height: "14px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  <input type="checkbox" checked={val} onChange={(e) => key ? onChange({ ...plan, [key]: e.target.checked }) : setter(e.target.checked)} style={{ position: "absolute", opacity: 0 }} />
                </div>
                <span style={{ fontFamily: DS.fonts.body, fontSize: "13px", color: DS.gray[700], fontWeight: "500" }}>{label}</span>
              </label>
            ))}
          </div>

          {/* Discount fields */}
          {plan.discount.enabled && (
            <div style={{ marginTop: "14px", padding: "14px", borderRadius: "12px", background: DS.amber.light, border: `1px solid rgba(180,83,9,0.15)` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontFamily: DS.fonts.mono, fontSize: "11px", fontWeight: "700", color: DS.amber.text, letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>DISCOUNT %</label>
                  <input
                    type="number" min="0" max="100" value={plan.discount.percentage}
                    onChange={(e) => onChange({ ...plan, discount: { ...plan.discount, percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) } })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "9px", border: `1.5px solid rgba(180,83,9,0.2)`, fontSize: "13px", fontFamily: DS.fonts.body, outline: "none", color: DS.gray[900], background: "#fff", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: DS.fonts.mono, fontSize: "11px", fontWeight: "700", color: DS.amber.text, letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>DISCOUNTED MONTHLY</label>
                  <div style={{ padding: "8px 12px", borderRadius: "9px", background: "#fff", border: `1.5px solid rgba(180,83,9,0.2)`, fontSize: "13px", fontFamily: DS.fonts.mono, fontWeight: "700", color: DS.green.primary }}>{fmt(discountedMonthly)}</div>
                </div>
                <div>
                  <label style={{ fontFamily: DS.fonts.mono, fontSize: "11px", fontWeight: "700", color: DS.amber.text, letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>DISCOUNTED YEARLY</label>
                  <div style={{ padding: "8px 12px", borderRadius: "9px", background: "#fff", border: `1.5px solid rgba(180,83,9,0.2)`, fontSize: "13px", fontFamily: DS.fonts.mono, fontWeight: "700", color: DS.green.primary }}>{fmt(discountedYearly)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Badge field */}
          {field("Badge Label (optional)", plan.badge || "", (v) => onChange({ ...plan, badge: v || null }))}

          {/* Features */}
          <div style={{ marginTop: "14px" }}>
            <label style={{ fontFamily: DS.fonts.mono, fontSize: "11px", fontWeight: "700", color: DS.gray[500], letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>FEATURES</label>
            <FeatureEditor features={plan.features} onChange={(f) => onChange({ ...plan, features: f })} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [savedPlans, setSavedPlans] = useState(DEFAULT_PLANS);
  const [yearly, setYearly] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [adminMode, setAdminMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  const hasChanges = JSON.stringify(plans) !== JSON.stringify(savedPlans);

  useEffect(() => { setSaved(!hasChanges); }, [hasChanges]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavedPlans(JSON.parse(JSON.stringify(plans)));
    setSaving(false);
    setSaved(true);
  };

  const handleReset = () => {
    setPlans(JSON.parse(JSON.stringify(DEFAULT_PLANS)));
  };

  const updatePlan = (id, updated) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const enabledPlans = plans.filter((p) => p.enabled);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFB", fontFamily: DS.fonts.body }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.5; }
        button:hover { filter: brightness(0.96); }
      `}</style>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontFamily: DS.fonts.display, fontWeight: "900", fontSize: "32px", color: DS.gray[900], letterSpacing: "-0.04em", margin: 0 }}>
              {adminMode ? "⚙ Pricing Admin" : "Choose Your Plan"}
            </h1>
            <p style={{ fontFamily: DS.fonts.body, fontSize: "15px", color: DS.gray[500], marginTop: "6px" }}>
              {adminMode ? "Configure plans, pricing & discounts" : "Simple, transparent pricing that grows with you"}
            </p>
          </div>
          <button
            onClick={() => setAdminMode(!adminMode)}
            style={{
              padding: "10px 20px", borderRadius: "12px", border: "1.5px solid rgba(17,24,39,0.12)",
              background: adminMode ? DS.green.primary : "#fff", color: adminMode ? "#fff" : DS.gray[700],
              fontFamily: DS.fonts.mono, fontSize: "13px", fontWeight: "700", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "7px",
              boxShadow: adminMode ? "0 4px 14px rgba(5,150,105,0.3)" : "0 1px 6px rgba(0,0,0,0.05)",
            }}
          >
            {adminMode ? "← User View" : "⚙ Admin Panel"}
          </button>
        </div>

        {/* ── USER VIEW ────────────────────────────────────────────────── */}
        {!adminMode && (
          <>
            {/* Limited offer banner */}
            {plans.some(p => p.discount.enabled) && (
              <div style={{
                background: `linear-gradient(135deg, ${DS.amber.primary}15, ${DS.amber.primary}08)`,
                border: `1.5px solid rgba(217,119,6,0.2)`, borderRadius: "14px",
                padding: "14px 20px", marginBottom: "28px",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>🔥</span>
                  <div>
                    <p style={{ fontFamily: DS.fonts.display, fontWeight: "800", fontSize: "14px", color: DS.amber.text, margin: 0, letterSpacing: "-0.01em" }}>Limited Time Offer</p>
                    <p style={{ fontFamily: DS.fonts.body, fontSize: "12px", color: DS.gray[500], margin: 0 }}>Special discounts active on selected plans · Expires in</p>
                  </div>
                </div>
                <Countdown />
              </div>
            )}

            {/* Billing toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "32px" }}>
              <span style={{ fontFamily: DS.fonts.mono, fontSize: "13px", fontWeight: "700", color: !yearly ? DS.gray[900] : DS.gray[400] }}>Monthly</span>
              <div
                onClick={() => setYearly(!yearly)}
                style={{ width: "52px", height: "28px", borderRadius: "14px", background: yearly ? DS.green.primary : DS.gray[300], cursor: "pointer", position: "relative", transition: "background 0.25s" }}
              >
                <div style={{ position: "absolute", top: "4px", left: yearly ? "26px" : "4px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </div>
              <span style={{ fontFamily: DS.fonts.mono, fontSize: "13px", fontWeight: "700", color: yearly ? DS.gray[900] : DS.gray[400] }}>
                Yearly
                <span style={{ marginLeft: "7px", background: DS.green.light, color: DS.green.text, padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "800" }}>2 MONTHS FREE</span>
              </span>
            </div>

            {/* Plan cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "40px" }}>
              {enabledPlans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} yearly={yearly} currentPlan={currentPlan} onUpgrade={setCurrentPlan} />
              ))}
            </div>

            {/* Comparison toggle */}
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <button
                onClick={() => setShowComparison(!showComparison)}
                style={{ background: "none", border: "none", fontFamily: DS.fonts.mono, fontSize: "13px", fontWeight: "700", color: DS.green.primary, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                {showComparison ? "Hide" : "Show"} full comparison table →
              </button>
            </div>

            {showComparison && <ComparisonTable plans={plans} />}
          </>
        )}

        {/* ── ADMIN VIEW ───────────────────────────────────────────────── */}
        {adminMode && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Admin header bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderRadius: "14px", background: "#fff",
              border: "1.5px solid rgba(17,24,39,0.08)", marginBottom: "8px", flexWrap: "wrap", gap: "10px",
              boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: saved ? DS.green.primary : DS.amber.primary }} />
                <span style={{ fontFamily: DS.fonts.mono, fontSize: "12px", fontWeight: "700", color: saved ? DS.green.text : DS.amber.text, letterSpacing: "0.04em" }}>
                  {saved ? "ALL CHANGES SAVED" : "UNSAVED CHANGES"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleReset}
                  style={{ padding: "8px 16px", borderRadius: "10px", border: "1.5px solid rgba(17,24,39,0.1)", background: "#fff", fontFamily: DS.fonts.mono, fontSize: "12px", fontWeight: "700", color: DS.gray[500], cursor: "pointer" }}
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  style={{
                    padding: "8px 20px", borderRadius: "10px", border: "none",
                    background: hasChanges && !saving ? `linear-gradient(135deg, ${DS.green.primary}, ${DS.green.dark})` : DS.gray[200],
                    color: hasChanges && !saving ? "#fff" : DS.gray[400],
                    fontFamily: DS.fonts.mono, fontSize: "12px", fontWeight: "700", cursor: hasChanges && !saving ? "pointer" : "default",
                    display: "flex", alignItems: "center", gap: "6px",
                    boxShadow: hasChanges && !saving ? "0 4px 12px rgba(5,150,105,0.3)" : "none",
                  }}
                >
                  {saving ? (
                    <><span style={{ display: "inline-block", animation: "spin 0.8s linear infinite", fontSize: "12px" }}>↻</span> Saving…</>
                  ) : "Save Changes"}
                </button>
              </div>
            </div>

            {plans.map((plan) => (
              <AdminPlanCard key={plan.id} plan={plan} onChange={(updated) => updatePlan(plan.id, updated)} />
            ))}

            {/* Add plan placeholder */}
            <button style={{
              padding: "16px", borderRadius: "14px", border: `2px dashed ${DS.gray[200]}`,
              background: "transparent", color: DS.gray[400], fontFamily: DS.fonts.mono,
              fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = DS.green.primary; e.currentTarget.style.color = DS.green.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = DS.gray[200]; e.currentTarget.style.color = DS.gray[400]; }}
            >
              + Add New Plan
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

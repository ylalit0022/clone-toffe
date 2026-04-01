import { useState } from "react";

// ─── feature definitions ──────────────────────────────────────────────────────

const FEATURE_DEFS = [
  {
    id: "premiumEnabled",
    label: "Premium Enabled",
    description: "Allow users to subscribe to Pro and Ultra plans. Disabling this locks all accounts to the Free tier.",
    icon: (
      <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    activeColor:  "#059669",
    activeAccent: "#047857",
    activeBg:     "#D1FAE5",
    activeText:   "#047857",
    activeBorder: "rgba(5,150,105,0.2)",
    tag: "Billing",
    defaultOn: true,
    warning: null,
  },
  {
    id: "maintenanceMode",
    label: "Maintenance Mode",
    description: "Take the platform offline for all non-admin users. A maintenance banner is shown at the login screen.",
    icon: (
      <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    activeColor:  "#D97706",
    activeAccent: "#B45309",
    activeBg:     "#FEF3C7",
    activeText:   "#B45309",
    activeBorder: "rgba(180,83,9,0.2)",
    tag: "Operations",
    defaultOn: false,
    warning: "Enabling this will immediately log out all active sessions.",
  },
  {
    id: "adsEnabled",
    label: "Ads Enabled",
    description: "Show advertisements to Free tier users. Premium and Ultra users always see an ad-free experience.",
    icon: (
      <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    activeColor:  "#7C3AED",
    activeAccent: "#6D28D9",
    activeBg:     "#EDE9FE",
    activeText:   "#6D28D9",
    activeBorder: "rgba(109,40,217,0.2)",
    tag: "Monetisation",
    defaultOn: false,
    warning: null,
  },
];

const DEFAULTS = Object.fromEntries(FEATURE_DEFS.map((f) => [f.id, f.defaultOn]));

// ─── sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ saved }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
      style={{
        background: saved ? "#D1FAE5" : "#FEF3C7",
        color: saved ? "#047857" : "#B45309",
        border: `1px solid ${saved ? "rgba(5,150,105,0.25)" : "rgba(180,83,9,0.2)"}`,
        fontFamily: "'Space Grotesk',sans-serif",
        letterSpacing: "0.04em",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: saved ? "#059669" : "#D97706" }} />
      {saved ? "SAVED" : "UNSAVED"}
    </div>
  );
}

function ToggleRow({ feature, checked, onChange }) {
  const {
    label, description, icon, warning,
    activeColor, activeAccent, activeBg, activeText, activeBorder, tag,
  } = feature;

  const iconBg = checked
    ? `linear-gradient(135deg,${activeColor},${activeAccent})`
    : "linear-gradient(135deg,#9CA3AF,#6B7280)";

  const iconShadow = checked
    ? `0 4px 12px ${activeColor}40`
    : "0 2px 6px rgba(0,0,0,0.1)";

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300"
      style={{
        background: checked ? activeBg.replace(")", ",0.06)").replace("rgb", "rgba") || "#fff" : "#fff",
        border: checked ? `1.5px solid ${activeBorder}` : "1px solid rgba(17,24,39,0.07)",
        boxShadow: checked ? `0 2px 16px ${activeColor}14` : "0 1px 12px rgba(0,0,0,0.04)",
        // Fallback: always use white bg with tinted border
        backgroundColor: checked ? activeBg : "#fff",
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{ background: iconBg, boxShadow: iconShadow }}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-sm font-bold text-gray-900"
              style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.01em" }}
            >
              {label}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                background: checked ? activeBg : "#F3F4F6",
                color: checked ? activeText : "#9CA3AF",
                border: `1px solid ${checked ? activeBorder : "transparent"}`,
              }}
            >
              {tag}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {description}
          </p>

          {/* Warning */}
          {warning && checked && (
            <div
              className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid rgba(180,83,9,0.2)" }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {warning}
            </div>
          )}
        </div>

        {/* Toggle + status label */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: checked
                ? `linear-gradient(135deg,${activeColor},${activeAccent})`
                : "#E5E7EB",
              boxShadow: checked ? `0 2px 10px ${activeColor}45` : "inset 0 1px 3px rgba(0,0,0,0.1)",
              focusVisibleRingColor: activeColor,
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300"
              style={{
                transform: checked ? "translateX(24px)" : "translateX(0)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }}
            />
          </button>
          <span
            className="text-[10px] font-bold uppercase tracking-widest transition-all duration-300"
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              color: checked ? activeText : "#9CA3AF",
            }}
          >
            {checked ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
  const [flags, setFlags]     = useState({ ...DEFAULTS });
  const [saved, setSaved]     = useState({ ...DEFAULTS });
  const [saving, setSaving]   = useState(false);

  const hasChanges = Object.keys(flags).some((k) => flags[k] !== saved[k]);
  const activeCount = Object.values(flags).filter(Boolean).length;

  const toggle = (id, val) => setFlags((prev) => ({ ...prev, [id]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaved({ ...flags });
    setSaving(false);
  };

  const handleReset = () => setFlags({ ...DEFAULTS });

  return (
    <div
      className="p-6 lg:p-8 max-w-2xl mx-auto"
      style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
    >
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-xl font-extrabold text-gray-900 leading-none"
            style={{ fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-0.03em" }}
          >
            Feature Flags
          </h2>
          <p className="text-sm text-gray-400 mt-1">Control platform features and modes in real-time</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active count pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: activeCount > 0 ? "#D1FAE5" : "#F3F4F6",
              color: activeCount > 0 ? "#047857" : "#9CA3AF",
              border: `1px solid ${activeCount > 0 ? "rgba(5,150,105,0.25)" : "transparent"}`,
              fontFamily: "'Space Grotesk',sans-serif",
              letterSpacing: "0.04em",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: activeCount > 0 ? "#059669" : "#D1D5DB" }}
            />
            {activeCount} / {FEATURE_DEFS.length} ON
          </div>

          <StatusBadge saved={!hasChanges} />
        </div>
      </div>

      <form onSubmit={handleSave} noValidate>
        {/* Toggle rows */}
        <div className="flex flex-col gap-3 mb-6">
          {FEATURE_DEFS.map((feature) => (
            <ToggleRow
              key={feature.id}
              feature={feature}
              checked={flags[feature.id]}
              onChange={(val) => toggle(feature.id, val)}
            />
          ))}
        </div>

        {/* Summary strip */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
          style={{ background: "#F8FAFB", border: "1px solid rgba(17,24,39,0.06)" }}
        >
          {FEATURE_DEFS.map((f) => (
            <div key={f.id} className="flex items-center gap-1.5 flex-1 justify-center">
              <span
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ background: flags[f.id] ? f.activeColor : "#D1D5DB" }}
              />
              <span
                className="text-[11px] font-bold"
                style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  color: flags[f.id] ? f.activeText : "#9CA3AF",
                }}
              >
                {f.label.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 transition-all duration-200 hover:bg-gray-100"
            style={{ fontFamily: "'Space Grotesk',sans-serif" }}
          >
            Reset defaults
          </button>

          <button
            type="submit"
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg,#059669,#047857)",
              boxShadow: saving || !hasChanges ? "none" : "0 4px 14px rgba(5,150,105,0.35)",
              fontFamily: "'Space Grotesk',sans-serif",
            }}
          >
            {saving ? (
              <>
                <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Saving…
              </>
            ) : !hasChanges ? (
              <>
                <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved
              </>
            ) : (
              "Apply changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

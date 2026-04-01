import { useState } from "react";

// ─── sub-components ────────────────────────────────────────────────────────

function SectionHeader({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#059669,#047857)", boxShadow: "0 4px 12px rgba(5,150,105,0.25)" }}
      >
        {icon}
      </div>
      <div>
        <h3
          className="text-sm font-bold text-gray-900 leading-none"
          style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.02em" }}
        >
          {title}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

function NumberField({ label, hint, value, onChange, min = 0, max, suffix = "files" }) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        className="block text-xs font-semibold text-gray-600 mb-1.5"
        style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.02em" }}
      >
        {label}
      </label>
      <div
        className="flex items-center rounded-xl transition-all duration-200"
        style={{
          border: focused ? "1.5px solid #059669" : "1.5px solid rgba(17,24,39,0.1)",
          boxShadow: focused ? "0 0 0 3px rgba(5,150,105,0.08)" : "none",
          background: "#fff",
        }}
      >
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-800 bg-transparent outline-none rounded-l-xl"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
        />
        <span
          className="px-3 py-2.5 text-xs font-semibold text-gray-400 border-l"
          style={{ borderColor: "rgba(17,24,39,0.08)", fontFamily: "'Space Grotesk',sans-serif" }}
        >
          {suffix}
        </span>
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function Toggle({ label, description, checked, onChange, id }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 px-4 rounded-xl transition-colors"
      style={{ background: checked ? "rgba(5,150,105,0.04)" : "#F8FAFB", border: "1.5px solid", borderColor: checked ? "rgba(5,150,105,0.2)" : "rgba(17,24,39,0.06)" }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold text-gray-800"
          style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.01em" }}
        >
          {label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>

      {/* Toggle pill */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        style={{
          background: checked
            ? "linear-gradient(135deg,#059669,#047857)"
            : "#E5E7EB",
          boxShadow: checked ? "0 2px 8px rgba(5,150,105,0.35)" : "inset 0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300"
          style={{
            transform: checked ? "translateX(20px)" : "translateX(0)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          }}
        />
      </button>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`p-6 rounded-2xl ${className}`}
      style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
    >
      {children}
    </div>
  );
}

// ─── status badge ───────────────────────────────────────────────────────────

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
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: saved ? "#059669" : "#D97706" }}
      />
      {saved ? "SAVED" : "UNSAVED"}
    </div>
  );
}

// ─── main component ─────────────────────────────────────────────────────────

const DEFAULTS = {
  freeFileLimit: 5,
  premiumFileLimit: 50,
  maxConnections: 100,
  turnEnabled: false,
};

export default function ConfigPage() {
  const [config, setConfig] = useState(DEFAULTS);
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);

  const update = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulate async save
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
  };

  const handleReset = () => {
    setConfig(DEFAULTS);
    setSaved(false);
  };

  return (
    <div
      className="p-6 lg:p-8 max-w-3xl mx-auto"
      style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
    >
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-xl font-extrabold text-gray-900 leading-none"
            style={{ fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-0.03em" }}
          >
            System Config
          </h2>
          <p className="text-sm text-gray-400 mt-1">Manage file limits, connections, and relay settings</p>
        </div>
        <StatusBadge saved={saved} />
      </div>

      <form onSubmit={handleSave} noValidate>
        <div className="space-y-5">

          {/* ── File Limits ─────────────────────────────────────── */}
          <Card>
            <SectionHeader
              icon={
                <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
              title="File Limits"
              description="Set the maximum number of files per user tier"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberField
                label="Free Tier Limit"
                hint="Max files a free user can upload"
                value={config.freeFileLimit}
                onChange={(v) => update("freeFileLimit", v)}
                min={1}
                max={config.premiumFileLimit}
              />
              <NumberField
                label="Premium Tier Limit"
                hint="Max files a premium user can upload"
                value={config.premiumFileLimit}
                onChange={(v) => update("premiumFileLimit", v)}
                min={config.freeFileLimit}
              />
            </div>

            {config.freeFileLimit >= config.premiumFileLimit && (
              <div
                className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid rgba(180,83,9,0.2)" }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Free limit should be less than Premium limit
              </div>
            )}
          </Card>

          {/* ── Connection Settings ──────────────────────────────── */}
          <Card>
            <SectionHeader
              icon={
                <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="3" />
                  <circle cx="5" cy="19" r="3" />
                  <circle cx="19" cy="19" r="3" />
                  <line x1="12" y1="8" x2="5" y2="16" />
                  <line x1="12" y1="8" x2="19" y2="16" />
                </svg>
              }
              title="Connection Settings"
              description="Control the maximum simultaneous WebRTC connections"
            />

            <NumberField
              label="Max Connections"
              hint="Total concurrent peer connections allowed across the system"
              value={config.maxConnections}
              onChange={(v) => update("maxConnections", v)}
              min={1}
              suffix="peers"
            />

            {/* Visual utilisation bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-semibold text-gray-400" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  CAPACITY INDICATOR
                </span>
                <span className="text-[11px] font-bold text-emerald-600" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  {config.maxConnections} peers
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: "#E5E7EB" }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((config.maxConnections / 500) * 100, 100)}%`,
                    background: config.maxConnections > 400
                      ? "linear-gradient(90deg,#D97706,#B45309)"
                      : "linear-gradient(90deg,#059669,#047857)",
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] text-gray-400">Scale reference: 500 peers max recommended</p>
            </div>
          </Card>

          {/* ── Relay / TURN ─────────────────────────────────────── */}
          <Card>
            <SectionHeader
              icon={
                <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              }
              title="Relay (TURN)"
              description="Force traffic through TURN server when direct P2P is unavailable"
            />

            <Toggle
              id="turn-toggle"
              label="Enable TURN Server"
              description={
                config.turnEnabled
                  ? "Traffic is being relayed via TURN — higher latency, guaranteed connectivity"
                  : "Direct peer-to-peer — lower latency when both parties are reachable"
              }
              checked={config.turnEnabled}
              onChange={(v) => update("turnEnabled", v)}
            />

            {config.turnEnabled && (
              <div
                className="mt-3 flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs"
                style={{ background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.15)" }}
              >
                <svg width="14" height="14" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="text-emerald-700 font-medium">
                  TURN relay active — ensure your TURN credentials are configured in the server env vars.
                </span>
              </div>
            )}
          </Card>

          {/* ── Actions ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2">
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
              disabled={saving || saved}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg,#059669,#047857)",
                boxShadow: saving || saved ? "none" : "0 4px 14px rgba(5,150,105,0.35)",
                fontFamily: "'Space Grotesk',sans-serif",
                letterSpacing: "0.01em",
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
              ) : saved ? (
                <>
                  <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Saved
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

import { useState } from "react";

// ─── helpers ────────────────────────────────────────────────────────────────

const DEFAULTS = { pro: 19, ultra: 49 };

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// ─── sub-components ─────────────────────────────────────────────────────────

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

function DeltaBadge({ current, saved }) {
  const diff = current - saved;
  if (diff === 0) return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: "#F3F4F6", color: "#9CA3AF", fontFamily: "'Space Grotesk',sans-serif" }}
    >
      unchanged
    </span>
  );
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: diff > 0 ? "#D1FAE5" : "#FEE2E2",
        color: diff > 0 ? "#047857" : "#B91C1C",
        fontFamily: "'Space Grotesk',sans-serif",
      }}
    >
      {diff > 0 ? "+" : ""}${diff}
    </span>
  );
}

function PriceCard({ plan, icon, color, accent, value, savedValue, onChange, featured = false }) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className="rounded-2xl p-6 transition-all duration-200"
      style={{
        background: "#fff",
        border: featured ? `2px solid #059669` : "1px solid rgba(17,24,39,0.07)",
        boxShadow: featured
          ? "0 4px 24px rgba(5,150,105,0.1)"
          : "0 1px 12px rgba(0,0,0,0.04)",
        position: "relative",
      }}
    >
      {featured && (
        <div
          className="absolute -top-3 left-5 text-xs font-bold px-3 py-1 rounded-full"
          style={{
            background: "linear-gradient(135deg,#059669,#047857)",
            color: "#fff",
            fontFamily: "'Space Grotesk',sans-serif",
            letterSpacing: "0.04em",
            boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
          }}
        >
          MOST POPULAR
        </div>
      )}

      {/* Plan header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${color},${accent})`, boxShadow: `0 4px 12px ${color}40` }}
          >
            {icon}
          </div>
          <div>
            <p
              className="font-bold text-gray-900 leading-none"
              style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: "15px", letterSpacing: "-0.02em" }}
            >
              {plan}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">per user / month</p>
          </div>
        </div>
        <DeltaBadge current={value} saved={savedValue} />
      </div>

      {/* Price input */}
      <div
        className="flex items-center rounded-xl overflow-hidden transition-all duration-200"
        style={{
          border: focused ? `1.5px solid #059669` : "1.5px solid rgba(17,24,39,0.1)",
          boxShadow: focused ? "0 0 0 3px rgba(5,150,105,0.08)" : "none",
        }}
      >
        <span
          className="flex items-center justify-center text-gray-400 font-bold bg-gray-50"
          style={{ width: "44px", height: "52px", fontSize: "18px", borderRight: "1.5px solid rgba(17,24,39,0.08)" }}
        >
          $
        </span>
        <input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-white text-gray-900 outline-none"
          style={{
            height: "52px",
            padding: "0 12px",
            fontSize: "28px",
            fontWeight: "800",
            fontFamily: "'Bricolage Grotesque',sans-serif",
            letterSpacing: "-0.03em",
          }}
        />
        <span
          className="flex items-center bg-gray-50 text-gray-400 text-xs font-semibold"
          style={{ height: "52px", padding: "0 12px", borderLeft: "1.5px solid rgba(17,24,39,0.08)", fontFamily: "'Space Grotesk',sans-serif" }}
        >
          / mo
        </span>
      </div>

      {/* Annual equivalent */}
      <p className="mt-2.5 text-xs text-gray-400" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        Billed annually: <span className="font-semibold text-gray-500">{fmt(value * 10)}</span>
        <span className="ml-1.5 text-emerald-600 font-semibold">(2 months free)</span>
      </p>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [prices, setPrices] = useState({ ...DEFAULTS });
  const [savedPrices, setSavedPrices] = useState({ ...DEFAULTS });
  const [saving, setSaving] = useState(false);

  const hasChanges = prices.pro !== savedPrices.pro || prices.ultra !== savedPrices.ultra;
  const uplift = prices.ultra - prices.pro;
  const upliftPct = prices.pro > 0 ? Math.round((uplift / prices.pro) * 100) : 0;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSavedPrices({ ...prices });
    setSaving(false);
  };

  const handleReset = () => setPrices({ ...DEFAULTS });

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
            Plan Prices
          </h2>
          <p className="text-sm text-gray-400 mt-1">Set monthly pricing for Pro and Ultra tiers</p>
        </div>
        <StatusBadge saved={!hasChanges} />
      </div>

      <form onSubmit={handleSave} noValidate>
        {/* Price cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <PriceCard
            plan="Pro"
            icon={
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            }
            color="#3B82F6"
            accent="#1D4ED8"
            value={prices.pro}
            savedValue={savedPrices.pro}
            onChange={(v) => setPrices((p) => ({ ...p, pro: v }))}
          />
          <PriceCard
            plan="Ultra"
            icon={
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            }
            color="#059669"
            accent="#047857"
            value={prices.ultra}
            savedValue={savedPrices.ultra}
            onChange={(v) => setPrices((p) => ({ ...p, ultra: v }))}
            featured
          />
        </div>

        {/* Uplift summary */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl mb-5"
          style={{ background: "#F8FAFB", border: "1px solid rgba(17,24,39,0.06)" }}
        >
          <span className="text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Pro → Ultra uplift
          </span>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold text-gray-800"
              style={{ fontFamily: "'Space Grotesk',sans-serif" }}
            >
              +{fmt(uplift)}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: upliftPct >= 50 ? "#D1FAE5" : "#FEF3C7",
                color: upliftPct >= 50 ? "#047857" : "#B45309",
                fontFamily: "'Space Grotesk',sans-serif",
              }}
            >
              +{upliftPct}%
            </span>
          </div>
        </div>

        {/* Validation warning */}
        {prices.ultra <= prices.pro && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5 text-xs font-semibold"
            style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid rgba(180,83,9,0.2)" }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Ultra price should be higher than Pro price
          </div>
        )}

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
            disabled={saving || !hasChanges || prices.ultra <= prices.pro}
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
              "Save changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";

// ─── helpers ────────────────────────────────────────────────────────────────

const DEFAULTS = {
  systemEnabled: false,
  rewardType: "pct",
  fixedAmount: 50,
  pctAmount: 10,
  minPurchase: 99,
  firstPurchaseOnly: true,
  expiryEnabled: false,
  expiryValue: 7,
  expiryUnit: "days",
  preventSelfReferral: true,
  preventSameIP: true,
  maxReferrals: 25,
  cooldownMinutes: 60,
};

function fmtINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
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
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: saved ? "#059669" : "#D97706" }}
      />
      {saved ? "SAVED" : "UNSAVED"}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label
      className="relative inline-flex items-center cursor-pointer"
      style={{ width: "40px", height: "22px" }}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className="w-full h-full rounded-full transition-all duration-200"
        style={{
          background: checked ? "#059669" : "rgba(17,24,39,0.15)",
        }}
      >
        <div
          className="absolute top-0.5 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{
            width: "18px",
            height: "18px",
            left: checked ? "19px" : "2px",
          }}
        />
      </div>
    </label>
  );
}

function SectionCard({ icon, iconBg, iconStroke, title, subtitle, children, badge }) {
  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: "#fff",
        border: "1px solid rgba(17,24,39,0.07)",
        boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: iconBg }}
          >
            {icon}
          </div>
          <div>
            <p
              className="font-bold text-gray-900 leading-none"
              style={{
                fontFamily: "'Bricolage Grotesque',sans-serif",
                fontSize: "14px",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

function RowItem({ label, sublabel, right }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm text-gray-700" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
        )}
      </div>
      {right}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid rgba(17,24,39,0.06)", margin: "0" }} />;
}

function NumInput({ prefix, suffix, value, onChange, width = "70px", min = 0, max }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="flex items-center rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border: focused ? "1.5px solid #059669" : "1.5px solid rgba(17,24,39,0.1)",
        boxShadow: focused ? "0 0 0 3px rgba(5,150,105,0.08)" : "none",
      }}
    >
      {prefix && (
        <span
          className="flex items-center justify-center text-gray-400 font-bold bg-gray-50 text-sm"
          style={{
            padding: "0 10px",
            height: "40px",
            borderRight: "1.5px solid rgba(17,24,39,0.08)",
            fontFamily: "'Space Grotesk',sans-serif",
          }}
        >
          {prefix}
        </span>
      )}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, parseFloat(e.target.value) || 0))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="bg-white text-gray-900 outline-none text-center font-bold"
        style={{
          width,
          height: "40px",
          fontSize: "16px",
          fontFamily: "'Bricolage Grotesque',sans-serif",
          letterSpacing: "-0.02em",
          padding: "0 6px",
        }}
      />
      {suffix && (
        <span
          className="flex items-center justify-center text-gray-400 text-xs font-semibold bg-gray-50"
          style={{
            padding: "0 10px",
            height: "40px",
            borderLeft: "1.5px solid rgba(17,24,39,0.08)",
            fontFamily: "'Space Grotesk',sans-serif",
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

function HelperText({ children, type = "info" }) {
  const styles = {
    info: { bg: "#F8FAFB", color: "#6B7280", border: "rgba(17,24,39,0.06)" },
    success: { bg: "#D1FAE5", color: "#047857", border: "rgba(5,150,105,0.2)" },
    warning: { bg: "#FEF3C7", color: "#B45309", border: "rgba(180,83,9,0.2)" },
  };
  const s = styles[type];
  return (
    <div
      className="flex items-start gap-2 px-3 py-2 rounded-xl mt-3 text-xs font-medium leading-relaxed"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, trend, trendColor = "#059669" }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#F8FAFB", border: "1px solid rgba(17,24,39,0.05)" }}
    >
      <p
        className="text-xs text-gray-400 mb-1"
        style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.02em" }}
      >
        {label}
      </p>
      <p
        className="font-extrabold text-gray-900"
        style={{
          fontFamily: "'Bricolage Grotesque',sans-serif",
          fontSize: "22px",
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </p>
      <p className="text-xs font-semibold mt-1" style={{ color: trendColor }}>
        {trend}
      </p>
    </div>
  );
}

// ─── icons ───────────────────────────────────────────────────────────────────

const IconActivity = () => (
  <svg width="16" height="16" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconGift = () => (
  <svg width="16" height="16" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const IconLink = () => (
  <svg width="16" height="16" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

const IconShield = () => (
  <svg width="16" height="16" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconSpinner = () => (
  <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
    <path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const IconSaved = () => (
  <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSave = () => (
  <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

// ─── main component ───────────────────────────────────────────────────────────

export default function ReferralSystem() {
  const [config, setConfig] = useState({ ...DEFAULTS });
  const [savedConfig, setSavedConfig] = useState({ ...DEFAULTS });
  const [saving, setSaving] = useState(false);

  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  const update = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  // Live earnings preview
  const samplePurchase = 500;
  const previewEarning =
    config.rewardType === "fixed"
      ? config.fixedAmount
      : Math.round((samplePurchase * config.pctAmount) / 100);
  const previewDetail =
    config.rewardType === "fixed"
      ? `${fmtINR(config.fixedAmount)} fixed`
      : `${config.pctAmount}%`;

  const handleSave = async () => {
    if (saving || !hasChanges) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavedConfig({ ...config });
    setSaving(false);
  };

  const handleReset = () => setConfig({ ...DEFAULTS });

  // Prepare payload for backend (ready to use)
  const getApiPayload = () => ({
    referral_system: {
      enabled: config.systemEnabled,
      reward: {
        type: config.rewardType,
        amount: config.rewardType === "fixed" ? config.fixedAmount : null,
        percentage: config.rewardType === "pct" ? config.pctAmount : null,
        trigger: "purchase_success",
        for: "referrer_only",
      },
      conditions: {
        minimum_purchase_amount: config.minPurchase,
        first_purchase_only: config.firstPurchaseOnly,
      },
      link_settings: {
        expiry_enabled: config.expiryEnabled,
        expiry_value: config.expiryEnabled ? config.expiryValue : null,
        expiry_unit: config.expiryEnabled ? config.expiryUnit : null,
      },
      fraud_protection: {
        prevent_self_referral: config.preventSelfReferral,
        prevent_same_ip: config.preventSameIP,
        max_referrals_per_user: config.maxReferrals,
        cooldown_minutes: config.cooldownMinutes,
      },
    },
  });

  return (
    <div
      className="max-w-7xl mx-auto px-6 lg:px-10 xl:px-14"
      style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
    >
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-xl font-extrabold text-gray-900 leading-none"
            style={{ fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-0.03em" }}
          >
            Referral System
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Configure rewards, link settings &amp; fraud controls
          </p>
        </div>
        <StatusBadge saved={!hasChanges} />
      </div>

      {/* ── S1: Enable ── */}
      <SectionCard
        icon={<IconActivity />}
        iconBg="#D1FAE5"
        title="Enable Referral System"
        subtitle="Globally activate or pause referrals"
        badge={
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: config.systemEnabled ? "#D1FAE5" : "#F3F4F6",
                color: config.systemEnabled ? "#047857" : "#6B7280",
                fontFamily: "'Space Grotesk',sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              {config.systemEnabled ? "ACTIVE" : "DISABLED"}
            </span>
            <Toggle
              checked={config.systemEnabled}
              onChange={(v) => update("systemEnabled", v)}
            />
          </div>
        }
      >
        {!config.systemEnabled && (
          <HelperText type="warning">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Referral system is currently disabled. No new referrals will be tracked or rewarded.
          </HelperText>
        )}
      </SectionCard>

      {/* ── S2: Reward Config ── */}
      <SectionCard
        icon={<IconGift />}
        iconBg="#FEF3C7"
        title="Reward Configuration"
        subtitle="Referrer-only · triggered on successful purchase"
      >
        {/* Reward type selector */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Reward type</span>
          <div
            className="flex rounded-xl overflow-hidden p-0.5"
            style={{ background: "#F8FAFB", border: "1px solid rgba(17,24,39,0.07)" }}
          >
            {["fixed", "pct"].map((t) => (
              <button
                key={t}
                onClick={() => update("rewardType", t)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  background: config.rewardType === t ? "#fff" : "transparent",
                  color: config.rewardType === t ? "#059669" : "#9CA3AF",
                  border: config.rewardType === t ? "1px solid rgba(5,150,105,0.25)" : "1px solid transparent",
                  boxShadow: config.rewardType === t ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {t === "fixed" ? "Fixed ₹" : "Percentage %"}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {config.rewardType === "fixed" ? (
          <RowItem
            label="Reward amount"
            sublabel="Fixed ₹ given to referrer per successful purchase"
            right={
              <NumInput
                prefix="₹"
                value={config.fixedAmount}
                onChange={(v) => update("fixedAmount", v)}
              />
            }
          />
        ) : (
          <RowItem
            label="Percentage of purchase"
            sublabel="Referrer earns this % of the referred user's order"
            right={
              <NumInput
                suffix="%"
                value={config.pctAmount}
                onChange={(v) => update("pctAmount", Math.min(100, v))}
                max={100}
              />
            }
          />
        )}

        <HelperText type="success">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Reward is given only when referred user completes a purchase. No reward on signup.
        </HelperText>
      </SectionCard>

      {/* ── S3: Conditions ── */}
      <SectionCard
        icon={<IconCheck />}
        iconBg="#EDE9FE"
        title="Referral Conditions"
        subtitle="When is the reward triggered?"
      >
        {/* Fixed condition pill */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1 text-xs font-semibold"
          style={{ background: "#D1FAE5", color: "#047857" }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Reward only on successful payment — always enforced
        </div>

        <Divider />

        <RowItem
          label="Minimum purchase amount"
          sublabel="Reward won't apply below this threshold"
          right={
            <NumInput
              prefix="₹"
              value={config.minPurchase}
              onChange={(v) => update("minPurchase", v)}
            />
          }
        />

        <Divider />

        <RowItem
          label="First purchase only"
          sublabel="Reward triggers only on referred user's first order"
          right={
            <Toggle
              checked={config.firstPurchaseOnly}
              onChange={(v) => update("firstPurchaseOnly", v)}
            />
          }
        />
      </SectionCard>

      {/* ── S4: Link Settings ── */}
      <SectionCard
        icon={<IconLink />}
        iconBg="#E0F2FE"
        title="Referral Link Settings"
        subtitle="Expiry and link lifetime control"
      >
        <RowItem
          label="Enable referral link expiry"
          sublabel="Links become invalid after set duration"
          right={
            <Toggle
              checked={config.expiryEnabled}
              onChange={(v) => update("expiryEnabled", v)}
            />
          }
        />

        {config.expiryEnabled && (
          <>
            <Divider />
            <RowItem
              label="Expiry duration"
              sublabel="How long until a link expires"
              right={
                <div className="flex items-center gap-2">
                  <NumInput
                    value={config.expiryValue}
                    onChange={(v) => update("expiryValue", v)}
                    min={1}
                    width="56px"
                  />
                  <div
                    className="flex items-center rounded-xl overflow-hidden"
                    style={{ border: "1.5px solid rgba(17,24,39,0.1)" }}
                  >
                    <select
                      value={config.expiryUnit}
                      onChange={(e) => update("expiryUnit", e.target.value)}
                      className="bg-white text-gray-700 text-xs font-semibold outline-none"
                      style={{
                        height: "40px",
                        padding: "0 10px",
                        fontFamily: "'Space Grotesk',sans-serif",
                      }}
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>
              }
            />
            <HelperText type="warning">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Expired referral links cannot be used. Users can request a new link from their dashboard.
            </HelperText>
          </>
        )}
      </SectionCard>

      {/* ── S5: Fraud Protection ── */}
      <SectionCard
        icon={<IconShield />}
        iconBg="#FEE2E2"
        title="Fraud Protection"
        subtitle="Prevent abuse and gaming of the referral system"
      >
        <RowItem
          label="Prevent self-referral"
          sublabel="Users cannot use their own referral link"
          right={
            <Toggle
              checked={config.preventSelfReferral}
              onChange={(v) => update("preventSelfReferral", v)}
            />
          }
        />
        <Divider />
        <RowItem
          label="Block same device / IP"
          sublabel="Detect and reject duplicate referrals from one source"
          right={
            <Toggle
              checked={config.preventSameIP}
              onChange={(v) => update("preventSameIP", v)}
            />
          }
        />
        <Divider />
        <RowItem
          label="Max referrals per user"
          sublabel="Lifetime referral cap per account"
          right={
            <NumInput
              suffix="users"
              value={config.maxReferrals}
              onChange={(v) => update("maxReferrals", v)}
              min={1}
              width="54px"
            />
          }
        />
        <Divider />
        <RowItem
          label="Cooldown between referrals"
          sublabel="Minimum gap before next referral is counted"
          right={
            <NumInput
              suffix="min"
              value={config.cooldownMinutes}
              onChange={(v) => update("cooldownMinutes", v)}
              min={0}
              width="54px"
            />
          }
        />
      </SectionCard>

      {/* ── S6: Earnings Preview ── */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{
          background: "#F0FDF4",
          border: "1.5px solid rgba(5,150,105,0.2)",
        }}
      >
        <p
          className="text-xs font-bold mb-2"
          style={{
            color: "#059669",
            fontFamily: "'Space Grotesk',sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          LIVE EARNINGS PREVIEW
        </p>
        <p
          className="font-extrabold text-emerald-800"
          style={{
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontSize: "16px",
            letterSpacing: "-0.02em",
          }}
        >
          If user purchases {fmtINR(samplePurchase)} plan → referrer earns{" "}
          {fmtINR(previewEarning)} ({previewDetail})
        </p>
        <p className="text-xs text-emerald-600 mt-1.5">
          Reward credited to referrer's wallet after payment confirmation · No reward to referred user
        </p>
      </div>

      {/* ── S7: Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total referrals" value="1,248" trend="↑ +38 this week" />
        <StatCard label="Successful purchases" value="834" trend="66.8% conversion" />
        <StatCard
          label="Total commission paid"
          value="₹41,700"
          trend="Lifetime disbursed"
        />
        <StatCard
          label="Pending rewards"
          value="₹3,850"
          trend="Awaiting payment"
          trendColor="#D97706"
        />
      </div>

      {/* ── S8: Save & Status ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "#fff",
          border: "1px solid rgba(17,24,39,0.07)",
          boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 transition-all duration-200 hover:bg-gray-100"
            style={{ fontFamily: "'Space Grotesk',sans-serif" }}
          >
            Reset defaults
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg,#059669,#047857)",
              boxShadow:
                saving || !hasChanges ? "none" : "0 4px 14px rgba(5,150,105,0.35)",
              fontFamily: "'Space Grotesk',sans-serif",
            }}
          >
            {saving ? (
              <>
                <IconSpinner />
                Saving…
              </>
            ) : !hasChanges ? (
              <>
                <IconSaved />
                Saved
              </>
            ) : (
              <>
                <IconSave />
                Save changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

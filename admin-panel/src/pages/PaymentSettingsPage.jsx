import { useState } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const CheckIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LockIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ZapIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const SaveIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, size = "md" }) {
  const sizes = {
    md: { track: "w-11 h-6", thumb: "w-5 h-5", translate: "translate-x-5" },
    sm: { track: "w-8 h-4", thumb: "w-3.5 h-3.5", translate: "translate-x-4" },
  };
  const s = sizes[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center flex-shrink-0 ${s.track} rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
      style={{ background: checked ? "linear-gradient(135deg, #059669, #047857)" : "#E5E7EB", boxShadow: checked ? "0 2px 8px rgba(5,150,105,0.35)" : "none" }}
    >
      <span
        className={`${s.thumb} rounded-full bg-white shadow transition-transform duration-300 ${checked ? s.translate : "translate-x-0.5"}`}
      />
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, icon, children, accent = false }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-200"
      style={{
        background: "#FFFFFF",
        borderColor: accent ? "rgba(5,150,105,0.2)" : "rgba(17,24,39,0.08)",
        boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b"
        style={{ borderColor: "rgba(17,24,39,0.06)", background: accent ? "rgba(5,150,105,0.03)" : "#FAFAFA" }}
      >
        {icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #059669, #047857)", boxShadow: "0 3px 10px rgba(5,150,105,0.25)" }}
          >
            {icon}
          </div>
        )}
        <div>
          <h3
            className="text-sm font-bold text-gray-800 leading-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            {title}
          </h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {/* Body */}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({ label, placeholder, value, onChange, type = "text", isSecret = false, badge, error, helperText, optional = false }) {
  const [show, setShow] = useState(false);
  const inputType = isSecret ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.03em" }}>
          {label}
          {optional && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
              optional
            </span>
          )}
        </label>
        {badge && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: badge === "public" ? "#D1FAE5" : "#FEF3C7", color: badge === "public" ? "#047857" : "#B45309" }}
          >
            {badge === "public" ? "PUBLIC" : "PRIVATE"}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: "#F8FAFB",
            border: `1.5px solid ${error ? "#FCA5A5" : "rgba(17,24,39,0.1)"}`,
            color: "#111827",
          }}
          onFocus={(e) => {
            e.target.style.border = "1.5px solid #059669";
            e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.border = `1.5px solid ${error ? "#FCA5A5" : "rgba(17,24,39,0.1)"}`;
            e.target.style.boxShadow = "none";
          }}
        />
        {isSecret && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <EyeIcon open={show} />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-400 flex items-center gap-1"><span>⚠</span> {error}</p>}
      {helperText && !error && (
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <LockIcon />
          {helperText}
        </p>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const configs = {
    connected: { label: "Connected", bg: "#D1FAE5", color: "#047857", dot: "#059669" },
    invalid: { label: "Invalid Keys", bg: "#FEE2E2", color: "#B91C1C", dot: "#EF4444" },
    not_configured: { label: "Not Configured", bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  };
  const cfg = configs[status] || configs.not_configured;
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em" }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: cfg.dot, boxShadow: `0 0 0 2px ${cfg.dot}33` }}
      />
      {cfg.label.toUpperCase()}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PaymentSettingsPage() {
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [provider, setProvider] = useState("razorpay");
  const [isLive, setIsLive] = useState(false);
  const [showLiveWarning, setShowLiveWarning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("not_configured"); // connected | invalid | not_configured
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null); // null | 'success' | 'error'
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Credentials state
  const [razorpay, setRazorpay] = useState({ keyId: "", keySecret: "", webhookSecret: "" });
  const [stripe, setStripe] = useState({ publishableKey: "", secretKey: "", webhookSecret: "" });

  const handleModeToggle = (val) => {
    if (val) {
      setShowLiveWarning(true);
    } else {
      setIsLive(false);
      setShowLiveWarning(false);
    }
  };

  const confirmLive = () => { setIsLive(true); setShowLiveWarning(false); };
  const cancelLive = () => setShowLiveWarning(false);

  const validate = () => {
    const errs = {};
    if (provider === "razorpay") {
      if (!razorpay.keyId.trim()) errs.keyId = "Key ID is required";
      if (!razorpay.keySecret.trim()) errs.keySecret = "Key Secret is required";
    } else {
      if (!stripe.publishableKey.trim()) errs.publishableKey = "Publishable Key is required";
      if (!stripe.secretKey.trim()) errs.secretKey = "Secret Key is required";
      if (!stripe.webhookSecret.trim()) errs.webhookSecret = "Webhook Secret is required for Stripe";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validate()) return;
    setTestLoading(true);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 1800));
    // Simulate: if keys look plausible, success
    const creds = provider === "razorpay" ? razorpay : stripe;
    const firstKey = Object.values(creds)[0];
    const ok = firstKey.length > 8;
    setTestResult(ok ? "success" : "error");
    setConnectionStatus(ok ? "connected" : "invalid");
    setTestLoading(false);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaveLoading(true);
    setSaveSuccess(false);
    await new Promise((r) => setTimeout(r, 1600));
    setSaveLoading(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const cred = provider === "razorpay" ? razorpay : stripe;
  const setCred = provider === "razorpay"
    ? (key, val) => setRazorpay((p) => ({ ...p, [key]: val }))
    : (key, val) => setStripe((p) => ({ ...p, [key]: val }));

  return (
    <div
      className="min-h-full px-5 lg:px-8 py-7"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Page Header */}
      <div className="mb-7 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2
            className="text-xl font-extrabold text-gray-900 leading-tight"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: "-0.03em" }}
          >
            Payment Integration
          </h2>
          <p className="text-sm text-gray-400 mt-1">Configure and manage your payment gateway settings</p>
        </div>
        <StatusBadge status={connectionStatus} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left Column — Main settings */}
        <div className="xl:col-span-2 space-y-5">

          {/* SECTION 1: Enable Payment System */}
          <SectionCard
            title="Payment System"
            subtitle="Enable or disable payments globally"
            icon={<ZapIcon />}
            accent={paymentsEnabled}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Enable Payments</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {paymentsEnabled ? "Payment processing is active across your platform" : "No payments will be processed while this is off"}
                </p>
              </div>
              <Toggle checked={paymentsEnabled} onChange={setPaymentsEnabled} />
            </div>

            {!paymentsEnabled && (
              <div
                className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs"
                style={{ background: "#FFF7ED", border: "1px solid rgba(217,119,6,0.2)", color: "#92400E" }}
              >
                <AlertIcon />
                <p>Payments are globally disabled. Enable to start accepting transactions.</p>
              </div>
            )}
          </SectionCard>

          {/* SECTION 2: Provider Selection */}
          <SectionCard
            title="Payment Provider"
            subtitle="Choose your payment gateway"
            icon={
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            }
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "razorpay", label: "Razorpay", desc: "Popular in India & SEA", flag: "🇮🇳" },
                { value: "stripe", label: "Stripe", desc: "Global coverage", flag: "🌐" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setProvider(opt.value); setErrors({}); setTestResult(null); }}
                  className="relative flex flex-col items-start px-4 py-4 rounded-xl border-2 transition-all duration-200 text-left"
                  style={{
                    borderColor: provider === opt.value ? "#059669" : "rgba(17,24,39,0.1)",
                    background: provider === opt.value ? "rgba(5,150,105,0.04)" : "#FAFAFA",
                    boxShadow: provider === opt.value ? "0 0 0 1px rgba(5,150,105,0.15), 0 4px 12px rgba(5,150,105,0.08)" : "none",
                  }}
                >
                  {provider === opt.value && (
                    <span
                      className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
                    >
                      <CheckIcon />
                    </span>
                  )}
                  <span className="text-xl mb-2">{opt.flag}</span>
                  <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{opt.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* SECTION 3: Mode Selection */}
          <SectionCard
            title="Environment Mode"
            subtitle="Test safely before going live"
            icon={
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            }
          >
            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: isLive ? "rgba(5,150,105,0.05)" : "#F8FAFB", border: "1.5px solid", borderColor: isLive ? "rgba(5,150,105,0.2)" : "rgba(17,24,39,0.08)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: isLive ? "linear-gradient(135deg, #059669, #047857)" : "#E5E7EB", color: isLive ? "#fff" : "#6B7280" }}
                >
                  {isLive ? "🟢" : "🧪"}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: isLive ? "#047857" : "#374151" }}>
                    {isLive ? "Live Mode" : "Test Mode"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isLive ? "Real transactions are being processed" : "Safe sandbox — no real money moves"}
                  </p>
                </div>
              </div>
              <Toggle checked={isLive} onChange={handleModeToggle} />
            </div>

            {/* Live Mode Warning Modal */}
            {showLiveWarning && (
              <div
                className="mt-4 p-4 rounded-xl border"
                style={{ background: "#FFF1F2", borderColor: "#FECDD3" }}
              >
                <div className="flex items-start gap-2.5 mb-4">
                  <span className="text-red-400 mt-0.5"><AlertIcon /></span>
                  <div>
                    <p className="text-sm font-bold text-red-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Switch to Live Mode?</p>
                    <p className="text-xs text-red-500 mt-1">Real transactions will be processed and actual money will be charged. Make sure your credentials are correct.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={confirmLive}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
                    style={{ background: "linear-gradient(135deg, #DC2626, #B91C1C)", boxShadow: "0 2px 8px rgba(220,38,38,0.3)" }}
                  >
                    Yes, Go Live
                  </button>
                  <button
                    onClick={cancelLive}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100"
                    style={{ background: "#F3F4F6" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </SectionCard>

          {/* SECTION 4 & 5: Dynamic Credentials */}
          <SectionCard
            title={`${provider === "razorpay" ? "Razorpay" : "Stripe"} Credentials`}
            subtitle="Enter your API keys from the provider dashboard"
            icon={<LockIcon />}
          >
            <div className="space-y-4">
              {provider === "razorpay" ? (
                <>
                  <InputField
                    label="Key ID"
                    placeholder="rzp_test_xxxxxxxxxxxx"
                    value={razorpay.keyId}
                    onChange={(v) => setCred("keyId", v)}
                    badge="public"
                    error={errors.keyId}
                  />
                  <InputField
                    label="Key Secret"
                    placeholder="••••••••••••••••••••"
                    value={razorpay.keySecret}
                    onChange={(v) => setCred("keySecret", v)}
                    isSecret
                    badge="private"
                    helperText="Secret keys are stored securely on backend"
                    error={errors.keySecret}
                  />
                  <InputField
                    label="Webhook Secret"
                    placeholder="whsec_xxxxxxxxxxxx"
                    value={razorpay.webhookSecret}
                    onChange={(v) => setCred("webhookSecret", v)}
                    isSecret
                    optional
                    helperText="Secret keys are stored securely on backend"
                  />
                </>
              ) : (
                <>
                  <InputField
                    label="Publishable Key"
                    placeholder="pk_test_xxxxxxxxxxxx"
                    value={stripe.publishableKey}
                    onChange={(v) => setCred("publishableKey", v)}
                    badge="public"
                    error={errors.publishableKey}
                  />
                  <InputField
                    label="Secret Key"
                    placeholder="sk_test_••••••••••••"
                    value={stripe.secretKey}
                    onChange={(v) => setCred("secretKey", v)}
                    isSecret
                    badge="private"
                    helperText="Secret keys are stored securely on backend"
                    error={errors.secretKey}
                  />
                  <InputField
                    label="Webhook Secret"
                    placeholder="whsec_xxxxxxxxxxxx"
                    value={stripe.webhookSecret}
                    onChange={(v) => setCred("webhookSecret", v)}
                    isSecret
                    helperText="Secret keys are stored securely on backend"
                    error={errors.webhookSecret}
                  />
                </>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column — Status, Test, Save */}
        <div className="space-y-5">

          {/* SECTION 6: Connection Status */}
          <SectionCard
            title="Connection Status"
            subtitle="Live verification result"
            icon={
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
              </svg>
            }
          >
            <div className="flex flex-col items-center gap-3 py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                style={{
                  background: connectionStatus === "connected"
                    ? "linear-gradient(135deg, rgba(5,150,105,0.15), rgba(4,120,87,0.1))"
                    : connectionStatus === "invalid"
                    ? "rgba(239,68,68,0.1)"
                    : "#F3F4F6",
                  border: "1px solid",
                  borderColor: connectionStatus === "connected" ? "rgba(5,150,105,0.25)" : connectionStatus === "invalid" ? "rgba(239,68,68,0.2)" : "rgba(17,24,39,0.08)",
                }}
              >
                {connectionStatus === "connected" ? "✅" : connectionStatus === "invalid" ? "❌" : "🔌"}
              </div>
              <StatusBadge status={connectionStatus} />
              <p className="text-xs text-gray-400 text-center">
                {connectionStatus === "connected"
                  ? "Your API keys are valid and working"
                  : connectionStatus === "invalid"
                  ? "Please check your credentials"
                  : "Run a test to verify your setup"}
              </p>
            </div>
          </SectionCard>

          {/* SECTION 7: Test Connection */}
          <SectionCard
            title="Test Connection"
            subtitle="Verify your credentials"
            icon={<RefreshIcon />}
          >
            <div className="space-y-3">
              <button
                onClick={handleTestConnection}
                disabled={testLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  background: testLoading ? "#E5E7EB" : "linear-gradient(135deg, #059669, #047857)",
                  color: testLoading ? "#9CA3AF" : "#fff",
                  boxShadow: testLoading ? "none" : "0 4px 14px rgba(5,150,105,0.3)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {testLoading ? (
                  <>
                    <span
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: "#D1D5DB", borderTopColor: "#6B7280" }}
                    />
                    Testing…
                  </>
                ) : (
                  <>
                    <RefreshIcon />
                    Test Connection
                  </>
                )}
              </button>

              {testResult === "success" && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: "#D1FAE5", color: "#047857", border: "1px solid rgba(5,150,105,0.2)" }}
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                    <CheckIcon />
                  </span>
                  Connection successful! Keys are valid.
                </div>
              )}
              {testResult === "error" && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: "#FEE2E2", color: "#B91C1C", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <span className="flex-shrink-0"><AlertIcon /></span>
                  Connection failed. Check your API keys.
                </div>
              )}
            </div>
          </SectionCard>

          {/* SECTION 8: Save Settings */}
          <SectionCard
            title="Save Settings"
            subtitle="Persist your configuration"
            icon={<SaveIcon />}
          >
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  background: saveSuccess
                    ? "linear-gradient(135deg, #059669, #047857)"
                    : saveLoading
                    ? "#E5E7EB"
                    : "linear-gradient(135deg, #111827, #1F2937)",
                  color: saveLoading ? "#9CA3AF" : "#fff",
                  boxShadow: saveLoading ? "none" : saveSuccess ? "0 4px 14px rgba(5,150,105,0.3)" : "0 4px 14px rgba(17,24,39,0.2)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {saveLoading ? (
                  <>
                    <span
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: "#D1D5DB", borderTopColor: "#6B7280" }}
                    />
                    Saving…
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckIcon />
                    Saved Successfully!
                  </>
                ) : (
                  <>
                    <SaveIcon />
                    Save Settings
                  </>
                )}
              </button>

              {saveSuccess && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: "#D1FAE5", color: "#047857", border: "1px solid rgba(5,150,105,0.2)" }}
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                    <CheckIcon />
                  </span>
                  Settings have been saved.
                </div>
              )}

              <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                <LockIcon />
                Credentials encrypted before storage
              </p>
            </div>
          </SectionCard>

          {/* Quick Summary Card */}
          <div
            className="rounded-2xl p-4 border"
            style={{ background: "#F8FAFB", borderColor: "rgba(17,24,39,0.08)" }}
          >
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Current Config
            </p>
            <div className="space-y-2">
              {[
                { label: "Provider", value: provider === "razorpay" ? "🇮🇳 Razorpay" : "🌐 Stripe" },
                { label: "Mode", value: isLive ? "🟢 Live" : "🧪 Test" },
                { label: "Payments", value: paymentsEnabled ? "✅ Enabled" : "❌ Disabled" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span className="text-xs font-semibold text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

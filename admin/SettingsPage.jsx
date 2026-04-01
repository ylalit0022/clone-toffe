function Section({ title, children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid rgba(17,24,39,0.08)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(17,24,39,0.07)", background: "#F8FAFB" }}>
        <h3 className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="sm:w-48 flex-shrink-0">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Toggle({ defaultOn = false }) {
  return (
    <button
      className="relative w-10 h-6 rounded-full transition-colors focus:outline-none"
      style={{ background: defaultOn ? "#059669" : "#D1D5DB" }}
    >
      <span
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
        style={{ left: defaultOn ? "22px" : "4px" }}
      />
    </button>
  );
}

function Input({ placeholder, defaultValue, type = "text" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="w-full px-3 py-2 rounded-xl text-sm text-gray-700 outline-none transition-all"
      style={{
        background: "#F8FAFB",
        border: "1px solid rgba(17,24,39,0.1)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      onFocus={e => e.target.style.borderColor = "rgba(5,150,105,0.4)"}
      onBlur={e => e.target.style.borderColor = "rgba(17,24,39,0.1)"}
    />
  );
}

export default function SettingsPage() {
  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div>
        <h2 className="text-xl font-extrabold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
          Settings
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your admin preferences and configuration</p>
      </div>

      <Section title="General">
        <Field label="Site Name" hint="Shown in browser tab">
          <Input defaultValue="Tranzo Admin" />
        </Field>
        <Field label="Admin Email" hint="For system alerts">
          <Input defaultValue="admin@tranzo.io" type="email" />
        </Field>
        <Field label="Timezone">
          <select
            className="w-full px-3 py-2 rounded-xl text-sm text-gray-700 outline-none"
            style={{ background: "#F8FAFB", border: "1px solid rgba(17,24,39,0.1)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <option>Asia/Kolkata (IST, UTC+5:30)</option>
            <option>America/New_York (EST, UTC-5)</option>
            <option>Europe/London (GMT, UTC+0)</option>
          </select>
        </Field>
      </Section>

      <Section title="Notifications">
        <Field label="Email Alerts" hint="New signups and events">
          <Toggle defaultOn={true} />
        </Field>
        <Field label="Transfer Reports" hint="Daily summary emails">
          <Toggle defaultOn={false} />
        </Field>
        <Field label="Security Alerts" hint="Suspicious login attempts">
          <Toggle defaultOn={true} />
        </Field>
      </Section>

      <Section title="Security">
        <Field label="Two-Factor Auth" hint="TOTP via authenticator app">
          <div className="flex items-center gap-3">
            <Toggle defaultOn={false} />
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Recommended</span>
          </div>
        </Field>
        <Field label="Session Timeout" hint="Auto logout after inactivity">
          <select
            className="w-full px-3 py-2 rounded-xl text-sm text-gray-700 outline-none"
            style={{ background: "#F8FAFB", border: "1px solid rgba(17,24,39,0.1)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <option>30 minutes</option>
            <option>1 hour</option>
            <option>4 hours</option>
            <option>Never</option>
          </select>
        </Field>
        <Field label="Current Password">
          <Input placeholder="Enter current password" type="password" />
        </Field>
        <Field label="New Password">
          <Input placeholder="Enter new password" type="password" />
        </Field>
      </Section>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 transition-colors"
          style={{ background: "#F8FAFB", border: "1px solid rgba(17,24,39,0.1)" }}
        >
          Cancel
        </button>
        <button
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg,#059669,#047857)", boxShadow: "0 4px 12px rgba(5,150,105,0.25)" }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

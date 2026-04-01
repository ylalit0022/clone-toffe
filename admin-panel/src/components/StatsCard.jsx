export default function StatsCard({ title, value, change, positive, icon, accent }) {
  const colors = {
    emerald: {
      bg: "#D1FAE5",
      text: "#047857",
      iconBg: "linear-gradient(135deg, #059669, #047857)",
      glow: "rgba(5,150,105,0.15)",
    },
    amber: {
      bg: "#FEF3C7",
      text: "#B45309",
      iconBg: "linear-gradient(135deg, #D97706, #B45309)",
      glow: "rgba(217,119,6,0.15)",
    },
  };
  const c = colors[accent] || colors.emerald;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(17,24,39,0.08)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-gray-500">{title}</p>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: c.iconBg, boxShadow: `0 4px 12px ${c.glow}` }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p
          className="text-2xl font-extrabold text-gray-900 leading-none"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em" }}
        >
          {value}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: c.bg, color: c.text }}
          >
            {positive ? "↑" : "↓"} {change}
          </span>
          <span className="text-xs text-gray-400">vs last month</span>
        </div>
      </div>
    </div>
  );
}

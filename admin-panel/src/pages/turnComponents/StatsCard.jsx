// StatsCard.jsx
// Reusable stats card component — matches Tranzo design system
// Fonts: Plus Jakarta Sans + Space Grotesk | Accent: Emerald #059669

import { useState } from "react";

/**
 * @param {string}  title      - Card title
 * @param {string}  value      - Primary metric value
 * @param {"up"|"down"|"neutral"} trend
 * @param {string}  trendValue - e.g. "+12.4%"
 * @param {string}  subtext    - Secondary description line
 * @param {React.ReactNode} icon - Optional icon element
 * @param {"green"|"amber"|"blue"|"rose"} accent - Color variant
 */
export default function StatsCard({
  title,
  value,
  trend = "neutral",
  trendValue,
  subtext,
  icon,
  accent = "green",
}) {
  const [hovered, setHovered] = useState(false);

  const accents = {
    green: {
      iconBg: "rgba(5,150,105,0.08)",
      iconColor: "#059669",
      trendUp: "#059669",
      trendUpBg: "rgba(5,150,105,0.08)",
      trendDown: "#DC2626",
      trendDownBg: "rgba(220,38,38,0.08)",
      dot: "#059669",
    },
    amber: {
      iconBg: "rgba(217,119,6,0.08)",
      iconColor: "#D97706",
      trendUp: "#059669",
      trendUpBg: "rgba(5,150,105,0.08)",
      trendDown: "#DC2626",
      trendDownBg: "rgba(220,38,38,0.08)",
      dot: "#D97706",
    },
    blue: {
      iconBg: "rgba(59,130,246,0.08)",
      iconColor: "#3B82F6",
      trendUp: "#059669",
      trendUpBg: "rgba(5,150,105,0.08)",
      trendDown: "#DC2626",
      trendDownBg: "rgba(220,38,38,0.08)",
      dot: "#3B82F6",
    },
    rose: {
      iconBg: "rgba(244,63,94,0.08)",
      iconColor: "#F43F5E",
      trendUp: "#059669",
      trendUpBg: "rgba(5,150,105,0.08)",
      trendDown: "#DC2626",
      trendDownBg: "rgba(220,38,38,0.08)",
      dot: "#F43F5E",
    },
  };

  const a = accents[accent];

  const trendColor =
    trend === "up" ? a.trendUp : trend === "down" ? a.trendDown : "#6B7280";
  const trendBg =
    trend === "up" ? a.trendUpBg : trend === "down" ? a.trendDownBg : "rgba(107,114,128,0.08)";

  const trendArrow =
    trend === "up" ? (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 9.5V2.5M6 2.5L2.5 6M6 2.5L9.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : trend === "down" ? (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 2.5V9.5M6 9.5L2.5 6M6 9.5L9.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(17,24,39,0.08)",
        borderRadius: "16px",
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.10)"
          : "0 1px 3px rgba(0,0,0,0.06)",
        padding: "20px 24px",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle dot accent top-right */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "80px",
          height: "80px",
          background: `radial-gradient(circle at top right, ${a.dot}18, transparent 70%)`,
          borderRadius: "0 16px 0 80px",
          pointerEvents: "none",
        }}
      />

      {/* Top row: icon + trend badge */}
      <div className="flex items-start justify-between mb-3">
        {icon ? (
          <div
            style={{
              background: a.iconBg,
              color: a.iconColor,
              borderRadius: "10px",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        ) : (
          <div style={{ width: "36px", height: "36px" }} />
        )}

        {trendValue && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "11px",
              fontWeight: 700,
              color: trendColor,
              background: trendBg,
              borderRadius: "999px",
              padding: "3px 8px",
            }}
          >
            {trendArrow}
            {trendValue}
          </span>
        )}
      </div>

      {/* Value */}
      <p
        style={{
          fontSize: "26px",
          fontWeight: 800,
          color: "#111827",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          fontFamily: "'Space Grotesk', sans-serif",
          marginBottom: "4px",
        }}
      >
        {value}
      </p>

      {/* Title */}
      <p
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "2px",
        }}
      >
        {title}
      </p>

      {/* Subtext */}
      {subtext && (
        <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>
          {subtext}
        </p>
      )}
    </div>
  );
}

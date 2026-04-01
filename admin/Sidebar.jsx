import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Users",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Settings",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function Sidebar({ active, setActive, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          w-64 bg-white border-r border-gray-100
          shadow-[4px_0_24px_rgba(0,0,0,0.05)]
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:shadow-none
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm shadow-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #059669, #047857)", boxShadow: "0 4px 12px rgba(5,150,105,0.3)" }}
          >
            ⚡
          </div>
          <div>
            <span
              className="font-extrabold text-lg tracking-tight text-gray-900 leading-none"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: "-0.03em" }}
            >
              Tranzo<span style={{ color: "#059669" }}>.</span>
            </span>
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Main Menu
          </p>
          {navItems.map((item) => {
            const isActive = active === item.label;
            return (
              <button
                key={item.label}
                onClick={() => { setActive(item.label); setMobileOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-200 text-left group
                  ${isActive
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }
                `}
                style={isActive ? {
                  background: "linear-gradient(135deg, #059669, #047857)",
                  boxShadow: "0 4px 12px rgba(5,150,105,0.25)"
                } : {}}
              >
                <span className={`transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-emerald-600"}`}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom profile card */}
        <div className="px-3 pb-5">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ background: "#F8FAFB", borderColor: "rgba(17,24,39,0.08)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #D97706, #B45309)" }}
            >
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">admin@tranzo.io</p>
            </div>
            <svg width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
}

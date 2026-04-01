import { NavLink } from "react-router-dom";
import routes from "../routes";

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

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
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #059669, #047857)", boxShadow: "0 4px 12px rgba(5,150,105,0.3)" }}
          >
            ⚡
          </div>
          <div>
            <span
              className="font-extrabold text-lg text-gray-900 leading-none"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: "-0.03em" }}
            >
              Tranzo<span style={{ color: "#059669" }}>.</span>
            </span>
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p
            className="px-3 mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Main Menu
          </p>

          {routes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              end={route.path === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-200 group no-underline
                ${isActive
                  ? "text-white shadow-md"
                  : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                }
              `}
              style={({ isActive }) =>
                isActive
                  ? { background: "linear-gradient(135deg, #059669, #047857)", boxShadow: "0 4px 12px rgba(5,150,105,0.25)" }
                  : {}
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-emerald-600"}`}>
                    {route.icon}
                  </span>
                  {route.label}
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile card */}
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

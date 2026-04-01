import { useLocation } from "react-router-dom";
import routes from "../routes";

function getPageTitle(pathname) {
  const match = routes.find((r) =>
    r.path === "/" ? pathname === "/" : pathname.startsWith(r.path)
  );
  return match?.label ?? "Admin";
}

export default function Navbar({ setMobileOpen }) {
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-5 lg:px-8"
      style={{
        height: "62px",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(17,24,39,0.08)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div>
          <h1
            className="text-base font-bold text-gray-900 leading-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            {pageTitle}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Welcome back, Admin</p>
        </div>
      </div>

      {/* Right: Search + Notif + Avatar */}
      <div className="flex items-center gap-3">
        {/* Search bar - hidden on small */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400"
          style={{ background: "#F8FAFB", border: "1px solid rgba(17,24,39,0.08)" }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-gray-600 text-sm w-36 placeholder-gray-400"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: "#D97706" }}
          />
        </button>

        {/* Status pill */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: "#D1FAE5",
            color: "#047857",
            border: "1px solid rgba(5,150,105,0.25)",
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.04em",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#059669", boxShadow: "0 0 0 2px rgba(5,150,105,0.2)" }}
          />
          LIVE
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #059669, #047857)",
            boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          AD
        </div>
      </div>
    </header>
  );
}

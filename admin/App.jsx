import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";

const pages = {
  Dashboard: <DashboardPage />,
  Users: <UsersPage />,
  Settings: <SettingsPage />,
};

export default function App() {
  const [active, setActive] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Subtle background canvas matching Tranzo theme */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 900px 600px at 10% 0%, rgba(5,150,105,0.04), transparent 60%)," +
            "radial-gradient(ellipse 700px 500px at 90% 100%, rgba(217,119,6,0.03), transparent 55%)",
        }}
      />

      <div
        className="relative z-10 flex h-screen overflow-hidden"
        style={{ background: "#F8FAFB", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Sidebar */}
        <Sidebar
          active={active}
          setActive={setActive}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Navbar active={active} setMobileOpen={setMobileOpen} />
          <main className="flex-1 overflow-y-auto">
            {pages[active]}
          </main>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

const ICONS = {
  dashboard: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  intake: "M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2zm2 5h6M9 12h6M9 16h4",
  referral: "M12 3v9h9A9 9 0 1 1 12 3zm3 0a6 6 0 0 1 6 6h-6z",
  inventory: "M4 7.5 12 3l8 4.5v9L12 21l-8-4.5zM4 7.5l8 4.5 8-4.5M12 12v9",
  estimate: "M4 7h16M7 7v10a3 3 0 0 0 6 0V7M17 7v10a3 3 0 0 1-6 0",
  config: "M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L6.6 17l.1-.1A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.5-1h-.2v-3h.2A1.7 1.7 0 0 0 7 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 8l-.1.1A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1z",
  password: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5zM12 15v2",
  users: "M16.5 20a5.5 5.5 0 0 0-11 0M11 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 12a3 3 0 1 0 0-6M19 20a4.5 4.5 0 0 0-3.2-4.3",
};

export function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

export function firstName(displayName) {
  return (displayName ?? "").trim().split(/\s+/)[0] || "there";
}

function MenuLink({ to, icon, end, children }) {
  return (
    <NavLink className={({ isActive }) => "menu-link" + (isActive ? " active" : "")} to={to} end={end}>
      <span className="menu-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d={ICONS[icon]} /></svg>
      </span>
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const { profile, hasPermission, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    const onResize = () => window.innerWidth >= 992 && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  return (
    <div className="admin-layout">
      <aside className="sidebar" id="sidebar-navigation">
        <div className="sidebar-header">
          <Link className="brand" to="/" aria-label="Vision Express home">
            <img src="/images/ve-logo.png" alt="Vision Express" />
          </Link>
          <button className="sidebar-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <nav className="menu nav" aria-label="Main navigation">
          <MenuLink to="/" icon="dashboard" end>Dashboard</MenuLink>
          {hasPermission("intake_form") && <MenuLink to="/intake-form" icon="intake">Intake Form</MenuLink>}
          <MenuLink to="/referral-source" icon="referral">Referral Source</MenuLink>
          {hasPermission("inventory_check") && <MenuLink to="/inventory-tracking" icon="inventory">Inventory Tracking</MenuLink>}
          <MenuLink to="/optical-store/estimate" icon="estimate">Price Estimator</MenuLink>
          {hasPermission("optical_store_config") && <MenuLink to="/optical-store/config" icon="config">Estimator Config</MenuLink>}
          <MenuLink to="/change-password" icon="password">Change Password</MenuLink>
          {hasPermission("users") && <MenuLink to="/users" icon="users">Users</MenuLink>}
        </nav>
      </aside>

      <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)}></div>

      <div className="workspace">
        <header className="topbar">
          <div className="mobile-branding">
            <button className="menu-toggle" type="button" aria-controls="sidebar-navigation"
              aria-expanded={menuOpen} aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
            <Link className="mobile-brand" to="/" aria-label="Vision Express home">
              <img src="/images/ve-logo.png" alt="Vision Express" />
            </Link>
          </div>
          <div className="topbar-greeting">
            <strong>{greeting()}, {firstName(profile?.display_name)}</strong>
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="account">
            <span className="role-pill">{profile?.role === "ADMIN" ? "Admin" : "Staff"}</span>
            <span className="account-name">{profile?.display_name}</span>
            <button className="action-button logout" type="button" onClick={signOut}>Logout</button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

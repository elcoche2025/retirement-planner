import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, GitCompare, Grid3x3, Map, Settings } from 'lucide-react';
import './Layout.css';

const NAV_ITEMS: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/matrix', label: 'Matrix', icon: Grid3x3 },
  { to: '/plan', label: 'Plan', icon: Map },
  { to: '/inputs', label: 'Settings', icon: Settings },
];

export default function Layout() {
  return (
    <div className="layout">
      {/* Desktop top nav */}
      <header className="top-nav">
        <NavLink to="/" className="top-nav-title">Life Change Planner</NavLink>
        <nav className="top-nav-links">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Page content */}
      <main className="layout-main">
        <Outlet />
      </main>

      {/* Mobile bottom bar */}
      <nav className="bottom-bar">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-bar-item${isActive ? ' active' : ''}`}>
            <Icon size={20} strokeWidth={1.5} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

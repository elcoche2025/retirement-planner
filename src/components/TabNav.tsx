import { NavLink } from 'react-router-dom';

interface Tab {
  to: string;
  label: string;
}

export default function TabNav({ tabs }: { tabs: Tab[] }) {
  return (
    <nav className="tab-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => (isActive ? 'active' : '')}
          end
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

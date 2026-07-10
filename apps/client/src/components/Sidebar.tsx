import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, type NavKey } from './navItems';

interface SidebarProps {
  activeKey: NavKey;
}

/**
 * Standardised left navigation sidebar.
 * Brand header at the top, nav links in the middle, user card at the bottom.
 * Hidden below the `md` breakpoint (a mobile menu button lives in TopBar instead).
 */
export default function Sidebar({ activeKey }: SidebarProps) {
  return (
    <nav className="hidden md:flex flex-col bg-surface fixed left-0 top-0 h-screen w-sidebar-width border-r border-outline-variant py-6 z-40">
      {/* Brand header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl">
          A
        </div>
        <div>
          <h1 className="font-title-md text-title-md text-primary font-bold">Assessment Manager</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Professional Suite</p>
        </div>
      </div>

      {/* Nav links */}
      <ul className="flex-1 px-4 space-y-2 font-body-md text-body-md">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <li key={item.key}>
              <Link
                to={item.to}
                className={
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ' +
                  (isActive
                    ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-low hover:bg-surface-container-high'
                    : 'text-on-surface-variant hover:bg-surface-container-high')
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="font-title-md text-title-md">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* User card */}
      <div className="px-6 mt-auto">
        <div className="flex items-center gap-3 py-3 border-t border-outline-variant">
          <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold">
            AU
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface">Admin User</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">System Architect</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

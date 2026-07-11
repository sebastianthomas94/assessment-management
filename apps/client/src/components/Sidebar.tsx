import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS, type NavKey } from './navItems';

interface SidebarProps {
  activeKey: NavKey;
  /** Controls visibility on mobile (below md breakpoint). */
  mobileOpen?: boolean;
  /** Called when the user requests the mobile sidebar to close. */
  onClose?: () => void;
}

function initials(user: { name?: string; email?: string } | null): string {
  if (user?.name) {
    return user.name.split(' ').slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
  }
  if (user?.email) return user.email.slice(0, 2).toUpperCase();
  return 'AU';
}

/**
 * Standardised left navigation sidebar.
 * Brand header at the top, nav links in the middle, user card at the bottom.
 * On md+ it is a fixed column; on mobile it slides in as an overlay when
 * `mobileOpen` is true.
 */
export default function Sidebar({ activeKey, mobileOpen = false, onClose }: SidebarProps) {
  const { user } = useAuth();

  /* Backdrop: only on mobile, only when open. */
  const backdrop = (
    <div
      className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
        mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
      aria-hidden="true"
    />
  );

  return (
    <>
      {backdrop}

      <nav
        className={`fixed left-0 top-0 h-screen w-sidebar-width border-r border-outline-variant py-6 bg-surface z-50 transform transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:flex md:flex-col`}
      >
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
        <ul className="flex-1 px-4 space-y-2 font-body-md text-body-md overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <li key={item.key}>
                <Link
                  to={item.to}
                  onClick={onClose}
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
              {initials(user)}
            </div>
            <div className="min-w-0">
              <p className="font-label-md text-label-md text-on-surface truncate">{user?.name ?? 'Signed in'}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{user?.email ?? ''}</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

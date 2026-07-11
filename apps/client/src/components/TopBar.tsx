import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  /** Optional secondary label shown after the brand (e.g. "Launch Pad"). */
  sectionLabel?: string;
  /** Right-side actions override — omit to render the default user menu. */
  rightSlot?: React.ReactNode;
  /** Retained for API compatibility; the top bar no longer renders a search box. */
  searchPlaceholder?: string;
  /** Whether to show the mobile menu button (left side). */
  showMobileMenu?: boolean;
  /** Called when the mobile menu (hamburger) button is clicked. */
  onMenuClick?: () => void;
  /** Retained for API compatibility. */
  showCreateNew?: boolean;
}

const DEFAULT_USER_AVATAR_PLACEHOLDER = 'AU';

/**
 * Simplified top bar: brand on the left, the signed-in user + sign-out on the
 * right. Decorative placeholders (fake nav, search, notifications) were removed
 * to keep the UI straightforward.
 */
export default function TopBar({ sectionLabel, rightSlot, showMobileMenu = true, onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function initials(): string {
    if (user?.name) {
      return user.name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return DEFAULT_USER_AVATAR_PLACEHOLDER;
  }

  async function handleLogout() {
    await logout();
    navigate('/auth', { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 bg-surface-bright border-b border-outline-variant shadow-sm flex justify-between items-center px-container-padding h-16 w-full">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {showMobileMenu && (
          <button
            className="md:hidden text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors"
            onClick={onMenuClick}
            aria-label="Open menu"
            type="button"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">fact_check</span>
          <span className="font-headline-sm text-headline-sm text-primary font-bold">AssessMaster</span>
        </div>
        {sectionLabel && (
          <span className="text-on-surface-variant px-2 border-l border-outline-variant ml-2 font-label-md text-label-md hidden sm:inline">
            {sectionLabel}
          </span>
        )}
      </div>

      {/* Right section */}
      {rightSlot ?? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-sm">
              {initials()}
            </div>
            <span className="font-label-md text-label-md text-on-surface hidden sm:inline">{user?.name ?? user?.email}</span>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-2 text-on-surface-variant hover:bg-surface-container hover:text-error rounded-lg transition-colors cursor-pointer"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-label-md text-label-md hidden sm:inline">Sign out</span>
          </button>
        </div>
      )}
    </header>
  );
}

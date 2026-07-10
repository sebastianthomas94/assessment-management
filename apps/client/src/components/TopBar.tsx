interface TopBarProps {
  /** Optional secondary label shown after the brand (e.g. "Launch Pad"). */
  sectionLabel?: string;
  /** Right-side actions override — omit to render the default search/actions. */
  rightSlot?: React.ReactNode;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
  /** Whether to show the mobile menu button (left side). */
  showMobileMenu?: boolean;
  /** Whether the Create New button appears. Hidden on distraction-free pages. */
  showCreateNew?: boolean;
}

const DEFAULT_USER_AVATAR_PLACEHOLDER = 'AU';

/**
 * Standardised top navigation bar.
 *
 * Has three slots:
 *  - Left: brand + (optional) sub-nav links OR section label
 *  - Center/right: search input (hidden on small screens)
 *  - Far right: notifications + settings + (optional) Create New + avatar
 *
 * The whole bar is sticky to the top.
 */
export default function TopBar({
  sectionLabel,
  rightSlot,
  searchPlaceholder = 'Search...',
  showMobileMenu = true,
  showCreateNew = true,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface-bright border-b border-outline-variant shadow-sm flex justify-between items-center px-container-padding h-16 w-full">
      {/* Left section */}
      <div className="flex items-center gap-6">
        {showMobileMenu && (
          <button className="md:hidden text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors">
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
        <nav className="hidden lg:flex gap-6 h-full items-center">
          <a className="h-full flex items-center text-primary border-b-2 border-primary font-label-lg text-label-lg px-2 transition-opacity hover:opacity-80" href="#">
            Overview
          </a>
          <a className="h-full flex items-center text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg px-2" href="#">
            Recent
          </a>
          <a className="h-full flex items-center text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg px-2" href="#">
            Starred
          </a>
        </nav>
      </div>

      {/* Right section */}
      {rightSlot ?? (
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary text-sm w-64 transition-all"
              placeholder={searchPlaceholder}
              type="text"
            />
          </div>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
          {showCreateNew && (
            <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-lg text-label-lg hover:bg-primary-container transition-colors shadow-sm hidden sm:block">
              Create New
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-sm ml-2">
            {DEFAULT_USER_AVATAR_PLACEHOLDER}
          </div>
        </div>
      )}
    </header>
  );
}

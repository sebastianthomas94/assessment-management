import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import type { NavKey } from './navItems';

interface AppLayoutProps {
  activeKey: NavKey;
  children: ReactNode;
  /** Top-bar customisation (mirrors TopBar props). */
  topBar?: {
    sectionLabel?: string;
    rightSlot?: ReactNode;
    searchPlaceholder?: string;
    showMobileMenu?: boolean;
    showCreateNew?: boolean;
  };
  /** Override the main content background (default: `bg-background`). */
  mainClassName?: string;
}

/**
 * Standardised two-column app shell:
 *
 *   ┌────────┬────────────────────────────┐
 *   │ Sidebar│ TopBar                     │
 *   │        ├────────────────────────────┤
 *   │        │ <children /> (scrollable)  │
 *   └────────┴────────────────────────────┘
 *
 * - The sidebar is fixed (w-sidebar-width) and only shows on md+.
 * - The right column moves left by `md:ml-[280px]` to clear the sidebar.
 * - The content area scrolls independently; TopBar stays sticky.
 */
export default function AppLayout({ activeKey, children, topBar, mainClassName = 'bg-background' }: AppLayoutProps) {
  return (
    <div className="text-on-surface font-body-md flex overflow-hidden min-h-screen">
      <Sidebar activeKey={activeKey} />

      <div className="flex-1 flex flex-col md:ml-[280px] h-screen overflow-hidden">
        <TopBar {...topBar} />

        <main className={'flex-1 overflow-y-auto p-4 md:p-container-padding scroll-smooth ' + mainClassName}>
          {children}
        </main>
      </div>
    </div>
  );
}

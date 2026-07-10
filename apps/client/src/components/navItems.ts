export type NavKey = 'builder' | 'dashboard' | 'launch-pad' | 'reports';

export interface NavItem {
  key: NavKey;
  label: string;
  to: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'builder', label: 'Builder', to: '/builder', icon: 'architecture' },
  { key: 'dashboard', label: 'Assessments', to: '/dashboard', icon: 'assignment' },
  { key: 'launch-pad', label: 'Launch Pad', to: '/launch-pad', icon: 'rocket_launch' },
  { key: 'reports', label: 'Reports', to: '/reports', icon: 'bar_chart' },
];

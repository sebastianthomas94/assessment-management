import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

interface AssessmentRow {
  id: string;
  title: string;
  dateCreated: string;
  totalQuestions: number;
  status: {
    label: string;
    badgeClasses: string;
    dotClasses: string;
  };
  icon: string;
  iconWrapClasses: string;
}

const ASSESSMENTS: AssessmentRow[] = [
  {
    id: 'ASM-2023-089',
    title: 'Q3 Leadership Competency Scan',
    dateCreated: 'Oct 12, 2023',
    totalQuestions: 45,
    status: {
      label: 'Draft',
      badgeClasses: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30',
      dotClasses: 'bg-outline',
    },
    icon: 'assignment',
    iconWrapClasses: 'bg-primary/10 text-primary',
  },
  {
    id: 'ASM-2023-042',
    title: 'Annual Employee Engagement',
    dateCreated: 'Sep 01, 2023',
    totalQuestions: 120,
    status: {
      label: 'Published',
      badgeClasses: 'bg-secondary/10 text-secondary border border-secondary/20',
      dotClasses: 'bg-secondary',
    },
    icon: 'rocket_launch',
    iconWrapClasses: 'bg-secondary/10 text-secondary',
  },
  {
    id: 'ASM-2023-112',
    title: 'Technical Skills Matrix - Engineering',
    dateCreated: 'Nov 05, 2023',
    totalQuestions: 85,
    status: {
      label: 'Review Required',
      badgeClasses: 'bg-error-container/50 text-on-error-container border border-error/20',
      dotClasses: 'bg-error',
    },
    icon: 'assignment',
    iconWrapClasses: 'bg-primary/10 text-primary',
  },
];

interface StatCard {
  icon: string;
  iconWrapClasses: string;
  value: string;
  label: string;
  badge: { text: string; classes: string };
}

const STATS: StatCard[] = [
  {
    icon: 'assignment_turned_in',
    iconWrapClasses: 'text-primary bg-primary/10',
    value: '124',
    label: 'Total Active Assessments',
    badge: { text: '+12% this month', classes: 'text-secondary bg-secondary/10' },
  },
  {
    icon: 'rocket_launch',
    iconWrapClasses: 'text-secondary bg-secondary/10',
    value: '38',
    label: 'Currently Launched',
    badge: { text: 'Active', classes: 'text-on-surface-variant bg-surface-container' },
  },
  {
    icon: 'pending_actions',
    iconWrapClasses: 'text-tertiary bg-tertiary/10',
    value: '5',
    label: 'Drafts Pending Approval',
    badge: { text: 'Needs Review', classes: 'text-error bg-error-container' },
  },
];

export default function Dashboard() {
  return (
    <AppLayout activeKey="dashboard" topBar={{ searchPlaceholder: 'Search assessments...' }}>
      <div className="max-w-[1024px] mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-section-margin gap-4">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface">Assessments Portfolio</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
              Manage, launch, and review your structured assessment modules.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface rounded-lg font-label-lg text-label-lg hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-lg text-label-lg hover:bg-primary/90 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-sm">add</span> New Assessment
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-element-gap mb-section-margin">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`material-symbols-outlined p-2 rounded-lg ${stat.iconWrapClasses}`}>{stat.icon}</span>
                <span className={`font-label-lg text-label-lg px-2 py-1 rounded-full ${stat.badge.classes}`}>
                  {stat.badge.text}
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">{stat.value}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Data Table Container */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Table Actions Bar */}
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface/50">
            <div className="relative w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface-container-lowest"
                placeholder="Search title or ID..."
                type="text"
              />
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-md transition-colors">
                <span className="material-symbols-outlined">view_column</span>
              </button>
            </div>
          </div>

          {/* The Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant text-on-surface-variant font-label-lg text-label-lg">
                  <th className="p-4 font-semibold w-12 text-center">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                  </th>
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Date Created</th>
                  <th className="p-4 font-semibold text-center">Total Questions</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md">
                {ASSESSMENTS.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`border-b border-outline-variant/50 hover:bg-surface/50 transition-colors group ${idx === 1 ? 'bg-surface/30' : ''}`}
                  >
                    <td className="p-4 text-center">
                      <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${row.iconWrapClasses}`}>
                          <span className="material-symbols-outlined text-sm">{row.icon}</span>
                        </div>
                        <div>
                          <span className="font-title-md text-title-md text-on-surface block">{row.title}</span>
                          <span className="text-on-surface-variant text-label-sm">ID: {row.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant">{row.dateCreated}</td>
                    <td className="p-4 text-center font-medium">{row.totalQuestions}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-label-sm ${row.status.badgeClasses}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.status.dotClasses}`} />
                        {row.status.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to="/launch-pad"
                          className="px-3 py-1.5 text-secondary border border-secondary/30 rounded text-label-md hover:bg-secondary/5 transition-colors font-medium"
                        >
                          Launch
                        </Link>
                        <Link
                          to="/reports"
                          className="px-3 py-1.5 text-on-surface-variant border border-outline-variant/50 rounded text-label-md hover:bg-surface-container transition-colors font-medium"
                        >
                          View Report
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-outline-variant flex justify-between items-center text-label-md text-on-surface-variant bg-surface/50">
            <span>Showing 1 to {ASSESSMENTS.length} of 124 entries</span>
            <div className="flex gap-1">
              <button className="p-1 rounded hover:bg-surface-container disabled:opacity-50" disabled>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="px-3 py-1 rounded bg-primary text-on-primary">1</button>
              <button className="px-3 py-1 rounded hover:bg-surface-container">2</button>
              <button className="px-3 py-1 rounded hover:bg-surface-container">3</button>
              <span className="px-2 py-1">...</span>
              <button className="p-1 rounded hover:bg-surface-container">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

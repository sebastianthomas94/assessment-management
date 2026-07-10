import AppLayout from '../components/AppLayout';

interface Submission {
  id: string;
  name: string;
  role: string;
  date: string;
  score: number;
  total: number;
  active?: boolean;
}

const SUBMISSIONS: Submission[] = [
  { id: 's1', name: 'Sarah Jenkins', role: 'Senior Developer • Engineering', date: 'Today, 10:42 AM', score: 92, total: 100, active: true },
  { id: 's2', name: 'Michael Chang', role: 'Product Manager • Product', date: 'Yesterday, 3:15 PM', score: 78, total: 100 },
  { id: 's3', name: 'Elena Rodriguez', role: 'UX Designer • Design', date: 'Oct 24, 11:20 AM', score: 88, total: 100 },
];

interface Metric {
  label: string;
  value: string;
  suffix?: string;
  glowClasses: string;
  footerIcon: string;
  footerText: string;
  footerClasses: string;
  bar?: { width: string; classes: string };
}

const METRICS: Metric[] = [
  {
    label: 'Average Score',
    value: '84.2',
    suffix: '/ 100',
    glowClasses: 'bg-primary-container/20 group-hover:bg-primary-container/30',
    footerIcon: 'trending_up',
    footerText: '+2.4% from last period',
    footerClasses: 'text-secondary',
  },
  {
    label: 'Completion Rate',
    value: '92%',
    glowClasses: 'bg-secondary-container/30 group-hover:bg-secondary-container/40',
    footerIcon: '',
    footerText: '',
    footerClasses: '',
    bar: { width: '92%', classes: 'bg-secondary' },
  },
  {
    label: 'Avg. Completion Time',
    value: '18m',
    suffix: '32s',
    glowClasses: 'bg-tertiary-container/20 group-hover:bg-tertiary-container/30',
    footerIcon: 'schedule',
    footerText: 'Optimal range: 15-25m',
    footerClasses: 'text-on-surface-variant',
  },
];

const LIKERT_SELECTED = 4;

export default function Reports() {
  return (
    <AppLayout
      activeKey="reports"
      topBar={{ searchPlaceholder: 'Search reports...' }}
      mainClassName="bg-surface-container-low"
    >
      <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display-lg text-display-lg text-on-background">Q3 Performance Evaluation</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Status:&nbsp;
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-container text-on-secondary-container ml-2">
                Published
              </span>
              &nbsp;• 142 Submissions
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-outline-variant rounded-lg font-label-lg text-label-lg text-on-surface bg-surface-container-lowest hover:bg-surface-container transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span> Export
            </button>
          </div>
        </div>

        {/* Metrics Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {METRICS.map((metric) => (
            <div key={metric.label} className="glass-card rounded-xl p-6 relative overflow-hidden group">
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl transition-colors ${metric.glowClasses}`} />
              <p className="font-label-lg text-label-lg text-on-surface-variant mb-2">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="font-display-lg text-display-lg text-primary">{metric.value}</h3>
                {metric.suffix && <span className="font-body-md text-body-md text-on-surface-variant">{metric.suffix}</span>}
              </div>
              {metric.bar && (
                <div className="w-full bg-surface-container-highest rounded-full h-2 mt-5">
                  <div className={`h-2 rounded-full ${metric.bar.classes}`} style={{ width: metric.bar.width }} />
                </div>
              )}
              {metric.footerText && (
                <div className={`mt-4 flex items-center gap-2 font-label-md text-label-md ${metric.footerClasses}`}>
                  {metric.footerIcon && <span className="material-symbols-outlined text-sm">{metric.footerIcon}</span>}
                  {metric.footerText}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main Content Area: Split View */}
        <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
          {/* Submissions List */}
          <div className="w-full lg:w-1/3 flex flex-col glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50">
              <h3 className="font-title-lg text-title-lg text-on-surface">Recent Submissions</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {SUBMISSIONS.map((sub) => (
                <div
                  key={sub.id}
                  className={
                    'p-4 rounded-lg cursor-pointer hover:bg-surface-container transition-colors ' +
                    (sub.active ? 'bg-surface-container border-l-4 border-primary' : 'border border-transparent')
                  }
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-label-lg text-label-lg text-on-surface">{sub.name}</h4>
                    <span className="font-label-md text-label-md font-bold text-on-surface-variant">{sub.score}/{sub.total}</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-2">{sub.role}</p>
                  <div className="flex items-center gap-2 font-label-sm text-label-sm text-outline">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span> {sub.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed View */}
          <div className="w-full lg:w-2/3 flex flex-col glass-card rounded-xl overflow-hidden bg-surface-container-lowest">
            {/* Detail Header */}
            <div className="p-6 border-b border-outline-variant flex justify-between items-start">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Sarah Jenkins</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Senior Developer • Submitted: Oct 26, 10:42 AM
                </p>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-3xl font-bold text-primary">
                  92<span className="text-lg text-on-surface-variant">/100</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container-high text-on-surface">
                  Excellent
                </span>
              </div>
            </div>

            {/* Detail Content (Hierarchical View) */}
            <div className="flex-1 overflow-y-auto p-6 bg-surface-container-low">
              <div className="mb-8">
                <h4 className="font-title-lg text-title-lg text-on-background mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">folder_open</span> Technical Proficiency
                  <span className="ml-auto font-label-md text-label-md bg-surface-container px-2 py-1 rounded">Score: 38/40</span>
                </h4>

                {/* Factor */}
                <div className="ml-6 border-l-2 border-outline-variant pl-4 mb-6">
                  <h5 className="font-title-md text-title-md text-on-surface mb-3">System Architecture Knowledge</h5>

                  <div className="space-y-4 ml-4">
                    {/* Long Text Answer */}
                    <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
                      <p className="font-body-md text-body-md text-on-surface font-medium mb-2">
                        1. How effectively does the candidate design scalable microservices?
                      </p>
                      <p className="font-body-md text-body-md text-on-surface-variant bg-surface-container-low p-3 rounded border border-surface-variant">
                        Sarah demonstrated exceptional understanding of bounded contexts and API gateway patterns during the
                        technical review. Her proposed architecture for the new billing service effectively isolated domain
                        logic and incorporated appropriate fault tolerance mechanisms.
                      </p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="font-label-sm text-label-sm text-outline">Type: Long Text</span>
                        <span className="font-label-md text-label-md font-bold text-secondary">10/10</span>
                      </div>
                    </div>

                    {/* Likert Scale Answer */}
                    <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
                      <p className="font-body-md text-body-md text-on-surface font-medium mb-2">
                        2. Rate proficiency with container orchestration (Kubernetes).
                      </p>
                      <div className="flex gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => {
                          const isSelected = n === LIKERT_SELECTED;
                          return (
                            <div
                              key={n}
                              className={
                                'w-8 h-8 rounded flex items-center justify-center font-bold ' +
                                (isSelected
                                  ? 'bg-secondary text-on-secondary ring-2 ring-offset-1 ring-secondary'
                                  : 'bg-surface-container text-on-surface-variant opacity-50')
                              }
                            >
                              {n}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="font-label-sm text-label-sm text-outline">Type: Likert Scale</span>
                        <span className="font-label-md text-label-md font-bold text-secondary">4/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

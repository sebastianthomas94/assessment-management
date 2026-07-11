import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { listAssessments, deleteAssessment, setAssessmentStatus } from '../api/assessments';
import { ApiError } from '../api/client';
import type { AssessmentSummary } from '../types/assessment';

const STATUS_BADGE: Record<string, { badgeClasses: string; dotClasses: string }> = {
  draft: {
    badgeClasses: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30',
    dotClasses: 'bg-outline',
  },
  published: {
    badgeClasses: 'bg-secondary/10 text-secondary border border-secondary/20',
    dotClasses: 'bg-secondary',
  },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const takeUrl = (id: string) => `${window.location.origin}/take/${id}`;

  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(takeUrl(id));
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
    } catch {
      window.prompt('Copy this link:', takeUrl(id));
    }
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const { assessments: rows } = await listAssessments();
      setAssessments(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This also removes any submitted responses.`)) return;
    setActionError(null);
    try {
      await deleteAssessment(id);
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete.');
    }
  };

  const handlePublish = async (id: string) => {
    setActionError(null);
    try {
      await setAssessmentStatus(id, 'published');
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to publish.');
    }
  };

  // Real stats derived from the fetched list.
  const stats = {
    total: assessments.length,
    drafts: assessments.filter((a) => a.status === 'draft').length,
    published: assessments.filter((a) => a.status === 'published').length,
  };

  const STATS_CARDS = [
    { icon: 'assignment_turned_in', iconWrapClasses: 'text-primary bg-primary/10', value: String(stats.total), label: 'Total Assessments', badge: { text: stats.drafts > 0 ? `${stats.drafts} draft${stats.drafts === 1 ? '' : 's'}` : 'All published', classes: 'text-on-surface-variant bg-surface-container' } },
    { icon: 'rocket_launch', iconWrapClasses: 'text-secondary bg-secondary/10', value: String(stats.published), label: 'Published (Launchable)', badge: { text: stats.published > 0 ? 'Ready to launch' : 'None yet', classes: stats.published > 0 ? 'text-secondary bg-secondary/10' : 'text-on-surface-variant bg-surface-container' } },
    { icon: 'pending_actions', iconWrapClasses: 'text-tertiary bg-tertiary/10', value: String(stats.drafts), label: 'Drafts Pending', badge: { text: stats.drafts > 0 ? 'Needs review' : 'All clear', classes: stats.drafts > 0 ? 'text-error bg-error-container' : 'text-on-surface-variant bg-surface-container' } },
  ];

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
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-lg text-label-lg hover:bg-primary/90 transition-colors shadow-sm"
              onClick={() => navigate('/builder')}
            >
              <span className="material-symbols-outlined text-sm">add</span> New Assessment
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-element-gap mb-section-margin">
          {STATS_CARDS.map((stat) => (
            <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-start mb-4">
                <span className={`material-symbols-outlined p-2 rounded-lg ${stat.iconWrapClasses}`}>{stat.icon}</span>
                <span className={`font-label-lg text-label-lg px-2 py-1 rounded-full ${stat.badge.classes}`}>{stat.badge.text}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">{stat.value}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{stat.label}</p>
            </div>
          ))}
        </div>

        {actionError && (
          <div className="mb-4 p-3 rounded-lg bg-error-container/40 border border-error/30 text-error flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span className="font-body-md text-body-md">{actionError}</span>
          </div>
        )}

        {error ? (
          <div className="bg-error-container/30 border border-error/30 rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-error text-[32px]">cloud_off</span>
            <p className="font-body-lg text-body-lg text-error mt-2">{error}</p>
            <button className="mt-4 px-4 py-2 border border-error text-error rounded-lg hover:bg-error-container transition-colors" onClick={refresh}>Retry</button>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Table Actions Bar */}
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface/50">
              <h3 className="font-title-lg text-title-lg text-on-surface">Your Assessments</h3>
              <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-md transition-colors" title="Refresh" onClick={refresh}>
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant text-on-surface-variant font-label-lg text-label-lg">
                    <th className="p-4 font-semibold">Title</th>
                    <th className="p-4 font-semibold">Date Created</th>
                    <th className="p-4 font-semibold text-center">Total Questions</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined animate-spin text-primary align-middle mr-2">progress_activity</span>
                        Loading assessments...
                      </td>
                    </tr>
                  ) : assessments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <span className="material-symbols-outlined text-outline text-[40px]">inbox</span>
                        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">No assessments yet.</p>
                        <button className="mt-3 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors" onClick={() => navigate('/builder')}>
                          Create your first assessment
                        </button>
                      </td>
                    </tr>
                  ) : (
                    assessments.map((row) => {
                      const badge = STATUS_BADGE[row.status] ?? STATUS_BADGE.draft;
                      return (
                        <tr key={row.id} className="border-b border-outline-variant/50 hover:bg-surface/50 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded flex items-center justify-center bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-sm">assignment</span>
                              </div>
                              <div>
                                <span className="font-title-md text-title-md text-on-surface block">{row.title}</span>
                                {row.description && <span className="text-on-surface-variant text-label-sm">{row.description}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-on-surface-variant">{formatDate(row.createdAt)}</td>
                          <td className="p-4 text-center font-medium">{row.totalQuestions}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-label-sm ${badge.badgeClasses}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badge.dotClasses}`} />
                              {row.status === 'draft' ? 'Draft' : 'Published'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {row.status === 'published' ? (
                                <>
                                  <button
                                    className="px-3 py-1.5 text-primary border border-primary/30 rounded text-label-md hover:bg-primary/5 transition-colors font-medium inline-flex items-center gap-1"
                                    title="Copy the public link respondents use to take this assessment"
                                    onClick={() => copyLink(row.id)}
                                  >
                                    <span className="material-symbols-outlined text-[16px]">{copiedId === row.id ? 'check' : 'link'}</span>
                                    {copiedId === row.id ? 'Copied' : 'Copy link'}
                                  </button>
                                  <a
                                    href={takeUrl(row.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 text-secondary border border-secondary/30 rounded text-label-md hover:bg-secondary/5 transition-colors font-medium"
                                  >
                                    Open
                                  </a>
                                </>
                              ) : (
                                <button
                                  className="px-3 py-1.5 text-secondary border border-secondary/30 rounded text-label-md hover:bg-secondary/5 transition-colors font-medium disabled:opacity-50"
                                  title="Publish this assessment to make it launchable"
                                  onClick={() => handlePublish(row.id)}
                                >
                                  Publish
                                </button>
                              )}
                              <Link
                                to="/reports"
                                className="px-3 py-1.5 text-on-surface-variant border border-outline-variant/50 rounded text-label-md hover:bg-surface-container transition-colors font-medium"
                              >
                                Report
                              </Link>
                              <button
                                className="px-3 py-1.5 text-error border border-error/30 rounded text-label-md hover:bg-error/5 transition-colors font-medium"
                                title="Delete assessment"
                                onClick={() => handleDelete(row.id, row.title)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!loading && assessments.length > 0 && (
              <div className="p-4 border-t border-outline-variant text-label-md text-on-surface-variant bg-surface/50">
                Showing {assessments.length} {assessments.length === 1 ? 'assessment' : 'assessments'}.
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

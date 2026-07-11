import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { listAssessments } from '../api/assessments';
import type { AssessmentSummary } from '../types/assessment';

/** Build the public, shareable taker link for an assessment. */
function takeUrl(id: string): string {
  return `${window.location.origin}/take/${id}`;
}

/**
 * Launch Pad (admin): lists published assessments and lets the owner copy a
 * public link to share, or open the taker in a new tab. The actual taking
 * happens on the public `/take/:id` route — no login required for respondents.
 */
export default function LaunchPad() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAssessments()
      .then(({ assessments }) => { if (!cancelled) setAssessments(assessments.filter((a) => a.status === 'published')); })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load assessments.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(takeUrl(id));
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
    } catch {
      window.prompt('Copy this link:', takeUrl(id));
    }
  };

  return (
    <AppLayout activeKey="launch-pad" topBar={{ searchPlaceholder: 'Search...' }}>
      <div className="max-w-[1024px] mx-auto w-full">
        <div className="mb-section-margin">
          <h1 className="font-display-lg text-display-lg text-on-surface">Launch Pad</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            Share published assessments. Anyone with the link can take them — no login needed.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-primary mr-2">progress_activity</span> Loading...
          </div>
        ) : error ? (
          <div className="bg-error-container/30 border border-error/30 rounded-xl p-8 text-center">
            <p className="font-body-lg text-body-lg text-error">{error}</p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-outline text-[48px]">rocket_launch</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">No published assessments yet.</p>
            <p className="font-body-md text-body-md text-on-surface-variant">Publish an assessment from the Assessments page to launch it.</p>
            <button className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors" onClick={() => navigate('/dashboard')}>
              Go to Assessments
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-element-gap">
            {assessments.map((a) => (
              <div key={a.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined p-2 rounded-lg text-secondary bg-secondary/10">rocket_launch</span>
                  <div className="flex-1">
                    <h3 className="font-title-lg text-title-lg text-on-surface">{a.title}</h3>
                    {a.description && <p className="font-body-md text-body-md text-on-surface-variant mt-1">{a.description}</p>}
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">{a.totalQuestions} questions</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-auto">
                  <button
                    className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg font-label-lg text-label-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                    onClick={() => copyLink(a.id)}
                  >
                    <span className="material-symbols-outlined text-[18px]">{copiedId === a.id ? 'check' : 'link'}</span>
                    {copiedId === a.id ? 'Copied!' : 'Copy link'}
                  </button>
                  <a
                    className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-lg text-label-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
                    href={takeUrl(a.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

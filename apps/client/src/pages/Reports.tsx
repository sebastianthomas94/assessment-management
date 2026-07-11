import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { listAssessments, getAssessment, listResponses } from '../api/assessments';
import type { Assessment, AssessmentSummary, Answer, Question, ResponseSummary } from '../types/assessment';

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

// Build a lookup of questions indexed by id from the assessment so we can
// render each answer with its question text and type.
function indexQuestions(assessment: Assessment): Record<string, Question> {
  const map: Record<string, Question> = {};
  for (const cat of assessment.categories) for (const f of cat.factors) for (const q of f.questions) map[q.id] = q;
  return map;
}

// Compute a simple gradeable score: rating_scale questions sum their value out
// of scaleMax; boolean questions give 1 for Yes, 0 for No. Other types are
// informational. Returns {earned, max, hasGradeable}.
function scoreResponse(answers: Answer[], questionMap: Record<string, Question>): { earned: number; max: number; hasGradeable: boolean } {
  let earned = 0;
  let max = 0;
  for (const a of answers) {
    const q = questionMap[a.questionId];
    if (!q) continue;
    if (a.type === 'rating_scale') {
      max += q.scaleMax ?? 5;
      earned += Math.min(Number(a.ratingValue ?? 0), q.scaleMax ?? 5);
    } else if (a.type === 'boolean') {
      max += 1;
      earned += a.booleanValue ? 1 : 0;
    }
  }
  return { earned, max, hasGradeable: max > 0 };
}

function answerDisplay(a: Answer): string {
  switch (a.type) {
    case 'multiple_choice': return a.selectedOption ?? '—';
    case 'rating_scale': return `${a.ratingValue ?? '—'}`;
    case 'boolean': return a.booleanValue ? 'Yes' : 'No';
    case 'open_text': return a.textValue ?? '—';
  }
}

const TYPE_LABEL: Record<string, string> = {
  multiple_choice: 'Multiple Choice',
  rating_scale: 'Rating Scale',
  boolean: 'Yes / No',
  open_text: 'Open Text',
};

export default function Reports() {
  const [summaries, setSummaries] = useState<AssessmentSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<ResponseSummary[]>([]);
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the list of assessments for the selector.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAssessments()
      .then(({ assessments }) => {
        if (cancelled) return;
        setSummaries(assessments);
        // Auto-select the most recent assessment if there is one.
        if (assessments.length > 0) setSelectedId(assessments[0].id);
      })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load assessments.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // When a selection changes, load the full assessment + its responses.
  useEffect(() => {
    if (!selectedId) {
      setAssessment(null);
      setResponses([]);
      setActiveResponseId(null);
      return;
    }
    let cancelled = false;
    setError(null);
    // Run both fetches; the responses fetch only succeeds for the owner.
    Promise.all([getAssessment(selectedId), listResponses(selectedId)])
      .then(([aRes, rRes]) => {
        if (cancelled) return;
        setAssessment(aRes.assessment);
        setResponses(rRes.responses);
        setActiveResponseId(rRes.responses[0]?.id ?? null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setAssessment(null);
        setResponses([]);
        setError(err instanceof Error ? err.message : 'Failed to load report.');
      });
    return () => { cancelled = true; };
  }, [selectedId]);

  const questionMap = assessment ? indexQuestions(assessment) : {};
  const activeResponse = responses.find((r) => r.id === activeResponseId) ?? null;

  // Aggregate metrics across all responses.
  const metrics = {
    submissions: responses.length,
    avgScore: 0,
    completionRate: 0,
  };
  if (responses.length > 0) {
    const scored = responses.map((r) => scoreResponse(r.answers, questionMap));
    const gradeable = scored.filter((s) => s.hasGradeable);
    if (gradeable.length > 0) {
      const avgPct = gradeable.reduce((sum, s) => sum + (s.max > 0 ? (s.earned / s.max) * 100 : 0), 0) / gradeable.length;
      metrics.avgScore = Math.round(avgPct * 10) / 10;
      metrics.completionRate = 100;
    } else {
      metrics.avgScore = 0;
      metrics.completionRate = 100; // all submitted responses are complete by design
    }
  }

  // Reuse the assessment's category→factor→question structure to render the
  // active response's answers in the same hierarchy as the builder/launch pad.
  const renderAnswerForQuestion = (q: Question, ans: Answer | undefined) => {
    if (!ans) {
      return (
        <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm relative overflow-hidden">
          <p className="font-body-md text-body-md text-on-surface-variant italic">Not answered.</p>
        </div>
      );
    }
    return (
      <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
        <div className="flex items-center justify-between mb-1">
          <span className="font-label-sm text-label-sm text-outline">{TYPE_LABEL[ans.type] ?? ans.type}</span>
          {ans.type === 'rating_scale' && (
            <span className="font-label-md text-label-md font-bold text-secondary">
              {ans.ratingValue}/{q.scaleMax ?? 5}
            </span>
          )}
          {ans.type === 'boolean' && (
            <span className={`font-label-md text-label-md font-bold ${ans.booleanValue ? 'text-secondary' : 'text-error'}`}>
              {ans.booleanValue ? 'Yes' : 'No'}
            </span>
          )}
        </div>
        <p className="font-body-md text-body-md text-on-surface font-medium mb-2">{q.text}</p>
        <p className="font-body-md text-body-md text-on-surface-variant bg-surface-container-low p-3 rounded border border-surface-variant">
          {ans.type === 'open_text' ? (ans.textValue || '—') : ans.type === 'multiple_choice' ? (ans.selectedOption || '—') : ''}
        </p>
        {(ans.type === 'multiple_choice' || ans.type === 'open_text') && (
          <p className="font-body-md text-body-md text-on-surface-variant bg-surface-container-low p-3 rounded border border-surface-variant mt-2">
            <span className="font-label-md text-label-md text-on-surface-variant block mb-1">Response:</span>
            {ans.type === 'multiple_choice' ? (ans.selectedOption || '—') : (ans.textValue || '—')}
          </p>
        )}
      </div>
    );
  };

  return (
    <AppLayout activeKey="reports" topBar={{ searchPlaceholder: 'Search reports...' }} mainClassName="bg-surface-container-low">
      <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display-lg text-display-lg text-on-background">Reports</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              View submitted responses for any of your assessments.
            </p>
          </div>
          {/* Assessment selector */}
          <div className="flex items-center gap-3">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="report-assessment-select">Assessment:</label>
            <select
              id="report-assessment-select"
              className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(e.target.value || null)}
              disabled={loading || summaries.length === 0}
            >
              {summaries.length === 0 && <option value="">No assessments</option>}
              {summaries.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-primary mr-2">progress_activity</span> Loading assessments...
          </div>
        ) : error ? (
          <div className="bg-error-container/30 border border-error/30 rounded-xl p-8 text-center">
            <p className="font-body-lg text-body-lg text-error">{error}</p>
          </div>
        ) : summaries.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-outline text-[48px]">bar_chart</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">No assessments to report on yet.</p>
            <p className="font-body-md text-body-md text-on-surface-variant">Create and publish an assessment to see responses here.</p>
          </div>
        ) : responses.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-outline text-[48px]">inbox</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">No responses yet for this assessment.</p>
            <p className="font-body-md text-body-md text-on-surface-variant">Publish it and have someone take it from the Launch Pad.</p>
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                <p className="font-label-lg text-label-lg text-on-surface-variant mb-2">Total Submissions</p>
                <h3 className="font-display-lg text-display-lg text-primary">{metrics.submissions}</h3>
              </div>
              {(() => {
                const gradeable = responses.map((r) => scoreResponse(r.answers, questionMap)).filter((s) => s.hasGradeable);
                return gradeable.length > 0 ? (
                  <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <p className="font-label-lg text-label-lg text-on-surface-variant mb-2">Average Score</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display-lg text-display-lg text-primary">{metrics.avgScore}</h3>
                      <span className="font-body-md text-body-md text-on-surface-variant">/ 100</span>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <p className="font-label-lg text-label-lg text-on-surface-variant mb-2">Grading</p>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Informational</h3>
                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">No gradeable question types in this assessment.</p>
                  </div>
                );
              })()}
              <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                <p className="font-label-lg text-label-lg text-on-surface-variant mb-2">Completion Rate</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-display-lg text-display-lg text-primary">{metrics.completionRate}%</h3>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2 mt-5">
                  <div className="h-2 rounded-full bg-secondary" style={{ width: `${metrics.completionRate}%` }} />
                </div>
              </div>
            </div>

            {/* Split View: submissions list + detail */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Submissions List */}
              <div className="w-full lg:w-1/3 flex flex-col glass-card rounded-xl overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50">
                  <h3 className="font-title-lg text-title-lg text-on-surface">Submissions</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[540px]">
                  {responses.map((r) => {
                    const score = scoreResponse(r.answers, questionMap);
                    const isActive = r.id === activeResponseId;
                    return (
                      <div key={r.id} className={`p-4 rounded-lg cursor-pointer hover:bg-surface-container transition-colors ${isActive ? 'bg-surface-container border-l-4 border-primary' : 'border border-transparent'}`} onClick={() => setActiveResponseId(r.id)}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-label-lg text-label-lg text-on-surface">{r.respondent.name}</h4>
                          {score.hasGradeable && <span className="font-label-md text-label-md font-bold text-on-surface-variant">{Math.round((score.earned / score.max) * 100)}/100</span>}
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-2">{r.respondent.email}</p>
                        <div className="flex items-center gap-2 font-label-sm text-label-sm text-outline">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span> {formatDateTime(r.submittedAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detail view */}
              <div className="w-full lg:w-2/3 flex flex-col glass-card rounded-xl overflow-hidden bg-surface-container-lowest">
                {activeResponse && assessment ? (
                  <>
                    <div className="p-6 border-b border-outline-variant flex justify-between items-start">
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">{activeResponse.respondent.name}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">{activeResponse.respondent.email} • Submitted: {formatDateTime(activeResponse.submittedAt)}</p>
                      </div>
                      {(() => {
                        const score = scoreResponse(activeResponse.answers, questionMap);
                        return score.hasGradeable ? (
                          <div className="flex flex-col items-end">
                            <div className="text-3xl font-bold text-primary">{Math.round((score.earned / score.max) * 100)}<span className="text-lg text-on-surface-variant">/100</span></div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container-high text-on-surface">Score</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-surface-container-low max-h-[540px]">
                      {assessment.categories.map((cat) => {
                        // count this category's answers that exist
                        const catQuestionIds = cat.factors.flatMap((f) => f.questions.map((q) => q.id));
                        const catAnswerMap = new Map(activeResponse.answers.filter((a) => catQuestionIds.includes(a.questionId)).map((a) => [a.questionId, a]));
                        if (catAnswerMap.size === 0) return null;
                        return (
                          <div key={cat.id} className="mb-8">
                            <h4 className="font-title-lg text-title-lg text-on-background mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary">folder_open</span> {cat.title}
                            </h4>
                            {cat.factors.map((f) => {
                              const fAns = f.questions.map((q) => catAnswerMap.get(q.id)).filter(Boolean);
                              if (fAns.length === 0) return null;
                              return (
                                <div key={f.id} className="ml-6 border-l-2 border-outline-variant pl-4 mb-6">
                                  <h5 className="font-title-md text-title-md text-on-surface mb-3">{f.title}</h5>
                                  <div className="space-y-4 ml-4">
                                    {f.questions.map((q) => renderAnswerForQuestion(q, catAnswerMap.get(q.id)))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-[40px]">touch_app</span>
                    <p className="font-body-md text-body-md mt-2">Select a submission to view its detailed responses.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

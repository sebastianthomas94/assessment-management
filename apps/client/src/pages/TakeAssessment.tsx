import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicAssessment, submitPublicResponse } from '../api/public';
import { ApiError } from '../api/client';
import type { Answer, Assessment, Question, QuestionType, Score } from '../types/assessment';

const EMPTY_ANSWER = Symbol(' unanswered');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AnswerMap = Record<string, { value: string | number | boolean; type: QuestionType } | typeof EMPTY_ANSWER>;

/**
 * Public assessment taker (route `/take/:assessmentId`). No login required —
 * respondents answer every question, then provide a name + email to submit.
 */
export default function TakeAssessment() {
  const { assessmentId } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [resultScore, setResultScore] = useState<Score | null>(null);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!assessmentId) {
      setError('No assessment specified.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPublicAssessment(assessmentId)
      .then(({ assessment }) => {
        if (cancelled) return;
        setAssessment(assessment);
        const initial: AnswerMap = {};
        for (const cat of assessment.categories) {
          for (const f of cat.factors) {
            for (const q of f.questions) initial[q.id] = EMPTY_ANSWER;
          }
        }
        setAnswers(initial);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load assessment.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [assessmentId]);

  const allQuestions = useMemo<Question[]>(() => {
    if (!assessment) return [];
    const qs: Question[] = [];
    for (const cat of assessment.categories) for (const f of cat.factors) for (const q of f.questions) qs.push(q);
    return qs;
  }, [assessment]);

  const answeredCount = useMemo(
    () => allQuestions.filter((q) => answers[q.id] !== EMPTY_ANSWER).length,
    [allQuestions, answers]
  );
  const progress = allQuestions.length > 0 ? Math.round((answeredCount / allQuestions.length) * 100) : 0;

  const setAnswer = (q: Question, value: string | number | boolean) =>
    setAnswers((prev) => ({ ...prev, [q.id]: { value, type: q.type } }));

  // Step 1: validate answers, then open the identity modal.
  const handleReview = () => {
    if (answeredCount < allQuestions.length) {
      setSubmitError('Please answer all questions before submitting.');
      return;
    }
    setSubmitError(null);
    setIdentityOpen(true);
  };

  // Step 2: collect name/email and submit.
  const handleSubmit = async () => {
    if (!assessmentId) return;
    if (!name.trim()) { setSubmitError('Please enter your name.'); return; }
    if (!EMAIL_REGEX.test(email.trim())) { setSubmitError('Please enter a valid email address.'); return; }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload: Answer[] = allQuestions.map((q) => {
        const a = answers[q.id];
        const entry = a === EMPTY_ANSWER ? { value: '', type: q.type } : a;
        switch (entry.type) {
          case 'multiple_choice': return { questionId: q.id, type: q.type, selectedOption: String(entry.value) };
          case 'rating_scale': return { questionId: q.id, type: q.type, ratingValue: Number(entry.value) };
          case 'boolean': return { questionId: q.id, type: q.type, booleanValue: Boolean(entry.value) };
          case 'open_text': return { questionId: q.id, type: q.type, textValue: String(entry.value) };
        }
      });
      const { response } = await submitPublicResponse(assessmentId, { name: name.trim(), email: email.trim(), answers: payload });
      setResultScore(response.score);
      setIdentityOpen(false);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed to submit responses.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----- render helpers per question type -----
  const renderQuestionInput = (q: Question) => {
    const a = answers[q.id];
    const answered = a !== EMPTY_ANSWER;
    const entry = answered ? (a as { value: string | number | boolean; type: QuestionType }) : null;

    if (q.type === 'multiple_choice' && q.options) {
      return (
        <div className="flex flex-col gap-3 mt-2">
          {q.options.map((opt, i) => {
            const selected = entry?.type === 'multiple_choice' && entry.value === opt;
            return (
              <div key={i} className="relative">
                <input className="radio-custom sr-only peer" id={`${q.id}_opt${i}`} name={q.id} type="radio" checked={selected} onChange={() => setAnswer(q, opt)} />
                <label className="flex items-center p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-surface-container-low transition-colors" htmlFor={`${q.id}_opt${i}`}>
                  <div className="radio-indicator w-5 h-5 rounded-full border-2 border-outline-variant mr-3 relative flex-shrink-0 transition-colors" />
                  <span className="font-body-md text-body-md text-on-surface">{opt}</span>
                </label>
              </div>
            );
          })}
        </div>
      );
    }

    if (q.type === 'rating_scale') {
      const max = q.scaleMax ?? 5;
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
            const selected = entry?.type === 'rating_scale' && entry.value === n;
            return (
              <button
                key={n}
                type="button"
                className={`w-10 h-10 rounded-lg font-title-md text-title-md flex items-center justify-center transition-colors ${selected ? 'bg-primary text-on-primary ring-2 ring-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                onClick={() => setAnswer(q, n)}
              >
                {n}
              </button>
            );
          })}
        </div>
      );
    }

    if (q.type === 'boolean') {
      const selectedYes = entry?.type === 'boolean' && entry.value === true;
      const selectedNo = entry?.type === 'boolean' && entry.value === false;
      return (
        <div className="flex gap-4 mt-2">
          <div className="relative flex-1">
            <input className="radio-custom sr-only peer" id={`${q.id}_yes`} name={q.id} type="radio" checked={selectedYes} onChange={() => setAnswer(q, true)} />
            <label className="flex items-center justify-center p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-surface-container-low transition-colors" htmlFor={`${q.id}_yes`}>
              <span className="font-label-lg text-label-lg text-on-surface">Yes</span>
            </label>
          </div>
          <div className="relative flex-1">
            <input className="radio-custom sr-only peer" id={`${q.id}_no`} name={q.id} type="radio" checked={selectedNo} onChange={() => setAnswer(q, false)} />
            <label className="flex items-center justify-center p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low peer-checked:border-error peer-checked:bg-error-container peer-checked:text-on-error-container transition-colors" htmlFor={`${q.id}_no`}>
              <span className="font-label-lg text-label-lg text-on-surface">No</span>
            </label>
          </div>
        </div>
      );
    }

    // open_text
    return (
      <div className="mt-2">
        <label className="sr-only" htmlFor={`${q.id}_text`}>Response for {q.id}</label>
        <textarea
          className="w-full p-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-none"
          id={`${q.id}_text`}
          placeholder="Enter your response here..."
          rows={4}
          value={entry?.type === 'open_text' ? String(entry.value) : ''}
          onChange={(e) => setAnswer(q, e.target.value)}
        />
      </div>
    );
  };

  // ----- error / loading / success states -----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface gap-4 p-6 text-center">
        <span className="material-symbols-outlined text-error text-[48px]">error</span>
        <p className="font-body-lg text-body-lg">{error ?? 'Assessment not found.'}</p>
        <p className="font-body-md text-body-md text-on-surface-variant">This assessment may be unpublished or the link may be incorrect.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface gap-4 p-6 text-center">
        <span className="material-symbols-outlined text-secondary text-[64px]">check_circle</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Thank you, {name.trim()}!</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Your responses for “{assessment.title}” have been submitted.</p>
        {resultScore && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <div className="text-4xl font-bold text-primary">{resultScore.percentage}%</div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              You scored {resultScore.earned} out of {resultScore.max} graded {resultScore.max === 1 ? 'question' : 'questions'} correctly.
            </p>
          </div>
        )}
        <p className="font-body-md text-body-md text-on-surface-variant">You can now close this tab.</p>
      </div>
    );
  }

  let questionNumber = 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <nav className="bg-surface-bright border-b border-outline-variant top-0 sticky z-50 shadow-sm flex justify-between items-center px-container-padding h-16 w-full">
        <div className="flex items-center gap-element-gap">
          <span className="material-symbols-outlined text-primary">fact_check</span>
          <span className="font-headline-sm text-headline-sm text-primary font-bold">AssessMaster</span>
        </div>
        <span className="font-label-md text-label-md text-on-surface-variant">{answeredCount}/{allQuestions.length} answered</span>
      </nav>

      <main className="flex-grow flex justify-center py-section-margin px-container-padding">
        <div className="w-full max-w-workspace flex flex-col gap-section-margin">
          <header className="flex flex-col gap-element-gap">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-surface mb-2">{assessment.title}</h1>
              {assessment.description && <p className="font-body-lg text-body-lg text-on-surface-variant">{assessment.description}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-label-md text-label-md text-on-surface-variant">Overall Progress</span>
                <span className="font-label-md text-label-md text-primary font-semibold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-secondary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </header>

          {assessment.categories.map((cat) => (
            <section key={cat.id} className="flex flex-col gap-element-gap">
              <div className="flex items-center gap-2 pt-2">
                <span className="material-symbols-outlined text-primary">folder_open</span>
                <h2 className="font-title-lg text-title-lg text-on-surface">{cat.title}</h2>
              </div>
              {cat.factors.map((f) => (
                <div key={f.id} className="flex flex-col gap-element-gap ml-4 border-l-2 border-outline-variant pl-5">
                  <h3 className="font-title-md text-title-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">{f.icon}</span> {f.title}
                  </h3>
                  {f.questions.map((q) => {
                    questionNumber += 1;
                    return (
                      <div key={q.id} className="assessment-card p-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-title-md text-title-md bg-surface-container-highest text-on-surface">
                            {questionNumber}
                          </div>
                          <div className="flex-grow flex flex-col gap-4">
                            <div>
                              <h3 className="font-title-lg text-title-lg text-on-surface mb-1">
                                {q.text} {q.required && <span className="text-error text-sm">*</span>}
                              </h3>
                            </div>
                            {renderQuestionInput(q)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </section>
          ))}

          {submitError && !identityOpen && (
            <div className="p-3 rounded-lg bg-error-container/40 border border-error/30 text-error flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span className="font-body-md text-body-md">{submitError}</span>
            </div>
          )}

          <div className="flex justify-end items-center pt-section-margin border-t border-outline-variant mt-4">
            <button
              className="px-8 py-3 bg-primary-container text-on-primary rounded-lg font-label-lg text-label-lg hover:bg-primary transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
              onClick={handleReview}
              disabled={answeredCount < allQuestions.length}
              title={answeredCount < allQuestions.length ? 'Answer all questions to submit' : 'Submit your responses'}
            >
              Submit Responses
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </main>

      {/* Identity modal — collect name + email at submission. */}
      {identityOpen && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-outline-variant w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant bg-surface-bright">
              <h2 className="font-title-lg text-title-lg text-on-surface">Almost done</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Add your details so we can record your submission.</p>
            </div>
            <div className="px-6 py-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="respondent-name">Full Name</label>
                <input
                  id="respondent-name"
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="respondent-email">Email Address</label>
                <input
                  id="respondent-email"
                  type="email"
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {submitError && (
                <p className="font-label-md text-label-md text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">error</span> {submitError}
                </p>
              )}
            </div>
            <div className="px-6 py-4 bg-surface flex justify-end gap-3 border-t border-outline-variant">
              <button
                className="px-4 py-2 border border-secondary text-secondary rounded-lg font-label-lg text-label-lg hover:bg-surface-container-low transition-colors"
                onClick={() => { setIdentityOpen(false); setSubmitError(null); }}
                disabled={submitting}
              >
                Back
              </button>
              <button
                className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-lg text-label-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
                <span className="material-symbols-outlined text-[20px]">{submitting ? 'progress_activity' : 'send'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

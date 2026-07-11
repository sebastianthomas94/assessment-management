import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Accordion from '../components/Accordion';
import QuestionModal, { type QuestionTypeConfig } from '../components/QuestionModal';
import LoadCategoriesModal from '../components/LoadCategoriesModal';
import PaywallModal from '../components/PaywallModal';
import { createAssessment, getAssessment, updateAssessment } from '../api/assessments';
import { ApiError } from '../api/client';
import { type Question, type Factor, type Category, type QuestionType } from '../types/assessment';

// ---------- ids ----------
let idCounter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

const TYPE_BADGE: Record<QuestionType, { label: string; classes: string }> = {
  multiple_choice: { label: 'Multiple Choice', classes: 'bg-primary-container text-on-primary' },
  rating_scale: { label: 'Rating Scale', classes: 'bg-secondary-container text-on-secondary' },
  boolean: { label: 'Yes / No', classes: 'bg-tertiary-container text-on-tertiary' },
  open_text: { label: 'Open Text', classes: 'bg-surface-variant text-on-surface-variant' },
};

const TYPE_ICON: Record<QuestionType, string> = {
  multiple_choice: 'check_circle',
  rating_scale: 'star_rate',
  boolean: 'toggle_on',
  open_text: 'notes',
};

// ---------- default-element factories ----------
function newCategory(): Category {
  return { id: uid('cat'), title: 'New Category', description: '', factors: [] };
}
function newFactor(): Factor {
  return { id: uid('fct'), title: 'New Factor', icon: 'help_center', questions: [] };
}
function newQuestion(type: QuestionType): Question {
  return {
    id: uid('q'),
    text: 'New question',
    type,
    required: true,
    options: type === 'multiple_choice' ? ['Option 1', 'Option 2'] : undefined,
    scaleMax: type === 'rating_scale' ? 5 : undefined,
  };
}

const EMPTY_STATE: { title: string; description: string; categories: Category[] } = {
  title: '',
  description: '',
  categories: [],
};

export default function Builder() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [title, setTitle] = useState(EMPTY_STATE.title);
  const [description, setDescription] = useState(EMPTY_STATE.description);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadCategoriesOpen, setLoadCategoriesOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const activeFactorIdRef = useState<string | null>(null);
  const [activeFactorId, setActiveFactorId] = activeFactorIdRef;
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // When an :id is present we're editing an existing draft: hydrate from the API.
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ---------- toast helper ----------
  const showToastMsg = (msg: string, isError = false) => {
    setToastMsg(msg);
    setToastError(isError);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // ---------- load existing draft (edit mode) ----------
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getAssessment(id)
      .then(({ assessment }) => {
        if (cancelled) return;
        // Only drafts are editable; published assessments may already have responses.
        if (assessment.status !== 'draft') {
          showToastMsg('Published assessments cannot be edited.', true);
          navigate('/dashboard');
          return;
        }
        setTitle(assessment.title);
        setDescription(assessment.description);
        setCategories(assessment.categories);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load assessment.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ---------- category CRED ----------
  const addCategory = () => setCategories((cs) => [...cs, { ...newCategory() }]);

  // Append categories loaded from previous assessments (already cloned with fresh ids).
  const appendCategories = (loaded: Category[]) => setCategories((cs) => [...cs, ...loaded]);

  const updateCategory = (catId: string, patch: Partial<Category>) =>
    setCategories((cs) => cs.map((c) => (c.id === catId ? { ...c, ...patch } : c)));

  const deleteCategory = (catId: string) =>
    setCategories((cs) => cs.filter((c) => c.id !== catId));

  // ---------- factor CRED ----------
  const addFactor = (catId: string) =>
    setCategories((cs) => cs.map((c) => (c.id === catId ? { ...c, factors: [...c.factors, newFactor()] } : c)));

  const updateFactor = (catId: string, factorId: string, patch: Partial<Factor>) =>
    setCategories((cs) =>
      cs.map((c) => (c.id === catId ? { ...c, factors: c.factors.map((f) => (f.id === factorId ? { ...f, ...patch } : f)) } : c))
    );

  const deleteFactor = (catId: string, factorId: string) =>
    setCategories((cs) =>
      cs.map((c) => (c.id === catId ? { ...c, factors: c.factors.filter((f) => f.id !== factorId) } : c))
    );

  // ---------- question CRED ----------
  const openQuestionModal = (catId: string, factorId: string) => {
    setActiveFactorId(factorId);
    setModalOpen(true);
  };

  const handleQuestionConfig = (config: QuestionTypeConfig[]) => {
    if (!activeFactorId) return;
    const newQuestions: Question[] = [];
    for (const row of config) {
      for (let i = 0; i < row.count; i++) newQuestions.push(newQuestion(row.type));
    }
    setCategories((cs) =>
      cs.map((c) => ({
        ...c,
        factors: c.factors.map((f) => (f.id === activeFactorId ? { ...f, questions: [...f.questions, ...newQuestions] } : f)),
      }))
    );
    setModalOpen(false);
    setActiveFactorId(null);
  };

  const updateQuestion = (catId: string, factorId: string, qId: string, patch: Partial<Question>) =>
    setCategories((cs) =>
      cs.map((c) =>
        c.id === catId
          ? {
              ...c,
              factors: c.factors.map((f) =>
                f.id === factorId ? { ...f, questions: f.questions.map((q) => (q.id === qId ? { ...q, ...patch } : q)) } : f
              ),
            }
          : c
      )
    );

  const deleteQuestion = (catId: string, factorId: string, qId: string) =>
    setCategories((cs) =>
      cs.map((c) =>
        c.id === catId
          ? { ...c, factors: c.factors.map((f) => (f.id === factorId ? { ...f, questions: f.questions.filter((q) => q.id !== qId) } : f)) }
          : c
      )
    );

  // ---------- options (multiple_choice) ----------
  const setOption = (catId: string, factorId: string, qId: string, optIdx: number, value: string) =>
    setCategories((cs) =>
      cs.map((c) =>
        c.id === catId
          ? {
              ...c,
              factors: c.factors.map((f) =>
                f.id === factorId
                  ? {
                      ...f,
                      questions: f.questions.map((q) => {
                        if (q.id !== qId) return q;
                        const oldOpt = q.options?.[optIdx];
                        return {
                          ...q,
                          options: q.options?.map((o, i) => (i === optIdx ? value : o)),
                          // Keep the answer key pointing at the same option after a rename.
                          correctOption: q.correctOption === oldOpt ? value : q.correctOption,
                        };
                      }),
                    }
                  : f
              ),
            }
          : c
      )
    );

  const removeOption = (catId: string, factorId: string, qId: string, optIdx: number) =>
    setCategories((cs) =>
      cs.map((c) =>
        c.id === catId
          ? {
              ...c,
              factors: c.factors.map((f) =>
                f.id === factorId
                  ? {
                      ...f,
                      questions: f.questions.map((q) => {
                        if (q.id !== qId) return q;
                        const removed = q.options?.[optIdx];
                        return {
                          ...q,
                          options: q.options?.filter((_, i) => i !== optIdx),
                          // Drop the answer key if its option was removed.
                          correctOption: q.correctOption === removed ? undefined : q.correctOption,
                        };
                      }),
                    }
                  : f
              ),
            }
          : c
      )
    );

  const appendOption = (catId: string, factorId: string, qId: string) =>
    setCategories((cs) =>
      cs.map((c) =>
        c.id === catId
          ? {
              ...c,
              factors: c.factors.map((f) =>
                f.id === factorId
                  ? {
                      ...f,
                      questions: f.questions.map((q) =>
                        q.id === qId ? { ...q, options: [...(q.options ?? []), `Option ${(q.options?.length ?? 0) + 1}`] } : q
                      ),
                    }
                  : f
              ),
            }
          : c
      )
    );

  // ---------- save / discard ----------
  const resetBuilder = () => {
    setTitle(EMPTY_STATE.title);
    setDescription(EMPTY_STATE.description);
    setCategories([]);
    setSaveError(null);
  };

  // In edit mode "Discard" cancels back to the dashboard; in create mode it clears the form.
  const handleDiscard = () => {
    if (isEditing) {
      navigate('/dashboard');
      return;
    }
    resetBuilder();
  };

  // Open-text answers can't be auto-graded — surface the AI-evaluation paywall
  // when the assessment contains at least one.
  const hasOpenText = categories.some((c) =>
    c.factors.some((f) => f.questions.some((q) => q.type === 'open_text'))
  );

  const handleSave = async () => {
    setSaveError(null);
    if (!title.trim()) {
      setSaveError('Please enter an assessment title.');
      return;
    }
    const totalQuestions = categories.reduce(
      (sum, c) => sum + c.factors.reduce((fSum, f) => fSum + f.questions.length, 0),
      0
    );
    if (categories.length === 0 || totalQuestions === 0) {
      setSaveError('Add at least one category with a factor and question before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = { title: title.trim(), description: description.trim(), categories };
      if (isEditing && id) {
        await updateAssessment(id, payload);
        showToastMsg('Assessment updated successfully!');
      } else {
        await createAssessment(payload);
        showToastMsg('Assessment saved successfully!');
      }
      resetBuilder();
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof ApiError || err instanceof Error ? err.message : 'Failed to save assessment.';
      setSaveError(msg);
      showToastMsg(msg, true);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout activeKey="builder" topBar={{ searchPlaceholder: 'Search...' }}>
        <div className="max-w-[1024px] mx-auto flex flex-col items-center justify-center py-32 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
          <p className="font-body-lg text-body-lg mt-3">Loading assessment...</p>
        </div>
      </AppLayout>
    );
  }

  if (loadError) {
    return (
      <AppLayout activeKey="builder" topBar={{ searchPlaceholder: 'Search...' }}>
        <div className="max-w-[1024px] mx-auto">
          <div className="bg-error-container/30 border border-error/30 rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-error text-[32px]">cloud_off</span>
            <p className="font-body-lg text-body-lg text-error mt-2">{loadError}</p>
            <button
              className="mt-4 px-4 py-2 border border-error text-error rounded-lg hover:bg-error-container transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeKey="builder" topBar={{ searchPlaceholder: 'Search...' }}>
      <div className="max-w-[1024px] mx-auto pb-32">
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex-1">
            <label className="block font-label-md text-label-md text-on-surface-variant mb-1" htmlFor="assessment-title">Assessment title</label>
            <input
              id="assessment-title"
              className="block w-full font-display-lg text-display-lg text-on-surface bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-1 transition-colors"
              placeholder="Untitled Assessment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="block w-full font-body-lg text-body-lg text-on-surface-variant bg-transparent border-b border-outline-variant focus:border-primary outline-none py-1 mt-3 transition-colors"
              placeholder="Add a short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              className="flex-1 md:flex-none justify-center px-4 py-2 border border-outline text-on-surface rounded-lg font-label-lg hover:bg-surface-container transition-colors flex items-center gap-2"
              onClick={() => setLoadCategoriesOpen(true)}
            >
              <span className="material-symbols-outlined text-[20px]">library_add</span>
              Load Categories
            </button>
            <button
              className="flex-1 md:flex-none justify-center px-4 py-2 bg-primary text-on-primary rounded-lg font-label-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
              onClick={addCategory}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Category
            </button>
          </div>
        </div>

        {saveError && (
          <div className="mb-6 p-3 rounded-lg bg-error-container/40 border border-error/30 text-error flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span className="font-body-md text-body-md">{saveError}</span>
          </div>
        )}

        {/* AI text-evaluation paywall banner (shown when open-text questions exist) */}
        {hasOpenText && (
          <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary-container/20 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <div className="flex-1">
              <p className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                Auto-grade open-text answers
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tertiary-container text-on-tertiary">Coming soon</span>
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Open-text answers aren&apos;t scored automatically. Unlock AI text evaluation to grade them against a model answer.
              </p>
            </div>
            <button
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
              onClick={() => setPaywallOpen(true)}
            >
              <span className="material-symbols-outlined text-[20px]">lock_open</span>
              Unlock AI evaluation
            </button>
          </div>
        )}

        {/* Builder Hierarchy Area */}
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-[64px] text-outline">architecture</span>
            <h3 className="font-title-lg text-title-lg text-on-surface-variant mt-2">Start building your assessment</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Add a category, then a factor, then configure questions.</p>
            <button
              className="px-6 py-2.5 border border-dashed border-primary text-primary rounded-lg hover:bg-surface-container transition-colors inline-flex items-center gap-2"
              onClick={addCategory}
            >
              <span className="material-symbols-outlined text-[20px]">add</span> Add First Category
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <CategoryBlock
                key={category.id}
                category={category}
                onCategoryChange={(patch) => updateCategory(category.id, patch)}
                onDeleteCategory={() => deleteCategory(category.id)}
                onAddFactor={() => addFactor(category.id)}
                onFactorChange={(fid, patch) => updateFactor(category.id, fid, patch)}
                onDeleteFactor={(fid) => deleteFactor(category.id, fid)}
                onAddQuestion={(fid) => openQuestionModal(category.id, fid)}
                onQuestionChange={(fid, qid, patch) => updateQuestion(category.id, fid, qid, patch)}
                onDeleteQuestion={(fid, qid) => deleteQuestion(category.id, fid, qid)}
                onSetOption={(fid, qid, oi, val) => setOption(category.id, fid, qid, oi, val)}
                onRemoveOption={(fid, qid, oi) => removeOption(category.id, fid, qid, oi)}
                onAppendOption={(fid, qid) => appendOption(category.id, fid, qid)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 md:left-[280px] right-0 bg-surface/90 backdrop-blur-md border-t border-outline-variant p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="hidden sm:flex items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">edit_note</span>
          <span className="font-body-md text-sm">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}{' · '}
            {categories.reduce((s, c) => s + c.factors.length, 0)} factors{' · '}
            {categories.reduce((s, c) => s + c.factors.reduce((fs, f) => fs + f.questions.length, 0), 0)} questions
          </span>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none px-6 py-2 border border-outline text-on-surface font-label-lg rounded-lg hover:bg-surface-container transition-colors"
            onClick={handleDiscard}
            disabled={isSaving || (!isEditing && categories.length === 0 && !title)}
          >
            {isEditing ? 'Cancel' : 'Discard Draft'}
          </button>
          <button
            className={`flex-1 sm:flex-none justify-center px-6 py-2 ${isSaving ? 'bg-secondary' : 'bg-primary'} text-on-primary font-label-lg rounded-lg hover:bg-primary-container transition-all shadow-sm flex items-center gap-2 disabled:opacity-60`}
            onClick={handleSave}
            disabled={isSaving}
          >
            <span className="material-symbols-outlined text-[20px]">{isSaving ? 'progress_activity' : 'save'}</span>
            {isSaving ? 'Saving...' : isEditing ? 'Update Assessment' : 'Save Assessment'}
          </button>
        </div>
      </div>

      <QuestionModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setActiveFactorId(null); }} onConfirm={handleQuestionConfig} />

      <LoadCategoriesModal isOpen={loadCategoriesOpen} onClose={() => setLoadCategoriesOpen(false)} onAppend={appendCategories} />

      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />

      {/* Success / Error Toast */}
      <div
        className={`fixed bottom-24 right-8 ${toastError ? 'bg-error' : 'bg-secondary'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 z-50 pointer-events-none ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <span className="material-symbols-outlined">{toastError ? 'error' : 'check_circle'}</span>
        <span className="font-label-lg">{toastMsg}</span>
      </div>
    </AppLayout>
  );
}

// ---------- Category block (with its own inline-edit state) ----------
interface CategoryBlockProps {
  category: Category;
  onCategoryChange: (patch: Partial<Category>) => void;
  onDeleteCategory: () => void;
  onAddFactor: () => void;
  onFactorChange: (factorId: string, patch: Partial<Factor>) => void;
  onDeleteFactor: (factorId: string) => void;
  onAddQuestion: (factorId: string) => void;
  onQuestionChange: (factorId: string, qId: string, patch: Partial<Question>) => void;
  onDeleteQuestion: (factorId: string, qId: string) => void;
  onSetOption: (factorId: string, qId: string, optIdx: number, value: string) => void;
  onRemoveOption: (factorId: string, qId: string, optIdx: number) => void;
  onAppendOption: (factorId: string, qId: string) => void;
}

function CategoryBlock({
  category,
  onCategoryChange,
  onDeleteCategory,
  onAddFactor,
  onFactorChange,
  onDeleteFactor,
  onAddQuestion,
  onQuestionChange,
  onDeleteQuestion,
  onSetOption,
  onRemoveOption,
  onAppendOption,
}: CategoryBlockProps) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(category.title);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(category.description);

  const startEdit = () => { setEditValue(category.title); setEditing(true); };
  const confirmEdit = () => { onCategoryChange({ title: editValue.trim() || 'Untitled Category' }); setEditing(false); };
  const cancelEdit = () => { setEditValue(category.title); setEditing(false); };

  const startDescEdit = () => { setDescValue(category.description); setEditingDesc(true); };
  const confirmDescEdit = () => { onCategoryChange({ description: descValue.trim() }); setEditingDesc(false); };
  const cancelDescEdit = () => { setDescValue(category.description); setEditingDesc(false); };

  return (
    <Accordion
      open={expanded}
      onToggle={() => setExpanded(!expanded)}
      header={
        <div className="flex items-center justify-between w-full p-4 bg-surface-container-lowest border-b border-outline-variant">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined accordion-chevron text-on-surface-variant transition-transform duration-200">chevron_right</span>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
            <div>
              {editing ? (
                <input
                  autoFocus
                  className="font-title-lg text-title-lg text-on-surface bg-surface-container-low border border-primary rounded px-2 py-0.5 outline-none"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={confirmEdit}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') cancelEdit(); }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <h3 className="font-title-lg text-title-lg text-on-surface">{category.title}</h3>
              )}
              {editingDesc ? (
                <input
                  autoFocus
                  className="font-body-md text-body-md text-on-surface-variant bg-surface-container-low border border-primary rounded px-2 py-0.5 outline-none mt-1 w-72"
                  placeholder="Add a description"
                  value={descValue}
                  onChange={(e) => setDescValue(e.target.value)}
                  onBlur={confirmDescEdit}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmDescEdit(); if (e.key === 'Escape') cancelDescEdit(); }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {category.description || <button className="text-primary underline-offset-2 hover:underline" onClick={(e) => { e.stopPropagation(); startDescEdit(); }}>+ add description</button>}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant mr-2">
              {category.factors.length} {category.factors.length === 1 ? 'factor' : 'factors'}
            </span>
            <button className="p-1.5 text-on-surface-variant hover:text-primary rounded transition-colors" title="Edit Category" onClick={(e) => { e.stopPropagation(); startEdit(); }}>
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button className="p-1.5 text-on-surface-variant hover:text-error rounded transition-colors" title="Delete Category" onClick={(e) => { e.stopPropagation(); if (confirm(`Delete category "${category.title}" and all its contents?`)) onDeleteCategory(); }}>
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
      }
      bodyClassName="p-4 bg-surface pt-6 pb-8"
    >
      {category.factors.map((factor) => (
        <FactorBlock
          key={factor.id}
          factor={factor}
          onFactorChange={(patch) => onFactorChange(factor.id, patch)}
          onDeleteFactor={() => onDeleteFactor(factor.id)}
          onAddQuestion={() => onAddQuestion(factor.id)}
          onQuestionChange={(qid, patch) => onQuestionChange(factor.id, qid, patch)}
          onDeleteQuestion={(qid) => onDeleteQuestion(factor.id, qid)}
          onSetOption={(qid, oi, val) => onSetOption(factor.id, qid, oi, val)}
          onRemoveOption={(qid, oi) => onRemoveOption(factor.id, qid, oi)}
          onAppendOption={(qid) => onAppendOption(factor.id, qid)}
        />
      ))}

      <button
        className="ml-6 mt-4 px-4 py-2 text-sm text-secondary font-medium hover:bg-surface-container rounded-md transition-colors flex items-center gap-2 border border-dashed border-secondary"
        onClick={onAddFactor}
      >
        <span className="material-symbols-outlined text-[18px]">add</span> Add Factor
      </button>
    </Accordion>
  );
}

// ---------- Factor block ----------
interface FactorBlockProps {
  factor: Factor;
  onFactorChange: (patch: Partial<Factor>) => void;
  onDeleteFactor: () => void;
  onAddQuestion: () => void;
  onQuestionChange: (qId: string, patch: Partial<Question>) => void;
  onDeleteQuestion: (qId: string) => void;
  onSetOption: (qId: string, optIdx: number, value: string) => void;
  onRemoveOption: (qId: string, optIdx: number) => void;
  onAppendOption: (qId: string) => void;
}

function FactorBlock({
  factor,
  onFactorChange,
  onDeleteFactor,
  onAddQuestion,
  onQuestionChange,
  onDeleteQuestion,
  onSetOption,
  onRemoveOption,
  onAppendOption,
}: FactorBlockProps) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(factor.title);

  const startEdit = () => { setEditValue(factor.title); setEditing(true); };
  const confirmEdit = () => { onFactorChange({ title: editValue.trim() || 'Untitled Factor' }); setEditing(false); };
  const cancelEdit = () => { setEditValue(factor.title); setEditing(false); };

  return (
    <div className="factor-container">
      <Accordion
        open={expanded}
        onToggle={() => setExpanded(!expanded)}
        headerClassName="p-3 bg-surface-container-lowest border-b border-outline-variant"
        header={
          <>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined accordion-chevron text-on-surface-variant text-[20px] transition-transform duration-200">chevron_right</span>
              <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{factor.icon}</span>
              {editing ? (
                <input
                  autoFocus
                  className="font-title-md text-title-md text-on-surface bg-surface-container-low border border-primary rounded px-2 py-0.5 outline-none"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={confirmEdit}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') cancelEdit(); }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <h4 className="font-title-md text-title-md text-on-surface">{factor.title}</h4>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-surface-container px-2 py-1 rounded text-xs font-label-md text-primary">
                {factor.questions.length} {factor.questions.length === 1 ? 'Question' : 'Questions'}
              </span>
              <div className="flex items-center gap-1">
                <button className="p-1 text-on-surface-variant hover:text-primary rounded" title="Edit Factor" onClick={(e) => { e.stopPropagation(); startEdit(); }}>
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button className="p-1 text-on-surface-variant hover:text-error rounded" title="Delete Factor" onClick={(e) => { e.stopPropagation(); if (confirm(`Delete factor "${factor.title}"?`)) onDeleteFactor(); }}>
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </>
        }
        bodyClassName="p-4 bg-background pt-4 pb-6 space-y-4"
      >
        {factor.questions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-on-surface-variant mb-3">No questions defined for this factor yet.</p>
            <button
              className="px-4 py-2 border border-dashed border-primary text-primary rounded-lg hover:bg-surface-container transition-colors inline-flex items-center gap-2"
              onClick={onAddQuestion}
            >
              <span className="material-symbols-outlined text-[18px]">add</span> Add First Question
            </button>
          </div>
        ) : (
          <>
            {factor.questions.map((q) => (
              <QuestionRow
                key={q.id}
                question={q}
                onQuestionChange={(patch) => onQuestionChange(q.id, patch)}
                onDeleteQuestion={() => onDeleteQuestion(q.id)}
                onSetOption={(oi, val) => onSetOption(q.id, oi, val)}
                onRemoveOption={(oi) => onRemoveOption(q.id, oi)}
                onAppendOption={() => onAppendOption(q.id)}
              />
            ))}
            <button
              className="ml-8 mt-2 px-3 py-1.5 text-sm text-primary font-medium hover:bg-surface-container rounded-md transition-colors flex items-center gap-1 border border-dashed border-primary"
              onClick={onAddQuestion}
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Question
            </button>
          </>
        )}
      </Accordion>
    </div>
  );
}

// ---------- Question row (with inline text + options editor) ----------
interface QuestionRowProps {
  question: Question;
  onQuestionChange: (patch: Partial<Question>) => void;
  onDeleteQuestion: () => void;
  onSetOption: (optIdx: number, value: string) => void;
  onRemoveOption: (optIdx: number) => void;
  onAppendOption: () => void;
}

function QuestionRow({ question, onQuestionChange, onDeleteQuestion, onSetOption, onRemoveOption, onAppendOption }: QuestionRowProps) {
  const [editingText, setEditingText] = useState(false);
  const [textValue, setTextValue] = useState(question.text);
  const [showOptions, setShowOptions] = useState(false);

  const badge = TYPE_BADGE[question.type];
  const confirmText = () => { onQuestionChange({ text: textValue.trim() || 'Untitled question' }); setEditingText(false); };

  return (
    <div className="question-container">
      <div className="workspace-card p-4 hover:border-primary transition-colors group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <span className="material-symbols-outlined text-outline mt-1 text-[18px]">{TYPE_ICON[question.type]}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`${badge.classes} px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider`}>{badge.label}</span>
                <button
                  className={`text-xs px-1.5 py-0.5 rounded ${question.required ? 'text-secondary bg-secondary/10' : 'text-on-surface-variant bg-surface-container'}`}
                  title="Toggle required"
                  onClick={() => onQuestionChange({ required: !question.required })}
                >
                  {question.required ? 'Required' : 'Optional'}
                </button>
              </div>
              {editingText ? (
                <textarea
                  autoFocus
                  className="font-body-md text-body-md text-on-surface bg-surface-container-low border border-primary rounded px-2 py-1 outline-none w-full resize-none"
                  rows={2}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  onBlur={confirmText}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); confirmText(); } if (e.key === 'Escape') { setTextValue(question.text); setEditingText(false); } }}
                />
              ) : (
                <p
                  className="font-body-md text-body-md text-on-surface font-medium cursor-text"
                  onClick={() => { setTextValue(question.text); setEditingText(true); }}
                  title="Click to edit question text"
                >
                  {question.text}
                </p>
              )}

              {/* Options editor for multiple_choice */}
              {question.type === 'multiple_choice' && (
                <div className="mt-3">
                  <button
                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                    onClick={() => setShowOptions((s) => !s)}
                  >
                    <span className="material-symbols-outlined text-[14px]">{showOptions ? 'expand_less' : 'expand_more'}</span>
                    {showOptions ? 'Hide' : 'Edit'} options ({question.options?.length ?? 0})
                  </button>
                  {showOptions && (
                    <div className="mt-2 space-y-2 ml-2">
                      {question.options?.map((opt, oi) => {
                        const isCorrect = opt !== '' && question.correctOption === opt;
                        return (
                          <div key={oi} className="flex items-center gap-2">
                            <button
                              type="button"
                              className={`p-0.5 rounded transition-colors ${isCorrect ? 'text-secondary' : 'text-outline hover:text-secondary'}`}
                              title={isCorrect ? 'Correct answer (click to unset)' : 'Mark as correct answer'}
                              onClick={() => onQuestionChange({ correctOption: isCorrect ? undefined : opt })}
                            >
                              <span className="material-symbols-outlined text-[18px]" style={isCorrect ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                                {isCorrect ? 'check_circle' : 'radio_button_unchecked'}
                              </span>
                            </button>
                            <input
                              className="flex-1 px-2 py-1 text-sm border border-outline-variant rounded bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
                              value={opt}
                              onChange={(e) => onSetOption(oi, e.target.value)}
                            />
                            <button
                              className="p-0.5 text-on-surface-variant hover:text-error rounded"
                              title="Remove option"
                              onClick={() => onRemoveOption(oi)}
                              disabled={(question.options?.length ?? 0) <= 2}
                            >
                              <span className="material-symbols-outlined text-[18px]">remove_circle_outline</span>
                            </button>
                          </div>
                        );
                      })}
                      <button
                        className="text-xs text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                        onClick={onAppendOption}
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span> Add option
                      </button>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>
                        Mark the correct option to auto-score this question (optional).
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Scale config + correct answer for rating_scale */}
              {question.type === 'rating_scale' && (() => {
                const scaleMax = question.scaleMax ?? 5;
                return (
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <span>Scale 1 to</span>
                      <input
                        type="number"
                        min={2}
                        max={10}
                        className="w-16 px-2 py-0.5 border border-outline-variant rounded bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
                        value={scaleMax}
                        onChange={(e) => {
                          const nextMax = Math.max(2, Math.min(10, Number(e.target.value) || 5));
                          onQuestionChange({
                            scaleMax: nextMax,
                            // Drop the answer key if it no longer fits the scale.
                            correctRating:
                              question.correctRating !== undefined && question.correctRating > nextMax
                                ? undefined
                                : question.correctRating,
                          });
                        }}
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>
                      Correct answer
                      <select
                        className="px-2 py-0.5 border border-outline-variant rounded bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
                        value={question.correctRating ?? ''}
                        onChange={(e) => onQuestionChange({ correctRating: e.target.value === '' ? undefined : Number(e.target.value) })}
                      >
                        <option value="">Not graded</option>
                        {Array.from({ length: scaleMax }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                );
              })()}

              {/* Correct answer for boolean */}
              {question.type === 'boolean' && (
                <label className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>
                  Correct answer
                  <select
                    className="px-2 py-0.5 border border-outline-variant rounded bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
                    value={question.correctBoolean === undefined ? '' : question.correctBoolean ? 'yes' : 'no'}
                    onChange={(e) =>
                      onQuestionChange({
                        correctBoolean: e.target.value === '' ? undefined : e.target.value === 'yes',
                      })
                    }
                  >
                    <option value="">Not graded</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 text-on-surface-variant hover:text-primary rounded" title="Edit question" onClick={() => { setTextValue(question.text); setEditingText(true); }}>
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button className="p-1 text-on-surface-variant hover:text-error rounded" title="Delete question" onClick={() => { if (confirm('Delete this question?')) onDeleteQuestion(); }}>
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

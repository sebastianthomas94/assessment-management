import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import Accordion from '../components/Accordion';
import QuestionModal from '../components/QuestionModal';

interface QuestionDef {
  id: string;
  text: string;
  type: 'multiple_choice' | 'open_text';
  required: boolean;
  icon: string;
  badgeClasses: string;
}

interface FactorDef {
  id: string;
  title: string;
  icon: string;
  questionCount: number;
  expanded: boolean;
  questions: QuestionDef[];
}

interface CategoryDef {
  id: string;
  title: string;
  description: string;
  factorsTotal: number;
  factorsFilled: number;
  expanded: boolean;
  factors: FactorDef[];
}

const INITIAL_CATEGORIES: CategoryDef[] = [
  {
    id: 'cat-1',
    title: 'Technical Skills',
    description: 'Core programming and system design competencies.',
    factorsTotal: 4,
    factorsFilled: 3,
    expanded: true,
    factors: [
      {
        id: 'fct-1-1',
        title: 'Coding Proficiency',
        icon: 'code',
        questionCount: 2,
        expanded: true,
        questions: [
          {
            id: 'q-1-1-1',
            text: 'What is a closure in JavaScript?',
            type: 'multiple_choice',
            required: true,
            icon: 'help_center',
            badgeClasses: 'bg-primary-container text-on-primary',
          },
          {
            id: 'q-1-1-2',
            text: 'Explain the event loop and how it handles asynchronous operations.',
            type: 'open_text',
            required: false,
            icon: 'notes',
            badgeClasses: 'bg-surface-variant text-on-surface-variant',
          },
        ],
      },
      {
        id: 'fct-1-2',
        title: 'System Architecture',
        icon: 'schema',
        questionCount: 0,
        expanded: false,
        questions: [],
      },
    ],
  },
];

export default function Builder() {
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryDef[]>(INITIAL_CATEGORIES);

  const toggleCategory = (catId: string) =>
    setCategories((cats) => cats.map((c) => (c.id === catId ? { ...c, expanded: !c.expanded } : c)));

  const toggleFactor = (catId: string, factorId: string) =>
    setCategories((cats) =>
      cats.map((c) =>
        c.id === catId ? { ...c, factors: c.factors.map((f) => (f.id === factorId ? { ...f, expanded: !f.expanded } : f)) } : c
      )
    );

  const handleSave = () => {
    setIsSaving(true);
    setShowToast(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(false);
    }, 3000);
  };

  return (
    <AppLayout activeKey="builder" topBar={{ searchPlaceholder: 'Search...' }}>
      <div className="max-w-[1024px] mx-auto pb-32">
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Software Engineering Core</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Drafting new assessment structure. Last saved 2 mins ago.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-secondary text-secondary rounded-lg font-label-lg hover:bg-secondary-container hover:text-on-secondary-container transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">download</span>
              Load Categories
            </button>
            <button
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
              onClick={() => setModalOpen(true)}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Category
            </button>
          </div>
        </div>

        {/* Builder Hierarchy Area */}
        <div className="space-y-6">
          {categories.map((category) => {
            const completion = Math.round((category.factorsFilled / category.factorsTotal) * 100);
            return (
              <div key={category.id} className="mb-6">
                <Accordion
                  open={category.expanded}
                  onToggle={() => toggleCategory(category.id)}
                  header={
                    <div className="flex items-center justify-between w-full p-4 bg-surface-container-lowest border-b border-outline-variant">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined accordion-chevron text-on-surface-variant transition-transform duration-200">
                          chevron_right
                        </span>
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          folder_open
                        </span>
                        <div>
                          <h3 className="font-title-lg text-title-lg text-on-surface">{category.title}</h3>
                          <p className="font-body-md text-body-md text-on-surface-variant">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-secondary" style={{ width: `${completion}%` }} />
                          </div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {category.factorsFilled}/{category.factorsTotal} Factors
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-on-surface-variant hover:text-primary rounded transition-colors" title="Edit Category">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button className="p-1.5 text-on-surface-variant hover:text-error rounded transition-colors" title="Delete">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                          <span className="material-symbols-outlined text-outline-variant cursor-grab">drag_indicator</span>
                        </div>
                      </div>
                    </div>
                  }
                  bodyClassName="p-4 bg-surface pt-6 pb-8"
                >
                  {category.factors.map((factor) => (
                    <div key={factor.id} className="factor-container">
                      <Accordion
                        open={factor.expanded}
                        onToggle={() => toggleFactor(category.id, factor.id)}
                        headerClassName="p-3 bg-surface-container-lowest border-b border-outline-variant"
                        header={
                          <>
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined accordion-chevron text-on-surface-variant text-[20px] transition-transform duration-200">
                                chevron_right
                              </span>
                              <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {factor.icon}
                              </span>
                              <h4 className="font-title-md text-title-md text-on-surface">{factor.title}</h4>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="bg-surface-container px-2 py-1 rounded text-xs font-label-md text-primary">
                                {factor.questions.length} Questions
                              </span>
                              <div className="flex items-center gap-1">
                                <button className="p-1 text-on-surface-variant hover:text-primary rounded">
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <span className="material-symbols-outlined text-outline-variant cursor-grab text-[18px]">drag_indicator</span>
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
                              onClick={() => setModalOpen(true)}
                            >
                              <span className="material-symbols-outlined text-[18px]">add</span> Add First Question
                            </button>
                          </div>
                        ) : (
                          <>
                            {factor.questions.map((q) => (
                              <div key={q.id} className="question-container">
                                <div className="workspace-card p-4 hover:border-primary transition-colors cursor-pointer group">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                      <span className="material-symbols-outlined text-outline mt-1 text-[18px]">{q.icon}</span>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`${q.badgeClasses} px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider`}>
                                            {q.type === 'multiple_choice' ? 'Multiple Choice' : 'Open Text'}
                                          </span>
                                          {q.required && <span className="text-on-surface-variant text-xs">Required</span>}
                                        </div>
                                        <p className="font-body-md text-body-md text-on-surface font-medium">{q.text}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className="p-1 text-on-surface-variant hover:text-primary rounded">
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                      </button>
                                      <button className="p-1 text-on-surface-variant hover:text-error rounded">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                      </button>
                                      <span className="material-symbols-outlined text-outline-variant cursor-grab text-[18px]">drag_indicator</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              className="ml-8 mt-2 px-3 py-1.5 text-sm text-primary font-medium hover:bg-surface-container rounded-md transition-colors flex items-center gap-1 border border-dashed border-primary"
                              onClick={() => setModalOpen(true)}
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span> Add Question
                            </button>
                          </>
                        )}
                      </Accordion>
                    </div>
                  ))}

                  <button className="ml-6 mt-4 px-4 py-2 text-sm text-secondary font-medium hover:bg-surface-container rounded-md transition-colors flex items-center gap-2 border border-dashed border-secondary">
                    <span className="material-symbols-outlined text-[18px]">add</span> Add Factor
                  </button>
                </Accordion>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 md:left-[280px] right-0 bg-surface/90 backdrop-blur-md border-t border-outline-variant p-4 flex justify-between items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">cloud_done</span>
          <span className="font-body-md text-sm">All changes saved automatically</span>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2 border border-outline text-on-surface font-label-lg rounded-lg hover:bg-surface-container transition-colors">
            Discard Draft
          </button>
          <button
            className={`px-6 py-2 ${isSaving ? 'bg-secondary' : 'bg-primary'} text-on-primary font-label-lg rounded-lg hover:bg-primary-container transition-all shadow-sm flex items-center gap-2`}
            onClick={handleSave}
          >
            <span className="material-symbols-outlined text-[20px]">{isSaving ? 'check' : 'save'}</span>
            Save Assessment
          </button>
        </div>
      </div>

      <QuestionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Success Toast */}
      <div
        className={`fixed bottom-24 right-8 bg-secondary text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 z-50 pointer-events-none ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <span className="material-symbols-outlined">check_circle</span>
        <span className="font-label-lg">Assessment saved successfully!</span>
      </div>
    </AppLayout>
  );
}

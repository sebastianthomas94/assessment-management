import { Link } from 'react-router-dom';

type QuestionType = 'multiple_choice' | 'short_text' | 'boolean';

interface LaunchQuestion {
  id: string;
  number: number;
  question: string;
  type: QuestionType;
  hint: string;
  options?: string[];
  defaultOption?: number;
}

const QUESTIONS: LaunchQuestion[] = [
  {
    id: 'q1',
    number: 1,
    question: 'Which of the following encryption standards is currently enforced for data at rest on core internal databases?',
    type: 'multiple_choice',
    hint: 'Select one option.',
    options: ['AES-128', 'AES-256', 'DES', 'None of the above'],
    defaultOption: 1,
  },
  {
    id: 'q2',
    number: 2,
    question: 'Briefly describe the current process for revoking access credentials upon employee termination.',
    type: 'short_text',
    hint: 'Short text response required.',
  },
  {
    id: 'q3',
    number: 3,
    question: 'Are multi-factor authentication (MFA) protocols mandated for all remote access connections?',
    type: 'boolean',
    hint: 'Select Yes or No.',
  },
];

export default function LaunchPad() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {/* TopNavBar (simplified for distraction-free view) */}
      <nav className="bg-surface-bright border-b border-outline-variant top-0 sticky z-50 shadow-sm flex justify-between items-center px-container-padding h-16 w-full">
        <div className="flex items-center gap-element-gap">
          <span className="material-symbols-outlined text-primary text-[24px]">fact_check</span>
          <span className="font-headline-sm text-headline-sm text-primary font-bold">AssessMaster</span>
          <span className="text-on-surface-variant px-2 border-l border-outline-variant ml-2 font-label-md text-label-md hidden sm:inline">
            Launch Pad
          </span>
        </div>
        <Link className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2" to="/dashboard">
          <span className="material-symbols-outlined">close</span>
          <span className="font-label-lg text-label-lg">Exit Assessment</span>
        </Link>
      </nav>

      {/* Main Workspace */}
      <main className="flex-grow flex justify-center py-section-margin px-container-padding">
        <div className="w-full max-w-workspace flex flex-col gap-section-margin">
          {/* Assessment Header & Progress */}
          <header className="flex flex-col gap-element-gap">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Q3 Enterprise Security Audit</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Section 2: Infrastructure Compliance</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-label-md text-label-md text-on-surface-variant">Overall Progress</span>
                <span className="font-label-md text-label-md text-primary font-semibold">45%</span>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-secondary transition-all duration-500 ease-out" style={{ width: '45%' }} />
              </div>
            </div>
          </header>

          {/* Question List Container */}
          <div className="flex flex-col gap-element-gap">
            {QUESTIONS.map((q) => {
              const isFirst = q.number === 1;
              return (
                <div key={q.id} className="assessment-card p-6">
                  <div className="flex gap-4">
                    <div
                      className={
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-title-md text-title-md ' +
                        (isFirst ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-highest text-on-surface')
                      }
                    >
                      {q.number}
                    </div>
                    <div className="flex-grow flex flex-col gap-4">
                      <div>
                        <h3 className="font-title-lg text-title-lg text-on-surface mb-1">{q.question}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant italic">{q.hint}</p>
                      </div>
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="flex flex-col gap-3 mt-2">
                          {q.options.map((opt, i) => (
                            <div key={opt} className="relative">
                              <input
                                className="radio-custom sr-only peer"
                                id={`${q.id}_opt${i}`}
                                name={q.id}
                                type="radio"
                                defaultChecked={q.defaultOption === i}
                              />
                              <label
                                className="flex items-center p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-surface-container-low transition-colors"
                                htmlFor={`${q.id}_opt${i}`}
                              >
                                <div className="radio-indicator w-5 h-5 rounded-full border-2 border-outline-variant mr-3 relative flex-shrink-0 transition-colors" />
                                <span className="font-body-md text-body-md text-on-surface">{opt}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === 'short_text' && (
                        <div className="mt-2">
                          <label className="sr-only" htmlFor={`${q.id}_text`}>
                            Response for {q.id}
                          </label>
                          <textarea
                            className="w-full p-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-none"
                            id={`${q.id}_text`}
                            placeholder="Enter your response here..."
                            rows={4}
                          />
                        </div>
                      )}
                      {q.type === 'boolean' && (
                        <div className="flex gap-4 mt-2">
                          <div className="relative flex-1">
                            <input className="radio-custom sr-only peer" id={`${q.id}_yes`} name={q.id} type="radio" />
                            <label
                              className="flex items-center justify-center p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-surface-container-low transition-colors"
                              htmlFor={`${q.id}_yes`}
                            >
                              <span className="font-label-lg text-label-lg text-on-surface">Yes</span>
                            </label>
                          </div>
                          <div className="relative flex-1">
                            <input className="radio-custom sr-only peer" id={`${q.id}_no`} name={q.id} type="radio" />
                            <label
                              className="flex items-center justify-center p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low peer-checked:border-error peer-checked:bg-error-container peer-checked:text-on-error-container transition-colors"
                              htmlFor={`${q.id}_no`}
                            >
                              <span className="font-label-lg text-label-lg text-on-surface">No</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-section-margin border-t border-outline-variant mt-4">
            <button className="px-6 py-2 border border-secondary text-secondary rounded-lg font-label-lg text-label-lg hover:bg-surface-container-low transition-colors">
              Save Draft
            </button>
            <button className="px-8 py-3 bg-primary-container text-on-primary rounded-lg font-label-lg text-label-lg hover:bg-primary transition-colors shadow-sm flex items-center gap-2">
              Submit Responses
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

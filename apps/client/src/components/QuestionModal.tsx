import { useState } from 'react';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestionModal({ isOpen, onClose }: QuestionModalProps) {
  if (!isOpen) return null;

  return (
    <div aria-labelledby="modal-title" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm transition-opacity" role="dialog">
      {/* Modal Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-outline-variant w-full max-w-md transform transition-all overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <div>
            <h2 className="font-title-lg text-title-lg text-on-surface" id="modal-title">Configure Questions</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Set the parameters before adding questions to the factor.</p>
          </div>
          <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" type="button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-element-gap">
          {/* Question Type Field */}
          <div>
            <label className="block font-label-lg text-label-lg text-on-surface mb-2" htmlFor="question_type">Question Type</label>
            <div className="relative">
              <select className="block w-full pl-3 pr-10 py-2.5 text-body-lg font-body-lg border-outline-variant border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface-container-lowest text-on-surface appearance-none transition-shadow shadow-sm" id="question_type" name="question_type" defaultValue="">
                <option disabled value="">Select a type...</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="rating_scale">Rating Scale (1-5)</option>
                <option value="text_entry">Text Entry (Short)</option>
                <option value="boolean">Yes / No</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          {/* Number of Questions Field */}
          <div>
            <label className="block font-label-lg text-label-lg text-on-surface mb-2" htmlFor="num_questions">Number of Questions</label>
            <div className="relative rounded-md shadow-sm">
              <input className="block w-full pl-3 pr-3 py-2.5 text-body-lg font-body-lg border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface-container-lowest text-on-surface transition-shadow" id="num_questions" max="50" min="1" name="num_questions" placeholder="e.g., 5" type="number" />
            </div>
            <p className="mt-2 font-label-md text-label-md text-on-surface-variant">You can adjust this later in the builder.</p>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="px-6 py-4 bg-surface flex justify-end gap-3 border-t border-outline-variant">
          <button className="inline-flex justify-center items-center px-4 py-2 border border-secondary text-secondary bg-transparent hover:bg-secondary-container hover:text-on-secondary-container font-label-lg text-label-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="inline-flex justify-center items-center px-4 py-2 border border-transparent bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-lg text-label-lg rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" type="button" onClick={onClose}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

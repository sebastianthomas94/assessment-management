import { useEffect, useState } from 'react';
import { QUESTION_TYPES, type QuestionType } from '../types/assessment';

export interface QuestionTypeConfig {
  type: QuestionType;
  count: number;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the configured [{type, count}] rows when the user confirms. */
  onConfirm: (config: QuestionTypeConfig[]) => void;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  rating_scale: 'Rating Scale (1-5)',
  boolean: 'Yes / No',
  open_text: 'Open Text',
};

function emptyRow(): QuestionTypeConfig {
  return { type: 'multiple_choice', count: 1 };
}

export default function QuestionModal({ isOpen, onClose, onConfirm }: QuestionModalProps) {
  const [rows, setRows] = useState<QuestionTypeConfig[]>([emptyRow()]);
  const [error, setError] = useState<string | null>(null);

  // Reset to a single default row each time the modal opens.
  useEffect(() => {
    if (isOpen) {
      setRows([emptyRow()]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateRow = (idx: number, patch: Partial<QuestionTypeConfig>) =>
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const addRow = () => setRows((rs) => [...rs, emptyRow()]);

  const removeRow = (idx: number) =>
    setRows((rs) => rs.filter((_, i) => i !== idx));

  const handleConfirm = () => {
    // Validate every row has a valid type and count ≥ 1.
    for (const r of rows) {
      if (!QUESTION_TYPES.includes(r.type)) {
        setError('Please select a question type for each row.');
        return;
      }
      if (!Number.isInteger(r.count) || r.count < 1) {
        setError('Each row must have at least 1 question.');
        return;
      }
      if (r.count > 50) {
        setError('A single row cannot add more than 50 questions.');
        return;
      }
    }
    onConfirm(rows.map((r) => ({ type: r.type, count: r.count })));
  };

  return (
    <div aria-labelledby="modal-title" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm transition-opacity" role="dialog">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-outline-variant w-full max-w-md transform transition-all overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <div>
            <h2 className="font-title-lg text-title-lg text-on-surface" id="modal-title">Configure Questions</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Define the question type(s) and how many to add.</p>
          </div>
          <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" type="button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-element-gap overflow-y-auto max-h-[60vh]">
          {rows.map((row, idx) => (
            <div key={idx} className="flex items-end gap-3">
              {/* Question Type */}
              <div className="flex-1">
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor={`qtype_${idx}`}>
                  {rows.length > 1 ? `Row ${idx + 1} — Type` : 'Question Type'}
                </label>
                <div className="relative">
                  <select
                    id={`qtype_${idx}`}
                    className="block w-full pl-3 pr-10 py-2.5 text-body-md font-body-md border-outline-variant border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface-container-lowest text-on-surface appearance-none transition-shadow shadow-sm"
                    value={row.type}
                    onChange={(e) => updateRow(idx, { type: e.target.value as QuestionType })}
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Count */}
              <div className="w-24">
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor={`qcount_${idx}`}>Count</label>
                <input
                  id={`qcount_${idx}`}
                  className="block w-full pl-3 pr-3 py-2.5 text-body-md font-body-md border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface-container-lowest text-on-surface transition-shadow"
                  type="number"
                  min={1}
                  max={50}
                  value={row.count}
                  onChange={(e) => updateRow(idx, { count: Number(e.target.value) })}
                />
              </div>

              {/* Remove row (only when more than one) */}
              {rows.length > 1 && (
                <button
                  type="button"
                  className="mb-2.5 p-1.5 text-on-surface-variant hover:text-error rounded transition-colors"
                  title="Remove this type"
                  onClick={() => removeRow(idx)}
                >
                  <span className="material-symbols-outlined text-[20px]">remove_circle_outline</span>
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="self-start px-3 py-1.5 text-sm text-primary font-medium hover:bg-surface-container rounded-md transition-colors flex items-center gap-1 border border-dashed border-primary"
            onClick={addRow}
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add another type
          </button>

          <p className="font-label-md text-label-md text-on-surface-variant">
            You can edit question text and options for each added question afterwards in the builder.
          </p>

          {error && (
            <p className="font-label-md text-label-md text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span> {error}
            </p>
          )}
        </div>

        {/* Footer / Actions */}
        <div className="px-6 py-4 bg-surface flex justify-end gap-3 border-t border-outline-variant">
          <button className="inline-flex justify-center items-center px-4 py-2 border border-secondary text-secondary bg-transparent hover:bg-secondary-container hover:text-on-secondary-container font-label-lg text-label-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-lg text-label-lg rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            type="button"
            onClick={handleConfirm}
          >
            Confirm &amp; Add
          </button>
        </div>
      </div>
    </div>
  );
}

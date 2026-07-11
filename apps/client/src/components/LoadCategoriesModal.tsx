import { useEffect, useState } from 'react';
import { loadCategoryLibrary } from '../api/assessments';
import type { Category, CategoryLibraryEntry } from '../types/assessment';

interface LoadCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the selected categories (already cloned with fresh ids). */
  onAppend: (categories: Category[]) => void;
}

/**
 * "Load Categories" (spec §5): shows categories from the user's previously-saved
 * assessments and appends the selected ones to the current builder. Each pick is
 * cloned with fresh ids so it becomes an independent copy.
 */
export default function LoadCategoriesModal({ isOpen, onClose, onAppend }: LoadCategoriesModalProps) {
  const [library, setLibrary] = useState<CategoryLibraryEntry[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(new Set());
    setError(null);
    setLoading(true);
    loadCategoryLibrary()
      .then(({ library }) => setLibrary(library))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load categories.'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const toggle = (idx: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });

  const handleAppend = () => {
    let counter = 0;
    const freshId = (prefix: string) => `${prefix}-${Date.now()}-${counter++}`;
    const clones: Category[] = [...selected].map((idx) => {
      const cat = library[idx].category;
      return {
        ...cat,
        id: freshId('cat'),
        factors: cat.factors.map((f) => ({
          ...f,
          id: freshId('fct'),
          questions: f.questions.map((q) => ({ ...q, id: freshId('q') })),
        })),
      };
    });
    onAppend(clones);
    onClose();
  };

  return (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-outline-variant w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <div>
            <h2 className="font-title-lg text-title-lg text-on-surface">Load Categories</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Reuse categories from your previous assessments.</p>
          </div>
          <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full p-2 transition-colors" type="button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[60vh] flex flex-col gap-2">
          {loading ? (
            <div className="py-10 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
            </div>
          ) : error ? (
            <p className="py-6 text-center text-error font-body-md">{error}</p>
          ) : library.length === 0 ? (
            <p className="py-6 text-center text-on-surface-variant font-body-md">No saved categories yet. Save an assessment first to reuse its categories here.</p>
          ) : (
            library.map((entry, idx) => {
              const isSelected = selected.has(idx);
              const questionCount = entry.category.factors.reduce((s, f) => s + f.questions.length, 0);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggle(idx)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${isSelected ? 'border-primary bg-surface-container-low' : 'border-outline-variant hover:bg-surface-container-low'}`}
                >
                  <span className={`material-symbols-outlined ${isSelected ? 'text-primary' : 'text-outline'}`}>
                    {isSelected ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <div className="flex-1">
                    <p className="font-title-md text-title-md text-on-surface">{entry.category.title}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      From “{entry.assessmentTitle}” · {entry.category.factors.length} factor{entry.category.factors.length === 1 ? '' : 's'} · {questionCount} question{questionCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 bg-surface flex justify-end gap-3 border-t border-outline-variant">
          <button className="px-4 py-2 border border-secondary text-secondary rounded-lg font-label-lg text-label-lg hover:bg-surface-container-low transition-colors" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-lg text-label-lg hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50"
            type="button"
            onClick={handleAppend}
            disabled={selected.size === 0}
          >
            Append {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

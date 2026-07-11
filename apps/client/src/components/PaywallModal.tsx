interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURES = [
  'Automatically grade open-text answers against your model answer',
  'Semantic scoring — rewards correct meaning, not exact wording',
  'Scores roll into each response and the assessment average, just like other question types',
];

/**
 * Informational paywall for the upcoming AI text-evaluation feature. Open-text
 * answers can't be graded mechanically, so this is a paid add-on. For now the
 * feature is not live: the payment button is intentionally disabled.
 */
export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  if (!isOpen) return null;

  return (
    <div aria-labelledby="paywall-title" aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-outline-variant w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant bg-surface-bright flex justify-between items-start">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <div>
              <h2 className="font-title-lg text-title-lg text-on-surface" id="paywall-title">AI Text Evaluation</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Auto-score open-text answers with our AI service.</p>
            </div>
          </div>
          <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary" type="button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-tertiary-container text-on-tertiary">
              <span className="material-symbols-outlined text-[14px]">schedule</span> Coming soon
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Multiple-choice, Yes/No and rating questions are scored automatically. Open-text answers
            need to be compared against a model answer — a paid add-on powered by our AI service.
          </p>
          <ul className="flex flex-col gap-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 font-body-md text-body-md text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">check_circle</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer / Actions */}
        <div className="px-6 py-4 bg-surface flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 border-t border-outline-variant">
          <p className="font-label-md text-label-md text-on-surface-variant sm:mr-auto flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            Payments aren&apos;t available yet.
          </p>
          <button
            className="px-4 py-2 border border-secondary text-secondary bg-transparent hover:bg-surface-container-low font-label-lg text-label-lg rounded-lg transition-colors"
            type="button"
            onClick={onClose}
          >
            Not now
          </button>
          <button
            className="px-4 py-2 border border-transparent bg-primary text-on-primary font-label-lg text-label-lg rounded-lg shadow-sm inline-flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
            type="button"
            disabled
            title="This feature isn't available yet"
          >
            <span className="material-symbols-outlined text-[20px]">credit_card</span>
            Proceed to payment
          </button>
        </div>
      </div>
    </div>
  );
}

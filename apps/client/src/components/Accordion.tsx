import type { ReactNode } from 'react';

interface AccordionProps {
  /** Whether the body is currently expanded. */
  open: boolean;
  /** Controlled toggle handler. */
  onToggle: () => void;
  /** Header row content. */
  header: ReactNode;
  /** Body content shown when expanded. */
  children: ReactNode;
  /** Visual: card with border/background wrapper. Set false for flat children. */
  card?: boolean;
  /** Extra header wrapper classes. */
  headerClassName?: string;
  /** Extra body wrapper classes. */
  bodyClassName?: string;
}

/**
 * Standardised accordion used by the Builder hierarchy.
 *
 * - `header` is wrapped in a clickable card header with a rotating chevron.
 * - The body uses CSS-grid accordion `.accordion-content` (layout lives in index.css)
 *   so the height transitions smoothly without JS measuring.
 */
export default function Accordion({
  open,
  onToggle,
  header,
  children,
  card = true,
  headerClassName = '',
  bodyClassName = '',
}: AccordionProps) {
  const headerContent = (
    <div
      className={`flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors ${headerClassName}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {header}
    </div>
  );

  const body = (
    <div className={`accordion-content ${open ? 'open' : ''}`}>
      <div className="accordion-inner">
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  );

  if (!card) {
    return (
      <>
        {headerContent}
        {body}
      </>
    );
  }

  return (
    <div className="workspace-card overflow-hidden">
      {headerContent}
      {body}
    </div>
  );
}

import type { ReactNode } from 'react';

/**
 * Soft call-out panel for chapter summaries and author's notes. One look for
 * both — the label distinguishes them. Replaces the old thin-border / left-rule
 * boxes: rounded soft-fill surface, roomier padding, larger body text.
 */
export function ChapterCallout({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={`rounded-card border border-border-chip bg-transparent px-5 py-4 ${className}`}
    >
      <p className="mb-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-secondary">
        {label}
      </p>
      <p className="font-sans text-[13px] leading-[1.6] text-secondary">{children}</p>
    </aside>
  );
}

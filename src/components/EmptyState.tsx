import type { ReactNode } from 'react';
import { NavPillLink } from './NavPillLink';

/**
 * Centered "nothing here" block shared by the browse and library result grids.
 * `title` is the bold headline; `children` (optional) is the secondary line
 * (e.g. a "clear filters" or "browse works" link).
 */
export function EmptyState({
  title,
  className,
  children,
}: {
  title: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`py-12 text-center font-sans text-base text-secondary ${className ?? ''}`}>
      <p className="m-0 mb-2 text-base font-medium text-text">{title}</p>
      {children && <p className="m-0 text-[15px] text-secondary">{children}</p>}
    </div>
  );
}

/**
 * Richer empty state for surfaces with a membership rule (library tabs):
 * an icon bubble, a headline, a one-line explanation of WHY the surface is
 * empty / how items get here, and a primary CTA into the catalog. Dashed
 * card frame so it reads as a placeholder slot, not content.
 */
export function EmptyStateCard({
  icon,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  icon?: ReactNode;
  title: string;
  /** The rule: how items end up on this surface. */
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="mx-auto my-6 flex w-full max-w-[440px] flex-col items-center gap-3 rounded-card border border-dashed border-border-strong px-8 py-12 text-center max-md:px-5 max-md:py-10">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-overlay-medium text-secondary" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="m-0 mt-1 font-serif text-[19px] font-medium tracking-[-0.01em] text-text">{title}</p>
      <p className="m-0 max-w-[36ch] font-sans text-[15px] leading-relaxed text-secondary">{body}</p>
      <NavPillLink href={ctaHref} label={ctaLabel} big filled className="mt-3" />
    </div>
  );
}

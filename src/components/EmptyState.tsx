import type { ReactNode } from 'react';

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

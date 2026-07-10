import Link from 'next/link';
import type { ReactNode } from 'react';
import { RailViewport } from './RailViewport';

/**
 * Home-section header: serif title (optionally linked to a filter URL) +
 * sans subtitle. Shared by every editorial section so the typography can't
 * drift (it had, in three spellings, before extraction).
 */
export function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  /** Links the title to the full result set (filter-driven shelves). */
  href?: string;
}) {
  return (
    <div className="min-w-0">
      <h2 className="m-0 font-serif text-[21px] font-medium tracking-[-0.01em] text-text md:text-[24px]">
        {href ? (
          <Link href={href} className="text-inherit no-underline hover:underline hover:underline-offset-[3px]">
            {title}
          </Link>
        ) : (
          title
        )}
      </h2>
      {subtitle && <p className="mt-[2px] font-sans text-[15px] text-secondary">{subtitle}</p>}
    </div>
  );
}

/**
 * Editorial rail section: SectionHeader over a RailViewport scroller
 * (cai-rail frame with edge fades + prev/next arrows). ShelfRail and
 * CreatorRail render their cards as children.
 */
export function RailSection({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10 md:mb-12" aria-label={title}>
      <div className="mb-4">
        <SectionHeader title={title} subtitle={subtitle} href={href} />
      </div>
      <RailViewport railClassName="cai-rail" rowClassName="cai-rail-row">
        {children}
      </RailViewport>
    </section>
  );
}

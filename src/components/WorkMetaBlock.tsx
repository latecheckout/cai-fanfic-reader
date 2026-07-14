'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { WorkMeta } from '@/types';
import { SignalStrip, Avatar, Kudos, Bookmarks, StatsLine } from './WorkCardCover';
import { ExpandableSummary } from './ExpandableSummary';
import { formatWords, formatChapters, readingTime, ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';

/**
 * The work "identity" block — signal badges, title, author byline, summary,
 * stats line. Single source of truth, rendered by the FandomHub sidebar.
 */
export function WorkMetaBlock({ meta, totalChapters }: { meta: WorkMeta; totalChapters: number }) {
  const rClass = ratingClass(meta.rating);
  const catLabel = categoryLabel(meta.category);
  const isWip = isWipStatus(meta.status);
  const seriesStr = meta.series
    ? `Part ${meta.series.position} of ${meta.series.name}`
    : null;

  const statNodes: ReactNode[] = [
    formatWords(meta.words),
    readingTime(meta.words),
    totalChapters > 1 ? formatChapters(meta.chaptersPosted, meta.chapters) : null,
    seriesStr,
    meta.language !== 'English' ? meta.language : null,
    meta.kudos > 0 ? <Kudos key="kudos" count={meta.kudos} /> : null,
    meta.bookmarks > 0 ? <Bookmarks key="bookmarks" count={meta.bookmarks} /> : null,
  ].filter(Boolean);

  return (
    <div>
      <div className="mb-3">
        <SignalStrip
          rating={meta.rating}
          rClass={rClass}
          catLabel={catLabel}
          category={meta.category}
          isWip={isWip}
        />
      </div>
      <h2 className="mb-1.5 min-w-0 text-balance font-serif text-[24px] font-medium leading-[1.2] tracking-[-0.01em] text-text [overflow-wrap:anywhere]">
        {meta.title}
      </h2>
      <p className="mb-1.5 inline-flex items-center font-sans text-[14px] text-secondary">
        <span className="mr-1.5">by</span>
        <Avatar />
        <Link
          href={`/?q=${encodeURIComponent(meta.author)}`}
          className="text-inherit hover:text-text hover:underline hover:underline-offset-2"
        >
          {meta.author}
        </Link>
      </p>
      <ExpandableSummary summary={meta.summary} />
      <StatsLine items={statNodes} className="mt-4 font-mono text-[13px] text-secondary" />
    </div>
  );
}

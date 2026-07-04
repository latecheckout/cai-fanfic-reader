'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReading } from '@/context/ReadingContext';
import { TagChip } from './TagChip';
import { SignalStrip, Avatar, Kudos, Bookmarks, StatsLine } from './WorkCardCover';
import { ExpandableSummary } from './ExpandableSummary';
import { formatWords, formatChapters, readingTime, ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';

const TAG_LABEL = 'w-[70px] shrink-0 pt-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-secondary';
const TAG_ROW = 'flex items-baseline gap-3';
const TAG_GROUP = 'flex min-w-0 flex-wrap gap-1';

export function MetadataOverlay() {
  const { workMeta, totalChapters } = useReading();

  const rClass = ratingClass(workMeta.rating);
  const catLabel = categoryLabel(workMeta.category);
  const isWip = isWipStatus(workMeta.status);
  const seriesStr = workMeta.series
    ? `Part ${workMeta.series.position} of ${workMeta.series.name}`
    : null;

  const statNodes: ReactNode[] = [
    formatWords(workMeta.words),
    readingTime(workMeta.words),
    totalChapters > 1 ? formatChapters(workMeta.chaptersPosted, workMeta.chapters) : null,
    seriesStr,
    workMeta.language !== 'English' ? workMeta.language : null,
    workMeta.kudos > 0 ? <Kudos key="kudos" count={workMeta.kudos} /> : null,
    workMeta.bookmarks > 0 ? <Bookmarks key="bookmarks" count={workMeta.bookmarks} /> : null,
  ].filter(Boolean);

  return (
    <>
      {/* Scrollable body — the "Story info" heading scrolls with the content. */}
      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-5 pt-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="mb-4 flex items-center">
          <span className="font-serif text-[16px] font-medium text-text">
            Story info
          </span>
        </div>
        {workMeta.cover && (
          <div className="relative mb-4 aspect-[2/3] w-[104px] overflow-hidden rounded-[10px] bg-border">
            <Image src={workMeta.cover} alt="" fill sizes="104px" className="rounded-[10px] object-cover" />
            <span className="pointer-events-none absolute inset-0 rounded-[10px] shadow-[inset_0_0_0_1px_var(--image-outline)]" aria-hidden="true" />
          </div>
        )}

        {/* Zone 1: Identity */}
        <div className="mb-5">
          <div className="mb-3">
            <SignalStrip
              rating={workMeta.rating}
              rClass={rClass}
              catLabel={catLabel}
              category={workMeta.category}
              isWip={isWip}
            />
          </div>
          <h2 className="mb-1.5 min-w-0 text-balance font-serif text-[24px] font-medium leading-[1.2] tracking-[-0.01em] text-text [overflow-wrap:anywhere]">
            {workMeta.title}
          </h2>
          <p className="mb-1.5 inline-flex items-center font-sans text-[14px] text-secondary">
            <span className="mr-1.5">by</span>
            <Avatar />
            <Link
              href={`/?q=${encodeURIComponent(workMeta.author)}`}
              className="text-inherit hover:text-text hover:underline hover:underline-offset-2"
            >
              {workMeta.author}
            </Link>
          </p>
          <ExpandableSummary summary={workMeta.summary} />
          <StatsLine items={statNodes} className="mt-4 font-mono text-[13px] text-secondary" />
        </div>

        {/* Zone 2: Signals */}
        <div className="flex flex-col gap-2 border-t border-dashed border-border pt-4">
          {workMeta.warnings.length > 0 && (
            <div className={TAG_ROW}>
              <span className={TAG_LABEL}>Warnings</span>
              <div className={TAG_GROUP}>
                {workMeta.warnings.map((w) => (
                  <TagChip key={w} tag={w} category="warning" clickable href={`/?warning=${encodeURIComponent(w)}`} />
                ))}
              </div>
            </div>
          )}
          {workMeta.fandom.length > 0 && (
            <div className={TAG_ROW}>
              <span className={TAG_LABEL}>Fandom</span>
              <div className={TAG_GROUP}>
                {workMeta.fandom.map((f) => (
                  <TagChip key={f} tag={f} category="fandom" clickable href={`/?fandom=${encodeURIComponent(f)}`} />
                ))}
              </div>
            </div>
          )}
          {workMeta.relationships.length > 0 && (
            <div className={TAG_ROW}>
              <span className={TAG_LABEL}>Ships</span>
              <div className={TAG_GROUP}>
                {workMeta.relationships.map((r) => (
                  <TagChip key={r} tag={r} category="relationship" clickable href={`/?relationship=${encodeURIComponent(r)}`} />
                ))}
              </div>
            </div>
          )}
          {workMeta.characters.length > 0 && (
            <div className={TAG_ROW}>
              <span className={TAG_LABEL}>Characters</span>
              <div className={TAG_GROUP}>
                {workMeta.characters.map((c) => (
                  <TagChip key={c} tag={c} category="character" clickable href={`/?character=${encodeURIComponent(c)}`} />
                ))}
              </div>
            </div>
          )}
          {workMeta.tags.length > 0 && (
            <div className={TAG_ROW}>
              <span className={TAG_LABEL}>Tags</span>
              <div className={TAG_GROUP}>
                {workMeta.tags.map((t) => (
                  <TagChip key={t} tag={t} category="additional" clickable href={`/?tag=${encodeURIComponent(t)}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

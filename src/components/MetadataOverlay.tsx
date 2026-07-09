'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReading } from '@/context/ReadingContext';
import { TagRow } from './TagChip';
import { SignalStrip, Avatar, Kudos, Bookmarks, StatsLine } from './WorkCardCover';
import { ExpandableSummary } from './ExpandableSummary';
import { formatWords, formatChapters, readingTime, ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';

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
          <TagRow label="Warnings" items={workMeta.warnings} category="warning" param="warning" />
          <TagRow label="Fandom" items={workMeta.fandom} category="fandom" param="fandom" />
          <TagRow label="Ships" items={workMeta.relationships} category="relationship" param="relationship" />
          <TagRow label="Characters" items={workMeta.characters} category="character" param="character" />
          <TagRow label="Tags" items={workMeta.tags} category="additional" param="tag" />
        </div>
      </div>
    </>
  );
}

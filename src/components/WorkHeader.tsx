'use client';

import Image from 'next/image';
import Link from 'next/link';
import { WorkMeta } from '@/types';
import type { ReactNode } from 'react';
import { formatWords, formatChapters, readingTime, ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';
import { TagRow } from './TagChip';
import { SignalStrip, Avatar, Kudos, Bookmarks, StatsLine } from './WorkCardCover';
import { ExpandableSummary } from './ExpandableSummary';

interface Props {
  meta: WorkMeta;
  totalChapters: number;
}

export function WorkHeader({ meta, totalChapters }: Props) {
  const chaptersStr = formatChapters(meta.chaptersPosted, meta.chapters);
  const seriesStr = meta.series ? `Part ${meta.series.position} of ${meta.series.name}` : null;

  const isWip = isWipStatus(meta.status);
  const rClass = ratingClass(meta.rating);
  const catLabel = categoryLabel(meta.category);

  const statNodes: ReactNode[] = [
    formatWords(meta.words),
    readingTime(meta.words),
    totalChapters > 1 ? chaptersStr : null,
    seriesStr,
    meta.language !== 'English' ? meta.language : null,
    meta.kudos > 0 ? <Kudos key="kudos" count={meta.kudos} /> : null,
    meta.bookmarks > 0 ? <Bookmarks key="bookmarks" count={meta.bookmarks} /> : null,
  ].filter(Boolean);

  return (
    <header
      className="mx-auto max-w-[var(--reader-line-width)] px-6 pb-16 pt-20 max-md:px-4 max-md:pt-10"
      aria-label="Work information"
    >
      {/* Top block — thumbnail → badges → title → author → summary → stats */}
      <div className="flex flex-col items-start gap-4">
        {meta.cover && (
          <div className="relative aspect-[2/3] w-[132px] shrink-0 overflow-hidden rounded-card bg-border max-md:w-[84px]">
            <Image src={meta.cover} alt="" fill sizes="180px" className="rounded-card object-cover" />
            <span className="pointer-events-none absolute inset-0 rounded-card shadow-[inset_0_0_0_1px_var(--image-outline)]" aria-hidden="true" />
          </div>
        )}
        <div className="w-full min-w-0">
          <div className="mb-3">
            <SignalStrip rating={meta.rating} rClass={rClass} catLabel={catLabel} category={meta.category} isWip={isWip} />
          </div>
          <h1 className="text-balance font-serif text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-text max-md:text-[24px]">
            {meta.title}
          </h1>
          <p className="mt-2 inline-flex items-center font-sans text-[14px] text-secondary">
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
          <StatsLine items={statNodes} className="mt-4 font-mono text-[13px] leading-[1.7] text-secondary" />
        </div>
      </div>

      {/* Signals — full width below */}
      <div className="mt-4 flex flex-col gap-[14px] border-t border-dashed border-border pt-4">
        <TagRow label="Warnings" items={meta.warnings} category="warning" param="warning" />
        <TagRow label="Fandom" items={meta.fandom} category="fandom" param="fandom" />
        <TagRow label="Ships" items={meta.relationships} category="relationship" param="relationship" />
        <TagRow label="Characters" items={meta.characters} category="character" param="character" />
        <TagRow label="Tags" items={meta.tags} category="additional" param="tag" />
      </div>
    </header>
  );
}

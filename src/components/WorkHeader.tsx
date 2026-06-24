'use client';

import Image from 'next/image';
import Link from 'next/link';
import { WorkMeta } from '@/types';
import { formatWords, formatCount, formatChapters, readingTime, ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';
import { TagChip } from './TagChip';
import { SignalStrip, Avatar } from './WorkCardCover';
import { ExpandableSummary } from './ExpandableSummary';

interface Props {
  meta: WorkMeta;
  totalChapters: number;
}

const TAG_ROW = 'flex items-baseline gap-3 max-md:flex-col max-md:items-start max-md:gap-1.5';
const TAG_LABEL = 'w-[70px] shrink-0 pt-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-secondary max-md:w-auto max-md:shrink max-md:text-[9px]';
const TAG_GROUP = 'flex flex-wrap gap-1';

export function WorkHeader({ meta, totalChapters }: Props) {
  const chaptersStr = formatChapters(meta.chaptersPosted, meta.chapters);
  const seriesStr = meta.series ? `Part ${meta.series.position} of ${meta.series.name}` : null;

  const isWip = isWipStatus(meta.status);
  const rClass = ratingClass(meta.rating);
  const catLabel = categoryLabel(meta.category);

  const statsLine = [
    formatWords(meta.words),
    readingTime(meta.words),
    totalChapters > 1 ? chaptersStr : null,
    seriesStr,
    meta.language !== 'English' ? meta.language : null,
    meta.kudos > 0 ? `♥ ${formatCount(meta.kudos)}` : null,
    meta.bookmarks > 0 ? `⚑ ${formatCount(meta.bookmarks)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <header
      className="mx-auto max-w-[var(--reader-line-width)] px-6 pb-16 pt-20 max-md:px-4 max-md:pt-10"
      aria-label="Work information"
    >
      {/* Top block — thumbnail → badges → title → author → summary → stats */}
      <div className="flex flex-col items-start gap-4">
        {meta.cover && (
          <div className="relative aspect-[2/3] w-[132px] shrink-0 overflow-hidden rounded-[14px] bg-border max-md:w-[84px]">
            <Image src={meta.cover} alt="" fill sizes="180px" className="rounded-[14px] object-cover" />
          </div>
        )}
        <div className="w-full min-w-0">
          <div className="mb-3">
            <SignalStrip rating={meta.rating} rClass={rClass} catLabel={catLabel} category={meta.category} isWip={isWip} />
          </div>
          <h1 className="font-serif text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-text max-md:text-[24px]">
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
          <p className="mt-4 font-mono text-[13px] leading-[1.7] text-secondary">{statsLine}</p>
        </div>
      </div>

      {/* Signals — full width below */}
      <div className="mt-4 flex flex-col gap-[14px] border-t border-dashed border-border pt-4">
        {meta.warnings.length > 0 && (
          <div className={TAG_ROW}>
            <span className={TAG_LABEL}>Warnings</span>
            <div className={TAG_GROUP}>
              {meta.warnings.map((w) => (
                <TagChip key={w} tag={w} category="warning" clickable href={`/?warning=${encodeURIComponent(w)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.fandom.length > 0 && (
          <div className={TAG_ROW}>
            <span className={TAG_LABEL}>Fandom</span>
            <div className={TAG_GROUP}>
              {meta.fandom.map((f) => (
                <TagChip key={f} tag={f} category="fandom" clickable href={`/?fandom=${encodeURIComponent(f)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.relationships.length > 0 && (
          <div className={TAG_ROW}>
            <span className={TAG_LABEL}>Ships</span>
            <div className={TAG_GROUP}>
              {meta.relationships.map((r) => (
                <TagChip key={r} tag={r} category="relationship" clickable href={`/?relationship=${encodeURIComponent(r)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.characters.length > 0 && (
          <div className={TAG_ROW}>
            <span className={TAG_LABEL}>Characters</span>
            <div className={TAG_GROUP}>
              {meta.characters.map((c) => (
                <TagChip key={c} tag={c} category="character" clickable href={`/?character=${encodeURIComponent(c)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.tags.length > 0 && (
          <div className={TAG_ROW}>
            <span className={TAG_LABEL}>Tags</span>
            <div className={TAG_GROUP}>
              {meta.tags.map((t) => (
                <TagChip key={t} tag={t} category="additional" clickable href={`/?tag=${encodeURIComponent(t)}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

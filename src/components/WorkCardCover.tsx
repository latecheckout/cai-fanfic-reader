'use client';

import { memo, useState, Fragment } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WorkSummary } from '@/types';
import { formatWords, formatCount, formatChapters, ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';
import { ratingTier } from '@/lib/ratings';
import { HeartIcon, FlagIcon, ViewsIcon } from './icons';
import { TagChip } from './TagChip';
import { Tooltip } from './Tooltip';

interface Props {
  work: WorkSummary;
}

// List shows up to 8 tags then an expander.
const MAX_TAGS_LIST = 8;

/** @DUMMY — placeholder until real author photos exist. */
const CREATOR_PLACEHOLDER = '/creators/placeholder.png';

// Single-line tooltip labels (no two-tier title/desc tooltips anywhere).
const CATEGORY_TOOLTIPS: Record<string, string> = {
  'M/M':   'Male / Male',
  'F/F':   'Female / Female',
  'F/M':   'Female / Male',
  'M/F':   'Male / Female',
  'Gen':   'General',
  'Multi': 'Multiple',
  'Other': 'Other',
};

const STATUS_TOOLTIPS = {
  wip:  'Work in Progress',
  done: 'Complete',
};

const CheckGlyph = () => (
  <svg width="12" height="12" viewBox="0 0 9 9" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="1.5 4.5 3.5 6.5 7.5 2.5" />
  </svg>
);

/** In-progress counterpart to the check: a half-filled circle (partial = WIP). */
const ProgressGlyph = () => (
  <svg width="12" height="12" viewBox="0 0 10 10" aria-hidden="true">
    <circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5 1.2 A3.8 3.8 0 0 1 5 8.8 Z" fill="currentColor" />
  </svg>
);

// Inline stat (icon + count) — vertical-align nudge keeps it centred in a text line.
const STAT_VIEWS = 'inline-flex items-center gap-[3px] align-[-2px]';

export function Views({ hits }: { hits: number }) {
  return (
    <span className={STAT_VIEWS}>
      <ViewsIcon width={13} height={13} className="shrink-0" />
      {formatCount(hits)}
    </span>
  );
}

/** Kudos count with the heart icon. Shared across cards + work headers so the
 *  icon/number treatment matches the views stat exactly. */
export function Kudos({ count }: { count: number }) {
  return (
    <span className={STAT_VIEWS}>
      <HeartIcon width={12} height={12} className="shrink-0" />
      {formatCount(count)}
    </span>
  );
}

/** Bookmark count with the flag icon. */
export function Bookmarks({ count }: { count: number }) {
  return (
    <span className={STAT_VIEWS}>
      <FlagIcon width={12} height={12} className="shrink-0" />
      {formatCount(count)}
    </span>
  );
}

/** Circular author avatar with a faint white ring.
 *  Shared by the list and grid bylines so the photo treatment is identical. */
export function Avatar() {
  return (
    <span className="relative mr-[7px] inline-block h-5 w-5 shrink-0 overflow-hidden rounded-full bg-border" aria-hidden="true">
      <Image src={CREATOR_PLACEHOLDER} alt="" fill sizes="20px" className="object-cover" />
      <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_var(--image-outline)]" />
    </span>
  );
}

/** Dot-separated stats line (supports JSX items like the views icon). */
export function StatsLine({ items, className }: { items: ReactNode[]; className: string }) {
  return (
    <div className={className}>
      {items.map((node, i) => (
        <Fragment key={i}>
          {i > 0 && ' · '}
          {node}
        </Fragment>
      ))}
    </div>
  );
}

// Shared badge chrome — mono, rounded-chip (matches tags), non-interactive
// whitespace but hoverable for the tooltip.
const BADGE_BASE =
  'flex h-6 items-center justify-center rounded-chip shrink-0 font-mono pointer-events-auto cursor-default';

/** Shared badge box for the signal row (rating / category / status). One chrome
 *  + optional hover tooltip (the shared Base UI Tooltip — single line) so the
 *  three badges can't drift apart. */
function Badge({
  className = '',
  tooltip,
  children,
}: {
  className?: string;
  tooltip?: string;
  children: ReactNode;
}) {
  const badge = <span className={`${BADGE_BASE} ${className}`}>{children}</span>;
  if (!tooltip) return badge;
  return (
    <Tooltip label={tooltip} align="left">
      {badge}
    </Tooltip>
  );
}

/** Filled rating badge (letter + hover tooltip). All presentation is derived
 *  from the shared rating tier config so the card and filter pill stay in sync.
 *  Top-level + memoized since many render at once across a results list. */
const RatingBadge = memo(function RatingBadge({ rating }: { rating: string }) {
  const tier = ratingTier(rating);
  return (
    <Badge className={`w-6 text-[13px] font-bold tracking-[0.02em] text-white ${tier.bg}`} tooltip={tier.tooltip}>
      {tier.letter}
    </Badge>
  );
});

/** Signal row — rating · category · status, with single-line tooltips.
 *  Exported so the AO4 text cards reuse the exact same badge components. */
export function SignalStrip({
  rating, rClass, catLabel, category, isWip, onImage = false,
}: {
  rating: string;
  rClass: string;
  catLabel: string;
  category: string[];
  isWip: boolean;
  /** Lighten the dashed status pill so it reads over a dark image overlay. */
  onImage?: boolean;
}) {
  return (
    <div className="pointer-events-none relative z-[2] flex flex-row items-center gap-[7px]">
      <RatingBadge rating={rating} />
      {catLabel && (
        <Badge
          className="min-w-6 bg-secondary px-[6px] text-[13px] font-semibold tracking-[0.04em] text-bg theme-dark:bg-[color-mix(in_srgb,var(--secondary)_80%,var(--bg))] theme-dark:text-white"
          tooltip={CATEGORY_TOOLTIPS[category[0]] ?? catLabel}
        >
          {catLabel}
        </Badge>
      )}
      <Badge
        className={`w-6 border border-dashed ${
          onImage
            ? 'border-white/45 text-white/70'
            : 'border-border-active text-secondary theme-dark:text-[color-mix(in_srgb,var(--text)_70%,transparent)]'
        }`}
        tooltip={isWip ? STATUS_TOOLTIPS.wip : STATUS_TOOLTIPS.done}
      >
        {isWip ? <ProgressGlyph /> : <CheckGlyph />}
      </Badge>
    </div>
  );
}

// ── List-card discovery rows (fandom / relationships / characters) ──
// Three near-identical comma-linked lists, collapsed into one helper. Each row
// is `interactive`: pointer-events fall through to the stretched card link, and
// each individual link re-enables clicks.
const FANDOM_CLS =
  'relative z-[1] pointer-events-none font-mono text-[12px] uppercase tracking-[0.08em] text-secondary';
const FANDOM_LINK =
  'pointer-events-auto text-inherit no-underline hover:text-text hover:underline hover:decoration-1 hover:underline-offset-2';
const SHIPS_CLS = 'relative z-[1] pointer-events-none text-[16px] font-medium text-text';
const SHIP_LINK =
  'pointer-events-auto text-inherit underline decoration-[rgba(26,24,22,0.3)] decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-150 ease-in-out hover:decoration-text theme-dark:decoration-[rgba(229,225,216,0.3)] theme-dark:hover:decoration-text';
const CHARS_CLS = 'relative z-[1] pointer-events-none font-sans text-[13px] leading-[1.5] text-secondary';
const CHAR_LINK =
  'pointer-events-auto text-inherit no-underline transition-colors duration-150 ease-in-out hover:text-text hover:underline hover:decoration-1 hover:underline-offset-2';

function LinkList({
  items, param, separator, className, linkClassName,
}: {
  items: string[];
  param: string;
  separator: ReactNode;
  className: string;
  linkClassName: string;
}) {
  return (
    <div className={className}>
      {items.map((item, i) => (
        <span key={`${param}-${i}`}>
          {i > 0 && separator}
          <Link href={`/?${param}=${encodeURIComponent(item)}`} className={linkClassName}>{item}</Link>
        </span>
      ))}
    </div>
  );
}

export function WorkCardCover({ work }: Props) {
  const { meta, slug } = work;
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const isWip = isWipStatus(meta.status);
  const catLabel = categoryLabel(meta.category);
  const rClass = ratingClass(meta.rating);

  // ── Detailed list card: strip → title → author → summary → tags → fandom → ships → characters → stats ──
  const statNodes: ReactNode[] = [
    formatWords(meta.words),
    formatChapters(meta.chaptersPosted, meta.chapters),
    meta.updated || meta.published ? `updated ${meta.updated || meta.published}` : null,
    meta.kudos > 0 ? <Kudos key="kudos" count={meta.kudos} /> : null,
    meta.bookmarks > 0 ? <Bookmarks key="bookmarks" count={meta.bookmarks} /> : null,
    meta.hits > 0 ? <Views key="views" hits={meta.hits} /> : null,
  ].filter(Boolean);
  const visibleTags = tagsExpanded ? meta.tags : meta.tags.slice(0, MAX_TAGS_LIST);
  const hiddenTagCount = meta.tags.length - MAX_TAGS_LIST;
  const warnings = meta.warnings.filter((w) => w !== 'No Archive Warnings Apply');

  return (
    // List view is imageless: all metadata, no cover bias. Each row is its own
    // shelf-style card; hover lifts the border + fades stats to full contrast.
    // Entrance: fade-in with an nth-child stagger (motion-safe only).
    <article className="group relative flex min-w-0 items-start gap-5 rounded-card border border-card-border bg-[color-mix(in_srgb,var(--card-bg),#fff_35%)] p-3 transition-[background,border-color] duration-150 ease-in-out hover:z-[5] hover:border-border-strong max-md:gap-4 theme-dark:bg-card motion-safe:animate-[fadeIn_600ms_var(--ease-out-expo)_both] motion-safe:[&:nth-child(2)]:animate-[fadeIn_600ms_var(--ease-out-expo)_30ms_both] motion-safe:[&:nth-child(3)]:animate-[fadeIn_600ms_var(--ease-out-expo)_60ms_both] motion-safe:[&:nth-child(4)]:animate-[fadeIn_600ms_var(--ease-out-expo)_90ms_both] motion-safe:[&:nth-child(5)]:animate-[fadeIn_600ms_var(--ease-out-expo)_120ms_both] motion-safe:[&:nth-child(6)]:animate-[fadeIn_600ms_var(--ease-out-expo)_150ms_both] motion-safe:[&:nth-child(7)]:animate-[fadeIn_600ms_var(--ease-out-expo)_180ms_both] motion-safe:[&:nth-child(8)]:animate-[fadeIn_600ms_var(--ease-out-expo)_210ms_both] motion-safe:[&:nth-child(9)]:animate-[fadeIn_600ms_var(--ease-out-expo)_240ms_both] motion-safe:[&:nth-child(10)]:animate-[fadeIn_600ms_var(--ease-out-expo)_270ms_both] motion-safe:[&:nth-child(n+11)]:animate-[fadeIn_600ms_var(--ease-out-expo)_300ms_both]">
      {/* Content — identity-first: strip → title → author → summary → tags → fandom → ships → characters → stats */}
      <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
        <SignalStrip rating={meta.rating} rClass={rClass} catLabel={catLabel} category={meta.category} isWip={isWip} />

        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="m-0 w-fit min-w-0 max-w-full font-normal">
            <Link href={`/works/${slug}`} className="text-inherit no-underline after:absolute after:inset-0 after:z-0 after:content-['']">
              <span className="inline w-auto font-serif text-[16px] font-medium leading-[1.4] text-text group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[3px]">{meta.title}</span>
            </Link>
          </h3>
          {meta.author && (
            <span className="relative z-[1] inline-flex items-center overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[14px] text-secondary pointer-events-none">
              <span className="mr-[5px]">by</span>
              <Avatar />
              <Link href={`/?q=${encodeURIComponent(meta.author)}`} className="relative z-[2] text-inherit no-underline pointer-events-auto hover:text-text hover:underline hover:underline-offset-2">
                {meta.author}
              </Link>
            </span>
          )}
        </div>

        {meta.summary && <p className="m-0 line-clamp-2 font-serif text-[15px] italic leading-[1.55] text-secondary">{meta.summary}</p>}

        {(warnings.length > 0 || meta.tags.length > 0) && (
          <div className="relative z-[1] flex flex-wrap gap-[6px] pointer-events-auto">
            {warnings.map((w) => (
              <TagChip key={`warn-${w}`} tag={w} category="warning" clickable href={`/?warning=${encodeURIComponent(w)}`} />
            ))}
            {visibleTags.map((t) => (
              <TagChip key={`tag-${t}`} tag={t} category="additional" clickable href={`/?tag=${encodeURIComponent(t)}`} />
            ))}
            {hiddenTagCount > 0 && (
              <button type="button" className="inline-flex items-center rounded-chip border border-dashed border-border-chip px-2 py-[3px] font-sans text-[13px] leading-[18px] text-secondary transition-colors duration-150 ease-in-out cursor-pointer hover:border-border-active hover:text-text" onClick={() => setTagsExpanded(!tagsExpanded)}>
                {tagsExpanded ? 'show less' : `+${hiddenTagCount}`}
              </button>
            )}
          </div>
        )}

        {/* Social metrics — under the tags, closing the top section */}
        <StatsLine items={statNodes} className="font-mono text-[13px] leading-[1.7] text-secondary transition-colors duration-150 ease-in-out group-hover:text-text" />

        {/* Bottom section — fandom / ships / characters, visually separated */}
        {(meta.fandom.length > 0 || meta.relationships.length > 0 || meta.characters.length > 0) && (
          <div className="mt-[9px] flex flex-col gap-2">
            {meta.fandom.length > 0 && (
              <LinkList items={meta.fandom} param="fandom" separator=", " className={FANDOM_CLS} linkClassName={FANDOM_LINK} />
            )}

            {meta.relationships.length > 0 && (
              <LinkList
                items={meta.relationships}
                param="relationship"
                separator={<span className="font-normal text-secondary opacity-60"> / </span>}
                className={SHIPS_CLS}
                linkClassName={SHIP_LINK}
              />
            )}

            {meta.characters.length > 0 && (
              <LinkList
                items={meta.characters}
                param="character"
                separator={<span className="opacity-40">, </span>}
                className={CHARS_CLS}
                linkClassName={CHAR_LINK}
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

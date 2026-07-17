import Link from 'next/link';

export type TagCategory =
  | 'fandom'
  | 'relationship'
  | 'character'
  | 'additional'
  | 'warning'
  | 'category';

interface Props {
  tag: string;
  category: TagCategory;
  /** If true, renders as a filter link (adds underline on hover) */
  clickable?: boolean;
  href?: string;
  /** White-translucent variant for tags overlaid on a cover image (grid card). */
  onImage?: boolean;
}

// Fixed `leading-[18px]` (not a unitless line-height) keeps every chip the same
// box height regardless of the per-category font-size/weight below — the size
// and weight differences are intentional, the height differences were not.
const BASE =
  'inline-block max-w-full rounded-chip px-2 py-[3px] font-sans leading-[18px] [overflow-wrap:anywhere] transition-colors';
// Size + weight (+ decoration) per category — the SINGLE source of truth, read
// by BOTH the default (on-light) and onImage variants. Change a weight here and
// it applies everywhere the tag renders (reading page, text card, grid card).
const TYPE: Record<TagCategory, string> = {
  fandom: 'text-[14px] font-medium',
  relationship: 'text-[14px] font-normal italic',
  character: 'text-[13px] font-normal',
  additional: 'text-[13px] font-light',
  warning: 'text-[11px] font-medium uppercase tracking-[0.06em]',
  category: 'text-[13px] font-normal',
};
// Text color for the default (on-light) variant; onImage forces white.
const COLOR: Record<TagCategory, string> = {
  fandom: 'text-text',
  relationship: 'text-text',
  character: 'text-text',
  additional: 'text-text',
  warning: 'text-secondary',
  category: 'text-secondary',
};

const CLICKABLE =
  'cursor-pointer hover:border-border-active hover:underline hover:underline-offset-2';
const CLICKABLE_ON_IMAGE = 'cursor-pointer hover:bg-white/[0.28]';

export function TagChip({ tag, category, clickable, href, onImage }: Props) {
  // Over-cover variant: same TYPE (size/weight), white text on a translucent
  // fill so it reads over a dark cover photo instead of a border on light bg.
  const className = onImage
    ? `${BASE} ${TYPE[category]} border border-transparent bg-white/[0.16] text-white${clickable ? ` ${CLICKABLE_ON_IMAGE}` : ''}`
    : `${BASE} ${TYPE[category]} ${COLOR[category]} border border-border-chip${clickable ? ` ${CLICKABLE}` : ''}`;

  if (clickable && href) {
    return (
      <Link href={href} className={className}>
        {tag}
      </Link>
    );
  }

  return <span className={className}>{tag}</span>;
}

// ── Labeled tag row (Warnings / Fandom / Ships / Characters / Tags) ──
// One row = an uppercase label + a wrapped group of filter-link TagChips.
// Shared by the reader's StoryOverview popover (and the browse cards' chips). Renders
// nothing when the field is empty. `max-md:` stacking is a no-op there.
const TAG_ROW = 'flex items-baseline gap-3 max-md:flex-col max-md:items-start max-md:gap-1.5';
const TAG_LABEL =
  'w-[70px] shrink-0 pt-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-secondary max-md:w-auto max-md:shrink max-md:text-[9px]';
const TAG_GROUP = 'flex min-w-0 flex-wrap gap-1';

export function TagRow({
  label,
  items,
  category,
  param,
}: {
  label: string;
  items: string[];
  category: TagCategory;
  /** URL filter key (differs from category for tags → `tag`). */
  param: string;
}) {
  if (items.length === 0) return null;
  // Dedupe: frontmatter can legitimately repeat a value (e.g. a self-ship
  // listing "Original Female Character" twice) — one chip per value is enough,
  // and repeated values would collide as React keys.
  const unique = [...new Set(items)];
  return (
    <div className={TAG_ROW}>
      <span className={TAG_LABEL}>{label}</span>
      <div className={TAG_GROUP}>
        {unique.map((t) => (
          <TagChip key={t} tag={t} category={category} clickable href={`/?${param}=${encodeURIComponent(t)}`} />
        ))}
      </div>
    </div>
  );
}

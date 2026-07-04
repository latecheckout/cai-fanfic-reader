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
}

// Fixed `leading-[18px]` (not a unitless line-height) keeps every chip the same
// box height regardless of the per-category font-size/weight below — the size
// and weight differences are intentional, the height differences were not.
const BASE =
  'inline-block max-w-full rounded-chip border border-border-chip px-2 py-[3px] font-sans leading-[18px] [overflow-wrap:anywhere] transition-colors';

// Text color lives on each category (not BASE) so warning/category can use
// text-secondary without colliding with a base text color utility.
const CATEGORY: Record<TagCategory, string> = {
  fandom: 'text-[14px] font-medium text-text',
  relationship: 'text-[14px] font-normal italic text-text',
  character: 'text-[13px] font-normal text-text',
  additional: 'text-[13px] font-light text-text',
  warning: 'text-[11px] font-medium uppercase tracking-[0.06em] text-secondary',
  category: 'text-[13px] font-normal text-secondary',
};

const CLICKABLE =
  'cursor-pointer hover:border-border-active hover:underline hover:underline-offset-2';

export function TagChip({ tag, category, clickable, href }: Props) {
  const className = `${BASE} ${CATEGORY[category]}${clickable ? ` ${CLICKABLE}` : ''}`;

  if (clickable && href) {
    return (
      <Link href={href} className={className}>
        {tag}
      </Link>
    );
  }

  return <span className={className}>{tag}</span>;
}

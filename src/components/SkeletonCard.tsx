/**
 * SkeletonCard — shared loading placeholder shaped like a work card.
 *
 * Self-styled by default (the home rails just drop it in). Browse/Library pass
 * their own scoped module via `styles`; in that case the parent container shapes
 * the layout, so the layout class is only applied in the self-styled case.
 *
 * A simple shimmer sweep runs across the card while it's mounted (see the
 * module CSS).
 *
 * Required style keys: skeletonCard, skeletonContent, skeletonLine.
 * Optional: skeletonChip (browse variant), grid/list (self-styled layout).
 */
export type SkeletonCardStyles = Record<string, string>;

/* Self-styled defaults (Tailwind) used when no `styles` prop is passed — the
   home rails. Mirrors the old SkeletonCard.module.css: a bordered box; grid =
   2:3 with bars pinned bottom-left, list = a taller stack. The shimmer bar is a
   base→highlight→base gradient wider than the bar; sweeping its background-
   position slides a light band across (caiSkeletonShimmer). */
const SELF = {
  card:
    'relative flex flex-col gap-[10px] p-3 rounded-card ' +
    'bg-[color-mix(in_srgb,var(--card-bg),#fff_35%)] opacity-0 ' +
    'animate-[fadeIn_200ms_var(--ease-out-expo)_forwards]',
  contentBase: 'min-w-0 flex flex-col gap-[10px]',
  line:
    'rounded-[3px] bg-border-strong ' +
    'bg-[linear-gradient(90deg,var(--border-strong)_0%,color-mix(in_srgb,var(--border-strong),#fff_60%)_50%,var(--border-strong)_100%)] ' +
    'bg-[length:200%_100%] bg-no-repeat animate-[caiSkeletonShimmer_1.3s_linear_infinite]',
  grid: 'aspect-[2/3]',
  list: 'min-h-[300px]',
};

interface Props {
  index: number;
  /** Optional CSS-module override (Browse/Library scope their own). */
  styles?: SkeletonCardStyles;
  /** 'browse' (default) shows a chip row; 'library' omits it */
  variant?: 'browse' | 'library';
  /** 'list' renders the taller text-card line set; 'grid' the compact one. */
  layout?: 'grid' | 'list';
}

export function SkeletonCard({ index, styles: stylesProp, layout = 'grid' }: Props) {
  const isList = layout === 'list';
  const selfStyled = !stylesProp;

  // Self-styled → Tailwind defaults, with grid pinning its bars bottom-left.
  // Prop-styled (Browse/Library) → the caller's scoped module handles layout.
  const cardClass = selfStyled
    ? `${SELF.card} ${isList ? SELF.list : SELF.grid}`
    : stylesProp!.skeletonCard;
  const contentClass = selfStyled
    ? `${SELF.contentBase} ${isList ? 'flex-1' : 'absolute left-3 right-3 bottom-3 flex-none'}`
    : stylesProp!.skeletonContent;
  const lineClass = selfStyled ? SELF.line : stylesProp!.skeletonLine;

  return (
    <div className={cardClass} style={{ animationDelay: `${index * 40}ms` }}>
      <div className={contentClass}>
        {/* badges */}
        <div className={lineClass} style={{ width: '40%', height: '10px' }} />
        {/* title */}
        <div className={lineClass} style={{ width: '82%', height: '16px' }} />
        {/* byline */}
        <div className={lineClass} style={{ width: '28%', height: '11px' }} />
        {/* summary — list only (the text card is taller) */}
        {isList && <div className={lineClass} style={{ width: '92%', height: '12px' }} />}
        {/* stats / metrics */}
        <div className={lineClass} style={{ width: '46%', height: '12px' }} />
      </div>
    </div>
  );
}

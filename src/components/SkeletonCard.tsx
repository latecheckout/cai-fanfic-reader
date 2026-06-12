import defaultStyles from '@/styles/components/SkeletonCard.module.css';

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

interface Props {
  index: number;
  /** Optional CSS-module override (Browse/Library scope their own). */
  styles?: SkeletonCardStyles;
  /** 'browse' (default) shows a chip row; 'library' omits it */
  variant?: 'browse' | 'library';
  /** 'list' renders the taller text-card line set; 'grid' the compact one. */
  layout?: 'grid' | 'list';
}

export function SkeletonCard({ index, styles: stylesProp, variant = 'browse', layout = 'grid' }: Props) {
  const isList = layout === 'list';
  const styles = stylesProp ?? defaultStyles;
  const selfStyled = !stylesProp;
  const cardClass = `${styles.skeletonCard}${selfStyled ? ` ${layout === 'grid' ? styles.grid : styles.list}` : ''}`;

  return (
    <div className={cardClass} style={{ animationDelay: `${index * 40}ms` }}>
      <div className={styles.skeletonContent}>
        {/* badges */}
        <div className={styles.skeletonLine} style={{ width: '40%', height: '10px' }} />
        {/* title */}
        <div className={styles.skeletonLine} style={{ width: '82%', height: '16px' }} />
        {/* byline */}
        <div className={styles.skeletonLine} style={{ width: '28%', height: '11px' }} />
        {/* summary — list only (the text card is taller) */}
        {isList && <div className={styles.skeletonLine} style={{ width: '92%', height: '12px' }} />}
        {/* stats / metrics */}
        <div className={styles.skeletonLine} style={{ width: '46%', height: '12px' }} />
      </div>
    </div>
  );
}

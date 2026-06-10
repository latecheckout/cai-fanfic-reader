/**
 * SkeletonCard — shared loading placeholder that matches WorkCardCover dimensions
 * (a 2:3 cover thumbnail + stacked text lines).
 *
 * Accepts the parent component's CSS module styles so each callsite keeps its
 * own scoped animation definitions without needing a shared CSS file.
 * Required keys: skeletonCard, skeletonStrip, skeletonContent, skeletonLine
 * Optional key:  skeletonChip (browse variant only)
 *
 * Spacing between lines is handled by `.skeletonContent` (flex column + gap),
 * so individual lines never need (and must not use) their own margins.
 */
export type SkeletonCardStyles = Record<string, string>;

interface Props {
  index: number;
  styles: SkeletonCardStyles;
  /** 'browse' (default) shows a chip row; 'library' omits it */
  variant?: 'browse' | 'library';
}

export function SkeletonCard({ index, styles, variant = 'browse' }: Props) {
  return (
    <div className={styles.skeletonCard} style={{ animationDelay: `${index * 40}ms` }}>
      <div className={styles.skeletonStrip} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine} style={{ width: '40%', height: '10px' }} />
        <div className={styles.skeletonLine} style={{ width: '82%', height: '16px' }} />
        <div className={styles.skeletonLine} style={{ width: '28%', height: '11px' }} />
        <div className={styles.skeletonLine} style={{ width: '70%', height: '12px' }} />
        {variant === 'browse' && styles.skeletonChip && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
            <div className={styles.skeletonChip} />
            <div className={styles.skeletonChip} style={{ width: '64px' }} />
            <div className={styles.skeletonChip} style={{ width: '80px' }} />
          </div>
        )}
      </div>
    </div>
  );
}

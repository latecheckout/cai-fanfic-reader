/**
 * SkeletonCard — shared loading placeholder that matches WorkCard dimensions.
 *
 * Accepts the parent component's CSS module styles so each callsite keeps its
 * own scoped animation definitions without needing a shared CSS file.
 *
 * Usage:
 *   import { SkeletonCard } from './SkeletonCard';
 *   <SkeletonCard index={i} styles={styles} />                 // browse variant (default)
 *   <SkeletonCard index={i} styles={styles} variant="library" /> // library variant (no chip row)
 */

// CSS Modules export { readonly [key: string]: string } — use that as the styles type
// so TypeScript doesn't complain at call sites.
// Required keys: skeletonCard, skeletonStrip, skeletonContent, skeletonLine
// Optional key:  skeletonChip (browse variant only)
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
        <div className={styles.skeletonLine} style={{ width: '45%', height: '10px', marginBottom: '10px' }} />
        <div className={styles.skeletonLine} style={{ width: variant === 'browse' ? '85%' : '80%', height: '15px', marginBottom: '6px' }} />
        <div className={styles.skeletonLine} style={{ width: '30%', height: '11px', marginBottom: '12px' }} />
        {variant === 'browse' && styles.skeletonChip && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
            <div className={styles.skeletonChip} />
            <div className={styles.skeletonChip} style={{ width: '64px' }} />
            <div className={styles.skeletonChip} style={{ width: '80px' }} />
          </div>
        )}
        <div className={styles.skeletonLine} style={{ width: variant === 'browse' ? '70%' : '65%', height: '12px', marginTop: '14px' }} />
        <div className={styles.skeletonLine} style={{ width: variant === 'browse' ? '55%' : undefined, height: '12px', marginTop: variant === 'browse' ? '5px' : undefined }} />
        {variant === 'browse' && (
          <div className={styles.skeletonLine} style={{ width: '40%', height: '10px', marginTop: '12px' }} />
        )}
        {variant === 'library' && (
          <div className={styles.skeletonLine} style={{ width: '40%', height: '10px', marginTop: '12px' }} />
        )}
      </div>
    </div>
  );
}

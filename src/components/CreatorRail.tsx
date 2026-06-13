import { Creator } from '@/lib/shelves';
import { CreatorCard } from './CreatorCard';
import { RailViewport } from './RailViewport';
import styles from '@/styles/components/CreatorRail.module.css';

interface Props {
  creators: Creator[];
}

/**
 * Trending creators (server component): a horizontal rail of CreatorCards (per
 * Devon, design review June 2026 — "make the humans shine").
 */
export function CreatorRail({ creators }: Props) {
  if (creators.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Trending creators">
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>Trending creators ✍️</h2>
          <p className={styles.subtitle}>The humans behind the stories</p>
        </div>
      </div>

      {/* .rail frames the scroller and carries the directional edge fades;
          RailViewport adds prev/next scroll arrows (in addition to swipe). */}
      <RailViewport railClassName={styles.rail} rowClassName={styles.row}>
        {creators.map((c) => <CreatorCard key={c.name} creator={c} />)}
      </RailViewport>
    </section>
  );
}

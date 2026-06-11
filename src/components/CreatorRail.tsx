import { Creator } from '@/lib/shelves';
import { CreatorCard } from './CreatorCard';
import { ModeSwitchFlash } from './ModeSwitchFlash';
import styles from '@/styles/components/CreatorRail.module.css';

interface Props {
  creators: Creator[];
}

/**
 * Trending creators (server component): a horizontal rail of CreatorCards (per
 * Devon, design review June 2026 — "make the humans shine"). ModeSwitchFlash
 * flashes skeletons on a mode toggle; the cards pass through as its children.
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

      {/* .rail frames the scroller and carries the directional edge fades. */}
      <div className={styles.rail}>
        <div className={styles.row}>
          <ModeSwitchFlash
            count={creators.length}
            cardClassName={styles.skelCard}
            variant="library"
            layout="grid"
          >
            {creators.map((c) => <CreatorCard key={c.name} creator={c} />)}
          </ModeSwitchFlash>
        </div>
      </div>
    </section>
  );
}

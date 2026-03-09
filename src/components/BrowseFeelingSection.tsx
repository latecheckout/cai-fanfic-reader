import Link from 'next/link';
import { FeelingData } from '@/lib/filters';
import styles from '@/styles/components/BrowseFeelingSection.module.css';

interface Props {
  data: FeelingData;
}

export function BrowseFeelingSection({ data }: Props) {
  const { topTrope, activeFandom, shortCount } = data;

  if (!topTrope && !activeFandom && shortCount === 0) return null;

  return (
    <section className={styles.section}>
      {/* Section header band */}
      <div className={styles.band}>
        <span className={styles.bandLabel}>Browse by feeling</span>
      </div>

      <div className={styles.grid}>
        {/* ── Block 1: Top Trope — dark, 2 cols ── */}
        {topTrope && (
          <Link
            href={`/?tag=${encodeURIComponent(topTrope.name)}`}
            className={`${styles.block} ${styles.blockTrope}`}
          >
            <span className={styles.tropeEyebrow}>This week&rsquo;s trope</span>
            <h3 className={styles.tropeTitle}>{topTrope.name.toLowerCase()}</h3>
            <div className={styles.tropeDivider} />
            {topTrope.relatedTags.length > 0 && (
              <p className={styles.tropeRelated}>
                {topTrope.relatedTags.join(' · ')}
              </p>
            )}
            <span className={styles.tropeCount}>
              {topTrope.count} {topTrope.count === 1 ? 'story' : 'stories'}
            </span>
          </Link>
        )}

        {/* ── Block 2: Active Fandom — light, amber accent ── */}
        {activeFandom && (
          <Link
            href={`/?fandom=${encodeURIComponent(activeFandom.name)}`}
            className={`${styles.block} ${styles.blockFandom}`}
          >
            <span className={styles.fandomEyebrow}>Active fandom</span>
            <h3 className={styles.fandomName}>{activeFandom.name}</h3>
            <div className={styles.fandomPulse}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span className={styles.pulseText}>Recently updated</span>
            </div>
            <span className={styles.fandomCount}>
              {activeFandom.count} {activeFandom.count === 1 ? 'work' : 'works'}
            </span>
          </Link>
        )}

        {/* ── Block 3: Format / Short reads — dark ── */}
        {shortCount > 0 && (
          <Link
            href="/?sort=words&order=asc"
            className={`${styles.block} ${styles.blockFormat}`}
          >
            <span className={styles.formatEyebrow}>Format</span>
            <h3 className={styles.formatTitle}>something short</h3>
            <div className={styles.formatChips}>
              <span className={styles.formatChip}>one-shot</span>
              <span className={styles.formatChip}>complete</span>
              <span className={styles.formatChip}>&lt;15k</span>
            </div>
            <span className={styles.formatCount}>
              {shortCount} {shortCount === 1 ? 'work' : 'works'}
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}

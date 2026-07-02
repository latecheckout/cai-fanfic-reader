import Link from 'next/link';
import Image from 'next/image';
import { GENERIC_COVER } from '@/lib/covers';
import styles from '@/styles/components/ContinueCard.module.css';

export interface ContinueItem {
  slug: string;
  title: string;
  chapterIndex: number;
  totalChapters: number;
  scrollPercent: number;
}

interface Props {
  item: ContinueItem;
  /** Cover path (bookmarks from localStorage lack meta.cover). */
  cover?: string;
}

/**
 * Continue-reading card — mode-aware like the work cards. Visual mode is a
 * cover thumbnail with the title overlaid and a progress bar; text/AO4 mode is
 * a compact bordered text card (title + chapter + progress). CSS picks the
 * presentation by the global html[data-mode], so it follows the site toggle.
 */
export function ContinueCard({ item, cover }: Props) {
  const pct = Math.min(item.scrollPercent * 100, 100);
  const pctLabel = `${pct.toFixed(1)}%`;

  return (
    <Link
      href={`/works/${item.slug}`}
      className={styles.card}
      title={`${item.title} · Ch. ${item.chapterIndex + 1} of ${item.totalChapters}`}
      aria-label={`Continue reading ${item.title}, chapter ${item.chapterIndex + 1} of ${item.totalChapters}`}
    >
      {/* Visual: cover + title/chapter at the top + progress at the bottom */}
      <span className={styles.slot}>
        <span className={styles.media}>
          <Image src={cover ?? GENERIC_COVER} alt="" fill sizes="150px" className={styles.coverImg} />
          <span className={styles.scrim} aria-hidden="true" />
          <span className={styles.head} aria-hidden="true">
            <span className={styles.title}>{item.title}</span>
            <span className={styles.meta}>Ch {item.chapterIndex + 1} of {item.totalChapters}</span>
          </span>
          <span className={styles.progressTrack}>
            <span className={styles.progressFill} style={{ width: pctLabel }} />
          </span>
        </span>
      </span>

      {/* Text: same 2:3 box, solid fill — same top header + bottom progress */}
      <span className={styles.slotText}>
        <span className={styles.head} aria-hidden="true">
          <span className={styles.title}>{item.title}</span>
          <span className={styles.meta}>Ch {item.chapterIndex + 1} of {item.totalChapters}</span>
        </span>
        <span className={styles.progressTrack}>
          <span className={styles.progressFill} style={{ width: pctLabel }} />
        </span>
      </span>
    </Link>
  );
}

/** Loading placeholder — the 2:3 card with the same UI elements as placeholders:
 *  title + chapter at the top, progress bar at the bottom. */
export function ContinueCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <span className={styles.skelBox}>
        <span className={styles.head} aria-hidden="true">
          <span className={`${styles.skelLine} ${styles.skelTitle}`} />
          <span className={`${styles.skelLine} ${styles.skelMeta}`} />
        </span>
        <span className={styles.progressTrack}>
          <span className={styles.progressFill} style={{ width: '40%' }} />
        </span>
      </span>
    </div>
  );
}

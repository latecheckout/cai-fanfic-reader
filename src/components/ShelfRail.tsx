import Link from 'next/link';
import { Shelf } from '@/lib/shelves';
import { WorkCardGrid } from './WorkCardGrid';
import { WorkCardCover } from './WorkCardCover';
import styles from '@/styles/components/ShelfRail.module.css';

interface Props {
  shelf: Shelf;
  /** Eager-load covers for the first shelf above the fold. */
  priority?: boolean;
}

/**
 * Horizontal shelf rail (server component). The exact browse cards are reused
 * verbatim: visual mode renders WorkCardGrid, text mode the WorkCardCover list
 * card; the global data-mode toggle picks the slot via CSS. Fully server-
 * rendered — the mode-switch transition is handled globally by the colour sweep.
 *
 * Edge fades are directional via a CSS scroll-driven animation (see .rail).
 */
export function ShelfRail({ shelf, priority = false }: Props) {
  return (
    <section className={styles.section} aria-label={shelf.title}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          {/* Filter-driven shelves link their title to the full result set;
              manually curated shelves have no filter URL. */}
          <h2 className={styles.title}>
            {shelf.href ? (
              <Link href={shelf.href} className={styles.titleLink}>{shelf.title}</Link>
            ) : (
              shelf.title
            )}
          </h2>
          <p className={styles.subtitle}>{shelf.subtitle}</p>
        </div>
      </div>

      {/* .rail is the non-scrolling frame that carries the edge-fade overlays;
          .row is the actual horizontal scroller. */}
      <div className={styles.rail}>
        <div className={styles.row}>
          {shelf.works.map((work, i) => (
            <div key={work.slug} className={styles.card}>
              {/* Visual: the exact browse grid card (2:3 image, browse width) */}
              <div className={styles.slot}>
                <WorkCardGrid work={work} priority={priority && i < 4} />
              </div>
              {/* Text: the exact browse list card (browse 2-up width) */}
              <div className={styles.slotText}>
                <WorkCardCover work={work} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

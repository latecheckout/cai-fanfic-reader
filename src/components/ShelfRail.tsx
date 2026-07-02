import { Shelf } from '@/lib/shelves';
import { WorkCardGrid } from './WorkCardGrid';
import { WorkCardCover } from './WorkCardCover';
import { RailViewport } from './RailViewport';
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
  const headingId = `shelf-${shelf.key}-heading`;
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          {/* Plain heading — not a link. The section is named by this heading
              (aria-labelledby) so the shelf name isn't announced twice; the
              emoji is decorative and hidden from screen readers. */}
          <h2 className={styles.title} id={headingId}>
            {shelf.title}
            {shelf.emoji && <span aria-hidden="true"> {shelf.emoji}</span>}
          </h2>
          <p className={styles.subtitle}>{shelf.subtitle}</p>
        </div>
      </div>

      {/* .rail is the non-scrolling frame that carries the edge-fade overlays;
          .row is the actual horizontal scroller. RailViewport adds prev/next
          scroll arrows (in addition to swipe). */}
      <RailViewport railClassName={styles.rail} rowClassName={styles.row}>
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
      </RailViewport>
    </section>
  );
}

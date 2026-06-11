import Link from 'next/link';
import { Shelf } from '@/lib/shelves';
import { WorkCardCover } from './WorkCardCover';
import { ShelfTextCard } from './ShelfTextCard';
import styles from '@/styles/components/ShelfRail.module.css';

interface Props {
  shelf: Shelf;
  /** Eager-load covers for the first shelf above the fold. */
  priority?: boolean;
}

/**
 * Horizontal shelf rail. Visual mode renders the real results grid card
 * (WorkCardCover) so shelf thumbnails reuse the exact same UI and data as
 * grid view. Text mode (html[data-mode='text']) swaps in ShelfTextCard,
 * the AO3-style blurb. Both presentations are server-rendered; CSS picks
 * one by the global data-mode.
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

      <div className={styles.row}>
        {shelf.works.map((work, i) => (
          <article key={work.slug} className={styles.card}>
            {/* Visual variant: the results grid card, UI reused verbatim */}
            <div className={styles.slot}>
              <WorkCardCover work={work} view="grid" priority={priority && i < 4} />
            </div>
            {/* Text variant: AO3 blurb (client, owns the tag expander) */}
            <ShelfTextCard work={work} />
          </article>
        ))}
      </div>
    </section>
  );
}

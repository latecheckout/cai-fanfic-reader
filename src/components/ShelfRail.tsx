import Link from 'next/link';
import Image from 'next/image';
import { Shelf } from '@/lib/shelves';
import { formatCount } from '@/lib/utils';
import styles from '@/styles/components/ShelfRail.module.css';

interface Props {
  shelf: Shelf;
  /** Eager-load covers for the first shelf above the fold. */
  priority?: boolean;
}

/**
 * Horizontal cover rail for one shelf. Cards are deliberately minimal
 * (cover, title, kudos): metadata density belongs to the results layer,
 * one click away via the shelf's "view all" filter URL.
 */
export function ShelfRail({ shelf, priority = false }: Props) {
  return (
    <section className={styles.section} aria-label={shelf.title}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>{shelf.title}</h2>
          <p className={styles.subtitle}>{shelf.subtitle}</p>
        </div>
        <Link href={shelf.href} className={styles.viewAll}>
          view all
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 1.5 7 5 3 8.5" />
          </svg>
        </Link>
      </div>

      <div className={styles.row}>
        {shelf.works.map((work, i) => (
          <Link
            key={work.slug}
            href={`/works/${work.slug}`}
            className={styles.card}
            title={work.meta.title}
          >
            <span className={styles.coverWrap}>
              {work.meta.cover && (
                <Image
                  src={work.meta.cover}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 124px, 150px"
                  priority={priority && i < 4}
                  className={styles.coverImg}
                />
              )}
            </span>
            <span className={styles.cardTitle}>{work.meta.title}</span>
            {work.meta.kudos > 0 && (
              <span className={styles.cardMeta}>♥ {formatCount(work.meta.kudos)}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

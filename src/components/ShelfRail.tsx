import Link from 'next/link';
import Image from 'next/image';
import { Shelf } from '@/lib/shelves';
import { formatCount, formatWords, formatChapters, ratingClass } from '@/lib/utils';
import styles from '@/styles/components/ShelfRail.module.css';

interface Props {
  shelf: Shelf;
  /** Eager-load covers for the first shelf above the fold. */
  priority?: boolean;
}

const ratingLetter = (rating: string) =>
  rating === 'Not Rated' || rating === 'NR' ? 'NR' : rating.charAt(0).toUpperCase();

const isWipStatus = (status: string) => {
  const s = status.toLowerCase();
  return s.includes('progress') || s === 'wip' || s === 'in-progress';
};

/**
 * Horizontal cover rail for one shelf. Each card renders both presentation
 * variants; html[data-mode] (the nav toggle) picks one via CSS:
 * visual = cover thumbnail with rating badge, title, one tag, kudos;
 * text = an AO3-style metadata card in the same thumbnail footprint.
 */
export function ShelfRail({ shelf, priority = false }: Props) {
  return (
    <section className={styles.section} aria-label={shelf.title}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          {/* The title itself routes to the shelf's full result set. */}
          <h2 className={styles.title}>
            <Link href={shelf.href} className={styles.titleLink}>{shelf.title}</Link>
          </h2>
          <p className={styles.subtitle}>{shelf.subtitle}</p>
        </div>
      </div>

      <div className={styles.row}>
        {shelf.works.map((work, i) => {
          const { meta } = work;
          const rClass = styles[ratingClass(meta.rating) as keyof typeof styles];
          const wip = isWipStatus(meta.status);
          return (
            <article key={work.slug} className={styles.card}>
              {/* ── Visual variant ── */}
              <Link href={`/works/${work.slug}`} className={styles.coverLink} title={meta.title}>
                <span className={styles.coverWrap}>
                  {meta.cover && (
                    <Image
                      src={meta.cover}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 124px, 150px"
                      priority={priority && i < 4}
                      className={styles.coverImg}
                    />
                  )}
                </span>
              </Link>
              <span className={styles.badgeRow}>
                <span className={`${styles.ratingLetter} ${rClass}`} title={meta.rating}>
                  {ratingLetter(meta.rating)}
                </span>
              </span>
              <Link href={`/works/${work.slug}`} className={styles.cardTitle}>
                {meta.title}
              </Link>
              {meta.tags.length > 0 && (
                <span className={styles.tags}>
                  <Link
                    href={`/?tag=${encodeURIComponent(meta.tags[0])}`}
                    className={styles.tagChip}
                  >
                    {meta.tags[0]}
                  </Link>
                </span>
              )}
              {meta.kudos > 0 && (
                <span className={styles.cardMeta}>♥ {formatCount(meta.kudos)}</span>
              )}

              {/* ── Text variant: AO3 metadata in the thumbnail footprint ── */}
              <Link href={`/works/${work.slug}`} className={styles.textCard} title={meta.title}>
                <span className={styles.tcBadges}>
                  <span className={`${styles.ratingLetter} ${rClass}`}>{ratingLetter(meta.rating)}</span>
                  <span className={styles.tcStatus}>{wip ? 'WIP' : 'Complete'}</span>
                </span>
                <span className={styles.tcTitle}>{meta.title}</span>
                {meta.author && <span className={styles.tcAuthor}>by {meta.author}</span>}
                {meta.relationships.length > 0 && (
                  <span className={styles.tcShip}>{meta.relationships[0]}</span>
                )}
                {meta.tags.length > 0 && (
                  <span className={styles.tcTags}>
                    {meta.tags.slice(0, 4).map((t) => (
                      <span key={t} className={styles.tcTag}>{t}</span>
                    ))}
                  </span>
                )}
                <span className={styles.tcStats}>
                  {formatWords(meta.words)} · {formatChapters(meta.chaptersPosted, meta.chapters)}
                  {meta.kudos > 0 && <> · ♥ {formatCount(meta.kudos)}</>}
                </span>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

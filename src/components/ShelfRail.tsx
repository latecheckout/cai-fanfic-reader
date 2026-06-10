import Link from 'next/link';
import Image from 'next/image';
import { Shelf } from '@/lib/shelves';
import { formatCount, formatWords, formatChapters, ratingClass, categoryLabel } from '@/lib/utils';
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

const MAX_RAIL_TAGS = 2;
const MAX_TEXT_TAGS = 8;

/**
 * Horizontal shelf rail. Visual mode: clean rounded-cover cards (no grid
 * lattice chrome) carrying the full grid-card data set: cover, rating and
 * status badges, title, author, tags, reads and kudos. Text mode
 * (html[data-mode='text']) swaps in an AO3-style blurb card where every
 * element is individually clickable.
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
        {shelf.works.map((work, i) => {
          const { meta, slug } = work;
          const rClass = styles[ratingClass(meta.rating) as keyof typeof styles];
          const wip = isWipStatus(meta.status);
          const catLabel = categoryLabel(meta.category);
          const warnings = meta.warnings.filter((w) => w !== 'No Archive Warnings Apply');
          const hiddenTagCount = meta.tags.length - MAX_RAIL_TAGS;
          return (
            <article key={slug} className={styles.card}>
              {/* ── Visual variant ── */}
              <div className={styles.visual}>
                <Link href={`/works/${slug}`} className={styles.coverLink} title={meta.title}>
                  <span className={styles.coverWrap}>
                    {meta.cover && (
                      <Image
                        src={meta.cover}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 156px, 188px"
                        priority={priority && i < 4}
                        className={styles.coverImg}
                      />
                    )}
                  </span>
                </Link>

                {/* Badges above the title: rating + status (grid card parity) */}
                <span className={styles.badgeRow}>
                  <span className={`${styles.ratingLetter} ${rClass}`} title={meta.rating}>
                    {ratingLetter(meta.rating)}
                  </span>
                  <span
                    className={`${styles.statusPill} ${wip ? styles.statusWip : styles.statusDone}`}
                    title={wip ? 'Work in Progress' : 'Complete'}
                  >
                    {wip ? 'WIP' : '✓'}
                  </span>
                </span>

                <Link href={`/works/${slug}`} className={styles.cardTitle}>
                  {meta.title}
                </Link>
                {meta.author && <span className={styles.cardAuthor}>by {meta.author}</span>}

                {meta.tags.length > 0 && (
                  <span className={styles.tags}>
                    {meta.tags.slice(0, MAX_RAIL_TAGS).map((t) => (
                      <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className={styles.tagChip}>
                        {t}
                      </Link>
                    ))}
                    {hiddenTagCount > 0 && (
                      <Link href={`/works/${slug}`} className={styles.tagsMore}>
                        +{hiddenTagCount}
                      </Link>
                    )}
                  </span>
                )}

                <span className={styles.cardMeta}>
                  {meta.hits > 0 && (
                    <span className={styles.metaItem}>
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" />
                        <circle cx="8" cy="8" r="2" />
                      </svg>
                      {formatCount(meta.hits)}
                    </span>
                  )}
                  {meta.kudos > 0 && <span className={styles.metaItem}>♥ {formatCount(meta.kudos)}</span>}
                </span>
              </div>

              {/* ── Text variant: AO3 blurb in the enlarged thumbnail footprint ── */}
              <div className={styles.textCard}>
                <div className={styles.tcBadges}>
                  <span className={`${styles.ratingLetter} ${rClass}`} title={meta.rating}>
                    {ratingLetter(meta.rating)}
                  </span>
                  {catLabel && <span className={styles.tcCat}>{catLabel}</span>}
                  <span className={styles.tcStatus}>{wip ? 'WIP' : 'Complete'}</span>
                  {(meta.updated || meta.published) && (
                    <span className={styles.tcDate}>{meta.updated || meta.published}</span>
                  )}
                </div>

                <Link href={`/works/${slug}`} className={styles.tcTitle}>{meta.title}</Link>
                {meta.author && (
                  <Link href={`/?q=${encodeURIComponent(meta.author)}`} className={styles.tcAuthor}>
                    by {meta.author}
                  </Link>
                )}

                {meta.fandom.length > 0 && (
                  <span className={styles.tcFandom}>
                    {meta.fandom.map((f, fi) => (
                      <span key={f}>
                        {fi > 0 && ', '}
                        <Link href={`/?fandom=${encodeURIComponent(f)}`} className={styles.tcFandomLink}>
                          {f}
                        </Link>
                      </span>
                    ))}
                  </span>
                )}

                {meta.relationships.length > 0 && (
                  <span className={styles.tcShips}>
                    {meta.relationships.slice(0, 2).map((r, ri) => (
                      <span key={r}>
                        {ri > 0 && <span className={styles.tcShipSep}> / </span>}
                        <Link href={`/?relationship=${encodeURIComponent(r)}`} className={styles.tcShipLink}>
                          {r}
                        </Link>
                      </span>
                    ))}
                  </span>
                )}

                {meta.summary && <span className={styles.tcSummary}>{meta.summary}</span>}

                {(warnings.length > 0 || meta.tags.length > 0) && (
                  <span className={styles.tcTags}>
                    {warnings.map((w) => (
                      <Link key={`warn-${w}`} href={`/?warning=${encodeURIComponent(w)}`} className={styles.tcWarn}>
                        {w}
                      </Link>
                    ))}
                    {meta.tags.slice(0, MAX_TEXT_TAGS).map((t) => (
                      <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className={styles.tcTag}>
                        {t}
                      </Link>
                    ))}
                  </span>
                )}

                <span className={styles.tcStats}>
                  {formatWords(meta.words)} · {formatChapters(meta.chaptersPosted, meta.chapters)}
                  {meta.kudos > 0 && <> · ♥ {formatCount(meta.kudos)}</>}
                  {meta.bookmarks > 0 && <> · ⚑ {formatCount(meta.bookmarks)}</>}
                  {meta.hits > 0 && <> · {formatCount(meta.hits)} hits</>}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

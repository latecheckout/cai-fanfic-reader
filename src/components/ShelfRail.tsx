import Link from 'next/link';
import { Shelf } from '@/lib/shelves';
import { WorkCardCover } from './WorkCardCover';
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

const MAX_TEXT_TAGS = 8;

/**
 * Horizontal shelf rail. Visual mode renders the real results grid card
 * (WorkCardCover) so shelf thumbnails reuse the exact same UI and data as
 * grid view: cover, signal strip, title, author, tag pills with expander,
 * reads and kudos. Only the results-lattice chrome is stripped (see
 * .slot in the stylesheet). Text mode (html[data-mode='text']) swaps in
 * an AO3-style blurb card where every element is individually clickable.
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
          return (
            <article key={slug} className={styles.card}>
              {/* ── Visual variant: the results grid card, UI reused verbatim ── */}
              <div className={styles.slot}>
                <WorkCardCover work={work} view="grid" priority={priority && i < 4} />
              </div>

              {/* ── Text variant: AO3 blurb in the enlarged thumbnail footprint.
                  Hierarchy mirrors the list card: strip, title + author,
                  summary, warnings + tags, stats, then fandom, ships,
                  characters as the bottom discovery group. ── */}
              <div className={styles.textCard}>
                <div className={styles.tcBadges}>
                  <span className={`${styles.ratingLetter} ${rClass}`} title={meta.rating}>
                    {ratingLetter(meta.rating)}
                  </span>
                  {catLabel && <span className={styles.tcCat}>{catLabel}</span>}
                  <span className={styles.tcStatus}>{wip ? 'WIP' : 'Complete'}</span>
                </div>

                <Link href={`/works/${slug}`} className={styles.tcTitle}>{meta.title}</Link>
                {meta.author && (
                  <Link href={`/?q=${encodeURIComponent(meta.author)}`} className={styles.tcAuthor}>
                    by {meta.author}
                  </Link>
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
                  {(meta.updated || meta.published) && <> · updated {meta.updated || meta.published}</>}
                  {meta.kudos > 0 && <> · ♥ {formatCount(meta.kudos)}</>}
                  {meta.bookmarks > 0 && <> · ⚑ {formatCount(meta.bookmarks)}</>}
                  {meta.hits > 0 && <> · {formatCount(meta.hits)} hits</>}
                </span>

                <span className={styles.tcBottom}>
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

                  {meta.characters.length > 0 && (
                    <span className={styles.tcCharacters}>
                      {meta.characters.slice(0, 4).map((c, ci) => (
                        <span key={`char-${ci}`}>
                          {ci > 0 && ', '}
                          <Link href={`/?character=${encodeURIComponent(c)}`} className={styles.tcCharLink}>
                            {c}
                          </Link>
                        </span>
                      ))}
                    </span>
                  )}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

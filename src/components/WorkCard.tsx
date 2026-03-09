import Link from 'next/link';
import { WorkSummary } from '@/types';
import { formatWords, ratingClass, wordTier, categoryLabel } from '@/lib/utils';
import styles from '@/styles/components/WorkCard.module.css';

interface Props {
  work: WorkSummary;
}

const MAX_TAGS = 5;

const RATING_LETTER: Record<string, string> = {
  G: 'G', T: 'T', M: 'M', E: 'E',
  'Not Rated': 'NR', NR: 'NR',
};

export function WorkCard({ work }: Props) {
  const { meta, slug } = work;

  const tier = wordTier(meta.words);
  const rClass = ratingClass(meta.rating);
  const catLabel = categoryLabel(meta.category);
  const isWip =
    meta.status.toLowerCase().includes('progress') ||
    meta.status.toLowerCase() === 'wip' ||
    meta.status.toLowerCase() === 'in-progress';

  const statsTop = [
    formatWords(meta.words),
    meta.chapters > 1 ? `${meta.chapters} ch.` : '1 ch.',
  ].join(' · ');

  const visibleTags = meta.tags.slice(0, MAX_TAGS);
  const hiddenTagCount = meta.tags.length - MAX_TAGS;

  return (
    <article className={styles.card}>
      {/* ── Left signal strip ── */}
      <div className={styles.strip}>
        <span
          className={`${styles.ratingLetter} ${styles[rClass as keyof typeof styles]}`}
          title={meta.rating}
        >
          {RATING_LETTER[meta.rating] ?? meta.rating.charAt(0)}
        </span>
        {catLabel && (
          <div className={styles.catLabel} title={meta.category.join(', ')}>
            {catLabel}
          </div>
        )}
        <div className={styles.lengthBars}>
          {([1, 2, 3, 4] as const).map((t) => (
            <div
              key={t}
              className={`${styles.bar} ${styles[`bar${t}` as keyof typeof styles]} ${
                t <= tier ? styles.barFilled : ''
              }`}
            />
          ))}
        </div>
        <div className={`${styles.statusPill} ${isWip ? styles.statusWip : styles.statusDone}`}>
          {isWip ? 'WIP' : (
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-label="Complete">
              <polyline points="1.5 4.5 3.5 6.5 7.5 2.5" />
            </svg>
          )}
        </div>
      </div>

      {/* ── Right content column ── */}
      <div className={styles.content}>
        {/* Title — stretched link via ::after covers whole card.
            Tags/ships sit above via position: relative; z-index: 1 */}
        <div className={styles.titleRow}>
          <Link href={`/works/${slug}`} className={styles.titleLink}>
            <span className={styles.title}>{meta.title}</span>
          </Link>
          {meta.author && (
            <span className={styles.author}>by {meta.author}</span>
          )}
        </div>

        {/* Fandom: clickable → filter by fandom */}
        {meta.fandom.length > 0 && (
          <div className={`${styles.fandom} ${styles.interactive}`}>
            {meta.fandom.map((f, i) => (
              <span key={f}>
                {i > 0 && ', '}
                <Link href={`/?fandom=${encodeURIComponent(f)}`} className={styles.fandomLink}>
                  {f}
                </Link>
              </span>
            ))}
          </div>
        )}

        {/* Ships: clickable → filter by relationship. Em dash if none. */}
        <div className={`${styles.ships} ${styles.interactive}`}>
          {meta.relationships.length === 0 ? (
            <span className={styles.shipEmpty}>—</span>
          ) : (
            meta.relationships.map((r, i) => (
              <span key={r}>
                {i > 0 && <span className={styles.shipSeparator}> / </span>}
                <Link href={`/?relationship=${encodeURIComponent(r)}`} className={styles.shipLink}>
                  {r}
                </Link>
              </span>
            ))
          )}
        </div>

        {/* Characters: each character clickable → filter by character */}
        {meta.characters.length > 0 && (
          <div className={`${styles.characters} ${styles.interactive}`}>
            {meta.characters.slice(0, 5).map((c, i) => (
              <span key={c}>
                {i > 0 && <span className={styles.charSeparator}> · </span>}
                <Link href={`/?character=${encodeURIComponent(c)}`} className={styles.charLink}>
                  {c}
                </Link>
              </span>
            ))}
          </div>
        )}

        {/* Tags: each tag clickable → filter by tag */}
        {meta.tags.length > 0 && (
          <div className={`${styles.tags} ${styles.interactive}`}>
            {visibleTags.map((t, i) => (
              <span key={t}>
                {i > 0 && <span className={styles.tagSeparator}> · </span>}
                <Link href={`/?tag=${encodeURIComponent(t)}`} className={styles.tagLink}>
                  {t}
                </Link>
              </span>
            ))}
            {hiddenTagCount > 0 && (
              <span className={styles.tagsMore}> +{hiddenTagCount} more</span>
            )}
          </div>
        )}

        {/* Summary */}
        {meta.summary && <p className={styles.summary}>{meta.summary}</p>}

        {/* Stats bottom */}
        <div className={styles.statsBottom}>
          <span>{statsTop}</span>
          {(meta.updated || meta.published) && (
            <span>· updated {meta.updated || meta.published}</span>
          )}
        </div>
      </div>
    </article>
  );
}

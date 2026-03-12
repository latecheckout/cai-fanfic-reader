'use client';

import Link from 'next/link';
import { WorkSummary } from '@/types';
import { formatWords, formatCount, formatChapters, ratingClass, categoryLabel } from '@/lib/utils';
import styles from '@/styles/components/WorkCardSplit.module.css';

interface Props {
  work: WorkSummary;
  activeFilters?: { tag?: string; warning?: string };
}

const RATING_LETTER: Record<string, string> = {
  G: 'G', T: 'T', M: 'M', E: 'E',
  'Not Rated': 'NR', NR: 'NR',
};

const RATING_TOOLTIPS: Record<string, { title: string; desc: string }> = {
  'General Audiences':     { title: 'General Audiences',     desc: 'Suitable for all ages' },
  'Teen And Up Audiences': { title: 'Teen And Up Audiences', desc: 'Mild themes or language' },
  'Mature':                { title: 'Mature',                desc: 'Adult themes, violence, or strong language' },
  'Explicit':              { title: 'Explicit',              desc: 'Contains explicit sexual content' },
  'Not Rated':             { title: 'Not Rated',             desc: 'Rating not provided by the author' },
};

const CATEGORY_TOOLTIPS: Record<string, { title: string; desc: string }> = {
  'M/M':   { title: 'Male / Male',     desc: 'A relationship between two male characters' },
  'F/F':   { title: 'Female / Female', desc: 'A relationship between two female characters' },
  'F/M':   { title: 'Female / Male',   desc: 'A relationship between a female and male character' },
  'M/F':   { title: 'Male / Female',   desc: 'A relationship between a male and female character' },
  'Gen':   { title: 'General',         desc: 'No romantic or sexual relationships' },
  'Multi': { title: 'Multiple',        desc: 'Multiple pairings or relationship types' },
  'Other': { title: 'Other',           desc: 'An unconventional or unspecified relationship type' },
};

export function WorkCardSplit({ work, activeFilters }: Props) {
  const { meta, slug } = work;

  const activeTags = new Set(
    (activeFilters?.tag ?? '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
  );
  const activeWarnings = new Set(
    (activeFilters?.warning ?? '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean)
  );

  const rClass = ratingClass(meta.rating);
  const catLabel = categoryLabel(meta.category);
  const isWip =
    meta.status.toLowerCase().includes('progress') ||
    meta.status.toLowerCase() === 'wip' ||
    meta.status.toLowerCase() === 'in-progress';

  const statsItems = [
    formatWords(meta.words),
    formatChapters(meta.chaptersPosted, meta.chapters),
    (meta.updated || meta.published) ? `updated ${meta.updated || meta.published}` : null,
    meta.kudos > 0 ? `\u2665 ${formatCount(meta.kudos)}` : null,
    meta.bookmarks > 0 ? `\u2691 ${formatCount(meta.bookmarks)}` : null,
    meta.hits > 0 ? `\u25CB ${formatCount(meta.hits)}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <article className={styles.card}>
      {/* ── Left signal strip ── */}
      <div className={styles.strip}>
        <span
          className={`${styles.ratingLetter} ${styles[rClass as keyof typeof styles]}`}
        >
          {RATING_LETTER[meta.rating] ?? meta.rating.charAt(0)}
          {RATING_TOOLTIPS[meta.rating] && (
            <span className={styles.tooltip}>
              <span className={styles.tooltipTitle}>{RATING_TOOLTIPS[meta.rating].title}</span>
              <span className={styles.tooltipDesc}>{RATING_TOOLTIPS[meta.rating].desc}</span>
            </span>
          )}
        </span>
        {catLabel && (
          <div className={styles.catLabel}>
            {catLabel}
            {CATEGORY_TOOLTIPS[meta.category[0]] && (
              <span className={styles.tooltip}>
                <span className={styles.tooltipTitle}>{CATEGORY_TOOLTIPS[meta.category[0]].title}</span>
                <span className={styles.tooltipDesc}>{CATEGORY_TOOLTIPS[meta.category[0]].desc}</span>
              </span>
            )}
          </div>
        )}
        <div
          className={`${styles.statusPill} ${isWip ? styles.statusWip : styles.statusDone}`}
        >
          {isWip ? 'WIP' : (
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-label="Complete">
              <polyline points="1.5 4.5 3.5 6.5 7.5 2.5" />
            </svg>
          )}
          <span className={styles.tooltip}>
            <span className={styles.tooltipTitle}>{isWip ? 'Work in Progress' : 'Complete'}</span>
            <span className={styles.tooltipDesc}>
              {isWip ? 'The author is still adding chapters' : 'All chapters have been published'}
            </span>
          </span>
        </div>
      </div>

      {/* ── Dual-column content area ── */}
      <div className={styles.content}>

        {/* Left column: identity — title, author, summary, stats */}
        <div className={styles.colLeft}>
          <div className={styles.titleRow}>
            <Link href={`/works/${slug}`} className={styles.titleLink}>
              <span className={styles.title}>{meta.title}</span>
            </Link>
            {meta.author && (
              <span className={styles.author}>by {meta.author}</span>
            )}
          </div>
          {meta.summary && <p className={styles.summary}>{meta.summary}</p>}
          <div className={styles.statsBottom}>
            {statsItems}
          </div>
        </div>

        {/* Vertical divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Right column: discovery — fandom, ships, tags */}
        <div className={`${styles.colRight} ${styles.interactive}`}>
          {meta.fandom.length > 0 && (
            <div className={styles.fandom}>
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

          <div className={styles.ships}>
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

          {meta.characters.length > 0 && (
            <div className={styles.characters}>
              {meta.characters.map((c, i) => (
                <span key={`char-${i}`}>
                  {i > 0 && <span className={styles.charSeparator}>, </span>}
                  <Link href={`/?character=${encodeURIComponent(c)}`} className={styles.charLink}>
                    {c}
                  </Link>
                </span>
              ))}
            </div>
          )}

          {(meta.warnings.length > 0 || meta.tags.length > 0) && (
            <div className={styles.tags}>
              {meta.warnings.filter(w => w !== 'No Archive Warnings Apply').map((w) => (
                <Link key={`warn-${w}`} href={`/?warning=${encodeURIComponent(w)}`}
                  className={`${styles.warnChip} ${activeWarnings.has(w.toLowerCase()) ? styles.warnChipActive : ''}`}>
                  {w}
                </Link>
              ))}
              {meta.tags.map((t) => (
                <Link key={`tag-${t}`} href={`/?tag=${encodeURIComponent(t)}`}
                  className={`${styles.tagChip} ${activeTags.has(t.toLowerCase()) ? styles.tagChipActive : ''}`}>
                  {t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

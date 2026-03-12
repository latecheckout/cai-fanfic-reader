'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WorkSummary } from '@/types';
import { formatWords, formatCount, formatChapters, ratingClass, categoryLabel } from '@/lib/utils';
import styles from '@/styles/components/WorkCard.module.css';

interface Props {
  work: WorkSummary;
  activeFilters?: {
    tag?: string;
    warning?: string;
  };
  activeQ?: string;
}

const MAX_TAGS = 12;

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

export function WorkCard({ work, activeFilters, activeQ }: Props) {
  const { meta, slug } = work;
  const [tagsExpanded, setTagsExpanded] = useState(false);

  // Full-text excerpt extraction (client-side)
  const excerpt = (() => {
    if (!activeQ || !work.textChunks?.length) return null;
    const q = activeQ.toLowerCase();
    for (const chunk of work.textChunks) {
      const idx = chunk.text.toLowerCase().indexOf(q);
      if (idx === -1) continue;
      const start = Math.max(0, idx - 60);
      const end = Math.min(chunk.text.length, idx + activeQ.length + 80);
      const raw = chunk.text.slice(start, end);
      return { chapter: chunk.chapter, raw, matchStart: idx - start, matchEnd: idx - start + activeQ.length };
    }
    return null;
  })();

  const handleFindSimilar = () => {
    const topTags = meta.tags.slice(0, 3).join(', ');
    document.dispatchEvent(new CustomEvent('fill-search', { detail: { value: topTags } }));
  };

  // Active tag/warning values for highlighting (lowercased for comparison)
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

  const visibleTags = tagsExpanded ? meta.tags : meta.tags.slice(0, MAX_TAGS);
  const hiddenTagCount = meta.tags.length - MAX_TAGS;

  return (
    <article className={styles.card}>
      {meta.tags.length > 0 && (
        <button
          type="button"
          className={styles.findSimilarBtn}
          onClick={handleFindSimilar}
          aria-label="Find similar works"
          title="Find similar works"
        >
          ≈ similar
        </button>
      )}
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

      {/* ── Right content column ── */}
      <div className={styles.content}>
        {/* 1. Fandom: context frame */}
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

        {/* 2. Ships: primary scanning target */}
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

        {/* 3. Characters: cast list (plain text links) */}
        {meta.characters.length > 0 && (
          <div className={`${styles.characters} ${styles.interactive}`}>
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

        {/* 4. Tags: warnings (inverted) first, then freeform tags */}
        {(meta.warnings.length > 0 || meta.tags.length > 0) && (
          <div className={`${styles.tags} ${styles.interactive}`}>
            {meta.warnings.filter(w => w !== 'No Archive Warnings Apply').map((w) => (
              <Link
                key={`warn-${w}`}
                href={`/?warning=${encodeURIComponent(w)}`}
                className={`${styles.warnChip} ${activeWarnings.has(w.toLowerCase()) ? styles.warnChipActive : ''}`}
              >
                {w}
              </Link>
            ))}
            {visibleTags.map((t) => (
              <Link
                key={`tag-${t}`}
                href={`/?tag=${encodeURIComponent(t)}`}
                className={`${styles.tagChip} ${activeTags.has(t.toLowerCase()) ? styles.tagChipActive : ''}`}
              >
                {t}
              </Link>
            ))}
            {hiddenTagCount > 0 && (
              <button
                type="button"
                className={styles.tagsMore}
                onClick={() => setTagsExpanded(!tagsExpanded)}
              >
                {tagsExpanded ? 'show less' : `+${hiddenTagCount}`}
              </button>
            )}
          </div>
        )}

        {/* 4. Title + author — demoted, stretched link via ::after covers whole card */}
        <div className={styles.titleRow}>
          <Link href={`/works/${slug}`} className={styles.titleLink}>
            <span className={styles.title}>{meta.title}</span>
          </Link>
          {meta.author && (
            <span className={styles.author}>by {meta.author}</span>
          )}
        </div>

        {/* 5. Summary: the closer */}
        {meta.summary && <p className={styles.summary}>{meta.summary}</p>}

        {/* 5b. Excerpt strip — full-text match */}
        {excerpt && (
          <div className={styles.excerptStrip}>
            <span className={styles.excerptChapter}>{excerpt.chapter} · </span>
            <span className={styles.excerptText}>
              {excerpt.raw.slice(0, excerpt.matchStart) && (
                <span>…{excerpt.raw.slice(0, excerpt.matchStart)}</span>
              )}
              <mark className={styles.excerptMark}>{excerpt.raw.slice(excerpt.matchStart, excerpt.matchEnd)}</mark>
              {excerpt.raw.slice(excerpt.matchEnd)}…
            </span>
          </div>
        )}

        {/* 6. Stats: words · chapters · updated | social proof */}
        <div className={styles.statsBottom}>
          {statsItems}
        </div>
      </div>
    </article>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { WorkMeta } from '@/types';
import { formatWords, formatCount, formatChapters, readingTime } from '@/lib/utils';
import { RatingBadge } from './RatingBadge';
import { TagChip } from './TagChip';
import styles from '@/styles/components/WorkHeader.module.css';

interface Props {
  meta: WorkMeta;
  slug: string;
  totalChapters: number;
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

export function WorkHeader({ meta, slug: _slug, totalChapters }: Props) {
  const [scrollPx, setScrollPx] = useState(0);

  useEffect(() => {
    function onScroll() {
      setScrollPx(window.scrollY);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // Scroll-fade: signals fade first, the top block (cover + identity + description) last
  const z2 = 1 - clamp((scrollPx - 40) / 80, 0, 1);       // signals fade 40→120px
  const z1 = 1 - clamp((scrollPx - 80) / 80, 0, 1);       // top block fades 80→160px

  const chaptersStr = formatChapters(meta.chaptersPosted, meta.chapters);
  const seriesStr = meta.series
    ? `Part ${meta.series.position} of ${meta.series.name}`
    : null;

  const isWip =
    meta.status.toLowerCase().includes('progress') ||
    meta.status.toLowerCase() === 'wip' ||
    meta.status.toLowerCase() === 'in-progress';

  const statsLine = [
    formatWords(meta.words),
    readingTime(meta.words),
    totalChapters > 1 ? chaptersStr : null,
    seriesStr,
    meta.language !== 'English' ? meta.language : null,
    meta.kudos > 0 ? `\u2665 ${formatCount(meta.kudos)}` : null,
    meta.bookmarks > 0 ? `\u2691 ${formatCount(meta.bookmarks)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  // Description: show first 4 sentences, expandable via "see more"
  const sentences = meta.summary.match(/[^.!?]+[.!?]+/g) ?? (meta.summary ? [meta.summary] : []);
  const summaryHasMore = sentences.length > 4;
  const shownSummary =
    summaryHasMore && !summaryExpanded ? sentences.slice(0, 4).join('').trim() : meta.summary;

  return (
    <header className={styles.header} aria-label="Work information">
      {/* Top block: cover + identity + description */}
      <div className={styles.headerRow} style={{ opacity: z1 }}>
        {meta.cover && (
          <div className={styles.cover}>
            <Image src={meta.cover} alt="" fill sizes="180px" className={styles.coverImg} />
            {/* Rating + completion badges on the cover (like the home cards) */}
            <span className={styles.coverBadges}>
              <RatingBadge rating={meta.rating} />
              <span
                className={styles.statusBadge}
                aria-label={isWip ? 'Work in progress' : 'Complete'}
              >
                {isWip ? (
                  'WIP'
                ) : (
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor"
                    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="1.5 4.5 3.5 6.5 7.5 2.5" />
                  </svg>
                )}
              </span>
            </span>
          </div>
        )}
        <div className={styles.headerMain}>
          <h1 className={styles.title}>{meta.title}</h1>
          <p className={styles.byline}>by <span>{meta.author}</span></p>
          {meta.summary && (
            <p className={styles.summaryText}>
              {shownSummary}
              {summaryHasMore && (
                <button
                  type="button"
                  className={styles.seeMore}
                  onClick={() => setSummaryExpanded((v) => !v)}
                >
                  {summaryExpanded ? 'see less' : '… see more'}
                </button>
              )}
            </p>
          )}
          <p className={styles.stats}>{statsLine}</p>
        </div>
      </div>

      {/* Signals — full width below the cover + content */}
      <div className={styles.zone2} style={{ opacity: z2 }}>
        {meta.warnings.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Warnings</span>
            <div className={styles.tagGroup}>
              {meta.warnings.map((w) => (
                <TagChip key={w} tag={w} category="warning" clickable href={`/?warning=${encodeURIComponent(w)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.category.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Category</span>
            <div className={styles.tagGroup}>
              {meta.category.map((c) => (
                <TagChip key={c} tag={c} category="category" clickable href={`/?category=${encodeURIComponent(c)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.fandom.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Fandom</span>
            <div className={styles.tagGroup}>
              {meta.fandom.map((f) => (
                <TagChip key={f} tag={f} category="fandom" clickable href={`/?fandom=${encodeURIComponent(f)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.relationships.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Ships</span>
            <div className={styles.tagGroup}>
              {meta.relationships.map((r) => (
                <TagChip key={r} tag={r} category="relationship" clickable href={`/?relationship=${encodeURIComponent(r)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.characters.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Characters</span>
            <div className={styles.tagGroup}>
              {meta.characters.map((c) => (
                <TagChip key={c} tag={c} category="character" clickable href={`/?character=${encodeURIComponent(c)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.tags.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Tags</span>
            <div className={styles.tagGroup}>
              {meta.tags.map((t) => (
                <TagChip key={t} tag={t} category="additional" clickable href={`/?tag=${encodeURIComponent(t)}`} />
              ))}
            </div>
          </div>
        )}
      </div>

    </header>
  );
}

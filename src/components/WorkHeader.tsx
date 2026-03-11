'use client';

import { useEffect, useState } from 'react';
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

  // Wider fade range for taller editorial header
  const z3 = 1 - clamp(scrollPx / 80, 0, 1);              // summary fades 0→80px
  const z2 = 1 - clamp((scrollPx - 40) / 80, 0, 1);       // signals fades 40→120px
  const z1 = 1 - clamp((scrollPx - 80) / 80, 0, 1);       // identity fades 80→160px

  const chaptersStr = formatChapters(meta.chaptersPosted, meta.chapters);
  const seriesStr = meta.series
    ? `Part ${meta.series.position} of ${meta.series.name}`
    : null;

  const statsLine = [
    meta.status,
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

  return (
    <header className={styles.header} aria-label="Work information">
      {/* Zone 1: Identity — fades last (80→160px) */}
      <div className={styles.zone1} style={{ opacity: z1 }}>
        <div className={styles.titleRow}>
          <RatingBadge rating={meta.rating} />
          <h1 className={styles.title}>{meta.title}</h1>
        </div>
        <p className={styles.byline}>by <span>{meta.author}</span></p>
        <p className={styles.stats}>{statsLine}</p>
      </div>

      {/* Zone 2: Signals — fades mid (40→120px) */}
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

      {/* Zone 3: Summary — fades first (0→80px) */}
      {meta.summary && (
        <div className={styles.zone3} style={{ opacity: z3 }}>
          <p className={styles.summaryText}>{meta.summary}</p>
        </div>
      )}
    </header>
  );
}

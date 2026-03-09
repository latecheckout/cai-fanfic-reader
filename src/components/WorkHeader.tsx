'use client';

import { useEffect, useState } from 'react';
import { WorkMeta } from '@/types';
import { formatWords, readingTime } from '@/lib/utils';
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

  const statsLine = [
    meta.status,
    formatWords(meta.words),
    readingTime(meta.words),
    totalChapters > 1 ? `${totalChapters} chapters` : null,
    meta.language !== 'English' ? meta.language : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <header className={styles.header} aria-label="Work information">
      {/* Zone 1: Identity — fades last (80→160px) */}
      <div className={styles.zone1} style={{ opacity: z1 }}>
        <h1 className={styles.title}>{meta.title}</h1>
        <p className={styles.byline}>by <span>{meta.author}</span></p>
        <p className={styles.stats}>{statsLine}</p>
      </div>

      {/* Zone 2: Signals — fades mid (40→120px) */}
      <div className={styles.zone2} style={{ opacity: z2 }}>
        <div className={styles.sectionDivider} aria-hidden="true" />
        {meta.fandom.length > 0 && (
          <p className={styles.fandomLine}>{meta.fandom.join(' · ')}</p>
        )}
        {meta.relationships.length > 0 && (
          <p className={styles.shipsLine}>{meta.relationships.join(' / ')}</p>
        )}
        {meta.characters.length > 0 && (
          <p className={styles.charsLine}>{meta.characters.join(', ')}</p>
        )}
        {meta.tags.length > 0 && (
          <p className={styles.tagsLine}>{meta.tags.join(' · ')}</p>
        )}
      </div>

      {/* Zone 3: Summary — fades first (0→80px) */}
      {meta.summary && (
        <div className={styles.zone3} style={{ opacity: z3 }}>
          <div className={styles.sectionDivider} aria-hidden="true" />
          <p className={styles.summaryText}>{meta.summary}</p>
        </div>
      )}
    </header>
  );
}

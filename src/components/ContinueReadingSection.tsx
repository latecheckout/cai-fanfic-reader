'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { ContinueCard, ContinueCardSkeleton } from './ContinueCard';
import { RailViewport } from './RailViewport';
import { WORK_TITLES } from '@/lib/workTitles';
import styles from '@/styles/components/ContinueReadingSection.module.css';

interface Props {
  /** slug → cover path, passed from the page (localStorage bookmarks lack meta.cover). */
  covers?: Record<string, string | undefined>;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface Bookmark {
  slug: string;
  title: string;
  chapterIndex: number;
  totalChapters: number;
  scrollPercent: number;
  timestamp: number;
}

interface RawBookmark {
  scrollPercent: number;
  timestamp: number;
  title?: string;
  activeChapterIndex?: number;
  totalChapters?: number;
}

export function ContinueReadingSection({ covers }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loaded, setLoaded] = useState(false);

  useIsomorphicLayoutEffect(() => {
    try {
      const raw = localStorage.getItem('fanfic-bookmarks');
      if (raw) {
        const data: Record<string, RawBookmark> = JSON.parse(raw);
        const items: Bookmark[] = Object.entries(data)
          .map(([slug, b]) => ({
            slug,
            // ONLY trust the bundled content map — never the stored title and
            // never the slug. A bookmark for anything that isn't a current work
            // (an old/renamed/orphaned slug) resolves to '' and is dropped below.
            // This makes it impossible to ever announce a slug like
            // "sample-story-3" as a title.
            title: WORK_TITLES[slug] ?? '',
            chapterIndex: b.activeChapterIndex ?? 0,
            totalChapters: b.totalChapters ?? 1,
            scrollPercent: b.scrollPercent ?? 0,
            timestamp: b.timestamp,
          }))
          .filter((item) => item.title)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 8);
        setBookmarks(items);
      }
    } catch {
      // Fail silently if localStorage is unavailable
    }
    setLoaded(true);
  }, []);

  // Confirmed empty after the read → render nothing.
  if (loaded && bookmarks.length === 0) return null;

  // Pre-hydration / pre-read: reserve the rail's height with skeletons. The
  // `pending` class is hidden via CSS unless <html data-has-reading> is set by
  // ThemeScript, so users with no reading list never see this flash. Once
  // loaded, the skeletons swap to real cards in place — no late push-down.
  const pending = !loaded;

  return (
    <section
      className={`${styles.section} ${pending ? styles.pending : ''}`}
      aria-labelledby="continue-reading-title"
    >
      {/* Section header band */}
      <div className={styles.band}>
        <h2 id="continue-reading-title" className={styles.bandLabel}>Continue Reading</h2>
        {!pending && (
          <span className={styles.bandMeta}>
            {bookmarks.length} in progress{' · '}
            <a href="/reading" className={styles.bandLink}>
              view reading list
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 1.5 7 5 3 8.5" />
              </svg>
            </a>
          </span>
        )}
      </div>

      {/* Card rail — visual covers or text cards, by the global mode.
          .rail frames the scroller and carries the directional edge fades;
          RailViewport adds prev/next scroll arrows (in addition to swipe). */}
      <RailViewport railClassName={styles.rail} rowClassName={styles.cards}>
        {pending
          ? Array.from({ length: PENDING_SKELETONS }, (_, i) => (
              <ContinueCardSkeleton key={i} />
            ))
          : bookmarks.map((item) => (
              <ContinueCard key={item.slug} item={item} cover={covers?.[item.slug]} />
            ))}
      </RailViewport>
    </section>
  );
}

// Single-row rail height is constant, so a fixed skeleton count is enough to
// reserve the right vertical space; it just fills the visible width.
const PENDING_SKELETONS = 6;

'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GENERIC_COVER } from '@/lib/covers';
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
            title: b.title ?? slug,
            chapterIndex: b.activeChapterIndex ?? 0,
            totalChapters: b.totalChapters ?? 1,
            scrollPercent: b.scrollPercent ?? 0,
            timestamp: b.timestamp,
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 8);
        setBookmarks(items);
      }
    } catch {
      // Fail silently if localStorage is unavailable
    }
    setLoaded(true);
  }, []);

  if (!loaded || bookmarks.length === 0) return null;

  return (
    <section className={styles.section}>
      {/* Section header band */}
      <div className={styles.band}>
        <span className={styles.bandLabel}>Continue Reading</span>
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
      </div>

      {/* Thumbnail rail — covers only, title/chapter on hover, progress flush to cover bottom */}
      <div className={styles.cards}>
        {bookmarks.map((item) => (
          <Link
            key={item.slug}
            href={`/works/${item.slug}`}
            className={styles.card}
            title={`${item.title} · Ch. ${item.chapterIndex + 1} of ${item.totalChapters}`}
            aria-label={`Continue reading ${item.title}, chapter ${item.chapterIndex + 1} of ${item.totalChapters}`}
          >
            <div className={styles.cover}>
              <Image
                src={covers?.[item.slug] ?? GENERIC_COVER}
                alt=""
                fill
                sizes="88px"
                className={styles.coverImg}
              />
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.min(item.scrollPercent * 100, 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

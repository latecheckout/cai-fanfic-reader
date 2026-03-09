'use client';

import { useEffect, useState } from 'react';
import { BrowseHeader } from '@/components/BrowseHeader';
import styles from './reading.module.css';

interface BookmarkData {
  scrollPercent: number;
  timestamp: number;
  title?: string;
  activeChapterIndex?: number;
  totalChapters?: number;
}

interface ReadingItem {
  slug: string;
  title: string;
  chapterIndex: number;
  totalChapters: number;
  timestamp: number;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ReadingPage() {
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fanfic-bookmarks');
      if (raw) {
        const bookmarks: Record<string, BookmarkData> = JSON.parse(raw);
        const readingItems = Object.entries(bookmarks)
          .map(([slug, b]) => ({
            slug,
            title: b.title ?? slug,
            chapterIndex: b.activeChapterIndex ?? 0,
            totalChapters: b.totalChapters ?? 1,
            timestamp: b.timestamp,
          }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setItems(readingItems);
      }
    } catch {
      // Fail silently
    }
    setLoaded(true);
  }, []);

  return (
    <div>
      <BrowseHeader />
      <main className={styles.main}>
        <div className={styles.titleRow}>
          <h2 className={styles.heading}>Currently Reading</h2>
          {loaded && items.length > 0 && (
            <span className={styles.count}>{items.length} {items.length === 1 ? 'work' : 'works'}</span>
          )}
        </div>

        {!loaded ? null : items.length === 0 ? (
          <p className={styles.empty}>
            Nothing yet.{' '}
            <a href="/" className={styles.emptyLink}>
              Start reading →
            </a>
          </p>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.slug} className={styles.item}>
                <a
                  href={`/works/${item.slug}`}
                  className={styles.itemLink}
                >
                  <div className={styles.itemLeft}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemProgress}>
                      Chapter {item.chapterIndex + 1} of {item.totalChapters}
                    </span>
                  </div>
                  <span className={styles.itemDate}>{formatDate(item.timestamp)}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

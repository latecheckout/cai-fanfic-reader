'use client';

import { useEffect, useState } from 'react';
import { BrowseHeader } from '@/components/BrowseHeader';
import styles from './reading.module.css';

const SAVED_KEY = 'fanfic-saved-works';

interface BookmarkData {
  scrollPercent: number;
  timestamp: number;
  title?: string;
  activeChapterIndex?: number;
  totalChapters?: number;
}

interface HistoryItem {
  slug: string;
  title: string;
  chapterIndex: number;
  totalChapters: number;
  timestamp: number;
}

interface BookmarkItem {
  slug: string;
  title: string;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type Tab = 'bookmarks' | 'history';

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>('bookmarks');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [bookmarkItems, setBookmarkItems] = useState<BookmarkItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      // Load history from fanfic-bookmarks
      const raw = localStorage.getItem('fanfic-bookmarks');
      if (raw) {
        const bookmarks: Record<string, BookmarkData> = JSON.parse(raw);
        const items = Object.entries(bookmarks)
          .map(([slug, b]) => ({
            slug,
            title: b.title ?? slug,
            chapterIndex: b.activeChapterIndex ?? 0,
            totalChapters: b.totalChapters ?? 1,
            timestamp: b.timestamp,
          }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setHistoryItems(items);

        // Load bookmarks — use titles from history if available
        const savedRaw = localStorage.getItem(SAVED_KEY);
        const savedSlugs: string[] = savedRaw ? JSON.parse(savedRaw) : [];
        const saved = savedSlugs.map((slug) => ({
          slug,
          title: bookmarks[slug]?.title ?? slug,
        }));
        setBookmarkItems(saved);
      } else {
        // No history — still load bookmarks, titles will be slugs
        const savedRaw = localStorage.getItem(SAVED_KEY);
        const savedSlugs: string[] = savedRaw ? JSON.parse(savedRaw) : [];
        setBookmarkItems(savedSlugs.map((slug) => ({ slug, title: slug })));
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
          <h2 className={styles.heading}>Library</h2>
        </div>

        {/* Tab switcher */}
        <div className={styles.tabs} role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'bookmarks'}
            className={`${styles.tab} ${tab === 'bookmarks' ? styles.tabActive : ''}`}
            onClick={() => setTab('bookmarks')}
          >
            Bookmarks
            {loaded && bookmarkItems.length > 0 && (
              <span className={styles.tabCount}>{bookmarkItems.length}</span>
            )}
          </button>
          <button
            role="tab"
            aria-selected={tab === 'history'}
            className={`${styles.tab} ${tab === 'history' ? styles.tabActive : ''}`}
            onClick={() => setTab('history')}
          >
            History
            {loaded && historyItems.length > 0 && (
              <span className={styles.tabCount}>{historyItems.length}</span>
            )}
          </button>
        </div>

        {/* Bookmarks tab */}
        {tab === 'bookmarks' && (
          !loaded ? null : bookmarkItems.length === 0 ? (
            <p className={styles.empty}>
              No bookmarks yet. Open a work and tap the{' '}
              <span className={styles.emptyBookmarkIcon} aria-hidden="true">◈</span>
              {' '}icon to save it here.
            </p>
          ) : (
            <ul className={styles.list}>
              {bookmarkItems.map((item) => (
                <li key={item.slug} className={styles.item}>
                  <a href={`/works/${item.slug}`} className={styles.itemLink}>
                    <div className={styles.itemLeft}>
                      <span className={styles.itemTitle}>{item.title}</span>
                    </div>
                    <svg
                      width="11"
                      height="14"
                      viewBox="0 0 13 16"
                      fill="currentColor"
                      aria-hidden="true"
                      className={styles.itemBookmarkIcon}
                    >
                      <path d="M1.5 2.5C1.5 1.948 1.948 1.5 2.5 1.5h8c.552 0 1 .448 1 1v11.5l-4.5-3-4.5 3V2.5z" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          )
        )}

        {/* History tab */}
        {tab === 'history' && (
          !loaded ? null : historyItems.length === 0 ? (
            <p className={styles.empty}>
              Nothing yet.{' '}
              <a href="/" className={styles.emptyLink}>
                Start reading →
              </a>
            </p>
          ) : (
            <ul className={styles.list}>
              {historyItems.map((item) => (
                <li key={item.slug} className={styles.item}>
                  <a href={`/works/${item.slug}`} className={styles.itemLink}>
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
          )
        )}
      </main>
    </div>
  );
}

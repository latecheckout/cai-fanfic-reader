'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WorkSummary, LayoutView } from '@/types';
import { SearchOptions } from '@/lib/filters';
import { LibraryTab, LIBRARY_REMOVED_KEY } from '@/lib/library';
import { FilterPanel } from './FilterPanel';
// (ViewSlider FAB removed; view toggle now lives in the FilterPanel toolbar)
import { WorkCardCover } from './WorkCardCover';
import { WorkCardGrid } from './WorkCardGrid';
import styles from '@/styles/components/LibraryShell.module.css';
import { SkeletonCard } from './SkeletonCard';

const VIEW_PREF_KEY = 'cai_view_pref';

const TAB_LABELS: Record<LibraryTab, string> = {
  continuing: 'Continue Reading',
  bookmarked: 'Bookmarked',
  completed: 'Completed',
};

interface Props {
  works: WorkSummary[];
  tabCounts: Record<LibraryTab, number>;
  activeTab: LibraryTab;
  searchOptions: SearchOptions;
  currentFilters: {
    tab?: string;
    fandom?: string;
    relationship?: string;
    tag?: string;
    character?: string;
    rating?: string;
    status?: string;
    category?: string;
    language?: string;
    warning?: string;
    sort?: string;
    order?: string;
    q?: string;
    ex_fandom?: string;
    ex_tag?: string;
    ex_relationship?: string;
    ex_character?: string;
    ex_rating?: string;
    ex_status?: string;
    ex_category?: string;
    ex_warning?: string;
    min_words?: string;
    max_words?: string;
    date_preset?: string;
    date_from?: string;
    date_to?: string;
  };
  filteredCount: number;
}

const SKELETON_COUNT = 3;

export function LibraryShell({
  works,
  tabCounts,
  activeTab,
  searchOptions,
  currentFilters,
  filteredCount,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [removedSlugs, setRemovedSlugs] = useState<Set<string>>(new Set());
  const [isFiltering, setIsFiltering] = useState(false);
  const [view, setView] = useState<LayoutView>('list');
  const [viewSwitching, setViewSwitching] = useState(false);
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterKey = JSON.stringify(currentFilters);
  const prevFilterKey = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  // Load removed bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LIBRARY_REMOVED_KEY) ?? '[]');
      setRemovedSlugs(new Set(Array.isArray(stored) ? stored : []));
    } catch { /* ignore */ }
  }, []);

  // The global site mode (nav toggle) is the single source of layout truth.
  useEffect(() => {
    setView(localStorage.getItem('cai_site_mode') === 'text' ? 'list' : 'grid');
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { mode, sweep } = (e as CustomEvent).detail;
      handleViewChange(mode === 'text' ? 'list' : 'grid', sweep);
    };
    window.addEventListener('cai-mode-change', handler);
    return () => window.removeEventListener('cai-mode-change', handler);
  });

  const handleViewChange = (v: LayoutView, skipSkeleton = false) => {
    if (v === view) return;
    setView(v);
    localStorage.setItem(VIEW_PREF_KEY, v);
    // A glimm sweep covers the swap — skip the skeleton flash on mode toggles.
    if (skipSkeleton) {
      setViewSwitching(false);
      if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
      return;
    }
    setViewSwitching(true);
    if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
    // 500ms so the skeleton dust-particle moment reads on mode switches.
    viewTimerRef.current = setTimeout(() => setViewSwitching(false), 500);
  };

  // Show skeleton briefly when filters change (skip initial mount)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevFilterKey.current = filterKey;
      return;
    }
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;

    setIsFiltering(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsFiltering(false), 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [filterKey]);

  const handleTabChange = (tab: LibraryTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/reading?${params.toString()}`);
  };

  const handleRemove = (slug: string) => {
    const next = new Set([...removedSlugs, slug]);
    setRemovedSlugs(next);
    try {
      localStorage.setItem(LIBRARY_REMOVED_KEY, JSON.stringify([...next]));
    } catch { /* ignore */ }
  };

  // Filter out removed slugs on the bookmarked tab (client-side)
  const displayedWorks = activeTab === 'bookmarked'
    ? works.filter((w) => !removedSlugs.has(w.slug))
    : works;

  // Adjust bookmarked count for removals
  const displayedTabCounts = {
    ...tabCounts,
    bookmarked: Math.max(0, tabCounts.bookmarked - removedSlugs.size),
  };

  return (
    <>
      {/* ── Page heading ── */}
      <div className={styles.pageHeader}>
        <h2 className={styles.heading}>Library</h2>
      </div>

      {/* ── Tab bar ── */}
      <div className={styles.tabs} role="tablist">
        {(Object.keys(TAB_LABELS) as LibraryTab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            {TAB_LABELS[tab]}
            <span className={styles.tabCount}>{displayedTabCounts[tab]}</span>
          </button>
        ))}
      </div>

      {/* ── Toolbar + drawer (reuses FilterPanel with library's basePath) ── */}
      <FilterPanel
        searchOptions={searchOptions}
        currentFilters={currentFilters}
        filteredCount={displayedWorks.length}
        basePath="/reading"
      />

      {/* ── Work list ── */}
      <div className={`${styles.workList} ${styles[view]}`}>
        {isFiltering || viewSwitching ? (
          // Keep page height on a view switch so the scrollbar doesn't toggle (no FAB shift).
          Array.from(
            { length: viewSwitching ? Math.max(SKELETON_COUNT, displayedWorks.length) : SKELETON_COUNT },
            (_, i) => (
              <SkeletonCard
                key={i}
                index={i}
                styles={styles}
                variant="library"
                layout={isFiltering ? 'list' : view}
              />
            ),
          )
        ) : displayedWorks.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyHeading}>
              {activeTab === 'continuing' && 'Nothing in progress.'}
              {activeTab === 'bookmarked' && 'No bookmarks.'}
              {activeTab === 'completed' && 'Nothing completed yet.'}
            </p>
            <p className={styles.emptyHint}>
              <a href="/" className={styles.emptyClearLink}>Browse works →</a>
            </p>
          </div>
        ) : (
          displayedWorks.map((work) =>
            activeTab === 'bookmarked' ? (
              <div key={work.slug} className={styles.cardWrapper}>
                {view === 'grid' ? <WorkCardGrid work={work} /> : <WorkCardCover work={work} />}
                <button
                  className={styles.bookmarkBtn}
                  onClick={() => handleRemove(work.slug)}
                  aria-label="Remove bookmark"
                  title="Remove bookmark"
                >
                  <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden="true">
                    <path d="M0 0h14v18l-7-5-7 5V0z" />
                  </svg>
                </button>
              </div>
            ) : view === 'grid' ? (
              <WorkCardGrid key={work.slug} work={work} />
            ) : (
              <WorkCardCover key={work.slug} work={work} />
            )
          )
        )}
      </div>
    </>
  );
}

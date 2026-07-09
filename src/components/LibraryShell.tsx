'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WorkSummary } from '@/types';
import { SearchOptions } from '@/lib/filters';
import { LibraryTab, LIBRARY_REMOVED_KEY } from '@/lib/library';
import { useViewMode } from '@/hooks/useViewMode';
import { FilterPanel } from './FilterPanel';
// (ViewSlider FAB removed; view toggle now lives in the FilterPanel toolbar)
import { WorkCardCover } from './WorkCardCover';
import { WorkCardGrid } from './WorkCardGrid';
import { SkeletonCard } from './SkeletonCard';
import { EmptyState } from './EmptyState';

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

// Per-view layouts — identical to Browse: list = 1-then-2 columns, grid = 4→3→2→1.
const GRID_CLS =
  'grid grid-cols-4 gap-4 max-[1100px]:grid-cols-3 max-[768px]:grid-cols-2 max-[460px]:grid-cols-1';
const LIST_CLS = 'grid grid-cols-1 gap-4 min-[1100px]:grid-cols-2';

// Card wrapper (bookmarked tab) — page-load fade with an nth-child stagger.
const CARD_WRAPPER_CLS =
  'relative ' +
  'motion-reduce:animate-[fadeIn_150ms_ease_both] ' +
  'motion-safe:animate-[fadeIn_450ms_var(--ease-out-expo)_both] ' +
  'motion-safe:[&:nth-child(2)]:animate-[fadeIn_450ms_var(--ease-out-expo)_20ms_both] ' +
  'motion-safe:[&:nth-child(3)]:animate-[fadeIn_450ms_var(--ease-out-expo)_40ms_both] ' +
  'motion-safe:[&:nth-child(4)]:animate-[fadeIn_450ms_var(--ease-out-expo)_60ms_both] ' +
  'motion-safe:[&:nth-child(5)]:animate-[fadeIn_450ms_var(--ease-out-expo)_80ms_both] ' +
  'motion-safe:[&:nth-child(6)]:animate-[fadeIn_450ms_var(--ease-out-expo)_100ms_both] ' +
  'motion-safe:[&:nth-child(7)]:animate-[fadeIn_450ms_var(--ease-out-expo)_120ms_both] ' +
  'motion-safe:[&:nth-child(8)]:animate-[fadeIn_450ms_var(--ease-out-expo)_140ms_both] ' +
  'motion-safe:[&:nth-child(n+9)]:animate-[fadeIn_450ms_var(--ease-out-expo)_160ms_both]';

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
  // Global site mode (nav toggle) is the single source of layout truth.
  const { view, viewSwitching } = useViewMode({ initial: 'list' });
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
      <div className="mb-5">
        <h2 className="m-0 font-sans text-[28px] font-semibold tracking-[-0.01em] text-text">Library</h2>
      </div>

      {/* ── Tab bar ── */}
      <div className="mb-2 flex gap-6 border-b border-border" role="tablist">
        {(Object.keys(TAB_LABELS) as LibraryTab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`-mb-px inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 bg-transparent pt-2 pb-3 font-mono text-[13px] tracking-[0.04em] transition-[color,border-color] duration-[120ms] hover:text-text ${
              activeTab === tab ? 'border-text text-text' : 'border-transparent text-secondary'
            }`}
            onClick={() => handleTabChange(tab)}
          >
            {TAB_LABELS[tab]}
            <span className="font-mono text-xs text-inherit opacity-[0.55]">{displayedTabCounts[tab]}</span>
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
      <div className={view === 'grid' ? GRID_CLS : LIST_CLS}>
        {isFiltering || viewSwitching ? (
          // Keep page height on a view switch so the scrollbar doesn't toggle (no FAB shift).
          Array.from(
            { length: viewSwitching ? Math.max(SKELETON_COUNT, displayedWorks.length) : SKELETON_COUNT },
            (_, i) => (
              <SkeletonCard
                key={i}
                index={i}
                variant="library"
                layout={view}
              />
            ),
          )
        ) : displayedWorks.length === 0 ? (
          <EmptyState
            title={
              activeTab === 'continuing'
                ? 'Nothing in progress.'
                : activeTab === 'bookmarked'
                ? 'No bookmarks.'
                : 'Nothing completed yet.'
            }
          >
            <a href="/" className="text-text underline underline-offset-2 hover:opacity-70">Browse works →</a>
          </EmptyState>
        ) : (
          displayedWorks.map((work) =>
            activeTab === 'bookmarked' ? (
              <div key={work.slug} className={CARD_WRAPPER_CLS}>
                {view === 'grid' ? <WorkCardGrid work={work} /> : <WorkCardCover work={work} />}
                <button
                  className="absolute top-4 right-1 z-[3] flex h-7 w-7 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-text opacity-75 transition-opacity duration-150 hover:opacity-30"
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

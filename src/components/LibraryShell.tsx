'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WorkSummary } from '@/types';
import { SearchOptions } from '@/lib/filters';
import { LibraryTab, MOCK_BOOKMARKED, readSavedSlugs, readRemovedSlugs, removeBookmark } from '@/lib/library';
import { useViewMode } from '@/hooks/useViewMode';
import { useFilterFlash } from '@/hooks/useFilterFlash';
import { FilterPanel } from './FilterPanel';
// (ViewSlider FAB removed; view toggle now lives in the FilterPanel toolbar)
import { WorkGrid } from './WorkGrid';
import { EmptyState } from './EmptyState';
import { BookmarkCheckIcon } from './icons';

const TAB_LABELS: Record<LibraryTab, string> = {
  continuing: 'Continue Reading',
  bookmarked: 'Bookmarked',
  completed: 'Completed',
};

interface Props {
  /** Tab works, filtered + sorted. For the bookmarked tab this is the whole
      filtered archive — the client subsets it to mock + local bookmarks so
      locally saved works keep the URL sort order. */
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
}

// Card entrance — page-load fade with an nth-child stagger. WorkGrid renders
// this on an INNER div (always first-child), so the stagger keys off the
// motion wrapper's position via parent-position variants.
const CARD_WRAPPER_CLS =
  'motion-reduce:animate-[fadeIn_150ms_ease_both] ' +
  'motion-safe:animate-[fadeIn_450ms_var(--ease-out-expo)_both] ' +
  'motion-safe:[:nth-child(2)>&]:animate-[fadeIn_450ms_var(--ease-out-expo)_20ms_both] ' +
  'motion-safe:[:nth-child(3)>&]:animate-[fadeIn_450ms_var(--ease-out-expo)_40ms_both] ' +
  'motion-safe:[:nth-child(4)>&]:animate-[fadeIn_450ms_var(--ease-out-expo)_60ms_both] ' +
  'motion-safe:[:nth-child(5)>&]:animate-[fadeIn_450ms_var(--ease-out-expo)_80ms_both] ' +
  'motion-safe:[:nth-child(6)>&]:animate-[fadeIn_450ms_var(--ease-out-expo)_100ms_both] ' +
  'motion-safe:[:nth-child(7)>&]:animate-[fadeIn_450ms_var(--ease-out-expo)_120ms_both] ' +
  'motion-safe:[:nth-child(8)>&]:animate-[fadeIn_450ms_var(--ease-out-expo)_140ms_both] ' +
  'motion-safe:[:nth-child(n+9)>&]:animate-[fadeIn_450ms_var(--ease-out-expo)_160ms_both]';

export function LibraryShell({
  works,
  tabCounts,
  activeTab,
  searchOptions,
  currentFilters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [removedSlugs, setRemovedSlugs] = useState<Set<string>>(new Set());
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  // Global site mode (nav toggle) is the single source of layout truth.
  const { view } = useViewMode({ initial: 'list' });
  const isFiltering = useFilterFlash(currentFilters, 400);

  // Load removed bookmarks + reading-page saves from localStorage on mount
  useEffect(() => {
    setRemovedSlugs(new Set(readRemovedSlugs()));
    setSavedSlugs(new Set(readSavedSlugs()));
  }, []);

  const handleTabChange = (tab: LibraryTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/reading?${params.toString()}`);
  };

  const handleRemove = (slug: string) => {
    removeBookmark(slug); // owns both localStorage keys (see lib/library.ts)
    setRemovedSlugs(new Set(readRemovedSlugs()));
    setSavedSlugs(new Set(readSavedSlugs()));
  };

  // Bookmarked tab: `works` is the whole filtered+sorted archive — subset it
  // to (mock ∪ locally saved) − removed, preserving the URL sort order.
  const displayedWorks =
    activeTab === 'bookmarked'
      ? works.filter(
          (w) => (MOCK_BOOKMARKED.has(w.slug) || savedSlugs.has(w.slug)) && !removedSlugs.has(w.slug)
        )
      : works;

  // Adjust the bookmarked count badge for local additions/removals. (Saved
  // and removed are disjoint by construction — removeBookmark unsaves.)
  const localAdds = [...savedSlugs].filter((s) => !MOCK_BOOKMARKED.has(s)).length;
  const removedFromMock = [...removedSlugs].filter((s) => MOCK_BOOKMARKED.has(s)).length;
  const displayedTabCounts = {
    ...tabCounts,
    bookmarked: Math.max(0, tabCounts.bookmarked - removedFromMock + localAdds),
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

      {/* ── Work list ── (shared WorkGrid: skeletons on filter, layout morph
          on view switch, exit animation on bookmark removal) */}
      <WorkGrid
        works={displayedWorks}
        view={view}
        isFiltering={isFiltering}
        cardClassName={CARD_WRAPPER_CLS}
        empty={
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
        }
        renderOverlay={
          activeTab === 'bookmarked'
            ? (work) => (
                /* Same saved-state glyph as the reading page's list button.
                   z-[6] keeps it above the cards' hover:z-[5] lift; hovering
                   the icon shows a translucent fill as the remove affordance. */
                <button
                  className={`absolute top-3 right-3 z-[6] flex h-8 w-8 cursor-pointer items-center justify-center rounded-[calc(var(--card-radius)-12px)] border-none bg-transparent p-0 opacity-90 transition-[background,opacity,transform] duration-150 hover:opacity-100 active:scale-95 ${
                    view === 'grid'
                      ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)] hover:bg-white/30 hover:[backdrop-filter:blur(4px)]'
                      : 'text-text hover:bg-overlay-medium'
                  }`}
                  onClick={() => handleRemove(work.slug)}
                  aria-label="Remove bookmark"
                  title="Remove bookmark"
                >
                  <BookmarkCheckIcon width={20} height={20} />
                </button>
              )
            : undefined
        }
      />
    </>
  );
}

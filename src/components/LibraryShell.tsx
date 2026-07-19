'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WorkSummary } from '@/types';
import { LibraryTab, LIBRARY_SORT_OPTIONS, MOCK_BOOKMARKED, readSavedSlugs, readRemovedSlugs, removeBookmark } from '@/lib/library';
import { usePendingParams } from '@/hooks/usePendingParams';
import { setSortParam } from '@/lib/filterParams';
import { SortDropdown } from './SortDropdown';
import { useViewMode } from '@/hooks/useViewMode';
import { useFilterFlash } from '@/hooks/useFilterFlash';
import { ScopedSearchInput } from './ScopedSearchInput';
import { TabPill, TabRow } from './TabPill';
import { SectionHeader } from './RailSection';
import { WorkGrid } from './WorkGrid';
import { EmptyState, EmptyStateCard } from './EmptyState';
import { BookmarkCheckIcon, BookmarkIcon, CheckIcon, ProgressIcon } from './icons';

const TAB_LABELS: Record<LibraryTab, string> = {
  continuing: 'Continue Reading',
  bookmarked: 'Bookmarked',
  completed: 'Completed',
};

// Per-tab empty states: each explains the tab's membership rule and offers a
// goal-specific way back into the catalog.
const TAB_EMPTY: Record<
  LibraryTab,
  { icon: ReactNode; title: string; body: string; ctaLabel: string }
> = {
  continuing: {
    icon: <ProgressIcon width={20} height={20} />,
    title: 'Nothing in progress.',
    body: 'Start reading any story and it appears here, saved at your place.',
    ctaLabel: 'Find a story',
  },
  bookmarked: {
    icon: <BookmarkIcon width={20} height={20} />,
    title: 'No bookmarks.',
    body: 'Bookmark a work from its story page to keep it here.',
    ctaLabel: 'Browse stories to bookmark',
  },
  completed: {
    icon: <CheckIcon width={20} height={20} />,
    title: 'Nothing completed yet.',
    body: 'Finished works appear here after you reach the end of their final published chapter.',
    ctaLabel: 'Find a story',
  },
};

interface Props {
  /** Tab works, filtered + sorted. For the bookmarked tab this is the whole
      filtered archive — the client subsets it to mock + local bookmarks so
      locally saved works keep the URL sort order. */
  works: WorkSummary[];
  tabCounts: Record<LibraryTab, number>;
  activeTab: LibraryTab;
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

  const { readParams, pushParams } = usePendingParams('/reading');

  const handleTabChange = (tab: LibraryTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    // Sort options are tab-contextual — a carried-over library sort key can be
    // invalid on the next tab, so each tab lands on its own default.
    params.delete('sort');
    params.delete('order');
    router.push(`/reading?${params.toString()}`);
  };

  // Current `sort:order` for the dropdown; absent params = the tab's default.
  const sortValue = currentFilters.sort
    ? `${currentFilters.sort}:${currentFilters.order ?? 'desc'}`
    : LIBRARY_SORT_OPTIONS[activeTab][0].value;

  const handleSortChange = (v: string) => {
    const params = readParams();
    setSortParam(params, v);
    pushParams(params);
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
      {/* ── Page heading — same SectionHeader style as browse/characters ── */}
      <h1 className="visually-hidden">Library</h1>
      <div className="mb-5">
        <SectionHeader title="Library" subtitle="Your reading, saved in one place" />
      </div>

      {/* ── Tab row: text tabs over the dividing line. The wrapper's border-b
          is the section divider AND the tab rail — the active tab's indicator
          overlays it (-bottom-px) and slides between tabs. Fixed nav height
          keeps the breathing room the search input used to set. ── */}
      <div className="mb-5 border-b border-border">
        {/* h matches the old row height (search h-10/h-11 + pb-5) so the gap
            between the tab labels and the line is unchanged from before. */}
        <TabRow
          // Count is in the label, so a count change moves tab widths — key on
          // it too so the indicator re-measures.
          activeKey={`${activeTab}:${displayedTabCounts[activeTab]}`}
          ariaLabel="Library tabs"
          className="flex h-15 max-md:h-16 items-stretch gap-6"
        >
          {(Object.keys(TAB_LABELS) as LibraryTab[]).map((tab) => (
            <TabPill
              key={tab}
              href={`/reading?tab=${tab}`}
              label={`${TAB_LABELS[tab]} · ${displayedTabCounts[tab]}`}
              active={activeTab === tab}
              onClick={(e) => {
                e.preventDefault();
                handleTabChange(tab);
              }}
            />
          ))}
        </TabRow>
      </div>

      {/* ── Toolbar below the divider: scoped search + tab-contextual sort
          (labels state the underlying field; max 3 per tab). Search flexes,
          sort collapses to its icon on mobile — both CONTROL_HEIGHT.
          Hidden while the tab is empty — nothing to search or sort. ── */}
      {displayedTabCounts[activeTab] > 0 && (
        <div className="mb-6 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center">
            <ScopedSearchInput basePath="/reading" placeholder="Search your bookmarks" />
          </div>
          <SortDropdown
            options={LIBRARY_SORT_OPTIONS[activeTab]}
            currentValue={sortValue}
            onChange={handleSortChange}
          />
        </div>
      )}

      {/* ── Work list ── (shared WorkGrid: skeletons on filter, layout morph
          on view switch, exit animation on bookmark removal) */}
      <WorkGrid
        works={displayedWorks}
        view={view}
        isFiltering={isFiltering}
        cardClassName={CARD_WRAPPER_CLS}
        empty={
          displayedTabCounts[activeTab] === 0 ? (
            // Tab is truly empty — explain the membership rule + catalog CTA.
            <EmptyStateCard {...TAB_EMPTY[activeTab]} ctaHref="/browse" />
          ) : (
            // Tab has items but the search/filters matched none of them.
            <EmptyState title="No matches.">
              <a
                href={`/reading?tab=${activeTab}`}
                className="text-text underline underline-offset-2 hover:opacity-70"
              >
                Clear search →
              </a>
            </EmptyState>
          )
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

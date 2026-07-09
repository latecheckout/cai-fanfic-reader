'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { WorkSummary } from '@/types';
import { SearchOptions } from '@/lib/filters';
import { useViewMode } from '@/hooks/useViewMode';
import { FilterPanel } from './FilterPanel';
import { WorkCardCover } from './WorkCardCover';
import { WorkCardGrid } from './WorkCardGrid';
import { SkeletonCard } from './SkeletonCard';
import { EmptyState } from './EmptyState';

interface Props {
  works: WorkSummary[];
  searchOptions: SearchOptions;
  currentFilters: {
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
    preset?: string;
  };
  filteredCount: number;
  /** Navigation source — shows a back link when set (e.g. 'characters') */
  from?: string;
}

// @TODO-DEV — SkeletonCard is shown during filter changes. Once content comes from an API,
//             trigger it from a real loading/fetch state. See src/components/SkeletonCard.tsx.
const SKELETON_COUNT = 6;

const FROM_LABELS: Record<string, { href: string; label: string }> = {
  characters: { href: '/characters', label: '← Characters' },
};

// Layout modes (driven by the view toggle). Image cards: 4→3→2→1. Text/list
// cards: single column, two on wide desktops so they fill the extra width.
const GRID_CLS =
  'grid grid-cols-4 gap-4 max-[1100px]:grid-cols-3 max-[768px]:grid-cols-2 max-[460px]:grid-cols-1';
const LIST_CLS = 'grid grid-cols-1 gap-4 min-[1100px]:grid-cols-2';

export function BrowseShell({
  works,
  searchOptions,
  currentFilters,
  filteredCount,
  from,
}: Props) {
  // Global site mode (nav toggle) is the single source of layout truth: text
  // mode renders the rich-metadata list, visual mode the cover grid.
  const { view, viewSwitching } = useViewMode({ initial: 'grid' });
  const [isFiltering, setIsFiltering] = useState(false);
  const filterKey = JSON.stringify(currentFilters);
  const prevFilterKey = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

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
    timerRef.current = setTimeout(() => setIsFiltering(false), 450);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [filterKey]);

  const activeFilterLabels = Object.entries(currentFilters)
    .filter(([k, v]) => v && k !== 'sort' && k !== 'order')
    .map(([k, v]) => ({ key: k, value: v as string }));

  return (
    <>
      <FilterPanel
        searchOptions={searchOptions}
        currentFilters={currentFilters}
        filteredCount={filteredCount}
      />

      {from && FROM_LABELS[from] && (
        <Link
          href={FROM_LABELS[from].href}
          className="mb-4 inline-block font-mono text-[13px] tracking-[0.04em] text-secondary no-underline transition-colors duration-[120ms] hover:text-text"
        >
          {FROM_LABELS[from].label}
        </Link>
      )}

      <div
        className={`transition-opacity duration-[180ms] ease-[ease] motion-safe:animate-[fadeIn_650ms_var(--ease-out-expo)_400ms_both] ${
          isFiltering ? LIST_CLS : view === 'grid' ? GRID_CLS : LIST_CLS
        }`}
      >
        {isFiltering || viewSwitching ? (
          // On a view switch keep the page the same height (one skeleton per work)
          // so the scrollbar never toggles → no horizontal shift of the fixed FAB.
          Array.from(
            { length: viewSwitching ? Math.max(SKELETON_COUNT, works.length) : SKELETON_COUNT },
            (_, i) => (
              <SkeletonCard
                key={i}
                index={i}
                layout={isFiltering ? 'list' : view}
              />
            ),
          )
        ) : works.length === 0 ? (
          <EmptyState className="col-[1/-1]" title="No works match your filters.">
            {activeFilterLabels.length > 0 && (
              <>
                Try removing a filter or{' '}
                <a href="/" className="text-text underline underline-offset-2 hover:opacity-70">clear all</a>.
              </>
            )}
          </EmptyState>
        ) : (
          works.map((work, i) =>
            view === 'grid' ? (
              <WorkCardGrid key={work.slug} work={work} priority={i < 4} />
            ) : (
              <WorkCardCover key={work.slug} work={work} />
            ),
          )
        )}
      </div>
    </>
  );
}

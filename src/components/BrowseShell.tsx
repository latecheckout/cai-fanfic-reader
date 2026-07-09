'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { WorkSummary, LayoutView } from '@/types';

const VIEW_PREF_KEY = 'cai_view_pref';
import { SearchOptions } from '@/lib/filters';
import { FilterPanel } from './FilterPanel';
import { WorkCardCover } from './WorkCardCover';
import { WorkCardGrid } from './WorkCardGrid';
import styles from '@/styles/components/BrowseShell.module.css';
import { SkeletonCard } from './SkeletonCard';

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

export function BrowseShell({
  works,
  searchOptions,
  currentFilters,
  filteredCount,
  from,
}: Props) {
  const [view, setView] = useState<LayoutView>('grid');
  const [isFiltering, setIsFiltering] = useState(false);
  const [viewSwitching, setViewSwitching] = useState(false);
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterKey = JSON.stringify(currentFilters);
  const prevFilterKey = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  // The global site mode (nav toggle) is the single source of layout truth:
  // text mode renders the rich-metadata list, visual mode the cover grid.
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

  const handleViewChange = (v: LayoutView, skipSkeleton = false) => {
    if (v === view) return;
    setView(v);
    localStorage.setItem(VIEW_PREF_KEY, v);
    // A glimm sweep covers the swap on mode toggles — skip the skeleton flash.
    if (skipSkeleton) {
      setViewSwitching(false);
      if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
      return;
    }
    // Brief skeleton in the new layout, then cards fade/stagger in (character-brain feel).
    setViewSwitching(true);
    if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
    // 500ms so the skeleton dust-particle moment reads on mode switches.
    viewTimerRef.current = setTimeout(() => setViewSwitching(false), 500);
  };

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
        <Link href={FROM_LABELS[from].href} className={styles.backLink}>
          {FROM_LABELS[from].label}
        </Link>
      )}

      <div className={`${styles.workList} ${isFiltering ? styles.list : styles[view]}`}>
        {isFiltering || viewSwitching ? (
          // On a view switch keep the page the same height (one skeleton per work)
          // so the scrollbar never toggles → no horizontal shift of the fixed FAB.
          Array.from(
            { length: viewSwitching ? Math.max(SKELETON_COUNT, works.length) : SKELETON_COUNT },
            (_, i) => (
              <SkeletonCard
                key={i}
                index={i}
                styles={styles}
                layout={isFiltering ? 'list' : view}
              />
            ),
          )
        ) : works.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyHeading}>No works match your filters.</p>
            {activeFilterLabels.length > 0 && (
              <p className={styles.emptyHint}>
                Try removing a filter or{' '}
                <a href="/" className={styles.emptyClearLink}>clear all</a>.
              </p>
            )}
          </div>
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

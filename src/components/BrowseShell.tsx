'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { WorkSummary } from '@/types';

const VIEW_PREF_KEY = 'cai_view_pref';
import { FilterOptions, SearchOptions } from '@/lib/filters';
import { FilterPanel } from './FilterPanel';
import { WorkCard } from './WorkCard';
import { WorkCardSplit } from './WorkCardSplit';
import styles from '@/styles/components/BrowseShell.module.css';
import { SkeletonCard } from './SkeletonCard';

interface Props {
  works: WorkSummary[];
  options: FilterOptions;
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
  totalCount: number;
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
  options,
  searchOptions,
  currentFilters,
  totalCount,
  filteredCount,
  from,
}: Props) {
  const [view, setView] = useState<'default' | 'split'>('default');
  const [isFiltering, setIsFiltering] = useState(false);
  const filterKey = JSON.stringify(currentFilters);
  const prevFilterKey = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  // Persist view preference to localStorage
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_PREF_KEY);
    if (saved === 'split' || saved === 'default') setView(saved);
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
    timerRef.current = setTimeout(() => setIsFiltering(false), 450);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [filterKey]);

  const handleViewChange = (v: 'default' | 'split') => {
    setView(v);
    localStorage.setItem(VIEW_PREF_KEY, v);
  };

  const activeFilterLabels = Object.entries(currentFilters)
    .filter(([k, v]) => v && k !== 'sort' && k !== 'order')
    .map(([k, v]) => ({ key: k, value: v as string }));

  return (
    <>
      <FilterPanel
        options={options}
        searchOptions={searchOptions}
        currentFilters={currentFilters}
        totalCount={totalCount}
        filteredCount={filteredCount}
        view={view}
        onViewChange={handleViewChange}
      />

      {from && FROM_LABELS[from] && (
        <Link href={FROM_LABELS[from].href} className={styles.backLink}>
          {FROM_LABELS[from].label}
        </Link>
      )}

      <div className={styles.workList}>
        {isFiltering ? (
          Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <SkeletonCard key={i} index={i} styles={styles} />
          ))
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
          works.map((work) =>
            // Always use default view on mobile (split view hidden on ≤768px)
            (view === 'split' && typeof window !== 'undefined' && window.innerWidth > 768)
              ? <WorkCardSplit key={work.slug} work={work} activeFilters={{ tag: currentFilters.tag, warning: currentFilters.warning }} />
              : <WorkCard
                  key={work.slug}
                  work={work}
                  activeFilters={{ tag: currentFilters.tag, warning: currentFilters.warning }}
                  activeQ={currentFilters.q}
                />
          )
        )}
      </div>
    </>
  );
}

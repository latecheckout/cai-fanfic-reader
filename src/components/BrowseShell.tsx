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

const SKELETON_COUNT = 6;

function SkeletonCard({ index }: { index: number }) {
  return (
    <div className={styles.skeletonCard} style={{ animationDelay: `${index * 40}ms` }}>
      <div className={styles.skeletonStrip} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine} style={{ width: '45%', height: '10px', marginBottom: '10px' }} />
        <div className={styles.skeletonLine} style={{ width: '85%', height: '15px', marginBottom: '6px' }} />
        <div className={styles.skeletonLine} style={{ width: '30%', height: '11px', marginBottom: '12px' }} />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
          <div className={styles.skeletonChip} />
          <div className={styles.skeletonChip} style={{ width: '64px' }} />
          <div className={styles.skeletonChip} style={{ width: '80px' }} />
        </div>
        <div className={styles.skeletonLine} style={{ width: '70%', height: '12px', marginTop: '14px' }} />
        <div className={styles.skeletonLine} style={{ width: '55%', height: '12px', marginTop: '5px' }} />
        <div className={styles.skeletonLine} style={{ width: '40%', height: '10px', marginTop: '12px' }} />
      </div>
    </div>
  );
}

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
            <SkeletonCard key={i} index={i} />
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

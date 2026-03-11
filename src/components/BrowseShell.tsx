'use client';

import { useState } from 'react';
import { WorkSummary, FilterState } from '@/types';
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
    sort?: string;
    order?: string;
    q?: string;
    ex_fandom?: string;
    ex_tag?: string;
    ex_relationship?: string;
    ex_character?: string;
    ex_rating?: string;
    ex_status?: string;
  };
  totalCount: number;
  filteredCount: number;
}

export function BrowseShell({
  works,
  options,
  searchOptions,
  currentFilters,
  totalCount,
  filteredCount,
}: Props) {
  const [view, setView] = useState<'default' | 'split'>('default');

  return (
    <>
      <FilterPanel
        options={options}
        searchOptions={searchOptions}
        currentFilters={currentFilters}
        totalCount={totalCount}
        filteredCount={filteredCount}
        view={view}
        onViewChange={setView}
      />

      <div className={styles.workList}>
        {works.length === 0 ? (
          <div className={styles.empty}>
            <p>No works match your filters.</p>
          </div>
        ) : (
          works.map((work) =>
            view === 'split'
              ? <WorkCardSplit key={work.slug} work={work} />
              : <WorkCard key={work.slug} work={work} />
          )
        )}
      </div>
    </>
  );
}

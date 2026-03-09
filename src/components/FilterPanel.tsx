'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterOptions, SearchOptions } from '@/lib/filters';
import { CustomSelect } from './CustomSelect';
import { SearchOverlay } from './SearchOverlay';
import styles from '@/styles/components/FilterPanel.module.css';

interface Props {
  options: FilterOptions;
  searchOptions?: SearchOptions;
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

const EMPTY_SEARCH_OPTIONS: SearchOptions = { tags: [], fandoms: [] };

const SORT_OPTIONS = [
  { value: 'updated:desc', label: 'recently updated' },
  { value: 'published:desc', label: 'newest first' },
  { value: 'words:desc', label: 'longest first' },
  { value: 'words:asc', label: 'shortest first' },
];

export function FilterPanel({
  options: _options,
  searchOptions = EMPTY_SEARCH_OPTIONS,
  currentFilters,
  totalCount,
  filteredCount,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSortChange = useCallback(
    (v: string) => {
      const [sort, order] = v.split(':');
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', sort);
      params.set('order', order);
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  const currentSortValue = `${currentFilters.sort ?? 'updated'}:${currentFilters.order ?? 'desc'}`;

  // Build include pill list
  const activePills: { key: string; label: string }[] = [];
  if (currentFilters.fandom) activePills.push({ key: 'fandom', label: currentFilters.fandom });
  if (currentFilters.relationship) activePills.push({ key: 'relationship', label: currentFilters.relationship });
  if (currentFilters.tag) activePills.push({ key: 'tag', label: currentFilters.tag });
  if (currentFilters.character) activePills.push({ key: 'character', label: currentFilters.character });
  if (currentFilters.rating) activePills.push({ key: 'rating', label: currentFilters.rating });
  if (currentFilters.status) activePills.push({ key: 'status', label: currentFilters.status });
  if (currentFilters.q) activePills.push({ key: 'q', label: `"${currentFilters.q}"` });

  // Build exclude pill list
  const excludePills: { key: string; label: string }[] = [];
  if (currentFilters.ex_fandom) excludePills.push({ key: 'ex_fandom', label: currentFilters.ex_fandom });
  if (currentFilters.ex_tag) excludePills.push({ key: 'ex_tag', label: currentFilters.ex_tag });
  if (currentFilters.ex_relationship) excludePills.push({ key: 'ex_relationship', label: currentFilters.ex_relationship });
  if (currentFilters.ex_character) excludePills.push({ key: 'ex_character', label: currentFilters.ex_character });
  if (currentFilters.ex_rating) excludePills.push({ key: 'ex_rating', label: currentFilters.ex_rating });
  if (currentFilters.ex_status) excludePills.push({ key: 'ex_status', label: currentFilters.ex_status });

  const openSearch = () => setSearchOpen(true);

  return (
    <>
      <div className={styles.bar}>
        {/* Left: active pills + add buttons */}
        <div className={styles.barLeft}>
          {activePills.map((pill) => (
            <button
              key={pill.key}
              className={styles.pill}
              onClick={() => updateFilter(pill.key, '')}
              title={`Remove filter: ${pill.label}`}
            >
              {pill.label}
              <span className={styles.pillX} aria-hidden="true">×</span>
            </button>
          ))}
          {excludePills.map((pill) => (
            <button
              key={pill.key}
              className={`${styles.pill} ${styles.excludePill}`}
              onClick={() => updateFilter(pill.key, '')}
              title={`Remove exclude filter: ${pill.label}`}
            >
              {pill.label}
              <span className={styles.pillX} aria-hidden="true">×</span>
            </button>
          ))}
          <button
            className={styles.addFilterBtn}
            onClick={openSearch}
            aria-label="Add filter"
          >
            + filter
          </button>
        </div>

        {/* Right: count + sort */}
        <div className={styles.barRight}>
          <span className={styles.workCount}>
            {filteredCount === totalCount
              ? `${totalCount} works`
              : `${filteredCount} of ${totalCount}`}
          </span>
          <CustomSelect
            value={currentSortValue}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        options={searchOptions}
      />
    </>
  );
}

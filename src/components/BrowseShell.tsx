'use client';

import Link from 'next/link';
import { WorkSummary } from '@/types';
import { SearchOptions } from '@/lib/filters';
import { useViewMode } from '@/hooks/useViewMode';
import { useFilterFlash } from '@/hooks/useFilterFlash';
import { FilterPanel } from './FilterPanel';
import { WorkGrid } from './WorkGrid';
import { EmptyStateCard } from './EmptyState';
import { MagnifierIcon } from './icons';

interface Props {
  works: WorkSummary[];
  /** When set, the toolbar renders its own search bar (the catalog surface). */
  searchOptions?: SearchOptions;
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
  // Global site mode (nav toggle) is the single source of layout truth: text
  // mode renders the rich-metadata list, visual mode the cover grid.
  const { view } = useViewMode({ initial: 'grid' });
  const isFiltering = useFilterFlash(currentFilters, 450);

  const activeFilterLabels = Object.entries(currentFilters)
    .filter(([k, v]) => v && k !== 'sort' && k !== 'order')
    .map(([k, v]) => ({ key: k, value: v as string }));

  return (
    <>
      <FilterPanel
        basePath="/browse"
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

      {/* View switches (AO4 toggle) morph via WorkGrid's layout animation;
          skeletons only flash on filter changes. */}
      <WorkGrid
        works={works}
        view={view}
        isFiltering={isFiltering}
        priorityCount={4}
        containerClassName="transition-opacity duration-[180ms] ease-[ease] motion-safe:animate-[fadeIn_650ms_var(--ease-out-expo)_400ms_both]"
        empty={
          <EmptyStateCard
            icon={<MagnifierIcon width={18} height={18} />}
            title="No works match."
            body="Try removing a filter or loosening your search. The whole archive is one click away."
            ctaLabel="Clear all filters"
            ctaHref="/browse"
          />
        }
      />
    </>
  );
}

import { Suspense } from 'react';
import { getWorkSummaries } from '@/lib/works';
import {
  applyFilters,
  buildFilterOptions,
  buildSearchOptions,
} from '@/lib/filters';
import { FilterState } from '@/types';
import { WorkCard } from '@/components/WorkCard';
import { FilterPanel } from '@/components/FilterPanel';
import { BrowseHeader } from '@/components/BrowseHeader';
import { ContinueReadingSection } from '@/components/ContinueReadingSection';
import styles from './browse.module.css';

interface PageProps {
  searchParams: Promise<{
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
    ex_relationship?: string;
    ex_tag?: string;
    ex_character?: string;
    ex_rating?: string;
    ex_status?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: FilterState = {
    fandom: params.fandom,
    relationship: params.relationship,
    tag: params.tag,
    character: params.character,
    rating: params.rating,
    status: params.status,
    sort: params.sort as FilterState['sort'],
    order: params.order as FilterState['order'],
    q: params.q,
    exFandom: params.ex_fandom,
    exRelationship: params.ex_relationship,
    exTag: params.ex_tag,
    exCharacter: params.ex_character,
    exRating: params.ex_rating,
    exStatus: params.ex_status,
  };

  const allWorks = getWorkSummaries();
  const filteredWorks = applyFilters(allWorks, filters);
  const filterOptions = buildFilterOptions(allWorks);
  const searchOptions = buildSearchOptions(allWorks);

  // Only show editorial sections when no active filters (include or exclude)
  const hasActiveFilters = !!(
    params.fandom || params.relationship || params.tag || params.character ||
    params.rating || params.status || params.q ||
    params.ex_fandom || params.ex_relationship || params.ex_tag ||
    params.ex_character || params.ex_rating || params.ex_status
  );

  return (
    <div className={styles.page}>
      <BrowseHeader searchOptions={searchOptions} />

      <main className={styles.main}>
        {/* Continue Reading — hidden when filters are active */}
        {!hasActiveFilters && <ContinueReadingSection />}

        <Suspense>
          <FilterPanel
            options={filterOptions}
            searchOptions={searchOptions}
            currentFilters={params}
            totalCount={allWorks.length}
            filteredCount={filteredWorks.length}
          />
        </Suspense>

        <div className={styles.workList}>
          {filteredWorks.length === 0 ? (
            <div className={styles.empty}>
              <p>No works match your filters.</p>
            </div>
          ) : (
            filteredWorks.map((work) => (
              <WorkCard key={work.slug} work={work} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

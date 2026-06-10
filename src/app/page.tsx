import { Suspense } from 'react';
import { getWorkSummaries } from '@/lib/works';
import {
  applyFilters,
  buildFilterOptions,
  buildSearchOptions,
} from '@/lib/filters';
import { FilterState } from '@/types';
import { buildShelves, buildFandomTiles } from '@/lib/shelves';
import { BrowseShell } from '@/components/BrowseShell';
import { BrowseHeader } from '@/components/BrowseHeader';
import { BrowseHome } from '@/components/BrowseHome';
import { BrowseSearchBar } from '@/components/BrowseSearchBar';
import styles from './browse.module.css';

interface PageProps {
  searchParams: Promise<{
    fandom?: string;
    relationship?: string;
    tag?: string;
    character?: string;
    rating?: string;
    status?: string;
    category?: string;
    language?: string;
    warning?: string;
    min_words?: string;
    max_words?: string;
    sort?: string;
    order?: string;
    q?: string;
    ex_fandom?: string;
    ex_relationship?: string;
    ex_tag?: string;
    ex_character?: string;
    ex_rating?: string;
    ex_status?: string;
    ex_category?: string;
    ex_warning?: string;
    date_preset?: string;
    date_from?: string;
    date_to?: string;
    preset?: string;
    /** Navigation source — used to show a back link ('characters') */
    from?: string;
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
    category: params.category,
    language: params.language,
    warning: params.warning,
    minWords: params.min_words ? Number(params.min_words) : undefined,
    maxWords: params.max_words ? Number(params.max_words) : undefined,
    sort: params.sort as FilterState['sort'],
    order: params.order as FilterState['order'],
    q: params.q,
    exFandom: params.ex_fandom,
    exRelationship: params.ex_relationship,
    exTag: params.ex_tag,
    exCharacter: params.ex_character,
    exRating: params.ex_rating,
    exStatus: params.ex_status,
    exCategory: params.ex_category,
    exWarning: params.ex_warning,
    datePreset: params.date_preset,
    dateFrom: params.date_from,
    dateTo: params.date_to,
  };

  const allWorks = getWorkSummaries();
  const filteredWorks = applyFilters(allWorks, filters);
  const filterOptions = buildFilterOptions(allWorks);
  const searchOptions = buildSearchOptions(allWorks);

  // Layer split: any filter, search, or sort param means the visitor has
  // expressed intent, so they get the full results surface (layer one).
  // A bare / gets the browse-first home (layer zero).
  const hasActiveFilters = !!(
    params.fandom || params.relationship || params.tag || params.character ||
    params.rating || params.status || params.q ||
    params.category || params.language || params.warning ||
    params.min_words || params.max_words ||
    params.ex_fandom || params.ex_relationship || params.ex_tag ||
    params.ex_character || params.ex_rating || params.ex_status ||
    params.ex_category || params.ex_warning ||
    params.date_preset || params.date_from || params.date_to ||
    params.preset || params.sort || params.order
  );

  return (
    <div className={styles.page}>
      {/* On the home, search lives in the nav. Results pages keep search in
          the sticky toolbar, so the nav slot stays empty there. */}
      <BrowseHeader
        search={
          !hasActiveFilters ? (
            <Suspense>
              <BrowseSearchBar options={searchOptions} />
            </Suspense>
          ) : undefined
        }
      />

      <main className={styles.main}>
        {/* Visually-hidden h1 for screen reader landmark — page title in nav serves as visible heading */}
        <h1 className="visually-hidden">Browse Works</h1>

        {!hasActiveFilters ? (
          <BrowseHome
            totalCount={allWorks.length}
            shelves={buildShelves(allWorks)}
            fandoms={buildFandomTiles(allWorks)}
            covers={Object.fromEntries(allWorks.map((w) => [w.slug, w.meta.cover]))}
          />
        ) : (
          <Suspense>
            <BrowseShell
              works={filteredWorks}
              options={filterOptions}
              searchOptions={searchOptions}
              currentFilters={params}
              totalCount={allWorks.length}
              filteredCount={filteredWorks.length}
              from={params.from}
            />
          </Suspense>
        )}
      </main>
    </div>
  );
}

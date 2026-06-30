import { Suspense } from 'react';
import { getWorkSummaries } from '@/lib/works';
import { applyFilters, buildFilterOptions, buildSearchOptions } from '@/lib/filters';
import { FilterState } from '@/types';
import { MOCK_LIBRARY, getTabSlugs, type LibraryTab } from '@/lib/library';
import { BrowseHeader } from '@/components/BrowseHeader';
import { LibraryShell } from '@/components/LibraryShell';
import styles from '../browse.module.css';

export const metadata = {
  title: 'Library — c.ai Fanfic',
};

interface PageProps {
  searchParams: Promise<{
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
  }>;
}

export default async function LibraryPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Determine active tab (default: continuing)
  const activeTab: LibraryTab =
    params.tab === 'bookmarked' || params.tab === 'completed' || params.tab === 'continuing'
      ? (params.tab as LibraryTab)
      : 'continuing';

  const allWorks = getWorkSummaries();

  // Tab counts (before client-side removals — removals handled in LibraryShell)
  const tabCounts = {
    continuing: MOCK_LIBRARY.continuing.length,
    bookmarked: MOCK_LIBRARY.bookmarked.length,
    completed: MOCK_LIBRARY.completed.length,
  };

  // Filter all works to just this tab's slugs
  const tabSlugs = new Set(getTabSlugs(activeTab));
  const tabWorks = allWorks.filter((w) => tabSlugs.has(w.slug));

  // Apply URL-driven filters within the tab's works
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

  const filteredWorks = applyFilters(tabWorks, filters);
  const filterOptions = buildFilterOptions(tabWorks);
  const searchOptions = buildSearchOptions(tabWorks);

  return (
    <div className={styles.page}>
      <BrowseHeader />
      <main id="main-content" className={styles.main}>
        <Suspense>
          <LibraryShell
            works={filteredWorks}
            tabCounts={tabCounts}
            activeTab={activeTab}
            options={filterOptions}
            searchOptions={searchOptions}
            currentFilters={params}
            totalCount={tabWorks.length}
            filteredCount={filteredWorks.length}
          />
        </Suspense>
      </main>
    </div>
  );
}

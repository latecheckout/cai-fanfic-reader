import { Suspense } from 'react';
import { getWorkSummaries, toClientWorks } from '@/lib/works';
import { applyFilters } from '@/lib/filters';
import { FilterState } from '@/types';
import {
  MOCK_LIBRARY,
  getTabSlugs,
  getLibraryTimestamps,
  LIBRARY_SORT_KEYS,
  LIBRARY_SORT_OPTIONS,
  type LibraryTab,
} from '@/lib/library';
import { SiteHeader } from '@/components/SiteHeader';
import { LibraryShell } from '@/components/LibraryShell';

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

  // Sort: default to the tab's first option ("Recently read"/"Recently
  // bookmarked"). Library-only keys (last_read/bookmarked_at) sort on the
  // user's activity timestamps AFTER applyFilters — they aren't work meta,
  // so applyFilters gets sort: undefined for them.
  const defaultSortKey = LIBRARY_SORT_OPTIONS[activeTab][0].value.split(':')[0];
  const sortKey = params.sort ?? defaultSortKey;
  const isLibrarySort = LIBRARY_SORT_KEYS.has(sortKey);

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
    sort: isLibrarySort ? undefined : (sortKey as FilterState['sort']),
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

  // Bookmarked tab: send the WHOLE archive filtered+sorted as one list — the
  // client subsets it to mock bookmarks + local reading-page saves, keeping
  // the ?sort order intact. @WIRE — collapses once /user/library exists.
  let filteredWorks =
    activeTab === 'bookmarked'
      ? applyFilters(allWorks, filters)
      : applyFilters(tabWorks, filters);

  if (isLibrarySort) {
    // Activity-timestamp sort. Slugs without a timestamp (e.g. local saves the
    // server can't see) rank newest — LibraryShell surfaces them client-side.
    const timestamps = getLibraryTimestamps(activeTab);
    const dir = params.order === 'asc' ? 1 : -1;
    filteredWorks = [...filteredWorks].sort(
      // MAX_SAFE_INTEGER (not Infinity): two missing slugs must compare 0, not NaN.
      (a, b) =>
        dir *
        ((timestamps.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
          (timestamps.get(b.slug) ?? Number.MAX_SAFE_INTEGER))
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="relative mx-auto max-w-[var(--browse-max-width)] px-6 pt-8 pb-[calc(128px+var(--safe-bottom))] max-md:px-4 max-md:pt-5">
        <Suspense>
          <LibraryShell
            works={toClientWorks(filteredWorks)}
            tabCounts={tabCounts}
            activeTab={activeTab}
            currentFilters={params}
          />
        </Suspense>
      </main>
    </div>
  );
}

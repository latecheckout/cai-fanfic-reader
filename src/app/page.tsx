import { Suspense } from 'react';
import { getWorkSummaries } from '@/lib/works';
import { applyFilters, buildSearchOptions } from '@/lib/filters';
import { FilterState } from '@/types';
import { buildShelves, buildCreators } from '@/lib/shelves';
import { BrowseShell } from '@/components/BrowseShell';
import { BrowseHeader } from '@/components/BrowseHeader';
import { BrowseHome } from '@/components/BrowseHome';

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
    <div className="min-h-screen">
      <BrowseHeader />

      <main className="relative mx-auto max-w-[var(--browse-max-width)] px-6 pt-8 pb-[calc(128px+var(--safe-bottom))] max-md:px-4 max-md:pt-5">
        {/* Visually-hidden h1 for screen reader landmark — page title in nav serves as visible heading */}
        <h1 className="visually-hidden">Browse Works</h1>

        {/* Editorial zone: only on the unfiltered Discover page. The global
            mode toggle restyles every card via html[data-mode]: visual =
            covers, text = AO3-style metadata cards. */}
        {!hasActiveFilters && (
          <>
            <BrowseHome
              shelves={buildShelves(allWorks)}
              creators={buildCreators(allWorks)}
              covers={Object.fromEntries(allWorks.map((w) => [w.slug, w.meta.cover]))}
            />
            <div className="mb-2">
              <h2 className="m-0 font-serif text-2xl font-medium tracking-[-0.01em] text-text max-md:text-[21px]">Stories for you 📚</h2>
              <p className="mt-[2px] font-sans text-[15px] text-secondary">The whole archive, ready to filter</p>
            </div>
          </>
        )}

        {/* The browse zone: search, sort, and filters live in its sticky
            toolbar. With filters active it is the entire page. */}
        <Suspense>
          <BrowseShell
            works={filteredWorks}
            searchOptions={searchOptions}
            currentFilters={params}
            filteredCount={filteredWorks.length}
            from={params.from}
          />
        </Suspense>
      </main>
    </div>
  );
}

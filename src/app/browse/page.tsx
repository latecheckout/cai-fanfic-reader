import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getWorkSummaries, toClientWorks } from '@/lib/works';
import { applyFilters, buildSearchOptions } from '@/lib/filters';
import { FilterState } from '@/types';
import { BrowseShell } from '@/components/BrowseShell';
import { SiteHeader } from '@/components/SiteHeader';
import { SectionHeader } from '@/components/RailSection';

export const metadata: Metadata = {
  title: 'Browse — c.ai Fanfic',
};

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

  return (
    <div className="min-h-screen">
      {/* The catalog owns its search (in the sticky toolbar below), so the
          header's global search bar is hidden here to avoid a duplicate. */}
      <SiteHeader showSearch={false} />

      <main className="relative mx-auto max-w-[var(--browse-max-width)] px-6 pt-8 pb-[calc(128px+var(--safe-bottom))] max-md:px-4 max-md:pt-5">
        {/* Visually-hidden h1 for screen reader landmark — the section header
            below serves as the visible heading */}
        <h1 className="visually-hidden">Browse Works</h1>

        <div className="mb-2">
          <SectionHeader title="Stories for you" subtitle="Every story in the archive" />
        </div>

        {/* The catalog surface: search, sort, and filters live in its sticky toolbar. */}
        <Suspense>
          <BrowseShell
            works={toClientWorks(filteredWorks)}
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

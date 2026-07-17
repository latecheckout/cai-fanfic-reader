import { Suspense } from 'react';
import { getWorkSummaries } from '@/lib/works';
import { buildSearchOptions } from '@/lib/filters';
import { BrowseHeader } from './BrowseHeader';
import { BrowseSearchBar } from './BrowseSearchBar';

/**
 * Server wrapper for the global site header: builds SearchOptions from the
 * full archive once per render and mounts the global search bar in the
 * header's search slot. Search always routes to /browse — the catalog.
 * BrowseSearchBar reads useSearchParams, so it needs a Suspense boundary
 * here rather than in every page.
 *
 * `showSearch={false}` — for pages that own their search surface (/browse
 * keeps it in the catalog's sticky toolbar).
 */
export function SiteHeader({ showSearch = true }: { showSearch?: boolean }) {
  if (!showSearch) return <BrowseHeader />;
  const options = buildSearchOptions(getWorkSummaries());
  return (
    <BrowseHeader
      search={
        <Suspense>
          <BrowseSearchBar options={options} basePath="/browse" collapsible />
        </Suspense>
      }
    />
  );
}

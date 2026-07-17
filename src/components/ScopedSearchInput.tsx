'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePendingParams } from '@/hooks/usePendingParams';
import { SEARCH_INPUT, SEARCH_ICON } from './searchChrome';
import { CloseIcon, MagnifierIcon } from './icons';

/**
 * Page-scoped text search — filters the current surface via its own `?q=`
 * param instead of jumping to the global catalog. The Library uses it to
 * search saved works ("Search your bookmarks") while global discovery stays
 * in the navbar. No vibe engine, no autocomplete, no presets: those are
 * catalog-discovery affordances (BrowseSearchBar).
 */
export function ScopedSearchInput({
  basePath,
  placeholder = 'Search…',
}: {
  basePath: string;
  placeholder?: string;
}) {
  const searchParams = useSearchParams();
  const { readParams, pushParams } = usePendingParams(basePath);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);

  // Keep the input in sync when the URL changes underneath us (pill clear,
  // back button) without clobbering in-progress typing on unrelated updates.
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  function submit(value: string) {
    const params = readParams();
    const q = value.trim();
    if (q) params.set('q', q);
    else params.delete('q');
    pushParams(params);
  }

  function clear() {
    setQuery('');
    if (urlQuery) submit('');
    inputRef.current?.focus();
  }

  return (
    <div className="group relative flex min-w-0 flex-1 items-center">
      <MagnifierIcon className={SEARCH_ICON} />

      <input
        ref={inputRef}
        type="text"
        className={`${SEARCH_INPUT} ${query ? 'pr-9' : 'pr-4'}`}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit(query);
          if (e.key === 'Escape') {
            if (query) clear();
            else inputRef.current?.blur();
          }
        }}
        aria-label={placeholder}
      />

      {/* Clear × — visible whenever there's a query */}
      {query && (
        <button
          className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center p-0 text-secondary opacity-[0.45] transition-[opacity,color] duration-150 ease-in-out hover:text-text hover:opacity-100"
          onMouseDown={(e) => {
            e.preventDefault();
            clear();
          }}
          aria-label="Clear search"
        >
          <CloseIcon width={20} height={20} />
        </button>
      )}
    </div>
  );
}

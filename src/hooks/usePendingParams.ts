'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * URL-mutation composition for filter surfaces. router.push is async, so
 * useSearchParams stays stale until the next render — mutators that each
 * rebuild from it last-write-win when fired close together (rapid pill
 * clicks, or a pill click racing an Enter in the search bar).
 *
 * `pending` holds the most recently pushed params and is MODULE-LEVEL so
 * every consumer (FilterPanel, BrowseSearchBar) composes against the same
 * in-flight value — the race is cross-component. It clears when its own URL
 * lands; the TTL guards the abandoned-push edge (a competing full navigation
 * wins and our URL never commits), bounding any staleness to one second —
 * far above real race windows (~1 frame) and below human re-engagement time.
 */
const PENDING_TTL_MS = 1000;
let pending: { params: URLSearchParams; at: number } | null = null;

export function usePendingParams(basePath: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  // Clear only when the landed URL matches the pending one — an earlier
  // queued navigation committing must not wipe a newer pending value.
  useEffect(() => {
    if (pending?.params.toString() === searchParams.toString()) pending = null;
  }, [searchParams]);

  /** Latest params: the in-flight push if one is live, else the committed URL. */
  const readParams = useCallback(() => {
    const live = pending && Date.now() - pending.at < PENDING_TTL_MS ? pending.params : null;
    return new URLSearchParams((live ?? searchParamsRef.current).toString());
  }, []);

  const pushParams = useCallback(
    (params: URLSearchParams) => {
      pending = { params, at: Date.now() };
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    },
    [router, basePath]
  );

  return { readParams, pushParams };
}

'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Brief skeleton flash when the active filters change (skipping the initial
 * mount). Shared by BrowseShell and LibraryShell, which used to carry
 * identical copies of this state machine.
 * @TODO-DEV — once content comes from an API, replace with a real
 * loading/fetch state (see SkeletonCard).
 */
export function useFilterFlash(currentFilters: unknown, ms = 450): boolean {
  const [isFiltering, setIsFiltering] = useState(false);
  const filterKey = JSON.stringify(currentFilters);
  const prevFilterKey = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevFilterKey.current = filterKey;
      return;
    }
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;

    setIsFiltering(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsFiltering(false), ms);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [filterKey, ms]);

  return isFiltering;
}

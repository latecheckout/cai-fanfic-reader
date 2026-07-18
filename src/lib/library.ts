// @DUMMY — MOCK_LIBRARY below simulates a logged-in user's reading state.
// @WIRE  — Replace with: GET /user/library (requires auth)
//          Wire point: src/app/reading/page.tsx (imports getTabSlugs).
//          Keep LibraryTab type + LIBRARY_REMOVED_KEY constant when replacing.
//          See: .claude/docs/wiring-guide.md#2-library--reading-state
// Mock user library data — simulates a logged-in user's reading state.
// In production this would come from a user API; for the prototype it's static.

import { SAVED_KEY } from './constants';
import type { SortOption } from '@/components/SortDropdown';

// lastRead / bookmarkedAt — mock user-activity timestamps (@DUMMY, become
// /user/library fields when wired). They back the library's per-tab default
// sorts ("Recently read" / "Recently bookmarked").
export const MOCK_LIBRARY = {
  continuing: [
    { slug: 'work-01', chapter: 3, lastRead: '2026-07-16T21:40:00Z' },
    { slug: 'work-05', chapter: 1, lastRead: '2026-07-10T08:15:00Z' },
    { slug: 'work-09', chapter: 2, lastRead: '2026-07-14T23:05:00Z' },
  ],
  bookmarked: [
    { slug: 'work-02', bookmarkedAt: '2026-06-28T17:00:00Z' },
    { slug: 'work-04', bookmarkedAt: '2026-07-12T12:30:00Z' },
    { slug: 'work-07', bookmarkedAt: '2026-05-19T09:45:00Z' },
    { slug: 'work-10', bookmarkedAt: '2026-07-17T19:20:00Z' },
    { slug: 'work-11', bookmarkedAt: '2026-07-02T14:10:00Z' },
  ],
  completed: [
    { slug: 'work-03', lastRead: '2026-06-30T22:00:00Z' },
    { slug: 'work-06', lastRead: '2026-07-15T20:30:00Z' },
    { slug: 'work-08', lastRead: '2026-05-25T11:00:00Z' },
  ],
} as const;

export type LibraryTab = keyof typeof MOCK_LIBRARY;

// ── Per-tab sort taxonomy (max 3 per tab, first entry = the tab's default).
//    Labels state the underlying field; `last_read`/`bookmarked_at` are
//    library-only keys sorted by the timestamps above (reading/page.tsx),
//    the rest are work-meta keys handled by applyFilters.
export const LIBRARY_SORT_OPTIONS: Record<LibraryTab, SortOption[]> = {
  continuing: [
    { value: 'last_read:desc', label: 'Recently read' },
    { value: 'updated:desc', label: 'Story updated' },
    { value: 'words:desc', label: 'Longest first' },
  ],
  bookmarked: [
    { value: 'bookmarked_at:desc', label: 'Recently bookmarked' },
    { value: 'updated:desc', label: 'Story updated' },
    { value: 'kudos:desc', label: 'Most kudos' },
  ],
  completed: [
    { value: 'last_read:desc', label: 'Recently read' },
    { value: 'updated:desc', label: 'Story updated' },
    { value: 'kudos:desc', label: 'Most kudos' },
  ],
};

/** Sort keys that live on library activity (not work meta). */
export const LIBRARY_SORT_KEYS = new Set(['last_read', 'bookmarked_at']);

/** slug → activity timestamp (ms) for a tab's library-only sort. */
export function getLibraryTimestamps(tab: LibraryTab): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of MOCK_LIBRARY[tab]) {
    const ts = 'lastRead' in item ? item.lastRead : 'bookmarkedAt' in item ? item.bookmarkedAt : undefined;
    if (ts) map.set(item.slug, Date.parse(ts));
  }
  return map;
}

/** localStorage key for removed bookmarks (Set of slugs user has unbookmarked) */
export const LIBRARY_REMOVED_KEY = 'cai_removed_bookmarks';

/** Returns the slugs for a given tab */
export function getTabSlugs(tab: LibraryTab): string[] {
  return MOCK_LIBRARY[tab].map((item) => item.slug);
}

/** Mock-bookmarked slugs as a Set (static — MOCK_LIBRARY never changes). */
export const MOCK_BOOKMARKED = new Set<string>(getTabSlugs('bookmarked'));

function readSlugList(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSlugList(key: string, slugs: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(slugs));
  } catch {
    // fail silently
  }
}

/** Reading-list additions made on the reading page (SAVED_KEY). */
export const readSavedSlugs = () => readSlugList(SAVED_KEY);
export const writeSavedSlugs = (slugs: string[]) => writeSlugList(SAVED_KEY, slugs);

/** Bookmarks the user removed in the library (only meaningful for mock entries). */
export const readRemovedSlugs = () => readSlugList(LIBRARY_REMOVED_KEY);
export const writeRemovedSlugs = (slugs: string[]) => writeSlugList(LIBRARY_REMOVED_KEY, slugs);

// ── Bookmark state — ONE logical value spread across three stores:
//    bookmarked(slug) = (SAVED ∪ MOCK_BOOKMARKED) − REMOVED.
//    Every mutation goes through the two functions below so no component
//    hand-rolls the two-key consistency dance.
//    @WIRE — these three functions become the /user/library API call sites.

export function isBookmarked(slug: string): boolean {
  if (readRemovedSlugs().includes(slug)) return false;
  return MOCK_BOOKMARKED.has(slug) || readSavedSlugs().includes(slug);
}

/** Flip a slug's bookmark state; returns the new state. */
export function toggleBookmark(slug: string): boolean {
  if (isBookmarked(slug)) {
    removeBookmark(slug);
    return false;
  }
  writeSavedSlugs([...readSavedSlugs().filter((s) => s !== slug), slug]);
  writeRemovedSlugs(readRemovedSlugs().filter((s) => s !== slug));
  return true;
}

export function removeBookmark(slug: string): void {
  writeSavedSlugs(readSavedSlugs().filter((s) => s !== slug));
  // Mock entries can't be deleted from the static data — mask them instead.
  if (MOCK_BOOKMARKED.has(slug)) {
    writeRemovedSlugs([...new Set([...readRemovedSlugs(), slug])]);
  }
}

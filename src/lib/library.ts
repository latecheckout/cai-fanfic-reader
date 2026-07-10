// @DUMMY — MOCK_LIBRARY below simulates a logged-in user's reading state.
// @WIRE  — Replace with: GET /user/library (requires auth)
//          Wire point: src/app/reading/page.tsx (imports getTabSlugs).
//          Keep LibraryTab type + LIBRARY_REMOVED_KEY constant when replacing.
//          See: .claude/docs/wiring-guide.md#2-library--reading-state
// Mock user library data — simulates a logged-in user's reading state.
// In production this would come from a user API; for the prototype it's static.

import { SAVED_KEY } from './constants';

export const MOCK_LIBRARY = {
  continuing: [
    { slug: 'work-01', chapter: 3 },
    { slug: 'work-05', chapter: 1 },
    { slug: 'work-09', chapter: 2 },
  ],
  bookmarked: [
    { slug: 'work-02' },
    { slug: 'work-04' },
    { slug: 'work-07' },
    { slug: 'work-10' },
    { slug: 'work-11' },
  ],
  completed: [
    { slug: 'work-03' },
    { slug: 'work-06' },
    { slug: 'work-08' },
  ],
} as const;

export type LibraryTab = keyof typeof MOCK_LIBRARY;

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

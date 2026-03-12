// @DUMMY — MOCK_LIBRARY below simulates a logged-in user's reading state.
// @WIRE  — Replace with: GET /user/library (requires auth)
//          Wire point: src/app/reading/page.tsx (imports getTabSlugs).
//          Keep LibraryTab type + LIBRARY_REMOVED_KEY constant when replacing.
//          See: .claude/docs/wiring-guide.md#2-library--reading-state
// Mock user library data — simulates a logged-in user's reading state.
// In production this would come from a user API; for the prototype it's static.

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

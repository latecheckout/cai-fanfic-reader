/**
 * Cover resolution. Works may declare an explicit `cover` in frontmatter; any work
 * without one falls back to a single shared generic cover. Resolution runs at load
 * time in works.ts so `meta.cover` is always populated for consumers.
 *
 * Kept separate from utils.ts (which is client-imported) — this is a load-time concern.
 */

export const GENERIC_COVER = '/covers/cover-generic.png';

/** Returns the work's explicit cover if set, else the shared generic fallback. */
export function resolveCover(cover?: string): string {
  return cover && cover.trim() ? cover : GENERIC_COVER;
}

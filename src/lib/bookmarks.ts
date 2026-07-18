// Reading-position bookmarks: one localStorage map (BOOKMARKS_KEY) keyed by
// work slug. Single read/patch surface so ChapterList (writer), the
// ReturnToPositionFAB and ContinueReadingSection (readers) can't drift on the
// entry shape. Same centralize-the-storage-idiom pattern as library.ts.
import { BOOKMARKS_KEY } from './constants';

export interface BookmarkEntry {
  scrollPercent?: number;
  furthestScrollPercent?: number;
  timestamp?: number;
  title?: string;
  activeChapterIndex?: number;
  totalChapters?: number;
}

export function readBookmarks(): Record<string, BookmarkEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function readBookmark(slug: string): BookmarkEntry | undefined {
  return readBookmarks()[slug];
}

/** Read-merge-write a single entry; fails silently like the other stores. */
export function patchBookmark(slug: string, patch: BookmarkEntry): void {
  try {
    const bookmarks = readBookmarks();
    bookmarks[slug] = { ...bookmarks[slug], ...patch };
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch {
    // fail silently
  }
}

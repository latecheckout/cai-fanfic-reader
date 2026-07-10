'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { ContinueCard, ContinueCardSkeleton } from './ContinueCard';
import { RailViewport } from './RailViewport';
import { ChevronRightIcon } from './icons';
import { BOOKMARKS_KEY } from '@/lib/constants';

interface Props {
  /** slug → cover path, passed from the page (localStorage bookmarks lack meta.cover). */
  covers?: Record<string, string | undefined>;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface Bookmark {
  slug: string;
  title: string;
  chapterIndex: number;
  totalChapters: number;
  scrollPercent: number;
  timestamp: number;
}

interface RawBookmark {
  scrollPercent: number;
  timestamp: number;
  title?: string;
  activeChapterIndex?: number;
  totalChapters?: number;
}

export function ContinueReadingSection({ covers }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loaded, setLoaded] = useState(false);

  useIsomorphicLayoutEffect(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      if (raw) {
        const data: Record<string, RawBookmark> = JSON.parse(raw);
        const items: Bookmark[] = Object.entries(data)
          .map(([slug, b]) => ({
            slug,
            title: b.title ?? slug,
            chapterIndex: b.activeChapterIndex ?? 0,
            totalChapters: b.totalChapters ?? 1,
            scrollPercent: b.scrollPercent ?? 0,
            timestamp: b.timestamp,
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 8);
        setBookmarks(items);
      }
    } catch {
      // Fail silently if localStorage is unavailable
    }
    setLoaded(true);
  }, []);

  // Confirmed empty after the read → render nothing.
  if (loaded && bookmarks.length === 0) return null;

  // Pre-hydration / pre-read: reserve the rail's height with skeletons. The
  // `pending` class is hidden via CSS unless <html data-has-reading> is set by
  // ThemeScript, so users with no reading list never see this flash. Once
  // loaded, the skeletons swap to real cards in place — no late push-down.
  const pending = !loaded;

  return (
    // Pre-hydration placeholder: reserve the rail's space only for users who
    // actually have a reading list (data-has-reading set by ThemeScript before
    // paint). Everyone else sees nothing — no flash, no late push-down.
    <section
      className={`mb-10 border-b border-border${pending ? ' hidden [html[data-has-reading]_&]:block' : ''}`}
    >
      {/* Section header band */}
      <div className="flex items-center justify-between py-3 border-b border-border">
        <span className="inline-flex items-center gap-2 font-mono text-[12px] font-medium tracking-[0.05em] text-secondary">
          Continue reading
          {!pending && (
            <span className="hidden rounded-full bg-overlay-soft px-2.5 py-1 font-normal leading-none tracking-normal md:inline-block">
              {bookmarks.length} in progress
            </span>
          )}
        </span>
        {!pending && (
          <span className="hidden items-center gap-2 font-mono text-[12px] text-secondary md:inline-flex">
            <a href="/reading" className="inline-flex items-center gap-1 text-inherit no-underline hover:underline hover:underline-offset-2 max-md:text-secondary max-md:opacity-70 max-md:hover:opacity-100">
              view reading list
              <ChevronRightIcon width={14} height={14} className="shrink-0" />
            </a>
          </span>
        )}
      </div>

      {/* Card rail — visual covers or text cards, by the global mode.
          cai-rail frames the scroller and carries the directional edge fades;
          RailViewport adds prev/next scroll arrows (in addition to swipe). The
          continue rail overrides the shared row's gap/padding/alignment. */}
      <RailViewport railClassName="cai-rail" rowClassName="cai-rail-row items-start! gap-[10px]! py-4!">
        {pending
          ? Array.from({ length: PENDING_SKELETONS }, (_, i) => (
              <ContinueCardSkeleton key={i} />
            ))
          : bookmarks.map((item) => (
              <ContinueCard key={item.slug} item={item} cover={covers?.[item.slug]} />
            ))}
      </RailViewport>
    </section>
  );
}

// Single-row rail height is constant, so a fixed skeleton count is enough to
// reserve the right vertical space; it just fills the visible width.
const PENDING_SKELETONS = 6;

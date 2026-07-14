'use client';

import { useState, useEffect } from 'react';
import { useReading } from '@/context/ReadingContext';
import { ratingClass, stripChapterPrefix } from '@/lib/utils';
import { BUBBLE_PILL } from './readingChrome';
import { ChevronDownIcon } from './icons';
import { ChapterPanel } from './ChapterPanel';
import { Popover } from './Popover';
import { ReturnToPositionFAB } from './ReturnToPositionFAB';

const PROGRESS_BG: Record<string, string> = {
  ratingG: 'bg-rating-g',
  ratingT: 'bg-rating-t',
  ratingM: 'bg-rating-m',
  ratingE: 'bg-rating-e',
  ratingNR: 'bg-rating-nr',
};

export function ReadingCluster() {
  const { workMeta, chapterTitles, totalChapters, activeChapterIndex, scrollToChapter } = useReading();
  const [scrollPct, setScrollPct] = useState(0);

  const rClass = ratingClass(workMeta.rating);

  // Scroll listener drives the chapter pill's progress bar. The cluster
  // itself is fixed to the viewport bottom.
  useEffect(() => {
    function onScroll() {
      const { scrollY, innerHeight } = window;
      const { scrollHeight } = document.documentElement;
      const pct = scrollHeight - innerHeight > 0 ? (scrollY / (scrollHeight - innerHeight)) * 100 : 0;
      setScrollPct(Math.min(100, Math.max(0, pct)));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keyboard: arrows navigate chapters
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        scrollToChapter(activeChapterIndex - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'k') {
        e.preventDefault();
        scrollToChapter(activeChapterIndex + 1);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeChapterIndex, scrollToChapter]);

  const rawChapterTitle = chapterTitles[activeChapterIndex] ?? '';
  const chapterTitle = stripChapterPrefix(rawChapterTitle);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-reading-cluster)] flex justify-center p-4 max-md:hidden">
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Chapter pill */}
        {totalChapters > 1 && (
          <div>
            <Popover
              align="center"
              side="top"
              ariaLabel="Chapter navigation"
              contentClassName="flex max-h-[70vh] w-full flex-col overflow-hidden"
              renderTrigger={({ open, toggle }) => (
                <button
                  onClick={toggle}
                  aria-label="Chapter navigation"
                  aria-expanded={open}
                  className={`${BUBBLE_PILL} relative min-w-0 max-w-[240px] gap-2 overflow-hidden px-4 ${open ? 'shadow-bubble-hover' : ''}`}
                >
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-secondary">{String(activeChapterIndex + 1).padStart(2, '0')}</span>
                  <span className="h-3.5 w-px shrink-0 bg-border-strong" aria-hidden="true" />
                  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[13px]">
                    {chapterTitle}
                  </span>
                  {/* Points up while closed (the panel opens upward), down while open. */}
                  <ChevronDownIcon
                    width={17}
                    height={17}
                    className={`shrink-0 text-secondary transition-transform duration-200 ${open ? '' : 'rotate-180'}`}
                  />
                  <span
                    className={`absolute bottom-0 left-0 h-[3px] rounded-none opacity-[0.38] transition-[width] duration-[120ms] ${PROGRESS_BG[rClass] ?? 'bg-secondary'}`}
                    style={{ width: `${scrollPct}%` }}
                    aria-hidden="true"
                  />
                </button>
              )}
            >
              {({ close }) => (
                <ChapterPanel
                  chapters={chapterTitles}
                  activeIndex={activeChapterIndex}
                  onSelect={(i) => { scrollToChapter(i); close(); }}
                />
              )}
            </Popover>
          </div>
        )}

        {/* "Your place" pill — returns to the furthest-read position */}
        <ReturnToPositionFAB />
      </div>
    </div>
  );
}

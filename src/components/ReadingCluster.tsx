'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useReading } from '@/context/ReadingContext';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { ratingClass, stripChapterPrefix, isTypingTarget } from '@/lib/utils';
import { BUBBLE_PILL } from './readingChrome';
import { ChevronDownIcon, InfoIcon } from './icons';
import { ChapterPanel } from './ChapterPanel';
import { StoryOverview } from './StoryOverview';
import { Popover } from './Popover';
import { Tooltip } from './Tooltip';
import { ReturnToPositionFAB } from './ReturnToPositionFAB';

// Sibling glide when the "Your place" pill mounts/unmounts.
const LAYOUT_SPRING = { type: 'spring', duration: 0.35, bounce: 0 } as const;

const PROGRESS_BG: Record<string, string> = {
  ratingG: 'bg-rating-g',
  ratingT: 'bg-rating-t',
  ratingM: 'bg-rating-m',
  ratingE: 'bg-rating-e',
  ratingNR: 'bg-rating-nr',
};

export function ReadingCluster() {
  const { workMeta, chapterTitles, totalChapters, activeChapterIndex, scrollToChapter } = useReading();
  // Drives the chapter pill's progress bar.
  const scrollPct = useScrollProgress();

  const rClass = ratingClass(workMeta.rating);

  // Keyboard: arrows navigate chapters
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (isTypingTarget(e)) return;
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
    /* Bottom pill cluster — one layout at every breakpoint. Panels open upward. */
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-reading-cluster)] flex justify-center p-4">
      <div className="pointer-events-auto flex min-w-0 max-w-full items-center gap-2">
        {/* `layout="position"` on the pill wrappers: when the "Your place" pill
            mounts or unmounts (popLayout), the siblings glide over instead of
            jumping — position-only so the pills translate without the scale
            squish plain `layout` applies. Spring (bounce 0) keeps it
            interruptible and natural. */}
        {/* Title pill — opens the story-overview panel */}
        <motion.div layout="position" transition={LAYOUT_SPRING} className="min-w-0 shrink">
        <Popover
          align="center"
          side="top"
          ariaLabel="Work details"
          contentClassName="flex max-h-[70dvh] w-[min(460px,calc(100vw-24px))] flex-col overflow-hidden"
          renderTrigger={({ open, toggle }) => (
            <Tooltip label="Story info" disabled={open}>
              {/* Collapses to a circular info bubble on mobile — same button,
                  CSS-only swap (SSR-safe, no media-query JS, one popover). */}
              <button
                onClick={toggle}
                aria-label="View work details"
                aria-expanded={open}
                aria-haspopup="dialog"
                className={`${BUBBLE_PILL} relative min-w-0 max-w-[220px] shrink gap-2 overflow-hidden px-4 max-md:w-11 max-md:shrink-0 max-md:justify-center max-md:px-0 ${open ? 'shadow-bubble-hover' : ''}`}
              >
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[13px] font-medium max-md:hidden">
                  {workMeta.title}
                </span>
                <ChevronDownIcon
                  width={17}
                  height={17}
                  className={`shrink-0 text-secondary transition-transform duration-200 max-md:hidden ${open ? '' : 'rotate-180'}`}
                />
                <InfoIcon
                  width={20}
                  height={20}
                  className={`hidden shrink-0 transition-opacity max-md:block ${open ? 'opacity-100' : 'opacity-55'}`}
                />
              </button>
            </Tooltip>
          )}
        >
          <StoryOverview />
        </Popover>
        </motion.div>

        {/* Chapter pill */}
        {totalChapters > 1 && (
          <motion.div layout="position" transition={LAYOUT_SPRING} className="min-w-0">
            <Popover
              align="center"
              side="top"
              ariaLabel="Chapter navigation"
              contentClassName="flex max-h-[70dvh] w-full flex-col overflow-hidden"
              renderTrigger={({ open, toggle }) => (
                <Tooltip label="Chapters" disabled={open}>
                <button
                  onClick={toggle}
                  aria-label="Chapter navigation"
                  aria-expanded={open}
                  aria-haspopup="dialog"
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
                </Tooltip>
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
          </motion.div>
        )}

        {/* "Your place" pill — returns to the furthest-read position */}
        <ReturnToPositionFAB />
      </div>
    </div>
  );
}

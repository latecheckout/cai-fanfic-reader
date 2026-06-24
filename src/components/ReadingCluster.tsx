'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReading } from '@/context/ReadingContext';
import { ratingClass, stripChapterPrefix } from '@/lib/utils';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { BUBBLE_PILL } from './readingChrome';
import { MetadataOverlay } from './MetadataOverlay';
import { ChapterPanel } from './ChapterPanel';
import { Popover } from './Popover';

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
  const [isSticky, setIsSticky] = useState(false);

  const clusterRef = useRef<HTMLDivElement>(null);
  const naturalTopRef = useRef<number | null>(null);

  const rClass = ratingClass(workMeta.rating);

  useEffect(() => {
    if (clusterRef.current) {
      naturalTopRef.current = clusterRef.current.getBoundingClientRect().top + window.scrollY;
    }
  }, []);

  // One scroll listener: sticky detection (reveals title) + progress bar
  useEffect(() => {
    function onScroll() {
      if (naturalTopRef.current !== null) {
        setIsSticky(window.scrollY >= naturalTopRef.current - 16);
      }
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
    <div
      ref={clusterRef}
      className="pointer-events-none sticky top-0 z-[var(--z-reading-cluster)] flex justify-center p-4 max-md:hidden"
    >
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Title pill — mounts to the LEFT of the chapter pill once sticky.
            Only the chapter pill carries `layout` (it reflows/slides); the
            title just enters with its own animation, so the two don't compete
            on the main thread at mount. */}
        <AnimatePresence initial={false}>
          {isSticky && (
            <motion.div
              key="title"
              initial={{ opacity: 0, scale: 0.9, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 8 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
            >
              <Popover
                align="center"
                ariaLabel="Work details"
                contentClassName="flex max-h-[70vh] w-[360px] flex-col overflow-hidden"
                renderTrigger={({ open, toggle }) => (
                  <button
                    onClick={toggle}
                    aria-label="View work details"
                    aria-expanded={open}
                    className={`${BUBBLE_PILL} max-w-[190px] overflow-hidden px-4 ${open ? 'shadow-bubble-hover' : ''}`}
                  >
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[13px] font-medium">
                      {workMeta.title}
                    </span>
                  </button>
                )}
              >
                <MetadataOverlay />
              </Popover>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chapter pill — `layout` slides it over as the title mounts/unmounts */}
        {totalChapters > 1 && (
          <motion.div layout transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}>
            <Popover
              align="center"
              ariaLabel="Chapter navigation"
              contentClassName="flex max-h-[70vh] w-full flex-col overflow-hidden"
              renderTrigger={({ open, toggle }) => (
                <button
                  onClick={toggle}
                  aria-label="Chapter navigation"
                  aria-expanded={open}
                  className={`${BUBBLE_PILL} relative min-w-0 max-w-[240px] gap-2 overflow-hidden px-4 ${open ? 'shadow-bubble-hover' : ''}`}
                >
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-secondary">{activeChapterIndex + 1}</span>
                  <span className="h-3.5 w-px shrink-0 bg-border-strong" aria-hidden="true" />
                  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[13px]">
                    {chapterTitle}
                  </span>
                  <svg
                    className={`shrink-0 text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
                  >
                    <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
          </motion.div>
        )}
      </div>
    </div>
  );
}

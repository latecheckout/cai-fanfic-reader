'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Chapter, WorkMeta, WorkSummary } from '@/types';
import { ChapterContent } from './ChapterContent';
import { ChapterBreak } from './ChapterBreak';
import { ChapterComments } from './ChapterComments';
import { EndOfStory } from './EndOfStory';
import { KudosSection } from './KudosSection';
import { useReading } from '@/context/ReadingContext';
import { BOOKMARKS_KEY } from '@/lib/constants';

interface Props {
  chapters: Chapter[];
  chapterHtmls: string[];
  recommendations: WorkSummary[];
  workMeta: WorkMeta;
}

// How far from the top of the viewport to consider a chapter "active"
const HUD_OFFSET = 90;

const CHAPTER = 'mx-auto max-w-[var(--reader-line-width)] px-6 pt-8 max-md:px-4';

export function ChapterList({ chapters, chapterHtmls, recommendations, workMeta }: Props) {
  const { setActiveChapterIndex, registerChapter, slug, totalChapters, setLastReadChapterIndex, lastReadChapterIndex, chapterTitles, scrollToChapter } = useReading();
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didRestoreRef = useRef(false);
  const activeRef = useRef(0);
  const furthestPctRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [flashChapter, setFlashChapter] = useState<number | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore scroll position on mount; also load furthest position for marker
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      if (raw) {
        const bookmarks = JSON.parse(raw);
        const saved = bookmarks[slug];
        if (saved) {
          if (typeof saved.scrollPercent === 'number' && saved.scrollPercent > 0) {
            const target =
              saved.scrollPercent * (document.documentElement.scrollHeight - window.innerHeight);
            requestAnimationFrame(() => {
              window.scrollTo({ top: target, behavior: 'instant' });
            });
          }
          if (typeof saved.furthestScrollPercent === 'number') {
            furthestPctRef.current = saved.furthestScrollPercent;
          }
          if (typeof saved.activeChapterIndex === 'number') {
            setLastReadChapterIndex(saved.activeChapterIndex);
          }
        }
      }
    } catch {
      // Fail silently
    }
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll-based active chapter detection
  const updateActiveChapter = useCallback(() => {
    const refs = sectionRefs.current;
    let active = 0;
    for (let i = 0; i < refs.length; i++) {
      const el = refs[i];
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top <= HUD_OFFSET) {
        active = i;
      } else {
        break;
      }
    }
    if (active !== activeRef.current) {
      activeRef.current = active;
      setActiveChapterIndex(active);
      history.replaceState(null, '', `#chapter-${active}`);
    }
  }, [setActiveChapterIndex]);

  useEffect(() => {
    if (chapters.length === 0) return;
    window.addEventListener('scroll', updateActiveChapter, { passive: true });
    updateActiveChapter();
    return () => window.removeEventListener('scroll', updateActiveChapter);
  }, [chapters.length, updateActiveChapter]);

  // Save scroll position (debounced) + track furthest position
  const saveScrollPosition = useCallback(() => {
    if (scrollSaveTimerRef.current) clearTimeout(scrollSaveTimerRef.current);
    scrollSaveTimerRef.current = setTimeout(() => {
      try {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) return;
        const scrollPct = window.scrollY / maxScroll;
        const newFurthest = Math.max(furthestPctRef.current, scrollPct);
        furthestPctRef.current = newFurthest;

        const raw = localStorage.getItem(BOOKMARKS_KEY);
        const bookmarks = raw ? JSON.parse(raw) : {};
        bookmarks[slug] = {
          ...bookmarks[slug],
          scrollPercent: scrollPct,
          furthestScrollPercent: newFurthest,
          timestamp: Date.now(),
          title: workMeta.title,
          activeChapterIndex: activeRef.current,
          totalChapters,
        };
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      } catch {
        // Fail silently
      }
    }, 300);
  }, [slug, workMeta.title, totalChapters]);

  useEffect(() => {
    window.addEventListener('scroll', saveScrollPosition, { passive: true });
    return () => {
      window.removeEventListener('scroll', saveScrollPosition);
      if (scrollSaveTimerRef.current) clearTimeout(scrollSaveTimerRef.current);
    };
  }, [saveScrollPosition]);

  // Swipe left/right to jump chapters (mobile)
  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
    function onTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
      if (Math.abs(dx) > 50 && dy < 40) {
        const current = activeRef.current;
        if (dx < 0 && current < totalChapters - 1) {
          const next = current + 1;
          scrollToChapter(next);
          showFlash(next);
        } else if (dx > 0 && current > 0) {
          const prev = current - 1;
          scrollToChapter(prev);
          showFlash(prev);
        }
      }
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [totalChapters, scrollToChapter]); // eslint-disable-line react-hooks/exhaustive-deps

  function showFlash(idx: number) {
    setFlashChapter(idx);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlashChapter(null), 1500);
  }

  const setRef = useCallback(
    (i: number) => (el: HTMLElement | null) => {
      sectionRefs.current[i] = el;
      registerChapter(i, el);
    },
    [registerChapter]
  );

  return (
    <>
      {/* Chapter flash toast — shown briefly after swipe navigation */}
      <div
        className={`fixed left-1/2 top-[calc(16px+var(--safe-top))] z-[var(--z-panel)] -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-bubble px-4 py-1.5 font-sans text-[13px] text-secondary shadow-bubble transition-opacity duration-200 pointer-events-none ${flashChapter !== null ? 'opacity-100' : 'opacity-0'}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {flashChapter !== null && (
          <>Ch. {flashChapter + 1}{chapterTitles[flashChapter] ? `: ${chapterTitles[flashChapter]}` : ''}</>
        )}
      </div>
      <div
        ref={listRef}
        className="prose-outer relative motion-safe:animate-[fadeIn_800ms_var(--ease-out-expo)_300ms_both]"
      >
        {chapters.map((chapter, i) => (
          <div key={i}>
            <section
              id={`chapter-${i}`}
              ref={setRef(i)}
              className={CHAPTER}
              aria-label={chapter.title || `Chapter ${i + 1}`}
            >
              {/* In-flow "you left off here" banner — only for chapters after the first */}
              {lastReadChapterIndex !== null && i === lastReadChapterIndex && i > 0 && (
                <div className="pointer-events-none flex items-center gap-3 pb-6 pt-5" aria-hidden="true">
                  <span className="h-px flex-1 bg-secondary opacity-20" />
                  <span className="shrink-0 whitespace-nowrap font-mono text-[9px] tracking-[0.1em] text-secondary opacity-[0.45]">
                    · you left off here ·
                  </span>
                  <span className="h-px flex-1 bg-secondary opacity-20" />
                </div>
              )}
              <ChapterContent
                chapter={chapter}
                chapterHtml={chapterHtmls[i]}
                totalChapters={chapters.length}
                author={workMeta.author}
                workTitle={workMeta.title}
              />
            </section>

            {/* End of chapter label — above the comments zone for multi-chapter works */}
            {chapters.length > 1 && (
              <div
                className="mx-auto mt-14 max-w-[var(--reader-line-width)] px-6 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-secondary opacity-[0.45] max-md:px-4"
                aria-hidden="true"
              >
                END OF CHAPTER {i + 1}
              </div>
            )}

            {/* Comments after each chapter */}
            <ChapterComments slug={slug} chapterIndex={i} />

            {/* Kudos section after the last chapter's comments */}
            {i === chapters.length - 1 && (
              <KudosSection slug={slug} totalKudos={workMeta.kudos} />
            )}

            {/* Chapter break before next chapter */}
            {i < chapters.length - 1 && <ChapterBreak chapterNumber={i + 1} />}
          </div>
        ))}

        <EndOfStory slug={slug} recommendations={recommendations} />
      </div>
    </>
  );
}

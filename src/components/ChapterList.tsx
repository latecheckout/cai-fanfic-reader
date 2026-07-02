'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Chapter, WorkMeta, WorkSummary } from '@/types';
import { ChapterContent } from './ChapterContent';
import { ChapterBreak } from './ChapterBreak';
import { ChapterComments } from './ChapterComments';
import { EndOfStory } from './EndOfStory';
import { KudosSection } from './KudosSection';
import { useReading } from '@/context/ReadingContext';
import styles from '@/styles/components/ChapterList.module.css';

interface Props {
  chapters: Chapter[];
  chapterHtmls: string[];
  recommendations: WorkSummary[];
  workMeta: WorkMeta;
}

// How far from the top of the viewport to consider a chapter "active"
const HUD_OFFSET = 90;

export function ChapterList({ chapters, chapterHtmls, recommendations, workMeta }: Props) {
  const { setActiveChapterIndex, registerChapter, slug, totalChapters, setLastReadChapterIndex, lastReadChapterIndex, activeChapterIndex, chapterTitles, scrollToChapter } = useReading();
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
      const raw = localStorage.getItem('fanfic-bookmarks');
      if (raw) {
        const bookmarks = JSON.parse(raw);
        const saved = bookmarks[slug];
        if (saved) {
          // Restore last position
          if (typeof saved.scrollPercent === 'number' && saved.scrollPercent > 0) {
            const target =
              saved.scrollPercent *
              (document.documentElement.scrollHeight - window.innerHeight);
            requestAnimationFrame(() => {
              window.scrollTo({ top: target, behavior: 'instant' });
            });
          }
          // Store furthest for tracking
          if (typeof saved.furthestScrollPercent === 'number') {
            furthestPctRef.current = saved.furthestScrollPercent;
          }
          // Track last-read chapter for the inline banner
          if (typeof saved.activeChapterIndex === 'number') {
            setLastReadChapterIndex(saved.activeChapterIndex);
          }
        }
      }
    } catch {
      // Fail silently
    }
  }, [slug]);

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

        // Furthest only moves forward
        const newFurthest = Math.max(furthestPctRef.current, scrollPct);
        furthestPctRef.current = newFurthest;

        const raw = localStorage.getItem('fanfic-bookmarks');
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
        localStorage.setItem('fanfic-bookmarks', JSON.stringify(bookmarks));
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
  }, [totalChapters, scrollToChapter]);

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
    <div className={`${styles.chapterFlash} ${flashChapter !== null ? styles.chapterFlashVisible : ''}`} aria-live="polite" aria-atomic="true">
      {flashChapter !== null && (
        <>Ch. {flashChapter + 1}{chapterTitles[flashChapter] ? `: ${chapterTitles[flashChapter]}` : ''}</>
      )}
    </div>
    <div ref={listRef} className={`${styles.list} prose-outer`}>
      {chapters.map((chapter, i) => (
        <div key={i}>
          {/* Not a labelled <section>: naming it would make every chapter a
              landmark region AND duplicate the chapter <h2> inside it (region +
              heading announce the same title). The h2 gives heading-rotor nav. */}
          <section
            id={`chapter-${i}`}
            ref={setRef(i)}
            className={styles.chapter}
          >
            {/* In-flow "you left off here" banner — only for chapters after the first */}
            {lastReadChapterIndex !== null && i === lastReadChapterIndex && i > 0 && (
              <div className={styles.lastReadBanner} aria-hidden="true">
                <span className={styles.lastReadLabel}>· you left off here ·</span>
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

          {/* End of chapter label — appears above the comments zone for multi-chapter works */}
          {chapters.length > 1 && (
            <div className={styles.chapterEndLabel} aria-hidden="true">
              END OF CHAPTER {i + 1}
            </div>
          )}

          {/* Comments after each chapter */}
          <ChapterComments
            slug={slug}
            chapterIndex={i}
          />

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

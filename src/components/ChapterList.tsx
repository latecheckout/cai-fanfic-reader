'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Chapter, WorkSummary } from '@/types';
import { ChapterContent } from './ChapterContent';
import { ChapterBreak } from './ChapterBreak';
import { EndOfStory } from './EndOfStory';
import { useReading } from '@/context/ReadingContext';
import styles from '@/styles/components/ChapterList.module.css';

interface Props {
  chapters: Chapter[];
  chapterHtmls: string[];
  recommendations: WorkSummary[];
}

// How far from the top of the viewport to consider a chapter "active"
const HUD_OFFSET = 90;

export function ChapterList({ chapters, chapterHtmls, recommendations }: Props) {
  const { setActiveChapterIndex, registerChapter, slug, workMeta, totalChapters } = useReading();
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didRestoreRef = useRef(false);
  const activeRef = useRef(0);

  // Restore scroll position on mount
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;
    try {
      const raw = localStorage.getItem('fanfic-bookmarks');
      if (raw) {
        const bookmarks = JSON.parse(raw);
        const saved = bookmarks[slug];
        if (saved && typeof saved.scrollPercent === 'number' && saved.scrollPercent > 0) {
          const target =
            saved.scrollPercent *
            (document.documentElement.scrollHeight - window.innerHeight);
          requestAnimationFrame(() => {
            window.scrollTo({ top: target, behavior: 'instant' });
          });
        }
      }
    } catch {
      // Fail silently
    }
  }, [slug]);

  // Scroll-based active chapter detection — reliable for any chapter length
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
        break; // sections are in order, stop early
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
    updateActiveChapter(); // run once on mount
    return () => window.removeEventListener('scroll', updateActiveChapter);
  }, [chapters.length, updateActiveChapter]);

  // Save scroll position (debounced)
  const saveScrollPosition = useCallback(() => {
    if (scrollSaveTimerRef.current) clearTimeout(scrollSaveTimerRef.current);
    scrollSaveTimerRef.current = setTimeout(() => {
      try {
        const scrollPct =
          window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight);
        const raw = localStorage.getItem('fanfic-bookmarks');
        const bookmarks = raw ? JSON.parse(raw) : {};
        bookmarks[slug] = {
          ...bookmarks[slug],
          scrollPercent: scrollPct,
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
  }, [slug]);

  useEffect(() => {
    window.addEventListener('scroll', saveScrollPosition, { passive: true });
    return () => {
      window.removeEventListener('scroll', saveScrollPosition);
      if (scrollSaveTimerRef.current) clearTimeout(scrollSaveTimerRef.current);
    };
  }, [saveScrollPosition]);

  const setRef = useCallback(
    (i: number) => (el: HTMLElement | null) => {
      sectionRefs.current[i] = el;
      registerChapter(i, el);
    },
    [registerChapter]
  );

  return (
    <div className={`${styles.list} prose-outer`}>
      {chapters.map((chapter, i) => (
        <div key={i}>
          <section
            id={`chapter-${i}`}
            ref={setRef(i)}
            className={styles.chapter}
            aria-label={chapter.title || `Chapter ${i + 1}`}
          >
            <ChapterContent
              chapter={chapter}
              chapterHtml={chapterHtmls[i]}
              totalChapters={chapters.length}
            />
          </section>

          {i < chapters.length - 1 && <ChapterBreak />}
        </div>
      ))}

      <EndOfStory slug={slug} recommendations={recommendations} />
    </div>
  );
}

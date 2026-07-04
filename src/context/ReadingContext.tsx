'use client';

import { createContext, useContext, useRef, useCallback, useState, useEffect } from 'react';
import { WorkMeta } from '@/types';
import { THEME_KEY } from '@/lib/constants';

interface ReadingContextValue {
  activeChapterIndex: number;
  setActiveChapterIndex: (i: number) => void;
  workMeta: WorkMeta;
  chapterTitles: string[];
  totalChapters: number;
  /** Register a chapter section DOM element by index. ChapterList calls this. */
  registerChapter: (i: number, el: HTMLElement | null) => void;
  scrollToChapter: (i: number) => void;
  slug: string;

  // ── Last read position — set by ChapterList on mount ──────────────────────
  lastReadChapterIndex: number | null;
  setLastReadChapterIndex: (i: number | null) => void;
}

const ReadingContext = createContext<ReadingContextValue | null>(null);

interface Props {
  workMeta: WorkMeta;
  chapterTitles: string[];
  totalChapters: number;
  slug: string;
  children: React.ReactNode;
}

export function ReadingProvider({
  workMeta,
  chapterTitles,
  totalChapters,
  slug,
  children,
}: Props) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [lastReadChapterIndex, setLastReadChapterIndex] = useState<number | null>(null);

  // Ensure data-theme is always a recognized value on reading page mount.
  // ThemeScript handles initial load, but something can clobber it after paint
  // when no user preference is stored. This guard mirrors ThemeScript's fallback logic.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (!saved || saved === 'default') {
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', saved);
      }
    } catch { /* fail silently */ }
  }, []);
  const chapterRefsMap = useRef<Map<number, HTMLElement>>(new Map());

  const registerChapter = useCallback((i: number, el: HTMLElement | null) => {
    if (el) {
      chapterRefsMap.current.set(i, el);
    } else {
      chapterRefsMap.current.delete(i);
    }
  }, []);

  const scrollToChapter = useCallback((i: number) => {
    if (i < 0 || i >= totalChapters) return;
    const el = chapterRefsMap.current.get(i);
    if (el) {
      // Offset for HUD (top: 24px + ~36px bubble height + some breathing room)
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [totalChapters]);

  return (
    <ReadingContext.Provider
      value={{
        activeChapterIndex,
        setActiveChapterIndex,
        workMeta,
        chapterTitles,
        totalChapters,
        registerChapter,
        scrollToChapter,
        slug,
        lastReadChapterIndex,
        setLastReadChapterIndex,
      }}
    >
      {children}
    </ReadingContext.Provider>
  );
}

export function useReading() {
  const ctx = useContext(ReadingContext);
  if (!ctx) throw new Error('useReading must be used inside ReadingProvider');
  return ctx;
}

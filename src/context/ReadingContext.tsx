'use client';

import { createContext, useContext, useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { WorkMeta } from '@/types';
import { THEME_KEY } from '@/lib/constants';

// Reading state is split in two contexts so UI-surface toggles (hub/chat/
// imagine) don't re-render heavy data consumers like ChapterList, and vice
// versa (activeChapterIndex updates while scrolling). Both values are
// memoized — one provider render only invalidates the context that changed.

interface ReadingDataValue {
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

export interface ChatSeed {
  quote: string;
  chapterIndex: number;
}

interface ReadingUIValue {
  // ── Fandom hub sidebar — toggle lives in the HUD, panel is a sibling ──────
  hubOpen: boolean;
  setHubOpen: (v: boolean) => void;

  // ── Character chat modal — entry points (hub, SelectionToolbar) and the
  //    modal are siblings; the seed carries a highlighted quote, one-shot. ───
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  chatSeed: ChatSeed | null;
  setChatSeed: (s: ChatSeed | null) => void;

  // ── Imagine modal — shares the bottom-right corner with chat (mutually
  //    exclusive; entry points close the other surface). Same seed shape. ───
  imagineOpen: boolean;
  setImagineOpen: (v: boolean) => void;
  imagineSeed: ChatSeed | null;
  setImagineSeed: (s: ChatSeed | null) => void;
}

const ReadingDataContext = createContext<ReadingDataValue | null>(null);
const ReadingUIContext = createContext<ReadingUIValue | null>(null);

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
  const [hubOpen, setHubOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSeed, setChatSeed] = useState<ChatSeed | null>(null);
  const [imagineOpen, setImagineOpen] = useState(false);
  const [imagineSeed, setImagineSeed] = useState<ChatSeed | null>(null);

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

  const dataValue = useMemo<ReadingDataValue>(
    () => ({
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
    }),
    [activeChapterIndex, workMeta, chapterTitles, totalChapters, registerChapter, scrollToChapter, slug, lastReadChapterIndex]
  );

  const uiValue = useMemo<ReadingUIValue>(
    () => ({
      hubOpen,
      setHubOpen,
      chatOpen,
      setChatOpen,
      chatSeed,
      setChatSeed,
      imagineOpen,
      setImagineOpen,
      imagineSeed,
      setImagineSeed,
    }),
    [hubOpen, chatOpen, chatSeed, imagineOpen, imagineSeed]
  );

  return (
    <ReadingDataContext.Provider value={dataValue}>
      <ReadingUIContext.Provider value={uiValue}>{children}</ReadingUIContext.Provider>
    </ReadingDataContext.Provider>
  );
}

/** Reading data: work meta, chapter position/navigation. */
export function useReading() {
  const ctx = useContext(ReadingDataContext);
  if (!ctx) throw new Error('useReading must be used inside ReadingProvider');
  return ctx;
}

/** Reading UI surfaces: hub sidebar, chat + imagine modals and their seeds. */
export function useReadingUI() {
  const ctx = useContext(ReadingUIContext);
  if (!ctx) throw new Error('useReadingUI must be used inside ReadingProvider');
  return ctx;
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useReading } from '@/context/ReadingContext';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { PrefsPanel } from './PrefsPanel';

const PILL = 'flex h-11 shrink-0 items-center justify-center rounded-full border border-border bg-bubble shadow-bubble transition-colors';
const ICON_PILL = `${PILL} w-11 text-secondary hover:text-text`;
// Scrim stays a fixed dark wash in every theme (a light scrim would read wrong in dark).
const SHEET_OVERLAY = 'fixed inset-0 z-[var(--z-modal)] flex flex-col justify-end bg-black/40';
const SHEET = 'rounded-t-2xl bg-bg pb-[var(--safe-bottom)]';

export function MobileReadingBar() {
  const { activeChapterIndex, totalChapters, chapterTitles, scrollToChapter } = useReading();
  const [chapterSheetOpen, setChapterSheetOpen] = useState(false);
  const [prefsSheetOpen, setPrefsSheetOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (prefsSheetOpen) { setPrefsSheetOpen(false); return; }
        if (chapterSheetOpen) { setChapterSheetOpen(false); return; }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [chapterSheetOpen, prefsSheetOpen]);

  const chapterLabel = chapterTitles[activeChapterIndex]
    ? `Ch. ${activeChapterIndex + 1} / ${totalChapters} — ${chapterTitles[activeChapterIndex]}`
    : `Ch. ${activeChapterIndex + 1} / ${totalChapters}`;
  const truncated = chapterLabel.length > 38 ? chapterLabel.slice(0, 38) + '…' : chapterLabel;

  const sheetMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { duration: 0.24, ease: EASE_OUT_EXPO } };

  return (
    <>
      {/* Chapter list sheet */}
      <AnimatePresence>
        {chapterSheetOpen && (
          <motion.div
            className={SHEET_OVERLAY}
            onClick={() => setChapterSheetOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`${SHEET} flex max-h-[60vh] flex-col`}
              onClick={(e) => e.stopPropagation()}
              {...sheetMotion}
            >
              <div className="mx-auto mt-3 h-1 w-8 shrink-0 rounded-[2px] bg-border-strong" aria-hidden="true" />
              <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
                <span className="font-sans text-[13px] font-medium text-text">Chapters</span>
                <button
                  className="-mr-2.5 flex h-11 w-11 items-center justify-center text-secondary transition-colors hover:text-text"
                  onClick={() => setChapterSheetOpen(false)}
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                {chapterTitles.map((title, i) => (
                  <button
                    key={i}
                    className={`flex w-full items-baseline gap-3 border-b border-border px-5 py-[14px] text-left font-sans text-[14px] transition-colors last:border-b-0 active:bg-overlay-soft ${i === activeChapterIndex ? 'text-text' : 'text-secondary'}`}
                    onClick={() => { scrollToChapter(i); setChapterSheetOpen(false); }}
                  >
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-secondary">Ch. {i + 1}</span>
                    {title && <span className="overflow-hidden text-ellipsis whitespace-nowrap">{title}</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prefs sheet */}
      <AnimatePresence>
        {prefsSheetOpen && (
          <motion.div
            className={SHEET_OVERLAY}
            onClick={() => setPrefsSheetOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`${SHEET} max-h-[80vh] overflow-y-auto [-webkit-overflow-scrolling:touch]`}
              onClick={(e) => e.stopPropagation()}
              {...sheetMotion}
            >
              <div className="mx-auto mt-3 h-1 w-8 shrink-0 rounded-[2px] bg-border-strong" aria-hidden="true" />
              <div className="px-4 pb-4 pt-2">
                <PrefsPanel />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-[calc(20px+var(--safe-bottom))] left-1/2 z-[var(--z-reading-bar)] hidden -translate-x-1/2 items-center gap-1.5 max-md:flex">
        <a href="/" className={`${ICON_PILL} no-underline`} aria-label="Back to works">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
            <path d="M6.5 1.5L1.5 7L6.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <button
          className={`${PILL} min-w-[120px] max-w-[200px] px-4 text-text hover:bg-[color-mix(in_srgb,var(--text)_6%,var(--bubble-bg))]`}
          onClick={() => setChapterSheetOpen((v) => !v)}
          aria-label="Chapter navigation"
        >
          <span className="overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[12px] text-secondary">
            {totalChapters > 1 ? truncated : 'Reading'}
          </span>
        </button>

        <button className={ICON_PILL} onClick={() => setPrefsSheetOpen((v) => !v)} aria-label="Reading preferences">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 4h2.5M6.5 4H15M1 8h6.5M10.5 8H15M1 12h2.5M6.5 12H15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="4.5" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="9" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="4.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
    </>
  );
}

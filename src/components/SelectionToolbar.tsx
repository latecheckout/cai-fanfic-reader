'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { CHAT_CHARACTERS } from '@/lib/chatCharacters';
import { EASE_SPRING_OUT } from '@/lib/motion';
import { useSelectionAnchor } from '@/hooks/useSelectionAnchor';
import { useChatCharacter } from '@/hooks/useChatCharacter';
import { useReading, useReadingUI } from '@/context/ReadingContext';
import { CheckIcon } from './icons';

const SPRING = { duration: 0.26, ease: EASE_SPRING_OUT };
// Keep the toolbar at least this far from the viewport edges.
const EDGE_MARGIN = 8;
// Half-width used before the real toolbar has been measured (first paint only).
const FALLBACK_HALF_WIDTH = 160;

/**
 * Floating toolbar shown over a text selection inside a chapter (ChatGPT-style).
 * Left: a swappable character avatar + "Chat about this". Right: "Imagine"
 * (placeholder). Only the character swap is functional this pass.
 *
 * Selection tracking lives in useSelectionAnchor; character persistence in
 * useChatCharacter. This component owns rendering and on-screen clamping.
 */
export function SelectionToolbar() {
  const [mounted, setMounted] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [halfWidth, setHalfWidth] = useState<number | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const { anchor } = useSelectionAnchor('[data-chapter-prose]', toolbarRef);
  const { charId, activeCharacter, selectCharacter } = useChatCharacter();
  const { activeChapterIndex } = useReading();
  const { setChatOpen, setChatSeed, setImagineOpen, setImagineSeed } = useReadingUI();

  // Order is load-bearing: read the selection BEFORE collapsing it (the
  // anchor hook clears itself via selectionchange once ranges are removed).
  // Chat and Imagine share the bottom-right slot — each closes the other.
  function handleChat() {
    const quote = window.getSelection()?.toString().trim() ?? '';
    setChatSeed(quote ? { quote, chapterIndex: activeChapterIndex } : null);
    setImagineOpen(false);
    setChatOpen(true);
    window.getSelection()?.removeAllRanges();
  }

  function handleImagine() {
    const quote = window.getSelection()?.toString().trim() ?? '';
    if (!quote) return;
    setImagineSeed({ quote, chapterIndex: activeChapterIndex });
    setChatOpen(false);
    setImagineOpen(true);
    window.getSelection()?.removeAllRanges();
  }

  useEffect(() => setMounted(true), []);

  // Close the picker whenever the toolbar itself is dismissed.
  useEffect(() => {
    if (!anchor) setPickerOpen(false);
  }, [anchor]);

  // Measure the real toolbar width so the edge clamp tracks the actual element
  // instead of a hardcoded guess (which goes stale whenever the layout changes).
  useLayoutEffect(() => {
    if (anchor && toolbarRef.current) setHalfWidth(toolbarRef.current.offsetWidth / 2);
  }, [anchor, activeCharacter]);

  function handlePick(id: string) {
    selectCharacter(id);
    setPickerOpen(false);
  }

  if (!mounted) return null;

  const half = halfWidth ?? FALLBACK_HALF_WIDTH;
  const left = anchor
    ? Math.min(
        Math.max(anchor.left, EDGE_MARGIN + half),
        window.innerWidth - EDGE_MARGIN - half,
      )
    : 0;

  return createPortal(
    <AnimatePresence>
      {anchor && (
        <div
          className="pointer-events-none fixed z-[var(--z-modal)]"
          style={{ top: anchor.top, left }}
        >
          <motion.div
            ref={toolbarRef}
            role="toolbar"
            aria-label="Selection actions"
            // Keep the text selection alive when interacting with the toolbar.
            onMouseDown={(e) => e.preventDefault()}
            initial={{ opacity: 0, scale: 0.94, x: '-50%', y: anchor.below ? '0%' : '-100%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: anchor.below ? '0%' : '-100%' }}
            exit={{ opacity: 0, scale: 0.96, x: '-50%', y: anchor.below ? '0%' : '-100%' }}
            transition={SPRING}
            style={{ transformOrigin: anchor.below ? 'top center' : 'bottom center' }}
            className="pointer-events-auto relative inline-flex items-center gap-1 rounded-2xl border border-card-border bg-bubble p-1 text-text shadow-float"
          >
            {/* Left: swap avatar + "Chat about this" read as one segment (shared
                hover bg), but are two sibling buttons — never nested, so each is
                independently focusable/clickable. */}
            <div className="flex h-10 items-center gap-2 rounded-xl pl-1 pr-2.5 transition-colors hover:bg-overlay-soft">
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                aria-label="Change character"
                aria-expanded={pickerOpen}
                className="group/av relative block h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-border"
              >
                <Image src={activeCharacter.src} alt="" fill sizes="32px" className="object-cover" />
                <span className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_0_1px_var(--image-outline)]" />
                {/* change icon — fades in on avatar hover */}
                <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/45 opacity-0 transition-opacity duration-150 group-hover/av:opacity-100">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 6h8l-2-2M13 10H5l2 2" />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                aria-label="Chat about this"
                onClick={handleChat}
                className="whitespace-nowrap font-sans text-[15px] font-medium"
              >
                Chat about this
              </button>
            </div>

            <span className="h-6 w-px shrink-0 bg-border-strong" aria-hidden="true" />

            {/* Right: Imagine — renders the highlighted passage as art */}
            <button
              type="button"
              onClick={handleImagine}
              className="flex h-10 items-center rounded-xl px-2.5 font-sans text-[15px] font-medium transition-colors hover:bg-overlay-soft"
            >
              Imagine
            </button>

            {/* Mini character picker */}
            <AnimatePresence>
              {pickerOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 4 }}
                  transition={{ duration: 0.16, ease: EASE_SPRING_OUT }}
                  style={{ transformOrigin: 'bottom left' }}
                  className="absolute bottom-full left-0.5 mb-1.5 flex items-center gap-1.5 rounded-xl border border-card-border bg-bubble p-1 shadow-float"
                >
                  {CHAT_CHARACTERS.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handlePick(c.id); }}
                      aria-label={`Character ${i + 1}`}
                      aria-pressed={c.id === charId}
                      className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-border transition-transform hover:scale-105"
                    >
                      <Image src={c.src} alt="" fill sizes="32px" className="object-cover" />
                      {/* active = same scrim as the change overlay, with a check */}
                      {c.id === charId && (
                        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/45 text-white">
                          <CheckIcon width={14} height={14} />
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

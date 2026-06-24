'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { CHAT_CHARACTERS, CHAT_CHARACTER_KEY } from '@/lib/chatCharacters';
import { EASE_SPRING_OUT } from '@/lib/motion';

interface Anchor {
  top: number;
  left: number;
  below: boolean;
}

const SPRING = { duration: 0.26, ease: EASE_SPRING_OUT };

/**
 * Floating toolbar shown over a text selection inside a chapter (ChatGPT-style).
 * Left: a swappable character avatar + "Chat about this". Right: "Imagine"
 * (placeholder). Only the character swap is functional this pass.
 */
export function SelectionToolbar() {
  const [mounted, setMounted] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [charId, setCharId] = useState<string>(CHAT_CHARACTERS[0].id);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(CHAT_CHARACTER_KEY);
      if (saved && CHAT_CHARACTERS.some((c) => c.id === saved)) setCharId(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    function hide() {
      setAnchor(null);
      setPickerOpen(false);
    }

    function capture() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const el = (node.nodeType === 1 ? (node as HTMLElement) : node.parentElement);
      if (!el || !el.closest('[data-chapter-prose]')) return; // only chapter text
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      const below = rect.top < 80; // would collide with the top bar — flip below
      setAnchor({
        top: below ? rect.bottom + 10 : rect.top - 10,
        left: Math.min(Math.max(rect.left + rect.width / 2, 170), window.innerWidth - 170),
        below,
      });
    }

    function onMouseUp() {
      // Let the browser finalize the selection before measuring.
      setTimeout(capture, 0);
    }
    function onMouseDown(e: MouseEvent) {
      if (toolbarRef.current?.contains(e.target as Node)) return; // clicks inside keep it open
      hide();
    }
    function onScroll() { hide(); }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') hide(); }
    function onSelectionChange() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) hide();
    }

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('keydown', onKey);
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, []);

  function pickCharacter(id: string) {
    setCharId(id);
    setPickerOpen(false);
    try { localStorage.setItem(CHAT_CHARACTER_KEY, id); } catch { /* ignore */ }
  }

  const activeChar = CHAT_CHARACTERS.find((c) => c.id === charId) ?? CHAT_CHARACTERS[0];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {anchor && (
        <div
          className="pointer-events-none fixed z-[var(--z-modal)]"
          style={{ top: anchor.top, left: anchor.left }}
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
            className="pointer-events-auto relative inline-flex items-center gap-1 rounded-[20px] border border-card-border bg-bubble p-1 text-text shadow-float"
          >
            {/* Left: swap avatar + "Chat about this" read as one segment (shared
                hover bg), but are two sibling buttons — never nested, so each is
                independently focusable/clickable. */}
            <div className="flex h-11 items-center gap-2 rounded-2xl pl-1 pr-2.5 transition-colors hover:bg-overlay-soft">
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                aria-label="Change character"
                aria-expanded={pickerOpen}
                className="group/av relative block h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-border"
              >
                <Image src={activeChar.src} alt="" fill sizes="36px" className="object-cover" />
                <span className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]" />
                {/* change icon — fades in on avatar hover */}
                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/45 opacity-0 transition-opacity duration-150 group-hover/av:opacity-100">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 6h8l-2-2M13 10H5l2 2" />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                aria-label="Chat about this"
                className="whitespace-nowrap font-sans text-[15px] font-medium"
              >
                Chat about this
              </button>
            </div>

            <span className="h-6 w-px shrink-0 bg-border-strong" aria-hidden="true" />

            {/* Right: Imagine (placeholder — no action yet) */}
            <button
              type="button"
              className="flex h-11 items-center rounded-2xl px-2.5 font-sans text-[15px] font-medium transition-colors hover:bg-overlay-soft"
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
                  className="absolute bottom-full left-1 mb-2 flex items-center gap-1.5 rounded-[18px] border border-card-border bg-bubble p-1.5 shadow-float"
                >
                  {CHAT_CHARACTERS.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); pickCharacter(c.id); }}
                      aria-label={`Character ${i + 1}`}
                      aria-pressed={c.id === charId}
                      className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-border transition-transform hover:scale-105"
                    >
                      <Image src={c.src} alt="" fill sizes="36px" className="object-cover" />
                      {/* active = same scrim as the change overlay, with a check */}
                      {c.id === charId && (
                        <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/45">
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                          </svg>
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
    document.body
  );
}

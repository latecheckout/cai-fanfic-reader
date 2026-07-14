'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useReadingUI } from '@/context/ReadingContext';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { isTypingTarget } from '@/lib/utils';
import { ICON_BUTTON } from './popoverChrome';
import { QuoteBlock } from './QuoteBlock';
import { MinusIcon } from './icons';


/**
 * Imagine — highlight a passage, get an image of it. Floating card in the
 * chat modal's corner slot (the two are mutually exclusive). @DUMMY — no
 * image generation exists on the static site: the 3:4 slot shows a persistent
 * loading shine forever (becomes the c.ai image-gen call when wired), and the
 * CTAs are stubs.
 */
export function ImagineModal() {
  const { imagineOpen, setImagineOpen, imagineSeed } = useReadingUI();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  // Bumping the key remounts the slot — "Reimagine" restarts the shine.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => setMounted(true), []);

  // Escape closes (not while typing elsewhere).
  useEffect(() => {
    if (!imagineOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isTypingTarget(e)) {
        e.stopPropagation();
        setImagineOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [imagineOpen, setImagineOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {imagineOpen && imagineSeed && (
        <motion.section
          role="dialog"
          aria-modal={false}
          aria-label="Imagine"
          initial={reduce ? false : { opacity: 0, scale: 0.82, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 6, transition: { duration: 0.14, ease: 'easeIn' } }
          }
          transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
          style={{ transformOrigin: 'bottom right' }}
          className="fixed bottom-3 right-3 z-[var(--z-modal)] flex w-[min(420px,90vw)] flex-col overflow-hidden rounded-[32px] border border-[var(--image-outline-faint)] bg-bg text-text shadow-float max-md:hidden"
        >
          {/* Header — bare title + close, chat-modal family. */}
          <div className="flex items-center gap-1 px-2.5 pb-1 pt-2.5">
            <span className="truncate px-2 py-1 font-sans text-[14px] font-medium text-text">
              Imagine
            </span>
            <button
              type="button"
              aria-label="Close imagine"
              onClick={() => setImagineOpen(false)}
              className={`ml-auto ${ICON_BUTTON}`}
            >
              <MinusIcon width={18} height={18} />
            </button>
          </div>

          <div className="flex flex-col gap-3 px-3 pb-3">
            <QuoteBlock quote={imagineSeed.quote} chapterIndex={imagineSeed.chapterIndex} />

            {/* 3:4 image slot — @DUMMY persistent loading shine (no generation). */}
            <div
              key={attempt}
              className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-overlay-medium"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[length:200%_100%] bg-no-repeat motion-safe:animate-[caiSkeletonShimmer_1.6s_linear_infinite]"
                // Inline: complex arbitrary bg-[] classes are silently dropped (see memory).
                style={{
                  backgroundImage:
                    'linear-gradient(105deg, transparent 40%, color-mix(in srgb, var(--bubble-bg) 55%, transparent) 50%, transparent 60%)',
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-[0.08em] text-secondary">
                imagining…
              </span>
            </div>

            {/* CTAs — @DUMMY stubs until the c.ai feed / image-gen APIs exist. */}
            <div className="flex gap-2">
              <button
                type="button"
                className="h-10 flex-1 cursor-pointer rounded-full bg-text font-sans text-[13px] font-medium text-bg transition-transform active:scale-[0.96]"
              >
                Post to c.ai feed
              </button>
              <button
                type="button"
                onClick={() => setAttempt((a) => a + 1)}
                className="h-10 cursor-pointer rounded-full border border-[var(--image-outline-faint)] bg-bubble px-4 font-sans text-[13px] text-text transition-transform active:scale-[0.96]"
              >
                Reimagine
              </button>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>,
    document.body
  );
}

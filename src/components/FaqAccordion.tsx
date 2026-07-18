'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { PlusIcon } from './icons';

export interface FaqEntry {
  question: string;
  /** Rendered answer (may contain links); pair with a plain-text `answerText`
      for JSON-LD when the two differ. */
  answer: React.ReactNode;
}

/** One expandable row: question button + PlusIcon that rotates into an ×. */
function FaqItem({ question, answer }: FaqEntry) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div className="border-t border-border first:border-t-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-6 bg-transparent py-5 text-left transition-colors"
      >
        <span className="min-w-0 font-sans text-[17px] font-medium text-text">{question}</span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center text-secondary transition-transform duration-200 ease-out ${
            open ? 'rotate-45' : ''
          }`}
          aria-hidden="true"
        >
          <PlusIcon width={18} height={18} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            <div className="max-w-[60ch] pb-5 font-sans text-[15px] leading-relaxed text-secondary [&_a]:text-text [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-70">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** FAQ list: stroke-separated expandable rows (strokes between rows only). */
export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  return (
    <div className="flex flex-col border-b border-border">
      {items.map((item) => (
        <FaqItem key={item.question} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
}

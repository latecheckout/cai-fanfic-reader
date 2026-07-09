'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EASE_OUT_EXPO } from '@/lib/motion';

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  pathname: string;
  navLinks: NavLink[];
}

export function MobileNav({ open, onClose, pathname, navLinks }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    // Prevent body scroll while open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Focus the panel when it opens
  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[500] bg-[rgba(26,24,22,0.45)]"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label="Navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18, ease: 'easeOut' }}
        >
          <motion.div
            ref={panelRef}
            className="absolute bottom-0 right-0 top-0 flex w-[min(280px,85vw)] flex-col overflow-y-auto border-l border-border bg-bg outline-none [-webkit-overflow-scrolling:touch]"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { x: '100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: reduce ? 0 : 0.22, ease: EASE_OUT_EXPO }}
          >
            {/* Close button */}
            <div className="flex h-14 shrink-0 items-center justify-end border-b border-border px-4">
              <button
                className="flex h-11 w-11 items-center justify-center text-secondary transition-colors duration-150 ease-in-out hover:text-text"
                onClick={onClose}
                aria-label="Close navigation"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav aria-label="Site navigation">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className={`flex min-h-[52px] items-center border-b border-border px-6 font-serif text-lg no-underline transition-colors duration-150 ease-in-out hover:bg-[color-mix(in_srgb,var(--text)_3%,transparent)] hover:text-text ${
                    pathname === href ? 'text-text' : 'text-secondary'
                  }`}
                  onClick={onClose}
                >
                  {label}
                </a>
              ))}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import styles from '@/styles/components/MobileNav.module.css';

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

  // a11y: focus-in, Tab-trap, Escape, and focus-return to the trigger
  useFocusTrap(panelRef, open, onClose);

  // Prevent body scroll while open
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog" aria-label="Navigation">
      <div
        ref={panelRef}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close button */}
        <div className={styles.panelHeader}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close navigation">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Mobile">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={`${styles.navLink} ${pathname === href ? styles.navActive : ''}`}
              onClick={onClose}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

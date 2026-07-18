'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Tab pill — surface-local tab (Library tabs). Text-only label; the active
 * tab carries a 1px indicator bar that overlays the row's dividing line
 * (`-bottom-px` over the wrapper's border-b) and slides between tabs via a
 * shared `layoutId`. The tab stretches to the row height set by its
 * siblings (e.g. the search input), keeping the indicator on the line.
 */
export function TabPill({
  href,
  label,
  active = false,
  className = '',
  onClick,
  indicatorId = 'tab-indicator',
}: {
  href: string;
  label: string;
  active?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Shared motion layoutId — one per tab row so indicators don't cross-animate. */
  indicatorId?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative inline-flex items-center whitespace-nowrap font-mono text-[12px] no-underline transition-colors duration-150 ease-out ${
        active ? 'text-text' : 'text-secondary hover:text-text'
      } ${className}`}
    >
      {label}
      {active && (
        <motion.span
          layoutId={reduce ? undefined : indicatorId}
          className="absolute inset-x-0 -bottom-px h-px bg-text"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

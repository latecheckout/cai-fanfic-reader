'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { MENU_ROW, MENU_ROW_ACTIVE } from './popoverChrome';
import { HUD_BUBBLE } from './readingChrome';

/**
 * Shared building blocks for popover menus (site menu, account menu, …).
 * One source for the row column, link rows, dividers, and the bubble
 * trigger so the menus can't drift apart — SortDropdown keeps its own rows
 * (listbox semantics + keyboard nav), but shares the same MENU_ROW chrome.
 */

/** gap-1 column — separates adjacent row fills (hover/active never touch). */
export function MenuColumn({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

/** Hairline between row groups; MenuColumn's gap provides its spacing. */
export function MenuDivider() {
  return <div className="h-px bg-border" aria-hidden="true" />;
}

/** Iconed navigation row; `active` gets the filled treatment + aria-current. */
export function MenuRowLink({
  href,
  label,
  icon,
  active = false,
  onClick,
  className = '',
}: {
  href: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`${MENU_ROW} font-sans text-sm no-underline ${
        active ? `${MENU_ROW_ACTIVE} font-medium text-text` : 'text-secondary hover:text-text'
      } ${className}`}
    >
      {icon} {label}
    </Link>
  );
}

/** HUD-bubble menu trigger — pass Popover's renderTrigger args through. */
export function MenuBubbleTrigger({
  open,
  toggle,
  label,
  children,
}: {
  open: boolean;
  toggle: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={toggle}
      className={`${HUD_BUBBLE} ${open ? 'shadow-bubble-hover [&_svg]:opacity-100' : ''}`}
    >
      {children}
    </button>
  );
}

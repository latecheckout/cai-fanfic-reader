'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { Popover } from './Popover';
import { MENU_ROW, MENU_ROW_ACTIVE } from './popoverChrome';
import { UpDownArrowIcon } from './icons';
import { isTypingTarget } from '@/lib/utils';

export interface SortOption {
  /** Composite `sort:order` value, e.g. 'updated:desc'. */
  value: string;
  label: string;
}

// Catalog sort taxonomy — also consumed by FilterPanel's mobile drawer sort
// pills. Surface-specific option sets (library tabs, characters) live with
// their surfaces and are passed in via the `options` prop.
export const SORT_OPTIONS: SortOption[] = [
  { value: 'updated:desc', label: 'Recently updated' },
  { value: 'published:desc', label: 'Newest first' },
  { value: 'kudos:desc', label: 'Most kudos' },
  { value: 'words:desc', label: 'Longest first' },
  { value: 'words:asc', label: 'Shortest first' },
];

interface Props {
  /** Current `sort:order` value, e.g. 'updated:desc'. */
  currentValue: string;
  onChange: (value: string) => void;
  /** Controlled open state — FilterPanel owns this so useDrawer can defer
      Escape to us. Omit both for uncontrolled (library/characters). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Option set (defaults to the catalog taxonomy). */
  options?: SortOption[];
  /** Icon-only trigger at every breakpoint (the default trigger already
      collapses to icon-only on mobile). */
  iconOnly?: boolean;
  /** Wrapper classes — FilterPanel passes `max-md:hidden` (its mobile sort
      lives in the drawer); other surfaces stay visible on mobile. */
  className?: string;
}

/**
 * The sort capsule + its popover menu, extracted from FilterPanel and now
 * shared by the library/characters toolbars. Escape/click-outside close is
 * Popover's job; this owns the 'S' shortcut and the focus/arrow-key behavior
 * of the options.
 */
export const SortDropdown = memo(function SortDropdown({
  currentValue,
  onChange,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  options = SORT_OPTIONS,
  iconOnly = false,
  className = '',
}: Props) {
  // Uncontrolled fallback when the parent doesn't own open state.
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const onOpenChange = onOpenChangeProp ?? setInternalOpen;

  const listRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // S toggles the menu (except while typing / with modifiers — Cmd+S stays the
  // browser's). Escape is handled by Popover. use-latest ref so the document
  // listener subscribes once instead of churning on every toggle (matches
  // useDrawer's pattern).
  const latest = useRef({ open, onOpenChange });
  latest.current = { open, onOpenChange };
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 's' && e.key !== 'S') return;
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e)) return;
      // Don't toggle while the control is CSS-hidden (e.g. FilterPanel's on
      // mobile — it would also swallow the drawer's Escape).
      if (!wrapRef.current?.offsetParent) return;
      e.preventDefault();
      latest.current.onOpenChange(!latest.current.open);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus first option when the menu opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() =>
        listRef.current?.querySelector<HTMLButtonElement>('[role="option"]')?.focus()
      );
    }
  }, [open]);

  return (
    <div ref={wrapRef} className={`flex-shrink-0 ${className}`}>
      <Popover
        align="left"
        ariaLabel="Sort options"
        open={open}
        onOpenChange={onOpenChange}
        contentClassName="min-w-full w-max overflow-hidden p-2"
        renderTrigger={({ open: isOpen, toggle }) => (
          <button
            className={`inline-flex h-10 max-md:h-11 items-center rounded-full border font-sans text-sm leading-none whitespace-nowrap flex-shrink-0 cursor-pointer transition-[color,border-color,background,box-shadow] duration-150 ease-in-out ${
              iconOnly
                ? 'w-10 justify-center p-0 max-md:w-11'
                : 'gap-1.5 px-3.5 max-md:w-11 max-md:justify-center max-md:p-0'
            } ${
              isOpen
                ? 'border-transparent bg-secondary text-bg hover:text-bg hover:opacity-90'
                : 'border-border-strong bg-transparent text-secondary hover:border-border-active hover:text-text'
            }`}
            onClick={toggle}
            aria-label="Sort options"
            aria-expanded={isOpen}
          >
            <UpDownArrowIcon width={14} height={14} className="shrink-0" />
            {!iconOnly && (
              <>
                {/* Width-stable label: all options stacked in one grid cell so the
                    button reserves the widest label's width and never resizes on
                    switch. Hidden on mobile — the trigger collapses to the icon. */}
                <span className="grid justify-items-start max-md:hidden">
                  {options.map((o) => (
                    <span key={o.value} className="invisible [grid-area:1/1]" aria-hidden="true">{o.label}</span>
                  ))}
                  <span className="[grid-area:1/1]">
                    {options.find((o) => o.value === currentValue)?.label ?? 'sort'}
                  </span>
                </span>
                <kbd className="ml-px font-mono text-xs tracking-[0.02em] opacity-60 max-md:hidden">S</kbd>
              </>
            )}
          </button>
        )}
      >
        <div ref={listRef} role="listbox" aria-label="Sort options" className="flex flex-col gap-1">
          {options.map((opt, i) => (
            <button
              key={opt.value}
              className={`${MENU_ROW} whitespace-nowrap font-sans text-sm ${
                currentValue === opt.value ? `${MENU_ROW_ACTIVE} font-medium text-text` : 'text-secondary hover:text-text'
              }`}
              // preventDefault on mousedown stops the pre-click blur; the
              // action itself lives on click so Enter/Space work too.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(opt.value); onOpenChange(false); }}
              role="option"
              aria-selected={currentValue === opt.value}
              onKeyDown={(e) => {
                const buttons = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])];
                if (e.key === 'ArrowDown') { e.preventDefault(); buttons[i + 1]?.focus(); }
                if (e.key === 'ArrowUp') { e.preventDefault(); buttons[i - 1]?.focus(); }
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Popover>
    </div>
  );
});

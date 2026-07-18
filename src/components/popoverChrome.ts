// Shared popover chrome: the floating-panel surface (the chapter-indicator
// "bubble" lens) and its menu rows. One source so the reading-page popovers
// and the browse dropdowns can't drift apart.

// Panel surface — consumed by Popover.tsx and by dropdowns that manage their
// own open state (BrowseSearchBar). Positioning/z-index stay with the consumer.
export const POPOVER_PANEL =
  'rounded-[24px] border border-bubble-ring bg-bubble text-text shadow-float';

// Inset menu row (ChapterPanel geometry): rounded row inside a p-2 panel.
// max-md:min-h-11 lifts every popover row to the 44px touch minimum on mobile.
export const MENU_ROW =
  'flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 max-md:min-h-11 text-left transition-colors hover:bg-overlay-soft';
export const MENU_ROW_ACTIVE = 'bg-overlay-medium';

/** 32px round icon button (panel-header actions) — the after:-inset-1.5 extends
 *  the hit area to the 44px touch minimum without changing the visual size.
 *  One bg per variant: same-property utilities conflict, so hover/default
 *  fills live only in the variants, never stacked. */
const ICON_BUTTON_BASE =
  'relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full ' +
  'transition-[background-color,transform] duration-150 active:scale-[0.96] ' +
  'after:absolute after:-inset-1.5 [&_svg]:opacity-55 [&_svg]:transition-opacity hover:[&_svg]:opacity-100';

/** Soft fill at rest, medium on hover (both text-tinted → theme-aware). */
export const ICON_BUTTON_FILLED = `${ICON_BUTTON_BASE} bg-overlay-soft hover:bg-overlay-medium`;

// Shared popover chrome: the floating-panel surface (the chapter-indicator
// "bubble" lens) and its menu rows. One source so the reading-page popovers
// and the browse dropdowns can't drift apart.

// Panel surface — consumed by Popover.tsx and by dropdowns that manage their
// own open state (BrowseSearchBar). Positioning/z-index stay with the consumer.
export const POPOVER_PANEL =
  'rounded-[24px] border border-bubble-ring bg-bubble text-text shadow-float';

// Inset menu row (ChapterPanel geometry): rounded row inside a p-2 panel.
export const MENU_ROW =
  'flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-overlay-soft';
export const MENU_ROW_ACTIVE = 'bg-overlay-medium';

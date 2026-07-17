/**
 * Shared search-field chrome as Tailwind class strings (same pattern as
 * readingChrome/popoverChrome) — one source of truth for the input pill
 * used by BrowseSearchBar (global/catalog) and ScopedSearchInput (library).
 *
 * CONTROL_HEIGHT is the single control height for header/toolbar elements:
 * 40px desktop / 44px mobile, anchored to HUD_BUBBLE (h-10/h-11) so the
 * search pill, sort/filter buttons, CTA pill, and icon bubbles all align.
 */
export const CONTROL_HEIGHT = 'h-10 max-md:h-11';

export const SEARCH_INPUT =
  `${CONTROL_HEIGHT} w-full rounded-full border border-border-strong bg-transparent pl-[34px] ` +
  'font-sans text-[15px] text-text outline-none transition-colors duration-150 ' +
  'hover:border-border-active focus:border-border-active ' +
  'placeholder:text-secondary placeholder:opacity-[0.55]';

export const SEARCH_ICON =
  'pointer-events-none absolute left-[13px] top-1/2 flex-shrink-0 -translate-y-1/2 ' +
  'text-secondary opacity-[0.45] transition-opacity duration-150 group-focus-within:opacity-70';

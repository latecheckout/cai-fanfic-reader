// ── localStorage keys ──────────────────────────────────────────────────────
// Centralised so BrowseSearchBar + FilterPanel stay in sync.

export const PRESETS_KEY = 'cai_fanfic_presets';
export const HISTORY_KEY = 'cai_search_history';

// Site layout mode (nav toggle).
export const SITE_MODE_KEY = 'cai_site_mode';       // 'text' | 'visual'
export const SITE_MODE_EVENT = 'cai-mode-change';    // window CustomEvent name

// Reading-page (per-work) state keys.
export const SAVED_KEY = 'fanfic-saved-works'; // reading-list (bookmarked work slugs)
export const BOOKMARKS_KEY = 'fanfic-bookmarks'; // scroll position + furthest + last chapter
export const CHAT_HISTORY_KEY = 'fanfic-chat-history'; // Record<slug, Conversation[]> — character chat modal
export const KUDOS_KEY = 'fanfic-kudos';        // slugs the reader has left kudos on

// Reading preferences (typography + theme).
export const FONT_KEY = 'fanfic-font';
export const FONT_SIZE_KEY = 'fanfic-font-size';
export const LINE_WIDTH_KEY = 'fanfic-line-width';
export const THEME_KEY = 'fanfic-reader-theme';

// ── Filter taxonomy ────────────────────────────────────────────────────────
// These are the canonical AO3-style filter values used in both FilterPanel
// and BrowseSearchBar autocomplete. Keep them here as the single source of truth.
// If c.ai's backend diverges from AO3 taxonomy, update here only.

export const RATINGS = [
  'General Audiences',
  'Teen And Up Audiences',
  'Mature',
  'Explicit',
  'Not Rated',
];

export const WARNINGS = [
  'Major Character Death',
  'Graphic Depictions Of Violence',
  'Non-Con',
  'Underage',
  'Creator Chose Not To Use Archive Warnings',
];

export const CATEGORIES = ['F/F', 'F/M', 'Gen', 'M/M', 'Multi', 'Other'];

export const STATUSES = ['Complete', 'In Progress'];

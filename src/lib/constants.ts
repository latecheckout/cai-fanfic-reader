// ── localStorage keys ──────────────────────────────────────────────────────
// Centralised so BrowseSearchBar + FilterPanel stay in sync.

export const PRESETS_KEY = 'cai_fanfic_presets';
export const HISTORY_KEY = 'cai_search_history';

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

/**
 * Single source of truth for AO3-style content ratings. Previously the letter,
 * short name, tier key, badge color, pill include-class, and tooltip were spread
 * across ~4 maps in WorkCardCover, FilterPanel, and utils. Both the card rating
 * badge (<RatingBadge>) and the filter pill's rating variant now derive from here.
 *
 * Color utilities are kept as LITERAL class strings (`bg-rating-g`, …) so
 * Tailwind's scanner emits them — dynamic interpolation would not be detected.
 */
interface RatingTier {
  /** Canonical rating string (matches content frontmatter + the RATINGS list). */
  rating: string;
  /** Badge letter (G/T/M/E/NR). */
  letter: string;
  /** Short display name for the filter pill (General/Teen+/…). */
  shortName: string;
  /** Lowercase tier key (g/t/m/e/nr). */
  key: string;
  /** Class key returned by ratingClass() (ratingG/ratingT/…). */
  classKey: string;
  /** Filled badge background utility. */
  bg: string;
  /** Letter color on the filled bg — the brand token's specified textColor
      (character-brain colors.json), NOT always white. */
  fg: string;
  /** Include-state class for the filter pill card. */
  includeClass: string;
  /** Hover tooltip label for the badge (single line). */
  tooltip: string;
}

const RATING_TIERS: Record<string, RatingTier> = {
  'General Audiences': {
    rating: 'General Audiences', letter: 'G', shortName: 'General', key: 'g',
    classKey: 'ratingG', bg: 'bg-rating-g', fg: 'text-white', includeClass: 'bg-rating-g border-rating-g',
    tooltip: 'General Audiences',
  },
  'Teen And Up Audiences': {
    rating: 'Teen And Up Audiences', letter: 'T', shortName: 'Teen+', key: 't',
    classKey: 'ratingT', bg: 'bg-rating-t', fg: 'text-black', includeClass: 'bg-rating-t border-rating-t',
    tooltip: 'Teen And Up Audiences',
  },
  'Mature': {
    rating: 'Mature', letter: 'M', shortName: 'Mature', key: 'm',
    classKey: 'ratingM', bg: 'bg-rating-m', fg: 'text-black', includeClass: 'bg-rating-m border-rating-m',
    tooltip: 'Mature',
  },
  'Explicit': {
    rating: 'Explicit', letter: 'E', shortName: 'Explicit', key: 'e',
    classKey: 'ratingE', bg: 'bg-rating-e', fg: 'text-white', includeClass: 'bg-rating-e border-rating-e',
    tooltip: 'Explicit',
  },
  'Not Rated': {
    rating: 'Not Rated', letter: 'NR', shortName: 'Not Rated', key: 'nr',
    classKey: 'ratingNR', bg: 'bg-rating-nr', fg: 'text-black', includeClass: 'bg-rating-nr border-rating-nr',
    tooltip: 'Not Rated',
  },
};

/**
 * Resolve a (possibly loosely-worded) rating string to its tier. Mirrors the
 * substring matching that ratingClass() has always used; falls back to Not Rated.
 */
export function ratingTier(rating: string): RatingTier {
  const r = rating.toLowerCase();
  if (r.includes('general')) return RATING_TIERS['General Audiences'];
  if (r.includes('teen')) return RATING_TIERS['Teen And Up Audiences'];
  if (r.includes('explicit')) return RATING_TIERS['Explicit'];
  if (r.includes('mature')) return RATING_TIERS['Mature'];
  return RATING_TIERS['Not Rated'];
}

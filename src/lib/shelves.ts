import { WorkSummary, FilterState } from '@/types';
import { applyFilters } from './filters';

/**
 * Browse-first layer zero: shelf and fandom-tile builders.
 *
 * A shelf is nothing more than a pre-canned filter query rendered as a cover
 * rail. Every shelf carries the URL params for its own query, so "view all"
 * lands on the full search surface with the filter engine untouched. The
 * definitions mirror VIBE_RULES in filters.ts, adapted to the tag vocabulary
 * actually present in content/works.
 */

export interface Shelf {
  key: string;
  title: string;
  subtitle: string;
  /** Filter URL for the full result set, e.g. /?tag=Found%20Family */
  href: string;
  works: WorkSummary[];
}

export interface FandomTile {
  /** Canonical fandom tag, used in the URL. */
  name: string;
  /** Display label, shortened for the tile ("Harry Potter - J. K. Rowling" reads as "Harry Potter"). */
  label: string;
  count: number;
  covers: string[];
  href: string;
}

interface ShelfDef {
  key: string;
  title: string;
  subtitle: string;
  filters: FilterState;
  /** URL params equivalent to `filters`, in page.tsx param naming. */
  params: Record<string, string>;
}

const PER_SHELF = 12;
const MIN_SHELF_WORKS = 4;

const SHELF_DEFS: ShelfDef[] = [
  {
    key: 'trending',
    title: 'Trending now',
    subtitle: 'The most loved works on the archive',
    filters: { sort: 'kudos' },
    params: { sort: 'kudos' },
  },
  {
    key: 'slow-burn',
    title: 'The tension is the point',
    subtitle: 'Slow burn and mutual pining',
    filters: { tag: 'Slow Burn,Pining,Mutual Pining' },
    params: { tag: 'Slow Burn,Pining,Mutual Pining' },
  },
  {
    key: 'cozy',
    title: 'Soft landings',
    subtitle: 'Cozy comfort reads, nobody dies',
    filters: {
      tag: 'Fluff,Domestic Fluff,Hurt/Comfort,Happy Ending',
      exWarning: 'Major Character Death',
    },
    params: {
      tag: 'Fluff,Domestic Fluff,Hurt/Comfort,Happy Ending',
      ex_warning: 'Major Character Death',
    },
  },
  {
    key: 'found-family',
    title: 'Found family',
    subtitle: 'Everyone gets adopted by the end',
    filters: { tag: 'Found Family' },
    params: { tag: 'Found Family' },
  },
  {
    key: 'short',
    title: 'Done in one sitting',
    subtitle: 'Complete stories under 15k words',
    filters: { maxWords: 15000, status: 'Complete' },
    params: { max_words: '15000', status: 'Complete' },
  },
];

function buildHref(params: Record<string, string>): string {
  const qs = new URLSearchParams(params);
  return `/?${qs.toString()}`;
}

export function buildShelves(works: WorkSummary[]): Shelf[] {
  return SHELF_DEFS.map((def) => {
    const matched = applyFilters(works, def.filters);
    return {
      key: def.key,
      title: def.title,
      subtitle: def.subtitle,
      href: buildHref(def.params),
      works: matched.slice(0, PER_SHELF),
    };
  }).filter((shelf) => shelf.works.length >= MIN_SHELF_WORKS);
}

/** Shorten a canonical fandom tag for tile display. */
function fandomLabel(name: string): string {
  let label = name;
  // Prefer the romanized half of bilingual tags: "原神 | Genshin Impact (Video Game)"
  const pipeParts = label.split('|');
  label = pipeParts[pipeParts.length - 1].trim();
  // Drop trailing medium qualifiers: "(TV 2019)", "(Video Game)"
  label = label.replace(/\s*\([^)]*\)\s*$/, '');
  // Drop creator attribution: "Harry Potter - J. K. Rowling"
  label = label.split(' - ')[0].trim();
  return label || name;
}

export function buildFandomTiles(works: WorkSummary[], maxTiles = 10): FandomTile[] {
  const byFandom = new Map<string, WorkSummary[]>();
  for (const w of works) {
    for (const f of w.meta.fandom) {
      const list = byFandom.get(f) ?? [];
      list.push(w);
      byFandom.set(f, list);
    }
  }

  const tiles = Array.from(byFandom.entries())
    .filter(([, list]) => list.length >= 2)
    .map(([name, list]) => {
      const sorted = [...list].sort((a, b) => b.meta.kudos - a.meta.kudos);
      return {
        name,
        label: fandomLabel(name),
        count: list.length,
        covers: sorted.slice(0, 3).map((w) => w.meta.cover ?? ''),
        href: buildHref({ fandom: name }),
      };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  // Distinct canonical tags can share a display label ("Good Omens (TV)" and
  // "Good Omens - Neil Gaiman & Terry Pratchett"). Keep the larger one.
  const seenLabels = new Set<string>();
  const deduped: FandomTile[] = [];
  for (const tile of tiles) {
    if (seenLabels.has(tile.label)) continue;
    seenLabels.add(tile.label);
    deduped.push(tile);
  }

  return deduped.slice(0, maxTiles);
}

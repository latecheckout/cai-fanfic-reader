import fs from 'fs';
import path from 'path';
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
  /** Decorative emoji shown after the title; hidden from screen readers. */
  emoji?: string;
  subtitle: string;
  /** Filter URL for the full result set; absent for manually curated shelves. */
  href?: string;
  works: WorkSummary[];
}

export interface Creator {
  name: string;
  workCount: number;
  kudos: number;
  hits: number;
  /** Filter URL: searches the archive for this creator. */
  href: string;
  /** @DUMMY — derived one-line bio (top fandom + tags) until real bios exist. */
  bio?: string;
}

export interface FandomTile {
  /** Canonical fandom tag, used in the URL. */
  name: string;
  /** Display label, shortened for the tile ("Harry Potter - J. K. Rowling" reads as "Harry Potter"). */
  label: string;
  count: number;
  /** Full-bleed tile art: generated fandom mood image, falling back to the top work's cover. */
  image: string;
  /** The fandom's two most frequent tags, shown as pills on the text-mode tile. */
  topTags: string[];
  href: string;
}

/** Generated fandom mood art (Higgsfield, no-text scenes), keyed by display label. */
const FANDOM_ART: Record<string, string> = {
  'Harry Potter': '/fandoms/harry-potter.png',
  'Marvel Cinematic Universe': '/fandoms/marvel-cinematic-universe.png',
  'Our Flag Means Death': '/fandoms/our-flag-means-death.png',
  'Supernatural': '/fandoms/supernatural.png',
  'Good Omens': '/fandoms/good-omens.png',
  'Arcane: League of Legends': '/fandoms/arcane.png',
  'Stranger Things': '/fandoms/stranger-things.png',
  'Sherlock': '/fandoms/sherlock.png',
  'Original Work': '/fandoms/original-work.png',
};

interface ShelfDef {
  key: string;
  title: string;
  /** Decorative emoji shown after the title; hidden from screen readers. */
  emoji?: string;
  subtitle: string;
  /** Filter-driven shelf: works come from the filter engine. */
  filters?: FilterState;
  /** URL params equivalent to `filters`, in page.tsx param naming. */
  params?: Record<string, string>;
  /** Manually curated shelf: explicit slug list, order preserved. */
  slugs?: string[];
}

const PER_SHELF = 12;
const MIN_SHELF_WORKS = 4;

/**
 * @DUMMY — Featured is manually curated. Per Devon (design review,
 * June 2026): his team's backend will populate curated shelves with
 * book IDs; the frontend deliverable is the shelf itself. Replace this
 * slug list with the API-provided IDs when wiring.
 */
const FEATURED_SLUGS: string[] = [
  'sample-story-2',
  'work-01',
  'sample-story-11',
  'sample-story-10',
  'work-13',
  'sample-story-8',
  'work-05',
  'sample-story-5',
];

const SHELF_DEFS: ShelfDef[] = [
  {
    key: 'trending',
    title: 'Trending',
    emoji: '🔥',
    subtitle: 'What everyone is reading right now',
    filters: { sort: 'kudos' },
    params: { sort: 'kudos' },
  },
  {
    key: 'featured',
    title: 'Featured',
    emoji: '⭐',
    subtitle: 'Hand-picked by the c.ai team',
    slugs: FEATURED_SLUGS,
  },
];

function buildHref(params: Record<string, string>): string {
  const qs = new URLSearchParams(params);
  return `/?${qs.toString()}`;
}

export function buildShelves(works: WorkSummary[]): Shelf[] {
  const bySlug = new Map(works.map((w) => [w.slug, w]));
  return SHELF_DEFS.map((def) => {
    const matched = def.slugs
      ? def.slugs.map((s) => bySlug.get(s)).filter((w): w is WorkSummary => w !== undefined)
      : applyFilters(works, def.filters ?? {});
    return {
      key: def.key,
      title: def.title,
      emoji: def.emoji,
      subtitle: def.subtitle,
      href: def.params ? buildHref(def.params) : undefined,
      works: matched.slice(0, PER_SHELF),
    };
  }).filter((shelf) => shelf.works.length >= MIN_SHELF_WORKS);
}

/** @DUMMY — author bios (6–8 words each) until real ones exist; assigned in
 *  order so each card reads differently. */
const CREATOR_BIOS = [
  'Slow-burn specialist with a soft spot for angst',
  'Writes cozy one-shots between long enemies-to-lovers epics',
  'Chronically online, perpetually working on chapter twelve',
  'Hurt/comfort enthusiast who always promises happy endings',
  'Fluff, found family, and the occasional plot twist',
  'Reformed lurker turned prolific late-night fanfic author',
  'Canon-divergent storyteller obsessed with morally grey characters',
  'Tags everything, regrets nothing, updates on Sundays',
  'Coffee-fueled author of unreasonably long slow burns',
  'Soft prose, sharp banter, devastating mid-fic cliffhangers',
  'Here for the yearning, staying for the payoff',
  'Writes comfort fic you didn\'t know you needed',
];

/** Aggregate authors into creator cards, ranked by total kudos. */
export function buildCreators(works: WorkSummary[], maxCreators = 12): Creator[] {
  const byAuthor = new Map<string, { workCount: number; kudos: number; hits: number }>();
  for (const w of works) {
    if (!w.meta.author) continue;
    const cur = byAuthor.get(w.meta.author) ?? { workCount: 0, kudos: 0, hits: 0 };
    cur.workCount += 1;
    cur.kudos += w.meta.kudos;
    cur.hits += w.meta.hits;
    byAuthor.set(w.meta.author, cur);
  }
  return Array.from(byAuthor.entries())
    .map(([name, stats]) => ({ name, ...stats, href: buildHref({ q: name }) }))
    .sort((a, b) => b.kudos - a.kudos)
    .slice(0, maxCreators)
    .map((c, i) => ({ ...c, bio: CREATOR_BIOS[i % CREATOR_BIOS.length] }));
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
      const label = fandomLabel(name);
      // Generated art can be missing (moderation rejections); fall back to
      // the fandom's top work cover so the tile never renders broken.
      const art = FANDOM_ART[label];
      const artExists = art && fs.existsSync(path.join(process.cwd(), 'public', art));
      const tagCounts = new Map<string, number>();
      for (const w of list) {
        for (const t of w.meta.tags) {
          tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
        }
      }
      const topTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([tag]) => tag);
      return {
        name,
        label,
        count: list.length,
        image: (artExists ? art : sorted[0].meta.cover) ?? '',
        topTags,
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

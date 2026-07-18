import { WorkSummary, FilterState } from '@/types';

// Split a comma-separated filter value into an array of lowercase strings
function splitFilter(val: string): string[] {
  return val.split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
}

export function applyFilters(works: WorkSummary[], filters: FilterState): WorkSummary[] {
  let result = [...works];

  // Text search across title, author, summary, tags, fandom, and chapter text
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter((w) => {
      return (
        w.meta.title.toLowerCase().includes(q) ||
        w.meta.author.toLowerCase().includes(q) ||
        w.meta.summary.toLowerCase().includes(q) ||
        w.meta.tags.some((t) => t.toLowerCase().includes(q)) ||
        w.meta.fandom.some((f) => f.toLowerCase().includes(q)) ||
        w.textChunks?.some((c) => c.text.toLowerCase().includes(q))
      );
    });
  }

  // Fandom filter (single value)
  if (filters.fandom) {
    result = result.filter((w) =>
      w.meta.fandom.some((f) => f.toLowerCase() === filters.fandom!.toLowerCase())
    );
  }

  // Relationship filter
  if (filters.relationship) {
    const rel = filters.relationship.toLowerCase();
    result = result.filter((w) =>
      w.meta.relationships.some((r) => r.toLowerCase() === rel)
    );
  }

  // Tag filter — comma-sep OR: works must have at least one of the listed tags
  if (filters.tag) {
    const tags = splitFilter(filters.tag);
    result = result.filter((w) =>
      tags.some((tag) => w.meta.tags.some((t) => t.toLowerCase() === tag))
    );
  }

  // Character filter
  if (filters.character) {
    const char = filters.character.toLowerCase();
    result = result.filter((w) =>
      w.meta.characters.some((c) => c.toLowerCase() === char)
    );
  }

  // Rating filter — comma-sep OR
  if (filters.rating) {
    const ratings = splitFilter(filters.rating);
    result = result.filter((w) =>
      ratings.some((r) => w.meta.rating.toLowerCase() === r)
    );
  }

  // Status filter — comma-sep OR
  if (filters.status) {
    const statuses = splitFilter(filters.status);
    result = result.filter((w) =>
      statuses.some((s) => w.meta.status.toLowerCase() === s)
    );
  }

  // Category filter — comma-sep OR
  if (filters.category) {
    const cats = splitFilter(filters.category);
    result = result.filter((w) =>
      cats.some((cat) => w.meta.category.some((c) => c.toLowerCase() === cat))
    );
  }

  // Language filter
  if (filters.language) {
    const lang = filters.language.toLowerCase();
    result = result.filter((w) => w.meta.language.toLowerCase() === lang);
  }

  // Warning filter — comma-sep OR: works must have at least one of the listed warnings
  if (filters.warning) {
    const warns = splitFilter(filters.warning);
    result = result.filter((w) =>
      warns.some((warn) => w.meta.warnings.some((wn) => wn.toLowerCase() === warn))
    );
  }

  // Word count range
  if (filters.minWords != null) {
    result = result.filter((w) => w.meta.words >= filters.minWords!);
  }
  if (filters.maxWords != null) {
    result = result.filter((w) => w.meta.words <= filters.maxWords!);
  }

  // Date filter
  if (filters.datePreset && filters.datePreset !== 'custom') {
    const now = Date.now();
    const msMap: Record<string, number> = {
      last_week: 7 * 24 * 60 * 60 * 1000,
      last_month: 30 * 24 * 60 * 60 * 1000,
      last_year: 365 * 24 * 60 * 60 * 1000,
    };
    const cutoffMs = msMap[filters.datePreset];
    if (cutoffMs) {
      const cutoff = new Date(now - cutoffMs);
      result = result.filter((w) => {
        const updated = new Date(w.meta.updated || w.meta.published);
        return updated >= cutoff;
      });
    }
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    result = result.filter((w) => new Date(w.meta.updated || w.meta.published) >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    result = result.filter((w) => new Date(w.meta.updated || w.meta.published) <= to);
  }

  // ── Exclude filters ───────────────────────────────────────────────────────

  if (filters.exFandom) {
    const ex = filters.exFandom.toLowerCase();
    result = result.filter((w) =>
      !w.meta.fandom.some((f) => f.toLowerCase() === ex)
    );
  }
  if (filters.exRelationship) {
    const ex = filters.exRelationship.toLowerCase();
    result = result.filter((w) =>
      !w.meta.relationships.some((r) => r.toLowerCase() === ex)
    );
  }
  if (filters.exTag) {
    const exTags = splitFilter(filters.exTag);
    result = result.filter((w) =>
      !exTags.some((ex) => w.meta.tags.some((t) => t.toLowerCase() === ex))
    );
  }
  if (filters.exCharacter) {
    const ex = filters.exCharacter.toLowerCase();
    result = result.filter((w) =>
      !w.meta.characters.some((c) => c.toLowerCase() === ex)
    );
  }
  if (filters.exRating) {
    const exRatings = splitFilter(filters.exRating);
    result = result.filter((w) =>
      !exRatings.some((r) => w.meta.rating.toLowerCase() === r)
    );
  }
  if (filters.exStatus) {
    const exStatuses = splitFilter(filters.exStatus);
    result = result.filter((w) =>
      !exStatuses.some((s) => w.meta.status.toLowerCase() === s)
    );
  }
  if (filters.exCategory) {
    const exCats = splitFilter(filters.exCategory);
    result = result.filter((w) =>
      !exCats.some((cat) => w.meta.category.some((c) => c.toLowerCase() === cat))
    );
  }
  if (filters.exWarning) {
    const exWarns = splitFilter(filters.exWarning);
    result = result.filter((w) =>
      !exWarns.some((ex) => w.meta.warnings.some((wn) => wn.toLowerCase() === ex))
    );
  }

  // Sort
  const sortKey = filters.sort ?? 'updated';
  const order = filters.order ?? 'desc';

  result.sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    switch (sortKey) {
      case 'words':
        aVal = a.meta.words;
        bVal = b.meta.words;
        break;
      case 'published':
        aVal = a.meta.published;
        bVal = b.meta.published;
        break;
      case 'kudos':
        aVal = a.meta.kudos;
        bVal = b.meta.kudos;
        break;
      case 'hits':
        aVal = a.meta.hits;
        bVal = b.meta.hits;
        break;
      case 'bookmarks':
        aVal = a.meta.bookmarks;
        bVal = b.meta.bookmarks;
        break;
      case 'comments':
        aVal = a.meta.comments;
        bVal = b.meta.comments;
        break;
      default: // 'updated'
        aVal = a.meta.updated || a.meta.published;
        bVal = b.meta.updated || b.meta.published;
    }

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
}

interface SearchOption {
  name: string;
  count: number;
}

export interface SearchOptions {
  tags: SearchOption[];
  fandoms: SearchOption[];
  authors?: SearchOption[];
  characters?: SearchOption[];
  relationships?: SearchOption[];
  titles?: { title: string; slug: string }[];
}

export function buildSearchOptions(works: WorkSummary[]): SearchOptions {
  const tagMap = new Map<string, number>();
  const fandomMap = new Map<string, number>();
  const authorMap = new Map<string, number>();
  const charMap = new Map<string, number>();
  const relMap = new Map<string, number>();

  for (const w of works) {
    w.meta.tags.forEach((t) => tagMap.set(t, (tagMap.get(t) ?? 0) + 1));
    w.meta.fandom.forEach((f) => fandomMap.set(f, (fandomMap.get(f) ?? 0) + 1));
    if (w.meta.author) authorMap.set(w.meta.author, (authorMap.get(w.meta.author) ?? 0) + 1);
    w.meta.characters.forEach((c) => charMap.set(c, (charMap.get(c) ?? 0) + 1));
    w.meta.relationships.forEach((r) => relMap.set(r, (relMap.get(r) ?? 0) + 1));
  }

  const toSorted = (map: Map<string, number>, limit: number): SearchOption[] =>
    Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

  return {
    tags: toSorted(tagMap, 24),
    fandoms: toSorted(fandomMap, 50),
    authors: toSorted(authorMap, 12),
    characters: toSorted(charMap, 12),
    relationships: toSorted(relMap, 12),
    titles: works.map((w) => ({ title: w.meta.title, slug: w.slug })),
  };
}

// ── Vibe engine ────────────────────────────────────────────────────────────
// @TODO-DEV — VIBE_RULES below are hardcoded editorial keyword patterns.
//             This works well for the demo. Optional upgrade: replace buildVibeFilters()
//             with a semantic search API call for personalised / ML-powered matching.
//             If upgrading, remove the fake setTimeout in BrowseSearchBar.tsx (~line 147).
//             See: .claude/docs/wiring-guide.md#6-vibe-search-optional-upgrade

interface VibeRule {
  kw: string[];
  tags?: string[];
  exTags?: string[];
  exWarnings?: string[];
  ratings?: string[];
  maxWords?: number;
  desc: string;
}

const VIBE_RULES: VibeRule[] = [
  {
    kw: ['cozy', 'comfort', 'soft', 'fluffy', 'warm', 'gentle', 'wholesome'],
    tags: ['Fluff', 'Hurt/Comfort', 'Happy Ending'],
    exWarnings: ['Major Character Death'],
    desc: 'cozy comfort',
  },
  {
    kw: ['slow burn', 'slowburn', 'slow-burn', 'pining', 'ust', 'tension', 'longing', 'yearning'],
    tags: ['Slow Burn', 'Pining'],
    desc: 'slow burn',
  },
  {
    kw: ['angst', 'dark', 'sad', 'tragedy', 'hurt', 'angsty', 'grief', 'devastat'],
    tags: ['Angst'],
    ratings: ['Mature'],
    desc: 'angst / dark',
  },
  {
    kw: ['funny', 'humor', 'humour', 'crack', 'comedy', 'laugh', 'lighthearted', 'light-hearted'],
    tags: ['Humor', 'Crack'],
    ratings: ['General Audiences', 'Teen And Up Audiences'],
    desc: 'humor / crack',
  },
  {
    kw: ['enemies', 'rivals', 'hate to love', 'antagonist'],
    tags: ['Enemies to Lovers'],
    desc: 'enemies to lovers',
  },
  {
    kw: ['short', 'quick', 'one-shot', 'oneshot', 'fast', 'brief'],
    maxWords: 15000,
    desc: 'short read (< 15k words)',
  },
  {
    kw: ['no death', 'no major death', 'nobody dies', 'safe', 'no character death'],
    exWarnings: ['Major Character Death'],
    desc: 'no major deaths',
  },
  {
    kw: ['found family', 'family', 'ensemble', 'team', 'squad'],
    tags: ['Found Family'],
    desc: 'found family',
  },
];

export interface VibeResult {
  filters: Partial<FilterState>;
  desc: string;
  pills: { label: string; mode: 'include' | 'exclude' }[];
}

export function buildVibeFilters(query: string): VibeResult {
  const q = query.toLowerCase();
  const matched = VIBE_RULES.filter((rule) => rule.kw.some((kw) => q.includes(kw)));

  // No keyword match — fall back to a plain text search vibe
  if (matched.length === 0) {
    return {
      filters: { q: query.trim() },
      desc: `searching for "${query.trim()}"`,
      pills: [{ label: query.trim(), mode: 'include' }],
    };
  }

  const filters: Partial<FilterState> = {};
  const descs: string[] = [];
  const pills: VibeResult['pills'] = [];

  const incTags = new Set<string>();
  const exTagsSet = new Set<string>();
  const exWarns = new Set<string>();
  const incRatings = new Set<string>();

  for (const rule of matched) {
    descs.push(rule.desc);
    rule.tags?.forEach((t) => incTags.add(t));
    rule.exTags?.forEach((t) => exTagsSet.add(t));
    rule.exWarnings?.forEach((w) => exWarns.add(w));
    rule.ratings?.forEach((r) => incRatings.add(r));
    if (rule.maxWords) filters.maxWords = rule.maxWords;
  }

  if (incTags.size > 0) filters.tag = Array.from(incTags).join(',');
  if (exTagsSet.size > 0) filters.exTag = Array.from(exTagsSet).join(',');
  if (exWarns.size > 0) filters.exWarning = Array.from(exWarns).join(',');
  if (incRatings.size > 0) filters.rating = Array.from(incRatings).join(',');

  // Build deduplicated pills from the sets (no duplicates when multiple rules match)
  incTags.forEach((t) => pills.push({ label: t, mode: 'include' }));
  exTagsSet.forEach((t) => pills.push({ label: t, mode: 'exclude' }));
  exWarns.forEach((w) => pills.push({ label: w, mode: 'exclude' }));

  return { filters, desc: descs.join(', '), pills };
}

import { WorkSummary, FilterState } from '@/types';

export function applyFilters(works: WorkSummary[], filters: FilterState): WorkSummary[] {
  let result = [...works];

  // Text search across title, author, summary, tags
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter((w) => {
      return (
        w.meta.title.toLowerCase().includes(q) ||
        w.meta.author.toLowerCase().includes(q) ||
        w.meta.summary.toLowerCase().includes(q) ||
        w.meta.tags.some((t) => t.toLowerCase().includes(q)) ||
        w.meta.fandom.some((f) => f.toLowerCase().includes(q))
      );
    });
  }

  // Fandom filter
  if (filters.fandom) {
    result = result.filter((w) =>
      w.meta.fandom.some((f) => f.toLowerCase() === filters.fandom!.toLowerCase())
    );
  }

  // Relationship filter — matches any item in relationships[]
  if (filters.relationship) {
    const rel = filters.relationship.toLowerCase();
    result = result.filter((w) =>
      w.meta.relationships.some((r) => r.toLowerCase() === rel)
    );
  }

  // Tag filter — matches any item in tags[]
  if (filters.tag) {
    const tag = filters.tag.toLowerCase();
    result = result.filter((w) =>
      w.meta.tags.some((t) => t.toLowerCase() === tag)
    );
  }

  // Character filter — matches any item in characters[]
  if (filters.character) {
    const char = filters.character.toLowerCase();
    result = result.filter((w) =>
      w.meta.characters.some((c) => c.toLowerCase() === char)
    );
  }

  // Rating filter
  if (filters.rating) {
    result = result.filter(
      (w) => w.meta.rating.toLowerCase() === filters.rating!.toLowerCase()
    );
  }

  // Status filter
  if (filters.status) {
    result = result.filter(
      (w) => w.meta.status.toLowerCase() === filters.status!.toLowerCase()
    );
  }

  // ── Exclude filters — remove works that match these values ────────────────
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
    const ex = filters.exTag.toLowerCase();
    result = result.filter((w) =>
      !w.meta.tags.some((t) => t.toLowerCase() === ex)
    );
  }
  if (filters.exCharacter) {
    const ex = filters.exCharacter.toLowerCase();
    result = result.filter((w) =>
      !w.meta.characters.some((c) => c.toLowerCase() === ex)
    );
  }
  if (filters.exRating) {
    result = result.filter(
      (w) => w.meta.rating.toLowerCase() !== filters.exRating!.toLowerCase()
    );
  }
  if (filters.exStatus) {
    result = result.filter(
      (w) => w.meta.status.toLowerCase() !== filters.exStatus!.toLowerCase()
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

export interface FilterOptions {
  fandoms: string[];
  ratings: string[];
  statuses: string[];
}

export function buildFilterOptions(works: WorkSummary[]): FilterOptions {
  const fandoms = new Set<string>();
  const ratings = new Set<string>();
  const statuses = new Set<string>();

  for (const w of works) {
    w.meta.fandom.forEach((f) => fandoms.add(f));
    ratings.add(w.meta.rating);
    statuses.add(w.meta.status);
  }

  return {
    fandoms: Array.from(fandoms).sort(),
    ratings: Array.from(ratings).sort(),
    statuses: Array.from(statuses).sort(),
  };
}

export interface SearchOption {
  name: string;
  count: number;
}

export interface FeelingData {
  topTrope: { name: string; count: number; relatedTags: string[] } | null;
  activeFandom: { name: string; count: number } | null;
  shortCount: number;
}

export function buildFeelingData(works: WorkSummary[]): FeelingData {
  // Top trope: most common tag across all works
  const tagMap = new Map<string, number>();
  for (const w of works) {
    w.meta.tags.forEach((t) => tagMap.set(t, (tagMap.get(t) ?? 0) + 1));
  }
  const sortedTags = Array.from(tagMap.entries()).sort(([, a], [, b]) => b - a);

  let topTrope: FeelingData['topTrope'] = null;
  if (sortedTags.length > 0) {
    const [name, count] = sortedTags[0];
    const relatedMap = new Map<string, number>();
    works
      .filter((w) => w.meta.tags.includes(name))
      .forEach((w) =>
        w.meta.tags
          .filter((t) => t !== name)
          .forEach((t) => relatedMap.set(t, (relatedMap.get(t) ?? 0) + 1))
      );
    const relatedTags = Array.from(relatedMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([t]) => t);
    topTrope = { name, count, relatedTags };
  }

  // Active fandom: fandom with the most recent update date
  const fandomLastUpdate = new Map<string, string>();
  const fandomCount = new Map<string, number>();
  for (const w of works) {
    const date = w.meta.updated || w.meta.published;
    w.meta.fandom.forEach((f) => {
      const cur = fandomLastUpdate.get(f);
      if (!cur || date > cur) fandomLastUpdate.set(f, date);
      fandomCount.set(f, (fandomCount.get(f) ?? 0) + 1);
    });
  }
  const activeFandomEntry = Array.from(fandomLastUpdate.entries()).sort(([, a], [, b]) =>
    a > b ? -1 : 1
  )[0];
  const activeFandom = activeFandomEntry
    ? { name: activeFandomEntry[0], count: fandomCount.get(activeFandomEntry[0]) ?? 0 }
    : null;

  // Short works: complete works ≤ 15k words
  const shortCount = works.filter(
    (w) =>
      w.meta.words > 0 &&
      w.meta.words <= 15000 &&
      !w.meta.status.toLowerCase().includes('progress') &&
      w.meta.status.toLowerCase() !== 'wip'
  ).length;

  return { topTrope, activeFandom, shortCount };
}

export interface SearchOptions {
  tags: SearchOption[];
  fandoms: SearchOption[];
}

export function buildSearchOptions(works: WorkSummary[]): SearchOptions {
  const tagMap = new Map<string, number>();
  const fandomMap = new Map<string, number>();

  for (const w of works) {
    w.meta.tags.forEach((t) => tagMap.set(t, (tagMap.get(t) ?? 0) + 1));
    w.meta.fandom.forEach((f) => fandomMap.set(f, (fandomMap.get(f) ?? 0) + 1));
  }

  const tags = Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 24);

  const fandoms = Array.from(fandomMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { tags, fandoms };
}

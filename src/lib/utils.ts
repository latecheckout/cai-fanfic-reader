import { ratingTier } from './ratings';

/** Estimate reading time in minutes at 250wpm */
export function readingTime(words: number): string {
  const minutes = Math.round(words / 250);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

/** Format numbers with k suffix */
export function formatWords(words: number): string {
  if (words >= 1000) return `${(words / 1000).toFixed(1)}k words`;
  return `${words} words`;
}

/** Format count with k/M suffix for social stats */
export function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/** Return CSS class key for rating dot (see RATING_TIERS for the source of truth). */
export function ratingClass(rating: string): string {
  return ratingTier(rating).classKey;
}

/**
 * Format chapters as AO3-style "X/Y" or "X/?" string.
 * chaptersPosted: how many are available; chaptersTotal: 0 = unknown/open-ended.
 */
export function formatChapters(
  chaptersPosted: number | undefined,
  chaptersTotal: number
): string {
  const posted = chaptersPosted ?? chaptersTotal;
  if (chaptersTotal === 0) return `${posted}/?`;
  if (posted === chaptersTotal) return `${chaptersTotal} ch.`;
  return `${posted}/${chaptersTotal}`;
}

/** Word tier 1–4 for length bars (< 5k / 5k–25k / 25k–75k / 75k+) */
export function wordTier(words: number): 1 | 2 | 3 | 4 {
  if (words < 5000) return 1;
  if (words < 25000) return 2;
  if (words < 75000) return 3;
  return 4;
}

/** Short label from AO3-style category array.
 *  Returns '' for Gen — the absence of ships already signals it. */
export function categoryLabel(cats: string[]): string {
  if (!cats || cats.length === 0) return '';
  const normalized = cats.map((c) => c.trim());
  if (normalized.includes('F/M')) return 'F/M';
  if (normalized.includes('M/M')) return 'M/M';
  if (normalized.includes('F/F')) return 'F/F';
  if (normalized.includes('Multi')) return 'Multi';
  // Gen = no pairing; the missing Ships row already signals this
  return '';
}

/** True when a work is still being posted (any "in progress" phrasing). */
export function isWipStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes('progress') || s === 'wip' || s === 'in-progress';
}

/**
 * Split a summary into sentences and keep the first `max`. Returns the shown
 * text plus whether anything was trimmed (so callers can offer "see more").
 */
export function truncateSummary(summary: string, max = 4): { text: string; hasMore: boolean } {
  const sentences = summary.match(/[^.!?]+[.!?]+/g) ?? (summary ? [summary] : []);
  const hasMore = sentences.length > max;
  return { text: hasMore ? sentences.slice(0, max).join('').trim() : summary, hasMore };
}

/** Drop a leading "Chapter N:" from a title — the number is already shown separately. */
export function stripChapterPrefix(title: string): string {
  return title.replace(/^\s*chapter\s+\d+\s*:\s*/i, '') || title;
}

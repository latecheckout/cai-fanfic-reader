import { PRESETS_KEY } from './constants';

/**
 * Shared filter-URL helpers used by both BrowseSearchBar and FilterPanel.
 * Single source of truth for comma-list mutation, 3-state pill resolution, and
 * saved-preset persistence (previously duplicated in both components).
 */

export interface Preset {
  name: string;
  params: string;
  isDefault?: boolean;
}

export function loadPresets(): Preset[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(PRESETS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function savePresetsToStorage(presets: Preset[]) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

/** Apply a SortDropdown `sort:order` value onto params. */
export function setSortParam(params: URLSearchParams, value: string) {
  const [sort, order] = value.split(':');
  params.set('sort', sort);
  params.set('order', order);
}

/** Params for applying a saved preset — carries the current tab across. */
export function presetToParams(preset: Preset, currentTab: string | null): URLSearchParams {
  const p = new URLSearchParams(preset.params);
  if (currentTab) p.set('tab', currentTab);
  p.set('preset', preset.name);
  return p;
}

/** Append a value to a comma-separated param (case-insensitive dedupe). */
export function addToCommaList(current: string | undefined, value: string): string {
  if (!current) return value;
  const parts = current.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.map((p) => p.toLowerCase()).includes(value.toLowerCase())) return current;
  return [...parts, value].join(',');
}

/** Remove a value from a comma-separated param (case-insensitive). */
export function removeFromCommaList(current: string | undefined, value: string): string {
  if (!current) return '';
  const parts = current
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.toLowerCase() !== value.toLowerCase());
  return parts.join(',');
}

/** Resolve a value's 3-state pill status from its include/exclude params. */
export function getPillState(
  value: string,
  incParam: string | undefined,
  exParam: string | undefined
): 'neutral' | 'include' | 'exclude' {
  if (incParam) {
    const parts = incParam.split(',').map((s) => s.trim().toLowerCase());
    if (parts.includes(value.toLowerCase())) return 'include';
  }
  if (exParam) {
    const parts = exParam.split(',').map((s) => s.trim().toLowerCase());
    if (parts.includes(value.toLowerCase())) return 'exclude';
  }
  return 'neutral';
}

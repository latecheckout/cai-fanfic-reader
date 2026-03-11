'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterOptions, SearchOptions } from '@/lib/filters';
import { CustomSelect } from './CustomSelect';
import styles from '@/styles/components/FilterPanel.module.css';

interface Props {
  options: FilterOptions;
  searchOptions?: SearchOptions;
  currentFilters: {
    fandom?: string;
    relationship?: string;
    tag?: string;
    character?: string;
    rating?: string;
    status?: string;
    category?: string;
    language?: string;
    warning?: string;
    sort?: string;
    order?: string;
    q?: string;
    ex_fandom?: string;
    ex_tag?: string;
    ex_relationship?: string;
    ex_character?: string;
    ex_rating?: string;
    ex_status?: string;
    ex_category?: string;
    ex_warning?: string;
    min_words?: string;
    max_words?: string;
    date_preset?: string;
    date_from?: string;
    date_to?: string;
  };
  totalCount: number;
  filteredCount: number;
  view?: 'default' | 'split';
  onViewChange?: (v: 'default' | 'split') => void;
}

// Standard AO3 filter values
const RATINGS = ['General Audiences', 'Teen And Up Audiences', 'Mature', 'Explicit', 'Not Rated'];
const RATING_LABELS: Record<string, string> = {
  'General Audiences': 'G',
  'Teen And Up Audiences': 'T',
  'Mature': 'M',
  'Explicit': 'E',
  'Not Rated': 'NR',
};
const CATEGORIES = ['F/F', 'F/M', 'Gen', 'M/M', 'Multi', 'Other'];
const STATUSES = ['Complete', 'In Progress'];
const WARNINGS = [
  'Major Character Death',
  'Graphic Depictions Of Violence',
  'Non-Con',
  'Underage',
  'Creator Chose Not To Use Archive Warnings',
];
const WARNING_LABELS: Record<string, string> = {
  'Major Character Death': 'Major Death',
  'Graphic Depictions Of Violence': 'Graphic Violence',
  'Non-Con': 'Non-Con',
  'Underage': 'Underage',
  'Creator Chose Not To Use Archive Warnings': 'Choose Not To Warn',
};
const WORD_PRESETS = [
  { label: '< 1k', min: undefined as number | undefined, max: 1000 as number | undefined },
  { label: '1k–5k', min: 1000, max: 5000 },
  { label: '5k–30k', min: 5000, max: 30000 },
  { label: '30k–100k', min: 30000, max: 100000 },
  { label: '> 100k', min: 100000, max: undefined },
];
const DATE_PRESETS = [
  { label: 'Last week', value: 'last_week' },
  { label: 'Last month', value: 'last_month' },
  { label: 'Last year', value: 'last_year' },
];
const SORT_OPTIONS = [
  { value: 'updated:desc', label: 'recently updated' },
  { value: 'published:desc', label: 'newest first' },
  { value: 'kudos:desc', label: 'most kudos' },
  { value: 'words:desc', label: 'longest first' },
  { value: 'words:asc', label: 'shortest first' },
];

interface Preset {
  name: string;
  params: string;
  isDefault?: boolean;
}

const PRESETS_KEY = 'cai_fanfic_presets';

function loadPresets(): Preset[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(PRESETS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function savePresetsToStorage(presets: Preset[]) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function addToCommaList(current: string | undefined, value: string): string {
  if (!current) return value;
  const parts = current.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.map((p) => p.toLowerCase()).includes(value.toLowerCase())) return current;
  return [...parts, value].join(',');
}

function removeFromCommaList(current: string | undefined, value: string): string {
  if (!current) return '';
  const parts = current
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.toLowerCase() !== value.toLowerCase());
  return parts.join(',');
}

function getPillState(
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

export function FilterPanel({
  options: _options,
  searchOptions: _searchOptions,
  currentFilters,
  totalCount,
  filteredCount,
  view,
  onViewChange,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wordMin, setWordMin] = useState(currentFilters.min_words ?? '');
  const [wordMax, setWordMax] = useState(currentFilters.max_words ?? '');
  const [dateFrom, setDateFrom] = useState(currentFilters.date_from ?? '');
  const [dateTo, setDateTo] = useState(currentFilters.date_to ?? '');
  const [presets, setPresets] = useState<Preset[]>([]);
  const [saveFormOpen, setSaveFormOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  // Save bar (appears inline next to "clear all")
  const [saveBarOpen, setSaveBarOpen] = useState(false);
  const [saveBarName, setSaveBarName] = useState('');
  const wordDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync word inputs with URL params
  useEffect(() => {
    setWordMin(currentFilters.min_words ?? '');
    setWordMax(currentFilters.max_words ?? '');
  }, [currentFilters.min_words, currentFilters.max_words]);

  // Sync date inputs with URL params
  useEffect(() => {
    setDateFrom(currentFilters.date_from ?? '');
    setDateTo(currentFilters.date_to ?? '');
  }, [currentFilters.date_from, currentFilters.date_to]);

  // Load presets from localStorage on mount
  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  // Apply default preset on first load when no URL params
  useEffect(() => {
    const hasParams = searchParams.toString().length > 0;
    if (!hasParams) {
      const loaded = loadPresets();
      const def = loaded.find((p) => p.isDefault);
      if (def) router.push(`/?${def.params}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // F key toggles drawer; Esc closes drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (
          tag === 'input' ||
          tag === 'textarea' ||
          (e.target as HTMLElement)?.isContentEditable
        ) return;
        e.preventDefault();
        setDrawerOpen((d) => !d);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSortChange = useCallback(
    (v: string) => {
      const [sort, order] = v.split(':');
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', sort);
      params.set('order', order);
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  // 3-state pill cycling: neutral → include → exclude → neutral
  const cyclePill = useCallback(
    (value: string, incKey: string, exKey: string) => {
      const cf = currentFilters as Record<string, string | undefined>;
      const state = getPillState(value, cf[incKey], cf[exKey]);
      const params = new URLSearchParams(searchParams.toString());

      if (state === 'neutral') {
        params.set(incKey, addToCommaList(cf[incKey], value));
      } else if (state === 'include') {
        const newInc = removeFromCommaList(cf[incKey], value);
        if (newInc) params.set(incKey, newInc);
        else params.delete(incKey);
        params.set(exKey, addToCommaList(cf[exKey], value));
      } else {
        const newEx = removeFromCommaList(cf[exKey], value);
        if (newEx) params.set(exKey, newEx);
        else params.delete(exKey);
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams, currentFilters]
  );

  // Word count presets
  const applyWordPreset = (min?: number, max?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min != null) params.set('min_words', String(min));
    else params.delete('min_words');
    if (max != null) params.set('max_words', String(max));
    else params.delete('max_words');
    router.push(`/?${params.toString()}`);
  };

  // Word count custom inputs (debounced 400ms)
  const handleWordInput = (min: string, max: string) => {
    setWordMin(min);
    setWordMax(max);
    if (wordDebounceRef.current) clearTimeout(wordDebounceRef.current);
    wordDebounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (min) params.set('min_words', min);
      else params.delete('min_words');
      if (max) params.set('max_words', max);
      else params.delete('max_words');
      router.push(`/?${params.toString()}`);
    }, 400);
  };

  // Date preset
  const applyDatePreset = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('date_preset', value);
      params.delete('date_from');
      params.delete('date_to');
    } else {
      params.delete('date_preset');
    }
    router.push(`/?${params.toString()}`);
  };

  // Date custom range
  const applyDateCustom = (from: string, to: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('date_preset');
    if (from) params.set('date_from', from);
    else params.delete('date_from');
    if (to) params.set('date_to', to);
    else params.delete('date_to');
    router.push(`/?${params.toString()}`);
  };

  // Saved presets (drawer)
  const savePreset = () => {
    if (!saveName.trim()) return;
    const updated = [...presets, { name: saveName.trim(), params: searchParams.toString() }];
    setPresets(updated);
    savePresetsToStorage(updated);
    setSaveName('');
    setSaveFormOpen(false);
  };

  // Save bar preset (inline in filter bar)
  const saveBarPreset = () => {
    if (!saveBarName.trim()) return;
    const updated = [...presets, { name: saveBarName.trim(), params: searchParams.toString() }];
    setPresets(updated);
    savePresetsToStorage(updated);
    setSaveBarName('');
    setSaveBarOpen(false);
  };

  const deletePreset = (idx: number) => {
    const updated = presets.filter((_, i) => i !== idx);
    setPresets(updated);
    savePresetsToStorage(updated);
  };

  const toggleDefault = (idx: number) => {
    const updated = presets.map((p, i) => ({
      ...p,
      isDefault: i === idx ? !p.isDefault : false,
    }));
    setPresets(updated);
    savePresetsToStorage(updated);
  };

  const applyPreset = (preset: Preset) => {
    router.push(`/?${preset.params}`);
    setDrawerOpen(false);
  };

  const clearAll = () => router.push('/');

  const hasActiveFilters = !!(
    currentFilters.fandom || currentFilters.relationship || currentFilters.tag ||
    currentFilters.character || currentFilters.rating || currentFilters.status ||
    currentFilters.q || currentFilters.category || currentFilters.language ||
    currentFilters.warning || currentFilters.min_words || currentFilters.max_words ||
    currentFilters.ex_fandom || currentFilters.ex_relationship || currentFilters.ex_tag ||
    currentFilters.ex_character || currentFilters.ex_rating || currentFilters.ex_status ||
    currentFilters.ex_category || currentFilters.ex_warning ||
    currentFilters.date_preset || currentFilters.date_from || currentFilters.date_to
  );

  const currentSortValue = `${currentFilters.sort ?? 'updated'}:${currentFilters.order ?? 'desc'}`;

  // Build active/exclude pills for bar display
  const activePills: { key: string; label: string }[] = [];
  if (currentFilters.fandom) activePills.push({ key: 'fandom', label: currentFilters.fandom });
  if (currentFilters.relationship) activePills.push({ key: 'relationship', label: currentFilters.relationship });
  if (currentFilters.tag) activePills.push({ key: 'tag', label: currentFilters.tag });
  if (currentFilters.character) activePills.push({ key: 'character', label: currentFilters.character });
  if (currentFilters.rating) activePills.push({ key: 'rating', label: currentFilters.rating });
  if (currentFilters.status) activePills.push({ key: 'status', label: currentFilters.status });
  if (currentFilters.category) activePills.push({ key: 'category', label: currentFilters.category });
  if (currentFilters.warning) activePills.push({ key: 'warning', label: currentFilters.warning });
  if (currentFilters.q) activePills.push({ key: 'q', label: `"${currentFilters.q}"` });

  const excludePills: { key: string; label: string }[] = [];
  if (currentFilters.ex_fandom) excludePills.push({ key: 'ex_fandom', label: currentFilters.ex_fandom });
  if (currentFilters.ex_tag) excludePills.push({ key: 'ex_tag', label: currentFilters.ex_tag });
  if (currentFilters.ex_relationship) excludePills.push({ key: 'ex_relationship', label: currentFilters.ex_relationship });
  if (currentFilters.ex_character) excludePills.push({ key: 'ex_character', label: currentFilters.ex_character });
  if (currentFilters.ex_rating) excludePills.push({ key: 'ex_rating', label: currentFilters.ex_rating });
  if (currentFilters.ex_status) excludePills.push({ key: 'ex_status', label: currentFilters.ex_status });
  if (currentFilters.ex_category) excludePills.push({ key: 'ex_category', label: currentFilters.ex_category });
  if (currentFilters.ex_warning) excludePills.push({ key: 'ex_warning', label: currentFilters.ex_warning });

  // Active word preset detection
  const activeWordPreset = WORD_PRESETS.find(
    (p) =>
      String(p.min ?? '') === (currentFilters.min_words ?? '') &&
      String(p.max ?? '') === (currentFilters.max_words ?? '')
  );

  return (
    <>
      <div className={styles.bar}>
        {/* Left: active pills + add/clear */}
        <div className={styles.barLeft}>
          {activePills.map((pill) => (
            <button
              key={pill.key}
              className={styles.pill}
              onClick={() => updateFilter(pill.key, '')}
              title={`Remove filter: ${pill.label}`}
            >
              {pill.label}
              <span className={styles.pillX} aria-hidden="true">×</span>
            </button>
          ))}
          {excludePills.map((pill) => (
            <button
              key={pill.key}
              className={`${styles.pill} ${styles.excludePill}`}
              onClick={() => updateFilter(pill.key, '')}
              title={`Remove exclude filter: ${pill.label}`}
            >
              {pill.label}
              <span className={styles.pillX} aria-hidden="true">×</span>
            </button>
          ))}
          <button
            className={styles.addFilterBtn}
            onClick={() => setDrawerOpen(true)}
            aria-label="Add filter"
          >
            + filter
          </button>
          {hasActiveFilters && (
            <>
              <button className={styles.clearAllBtn} onClick={clearAll}>
                clear all
              </button>
              {/* Inline save bar */}
              {!saveBarOpen ? (
                <button
                  className={styles.saveBarBtn}
                  onClick={() => setSaveBarOpen(true)}
                >
                  save
                </button>
              ) : (
                <form
                  className={styles.saveBarForm}
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveBarPreset();
                  }}
                >
                  <input
                    autoFocus
                    type="text"
                    className={styles.saveBarInput}
                    placeholder="name this filter…"
                    value={saveBarName}
                    onChange={(e) => setSaveBarName(e.target.value)}
                  />
                  <button type="submit" className={styles.saveBarSave}>save</button>
                  <button
                    type="button"
                    className={styles.saveBarCancel}
                    onClick={() => setSaveBarOpen(false)}
                    aria-label="Cancel"
                  >
                    ×
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Right: view toggle + count + sort */}
        <div className={styles.barRight}>
          {onViewChange && (
            <div className={styles.viewToggle} aria-label="View layout">
              <button
                type="button"
                className={`${styles.viewBtn} ${view === 'default' ? styles.viewBtnActive : ''}`}
                onClick={() => onViewChange('default')}
                aria-label="Default view"
                aria-pressed={view === 'default'}
                title="Default view"
              >
                <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
                  <rect x="0" y="0" width="14" height="1.5" fill="currentColor" />
                  <rect x="0" y="5.25" width="14" height="1.5" fill="currentColor" />
                  <rect x="0" y="10.5" width="14" height="1.5" fill="currentColor" />
                </svg>
              </button>
              <button
                type="button"
                className={`${styles.viewBtn} ${view === 'split' ? styles.viewBtnActive : ''}`}
                onClick={() => onViewChange('split')}
                aria-label="Split view"
                aria-pressed={view === 'split'}
                title="Split view"
              >
                <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
                  <rect x="0" y="0" width="6" height="12" fill="currentColor" />
                  <rect x="8" y="0" width="6" height="12" fill="currentColor" />
                </svg>
              </button>
            </div>
          )}
          <span className={styles.workCount}>
            {filteredCount === totalCount
              ? `${totalCount} works`
              : `${filteredCount} of ${totalCount}`}
          </span>
          <CustomSelect
            value={currentSortValue}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {/* Filter Drawer — right-side slide panel */}
      {drawerOpen && (
        <>
          <div
            className={styles.drawerBackdrop}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.drawer} role="dialog" aria-label="Filter options">

            {/* Header */}
            <div className={styles.drawerHeader}>
              <span className={styles.drawerHeaderTitle}>Filters</span>
              <button
                className={styles.drawerCloseBtn}
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
              >
                ×
              </button>
            </div>

            {/* Scrollable body */}
            <div className={styles.drawerBody}>

              {/* Rating */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerLabel}>Rating</span>
                <div className={styles.drawerPills}>
                  {RATINGS.map((r) => {
                    const state = getPillState(r, currentFilters.rating, currentFilters.ex_rating);
                    return (
                      <button
                        key={r}
                        className={`${styles.dPill} ${state === 'include' ? styles.dPillInclude : state === 'exclude' ? styles.dPillExclude : ''}`}
                        onClick={() => cyclePill(r, 'rating', 'ex_rating')}
                        title={state === 'neutral' ? `Include: ${r}` : state === 'include' ? `Exclude: ${r}` : `Remove: ${r}`}
                      >
                        {RATING_LABELS[r] ?? r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Warnings */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerLabel}>Warnings</span>
                <div className={styles.drawerPills}>
                  {WARNINGS.map((w) => {
                    const state = getPillState(w, currentFilters.warning, currentFilters.ex_warning);
                    return (
                      <button
                        key={w}
                        className={`${styles.dPill} ${state === 'include' ? styles.dPillInclude : state === 'exclude' ? styles.dPillExclude : ''}`}
                        onClick={() => cyclePill(w, 'warning', 'ex_warning')}
                      >
                        {WARNING_LABELS[w] ?? w}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerLabel}>Category</span>
                <div className={styles.drawerPills}>
                  {CATEGORIES.map((c) => {
                    const state = getPillState(c, currentFilters.category, currentFilters.ex_category);
                    return (
                      <button
                        key={c}
                        className={`${styles.dPill} ${state === 'include' ? styles.dPillInclude : state === 'exclude' ? styles.dPillExclude : ''}`}
                        onClick={() => cyclePill(c, 'category', 'ex_category')}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerLabel}>Status</span>
                <div className={styles.drawerPills}>
                  {STATUSES.map((s) => {
                    const state = getPillState(s, currentFilters.status, currentFilters.ex_status);
                    return (
                      <button
                        key={s}
                        className={`${styles.dPill} ${state === 'include' ? styles.dPillInclude : state === 'exclude' ? styles.dPillExclude : ''}`}
                        onClick={() => cyclePill(s, 'status', 'ex_status')}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className={styles.drawerDivider} />

              {/* Words */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerLabel}>Words</span>
                <div className={styles.drawerRightCol}>
                  <div className={styles.drawerPills}>
                    {WORD_PRESETS.map((p) => {
                      const isActive = activeWordPreset?.label === p.label;
                      return (
                        <button
                          key={p.label}
                          className={`${styles.dPill} ${isActive ? styles.dPillInclude : ''}`}
                          onClick={() =>
                            isActive
                              ? applyWordPreset(undefined, undefined)
                              : applyWordPreset(p.min, p.max)
                          }
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className={styles.wcRange}>
                    <input
                      type="number"
                      className={styles.wcInput}
                      placeholder="min"
                      value={wordMin}
                      onChange={(e) => handleWordInput(e.target.value, wordMax)}
                    />
                    <span className={styles.wcSep}>–</span>
                    <input
                      type="number"
                      className={styles.wcInput}
                      placeholder="max"
                      value={wordMax}
                      onChange={(e) => handleWordInput(wordMin, e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Updated */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerLabel}>Updated</span>
                <div className={styles.drawerRightCol}>
                  <div className={styles.drawerPills}>
                    {DATE_PRESETS.map((d) => {
                      const isActive = currentFilters.date_preset === d.value;
                      return (
                        <button
                          key={d.value}
                          className={`${styles.dPill} ${isActive ? styles.dPillInclude : ''}`}
                          onClick={() => applyDatePreset(isActive ? '' : d.value)}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className={styles.dateCustom}>
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        applyDateCustom(e.target.value, dateTo);
                      }}
                    />
                    <span className={styles.wcSep}>–</span>
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        applyDateCustom(dateFrom, e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Saved filters — always visible, no toggle */}
              {(presets.length > 0 || true) && (
                <>
                  <hr className={styles.drawerDivider} />
                  <div className={styles.drawerSection}>
                    <span className={styles.drawerLabel}>Saved</span>
                    <div className={styles.savedBody}>
                      {presets.map((preset, idx) => (
                        <div key={idx} className={styles.presetRow}>
                          <button className={styles.presetName} onClick={() => applyPreset(preset)}>
                            {preset.name}
                          </button>
                          <button
                            className={`${styles.presetDefaultBtn} ${preset.isDefault ? styles.presetDefaultBtnActive : ''}`}
                            onClick={() => toggleDefault(idx)}
                            title={preset.isDefault ? 'Remove default' : 'Set as default'}
                          >
                            {preset.isDefault ? '★' : '☆'}
                          </button>
                          <button
                            className={styles.presetDeleteBtn}
                            onClick={() => deletePreset(idx)}
                            aria-label={`Delete ${preset.name}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <div className={styles.savePresetRow}>
                        {!saveFormOpen ? (
                          <button
                            className={styles.savePresetTrigger}
                            onClick={() => setSaveFormOpen(true)}
                          >
                            + save current filters
                          </button>
                        ) : (
                          <form
                            className={styles.savePresetForm}
                            onSubmit={(e) => {
                              e.preventDefault();
                              savePreset();
                            }}
                          >
                            <input
                              autoFocus
                              type="text"
                              className={styles.savePresetInput}
                              placeholder="Preset name"
                              value={saveName}
                              onChange={(e) => setSaveName(e.target.value)}
                            />
                            <button type="submit" className={styles.savePresetSubmit}>
                              Save
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Sticky footer */}
            <div className={styles.drawerFooter}>
              <button className={styles.drawerFooterClear} onClick={clearAll}>
                Clear all
              </button>
              <button
                className={styles.drawerShowBtn}
                onClick={() => setDrawerOpen(false)}
              >
                Show {filteredCount} work{filteredCount !== 1 ? 's' : ''}
              </button>
            </div>

          </div>
        </>
      )}
    </>
  );
}

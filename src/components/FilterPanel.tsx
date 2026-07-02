'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterOptions, SearchOptions } from '@/lib/filters';
import { BrowseSearchBar } from './BrowseSearchBar';
import styles from '@/styles/components/FilterPanel.module.css';
import { PRESETS_KEY, RATINGS, WARNINGS, CATEGORIES, STATUSES } from '@/lib/constants';

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
    preset?: string;
  };
  totalCount: number;
  filteredCount: number;
  /** Base path for filter navigation. Defaults to '/' (browse page). Pass '/reading' for library page. */
  basePath?: string;
}

const RATING_LABELS: Record<string, string> = {
  'General Audiences': 'G',
  'Teen And Up Audiences': 'T',
  'Mature': 'M',
  'Explicit': 'E',
  'Not Rated': 'NR',
};
const RATING_KEYS: Record<string, string> = {
  'General Audiences': 'g',
  'Teen And Up Audiences': 't',
  'Mature': 'm',
  'Explicit': 'e',
  'Not Rated': 'nr',
};
const RATING_SHORT_NAMES: Record<string, string> = {
  'General Audiences': 'General',
  'Teen And Up Audiences': 'Teen+',
  'Mature': 'Mature',
  'Explicit': 'Explicit',
  'Not Rated': 'Not Rated',
};
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
  { value: 'updated:desc', label: 'Recently updated' },
  { value: 'published:desc', label: 'Newest first' },
  { value: 'kudos:desc', label: 'Most kudos' },
  { value: 'words:desc', label: 'Longest first' },
  { value: 'words:asc', label: 'Shortest first' },
];

interface Preset {
  name: string;
  params: string;
}

interface ActivePill {
  id: string;
  paramKey: string;
  value: string;
  label: string;
  isExclude: boolean;
  canToggle: boolean;
}

// Maps each filter param key to its include/exclude counterpart
const INC_EX_MAP: Record<string, { incKey: string; exKey: string } | null> = {
  fandom: { incKey: 'fandom', exKey: 'ex_fandom' },
  ex_fandom: { incKey: 'fandom', exKey: 'ex_fandom' },
  relationship: { incKey: 'relationship', exKey: 'ex_relationship' },
  ex_relationship: { incKey: 'relationship', exKey: 'ex_relationship' },
  tag: { incKey: 'tag', exKey: 'ex_tag' },
  ex_tag: { incKey: 'tag', exKey: 'ex_tag' },
  character: { incKey: 'character', exKey: 'ex_character' },
  ex_character: { incKey: 'character', exKey: 'ex_character' },
  rating: { incKey: 'rating', exKey: 'ex_rating' },
  ex_rating: { incKey: 'rating', exKey: 'ex_rating' },
  status: { incKey: 'status', exKey: 'ex_status' },
  ex_status: { incKey: 'status', exKey: 'ex_status' },
  category: { incKey: 'category', exKey: 'ex_category' },
  ex_category: { incKey: 'category', exKey: 'ex_category' },
  warning: { incKey: 'warning', exKey: 'ex_warning' },
  ex_warning: { incKey: 'warning', exKey: 'ex_warning' },
  q: null,
};

function parsePresetParams(params: string): string {
  const p = new URLSearchParams(params);
  const parts: string[] = [];
  const tag = p.get('tag');
  if (tag) tag.split(',').slice(0, 2).forEach((t) => parts.push(t.trim()));
  const rating = p.get('rating');
  if (rating) rating.split(',').slice(0, 2).forEach((r) => {
    const label = { 'General Audiences': 'G', 'Teen And Up Audiences': 'T', 'Mature': 'M', 'Explicit': 'E', 'Not Rated': 'NR' }[r.trim()];
    if (label) parts.push(label);
  });
  const category = p.get('category');
  if (category) category.split(',').slice(0, 2).forEach((c) => parts.push(c.trim()));
  const status = p.get('status');
  if (status) parts.push(status.split(',')[0].trim());
  const maxWords = p.get('max_words');
  if (maxWords) parts.push(`≤${Number(maxWords).toLocaleString()} words`);
  const minWords = p.get('min_words');
  if (minWords && !maxWords) parts.push(`≥${Number(minWords).toLocaleString()} words`);
  const result = parts.join(' · ');
  return result.length > 42 ? result.slice(0, 42) + '…' : result;
}

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
  totalCount: _totalCount,
  filteredCount,
  basePath = '/',
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
  // Flip animation
  const [flippedPills, setFlippedPills] = useState<Set<string>>(new Set());
  // Exit animation — IDs of pills currently animating out
  const [exitingPills, setExitingPills] = useState<Set<string>>(new Set());
  const exitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Custom expanders
  const [wordsCustomOpen, setWordsCustomOpen] = useState(false);
  const [dateCustomOpen, setDateCustomOpen] = useState(false);
  // Saved filters polish
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drawer section collapse state (persisted to localStorage)
  const SECTIONS_KEY = 'cai_drawer_sections';
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SECTIONS_KEY) ?? '{}');
      setCollapsedSections(saved);
    } catch { /* ignore */ }
  }, []);
  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(SECTIONS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  const isSectionOpen = (key: string) => !collapsedSections[key];
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const wordDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const drawerCloseBtnRef = useRef<HTMLButtonElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const savePopoverRef = useRef<HTMLDivElement>(null);
  const savePresetBtnRef = useRef<HTMLButtonElement>(null);
  const popoverBtnRect = useRef<DOMRect | null>(null);
  // Whatever had focus when the drawer opened (the filter toggle) — restored on close.
  const drawerOpenerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Slide-out animation helper — replaces all setDrawerOpen(false) calls
  const closeDrawer = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setDrawerOpen(false);
      setDrawerClosing(false);
      // Return focus to the trigger so keyboard users resume in place (2.4.3).
      drawerOpenerRef.current?.focus?.();
    }, 200);
  }, []);

  // IntersectionObserver: add data-stuck to bar when sentinel scrolls out of view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const bar = barRef.current;
    if (!sentinel || !bar) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          bar.setAttribute('data-stuck', '');
        } else {
          bar.removeAttribute('data-stuck');
        }
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Push panel — shift body right so content slides left when drawer opens
  useEffect(() => {
    if (drawerOpen && !isMobile) {
      document.body.classList.add('filter-open');
    } else {
      document.body.classList.remove('filter-open');
    }
    return () => document.body.classList.remove('filter-open');
  }, [drawerOpen, isMobile]);

  // Focus close button when drawer opens (capturing the opener for focus-return)
  useEffect(() => {
    if (drawerOpen) {
      drawerOpenerRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => drawerCloseBtnRef.current?.focus());
    }
  }, [drawerOpen]);

  // Focus first sort option when sort opens
  useEffect(() => {
    if (sortOpen) {
      const first = sortRef.current?.querySelector<HTMLButtonElement>('button');
      requestAnimationFrame(() => first?.focus());
    }
  }, [sortOpen]);

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

  // Pre-open custom expanders if custom values already in URL
  useEffect(() => {
    const hasCustomWords = !!(currentFilters.min_words || currentFilters.max_words);
    const isWordPreset = WORD_PRESETS.some(
      (p) =>
        String(p.min ?? '') === (currentFilters.min_words ?? '') &&
        String(p.max ?? '') === (currentFilters.max_words ?? '')
    );
    if (hasCustomWords && !isWordPreset) setWordsCustomOpen(true);

    const hasCustomDate = !!(currentFilters.date_from || currentFilters.date_to);
    if (hasCustomDate) setDateCustomOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No push-panel — drawer is pure overlay

  // Click-away handler for drawer — mobile only (desktop uses push panel, no click-away)
  useEffect(() => {
    if (!drawerOpen) return;
    const isDesktop = window.matchMedia('(min-width: 1080px)').matches;
    if (isDesktop) return;
    const handler = (e: MouseEvent) => {
      const drawer = document.querySelector('[data-filter-drawer]');
      if (drawer && !drawer.contains(e.target as Node)) {
        closeDrawer();
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [drawerOpen, closeDrawer]);

  // F key toggles drawer; S key toggles sort; Esc closes both
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (sortOpen) { setSortOpen(false); return; }
        if (drawerOpen) { closeDrawer(); return; }
      }
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;
      if (isInput) return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setDrawerOpen((d) => !d);
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSortOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [drawerOpen, sortOpen, closeDrawer]);

  // Click-outside closes save popover
  useEffect(() => {
    if (!saveFormOpen) return;
    const handler = (e: MouseEvent) => {
      if (savePopoverRef.current && !savePopoverRef.current.contains(e.target as Node)) {
        setSaveFormOpen(false);
        setSaveName('');
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [saveFormOpen]);

  // Click-outside closes sort dropdown
  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [sortOpen]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSortChange = useCallback(
    (v: string) => {
      const [sort, order] = v.split(':');
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', sort);
      params.set('order', order);
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams]
  );

  // 3-state pill cycling: neutral → include → exclude → neutral
  const cyclePill = useCallback(
    (value: string, incKey: string, exKey: string) => {
      const cf = currentFilters as Record<string, string | undefined>;
      const state = getPillState(value, cf[incKey], cf[exKey]);

      // Trigger flip animation on include → exclude
      if (state === 'include') {
        setFlippedPills((prev) => new Set([...prev, value]));
        setTimeout(() => {
          setFlippedPills((prev) => {
            const n = new Set(prev);
            n.delete(value);
            return n;
          });
        }, 220);
      }

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
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams, currentFilters]
  );

  // Section-level clear
  const clearSection = useCallback(
    (keys: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      keys.forEach((k) => params.delete(k));
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Word count presets
  const applyWordPreset = (min?: number, max?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min != null) params.set('min_words', String(min));
    else params.delete('min_words');
    if (max != null) params.set('max_words', String(max));
    else params.delete('max_words');
    router.push(`${basePath}?${params.toString()}`);
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
      router.push(`${basePath}?${params.toString()}`);
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
    router.push(`${basePath}?${params.toString()}`);
  };

  // Date custom range
  const applyDateCustom = (from: string, to: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('date_preset');
    if (from) params.set('date_from', from);
    else params.delete('date_from');
    if (to) params.set('date_to', to);
    else params.delete('date_to');
    router.push(`${basePath}?${params.toString()}`);
  };

  // Saved presets (drawer)
  const savePreset = () => {
    if (!saveName.trim()) return;
    const name = saveName.trim();
    const updated = [...presets, { name, params: searchParams.toString() }];
    setPresets(updated);
    savePresetsToStorage(updated);
    setSaveName('');
    setSaveFormOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set('preset', name);
    router.push(`${basePath}?${params.toString()}`);
  };

  const deletePreset = (idx: number) => {
    const updated = presets.filter((_, i) => i !== idx);
    setPresets(updated);
    savePresetsToStorage(updated);
  };

  const handleDeletePreset = (idx: number) => {
    setDeletingIdx(idx);
    setTimeout(() => {
      deletePreset(idx);
      setDeletingIdx(null);
    }, 200);
  };

  const applyPreset = (preset: Preset) => {
    const p = new URLSearchParams(preset.params);
    const tab = searchParams.get('tab');
    if (tab) p.set('tab', tab);
    router.push(`${basePath}?preset=${encodeURIComponent(preset.name)}&${p.toString()}`);
    closeDrawer();
    setToastMessage(`'${preset.name}' loaded`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const clearAll = () => {
    const tab = searchParams.get('tab');
    router.push(tab ? `${basePath}?tab=${tab}` : basePath);
  };

  const hasActiveFilters = !!(
    currentFilters.fandom || currentFilters.relationship || currentFilters.tag ||
    currentFilters.character || currentFilters.rating || currentFilters.status ||
    currentFilters.q || currentFilters.category || currentFilters.language ||
    currentFilters.warning || currentFilters.min_words || currentFilters.max_words ||
    currentFilters.ex_fandom || currentFilters.ex_relationship || currentFilters.ex_tag ||
    currentFilters.ex_character || currentFilters.ex_rating || currentFilters.ex_status ||
    currentFilters.ex_category || currentFilters.ex_warning ||
    currentFilters.date_preset || currentFilters.date_from || currentFilters.date_to ||
    currentFilters.preset
  );

  // Active filter count for badge — excludes text search (q)
  const activeFilterCount = [
    currentFilters.fandom, currentFilters.relationship, currentFilters.tag,
    currentFilters.character, currentFilters.rating, currentFilters.status,
    currentFilters.category, currentFilters.warning,
    currentFilters.min_words, currentFilters.max_words, currentFilters.date_preset,
    currentFilters.date_from, currentFilters.date_to,
    currentFilters.ex_fandom, currentFilters.ex_tag, currentFilters.ex_relationship,
    currentFilters.ex_character, currentFilters.ex_rating, currentFilters.ex_status,
    currentFilters.ex_category, currentFilters.ex_warning,
  ].filter(Boolean).length;

  const currentSortValue = `${currentFilters.sort ?? 'updated'}:${currentFilters.order ?? 'desc'}`;

  // Remove a single pill — plays exit animation then navigates
  const removePill = useCallback((pill: ActivePill) => {
    // Already exiting
    if (exitingPills.has(pill.id)) return;

    setExitingPills((prev) => new Set(prev).add(pill.id));

    const timer = setTimeout(() => {
      exitTimers.current.delete(pill.id);
      setExitingPills((prev) => { const s = new Set(prev); s.delete(pill.id); return s; });

      const params = new URLSearchParams(searchParams.toString());
      if (pill.paramKey === 'words') {
        params.delete('min_words');
        params.delete('max_words');
      } else if (pill.paramKey === 'date_preset') {
        params.delete('date_preset');
      } else if (pill.paramKey === 'date_custom') {
        params.delete('date_from');
        params.delete('date_to');
      } else if (pill.paramKey === 'q') {
        // Free-text search is a single value (may itself contain commas) — delete outright
        params.delete('q');
      } else {
        const newVal = removeFromCommaList(params.get(pill.paramKey) ?? undefined, pill.value);
        if (newVal) params.set(pill.paramKey, newVal);
        else params.delete(pill.paramKey);
      }
      router.push(`${basePath}?${params.toString()}`);
    }, 160);

    exitTimers.current.set(pill.id, timer);
  }, [router, searchParams, exitingPills]);

  // Toggle pill between include ↔ exclude
  const togglePill = useCallback((pill: ActivePill) => {
    const mapping = INC_EX_MAP[pill.paramKey];
    if (!mapping) return;
    const params = new URLSearchParams(searchParams.toString());
    const { incKey, exKey } = mapping;
    if (!pill.isExclude) {
      const newInc = removeFromCommaList(params.get(incKey) ?? undefined, pill.value);
      if (newInc) params.set(incKey, newInc); else params.delete(incKey);
      params.set(exKey, addToCommaList(params.get(exKey) ?? undefined, pill.value));
    } else {
      const newEx = removeFromCommaList(params.get(exKey) ?? undefined, pill.value);
      if (newEx) params.set(exKey, newEx); else params.delete(exKey);
      params.set(incKey, addToCommaList(params.get(incKey) ?? undefined, pill.value));
    }
    router.push(`${basePath}?${params.toString()}`);
  }, [router, searchParams]);

  const activePills: ActivePill[] = [];

  const addPills = (paramKey: string, raw: string | undefined, isExclude: boolean, canToggle = true) => {
    if (!raw) return;
    raw.split(',').map((v) => v.trim()).filter(Boolean).forEach((v) => {
      // Stable id uses value only (not paramKey) so include→exclude toggle keeps same key
      activePills.push({ id: `filter:${v}`, paramKey, value: v, label: v, isExclude, canToggle });
    });
  };

  // Interleaved include/exclude pairs — stable pill order when toggling
  const PILL_PAIRS: Array<[string, string]> = [
    ['fandom', 'ex_fandom'],
    ['relationship', 'ex_relationship'],
    ['tag', 'ex_tag'],
    ['character', 'ex_character'],
    ['rating', 'ex_rating'],
    ['status', 'ex_status'],
    ['category', 'ex_category'],
    ['warning', 'ex_warning'],
  ];
  const cf = currentFilters as Record<string, string | undefined>;
  PILL_PAIRS.forEach(([incKey, exKey]) => {
    addPills(incKey, cf[incKey], false);
    addPills(exKey, cf[exKey], true);
  });

  // Text search pill (no toggle)
  if (currentFilters.q) {
    activePills.push({ id: 'q', paramKey: 'q', value: currentFilters.q, label: `"${currentFilters.q}"`, isExclude: false, canToggle: false });
  }

  // Word count pill (no toggle)
  if (currentFilters.min_words || currentFilters.max_words) {
    const fmt = (n: string) => Number(n).toLocaleString();
    let label = '';
    if (currentFilters.min_words && currentFilters.max_words) {
      label = `${fmt(currentFilters.min_words)}–${fmt(currentFilters.max_words)} words`;
    } else if (currentFilters.min_words) {
      label = `≥ ${fmt(currentFilters.min_words)} words`;
    } else {
      label = `≤ ${fmt(currentFilters.max_words!)} words`;
    }
    activePills.push({ id: 'words', paramKey: 'words', value: '', label, isExclude: false, canToggle: false });
  }

  // Date pill (no toggle)
  if (currentFilters.date_preset) {
    const dateLabels: Record<string, string> = { last_week: 'Last week', last_month: 'Last month', last_year: 'Last year' };
    activePills.push({ id: 'date', paramKey: 'date_preset', value: '', label: dateLabels[currentFilters.date_preset] ?? currentFilters.date_preset, isExclude: false, canToggle: false });
  } else if (currentFilters.date_from || currentFilters.date_to) {
    activePills.push({ id: 'date', paramKey: 'date_custom', value: '', label: `${currentFilters.date_from ?? '…'} – ${currentFilters.date_to ?? '…'}`, isExclude: false, canToggle: false });
  }

  // Chip overflow: show max 4, then "+N more"
  const visiblePills = activePills.slice(0, 4);
  const overflowCount = activePills.length - 4;

  // Preset chip state
  const activePresetName = currentFilters.preset ? decodeURIComponent(currentFilters.preset) : null;
  const activePreset = activePresetName ? presets.find((p) => p.name === activePresetName) : null;
  const currentParamsWithoutPreset = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('preset');
    // Normalize: sort keys for reliable comparison
    const sorted = new URLSearchParams([...p.entries()].sort((a, b) => a[0].localeCompare(b[0])));
    return sorted.toString();
  })();
  const presetBaseParams = activePreset ? (() => {
    const p = new URLSearchParams(activePreset.params);
    const sorted = new URLSearchParams([...p.entries()].sort((a, b) => a[0].localeCompare(b[0])));
    return sorted.toString();
  })() : null;
  const isPresetModified = !!(activePreset && currentParamsWithoutPreset !== presetBaseParams);

  const handlePresetUpdate = () => {
    if (!activePreset || !activePresetName) return;
    const idx = presets.findIndex((p) => p.name === activePresetName);
    if (idx === -1) return;
    const updated = [...presets];
    updated[idx] = { ...updated[idx], params: currentParamsWithoutPreset };
    setPresets(updated);
    savePresetsToStorage(updated);
    setToastMessage(`'${activePresetName}' updated`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handlePresetDismiss = () => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('preset');
    router.push(`${basePath}?${p.toString()}`);
  };

  // Active word preset detection
  const activeWordPreset = WORD_PRESETS.find(
    (p) =>
      String(p.min ?? '') === (currentFilters.min_words ?? '') &&
      String(p.max ?? '') === (currentFilters.max_words ?? '')
  );

  return (
    <>
      {/* Sentinel: sits just above the sticky bar; triggers data-stuck on scroll */}
      <div ref={sentinelRef} style={{ height: 0, overflow: 'hidden' }} aria-hidden="true" />
      <div className={styles.bar} ref={barRef}>
        {/* Row 1: Search + controls — single flex line */}
        <div className={styles.toolbar}>
          <BrowseSearchBar options={_searchOptions ?? { tags: [], fandoms: [] }} basePath={basePath} />

          {/* Sort capsule button */}
          <div className={styles.sortWrap} ref={sortRef}>
            <button
              className={`${styles.sortBtn} ${sortOpen ? styles.sortBtnOpen : ''}`}
              onClick={() => setSortOpen((o) => !o)}
              aria-label="Sort options"
              aria-expanded={sortOpen}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3.5 9V3M3.5 3L1.5 5M3.5 3L5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 3v6M8.5 9L6.5 7M8.5 9l2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Width-stable label: all options stacked in one grid cell so the
                  button reserves the widest label's width and never resizes on switch. */}
              <span className={styles.sortLabel}>
                {SORT_OPTIONS.map((o) => (
                  <span key={o.value} className={styles.sortLabelSizer} aria-hidden="true">{o.label}</span>
                ))}
                <span className={styles.sortLabelCurrent}>
                  {SORT_OPTIONS.find((o) => o.value === currentSortValue)?.label ?? 'sort'}
                </span>
              </span>
              <kbd className={styles.sortBtnKbd}>S</kbd>
            </button>
            {sortOpen && (
              <div className={styles.sortDropdown} role="listbox" aria-label="Sort options">
                {SORT_OPTIONS.map((opt, i) => (
                  <button
                    key={opt.value}
                    className={`${styles.sortOption} ${currentSortValue === opt.value ? styles.sortOptionActive : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); handleSortChange(opt.value); setSortOpen(false); }}
                    role="option"
                    aria-selected={currentSortValue === opt.value}
                    onKeyDown={(e) => {
                      const buttons = [...(sortRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])];
                      if (e.key === 'ArrowDown') { e.preventDefault(); buttons[i + 1]?.focus(); }
                      if (e.key === 'ArrowUp') { e.preventDefault(); buttons[i - 1]?.focus(); }
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters button — icon-only on mobile, full label on desktop */}
          <button
            className={`${styles.filterBtn} ${
              drawerOpen ? styles.filterBtnOpen :
              activeFilterCount > 0 ? styles.filterBtnActive : ''
            }`}
            onClick={() => setDrawerOpen((d) => !d)}
            aria-label={drawerOpen ? 'Close filters' : 'Open filters'}
          >
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
              <path d="M1 1.5h10M3 5h6M5 8.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className={styles.filterBtnLabel}>Filters</span>
            {activeFilterCount > 0 && (
              <span className={styles.filterBtnCount}>· {activeFilterCount}</span>
            )}
            <kbd className={styles.filterBtnKbd}>F</kbd>
          </button>
        </div>

        {/* Pills row: active filter pills — only shown when filters are active */}
        {hasActiveFilters && (
          <div className={styles.pillsRow}>
            {activePresetName ? (
              /* Preset chip mode — show single chip instead of individual pills */
              <div className={`${styles.pill} ${styles.presetChip}`}>
                <span className={styles.pillLabel}>{activePresetName}</span>
                {activePreset && (
                  <span className={styles.presetChipTooltip}>
                    {parsePresetParams(activePreset.params) || 'No filters set'}
                  </span>
                )}
                {isPresetModified && (
                  <span className={styles.presetModifiedActions}>
                    <button className={styles.presetModifiedBtn} onMouseDown={(e) => { e.preventDefault(); handlePresetUpdate(); }}>
                      Update
                    </button>
                    <button className={styles.presetModifiedBtn} onMouseDown={(e) => { e.preventDefault(); setSaveFormOpen(true); }}>
                      Save as new
                    </button>
                  </span>
                )}
                <button
                  className={styles.pillXBtn}
                  onClick={handlePresetDismiss}
                  aria-label="Remove preset"
                >
                  ×
                </button>
              </div>
            ) : (
              /* Normal pill mode */
              <>
                {visiblePills.map((pill) => (
                  <div
                    key={pill.id}
                    className={`${styles.pill} ${pill.isExclude ? styles.excludePill : ''} ${exitingPills.has(pill.id) ? styles.pillExiting : ''}`}
                  >
                    {pill.canToggle ? (
                      <button
                        className={styles.pillToggleArea}
                        onClick={() => togglePill(pill)}
                        title={pill.isExclude
                          ? `${pill.label}\nClick to include`
                          : `${pill.label}\nClick to exclude`}
                      >
                        <span className={`${styles.pillIcon} ${pill.isExclude ? styles.pillIconExclude : styles.pillIconInclude}`}>
                          {pill.isExclude ? '−' : '+'}
                        </span>
                        <span className={styles.pillLabel}>{pill.label}</span>
                      </button>
                    ) : (
                      <span className={styles.pillToggleArea} title={pill.label}>
                        <span className={styles.pillLabel}>{pill.label}</span>
                      </span>
                    )}
                    <button
                      className={styles.pillXBtn}
                      onClick={() => removePill(pill)}
                      aria-label={`Remove ${pill.label}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {overflowCount > 0 && (
                  <button
                    className={`${styles.pill} ${styles.pillOverflow}`}
                    onClick={() => setDrawerOpen(true)}
                    aria-label={`${overflowCount} more filters`}
                  >
                    +{overflowCount} more
                  </button>
                )}
              </>
            )}
            <div className={styles.pillsRowActionsWrap}>
              {!activePresetName && (
                <button
                  ref={savePresetBtnRef}
                  className={styles.saveAsPresetBtn}
                  onClick={() => {
                    const rect = savePresetBtnRef.current?.getBoundingClientRect();
                    if (rect) popoverBtnRect.current = rect;
                    setSaveFormOpen(true);
                  }}
                >
                  Save preset
                </button>
              )}
              <button className={styles.clearAllBtn} onClick={clearAll}>
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Drawer — right-side slide panel, non-blocking on desktop */}
      {(drawerOpen || drawerClosing) && (
        <>
          {/* Backdrop: transparent on desktop, dimmed on mobile */}
          <div
            className={styles.drawerBackdrop}
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div
            className={`${styles.drawer} ${drawerClosing ? styles.drawerSlideOut : ''}`}
            data-filter-drawer
            role="dialog"
            aria-label="Filter options"
          >
            {/* Drag handle (mobile only) */}
            <div className={styles.dragHandle} aria-hidden="true" />

            {/* Header */}
            <div className={styles.drawerHeader}>
              {!isMobile && (
                <button
                  ref={drawerCloseBtnRef}
                  className={styles.drawerCloseBtn}
                  onClick={closeDrawer}
                  aria-label="Collapse filters panel"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <line x1="12.5" y1="2" x2="12.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M6.5 4L10 7l-3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              <span className={styles.drawerHeaderTitle}>Filters</span>
              {isMobile && (
                <button
                  ref={drawerCloseBtnRef}
                  className={styles.drawerCloseBtn}
                  onClick={closeDrawer}
                  aria-label="Close filters"
                >
                  ×
                </button>
              )}
            </div>

            {/* Scrollable body */}
            <div className={styles.drawerBody}>
              {/* Sort section — only shown on mobile (sort dropdown is hidden in toolbar) */}
              {isMobile && (
                <div className={styles.drawerSection}>
                  <button
                    className={styles.sectionToggle}
                    onClick={() => toggleSection('sort')}
                    aria-expanded={isSectionOpen('sort')}
                  >
                    <svg className={`${styles.sectionChevron} ${isSectionOpen('sort') ? styles.sectionChevronOpen : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className={styles.drawerLabel}>Sort</span>
                  </button>
                  {isSectionOpen('sort') && (
                    <div className={styles.drawerPills}>
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          className={`${styles.dPill} ${currentSortValue === opt.value ? styles.dPillInclude : ''}`}
                          onClick={() => { handleSortChange(opt.value); }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Saved filters — always at TOP, hidden when empty */}
              {presets.length > 0 && (
                <>
                  <div className={styles.savedSectionWrap}>
                    <div className={styles.drawerSection}>
                      <span className={styles.drawerLabel}>Presets</span>
                      <div className={styles.savedBody}>
                        {presets.map((preset, idx) => (
                          <div
                            key={idx}
                            className={`${styles.presetRow} ${deletingIdx === idx ? styles.presetRowDeleting : ''}`}
                          >
                            <div className={styles.presetRowMain}>
                              <button className={styles.presetName} onClick={() => applyPreset(preset)}>
                                {preset.name}
                              </button>
                              <button
                                className={styles.presetDeleteBtn}
                                onClick={() => handleDeletePreset(idx)}
                                aria-label={`Delete ${preset.name}`}
                                title={`Delete ${preset.name}`}
                              >
                                ×
                              </button>
                            </div>
                            {(() => {
                              const preview = parsePresetParams(preset.params);
                              return preview ? (
                                <p className={styles.presetPreview}>{preview}</p>
                              ) : null;
                            })()}
                          </div>
                        ))}
                        {toastMessage && (
                          <div className={styles.presetToast}>{toastMessage}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <hr className={styles.drawerDivider} />
                </>
              )}

              {/* Rating — cards with per-tier color fill */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionHeader}>
                  <button className={styles.sectionToggle} onClick={() => toggleSection('rating')} aria-expanded={isSectionOpen('rating')}>
                    <span className={`${styles.sectionChevron} ${isSectionOpen('rating') ? styles.sectionChevronOpen : ''}`}>›</span>
                    <span className={styles.drawerLabel}>Rating</span>
                  </button>
                  {(currentFilters.rating || currentFilters.ex_rating) && (
                    <button
                      className={styles.sectionClear}
                      onClick={() => clearSection(['rating', 'ex_rating'])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {isSectionOpen('rating') && (
                  <div className={styles.ratingCards}>
                    {RATINGS.map((r) => {
                      const state = getPillState(r, currentFilters.rating, currentFilters.ex_rating);
                      const ratingKey = RATING_KEYS[r];
                      return (
                        <button
                          key={r}
                          className={`${styles.ratingCard} ${
                            state === 'include' ? styles.ratingCardInclude :
                            state === 'exclude' ? styles.ratingCardExclude : ''
                          } ${flippedPills.has(r) ? styles.dPillFlipping : ''}`}
                          data-rating={ratingKey}
                          onClick={() => cyclePill(r, 'rating', 'ex_rating')}
                          title={state === 'neutral' ? `Include: ${r}` : state === 'include' ? `Exclude: ${r}` : `Remove: ${r}`}
                        >
                          <span className={styles.ratingCardLetter}>{RATING_LABELS[r]}</span>
                          <span className={styles.ratingCardName}>{RATING_SHORT_NAMES[r]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Warnings */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionHeader}>
                  <button className={styles.sectionToggle} onClick={() => toggleSection('warnings')} aria-expanded={isSectionOpen('warnings')}>
                    <span className={`${styles.sectionChevron} ${isSectionOpen('warnings') ? styles.sectionChevronOpen : ''}`}>›</span>
                    <span className={styles.drawerLabel}>Warnings</span>
                  </button>
                  {(currentFilters.warning || currentFilters.ex_warning) && (
                    <button
                      className={styles.sectionClear}
                      onClick={() => clearSection(['warning', 'ex_warning'])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {isSectionOpen('warnings') && (
                  <>
                    <p className={styles.warningsNote}>
                      Selecting a warning includes works tagged with it.
                    </p>
                    <div className={styles.drawerPills}>
                      {WARNINGS.map((w) => {
                        const state = getPillState(w, currentFilters.warning, currentFilters.ex_warning);
                        return (
                          <button
                            key={w}
                            className={`${styles.dPill} ${
                              state === 'include' ? styles.dPillInclude :
                              state === 'exclude' ? styles.dPillExclude : ''
                            } ${flippedPills.has(w) ? styles.dPillFlipping : ''}`}
                            onClick={() => cyclePill(w, 'warning', 'ex_warning')}
                          >
                            {state !== 'neutral' && (
                              <span className={styles.dPillIcon}>{state === 'include' ? '+' : '−'}</span>
                            )}
                            {WARNING_LABELS[w] ?? w}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Category */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionHeader}>
                  <button className={styles.sectionToggle} onClick={() => toggleSection('category')} aria-expanded={isSectionOpen('category')}>
                    <span className={`${styles.sectionChevron} ${isSectionOpen('category') ? styles.sectionChevronOpen : ''}`}>›</span>
                    <span className={styles.drawerLabel}>Category</span>
                  </button>
                  {(currentFilters.category || currentFilters.ex_category) && (
                    <button
                      className={styles.sectionClear}
                      onClick={() => clearSection(['category', 'ex_category'])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {isSectionOpen('category') && (
                  <div className={styles.drawerPills}>
                    {CATEGORIES.map((c) => {
                      const state = getPillState(c, currentFilters.category, currentFilters.ex_category);
                      return (
                        <button
                          key={c}
                          className={`${styles.dPill} ${
                            state === 'include' ? styles.dPillInclude :
                            state === 'exclude' ? styles.dPillExclude : ''
                          } ${flippedPills.has(c) ? styles.dPillFlipping : ''}`}
                          onClick={() => cyclePill(c, 'category', 'ex_category')}
                        >
                          {state !== 'neutral' && (
                            <span className={styles.dPillIcon}>{state === 'include' ? '+' : '−'}</span>
                          )}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status — cards */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionHeader}>
                  <button className={styles.sectionToggle} onClick={() => toggleSection('status')} aria-expanded={isSectionOpen('status')}>
                    <span className={`${styles.sectionChevron} ${isSectionOpen('status') ? styles.sectionChevronOpen : ''}`}>›</span>
                    <span className={styles.drawerLabel}>Status</span>
                  </button>
                  {(currentFilters.status || currentFilters.ex_status) && (
                    <button
                      className={styles.sectionClear}
                      onClick={() => clearSection(['status', 'ex_status'])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {isSectionOpen('status') && (
                  <div className={styles.statusCards}>
                    {STATUSES.map((s) => {
                      const state = getPillState(s, currentFilters.status, currentFilters.ex_status);
                      return (
                        <button
                          key={s}
                          className={`${styles.statusCard} ${
                            state === 'include' ? styles.statusCardInclude :
                            state === 'exclude' ? styles.statusCardExclude : ''
                          } ${flippedPills.has(s) ? styles.dPillFlipping : ''}`}
                          onClick={() => cyclePill(s, 'status', 'ex_status')}
                          title={state === 'neutral' ? `Include: ${s}` : state === 'include' ? `Exclude: ${s}` : `Remove: ${s}`}
                        >
                          <span className={styles.statusIcon} aria-hidden="true">{s === 'Complete' ? '✓' : '~'}</span>
                          <span className={styles.statusLabel}>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <hr className={styles.drawerDivider} />

              {/* Words — preset pills + custom expander */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionHeader}>
                  <button className={styles.sectionToggle} onClick={() => toggleSection('words')} aria-expanded={isSectionOpen('words')}>
                    <span className={`${styles.sectionChevron} ${isSectionOpen('words') ? styles.sectionChevronOpen : ''}`}>›</span>
                    <span className={styles.drawerLabel}>Words</span>
                  </button>
                  {(currentFilters.min_words || currentFilters.max_words) && (
                    <button
                      className={styles.sectionClear}
                      onClick={() => {
                        clearSection(['min_words', 'max_words']);
                        setWordsCustomOpen(false);
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {isSectionOpen('words') && (
                  <>
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
                      <button
                        className={`${styles.dPill} ${styles.customPill} ${wordsCustomOpen ? styles.customPillOpen : ''}`}
                        onClick={() => setWordsCustomOpen((o) => !o)}
                      >
                        Custom <span className={styles.customChevron}>›</span>
                      </button>
                    </div>
                    {wordsCustomOpen && (
                      <div className={styles.customInputSlide}>
                        <div className={styles.wcRange}>
                          <input
                            type="number"
                            className={styles.wcInput}
                            placeholder="min"
                            aria-label="Minimum word count"
                            value={wordMin}
                            onChange={(e) => handleWordInput(e.target.value, wordMax)}
                          />
                          <span className={styles.wcSep}>–</span>
                          <input
                            type="number"
                            className={styles.wcInput}
                            placeholder="max"
                            aria-label="Maximum word count"
                            value={wordMax}
                            onChange={(e) => handleWordInput(wordMin, e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Updated — preset pills + custom date expander */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionHeader}>
                  <button className={styles.sectionToggle} onClick={() => toggleSection('updated')} aria-expanded={isSectionOpen('updated')}>
                    <span className={`${styles.sectionChevron} ${isSectionOpen('updated') ? styles.sectionChevronOpen : ''}`}>›</span>
                    <span className={styles.drawerLabel}>Updated</span>
                  </button>
                  {(currentFilters.date_preset || currentFilters.date_from || currentFilters.date_to) && (
                    <button
                      className={styles.sectionClear}
                      onClick={() => {
                        clearSection(['date_preset', 'date_from', 'date_to']);
                        setDateCustomOpen(false);
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {isSectionOpen('updated') && (
                  <>
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
                      <button
                        className={`${styles.dPill} ${styles.customPill} ${dateCustomOpen ? styles.customPillOpen : ''}`}
                        onClick={() => setDateCustomOpen((o) => !o)}
                      >
                        Custom <span className={styles.customChevron}>›</span>
                      </button>
                    </div>
                    {dateCustomOpen && (
                      <div className={styles.customInputSlide}>
                        <div className={styles.dateCustom}>
                          <input
                            type="date"
                            className={styles.dateInput}
                            aria-label="Updated after"
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
                            aria-label="Updated before"
                            value={dateTo}
                            onChange={(e) => {
                              setDateTo(e.target.value);
                              applyDateCustom(dateFrom, e.target.value);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>


            </div>

            {/* Sticky footer */}
            <div className={styles.drawerFooter}>
              <button className={styles.drawerFooterClear} onClick={clearAll}>
                Clear all
              </button>
              <div className={styles.drawerFooterActions}>
                {/* Apply button — visible on mobile only */}
                <button
                  className={styles.applyBtn}
                  onClick={closeDrawer}
                >
                  Apply filters
                </button>
                <button
                  className={styles.drawerShowBtn}
                  onClick={closeDrawer}
                >
                  Show {filteredCount} work{filteredCount !== 1 ? 's' : ''}
                </button>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Save preset portal — renders into document.body to escape header stacking context */}
      {saveFormOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className={styles.savePopoverBackdrop}
            onMouseDown={() => { setSaveFormOpen(false); setSaveName(''); }}
          />
          <div
            className={styles.savePopoverFixed}
            ref={savePopoverRef}
            style={{
              top: popoverBtnRect.current
                ? popoverBtnRect.current.top + popoverBtnRect.current.height / 2
                : '50%',
              left: popoverBtnRect.current
                ? popoverBtnRect.current.left + popoverBtnRect.current.width / 2
                : '50%',
            }}
          >
            <p className={styles.savePopoverLabel}>Saving filters</p>
            {activePills.length > 0 && (
              <div className={styles.savePopoverPills}>
                {activePills.slice(0, 3).map((p) => (
                  <span key={p.id} className={styles.savePopoverPill}>{p.label}</span>
                ))}
              </div>
            )}
            <form
              className={styles.savePopoverForm}
              onSubmit={(e) => { e.preventDefault(); savePreset(); }}
            >
              <input
                autoFocus
                type="text"
                className={styles.savePopoverInput}
                placeholder="Name this filter set…"
                aria-label="Filter set name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
              <button type="submit" className={styles.savePopoverSave}>Save</button>
            </form>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

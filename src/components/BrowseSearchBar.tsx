'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SearchOptions, buildVibeFilters, VibeResult } from '@/lib/filters';
import { HISTORY_KEY, RATINGS, WARNINGS, CATEGORIES, STATUSES } from '@/lib/constants';
import { Preset, loadPresets, addToCommaList, presetToParams } from '@/lib/filterParams';
import { POPOVER_ENTER, POPOVER_VISIBLE, POPOVER_EXIT, POPOVER_TRANSITION } from '@/lib/motion';
import { POPOVER_PANEL, MENU_ROW, MENU_ROW_ACTIVE } from './popoverChrome';
import { PILL_SHAPE, PILL_INCLUDE, PILL_EXCLUDE } from './GhostButton';
import { HUD_BUBBLE } from './readingChrome';
import { SEARCH_INPUT, SEARCH_ICON } from './searchChrome';
import { ClockIcon, CloseIcon, MagnifierIcon, UpDownArrowIcon } from './icons';
import { usePendingParams } from '@/hooks/usePendingParams';

const HISTORY_LIMIT = 5;

// ── Shared utility strings (repeated across dropdown rows) ──
const groupHeaderCls =
  'font-mono text-[11.5px] font-medium tracking-[0.1em] uppercase text-secondary px-2.5 pt-3 pb-[6px] underline decoration-1 [text-underline-offset:4px] decoration-[var(--border-strong)]';

function loadHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function addToHistory(q: string) {
  const hist = loadHistory().filter((h) => h.toLowerCase() !== q.toLowerCase());
  localStorage.setItem(HISTORY_KEY, JSON.stringify([q, ...hist].slice(0, HISTORY_LIMIT)));
}

function removeFromHistory(q: string) {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(loadHistory().filter((h) => h !== q))
  );
}

// Multi-value filter keys that accumulate via comma list
const MULTI_FILTER_KEYS = [
  'fandom', 'tag', 'rating', 'warning', 'category', 'status', 'character', 'relationship',
  'ex_fandom', 'ex_tag', 'ex_rating', 'ex_warning', 'ex_category', 'ex_status', 'ex_character', 'ex_relationship',
];

// Static filter AC data — imported from constants

interface ACItem {
  kind: 'ac';
  group: string;
  name: string;
  count?: number;
  filterKey: string;
  filterValue: string;
  flatIdx: number;
}

interface FilterACItem {
  kind: 'filter-ac';
  group: string;
  name: string;
  filterKey: string;
  filterValue: string;
  badge: string;
  flatIdx: number;
}

type SearchItem = ACItem | FilterACItem;

interface Props {
  options: SearchOptions;
  /** Base path for filter navigation. Defaults to '/browse' (catalog). Pass '/reading' for library page. */
  basePath?: string;
  /** Collapse to a magnifier bubble ≤768px (the header slot has no room for
      an input there). Toolbar instances keep the full input. */
  collapsible?: boolean;
}

export function BrowseSearchBar({ options, basePath = '/browse', collapsible = false }: Props) {
  // Shared with FilterPanel via module-level pending state so a search
  // submit racing a pill click composes instead of last-write-winning.
  const { readParams, pushParams } = usePendingParams(basePath);
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Combobox wiring — unique per instance (header + toolbar can co-exist).
  const listboxId = useId();
  const vibeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [isMobileFS, setIsMobileFS] = useState(false);
  // Compact (collapsible + ≤768px): the header has no room for an input —
  // render a magnifier bubble that opens the fullscreen overlay instead.
  const [isNarrow, setIsNarrow] = useState(false);
  const isCompact = collapsible && isNarrow;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [savedPresets, setSavedPresets] = useState<Preset[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [vibeResult, setVibeResult] = useState<VibeResult | null>(null);

  // Toggle body class so ancestor backdrop-filter doesn't trap the fixed overlay
  useEffect(() => {
    if (isMobileFS) {
      document.body.classList.add('search-fs-open');
    } else {
      document.body.classList.remove('search-fs-open');
    }
    return () => { document.body.classList.remove('search-fs-open'); };
  }, [isMobileFS]);

  // Load presets + history on mount and dropdown open
  useEffect(() => {
    setSavedPresets(loadPresets());
    setHistory(loadHistory());
  }, []);

  // Listen for 'fill-search' events dispatched by WorkCard "find similar" button
  useEffect(() => {
    const handler = (e: Event) => {
      const { value } = (e as CustomEvent).detail;
      setQuery(value);
      inputRef.current?.focus();
    };
    document.addEventListener('fill-search', handler);
    return () => document.removeEventListener('fill-search', handler);
  }, []);

  useEffect(() => {
    if (focused) {
      setSavedPresets(loadPresets());
      setHistory(loadHistory());
    }
  }, [focused]);

  // @LOADING — vibeLoading + vibeTimerRef below simulate a 1.5s async delay.
  //            buildVibeFilters() is synchronous regex matching — no real async op occurs.
  //            Remove the setTimeout if/when vibe is upgraded to a real search API call
  //            (the fetch itself will provide the async delay).
  //            See: .claude/docs/wiring-guide.md#6-vibe-search-optional-upgrade
  // Async vibe: start 1.5s timer on any query change > 2 chars
  useEffect(() => {
    if (vibeTimerRef.current) {
      clearTimeout(vibeTimerRef.current);
      vibeTimerRef.current = null;
    }

    const q = query.trim();
    if (q.length <= 2) {
      setVibeLoading(false);
      setVibeResult(null);
      return;
    }

    setVibeLoading(true);
    setVibeResult(null);

    vibeTimerRef.current = setTimeout(() => {
      setVibeLoading(false);
      setVibeResult(buildVibeFilters(q)); // always returns a result; fallback = text search
    }, 1500);

    return () => {
      if (vibeTimerRef.current) clearTimeout(vibeTimerRef.current);
    };
  }, [query]);

  // ⌘K / Ctrl+K focuses the search input (opening the overlay first in compact mode)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isCompact) {
          setIsMobileFS(true);
          setFocused(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        } else {
          inputRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isCompact]);

  // Click-outside closes dropdown
  useEffect(() => {
    if (!focused) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
        setQuery('');
        setSelectedIndex(-1);
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [focused]);

  // Build flat item list for AC (excludes vibe — managed via state)
  const buildItems = useCallback((): SearchItem[] => {
    const q = query.toLowerCase().trim();
    const items: SearchItem[] = [];
    let counter = 0;

    if (!q) {
      // Default state: popular fandoms + popular tags
      options.fandoms.slice(0, 4).forEach((f) =>
        items.push({ kind: 'ac', group: 'Popular Fandoms', name: f.name, count: f.count, filterKey: 'fandom', filterValue: f.name, flatIdx: counter++ })
      );
      options.tags.slice(0, 5).forEach((t) =>
        items.push({ kind: 'ac', group: 'Popular Tags', name: t.name, count: t.count, filterKey: 'tag', filterValue: t.name, flatIdx: counter++ })
      );
    } else {
      const limit = 4;

      // Filter value AC: Rating, Warning, Category, Status
      const filterMatches: Omit<FilterACItem, 'flatIdx'>[] = [];
      RATINGS.filter((r) => r.toLowerCase().includes(q)).slice(0, 2).forEach((r) =>
        filterMatches.push({ kind: 'filter-ac', group: 'Filters', name: r, filterKey: 'rating', filterValue: r, badge: 'Rating' })
      );
      WARNINGS.filter((w) => w.toLowerCase().includes(q)).slice(0, 2).forEach((w) =>
        filterMatches.push({ kind: 'filter-ac', group: 'Filters', name: w, filterKey: 'warning', filterValue: w, badge: 'Warning' })
      );
      CATEGORIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 2).forEach((c) =>
        filterMatches.push({ kind: 'filter-ac', group: 'Filters', name: c, filterKey: 'category', filterValue: c, badge: 'Category' })
      );
      STATUSES.filter((s) => s.toLowerCase().includes(q)).slice(0, 1).forEach((s) =>
        filterMatches.push({ kind: 'filter-ac', group: 'Filters', name: s, filterKey: 'status', filterValue: s, badge: 'Status' })
      );
      filterMatches.forEach((f) => items.push({ ...f, flatIdx: counter++ }));

      options.fandoms
        .filter((f) => f.name.toLowerCase().includes(q))
        .slice(0, limit)
        .forEach((f) =>
          items.push({ kind: 'ac', group: 'Fandoms', name: f.name, count: f.count, filterKey: 'fandom', filterValue: f.name, flatIdx: counter++ })
        );
      options.authors
        ?.filter((a) => a.name.toLowerCase().includes(q))
        .slice(0, limit)
        .forEach((a) =>
          items.push({ kind: 'ac', group: 'Authors', name: a.name, count: a.count, filterKey: 'q', filterValue: a.name, flatIdx: counter++ })
        );
      options.characters
        ?.filter((c) => c.name.toLowerCase().includes(q))
        .slice(0, limit)
        .forEach((c) =>
          items.push({ kind: 'ac', group: 'Characters', name: c.name, count: c.count, filterKey: 'character', filterValue: c.name, flatIdx: counter++ })
        );
      options.relationships
        ?.filter((r) => r.name.toLowerCase().includes(q))
        .slice(0, limit)
        .forEach((r) =>
          items.push({ kind: 'ac', group: 'Relationships', name: r.name, count: r.count, filterKey: 'relationship', filterValue: r.name, flatIdx: counter++ })
        );
      options.tags
        .filter((t) => t.name.toLowerCase().includes(q))
        .slice(0, limit)
        .forEach((t) =>
          items.push({ kind: 'ac', group: 'Tags', name: t.name, count: t.count, filterKey: 'tag', filterValue: t.name, flatIdx: counter++ })
        );
    }

    return items;
  }, [query, options]);

  // Memoized: recompute only when query/options change, not on every render
  // (focus, vibe, breakpoint state) — the build filters five option lists.
  const items = useMemo(buildItems, [buildItems]);

  const close = useCallback(() => {
    setFocused(false);
    setIsMobileFS(false);
    setQuery('');
    setSelectedIndex(-1);
    inputRef.current?.blur();
  }, []);

  // Accumulative: merges new filter into existing URL params
  const applyACItem = useCallback((item: SearchItem) => {
    const params = readParams();
    const { filterKey, filterValue } = item;
    if (MULTI_FILTER_KEYS.includes(filterKey)) {
      params.set(filterKey, addToCommaList(params.get(filterKey) ?? undefined, filterValue));
    } else {
      params.set(filterKey, filterValue);
    }
    if (filterKey === 'q') addToHistory(filterValue);
    pushParams(params);
    close();
  }, [readParams, pushParams, close]);

  // Accumulative: merges vibe filters into existing URL params
  const applyVibeItem = useCallback((result: VibeResult) => {
    const params = readParams();
    const f = result.filters;
    if (f.q) { params.set('q', f.q); addToHistory(f.q); }
    if (f.tag) params.set('tag', addToCommaList(params.get('tag') ?? undefined, f.tag));
    if (f.exTag) params.set('ex_tag', addToCommaList(params.get('ex_tag') ?? undefined, f.exTag));
    if (f.exWarning) params.set('ex_warning', addToCommaList(params.get('ex_warning') ?? undefined, f.exWarning));
    if (f.rating) params.set('rating', addToCommaList(params.get('rating') ?? undefined, f.rating));
    if (f.maxWords != null) params.set('max_words', String(f.maxWords));
    pushParams(params);
    close();
  }, [readParams, pushParams, close]);

  const applyPreset = useCallback((preset: Preset) => {
    pushParams(presetToParams(preset, readParams().get('tab')));
    close();
  }, [readParams, pushParams, close]);

  const applyHistoryItem = useCallback((q: string) => {
    addToHistory(q);
    setHistory(loadHistory());
    const params = readParams();
    params.set('q', q);
    pushParams(params);
    close();
  }, [readParams, pushParams, close]);

  const handleRemoveHistory = useCallback((q: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromHistory(q);
    setHistory(loadHistory());
  }, []);

  const handleTextSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    addToHistory(q);
    const params = readParams();
    params.set('q', q);
    pushParams(params);
    close();
  }, [query, readParams, pushParams, close]);

  const handleSubmit = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      const item = items.find((i) => i.flatIdx === selectedIndex);
      if (item) {
        applyACItem(item);
        return;
      }
    }

    handleTextSearch();
  }, [selectedIndex, items, applyACItem, handleTextSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      close();
    }
  };

  // Group items for rendering — Map keeps it one pass, memo keeps it off
  // unrelated renders.
  const groupedItems = useMemo(() => {
    const byGroup = new Map<string, SearchItem[]>();
    for (const item of items) {
      const bucket = byGroup.get(item.group);
      if (bucket) bucket.push(item);
      else byGroup.set(item.group, [item]);
    }
    return Array.from(byGroup, ([group, groupItems]) => ({ group, items: groupItems }));
  }, [items]);

  const isDefaultState = query.trim().length === 0;
  const hasACResults = items.length > 0;
  const showVibeHint = !isDefaultState && !vibeLoading && !vibeResult && hasACResults;

  // Compact header mode: just the magnifier bubble; the full search UI is
  // the existing fullscreen overlay, opened on tap (or ⌘K).
  if (isCompact && !isMobileFS) {
    return (
      <button
        type="button"
        aria-label="Search"
        aria-haspopup="dialog"
        onClick={() => {
          setIsMobileFS(true);
          setFocused(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className={`${HUD_BUBBLE} text-secondary`}
      >
        <MagnifierIcon width={18} height={18} />
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      // Fullscreen mode covers the page — expose it as a modal search dialog.
      {...(isMobileFS ? { role: 'dialog', 'aria-modal': true, 'aria-label': 'Search' } : {})}
      className={`group relative min-w-0 flex-1 ${
        isMobileFS
          ? 'fixed inset-0 z-[400] flex flex-col bg-bg pt-[calc(8px+var(--safe-top))] pr-0 pb-0 pl-0'
          : ''
      }`}
    >
      {/* inputRow: inputWrap + close × button (mobileFS only) */}
      <div className={isMobileFS ? 'mb-2 flex flex-shrink-0 items-center gap-2 px-4' : ''}>
        <div className={`relative flex items-center ${isMobileFS ? 'min-w-0 flex-1' : ''}`}>
          <MagnifierIcon className={SEARCH_ICON} />

          <input
            ref={inputRef}
            type="text"
            className={`${SEARCH_INPUT} ${query ? 'pr-[72px]' : 'pr-9'}`}
            placeholder="Search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => {
              setFocused(true);
              // Header instances go fullscreen from the compact bubble (≤768);
              // toolbar instances keep the inline input until phone widths.
              const fsBreakpoint = collapsible ? 768 : 480;
              if (window.matchMedia(`(max-width: ${fsBreakpoint}px)`).matches) setIsMobileFS(true);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={focused}
            aria-controls={listboxId}
            aria-activedescendant={selectedIndex >= 0 ? `${listboxId}-opt-${selectedIndex}` : undefined}
          />

          {/* ⌘K hint — hidden when query is present */}
          {!query && (
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-secondary transition-opacity duration-150 group-focus-within:opacity-0">
              ⌘K
            </kbd>
          )}

          {/* Clear × and submit circle — visible whenever there's a query */}
          {query && (
            <>
              <button
                className="absolute right-[38px] top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center p-0 text-secondary opacity-[0.45] transition-[opacity,color] duration-150 ease-in-out hover:text-text hover:opacity-100"
                // preventDefault on mousedown stops the input blur; actions
                // live on click so Enter/Space work (pattern used panel-wide).
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(-1);
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                {/* 24-grid glyph has baked-in padding — render large so the visible × reads at ~10px */}
                <CloseIcon width={20} height={20} />
              </button>
              <button
                className="absolute right-[6px] top-1/2 flex h-[26px] w-[26px] origin-center -translate-y-1/2 items-center justify-center rounded-full bg-text p-0 text-bg transition-[opacity,transform] duration-150 hover:scale-105 hover:opacity-80 active:scale-95"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSubmit}
                aria-label="Submit search"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 5h6M5.5 2L9 5l-3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
        {/* Close × — mobile fullscreen only, right of input */}
        {isMobileFS && (
          <button
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-secondary transition-[color,background] duration-150 ease-in-out hover:bg-overlay-soft hover:text-text"
            onMouseDown={(e) => e.preventDefault()}
            onClick={close}
            aria-label="Close search"
          >
            <CloseIcon width={20} height={20} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {focused && (
          <motion.div
            role="listbox"
            id={listboxId}
            aria-label="Search suggestions"
            // Fullscreen sheet (mobile) keeps a plain fade — the desktop panel
            // springs open like the reading-page popovers.
            initial={reduceMotion ? false : isMobileFS ? { opacity: 0 } : POPOVER_ENTER}
            animate={isMobileFS ? { opacity: 1 } : POPOVER_VISIBLE}
            exit={isMobileFS ? { opacity: 0 } : POPOVER_EXIT}
            transition={isMobileFS ? { duration: 0.13, ease: 'easeOut' } : POPOVER_TRANSITION}
            style={isMobileFS ? undefined : { transformOrigin: 'top' }}
            className={
              // flex-col gap-1 = the shared menu-row separation (adjacent
              // hover/active fills never touch, matches MenuColumn).
              isMobileFS
                ? 'flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] mt-0 border-none bg-transparent p-2'
                : `absolute left-0 right-0 top-[calc(100%+5px)] z-[var(--z-popover)] flex flex-col gap-1 overflow-hidden p-2 ${POPOVER_PANEL}`
            }
          >

            {/* Vibe section — loading or result */}
            {!isDefaultState && (vibeLoading || vibeResult) && (
              <div>
                <div className={groupHeaderCls}>✦ Vibe</div>
                {vibeLoading ? (
                  <div className="flex items-center gap-[5px] px-2.5 pt-3 pb-[14px]">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.span
                        key={i}
                        className="h-[5px] w-[5px] rounded-full bg-secondary"
                        animate={reduceMotion ? undefined : { y: [0, -4, 0, 0], opacity: [0.3, 1, 0.3, 0.3] }}
                        transition={
                          reduceMotion
                            ? undefined
                            : { duration: 1.1, times: [0, 0.3, 0.6, 1], repeat: Infinity, ease: 'easeInOut', delay }
                        }
                      />
                    ))}
                  </div>
                ) : vibeResult ? (
                  <button
                    className="flex w-full cursor-pointer flex-col gap-[6px] rounded-xl bg-overlay-soft px-2.5 py-2 text-left transition-colors hover:bg-overlay-medium"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyVibeItem(vibeResult)}
                    role="option"
                    aria-selected={false}
                  >
                    <span className="font-sans text-[15px] text-text">{vibeResult.desc}</span>
                    <div className="flex flex-wrap gap-1">
                      {/* Same PILL_SHAPE + include/exclude treatment as the
                          filter drawer chips, at preview scale. */}
                      {vibeResult.pills.map((pill, i) => (
                        <span
                          key={i}
                          className={`${PILL_SHAPE} px-2.5 py-[2px] text-[13px] ${
                            pill.mode === 'include'
                              ? PILL_INCLUDE
                              : `${PILL_EXCLUDE} line-through decoration-current`
                          }`}
                        >
                          {pill.mode === 'include' ? '+' : '−'} {pill.label}
                        </span>
                      ))}
                    </div>
                  </button>
                ) : null}
              </div>
            )}

            {/* Text search row — always available when typing; also what Enter submits */}
            {!isDefaultState && query.trim() && (
              <button
                className={`${MENU_ROW} gap-[5px]`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleTextSearch}
                role="option"
                aria-selected={false}
              >
                <span className="flex-shrink-0 font-sans text-[14px] text-secondary">Search text for</span>
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[14px] font-medium text-text">&ldquo;{query.trim()}&rdquo;</span>
              </button>
            )}

            {/* Grouped AC results */}
            {hasACResults &&
              groupedItems.map(({ group, items: gItems }) => (
                <div key={group} className="flex flex-col gap-1">
                  <div className={groupHeaderCls}>{group}</div>
                  {gItems.map((item) => {
                    const isFandom = group === 'Fandoms' || group === 'Popular Fandoms';
                    const selected = item.flatIdx === selectedIndex;
                    return (
                      <button
                        key={`${item.group}-${item.name}`}
                        className={`${MENU_ROW} justify-between ${selected ? MENU_ROW_ACTIVE : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyACItem(item)}
                        role="option"
                        id={`${listboxId}-opt-${item.flatIdx}`}
                        aria-selected={selected}
                      >
                        <span
                          className={`min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-text ${
                            isFandom ? 'font-serif text-[15.5px] italic' : 'font-sans text-[15px]'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.kind === 'filter-ac' ? (
                          <span className="flex-shrink-0 rounded-[3px] bg-border px-[5px] py-[1px] font-mono text-[11px] uppercase tracking-[0.07em] text-secondary opacity-70">{item.badge}</span>
                        ) : (
                          item.count != null && (
                            <span className="flex-shrink-0 font-mono text-[12px] text-secondary">{item.count}</span>
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

            {/* Vibe discovery hint — shown when typing + has AC results + no vibe match yet */}
            {showVibeHint && (
              <div className="-mx-2 border-t border-bubble-ring px-[18px] pt-[6px] pb-2 font-mono text-[11.5px] tracking-[0.05em] text-secondary">
                ✦ try: cozy · slow burn · found family · enemies to lovers
              </div>
            )}

            {/* Default state: search history + saved presets */}
            {isDefaultState && (
              <>
                {history.length > 0 && (
                  <div className="flex flex-col gap-1 pb-1">
                    <div className={groupHeaderCls}>Recent</div>
                    {history.map((h) => (
                      <div key={h} className="group/hist flex items-center rounded-xl transition-colors hover:bg-overlay-soft">
                        <button
                          className="flex flex-1 cursor-pointer items-center gap-[7px] border-none bg-transparent px-2.5 py-2 text-left font-sans text-[15px] text-secondary transition-colors hover:text-text group-hover/hist:text-text"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyHistoryItem(h)}
                        >
                          <ClockIcon width={13} height={13} className="flex-shrink-0 text-secondary opacity-[0.55]" />
                          <span>{h}</span>
                        </button>
                        <button
                          className="cursor-pointer border-none bg-none py-2 pl-[6px] pr-2.5 leading-none text-secondary opacity-[0.35] transition-opacity hover:text-text hover:opacity-90"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => handleRemoveHistory(h, e)}
                          aria-label={`Remove "${h}" from history`}
                        >
                          <CloseIcon width={18} height={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {savedPresets.length > 0 && (
                  <div className="-mx-2 flex flex-col gap-1 border-t border-bubble-ring px-2">
                    <div className={groupHeaderCls}>Saved filters</div>
                    {savedPresets.map((preset, i) => (
                      <button
                        key={i}
                        className={MENU_ROW}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyPreset(preset)}
                      >
                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[15px] text-text">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Full-bleed divider: -mx-2 cancels the panel's p-2; px-[18px] re-aligns
                the text with the inset rows (8px panel + 10px row padding). */}
            {/* Inline text flow (not flex items) so a narrow panel wraps the
                whole line like a sentence instead of each span separately. */}
            {/* aria-live: announces the vibe "analyzing…" state swap. */}
            <div aria-live="polite" className="-mx-2 -mb-2 border-t border-bubble-ring px-[18px] py-2 font-mono text-[12px] leading-relaxed text-secondary">
              {isDefaultState ? (
                <>
                  type to search · <UpDownArrowIcon width={13} height={13} className="inline-block align-[-2px]" />{' '}
                  navigate · esc to close
                </>
              ) : vibeLoading ? (
                'analyzing vibe…'
              ) : (
                <>
                  <UpDownArrowIcon width={13} height={13} className="inline-block align-[-2px]" /> select · enter to
                  search text · esc to close
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

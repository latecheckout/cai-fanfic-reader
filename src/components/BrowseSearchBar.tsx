'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchOptions, buildVibeFilters, VibeResult } from '@/lib/filters';
import { PRESETS_KEY, HISTORY_KEY, RATINGS, WARNINGS, CATEGORIES, STATUSES } from '@/lib/constants';
import styles from '@/styles/components/BrowseSearchBar.module.css';

const HISTORY_LIMIT = 5;

interface Preset {
  name: string;
  params: string;
}

function loadPresets(): Preset[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(PRESETS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

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

function addToCommaList(current: string | undefined, value: string): string {
  if (!current) return value;
  const parts = current.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.map((p) => p.toLowerCase()).includes(value.toLowerCase())) return current;
  return [...parts, value].join(',');
}

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
  /** Base path for filter navigation. Defaults to '/' (browse page). Pass '/reading' for library page. */
  basePath?: string;
}

export function BrowseSearchBar({ options, basePath = '/' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const vibeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [isMobileFS, setIsMobileFS] = useState(false);
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

  // ⌘K / Ctrl+K focuses the search input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

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

  const items = buildItems();

  const close = useCallback(() => {
    setFocused(false);
    setIsMobileFS(false);
    setQuery('');
    setSelectedIndex(-1);
    inputRef.current?.blur();
  }, []);

  // Accumulative: merges new filter into existing URL params
  const applyACItem = useCallback((item: SearchItem) => {
    const params = new URLSearchParams(searchParams.toString());
    const { filterKey, filterValue } = item;
    if (MULTI_FILTER_KEYS.includes(filterKey)) {
      params.set(filterKey, addToCommaList(params.get(filterKey) ?? undefined, filterValue));
    } else {
      params.set(filterKey, filterValue);
    }
    if (filterKey === 'q') addToHistory(filterValue);
    router.push(`${basePath}?${params.toString()}`);
    close();
  }, [router, searchParams, close]);

  // Accumulative: merges vibe filters into existing URL params
  const applyVibeItem = useCallback((result: VibeResult) => {
    const params = new URLSearchParams(searchParams.toString());
    const f = result.filters;
    if (f.q) { params.set('q', f.q); addToHistory(f.q); }
    if (f.tag) params.set('tag', addToCommaList(params.get('tag') ?? undefined, f.tag));
    if (f.exTag) params.set('ex_tag', addToCommaList(params.get('ex_tag') ?? undefined, f.exTag));
    if (f.exWarning) params.set('ex_warning', addToCommaList(params.get('ex_warning') ?? undefined, f.exWarning));
    if (f.rating) params.set('rating', addToCommaList(params.get('rating') ?? undefined, f.rating));
    if (f.maxWords != null) params.set('max_words', String(f.maxWords));
    router.push(`${basePath}?${params.toString()}`);
    close();
  }, [router, searchParams, close]);

  const applyPreset = useCallback((preset: Preset) => {
    const p = new URLSearchParams(preset.params);
    const tab = searchParams.get('tab');
    if (tab) p.set('tab', tab);
    router.push(`${basePath}?preset=${encodeURIComponent(preset.name)}&${p.toString()}`);
    close();
  }, [router, searchParams, basePath, close]);

  const applyHistoryItem = useCallback((q: string) => {
    addToHistory(q);
    setHistory(loadHistory());
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', q);
    router.push(`${basePath}?${params.toString()}`);
    close();
  }, [router, searchParams, close]);

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
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', q);
    router.push(`${basePath}?${params.toString()}`);
    close();
  }, [query, router, searchParams, basePath, close]);

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

  // Group items for rendering
  const groupedItems: { group: string; items: SearchItem[] }[] = [];
  items.forEach((item) => {
    const existing = groupedItems.find((g) => g.group === item.group);
    if (existing) existing.items.push(item);
    else groupedItems.push({ group: item.group, items: [item] });
  });

  const isDefaultState = query.trim().length === 0;
  const hasACResults = items.length > 0;
  const showVibeHint = !isDefaultState && !vibeLoading && !vibeResult && hasACResults;

  return (
    <div ref={containerRef} className={`${styles.wrap} ${isMobileFS ? styles.wrapMobileFS : ''}`}>
      {/* inputRow: inputWrap + close × button (mobileFS only) */}
      <div className={`${styles.inputRow} ${isMobileFS ? styles.inputRowMobileFS : ''}`}>
        <div className={styles.inputWrap}>
          {/* Search icon */}
          <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="5.8" cy="5.8" r="4.2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            className={`${styles.input} ${query ? styles.inputWithActions : ''}`}
            placeholder="Search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => {
              setFocused(true);
              if (window.matchMedia('(max-width: 480px)').matches) setIsMobileFS(true);
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={focused}
            aria-controls="search-listbox"
          />

          {/* ⌘K hint — hidden when query is present */}
          {!query && <kbd className={styles.kbdHint}>⌘K</kbd>}

          {/* Clear × and submit circle — visible whenever there's a query */}
          {query && (
            <>
              <button
                className={styles.clearBtn}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery('');
                  setSelectedIndex(-1);
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                ×
              </button>
              <button
                className={styles.submitBtn}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
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
            className={styles.mobileBackBtn}
            onMouseDown={(e) => { e.preventDefault(); close(); }}
            aria-label="Close search"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {focused && (
        <div className={styles.dropdown} role="listbox" id="search-listbox">

          {/* Vibe section — loading or result */}
          {!isDefaultState && (vibeLoading || vibeResult) && (
            <div>
              <div className={styles.groupHeader}><span aria-hidden="true">✦</span> Vibe</div>
              {vibeLoading ? (
                <div className={styles.vibeLoading}>
                  <span className={styles.vibeLoadingDot} />
                  <span className={styles.vibeLoadingDot} />
                  <span className={styles.vibeLoadingDot} />
                </div>
              ) : vibeResult ? (
                <button
                  className={styles.vibeRow}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyVibeItem(vibeResult);
                  }}
                  role="option"
                  aria-selected={false}
                >
                  <span className={styles.vibeDesc}>{vibeResult.desc}</span>
                  <div className={styles.vibePills}>
                    {vibeResult.pills.map((pill, i) => (
                      <span
                        key={i}
                        className={`${styles.vibePill} ${
                          pill.mode === 'include' ? styles.vibePillInclude : styles.vibePillExclude
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
              className={styles.textSearchRow}
              onMouseDown={(e) => {
                e.preventDefault();
                handleTextSearch();
              }}
              role="option"
              aria-selected={false}
            >
              <span className={styles.textSearchLabel}>Search text for</span>
              <span className={styles.textSearchQuery}>&ldquo;{query.trim()}&rdquo;</span>
            </button>
          )}

          {/* Grouped AC results */}
          {hasACResults &&
            groupedItems.map(({ group, items: gItems }) => (
              <div key={group}>
                <div className={styles.groupHeader}>{group}</div>
                {gItems.map((item) => (
                  <button
                    key={`${item.group}-${item.name}`}
                    className={`${styles.acItem} ${
                      item.flatIdx === selectedIndex ? styles.itemSelected : ''
                    } ${
                      group === 'Fandoms' || group === 'Popular Fandoms' ? styles.acItemFandom : ''
                    } ${
                      item.kind === 'filter-ac' ? styles.acItemFilter : ''
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyACItem(item);
                    }}
                    role="option"
                    aria-selected={item.flatIdx === selectedIndex}
                  >
                    <span className={styles.acItemName}>{item.name}</span>
                    {item.kind === 'filter-ac' ? (
                      <span className={styles.acFilterBadge}>{item.badge}</span>
                    ) : (
                      item.count != null && (
                        <span className={styles.acItemCount}>{item.count}</span>
                      )
                    )}
                  </button>
                ))}
              </div>
            ))}

          {/* Vibe discovery hint — shown when typing + has AC results + no vibe match yet */}
          {showVibeHint && (
            <div className={styles.vibeHint}>
              <span aria-hidden="true">✦</span> try: cozy · slow burn · found family · enemies to lovers
            </div>
          )}

          {/* Default state: search history + saved presets */}
          {isDefaultState && (
            <>
              {history.length > 0 && (
                <div className={styles.historySection}>
                  <div className={styles.groupHeader}>Recent</div>
                  {history.map((h) => (
                    <div key={h} className={styles.historyRow}>
                      <button
                        className={styles.historyItem}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyHistoryItem(h);
                        }}
                      >
                        <svg className={styles.historyIcon} width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                          <circle cx="5.5" cy="5.5" r="4.2" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M5.5 3.2V5.5L7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <span>{h}</span>
                      </button>
                      <button
                        className={styles.historyRemove}
                        onMouseDown={(e) => handleRemoveHistory(h, e)}
                        aria-label={`Remove "${h}" from history`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {savedPresets.length > 0 && (
                <div className={styles.savedSection}>
                  <div className={styles.groupHeader}>Saved filters</div>
                  {savedPresets.map((preset, i) => (
                    <button
                      key={i}
                      className={styles.savedRow}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyPreset(preset);
                      }}
                    >
                      <span className={styles.savedName}>{preset.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className={styles.hint}>
            {isDefaultState
              ? 'type to search · ↑↓ navigate · esc to close'
              : vibeLoading
              ? 'analyzing vibe…'
              : '↑↓ select · enter to search text · esc to close'}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOptions, buildVibeFilters, VibeResult } from '@/lib/filters';
import styles from '@/styles/components/SearchOverlay.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  options: SearchOptions;
}

type PanelMode = 'main' | 'no-results' | 'vibe-loading' | 'vibe-confirm';

interface ACItem {
  group: string;
  name: string;
  count?: number;
  filterKey: string;
  filterValue: string;
}

export function SearchOverlay({ isOpen, onClose, options }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const vibeAbortRef = useRef(false);
  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState<PanelMode>('main');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [vibeResult, setVibeResult] = useState<VibeResult | null>(null);

  // Reset state when opened; abort any running vibe sequence on close
  useEffect(() => {
    if (isOpen) {
      vibeAbortRef.current = false;
      setQuery('');
      setPanel('main');
      setSelectedIndex(-1);
      setVibeResult(null);
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => {
        clearTimeout(t);
        vibeAbortRef.current = true;
      };
    }
  }, [isOpen]);

  // Escape key closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Build flat AC item list — popular items when no query, filtered when typing
  const buildItems = useCallback((): ACItem[] => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Default state: popular fandoms + popular tags (keyboard-navigable)
      const items: ACItem[] = [];
      options.fandoms
        .slice(0, 4)
        .forEach((f) => items.push({ group: 'Popular Fandoms', name: f.name, count: f.count, filterKey: 'fandom', filterValue: f.name }));
      options.tags
        .slice(0, 5)
        .forEach((t) => items.push({ group: 'Popular Tags', name: t.name, count: t.count, filterKey: 'tag', filterValue: t.name }));
      return items;
    }

    const limit = 4;
    const items: ACItem[] = [];

    options.fandoms
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, limit)
      .forEach((f) => items.push({ group: 'Fandoms', name: f.name, count: f.count, filterKey: 'fandom', filterValue: f.name }));

    options.authors
      ?.filter((a) => a.name.toLowerCase().includes(q))
      .slice(0, limit)
      .forEach((a) => items.push({ group: 'Authors', name: a.name, count: a.count, filterKey: 'q', filterValue: a.name }));

    options.characters
      ?.filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, limit)
      .forEach((c) => items.push({ group: 'Characters', name: c.name, count: c.count, filterKey: 'character', filterValue: c.name }));

    options.relationships
      ?.filter((r) => r.name.toLowerCase().includes(q))
      .slice(0, limit)
      .forEach((r) => items.push({ group: 'Relationships', name: r.name, count: r.count, filterKey: 'relationship', filterValue: r.name }));

    options.tags
      .filter((t) => t.name.toLowerCase().includes(q))
      .slice(0, limit)
      .forEach((t) => items.push({ group: 'Tags', name: t.name, count: t.count, filterKey: 'tag', filterValue: t.name }));

    return items;
  }, [query, options]);

  const acItems = buildItems();

  const applyItem = useCallback(
    (item: ACItem) => {
      onClose();
      router.push(`/?${item.filterKey}=${encodeURIComponent(item.filterValue)}`);
    },
    [router, onClose]
  );

  const handleSubmit = useCallback(async () => {
    const q = query.trim();
    if (!q) return;

    // 1. AC item selected — apply it directly
    if (selectedIndex >= 0 && selectedIndex < acItems.length) {
      applyItem(acItems[selectedIndex]);
      return;
    }

    // 2. Vibe search — catches descriptive queries before generic text search
    const vibe = buildVibeFilters(q);
    if (vibe) {
      setPanel('vibe-loading');
      await new Promise<void>((res) => setTimeout(res, 700));
      if (vibeAbortRef.current) return;
      setVibeResult(vibe);
      setPanel('vibe-confirm');
      await new Promise<void>((res) => setTimeout(res, 1100));
      if (vibeAbortRef.current) return;
      const params = new URLSearchParams();
      const f = vibe.filters;
      if (f.tag) params.set('tag', f.tag);
      if (f.exTag) params.set('ex_tag', f.exTag);
      if (f.exWarning) params.set('ex_warning', f.exWarning);
      if (f.rating) params.set('rating', f.rating);
      if (f.maxWords != null) params.set('max_words', String(f.maxWords));
      onClose();
      router.push(`/?${params.toString()}`);
      return;
    }

    // 3. Generic text search (also matches titles via applyFilters)
    onClose();
    router.push(`/?q=${encodeURIComponent(q)}`);
  }, [query, selectedIndex, acItems, applyItem, router, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (panel === 'vibe-loading' || panel === 'vibe-confirm') return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (acItems.length > 0) {
        setSelectedIndex((i) => Math.min(i + 1, acItems.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Backspace' && query === '') {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Build grouped items with pre-computed flat indices for arrow-key selection
  const groupedItems: { group: string; items: (ACItem & { flatIdx: number })[] }[] = [];
  let counter = 0;
  acItems.forEach((item) => {
    const existing = groupedItems.find((g) => g.group === item.group);
    const withIdx = { ...item, flatIdx: counter++ };
    if (existing) {
      existing.items.push(withIdx);
    } else {
      groupedItems.push({ group: item.group, items: [withIdx] });
    }
  });

  const isDefaultState = query.trim().length === 0;
  const showMainPanel = panel !== 'vibe-loading' && panel !== 'vibe-confirm' && acItems.length > 0;
  const showNoResults =
    query.trim().length > 0 &&
    acItems.length === 0 &&
    panel !== 'vibe-loading' &&
    panel !== 'vibe-confirm';

  return (
    <div className={styles.overlay} role="dialog" aria-modal aria-label="Search">
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.container}>
        {/* Capsule input row */}
        <div className={styles.inputWrap}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="search fandoms, tags, or describe a vibe…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
              setPanel('main');
            }}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            aria-autocomplete="list"
          />
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            aria-label="Submit search"
          >
            →
          </button>
        </div>

        {/* Main panel — popular items (default) or filtered AC (typing) */}
        {showMainPanel && (
          <div className={styles.panel} role="listbox">
            {groupedItems.map(({ group, items: gItems }) => (
              <div key={group}>
                <div className={styles.groupHeader}>{group}</div>
                {gItems.map((item) => (
                  <button
                    key={`${item.group}-${item.name}`}
                    className={`${styles.acItem} ${item.flatIdx === selectedIndex ? styles.acItemSelected : ''} ${group === 'Fandoms' || group === 'Popular Fandoms' ? styles.acItemFandom : ''}`}
                    onClick={() => applyItem(item)}
                    role="option"
                    aria-selected={item.flatIdx === selectedIndex}
                  >
                    <span className={styles.acItemName}>{item.name}</span>
                    {item.count != null && (
                      <span className={styles.acItemCount}>{item.count}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
            <div className={styles.hintFooter}>
              {isDefaultState
                ? 'type to search · ↑↓ navigate · esc to close'
                : '↑↓ navigate · enter to apply · esc to close'}
            </div>
          </div>
        )}

        {/* No AC matches — vibe hint */}
        {showNoResults && (
          <div className={styles.panel}>
            <div className={styles.noResults}>No matches — press Enter for vibe search</div>
            <div className={styles.hintFooter}>enter to search · esc to close</div>
          </div>
        )}

        {/* Vibe loading */}
        {panel === 'vibe-loading' && (
          <div className={styles.panel}>
            <div className={styles.vibeLoading}>
              thinking
              <span className={styles.ldots}>
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          </div>
        )}

        {/* Vibe confirmation */}
        {panel === 'vibe-confirm' && vibeResult && (
          <div className={styles.panel}>
            <div className={styles.vibeConfirm}>
              <div className={styles.vibeConfirmLabel}>Applying: {vibeResult.desc}</div>
              <div className={styles.vibeConfirmPills}>
                {vibeResult.pills.map((pill, i) => (
                  <span
                    key={i}
                    className={`${styles.vibeConfirmPill} ${
                      pill.mode === 'include'
                        ? styles.vibeConfirmPillInclude
                        : styles.vibeConfirmPillExclude
                    }`}
                  >
                    {pill.mode === 'include' ? '+' : '−'} {pill.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

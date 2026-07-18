'use client';

import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SearchOptions } from '@/lib/filters';
import { BrowseSearchBar } from './BrowseSearchBar';
import { RATINGS, WARNINGS, CATEGORIES, STATUSES } from '@/lib/constants';
import {
  Preset,
  addToCommaList,
  removeFromCommaList,
  getPillState,
  setSortParam,
  presetToParams,
} from '@/lib/filterParams';
import { ratingTier } from '@/lib/ratings';
import { formatWordRange } from '@/lib/utils';
import { POPOVER_PANEL } from './popoverChrome';
import { ChevronDownIcon, CloseIcon, PlusIcon, MinusIcon, CheckIcon, ProgressIcon, CalendarIcon } from './icons';
import { GhostButton, PILL_METRICS, PILL_SHAPE, PILL_INCLUDE, PILL_EXCLUDE } from './GhostButton';
import { SortDropdown, SORT_OPTIONS } from './SortDropdown';
import { useDrawer } from '@/hooks/useDrawer';
import { usePresets } from '@/hooks/usePresets';
import { usePendingParams } from '@/hooks/usePendingParams';
import { EASE_OUT_EXPO, PILL_EXIT } from '@/lib/motion';
import { Tooltip } from './Tooltip';

type PillState = 'neutral' | 'include' | 'exclude';

// Panel-close curve (mirrors --collapse token; motion needs a literal array).
const EASE_COLLAPSE = [0.4, 0, 0.8, 1] as const;

interface Props {
  /** When set, the toolbar renders its own search bar (the catalog surface);
      other pages rely on the global header search instead. */
  searchOptions?: SearchOptions;
  /** Custom search element for the toolbar (e.g. the Library's scoped
      "Search your bookmarks" input). Takes precedence over searchOptions. */
  searchSlot?: ReactNode;
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
  filteredCount: number;
  /** Base path for filter navigation. Defaults to '/browse' (catalog). Pass '/reading' for library page. */
  basePath?: string;
}

const WARNING_LABELS: Record<string, string> = {
  'Major Character Death': 'Major Death',
  'Graphic Depictions Of Violence': 'Graphic Violence',
  'Non-Con': 'Non-Con',
  'Underage': 'Underage',
  'Creator Chose Not To Use Archive Warnings': 'Choose Not To Warn',
};
// The include/exclude pill sections share one shape — a labelled DrawerSection
// wrapping a list of 3-state FilterPills — differing only in this config.
const PILL_SECTIONS: {
  key: string;
  label: string;
  inc: string;
  ex: string;
  values: string[];
  variant: 'rating' | 'status' | 'chip';
  containerCls: string;
  note?: string;
  labelMap?: Record<string, string>;
}[] = [
  { key: 'rating', label: 'Rating', inc: 'rating', ex: 'ex_rating', values: RATINGS, variant: 'rating', containerCls: 'flex w-full gap-1.5' },
  { key: 'warnings', label: 'Warnings', inc: 'warning', ex: 'ex_warning', values: WARNINGS, variant: 'chip', containerCls: 'flex flex-wrap gap-1.5', note: 'Selecting a warning includes works tagged with it.', labelMap: WARNING_LABELS },
  { key: 'category', label: 'Category', inc: 'category', ex: 'ex_category', values: CATEGORIES, variant: 'chip', containerCls: 'flex flex-wrap gap-1.5' },
  { key: 'status', label: 'Status', inc: 'status', ex: 'ex_status', values: STATUSES, variant: 'status', containerCls: 'flex flex-wrap gap-1.5' },
];
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
    parts.push(ratingTier(r.trim()).letter);
  });
  const category = p.get('category');
  if (category) category.split(',').slice(0, 2).forEach((c) => parts.push(c.trim()));
  const status = p.get('status');
  if (status) parts.push(status.split(',')[0].trim());
  const wordRange = formatWordRange(p.get('min_words') ?? undefined, p.get('max_words') ?? undefined);
  if (wordRange) parts.push(wordRange);
  const result = parts.join(' · ');
  return result.length > 42 ? result.slice(0, 42) + '…' : result;
}

// ── Drawer section wrapper (header + chevron + Clear + collapse) ──
// Factored out of the six copy-pasted sections (rating/warnings/category/
// status/words/date). The Clear button fades in via AnimatePresence
// (was the sectionClearIn keyframe).
function DrawerSection({
  label,
  open,
  onToggle,
  showClear = false,
  onClear,
  reduce,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  /** Sections without a clearable state (e.g. mobile Sort) omit both. */
  showClear?: boolean;
  onClear?: () => void;
  reduce: boolean | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 px-5 py-4">
      <div className="group flex items-center justify-between gap-2">
        <button
          className="mr-auto inline-flex items-center gap-1.5 p-0 text-left"
          onClick={onToggle}
          aria-expanded={open}
        >
          <span className="whitespace-nowrap font-sans text-sm font-semibold normal-case tracking-normal text-text">
            {label}
          </span>
          {/* Revealed on hover/focus of the header row; always visible on touch. */}
          <ChevronDownIcon
            className={`h-[18px] w-[18px] flex-shrink-0 text-secondary opacity-0 transition-[opacity,transform] duration-200 ease-out-expo group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100 ${
              open ? 'rotate-0' : '-rotate-90'
            }`}
          />
        </button>
        <AnimatePresence>
          {showClear && (
            <motion.button
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-0 font-sans text-[13px] text-secondary transition-colors duration-150 hover:text-text"
              onClick={onClear}
            >
              Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {open && children}
    </div>
  );
}

// ── Shared drawer-pill class builders (module-level so FilterPill and the
// words/date/sort sections share one definition). Metrics come from
// PILL_METRICS (GhostButton.tsx) — the pill source of truth. ──
const DPILL_BASE =
  `${PILL_METRICS} px-3.5 cursor-pointer transition-[background,color,border-color] duration-150 ease-in-out`;
function dPillClass(state: PillState) {
  if (state === 'include')
    return `${DPILL_BASE} ${PILL_INCLUDE} hover:bg-[rgba(43,146,71,0.16)]`;
  if (state === 'exclude')
    return `${DPILL_BASE} ${PILL_EXCLUDE} hover:bg-[rgba(217,0,0,0.13)]`;
  return `${DPILL_BASE} bg-transparent border-border-strong text-secondary hover:text-text hover:border-border-active`;
}

// ── Preset pills + dashed "Custom" expander — shared skeleton of the Words
// and Updated sections (preset row → Custom toggle → animated custom body).
// `children` is the section-specific custom body (number inputs / date inputs).
function PresetExpanderSection({
  label,
  open,
  onToggle,
  showClear,
  onClear,
  reduce,
  presets,
  customOpen,
  onToggleCustom,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  showClear: boolean;
  onClear: () => void;
  reduce: boolean | null;
  presets: { key: string; label: string; active: boolean; onClick: () => void }[];
  customOpen: boolean;
  onToggleCustom: () => void;
  children: ReactNode;
}) {
  return (
    <DrawerSection label={label} open={open} onToggle={onToggle} showClear={showClear} onClear={onClear} reduce={reduce}>
      <>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button key={p.key} className={dPillClass(p.active ? 'include' : 'neutral')} onClick={p.onClick}>
              {p.label}
            </button>
          ))}
          <button
            className={`${dPillClass('neutral')} border-dashed pr-2`}
            onClick={onToggleCustom}
            aria-expanded={customOpen}
          >
            Custom{' '}
            <ChevronDownIcon className={`ml-[3px] inline-block h-[18px] w-[18px] align-[-5px] transition-transform duration-200 ease-out-expo ${customOpen ? 'rotate-0' : '-rotate-90'}`} />
          </button>
        </div>
        <AnimatePresence initial={false}>
          {customOpen && (
            <motion.div
              key="custom"
              initial={reduce ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </DrawerSection>
  );
}

// Custom word-range number input (min/max pair in the Words section).
const RANGE_INPUT =
  'w-[88px] rounded-lg border border-border-strong bg-transparent px-2.5 py-[5px] font-mono text-sm max-md:text-base text-text outline-none transition-[border-color] duration-150 placeholder:text-text focus:border-border-active';

// ── FilterPill — the 3-state cycle pill shared by the rating / warnings /
// category / status sections. Top-level (`rerender-no-inline-components`) and
// memoized (`rerender-memo`) since ~20 render at once; a stable `onCycle`
// (cyclePill, made stable via refs in FilterPanel) keeps memo effective.
// Three visual variants preserve the exact per-section markup:
//   'rating' → per-tier color card (letter + short name)
//   'status' → icon + label card
//   'chip'   → dPillClass capsule + optional +/− indicator (warnings/category)
interface FilterPillProps {
  variant: 'rating' | 'status' | 'chip';
  value: string;
  incKey: string;
  exKey: string;
  state: PillState;
  flipping: boolean;
  reduce: boolean | null;
  onCycle: (value: string, incKey: string, exKey: string) => void;
  /** Display label for the chip variant (rating/status derive their own text). */
  label?: string;
}

// Shared shell for the toolbar's filter pills + active-preset chip. PILL_SHAPE
// box model, except vertical padding lives on the inner segments (label /
// remove) so each keeps its own hit area — heights still match. Each variant
// supplies its own single border color.
const TOOLBAR_PILL = `inline-flex flex-shrink-0 items-center ${PILL_SHAPE} max-md:text-sm`;

// Custom date input: native picker indicator invisible but clickable, our
// CalendarIcon rendered in its place. One definition for the from/to pair.
function DateInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <span className="relative min-w-0 flex-1">
      <input
        type="date"
        aria-label={label}
        className="w-full rounded-lg border border-border-strong bg-transparent py-[5px] pl-2.5 pr-7 font-mono text-sm max-md:text-base text-text outline-none transition-[border-color] duration-150 focus:border-border-active [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <CalendarIcon width={15} height={15} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-secondary" />
    </span>
  );
}

// Toolbar active-filter pill — top-level + memoized (rerender-no-inline-components):
// one renders per active filter, and togglePill/removePill are useCallback-stable.
const ActiveFilterPill = memo(function ActiveFilterPill({
  pill,
  reduce,
  onToggle,
  onRemove,
}: {
  pill: ActivePill;
  reduce: boolean | null;
  onToggle: (pill: ActivePill) => void;
  onRemove: (pill: ActivePill) => void;
}) {
  return (
    // No `layout` here: the sticky bar's own height changes as pills wrap, and
    // layout-animating against that moving container made the whole group
    // visibly "shoot" from stale positions before settling.
    <motion.div
      initial={reduce ? false : { scale: 0.82, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={reduce ? { opacity: 0 } : PILL_EXIT}
      transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
      className={`${TOOLBAR_PILL} max-w-[240px] overflow-hidden ${
        pill.isExclude
          ? 'border-[var(--color-exclude-border)] bg-[var(--color-exclude-bg)] text-[var(--color-exclude)]'
          : 'border-transparent bg-text text-bg'
      }`}
    >
      {pill.canToggle ? (
        <Tooltip label={pill.isExclude ? 'Click to include' : 'Click to exclude'}>
          <button
            className="inline-flex min-w-0 cursor-pointer items-center gap-1.5 border-none bg-transparent py-1.5 pl-3 pr-1 font-[inherit] text-[inherit] text-inherit transition-opacity duration-150 hover:opacity-85"
            onClick={() => onToggle(pill)}
          >
            {pill.isExclude ? (
              <MinusIcon width={17} height={17} className="flex-shrink-0 opacity-70" />
            ) : (
              <PlusIcon width={17} height={17} className="flex-shrink-0 opacity-70" />
            )}
            <span className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">{pill.label}</span>
          </button>
        </Tooltip>
      ) : (
        <Tooltip label={pill.label}>
          <span className="inline-flex min-w-0 cursor-default items-center py-1.5 pl-3 pr-0">
            <span className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">{pill.label}</span>
          </span>
        </Tooltip>
      )}
      <button
        className="flex-shrink-0 cursor-pointer py-1.5 pl-1 pr-2.5 leading-none text-inherit opacity-50 transition-opacity duration-150 hover:opacity-100"
        onClick={() => onRemove(pill)}
        aria-label={`Remove ${pill.label}`}
      >
        <CloseIcon width={17} height={17} className="block" />
      </button>
    </motion.div>
  );
});

const FilterPill = memo(function FilterPill({
  variant,
  value,
  incKey,
  exKey,
  state,
  flipping,
  reduce,
  onCycle,
  label,
}: FilterPillProps) {
  // Include→exclude flip keyframes (was the parent's flipProps helper).
  const flipAnim = reduce
    ? {}
    : {
        animate: flipping
          ? { scale: [1, 1.1, 0.92, 1], rotate: [0, 2, -1, 0] }
          : { scale: 1, rotate: 0 },
        transition: {
          duration: 0.22,
          ease: EASE_OUT_EXPO,
          times: flipping ? [0, 0.3, 0.65, 1] : undefined,
        },
      };
  const handleClick = () => onCycle(value, incKey, exKey);
  // Announces the current state, then the next action in the cycle.
  const title =
    state === 'neutral'
      ? `Include ${value}`
      : state === 'include'
        ? `${value} included, activate to exclude`
        : `${value} excluded, activate to clear`;

  if (variant === 'rating') {
    const tier = ratingTier(value);
    const stateClass =
      state === 'include'
        ? tier.includeClass
        : state === 'exclude'
          ? 'bg-[var(--color-exclude-bg)] border-[var(--color-exclude-border)]'
          : 'bg-transparent border-border-strong hover:border-border-active hover:bg-[color-mix(in_srgb,var(--text)_4%,transparent)]';
    const letterClass =
      state === 'include' ? tier.fg : state === 'exclude' ? 'text-[var(--color-exclude)] line-through' : 'text-text';
    return (
      <motion.button
        {...flipAnim}
        className={`flex aspect-square flex-1 items-center justify-center rounded-lg border cursor-pointer transition-[background,border-color,color] duration-150 ease-in-out ${stateClass}`}
        onClick={handleClick}
        title={title}
        aria-label={title}
      >
        {/* Letter-only, RatingBadge typography (WorkCardCover) for consistency */}
        <span className={`font-sans text-[13px] font-bold leading-none tracking-[0.02em] ${letterClass}`}>{tier.letter}</span>
      </motion.button>
    );
  }

  if (variant === 'status') {
    // Same capsule scale as the warnings/category chips and the Custom pill.
    const StatusIcon = value === 'Complete' ? CheckIcon : ProgressIcon;
    return (
      // pl-3 pulls the icon in for optical alignment (icon glyphs carry inset
      // padding of their own); mr-1.5 gives the label breathing room.
      <motion.button {...flipAnim} className={`${dPillClass(state)} pl-3`} onClick={handleClick} title={title} aria-label={title}>
        <StatusIcon width={16} height={16} className="mr-1.5 inline-block align-[-3px] opacity-70" />
        {value}
      </motion.button>
    );
  }

  // 'chip' — warnings + category. When a state icon leads, pl-3 optically
  // aligns it and mr-1.5 spaces it from the label.
  return (
    <motion.button
      {...flipAnim}
      className={`${dPillClass(state)} ${state !== 'neutral' ? 'pl-3' : ''}`}
      onClick={handleClick}
      title={title}
      aria-label={title}
    >
      {state !== 'neutral' &&
        (state === 'include' ? (
          <PlusIcon width={16} height={16} className="mr-1.5 inline-block align-[-3px] opacity-70" />
        ) : (
          <MinusIcon width={16} height={16} className="mr-1.5 inline-block align-[-3px] opacity-70" />
        ))}
      {label ?? value}
    </motion.button>
  );
});

export function FilterPanel({
  searchOptions,
  searchSlot,
  currentFilters,
  filteredCount,
  basePath = '/browse',
}: Props) {
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Drawer open/close, push panel, F/Esc, mobile click-outside (see useDrawer).
  // `escapeBlocked: sortOpen` preserves the original priority where an open sort
  // dropdown consumes Escape before the drawer.
  const { open: drawerOpen, setOpen: setDrawerOpen, toggle: toggleDrawer, close: closeDrawer, drawerRef } =
    useDrawer({ isMobile, escapeBlocked: sortOpen });

  // Saved-filter presets + toast (state + persistence; navigation stays here).
  const { presets, addPreset, deletePreset, updatePreset, toastMessage, showToast } = usePresets();

  const [wordMin, setWordMin] = useState(currentFilters.min_words ?? '');
  const [wordMax, setWordMax] = useState(currentFilters.max_words ?? '');
  const [dateFrom, setDateFrom] = useState(currentFilters.date_from ?? '');
  const [dateTo, setDateTo] = useState(currentFilters.date_to ?? '');
  const [saveFormOpen, setSaveFormOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  // Flip animation — values currently playing the include→exclude flip
  const [flippedPills, setFlippedPills] = useState<Set<string>>(new Set());
  // Custom expanders
  const [wordsCustomOpen, setWordsCustomOpen] = useState(false);
  const [dateCustomOpen, setDateCustomOpen] = useState(false);

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
  const wordDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawerCloseBtnRef = useRef<HTMLButtonElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const savePopoverRef = useRef<HTMLDivElement>(null);
  const savePresetBtnRef = useRef<HTMLButtonElement>(null);
  const popoverBtnRect = useRef<DOMRect | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
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

  // Focus close button when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      requestAnimationFrame(() => drawerCloseBtnRef.current?.focus());
    }
  }, [drawerOpen]);

  // Restore focus to the Filters toggle when the drawer closes, so keyboard
  // users aren't dropped to <body> after Escape / Close.
  const filtersBtnRef = useRef<HTMLButtonElement>(null);
  const drawerWasOpen = useRef(false);
  useEffect(() => {
    if (drawerWasOpen.current && !drawerOpen) {
      filtersBtnRef.current?.focus({ preventScroll: true });
    }
    drawerWasOpen.current = drawerOpen;
  }, [drawerOpen]);

  // Escape closes the save-preset popover (capture phase: it must win over
  // useDrawer's Escape, which would close the whole drawer) and returns focus
  // to its trigger.
  useEffect(() => {
    if (!saveFormOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setSaveFormOpen(false);
        setSaveName('');
        savePresetBtnRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [saveFormOpen]);

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

  // Every URL mutation goes through readParams/pushParams (shared with
  // BrowseSearchBar via module-level pending state) so mutations fired close
  // together compose instead of last-write-winning — see usePendingParams.
  // Both are stable, keeping cyclePill referentially stable for the memoized
  // FilterPill (~20 instances).
  const { readParams, pushParams } = usePendingParams(basePath);

  const handleSortChange = useCallback(
    (v: string) => {
      const params = readParams();
      setSortParam(params, v);
      pushParams(params);
    },
    [readParams, pushParams]
  );

  // 3-state pill cycling: neutral → include → exclude → neutral
  const cyclePill = useCallback(
    (value: string, incKey: string, exKey: string) => {
      const params = readParams();
      const inc = params.get(incKey) ?? undefined;
      const ex = params.get(exKey) ?? undefined;
      const state = getPillState(value, inc, ex);

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

      if (state === 'neutral') {
        params.set(incKey, addToCommaList(inc, value));
      } else if (state === 'include') {
        const newInc = removeFromCommaList(inc, value);
        if (newInc) params.set(incKey, newInc);
        else params.delete(incKey);
        params.set(exKey, addToCommaList(ex, value));
      } else {
        const newEx = removeFromCommaList(ex, value);
        if (newEx) params.set(exKey, newEx);
        else params.delete(exKey);
      }
      pushParams(params);
    },
    [readParams, pushParams]
  );

  // Section-level clear
  const clearSection = useCallback(
    (keys: string[]) => {
      const params = readParams();
      keys.forEach((k) => params.delete(k));
      pushParams(params);
    },
    [readParams, pushParams]
  );

  // Word count presets
  const applyWordPreset = (min?: number, max?: number) => {
    const params = readParams();
    if (min != null) params.set('min_words', String(min));
    else params.delete('min_words');
    if (max != null) params.set('max_words', String(max));
    else params.delete('max_words');
    pushParams(params);
  };

  // Word count custom inputs (debounced 400ms)
  const handleWordInput = (min: string, max: string) => {
    setWordMin(min);
    setWordMax(max);
    if (wordDebounceRef.current) clearTimeout(wordDebounceRef.current);
    wordDebounceRef.current = setTimeout(() => {
      const params = readParams();
      if (min) params.set('min_words', min);
      else params.delete('min_words');
      if (max) params.set('max_words', max);
      else params.delete('max_words');
      pushParams(params);
    }, 400);
  };

  // Date preset
  const applyDatePreset = (value: string) => {
    const params = readParams();
    if (value) {
      params.set('date_preset', value);
      params.delete('date_from');
      params.delete('date_to');
    } else {
      params.delete('date_preset');
    }
    pushParams(params);
  };

  // Date custom range
  const applyDateCustom = (from: string, to: string) => {
    const params = readParams();
    params.delete('date_preset');
    if (from) params.set('date_from', from);
    else params.delete('date_from');
    if (to) params.set('date_to', to);
    else params.delete('date_to');
    pushParams(params);
  };

  // Saved presets (drawer) — persistence via usePresets; navigation here.
  const savePreset = () => {
    if (!saveName.trim()) return;
    const name = saveName.trim();
    const params = readParams();
    addPreset({ name, params: params.toString() });
    setSaveName('');
    setSaveFormOpen(false);
    params.set('preset', name);
    pushParams(params);
  };

  const applyPreset = (preset: Preset) => {
    pushParams(presetToParams(preset, readParams().get('tab')));
    closeDrawer();
    showToast(`'${preset.name}' loaded`);
  };

  const clearAll = () => {
    const tab = readParams().get('tab');
    const params = new URLSearchParams();
    if (tab) params.set('tab', tab);
    pushParams(params);
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

  // Remove a single pill — navigates immediately; AnimatePresence plays the exit
  // as the pill leaves the derived list.
  const removePill = useCallback((pill: ActivePill) => {
    const params = readParams();
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
    pushParams(params);
  }, [readParams, pushParams]);

  // Toggle pill between include ↔ exclude
  const togglePill = useCallback((pill: ActivePill) => {
    const mapping = INC_EX_MAP[pill.paramKey];
    if (!mapping) return;
    const params = readParams();
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
    pushParams(params);
  }, [readParams, pushParams]);

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
    const label = formatWordRange(currentFilters.min_words, currentFilters.max_words);
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
    updatePreset(activePresetName, currentParamsWithoutPreset);
    showToast(`'${activePresetName}' updated`);
  };

  const handlePresetDismiss = () => {
    const p = readParams();
    p.delete('preset');
    pushParams(p);
  };

  // Active word preset detection
  const activeWordPreset = WORD_PRESETS.find(
    (p) =>
      String(p.min ?? '') === (currentFilters.min_words ?? '') &&
      String(p.max ?? '') === (currentFilters.max_words ?? '')
  );

  // Drawer slide variants — X on desktop, Y (bottom sheet) on mobile.
  const drawerAnim = reduce
    ? { initial: false as const, animate: {}, exit: {}, transition: { duration: 0 } }
    : isMobile
      ? {
          // 110% (not 100%): the card floats 12px inside the bottom edge, so
          // 100% of its own height wouldn't fully clear it (or its shadow).
          initial: { y: '110%' },
          animate: { y: 0 },
          exit: { y: '110%', transition: { duration: 0.2, ease: EASE_COLLAPSE } },
          transition: { duration: 0.25, ease: EASE_OUT_EXPO },
        }
      : {
          // 110%: the card rests 12px inside the viewport edge, so 100% of its
          // own width wouldn't fully clear it (or its shadow).
          initial: { x: '110%' },
          animate: { x: 0 },
          exit: { x: '110%', transition: { duration: 0.2, ease: EASE_COLLAPSE } },
          transition: { duration: 0.22, ease: EASE_OUT_EXPO },
        };

  return (
    <>
      {/* Sentinel: sits just above the sticky bar; triggers data-stuck on scroll */}
      <div ref={sentinelRef} style={{ height: 0, overflow: 'hidden' }} aria-hidden="true" />
      <div
        ref={barRef}
        className="sticky top-[var(--header-height)] z-50 mb-5 pt-3 bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] [backdrop-filter:blur(8px)_saturate(1.2)] [-webkit-backdrop-filter:blur(8px)_saturate(1.2)] [&[data-stuck]]:border-b [&[data-stuck]]:border-border [body.search-fs-open_&]:z-[500] [body.search-fs-open_&]:[backdrop-filter:none]"
      >
        {/* Row 1: search (catalog surface) + controls — pages without
            searchOptions rely on the global header search, so the controls
            just sit right. */}
        <motion.div
          className="flex items-center gap-2 pb-1.5"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.175, ease: EASE_OUT_EXPO }}
        >
          {searchSlot ?? (searchOptions && <BrowseSearchBar options={searchOptions} basePath={basePath} />)}

          <div className={`flex items-center gap-2 ${searchSlot || searchOptions ? '' : 'ml-auto'}`}>
          {/* Sort capsule button + popover (desktop only) */}
          <SortDropdown
            currentValue={currentSortValue}
            onChange={handleSortChange}
            open={sortOpen}
            onOpenChange={setSortOpen}
            className="max-md:hidden"
          />

          {/* Filters button — icon-only on mobile, full label on desktop */}
          <button
            className={`group inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 font-sans text-sm leading-none whitespace-nowrap flex-shrink-0 cursor-pointer transition-[color,border-color,background,box-shadow] duration-150 ease-in-out max-md:h-11 max-md:w-11 max-md:justify-center max-md:p-0 ${
              drawerOpen
                ? 'border-transparent bg-secondary text-bg hover:text-bg hover:opacity-90'
                : activeFilterCount > 0
                  ? 'border-border-active bg-transparent text-text hover:border-border-active hover:text-text'
                  : 'border-border-strong bg-transparent text-secondary hover:border-border-active hover:text-text'
            }`}
            ref={filtersBtnRef}
            onClick={toggleDrawer}
            aria-label={drawerOpen ? 'Close filters' : 'Open filters'}
            aria-expanded={drawerOpen}
            aria-haspopup="dialog"
          >
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
              <path d="M1 1.5h10M3 5h6M5 8.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="max-md:hidden">Filters</span>
            {activeFilterCount > 0 && (
              <span className={`font-medium max-md:hidden ${drawerOpen ? 'text-bg opacity-80' : 'text-text'}`}>· {activeFilterCount}</span>
            )}
            <kbd className="ml-px font-mono text-xs tracking-[0.02em] opacity-60 max-md:hidden">F</kbd>
          </button>
          </div>
        </motion.div>

        {/* Pills row: active filter pills — only shown when filters are active */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {activePresetName ? (
              /* Preset chip mode — show single chip instead of individual pills */
              <motion.div
                className={`${TOOLBAR_PILL} group/chip relative max-w-[260px] gap-1.5 overflow-visible border-[var(--preset-blue-border)] bg-[var(--preset-blue-bg)] py-0 pl-3 pr-0 text-[var(--preset-blue)]`}
                initial={reduce ? false : { scale: 0.82, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
              >
                <span className="overflow-hidden text-ellipsis whitespace-nowrap py-1.5">{activePresetName}</span>
                {activePreset && (
                  <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-0 z-[300] translate-y-[3px] whitespace-nowrap rounded-md border border-border-strong bg-card px-2.5 py-[5px] font-sans text-[13px] text-secondary opacity-0 shadow-[0_2px_8px_rgba(26,24,22,0.10)] transition-[opacity,transform] duration-150 group-hover/chip:translate-y-0 group-hover/chip:opacity-100">
                    {parsePresetParams(activePreset.params) || 'No filters set'}
                  </span>
                )}
                {isPresetModified && (
                  <span className="ml-0.5 inline-flex items-center gap-1">
                    {/* preventDefault on mousedown stops the pre-click blur;
                        actions live on click so Enter/Space work too. */}
                    <button className="p-0 font-sans text-[13px] text-secondary transition-colors duration-150 hover:text-text hover:underline" onMouseDown={(e) => e.preventDefault()} onClick={handlePresetUpdate}>
                      Update
                    </button>
                    <button className="p-0 font-sans text-[13px] text-secondary transition-colors duration-150 hover:text-text hover:underline" onMouseDown={(e) => e.preventDefault()} onClick={() => setSaveFormOpen(true)}>
                      Save as new
                    </button>
                  </span>
                )}
                <button
                  className="flex-shrink-0 py-1.5 pl-1 pr-2.5 leading-none text-[var(--preset-blue)] opacity-55 transition-opacity duration-150 hover:opacity-100"
                  onClick={handlePresetDismiss}
                  aria-label="Remove preset"
                >
                  <CloseIcon width={17} height={17} className="block" />
                </button>
              </motion.div>
            ) : (
              /* Normal pill mode */
              <AnimatePresence>
                {visiblePills.map((pill) => (
                  <ActiveFilterPill key={pill.id} pill={pill} reduce={reduce} onToggle={togglePill} onRemove={removePill} />
                ))}
              </AnimatePresence>
            )}
            {!activePresetName && overflowCount > 0 && (
              <button
                className="inline-flex flex-shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full border border-dashed border-border-strong bg-transparent px-3 py-1.5 font-sans text-[14px] text-secondary transition-[color,border-color] duration-150 ease-in-out hover:border-border-active hover:text-text"
                onClick={() => setDrawerOpen(true)}
                aria-label={`${overflowCount} more filters`}
              >
                +{overflowCount} more
              </button>
            )}
            <div className="relative ml-auto flex flex-shrink-0 items-center gap-2">
              {!activePresetName && (
                <GhostButton
                  ref={savePresetBtnRef}
                  bordered
                  onClick={() => {
                    const rect = savePresetBtnRef.current?.getBoundingClientRect();
                    if (rect) popoverBtnRect.current = rect;
                    setSaveFormOpen(true);
                  }}
                >
                  Save preset
                </GhostButton>
              )}
              <GhostButton onClick={clearAll}>Clear all</GhostButton>
            </div>
          </div>
        )}
      </div>

      {/* Filter Drawer backdrop — transparent on desktop, dimmed on mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="filter-backdrop"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[var(--z-panel)] bg-transparent pointer-events-none md:[background-image:linear-gradient(to_right,transparent_calc(100%_-_var(--filter-push)),var(--bg)_calc(100%_-_var(--filter-push)_+_108px))] max-md:pointer-events-auto max-md:bg-[rgba(26,24,22,0.45)] max-md:[backdrop-filter:blur(2px)] max-md:[-webkit-backdrop-filter:blur(2px)] max-md:touch-none"
            onClick={closeDrawer}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Filter Drawer — right-side slide panel (desktop) / bottom sheet (mobile) */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            key="filter-drawer"
            ref={drawerRef}
            data-filter-drawer
            role="dialog"
            aria-modal="true"
            aria-label="Filter options"
            // Focus trap: wrap Tab at the drawer's edges (dialog is modal on
            // mobile and the only sensible Tab scope on desktop too).
            onKeyDown={(e) => {
              if (e.key !== 'Tab') return;
              const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
                'button, input, select, a[href], [tabindex]:not([tabindex="-1"])'
              );
              if (!focusables?.length) return;
              const first = focusables[0];
              const last = focusables[focusables.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }}
            initial={drawerAnim.initial}
            animate={drawerAnim.animate}
            exit={drawerAnim.exit}
            transition={drawerAnim.transition}
            // Mobile = the same floating card, bottom-anchored: 12px insets
            // (+ safe area), full POPOVER_PANEL chrome at every breakpoint.
            className={`fixed top-3 right-3 bottom-3 z-[calc(var(--z-panel)_+_10)] flex w-[min(380px,90vw)] flex-col overflow-hidden ${POPOVER_PANEL} max-md:top-auto max-md:left-3 max-md:right-3 max-md:bottom-[calc(12px+var(--safe-bottom))] max-md:h-auto max-md:max-h-[85dvh] max-md:w-auto`}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center gap-3 border-b border-bubble-ring p-2">
              {/* pl-3 lines the title up with the sections' px-5 (8px frame + 12px) */}
              <span className="pl-3 font-sans text-base font-semibold tracking-[-0.01em] text-text">Filters</span>
              <button
                ref={drawerCloseBtnRef}
                className="ml-auto flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-transparent text-secondary transition-colors duration-150 hover:bg-overlay-soft hover:text-text"
                onClick={closeDrawer}
                aria-label="Close filters"
              >
                <CloseIcon width={22} height={22} />
              </button>
            </div>

            {/* Scrollable body — scrollbar hidden (scrolling still works); subtle
                bubble-ring dividers between sections */}
            <div className="flex-1 divide-y divide-bubble-ring overflow-y-auto overscroll-contain pt-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Sort section — only shown on mobile (sort dropdown is hidden in toolbar) */}
              {isMobile && (
                <DrawerSection
                  label="Sort"
                  open={isSectionOpen('sort')}
                  onToggle={() => toggleSection('sort')}
                  reduce={reduce}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={dPillClass(currentSortValue === opt.value ? 'include' : 'neutral')}
                        onClick={() => { handleSortChange(opt.value); }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </DrawerSection>
              )}

              {/* Saved filters — always at TOP, hidden when empty */}
              {presets.length > 0 && (
                <>
                  <div className="m-0 bg-transparent">
                    <div className="flex flex-col gap-2.5 px-5 py-4">
                      <span className="whitespace-nowrap font-sans text-sm font-semibold text-text">Presets</span>
                      <div className="flex w-full flex-col gap-1">
                        <AnimatePresence initial={false}>
                          {presets.map((preset, idx) => (
                            <motion.div
                              key={preset.name}
                              layout
                              exit={reduce ? { opacity: 0 } : { x: 20, opacity: 0, transition: { duration: 0.2, ease: EASE_COLLAPSE } }}
                              className="group/preset flex flex-col gap-0.5 py-2"
                            >
                              {/* No row-hover fill — the × reveals beside the name,
                                  mirroring the section-header chevron treatment. */}
                              <div className="flex items-center gap-1.5">
                                <button className="min-w-0 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap bg-transparent p-0 text-left font-sans text-[14px] text-text" onClick={() => applyPreset(preset)}>
                                  {preset.name}
                                </button>
                                <button
                                  className="inline-flex flex-shrink-0 cursor-pointer items-center justify-center bg-transparent p-0 text-secondary opacity-0 transition-[opacity,color] duration-200 ease-out-expo hover:text-text group-hover/preset:opacity-100 focus-visible:opacity-100"
                                  onClick={() => deletePreset(idx)}
                                  aria-label={`Delete ${preset.name}`}
                                >
                                  <CloseIcon width={16} height={16} />
                                </button>
                              </div>
                              {(() => {
                                const preview = parsePresetParams(preset.params);
                                return preview ? (
                                  <p className="m-0 pl-0 font-sans text-[13px] italic leading-[1.4] text-secondary">{preview}</p>
                                ) : null;
                              })()}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <AnimatePresence>
                          {toastMessage && (
                            <motion.div
                              role="status"
                              initial={reduce ? false : { opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -2 }}
                              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                              className="pt-1.5 pb-0.5 font-sans text-[13.5px] italic text-secondary"
                            >
                              {toastMessage}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {PILL_SECTIONS.map((sec) => (
                <DrawerSection
                  key={sec.key}
                  label={sec.label}
                  open={isSectionOpen(sec.key)}
                  onToggle={() => toggleSection(sec.key)}
                  showClear={!!(cf[sec.inc] || cf[sec.ex])}
                  onClear={() => clearSection([sec.inc, sec.ex])}
                  reduce={reduce}
                >
                  {sec.note && (
                    <p className="m-0 font-sans text-[13px] italic leading-[1.5] text-secondary">
                      {sec.note}
                    </p>
                  )}
                  <div className={sec.containerCls}>
                    {sec.values.map((v) => (
                      <FilterPill
                        key={v}
                        variant={sec.variant}
                        value={v}
                        incKey={sec.inc}
                        exKey={sec.ex}
                        state={getPillState(v, cf[sec.inc], cf[sec.ex])}
                        flipping={flippedPills.has(v)}
                        reduce={reduce}
                        onCycle={cyclePill}
                        label={sec.labelMap ? sec.labelMap[v] ?? v : undefined}
                      />
                    ))}
                  </div>
                </DrawerSection>
              ))}

              <hr className="mx-5 my-1 border-none border-t border-border" />

              {/* Words — preset pills + custom expander */}
              <PresetExpanderSection
                label="Words"
                open={isSectionOpen('words')}
                onToggle={() => toggleSection('words')}
                showClear={!!(currentFilters.min_words || currentFilters.max_words)}
                onClear={() => { clearSection(['min_words', 'max_words']); setWordsCustomOpen(false); }}
                reduce={reduce}
                presets={WORD_PRESETS.map((p) => {
                  const isActive = activeWordPreset?.label === p.label;
                  return {
                    key: p.label,
                    label: p.label,
                    active: isActive,
                    onClick: () =>
                      isActive
                        ? applyWordPreset(undefined, undefined)
                        : applyWordPreset(p.min, p.max),
                  };
                })}
                customOpen={wordsCustomOpen}
                onToggleCustom={() => setWordsCustomOpen((o) => !o)}
              >
                <input
                  type="number"
                  className={RANGE_INPUT}
                  placeholder="min"
                  aria-label="Minimum words"
                  value={wordMin}
                  onChange={(e) => handleWordInput(e.target.value, wordMax)}
                />
                <span className="font-mono text-[13px] text-secondary" aria-hidden="true">–</span>
                <input
                  type="number"
                  className={RANGE_INPUT}
                  placeholder="max"
                  aria-label="Maximum words"
                  value={wordMax}
                  onChange={(e) => handleWordInput(wordMin, e.target.value)}
                />
              </PresetExpanderSection>

              {/* Updated — preset pills + custom date expander */}
              <PresetExpanderSection
                label="Updated"
                open={isSectionOpen('updated')}
                onToggle={() => toggleSection('updated')}
                showClear={!!(currentFilters.date_preset || currentFilters.date_from || currentFilters.date_to)}
                onClear={() => { clearSection(['date_preset', 'date_from', 'date_to']); setDateCustomOpen(false); }}
                reduce={reduce}
                presets={DATE_PRESETS.map((d) => {
                  const isActive = currentFilters.date_preset === d.value;
                  return {
                    key: d.value,
                    label: d.label,
                    active: isActive,
                    onClick: () => applyDatePreset(isActive ? '' : d.value),
                  };
                })}
                customOpen={dateCustomOpen}
                onToggleCustom={() => setDateCustomOpen((o) => !o)}
              >
                <DateInput
                  label="Updated from"
                  value={dateFrom}
                  onChange={(v) => {
                    setDateFrom(v);
                    applyDateCustom(v, dateTo);
                  }}
                />
                <span className="font-mono text-[13px] text-secondary" aria-hidden="true">–</span>
                <DateInput
                  label="Updated to"
                  value={dateTo}
                  onChange={(v) => {
                    setDateTo(v);
                    applyDateCustom(dateFrom, v);
                  }}
                />
              </PresetExpanderSection>
            </div>

            {/* Sticky footer */}
            <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-bubble-ring px-5 py-4">
              <GhostButton className="-ml-3" onClick={clearAll}>Clear all</GhostButton>
              {/* Primary dismiss — mobile only (desktop results update live in
                  view). Shared pill metrics, inverted fill like the toolbar's
                  active pills; filters are already applied, this just closes. */}
              <button
                className={`${PILL_METRICS} hidden cursor-pointer border-transparent bg-text px-5 font-medium text-bg transition-opacity duration-150 hover:opacity-85 max-md:inline-flex`}
                onClick={closeDrawer}
              >
                Show {filteredCount} work{filteredCount !== 1 ? 's' : ''}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Save preset portal — renders into document.body to escape header stacking context */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {saveFormOpen && [
            <motion.div
              key="save-backdrop"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[var(--z-modal)] bg-[rgba(26,24,22,0.15)] [backdrop-filter:blur(3px)] [-webkit-backdrop-filter:blur(3px)]"
              onMouseDown={() => { setSaveFormOpen(false); setSaveName(''); }}
            />,
            <motion.div
              key="save-popover"
              ref={savePopoverRef}
              role="dialog"
              aria-modal="true"
              aria-label="Save filter preset"
              // Two-control dialog: wrap Tab between the name input and Save.
              onKeyDown={(e) => {
                if (e.key !== 'Tab') return;
                const focusables = savePopoverRef.current?.querySelectorAll<HTMLElement>('input, button');
                if (!focusables?.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }}
              initial={reduce ? false : { opacity: 0, scale: 0.82, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, x: '-50%', y: '-50%', transition: { duration: 0.12 } }}
              transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
              className={`fixed z-[calc(var(--z-modal)_+_1)] w-72 p-4 ${POPOVER_PANEL}`}
              style={{
                top: popoverBtnRect.current
                  ? popoverBtnRect.current.top + popoverBtnRect.current.height / 2
                  : '50%',
                left: popoverBtnRect.current
                  ? popoverBtnRect.current.left + popoverBtnRect.current.width / 2
                  : '50%',
                transformOrigin: 'center center',
              }}
            >
              <p className="mb-2.5 font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] text-secondary">Saving filters</p>
              {activePills.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {activePills.slice(0, 3).map((p) => (
                    <span key={p.id} className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-overlay-soft px-2.5 py-1 font-sans text-[13px] text-text">{p.label}</span>
                  ))}
                  {activePills.length > 3 && (
                    <span className="rounded-full px-1 py-1 font-sans text-[13px] text-secondary">+{activePills.length - 3}</span>
                  )}
                </div>
              )}
              <form
                className="flex items-center gap-1.5"
                onSubmit={(e) => { e.preventDefault(); savePreset(); }}
              >
                <input
                  autoFocus
                  type="text"
                  className="min-w-0 flex-1 rounded-full border border-border-strong bg-transparent px-3 py-1.5 font-sans text-sm text-text outline-none transition-[border-color] duration-150 placeholder:text-secondary placeholder:opacity-65 focus:border-border-active"
                  placeholder="Name this filter set…"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                />
                <button type="submit" className="cursor-pointer whitespace-nowrap rounded-full border-none bg-text px-3.5 py-1.5 font-sans text-[14px] text-bg transition-opacity duration-150 hover:opacity-85">Save</button>
              </form>
            </motion.div>,
          ]}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

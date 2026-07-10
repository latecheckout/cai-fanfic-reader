# CLAUDE.md

## Handover Status

> Handover documentation is complete. The following docs live in `.claude/docs/` and are the primary resource for any developer wiring this frontend to a real backend:

| Doc | Purpose |
|-----|---------|
| [`architecture.md`](.claude/docs/architecture.md) | Full codebase map: components, state layers, route map, all dummy data locations |
| [`wiring-guide.md`](.claude/docs/wiring-guide.md) | Integration checklist — 6 surfaces, current vs real impl, env vars needed |
| [`api-contracts.md`](.claude/docs/api-contracts.md) | TypeScript interfaces + REST endpoint shapes for all data models |

**Dummy data locations** (files that must be replaced before production):
- `src/data/comments.ts` — `@DUMMY` hardcoded comment threads (~1100 lines)
- `src/lib/library.ts` — `@DUMMY` `MOCK_LIBRARY` reading state (no auth) + localStorage bookmark helpers (`isBookmarked`/`toggleBookmark`/`removeBookmark` — `@WIRE`, become the `/user/library` call sites)
- `src/app/works/[slug]/page.tsx` — `@TODO-DEV` recommendations fallback

**Fake loading state** (not real async):
- `src/components/BrowseSearchBar.tsx` — `@LOADING` setTimeout on vibe search (synchronous, fake delay)

---

## Project Overview

Static Next.js 15 fanfic reader for Character.ai. Two surfaces: Browse page (filterable work list) and Reading page (editorial reader with morph-animated HUD panels). No database, no API — all content is statically generated from markdown files.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19
- **Styling**: Tailwind v4 (utility-first, CSS-first config via `@theme inline`) backed by CSS custom-property design tokens; `motion` for animation. No CSS Modules — the whole site was migrated off them (Pass 2, 2026-07).
- **Content**: gray-matter (YAML frontmatter) + remark/rehype pipeline
- **Runtime**: Node.js 22 LTS (not compatible with Node 24)

## Commands

```bash
npm install
npm run dev       # Dev server at http://localhost:3000
npm run build     # Production build
```

> Use `preview_start` with name `fanfic-reader` to launch via Claude Code — it uses the correct Node 22 binary from `.claude/launch.json`. Do not run `npm run dev` directly when Claude is managing the server.

## Project Structure

- `content/works/{slug}.md` — One markdown file per story (YAML frontmatter + `## Chapter Title` delimited chapters)
- `src/app/page.tsx` — Browse page (`/`)
- `src/app/works/[slug]/page.tsx` — Reader page (`/works/{slug}`)
- `src/app/layout.tsx` — Root layout with metadata (title: "c.ai Fanfic")
- `src/app/icon.png` — Favicon (auto-detected by Next.js App Router)
- `src/components/` — All UI components (`SearchOverlay` deleted; `BrowseSearchBar` replaces it)
- `src/context/ReadingContext.tsx` — Reading state (chapter index, preferences, scroll)
- `src/lib/works.ts` — Loads and parses works from `content/`
- `src/lib/filters.ts` — `applyFilters`, `buildVibeFilters`, search option builders
- `src/lib/markdown.ts` — remark/rehype pipeline for chapter HTML
- `src/lib/utils.ts` — Formatters, rating helpers, word tier
- `src/lib/constants.ts` — Canonical filter taxonomy (`RATINGS`, `WARNINGS`, `CATEGORIES`, `STATUSES`) + localStorage keys (`PRESETS_KEY`, `HISTORY_KEY`)
- `src/lib/library.ts` — `@DUMMY` — `MOCK_LIBRARY` simulates logged-in user reading state
- `src/data/comments.ts` — `@DUMMY` — hardcoded comment threads (~1100 lines)
- `src/styles/tokens.css` — Design tokens (CSS custom properties: color, type, shadow, radius, easing, z-index; light/paper/dark via `data-theme`)
- `src/app/globals.css` — `@import "tailwindcss"` + `@theme inline` mapping tokens → utilities, global keyframes, `.cai-rail` scroller, `@custom-variant theme-dark`
- `src/lib/motion.ts` — shared easing arrays (`EASE_OUT_EXPO`, `EASE_SPRING_OUT`) for `motion`
- `src/lib/ratings.ts` — `RATING_TIERS` config (single source for rating letter/color/tooltip); `ratingTier()`
- `src/lib/filterParams.ts` — shared filter-URL helpers (comma-list, 3-state pill, presets)
- `src/hooks/` — `useViewMode`, `useDrawer`, `usePresets`, `useSelectionAnchor`, `useChatCharacter`
- `src/components/` — All UI (shared primitives: `WorkGrid` (results grid for browse + library), `RailSection`/`SectionHeader` (home sections), `Popover`, `GhostButton`, `SortDropdown`, `FilterPill`, `RatingBadge`, `DrawerSection`, `EmptyState`, `RailViewport`, `TagChip`, `WorkCardCover` exports)
- `src/types/index.ts` — WorkMeta, WorkSummary, Chapter, FilterState types

## Styling Conventions

- **Tailwind v4, token-backed.** Style on-element with utilities. Visual tokens are CSS custom properties in `src/styles/tokens.css`, mapped to utilities via the `@theme inline` block in `src/app/globals.css` — e.g. `--color-bubble: var(--bubble-bg)` → `bg-bubble`; likewise `text-secondary`, `border-border`, `shadow-float`, `rounded-card`, `ease-out-expo`, `text-rating-g`, the Character palette (`bg-quill-ink`…). To expose a new token as a utility, add `--<namespace>-<name>: var(--token)` there.
- **Values without a mapped utility** use arbitrary refs to the raw var, never hardcoded numbers: `z-[var(--z-popover)]`, `max-w-[var(--browse-max-width)]`.
- **Spacing** uses the default Tailwind scale (4px step) — it already equals the `--space-*` tokens, so it's intentionally not mapped.
- **Theming**: `data-theme` (`light`/`paper`/`dark`) on `<html>` overrides only the changed vars; utilities re-resolve live. Dark-only overrides use the `theme-dark:` variant. Global-attribute descendant styles use arbitrary variants, e.g. `[html[data-mode=text]_&]:hidden`.
- **Animation**: `motion` (`motion/react`) with easings from `src/lib/motion.ts`; guard entrances with `useReducedMotion()`; `initial={false}` when state is localStorage-seeded. Keyframes shared across components live top-level in `globals.css` (`fadeIn`, `caiRevealUp`, `caiRailFade*`, `caiSkeletonShimmer`, kudos set); reference via `animate-[name…]`.
- **Shared chrome** as exported class-string constants co-located in a `*.ts` (e.g. `readingChrome.ts` `HUD_BUBBLE`/`BUBBLE_PILL`, `heroChrome.ts`, `popoverChrome.ts` `POPOVER_PANEL`/`MENU_ROW`).
- **Dropdowns/popovers** use the shared `Popover` component (uncontrolled by default, `open`/`onOpenChange` for controlled) — its panel surface is `POPOVER_PANEL` and its open/close motion lives in `src/lib/motion.ts` (`POPOVER_ENTER`/`POPOVER_EXIT`/`POPOVER_TRANSITION`). Don't hand-roll new dropdown state machines; the one sanctioned exception is `BrowseSearchBar` (focus-driven + mobile fullscreen), which reuses the panel chrome + motion constants only.

---

## Data Types (`src/types/index.ts`)

### WorkMeta

All metadata fields available on every work:

```typescript
interface WorkMeta {
  title: string;
  author: string;
  rating: string;           // 'General Audiences' | 'Teen And Up Audiences' | 'Mature' | 'Explicit' | 'Not Rated'
  warnings: string[];       // Archive warnings e.g. 'Major Character Death'
  category: string[];       // 'F/F' | 'F/M' | 'Gen' | 'M/M' | 'Multi' | 'Other'
  fandom: string[];
  relationships: string[];  // e.g. 'Hermione Granger/Ron Weasley'
  characters: string[];
  tags: string[];           // Freeform tags e.g. 'Slow Burn', 'Hurt/Comfort'
  summary: string;
  language: string;
  status: string;           // 'Complete' | 'In Progress'
  chapters: number;         // Total chapter count
  chaptersPosted?: number;  // Posted count for WIPs (absent = all posted)
  series?: {
    name: string;
    position: number;
    total?: number;
  };
  words: number;
  published: string;        // ISO date string e.g. '2024-01-15'
  updated: string;          // ISO date string
  kudos: number;
  bookmarks: number;
  hits: number;
  comments: number;
}
```

### Chapter

```typescript
interface Chapter {
  title: string;
  summary?: string;
  notesBegin?: string;
  notesEnd?: string;
  content: string;  // Raw markdown
  index: number;    // 0-based
}
```

### Work vs WorkSummary

- `Work` — full object including `chapters[]` array; used on the reading page
- `WorkSummary` — just `{ meta, slug }`; used on browse page (no chapter content loaded)

### FilterState

The full filter state type — mirrors URL params exactly:

```typescript
interface FilterState {
  // Include filters (OR logic within a field, AND logic across fields)
  fandom?: string;
  relationship?: string;
  tag?: string;           // Comma-separated: 'Angst,Slow Burn'
  character?: string;
  rating?: string;        // Comma-separated: 'Mature,Explicit'
  status?: string;
  warnings?: string;
  category?: string;      // Comma-separated: 'F/F,M/M'
  language?: string;
  warning?: string;

  // Word count range
  minWords?: number;
  maxWords?: number;

  // Date filter (mutually exclusive — use preset OR custom range)
  datePreset?: string;   // 'last_week' | 'last_month' | 'last_year' | 'custom'
  dateFrom?: string;     // ISO date string for custom range start
  dateTo?: string;       // ISO date string for custom range end

  // Exclude filters — remove any works that match
  exFandom?: string;
  exRelationship?: string;
  exTag?: string;         // Comma-separated
  exCharacter?: string;
  exRating?: string;      // Comma-separated
  exStatus?: string;
  exCategory?: string;
  exWarning?: string;

  // Sort
  sort?: 'updated' | 'published' | 'words' | 'kudos' | 'hits' | 'bookmarks' | 'comments';
  order?: 'asc' | 'desc';

  // Text search
  q?: string;
}
```

---

## Filtering Architecture (`src/lib/filters.ts`)

### URL param state

All filter state lives in URL params — there is no local React state for filter values. Components read `useSearchParams()` on every render and derive display state from it. Filter changes call `router.push()` with the new param set. This makes filters bookmarkable, shareable, and back-button safe.

### Include / exclude logic

Each filterable field has a corresponding `ex_` exclude param. This creates a 3-state system per value:

| State | URL param | Behaviour |
|-------|-----------|-----------|
| Neutral | absent | no effect |
| Include | `?rating=Mature` | show only works with this rating |
| Exclude | `?ex_rating=Mature` | hide all works with this rating |

Values within a single include param are **OR logic** (comma-separated):
`?rating=Mature,Explicit` → show Mature **or** Explicit works.

Filters across different params are **AND logic**:
`?rating=Mature&status=Complete` → Mature **and** Complete only.

Exclude filters always remove — regardless of what's included.

### 3-state pill cycling

The filter drawer pills cycle neutral → include → exclude → neutral on each click. The `cyclePill(value, incKey, exKey)` function handles URL param transitions via `addToCommaList` / `removeFromCommaList` helpers. The pill class is derived from the URL on render — no local state.

### Text search (`?q=`)

Searches across: title, author, summary, tags, fandom. Case-insensitive substring match. Runs before all other filters in `applyFilters`.

### Vibe engine

`buildVibeFilters(query)` intercepts descriptive search queries and converts them to structured filter params. Called synchronously inside `BrowseSearchBar`'s `buildItems()` on every render — when matched, injects a ✦ Vibe row at the top of the dropdown. Selecting it calls `router.push` with vibe params immediately (no delay, no confirmation panel).

**How it works:**
1. Query is lowercased and matched against `VIBE_RULES` keyword arrays
2. Matched rules contribute include tags, exclude tags, exclude warnings, ratings, and word limits
3. Multiple rules can match and stack (e.g. "cozy short" → fluff tags + `maxWords: 15000`)
4. Returns a `VibeResult` with `filters` (partial FilterState), `desc` (human label), and `pills` (for the vibe row preview — deduplicated via Sets before building the array)

**Current VIBE_RULES keywords:**
- `cozy / comfort / fluffy` → includes Fluff, Hurt/Comfort, Happy Ending; excludes Major Character Death
- `slow burn / pining / yearning` → includes Slow Burn, Pining
- `angst / dark / grief` → includes Angst; rating Mature
- `funny / humor / crack` → includes Humor, Crack; ratings G + Teen
- `enemies / rivals / hate to love` → includes Enemies to Lovers
- `short / one-shot / quick` → maxWords 15000
- `no death / nobody dies / safe` → excludes Major Character Death warning
- `found family / ensemble / team` → includes Found Family

### Sorting

Default sort: `updated desc`. Available sorts: `updated`, `published`, `words`, `kudos`, `hits`, `bookmarks`, `comments`. Order defaults to `desc`.

### Saved filter presets

Stored in `localStorage` key `cai_fanfic_presets` as:
```typescript
{ name: string; params: string; isDefault?: boolean }[]
```
`params` is a serialized URLSearchParams string. One preset can be marked as default (★) — it auto-applies on first load when the URL has no active filter params.

**Two surfaces:**
- **Search bar dropdown** (default/empty state) — shows all presets as clickable rows; applying one calls `router.push('/?{params}')` + closes dropdown. Read from localStorage on each focus.
- **Filter drawer Saved section** — management only: star to set default, × to delete.

---

## Reading Page Architecture

Two HUD layers:
1. **ReadingHUD** (`position: fixed`) — Back-to-browse chevron, always visible
2. **ReadingCluster** (`position: sticky`) — Pill cluster between work header and chapter content:
   - Title pill — hidden at natural position, animates in when sticky
   - Chapter pill — current chapter + scroll progress bar (multi-chapter only)
   - Settings pill — reading preferences (font size, font family, line width, theme)
   - Pills morph into panels via 8-step open / 5-step collapse sequence using live DOM positions

---

## Content Format

Frontmatter fields: `title`, `author`, `fandom[]`, `rating` (General Audiences | Teen And Up Audiences | Mature | Explicit | Not Rated), `category[]`, `status` (Complete | In Progress), `words`, `language`, `tags[]`, `relationships[]`, `characters[]`, `published`, `updated`, `summary`

Optional frontmatter: `warnings[]`, `kudos`, `bookmarks`, `hits`, `comments`, `chapters`, `chaptersPosted`, `series`

Chapters are delimited by `## Chapter Title` headings in the markdown body.

---

## Adding Content

Drop a `.md` file into `content/works/` with the frontmatter format. The slug comes from the filename.

---

## Known Constraints

- **Node.js 24 is incompatible** — always use Node 22 LTS (`nvm use 22`)
- **Git pushes fail from iCloud Drive** — `mmap failed: Operation timed out`. Workaround: `rsync` project to `/tmp`, push from there
- **Filter panel is a floating push panel on desktop** — a 380px card inset 12px from the viewport edges; `body.filter-open` adds `padding-right: var(--filter-push)` (404px, defined in `tokens.css`) to shift content left. The navbar (`.site-header`) gets a `padding-right`/negative-`margin-right` counterfix so its bottom stroke spans the full viewport under the panel, and the AO4 FAB + aura band (`.ao4-fab`/`.ao4-aura`) ride the push via `translateX(calc(16px - var(--filter-push)))`. All of it derives from `--filter-push` — change the panel width there.
- **"Show X works" footer button is hidden on desktop** — results update live; button only shown on mobile where an explicit Apply is needed
- **`SearchOverlay` has been deleted** — do not recreate. ⌘K focuses `BrowseSearchBar` input. All search/vibe/preset logic lives in `BrowseSearchBar.tsx`.
- **Preset and AC item handlers use `onMouseDown` not `onClick`** — prevents input blur before handler fires. In tests, dispatch `mousedown` events not `click`.
- **Do not use `window.location.href =` in eval/preview contexts** — crashes the Next.js dev server. Use `router.push()` inside components.

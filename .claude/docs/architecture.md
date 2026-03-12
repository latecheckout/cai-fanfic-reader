# Architecture — c.ai Fanfic Reader

> Generated during handover preparation, March 2026.
> This document describes the frontend as it stands: a static exploration build.
> For integration tasks, see `wiring-guide.md`. For API shapes, see `api-contracts.md`.

---

## Project Overview

A web-based fanfic reading experience for Character.ai. Users who chat with AI characters on c.ai get those chats turned into short fanfic-style stories. This frontend presents a browsable, filterable listing of those works and a full reading experience for each.

**Key user flows:**
1. **Browse** — Filter works by fandom, rating, tags, ships, word count, date. Search by text or "vibe" (keyword → filter translation). Save filter presets.
2. **Read** — Chapter-by-chapter reading with scroll-position persistence, chapter navigation, theme/font preferences, and kudos.
3. **Library** — Personal reading history (continuing/bookmarked/completed) based on stored scroll progress.

**Current state:** Static exploration build. All content is markdown files; no backend. Exploration phase only — not production-ready.

---

## Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| Framework | Next.js | 15.5.12 | App Router, static generation |
| UI | React | 19.2.4 | — |
| Language | TypeScript | 5 | Strict mode |
| Styling | CSS Modules | — | Zero Tailwind; all purpose-written |
| Content | gray-matter | 4.0.3 | YAML frontmatter parsing |
| Markdown | remark + rehype pipeline | — | remark-gfm, remark-rehype, rehype-stringify, rehype-raw, rehype-sanitize |
| Node required | Node.js | 22 LTS | **Node 24 is incompatible with Next.js 15** |

No state management library (Redux, Zustand). No API client. No UI component library. No Tailwind.

---

## Directory Structure

```
fanfic-reader/
├── content/
│   └── works/                  # 25 markdown story files (work-01 through work-14 + sample-story-1 through sample-story-11)
│                               # Each file: YAML frontmatter (metadata) + chapter content
├── public/
│   └── fonts/                  # Self-hosted woff2: Lora, Character Sans (8 weights), Character Mono
├── src/
│   ├── app/                    # Next.js App Router pages (Server Components by default)
│   │   ├── layout.tsx          # Root layout: ThemeScript, fonts, metadata ("c.ai Fanfic")
│   │   ├── page.tsx            # Browse page (/) — Server Component
│   │   ├── globals.css         # Design tokens + global resets (imported in layout.tsx)
│   │   ├── icon.png            # Favicon — auto-detected by Next.js
│   │   ├── fandoms/
│   │   │   └── page.tsx        # /fandoms — grouped fandom listing
│   │   ├── characters/
│   │   │   └── page.tsx        # /characters — grouped character listing
│   │   ├── reading/
│   │   │   └── page.tsx        # /reading — personal library (tabs: continuing/bookmarked/completed)
│   │   └── works/
│   │       └── [slug]/
│   │           └── page.tsx    # /works/:slug — reading view (statically generated)
│   ├── components/             # 32 React components (see Component Map below)
│   ├── context/
│   │   └── ReadingContext.tsx  # React context for reading state (theme, font, progress, scroll %)
│   ├── data/
│   │   └── comments.ts         # ⚠️ DUMMY — 1100+ lines of hardcoded comment thread data
│   ├── lib/
│   │   ├── works.ts            # Content loader: reads markdown files, parses YAML, builds work objects
│   │   ├── filters.ts          # Filtering engine: applyFilters(), buildVibeFilters(), search options
│   │   ├── chapters.ts         # Chapter parsing utilities
│   │   ├── markdown.ts         # remark/rehype pipeline (markdown → HTML string)
│   │   ├── library.ts          # ⚠️ DUMMY — MOCK_LIBRARY hardcodes reading state; LibraryTab type
│   │   └── utils.ts            # Formatting helpers: readingTime, formatWords, ratingClass, etc.
│   ├── styles/
│   │   ├── tokens.css          # (imported via globals.css) shared CSS custom properties
│   │   ├── typography.css      # (imported via globals.css) font-face declarations
│   │   └── components/         # Per-component CSS Modules (32 .module.css files)
│   └── types/
│       └── index.ts            # All TypeScript interfaces: WorkMeta, Chapter, Work, WorkSummary, FilterState
├── .claude/
│   ├── launch.json             # Dev server config for preview_start (Node 22, port 3000)
│   └── docs/                   # ← This directory (handover documentation)
├── CLAUDE.md                   # Developer reference: data types, filtering architecture, known constraints
└── README.md                   # Project overview, setup, tech stack
```

---

## Component Map

| Component | Purpose | Dummy Data? | Key Props |
|-----------|---------|-------------|-----------|
| **BrowseHeader** | Persistent site nav (Stories / Library / Characters). Mobile hamburger. | No | — |
| **BrowseSearchBar** | Always-visible capsule search with dropdown AC (fandoms, tags, ships, vibe row, presets). | No (filter lists are static schema, not backend data) | `options: SearchOptions`, `basePath?` |
| **BrowseShell** | Browse page layout wrapper. Owns view toggle state (default/split). Renders SkeletonCard. | SkeletonCard is a placeholder for dynamic loading | `works`, `options`, `searchOptions`, `currentFilters`, `totalCount`, `filteredCount` |
| **BrowseFeelingSection** | "Browse by feeling" cards (top trope, active fandom, short reads). | No (derived from real works) | `data: FeelingData` |
| **FilterPanel** | Right-slide filter drawer. 3-state pill filters. Preset save/load. Date range. | No | `options`, `currentFilters`, `onViewChange`, etc. |
| **WorkCard** | Default listing card: left rating strip + right metadata column. | No | `work: WorkSummary`, `activeFilters?`, `activeQ?` |
| **WorkCardSplit** | Two-column listing variant: title/summary left, metadata right. | No | Same as WorkCard |
| **WorkHeader** | Reading page editorial header with three scroll-fade zones. | No | (reads from ReadingContext) |
| **ReadingProvider** | Client wrapper that provides ReadingContext. Applies theme on mount. | No | `workMeta`, `chapterTitles`, `slug` |
| **ReadingHUD** | Fixed top-left back button on reading page. | No | — |
| **ReadingCluster** | Sticky pill cluster (title/chapter/settings). Morph panel animations. | No | — |
| **ChapterList** | Renders all chapters. Scroll tracking. Scroll-position restore. Swipe navigation. | No | `chapters`, `chapterHtmls`, `recommendations`, `workMeta` |
| **ChapterContent** | Renders single chapter HTML with title, author notes, prose. | No | `chapter`, `chapterHtml`, `totalChapters` |
| **ChapterComments** | Nested comment thread UI. Local comment submission. | ⚠️ YES — reads from `src/data/comments.ts` | `slug`, `chapterIndex` |
| **ChapterPanel** | Forwardref modal with chapter list (title, last-read indicator). Desktop. | No | `chapters[]`, `activeIndex`, `onSelect`, `onClose` |
| **ChapterDrawer** | Bottom-sheet chapter navigator. Touch drag-to-dismiss. Mobile. | No | `onClose`, `onSelect` |
| **ChapterBreak** | Visual `<hr>` separator between chapters. | No | `chapterNumber` |
| **ContinueReadingSection** | Shows in-progress works on browse home. Reads localStorage. | ⚠️ Partial — relies on MOCK_LIBRARY slugs being in localStorage | — |
| **EndOfStory** | Recommendation cards at end of story. | ⚠️ Partial — recommendations are same-fandom filter | `slug`, `recommendations` |
| **MetadataOverlay** | Full work metadata modal (triggered from ReadingCluster). | No | `onClose` |
| **KudosSection** | "Leave kudos" button with heart animation. localStorage only. | ⚠️ YES — no API; kudos stored in `fanfic-kudos` localStorage key | `slug`, `totalKudos` |
| **PrefsPanel** | Reading preferences morph panel (font, size, line width, theme). Saves to localStorage. | No | (forwardref, no props) |
| **ThemeScript** | Inline script for theme init before first paint (prevents flash). | No | — |
| **FocusEffect** | Dims peripheral content after 4s inactivity on reading page. | No | — |
| **RatingBadge** | Solid 20×20px square badge (G/T/M/E/NR) with color coding. | No | `rating: string` |
| **TagChip** | Styled tag/warning pill. | No | `label`, `type?` |
| **CustomSelect** | Accessible sort dropdown with keyboard navigation. | No | `value`, `onChange`, `options`, `id`, `icon?` |
| **LibraryShell** | `/reading` page wrapper. Three-tab library (continuing/bookmarked/completed). | ⚠️ YES — MOCK_LIBRARY defines which slugs are in each tab | Extensive |
| **CharactersList** | Alphabetically grouped character list with client-side search. | No | `grouped: CharacterGroup[]` |
| **MobileNav** | Overlay nav panel for mobile. Focus trap + body scroll lock. | No | `open`, `onClose`, `pathname`, `navLinks` |
| **MobileReadingBar** | Bottom bar for reading page on mobile. | No | — |

---

## State Management Summary

State flows through three layers, from most persistent to most ephemeral:

### Layer 1: URL Parameters (source of truth for filters)

All browse filter state lives in URL query params. This enables bookmarking, sharing, and back-button navigation.

Every filter change calls `router.push()` with updated params. Components read from `useSearchParams()` on every render — no local filter state.

**Filter keys:**
```
Include:  fandom, relationship, tag, character, rating, status, category,
          language, warning, min_words, max_words, sort, order, q
Exclude:  ex_fandom, ex_relationship, ex_tag, ex_character, ex_rating,
          ex_status, ex_category, ex_warning
Date:     date_preset, date_from, date_to
```

Multi-value params use comma-separation: `?rating=Mature,Explicit` = OR logic.

**Read in:** `src/app/page.tsx`, `src/app/reading/page.tsx`, `FilterPanel.tsx`, `BrowseSearchBar.tsx`

### Layer 2: localStorage (persistent client preferences + mock user state)

| Key | Owner | Purpose |
|-----|-------|---------|
| `fanfic-reader-theme` | ReadingContext | light / dark / paper preference |
| `fanfic-font` | PrefsPanel | serif / sans / mono / dyslexic |
| `fanfic-font-size` | PrefsPanel | body font size in px |
| `fanfic-line-width` | PrefsPanel | narrow / default / wide |
| `fanfic-bookmarks` | ChapterList | scroll position + chapter progress per work |
| `fanfic-kudos` | KudosSection | set of slugs user has kudos'd |
| `cai_fanfic_presets` | BrowseSearchBar + FilterPanel | saved filter presets |
| `cai_search_history` | BrowseSearchBar | recent search terms |
| `cai_removed_bookmarks` | LibraryShell | slugs user has removed from library |
| `cai_view_pref` | BrowseShell | default / split view toggle |

### Layer 3: Component State (ephemeral UI)

- `BrowseSearchBar` — `query`, `focused`, `selectedIndex`, `vibeLoading`
- `FilterPanel` — `openDrawer`, `savePopoverOpen`
- `ReadingCluster` — `activePanel`, `isSticky`, `scrollPct`, morph animation step
- `ChapterList` — `flashChapter`, `tagsExpanded`, active chapter index
- `BrowseShell` — `view` (default / split)

---

## Route Map

| Route | File | Data Source | Notes |
|-------|------|------------|-------|
| `/` | `src/app/page.tsx` | `getWorkSummaries()` + `applyFilters()` | Server Component; filtering is client-side via URL params |
| `/works/[slug]` | `src/app/works/[slug]/page.tsx` | `getWork(slug)` | Statically generated at build time via `generateStaticParams` |
| `/reading` | `src/app/reading/page.tsx` | `getWorkSummaries()` filtered by MOCK_LIBRARY | Library page; MOCK_LIBRARY is the only user-state source |
| `/fandoms` | `src/app/fandoms/page.tsx` | All works grouped by fandom | Static; no filtering |
| `/characters` | `src/app/characters/page.tsx` | All works grouped by character | Static; client-side search filter only |

---

## All Dummy Data Locations

| File | Lines | What it is |
|------|-------|-----------|
| `src/data/comments.ts` | 14–1118 | Hardcoded comment threads, keyed by `${slug}-${chapterIndex}`. 8 threads per work, each with replies, likes, author tags. |
| `src/lib/library.ts` | 4–22 | `MOCK_LIBRARY` object: hardcoded continuing/bookmarked/completed slug arrays. |
| `src/lib/filters.ts` | 356–411 | `VIBE_RULES` array: 8 keyword patterns (cozy, slow burn, angst, etc.) mapping to filter presets. These are editorial choices, not user data — but a real implementation could replace them with a semantic search API. |
| `src/components/FilterPanel.tsx` | 50–106 | Static filter schema arrays: RATINGS, WARNINGS, CATEGORIES, STATUSES, WORD_PRESETS, DATE_PRESETS, SORT_OPTIONS. These represent the filter taxonomy — they may stay static or come from a config endpoint. |
| `src/components/BrowseSearchBar.tsx` | 47–67 | Duplicate of the filter schema arrays above (RATINGS, WARNINGS, CATEGORIES, STATUSES). |

---

## All Fake Loading State Locations

| File | Location | What it simulates |
|------|----------|------------------|
| `src/components/BrowseSearchBar.tsx` | `vibeLoading` state + `vibeTimerRef` (~lines 102–110) | 1.5s fake delay before showing vibe search result. The underlying `buildVibeFilters()` function is synchronous regex matching — no actual async operation occurs. |
| `src/components/BrowseShell.tsx` | `SkeletonCard` component | Placeholder skeleton card. Currently never shown (all content is available synchronously from static generation). Will be relevant once content comes from an API. |

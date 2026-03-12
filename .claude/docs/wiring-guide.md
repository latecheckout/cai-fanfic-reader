# Wiring Guide — c.ai Fanfic Reader

> This document describes every place the frontend needs to connect to a real backend.
> Current state: fully static. No API calls exist. All stubs are marked `@DUMMY` in source.
> See `api-contracts.md` for the TypeScript interface shapes and endpoint definitions.

---

## Overview

The frontend is integration-ready. All display logic, filtering, sorting, and reading UX is complete. What's missing is the data layer. There are six integration surfaces, listed here from most critical to least:

| Priority | Feature | Current | Effort |
|----------|---------|---------|--------|
| 1 | Content (works + chapters) | Static markdown files | High — replaces static generation with API fetches |
| 2 | Library / reading state | Hardcoded MOCK_LIBRARY | Medium — needs auth + user API |
| 3 | Comments | 1100-line hardcoded object | Medium — swap one function call |
| 4 | Kudos | localStorage only | Low — add one POST call + auth guard |
| 5 | Recommendations | Same-fandom filter | Low — swap one function call |
| 6 | Vibe search | Local keyword regex | Optional — local version works fine |

---

## 1. Content — Works & Chapters

**What it is:** The catalogue of fanfic works. Every work has metadata (title, author, fandom, tags, rating, stats) and one or more chapters (markdown content).

**Current implementation:**
- Works are `.md` files in `content/works/` with YAML frontmatter
- `src/lib/works.ts` reads these at build time using `fs` + `gray-matter`
- Pages are statically generated via `generateStaticParams()` in `src/app/works/[slug]/page.tsx`
- Chapters are parsed from markdown and converted to HTML at build time via `src/lib/markdown.ts`

**Files to change:**
- `src/lib/works.ts` — replace `fs`-based loaders with API fetches
- `src/app/works/[slug]/page.tsx` — update `generateStaticParams()` to fetch slugs from API; or switch from static generation to dynamic rendering with ISR
- `src/app/page.tsx` — update to fetch works list from API
- `src/app/fandoms/page.tsx` — update to fetch from API
- `src/app/characters/page.tsx` — update to fetch from API

**Recommended approach (ISR):**
```typescript
// In works/[slug]/page.tsx — switch from static to ISR
export const revalidate = 3600; // re-generate every hour

// Or on-demand revalidation when new works are published:
// Call revalidatePath('/works/[slug]') from a webhook handler
```

**Data contract:** See `api-contracts.md` → `GET /works` and `GET /works/:slug`

**Notes:**
- The markdown-to-HTML pipeline (`src/lib/markdown.ts`) can stay as-is if the API returns raw markdown. If the API returns HTML, remove the remark/rehype pipeline entirely.
- The `content/works/` directory can be deleted once the API is live.
- Word counts, chapter counts, and stats in `WorkMeta` currently come from the YAML frontmatter. In production these should come from the backend (calculated server-side from actual content).

---

## 2. Library / Reading State

**What it is:** The `/reading` page shows a logged-in user's personal library: works they're currently reading, have bookmarked, or have completed.

**Current implementation:**
- `src/lib/library.ts` exports `MOCK_LIBRARY` — a hardcoded object with 11 slugs distributed across `continuing`, `bookmarked`, and `completed`
- `src/app/reading/page.tsx` imports `MOCK_LIBRARY` directly and uses `getTabSlugs()` to filter works
- Local reading progress (scroll position, chapter index) is stored in `fanfic-bookmarks` localStorage key in `ChapterList.tsx`
- Works "removed" from the library are tracked in `cai_removed_bookmarks` localStorage key

**Files to change:**
- `src/lib/library.ts` — replace `MOCK_LIBRARY` with API fetch; keep `LibraryTab` type + `LIBRARY_REMOVED_KEY` constant
- `src/app/reading/page.tsx` — switch from `getTabSlugs()` to `GET /user/library`
- `src/components/ChapterList.tsx` — add sync: when scroll position updates, debounce a `POST /user/progress/:slug` call in addition to (or replacing) localStorage write
- `src/components/LibraryShell.tsx` — bookmarks/removals need to call `POST /user/library/:slug/remove` instead of (or in addition to) updating localStorage

**Auth requirement:** This is the only feature that strictly requires authentication. The library page should show a login prompt when no session exists. All other features degrade gracefully without auth.

**Data contract:** See `api-contracts.md` → `GET /user/library`, `POST /user/library/:slug/remove`, `POST /user/progress/:slug`

**State management note:** Once auth exists, library state should move from `MOCK_LIBRARY` into a React context (e.g. `LibraryContext`) so that:
- `ChapterList` can optimistically update the "continuing" tab when progress is saved
- `ContinueReadingSection` on the browse page can show real in-progress works
- `KudosSection` can show the real kudos count

---

## 3. Comments

**What it is:** Per-chapter comment threads on the reading page.

**Current implementation:**
- `src/data/comments.ts` — 1100+ lines of hardcoded comment objects, keyed by `${slug}-${chapterIndex}`
- `src/components/ChapterComments.tsx` line 60: `const seededComments = getComments(slug, chapterIndex);`
- Local comment submission works client-side only (state is lost on page reload)

**Files to change:**
- `src/data/comments.ts` — delete entire file
- `src/components/ChapterComments.tsx`:
  - Line 4: remove `import { getComments, Comment } from '@/data/comments';`
  - Line 60: replace synchronous `getComments()` call with `useEffect` + fetch: `GET /works/:slug/comments?chapter=:index`
  - Add loading state (skeleton comment rows)
  - Add error state ("couldn't load comments")
  - Line 65–80: wire `handleSubmit` to `POST /works/:slug/comments` + auth guard
  - Persist newly submitted comments via API response (replace `localComments` state)

**Auth requirement:** Comment submission requires auth. Reading comments does not.

**Data contract:** See `api-contracts.md` → `GET /works/:slug/comments` and `POST /works/:slug/comments`

---

## 4. Kudos

**What it is:** A single-action "leave kudos" button at the end of each work (AO3-style).

**Current implementation:**
- `src/components/KudosSection.tsx` — stores given kudos in `fanfic-kudos` localStorage array
- `displayCount` is initialised from `totalKudos` prop (which comes from work frontmatter) + 1 if user has given kudos

**Files to change:**
- `src/components/KudosSection.tsx` — `handleKudos()` function (line 23):
  - After optimistic UI update, call `POST /works/:slug/kudos`
  - On error: roll back the optimistic update (reset `given` and `displayCount`)
  - The localStorage write can remain as a client-side cache to avoid re-fetching on revisit
- `src/types/index.ts` — `WorkMeta.kudos` — this will become a live count from the API, not a static number from frontmatter

**Auth requirement:** Kudos require auth. Show a login nudge if user attempts to give kudos while logged out.

**Note:** The `totalKudos` prop currently comes from the work's YAML frontmatter (a static snapshot). Once the API is live, the reading page should fetch the current kudos count and pass it down, so the `displayCount` baseline is accurate.

**Data contract:** See `api-contracts.md` → `POST /works/:slug/kudos`

---

## 5. Recommendations

**What it is:** "You might also like" cards shown at the end of a story.

**Current implementation:**
- `src/app/works/[slug]/page.tsx` lines 34–48: `getRecommendations()` — filters all works by matching fandom, returns up to 3 results, falls back to any 2 works if no fandom match

**Files to change:**
- `src/app/works/[slug]/page.tsx` — replace `getRecommendations()` with `GET /works/:slug/recommendations`
- `src/components/EndOfStory.tsx` — no changes needed (just receives `recommendations: WorkSummary[]`)

**Note:** The current same-fandom fallback is reasonable for the demo. This is a low-priority wire — the current logic produces acceptable recommendations from static data and can remain until a proper recommendation engine is available.

**Data contract:** See `api-contracts.md` → `GET /works/:slug/recommendations`

---

## 6. Vibe Search (Optional Upgrade)

**What it is:** A keyword-to-filter translation layer. When a user types "cozy" into the search bar, it translates to `tag=Fluff,Hurt/Comfort` + `exWarning=Major+Character+Death`.

**Current implementation:**
- `src/lib/filters.ts` lines 367–411: `VIBE_RULES` — 8 hardcoded keyword patterns
- `buildVibeFilters()` (line 419) — synchronous local regex match
- `BrowseSearchBar.tsx` lines 147–172: 1.5s fake async delay before showing result (simulates a real API call)

**Files to change (if upgrading):**
- `src/lib/filters.ts` — replace `buildVibeFilters()` with an API call
- `src/components/BrowseSearchBar.tsx` — remove the fake `setTimeout` (lines 148–172); the real API call provides the actual async delay

**Note:** The current vibe engine works well for demo purposes. The 8 rules cover the most common patterns. This upgrade is optional and should be prioritised only if c.ai wants to offer personalised or ML-powered vibe matching.

---

## Environment Variables Needed

None exist today. Once backend integration begins, add these to `.env.local` (and to Vercel/deployment config):

```env
# Required
NEXT_PUBLIC_API_BASE_URL=https://api.character.ai/fanfic/v1

# Required for auth-gated features (library, kudos, comments)
NEXT_PUBLIC_AUTH_URL=https://auth.character.ai

# Optional — for ISR revalidation webhooks
REVALIDATION_SECRET=your-secret-token
```

---

## Error States Not Yet Implemented

The current build has no error UI because all data is local and infallible. When the API is wired, these states need to be designed and built:

| Feature | Missing error state |
|---------|-------------------|
| Browse page | Empty state when API returns 0 works (different from "no filter results") |
| Reading page | 404 / work not found (currently handled by `notFound()` at build time) |
| Comments | Failed to load comments; failed to submit comment |
| Library | Failed to load user library; session expired |
| Kudos | Failed to submit kudos (rollback optimistic UI) |
| Recommendations | Failed to load (currently fails silently via try/catch returning `[]`) |

---

## SEO / Deployment Notes

- `public/robots.txt` — created; update the `Sitemap:` URL to the production domain before deploying.
- **Sitemap** — no `sitemap.xml` exists yet. Once content is served dynamically, add `src/app/sitemap.ts` using Next.js's built-in sitemap support (`MetadataRoute.Sitemap`). It should enumerate all work slugs from the API.
- **OG tags** — root layout (`src/app/layout.tsx`) has site-level OG. Per-work pages (`src/app/works/[slug]/page.tsx`) now generate per-work `og:title` and `og:description` from the work summary. Add `og:image` once a per-work cover image API is available.

---

## What Does NOT Need Wiring

All of the following is pure frontend logic and does not require API integration:

- Filter/sort/search UX (URL-param state, filter pills, preset save/load)
- Reading UX (scroll tracking, chapter navigation, swipe gestures, focus mode)
- Theme / font / line-width preferences (localStorage is correct for these)
- Markdown-to-HTML rendering pipeline (stays as-is if API returns markdown)
- All component animations and transitions
- Browse by feeling section (`BrowseFeelingSection`) — derived from content, no separate API

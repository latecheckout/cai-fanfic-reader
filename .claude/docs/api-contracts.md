# API Contracts — c.ai Fanfic Reader

> TypeScript interfaces and suggested endpoint shapes for all backend integration points.
> These are **proposed contracts** derived from the existing frontend data models.
> The backend team should confirm or adjust before implementation.
>
> Base URL: `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://api.character.ai/fanfic/v1`)

---

## Data Models

These interfaces already exist in `src/types/index.ts` and `src/data/comments.ts`.
They are reproduced here as the canonical contract for the backend.

### WorkMeta

```typescript
interface WorkMeta {
  title: string;
  author: string;             // display name
  rating: string;             // 'General Audiences' | 'Teen And Up Audiences' | 'Mature' | 'Explicit' | 'Not Rated'
  warnings: string[];         // e.g. ['Major Character Death', 'Graphic Depictions Of Violence']
  category: string[];         // e.g. ['F/M', 'M/M']
  fandom: string[];           // e.g. ['Arcane: League of Legends']
  relationships: string[];    // e.g. ['Vi/Caitlyn Kiramman']
  characters: string[];       // e.g. ['Vi (Arcane)', 'Caitlyn Kiramman']
  tags: string[];             // e.g. ['Slow Burn', 'Angst', 'Happy Ending']
  summary: string;            // plain text, may contain light HTML
  language: string;           // e.g. 'English'
  status: string;             // 'Complete' | 'In Progress'
  chapters: number;           // total chapters planned (or posted if complete)
  chaptersPosted?: number;    // for WIPs: how many chapters are currently available
  series?: {
    name: string;
    position: number;
    total?: number;
  };
  words: number;              // total word count across all chapters
  published: string;          // ISO date string: '2024-11-15'
  updated: string;            // ISO date string: '2025-01-20'
  kudos: number;
  bookmarks: number;
  hits: number;
  comments: number;
}
```

### WorkSummary (listing view — no chapter content)

```typescript
interface WorkSummary {
  meta: WorkMeta;
  slug: string;               // URL-safe identifier, e.g. 'work-01'
  textChunks?: {              // optional: pre-extracted text for search highlighting
    chapter: string;
    text: string;
  }[];
}
```

### Chapter

```typescript
interface Chapter {
  title: string;
  summary?: string;           // optional per-chapter summary
  notesBegin?: string;        // author's note at top of chapter
  notesEnd?: string;          // author's note at bottom of chapter
  content: string;            // raw markdown (or HTML if backend pre-renders)
  index: number;              // 0-based
}
```

### Work (full work with chapters)

```typescript
interface Work {
  meta: WorkMeta;
  chapters: Chapter[];
  slug: string;
}
```

### Comment

```typescript
interface Comment {
  id: string;
  author: string;             // display name
  authorId?: string;          // user ID (for auth checks)
  text: string;
  timestamp: string;          // display string: 'Mar 3' or '2 hours ago'
  likes: number;
  isAuthor?: boolean;         // true if commenter is the work's author
  replies?: Comment[];        // nested replies (max 1 level deep in UI)
}
```

### UserLibrary

```typescript
interface LibraryEntry {
  slug: string;
  chapter?: number;           // last-read chapter index (0-based); absent if not started
  progress?: number;          // scroll progress 0–100 within current chapter
  addedAt: string;            // ISO timestamp
}

interface UserLibrary {
  continuing: LibraryEntry[]; // in-progress works (has progress data)
  bookmarked: LibraryEntry[]; // saved for later (no progress or paused)
  completed: LibraryEntry[];  // finished works
}
```

---

## Endpoints

### Works

#### `GET /works`

Returns all works as summaries (no chapter content). Used on browse, fandoms, characters, and reading pages.

**Query parameters** (all optional — server may filter or the client filters client-side):
```
sort        string    'updated' | 'published' | 'words' | 'kudos' | 'hits' | 'bookmarks' | 'comments'
order       string    'asc' | 'desc'
limit       number    default: all
offset      number    for pagination
```

**Response:**
```typescript
{
  works: WorkSummary[];
  total: number;
}
```

**Notes:**
- The frontend currently does all filtering client-side using `applyFilters()` in `src/lib/filters.ts`. This can stay as-is initially — the full works list is manageable in memory for a demo-scale catalogue. Migrate to server-side filtering when catalogue grows beyond ~500 works.
- `textChunks` can be omitted from this endpoint for performance; the frontend only uses it for search highlighting and degrades gracefully without it.

---

#### `GET /works/:slug`

Returns a single work with all chapters. Used on the reading page.

**Response:**
```typescript
{
  work: Work;  // includes chapters[].content as markdown
}
```

**Notes:**
- If the backend pre-renders chapter markdown to HTML, return `content` as an HTML string and remove `src/lib/markdown.ts` from the rendering pipeline.
- The frontend calls `markdownToHtml()` per chapter in parallel at request time. For very long works (10+ chapters), pre-rendering server-side is recommended.

---

#### `GET /works/:slug/recommendations`

Returns 2–3 recommended works to show after the end of a story.

**Response:**
```typescript
{
  recommendations: WorkSummary[];
}
```

**Notes:** Current client-side fallback: same fandom, different slug. Up to 3 results, falls back to any 2 works.

---

### Comments

#### `GET /works/:slug/comments`

Returns comment threads for a work, optionally scoped to a chapter.

**Query parameters:**
```
chapter     number    0-based chapter index; omit for all chapters
limit       number    default: 20
offset      number    for pagination
```

**Response:**
```typescript
{
  comments: Comment[];
  total: number;
  chapterIndex: number;
}
```

---

#### `POST /works/:slug/comments`

Submit a new comment. Requires authentication.

**Request body:**
```typescript
{
  chapterIndex: number;   // 0-based
  text: string;           // max 2000 chars recommended
  parentId?: string;      // if replying to an existing comment
}
```

**Response:**
```typescript
{
  comment: Comment;       // the created comment, with server-assigned id and timestamp
}
```

**Auth:** Bearer token required. Return 401 if not authenticated.

---

### Kudos

#### `POST /works/:slug/kudos`

Leave kudos on a work. Idempotent — calling twice for the same user/work is a no-op.

**Request body:** empty `{}`

**Response:**
```typescript
{
  kudos: number;          // updated total kudos count
  given: boolean;         // true (confirms the action)
}
```

**Auth:** Bearer token required. Return 401 if not authenticated.

---

### User Library

#### `GET /user/library`

Returns the authenticated user's library. Requires authentication.

**Response:**
```typescript
{
  library: UserLibrary;
}
```

**Auth:** Bearer token required. Return 401 if not authenticated; the frontend should show a login prompt.

---

#### `POST /user/progress/:slug`

Save reading progress for a work. Called on scroll (debounced, ~2s) from `ChapterList`.

**Request body:**
```typescript
{
  chapterIndex: number;   // 0-based, currently active chapter
  scrollPct: number;      // 0–100, scroll progress within the chapter
}
```

**Response:**
```typescript
{
  ok: boolean;
}
```

**Auth:** Bearer token required. Fail silently on 401 (progress falls back to localStorage).

---

#### `POST /user/library/:slug/bookmark`

Add a work to the user's bookmarks.

**Request body:** empty `{}`

**Response:**
```typescript
{
  ok: boolean;
}
```

**Auth:** Bearer token required.

---

#### `DELETE /user/library/:slug`

Remove a work from the user's library entirely.

**Response:**
```typescript
{
  ok: boolean;
}
```

**Auth:** Bearer token required.

---

## Authentication

The frontend has no auth implementation. When integrating:

1. **Session token** — Store in an httpOnly cookie (preferred) or `localStorage`. The frontend currently has no token handling code.
2. **Auth provider** — If using c.ai's existing auth, implement an SSO redirect from the fanfic reader. The current nav has placeholder "Sign In" / "Sign Up" links in `BrowseHeader`.
3. **Graceful degradation** — Every auth-gated feature (kudos, comments, library) should degrade gracefully:
   - Kudos: show button, prompt login on click
   - Comments: show existing comments read-only, prompt login to submit
   - Library (`/reading`): show a "Sign in to see your library" empty state

---

## Filter Taxonomy (Static Reference)

These values are hardcoded in the frontend filter schema. They define what the backend must support as valid filter values:

```typescript
const RATINGS = [
  'General Audiences',
  'Teen And Up Audiences',
  'Mature',
  'Explicit',
  'Not Rated',
];

const WARNINGS = [
  'Major Character Death',
  'Graphic Depictions Of Violence',
  'Non-Con',
  'Underage',
  'Creator Chose Not To Use Archive Warnings',
];

const CATEGORIES = ['F/F', 'F/M', 'Gen', 'M/M', 'Multi', 'Other'];

const STATUSES = ['Complete', 'In Progress'];
```

Fandoms, tags, ships, and characters are dynamic — derived from actual works content.

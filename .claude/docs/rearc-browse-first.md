# Browse-first rearchitecture exploration (`rearc` branch)

> June 2026. An exploration to put next to the shipped list/grid toggle (branch `06082026`),
> so the team can compare the "overwhelm fix" against a "discovery fix" side by side.
> Brief: invert the layers. Layer zero is browse; layer one is search. Do not average the
> two reader modes into one surface; serve each fully at its own layer (Paul Loots, design review).

---

## Phase 0: what the incumbents actually do (scraped 2026-06-10, logged out)

### AO3

- The homepage contains **zero works, zero covers, zero imagery**. It hands a visitor: a fandom
  taxonomy entry point, a power-search box whose placeholder teaches a boolean query DSL
  (`buffy gen teen AND "no archive warnings apply"`), three raw scale numbers (78k fandoms,
  11M users, 17.7M works), and org news.
- Browse-to-search: homepage > media category > fandom tag > works listing is three clicks, and
  the listing is already a result set (default sort: date updated desc). The filter sidebar exposes
  every facet with live counts, and **every include facet has a symmetric exclude mirror**.
  Advanced search is a parallel surface, not a deeper step.
- Work "cards" are exhaustive disclosure documents: required-tags icon grid (rating, warning,
  category, completion), full unabridged tag list (20 to 50+ tags), full multi-paragraph summary,
  complete stats line. Nothing is truncated, nothing is curated, no algorithm anywhere.
- Verdict: built for a reader who already knows what she wants and distrusts anyone who would
  choose for her. Discovery-by-browsing is not a missing feature; it is a refused one.

### Wattpad

- The logged-out homepage is a marketing page with exactly three story shelves ("Trending now",
  "Must-read Fanfiction", "Read. Watch. Obsess.") plus a 23-tile genre grid. **Cards at this layer
  are cover-only**: no title text, no author, no stats. Authors compensate by stuffing metadata
  into title strings ("[18+]", "(Complete)", "| A Mafia Romance").
- Fanfiction is the only genre with its own homepage shelf. The taxonomy mixes axes freely:
  genres, formats, demographics, one mega-trope (Werewolf), and editorial entities (Editor's
  Picks, The Wattys) all sit in one flat tile row. Editorial voice is mood plus emoji
  ("Criminally Attractive 🖤", "Feel-Good Reads ☀️").
- **Metadata density increases with intent.** Homepage card: cover only. Genre page card: cover,
  title, author, reads, parts, blurb, 3 tags. Search card: cover, title, reads, votes, parts,
  completion badge, and time-to-read, with no author. Search filters are parts-count, recency,
  completed-only. The implied user is a serial binger managing an episodic queue, not a
  bibliophile evaluating authors.
- Search is one click behind an icon: demoted visually, never functionally.
- Verdict: built for a mobile-first reader who chooses stories the way she chooses TikToks,
  trusts cover art and tropes to signal everything, and stays for the comments.

### The contrast in one line

AO3 believes its user supplies the taste and the architecture supplies the retrieval; Wattpad
believes its user supplies the mood and the architecture supplies the taste. The shipped toggle
addressed card overwhelm inside one surface; neither incumbent solves discovery that way. Wattpad
solves it a layer above the cards (shelves, tiles, editorial voice), and AO3 deliberately does
not solve it at all.

---

## Phase 1: directions considered

### 1. Shelves over the engine (built)

Wattpad-shaped layer zero, AO3-shaped layer one. The unfiltered homepage becomes a stack of
horizontal cover shelves, where **a shelf is nothing but a pre-canned filter query rendered as a
rail** (the VIBE_RULES were already shelf definitions waiting to happen). Any tap (shelf
"view all", fandom tile, mood chip, search, sort) pushes a filter URL and lands on today's full
results surface, untouched.

- Steelman: it is the only direction that serves both readers fully at their own layer. The
  lean-back reader gets handed covers, trends, and editorial voice with zero queries. The
  goal-directed reader is one action from the complete engine, and her saved presets already
  surface in the search dropdown. It matches the strongest pattern in the recon (metadata density
  scaling with intent) and reuses the most existing code.
- Cost: shelf definitions are editorial and static; "Trending" is a kudos sort, not real
  trending; with 25 works the same covers repeat across shelves.

### 2. Fandom portal (Spotify browse; IP = fandom)

Layer zero is a grid of fandom tiles only; everything routes through `?fandom=`.

- Steelman: fandom is how fanfic readers actually self-identify, it is AO3's own spine, and on
  c.ai the fandom maps to character IP, which aligns with the parent product. Scales naturally
  as the catalog grows.
- Cost: it is a directory, not a feed. It serves the AO3 reader's first click but hands the
  Wattpad reader nothing (still demands a choice before showing a single story). With 18 fandoms
  averaging 1.4 works each, tiles are thin today. Rejected as the organizing principle, kept as
  one row.

### 3. Mood console (vibe-first, c.ai-native)

Layer zero leads with "what are you in the mood for": large tappable mood cards backed by the
vibe engine.

- Steelman: the most differentiated option, nobody leads with mood; the vibe engine already
  converts moods to filter params; conversational discovery fits the c.ai brand.
- Cost: this is exactly Paul's "super general" trap. Moods without fandom anchoring or visible
  works feel mushy, and it inserts an interaction before the visitor sees any actual story.
  Rejected as the organizing principle, kept as a chip strip.

**Recommendation: direction 1, with 2 folded in as a row and 3 folded in as a chip strip.**

---

## Phase 2: what was built

`/` now branches into two layers (`src/app/page.tsx`):

- **Layer zero (no params): `BrowseHome`** — hero carousel (existing), the full `BrowseSearchBar`
  demoted below the hero (vibe, autocomplete, presets, and Cmd+K all intact) with an "All works"
  capsule and a mood-chip strip, Continue Reading rail (existing), `FandomRail` (tiles with
  stacked covers routing to `?fandom=`), then five `ShelfRail` cover shelves, and a footer link
  to the full archive.
- **Layer one (any filter/search/sort param): `BrowseShell`** — entirely untouched. Filter
  drawer, 3-state pills, include/exclude, presets, list/grid toggle, and `WorkCardCover` are
  exactly as shipped on `06082026`.

Shelves built (`src/lib/shelves.ts`, each carries its own filter URL):

| Shelf | Query |
|---|---|
| Trending now | `?sort=kudos` |
| The tension is the point | `?tag=Slow Burn,Pining,Mutual Pining` |
| Soft landings | `?tag=Fluff,Domestic Fluff,Hurt/Comfort,Happy Ending&ex_warning=Major Character Death` |
| Found family | `?tag=Found Family` |
| Done in one sitting | `?max_words=15000&status=Complete` |

Mood chips: angst, humor, fix-it, no major deaths, long haul (100k+). Shelves under 4 works
auto-hide. Fandom tiles require 2+ works and dedupe display labels across canonical tags.

New files: `src/lib/shelves.ts`, `src/components/{BrowseHome,ShelfRail,FandomRail}.tsx` and their
CSS modules. Modified: `src/app/page.tsx` only (the layer branch; `sort`/`order` now count as
intent so shelf "view all" URLs land on results). Filter engine, reader, and all
localStorage keys untouched. Build and both layers verified rendering.

## What a production version would additionally need

1. Real shelf data: actual trending (windowed engagement, not lifetime kudos), freshness blending,
   and impression-aware rotation so shelves do not repeat covers.
2. Shelf config as data (CMS or config endpoint) instead of a hardcoded array, with per-shelf
   analytics to learn which queries convert to reads.
3. Personalized rails (continue reading exists; add "more like what you read" from reading
   history, and fandom rails reordered by the user's library).
4. A real vibe/semantic search behind the mood chips and search bar (the documented VIBE_RULES
   upgrade path in `wiring-guide.md`).
5. Cover governance: every work needs a real cover (the generic fallback breaks an all-visual
   layer zero fast), plus alt text sourced from metadata.
6. Mobile pass on rail ergonomics (snap points, overscroll) and a decision on whether layer zero
   needs its own lightweight "jump back in" header state for returning readers.

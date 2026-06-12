# Session Handoff — 2026-06-12 (branch `rearc`)

Continuation of the home/Discover redesign. This session was about the **mode-switch transition effect**, the **AO4 turbo toggle**, **creator cards**, and a new **promo banner**. Everything below is in the working tree (mostly **uncommitted** — see Git state).

## TL;DR of the final state

- **Mode-switch effect = a simple X/Twitter shimmer on the skeleton cards.** All particle effects were built, demoed, and then **removed**.
- **AO4 turbo toggle**: on-fill magenta, hot-pink/violet hover glow, aura behind it = the **site bg color**.
- **Rating badges + reading progress bar**: reverted to their **original** colors.
- **Creator cards**: serif name + a 2-line truncated dummy **bio**.
- **New `CreatorCTABanner`**: the hero banner slide **verbatim, no carousel**, full width, with a generated quill-on-fire image, placed between the Featured and Creators rails.

---

## 1. Mode-switch transition (the big arc)

We iterated through many particle effects, all driven off the mode toggle, then **scrapped them for a shimmer**.

**Current (final):**
- `src/lib/burst.ts` and `src/components/BurstLayer.tsx` are **DELETED**. No particle system remains. `grep -r burst src/` → nothing.
- The transition is now just the **skeleton flash + an X/Twitter shimmer**:
  - `src/components/SkeletonCard.tsx` — no burst; renders fewer placeholder bars now (badges → title → byline → one summary line (list only) → stats; dropped the tag-chip row + discovery lines).
  - `src/styles/components/SkeletonCard.module.css` — **no border/stroke** on the card; each bar is a `base→highlight→base` gradient (`background-size: 200%`) animated via `@keyframes skeletonShimmer` sliding `background-position` (1.3s linear). Highlight = `color-mix(--border-strong, #fff 60%)`. Reduced-motion gated. (Earlier a card-level sweep `::after` was used but it never showed — the skeleton only lives ~450ms and the sweep started off-screen. Bar-gradient is visible instantly.)
- Skeleton is shown by `ModeSwitchFlash` (rails/grid) + `ContinueReadingSection` (reading list) during `useModeSwitch().switching` (`SWITCH_MS` ≈ 450ms in `src/lib/useModeSwitch.ts`).

**If they want particle effects back** — two committed restore points on `rearc`:
- `56af426` — blocky sci-fi pixel disintegration burst.
- `2d6cc84` — glowing hearts & stars burst.
- Both used `registerBurn(el)` (skeleton-driven) **or** an event-driven `BurstLayer` + `[data-flip-card]` tags. See `git show <sha>:src/lib/burst.ts`. Memory: `burst-blocky-variant.md`.

## 2. AO4 turbo toggle (`Ao4TurboToggle.module.css`)

- **On (AO4/text) fill**: `--ab-magenta: #d90082` (hyperlink-magenta). **Off (image)**: grey `var(--secondary)`.
- **Hover glow** (`.glow`, mouse-tracked dual-radial): `--ab-hot-pink: #ff4dc9` + `--ab-alt-violet: #ae00d9` (the original magenta/violet — we briefly tried sage/quill/pinned-purple and reverted).
- **Aura behind it** (`.aura`): two radials, both in **`var(--bg)`** (site bg color) fading to transparent — a soft halo of the page so the toggle separates over cover images. (Was magenta/purple; user wanted bg-colored.)
- **Track bg**: reverted to original `color-mix(--text 8%, transparent)` + single inset shadow (the "more visible over images" 16%/hairline/outer-shadow version was rolled back). Thumb keeps stronger drop shadows but **no contrast ring** (added then removed).

## 3. Rating badges + progress bar — REVERTED

- `src/styles/tokens.css` rating tokens are back to originals: `--rating-g #3d9970`, `-t #c8a020`, `-m #c0601a`, `-e #b02828`, `-nr #aaaaaa` (all 3 theme blocks).
- `WorkCardCover.module.css` `.ratingG/T/M/E/NR` — back to background-only (no per-rating text color).
- `ContinueCard.module.css` `.progressFill` — back to `var(--rating-t)`.
- **Note:** `--brand` / `--brand-deep` / `--brand-soft` tokens were added to `tokens.css` during a "duller secondary" experiment and are now **unused** (toggle uses literal hexes; progress reverted). Safe to remove, or keep for future use.

## 4. Creator cards (`CreatorCard.tsx` / `.module.css`, `shelves.ts`)

- **Name** (`.name`): now `var(--font-serif)`, weight 500 (matches the list-card title; was sans/600).
- **Bio**: new — a 2-line truncated description between name and metrics. `.bio` = serif, **13px**, `-webkit-line-clamp: 2` + ellipsis, `margin: 8px 0 2px`.
- Bios are `@DUMMY` — a 12-entry pool `CREATOR_BIOS` in `src/lib/shelves.ts`, each 6–8 words, assigned by display order (`i % pool`) in `buildCreators`. They're short, so the ellipsis won't actually show until real (longer) bios populate `Creator.bio`.
- `CreatorCard` does **not** burst/animate on mode switch (creators don't change between modes).

## 5. New promo banner — `CreatorCTABanner`

- `src/components/CreatorCTABanner.tsx` + `.module.css`. **Server component**, no client JS.
- It is the **hero banner slide verbatim, minus the carousel** — reuses `HeroCarousel.module.css` classes (`slide`, `bg`, `scrim`, `overlay`, `content`+`contentCentered`, `kicker`, `headline`, `cta`). The `.banner` wrapper is `display:flex` (the hero `.slide` is `flex:0 0 100%` and collapses without a flex parent), `border-radius:14px`, `overflow:hidden`, full width, `margin-bottom: var(--space-12)`.
- **Copy**: kicker "Creator beta" · headline "Want to write for c.ai?" · CTA "Apply now" → `href="/creators/apply"` (**painted door — `@TODO-DEV`, route doesn't exist yet**).
- **Image**: `public/hero/banner-quill.png` — generated via Higgsfield (`seedream_v4_5`, 21:9, atmospheric flaming quill on parchment, **right-weighted** with dark negative space on the left for text contrast). **It's a ~19MB PNG (6048×2592)** — Next/Image optimizes on serve, but consider downscaling / converting to WebP.
- Placed in `BrowseHome.tsx` between `<ShelfRail featured>` and `<CreatorRail>`.

## Git state

- Branch `rearc`. The two burst commits (`56af426`, `2d6cc84`) are in history but **superseded** (burst since deleted in the working tree).
- **Everything in sections 1–5 above is uncommitted.** Nothing pushed. `npx tsc --noEmit` is clean.

## Conventions reminded this session

- Verify with `npx tsc --noEmit -p tsconfig.json` only. **Do not run `next build`** while the dev server is up (corrupts shared `.next`).
- Higgsfield CLI works (`higgsfield account status` → authed, ~749 credits). Models: `higgsfield model list`. Image gen: `higgsfield generate create seedream_v4_5 --prompt "..." --aspect_ratio 21:9 --quality high --wait`.

## Likely next asks

- Slim the banner image (WebP/downscale); build the real `/creators/apply` page.
- Possibly tune the shimmer, or bring a particle effect back (restore points above).
- Remove unused `--brand*` tokens if not adopting them.

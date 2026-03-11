# C.AI Fanfic Reader

A front-end exploration for reading AI-generated fanfiction, built for Character.ai. Inspired by AO3's information density and reading experience — rebuilt with intentional typography, a rich metadata system, and a book-like reading view.

---

## Overview

This is a static Next.js application that renders a library of fanfic works from markdown files. It covers two core surfaces:

- **Browse page** — Filterable list of works with rich metadata cards (rating, category, length indicator, status, fandom, ships, characters, tags, summary)
- **Reading page** — Editorial reading view with a sticky HUD cluster, morph-animated panels for chapter navigation and reading preferences, and a three-zone scroll-fade header

Content lives entirely in markdown files with YAML frontmatter — no database, no API. All pages are statically generated at build time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| UI | React 19 |
| Styling | CSS Modules — zero Tailwind, all purpose-written |
| Content parsing | [gray-matter](https://github.com/jonschlinkert/gray-matter) (YAML frontmatter) |
| Markdown rendering | [remark](https://github.com/remarkjs/remark) + [rehype](https://github.com/rehypejs/rehype) pipeline |
| Runtime | Node.js 22 LTS |

---

## Project Structure

```
fanfic-reader/
├── content/
│   └── works/              # One .md file per story
│       └── {slug}.md       # YAML frontmatter + markdown chapters
│
├── src/
│   ├── app/
│   │   ├── page.tsx        # Browse page (/)
│   │   ├── browse.module.css
│   │   └── works/[slug]/
│   │       ├── page.tsx    # Reader page (/works/{slug})
│   │       └── reader.module.css
│   │
│   ├── components/
│   │   ├── BrowseHeader.tsx        # Logo + nav tabs
│   │   ├── ContinueReading.tsx     # In-progress works strip
│   │   ├── FilterPanel.tsx         # Filter bar + active filter pills
│   │   ├── SearchOverlay.tsx       # Full-screen search/filter overlay
│   │   ├── SortDropdown.tsx        # Sort menu
│   │   ├── WorkCard.tsx            # Browse list item
│   │   ├── WorkHeader.tsx          # Reading page editorial header
│   │   ├── ReadingHUD.tsx          # Fixed back button (reading page)
│   │   ├── ReadingCluster.tsx      # Sticky pill cluster + morph panels
│   │   ├── MetadataOverlay.tsx     # Work details panel (morphs from title pill)
│   │   ├── ChapterPanel.tsx        # Chapter nav panel (morphs from chapter pill)
│   │   ├── PrefsPanel.tsx          # Reading preferences panel (morphs from settings pill)
│   │   ├── ChapterList.tsx         # Renders all chapters in one scroll
│   │   ├── ChapterContent.tsx      # Single chapter with header
│   │   ├── ChapterBreak.tsx        # Full-width divider between chapters
│   │   ├── RatingBadge.tsx         # Rating square (G/T/M/E/NR)
│   │   ├── FocusEffect.tsx         # Ambient scroll focus (dims edges)
│   │   └── Recommendations.tsx     # End-of-work recommendations
│   │
│   ├── context/
│   │   └── ReadingContext.tsx      # Reading state (chapter index, preferences, scroll)
│   │
│   ├── lib/
│   │   ├── works.ts                # Loads and parses all works from content/
│   │   ├── markdown.ts             # remark/rehype pipeline for chapter HTML
│   │   └── utils.ts                # Formatters, rating class helpers, word tier
│   │
│   ├── styles/
│   │   ├── globals.css             # Design tokens (CSS custom properties)
│   │   └── components/             # One .module.css per component
│   │
│   └── types/
│       └── index.ts                # WorkMeta, WorkSummary, Chapter types
│
├── public/
│   └── fonts/                      # Self-hosted web fonts
│
└── .claude/
    └── launch.json                 # Dev server config (uses Node 22 binary)
```

---

## Content Format

Each work is a single markdown file at `content/works/{slug}.md`.

**YAML frontmatter:**

```yaml
---
title: "The Color of Sound"
author: SynaesthesiaArt
fandom:
  - Original Work
rating: General Audiences       # General Audiences | Teen And Up Audiences | Mature | Explicit | Not Rated
category:
  - F/M
status: Complete                # Complete | In Progress
words: 1200
language: English
tags:
  - Synesthesia
  - Music
relationships:
  - "Iris/Kai"
characters:
  - Iris
  - Kai
published: "2024-01-15"
updated: "2024-04-25"
summary: "A painter who sees music as color meets a composer..."
---
```

**Chapters** are delimited by `## Chapter Title` headings in the markdown body. The works loader splits on these headings and builds a `chapters` array (title + content) for each work.

---

## Design System

All visual decisions live as CSS custom properties in `src/styles/globals.css`. Key token groups:

- **Typography** — `--font-serif`, `--font-sans`, `--font-mono` with a full size scale
- **Color** — `--text`, `--secondary`, `--bg`, `--card-bg`, `--border`, `--border-chip`
- **Rating colors** — `--rating-g` (green), `--rating-t` (amber), `--rating-m` (orange), `--rating-e` (red), `--rating-nr` (grey)
- **Bubble system** — `--bubble-bg`, `--bubble-shadow`, `--bubble-shadow-hover` for the HUD pills
- **Layout** — `--reader-line-width` (60ch), `--browse-max-width`
- **Animation** — `--spring`, `--collapse`, `--ease-out-expo` easing curves

---

## Reading Page Architecture

The reading page has two distinct HUD layers:

**`ReadingHUD`** (`position: fixed; top: 24px; left: 24px`) — the back-to-browse chevron. Always visible regardless of scroll position.

**`ReadingCluster`** (`position: sticky; top: 0`) — a pill cluster placed in document flow between the work header and chapter content. Contains:
- **Title pill** — hidden at natural position, animates in when the cluster becomes sticky
- **Chapter pill** — always visible on multi-chapter works; shows current chapter + embedded scroll progress bar
- **Settings pill** — always visible; opens reading preferences (font size, font family, line width, theme)

Each pill morphs into its panel on click via an 8-step open sequence (snap to pill size → spring to target rect) and 5-step collapse (snap back to pill → fade out). The morph system reads live DOM positions so it works correctly at any scroll position and viewport size.

---

## Getting Started

Requires **Node.js 22 LTS**.

```bash
npm install
npm run dev       # Dev server at http://localhost:3000
npm run build     # Production build
```

> Note: This project requires Node.js 22. It is not compatible with Node.js 24 due to a CommonJS interop issue in Next.js 15.

---

## Adding Content

Drop a `.md` file into `content/works/` with the frontmatter format above. The slug is derived from the filename. The work appears immediately in dev or on the next build in production.

---

*Built by Late Checkout Agency for Character.ai — March 2026*

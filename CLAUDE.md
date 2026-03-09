# CLAUDE.md

## Project Overview

Static Next.js 15 fanfic reader for Character.ai. Two surfaces: Browse page (filterable work list) and Reading page (editorial reader with morph-animated HUD panels). No database, no API — all content is statically generated from markdown files.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19
- **Styling**: CSS Modules — zero Tailwind, all purpose-written
- **Content**: gray-matter (YAML frontmatter) + remark/rehype pipeline
- **Runtime**: Node.js 22 LTS (not compatible with Node 24)

## Commands

```bash
npm install
npm run dev       # Dev server at http://localhost:3000
npm run build     # Production build
```

## Project Structure

- `content/works/{slug}.md` — One markdown file per story (YAML frontmatter + `## Chapter Title` delimited chapters)
- `src/app/page.tsx` — Browse page (`/`)
- `src/app/works/[slug]/page.tsx` — Reader page (`/works/{slug}`)
- `src/components/` — All UI components
- `src/context/ReadingContext.tsx` — Reading state (chapter index, preferences, scroll)
- `src/lib/works.ts` — Loads and parses works from `content/`
- `src/lib/markdown.ts` — remark/rehype pipeline for chapter HTML
- `src/lib/utils.ts` — Formatters, rating helpers, word tier
- `src/styles/globals.css` — Design tokens (CSS custom properties)
- `src/styles/components/` — One `.module.css` per component
- `src/types/index.ts` — WorkMeta, WorkSummary, Chapter types

## Styling Conventions

- All visual tokens are CSS custom properties in `src/styles/globals.css`
- Key token groups: Typography (`--font-serif`, `--font-sans`, `--font-mono`), Color (`--text`, `--secondary`, `--bg`, `--card-bg`, `--border`), Rating colors (`--rating-g/t/m/e/nr`), Bubble system (`--bubble-bg`, `--bubble-shadow`), Layout (`--reader-line-width: 60ch`), Animation (`--spring`, `--collapse`, `--ease-out-expo`)
- No Tailwind — use CSS Modules for component styles

## Reading Page Architecture

Two HUD layers:
1. **ReadingHUD** (`position: fixed`) — Back-to-browse chevron, always visible
2. **ReadingCluster** (`position: sticky`) — Pill cluster between work header and chapter content:
   - Title pill — hidden at natural position, animates in when sticky
   - Chapter pill — current chapter + scroll progress bar (multi-chapter only)
   - Settings pill — reading preferences (font size, font family, line width, theme)
   - Pills morph into panels via 8-step open / 5-step collapse sequence using live DOM positions

## Content Format

Frontmatter fields: `title`, `author`, `fandom[]`, `rating` (General Audiences | Teen And Up Audiences | Mature | Explicit | Not Rated), `category[]`, `status` (Complete | In Progress), `words`, `language`, `tags[]`, `relationships[]`, `characters[]`, `published`, `updated`, `summary`

Chapters are delimited by `## Chapter Title` headings in the markdown body.

## Adding Content

Drop a `.md` file into `content/works/` with the frontmatter format. The slug comes from the filename.

# Screen-Reader Test Script — c.ai Fanfic Reader

Final human sign-off for the WCAG 2.2 AA work. Automated tooling (axe) and the code-level fixes are done; this verifies the *experience* with a real screen reader, which no scanner can do. Run it once on **macOS VoiceOver** and, ideally, once on **Windows NVDA**.

## Setup
- **VoiceOver:** ⌘F5 to toggle. Key combo "VO" = Control+Option. Open the rotor with **VO+U** (arrow keys switch between Landmarks / Headings / Links / Form controls).
- **NVDA:** Insert is the "NVDA" key. Elements list: **NVDA+F7**. Headings: **H**. Landmarks: **D**. Forms: **F**. Buttons: **B**.
- Test in Chrome (VO) and Firefox/Chrome (NVDA). Test **both card modes** (toggle the "AO4 turbo" switch) and at least **dark theme** once.
- ✅ = pass · ✍️ = note what you heard if it's wrong.

## A. Global (every page)
| # | Step | Expected |
|---|------|----------|
| A1 | Tab once from page top | First stop is the **"Skip to content"** link; activating it jumps focus to the main content |
| A2 | Open Landmarks rotor (VO+U → Landmarks) | `banner` (header), `navigation` ("Main"), `main`; on browse, labeled `region`s for each shelf. No unlabeled duplicates |
| A3 | Open Headings rotor | Exactly **one h1** per page; no skipped levels; headings describe the page |
| A4 | Listen to the page `<title>` (VO reads on load) | Unique & descriptive per route (e.g. "Library — c.ai Fanfic", "{Work} by {Author}") |
| A5 | Navigate nav links | The current page's link announces **"current page"** |
| A6 | Tab through everything once | Every control has a clear name; focus ring is always visible; focus never gets stuck or lost |

## B. Browse (home `/`)
| # | Step | Expected |
|---|------|----------|
| B1 | Focus the search box | Announced as a **combobox**, "Search" |
| B2 | Type a query | Suggestions announced; ↓/↑ move through options; Enter selects |
| B3 | Open the **Filter** drawer (button) | Focus moves into the drawer; **Escape** closes it and focus returns to the Filter button |
| B4 | Inside the drawer, reach the word-count / date inputs | Each input has a name ("Minimum word count", "Updated after", etc.) — none read as just "edit text" |
| B5 | Section toggles (Rating, Warnings…) | Announce expanded/collapsed state |
| B6 | Apply a filter | Result count announced (e.g. "12 works found") without moving focus |
| B7 | Toggle "AO4 turbo" switch | Announced as a **switch**, on/off state changes; flips with **Space** |
| B8 | Carousel dots | Active dot announces "current"; arrows/dots reachable, ≥24px |

## C. Reader (`/works/{slug}`)
| # | Step | Expected |
|---|------|----------|
| C1 | Headings rotor | h1 = work title; each chapter is an h2 |
| C2 | Open **Chapter** pill | Focus enters the chapter menu; chapters are a list of buttons; current chapter indicated |
| C3 | Open **Reading preferences** pill | Focus enters the panel; **Tab cycles within** (doesn't escape to the page behind); **Escape** closes and focus returns to the trigger |
| C4 | Font-size slider | Announced as a slider with value; ←/→ change it |
| C5 | Theme / font / width buttons | Announce pressed state |
| C6 | Open **work details** overlay | Focus enters; Escape returns focus |
| C7 | **Kudos** button | After activating, hear **"Kudos left"**; button now reads "Kudos given" |
| C8 | **Bookmark** button | Announces pressed state; on toggle hear **"Bookmarked" / "Bookmark removed"** |
| C9 | Comment form: submit empty | Error **"Please write a comment…"** is announced (role=alert) and the field is marked invalid |
| C10 | Replies / "show more" toggles | Announce expanded state |

## D. Library (`/reading`)
| # | Step | Expected |
|---|------|----------|
| D1 | Reach the tab bar | Announced as a **tablist** ("Library sections"); tabs say "selected" |
| D2 | ←/→ on a tab | Focus moves between tabs (manual activation); Enter/Space activates and swaps the panel |
| D3 | Tab to the content | Reached as a **tab panel** associated with the active tab |

## E. Characters / Fandoms
| # | Step | Expected |
|---|------|----------|
| E1 | Headings rotor | Page has an h1 ("Characters" / "Fandoms") |
| E2 | Character search (Characters) | Input has a name; clear button labeled |
| E3 | Tag/chip links | Reachable; ≥24px targets |

## F. Keyboard-only sweep (no mouse)
1. Unplug/ignore the mouse. Tab through each page start→end and back (Shift+Tab).
2. Open and close every menu/panel with keyboard only (Enter/Space to open, Escape to close).
3. Confirm: focus is always visible, never trapped *outside* a modal, always trapped *inside* an open modal, and returns to the trigger on close.
4. Operate the toggle, slider, tabs, filters, kudos, bookmark — all without a mouse.

## G. Other passes
- **200% / 400% zoom** (⌘+): no clipping, no loss of content.
- **Reduced motion** (System Settings → Accessibility → Display → Reduce Motion): the carousel doesn't auto-advance; panel/morph animation is minimized.
- **Dark + Paper themes:** repeat a few spot checks.

---
**Known, accepted exceptions** (don't file these): continue-reading progress bar can drop below 3:1 over a rare amber/gold cover image; rating-badge fills (Teen light / Explicit dark) are <3:1 against the card but identified by their high-contrast letter. Both documented in the audit report.

# WorkCard Hierarchy — Research & Reasoning

## TL;DR

AO3 users don't read titles first — they scan **ships, then tags, then summary**. Title is a distant fourth. We reordered the card from title-first to **fandom > ships > tags > title > summary > stats**, matching how the community actually browses. This is backed by the team's meeting consensus (Paul, Ed, Collin — March 9 2026), AO3 community research, and the platform's own two-stage discovery funnel.

---

## The Problem

Devin's original prototype used a conventional content hierarchy: **title > fandom > characters > tags > summary > stats**. This mirrors how most content platforms work — but AO3 isn't most platforms.

The sample data was also too light. Works had 6-8 tags, 0-2 relationships, and 2-5 characters. Real AO3 works carry 15-25 freeform tags, 3-7 relationships, and 8-15 characters. The design was untested against realistic density.

Ed flagged this directly in the March 9 meeting:

> "We need just to see what this looks like with real data... the current data is from what [Devin] sent us, which has very light tags versus some of the more heavy stuff."

> "I'm worried about changing it and stripping it down, because now it's not for that audience. And who's it for?"

---

## What the Team Said

### Paul on hierarchy

> "The name isn't the most important thing here. It's more just the characters and the fandom. We have the character relationships as being one of the most prominent elements. So that is what people are looking for quite often."

> "It still needs to be a massive wall of text, but it can be segmented a little bit more."

> "It actually shouldn't be stripped down at all in terms of the information we're showing."

### Ed on the user

> "They use the tags to understand what the story is about. That's essentially how they decide what they want to read. They don't even read the title. They literally just look at the tags."

> "It would be very beneficial to know out of the entire AO3 population — what are their preferences in terms of the importance of these tags? Do the majority always start with relationships? Is that what they're searching for? If so, obviously that would inform the hierarchy."

### Consensus

> Ed: "Let's build for that person and not try to compromise. Because if you start building for the casual reader, it should look very different."

> Paul: "It actually shouldn't be stripped down at all... I think just putting in more realistic data set will already help us visualize to see if these changes actually work."

---

## The Research

### How AO3 Users Actually Browse

AO3 discovery works as a **two-stage funnel**:

1. **Pre-filter stage** — Users narrow by fandom, ship, rating, sort order. This happens before they ever see individual work cards.
2. **Scan stage** — Users scan the filtered list of "blurbs" to decide what to click.

The card's job is not discovery — it's **confirmation and differentiation** within an already-filtered set.

### The Scan Pattern (in priority order)

Based on community discussions across Reddit (r/AO3, r/FanFiction, r/FicReaders), Tumblr meta posts, Destination Toast's statistical analyses, and AO3's own user surveys:

**First glance (< 1 second) — Instant filtering:**

| Priority | Field | Why |
|----------|-------|-----|
| 1 | **Ships / Relationships** | Overwhelmingly cited as #1 factor. If the ship isn't right, nothing else matters. |
| 2 | **Rating** | Often pre-filtered, but the color-coded icon is processed subconsciously. |
| 3 | **Fandom** | Usually pre-filtered, but checked immediately in multi-fandom searches. |

**Second pass (1-3 seconds) — Interest check:**

| Priority | Field | Why |
|----------|-------|-----|
| 4 | **Freeform tags** | Where experienced users spend the most time. Encodes tropes, tone, content warnings, AU type, and author personality. Make-or-break factor. |
| 5 | **Warnings** | Deal-breakers. "Major Character Death" or "Creator Chose Not To Use Warnings" causes immediate skips for many. |
| 6 | **Word count** | Strong preferences — some want 100k+ epics, others want sub-10k one-shots. |
| 7 | **Completion status** | Many users refuse to start WIPs. |

**Third pass (3-5 seconds) — Deciding to click:**

| Priority | Field | Why |
|----------|-------|-----|
| 8 | **Title** | Ranks lower than tags. A good title helps, but a bad title rarely kills interest if the tags are right. |
| 9 | **Summary** | The "closer." Converts interest into a click. Works with no summary or "idk just read it" get skipped. |
| 10 | **Author** | Recognized authors get automatic clicks; unknown authors are neutral. |

**Tie-breaker / validation (glanced at last):**

| Priority | Field | Why |
|----------|-------|-----|
| 11 | **Kudos** | Social proof. High kudos relative to hits = quality signal. |
| 12 | **Bookmarks** | Stronger signal than kudos (bookmarking implies re-read intent). |
| 13 | **Comments** | Engagement indicator. |
| 14 | **Hits** | Least valued stat alone. High hits + low kudos is a *negative* signal. |

### What Makes Users Skip

- Wrong ship (the #1 skip reason by far)
- "Author Chose Not To Use Archive Warnings" (polarizing)
- No summary or low-effort summary
- Extremely low word count for multi-chapter works
- 30+ freeform tags (reads as tag spam)
- "?/?" chapters on an old work (abandoned WIP)

### What Draws Users In

- Beloved ship + preferred trope combo
- High kudos-to-hits ratio
- Completed, substantial word count
- Specific trope tags they're craving (Slow Burn, Fake Dating, Found Family)
- Well-written summary with a compelling premise

---

## Real AO3 Tag Density

From top Harry Potter works by kudos:

| Work | Kudos | Relationships | Characters | Freeform Tags |
|------|-------|--------------|------------|--------------|
| All the Young Dudes | 299k | 3 | 18 | 19 |
| Draco Malfoy and the Mortifying Ordeal | 97k | 1 | 3 | 24 |
| Typical top-50 HP work | 15-80k | 2-7 | 8-15 | 15-25 |

vs. Devin's sample data: 0-2 relationships, 2-5 characters, 6-8 tags.

The design was being tested against unrealistically sparse data. We updated 9 of 11 sample works to match real AO3 density.

---

## The Decision: Our Hierarchy

### Before (Devin's original)
```
Title (largest, boldest)
Fandom
Characters
Tags (dot-separated text)
Summary
Stats (words, chapters only)
```

### After (research-informed)
```
LEFT STRIP          RIGHT CONTENT
Rating badge        Fandom (mono, uppercase — context frame)
Category            Ships (16px, weight 600 — primary scan target)
Length bars         Tags (chip pills — decision core)
Status pill         Title + Author (14px serif — demoted, stretched link)
                    Summary (italic serif — the closer)
                    Stats (words · chapters · updated · kudos · bookmarks · hits)
```

### Why Each Change

**Fandom at top** — Context frame. Even when pre-filtered, it anchors "where am I?" Styled small (10px mono uppercase) so it doesn't compete with ships.

**Ships promoted to #1 visual weight** — 16px, weight 600. Research is unambiguous: this is the first thing users look for. It was previously competing with title at the same size/weight.

**Tags as chips** — Converted from dot-separated text to pill-style chips. Tags are the "decision core" where experienced users spend the most cognitive energy. Chips give each tag visual identity and make them individually scannable. Capped at 12 visible with an expandable "+N" button.

**Title demoted** — 14px serif, weight 500. Research shows title ranks 8th in user priority. It still needs to be readable, but it should not compete with ships for visual dominance. Uses a stretched `::after` pseudo-element so the entire card is clickable.

**Characters removed** — Not displayed on AO3's standard blurb view. Characters are available through tag filtering but aren't shown as a separate section on work cards. Removing this aligns with the platform's actual UI.

**Social stats added** — Kudos, bookmarks, and hits combined into the stats line. These serve as tie-breakers and quality signals. Formatted with icons (heart, flag, circle) for quick scanning.

**Summary preserved** — Italic serif, 2-line clamp. The "closer" that converts scanning into clicking. Given breathing room below the identity row.

### Visual Zones

The card uses three intentional visual zones with spacing breaks:

| Zone | Elements | Gap | Purpose |
|------|----------|-----|---------|
| **A: Discovery** | Fandom, Ships, Tags | Tight (3px internal) | Scan at glance speed |
| **B: Identity** | Title + Author, Summary | 10px margin above | Read speed |
| **C: Metadata** | Stats | 4px internal | Supporting info |

Zone breaks create scannable rhythm instead of one flat column of uniformly-spaced text.

---

## Sources

- March 9, 2026 team meeting transcript (Paul Loots, Ed Wong, Collin Briggs)
- AO3 community discussions: r/AO3, r/FanFiction, r/FicReaders
- Destination Toast's fandom statistics (Tumblr)
- OTW user census data (2013+)
- AO3's HTML blurb structure and design guidelines
- Live AO3 data from Harry Potter, MCU, Supernatural, Good Omens, and Genshin Impact fandoms

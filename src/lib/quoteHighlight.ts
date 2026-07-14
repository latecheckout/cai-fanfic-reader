// Scroll to a quoted passage in the chapter prose and flash-highlight it.
// Uses the CSS Custom Highlight API (no DOM mutation — the chapter HTML is
// dangerouslySetInnerHTML, so wrapping nodes would fight React). Styling
// lives in globals.css under ::highlight(cai-quote-flash).

const QUOTE_FLASH_NAME = 'cai-quote-flash';
const FLASH_MS = 2200;

let flashTimer: ReturnType<typeof setTimeout> | null = null;
let flashStyleInjected = false;

// The ::highlight() rule lives here (constructable stylesheet) instead of
// globals.css — Turbopack's CSS parser rejects the pseudo-element. Every
// browser with the Highlight API also has adoptedStyleSheets.
function ensureFlashStyle() {
  if (flashStyleInjected) return;
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(
      `::highlight(${QUOTE_FLASH_NAME}) { background-color: color-mix(in srgb, var(--toasty-amber) 35%, transparent); }`
    );
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    flashStyleInjected = true;
  } catch {
    // no constructable-stylesheet support — scroll still works, no flash
  }
}

/** Build a Range covering `start..end` (text offsets) inside `root`. */
function rangeFromOffsets(root: Element, start: number, end: number): Range | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let offset = 0;
  let haveStart = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const len = node.textContent?.length ?? 0;
    if (!haveStart && offset + len > start) {
      range.setStart(node, start - offset);
      haveStart = true;
    }
    if (haveStart && offset + len >= end) {
      range.setEnd(node, end - offset);
      return range;
    }
    offset += len;
  }
  return null;
}

/**
 * Find `quote` in the chapter's prose (preferring the chapter it was taken
 * from), scroll it into view, and flash it. Returns false when not found or
 * the Highlight API is unavailable (older Safari/Firefox — scroll still works
 * if the text was located).
 */
export function highlightQuoteInChapter(quote: string, chapterIndex: number): boolean {
  const needle = quote.trim();
  if (!needle) return false;

  const scopes: (Element | Document)[] = [];
  const chapter = document.querySelector(`#chapter-${chapterIndex}`);
  if (chapter) scopes.push(chapter);
  scopes.push(document);

  for (const scope of scopes) {
    const blocks = scope.querySelectorAll('[data-chapter-prose] p, [data-chapter-prose] li');
    for (const block of blocks) {
      const index = block.textContent?.indexOf(needle) ?? -1;
      if (index < 0) continue;

      const range = rangeFromOffsets(block, index, index + needle.length);
      const target = range?.startContainer.parentElement ?? (block as HTMLElement);
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });

      type HighlightRegistry = { set(name: string, h: unknown): void; delete(name: string): void };
      const HighlightCtor = (window as unknown as { Highlight?: new (r: Range) => unknown }).Highlight;
      const registry = (CSS as unknown as { highlights?: HighlightRegistry }).highlights;
      if (range && HighlightCtor && registry) {
        ensureFlashStyle();
        registry.set(QUOTE_FLASH_NAME, new HighlightCtor(range));
        if (flashTimer) clearTimeout(flashTimer);
        flashTimer = setTimeout(() => registry.delete(QUOTE_FLASH_NAME), FLASH_MS);
        return true;
      }
      return false;
    }
  }
  return false;
}

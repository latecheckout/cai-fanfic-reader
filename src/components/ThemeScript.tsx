import { THEME_KEY, BOOKMARKS_KEY, FONT_KEY, FONT_SIZE_KEY, LINE_WIDTH_KEY } from '@/lib/constants';

/**
 * ThemeScript — inlined into <head> to prevent FOUC.
 * Reads localStorage before the page paints and sets data-theme + CSS vars.
 * Storage keys are interpolated from constants.ts so they can't drift.
 */
export function ThemeScript() {
  const script = `
(function() {
  try {
    var root = document.documentElement;
    var readerTheme = localStorage.getItem('${THEME_KEY}');
    if (readerTheme && readerTheme !== 'default') {
      root.setAttribute('data-theme', readerTheme);
    } else {
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        var current = localStorage.getItem('${THEME_KEY}');
        if (!current || current === 'default') {
          document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
      });
    }
    var siteMode = localStorage.getItem('cai_site_mode');
    root.setAttribute('data-mode', siteMode === 'text' ? 'text' : 'visual');
    // Reserve the Continue Reading rail's space before paint when the reading
    // list is non-empty, so it doesn't pop in late after hydration reads it.
    var bm = localStorage.getItem('${BOOKMARKS_KEY}');
    if (bm) { try { if (Object.keys(JSON.parse(bm)).length > 0) root.setAttribute('data-has-reading', ''); } catch(e) {} }
    var font = localStorage.getItem('${FONT_KEY}') || 'serif';
    var fontSize = localStorage.getItem('${FONT_SIZE_KEY}') || '19';
    var lineWidth = localStorage.getItem('${LINE_WIDTH_KEY}');
    root.setAttribute('data-font', font);
    root.style.setProperty('--font-size-body', fontSize + 'px');
    if (lineWidth) {
      var m = {narrow:'var(--line-width-narrow)',default:'var(--line-width-default)',wide:'var(--line-width-wide)'};
      if (m[lineWidth]) root.style.setProperty('--reader-line-width', m[lineWidth]);
    }
  } catch(e) {}
})();
`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}

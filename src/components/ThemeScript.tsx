/**
 * ThemeScript — inlined into <head> to prevent FOUC.
 * Reads localStorage before the page paints and sets data-theme + CSS vars.
 */
export function ThemeScript() {
  const script = `
(function() {
  try {
    var theme = localStorage.getItem('fanfic-theme') || 'light';
    var font = localStorage.getItem('fanfic-font') || 'serif';
    var fontSize = localStorage.getItem('fanfic-font-size') || '19';
    var lineWidth = localStorage.getItem('fanfic-line-width');
    var root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-font', font);
    root.style.setProperty('--font-size-body', fontSize + 'px');
    if (lineWidth) {
      var widthMap = {
        narrow: 'var(--line-width-narrow)',
        default: 'var(--line-width-default)',
        wide: 'var(--line-width-wide)'
      };
      var resolved = widthMap[lineWidth];
      if (resolved) root.style.setProperty('--reader-line-width', resolved);
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

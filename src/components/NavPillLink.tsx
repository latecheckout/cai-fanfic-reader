'use client';

/**
 * Nav pill link — character-ux-audit's treatment: lowercase mono pill,
 * bg reveal + underline on hover, magenta dot on the active pill.
 * `big` bumps the padding for header CTAs; `filled` swaps the quiet link
 * treatment for the CTA fill (quill-ink; espresso in dark via --cta-fill) with
 * a low-opacity white stroke, deepening to pinned-purple on hover.
 * Bg/text classes live entirely inside each variant branch — never stacked
 * (same-property utilities resolve by emission order).
 */
export function NavPillLink({
  href,
  label,
  active = false,
  big = false,
  filled = false,
  className = '',
  onClick,
}: {
  href: string;
  label: string;
  active?: boolean;
  big?: boolean;
  filled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  // Font family + bg/text live inside the variant branches — same-property
  // utilities on one element resolve by emission order, never stack them.
  const variant = filled
    // No shadow-bubble here: it carries its own 1px ring, which doubles the
    // --cta-stroke border.
    ? 'bg-cta-fill border border-cta-stroke font-sans text-[13px] text-white hover:bg-pinned-purple'
    : `bg-bg/16 font-mono text-[12px] backdrop-blur-md hover:bg-text/6 ${
        active ? 'text-text' : 'text-secondary hover:text-text'
      }`;
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full no-underline transition-[color,background-color,box-shadow] duration-150 ease-out hover:underline underline-offset-4 ${
        big ? 'h-10 px-4 max-md:h-11' : 'px-3 py-1.5'
      } ${variant} ${className}`}
    >
      {label}
      {active && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-[#d90082] opacity-100 scale-100 transition-[opacity,scale] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] starting:opacity-0 starting:scale-50 motion-reduce:starting:scale-100"
        />
      )}
    </a>
  );
}

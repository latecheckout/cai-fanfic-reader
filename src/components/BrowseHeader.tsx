'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Ao4TurboToggle } from './Ao4TurboToggle';
import { AboutIcon, BrowseIcon, CharactersIcon, CloseIcon, HamburgerIcon, LibraryIcon, PenIcon, UserProfileIcon } from './icons';
import { AccountMenu } from './AccountMenu';
import { CrossfadeSwap } from './ReadingActions';
import { Popover } from './Popover';
import { MenuBubbleTrigger, MenuColumn, MenuRowLink } from './Menu';
import { NavPillLink } from './NavPillLink';
import { TabPill } from './TabPill';

const NAV_LINKS = [
  { href: '/browse', label: 'Browse', Icon: BrowseIcon },
  { href: '/characters', label: 'Characters', Icon: CharactersIcon },
  { href: '/reading', label: 'Library', Icon: LibraryIcon },
  { href: '/about', label: 'About', Icon: AboutIcon },
];

interface Props {
  /** Search slot, rendered in the right zone. SiteHeader passes the global
      BrowseSearchBar here (routes to /browse) on every header page. */
  search?: ReactNode;
}

export function BrowseHeader({ search }: Props = {}) {
  const pathname = usePathname();

  return (
    <>
      {/* @container: the header collapses on its OWN width, not the viewport —
          the filter push panel shrinks its content box by --filter-push, so a
          desktop window with the panel open gets the compact (two-icon)
          layout instead of the nav/CTA overlapping. @max-3xl (48rem) = the
          container-width equivalent of the old max-md viewport breakpoint. */}
      <header className="site-header @container sticky top-0 z-[var(--z-sticky)] border-b border-border bg-bg">
        <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--browse-max-width)] items-stretch px-6 @max-3xl:items-center @max-3xl:justify-between @max-3xl:px-4">
          {/* ── Left zone: logo + nav links (desktop) ── */}
          <div className="flex min-w-0 flex-1 items-center gap-8 @max-3xl:gap-0">
            <a
              href="/"
              className="flex items-center text-text no-underline opacity-[0.88] transition-opacity duration-150 ease-in-out hover:opacity-100"
              aria-label="(c.ai) reads, home"
            >
            <svg viewBox="0 0 532 100" fill="none" className="block h-5 w-auto" aria-hidden="true">
            <path d="M27.9111 0.0488281C17.9225 13.1137 13.0063 31.2441 12.9189 50.001C13.0063 68.7578 17.9225 86.8895 27.9111 99.9541L16.627 100.001C6.90851 87.9671 0.0874563 68.7417 0 50.001C0.0873655 31.2681 6.90843 12.0343 16.627 0L27.9111 0.0488281Z" fill="currentColor"/>
            <path d="M227.374 0C237.101 12.0342 243.922 31.2678 244.001 50.001C243.914 68.7419 237.093 87.9671 227.374 100.001L216.091 99.9541C226.079 86.8895 230.995 68.7578 231.083 50.001C230.995 31.2443 226.079 13.1137 216.091 0.0488281L227.374 0Z" fill="currentColor"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M155.437 29.7217C170.054 29.7219 178.265 37.5783 178.266 51.8398V87.6582H166.347V78.8975H165.895C161.957 84.9618 155.318 88.3309 147.561 88.3311C135.865 88.3311 128.783 82.0449 128.782 71.8262C128.782 64.4138 132.713 59.2442 140.026 56.8896C144.52 55.4233 151.603 54.5279 160.939 53.0693C164.877 52.3955 165.775 51.6093 165.775 48.6924C165.775 42.969 161.837 39.8215 155.088 39.8213C148.339 39.8214 143.956 43.191 143.281 49.0254H131.132C132.14 36.7854 141.137 29.714 155.421 29.7139L155.437 29.7217ZM165.768 61.0439C161.385 62.3916 150.585 62.9548 146.877 64.1914C143.17 65.4202 141.367 67.6722 141.367 71.374C141.368 75.8606 144.401 78.334 149.911 78.334C159.018 78.3337 165.767 71.5953 165.768 62.7246V61.0439Z" fill="currentColor"/>
            <path d="M62.1328 29.7139C76.6387 29.7142 86.7545 38.133 87.8828 50.5947H75.7344C74.4955 43.1831 69.8817 39.8137 62.125 39.8135C51.8985 39.8136 45.9348 47.1072 45.9346 59.125C45.9347 71.143 52.0016 78.2157 62.125 78.2158V78.2236C70.2232 78.2234 74.6155 75.1863 76.2988 67.4414H88.4463C86.9857 79.9034 77.2026 88.323 62.1328 88.3232C44.5936 88.3231 33.2318 76.6534 33.2314 59.1338C33.2316 41.6138 44.9269 29.714 62.1328 29.7139Z" fill="currentColor"/>
            <path d="M108.424 70.6924C113.481 70.6928 116.967 74.617 116.967 79.6748C116.966 84.732 113.489 88.3228 108.424 88.3232C103.358 88.3232 99.7611 84.9541 99.7607 79.6748C99.7608 74.3947 103.367 70.6924 108.424 70.6924Z" fill="currentColor"/>
            <path d="M202.379 87.6504H189.897V30.3887H202.379V87.6504Z" fill="currentColor"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M328.647 27.7793C345.264 27.7794 355.578 39.239 355.578 57.6895V61.9297H312.145C313.061 71.4415 318.792 77.2861 328.647 77.2861C337.242 77.2861 341.712 73.7339 342.973 68.5771H355.35C353.745 79.6931 344.118 87.6005 328.647 87.6006C310.655 87.6006 299.08 75.9113 299.08 57.8047C299.08 39.4686 310.655 27.7793 328.647 27.7793ZM328.647 38.0928C319.021 38.0928 313.406 43.1356 312.26 52.6475H343.087C342.514 43.5941 337.013 38.0929 328.647 38.0928Z" fill="currentColor"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M388.523 27.7793C403.421 27.7793 411.787 35.8012 411.787 50.3555V86.9131H399.64V77.9736H399.182C395.171 84.1621 388.408 87.6006 380.501 87.6006C368.583 87.6005 361.363 81.1825 361.363 70.7539C361.363 63.1904 365.374 57.9193 372.823 55.5127C377.407 54.0229 384.627 53.106 394.139 51.6162C398.15 50.9286 399.066 50.126 399.066 47.1465C399.066 41.3019 395.17 38.0928 388.18 38.0928C381.304 38.0928 376.834 41.531 376.146 47.4902H363.77C364.801 34.9988 373.969 27.7793 388.523 27.7793ZM399.066 59.7529C394.597 61.1281 383.595 61.7004 379.813 62.9609C376.032 64.2215 374.198 66.5141 374.198 70.2959C374.198 74.8798 377.293 77.4014 382.908 77.4014C392.191 77.4012 399.066 70.5249 399.066 61.4717V59.7529Z" fill="currentColor"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M476.427 86.9131H464.278V78.0889H463.82C459.924 83.9333 452.475 87.6006 444.567 87.6006C428.753 87.6006 418.668 75.9113 418.668 57.8047C418.668 39.5832 428.753 27.7793 444.567 27.7793C452.131 27.7793 459.236 31.4461 463.247 37.4053H463.706V4.40039H476.427V86.9131ZM448.12 38.0928C437.921 38.0928 431.617 45.5424 431.617 57.8047C431.617 69.9521 437.921 77.2861 448.12 77.2861C458.205 77.2861 464.164 69.952 464.164 57.8047C464.164 45.5425 458.09 38.0928 448.12 38.0928Z" fill="currentColor"/>
            <path d="M508.001 27.7793C521.638 27.7794 529.66 34.4257 530.462 46H518.2C517.283 40.1558 514.189 37.6349 508.001 37.6348C502.042 37.6348 498.833 40.0413 498.833 44.5107C498.833 48.0632 500.437 50.2407 506.625 51.3867L515.335 52.9912C527.941 55.2832 531.838 60.0962 531.838 70.0664C531.838 81.2973 523.815 87.6006 509.49 87.6006C494.363 87.6005 485.654 80.6098 484.966 68.0039H497.229C498.145 74.8797 501.927 77.7451 509.49 77.7451C515.449 77.7451 519.346 74.9941 519.346 70.7539C519.346 66.743 516.939 64.9097 510.865 63.7637L502.729 62.2734C491.613 60.2106 486.341 54.8245 486.341 45.1982C486.341 34.655 494.707 27.7793 508.001 27.7793Z" fill="currentColor"/>
            <path d="M296.234 40.1562H292.223C281.68 40.1564 274.918 44.8545 274.918 58.377V86.9131H262.198V28.4668H274.346V38.666H274.804C277.669 32.7068 284.66 27.7793 296.234 27.7793V40.1562Z" fill="currentColor"/>
            <path d="M196.194 6.12988C200.799 6.1302 203.951 9.27644 203.951 13.874C203.951 18.4716 200.799 21.6198 196.194 21.6201C191.589 21.6201 188.437 18.4719 188.437 13.874C188.437 9.27621 191.581 6.12989 196.194 6.12988Z" fill="currentColor"/>
            </svg>
          </a>

          {/* Nav links, left-aligned after the logo — TabPill treatment (same
              as the library tabs): text-only mono labels stretched to the
              header height, active indicator riding the header's bottom
              stroke and sliding between links on client nav. */}
          <nav className="flex items-stretch gap-6 self-stretch @max-3xl:hidden" aria-label="Site navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <TabPill
                key={href}
                href={href}
                label={label}
                active={pathname === href}
                indicatorId="site-nav-indicator"
              />
            ))}
          </nav>
        </div>

        {/* ── Right zone: search slot + CTA (desktop) + nav icons (mobile) + avatar ── */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 @max-3xl:gap-1.5">
          {/* Header search is desktop-only — mobile keeps just the two icons
              (profile + menu); each surface owns its own scoped search. */}
          {search && <div className="flex min-w-0 max-w-[340px] flex-[1_1_auto] items-center @max-3xl:hidden">{search}</div>}
          {/* CTA — big filled variant of the nav-pill link (espresso → quill-ink).
              Desktop only; on mobile it lives in the account dropdown. */}
          <NavPillLink href="/creators/apply" label="Write on c.ai" big filled className="shrink-0 @max-3xl:hidden" />
          {/* Account dropdown — shared AccountMenu body, HUD-bubble trigger.
              On mobile this menu is account-only (email + sign out). */}
          <div className="shrink-0">
            <AccountMenu
              renderTrigger={({ open, toggle }) => (
                <MenuBubbleTrigger open={open} toggle={toggle} label="Account menu">
                  <UserProfileIcon width={20} height={20} />
                </MenuBubbleTrigger>
              )}
            />
          </div>
          {/* Mobile site menu — far right, same popover pattern as the
              account menu; every destination lives here (nav + Write + About),
              each row iconed, active route highlighted. */}
          <div className="hidden shrink-0 @max-3xl:block">
            <Popover
              align="right"
              ariaLabel="Site menu"
              contentClassName="w-56 p-2"
              renderTrigger={({ open, toggle }) => (
                <MenuBubbleTrigger open={open} toggle={toggle} label="Site menu">
                  {/* Same crossfade as the reading-list bookmark swap. */}
                  <CrossfadeSwap swapKey={open ? 'close' : 'menu'}>
                    {open ? <CloseIcon width={20} height={20} /> : <HamburgerIcon width={20} height={20} />}
                  </CrossfadeSwap>
                </MenuBubbleTrigger>
              )}
            >
              {({ close }) => (
                <MenuColumn>
                  {NAV_LINKS.map(({ href, label, Icon }) => (
                    <MenuRowLink
                      key={href}
                      href={href}
                      label={label}
                      icon={<Icon width={18} height={18} />}
                      active={pathname === href}
                      onClick={close}
                    />
                  ))}
                  <MenuRowLink
                    href="/creators/apply"
                    label="Write on c.ai"
                    icon={<PenIcon width={18} height={18} />}
                    onClick={close}
                  />
                </MenuColumn>
              )}
            </Popover>
          </div>
        </div>
        </div>
      </header>

      {/* Global mode switch: draggable AO4 turbo toggle, bottom-right */}
      <Ao4TurboToggle />
    </>
  );
}

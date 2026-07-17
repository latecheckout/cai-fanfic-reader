'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Ao4TurboToggle } from './Ao4TurboToggle';
import { HamburgerIcon, UserProfileIcon } from './icons';
import { AccountMenu } from './AccountMenu';
import { NavPillLink } from './NavPillLink';
import { Popover } from './Popover';
import { MENU_ROW, MENU_ROW_ACTIVE } from './popoverChrome';
import { HUD_BUBBLE } from './readingChrome';

const NAV_LINKS = [
  { href: '/', label: 'Stories' },
  { href: '/reading', label: 'Library' },
  { href: '/characters', label: 'Characters' },
  { href: '/about', label: 'About' },
];

interface Props {
  /** Search slot, rendered in the right zone. The browse home passes
      BrowseSearchBar here; results pages keep search in their toolbar. */
  search?: ReactNode;
}

export function BrowseHeader({ search }: Props = {}) {
  const pathname = usePathname();

  return (
    <>
      <header className="site-header sticky top-0 z-[var(--z-sticky)] border-b border-border bg-bg">
        <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--browse-max-width)] items-stretch px-6 max-md:items-center max-md:justify-between max-md:px-4">
          {/* ── Left zone: logo ── */}
          <div className="flex min-w-0 flex-1 items-center">
            <a
              href="/"
              className="flex items-center text-text no-underline opacity-[0.88] transition-opacity duration-150 ease-in-out hover:opacity-100"
              aria-label="fanfic — home"
            >
            <svg viewBox="0 0 545 100" fill="none" className="block h-5 w-auto" aria-hidden="true">
            <path d="M27.9102 0.0478516C17.9215 13.1127 13.0053 31.2431 12.918 50C13.0053 68.757 17.9215 86.8884 27.9102 99.9531L16.626 100C6.90745 87.966 0.0873406 68.7408 0 50C0.0873655 31.2671 6.90745 12.0343 16.626 0L27.9102 0.0478516Z" fill="currentColor"/>
            <path d="M227.373 0C237.1 12.0342 243.921 31.2669 244 50C243.913 68.7411 237.092 87.9661 227.373 100L216.09 99.9531C226.079 86.8884 230.994 68.757 231.082 50C230.994 31.2431 226.079 13.1127 216.09 0.0478516L227.373 0Z" fill="currentColor"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M327.958 29.584C342.734 29.5841 351.031 37.54 351.031 51.9746V88.2324H338.982V79.3672H338.528C334.55 85.5049 327.844 88.915 320.001 88.915C308.181 88.9149 301.02 82.5499 301.02 72.207C301.02 64.7055 304.998 59.4768 312.386 57.0898C316.932 55.6122 324.093 54.7032 333.527 53.2256C337.505 52.5436 338.414 51.7471 338.414 48.792C338.414 42.9955 334.549 39.8135 327.616 39.8135C320.797 39.8136 316.365 43.2235 315.683 49.1338H303.407C304.43 36.7447 313.523 29.584 327.958 29.584ZM338.414 61.2949C333.981 62.6588 323.07 63.2273 319.319 64.4775C315.569 65.7278 313.75 68.0012 313.75 71.752C313.75 76.2984 316.819 78.7988 322.389 78.7988C331.595 78.7986 338.414 71.9791 338.414 63V61.2949Z" fill="currentColor"/>
            <path d="M518.104 29.584C532.767 29.584 542.996 38.1083 544.133 50.7246H531.857C530.607 43.2231 525.947 39.8135 518.104 39.8135C507.762 39.8136 501.737 47.3153 501.737 59.3633C501.737 71.5247 507.875 78.6854 518.104 78.6855C526.288 78.6855 530.721 75.6161 532.426 67.7734H544.701C543.224 80.3898 533.335 88.915 518.104 88.915C500.374 88.9149 488.894 77.3214 488.894 59.3633C488.894 41.6322 500.715 29.5841 518.104 29.584Z" fill="currentColor"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M155.436 29.7207C170.053 29.7207 178.265 37.5771 178.265 51.8389V87.6572H166.346V78.8965H165.894C161.956 84.961 155.317 88.33 147.56 88.3301C135.864 88.3301 128.781 82.0442 128.781 71.8252C128.781 64.4128 132.712 59.2433 140.025 56.8887C144.519 55.4223 151.602 54.527 160.938 53.0684C164.876 52.3945 165.774 51.6088 165.774 48.6914C165.774 42.9679 161.836 39.8204 155.087 39.8203C148.338 39.8204 143.956 43.19 143.28 49.0244H131.131C132.139 36.7844 141.136 29.713 155.42 29.7129L155.436 29.7207ZM165.767 61.043C161.384 62.3907 150.584 62.9538 146.876 64.1904C143.169 65.4193 141.366 67.6712 141.366 71.373C141.366 75.8599 144.399 78.333 149.91 78.333C159.017 78.333 165.767 71.5947 165.767 62.7236V61.043Z" fill="currentColor"/>
            <path d="M62.1318 29.7129C76.638 29.713 86.7535 38.1319 87.8818 50.5938H75.7334C74.4945 43.182 69.881 39.8126 62.124 39.8125C51.8975 39.8126 45.9338 47.1062 45.9336 59.124C45.9336 71.1424 52.0005 78.2147 62.124 78.2148V78.2227C70.2227 78.2226 74.6145 75.1857 76.2979 67.4404H88.4453C86.9848 79.9028 77.2021 88.3222 62.1318 88.3223C44.5924 88.3221 33.2306 76.6527 33.2305 59.1328C33.2306 41.6128 44.9259 29.7131 62.1318 29.7129Z" fill="currentColor"/>
            <path d="M108.423 70.6914C113.481 70.6916 116.966 74.6158 116.966 79.6738C116.966 84.7315 113.488 88.3221 108.423 88.3223C103.357 88.3222 99.7599 84.9534 99.7598 79.6738C99.7599 74.3938 103.366 70.6914 108.423 70.6914Z" fill="currentColor"/>
            <path d="M300.956 16.3994H291.522C287.885 16.3994 285.839 18.4449 285.839 22.082V30.2656H300.956V40.2676H285.839V88.2334H273.223V40.2676H262.197V30.2656H273.223V22.8779C273.223 12.1939 279.019 6.39663 289.703 6.39648H300.956V16.3994Z" fill="currentColor"/>
            <path d="M392.067 29.584C405.252 29.5842 412.526 38.563 412.526 55.7256V88.2324H399.909V55.7256C399.909 45.0415 395.931 40.2676 386.952 40.2676C377.973 40.2676 373.881 45.1552 373.881 55.7256V88.2324H361.265V30.2656H373.312V39.1309H373.768C377.859 32.9933 384.225 29.584 392.067 29.584Z" fill="currentColor"/>
            <path d="M457 16.3994H447.566C443.929 16.3995 441.884 18.4449 441.884 22.082V30.2656H457V40.2676H441.884V88.2324H429.267V40.2676H418.242V30.2656H429.267V22.8779C429.267 12.1938 435.064 6.39648 445.748 6.39648H457V16.3994Z" fill="currentColor"/>
            <path d="M480.983 88.2324H468.366V30.2656H480.983V88.2324Z" fill="currentColor"/>
            <path d="M202.378 87.6494H189.896V30.3877H202.378V87.6494Z" fill="currentColor"/>
            <path d="M196.193 6.12891C200.798 6.129 203.95 9.2753 203.95 13.873C203.95 18.4711 200.798 21.619 196.193 21.6191C191.587 21.6191 188.436 18.4712 188.436 13.873C188.436 9.27523 191.58 6.12891 196.193 6.12891Z" fill="currentColor"/>
            <path d="M474.731 5.71484C479.392 5.71484 482.574 8.89751 482.574 13.5576C482.574 18.2176 479.392 21.4004 474.731 21.4004C470.071 21.4003 466.889 18.2176 466.889 13.5576C466.889 8.89755 470.071 5.7149 474.731 5.71484Z" fill="currentColor"/>
            </svg>
          </a>
        </div>

        {/* ── Center zone: nav links — character-ux-audit's NavPillLink treatment:
            lowercase mono pills, bg reveal + underline on hover, magenta dot on
            the active pill. ── */}
        <nav className="flex items-center justify-center gap-1 max-md:hidden" aria-label="Site navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <NavPillLink key={href} href={href} label={label} active={pathname === href} />
          ))}
        </nav>

        {/* ── Right zone: search slot + avatar (desktop) + hamburger (mobile) ── */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 max-md:gap-1.5">
          {search && <div className="flex min-w-0 max-w-[340px] flex-[1_1_auto] items-center max-md:max-w-none">{search}</div>}
          {/* CTA — big filled variant of the nav-pill link (espresso → quill-ink). */}
          <NavPillLink href="/creators/apply" label="Write on c.ai" big filled className="shrink-0" />
          {/* Account dropdown — shared AccountMenu body, HUD-bubble trigger to
              match the reading page. Same dropdown on mobile (popovers clamp
              to the viewport). */}
          <div className="shrink-0">
            <AccountMenu
              renderTrigger={({ open, toggle }) => (
                <button
                  type="button"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={toggle}
                  className={`${HUD_BUBBLE} ${open ? 'shadow-bubble-hover [&_svg]:opacity-100' : ''}`}
                >
                  <UserProfileIcon width={20} height={20} />
                </button>
              )}
            />
          </div>
          {/* Mobile nav menu — same HUD-bubble trigger + dropdown system as the
              account menu, holding the pages the center nav shows on desktop. */}
          <div className="hidden shrink-0 max-md:block">
            <Popover
              align="right"
              ariaLabel="Site navigation"
              contentClassName="w-48 p-2"
              renderTrigger={({ open, toggle }) => (
                <button
                  type="button"
                  aria-label="Open navigation"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={toggle}
                  className={`${HUD_BUBBLE} ${open ? 'shadow-bubble-hover [&_svg]:opacity-100' : ''}`}
                >
                  <HamburgerIcon width={20} height={20} />
                </button>
              )}
            >
              {({ close }) => (
                <nav aria-label="Site navigation">
                  {NAV_LINKS.map(({ href, label }) => (
                    <a
                      key={href}
                      href={href}
                      onClick={close}
                      aria-current={pathname === href ? 'page' : undefined}
                      className={`${MENU_ROW} justify-between font-mono text-[12px] no-underline ${
                        pathname === href ? `${MENU_ROW_ACTIVE} text-text` : 'text-secondary hover:text-text'
                      }`}
                    >
                      {label}
                      {pathname === href && (
                        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[#d90082]" />
                      )}
                    </a>
                  ))}
                </nav>
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

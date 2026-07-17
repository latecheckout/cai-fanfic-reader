'use client';

import type { ReactNode } from 'react';
import { Popover } from './Popover';
import { MENU_ROW } from './popoverChrome';
import { AboutIcon, LogOutIcon } from './icons';

// @DUMMY logged-in user — becomes the real session once auth is wired.
export const MOCK_USER_EMAIL = 'collinbriggs19@gmail.com';

/**
 * Account dropdown body (email label + sign out) on the shared Popover.
 * Each surface supplies its own trigger chrome — the outlined circle in the
 * browse header, the HUD bubble on the reading page — so the menu itself
 * can't drift between them.
 */
export function AccountMenu({
  renderTrigger,
}: {
  renderTrigger: (args: { open: boolean; toggle: () => void; close: () => void }) => ReactNode;
}) {
  return (
    <Popover
      align="right"
      ariaLabel="Account menu"
      contentClassName="w-56 p-2"
      renderTrigger={renderTrigger}
    >
      {({ close }) => <AccountMenuBody onClose={close} />}
    </Popover>
  );
}

/** Menu body (email + site links + sign out). The header is this menu's only
 *  surface — it also absorbs the links that don't fit the mobile header:
 *  About (all breakpoints) and the Write on c.ai CTA (mobile only; desktop
 *  keeps the header pill). */
export function AccountMenuBody({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="truncate px-2.5 py-2 font-mono text-xs text-secondary">
        {MOCK_USER_EMAIL}
      </div>
      <div className="my-1 h-px bg-border" aria-hidden="true" />
      <a
        href="/about"
        onClick={onClose}
        className={`${MENU_ROW} font-sans text-sm text-secondary no-underline hover:text-text`}
      >
        <AboutIcon width={18} height={18} /> About
      </a>
      <a
        href="/creators/apply"
        onClick={onClose}
        className={`${MENU_ROW} hidden font-sans text-sm text-secondary no-underline hover:text-text max-md:flex`}
      >
        Write on c.ai
      </a>
      {/* MENU_ROW layout minus its hover bg — two bg utilities on one
          element resolve by emission order, so the crimson fill must be
          the only one. @WIRE — sign out becomes the real session call. */}
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left font-sans text-sm text-cached-crimson transition-colors hover:bg-[color-mix(in_srgb,var(--cached-crimson)_10%,var(--bubble-bg))]"
        onClick={onClose}
      >
        <LogOutIcon width={18} height={18} /> Sign out
      </button>
    </>
  );
}

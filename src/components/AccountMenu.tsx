'use client';

import type { ReactNode } from 'react';
import { Popover } from './Popover';
import { LogOutIcon } from './icons';

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

/** Menu body (email label + sign out) — shared by the desktop popover and the
 *  mobile prefs sheet's account footer. */
export function AccountMenuBody({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="truncate px-2.5 py-2 font-mono text-xs text-secondary">
        {MOCK_USER_EMAIL}
      </div>
      <div className="my-1 h-px bg-border" aria-hidden="true" />
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

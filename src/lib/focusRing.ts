/**
 * Input-modality tracking for programmatic focus.
 *
 * Browsers show `:focus-visible` whenever focus is moved by SCRIPT, even
 * mid-mouse-flow — so a11y focus management (popover focus-return, dialog
 * auto-focus) leaves stray focus rings after clicks. `focusQuietly` keeps the
 * focus move (keyboard users still land in the right place and rings still
 * show for them) but suppresses the ring when the user's last input was a
 * pointer, via a one-shot data attribute paired with the
 * `[data-focus-quiet]:focus-visible` rule in globals.css.
 */

// Pointer until proven keyboard — rings only appear once keys are in play.
let lastKeyboard = false;

if (typeof window !== 'undefined') {
  // Capture phase so no component can stopPropagation these away.
  window.addEventListener('keydown', () => { lastKeyboard = true; }, true);
  window.addEventListener('pointerdown', () => { lastKeyboard = false; }, true);
}

export const lastInputWasKeyboard = (): boolean => lastKeyboard;

/**
 * Focus an element; show the ring only if the user is keyboard-driving.
 * The suppression attribute clears itself on blur, so the SAME element gets
 * its ring back the next time it's focused via keyboard.
 */
export function focusQuietly(el: HTMLElement | null | undefined): void {
  if (!el) return;
  el.focus({ preventScroll: true });
  if (!lastKeyboard) {
    el.setAttribute('data-focus-quiet', '');
    el.addEventListener('blur', () => el.removeAttribute('data-focus-quiet'), { once: true });
  }
}

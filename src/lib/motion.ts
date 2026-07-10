// Shared easing curves for motion (JS arrays mirroring the CSS tokens in
// tokens.css — motion needs literal arrays, not var() references).
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const; // --ease-out-expo / --spring
export const EASE_SPRING_OUT = [0.34, 1.56, 0.64, 1] as const; // springy overshoot (popovers, toolbar)

// Shared popover open/close motion (the chapter-indicator spring). Module-level
// so every consumer passes the same stable objects to motion.
export const POPOVER_ENTER = { opacity: 0, scale: 0.94, y: -6 };
export const POPOVER_VISIBLE = { opacity: 1, scale: 1, y: 0 };
export const POPOVER_EXIT = {
  opacity: 0,
  scale: 0.98,
  y: -4,
  transition: { duration: 0.16, ease: 'easeIn' as const },
};
export const POPOVER_TRANSITION = { duration: 0.26, ease: EASE_SPRING_OUT };

// Shared easing curves for motion (JS arrays mirroring the CSS tokens in
// tokens.css — motion needs literal arrays, not var() references).
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const; // --ease-out-expo / --spring
export const EASE_SPRING_OUT = [0.34, 1.56, 0.64, 1] as const; // springy overshoot (popovers, toolbar)

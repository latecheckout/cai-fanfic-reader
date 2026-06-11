import { useSyncExternalStore } from 'react';

type SiteMode = 'text' | 'visual';
interface ModeState { switching: boolean; mode: SiteMode }

/**
 * Shared store for the global visual/text mode + a brief `switching` window
 * after each toggle (drives the home rails' skeleton flash, like BrowseShell's
 * view-switch). A single `cai-mode-change` listener + timer is shared across
 * every consumer (see `client-event-listeners`), via useSyncExternalStore.
 */
const SERVER_STATE: ModeState = { switching: false, mode: 'visual' };
const SWITCH_MS = 450;

let state: ModeState = SERVER_STATE;
let timer: ReturnType<typeof setTimeout> | null = null;
let started = false;
const listeners = new Set<() => void>();

function set(next: Partial<ModeState>) {
  state = { ...state, ...next };
  for (const fn of listeners) fn();
}

function onSwitch(e: Event) {
  const next = (e as CustomEvent).detail?.mode as SiteMode | undefined;
  if (timer) clearTimeout(timer);
  set({ switching: true, mode: next === 'text' ? 'text' : next === 'visual' ? 'visual' : state.mode });
  timer = setTimeout(() => set({ switching: false }), SWITCH_MS);
}

function subscribe(cb: () => void) {
  if (!started && typeof window !== 'undefined') {
    started = true;
    state = { switching: false, mode: localStorage.getItem('cai_site_mode') === 'text' ? 'text' : 'visual' };
    window.addEventListener('cai-mode-change', onSwitch);
  }
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function useModeSwitch(): ModeState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

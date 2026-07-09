'use client';

import { useCallback, useEffect, useState } from 'react';
import { Preset, loadPresets, savePresetsToStorage } from '@/lib/filterParams';

/**
 * Saved-filter preset state + persistence, pulled out of FilterPanel.
 *
 * Owns: the presets array (loaded from localStorage on mount), the add / delete
 * / update actions (each persists to storage), and the "saved" toast + its
 * timer. Navigation (router.push with the `preset` param) stays in FilterPanel
 * — this hook is state + persistence only.
 *
 * All mutations use functional setState (`rerender-functional-setstate`) so the
 * returned callbacks are stable and don't depend on the current presets array.
 */
export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load presets from localStorage on mount.
  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const addPreset = useCallback((preset: Preset) => {
    setPresets((prev) => {
      const next = [...prev, preset];
      savePresetsToStorage(next);
      return next;
    });
  }, []);

  const deletePreset = useCallback((idx: number) => {
    setPresets((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      savePresetsToStorage(next);
      return next;
    });
  }, []);

  const updatePreset = useCallback((name: string, params: string) => {
    setPresets((prev) => {
      const idx = prev.findIndex((p) => p.name === name);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], params };
      savePresetsToStorage(next);
      return next;
    });
  }, []);

  // Matches the original inline pattern exactly (plain timeout, no clearing).
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  return { presets, addPreset, deletePreset, updatePreset, toastMessage, showToast };
}

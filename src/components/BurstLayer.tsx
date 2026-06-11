'use client';

import { useEffect } from 'react';
import { startBurstLayer } from '@/lib/burst';

/**
 * Arms the mode-switch particle burst. Renders nothing — it just wires the
 * `cai-mode-change` listener that detonates every visible card on a flip.
 * Mount once (next to the AO4 turbo toggle in BrowseHeader).
 */
export function BurstLayer() {
  useEffect(() => startBurstLayer(), []);
  return null;
}

'use client';

import { Agentation } from 'agentation';

/**
 * Dev-only visual feedback overlay (agentation). Renders a bottom-right
 * toolbar: click any element to annotate it, then copy structured markdown
 * (selectors, paths, component tree, feedback) to hand to a coding agent.
 *
 * Mounted in the root layout behind a NODE_ENV check, so it is stripped
 * from production builds. Dev tool only, never shipped to users.
 */
export function DevAnnotation() {
  return <Agentation />;
}

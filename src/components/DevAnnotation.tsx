'use client';

import dynamic from 'next/dynamic';

/**
 * Dev-only visual feedback overlay (agentation). Renders a bottom-right
 * toolbar: click any element to annotate it, then copy structured markdown
 * (selectors, paths, component tree, feedback) to hand to a coding agent.
 *
 * The import lives behind a statically-false branch in production so the
 * bundler PROVABLY drops `agentation` (a devDependency) from prod chunks —
 * a plain top-level import only left dead-code elimination to chance.
 * Mounted in the root layout behind the same NODE_ENV check.
 */
const Agentation =
  process.env.NODE_ENV !== 'production'
    ? dynamic(() => import('agentation').then((m) => m.Agentation), { ssr: false })
    : null;

export function DevAnnotation() {
  return Agentation ? <Agentation /> : null;
}

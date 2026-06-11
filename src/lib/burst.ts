/**
 * Sci-fi disintegration burst for the mode switch. When the cards flip, every
 * visible card detonates into a dense field of glowing, grid-snapped pixel
 * blocks that accelerate outward and trail away — a voxel/particle-accelerator
 * dissolve, not soft confetti.
 *
 * Hand-rolled canvas engine (no library does this):
 *   - one shared fullscreen canvas, lazily created on first burst
 *   - additive blending (`lighter`) so dense overlaps blow out to white-hot
 *   - hard-edged SQUARES drawn with fillRect, positions snapped to a pixel grid
 *     for the blocky sci-fi look; a faint larger block behind each gives glow
 *   - per-frame `destination-out` fade leaves motion-blur trails (the streaks)
 *   - blocks spawn across the WHOLE card rect and fly out fast with low damping,
 *     so the card reads as accelerating apart
 *
 * Driven by the global `cai-mode-change` event: on each flip it bursts every
 * visible `[data-flip-card]` on screen. Mount <BurstLayer/> once to arm it.
 */

// 'r,g,b' halo colours — high saturation, on-brand + white cores + a sci-fi cyan.
const COLORS: ReadonlyArray<string> = [
  '255,255,255', // white-hot (listed twice → weighted toward bright cores)
  '255,255,255',
  '255,45,183', // hot pink
  '217,0,130', // magenta
  '174,0,217', // violet
  '120,210,255', // cyan accent
];

const MAX_PARTICLES = 2600;
const MODE_EVENT = 'cai-mode-change';

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number; // block edge in device px (multiple of the pixel grid)
  color: string; // 'r,g,b'
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let dpr = 1;
let px = 4; // pixel-grid step in device px
let particles: P[] = [];
let raf = 0;
let running = false;
let armed = false;

function resize() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  px = Math.round(4 * dpr);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
}

function ensure() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const st = canvas.style;
  st.position = 'fixed';
  st.left = '0';
  st.top = '0';
  st.width = '100%';
  st.height = '100%';
  st.pointerEvents = 'none';
  st.zIndex = '9999';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize, { passive: true });
}

function tick() {
  if (!ctx || !canvas) {
    running = false;
    return;
  }
  const w = canvas.width;
  const h = canvas.height;

  // Fade prior frame toward transparent → glowing trails; overlay stays clear.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(0, 0, w, h);

  // Additive so dense blocks bloom to white.
  ctx.globalCompositeOperation = 'lighter';

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= 1;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.vx *= 0.93;
    p.vy *= 0.93;
    p.vy += 0.05 * dpr; // gentle gravity
    p.x += p.vx;
    p.y += p.vy;

    const t = p.life / p.maxLife; // 1 → 0
    const a = Math.min(1, t * 1.6);
    const s = p.size * (0.5 + t * 0.5);
    // Snap to the pixel grid → blocky, aligned fragments.
    const gx = Math.floor(p.x / px) * px;
    const gy = Math.floor(p.y / px) * px;

    // Soft glow block behind.
    ctx.globalAlpha = a * 0.22;
    ctx.fillStyle = `rgb(${p.color})`;
    ctx.fillRect(gx - s, gy - s, s * 3, s * 3);
    // Crisp core block.
    ctx.globalAlpha = a;
    ctx.fillRect(gx, gy, s, s);
  }

  ctx.globalAlpha = 1;

  if (particles.length > 0) {
    raf = requestAnimationFrame(tick);
  } else {
    running = false;
    ctx.clearRect(0, 0, w, h);
  }
}

/** Detonate a blocky ember field across a screen rect (viewport coords). */
export function burstFromRect(rect: DOMRect): void {
  if (typeof window === 'undefined') return;
  if (rect.width === 0 || rect.height === 0) return; // hidden (e.g. the other mode's card)
  if (
    rect.bottom < 0 ||
    rect.top > window.innerHeight ||
    rect.right < 0 ||
    rect.left > window.innerWidth
  ) {
    return;
  }

  ensure();
  if (!ctx) return;

  // Dense — scale with card area, capped.
  const area = rect.width * rect.height;
  const count = Math.max(80, Math.min(220, Math.round(area / 380)));

  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    // Spawn across the whole card so it disintegrates as a body.
    const sx = (rect.left + Math.random() * rect.width) * dpr;
    const sy = (rect.top + Math.random() * rect.height) * dpr;
    const angle = Math.random() * Math.PI * 2;
    const speed = (3 + Math.random() * 9) * dpr; // fast → reads as acceleration
    const maxLife = 24 + Math.random() * 34; // frames (~0.4–1s)
    const blocks = 1 + ((Math.random() * 4) | 0); // 1–4 grid cells
    particles.push({
      x: sx,
      y: sy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2 * dpr, // slight upward bias
      life: maxLife,
      maxLife,
      size: px * blocks,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    });
  }

  if (!running) {
    running = true;
    raf = requestAnimationFrame(tick);
  }
}

function onModeChange() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Burst every visible card on screen. The hidden (other-mode) duplicate cards
  // report a zero rect and are skipped inside burstFromRect.
  const cards = document.querySelectorAll<HTMLElement>('[data-flip-card]');
  cards.forEach((el) => burstFromRect(el.getBoundingClientRect()));
}

/** Arm the burst layer: bursts every visible card on each mode flip. Idempotent;
 *  returns a cleanup that disarms it. Mount via <BurstLayer/>. */
export function startBurstLayer(): () => void {
  if (typeof window === 'undefined' || armed) return () => {};
  armed = true;
  window.addEventListener(MODE_EVENT, onModeChange);
  return () => {
    armed = false;
    window.removeEventListener(MODE_EVENT, onModeChange);
  };
}

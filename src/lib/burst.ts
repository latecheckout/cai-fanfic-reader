/**
 * Cute "burst into glowing hearts & stars" effect for the mode switch. When the
 * cards flip, each visible card pops a white-blue flash and sprays a handful of
 * chunky glowing stars and hearts that pop in, drift up, rotate and fade.
 *
 * Hand-rolled canvas engine (no dependency):
 *   - one shared fullscreen canvas, lazily created on first burst
 *   - pre-rendered shape sprites (5-point puffy star, heart, sparkle dot) with
 *     bloom baked in via shadowBlur — drawn with drawImage so it stays cheap
 *   - shapes render normally (crisp, with halos); the center flash is additive
 *   - per card: one expanding flash + a spray of shapes spawned across its rect
 *
 * Driven by the global `cai-mode-change` event: each flip bursts every visible
 * `[data-flip-card]` on screen. Mount <BurstLayer/> once to arm it.
 */

const MAX_PARTICLES = 700;
const MODE_EVENT = 'cai-mode-change';
const SPRITE_SIZE = 120;

type Kind = 'star' | 'heart' | 'heart2' | 'dot';

interface SpriteDef {
  kind: Kind;
  fill: string;
  glow: string;
  weight: number;
}

// Playful palette: yellow stars, mint + pink hearts, white sparkle dots.
const SPRITE_DEFS: SpriteDef[] = [
  { kind: 'star', fill: '#ffe14d', glow: '#ffcc00', weight: 4 },
  { kind: 'heart', fill: '#8effa6', glow: '#2fe068', weight: 3 },
  { kind: 'heart2', fill: '#ff8fd0', glow: '#ff2fae', weight: 3 },
  { kind: 'dot', fill: '#ffffff', glow: '#bfe0ff', weight: 1 },
];

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  life: number;
  maxLife: number;
  size: number; // drawImage edge in device px
  sprite: number; // index into `sprites` (or -1 for flash)
  flash?: boolean;
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let dpr = 1;
let sprites: HTMLCanvasElement[] = [];
let flashSprite: HTMLCanvasElement | null = null;
let weighted: number[] = []; // sprite index per weight slot
let particles: P[] = [];
let raf = 0;
let running = false;
let armed = false;

function starPath(c: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const inner = r * 0.5;
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.closePath();
}

function heartPath(c: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const top = cy - s * 0.35;
  c.beginPath();
  c.moveTo(cx, cy + s * 0.95);
  c.bezierCurveTo(cx + s * 1.35, cy - s * 0.1, cx + s * 0.55, top - s * 0.95, cx, top + s * 0.05);
  c.bezierCurveTo(cx - s * 0.55, top - s * 0.95, cx - s * 1.35, cy - s * 0.1, cx, cy + s * 0.95);
  c.closePath();
}

function buildSprites() {
  if (sprites.length) return;
  sprites = SPRITE_DEFS.map((def) => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = SPRITE_SIZE;
    const c = cv.getContext('2d')!;
    const m = SPRITE_SIZE / 2;
    const r = SPRITE_SIZE * 0.22;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.shadowColor = def.glow;
    c.shadowBlur = SPRITE_SIZE * 0.26;
    c.fillStyle = def.fill;
    c.strokeStyle = def.fill;
    // Draw twice → richer bloom.
    for (let k = 0; k < 2; k++) {
      if (def.kind === 'star') {
        starPath(c, m, m, r);
        c.lineWidth = r * 0.55; // round the points (puffy star)
        c.stroke();
        c.fill();
      } else if (def.kind === 'dot') {
        c.beginPath();
        c.arc(m, m, r * 0.5, 0, Math.PI * 2);
        c.fill();
      } else {
        heartPath(c, m, m, r * 0.92);
        c.fill();
      }
    }
    // Bright white inner highlight (the hot center).
    c.shadowBlur = 0;
    c.globalAlpha = 0.6;
    c.fillStyle = '#ffffff';
    if (def.kind === 'star') {
      starPath(c, m, m, r * 0.55);
      c.fill();
    } else if (def.kind === 'heart' || def.kind === 'heart2') {
      heartPath(c, m, m, r * 0.5);
      c.fill();
    } else {
      c.beginPath();
      c.arc(m, m, r * 0.28, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    return cv;
  });

  weighted = [];
  SPRITE_DEFS.forEach((d, i) => {
    for (let n = 0; n < d.weight; n++) weighted.push(i);
  });

  // Center flash: white core → blue → transparent.
  const fv = document.createElement('canvas');
  fv.width = fv.height = SPRITE_SIZE;
  const fc = fv.getContext('2d')!;
  const fm = SPRITE_SIZE / 2;
  const grad = fc.createRadialGradient(fm, fm, 0, fm, fm, fm);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(210,235,255,0.9)');
  grad.addColorStop(0.6, 'rgba(90,150,255,0.5)');
  grad.addColorStop(1, 'rgba(90,150,255,0)');
  fc.fillStyle = grad;
  fc.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  flashSprite = fv;
}

function resize() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
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
  buildSprites();
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
  ctx.clearRect(0, 0, w, h);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= 1;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.vy += 0.015 * dpr; // barely any gravity → buoyant float
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.spin;

    const t = p.life / p.maxLife; // 1 → 0
    const age = p.maxLife - p.life;

    if (p.flash) {
      // Expanding additive bloom that fades fast.
      const scale = 0.4 + (1 - t) * 1.3;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = t;
      const d = p.size * scale;
      ctx.drawImage(flashSprite!, p.x - d / 2, p.y - d / 2, d, d);
      continue;
    }

    // Pop-in over the first ~5 frames, gentle settle, fade out in the last 35%.
    const pop = age < 5 ? 0.25 + 0.75 * (age / 5) : 1;
    const overshoot = age < 9 ? 1 + 0.12 * Math.sin((age / 9) * Math.PI) : 1;
    const scale = pop * overshoot;
    const alpha = Math.min(1, p.life / (p.maxLife * 0.35));

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = alpha;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const d = p.size * scale;
    ctx.drawImage(sprites[p.sprite], -d / 2, -d / 2, d, d);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  if (particles.length > 0) {
    raf = requestAnimationFrame(tick);
  } else {
    running = false;
    ctx.clearRect(0, 0, w, h);
  }
}

/** Pop a flash + a spray of glowing hearts/stars across a screen rect. */
export function burstFromRect(rect: DOMRect): void {
  if (typeof window === 'undefined') return;
  if (rect.width === 0 || rect.height === 0) return; // hidden (other-mode card)
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

  const cx = (rect.left + rect.width / 2) * dpr;
  const cy = (rect.top + rect.height / 2) * dpr;

  // Center bloom flash, sized to the card.
  particles.push({
    x: cx,
    y: cy,
    vx: 0,
    vy: 0,
    rot: 0,
    spin: 0,
    life: 16,
    maxLife: 16,
    size: Math.min(rect.width, rect.height) * 1.4 * dpr,
    sprite: -1,
    flash: true,
  });

  // A handful of chunky shapes spawned across the card.
  const area = rect.width * rect.height;
  const count = Math.max(8, Math.min(22, Math.round(area / 4500)));
  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    const sx = (rect.left + Math.random() * rect.width) * dpr;
    const sy = (rect.top + Math.random() * rect.height) * dpr;
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.6 + Math.random() * 2.6) * dpr;
    const maxLife = 48 + Math.random() * 40; // ~0.8–1.5s, floaty
    particles.push({
      x: sx,
      y: sy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (0.6 + Math.random() * 1.2) * dpr, // float up
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.12,
      life: maxLife,
      maxLife,
      size: (46 + Math.random() * 50) * dpr,
      sprite: weighted[(Math.random() * weighted.length) | 0],
    });
  }

  if (!running) {
    running = true;
    raf = requestAnimationFrame(tick);
  }
}

function onModeChange() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import Delaunator from 'delaunator'
import { gsap } from '@/animations/motion/gsap'
import { stepAt, type DemoProps } from './demoTypes'

/**
 * §14 Image AI — TEXT → GEOMETRIC PARTICLES → IMAGE FORMATION → VARIATIONS.
 * A sentence is typed; its letters dissolve into triangles; the triangles settle into a
 * low-poly mosaic of a glass pavilion at dusk; a smooth vector render crossfades in beneath;
 * then four variations of the same prompt appear. No raster assets: SVG + DOM only.
 */

const PROMPT = 'A glass pavilion at dusk, low-poly, warm light inside.'

const CHIPS: readonly [string, string][] = [
  ['subject', 'glass pavilion'],
  ['time', 'dusk'],
  ['style', 'low-poly'],
  ['light', 'warm, inside'],
]

/* ---------- scene geometry (one 640 × 400 canvas, shared by mosaic, render and guides) ---------- */
const W = 640
const H = 400
const HORIZON = 250
const BOX = { x1: 212, y1: 196, x2: 428, y2: 286 }
const ROOF = { x1: 190, y1: 186, x2: 450, y2: 198 }
const HILLS: readonly [number, number][] = [
  [0, 236],
  [70, 222],
  [150, 232],
  [230, 214],
  [330, 226],
  [430, 210],
  [520, 228],
  [600, 216],
  [640, 232],
]
const HILLS_POLY = `${HILLS.map(([x, y]) => `${x},${y}`).join(' ')} ${W},${HORIZON} 0,${HORIZON}`
const HILLS_PATH = `M${HILLS.map(([x, y]) => `${x} ${y}`).join('L')}`
const PAVILION_PATH = `M${ROOF.x1} ${ROOF.y1}H${ROOF.x2}V${ROOF.y2}H${BOX.x2}V${BOX.y2}H${BOX.x1}V${ROOF.y2}H${ROOF.x1}Z`

function hillsY(x: number): number {
  for (let i = 1; i < HILLS.length; i++) {
    const [x0, y0] = HILLS[i - 1]
    const [x1, y1] = HILLS[i]
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
  }
  return HILLS[HILLS.length - 1][1]
}

/* ---------- palettes: graphite ground, muted dusk sky, the world hue as the only warm accent ---------- */
type Palette = {
  skyTop: string
  skyMid: string
  horizon: string
  hills: string
  ground: string
  reflect: string
  glass: string
  glow: string
  glowHot: string
  roof: string
  floor: string
  frame: string
  bench: string
}
const DUSK: Palette = {
  skyTop: '#13162a',
  skyMid: '#2f3149',
  horizon: '#6f4f47',
  hills: '#191b28',
  ground: '#0c0d12',
  reflect: '#3d2b1c',
  glass: '#2e2a30',
  glow: '#e0923a',
  glowHot: '#f3cf95',
  roof: '#0a0b0e',
  floor: '#121318',
  frame: '#0a0b0e',
  bench: '#1b1510',
}
const DAWN: Palette = {
  skyTop: '#2f3444',
  skyMid: '#6f7686',
  horizon: '#cdb094',
  hills: '#454c5a',
  ground: '#20242c',
  reflect: '#5c4d3c',
  glass: '#5f6168',
  glow: '#d9b26a',
  glowHot: '#f1dcb0',
  roof: '#1d1f26',
  floor: '#2a2d35',
  frame: '#1d1f26',
  bench: '#2a241e',
}
const SNOW: Palette = {
  skyTop: '#59616e',
  skyMid: '#9aa3af',
  horizon: '#d8dbe0',
  hills: '#b3bac4',
  ground: '#e0e3e7',
  reflect: '#e9c89a',
  glass: '#4d535c',
  glow: '#e0923a',
  glowHot: '#f6d7a7',
  roof: '#1b1d23',
  floor: '#c9cdd3',
  frame: '#1b1d23',
  bench: '#2a241e',
}
const INTERIOR = {
  wall: '#1c1712',
  ceiling: '#110e0b',
  floor: '#2a2019',
  skyTop: '#14172a',
  skyMid: '#30324a',
  horizon: '#5f4740',
  hills: '#1c1e2a',
  ground: '#0f1016',
  glow: '#e0923a',
  glowHot: '#f6d7a7',
  frame: '#0a0b0e',
  table: '#15110d',
}

const vars = (p: Record<string, string>): CSSProperties => {
  const out: Record<string, string> = {}
  for (const k of Object.keys(p)) out[`--p-${k}`] = p[k]
  return out as CSSProperties
}
const v = (k: string) => `var(--p-${k})`

const VARIANTS = [
  { name: 'Dusk', symbol: 'imgd-pav', style: vars(DUSK) },
  { name: 'Dawn', symbol: 'imgd-pav', style: vars(DAWN) },
  { name: 'Snow', symbol: 'imgd-pav', style: vars(SNOW) },
  { name: 'Interior', symbol: 'imgd-int', style: vars(INTERIOR) },
] as const

/* ---------- colour helpers ---------- */
const toRgb = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
const hex2 = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0')
function mix(a: string, b: string, t: number): string {
  const A = toRgb(a)
  const B = toRgb(b)
  const k = Math.min(1, Math.max(0, t))
  return `#${hex2(A[0] + (B[0] - A[0]) * k)}${hex2(A[1] + (B[1] - A[1]) * k)}${hex2(A[2] + (B[2] - A[2]) * k)}`
}

/** Colour of the dusk scene at (x, y): the same regions the vector render draws, so the crossfade is coherent. */
function sceneColor(x: number, y: number, p: Palette, jitter: number): string {
  let c: string
  if (x >= ROOF.x1 && x <= ROOF.x2 && y >= ROOF.y1 && y <= ROOF.y2) c = p.roof
  else if (x >= BOX.x1 && x <= BOX.x2 && y >= BOX.y1 && y <= BOX.y2) {
    const k = Math.exp(-(((x - 320) / 100) ** 2 + ((y - 246) / 50) ** 2))
    c = mix(mix(p.glass, p.glow, Math.min(1, k * 1.3)), p.glowHot, k * k)
  } else if (y < HORIZON) {
    if (y > hillsY(x)) c = p.hills
    else {
      const t = y / HORIZON
      c = mix(mix(p.skyTop, p.skyMid, t), p.horizon, t ** 4 * 0.9)
    }
  } else {
    const g = Math.exp(-(((x - 320) / 190) ** 2 + ((y - 300) / 50) ** 2))
    c = mix(p.ground, p.reflect, g)
  }
  return mix(c, jitter > 0 ? '#ffffff' : '#000000', Math.abs(jitter))
}

/* ---------- deterministic mesh: jittered grid + points on the pavilion edges (the "edges + luminance" sampling) ---------- */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Tri {
  points: string
  fill: string
  sx: number
  sy: number
  sr: number
  ss: number
}

function buildMesh(): Tri[] {
  const rnd = mulberry32(14)
  const pts: [number, number][] = []
  const COLS = 7
  const ROWS = 4
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let x = (c / (COLS - 1)) * W
      let y = (r / (ROWS - 1)) * H
      if (c > 0 && c < COLS - 1) x += (rnd() - 0.5) * 60
      if (r > 0 && r < ROWS - 1) y += (rnd() - 0.5) * 60
      pts.push([x, y])
    }
  }
  const key: [number, number][] = [
    [ROOF.x1, ROOF.y1],
    [ROOF.x2, ROOF.y1],
    [ROOF.x1, ROOF.y2],
    [ROOF.x2, ROOF.y2],
    [BOX.x1, BOX.y2],
    [BOX.x2, BOX.y2],
    [320, 246],
    [196, 293],
    [444, 293],
    [70, 222],
    [230, 214],
    [430, 210],
    [600, 216],
    [100, HORIZON],
    [540, HORIZON],
  ]
  pts.push(...key)
  const d = Delaunator.from(pts)
  const tris: Tri[] = []
  for (let i = 0; i < d.triangles.length; i += 3) {
    const a = pts[d.triangles[i]]
    const b = pts[d.triangles[i + 1]]
    const c = pts[d.triangles[i + 2]]
    const cx = (a[0] + b[0] + c[0]) / 3
    const cy = (a[1] + b[1] + c[1]) / 3
    tris.push({
      points: `${a[0].toFixed(1)},${a[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`,
      fill: sceneColor(cx, cy, DUSK, (rnd() - 0.5) * 0.12),
      sx: (rnd() - 0.5) * 420,
      sy: (rnd() - 0.5) * 260,
      sr: (rnd() - 0.5) * 300,
      ss: 0.28 + rnd() * 0.5,
    })
  }
  // shuffle so a 'start' stagger reads as a random scatter
  for (let i = tris.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[tris[i], tris[j]] = [tris[j], tris[i]]
  }
  return tris
}

const TRIS = buildMesh()
const N = TRIS.length

/* per-letter scatter offsets (deterministic); words stay unbreakable, letters are the particles */
const WORDS = PROMPT.split(' ')
const LETTER_COUNT = WORDS.reduce((n, w) => n + w.length, 0)
const letterRnd = mulberry32(7)
const LETTER_SCATTER = Array.from({ length: LETTER_COUNT }, () => ({
  x: 60 + letterRnd() * 220,
  y: -50 + letterRnd() * 130,
  r: (letterRnd() - 0.5) * 240,
}))

const STATUS = [
  'Reading the sentence. Four attributes found.',
  `The letters become ${N} triangles, scattered over the canvas.`,
  'Triangles settle on edges and light. One image, ready.',
  'Four directions from one prompt. Pick one, or refine the sentence.',
]

const CAPTIONS = ['canvas · empty', `${N} triangles · scattered`, null, '4 variations · same prompt']

export default function ImageDemo({ tl, reduced, ready }: DemoProps) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      const ft = (
        targets: gsap.TweenTarget,
        from: gsap.TweenVars,
        to: gsap.TweenVars,
        at: number,
        first = false,
      ) => tl.fromTo(targets, from, { ease: 'none', overwrite: false, immediateRender: first, ...to }, at)

      const chars = q<HTMLElement>('.imgd-ch')
      const tris = q<SVGPolygonElement>('.imgd-tri')
      const status = q<HTMLElement>('.imgd-status')
      const captions = q<HTMLElement>('.imgd-cap')
      const guides = q<SVGPathElement>('.imgd-guide path')
      const tiles = q<HTMLElement>('.imgd-tile')
      const countEl = q<HTMLElement>('.imgd-count')[0]

      /* ---- step 0 · TEXT: the sentence types; four attributes are read from it ---- */
      const s0 = stepAt(0)
      ft(status[0], { opacity: 0 }, { opacity: 1, duration: 0.2 }, s0, true)
      ft(captions[0], { opacity: 0 }, { opacity: 1, duration: 0.2 }, s0, true)
      ft(chars, { opacity: 0 }, { opacity: 1, duration: 0.03, stagger: 0.6 / LETTER_COUNT }, s0 + 0.02, true)
      ft(q('.imgd-caret-wrap'), { opacity: 0 }, { opacity: 1, duration: 0.05 }, s0 + 0.66, true)
      ft(q('.imgd-chip'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.14, stagger: 0.06 }, s0 + 0.68, true)
      if (!reduced) {
        gsap.to(q('.imgd-caret'), { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)', overwrite: false })
      }

      /* ---- step 1 · GEOMETRIC PARTICLES: letters dissolve, triangles scatter, target edges are sampled ---- */
      const s1 = stepAt(1)
      ft(status[0], { opacity: 1 }, { opacity: 0, duration: 0.15 }, s1)
      ft(status[1], { opacity: 0 }, { opacity: 1, duration: 0.2 }, s1 + 0.1, true)
      ft(captions[0], { opacity: 1 }, { opacity: 0, duration: 0.15 }, s1)
      ft(captions[1], { opacity: 0 }, { opacity: 1, duration: 0.2 }, s1 + 0.1, true)
      ft(q('.imgd-caret-wrap'), { opacity: 1 }, { opacity: 0, duration: 0.1 }, s1)
      ft(q('.imgd-empty'), { opacity: 1 }, { opacity: 0, duration: 0.2 }, s1, true)
      ft(
        chars,
        { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 },
        {
          x: (i: number) => LETTER_SCATTER[i].x,
          y: (i: number) => LETTER_SCATTER[i].y,
          rotation: (i: number) => LETTER_SCATTER[i].r,
          scale: 0.3,
          opacity: 0,
          duration: 0.4,
          stagger: 0.2 / LETTER_COUNT,
        },
        s1,
      )
      ft(q('.imgd-quote'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, s1 + 0.55, true)
      ft(
        tris,
        {
          opacity: 0,
          x: (i: number) => TRIS[i].sx,
          y: (i: number) => TRIS[i].sy,
          rotation: (i: number) => TRIS[i].sr,
          scale: (i: number) => TRIS[i].ss,
          transformOrigin: '50% 50%',
        },
        { opacity: 0.8, duration: 0.3, stagger: 0.35 / N },
        s1 + 0.12,
        true,
      )
      guides.forEach((g) => {
        const len = g.getTotalLength()
        gsap.set(g, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.85 })
        ft(g, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.35 }, s1 + 0.5, true)
      })

      /* ---- step 2 · IMAGE FORMATION: triangles converge onto the sampled positions; the render crossfades in beneath ---- */
      const s2 = stepAt(2)
      ft(status[1], { opacity: 1 }, { opacity: 0, duration: 0.15 }, s2)
      ft(status[2], { opacity: 0 }, { opacity: 1, duration: 0.2 }, s2 + 0.1, true)
      ft(captions[1], { opacity: 1 }, { opacity: 0, duration: 0.15 }, s2)
      ft(captions[2], { opacity: 0 }, { opacity: 1, duration: 0.2 }, s2 + 0.1, true)
      ft(
        tris,
        {
          opacity: 0.8,
          x: (i: number) => TRIS[i].sx,
          y: (i: number) => TRIS[i].sy,
          rotation: (i: number) => TRIS[i].sr,
          scale: (i: number) => TRIS[i].ss,
        },
        { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.45, stagger: 0.25 / N, ease: 'power2.out' },
        s2,
      )
      const counter = { n: 0 }
      tl.fromTo(
        counter,
        { n: 0 },
        {
          n: N,
          duration: 0.7,
          ease: 'none',
          overwrite: false,
          immediateRender: true,
          onUpdate: () => {
            if (countEl) countEl.textContent = String(Math.round(counter.n))
          },
        },
        s2,
      )
      ft(q('.imgd-bar'), { width: '0%' }, { width: '100%', duration: 0.7 }, s2, true)
      ft(guides, { opacity: 0.85 }, { opacity: 0, duration: 0.25 }, s2 + 0.45)
      ft(q('.imgd-render'), { opacity: 0 }, { opacity: 1, duration: 0.35 }, s2 + 0.6, true)
      ft(tris, { opacity: 1 }, { opacity: 0, duration: 0.3 }, s2 + 0.65)

      /* ---- step 3 · VARIATIONS: the image steps back into a 2 × 2 of directions, each revealed by a faceted wipe ---- */
      const s3 = stepAt(3)
      ft(status[2], { opacity: 1 }, { opacity: 0, duration: 0.15 }, s3)
      ft(status[3], { opacity: 0 }, { opacity: 1, duration: 0.2 }, s3 + 0.1, true)
      ft(captions[2], { opacity: 1 }, { opacity: 0, duration: 0.15 }, s3)
      ft(captions[3], { opacity: 0 }, { opacity: 1, duration: 0.2 }, s3 + 0.1, true)
      ft(q('.imgd-gallery'), { opacity: 0 }, { opacity: 1, duration: 0.12 }, s3, true)
      ft(
        q('.imgd-main'),
        { scale: 1, opacity: 1, transformOrigin: '0 0' },
        { scale: 0.5, opacity: 0, duration: 0.35, ease: 'power2.inOut' },
        s3 + 0.02,
        true,
      )
      ft(
        tiles,
        { clipPath: 'polygon(0 0, -28% 0, -8% 50%, -28% 100%, 0 100%)' },
        { clipPath: 'polygon(0 0, 128% 0, 148% 50%, 128% 100%, 0 100%)', duration: 0.3, stagger: 0.17 },
        s3 + 0.04,
        true,
      )
      ft(q('.imgd-cross'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, s3 + 0.35, true)
      ft(q('.imgd-dots'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, s3 + 0.5, true)
      ft(q('.imgd-sel'), { opacity: 0 }, { opacity: 1, duration: 0.15 }, s3 + 0.72, true)

      // a rebuild (StrictMode's double effect, a motion-preference change) can happen with the playhead
      // already moved; seeking to the same time is a no-op in GSAP, so re-sync the DOM to it explicitly
      const now = tl.totalTime()
      if (now > 0) tl.render(now, false, true)
    }, el)
    ready()
    return () => ctx.revert()
  }, [tl, ready, reduced])

  return (
    <div
      ref={root}
      className="flex h-full flex-col gap-4 overflow-hidden px-0.5 md:h-[472px] md:flex-row md:gap-5"
      aria-label="Image AI demonstration: a sentence is typed, its letters become triangles, the triangles settle into a picture of a glass pavilion at dusk, then four variations of the same prompt appear."
    >
      {/* ---------- left: prompt, what was understood, status ---------- */}
      <div className="flex flex-col gap-3 md:h-full md:w-[272px] md:shrink-0">
        <span className="label">Prompt</span>
        <div className="panel relative p-3">
          <p className="imgd-prompt m-0 font-display text-[15px] leading-[1.45] text-mist">
            {WORDS.map((word, wi) => (
              <span key={wi}>
                {wi > 0 && ' '}
                <span className="inline-block whitespace-nowrap">
                  {word.split('').map((c, ci) => (
                    <span key={ci} className="imgd-ch inline-block">
                      {c}
                    </span>
                  ))}
                  {wi === WORDS.length - 1 && (
                    <span className="imgd-caret-wrap inline-block align-[-2px]">
                      <span className="imgd-caret inline-block h-[15px] w-[2px]" style={{ background: 'var(--world-create)' }} />
                    </span>
                  )}
                </span>
              </span>
            ))}
          </p>
          <p className="imgd-quote mono absolute inset-x-3 top-3 m-0 leading-[1.5] text-mist-60" aria-hidden="true">
            “{PROMPT}”
          </p>
        </div>
        <div className="mt-1">
          <span className="label mb-1.5 block">Understood</span>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {CHIPS.map(([k, val]) => (
              <li key={k} className="imgd-chip mono flex items-center gap-2 text-mist">
                <span className="h-[6px] w-[6px] shrink-0 rotate-45" style={{ background: 'var(--world-create)' }} aria-hidden="true" />
                <span className="text-mist-40">{k}</span>
                <span>{val}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:mt-auto">
          <span className="label mb-1.5 block">Status</span>
          <div className="relative h-[36px]" aria-live="polite">
            {STATUS.map((s, i) => (
              <p key={i} className="imgd-status mono absolute inset-x-0 top-0 m-0 leading-[1.5] text-mist-60">
                {s}
              </p>
            ))}
          </div>
          <div className="mt-2 h-px w-full bg-slate">
            <div className="imgd-bar h-px w-0" style={{ background: 'var(--world-create)' }} />
          </div>
        </div>
      </div>

      {/* ---------- right: the canvas and its caption ---------- */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:h-full md:items-center">
        <div className="flex w-full max-w-full min-w-0 flex-col md:h-full md:w-auto">
          <div className="relative aspect-[8/5] w-full overflow-hidden bg-ink shadow-[inset_0_0_0_1px_var(--color-slate)] md:h-[calc(100%-32px)] md:w-auto md:max-w-full">
            {/* main canvas: grid → scattered mosaic → image */}
            <div className="imgd-main absolute inset-0">
              <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                  <pattern id="imgd-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M32 0H0V32" fill="none" style={{ stroke: 'var(--color-slate)' }} strokeWidth="1" />
                  </pattern>
                  <linearGradient id="imgd-g-down" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fff" />
                    <stop offset="1" stopColor="#000" />
                  </linearGradient>
                  <linearGradient id="imgd-g-up" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#000" />
                    <stop offset="1" stopColor="#fff" />
                  </linearGradient>
                  <radialGradient id="imgd-g-rad">
                    <stop offset="0" stopColor="#fff" />
                    <stop offset="0.35" stopColor="#999" />
                    <stop offset="1" stopColor="#000" />
                  </radialGradient>
                  <mask id="imgd-m-down" maskContentUnits="objectBoundingBox">
                    <rect width="1" height="1" fill="url(#imgd-g-down)" />
                  </mask>
                  <mask id="imgd-m-up" maskContentUnits="objectBoundingBox">
                    <rect width="1" height="1" fill="url(#imgd-g-up)" />
                  </mask>
                  <mask id="imgd-m-rad" maskContentUnits="objectBoundingBox">
                    <rect width="1" height="1" fill="url(#imgd-g-rad)" />
                  </mask>
                  <clipPath id="imgd-c-box">
                    <rect x={BOX.x1} y={BOX.y1} width={BOX.x2 - BOX.x1} height={BOX.y2 - BOX.y1} />
                  </clipPath>
                  {/* the pavilion, exterior: palette comes from CSS variables so one symbol serves three variations */}
                  <symbol id="imgd-pav" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
                    <rect width={W} height={HORIZON} style={{ fill: v('skyMid') }} />
                    <rect width={W} height={HORIZON} style={{ fill: v('skyTop') }} mask="url(#imgd-m-down)" />
                    <rect y="120" width={W} height="130" style={{ fill: v('horizon') }} mask="url(#imgd-m-up)" />
                    <polygon points={HILLS_POLY} style={{ fill: v('hills') }} />
                    <rect y={HORIZON} width={W} height={H - HORIZON} style={{ fill: v('ground') }} />
                    <ellipse cx="320" cy="304" rx="220" ry="46" style={{ fill: v('reflect') }} mask="url(#imgd-m-rad)" />
                    <rect x={BOX.x1} y={BOX.y1} width={BOX.x2 - BOX.x1} height={BOX.y2 - BOX.y1} style={{ fill: v('glass') }} />
                    <g clipPath="url(#imgd-c-box)">
                      <ellipse cx="320" cy="246" rx="150" ry="80" style={{ fill: v('glow') }} mask="url(#imgd-m-rad)" />
                      <ellipse cx="320" cy="250" rx="84" ry="42" style={{ fill: v('glowHot') }} mask="url(#imgd-m-rad)" />
                      <polygon points="276,262 364,262 368,274 272,274" style={{ fill: v('bench') }} />
                    </g>
                    <path d="M266 196v90M320 196v90M374 196v90" style={{ stroke: v('frame') }} strokeWidth="2" />
                    <polygon points="212,196 296,196 212,252" fill="#fff" opacity="0.05" />
                    <rect x={ROOF.x1} y={ROOF.y1} width={ROOF.x2 - ROOF.x1} height={ROOF.y2 - ROOF.y1} style={{ fill: v('roof') }} />
                    <rect x="196" y="286" width="248" height="7" style={{ fill: v('floor') }} />
                    <rect x="200" y="293" width="240" height="3" fill="#000" opacity="0.4" />
                  </symbol>
                  {/* the pavilion, interior: the same dusk through the glass wall */}
                  <symbol id="imgd-int" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
                    <rect width={W} height={H} style={{ fill: v('wall') }} />
                    <polygon points="0,0 640,0 520,150 120,150" style={{ fill: v('ceiling') }} />
                    <polygon points="0,400 640,400 520,250 120,250" style={{ fill: v('floor') }} />
                    <ellipse cx="320" cy="150" rx="190" ry="70" style={{ fill: v('glow') }} mask="url(#imgd-m-rad)" opacity="0.6" />
                    <ellipse cx="320" cy="300" rx="220" ry="70" style={{ fill: v('glow') }} mask="url(#imgd-m-rad)" opacity="0.45" />
                    <rect x="120" y="150" width="400" height="100" style={{ fill: v('skyMid') }} />
                    <rect x="120" y="150" width="400" height="100" style={{ fill: v('skyTop') }} mask="url(#imgd-m-down)" />
                    <rect x="120" y="195" width="400" height="55" style={{ fill: v('horizon') }} mask="url(#imgd-m-up)" />
                    <polygon points="120,224 180,214 250,222 330,208 420,218 500,210 520,216 520,236 120,236" style={{ fill: v('hills') }} />
                    <rect x="120" y="236" width="400" height="14" style={{ fill: v('ground') }} />
                    <path d="M220 150v100M320 150v100M420 150v100M120 150h400M120 250h400" style={{ stroke: v('frame') }} strokeWidth="2" />
                    <path d="M320 0v88" style={{ stroke: v('frame') }} strokeWidth="2" />
                    <circle cx="320" cy="96" r="7" style={{ fill: v('glowHot') }} />
                    <polygon points="248,262 392,262 400,272 240,272" style={{ fill: v('table') }} />
                    <path d="M252 272v34M388 272v34" style={{ stroke: v('table') }} strokeWidth="4" />
                  </symbol>
                </defs>
                <rect width={W} height={H} fill="url(#imgd-grid)" opacity="0.5" />
                <g className="imgd-render" style={VARIANTS[0].style}>
                  <use href="#imgd-pav" />
                </g>
                <g className="imgd-mosaic">
                  {TRIS.map((t, i) => (
                    <polygon key={i} className="imgd-tri" points={t.points} fill={t.fill} />
                  ))}
                </g>
                <g className="imgd-guide" fill="none" style={{ stroke: 'var(--world-create)' }} strokeWidth="1.25" strokeLinejoin="round">
                  <path d={`M0 ${HORIZON}H${W}`} />
                  <path d={PAVILION_PATH} />
                  <path d={HILLS_PATH} />
                </g>
              </svg>
              <p className="imgd-empty mono absolute inset-0 m-0 flex items-center justify-center text-mist-40">canvas · nothing drawn yet</p>
            </div>

            {/* variations: a 2 × 2 of directions from the same prompt */}
            <div className="imgd-gallery absolute inset-0 grid grid-cols-2 grid-rows-2">
              {VARIANTS.map((item, i) => (
                <figure key={item.name} className="imgd-tile relative m-0 overflow-hidden bg-ink">
                  <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={item.style} aria-hidden="true">
                    <use href={`#${item.symbol}`} />
                  </svg>
                  <figcaption className="absolute bottom-1.5 left-1.5 flex items-baseline gap-1.5 bg-[rgba(7,8,10,0.6)] px-1.5 py-0.5">
                    <span className="mono text-[10px] text-mist-40">{String(i + 1).padStart(2, '0')}</span>
                    <span className="label text-[10px] text-mist">{item.name}</span>
                  </figcaption>
                </figure>
              ))}
              <span className="imgd-cross pointer-events-none absolute top-0 left-1/2 h-full w-px bg-slate" aria-hidden="true" />
              <span className="imgd-cross pointer-events-none absolute top-1/2 left-0 h-px w-full bg-slate" aria-hidden="true" />
              <span
                className="imgd-sel pointer-events-none absolute top-0 left-0 h-1/2 w-1/2"
                style={{ boxShadow: 'inset 0 0 0 1px var(--world-create)' }}
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="mt-2 flex h-6 items-center justify-between gap-3">
            <div className="relative h-4 min-w-0 flex-1">
              {CAPTIONS.map((c, i) => (
                <p key={i} className="imgd-cap mono absolute inset-x-0 top-0 m-0 truncate leading-4 text-mist-60">
                  {c ?? (
                    <>
                      settled <span className="imgd-count text-mist">0</span> / {N} · one image
                    </>
                  )}
                </p>
              ))}
            </div>
            <div className="imgd-dots flex shrink-0 items-center gap-1.5" aria-hidden="true">
              {VARIANTS.map((item, i) => (
                <span key={item.name} className="h-[6px] w-[6px] rotate-45" style={{ background: i === 0 ? 'var(--world-create)' : 'var(--color-slate)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import Delaunator from 'delaunator'
import { FEATURES } from '@/data/features'
import { WORLDS } from '@/data/worlds'
import { EDGES, nodeLayout, panelRect, ringRadius, stageCenter, type Pt } from './layout'
import { CROWN, GOLD, GRAPHITE_TIERS, MIST, WORLD_RGB, hueAt, mix, scale, type RGB } from './palette'
import { clamp, mulberry32, noise2 } from './rng'

export type StateName =
  | 'intro'
  | 'ridge'
  | 'fracture'
  | 'network'
  | 'interface'
  | 'universe'
  | 'engine'
  | 'one'
  | 'calm'
  | 'collapse'
  | 'symbol'

export const STATE_NAMES: StateName[] = [
  'intro',
  'ridge',
  'fracture',
  'network',
  'interface',
  'universe',
  'engine',
  'one',
  'calm',
  'collapse',
  'symbol',
]

/** floats per triangle: x0 y0 x1 y1 x2 y2 r g b a */
export const STRIDE = 10

export interface MeshBase {
  N: number
  /** 0 far, 1 mid, 2 near (parallax amplitude) */
  band: Uint8Array
  /** random stagger in [0,1) */
  stagger: Float32Array
  /** stagger ordered by ridge x (sweep transitions) */
  xStagger: Float32Array
  /** ridge silhouette, left to right (beam path) */
  ridgeTop: Pt[]
  /** per-triangle facet phase for the rolling light */
  phase: Float32Array
}

const SEED = 1973

const write = (out: Float32Array, i: number, a: Pt, b: Pt, c: Pt, rgb: RGB, alpha: number) => {
  const o = i * STRIDE
  out[o] = a.x
  out[o + 1] = a.y
  out[o + 2] = b.x
  out[o + 3] = b.y
  out[o + 4] = c.x
  out[o + 5] = c.y
  out[o + 6] = rgb[0]
  out[o + 7] = rgb[1]
  out[o + 8] = rgb[2]
  out[o + 9] = alpha
}

/** A random facet around a centroid; `r` is the circumradius. */
function facet(rng: () => number, cx: number, cy: number, r: number, rot = 0): [Pt, Pt, Pt] {
  const a0 = rot + rng() * Math.PI * 2
  const a1 = a0 + (2.1 + (rng() - 0.5) * 1.1)
  const a2 = a1 + (2.1 + (rng() - 0.5) * 1.1)
  const r1 = r * (0.7 + rng() * 0.3)
  const r2 = r * (0.7 + rng() * 0.3)
  return [
    { x: cx + Math.cos(a0) * r, y: cy + Math.sin(a0) * r },
    { x: cx + Math.cos(a1) * r1, y: cy + Math.sin(a1) * r1 },
    { x: cx + Math.cos(a2) * r2, y: cy + Math.sin(a2) * r2 },
  ]
}

/** 12 fan triangles forming a faceted gem; returns next free index. */
/** irregular heptagon silhouette shared with the DOM FeatureGem (8 facets + 4 inner facets = 12 triangles) */
const GEM_PTS = [
  [0, -0.92],
  [0.72, -0.56],
  [0.92, 0.16],
  [0.48, 0.84],
  [-0.32, 0.92],
  [-0.84, 0.4],
  [-0.8, -0.4],
  [-0.4, -0.8],
]
const GEM_TONES = [1.18, 0.86, 1.0, 1.1, 0.8, 1.0, 1.2, 0.9]
function gem(out: Float32Array, start: number, N: number, c: Pt, r: number, rgb: RGB, alpha: number, rng: () => number): number {
  let i = start
  const jitter = 0.08 * r
  const ox = (rng() - 0.5) * jitter
  const oy = (rng() - 0.5) * jitter
  const inner = { x: c.x + ox, y: c.y + oy }
  for (let k = 0; k < 8 && i < N; k++, i++) {
    const a = GEM_PTS[k]
    const b = GEM_PTS[(k + 1) % 8]
    write(out, i, inner, { x: c.x + a[0] * r, y: c.y + a[1] * r }, { x: c.x + b[0] * r, y: c.y + b[1] * r }, scale(rgb, GEM_TONES[k]), alpha)
  }
  // four small inner facets: a highlight cluster near the top-left
  for (let k = 0; k < 4 && i < N; k++, i++) {
    const a = GEM_PTS[(k + 6) % 8]
    const b = GEM_PTS[(k + 7) % 8]
    write(
      out,
      i,
      inner,
      { x: c.x + a[0] * r * 0.45, y: c.y + a[1] * r * 0.45 },
      { x: c.x + b[0] * r * 0.45, y: c.y + b[1] * r * 0.45 },
      scale(rgb, 1.28),
      alpha,
    )
  }
  return i
}

function worldOf(i: number) {
  return WORLDS.find((w) => w.id === FEATURES[i].world)!
}

/* ------------------------------------------------------------------ */
/* ridge: a Delaunay-tiled mountain in the lower 58% of the viewport    */
/* ------------------------------------------------------------------ */
export function buildBase(W: number, H: number, points: number): { base: MeshBase; ridge: Float32Array } {
  const rng = mulberry32(SEED)
  const aspect = W / H
  const rows = Math.max(6, Math.round(Math.sqrt(points / (2.2 * aspect))))
  const cols = Math.max(8, Math.round(points / rows))
  const ridgeLine = (u: number) => H * (0.5 + 0.09 * (noise2(u * 3.1 + 11, 2.3) - 0.5) * 2 - 0.05 * noise2(u * 7.3, 5.1))
  const pts: { x: number; y: number; h: number; v: number; u: number }[] = []
  const ridgeTop: Pt[] = []
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const u = c / cols
      const v = r / rows
      const jx = r === 0 ? 0 : (rng() - 0.5) * 0.7
      const jy = r === 0 ? 0 : (rng() - 0.5) * 0.6
      const x = -0.08 * W + 1.16 * W * (u + jx / cols)
      const top = ridgeLine(u)
      const y = top + (H * 1.06 - top) * Math.pow(clamp(v + jy / rows, 0, 1), 1.25)
      const h = Math.pow(1 - v, 1.6) * (0.45 + noise2(u * 4.7, v * 2.1)) * 110
      pts.push({ x, y, h, v, u })
      if (r === 0) ridgeTop.push({ x, y })
    }
  }
  const d = Delaunator.from(pts, (p) => p.x, (p) => p.y)
  const tris = d.triangles
  const N = tris.length / 3
  const out = new Float32Array(N * STRIDE)
  const band = new Uint8Array(N)
  const stagger = new Float32Array(N)
  const xStagger = new Float32Array(N)
  const phase = new Float32Array(N)
  const L = [-0.45, -0.55, 0.7]
  const Ln = Math.hypot(L[0], L[1], L[2])
  L[0] /= Ln
  L[1] /= Ln
  L[2] /= Ln
  const logoAnchor = { x: W * (W > 1024 ? 0.78 : 0.5), y: ridgeLine(W > 1024 ? 0.78 : 0.5) }
  for (let i = 0; i < N; i++) {
    const p0 = pts[tris[i * 3]]
    const p1 = pts[tris[i * 3 + 1]]
    const p2 = pts[tris[i * 3 + 2]]
    // 3D normal with height as z (scaled so slopes read)
    const e1 = [p1.x - p0.x, p1.y - p0.y, (p1.h - p0.h) * 1.6]
    const e2 = [p2.x - p0.x, p2.y - p0.y, (p2.h - p0.h) * 1.6]
    let nx = e1[1] * e2[2] - e1[2] * e2[1]
    let ny = e1[2] * e2[0] - e1[0] * e2[2]
    let nz = e1[0] * e2[1] - e1[1] * e2[0]
    const nl = Math.hypot(nx, ny, nz) || 1
    nx /= nl
    ny /= nl
    nz /= nl
    if (nz < 0) {
      nx = -nx
      ny = -ny
      nz = -nz
    }
    let lambert = clamp(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    const v = (p0.v + p1.v + p2.v) / 3
    const u = (p0.u + p1.u + p2.u) / 3
    const b = v < 0.3 ? 0 : v < 0.62 ? 1 : 2
    band[i] = b
    if (b === 0) lambert = 0.65 + lambert * 0.2 // atmospheric compression for the far band
    const tier = Math.min(4, Math.floor(lambert * 4.99))
    let rgb: RGB = GRAPHITE_TIERS[tier]
    const cx = (p0.x + p1.x + p2.x) / 3
    const cy = (p0.y + p1.y + p2.y) / 3
    const nearLogo = Math.hypot(cx - logoAnchor.x, cy - logoAnchor.y) < 110
    const roll = rng()
    if (nearLogo && roll < 0.7) {
      rgb = mix(GRAPHITE_TIERS[tier], roll < 0.35 ? GOLD : CROWN, 0.55 + lambert * 0.35)
    } else if (roll < 0.15 && b > 0) {
      rgb = mix(GRAPHITE_TIERS[tier], hueAt(u), 0.45 + lambert * 0.4)
    }
    const e01 = Math.hypot(p1.x - p0.x, p1.y - p0.y)
    const e12 = Math.hypot(p2.x - p1.x, p2.y - p1.y)
    const e20 = Math.hypot(p0.x - p2.x, p0.y - p2.y)
    const longest = Math.max(e01, e12, e20)
    const area = Math.abs((p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y)) / 2
    const sliver = longest > W * 0.22 || area / (longest * longest) < 0.05
    write(out, i, p0, p1, p2, rgb, sliver ? 0 : 1)
    stagger[i] = rng()
    xStagger[i] = clamp(cx / W, 0, 1)
    phase[i] = rng() * Math.PI * 2
  }
  ridgeTop.sort((a, b) => a.x - b.x)
  return { base: { N, band, stagger, xStagger, ridgeTop, phase }, ridge: out }
}

/* ------------------------------------------------------------------ */
/* every other state                                                    */
/* ------------------------------------------------------------------ */
export function buildState(name: StateName, W: number, H: number, base: MeshBase, ridge: Float32Array): Float32Array {
  const { N } = base
  const out = new Float32Array(N * STRIDE)
  const rng = mulberry32(SEED + STATE_NAMES.indexOf(name) * 101)
  const c = stageCenter(W, H, name === 'network' || name === 'one' ? name : undefined)
  const minDim = Math.min(W, H)
  const centroid = (i: number): Pt => {
    const o = i * STRIDE
    return { x: (ridge[o] + ridge[o + 2] + ridge[o + 4]) / 3, y: (ridge[o + 1] + ridge[o + 3] + ridge[o + 5]) / 3 }
  }
  const ridgeRgb = (i: number): RGB => [ridge[i * STRIDE + 6], ridge[i * STRIDE + 7], ridge[i * STRIDE + 8]]
  const scatter = (i: number, alpha: number, size: number, rgb?: RGB) => {
    const p = { x: rng() * W, y: rng() * H }
    const f = facet(rng, p.x, p.y, size)
    write(out, i, f[0], f[1], f[2], rgb ?? GRAPHITE_TIERS[3], alpha)
  }
  const collapsed = (i: number, p: Pt) => write(out, i, p, p, p, GOLD, 0)

  switch (name) {
    case 'ridge':
      out.set(ridge)
      return out

    case 'intro': {
      const pointCount = Math.min(N, Math.round(N * 0.06))
      for (let i = 0; i < N; i++) {
        if (i < pointCount) {
          const u = i / pointCount
          const p = { x: W * (0.05 + 0.9 * u) + (rng() - 0.5) * 60, y: H * (0.42 + 0.18 * Math.sin(u * 6.5)) + (rng() - 0.5) * 120 }
          const f = facet(rng, p.x, p.y, 1.6)
          const accent = rng()
          const rgb = accent < 0.2 ? hueAt(u) : MIST
          write(out, i, f[0], f[1], f[2], rgb, 0.9)
        } else {
          collapsed(i, centroid(i))
        }
      }
      return out
    }

    case 'fracture': {
      for (let i = 0; i < N; i++) {
        const o = i * STRIDE
        const cen = centroid(i)
        // move away from the ridge line (down and outward), rotate, keep colour slightly lit
        const dir = { x: (cen.x - W / 2) / W, y: 1 }
        const dl = Math.hypot(dir.x, dir.y)
        const dist = 40 + rng() * 150
        const rot = ((rng() - 0.5) * 50 * Math.PI) / 180
        const cosr = Math.cos(rot)
        const sinr = Math.sin(rot)
        const pts: Pt[] = []
        for (let k = 0; k < 3; k++) {
          const px = ridge[o + k * 2] - cen.x
          const py = ridge[o + k * 2 + 1] - cen.y
          pts.push({
            x: cen.x + (px * cosr - py * sinr) * 0.92 + (dir.x / dl) * dist,
            y: cen.y + (px * sinr + py * cosr) * 0.92 + (dir.y / dl) * dist * 0.6,
          })
        }
        write(out, i, pts[0], pts[1], pts[2], scale(ridgeRgb(i), 1.12), 0.72)
      }
      return out
    }

    case 'network':
    case 'universe':
    case 'engine':
    case 'one': {
      const nodes = nodeLayout(W, H, name)
      let i = 0
      if (name === 'one') {
        // faceted core disc: 5 bands × 24 segments × 2 triangles
        const rings = [34, 56, 78, 100, 122].map((r) => r * Math.min(1, minDim / 900))
        for (let b = 0; b < rings.length - 1 && i < N; b++) {
          for (let k = 0; k < 24 && i < N; k++) {
            const a0 = (k / 24) * Math.PI * 2 + b * 0.13
            const a1 = ((k + 1) / 24) * Math.PI * 2 + b * 0.13
            const r0 = rings[b]
            const r1 = rings[b + 1]
            const tone = ((k + b) % 3) * 0.14 + 0.78
            const rgb = scale(mix(CROWN, GOLD, b / rings.length), tone)
            const P = (r: number, a: number) => ({ x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r })
            write(out, i++, P(r0, a0), P(r1, a0), P(r1, a1), rgb, 0.82)
            if (i < N) write(out, i++, P(r0, a0), P(r1, a1), P(r0, a1), scale(rgb, 0.9), 0.82)
          }
        }
      }
      const gemR = name === 'network' ? 16 : name === 'one' ? 9 : name === 'engine' ? 11 : 7
      const gemAlpha = name === 'universe' ? 0.35 : name === 'engine' ? 0.7 : 0.9
      for (let k = 0; k < nodes.length && i < N; k++) {
        if (k === 0 && name !== 'network') continue
        const rgb = k === 0 ? GOLD : WORLD_RGB[worldOf(k).id]
        i = gem(out, i, N, nodes[k], gemR * Math.min(1.1, minDim / 800), rgb, gemAlpha, rng)
      }
      const ambientCount = Math.min(N - i, name === 'network' ? 600 : name === 'universe' ? 400 : 300)
      const edgeCount = EDGES.length
      for (let a = 0; a < ambientCount && i < N; a++, i++) {
        if (name === 'network' && rng() < 0.6) {
          const e = EDGES[Math.floor(rng() * edgeCount)]
          const t = rng()
          const p = {
            x: nodes[e[0]].x + (nodes[e[1]].x - nodes[e[0]].x) * t + (rng() - 0.5) * 10,
            y: nodes[e[0]].y + (nodes[e[1]].y - nodes[e[0]].y) * t + (rng() - 0.5) * 10,
          }
          const f = facet(rng, p.x, p.y, 2.5 + rng() * 3)
          write(out, i, f[0], f[1], f[2], GRAPHITE_TIERS[4], 0.35)
        } else {
          scatter(i, name === 'engine' ? 0.12 : 0.16, 3 + rng() * 6, rng() < 0.12 ? hueAt(rng()) : GRAPHITE_TIERS[3])
        }
      }
      for (; i < N; i++) collapsed(i, { x: c.x + (rng() - 0.5) * 40, y: c.y + (rng() - 0.5) * 40 })
      return out
    }

    case 'interface': {
      const rect = panelRect(W, H)
      const perim = 2 * (rect.w + rect.h)
      let i = 0
      const borderCount = Math.min(N, 140)
      for (; i < borderCount; i++) {
        const t = (i / borderCount) * perim
        let p: Pt
        let tangent: Pt
        if (t < rect.w) {
          p = { x: rect.x + t, y: rect.y }
          tangent = { x: 1, y: 0 }
        } else if (t < rect.w + rect.h) {
          p = { x: rect.x + rect.w, y: rect.y + (t - rect.w) }
          tangent = { x: 0, y: 1 }
        } else if (t < 2 * rect.w + rect.h) {
          p = { x: rect.x + rect.w - (t - rect.w - rect.h), y: rect.y + rect.h }
          tangent = { x: -1, y: 0 }
        } else {
          p = { x: rect.x, y: rect.y + rect.h - (t - 2 * rect.w - rect.h) }
          tangent = { x: 0, y: -1 }
        }
        const len = 12
        const normal = { x: -tangent.y, y: tangent.x }
        write(
          out,
          i,
          { x: p.x - tangent.x * len, y: p.y - tangent.y * len },
          { x: p.x + tangent.x * len, y: p.y + tangent.y * len },
          { x: p.x + normal.x * 3, y: p.y + normal.y * 3 },
          i % 7 === 0 ? GOLD : GRAPHITE_TIERS[4],
          0.55,
        )
      }
      // the 21 nodes park on the frame's corners and edges
      const anchors: Pt[] = []
      for (let k = 0; k < 21; k++) {
        const t = (k / 21) * perim
        anchors.push(
          t < rect.w
            ? { x: rect.x + t, y: rect.y }
            : t < rect.w + rect.h
              ? { x: rect.x + rect.w, y: rect.y + (t - rect.w) }
              : t < 2 * rect.w + rect.h
                ? { x: rect.x + rect.w - (t - rect.w - rect.h), y: rect.y + rect.h }
                : { x: rect.x, y: rect.y + rect.h - (t - 2 * rect.w - rect.h) },
        )
      }
      for (let k = 0; k < 21 && i < N; k++) {
        i = gem(out, i, N, anchors[k], 5, k === 0 ? GOLD : WORLD_RGB[worldOf(k).id], 0.5, rng)
      }
      const ambient = Math.min(N - i, 260)
      for (let a = 0; a < ambient && i < N; a++, i++) scatter(i, 0.14, 3 + rng() * 5)
      for (; i < N; i++) collapsed(i, { x: rect.x + rng() * rect.w, y: rect.y + rng() * rect.h })
      return out
    }

    case 'calm': {
      const cell = 220
      const cols = Math.ceil(W / cell) + 2
      const rows = Math.ceil(H / cell) + 2
      const pts: Pt[] = []
      for (let r = 0; r < rows; r++)
        for (let col = 0; col < cols; col++)
          pts.push({ x: (col - 1) * cell + (rng() - 0.5) * cell * 0.8, y: (r - 1) * cell + (rng() - 0.5) * cell * 0.8 })
      const d = Delaunator.from(pts, (p) => p.x, (p) => p.y)
      const M = Math.min(N, d.triangles.length / 3)
      for (let i = 0; i < M; i++) {
        const p0 = pts[d.triangles[i * 3]]
        const p1 = pts[d.triangles[i * 3 + 1]]
        const p2 = pts[d.triangles[i * 3 + 2]]
        const tier = rng() < 0.5 ? 1 : 2
        const rgb = rng() < 0.03 ? mix(GRAPHITE_TIERS[2], WORLD_RGB.learn, 0.35) : GRAPHITE_TIERS[tier]
        write(out, i, p0, p1, p2, rgb, 0.95)
      }
      for (let i = M; i < N; i++) {
        const j = Math.floor(rng() * M)
        const o = j * STRIDE
        collapsed(i, { x: (out[o] + out[o + 2] + out[o + 4]) / 3, y: (out[o + 1] + out[o + 3] + out[o + 5]) / 3 })
      }
      return out
    }

    case 'collapse': {
      const golden = Math.PI * (3 - Math.sqrt(5))
      const maxR = minDim * 0.42
      for (let i = 0; i < N; i++) {
        const u = i / N
        const r = 40 + maxR * Math.sqrt(u)
        const a = i * golden + u * 2.4
        const p = { x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r }
        const f = facet(rng, p.x, p.y, 4 + rng() * 6, a)
        write(out, i, f[0], f[1], f[2], mix(hueAt(rng()), GRAPHITE_TIERS[4], 0.35), 0.9)
      }
      return out
    }

    case 'symbol': {
      const R = Math.min(92, minDim * 0.1)
      for (let i = 0; i < N; i++) {
        if (i === 0) {
          const P = (a: number) => ({ x: c.x + Math.cos(a) * R, y: c.y + Math.sin(a) * R })
          write(out, i, P(-Math.PI / 2), P(Math.PI / 6), P((5 * Math.PI) / 6), GOLD, 1)
        } else {
          collapsed(i, { x: c.x + (rng() - 0.5) * 24, y: c.y + (rng() - 0.5) * 24 })
        }
      }
      return out
    }
  }
}

/** Beam paths per environment, computed from the same layouts. */
export function beamPath(name: 'ridge' | 'network' | 'panel' | 'ring' | 'orbit', W: number, H: number, base: MeshBase): Pt[] {
  const c = stageCenter(W, H, name === 'orbit' ? 'one' : undefined)
  switch (name) {
    case 'ridge':
      return base.ridgeTop
    case 'network': {
      const nodes = nodeLayout(W, H, 'network')
      const ring = nodes.slice(1).map((p, i) => ({ p, a: FEATURES[i + 1].angle })).sort((a, b) => a.a - b.a).map((x) => x.p)
      return [...ring, ring[0]]
    }
    case 'panel': {
      const r = panelRect(W, H)
      return [
        { x: r.x, y: r.y },
        { x: r.x + r.w, y: r.y },
        { x: r.x + r.w, y: r.y + r.h },
        { x: r.x, y: r.y + r.h },
        { x: r.x, y: r.y },
      ]
    }
    case 'ring':
    case 'orbit': {
      const R = name === 'ring' ? ringRadius(W, H) : 150 * Math.min(1, Math.min(W, H) / 900)
      const pts: Pt[] = []
      for (let k = 0; k <= 48; k++) {
        const a = (k / 48) * Math.PI * 2 - Math.PI / 2
        pts.push({ x: c.x + Math.cos(a) * R, y: c.y + Math.sin(a) * R })
      }
      return pts
    }
  }
}

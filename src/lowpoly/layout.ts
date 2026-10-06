import { FEATURES } from '@/data/features'
import { WORLDS } from '@/data/worlds'

export interface Pt {
  x: number
  y: number
}
export type LayoutMode = 'network' | 'universe' | 'one' | 'engine'

const DEG = Math.PI / 180

/** Design space 1200×900; the universe scales to fit the viewport, never above 1. */
export function layoutScale(W: number, H: number): number {
  return Math.max(0.38, Math.min((W - 48) / 1200, (H - 120) / 900, 1))
}

export function stageCenter(W: number, H: number, mode?: LayoutMode): Pt {
  // on desktop the copy sits on the left, so the network / Shakir One constellations sit right of center
  const shifted = W >= 1024 && (mode === 'network' || mode === 'one')
  return { x: shifted ? W * 0.64 : W / 2, y: H * 0.52 }
}

/**
 * Positions for the 21 features (index = FEATURES order; 0 is Chat at the center).
 * Shared by the canvas engine and the DOM gems so they always agree.
 */
export function nodeLayout(W: number, H: number, mode: LayoutMode): Pt[] {
  const s = layoutScale(W, H)
  const c = stageCenter(W, H, mode)
  const base = mode === 'one' ? 230 : mode === 'engine' ? 310 : 300
  const out: Pt[] = []
  FEATURES.forEach((f, i) => {
    if (i === 0) {
      out.push({ x: c.x, y: c.y })
      return
    }
    let theta = f.angle
    let r = base
    if (mode === 'engine') {
      theta = ((i - 1) / 20) * 360
    } else if (mode === 'universe' || mode === 'network') {
      r += i % 2 === 0 ? 24 : -24
    }
    const rad = theta * DEG
    out.push({ x: c.x + r * s * Math.sin(rad), y: c.y - r * s * Math.cos(rad) })
  })
  return out
}

/** 20 spokes from the center + consecutive siblings inside each world (sorted by angle). */
export const EDGES: [number, number][] = (() => {
  const edges: [number, number][] = []
  for (let i = 1; i < FEATURES.length; i++) edges.push([0, i])
  for (const w of WORLDS) {
    if (w.id === 'center') continue
    const idx = FEATURES.map((f, i) => ({ f, i }))
      .filter((x) => x.f.world === w.id)
      .sort((a, b) => a.f.angle - b.f.angle)
      .map((x) => x.i)
    for (let k = 1; k < idx.length; k++) edges.push([idx[k - 1], idx[k]])
  }
  return edges
})()

/** The chat panel frame used by the `interface` state. */
/** The chat chapter's outline used by the `interface` state: it frames the whole chapter content. */
export function panelRect(W: number, H: number): { x: number; y: number; w: number; h: number } {
  const pad = Math.min(64, W * 0.04)
  const w = Math.min(1440, W) - pad * 2
  const h = H * 0.72
  return { x: (W - w) / 2, y: H * 0.5 - h / 2 + H * 0.02, w, h }
}

export function ringRadius(W: number, H: number): number {
  return 310 * layoutScale(W, H)
}

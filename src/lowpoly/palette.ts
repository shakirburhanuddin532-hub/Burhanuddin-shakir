import type { WorldId } from '@/data/worlds'

export type RGB = [number, number, number]

export const INK: RGB = [7, 8, 10]
export const MIST: RGB = [242, 241, 236]

/** Lighting output is quantised to these five tiers so the surface stays calm. */
export const GRAPHITE_TIERS: RGB[] = [
  [14, 16, 19],
  [18, 20, 24],
  [23, 26, 31],
  [28, 31, 37],
  [42, 46, 54],
]

/** The logo's hue walk, cool (left) to warm to violet/blue (right). */
const HUE_STOPS: { u: number; c: RGB }[] = [
  { u: 0.0, c: [94, 196, 224] }, // cyan
  { u: 0.14, c: [63, 169, 155] }, // teal
  { u: 0.3, c: [217, 178, 106] }, // gold
  { u: 0.42, c: [224, 146, 58] }, // amber
  { u: 0.55, c: [232, 160, 122] }, // peach
  { u: 0.68, c: [200, 80, 143] }, // magenta
  { u: 0.84, c: [122, 79, 209] }, // violet
  { u: 0.95, c: [59, 108, 230] }, // blue
  { u: 1.0, c: [59, 108, 230] },
]

export function hueAt(u: number): RGB {
  const x = u < 0 ? 0 : u > 1 ? 1 : u
  for (let i = 1; i < HUE_STOPS.length; i++) {
    const a = HUE_STOPS[i - 1]
    const b = HUE_STOPS[i]
    if (x <= b.u) {
      const t = (x - a.u) / (b.u - a.u || 1)
      return [a.c[0] + (b.c[0] - a.c[0]) * t, a.c[1] + (b.c[1] - a.c[1]) * t, a.c[2] + (b.c[2] - a.c[2]) * t]
    }
  }
  return HUE_STOPS[HUE_STOPS.length - 1].c
}

export const WORLD_RGB: Record<WorldId, RGB> = {
  center: [217, 178, 106],
  create: [224, 146, 58],
  learn: [63, 169, 155],
  build: [59, 108, 230],
  human: [200, 80, 143],
  act: [122, 79, 209],
  trust: [185, 194, 204],
}

export const GOLD: RGB = [217, 178, 106]
export const CROWN: RGB = [201, 162, 79]
export const CYAN: RGB = [94, 196, 224]

export const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]
export const scale = (a: RGB, f: number): RGB => [a[0] * f, a[1] * f, a[2] * f]

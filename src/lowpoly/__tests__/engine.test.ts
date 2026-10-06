import { describe, expect, it } from 'vitest'
import { EDGES, layoutScale, nodeLayout, panelRect } from '../layout'
import { STATE_NAMES, STRIDE, beamPath, buildBase, buildState } from '../states'
import { hueAt } from '../palette'

describe('layout', () => {
  it('returns 21 node positions inside the viewport for every mode', () => {
    for (const mode of ['network', 'universe', 'one', 'engine'] as const) {
      const pts = nodeLayout(1440, 900, mode)
      expect(pts).toHaveLength(21)
      for (const p of pts) {
        expect(p.x).toBeGreaterThan(0)
        expect(p.x).toBeLessThan(1440)
        expect(p.y).toBeGreaterThan(0)
        expect(p.y).toBeLessThan(900)
      }
    }
  })
  it('scales down on phones and never above 1', () => {
    expect(layoutScale(390, 844)).toBeLessThan(0.5)
    expect(layoutScale(2560, 1440)).toBe(1)
  })
  it('has 20 spokes plus sibling edges and a frame inside the viewport', () => {
    expect(EDGES.filter(([a]) => a === 0)).toHaveLength(20)
    expect(EDGES.length).toBeGreaterThan(30)
    const r = panelRect(1440, 900)
    expect(r.x).toBeGreaterThanOrEqual(0)
    expect(r.x + r.w).toBeLessThanOrEqual(1440)
  })
})

describe('environment states', () => {
  const { base, ridge } = buildBase(1440, 900, 380)
  it('builds a ridge mesh with hundreds of triangles and valid bands/staggers', () => {
    expect(base.N).toBeGreaterThan(400)
    expect(ridge.length).toBe(base.N * STRIDE)
    for (let i = 0; i < base.N; i++) {
      expect(base.band[i]).toBeLessThanOrEqual(2)
      expect(base.stagger[i]).toBeGreaterThanOrEqual(0)
      expect(base.stagger[i]).toBeLessThan(1)
    }
    expect(base.ridgeTop.length).toBeGreaterThan(8)
  })
  it('produces every state with the same triangle count and sane colours/alphas', () => {
    for (const name of STATE_NAMES) {
      const s = buildState(name, 1440, 900, base, ridge)
      expect(s.length).toBe(base.N * STRIDE)
      let visible = 0
      for (let i = 0; i < base.N; i++) {
        const o = i * STRIDE
        for (let k = 6; k < 9; k++) {
          expect(s[o + k]).toBeGreaterThanOrEqual(0)
          expect(s[o + k]).toBeLessThanOrEqual(300)
        }
        expect(s[o + 9]).toBeGreaterThanOrEqual(0)
        expect(s[o + 9]).toBeLessThanOrEqual(1)
        if (s[o + 9] > 0.05) visible++
      }
      expect(visible, name).toBeGreaterThan(0)
    }
  })
  it('the symbol state is one gold triangle', () => {
    const s = buildState('symbol', 1440, 900, base, ridge)
    let visible = 0
    for (let i = 0; i < base.N; i++) if (s[i * STRIDE + 9] > 0.05) visible++
    expect(visible).toBe(1)
  })
  it('is deterministic', () => {
    const a = buildState('collapse', 1440, 900, base, ridge)
    const b = buildState('collapse', 1440, 900, base, ridge)
    expect(Array.from(a.slice(0, 50))).toEqual(Array.from(b.slice(0, 50)))
  })
  it('beam paths are polylines with at least two points', () => {
    for (const name of ['ridge', 'network', 'panel', 'ring', 'orbit'] as const) {
      expect(beamPath(name, 1440, 900, base).length).toBeGreaterThan(1)
    }
  })
  it('walks the logo hues from cyan to blue', () => {
    expect(hueAt(0)).toEqual([94, 196, 224])
    expect(hueAt(1)[2]).toBe(230)
    const mid = hueAt(0.3)
    expect(mid[0]).toBeGreaterThan(200)
  })
})

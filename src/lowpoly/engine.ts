import type { Profile } from '@/animations/motion/types'
import { EDGES, nodeLayout, type LayoutMode, type Pt } from './layout'
import { CYAN, mix, type RGB } from './palette'
import { clamp, lerp, smoothstep } from './rng'
import { STRIDE, beamPath, buildBase, buildState, type MeshBase, type StateName } from './states'

const POINTS: Record<Profile, number> = { HIGH: 720, MEDIUM: 380, LOW: 180, REDUCED_MOTION: 180 }
const DPR_CAP: Record<Profile, number> = { HIGH: 2, MEDIUM: 1.5, LOW: 1, REDUCED_MOTION: 1 }
const PARALLAX: Record<Profile, [number, number, number]> = {
  HIGH: [3, 8, 14],
  MEDIUM: [2, 5, 8],
  LOW: [0, 0, 0],
  REDUCED_MOTION: [0, 0, 0],
}
const FPS_CAP: Record<Profile, number> = { HIGH: 60, MEDIUM: 60, LOW: 30, REDUCED_MOTION: 0 }
const NODE_STATES: Partial<Record<StateName, LayoutMode>> = {
  network: 'network',
  universe: 'universe',
  one: 'one',
  engine: 'engine',
}
const EDGE_ALPHA: Partial<Record<StateName, number>> = { network: 0.55, universe: 0.26, one: 0.5, engine: 0.16 }
const VIOLET: RGB = [122, 79, 209]

export type BeamPathName = 'ridge' | 'network' | 'panel' | 'ring' | 'orbit'

/**
 * One persistent Canvas 2D environment for the whole page.
 * Every scene is a blend between two named states; scroll drives `t`.
 */
export class LowPolyEngine {
  readonly canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  W = 0
  H = 0
  dpr = 1
  profile: Profile
  /** global brightness multiplier (the trust scene dims the field) */
  intensity = 1
  onDowngrade?: (p: Profile) => void

  private base!: MeshBase
  private ridge!: Float32Array
  private states = new Map<StateName, Float32Array>()
  private layouts = new Map<string, Pt[]>()
  private cur!: Float32Array
  private from: StateName = 'ridge'
  private to: StateName = 'ridge'
  private t = 0
  private sweep = false
  private dirty = true
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  private light = 0
  private beam = {
    name: null as BeamPathName | null,
    pts: [] as Pt[],
    cum: [] as number[],
    len: 0,
    p: 0,
    alpha: 0,
    timed: false,
    start: 0,
    dur: 0,
  }
  private edgeProgress = 1
  private edgeBoost = 0
  private raf = 0
  private running = false
  private lastT = 0
  private ema = 16
  private frames = 0
  private probed = false
  private xfade: { start: number; dur: number } | null = null

  constructor(canvas: HTMLCanvasElement, profile: Profile) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) throw new Error('Canvas 2D unavailable')
    this.ctx = ctx
    this.profile = profile
    this.resize()
  }

  get triangleCount() {
    return this.base.N
  }
  get state() {
    return { from: this.from, to: this.to, t: this.t }
  }

  resize() {
    this.W = window.innerWidth
    this.H = window.innerHeight
    this.dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP[this.profile])
    this.canvas.width = Math.round(this.W * this.dpr)
    this.canvas.height = Math.round(this.H * this.dpr)
    this.canvas.style.width = `${this.W}px`
    this.canvas.style.height = `${this.H}px`
    this.rebuild()
    if (!this.running) this.renderOnce()
  }

  setProfile(p: Profile) {
    if (p === this.profile) return
    this.profile = p
    this.resize()
    if (p === 'REDUCED_MOTION') this.stop()
    else this.start()
  }

  private rebuild() {
    const { base, ridge } = buildBase(this.W, this.H, POINTS[this.profile])
    this.base = base
    this.ridge = ridge
    this.states.clear()
    this.layouts.clear()
    this.states.set('ridge', ridge)
    this.cur = new Float32Array(base.N * STRIDE)
    if (this.beam.name) this.loadPath(this.beam.name)
    this.dirty = true
  }

  private stateData(name: StateName): Float32Array {
    let s = this.states.get(name)
    if (!s) {
      s = buildState(name, this.W, this.H, this.base, this.ridge)
      this.states.set(name, s)
    }
    return s
  }

  private layout(mode: LayoutMode): Pt[] {
    const key = `${mode}:${this.W}x${this.H}`
    let l = this.layouts.get(key)
    if (!l) {
      l = nodeLayout(this.W, this.H, mode)
      this.layouts.set(key, l)
    }
    return l
  }

  private owner = -1

  /**
   * Scroll-driven: blend `from` → `to` at progress t.
   * `owner` is the scene's document order; a scene takes the environment over only once it has
   * actually started (t > 0) or when the viewer scrolls back into it (t < 1), so a scrub tween
   * still settling in a neighbouring scene cannot overwrite the current one.
   */
  setBlend(from: StateName, to: StateName, t: number, sweep = false, owner = -1) {
    if (owner >= 0 && this.owner >= 0 && owner !== this.owner) {
      if (owner > this.owner && t <= 0) return
      if (owner < this.owner && t >= 1) return
    }
    if (owner >= 0) this.owner = owner
    this.from = from
    this.to = to
    this.t = clamp(t, 0, 1)
    this.sweep = sweep
    this.xfade = null
    this.dirty = true
    if (!this.running) this.renderOnce()
  }

  /** Time-based crossfade (reduced motion, intro handoff). */
  crossfadeTo(to: StateName, ms = 400) {
    if (this.to === to && this.t >= 1) return
    this.from = this.t >= 1 || this.t <= 0 ? (this.t >= 1 ? this.to : this.from) : this.to
    this.to = to
    this.t = 0
    this.sweep = false
    this.xfade = { start: performance.now(), dur: ms }
    this.dirty = true
    if (!this.running) this.loopUntilSettled()
  }

  setPointer(nx: number, ny: number) {
    this.pointer.tx = clamp(nx, -1, 1)
    this.pointer.ty = clamp(ny, -1, 1)
  }

  setEdges(progress: number, boost = 0) {
    this.edgeProgress = clamp(progress, 0, 1)
    this.edgeBoost = boost
    this.dirty = true
  }

  private loadPath(name: BeamPathName) {
    const pts = beamPath(name, this.W, this.H, this.base)
    const cum = [0]
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y))
    this.beam.name = name
    this.beam.pts = pts
    this.beam.cum = cum
    this.beam.len = cum[cum.length - 1]
  }

  beamScrub(name: BeamPathName, p: number, alpha = 1) {
    if (this.beam.name !== name) this.loadPath(name)
    this.beam.timed = false
    this.beam.p = clamp(p, 0, 1)
    this.beam.alpha = clamp(alpha, 0, 1)
    this.dirty = true
    if (!this.running) this.renderOnce()
  }

  beamPass(name: BeamPathName, ms: number) {
    if (this.profile === 'REDUCED_MOTION') return
    if (this.beam.name !== name) this.loadPath(name)
    this.beam.timed = true
    this.beam.start = performance.now()
    this.beam.dur = ms
    this.beam.alpha = 1
    this.beam.p = 0
  }

  beamOff() {
    this.beam.alpha = 0
    this.beam.timed = false
    this.dirty = true
  }

  start() {
    if (this.running || this.profile === 'REDUCED_MOTION') return
    this.running = true
    this.lastT = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  destroy() {
    this.stop()
  }

  /** Single render for static profiles. */
  renderOnce() {
    if (this.dirty) this.blend()
    this.draw(performance.now())
  }

  private loopUntilSettled() {
    const step = (now: number) => {
      if (this.xfade) {
        const u = clamp((now - this.xfade.start) / this.xfade.dur, 0, 1)
        this.t = smoothstep(u)
        this.dirty = true
        if (u >= 1) this.xfade = null
      }
      this.renderOnce()
      if (this.xfade) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  private frame = (now: number) => {
    if (!this.running) return
    const cap = FPS_CAP[this.profile]
    const dt = now - this.lastT
    if (cap < 60 && dt < 1000 / cap - 2) {
      this.raf = requestAnimationFrame(this.frame)
      return
    }
    this.lastT = now
    this.light += dt * ((Math.PI * 2) / 48000)
    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.08
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.08
    if (this.xfade) {
      const u = clamp((now - this.xfade.start) / this.xfade.dur, 0, 1)
      this.t = smoothstep(u)
      this.dirty = true
      if (u >= 1) this.xfade = null
    }
    if (this.beam.timed) {
      const u = (now - this.beam.start) / this.beam.dur
      if (u >= 1) {
        this.beam.timed = false
        this.beam.alpha = 0
      } else {
        this.beam.p = u
        this.beam.alpha = u < 0.1 ? u / 0.1 : u > 0.85 ? (1 - u) / 0.15 : 1
      }
    }
    if (this.dirty) this.blend()
    this.draw(now)
    // frame-time probe: downgrade once if the device cannot keep up
    if (!this.probed && this.profile !== 'LOW') {
      this.frames++
      if (this.frames > 30) this.ema = this.ema * 0.9 + Math.min(dt, 100) * 0.1
      if (this.frames > 150) {
        this.probed = true
        const limit = this.profile === 'HIGH' ? 24 : 28
        if (this.ema > limit) this.onDowngrade?.(this.profile === 'HIGH' ? 'MEDIUM' : 'LOW')
      }
    }
    this.raf = requestAnimationFrame(this.frame)
  }

  private blend() {
    const A = this.stateData(this.from)
    const B = this.stateData(this.to)
    const cur = this.cur
    const t = this.t
    if (t <= 0) cur.set(A)
    else if (t >= 1) cur.set(B)
    else {
      const S = 0.45
      const stag = this.sweep ? this.base.xStagger : this.base.stagger
      const N = this.base.N
      for (let i = 0; i < N; i++) {
        const u = smoothstep(t * (1 + S) - stag[i] * S)
        const o = i * STRIDE
        for (let k = 0; k < STRIDE; k++) cur[o + k] = A[o + k] + (B[o + k] - A[o + k]) * u
      }
    }
    this.dirty = false
  }

  private pointAt(dist: number): Pt {
    const { pts, cum } = this.beam
    const d = clamp(dist, 0, this.beam.len)
    let i = 1
    while (i < cum.length - 1 && cum[i] < d) i++
    const seg = cum[i] - cum[i - 1] || 1
    const u = (d - cum[i - 1]) / seg
    return { x: lerp(pts[i - 1].x, pts[i].x, u), y: lerp(pts[i - 1].y, pts[i].y, u) }
  }

  private draw(now: number) {
    const { ctx, W, H, cur, base } = this
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    // ---- edges (network / universe / one / engine) ----
    const eaF = EDGE_ALPHA[this.from] ?? 0
    const eaT = EDGE_ALPHA[this.to] ?? 0
    const ea = lerp(eaF, eaT, this.t) * (1 + this.edgeBoost) * this.intensity
    if (ea > 0.01) {
      const mf = NODE_STATES[this.from]
      const mt = NODE_STATES[this.to]
      const nf = mf ? this.layout(mf) : null
      const nt = mt ? this.layout(mt) : null
      const nodes = nf && nt ? nf.map((p, i) => ({ x: lerp(p.x, nt[i].x, this.t), y: lerp(p.y, nt[i].y, this.t) })) : (nt ?? nf)
      if (nodes) {
        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(167,171,180,${ea.toFixed(3)})`
        ctx.beginPath()
        const total = EDGES.length
        for (let k = 0; k < total; k++) {
          const f = clamp(this.edgeProgress * total - k, 0, 1)
          if (f <= 0) break
          const a = nodes[EDGES[k][0]]
          const b = nodes[EDGES[k][1]]
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(lerp(a.x, b.x, f), lerp(a.y, b.y, f))
        }
        ctx.stroke()
      }
    }

    // ---- triangles ----
    const par = PARALLAX[this.profile]
    const ox = [this.pointer.x * par[0], this.pointer.x * par[1], this.pointer.x * par[2]]
    const oy = [this.pointer.y * par[0] * 0.6, this.pointer.y * par[1] * 0.6, this.pointer.y * par[2] * 0.6]
    const strokeFacets = this.profile === 'HIGH'
    if (strokeFacets) {
      ctx.lineWidth = 0.5
      ctx.strokeStyle = 'rgba(49,34,37,0.55)'
      ctx.lineJoin = 'round'
    }
    const beamOn = this.beam.alpha > 0.01 && this.beam.len > 0
    const head = beamOn ? this.pointAt(this.beam.p * this.beam.len) : null
    const light = this.light
    const N = base.N
    const intensity = this.intensity
    for (let i = 0; i < N; i++) {
      const o = i * STRIDE
      const a = cur[o + 9] * intensity
      if (a < 0.015) continue
      const b = base.band[i]
      let bright = 1 + 0.07 * Math.cos(light * 2 + base.phase[i])
      if (head) {
        const dx = cur[o] - head.x
        const dy = cur[o + 1] - head.y
        const d2 = dx * dx + dy * dy
        if (d2 < 4900) bright += 0.22 * (1 - Math.sqrt(d2) / 70) * this.beam.alpha
      }
      const r = Math.min(255, cur[o + 6] * bright) | 0
      const g = Math.min(255, cur[o + 7] * bright) | 0
      const bl = Math.min(255, cur[o + 8] * bright) | 0
      ctx.fillStyle = `rgb(${r},${g},${bl})`
      ctx.globalAlpha = a > 1 ? 1 : a
      ctx.beginPath()
      ctx.moveTo(cur[o] + ox[b], cur[o + 1] + oy[b])
      ctx.lineTo(cur[o + 2] + ox[b], cur[o + 3] + oy[b])
      ctx.lineTo(cur[o + 4] + ox[b], cur[o + 5] + oy[b])
      ctx.closePath()
      ctx.fill()
      if (strokeFacets) ctx.stroke()
    }
    ctx.globalAlpha = 1

    // ---- beam ----
    if (head) {
      const hue = mix(CYAN, VIOLET, 0.5 + 0.5 * Math.sin(now / 4000))
      const tail = Math.min(this.W > 900 ? 180 : 120, this.beam.len)
      const headD = this.beam.p * this.beam.len
      const segs = 14
      ctx.lineCap = 'round'
      for (let k = 0; k < segs; k++) {
        const d0 = headD - tail * (1 - k / segs)
        const d1 = headD - tail * (1 - (k + 1) / segs)
        if (d1 <= 0) continue
        const p0 = this.pointAt(d0)
        const p1 = this.pointAt(d1)
        const al = Math.pow((k + 1) / segs, 2) * this.beam.alpha
        ctx.strokeStyle = `rgba(${hue[0] | 0},${hue[1] | 0},${hue[2] | 0},${(al * 0.18).toFixed(3)})`
        ctx.lineWidth = 7
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.stroke()
        ctx.strokeStyle = `rgba(${hue[0] | 0},${hue[1] | 0},${hue[2] | 0},${al.toFixed(3)})`
        ctx.lineWidth = this.W > 900 ? 2 : 1.5
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.stroke()
      }
      ctx.fillStyle = `rgba(242,241,236,${this.beam.alpha.toFixed(3)})`
      ctx.beginPath()
      ctx.arc(head.x, head.y, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

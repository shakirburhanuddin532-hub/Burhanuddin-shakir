import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/animations/motion/gsap'
import { useMotion } from '@/animations/motion/MotionProvider'
import { useScene } from '@/animations/scroll/useScene'
import { COPY } from '@/data/copy'
import { FEATURES, featureIndex, type Feature } from '@/data/features'
import { WORLDS, worldById, type WorldId } from '@/data/worlds'
import { nodeLayout, layoutScale, type Pt } from '@/lowpoly/layout'
import { Logo } from '@/components/brand/Logo'
import { FeatureGem } from './FeatureGem'
import { useFeatureDetail } from './FeatureDetailDialog'

/** reading order: center, then clockwise from 12 o'clock */
const ORDER: number[] = (() => {
  const ring = FEATURES.map((f, i) => ({ i, a: ((f.angle % 360) + 360) % 360 }))
    .filter((x) => x.i !== 0)
    .sort((a, b) => a.a - b.a)
    .map((x) => x.i)
  return [0, ...ring]
})()

/** Scene 4 — the 21 capabilities as six constellations around the center. */
export function FeatureUniverse() {
  const ref = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const { reduced, isTouch, isDesktop } = useMotion()
  const [listView, setListView] = useState(false)
  const constellation = isDesktop && !isTouch && !listView && !reduced

  useScene(ref, { id: 'universe', order: 4, from: 'interface', to: 'universe', pin: false, start: 'top 90%', end: 'top 15%' })

  return (
    <section ref={ref} id="universe" className="scene py-24 lg:py-32" aria-labelledby="universe-title">
      <div className="container-x">
        <header className="flex flex-col gap-5 lg:max-w-[760px]">
          <p className="eyebrow">{COPY.universe.eyebrow}</p>
          <h2 id="universe-title" className="display display-lg">
            {COPY.universe.h2.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h2>
          <p className="lede">{COPY.universe.supporting.replace('Open a node', isTouch ? 'Tap a node' : 'Hover a node')}</p>
          {isDesktop && !isTouch && !reduced && (
            <button type="button" className="label self-start underline-offset-4 hover:underline" onClick={() => setListView((v) => !v)}>
              {listView ? COPY.universe.gridToggle : COPY.universe.listToggle}
            </button>
          )}
        </header>
      </div>
      {constellation ? <Constellation stageRef={stageRef} /> : <WorldBands />}
    </section>
  )
}

/* ------------------------------------------------------------------ */
function Constellation({ stageRef }: { stageRef: React.RefObject<HTMLDivElement | null> }) {
  const { open } = useFeatureDetail()
  const [size, setSize] = useState({ w: 1200, h: 900 })
  const [active, setActive] = useState<number | null>(null)
  const [focusIdx, setFocusIdx] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [stageRef])

  const nodes = useMemo(() => nodeLayout(size.w, size.h, 'universe'), [size])
  const s = layoutScale(size.w, size.h)

  // entrance, once
  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.set('.fu-node', { opacity: 0, scale: 0.6 })
      gsap.set('.fu-core', { opacity: 0 })
      gsap.set('.fu-sib', { opacity: 0 })
      ScrollTrigger.create({
        trigger: el,
        start: 'top 65%',
        once: true,
        onEnter: () => {
          gsap.to('.fu-core', { opacity: 1, duration: 0.5 })
          gsap.to('.fu-node', { opacity: 1, scale: 1, duration: 0.6, stagger: 0.035, ease: 'power3.out', delay: 0.2, clearProps: 'scale' })
          gsap.to('.fu-sib', { opacity: 1, duration: 0.6, stagger: 0.03, delay: 0.7 })
        },
      })
    }, el)
    return () => ctx.revert()
  }, [stageRef])

  const connected = useMemo(() => {
    if (active === null) return new Set<number>()
    const f = FEATURES[active]
    const set = new Set<number>()
    f.connections.forEach((c) => set.add(featureIndex(c)))
    FEATURES.forEach((g, i) => {
      if (g.connections.includes(f.slug)) set.add(i)
    })
    return set
  }, [active])

  const onKey = useCallback(
    (e: React.KeyboardEvent, i: number) => {
      const pos = ORDER.indexOf(i)
      let next: number | null = null
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = ORDER[(pos + 1) % ORDER.length]
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = ORDER[(pos - 1 + ORDER.length) % ORDER.length]
      else if (e.key === 'Home') next = ORDER[0]
      else if (e.key === 'End') next = ORDER[ORDER.length - 1]
      else if (/^[a-z]$/i.test(e.key)) {
        const start = pos + 1
        for (let k = 0; k < ORDER.length; k++) {
          const idx = ORDER[(start + k) % ORDER.length]
          if (FEATURES[idx].shortName.toLowerCase().startsWith(e.key.toLowerCase())) {
            next = idx
            break
          }
        }
      }
      if (next !== null) {
        e.preventDefault()
        setFocusIdx(next)
        buttons.current[next]?.focus()
      }
    },
    [],
  )

  const c = nodes[0]
  const siblingLines = useMemo(() => {
    const lines: [number, number][] = []
    for (const w of WORLDS) {
      if (w.id === 'center') continue
      const idx = FEATURES.map((f, i) => ({ f, i })).filter((x) => x.f.world === w.id).sort((a, b) => a.f.angle - b.f.angle).map((x) => x.i)
      for (let k = 1; k < idx.length; k++) lines.push([idx[k - 1], idx[k]])
    }
    return lines
  }, [])

  return (
    <div ref={stageRef} className="relative mt-8 h-[100svh] min-h-[760px] w-full" role="group" aria-label="Shakir feature universe">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {siblingLines.map(([a, b]) => (
          <line key={`${a}-${b}`} className="fu-sib" x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="rgba(167,171,180,0.22)" strokeWidth="1" />
        ))}
        {active !== null &&
          Array.from(connected).map((j) => {
            const a = nodes[active]
            const b = nodes[j]
            const mx = (a.x + b.x) / 2 + (c.x - (a.x + b.x) / 2) * 0.25
            const my = (a.y + b.y) / 2 + (c.y - (a.y + b.y) / 2) * 0.25
            return (
              <path
                key={j}
                className="fu-link is-on"
                d={`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`}
                fill="none"
                stroke={`var(--world-${FEATURES[j].world})`}
                strokeWidth="1.5"
                pathLength={1}
              />
            )
          })}
      </svg>

      {/* world labels */}
      {WORLDS.filter((w) => w.id !== 'center').map((w) => {
        const mid = ((w.arcStart + w.arcEnd) / 2) * (Math.PI / 180)
        const r = 440 * s
        return (
          <span
            key={w.id}
            className="label pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[11px]"
            style={{ left: c.x + r * Math.sin(mid), top: c.y - r * Math.cos(mid), color: `var(--world-${w.id}-text)`, opacity: 0.8 }}
          >
            {w.name}
          </span>
        )
      })}

      {/* center core: the logo is the system, Chat AI is the ring around it */}
      <div className="fu-core pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: c.x, top: c.y }}>
        <Logo height={112 * Math.max(0.7, s)} decorative />
      </div>

      {ORDER.map((i) => {
        const f = FEATURES[i]
        const p: Pt = nodes[i]
        const isCenter = i === 0
        const state = active === null ? '' : active === i ? 'is-active' : connected.has(i) ? 'is-linked' : 'is-dim'
        return (
          <div key={f.slug} className={`fu-node ${state}`} style={{ left: p.x, top: isCenter ? p.y + 96 * Math.max(0.7, s) : p.y }}>
            <button
              ref={(el) => {
                buttons.current[i] = el
              }}
              type="button"
              className="gem-btn flex flex-col items-center gap-2"
              tabIndex={focusIdx === i ? 0 : -1}
              aria-label={`${f.name}, ${worldById(f.world).name} world`}
              aria-describedby={`fu-blurb-${f.slug}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((a) => (a === i ? null : a))}
              onFocus={() => {
                setActive(i)
                setFocusIdx(i)
              }}
              onBlur={() => setActive((a) => (a === i ? null : a))}
              onKeyDown={(e) => onKey(e, i)}
              onClick={(e) => open(f.slug, e.currentTarget)}
            >
              <FeatureGem world={f.world} slug={f.slug} size={isCenter ? 44 : f.tier === 'cinematic' ? 56 : 48} halo={f.tier === 'cinematic'} />
              <span className="fu-name">
                <span className="mono mr-1 opacity-50">{f.id}</span>
                {f.shortName}
              </span>
            </button>
            <span id={`fu-blurb-${f.slug}`} className="fu-blurb">
              {f.blurb}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/** Mobile / list recomposition: vertical world bands, nothing overlaps, tap opens the detail. */
function WorldBands() {
  const { open } = useFeatureDetail()
  const order: WorldId[] = ['center', 'create', 'learn', 'build', 'human', 'act', 'trust']
  return (
    <div className="container-x mt-10 flex flex-col gap-12">
      {order.map((wid) => {
        const w = worldById(wid)
        const feats: Feature[] = FEATURES.filter((f) => f.world === wid).sort((a, b) => a.angle - b.angle)
        return (
          <section key={wid} aria-labelledby={`world-${wid}`} className="flex flex-col gap-5">
            <div className="flex items-baseline gap-4">
              <h3 id={`world-${wid}`} className="eyebrow" style={{ color: `var(--world-${wid}-text)` }}>
                {w.name}
              </h3>
              <p className="text-sm text-mist-60">{w.meaning}</p>
            </div>
            <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {feats.map((f) => (
                <li key={f.slug}>
                  <button
                    type="button"
                    className="gem-btn panel flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-charcoal/80"
                    onClick={(e) => open(f.slug, e.currentTarget)}
                    aria-label={`${f.name}, ${w.name} world`}
                  >
                    <FeatureGem world={f.world} slug={f.slug} size={48} />
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-display text-sm font-medium">
                        <span className="mono mr-2 opacity-50">{f.id}</span>
                        {f.name}
                      </span>
                      <span className="text-sm text-mist-60">{f.blurb}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {wid !== 'center' && <p className="label text-[10px] opacity-60">Connects through Chat + Shakir One</p>}
          </section>
        )
      })}
    </div>
  )
}

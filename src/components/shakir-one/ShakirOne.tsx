import { useLayoutEffect, useRef, useState } from 'react'
import { useScene } from '@/animations/scroll/useScene'
import { useMotion } from '@/animations/motion/MotionProvider'
import { COPY } from '@/data/copy'
import { FEATURES } from '@/data/features'
import { nodeLayout, type Pt } from '@/lowpoly/layout'
import { clamp } from '@/lowpoly/rng'
import { Logo } from '@/components/brand/Logo'
import { FeatureGem } from '@/components/features/FeatureGem'

/** Scene 6 — nodes appear, connections form, light travels, everything connects, Shakir One activates. */
export function ShakirOne() {
  const ref = useRef<HTMLElement>(null)
  const { isDesktop } = useMotion()
  const [nodes, setNodes] = useState<Pt[]>([])

  useLayoutEffect(() => {
    const update = () => setNodes(nodeLayout(window.innerWidth, window.innerHeight, 'one'))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useScene(ref, {
    id: 'shakir-one',
    order: 6,
    from: 'engine',
    to: 'one',
    lengthVh: 280,
    blend: (p, engine) => engine.setBlend('engine', 'one', clamp(p / 0.3, 0, 1), false, 6),
    build: (tl, _el, { engine }) => {
      tl.fromTo('.so-title', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.08 }, 0)
      tl.fromTo('.so-node', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.05, stagger: 0.009 }, 0.08)
      const edges = { v: 0 }
      tl.to(edges, { v: 1, duration: 0.14, onUpdate: () => engine.setEdges(edges.v) }, 0.26)
      const beam = { v: 0 }
      tl.to(beam, { v: 1, duration: 0.12, onUpdate: () => engine.beamScrub('orbit', beam.v, beam.v < 0.1 ? beam.v * 10 : beam.v > 0.9 ? (1 - beam.v) * 10 : 1) }, 0.4)
      const boost = { v: 0 }
      tl.to(boost, { v: 0.6, duration: 0.1, onUpdate: () => engine.setEdges(1, boost.v) }, 0.52)
      tl.to('.so-node', { filter: 'brightness(1.25)', duration: 0.1 }, 0.52)
      // activation
      tl.fromTo('.so-ring', { scale: 1 }, { scale: 1.06, duration: 0.04, yoyo: true, repeat: 1 }, 0.62)
      tl.fromTo('.so-halo', { scale: 1, opacity: 0.5 }, { scale: 1.7, opacity: 0, duration: 0.08 }, 0.62)
      tl.fromTo('.so-sheen', { xPercent: -130 }, { xPercent: 130, duration: 0.06, ease: 'power1.inOut' }, 0.63)
      tl.fromTo('.so-message', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.06 }, 0.66)
      tl.fromTo('.so-support', { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.7)
      // request flow
      const dim = { v: 0.6 }
      tl.to(dim, { v: -0.55, duration: 0.08, onUpdate: () => engine.setEdges(1, dim.v) }, 0.72)
      tl.to('.so-node', { opacity: 0.25, duration: 0.08 }, 0.72)
      tl.fromTo('.so-pipeline', { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.72)
      const stops = COPY.shakirOne.pipeline.length
      for (let i = 0; i < stops; i++) {
        const t = 0.74 + (i / stops) * 0.24
        tl.fromTo(`.so-stop-${i}`, { opacity: 0.25, y: 8 }, { opacity: 1, y: 0, duration: 0.025 }, t)
        tl.fromTo(`.so-cap-${i}`, { opacity: 0 }, { opacity: 1, duration: 0.025 }, t + 0.01)
        if (i < stops - 1) tl.fromTo(`.so-conn-${i}`, { '--fill': 0 }, { '--fill': 1, duration: 0.025 }, t + 0.015)
      }
    },
  })

  const stops = COPY.shakirOne.pipeline
  const center = nodes[0]
  return (
    <section ref={ref} id="shakir-one" className="scene" aria-labelledby="one-title">
      <div className="scene-pin">
        {/* capability nodes aligned with the canvas gems (the stage is pinned, so viewport coordinates hold) */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {nodes.slice(1).map((p, i) => {
            const f = FEATURES[i + 1]
            return (
              <div key={f.slug} className="so-node absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1" style={{ left: p.x, top: p.y, opacity: 0 }}>
                <FeatureGem world={f.world} slug={f.slug} size={isDesktop ? 36 : 26} />
                {isDesktop && <span className="label text-[9px] opacity-70">{f.shortName}</span>}
              </div>
            )
          })}
          {center && (
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: center.x, top: center.y }}>
              <div className="so-halo absolute inset-[-24px] rounded-full border border-gold/60" />
              <div className="so-ring relative overflow-hidden">
                <Logo height={isDesktop ? 160 : 112} decorative />
                <div
                  className="so-sheen pointer-events-none absolute inset-0"
                  style={{ background: 'linear-gradient(120deg, transparent 35%, rgba(242,241,236,0.4) 50%, transparent 65%)', mixBlendMode: 'screen' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="container-x relative flex h-full flex-col justify-between py-[12vh]">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">{COPY.shakirOne.eyebrow}</p>
            <h2 id="one-title" className="so-title display display-lg" style={{ opacity: 0 }}>
              {COPY.shakirOne.h2}
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            <div className="max-w-[560px]">
              <p className="so-message display display-md" style={{ opacity: 0 }}>
                {COPY.shakirOne.message[0]}
                <br />
                {COPY.shakirOne.message[1]}
              </p>
              <p className="so-support lede mt-4" style={{ opacity: 0 }}>
                {COPY.shakirOne.supporting}
              </p>
            </div>
            <ol className="so-pipeline m-0 flex list-none flex-col gap-0 p-0 lg:flex-row lg:items-start" style={{ opacity: 0 }} aria-label="Request flow">
              {stops.map((s, i) => (
                <li key={s.label} className="flex items-stretch gap-0 lg:flex-1 lg:flex-col">
                  <div className="flex flex-col items-start gap-1 lg:items-stretch">
                    <span
                      className={`so-stop-${i} label inline-flex min-h-[36px] items-center px-3 text-[10px]`}
                      style={{
                        clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                        background: i === 1 ? 'var(--color-gold)' : i === 5 ? 'var(--world-trust)' : 'var(--color-charcoal)',
                        color: i === 1 || i === 5 ? 'var(--color-ink)' : 'var(--color-mist)',
                      }}
                    >
                      {s.label}
                    </span>
                    <span className={`so-cap-${i} hidden max-w-[150px] text-[11px] leading-snug text-mist-60 lg:block`}>{s.caption}</span>
                  </div>
                  {i < stops.length - 1 && (
                    <span className={`so-conn-${i} pipe-conn vertical ml-3 h-6 w-px lg:vertical-none lg:mt-[18px] lg:ml-0 lg:h-px lg:w-full`} aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useLayoutEffect, useRef, useState } from 'react'
import { useScene } from '@/animations/scroll/useScene'
import { COPY } from '@/data/copy'
import { FEATURES } from '@/data/features'
import { nodeLayout, type Pt } from '@/lowpoly/layout'

/** Scene 2 — fragments become a network. The beam is the connection. */
export function SystemScene() {
  const ref = useRef<HTMLElement>(null)
  const [nodes, setNodes] = useState<Pt[]>([])

  useLayoutEffect(() => {
    const update = () => setNodes(nodeLayout(window.innerWidth, window.innerHeight, 'network'))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useScene(ref, {
    id: 'system',
    order: 2,
    from: 'fracture',
    to: 'network',
    lengthVh: 200,
    build: (tl, _el, { engine }) => {
      tl.fromTo('.sys-a', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.1 }, 0.02)
        .to('.sys-a', { opacity: 0, y: -24, duration: 0.08 }, 0.36)
        .fromTo('.sys-b', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.1 }, 0.44)
        .fromTo('.sys-label', { opacity: 0 }, { opacity: 0.5, duration: 0.08, stagger: 0.006 }, 0.1)
        .to('.sys-label', { opacity: 0.22, duration: 0.1 }, 0.5)
      const edges = { v: 0 }
      tl.to(edges, { v: 1, duration: 0.35, onUpdate: () => engine.setEdges(edges.v) }, 0.35)
      const beam = { v: 0 }
      tl.to(beam, { v: 1, duration: 0.28, onUpdate: () => engine.beamScrub('network', beam.v, beam.v < 0.1 ? beam.v * 10 : 1) }, 0.7)
      const fade = { a: 1 }
      tl.to(fade, { a: 0, duration: 0.02, onUpdate: () => engine.beamScrub('network', 1, fade.a) }, 0.98)
    },
  })

  return (
    <section ref={ref} id="system" className="scene" aria-labelledby="system-title">
      <div className="scene-pin">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {nodes.slice(1).map((p, i) => (
            <span
              key={FEATURES[i + 1].slug}
              className="sys-label label absolute -translate-x-1/2 text-[10px] whitespace-nowrap"
              style={{ left: p.x, top: p.y + 22, opacity: 0 }}
            >
              {FEATURES[i + 1].shortName}
            </span>
          ))}
        </div>
        <div className="container-x relative flex h-full flex-col justify-end pb-[12vh] lg:justify-center lg:pb-0">
          <div className="relative max-w-[720px]">
            <h2 id="system-title" className="sys-a display display-lg" style={{ opacity: 0 }}>
              {COPY.system.phaseA}
            </h2>
            <div className="sys-b absolute inset-x-0 top-0 flex flex-col gap-6" style={{ opacity: 0 }}>
              <h2 className="display display-lg" aria-hidden="true">
                {COPY.system.phaseB}
              </h2>
              <p className="lede">{COPY.system.supporting}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

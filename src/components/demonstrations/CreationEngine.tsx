import { useRef } from 'react'
import { useScene } from '@/animations/scroll/useScene'
import { COPY } from '@/data/copy'
import { DEMOS } from '@/data/demos'
import { DemoChapter } from './DemoChapter'

/** Scene 5 — eight chapters of real work; the universe contracts into a ring around the stage. */
export function CreationEngine() {
  const ref = useRef<HTMLElement>(null)
  useScene(ref, { id: 'engine', order: 5, from: 'universe', to: 'engine', pin: false, start: 'top bottom', end: 'top top' })
  return (
    <section ref={ref} id="engine" className="scene" aria-labelledby="engine-title">
      <div className="container-x flex flex-col gap-5 py-24 lg:max-w-[820px] lg:py-32">
        <p className="eyebrow">{COPY.engine.eyebrow}</p>
        <h2 id="engine-title" className="display display-lg">
          {COPY.engine.h2}
        </h2>
        <p className="lede">{COPY.engine.supporting}</p>
      </div>
      {DEMOS.map((d, i) => (
        <DemoChapter key={d.key} entry={d} index={i} />
      ))}
    </section>
  )
}

import { useRef } from 'react'
import { gsap, ScrollTrigger } from '@/animations/motion/gsap'
import { useScene } from '@/animations/scroll/useScene'
import { useGsap } from '@/hooks/useGsap'
import { useMotion } from '@/animations/motion/MotionProvider'
import { COPY } from '@/data/copy'

const ICONS = ['M4 12h16M12 4v16', 'M12 4l8 4v5c0 4-3 7-8 8-5-1-8-4-8-8V8z', 'M5 12l5 5 9-10', 'M4 6h16v10H4zM9 20h6', 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z', 'M4 5h16v14H4zM8 9h8M8 13h5']

/** Scene 7 — the calm. No beam, no pin, no parallax; the field dims and desaturates. */
export function TrustSection() {
  const ref = useRef<HTMLElement>(null)
  const { reduced } = useMotion()
  useScene(ref, {
    id: 'trust',
    order: 7,
    from: 'one',
    to: 'calm',
    pin: false,
    start: 'top bottom',
    end: 'top 30%',
    onProgress: (p, { engine }) => {
      engine.intensity = 1 - 0.35 * p
      engine.setEdges(1, -1)
    },
  })

  useGsap(
    ref,
    () => {
      if (reduced) return
      gsap.set('.trust-item', { opacity: 0, y: 16 })
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 60%',
        once: true,
        onEnter: () => gsap.to('.trust-item', { opacity: 1, y: 0, duration: 0.5, stagger: 0.09, ease: 'power3.out' }),
      })
    },
    [reduced],
  )

  return (
    <section ref={ref} id="trust" className="scene" aria-labelledby="trust-title">
      <div className="container-x grid gap-12 py-32 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-44">
        <div className="flex flex-col gap-6">
          <p className="eyebrow text-trust-text">{COPY.trust.eyebrow}</p>
          <h2 id="trust-title" className="display display-lg">
            {COPY.trust.h2}
          </h2>
          <span className="block h-px w-24 bg-gradient-to-r from-cyan to-violet opacity-30" aria-hidden="true" />
          <p className="lede">{COPY.trust.lead}</p>
          <a href="#trust" className="label text-mist-60 underline-offset-4 hover:text-mist hover:underline" onClick={(e) => e.preventDefault()}>
            Security overview on request
          </a>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 gap-x-10 gap-y-9 p-0 sm:grid-cols-2">
          {COPY.trust.items.map((item, i) => (
            <li key={item.title} className="trust-item flex flex-col gap-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--world-trust)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={ICONS[i]} />
              </svg>
              <h3 className="font-display text-sm font-semibold tracking-[0.12em] uppercase">{item.title}</h3>
              <p className="text-sm leading-relaxed text-mist-60">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

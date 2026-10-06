import { useEffect, useRef } from 'react'
import { useScene, seekTo } from '@/animations/scroll/useScene'
import { useMotion } from '@/animations/motion/MotionProvider'
import { useEngine } from '@/lowpoly/LowPolyScene'
import { COPY } from '@/data/copy'
import { Logo } from '@/components/brand/Logo'

/** Scene 1 — the ridge. Headline left, the logo standing on the summit, fracture on scroll. */
export function HeroScene() {
  const ref = useRef<HTMLElement>(null)
  const engine = useEngine()
  const { reduced, isDesktop, profile } = useMotion()

  useScene(ref, {
    id: 'hero',
    order: 1,
    from: 'ridge',
    to: 'fracture',
    lengthVh: 120,
    sweep: true,
    build: (tl) => {
      tl.fromTo('.hero-hint', { opacity: 1 }, { opacity: 0, duration: 0.05 }, 0.02)
      tl.fromTo('.hero-logo', { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.96, duration: 0.3 }, 0.55)
      tl.fromTo('.hero-copy', { y: 0, opacity: 1 }, { y: -28, opacity: 0, duration: 0.3 }, 0.65)
    },
  })

  // idle beam along the ridge silhouette while the hero is in view
  useEffect(() => {
    if (!engine || reduced || profile === 'LOW') return
    const period = profile === 'HIGH' ? 11000 : 16000
    const id = window.setInterval(() => {
      if (window.scrollY < window.innerHeight * 0.6 && document.documentElement.dataset.intro === 'done') {
        engine.beamPass('ridge', 1600)
      }
    }, period)
    return () => window.clearInterval(id)
  }, [engine, reduced, profile])

  return (
    <section ref={ref} id="hero" className="scene" aria-labelledby="hero-title">
      <div className="scene-pin">
        <div className="intro-hidden container-x grid h-full grid-cols-12 content-center gap-5 pt-[var(--nav-h)] lg:items-center lg:gap-6">
          <div className="hero-copy order-2 col-span-12 flex flex-col gap-6 lg:order-1 lg:col-span-7 lg:gap-7">
            <p className="eyebrow">{COPY.hero.eyebrow}</p>
            <h1 id="hero-title" className="display display-xl">
              {COPY.hero.h1[0]}
              <br />
              {COPY.hero.h1[1]}
            </h1>
            <p className="lede text-mist">{COPY.hero.supporting}</p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#create" className="btn btn-primary" onClick={(e) => { e.preventDefault(); seekTo('create', reduced) }}>
                {COPY.hero.primary}
              </a>
              <a href="#universe" className="btn btn-ghost" onClick={(e) => { e.preventDefault(); seekTo('universe', reduced) }}>
                {COPY.hero.secondary}
              </a>
            </div>
          </div>
          <div className="hero-logo order-1 col-span-12 flex justify-start lg:order-2 lg:col-span-5 lg:justify-end">
            <Logo height={isDesktop ? 420 : 150} priority className="drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]" />
          </div>
        </div>
        <div className="hero-hint absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex" aria-hidden="true">
          <span className="label text-[10px]">{COPY.hero.scroll}</span>
          <span className="block h-6 w-px bg-gradient-to-b from-cyan to-transparent" />
        </div>
      </div>
    </section>
  )
}

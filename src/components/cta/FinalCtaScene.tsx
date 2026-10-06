import { useRef, useState } from 'react'
import { useScene, seekTo } from '@/animations/scroll/useScene'
import { useMotion } from '@/animations/motion/MotionProvider'
import { COPY } from '@/data/copy'
import { clamp } from '@/lowpoly/rng'
import { Logo, Wordmark } from '@/components/brand/Logo'

/** Scene 8 — thousands → hundreds → dozens → one symbol → the logo. */
export function FinalCtaScene() {
  const ref = useRef<HTMLElement>(null)
  const { reduced, isDesktop } = useMotion()
  const [sent, setSent] = useState(false)

  useScene(ref, {
    id: 'create',
    order: 8,
    from: 'calm',
    to: 'symbol',
    lengthVh: 220,
    scrub: 0.8,
    blend: (p, engine) => {
      engine.setEdges(1, -1)
      engine.intensity = p > 0.88 ? clamp(1 - (p - 0.88) / 0.1, 0, 1) : 1
      if (p < 0.55) engine.setBlend('calm', 'collapse', p / 0.55, false, 8)
      else engine.setBlend('collapse', 'symbol', clamp((p - 0.55) / 0.33, 0, 1), false, 8)
    },
    build: (tl) => {
      tl.fromTo('.cta-logo', { opacity: 0, y: 30, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.12 }, 0.84)
      tl.fromTo('.cta-sheen', { xPercent: -130 }, { xPercent: 130, duration: 0.06, ease: 'power1.inOut' }, 0.92)
      tl.fromTo('.cta-copy', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.1 }, 0.9)
    },
  })

  return (
    <section ref={ref} id="create" className="scene" aria-labelledby="create-title">
      <div className="scene-pin">
        <div className="container-x flex h-full flex-col items-center justify-center gap-8 text-center">
          <div className="cta-logo relative overflow-hidden" style={{ opacity: 0 }}>
            <Logo height={isDesktop ? 320 : 200} />
            <div
              className="cta-sheen pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(120deg, transparent 35%, rgba(242,241,236,0.4) 50%, transparent 65%)', mixBlendMode: 'screen' }}
              aria-hidden="true"
            />
          </div>
          <div className="cta-copy flex flex-col items-center gap-6" style={{ opacity: 0 }}>
            <Wordmark size={12} className="text-mist-60" />
            <h2 id="create-title" className="display display-xl">
              {COPY.cta.h2}
            </h2>
            <form
              className="flex w-full max-w-[520px] flex-col items-stretch gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
              aria-label="Request access"
            >
              <label htmlFor="cta-email" className="sr-only">
                Email
              </label>
              <input
                id="cta-email"
                type="email"
                required
                placeholder="name@yourcompany.com"
                className="min-h-[48px] flex-1 bg-charcoal px-4 text-mist shadow-[inset_0_0_0_1px_var(--color-slate)] outline-none placeholder:text-mist-40 focus:shadow-[inset_0_0_0_1px_var(--color-gold)]"
                disabled={sent}
              />
              <button type="submit" className="btn btn-primary" disabled={sent}>
                {sent ? 'Received' : COPY.cta.primary}
              </button>
            </form>
            <p className="text-sm text-mist-60" aria-live="polite">
              {sent ? 'Thank you. We will write when your seat is ready.' : COPY.cta.note}
            </p>
            <a href="#universe" className="btn btn-ghost" onClick={(e) => { e.preventDefault(); seekTo('universe', reduced) }}>
              {COPY.cta.secondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

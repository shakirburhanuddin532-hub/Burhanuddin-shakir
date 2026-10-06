import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '@/animations/motion/gsap'
import { useMotion } from '@/animations/motion/MotionProvider'
import { useEngine } from '@/lowpoly/LowPolyScene'
import { introSeen, markIntroSeen } from '@/hooks/useIntroSeen'
import { COPY } from '@/data/copy'
import { Logo, Wordmark } from './Logo'

/**
 * Opening cinematic (brief §04): the environment assembles from points, the beam
 * scores the ridge, the logo rises, light passes over it, the wordmark appears,
 * and the same canvas is already the hero. 3.2 s, skippable, once per session.
 */
export function IntroSequence() {
  const engine = useEngine()
  const { reduced, isDesktop } = useMotion()
  const [active, setActive] = useState(() => !introSeen())
  const root = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    document.documentElement.dataset.intro = active ? 'running' : 'done'
  }, [active])

  useLayoutEffect(() => {
    if (!active) return
    document.body.classList.add('scroll-locked')
    window.scrollTo(0, 0)
    markIntroSeen()
    return () => document.body.classList.remove('scroll-locked')
  }, [active])

  useLayoutEffect(() => {
    if (!active || !engine || !root.current) return
    let finished = false
    const finish = () => {
      finished = true
      tlRef.current?.kill()
      tlRef.current = null
      engine.setBlend('ridge', 'ridge', 1)
      setActive(false)
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish, defaults: { ease: 'power2.out' } })
      tlRef.current = tl
      if (reduced) {
        engine.setBlend('ridge', 'ridge', 1)
        tl.fromTo('.intro-logo', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
          .fromTo('.intro-wordmark', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.1)
          .to('.intro-stage', { opacity: 0, duration: 0.3 }, 0.9)
        return
      }
      engine.setBlend('intro', 'ridge', 0)
      const proxy = { p: 0 }
      tl.fromTo('.intro-skip', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.2)
        .to(proxy, { p: 1, duration: 1.6, ease: 'power3.inOut', onUpdate: () => !finished && engine.setBlend('intro', 'ridge', proxy.p) }, 0.5)
        .call(() => !finished && engine.beamPass('ridge', 800), [], 1.9)
        .fromTo('.intro-logo', { y: 24, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5 }, 2.3)
        .fromTo('.intro-sheen', { xPercent: -130 }, { xPercent: 130, duration: 0.5, ease: 'power1.inOut' }, 2.7)
        .fromTo('.intro-wordmark', { opacity: 0, letterSpacing: '0.55em' }, { opacity: 1, letterSpacing: '0.3em', duration: 0.4 }, 2.9)
        .to('.intro-stage', { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 3.3)
    }, root)

    const skip = (e?: Event) => {
      const tl = tlRef.current
      if (!tl || tl.progress() >= 1) return
      if (e?.type === 'keydown' && (e as KeyboardEvent).key === 'Tab') return
      gsap.to(tl, { progress: 1, duration: 0.3, ease: 'power2.out', overwrite: true })
    }
    const onKey = (e: KeyboardEvent) => skip(e)
    const safety = window.setTimeout(() => skip(), 6500)
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', skip, { passive: true })
    window.addEventListener('touchmove', skip, { passive: true })
    return () => {
      window.clearTimeout(safety)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchmove', skip)
      ctx.revert()
    }
  }, [active, engine, reduced])

  if (!active) return null
  const logoH = isDesktop ? 260 : 180
  return (
    <div ref={root} className="intro-stage fixed inset-0 z-[60]" aria-label="Introduction" data-testid="intro">
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <div className="intro-logo relative overflow-hidden" style={{ opacity: 0 }}>
          <Logo height={logoH} priority />
          <div
            className="intro-sheen pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(120deg, transparent 35%, rgba(242,241,236,0.45) 50%, transparent 65%)',
              mixBlendMode: 'screen',
              opacity: 0.6,
            }}
            aria-hidden="true"
          />
        </div>
        <div className="intro-wordmark" style={{ opacity: 0 }}>
          <Wordmark size={14} className="text-mist" />
        </div>
      </div>
      <button
        type="button"
        className="intro-skip label absolute right-6 bottom-6 min-h-[44px] min-w-[44px] px-3 text-mist-60 hover:text-mist"
        style={{ opacity: 0 }}
        onClick={() => {
          const tl = tlRef.current
          if (tl) gsap.to(tl, { progress: 1, duration: 0.3, ease: 'power2.out', overwrite: true })
        }}
      >
        {COPY.intro.skip}
      </button>
    </div>
  )
}

import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/animations/motion/gsap'
import { useMotion } from '@/animations/motion/MotionProvider'
import type { DemoEntry } from '@/data/demos'
import { featureBySlug } from '@/data/features'
import { useEngine } from '@/lowpoly/LowPolyScene'
import type { StateName } from '@/lowpoly/states'
import { DemoFrame } from './DemoFrame'
import { DemoSteps } from './DemoSteps'
import { StepControl } from './StepControl'
import type { DemoMode } from './demoTypes'

const lazyCache = new Map<string, ReturnType<typeof lazy>>()

/**
 * A demonstration chapter: header, step rail, faceted stage, and the mode logic.
 *  scrub    — desktop: pinned and scrubbed by scroll
 *  autoplay — touch: plays once when the stage is half in view
 *  stepped  — reduced motion / LOW: user steps with buttons
 */
export interface DemoEnv {
  from: StateName
  to: StateName
  order: number
}

export function DemoChapter({
  entry,
  index,
  headline = true,
  env,
}: {
  entry: DemoEntry
  index?: number
  headline?: boolean
  /** optional environment handoff driven by this chapter's scroll */
  env?: DemoEnv
}) {
  const { reduced, isTouch, profile } = useMotion()
  const engine = useEngine()
  const mode: DemoMode = reduced || profile === 'LOW' ? 'stepped' : isTouch ? 'autoplay' : 'scrub'
  const feature = featureBySlug(entry.featureSlug)
  const world = feature?.world ?? 'create'
  const sectionRef = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const readyRef = useRef(false)
  const enteredRef = useRef(false)

  const tl = useMemo(() => {
    const t = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
    entry.steps.forEach((_s, i) => t.addLabel(`step-${i}`, i))
    // guarantee the timeline spans every step even before the demo adds tweens
    t.to({}, { duration: entry.steps.length }, 0)
    return t
  }, [entry])

  useEffect(() => () => void tl.kill(), [tl])

  const Component = useMemo(() => {
    let c = lazyCache.get(entry.key)
    if (!c) {
      c = lazy(entry.load)
      lazyCache.set(entry.key, c)
    }
    return c
  }, [entry])

  // load the chunk when the chapter approaches (150% of the viewport)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '150% 0px 150% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const ready = useCallback(() => {
    readyRef.current = true
    // force a render at the current playhead: tweens added after a seek would otherwise wait for the next change
    tl.render(tl.time(), false, true)
    if (mode === 'autoplay' && enteredRef.current) tl.play(0)
    if (mode === 'stepped') tl.pause(0)
  }, [mode, tl])

  useLayoutEffect(() => {
    tl.eventCallback('onUpdate', () => setStep(Math.min(entry.steps.length - 1, Math.floor(tl.time()))))
    const el = sectionRef.current
    if (!el) return
    let alive = true
    const ctx = gsap.context(() => {
      if (env && engine && !reduced && mode === 'scrub') {
        const proxy = { p: 0 }
        tl.to(proxy, { p: 1, duration: entry.steps.length, onUpdate: () => alive && engine.setBlend(env.from, env.to, proxy.p, false, env.order) }, 0)
      }
      if (env && engine && !reduced && mode !== 'scrub') {
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.4,
          onUpdate: (self) => alive && engine.setBlend(env.from, env.to, self.progress, false, env.order),
        })
      }
      if (env && engine && reduced) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 70%',
          onEnter: () => engine.crossfadeTo(env.to),
          onEnterBack: () => engine.crossfadeTo(env.to),
          onLeaveBack: () => engine.crossfadeTo(env.from),
        })
      }
      if (mode === 'scrub') {
        ScrollTrigger.create({
          id: entry.anchor,
          trigger: el,
          start: 'top top',
          end: () => `+=${(window.innerHeight * entry.lengthVh) / 100}`,
          pin: true,
          anticipatePin: 1,
          scrub: 0.6,
          animation: tl,
          invalidateOnRefresh: true,
        })
      } else if (mode === 'autoplay') {
        ScrollTrigger.create({
          id: entry.anchor,
          trigger: el,
          start: 'top 55%',
          once: true,
          onEnter: () => {
            enteredRef.current = true
            if (readyRef.current) tl.play(0)
          },
        })
      } else {
        ScrollTrigger.create({ id: entry.anchor, trigger: el, start: 'top bottom' })
        tl.pause(0)
      }
    }, el)
    return () => {
      alive = false
      ctx.revert()
    }
  }, [mode, tl, entry, env, engine, reduced])

  const goTo = (i: number) => {
    setStep(i)
    tl.tweenTo(`step-${i}`, { duration: reduced ? 0 : 0.6, ease: 'power2.inOut' })
  }

  return (
    <section
      ref={sectionRef}
      id={entry.anchor}
      className="scene"
      aria-labelledby={`${entry.anchor}-title`}
      data-demo={entry.key}
      data-step={entry.steps[step]}
    >
      <div className={mode === 'scrub' ? 'scene-pin flex flex-col justify-center' : 'min-h-[100svh] pt-28 pb-20'}>
        <div className="container-x grid gap-6 lg:grid-cols-[minmax(260px,1fr)_minmax(0,2fr)] lg:items-start lg:gap-12">
          <header className="flex flex-col gap-4">
            {typeof index === 'number' && (
              <span className="mono text-mist-40">{String(index + 1).padStart(2, '0')} / 08</span>
            )}
            <p className="eyebrow" style={{ color: `var(--world-${world}-text)` }}>
              {entry.eyebrow}
            </p>
            <h3 id={`${entry.anchor}-title`} className={`display ${headline ? 'display-lg' : 'display-md'}`}>
              {entry.title}
            </h3>
            <p className="lede">{entry.supporting}</p>
            <div className="mt-2">
              <DemoSteps steps={entry.steps} active={step} world={world} />
            </div>
            {mode === 'stepped' && <StepControl count={entry.steps.length} active={step} onChange={goTo} />}
            <p className="mt-2 text-sm text-mist-60" aria-live="polite">
              <span className="eyebrow mr-2 text-[10px]">Takeaway</span>
              {entry.takeaway}
            </p>
          </header>
          <DemoFrame world={world} className="min-h-[380px] lg:min-h-[520px]">
            <div className="flex h-full min-h-[380px] w-full flex-col p-4 sm:p-6 lg:min-h-[520px] [&>*]:flex-1">
              {visible ? (
                <Suspense fallback={<div className="label p-6 opacity-60">Preparing demonstration…</div>}>
                  <Component tl={tl} mode={mode} profile={profile} reduced={reduced} ready={ready} />
                </Suspense>
              ) : (
                <div className="label p-6 opacity-40">Demonstration</div>
              )}
            </div>
          </DemoFrame>
        </div>
      </div>
    </section>
  )
}

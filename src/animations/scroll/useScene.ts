import { useLayoutEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from '@/animations/motion/gsap'
import { useMotion } from '@/animations/motion/MotionProvider'
import { useEngine } from '@/lowpoly/LowPolyScene'
import type { LowPolyEngine } from '@/lowpoly/engine'
import type { StateName } from '@/lowpoly/states'

export interface SceneContext {
  reduced: boolean
  isTouch: boolean
  engine: LowPolyEngine
}

export interface SceneOptions {
  /** anchor id; also the ScrollTrigger id used by seekTo */
  id: string
  /** document order of the scene (ownership of the environment) */
  order: number
  from: StateName
  to: StateName
  /** pin distance in vh (pinned only) */
  lengthVh?: number
  pin?: boolean
  /** left→right staggered transition (the beam "scores" the mountain) */
  sweep?: boolean
  scrub?: number
  /** ScrollTrigger start/end for non-pinned scenes */
  start?: string
  end?: string
  /** override the default from→to blend (multi-stage scenes) */
  blend?: (p: number, engine: LowPolyEngine) => void
  /** add DOM tweens to the master timeline; time runs 0..1 */
  build?: (tl: gsap.core.Timeline, el: HTMLElement, ctx: SceneContext) => void
  onProgress?: (p: number, ctx: SceneContext) => void
}

/**
 * SceneController: one ScrollTrigger + one scrubbed master timeline per scene.
 * Geometry (the engine blend) and DOM layers are driven by the same timeline, so
 * scrub smoothing applies equally. Under REDUCED_MOTION nothing pins or scrubs:
 * the section shows its end state and the engine crossfades when it enters view.
 */
export function useScene(ref: RefObject<HTMLElement | null>, opts: SceneOptions) {
  const engine = useEngine()
  const { reduced, isTouch } = useMotion()
  const { id, order, from, to, lengthVh = 100, pin = true, sweep = false, scrub, start, end } = opts

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !engine) return
    const sceneCtx: SceneContext = { reduced, isTouch, engine }
    let alive = true
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
      const proxy = { p: 0 }
      tl.to(
        proxy,
        {
          p: 1,
          duration: 1,
          onUpdate: () => {
            if (!alive) return
            if (opts.blend) opts.blend(proxy.p, engine)
            else engine.setBlend(from, to, proxy.p, sweep, order)
            opts.onProgress?.(proxy.p, sceneCtx)
          },
        },
        0,
      )
      opts.build?.(tl, el, sceneCtx)

      if (reduced) {
        tl.progress(1)
        ScrollTrigger.create({
          id,
          trigger: el,
          start: 'top 70%',
          end: 'bottom 30%',
          onEnter: () => engine.crossfadeTo(to),
          onEnterBack: () => engine.crossfadeTo(to),
          onLeaveBack: () => engine.crossfadeTo(from),
        })
        return
      }

      const lengthPx = () => (window.innerHeight * lengthVh * (isTouch ? 0.8 : 1)) / 100
      ScrollTrigger.create({
        id,
        trigger: el,
        start: pin ? 'top top' : (start ?? 'top bottom'),
        end: pin ? () => `+=${lengthPx()}` : (end ?? 'bottom top'),
        pin,
        pinSpacing: pin,
        anticipatePin: pin ? 1 : 0,
        scrub: scrub ?? (isTouch ? 0.4 : 0.6),
        animation: tl,
        invalidateOnRefresh: true,
      })
    }, el)
    return () => {
      alive = false
      ctx.revert()
    }
    // options are stable per scene; rebuild when the environment changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, reduced, isTouch, id, from, to, lengthVh, pin, sweep, scrub, start, end])
}

/** Smooth-scroll to a scene by anchor id (pinned scenes land on their pin start). */
export function seekTo(id: string, reduced = false) {
  const st = ScrollTrigger.getById(id)
  const el = document.getElementById(id)
  if (!st && !el) return
  const y = st && st.pin ? st.start + 1 : (el?.getBoundingClientRect().top ?? 0) + window.scrollY
  gsap.to(window, { scrollTo: { y, autoKill: false }, duration: reduced ? 0 : 0.9, ease: 'power2.inOut', overwrite: true })
}

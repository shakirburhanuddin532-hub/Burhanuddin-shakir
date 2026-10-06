import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
gsap.defaults({ ease: 'power3.out', duration: 0.6, overwrite: 'auto' })
gsap.config({ nullTargetWarn: false })

/** Named eases: one vocabulary for the whole site. */
export const EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  beam: 'power1.inOut',
  settle: 'power3.out',
  none: 'none',
} as const

/** Durations in seconds. Timing never changes across profiles; amplitude and counts do. */
export const D = {
  micro: 0.18,
  short: 0.36,
  base: 0.6,
  slow: 1.0,
  beam: 1.6,
} as const

declare global {
  interface Window {
    ScrollTrigger?: typeof ScrollTrigger
  }
}
if (typeof window !== 'undefined') window.ScrollTrigger = ScrollTrigger

export { gsap, ScrollTrigger }

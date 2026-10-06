import type { Profile } from '@/animations/motion/types'

export type DemoMode = 'scrub' | 'autoplay' | 'stepped'

export interface DemoProps {
  /** paused master timeline; one second per step, labels pre-added at integer times */
  tl: gsap.core.Timeline
  mode: DemoMode
  profile: Profile
  reduced: boolean
  /** call once the demo has added its tweens */
  ready: () => void
}

/** Time (seconds) at which step `i` begins on the master timeline. */
export const stepAt = (i: number) => i
export const STEP = 1

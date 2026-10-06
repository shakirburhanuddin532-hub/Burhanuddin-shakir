import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { detectProfile, lowerProfile } from './profile'
import type { MotionPref, Profile } from './types'
import '@/animations/motion/gsap'

export interface MotionState {
  profile: Profile
  reduced: boolean
  pref: MotionPref
  setPref: (p: MotionPref) => void
  isTouch: boolean
  isDesktop: boolean
  /** called by the engine's frame-time probe */
  downgrade: () => void
}

const MotionContext = createContext<MotionState | null>(null)

export function MotionProvider({ children }: { children: ReactNode }) {
  const { reduced, pref, setPref } = useReducedMotion()
  const isTouch = useMediaQuery('(pointer: coarse)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [detected, setDetected] = useState<Profile>(() => detectProfile(false))

  useEffect(() => {
    setDetected((p) => (p === 'REDUCED_MOTION' ? detectProfile(false) : p))
  }, [])

  const downgrade = useCallback(() => setDetected((p) => lowerProfile(p)), [])
  const profile: Profile = reduced ? 'REDUCED_MOTION' : detected

  useEffect(() => {
    document.documentElement.dataset.profile = profile
  }, [profile])

  const value = useMemo<MotionState>(
    () => ({ profile, reduced, pref, setPref, isTouch, isDesktop, downgrade }),
    [profile, reduced, pref, setPref, isTouch, isDesktop, downgrade],
  )
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

export function useMotion(): MotionState {
  const ctx = useContext(MotionContext)
  if (!ctx) throw new Error('useMotion must be used inside MotionProvider')
  return ctx
}

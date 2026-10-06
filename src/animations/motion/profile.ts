import type { Profile } from './types'

interface NavigatorExtras {
  hardwareConcurrency?: number
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

/** One-time device heuristic. The engine can still downgrade at runtime from a frame-time probe. */
export function detectProfile(reduced: boolean): Profile {
  if (reduced) return 'REDUCED_MOTION'
  if (typeof window === 'undefined') return 'MEDIUM'
  const nav = navigator as Navigator & NavigatorExtras
  const cores = nav.hardwareConcurrency ?? 4
  const mem = nav.deviceMemory ?? 4
  const saveData = nav.connection?.saveData === true
  const slowNet = /2g/.test(nav.connection?.effectiveType ?? '')
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 768
  if (saveData || slowNet) return 'LOW'
  if (coarse || narrow) return cores >= 6 && mem >= 4 ? 'MEDIUM' : 'LOW'
  if (cores <= 2 || mem <= 2) return 'LOW'
  if (cores <= 4 || mem <= 4) return 'MEDIUM'
  return 'HIGH'
}

export const lowerProfile = (p: Profile): Profile => (p === 'HIGH' ? 'MEDIUM' : p === 'MEDIUM' ? 'LOW' : p)

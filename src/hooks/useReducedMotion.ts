import { useCallback, useEffect, useState } from 'react'
import type { MotionPref } from '@/animations/motion/types'

const KEY = 'shakir:motion'

function readPref(): MotionPref {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'reduced' || v === 'full' ? v : null
  } catch {
    return null
  }
}

/** prefers-reduced-motion OR the in-page toggle; an explicit user choice wins over the OS in both directions. */
export function useReducedMotion(): { reduced: boolean; pref: MotionPref; setPref: (p: MotionPref) => void } {
  const [os, setOs] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  )
  const [pref, setPrefState] = useState<MotionPref>(() => (typeof window !== 'undefined' ? readPref() : null))

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setOs(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setPref = useCallback((p: MotionPref) => {
    setPrefState(p)
    try {
      if (p) localStorage.setItem(KEY, p)
      else localStorage.removeItem(KEY)
    } catch {
      /* storage unavailable: in-memory only */
    }
  }, [])

  return { reduced: pref ? pref === 'reduced' : os, pref, setPref }
}

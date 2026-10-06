import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { gsap } from '@/animations/motion/gsap'

export type BeamVariant = 'intelligence' | 'warm' | 'trust'

export interface ShakirBeamHandle {
  /** head position 0..1 along the path */
  set: (p: number, alpha?: number) => void
  /** one time-based pass along the path */
  pass: (ms?: number) => gsap.core.Tween
  off: () => void
}

export interface ShakirBeamProps {
  /** SVG path `d` in the parent SVG's coordinate space */
  d: string
  variant?: BeamVariant
  /** travelling segment as a fraction of the path length */
  segment?: number
  width?: number
  className?: string
  style?: CSSProperties
  /** initial head position; omit for hidden */
  progress?: number
}

const GRADIENTS: Record<BeamVariant, [string, string]> = {
  intelligence: ['#5EC4E0', '#7A4FD1'],
  warm: ['#D9B26A', '#E0923A'],
  trust: ['#B9C2CC', '#5EC4E0'],
}

let gradientSeq = 0

/**
 * The signature beam for DOM/SVG surfaces (brief §08): a short bright segment
 * that travels along a path. Never a resting glow, never a border.
 */
export const ShakirBeam = forwardRef<ShakirBeamHandle, ShakirBeamProps>(function ShakirBeam(
  { d, variant = 'intelligence', segment = 0.14, width = 2, className, style, progress },
  ref,
) {
  const core = useRef<SVGPathElement>(null)
  const glow = useRef<SVGPathElement>(null)
  const state = useRef({ len: 0, p: progress ?? 0, alpha: progress === undefined ? 0 : 1 })
  const idRef = useRef(`beam-${++gradientSeq}`)

  const apply = () => {
    const { len, p, alpha } = state.current
    const seg = Math.max(8, len * segment)
    const offset = len * (1 - p) + seg
    for (const el of [core.current, glow.current]) {
      if (!el) continue
      el.style.strokeDasharray = `${seg} ${len + seg}`
      el.style.strokeDashoffset = `${offset}`
      el.style.opacity = String(alpha)
    }
  }

  useLayoutEffect(() => {
    const el = core.current
    if (!el) return
    try {
      state.current.len = el.getTotalLength()
    } catch {
      state.current.len = 1000
    }
    apply()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d])

  useImperativeHandle(ref, () => ({
    set(p, alpha = 1) {
      state.current.p = Math.max(0, Math.min(1, p))
      state.current.alpha = alpha
      apply()
    },
    pass(ms = 1400) {
      const s = state.current
      s.p = 0
      s.alpha = 1
      return gsap.to(s, {
        p: 1,
        duration: ms / 1000,
        ease: 'power1.inOut',
        overwrite: true,
        onUpdate: () => {
          s.alpha = s.p < 0.1 ? s.p / 0.1 : s.p > 0.85 ? (1 - s.p) / 0.15 : 1
          apply()
        },
        onComplete: () => {
          s.alpha = 0
          apply()
        },
      })
    },
    off() {
      state.current.alpha = 0
      apply()
    },
  }))

  const [c0, c1] = GRADIENTS[variant]
  return (
    <g className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={idRef.current} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c0} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
      </defs>
      <path ref={glow} d={d} fill="none" stroke={c0} strokeWidth={width * 3.5} strokeLinecap="round" style={{ opacity: 0, filter: 'blur(3px)', mixBlendMode: 'screen' }} />
      <path ref={core} d={d} fill="none" stroke={`url(#${idRef.current})`} strokeWidth={width} strokeLinecap="round" style={{ opacity: 0 }} />
    </g>
  )
})

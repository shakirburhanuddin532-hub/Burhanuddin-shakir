import { useEffect, useState } from 'react'
import { SCENE_RAIL } from '@/data/navigation'
import { seekTo } from '@/animations/scroll/useScene'
import { useMotion } from '@/animations/motion/MotionProvider'

/**
 * Desktop wayfinding for a very long page: a 1px rail with one tick per scene.
 * The beam's position on the rail is the page progress — the only place the beam rests.
 */
export function BeamRail() {
  const { reduced, isDesktop } = useMotion()
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState('hero')

  useEffect(() => {
    if (!isDesktop) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
      let cur = SCENE_RAIL[0].id
      for (const s of SCENE_RAIL) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) cur = s.id
      }
      setCurrent(cur)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [isDesktop])

  if (!isDesktop) return null
  return (
    <nav className="intro-hidden fixed top-1/2 right-6 z-40 -translate-y-1/2" aria-label="Page sections">
      <div className="relative h-[280px] w-px bg-slate">
        <div
          className="absolute left-0 w-px bg-gradient-to-b from-cyan to-violet opacity-60"
          style={{ top: 0, height: `${Math.round(progress * 100)}%` }}
          aria-hidden="true"
        />
        <ul className="absolute inset-0 m-0 list-none p-0">
          {SCENE_RAIL.map((s, i) => (
            <li key={s.id} className="absolute -left-[5px]" style={{ top: `${(i / (SCENE_RAIL.length - 1)) * 100}%` }}>
              <button
                type="button"
                onClick={() => seekTo(s.id, reduced)}
                aria-label={s.label}
                aria-current={current === s.id ? 'true' : undefined}
                className={`group block h-[11px] w-[11px] rotate-45 border transition-colors ${
                  current === s.id ? 'border-gold bg-gold' : 'border-slate bg-ink hover:border-mist-60'
                }`}
              >
                <span className="label pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 -rotate-45 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

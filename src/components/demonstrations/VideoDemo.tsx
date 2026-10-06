import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/animations/motion/gsap'
import { stepAt, type DemoProps } from './demoTypes'

const SCRIPT = [
  { tc: '00:00', line: 'Hands at the wheel. V.O. “Made twelve at a time.”', cam: 'slow push-in', dur: '8 s' },
  { tc: '00:08', line: 'A kiln door opens; heat on the lens.', cam: 'top-down', dur: '8 s' },
  { tc: '00:16', line: 'Glaze, poured. One bowl, then the rack.', cam: 'rack focus', dur: '8 s' },
  { tc: '00:24', line: 'The table, set. Title: twelve at a time.', cam: 'wide, static', dur: '6 s' },
]

/** Four low-poly storyboard frames drawn from facets (no footage in the demo). */
function Frame({ i, className = '' }: { i: number; className?: string }) {
  const tones = ['#2A2E36', '#3A3F49', '#1C1F25', '#E0923A', '#E8A07A', '#5B5346']
  const shapes = [
    ['0,100 100,100 70,40 30,45', '35,45 65,45 55,20 45,20', '50,10 60,20 40,20'],
    ['0,100 100,100 100,0 0,0', '25,15 75,15 75,85 25,85', '30,20 70,20 55,60 45,60'],
    ['0,100 100,100 60,55 40,60', '48,0 52,0 56,55 44,55', '30,80 70,80 60,70 40,70'],
    ['0,100 100,100 100,60 0,60', '10,60 90,60 85,50 15,50', '20,45 35,45 30,30 25,30', '60,45 80,45 75,28 65,28'],
  ]
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`h-full w-full ${className}`} aria-hidden="true">
      <rect width="100" height="100" fill="#15171b" />
      {shapes[i].map((pts, k) => (
        <polygon key={k} points={pts} fill={tones[(i + k * 2) % tones.length]} opacity={0.9} />
      ))}
    </svg>
  )
}

/** §15 — a production you can read: idea, script, storyboard, scenes, video. */
export default function VideoDemo({ tl, ready, reduced }: DemoProps) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      tl.fromTo('.v-idea', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, stepAt(0))
      tl.fromTo('.v-idea-text', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.5 }, stepAt(0) + 0.2)
      // script
      tl.to('.v-idea', { scale: 0.92, opacity: 0.6, duration: 0.2 }, stepAt(1))
      tl.fromTo('.v-line', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.18, stagger: 0.18 }, stepAt(1) + 0.05)
      // storyboard frames drop onto the rail
      tl.fromTo('.v-frame', { opacity: 0, y: -14, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.2, stagger: 0.17 }, stepAt(2))
      tl.fromTo('.v-rail-label', { opacity: 0 }, { opacity: 1, duration: 0.2 }, stepAt(2) + 0.1)
      // scenes: frames become clips with duration + camera notes
      tl.fromTo('.v-clip', { scaleX: 0.3 }, { scaleX: 1, duration: 0.25, stagger: 0.12 }, stepAt(3))
      tl.fromTo('.v-cam', { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.12 }, stepAt(3) + 0.15)
      // video: stage plays the sequence, playhead runs
      tl.to('.v-idea', { opacity: 0, duration: 0.15 }, stepAt(4))
      tl.to('.v-script', { opacity: 0.25, duration: 0.2 }, stepAt(4))
      tl.fromTo('.v-stage', { opacity: 0 }, { opacity: 1, duration: 0.15 }, stepAt(4))
      SCRIPT.forEach((_, i) => {
        const t = stepAt(4) + 0.1 + i * 0.2
        tl.fromTo(`.v-still-${i}`, { opacity: 0, scale: 1 }, { opacity: 1, scale: 1.05, duration: 0.22 }, t)
        if (i > 0) tl.to(`.v-still-${i - 1}`, { opacity: 0, duration: 0.12 }, t + 0.08)
      })
      tl.fromTo('.v-playhead', { left: '0%' }, { left: '100%', duration: 0.85 }, stepAt(4) + 0.1)
      tl.fromTo('.v-done', { opacity: 0 }, { opacity: 1, duration: 0.1 }, stepAt(4) + 0.88)
    }, root)
    ready()
    return () => ctx.revert()
  }, [tl, ready, reduced])

  return (
    <div ref={root} className="flex h-full flex-col gap-4" aria-label="Video AI demonstration">
      <div className="relative min-h-[220px] flex-1">
        {/* idea card */}
        <div className="v-idea absolute inset-x-0 top-0 mx-auto max-w-[520px] bg-charcoal px-5 py-4 shadow-[inset_0_0_0_1px_var(--color-slate)]" style={{ opacity: 0 }}>
          <span className="label block text-[9px] text-mist-40">Idea</span>
          <p className="v-idea-text font-display text-[14px] text-mist" style={{ clipPath: 'inset(0 100% 0 0)' }}>
            A 30-second launch film for small-batch ceramic tableware.
          </p>
        </div>
        {/* script */}
        <ol className="v-script absolute inset-x-0 top-[84px] m-0 flex list-none flex-col gap-2 p-0 sm:max-w-[520px] sm:mx-auto">
          {SCRIPT.map((s) => (
            <li key={s.tc} className="v-line flex gap-3 text-[12px] text-mist-60" style={{ opacity: 0 }}>
              <span className="mono text-amber-text">{s.tc}</span>
              <span>{s.line}</span>
            </li>
          ))}
        </ol>
        {/* video stage */}
        <div className="v-stage absolute inset-0 mx-auto max-w-[520px] overflow-hidden bg-ink shadow-[inset_0_0_0_1px_var(--color-slate)]" style={{ opacity: 0 }}>
          {SCRIPT.map((_, i) => (
            <div key={i} className={`v-still-${i} absolute inset-0`} style={{ opacity: 0 }}>
              <Frame i={i} />
            </div>
          ))}
          <span className="v-done label absolute right-3 bottom-3 text-[9px] text-mist" style={{ opacity: 0 }}>
            Rendered · 00:30
          </span>
        </div>
      </div>
      {/* editing rail */}
      <div className="relative">
        <span className="v-rail-label label mb-2 block text-[9px] text-mist-40" style={{ opacity: 0 }}>
          Timeline · 00:30
        </span>
        <div className="relative grid grid-cols-4 gap-1">
          {SCRIPT.map((s, i) => (
            <div key={s.tc} className="v-frame flex flex-col gap-1" style={{ opacity: 0 }}>
              <div className="h-[44px] overflow-hidden sm:h-[56px]">
                <Frame i={i} />
              </div>
              <div className="v-clip h-[6px] origin-left" style={{ background: 'var(--world-create)', opacity: 0.9 }} />
              <span className="v-cam mono text-[9px] text-mist-60" style={{ opacity: 0 }}>
                {s.dur} · {s.cam}
              </span>
            </div>
          ))}
          <span className="v-playhead pointer-events-none absolute top-0 bottom-0 w-px bg-mist" style={{ left: '0%' }} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

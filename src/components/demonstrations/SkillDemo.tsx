import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/animations/motion/gsap'
import { FeatureGem } from '@/components/features/FeatureGem'
import { stepAt, type DemoProps } from './demoTypes'

const LESSONS = [
  { n: '01', t: 'What a talk is for', m: '6 min' },
  { n: '02', t: 'One idea, three supports', m: '9 min' },
  { n: '03', t: 'A 3-minute talk, annotated', m: '7 min' },
  { n: '04', t: 'Record your 60-second version', m: '12 min' },
  { n: '05', t: 'Filler, pace, reading the slide', m: '6 min' },
  { n: '06', t: 'Questions you didn’t expect', m: '10 min' },
  { n: '07', t: 'Deliver a 5-minute talk and get feedback', m: '15 min' },
]
const R = 42 // percent of the stage half-size

/** §17 — seven low-poly lesson panels around one skill; a progress arc fills as each lands. */
export default function SkillDemo({ tl, ready, reduced }: DemoProps) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      LESSONS.forEach((_, i) => {
        const t = stepAt(i)
        tl.fromTo(`.sk-panel-${i}`, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3 }, t)
        tl.fromTo(`.sk-link-${i}`, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4 }, t + 0.15)
        tl.fromTo('.sk-arc', { strokeDashoffset: 1 - i / 7 }, { strokeDashoffset: 1 - (i + 1) / 7, duration: 0.5 }, t + 0.1)
        tl.fromTo(`.sk-row-${i}`, { opacity: 0.3 }, { opacity: 1, duration: 0.2 }, t)
        tl.fromTo('.sk-count', { textContent: i }, { textContent: i + 1, duration: 0.01, snap: { textContent: 1 } }, t + 0.5)
      })
      tl.fromTo('.sk-done', { opacity: 0 }, { opacity: 1, duration: 0.2 }, stepAt(6) + 0.6)
    }, root)
    ready()
    return () => ctx.revert()
  }, [tl, ready, reduced])

  const pos = (i: number) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2
    return { x: 50 + Math.cos(a) * R, y: 50 + Math.sin(a) * R }
  }

  return (
    <div ref={root} className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]" aria-label="Skill AI demonstration">
      {/* heptagon of panels (desktop) */}
      <div className="relative hidden aspect-square max-h-[480px] w-full justify-self-center lg:block">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="18" fill="none" stroke="var(--color-slate)" strokeWidth="0.6" />
          <circle
            className="sk-arc"
            cx="50"
            cy="50"
            r="18"
            fill="none"
            stroke="var(--world-learn)"
            strokeWidth="1.2"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
            transform="rotate(-90 50 50)"
          />
          {LESSONS.map((_, i) => {
            const a = pos(i)
            const b = pos((i + 1) % 7)
            return (
              <line
                key={i}
                className={`sk-link-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--world-learn)"
                strokeWidth="0.5"
                opacity="0.7"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1}
              />
            )
          })}
        </svg>
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
          <FeatureGem world="learn" slug="skill-ai" size={56} />
          <span className="font-display text-[12px] font-semibold text-mist">Public speaking</span>
          <span className="mono text-[10px] text-mist-60">
            <span className="sk-count">0</span> / 7 lessons
          </span>
        </div>
        {LESSONS.map((l, i) => {
          const p = pos(i)
          return (
            <div
              key={l.n}
              className={`sk-panel-${i} absolute flex w-[112px] -translate-x-1/2 -translate-y-1/2 flex-col bg-charcoal shadow-[inset_0_0_0_1px_var(--color-slate)]`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 0 }}
            >
              <div className="relative h-[52px] overflow-hidden">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
                  <polygon points="0,50 100,50 70,10 30,18" fill="#2A2E36" />
                  <polygon points="30,18 70,10 50,0 20,4" fill="#3FA99B" opacity="0.55" />
                  <polygon points="70,10 100,50 100,0" fill="#1C1F25" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="block h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-mist opacity-80" />
                </span>
                <span className="mono absolute top-1 left-1 text-[9px] text-teal-text">{l.n}</span>
              </div>
              <span className="px-2 py-1 text-[9.5px] leading-tight text-mist">{l.t}</span>
            </div>
          )
        })}
      </div>
      {/* list (all sizes; the only layout on phones) */}
      <ol className="m-0 flex list-none flex-col gap-2 p-0 self-center">
        {LESSONS.map((l, i) => (
          <li key={l.n} className={`sk-row-${i} flex items-center gap-3 border-b border-slate pb-2`} style={{ opacity: 0.3 }}>
            <span className="mono w-6 text-teal-text">{l.n}</span>
            <span className="flex-1 text-[13px] text-mist">{l.t}</span>
            <span className="mono text-[10px] text-mist-60">{l.m}</span>
          </li>
        ))}
        <li className="sk-done pt-2 text-[12px] text-mist-60" style={{ opacity: 0 }}>
          Final project scheduled: a 5-minute talk, feedback within the day. 65 min total.
        </li>
      </ol>
    </div>
  )
}

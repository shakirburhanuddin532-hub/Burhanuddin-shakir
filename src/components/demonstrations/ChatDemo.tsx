import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/animations/motion/gsap'
import { ShakirBeam, type ShakirBeamHandle } from '@/animations/beam/ShakirBeam'
import { FeatureGem } from '@/components/features/FeatureGem'
import type { WorldId } from '@/data/worlds'
import { stepAt, type DemoProps } from './demoTypes'

const ROWS: { slug: string; name: string; world: WorldId; action: string; result: string }[] = [
  { slug: 'research-ai', name: 'Research AI', world: 'learn', action: 'Check the market, comparable sellers, price band', result: '4 comparable sellers found · typical price $38–$64 per set' },
  { slug: 'business-ai', name: 'Business AI', world: 'build', action: 'Draft positioning and a simple model', result: 'Small-batch ceramic tableware for people who host' },
  { slug: 'website-builder-ai', name: 'Website Builder AI', world: 'create', action: 'Prepare a storefront', result: 'Storefront draft: 5 pages, waiting for your photos' },
  { slug: 'marketing-content-ai', name: 'Marketing & Content Creator AI', world: 'build', action: 'Write launch content', result: 'Launch post, 3 product descriptions, 1 email' },
  { slug: 'goal-to-action-ai', name: 'Goal-to-Action AI', world: 'build', action: 'Turn it into a 30-day plan', result: '12 tasks · first: photograph 6 pieces this week' },
]
const UNDERSTANDING = ['Goal · launch a business', 'Input · an idea (one line is enough)', 'Output · a plan, first assets, next actions']

/** §12 — one request, five capabilities, in order, with the next step approved by you. */
export default function ChatDemo({ tl, ready, reduced }: DemoProps) {
  const root = useRef<HTMLDivElement>(null)
  const beam = useRef<ShakirBeamHandle>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 0 · request types in
      tl.fromTo('.c-user', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.15 }, stepAt(0))
      tl.fromTo('.c-user-text', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.6 }, stepAt(0) + 0.15)
      // 1 · Shakir understands: beam traces the panel, three understanding lines
      const trace = { p: 0 }
      tl.fromTo(trace, { p: 0 }, { p: 1, duration: 0.5, onUpdate: () => beam.current?.set(trace.p, trace.p > 0.92 ? (1 - trace.p) / 0.08 : 1) }, stepAt(1))
      tl.fromTo('.c-und', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.2, stagger: 0.15 }, stepAt(1) + 0.3)
      tl.fromTo('.c-reply', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.2 }, stepAt(1) + 0.75)
      // 2–6 · capability rows
      ROWS.forEach((_, i) => {
        const t = stepAt(2 + i)
        tl.fromTo(`.c-row-${i}`, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25 }, t)
        tl.fromTo(`.c-res-${i}`, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.45 }, t + 0.3)
        tl.fromTo(`.c-gem-${i}`, { opacity: 0.25, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.3 }, t + 0.1)
        tl.fromTo(`.c-conn-${i}`, { '--fill': 0 }, { '--fill': 1, duration: 0.3 }, t + 0.05)
      })
      // 7 · next step waits for you
      tl.fromTo('.c-close', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 }, stepAt(7))
      tl.fromTo('.c-btn', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.12 }, stepAt(7) + 0.3)
    }, root)
    ready()
    return () => ctx.revert()
  }, [tl, ready, reduced])

  return (
    <div ref={root} className="grid h-full gap-5 lg:grid-cols-[minmax(0,1fr)_170px]" aria-label="Chat AI demonstration">
      <div className="relative flex min-h-[360px] flex-col gap-4 bg-graphite/70 p-4 shadow-[inset_0_0_0_1px_var(--color-slate)] sm:p-5">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1000 1000">
          <ShakirBeam ref={beam} d="M0,0 H1000 V1000 H0 Z" width={3} segment={0.12} />
        </svg>
        <div className="flex items-center justify-between">
          <span className="label text-[10px]">Shakir · Chat</span>
          <span className="label text-[10px] text-mist-40">Illustrative conversation</span>
        </div>
        <div className="hairline" />
        <div className="c-user flex justify-end" style={{ opacity: 0 }}>
          <p className="c-user-text max-w-[85%] bg-charcoal px-4 py-2 text-[14px] text-mist" style={{ clipPath: 'inset(0 100% 0 0)' }}>
            Help me turn my idea into a business.
          </p>
        </div>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {UNDERSTANDING.map((u) => (
            <li key={u} className="c-und mono text-[11px] text-mist-60" style={{ opacity: 0 }}>
              {u}
            </li>
          ))}
        </ul>
        <p className="c-reply text-[14px] text-mist" style={{ opacity: 0 }}>
          Here’s how I’d approach it:
        </p>
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {ROWS.map((r, i) => (
            <li key={r.slug} className={`c-row-${i} flex items-start gap-3`} style={{ opacity: 0 }}>
              <FeatureGem world={r.world} slug={r.slug} size={28} />
              <div className="flex min-w-0 flex-col">
                <span className="font-display text-[12px] font-semibold tracking-wide text-mist">
                  {r.name} <span className="font-normal text-mist-60">— {r.action}</span>
                </span>
                <span className={`c-res-${i} mono text-[11px]`} style={{ color: `var(--world-${r.world}-text)`, clipPath: 'inset(0 100% 0 0)' }}>
                  {r.result}
                </span>
              </div>
            </li>
          ))}
        </ol>
        <div className="c-close mt-auto flex flex-col gap-3" style={{ opacity: 0 }}>
          <p className="text-[14px] text-mist">Want me to start with research, or review the plan first?</p>
          <div className="flex flex-wrap gap-2">
            <span className="c-btn btn btn-ghost min-h-[34px] px-3 text-[10px]" style={{ opacity: 0 }}>
              Start with research
            </span>
            <span className="c-btn btn btn-ghost min-h-[34px] px-3 text-[10px]" style={{ opacity: 0 }}>
              Review the plan first
            </span>
          </div>
        </div>
      </div>
      <aside className="hidden flex-col items-center justify-center gap-2 lg:flex" aria-hidden="true">
        {ROWS.map((r, i) => (
          <div key={r.slug} className="flex flex-col items-center">
            <span className={`c-conn-${i} pipe-conn vertical h-5 w-px`} />
            <span className={`c-gem-${i} flex flex-col items-center gap-1`} style={{ opacity: 0.25 }}>
              <FeatureGem world={r.world} slug={r.slug} size={36} />
              <span className="label text-[9px]">{r.name.split(' ')[0]}</span>
            </span>
          </div>
        ))}
      </aside>
    </div>
  )
}

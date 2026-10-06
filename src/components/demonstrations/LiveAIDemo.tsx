import { Fragment, useLayoutEffect, useRef } from 'react'
import { gsap } from '@/animations/motion/gsap'
import { ShakirBeam, type ShakirBeamHandle } from '@/animations/beam/ShakirBeam'
import { stepAt, type DemoProps } from './demoTypes'

const VALUES = [12, 15, 14, 19, 22, 21, 26, 30, 28, 33, 37, 36, 41]

/** §20 — permission first, LIVE indicator on, guidance before action, action only when authorized, then verification. */
export default function LiveAIDemo({ tl, ready, reduced }: DemoProps) {
  const root = useRef<HTMLDivElement>(null)
  const beam = useRef<ShakirBeamHandle>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 0 · permission sheet, then Allow once → LIVE pill
      tl.fromTo('.l-ask', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25 }, stepAt(0))
      tl.fromTo('.l-sheet', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25 }, stepAt(0) + 0.25)
      tl.fromTo('.l-allow', { boxShadow: 'inset 0 0 0 1px var(--color-slate)' }, { boxShadow: 'inset 0 0 0 2px var(--color-gold)', duration: 0.15 }, stepAt(0) + 0.7)
      // 1 · see: sheet closes, LIVE on, beam traces the window
      tl.to('.l-sheet', { opacity: 0, y: -6, duration: 0.15 }, stepAt(1))
      tl.fromTo('.l-live', { opacity: 0 }, { opacity: 1, duration: 0.15 }, stepAt(1) + 0.1)
      const trace = { p: 0 }
      tl.fromTo(trace, { p: 0 }, { p: 1, duration: 0.6, onUpdate: () => beam.current?.set(trace.p, trace.p > 0.9 ? (1 - trace.p) / 0.1 : 1) }, stepAt(1) + 0.2)
      // 2 · understand
      tl.fromTo('.l-callout', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25 }, stepAt(2))
      tl.fromTo('.l-colC', { backgroundColor: 'rgba(224,146,58,0)' }, { backgroundColor: 'rgba(224,146,58,0.25)', duration: 0.3 }, stepAt(2) + 0.2)
      // 3 · guide
      tl.fromTo('.l-ring', { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.3 }, stepAt(3))
      tl.fromTo('.l-guide', { opacity: 0 }, { opacity: 1, duration: 0.25 }, stepAt(3) + 0.2)
      tl.to('.l-callout', { opacity: 0, duration: 0.15 }, stepAt(3))
      // 4 · authorized action
      tl.fromTo('.l-apply', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25 }, stepAt(4))
      tl.fromTo('.l-apply-btn', { boxShadow: 'inset 0 0 0 1px var(--color-slate)' }, { boxShadow: 'inset 0 0 0 2px var(--color-gold)', duration: 0.15 }, stepAt(4) + 0.5)
      tl.to('.l-apply', { opacity: 0, duration: 0.15 }, stepAt(4) + 0.8)
      tl.fromTo('.l-range-old', { opacity: 1 }, { opacity: 0, duration: 0.1 }, stepAt(4) + 0.85)
      tl.fromTo('.l-range-new', { opacity: 0 }, { opacity: 1, duration: 0.1 }, stepAt(4) + 0.9)
      tl.to('.l-ring', { opacity: 0, duration: 0.1 }, stepAt(4) + 0.9)
      // 5 · verify: chart draws, verified line, sharing ends
      tl.to('.l-guide', { opacity: 0, duration: 0.1 }, stepAt(5))
      tl.fromTo('.l-chart-line', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5 }, stepAt(5) + 0.05)
      tl.fromTo('.l-pt', { opacity: 0 }, { opacity: 1, duration: 0.05, stagger: 0.035 }, stepAt(5) + 0.1)
      tl.fromTo('.l-verified', { opacity: 0 }, { opacity: 1, duration: 0.2 }, stepAt(5) + 0.6)
      tl.fromTo('.l-live-on', { opacity: 1 }, { opacity: 0, duration: 0.1 }, stepAt(5) + 0.85)
      tl.fromTo('.l-live-off', { opacity: 0 }, { opacity: 1, duration: 0.1 }, stepAt(5) + 0.88)
      if (!reduced) gsap.to('.l-dot', { opacity: 0.25, duration: 0.5, repeat: -1, yoyo: true, ease: 'power1.inOut' })
    }, root)
    ready()
    return () => ctx.revert()
  }, [tl, ready, reduced])

  const path = VALUES.map((v, i) => `${8 + i * 7},${60 - v}`).join(' L')
  return (
    <div ref={root} className="flex h-full flex-col gap-3" aria-label="Live AI demonstration">
      <p className="l-ask text-[13px] text-mist" style={{ opacity: 0 }}>
        <span className="label mr-2 text-[9px] text-mist-40">You</span>Why is this chart empty?
      </p>
      {/* device frame */}
      <div className="relative mx-auto w-full max-w-[620px] flex-1">
        <div className="relative h-full min-h-[300px] overflow-hidden bg-charcoal shadow-[inset_0_0_0_1px_var(--color-slate)]" style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1000 1000">
            <ShakirBeam ref={beam} d="M2,2 H998 V998 H2 Z" width={4} segment={0.12} />
          </svg>
          {/* window chrome */}
          <div className="flex items-center justify-between border-b border-slate px-3 py-1.5">
            <span className="mono text-[10px] text-mist-60">Q3 sales.sheet</span>
            <span className="l-live relative flex items-center gap-2" style={{ opacity: 0 }}>
              <span className="l-live-on flex items-center gap-2 bg-ink px-2 py-[2px]">
                <span className="l-dot h-[7px] w-[7px] rounded-full bg-[#E04848]" />
                <span className="label text-[9px] text-mist">LIVE · Window shared</span>
              </span>
              <span className="l-live-off absolute inset-0 flex items-center gap-2 bg-ink px-2 py-[2px]" style={{ opacity: 0 }}>
                <span className="h-[7px] w-[7px] rounded-full bg-mist-40" />
                <span className="label text-[9px] text-mist-60">ENDED · Sharing ended</span>
              </span>
            </span>
          </div>
          <div className="grid grid-cols-[1fr_1.1fr] gap-3 p-3">
            {/* sheet grid */}
            <div className="mono text-[9px]">
              <div className="grid grid-cols-[18px_1fr_1fr_1fr] gap-px bg-slate">
                {['', 'B', 'C', 'D'].map((h) => (
                  <span key={h} className="bg-charcoal px-1 text-mist-40">{h}</span>
                ))}
                {Array.from({ length: 8 }).map((_, r) => (
                  <Fragment key={r}>
                    <span className="bg-charcoal px-1 text-mist-40">{r + 1}</span>
                    <span className="bg-ink px-1 text-mist-60">{r === 0 ? 'Week' : `W${r}`}</span>
                    <span className="l-colC bg-ink px-1 text-mist-40">{r === 0 ? 'Target' : ''}</span>
                    <span className="bg-ink px-1 text-mist">{r === 0 ? 'Sales' : VALUES[r - 1]}</span>
                  </Fragment>
                ))}
              </div>
              <div className="relative mt-2 flex items-center gap-2">
                <span className="text-mist-40">range</span>
                <span className="relative bg-ink px-1 text-mist">
                  <span className="l-range-old">C2:C14</span>
                  <span className="l-range-new absolute inset-0 px-1 text-gold-text" style={{ opacity: 0 }}>D2:D14</span>
                  <span className="l-ring pointer-events-none absolute -inset-[5px] border border-gold" style={{ opacity: 0 }} />
                </span>
              </div>
            </div>
            {/* chart */}
            <div className="relative bg-ink p-2">
              <span className="label text-[8px] text-mist-40">Sales by week</span>
              <svg viewBox="0 0 100 64" className="mt-1 h-[120px] w-full" aria-hidden="true">
                <line x1="8" y1="60" x2="96" y2="60" stroke="var(--color-slate)" strokeWidth="0.6" />
                <path className="l-chart-line" d={`M${path}`} fill="none" stroke="var(--world-act)" strokeWidth="1.2" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
                {VALUES.map((v, i) => (
                  <circle key={i} className="l-pt" cx={8 + i * 7} cy={60 - v} r="1.2" fill="#F2F1EC" style={{ opacity: 0 }} />
                ))}
              </svg>
              <p className="l-verified mono mt-1 text-[9.5px] text-trust-text" style={{ opacity: 0 }}>
                Verified: chart shows 13 values.
              </p>
            </div>
          </div>
          {/* callouts */}
          <p className="l-callout absolute bottom-3 left-3 max-w-[300px] bg-ink/95 px-3 py-2 text-[11px] text-mist shadow-[inset_0_0_0_1px_var(--color-slate)]" style={{ opacity: 0 }}>
            The chart range points at column C, which is empty. Your values are in D2:D14.
          </p>
          <p className="l-guide absolute bottom-3 left-3 max-w-[300px] bg-ink/95 px-3 py-2 text-[11px] text-mist shadow-[inset_0_0_0_1px_var(--color-slate)]" style={{ opacity: 0 }}>
            Change the range to D2:D14, or I can do it for you.
          </p>
          {/* permission sheet */}
          <div className="l-sheet absolute inset-x-6 top-10 mx-auto max-w-[360px] bg-ink p-4 shadow-[inset_0_0_0_1px_var(--color-slate)]" style={{ opacity: 0 }}>
            <p className="text-[12px] text-mist">Shakir Live wants to view this window.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="l-allow label px-3 py-2 text-[9px] text-mist" style={{ boxShadow: 'inset 0 0 0 1px var(--color-slate)' }}>Allow once</span>
              <span className="label px-3 py-2 text-[9px] text-mist-60" style={{ boxShadow: 'inset 0 0 0 1px var(--color-slate)' }}>Always ask</span>
              <span className="label px-3 py-2 text-[9px] text-mist-60" style={{ boxShadow: 'inset 0 0 0 1px var(--color-slate)' }}>Don’t allow</span>
            </div>
          </div>
          <div className="l-apply absolute inset-x-6 top-10 mx-auto max-w-[360px] bg-ink p-4 shadow-[inset_0_0_0_1px_var(--color-slate)]" style={{ opacity: 0 }}>
            <p className="text-[12px] text-mist">Apply this change? Range → D2:D14</p>
            <div className="mt-3 flex gap-2">
              <span className="l-apply-btn label px-3 py-2 text-[9px] text-mist" style={{ boxShadow: 'inset 0 0 0 1px var(--color-slate)' }}>Apply</span>
              <span className="label px-3 py-2 text-[9px] text-mist-60" style={{ boxShadow: 'inset 0 0 0 1px var(--color-slate)' }}>I’ll do it myself</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-mist-60">Screen and device access is permission-based: Shakir sees only the window you share, for as long as you share it.</p>
    </div>
  )
}

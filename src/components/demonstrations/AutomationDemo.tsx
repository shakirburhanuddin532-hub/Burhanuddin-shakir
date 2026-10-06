import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/animations/motion/gsap'
import { stepAt, type DemoProps } from './demoTypes'

const NODES = [
  { kind: 'Trigger', text: 'New order received (store)' },
  { kind: 'Condition', text: 'Order total ≥ $150?' },
  { kind: 'Action', text: 'Create express shipping label (carrier)' },
  { kind: 'Action', text: 'Send thank-you email with tracking' },
  { kind: 'Verify', text: 'Label created · email delivered' },
  { kind: 'Complete', text: 'Run finished · 3.8 s · log available' },
]

/** §19 — a workflow you can read; the beam is the connector, the branch not taken stays dim. */
export default function AutomationDemo({ tl, ready, reduced }: DemoProps) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      NODES.forEach((_, i) => {
        const t = stepAt(i)
        tl.fromTo(`.a-node-${i}`, { opacity: 0.3, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.25 }, t)
        if (i > 0) tl.fromTo(`.a-conn-${i - 1}`, { '--fill': 0 }, { '--fill': 1, duration: 0.35 }, t - 0.3)
      })
      tl.fromTo('.a-branch', { opacity: 0 }, { opacity: 1, duration: 0.25 }, stepAt(1) + 0.3)
      tl.fromTo('.a-yes', { opacity: 0.4 }, { opacity: 1, duration: 0.2 }, stepAt(1) + 0.6)
      tl.fromTo('.a-check', { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.2, stagger: 0.25 }, stepAt(4) + 0.25)
      tl.fromTo('.a-ok', { scale: 0 }, { scale: 1, duration: 0.3 }, stepAt(5) + 0.3)
      tl.fromTo('.a-log', { opacity: 0 }, { opacity: 1, duration: 0.2 }, stepAt(5) + 0.5)
    }, root)
    ready()
    return () => ctx.revert()
  }, [tl, ready, reduced])

  return (
    <div ref={root} className="flex h-full flex-col justify-center gap-6" aria-label="Automation AI demonstration">
      <ol className="m-0 grid list-none grid-cols-1 gap-0 p-0 lg:grid-cols-6">
        {NODES.map((n, i) => (
          <li key={i} className="flex flex-col items-stretch lg:flex-row lg:items-center">
            <div
              className={`a-node-${i} relative flex min-h-[86px] flex-1 flex-col gap-1 bg-charcoal px-3 py-2 shadow-[inset_0_0_0_1px_var(--color-slate)]`}
              style={{ opacity: 0.3, clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            >
              <span className="label text-[9px]" style={{ color: n.kind === 'Verify' ? 'var(--world-trust-text)' : n.kind === 'Complete' ? 'var(--color-gold-text)' : 'var(--world-act-text)' }}>
                {n.kind}
              </span>
              <span className="text-[11.5px] leading-snug text-mist">{n.text}</span>
              {i === 4 && (
                <span className="mt-1 flex flex-col gap-[2px]">
                  {['label created', 'email delivered'].map((c) => (
                    <span key={c} className="a-check mono flex items-center gap-1 text-[9.5px] text-trust-text" style={{ opacity: 0 }}>
                      <span aria-hidden="true">✓</span> {c}
                    </span>
                  ))}
                </span>
              )}
              {i === 5 && (
                <span className="a-ok absolute top-2 right-3 h-3 w-3 rotate-45 bg-gold" style={{ transform: 'rotate(45deg) scale(0)' }} aria-hidden="true" />
              )}
            </div>
            {i < NODES.length - 1 && (
              <span className={`a-conn-${i} pipe-conn vertical ml-6 h-6 w-px lg:ml-0 lg:h-px lg:w-5`} aria-hidden="true" />
            )}
            {i === 1 && (
              <span className="a-branch mono absolute hidden text-[9px] text-mist-40 lg:block" style={{ opacity: 0, transform: 'translate(8px, 58px)' }}>
                <span className="a-yes text-violet-text" style={{ opacity: 0.4 }}>
                  yes →
                </span>
                <br />
                no → standard shipping
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="a-log mono text-[11px] text-mist-60" style={{ opacity: 0 }}>
        14:02:11 trigger · 14:02:11 condition yes · 14:02:12 label 1Z…84 · 14:02:14 email sent · 14:02:15 verified · complete
      </p>
    </div>
  )
}

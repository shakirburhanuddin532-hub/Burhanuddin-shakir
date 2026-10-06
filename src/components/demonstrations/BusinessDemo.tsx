import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/animations/motion/gsap'
import { stepAt, type DemoProps } from './demoTypes'

const WEEKS = [12, 18, 23, 31, 38, 52, 61, 74]
const chartPath = (() => {
  const pts = WEEKS.map((v, i) => `${10 + i * 11.4},${90 - v}`)
  return `M${pts.join(' L')}`
})()

/** §18 — one idea carried through eight connected stages on one stage. */
export default function BusinessDemo({ tl, ready, reduced }: DemoProps) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const layers = ['idea', 'market', 'customer', 'positioning', 'website', 'content', 'campaign', 'analytics']
      layers.forEach((l, i) => {
        tl.fromTo(`.b-${l}`, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, stepAt(i))
        if (i > 0) tl.to(`.b-${layers[i - 1]}`, { opacity: 0, y: -12, duration: 0.25 }, stepAt(i))
        tl.fromTo(`.b-crumb-${i}`, { opacity: 0.3 }, { opacity: 1, duration: 0.2 }, stepAt(i))
      })
      tl.fromTo('.b-bar', { scaleX: 0 }, { scaleX: 1, duration: 0.4, stagger: 0.15 }, stepAt(1) + 0.2)
      tl.fromTo('.b-dot', { scale: 0 }, { scale: 1, duration: 0.3 }, stepAt(3) + 0.4)
      tl.fromTo('.b-block', { opacity: 0 }, { opacity: 1, duration: 0.15, stagger: 0.08 }, stepAt(4) + 0.2)
      tl.fromTo('.b-card', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.2, stagger: 0.15 }, stepAt(5) + 0.2)
      tl.fromTo('.b-send', { scale: 0 }, { scale: 1, duration: 0.15, stagger: 0.1 }, stepAt(6) + 0.3)
      tl.fromTo('.b-line', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6 }, stepAt(7) + 0.2)
      tl.fromTo('.b-pt', { opacity: 0 }, { opacity: 1, duration: 0.05, stagger: 0.07 }, stepAt(7) + 0.25)
    }, root)
    ready()
    return () => ctx.revert()
  }, [tl, ready, reduced])

  const crumbs = ['Idea', 'Market', 'Customer', 'Positioning', 'Website', 'Content', 'Campaign', 'Analytics']
  return (
    <div ref={root} className="flex h-full flex-col gap-4" aria-label="Business AI demonstration">
      <ol className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0">
        {crumbs.map((c, i) => (
          <li key={c} className={`b-crumb-${i} mono text-[10px] text-blue-text`} style={{ opacity: 0.3 }}>
            {c}
            {i < crumbs.length - 1 && <span className="ml-3 text-mist-40">→</span>}
          </li>
        ))}
      </ol>
      <div className="relative min-h-[300px] flex-1">
        <div className="b-idea absolute inset-x-0 top-6 mx-auto max-w-[460px] bg-charcoal px-5 py-4 shadow-[inset_0_0_0_1px_var(--color-slate)]" style={{ opacity: 0 }}>
          <span className="label block text-[9px] text-mist-40">Idea</span>
          <p className="font-display text-[15px] text-mist">A subscription for single-farm specialty coffee.</p>
        </div>

        <div className="b-market absolute inset-x-0 top-0 flex flex-col gap-3" style={{ opacity: 0 }}>
          <span className="label text-[9px] text-mist-40">Market · illustrative</span>
          {[
            ['Specialty coffee at home', 78],
            ['Coffee subscriptions', 54],
            ['Single-origin buyers', 36],
          ].map(([l, w]) => (
            <div key={l as string} className="flex items-center gap-3">
              <span className="w-[160px] text-[12px] text-mist-60">{l}</span>
              <span className="b-bar h-[14px] origin-left" style={{ width: `${w}%`, background: 'var(--world-build)', opacity: 0.85, clipPath: 'polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }} />
            </div>
          ))}
        </div>

        <div className="b-customer absolute inset-x-0 top-0 mx-auto max-w-[460px] bg-charcoal p-5 shadow-[inset_0_0_0_1px_var(--color-slate)]" style={{ opacity: 0 }}>
          <span className="label block text-[9px] text-mist-40">Customer</span>
          <p className="font-display text-[14px] text-mist">Home brewers, 28–45</p>
          <p className="text-[12px] text-mist-60">Buy two bags a month. Care where it was grown. Want the farm’s story with the beans.</p>
        </div>

        <div className="b-positioning absolute inset-0 mx-auto max-w-[420px]" style={{ opacity: 0 }}>
          <span className="label text-[9px] text-mist-40">Positioning</span>
          <svg viewBox="0 0 100 100" className="mt-2 h-[240px] w-full" aria-hidden="true">
            <line x1="50" y1="5" x2="50" y2="95" stroke="var(--color-slate)" strokeWidth="0.6" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="var(--color-slate)" strokeWidth="0.6" />
            <text x="52" y="9" fontSize="4" fill="#A7ABB4">origin transparency ↑</text>
            <text x="68" y="54" fontSize="4" fill="#A7ABB4">price →</text>
            <circle className="b-dot" cx="76" cy="22" r="4" fill="var(--world-build)" style={{ transformOrigin: '76px 22px' }} />
            <text x="60" y="34" fontSize="4" fill="#F2F1EC">our idea</text>
          </svg>
        </div>

        <div className="b-website absolute inset-x-0 top-0 mx-auto max-w-[460px] bg-[#E9E5DD] p-3 text-[#0E0F12]" style={{ opacity: 0 }}>
          <div className="b-block mb-2 flex justify-between text-[9px] uppercase tracking-widest">
            <span>Farmline</span>
            <span>Beans · Farms · Subscribe</span>
          </div>
          <div className="b-block mb-2 h-[60px] bg-[#B89B5E]/40" />
          <div className="grid grid-cols-3 gap-2">
            {['Finca Aurora', 'La Loma', 'Sítio Verde'].map((n) => (
              <div key={n} className="b-block flex flex-col gap-1">
                <div className="h-[36px] bg-[#9A8E7A]/40" />
                <span className="text-[9px]">{n}</span>
              </div>
            ))}
          </div>
          <div className="b-block mt-2 inline-block bg-[#0E0F12] px-3 py-1 text-[9px] text-[#E9E5DD]">Subscribe · from $18 / month</div>
        </div>

        <div className="b-content absolute inset-x-0 top-0 grid gap-3 sm:grid-cols-3" style={{ opacity: 0 }}>
          {[
            ['Launch email', 'Twelve farms. One subscription. The first bag ships Friday.'],
            ['Farm story post', 'Finca Aurora, 1,900 m. Washed, dried on raised beds, picked by hand.'],
            ['Product description', '250 g, roasted to order. Notes of plum and brown sugar.'],
          ].map(([t, b]) => (
            <div key={t} className="b-card bg-charcoal p-3 shadow-[inset_0_0_0_1px_var(--color-slate)]" style={{ opacity: 0 }}>
              <span className="label block text-[9px] text-blue-text">{t}</span>
              <p className="mt-1 text-[11.5px] text-mist-60">{b}</p>
            </div>
          ))}
        </div>

        <div className="b-campaign absolute inset-x-0 top-0" style={{ opacity: 0 }}>
          <span className="label text-[9px] text-mist-40">Campaign · four weeks</span>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w, i) => (
              <div key={w} className="flex flex-col gap-2 border-t border-slate pt-2">
                <span className="mono text-[10px] text-mist-60">{w}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 7 }).map((_, d) => (
                    <span
                      key={d}
                      className={`${[1, 4].includes(d) || (i === 3 && d === 5) ? 'b-send' : ''} h-[10px] w-[10px] rotate-45`}
                      style={{ background: [1, 4].includes(d) || (i === 3 && d === 5) ? 'var(--world-build)' : 'var(--color-slate)' }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-mist-60">{['Teaser + email', 'Launch', 'Farm stories', 'Offer ends'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="b-analytics absolute inset-0" style={{ opacity: 0 }}>
          <span className="label text-[9px] text-mist-40">Analytics · weekly sign-ups (illustrative)</span>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-2 h-[240px] w-full" aria-hidden="true">
            <line x1="10" y1="90" x2="92" y2="90" stroke="var(--color-slate)" strokeWidth="0.5" />
            <path className="b-line" d={chartPath} fill="none" stroke="var(--world-build)" strokeWidth="1.2" pathLength={1} strokeDasharray={1} strokeDashoffset={1} vectorEffect="non-scaling-stroke" />
            {WEEKS.map((v, i) => (
              <g key={i} className="b-pt" style={{ opacity: 0 }}>
                <circle cx={10 + i * 11.4} cy={90 - v} r="1.4" fill="#F2F1EC" />
                <text x={10 + i * 11.4} y={96} fontSize="3.2" fill="#A7ABB4" textAnchor="middle">
                  w{i + 1}
                </text>
                <text x={10 + i * 11.4} y={90 - v - 4} fontSize="3" fill="#7EA2F5" textAnchor="middle">
                  {v}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}

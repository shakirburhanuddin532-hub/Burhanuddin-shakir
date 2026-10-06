import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/animations/motion/gsap'
import { stepAt, type DemoProps } from './demoTypes'

const TOKENS = [
  '--color-ink      #0E0F12',
  '--color-stone    #E9E5DD',
  '--color-brass    #B89B5E',
  'font-display     "Cormorant Garamond" 600',
  'font-body        "Inter" 400',
  'space            8px scale',
  'radius           0',
  'grid             12 col / 80px gutter',
]
const CHIPS = ['Sector · architecture studio', 'Tone · quiet, material, editorial', 'Pages · Home, Projects, Studio, Process, Contact']
const PROJECTS = ['Hillside House, 2024', 'Reading Room, 2023', 'Court House, 2022', 'Studio Annex, 2021']
const CHECKS = ['7 sections', '4 images', '3 breakpoints', 'links, contrast and mobile layout checked']

/** Low-poly "photograph": facets in stone, brass and ink. Stands in for licensed imagery. */
function Facets({ seed }: { seed: number }) {
  const tones = ['#D6D0C4', '#C9C1B2', '#B89B5E', '#9A8E7A', '#2A2B30', '#E9E5DD']
  const polys: string[] = []
  const pts = [
    [0, 0],
    [40 + (seed % 3) * 10, 0],
    [100, 0],
    [100, 45 + seed * 7],
    [100, 100],
    [55 - seed * 5, 100],
    [0, 100],
    [0, 55 - seed * 6],
    [48 + seed * 4, 52 - seed * 3],
  ]
  for (let i = 0; i < 8; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % 8]
    polys.push(`${a[0]},${a[1]} ${b[0]},${b[1]} ${pts[8][0]},${pts[8][1]}`)
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      {polys.map((p, i) => (
        <polygon key={i} points={p} fill={tones[(i + seed) % tones.length]} />
      ))}
    </svg>
  )
}

/** §13 — from a sentence to a site: system, components, images, copy, motion, three breakpoints. */
export default function WebsiteBuilderDemo({ tl, ready, reduced }: DemoProps) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 0 · prompt
      tl.fromTo('.wb-prompt', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.7 }, stepAt(0) + 0.1)
      tl.fromTo('.wb-caret', { opacity: 0 }, { opacity: 1, duration: 0.1 }, stepAt(0))
      // 1 · understands
      tl.fromTo('.wb-chip', { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.2, stagger: 0.18 }, stepAt(1) + 0.1)
      // 2 · design system: tokens list, the canvas takes the stone ground
      tl.fromTo('.wb-token', { opacity: 0, x: -4 }, { opacity: 1, x: 0, duration: 0.12, stagger: 0.09 }, stepAt(2))
      tl.fromTo('.wb-site', { backgroundColor: '#15171b' }, { backgroundColor: '#E9E5DD', duration: 0.5 }, stepAt(2) + 0.3)
      // 3 · components appear as named wireframes
      tl.fromTo('.wb-block', { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.18, stagger: 0.1 }, stepAt(3))
      tl.fromTo('.wb-blabel', { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.1 }, stepAt(3) + 0.05)
      // 4 · images
      tl.fromTo('.wb-img', { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.12 }, stepAt(4))
      tl.to('.wb-blabel', { opacity: 0, duration: 0.2 }, stepAt(4) + 0.5)
      // 5 · copy
      tl.fromTo('.wb-copy', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.35, stagger: 0.12 }, stepAt(5))
      // 6 · animations activate: the mini-site plays its own entrance
      tl.fromTo('.wb-hero-text', { y: 10, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.3 }, stepAt(6))
      tl.fromTo('.wb-tile', { y: 8, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.25, stagger: 0.08 }, stepAt(6) + 0.1)
      tl.fromTo('.wb-rule', { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, stepAt(6) + 0.2)
      // 7 · responsive preview: desktop → tablet → phone
      tl.fromTo('.wb-frame', { width: '100%' }, { width: '62%', duration: 0.35 }, stepAt(7))
      tl.to('.wb-frame', { width: '34%', duration: 0.35 }, stepAt(7) + 0.5)
      tl.fromTo('.wb-bp', { opacity: 0 }, { opacity: 1, duration: 0.1, stagger: 0.4 }, stepAt(7))
      // 8 · complete: back to desktop with the checklist
      tl.to('.wb-frame', { width: '100%', duration: 0.3 }, stepAt(8))
      tl.fromTo('.wb-check', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.2, stagger: 0.12 }, stepAt(8) + 0.2)
    }, root)
    ready()
    return () => ctx.revert()
  }, [tl, ready, reduced])

  return (
    <div ref={root} className="grid h-full gap-5 lg:grid-cols-[230px_minmax(0,1fr)]" aria-label="Website Builder demonstration">
      <div className="flex flex-col gap-4">
        <div className="bg-charcoal px-3 py-2 shadow-[inset_0_0_0_1px_var(--color-slate)]">
          <span className="label block text-[9px] text-mist-40">Prompt</span>
          <p className="font-display text-[13px] text-mist">
            <span className="wb-prompt inline-block" style={{ clipPath: 'inset(0 100% 0 0)' }}>
              Build a luxury architecture website.
            </span>
            <span className="wb-caret ml-[2px] inline-block h-[14px] w-[2px] translate-y-[2px] bg-gold" style={{ opacity: 0 }} />
          </p>
        </div>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {CHIPS.map((c) => (
            <li key={c} className="wb-chip mono text-[11px] text-mist-60" style={{ opacity: 0 }}>
              {c}
            </li>
          ))}
        </ul>
        <div>
          <span className="label block text-[9px] text-mist-40">Design system</span>
          <ul className="m-0 mt-1 flex list-none flex-col gap-[3px] p-0">
            {TOKENS.map((t) => (
              <li key={t} className="wb-token mono whitespace-pre text-[10.5px] text-amber-text" style={{ opacity: 0 }}>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <ul className="m-0 mt-auto flex list-none flex-col gap-1 p-0">
          {CHECKS.map((c) => (
            <li key={c} className="wb-check flex items-center gap-2 text-[11px] text-mist-60" style={{ opacity: 0 }}>
              <span className="inline-block h-[6px] w-[6px] rotate-45 bg-gold" aria-hidden="true" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-h-[340px] flex-col gap-2">
        <div className="flex items-center gap-4">
          {['Desktop 1120', 'Tablet 768', 'Mobile 390'].map((b) => (
            <span key={b} className="wb-bp label text-[9px]" style={{ opacity: 0 }}>
              {b}
            </span>
          ))}
        </div>
        <div className="flex flex-1 items-start justify-center">
          <div className="wb-frame @container w-full" style={{ width: '100%' }}>
            <div className="flex h-[22px] items-center gap-1 bg-charcoal px-2 shadow-[inset_0_0_0_1px_var(--color-slate)]">
              <span className="h-[6px] w-[6px] rounded-full bg-slate" />
              <span className="h-[6px] w-[6px] rounded-full bg-slate" />
              <span className="mono ml-2 text-[9px] text-mist-40">halden-architecture.example</span>
            </div>
            <div className="wb-site relative overflow-hidden text-[#0E0F12]" style={{ backgroundColor: '#15171b' }}>
              {/* nav */}
              <div className="wb-block relative flex items-center justify-between px-4 py-2 @md:px-6" style={{ opacity: 0 }}>
                <span className="wb-blabel absolute top-1 left-2 text-[8px] tracking-wider text-[#9A8E7A] uppercase" style={{ opacity: 0 }}>Nav</span>
                <span className="wb-copy font-display text-[11px] font-bold tracking-[0.3em]" style={{ clipPath: 'inset(0 100% 0 0)' }}>HALDEN</span>
                <span className="wb-copy hidden gap-3 text-[8px] tracking-wider uppercase @md:flex" style={{ clipPath: 'inset(0 100% 0 0)' }}>
                  <span>Projects</span><span>Studio</span><span>Process</span><span>Contact</span>
                </span>
                <span className="wb-rule absolute right-4 bottom-0 left-4 h-px origin-left bg-[#B89B5E]" style={{ transform: 'scaleX(0)' }} />
              </div>
              {/* hero */}
              <div className="wb-block relative grid gap-3 px-4 py-4 @md:grid-cols-[1.1fr_1fr] @md:px-6" style={{ opacity: 0 }}>
                <span className="wb-blabel absolute top-1 left-2 text-[8px] tracking-wider text-[#9A8E7A] uppercase" style={{ opacity: 0 }}>Hero</span>
                <div className="wb-hero-text flex flex-col justify-center gap-2">
                  <p className="wb-copy font-display text-[18px] leading-tight @md:text-[22px]" style={{ clipPath: 'inset(0 100% 0 0)', fontFamily: 'Georgia, serif' }}>
                    Buildings that hold light.
                  </p>
                  <p className="wb-copy text-[9px] leading-snug text-[#4a4a4a]" style={{ clipPath: 'inset(0 100% 0 0)' }}>
                    Residential and cultural architecture, designed from the site outward.
                  </p>
                </div>
                <div className="wb-img h-[72px] overflow-hidden @md:h-[96px]" style={{ opacity: 0 }}>
                  <Facets seed={2} />
                </div>
              </div>
              {/* project grid */}
              <div className="wb-block relative grid grid-cols-2 gap-2 px-4 pb-3 @md:grid-cols-4 @md:px-6" style={{ opacity: 0 }}>
                <span className="wb-blabel absolute -top-1 left-2 text-[8px] tracking-wider text-[#9A8E7A] uppercase" style={{ opacity: 0 }}>ProjectGrid (4)</span>
                {PROJECTS.map((p, i) => (
                  <div key={p} className="wb-tile flex flex-col gap-1">
                    <div className="wb-img h-[44px] overflow-hidden @md:h-[56px]" style={{ opacity: 0 }}>
                      <Facets seed={i} />
                    </div>
                    <span className="wb-copy text-[8px] text-[#4a4a4a]" style={{ clipPath: 'inset(0 100% 0 0)' }}>{p}</span>
                  </div>
                ))}
              </div>
              {/* studio + process */}
              <div className="wb-block relative grid gap-2 px-4 pb-3 @md:grid-cols-2 @md:px-6" style={{ opacity: 0 }}>
                <span className="wb-blabel absolute -top-1 left-2 text-[8px] tracking-wider text-[#9A8E7A] uppercase" style={{ opacity: 0 }}>Studio · Process (3 steps)</span>
                <p className="wb-copy text-[8px] leading-snug text-[#4a4a4a]" style={{ clipPath: 'inset(0 100% 0 0)' }}>
                  A studio of eleven, working between Oslo and Lisbon. We begin with the site, the light and the people who will live with the building.
                </p>
                <ol className="m-0 flex list-none gap-2 p-0">
                  {['Site', 'Concept', 'Build'].map((s, i) => (
                    <li key={s} className="wb-copy flex-1 border-t border-[#B89B5E] pt-1 text-[8px]" style={{ clipPath: 'inset(0 100% 0 0)' }}>
                      <span className="mr-1 text-[#B89B5E]">0{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              {/* contact + footer */}
              <div className="wb-block relative flex items-center justify-between border-t border-[#D6D0C4] px-4 py-2 @md:px-6" style={{ opacity: 0 }}>
                <span className="wb-blabel absolute -top-1 left-2 text-[8px] tracking-wider text-[#9A8E7A] uppercase" style={{ opacity: 0 }}>Contact · Footer</span>
                <span className="wb-copy text-[8px]" style={{ clipPath: 'inset(0 100% 0 0)' }}>studio@halden.example</span>
                <span className="wb-copy text-[8px] text-[#9A8E7A]" style={{ clipPath: 'inset(0 100% 0 0)' }}>© Halden Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

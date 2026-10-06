import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, Suspense, lazy } from 'react'
import { gsap } from '@/animations/motion/gsap'
import { useMotion } from '@/animations/motion/MotionProvider'
import { FEATURES, featureBySlug, type Feature } from '@/data/features'
import { worldById } from '@/data/worlds'
import { EXAMPLES } from '@/data/examples'
import { demoByKey } from '@/data/demos'
import { ShakirBeam, type ShakirBeamHandle } from '@/animations/beam/ShakirBeam'
import { FeatureGem } from './FeatureGem'
import { DemoFrame } from '@/components/demonstrations/DemoFrame'
import { DemoSteps } from '@/components/demonstrations/DemoSteps'
import { StepControl } from '@/components/demonstrations/StepControl'

interface Ctx {
  open: (slug: string, returnTo?: HTMLElement | null) => void
  close: () => void
  slug: string | null
}
const DetailContext = createContext<Ctx | null>(null)

export function FeatureDetailProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null)
  const returnRef = useRef<HTMLElement | null>(null)
  const open = useCallback((s: string, returnTo?: HTMLElement | null) => {
    if (returnTo) returnRef.current = returnTo
    setSlug(s)
  }, [])
  const close = useCallback(() => {
    setSlug(null)
    const el = returnRef.current
    returnRef.current = null
    requestAnimationFrame(() => el?.focus())
  }, [])
  const value = useMemo(() => ({ open, close, slug }), [open, close, slug])
  return <DetailContext.Provider value={value}>{children}</DetailContext.Provider>
}

export function useFeatureDetail(): Ctx {
  const ctx = useContext(DetailContext)
  if (!ctx) throw new Error('useFeatureDetail outside provider')
  return ctx
}

/** The premium feature-detail experience (brief §11), as a native dialog so focus and Esc are handled by the platform. */
export function FeatureDetailDialog() {
  const { slug, close, open } = useFeatureDetail()
  const { reduced } = useMotion()
  const ref = useRef<HTMLDialogElement>(null)
  const beam = useRef<ShakirBeamHandle>(null)
  const feature = slug ? featureBySlug(slug) : undefined

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (feature && !d.open) {
      d.showModal()
      document.body.classList.add('scroll-locked')
      if (!reduced) {
        gsap.fromTo('.fd-panel', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' })
        beam.current?.pass(1200)
      }
    } else if (!feature && d.open) {
      d.close()
    }
    if (!feature) document.body.classList.remove('scroll-locked')
  }, [feature, reduced])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const onClose = () => {
      document.body.classList.remove('scroll-locked')
      close()
    }
    d.addEventListener('close', onClose)
    return () => d.removeEventListener('close', onClose)
  }, [close])

  const idx = feature ? FEATURES.indexOf(feature) : -1
  const siblings = feature ? FEATURES.filter((f) => f.world === feature.world).sort((a, b) => a.angle - b.angle) : []
  const pos = feature ? siblings.indexOf(feature) : -1
  const prev = pos > 0 ? siblings[pos - 1] : null
  const next = pos >= 0 && pos < siblings.length - 1 ? siblings[pos + 1] : null

  return (
    <dialog
      ref={ref}
      className="feature-dialog"
      aria-labelledby="fd-title"
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close()
      }}
    >
      {feature && (
        <div className="flex h-full w-full items-start justify-center overflow-y-auto p-3 sm:p-6 lg:items-center">
          <article className="fd-panel panel relative w-full max-w-[920px] bg-ink/95" data-testid="feature-detail">
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              <ShakirBeam ref={beam} d="M0,0 H1000 V1000 H0 Z" width={3} segment={0.1} />
            </svg>
            <button
              type="button"
              className="label absolute top-3 right-3 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center text-mist-60 hover:text-mist"
              onClick={() => ref.current?.close()}
              aria-label="Close"
            >
              Close
            </button>
            <div className="flex flex-col gap-8 p-6 sm:p-10">
              <header className="flex items-start gap-5">
                <FeatureGem world={feature.world} slug={feature.slug} size={72} halo={feature.tier === 'cinematic'} />
                <div className="flex min-w-0 flex-col gap-2">
                  <p className="eyebrow" style={{ color: `var(--world-${feature.world}-text)` }}>
                    {worldById(feature.world).name} · {feature.id}
                  </p>
                  <h2 id="fd-title" className="display display-md">
                    {feature.name}
                  </h2>
                  <p className="text-mist-60">{feature.blurb}</p>
                </div>
              </header>
              <p className="max-w-[62ch] text-[15px] leading-relaxed text-mist">{feature.description}</p>
              {feature.note && <p className="label text-trust-text">{feature.note}</p>}

              <DetailDemo feature={feature} key={feature.slug} />

              <section className="flex flex-col gap-3" aria-label="Works with">
                <h3 className="label">Works with</h3>
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {feature.connections.map((c) => {
                    const g = featureBySlug(c)
                    if (!g) return null
                    return (
                      <li key={c}>
                        <button type="button" className="btn btn-ghost min-h-[36px] px-3 text-[10px]" onClick={() => open(c)}>
                          <span className="inline-block h-2 w-2 rotate-45" style={{ background: `var(--world-${g.world})` }} aria-hidden="true" />
                          {g.shortName}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <p className="text-sm text-mist-60">
                  <span className="eyebrow mr-2 text-[10px]">In Shakir One</span>
                  {feature.inOne}
                </p>
              </section>

              <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate pt-6">
                <div className="flex gap-2">
                  <button type="button" className="btn btn-ghost min-h-[40px] px-4" disabled={!prev} onClick={() => prev && open(prev.slug)}>
                    ← {prev ? prev.shortName : 'First'}
                  </button>
                  <button type="button" className="btn btn-ghost min-h-[40px] px-4" disabled={!next} onClick={() => next && open(next.slug)}>
                    {next ? next.shortName : 'Last'} →
                  </button>
                </div>
                <a href="#create" className="btn btn-primary" onClick={() => ref.current?.close()}>
                  Enter Shakir
                </a>
              </footer>
              <span className="sr-only">Feature {idx + 1} of {FEATURES.length}</span>
            </div>
          </article>
        </div>
      )}
    </dialog>
  )
}

const lazyCache = new Map<string, ReturnType<typeof lazy>>()

/** Cinematic features show their demonstration in stepped mode; the rest show an illustrative example. */
function DetailDemo({ feature }: { feature: Feature }) {
  const { profile, reduced } = useMotion()
  const entry = feature.demo ? demoByKey(feature.demo) : undefined
  const [step, setStep] = useState(0)
  const tl = useMemo(() => {
    const t = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
    if (entry) {
      entry.steps.forEach((_, i) => t.addLabel(`step-${i}`, i))
      t.to({}, { duration: entry.steps.length }, 0)
    }
    return t
  }, [entry])
  useEffect(() => () => void tl.kill(), [tl])
  const Component = useMemo(() => {
    if (!entry) return null
    let c = lazyCache.get(entry.key)
    if (!c) {
      c = lazy(entry.load)
      lazyCache.set(entry.key, c)
    }
    return c
  }, [entry])
  const ready = useCallback(() => {
    tl.pause(0)
    tl.render(0, false, true)
  }, [tl])
  const goTo = (i: number) => {
    setStep(i)
    tl.tweenTo(`step-${i}`, { duration: reduced ? 0 : 0.6, ease: 'power2.inOut' })
  }
  const ex = EXAMPLES[feature.slug]

  if (entry && Component) {
    return (
      <section className="flex flex-col gap-4" aria-label="Demonstration">
        <DemoSteps steps={entry.steps} active={step} world={feature.world} />
        <DemoFrame world={feature.world} className="min-h-[360px]">
          <div className="h-full min-h-[360px] p-4 sm:p-6">
            <Suspense fallback={<div className="label p-6 opacity-60">Preparing demonstration…</div>}>
              <Component tl={tl} mode="stepped" profile={profile} reduced={reduced} ready={ready} />
            </Suspense>
          </div>
        </DemoFrame>
        <StepControl count={entry.steps.length} active={step} onChange={goTo} />
      </section>
    )
  }
  if (!ex) return null
  return (
    <section className="panel flex flex-col gap-4 p-5" aria-label="Example">
      <p className="label text-[10px] opacity-60">Example</p>
      <p className="font-display text-base text-mist">“{ex.ask}”</p>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {ex.lines.map((l, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-mist-60">
            <span className="mono mt-[2px]" style={{ color: `var(--world-${feature.world}-text)` }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {l}
          </li>
        ))}
      </ol>
    </section>
  )
}

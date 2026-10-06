import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { gsap } from '@/animations/motion/gsap'
import { MotionProvider, useMotion } from '@/animations/motion/MotionProvider'
import { demoByKey } from '@/data/demos'
import type { DemoKey } from '@/data/features'
import { featureBySlug } from '@/data/features'
import { DemoFrame } from '@/components/demonstrations/DemoFrame'
import { DemoSteps } from '@/components/demonstrations/DemoSteps'
import { StepControl } from '@/components/demonstrations/StepControl'

/**
 * Development harness: /?demo=<key>&step=<n> renders one demonstration in stepped
 * mode at the END state of step n. Used by scripts/shot-demo.mjs for visual checks.
 */
export default function DemoHarness({ demoKey, step: initial }: { demoKey: string; step: number }) {
  return (
    <MotionProvider>
      <Inner demoKey={demoKey} initial={initial} />
    </MotionProvider>
  )
}

function Inner({ demoKey, initial }: { demoKey: string; initial: number }) {
  const { profile, reduced } = useMotion()
  const entry = demoByKey(demoKey as DemoKey)
  const [step, setStep] = useState(initial)
  const tl = useMemo(() => {
    const t = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
    entry?.steps.forEach((_s, i) => t.addLabel(`step-${i}`, i))
    if (entry) t.to({}, { duration: entry.steps.length }, 0)
    return t
  }, [entry])
  const Component = useMemo(() => (entry ? lazy(entry.load) : null), [entry])
  const ready = useCallback(() => {
    const t = Math.min(tl.duration() - 0.001, initial + 0.999)
    tl.pause(t)
    tl.render(t, false, true)
    document.documentElement.dataset.demoReady = '1'
    ;(window as unknown as { __demoTl?: gsap.core.Timeline }).__demoTl = tl
  }, [tl, initial])
  useEffect(() => {
    const t = Math.min(tl.duration() - 0.001, step + 0.999)
    tl.pause(t)
    tl.render(t, false, true)
  }, [step, tl])
  if (!entry || !Component) return <p className="p-8">Unknown demo: {demoKey}</p>
  const world = featureBySlug(entry.featureSlug)?.world ?? 'create'
  return (
    <main className="container-x flex min-h-screen flex-col gap-6 py-10" data-demo={entry.key} data-step={entry.steps[step]}>
      <h1 className="display display-md">{entry.title}</h1>
      <DemoSteps steps={entry.steps} active={step} world={world} />
      <StepControl count={entry.steps.length} active={step} onChange={setStep} />
      <DemoFrame world={world} className="min-h-[520px]">
        <div className="flex h-full min-h-[520px] flex-col p-6 [&>*]:flex-1">
          <Suspense fallback={<p className="label">Loading…</p>}>
            <Component tl={tl} mode="stepped" profile={profile} reduced={reduced} ready={ready} />
          </Suspense>
        </div>
      </DemoFrame>
    </main>
  )
}

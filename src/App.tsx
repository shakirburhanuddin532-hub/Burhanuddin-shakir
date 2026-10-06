import { useEffect } from 'react'
import { MotionProvider } from '@/animations/motion/MotionProvider'
import { ScrollTrigger } from '@/animations/motion/gsap'
import { LowPolyScene } from '@/lowpoly/LowPolyScene'
import { SiteNav } from '@/components/navigation/SiteNav'
import { BeamRail } from '@/components/navigation/BeamRail'
import { IntroSequence } from '@/components/brand/IntroSequence'
import { HeroScene } from '@/components/hero/HeroScene'
import { SystemScene } from '@/components/scenes/SystemScene'
import { DemoChapter } from '@/components/demonstrations/DemoChapter'
import { CHAT_DEMO } from '@/data/demos'
import { FeatureUniverse } from '@/components/features/FeatureUniverse'
import { CreationEngine } from '@/components/demonstrations/CreationEngine'
import { ShakirOne } from '@/components/shakir-one/ShakirOne'
import { TrustSection } from '@/components/trust/TrustSection'
import { FinalCtaScene } from '@/components/cta/FinalCtaScene'
import { SiteFooter } from '@/components/footer/SiteFooter'
import { FeatureDetailDialog, FeatureDetailProvider } from '@/components/features/FeatureDetailDialog'

function RefreshOnLoad() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])
  return null
}

export function App() {
  return (
    <MotionProvider>
      <a href="#hero" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <LowPolyScene>
        <FeatureDetailProvider>
          <RefreshOnLoad />
          <IntroSequence />
          <SiteNav />
          <BeamRail />
          <main id="page-root" className="relative z-10">
            <HeroScene />
            <SystemScene />
            <DemoChapter entry={CHAT_DEMO} env={{ from: 'network', to: 'interface', order: 3 }} />
            <FeatureUniverse />
            <CreationEngine />
            <ShakirOne />
            <TrustSection />
            <FinalCtaScene />
          </main>
          <SiteFooter />
          <FeatureDetailDialog />
        </FeatureDetailProvider>
      </LowPolyScene>
    </MotionProvider>
  )
}

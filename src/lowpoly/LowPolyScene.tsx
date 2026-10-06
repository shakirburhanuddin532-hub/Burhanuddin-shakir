import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ScrollTrigger } from '@/animations/motion/gsap'
import { useMotion } from '@/animations/motion/MotionProvider'
import { LowPolyEngine } from './engine'

const EngineContext = createContext<LowPolyEngine | null>(null)

export function useEngine(): LowPolyEngine | null {
  return useContext(EngineContext)
}

/**
 * The one fixed canvas environment behind every scene (brief §27).
 * Children render above it; the fog/vignette overlay sits between.
 */
export function LowPolyScene({ children }: { children: ReactNode }) {
  const { profile, downgrade, isTouch } = useMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [engine, setEngine] = useState<LowPolyEngine | null>(null)
  const downgradeRef = useRef(downgrade)
  downgradeRef.current = downgrade

  useLayoutEffect(() => {
    const c = canvasRef.current
    if (!c || !c.getContext('2d')) return
    const e = new LowPolyEngine(c, profile)
    e.onDowngrade = () => downgradeRef.current()
    e.start()
    setEngine(e)
    ;(window as unknown as { __shakirEngine?: LowPolyEngine }).__shakirEngine = e
    return () => {
      e.destroy()
      setEngine(null)
    }
    // the engine is created once; profile changes go through setProfile below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    engine?.setProfile(profile)
  }, [engine, profile])

  useEffect(() => {
    if (!engine) return
    let timer = 0
    let lastW = window.innerWidth
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        // on phones the address bar changes innerHeight constantly; only rebuild on real width changes or large height jumps
        const widthChanged = window.innerWidth !== lastW
        const heightJump = Math.abs(window.innerHeight - engine.H) > 160
        if (widthChanged || heightJump) {
          lastW = window.innerWidth
          engine.resize()
          ScrollTrigger.refresh()
        }
      }, 180)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [engine])

  useEffect(() => {
    if (!engine || isTouch || profile === 'LOW' || profile === 'REDUCED_MOTION') return
    const onMove = (e: PointerEvent) => {
      engine.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    const onLeave = () => engine.setPointer(0, 0)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [engine, isTouch, profile])

  useEffect(() => {
    if (!engine) return
    const onVis = () => (document.hidden ? engine.stop() : engine.start())
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [engine])

  return (
    <EngineContext.Provider value={engine}>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 block" aria-hidden="true" data-testid="lowpoly-canvas" />
      <div className="fog" aria-hidden="true" />
      {children}
    </EngineContext.Provider>
  )
}

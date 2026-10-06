import { useLayoutEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from '@/animations/motion/gsap'

/** Runs `fn` inside a gsap.context scoped to `scope`; everything created is reverted on cleanup. */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  fn: (ctx: gsap.Context, el: HTMLElement) => void | (() => void),
  deps: DependencyList,
) {
  useLayoutEffect(() => {
    const el = scope.current
    if (!el) return
    let cleanup: void | (() => void)
    const ctx = gsap.context((self) => {
      cleanup = fn(self, el)
    }, el)
    return () => {
      cleanup?.()
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

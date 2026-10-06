import { useEffect, useRef, useState } from 'react'
import { Logo, Wordmark } from '@/components/brand/Logo'
import { NAV_CTA, PRIMARY_NAV } from '@/data/navigation'
import { seekTo } from '@/animations/scroll/useScene'
import { useMotion } from '@/animations/motion/MotionProvider'

export function SiteNav() {
  const { reduced, pref, setPref } = useMotion()
  const [compact, setCompact] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    menuRef.current?.querySelector<HTMLElement>('a,button')?.focus()
    document.body.classList.add('scroll-locked')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('scroll-locked')
    }
  }, [open])

  const go = (target: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    seekTo(target, reduced)
  }

  return (
    <header
      className={`intro-hidden fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,height,opacity] duration-500 ${
        compact ? 'bg-ink/90 shadow-[inset_0_-1px_0_var(--color-slate)] backdrop-blur-md' : 'bg-transparent'
      }`}
      style={{ height: compact ? 56 : 72 }}
    >
      <nav className="container-x flex h-full items-center justify-between gap-6" aria-label="Primary">
        <a href="#hero" onClick={go('hero')} className="flex items-center gap-3" aria-label="Shakir AI, home">
          <Logo height={compact ? 28 : 34} priority decorative />
          <Wordmark />
        </a>
        <ul className="hidden items-center gap-9 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <li key={item.target}>
              <a
                href={`#${item.target}`}
                onClick={go(item.target)}
                className="label text-mist-60 transition-colors hover:text-mist focus-visible:text-mist"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <a href={`#${NAV_CTA.target}`} onClick={go(NAV_CTA.target)} className="btn btn-primary hidden min-h-[40px] px-5 md:inline-flex">
            {NAV_CTA.label}
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="label flex min-h-[44px] min-w-[44px] items-center justify-center text-mist lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          ref={menuRef}
          className="fixed inset-0 top-[56px] z-40 flex flex-col bg-ink/96 px-6 pt-10 backdrop-blur-md"
          role="dialog"
          aria-label="Menu"
        >
          <div className="absolute top-0 bottom-0 left-6 w-px bg-gradient-to-b from-cyan via-violet to-transparent opacity-60" aria-hidden="true" />
          <ul className="flex flex-col gap-7 pl-6">
            {[...PRIMARY_NAV, NAV_CTA].map((item) => (
              <li key={item.label}>
                <a href={`#${item.target}`} onClick={go(item.target)} className="display display-md text-mist">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto mb-10 pl-6">
            <label className="label flex items-center gap-3">
              <input
                type="checkbox"
                checked={pref ? pref === 'reduced' : reduced}
                onChange={(e) => setPref(e.target.checked ? 'reduced' : 'full')}
                className="h-4 w-4 accent-gold"
              />
              Reduce motion
            </label>
          </div>
        </div>
      )}
    </header>
  )
}

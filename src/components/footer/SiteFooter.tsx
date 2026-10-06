import { Logo, Wordmark } from '@/components/brand/Logo'
import { COPY } from '@/data/copy'
import { FOOTER_COLUMNS } from '@/data/navigation'
import { seekTo } from '@/animations/scroll/useScene'
import { useMotion } from '@/animations/motion/MotionProvider'

export function SiteFooter() {
  const { reduced, pref, setPref } = useMotion()
  return (
    <footer id="footer" className="relative z-10 border-t border-slate bg-ink" aria-label="Footer">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Logo height={40} decorative />
            <Wordmark />
          </div>
          <p className="max-w-[36ch] text-sm text-mist-60">{COPY.brand.tagline}</p>
          <label className="label mt-2 flex items-center gap-3">
            <input
              type="checkbox"
              checked={pref ? pref === 'reduced' : reduced}
              onChange={(e) => setPref(e.target.checked ? 'reduced' : 'full')}
              className="h-4 w-4 accent-gold"
            />
            Reduce motion
          </label>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow mb-4 text-[10px]">{col.title}</h3>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <a
                      href={`#${it.target}`}
                      onClick={(e) => {
                        e.preventDefault()
                        seekTo(it.target, reduced)
                      }}
                      className="text-sm text-mist-60 transition-colors hover:text-mist"
                    >
                      {it.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="container-x flex flex-wrap items-center justify-between gap-3 border-t border-slate py-6">
        <span className="label text-[10px]">© Shakir AI {new Date().getFullYear()} · Demonstration site; all product scenarios are illustrative.</span>
        <ul className="m-0 flex list-none gap-5 p-0">
          {COPY.footer.legal.map((l) => (
            <li key={l} className="label text-[10px] opacity-70">
              {l}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}

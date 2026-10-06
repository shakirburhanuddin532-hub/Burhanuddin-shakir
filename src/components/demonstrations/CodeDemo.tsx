import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from '@/animations/motion/gsap'
import { stepAt, type DemoProps } from './demoTypes'

/**
 * §16 Code AI — PROMPT → CODE → TEST → ERROR → FIX → PASS → PREVIEW (plan G.4.5).
 * Editor (left), terminal + preview (right); panes stack on small screens.
 * Every tween is a fromTo on the master timeline; the playhead alone decides what is visible.
 */

/* ---------- content ---------- */
const PROMPT = [
  "Add a 'Copy link' button to the share menu.",
  "It must still work when the Clipboard API isn't available.",
]

const NARRATION = [
  'Reading the request. Two conditions: a new button, and a working fallback.',
  'Writing copyLink.ts: the Clipboard API call, with an execCommand fallback.',
  'Running copyLink.test.ts: one test per condition.',
  'Test 2 fails. Line 4 reads writeText before checking that clipboard exists.',
  'Fix: guard navigator.clipboard, then fall back to execCommand.',
  'Both tests pass. Only now does the preview unlock.',
  'Preview: the share menu with Copy link. Clicked once: Link copied.',
]

const CODE_HEAD = ['export async function copyLink(', '  url: string,', '): Promise<boolean> {']
const CODE_REMOVED = ['  await navigator.clipboard.writeText(url)', '  return true']
const CODE_ADDED = [
  '  if (navigator.clipboard?.writeText) {',
  '    await navigator.clipboard.writeText(url)',
  '    return true',
  '  }',
  '  return fallbackCopy(url)',
]
const CODE_REST = [
  '}',
  '',
  'function fallbackCopy(url: string) {',
  "  const el = document.createElement('input')",
  '  el.value = url',
  '  document.body.append(el)',
  '  el.select()',
  "  const ok = document.execCommand('copy')",
  '  el.remove()',
  '  return ok',
  '}',
]
const TEST = [
  "import { copyLink } from './copyLink'",
  '',
  "const url = 'https://example.com/s/9f2'",
  '',
  "test('copies with the Clipboard API', async () => {",
  '  const writeText = vi.fn()',
  "  vi.stubGlobal('navigator', { clipboard: { writeText } })",
  '  expect(await copyLink(url)).toBe(true)',
  '  expect(writeText).toHaveBeenCalledWith(url)',
  '})',
  '',
  "test('falls back when clipboard is undefined', async () => {",
  "  vi.stubGlobal('navigator', {})",
  '  expect(await copyLink(url)).toBe(true)',
  '})',
]

/** fixed line height (px) so the inserted block can be placed by transform alone */
const LH = 16
const INSERT_AT = CODE_HEAD.length + CODE_REMOVED.length
const TOTAL_LINES = INSERT_AT + CODE_ADDED.length + CODE_REST.length

/* ---------- build-time highlighter: keywords and strings only ---------- */
const TOKEN = /('[^']*')|\b(export|async|function|await|return|if|const|import|from)\b/g
const ACCENT_TEXT = { color: 'var(--world-create-text)' } as const
const ACCENT_BG = { background: 'var(--world-create)' } as const
const TINT_ADD = { background: 'color-mix(in srgb, var(--world-create) 13%, transparent)' } as const
const TINT_ERR = { background: 'color-mix(in srgb, var(--world-create) 18%, transparent)' } as const
const TINT_DEL = { background: 'rgba(167, 171, 180, 0.09)' } as const
const TINT_PRESS = { background: 'color-mix(in srgb, var(--world-create) 11%, transparent)' } as const

function hl(line: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN)) {
    const i = m.index ?? 0
    if (i > last) out.push(line.slice(last, i))
    out.push(
      m[1] ? (
        <span key={i} style={ACCENT_TEXT}>
          {m[1]}
        </span>
      ) : (
        <span key={i} className="text-mist">
          {m[2]}
        </span>
      ),
    )
    last = i + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

const HEAD_HL = CODE_HEAD.map(hl)
const REMOVED_HL = CODE_REMOVED.map(hl)
const ADDED_HL = CODE_ADDED.map(hl)
const REST_HL = CODE_REST.map(hl)
const TEST_HL = TEST.map(hl)

/* ---------- small pieces ---------- */
function PaneHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="relative flex h-7 shrink-0 items-center justify-between border-b border-slate px-3">
      <span className="label text-[10px]">{title}</span>
      {children}
    </div>
  )
}

function Marker({ id, result, accent }: { id: string; result: string; accent?: boolean }) {
  return (
    <span className="relative mr-1 inline-block w-8 text-mist-40">
      <span className={`cd-mk-run-${id}`}>RUN</span>
      <span
        className={`cd-mk-res-${id} absolute top-0 left-0 opacity-0 ${accent ? '' : 'text-mist'}`}
        style={accent ? ACCENT_TEXT : undefined}
      >
        {result}
      </span>
    </span>
  )
}

const Icon = ({ d }: { d: ReactNode }) => (
  <svg
    className="h-3.5 w-3.5 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d}
  </svg>
)

/* ---------- component ---------- */
export default function CodeDemo({ tl, reduced, ready }: DemoProps) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const S = (i: number, o = 0) => stepAt(i) + o
      const fx = (targets: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number) =>
        tl.fromTo(targets, from, { ...to, immediateRender: false, overwrite: false }, at)
      const swap = (out: string, into: string, i: number) => {
        fx(out, { opacity: 1 }, { opacity: 0, duration: 0.2 }, S(i))
        fx(into, { opacity: 0 }, { opacity: 1, duration: 0.3 }, S(i, 0.15))
      }

      // transform initial states (opacity initial states live in the markup)
      gsap.set(['.cd-ul-code', '.cd-ul-test', '.cd-bar', '.cd-pbar'], {
        scaleX: 0,
        transformOrigin: 'left center',
      })
      gsap.set('.cd-card', { scale: 0.97, transformOrigin: 'center' })
      gsap.set('.cd-ring', { scale: 0.4, rotate: 45, xPercent: -50, yPercent: -50 })
      gsap.set('.cd-toast', { y: 8 })
      gsap.set('.cd-rest', { y: 0 })

      /* 0 · PROMPT */
      fx('.cd-prompt', { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.25 }, S(0, 0.05))
      fx('.cd-nar-0', { opacity: 0 }, { opacity: 1, duration: 0.3 }, S(0, 0.5))

      /* 1 · CODE */
      swap('.cd-nar-0', '.cd-nar-1', 1)
      fx('.cd-empty', { opacity: 1 }, { opacity: 0, duration: 0.2 }, S(1))
      fx('.cd-tab-code-txt', { opacity: 0.5 }, { opacity: 1, duration: 0.25 }, S(1))
      fx('.cd-ul-code', { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, S(1))
      fx(
        '.cd-src .cd-ln',
        { opacity: 0, x: -6 },
        { opacity: 1, x: 0, duration: 0.2, stagger: 0.04 },
        S(1, 0.1),
      )

      /* 2 · TEST */
      swap('.cd-nar-1', '.cd-nar-2', 2)
      fx('.cd-tab-test', { opacity: 0 }, { opacity: 1, duration: 0.25 }, S(2))
      fx('.cd-ul-test', { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, S(2, 0.1))
      fx('.cd-tab-code-txt', { opacity: 1 }, { opacity: 0.5, duration: 0.25 }, S(2))
      fx('.cd-ul-code', { scaleX: 1 }, { scaleX: 0, duration: 0.25 }, S(2))
      fx('.cd-src', { opacity: 1 }, { opacity: 0, duration: 0.2 }, S(2))
      fx('.cd-spec', { opacity: 0 }, { opacity: 1, duration: 0.01 }, S(2, 0.2))
      fx(
        '.cd-spec .cd-ln',
        { opacity: 0, x: -6 },
        { opacity: 1, x: 0, duration: 0.2, stagger: 0.035 },
        S(2, 0.22),
      )
      fx('.cd-cmd', { opacity: 0 }, { opacity: 1, duration: 0.15 }, S(2))
      fx('.cd-cursor', { opacity: 1 }, { opacity: 0, duration: 0.1 }, S(2, 0.2))
      swap('.cd-st-idle', '.cd-st-run', 2)
      fx('.cd-bar', { scaleX: 0 }, { scaleX: 1, duration: 0.55 }, S(2, 0.3))
      fx('.cd-t1', { opacity: 0 }, { opacity: 1, duration: 0.2 }, S(2, 0.35))
      fx(['.cd-t2', '.cd-t3'], { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.12 }, S(2, 0.5))

      /* 3 · ERROR */
      swap('.cd-nar-2', '.cd-nar-3', 3)
      fx('.cd-tab-test-txt', { opacity: 1 }, { opacity: 0.5, duration: 0.25 }, S(3))
      fx('.cd-ul-test', { scaleX: 1 }, { scaleX: 0, duration: 0.25 }, S(3))
      fx('.cd-tab-code-txt', { opacity: 0.5 }, { opacity: 1, duration: 0.25 }, S(3))
      fx('.cd-ul-code', { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, S(3, 0.1))
      fx('.cd-spec', { opacity: 1 }, { opacity: 0, duration: 0.2 }, S(3))
      fx('.cd-src', { opacity: 0 }, { opacity: 1, duration: 0.25 }, S(3, 0.15))
      fx('.cd-bar', { opacity: 1 }, { opacity: 0, duration: 0.2 }, S(3))
      swap('.cd-st-run', '.cd-st-fail', 3)
      fx('.cd-mk-run-a', { opacity: 1 }, { opacity: 0, duration: 0.15 }, S(3, 0.1))
      fx('.cd-mk-res-a', { opacity: 0 }, { opacity: 1, duration: 0.15 }, S(3, 0.1))
      fx('.cd-mk-run-b', { opacity: 1 }, { opacity: 0, duration: 0.15 }, S(3, 0.3))
      fx('.cd-mk-res-b', { opacity: 0 }, { opacity: 1, duration: 0.15 }, S(3, 0.3))
      fx(
        ['.cd-t4', '.cd-t5'],
        { opacity: 0, x: -4 },
        { opacity: 1, x: 0, duration: 0.25, stagger: 0.1 },
        S(3, 0.45),
      )
      fx('.cd-t6', { opacity: 0 }, { opacity: 1, duration: 0.2 }, S(3, 0.7))
      fx('.cd-err', { opacity: 0 }, { opacity: 1, duration: 0.3 }, S(3, 0.55))

      /* 4 · FIX */
      swap('.cd-nar-3', '.cd-nar-4', 4)
      fx('.cd-err', { opacity: 1 }, { opacity: 0, duration: 0.25 }, S(4, 0.1))
      fx('.cd-del-tint', { opacity: 0 }, { opacity: 1, duration: 0.25 }, S(4, 0.1))
      fx('.cd-del-sign', { opacity: 0 }, { opacity: 1, duration: 0.25 }, S(4, 0.1))
      fx('.cd-del-txt', { opacity: 1 }, { opacity: 0.4, duration: 0.25 }, S(4, 0.1))
      fx('.cd-rest', { y: 0 }, { y: CODE_ADDED.length * LH, duration: 0.35 }, S(4, 0.2))
      fx('.cd-add', { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.22, stagger: 0.06 }, S(4, 0.35))
      fx('.cd-dot', { opacity: 0 }, { opacity: 1, duration: 0.2 }, S(4, 0.5))

      /* 5 · PASS */
      swap('.cd-nar-4', '.cd-nar-5', 5)
      fx('.cd-dot', { opacity: 1 }, { opacity: 0, duration: 0.2 }, S(5))
      fx('.cd-run1', { opacity: 1, y: 0 }, { opacity: 0, y: -6, duration: 0.25 }, S(5))
      fx('.cd-run2', { opacity: 0 }, { opacity: 1, duration: 0.01 }, S(5, 0.2))
      fx('.cd-r2', { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.2, stagger: 0.09 }, S(5, 0.22))
      swap('.cd-st-fail', '.cd-st-pass', 5)
      fx('.cd-ph-wait', { opacity: 1 }, { opacity: 0, duration: 0.2 }, S(5, 0.3))
      fx('.cd-ph-go', { opacity: 0 }, { opacity: 1, duration: 0.25 }, S(5, 0.45))
      fx('.cd-pbar', { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, S(5, 0.5))

      /* 6 · PREVIEW */
      swap('.cd-nar-5', '.cd-nar-6', 6)
      fx('.cd-ph', { opacity: 1 }, { opacity: 0, duration: 0.2 }, S(6))
      fx('.cd-card', { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.3 }, S(6, 0.1))
      fx('.cd-row', { opacity: 0, x: -4 }, { opacity: 1, x: 0, duration: 0.2, stagger: 0.07 }, S(6, 0.2))
      fx('.cd-ring', { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.6, duration: 0.35 }, S(6, 0.5))
      fx('.cd-press', { opacity: 0 }, { opacity: 1, duration: 0.1 }, S(6, 0.5))
      fx(
        '.cd-toast',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' },
        S(6, 0.62),
      )

      // the only looping effect: a blinking terminal cursor; the stepped timeline shows a solid cursor instead
      if (!reduced) {
        gsap.fromTo(
          '.cd-cursor-i',
          { opacity: 1 },
          { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)', overwrite: false },
        )
      }
    }, root)
    ready()
    return () => ctx.revert()
  }, [tl, reduced, ready])

  return (
    <div
      ref={root}
      className="flex h-full min-h-full w-full flex-col gap-2 text-mist"
      aria-label="Code AI demonstration: prompt, code, test, error, fix, pass, preview"
    >
      {/* request + narration */}
      <div className="grid shrink-0 gap-x-4 gap-y-1 border border-slate bg-ink/50 px-3 py-2.5 sm:grid-cols-[72px_minmax(0,1fr)]">
        <span className="label pt-px text-[10px]">Request</span>
        <p className="m-0 text-[13px] leading-snug text-mist">
          {PROMPT.map((s, i) => (
            <span key={i} className="cd-prompt inline opacity-0">
              {s}{' '}
            </span>
          ))}
        </p>
        <span className="label pt-px text-[10px]" style={ACCENT_TEXT}>
          Code AI
        </span>
        <div className="grid">
          {NARRATION.map((t, i) => (
            <p
              key={i}
              className={`cd-nar-${i} col-start-1 row-start-1 m-0 text-[12px] leading-snug text-mist-60 opacity-0`}
            >
              {t}
            </p>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* editor */}
        <div className="flex min-w-0 flex-col border border-slate bg-ink/60">
          <div className="flex h-7 shrink-0 items-stretch border-b border-slate">
            <span className="relative flex items-center px-3 font-mono text-[11px]">
              <span className="cd-tab-code-txt opacity-50">copyLink.ts</span>
              <span
                className="cd-dot ml-1.5 inline-block h-1.5 w-1.5 rotate-45 opacity-0"
                style={ACCENT_BG}
              />
              <span className="cd-ul-code absolute inset-x-0 bottom-0 h-px" style={ACCENT_BG} />
            </span>
            <span className="cd-tab-test relative flex items-center px-3 font-mono text-[11px] opacity-0">
              <span className="cd-tab-test-txt">copyLink.test.ts</span>
              <span className="cd-ul-test absolute inset-x-0 bottom-0 h-px" style={ACCENT_BG} />
            </span>
            <span className="label ml-auto hidden items-center pr-3 text-[10px] sm:flex">Editor</span>
          </div>
          <div className="relative flex-1 overflow-x-auto overflow-y-hidden p-2 [scrollbar-width:none]">
            <p className="cd-empty absolute top-2 left-3 m-0 font-mono text-[11px] text-mist-40">
              // waiting for the request
            </p>
            <div className="grid w-max min-w-full">
              {/* copyLink.ts */}
              <pre
                className="cd-src col-start-1 row-start-1 m-0 font-mono text-[10px] leading-4 whitespace-pre text-mist-60 sm:text-[11px]"
                style={{ minHeight: TOTAL_LINES * LH }}
              >
                <span className="relative block">
                  {HEAD_HL.map((l, i) => (
                    <span key={i} className="cd-ln relative block h-4 pl-3 opacity-0">
                      {l}
                    </span>
                  ))}
                  {REMOVED_HL.map((l, i) => (
                    <span key={i} className="cd-ln relative block h-4 pl-3 opacity-0">
                      <span className="cd-del-tint absolute inset-0 opacity-0" style={TINT_DEL} />
                      {i === 0 && (
                        <span className="cd-err absolute inset-0 opacity-0" style={TINT_ERR}>
                          <span className="absolute top-0 left-0 h-full w-[2px]" style={ACCENT_BG} />
                        </span>
                      )}
                      <span className="cd-del-sign absolute top-0 left-0 w-3 text-center text-mist-40 opacity-0">
                        -
                      </span>
                      <span className="cd-del-txt relative">{l}</span>
                    </span>
                  ))}
                  <span className="cd-rest block">
                    {REST_HL.map((l, i) => (
                      <span key={i} className="cd-ln relative block h-4 pl-3 opacity-0">
                        {l}
                      </span>
                    ))}
                  </span>
                  <span className="absolute inset-x-0 block" style={{ top: INSERT_AT * LH }}>
                    {ADDED_HL.map((l, i) => (
                      <span key={i} className="cd-add relative block h-4 pl-3 opacity-0">
                        <span className="absolute inset-0" style={TINT_ADD} />
                        <span className="absolute top-0 left-0 w-3 text-center" style={ACCENT_TEXT}>
                          +
                        </span>
                        <span className="relative">{l}</span>
                      </span>
                    ))}
                  </span>
                </span>
              </pre>
              {/* copyLink.test.ts */}
              <pre className="cd-spec col-start-1 row-start-1 m-0 font-mono text-[10px] leading-4 whitespace-pre text-mist-60 opacity-0 sm:text-[11px]">
                {TEST_HL.map((l, i) => (
                  <span key={i} className="cd-ln block h-4 pl-3 opacity-0">
                    {l}
                  </span>
                ))}
              </pre>
            </div>
          </div>
        </div>

        {/* terminal + preview */}
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex shrink-0 flex-col border border-slate bg-ink/60">
            <PaneHeader title="Terminal">
              <span className="grid font-mono text-[10px] text-mist-40">
                <span className="cd-st-idle col-start-1 row-start-1 text-right">idle</span>
                <span className="cd-st-run col-start-1 row-start-1 text-right opacity-0">running</span>
                <span className="cd-st-fail col-start-1 row-start-1 text-right opacity-0" style={ACCENT_TEXT}>
                  1 failed
                </span>
                <span className="cd-st-pass col-start-1 row-start-1 text-right text-mist opacity-0">
                  2 passed
                </span>
              </span>
              <span className="cd-bar absolute inset-x-0 -bottom-px h-px" style={ACCENT_BG} />
            </PaneHeader>
            <div className="grid p-2">
              <pre className="cd-run1 col-start-1 row-start-1 m-0 font-mono text-[10.5px] leading-4 whitespace-pre-wrap text-mist-60 sm:text-[11px]">
                <span className="block">
                  <span className="text-mist-40">$ </span>
                  <span className="cd-cmd text-mist opacity-0">npm test</span>
                  <span className="cd-cursor ml-0.5 inline-block align-middle">
                    <span className="cd-cursor-i block h-3 w-[6px] bg-mist-60" />
                  </span>
                </span>
                <span className="cd-t1 block opacity-0">
                  <span className="text-mist-40"> RUN </span> copyLink.test.ts
                </span>
                <span className="cd-t2 block opacity-0">
                  {' '}
                  <Marker id="a" result="PASS" />
                  copies with the Clipboard API
                </span>
                <span className="cd-t3 block opacity-0">
                  {' '}
                  <Marker id="b" result="FAIL" accent />
                  falls back when clipboard is undefined
                </span>
                <span className="cd-t4 block pl-6 opacity-0" style={ACCENT_TEXT}>
                  TypeError: Cannot read properties of undefined (reading 'writeText')
                </span>
                <span className="cd-t5 block pl-6 text-mist-40 opacity-0">
                  at copyLink (src/copyLink.ts:4:29)
                </span>
                <span className="cd-t6 block pt-1 opacity-0">
                  <span className="text-mist-40"> Tests </span> 1 passed ·{' '}
                  <span style={ACCENT_TEXT}>1 failed</span>
                </span>
              </pre>
              <pre className="cd-run2 col-start-1 row-start-1 m-0 font-mono text-[10.5px] leading-4 whitespace-pre-wrap text-mist-60 opacity-0 sm:text-[11px]">
                <span className="cd-r2 block">
                  <span className="text-mist-40">$ </span>
                  <span className="text-mist">npm test</span>
                </span>
                <span className="cd-r2 block">
                  <span className="text-mist-40"> RUN </span> copyLink.test.ts
                </span>
                <span className="cd-r2 block">
                  {' '}
                  <span className="mr-1 inline-block w-8 text-mist">PASS</span>copies with the Clipboard API
                </span>
                <span className="cd-r2 block">
                  {' '}
                  <span className="mr-1 inline-block w-8 text-mist">PASS</span>falls back when clipboard is
                  undefined
                </span>
                <span className="cd-r2 block pt-1">
                  <span className="text-mist-40"> Tests </span> <span className="text-mist">2 passed</span> ·
                  0 failed · 412 ms
                </span>
              </pre>
            </div>
          </div>

          <div className="flex min-h-[170px] flex-1 flex-col border border-slate bg-ink/60">
            <PaneHeader title="Preview">
              <span className="font-mono text-[10px] text-mist-40">share menu</span>
            </PaneHeader>
            <div className="relative grid flex-1 place-items-center overflow-hidden p-3">
              {/* locked until the tests pass */}
              <div className="cd-ph col-start-1 row-start-1 flex w-full max-w-[240px] flex-col items-center gap-2 text-center">
                <span className="text-mist-40">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="4" y="11" width="16" height="10" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </span>
                <span className="grid w-full text-[12px] leading-snug text-mist-40">
                  <span className="cd-ph-wait col-start-1 row-start-1">
                    Preview appears after the tests pass
                  </span>
                  <span className="cd-ph-go col-start-1 row-start-1 text-mist-60 opacity-0">
                    Tests passed. Rendering preview
                  </span>
                </span>
                <span className="relative mt-1 h-px w-24 bg-slate">
                  <span className="cd-pbar absolute inset-0" style={ACCENT_BG} />
                </span>
              </div>
              {/* the share menu with the new button, then the toast */}
              <div className="col-start-1 row-start-1 flex w-full max-w-[250px] flex-col items-center gap-2">
                <div className="cd-card w-full border border-slate bg-graphite opacity-0">
                  <div className="flex h-7 items-center justify-between border-b border-slate px-3">
                    <span className="font-display text-[12px] font-medium text-mist">Share</span>
                    <span className="font-mono text-[10px] text-mist-40">esc</span>
                  </div>
                  <div className="py-1 text-[12px] text-mist-60">
                    <div className="cd-row flex h-7 items-center gap-2.5 px-3 opacity-0">
                      <Icon
                        d={
                          <>
                            <rect x="3" y="5" width="18" height="14" />
                            <path d="M3 7l9 6 9-6" />
                          </>
                        }
                      />
                      Email
                    </div>
                    <div className="cd-row flex h-7 items-center gap-2.5 px-3 opacity-0">
                      <Icon
                        d={
                          <>
                            <path d="M16 18l6-6-6-6" />
                            <path d="M8 6l-6 6 6 6" />
                          </>
                        }
                      />
                      Embed
                    </div>
                    <div className="cd-row relative flex h-7 items-center gap-2.5 px-3 text-mist opacity-0">
                      <span className="cd-press absolute inset-0 opacity-0" style={TINT_PRESS} />
                      <span
                        className="cd-ring absolute top-1/2 left-[19px] h-6 w-6 border opacity-0"
                        style={{ borderColor: 'var(--world-create)' }}
                      />
                      <Icon
                        d={
                          <>
                            <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
                            <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                            <path d="M8 12h8" />
                          </>
                        }
                      />
                      <span className="relative">Copy link</span>
                      <span
                        className="relative ml-auto font-display text-[9px] tracking-[0.2em] uppercase"
                        style={ACCENT_TEXT}
                      >
                        new
                      </span>
                    </div>
                  </div>
                </div>
                <div className="cd-toast flex items-center gap-2 border border-slate bg-charcoal px-3 py-1 text-[12px] whitespace-nowrap text-mist opacity-0">
                  <span style={ACCENT_TEXT}>
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  Link copied
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

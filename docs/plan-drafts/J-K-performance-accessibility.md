## J. PERFORMANCE PLAN

Scope: brief §22, §24, §27, §32 (perf half), plus §04/§07/§15 asset rules. Section E owns what LowPolyScene draws; this section owns how much it is allowed to cost, where it loads, and how we prove it. Everything below assumes the Canvas 2D renderer section E specifies for LowPolyScene; no Three.js in v1 (§25). A raw-WebGL2 backend for the same component is permitted only by the evidence trigger in J.6.

### J.1 Budgets (hard numbers, enforced in CI)

Measured on the production build (`next build && next start`), Lighthouse mobile preset (Moto G Power class, 4x CPU slowdown, Slow 4G), 3 runs, median. Desktop numbers at 1440x900, no throttling.

| Metric | Home `/` mobile | Home `/` desktop | Other routes |
|---|---|---|---|
| LCP (p75) | <= 2.0 s (CI error at 2.5 s) | <= 1.2 s | <= 1.8 s mobile |
| INP (p75, lab via Playwright interactions) | <= 150 ms | <= 100 ms | <= 100 ms |
| CLS | <= 0.02 (CI error at 0.05) | <= 0.02 | <= 0.02 |
| TBT | <= 150 ms (CI error at 200 ms) | <= 100 ms | <= 100 ms |
| FCP | <= 1.4 s | <= 0.8 s | <= 1.2 s |
| Lighthouse Performance | >= 90 | >= 95 | >= 95 |
| Lighthouse Accessibility | 100 | 100 | 100 |

LCP element on `/` is the server-rendered hero logo `<Image priority>` (§05). IntroSequence (§04) animates a separate `aria-hidden` canvas layer *around* that same logo element at the same box, so the intro never introduces a second LCP candidate and the intro-to-hero handoff is zero-shift.

JavaScript (gzip, measured by `size-limit` on `.next/static`):

| Chunk | Target | Hard limit | Loads |
|---|---|---|---|
| First-load JS, `/` (framework + `gsap` core + `ScrollTrigger` + `@gsap/react` + nav + hero shell + SceneController + profile detection + vitals beacon) | 165 KB | 180 KB | immediately |
| First-load JS, `/features` and `/features/[slug]` (route names per section B) | 150 KB | 160 KB | immediately |
| First-load JS, `/security` `/privacy` `/developers` `/pricing` `/contact` | 115 KB | 130 KB | immediately; these routes never import GSAP (nav micro-interactions are CSS-only, so the root layout carries no GSAP) |
| `lowpoly-engine` (LowPolyScene renderer, mesh generator, palette, governor) | 26 KB | 30 KB | after hydration, idle |
| `intro` (IntroSequence timeline) | 10 KB | 12 KB | first visit per session only |
| `shakir-one` (ShakirOne) | 30 KB | 35 KB | on approach |
| `feature-universe` (FeatureUniverse + `data/features.ts` client subset ~8 KB) | 40 KB | 45 KB | on approach |
| `feature-detail` (FeatureDetailDialog) | 16 KB | 18 KB | on first node hover/focus |
| each demo in `components/demonstrations/` | 14-26 KB | 30 KB | on approach, one at a time |
| `trust-scene`, `final-cta` | 10 KB each | 12 KB | on approach |
| Total JS transferred after a full scroll of `/` | 430 KB | 480 KB | - |

No charting library (Business AI charts are hand-written SVG), no syntax highlighter at runtime (Code AI demo ships pre-tokenized spans built at compile time), no smooth-scroll library, no `ScrollTrigger.normalizeScroll`, no scroll hijacking. Native scroll only.

Assets:

| Asset class | Mobile budget | Desktop budget |
|---|---|---|
| Images above the fold (hero logo + hero poster) | 120 KB | 180 KB |
| Total images across the full `/` scroll (lazy) | 900 KB | 1.6 MB |
| Image AI showcase gallery (§14): 6 images max, AVIF, 768 w mobile / 1280 w desktop | 300 KB | 420 KB |
| Fonts (self-hosted woff2, total) | 120 KB | 120 KB |
| Video, total per page load (§15 only) | <= 1 file, 450 KB | <= 1 file, 900 KB |
| Scene posters (one static SVG or AVIF per scene, see J.9) | 25 KB each, 14 posters max | same |
| Lighthouse resource budget (`budgets.json`): script 350 KB, image 900 KB, font 120 KB, media 450 KB, total 1,600 KB on mobile | | |

The 1,276 KB `brand/shakir-logo-source.png` is never served; it stays outside `public/`. Delivered logo (transparent SVG requested from the client, watermark-free) ships as: SVG when SVGO output <= 80 KB gzip (then one inline `<symbol>` in the root layout, `<use>` everywhere); otherwise AVIF/WebP via `next/image` at 128/256/512/1024 w (hero at 2x of its 420 px box ~45 KB). Nothing in between: no tracing, no simplification, no re-drawing (§02).

### J.2 Per-scene geometry budgets per profile

Counts are triangles drawn per frame + particles per frame. Only one scene's rAF work runs at a time (SceneController activates exactly one LowPolyScene instance; others are frozen at their last frame or hidden).

| Scene | HIGH | MEDIUM | LOW | REDUCED_MOTION |
|---|---|---|---|---|
| IntroSequence (§04) | 1,400 tris, 600 pts | 800 tris, 300 pts | 400 tris, 120 pts | no sequence; 400 ms logo crossfade |
| Hero environment (§05), 3 parallax depth layers | 1,800 tris, 240 pts | 1,000 tris, 120 pts | 500 tris, 48 pts, 2 layers | static poster |
| Transition: landscape breaks into network (§06) | 1,200 tris | 700 tris | 350 tris | 200 ms crossfade between posters |
| ShakirOne (§09): SVG nodes + canvas backdrop | 21 nodes, 320 backdrop tris, 60 beam pts | 240 tris, 30 pts | 160 tris, 0 pts | static SVG diagram |
| FeatureUniverse (§10): 21 DOM nodes over canvas | 900 backdrop tris + 21 x 18 node tris | 500 + 21 x 12 | 250 + 21 x 8 | static; list view offered |
| Any single demo (§12-§20) | <= 300 tris, <= 40 pts | <= 200, 20 | <= 100, 0 | static step list |
| Trust (§21) | <= 200 tris, 0 pts, 0.25x motion | 120 | 60 | static |
| Final CTA collapse (§30), peak lasts <= 600 ms | 2,400 -> 1 | 1,200 -> 1 | 600 -> 1 | static logo |

Rendering rules that make those numbers cheap: triangles are quantized to a 12-colour facet palette and batched into one `Path2D` + one `fill()` per colour (about 12 fills per frame instead of 1,800); particles are `fillRect` 2-3 px squares, never `arc()`; glow uses a pre-rendered 64x64 radial-gradient sprite via `drawImage`, never `shadowBlur`; per-triangle "refraction" is a precomputed luminance scalar modulated by beam distance; mesh generation for a scene is <= 8 ms and runs in a `requestIdleCallback` slot before the scene becomes active.

Frame and resolution targets:

| | HIGH | MEDIUM | LOW | REDUCED_MOTION |
|---|---|---|---|---|
| Target / floor fps | 60 / 55 | 60 / 45 | 30 (`gsap.ticker.fps(30)`) | no continuous loop |
| Scene draw budget per frame | 8 ms | 10 ms | 20 ms | - |
| DPR cap | min(DPR, 2) | 1.5 | 1 | 1 |
| Canvas backing store cap | 2560 x 1440 | 1920 x 1080 | 1280 x 720 | poster only |
| Pointer parallax (§05) | full, 3 layers | 50 % amplitude, 2 layers | off | off |
| `backdrop-filter` text plates | yes | yes | no (opaque rgba .9 plate) | no |
| Simultaneous ShakirBeam instances | 2 | 1 | 1 (no head glow) | static gradient line |
| Compositor layers on screen | <= 30 | <= 20 | <= 12 | - |

### J.3 Code-splitting and load order

Server Components (RSC) by default: all copy, headings, sr-only narratives, feature data, nav, footer, trust list, step lists. Client islands (`'use client'`, suffix `.client.tsx`) only for canvases, GSAP timelines, dialogs, steppers, forms, the motion toggle.

Load order on `/`:
1. HTML + CSS + fonts (preloaded, J.4) + hero logo (`priority`) + hero poster. Page is fully readable here (J.9).
2. Hydration of the initial chunk: nav, hero shell, `SceneController`, `gsap` + `ScrollTrigger` registered once in `animations/gsap.ts` (the only file allowed to import from `gsap`; enforced by ESLint `no-restricted-imports`).
3. `import('lowpoly-engine')` fired from `requestIdleCallback` (fallback `setTimeout(0)`) right after hydration. Hero canvas crossfades over the poster in 300 ms when ready.
4. `IntroSequence` chunk loads in parallel with 3 only if the inline head script found no `sessionStorage['shakir.intro.seen']`. If the engine chunk is not ready 1,200 ms after first paint, the intro is skipped automatically (poster logo fade only) per §04 "no unnecessary delay".
5. Everything else via `hooks/useApproach.ts` (IntersectionObserver): `preloadMargin: '150% 0px'` triggers `import()` of the chunk; `mountMargin: '50% 0px'` mounts the client island; the island's rAF work starts only when its ScrollTrigger is active; it is frozen again when `unmountMargin: '200% 0px'` is passed. `FeatureDetailDialog` preloads on the first `pointerenter`/`focus` of any feature node.

`next/dynamic({ ssr: false, loading: () => null })` for every canvas island; the poster is already in the server HTML, so `loading` renders nothing.

### J.4 Fonts

`next/font` (self-hosted at build; no runtime Google Fonts CSS, no preconnect). Two families, variable files where the foundry provides them, otherwise exactly four static files (display 500/600, text 400/500). `subsets: ['latin']`, `display: 'swap'`, `preload: true` only for the two faces used in the hero, `adjustFontFallback` left on so the generated `size-adjust` fallback keeps CLS at 0 during swap. Fonts are exposed as CSS variables (`--font-display`, `--font-text`) consumed by Tailwind. Tabular numerals (`font-variant-numeric: tabular-nums`) on counters so animated numbers never shift width. Total woff2 <= 120 KB.

### J.5 Images and video

Images: `next/image` for every raster; `next.config.ts` sets `images.formats: ['image/avif', 'image/webp']`, `deviceSizes: [360, 414, 768, 1024, 1280, 1536, 1920, 2560]`, `imageSizes: [64, 96, 128, 256, 384, 512]`, `quality` 75 (80 for the logo). Every `<Image>` has explicit `width`/`height` or `fill` inside an `aspect-ratio` box. Explicit `sizes` per use: hero logo `(max-width: 768px) 60vw, 420px`; Image AI gallery `(max-width: 768px) 90vw, 33vw`; website-builder device previews `(max-width: 768px) 92vw, 48vw`. `priority` on exactly one element per route. Gallery images carry a build-time 10x10 `blurDataURL`. Image sequences (§07) are not used anywhere: every scrubbed scene is procedural, 0 KB of frame images.

Video (§07, §15): default is no video file. All demos are DOM, SVG and Canvas. The single exception is the final "VIDEO" beat of the Video AI showcase (§15): one clip, <= 6 s, muted, loop, `playsinline`, no audio track, `preload="none"`, AVIF poster <= 40 KB, `<source media="(max-width: 768px)">` 480p WebM <= 300 KB / MP4 <= 450 KB, desktop 720p WebM (AV1 or VP9) <= 600 KB / H.264 MP4 <= 900 KB. Mounted by `useApproach` at 100 %, `.play()` only when >= 50 % visible and `document.visibilityState === 'visible'`, `.pause()` on leave, never autoplays under REDUCED_MOTION or `saveData` (poster + play button instead). Skill AI's seven panels (§17) are low-poly panels with poster thumbnails; no file loads unless a panel is activated, and then the same policy applies to that one panel.

### J.6 GSAP: loading, tree-shaking, cleanup, rerenders

Imports: `import { gsap } from 'gsap'` and `import { ScrollTrigger } from 'gsap/ScrollTrigger'` only; no `gsap/all`, no MotionPath/Draw plugins (ShakirBeam samples each path into a 256-entry `Float32Array` with `getPointAtLength` once at mount). `@gsap/react` `useGSAP` provides the scoped context that reverts tweens and ScrollTriggers on unmount. `ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true })`. `ScrollTrigger.refresh()` is called by SceneController only, debounced 100 ms, after `document.fonts.ready` and after each dynamic island mounts; budget <= 3 refreshes per page load, <= 40 ScrollTrigger instances on `/`.

Cleanup rules (§28): every timeline is created inside `useGSAP(..., { scope })`; canvas loops register with `gsap.ticker.add` and remove on unmount; every `ResizeObserver`, `IntersectionObserver`, `matchMedia` listener and `AbortController` is disposed in the effect cleanup; timelines are `paused: true` and scrubbed, interactive tweens use `overwrite: 'auto'`; no `setInterval`; the ticker pauses on `visibilitychange` hidden and when the active scene is off-screen.

Rerender rules (§22): per-frame values never touch React state. Scene state lives in `useRef` and typed arrays; pointer parallax uses `gsap.quickTo` per depth layer; scroll progress comes from `hooks/useScrollProgress.ts` as `{ current: number }` plus a subscribe function, never state. The only React state written from scrolling is the discrete `activeScene` index at scene boundaries (for `aria-current` and nav highlighting). `FeatureNode` is `React.memo`; node lists and layout positions are `useMemo`; handlers are stable. Acceptance at M4: React Profiler shows zero commits from SceneController during a full scrub.

WebGL escalation trigger (the only route to WebGL, §25): if, at M3, the hero at HIGH cannot hold 55 fps with 1,800 tris on the reference laptop (J.8) after batching, LowPolyScene gets a raw WebGL2 backend (same props, ~8 KB) behind `renderer: 'canvas2d' | 'webgl2'`. Three.js stays out.

### J.7 Hydration

`app/page.tsx` is a Server Component composing `<section>` scenes; each scene renders copy, narrative and poster on the server and embeds one client island. First client paint uses the same "poster" look the server rendered, so there is no hydration mismatch; profile detection runs in `useEffect` and the canvas fades in afterwards. A 300-byte inline `<head>` script sets `data-intro="seen|unseen"`, `data-motion="system|on|off"` (from `localStorage['shakir.motion']`) and `data-perf` hint on `<html>` before paint, keeping the page statically rendered (no cookies, no dynamic rendering). Client islands receive only serializable props (`performanceLevel`, scene config id, `quietZones`).

### J.8 Device profiling and runtime downgrade

`lib/perf/profile.ts` `detectProfile()` runs once per session (cached in `sessionStorage['shakir.perf.profile']`, dev override `?perf=LOW` or `localStorage['shakir.perf.force']`):
- `prefers-reduced-motion: reduce` or `data-motion="off"` -> REDUCED_MOTION (a user choosing `data-motion="on"` overrides the media query).
- Start at HIGH. Cap at MEDIUM if viewport width < 1024 or `deviceMemory <= 4` or `hardwareConcurrency <= 4`. Cap at LOW if `deviceMemory <= 2`, `connection.saveData`, `effectiveType` in `2g|3g`, or `hardwareConcurrency <= 2`.
- Micro-benchmark during the first 600 ms (offscreen 512x512 canvas, 900 tris, 20 frames): mean frame > 12 ms -> down one level; > 24 ms -> down two.

Runtime governor inside LowPolyScene: rolling 120-frame window of ticker deltas; p95 > 20 ms for two consecutive windows -> downgrade one level (HIGH -> MEDIUM -> LOW), re-generate the mesh at the next idle slot, log `shakir.perf.downgrade` to the vitals beacon. Never auto-upgrades within a session (no oscillation). Reference devices: HIGH = M1 MacBook Air, Chrome stable, 1440x900 @2x and a Windows laptop with Intel Iris Xe; MEDIUM = iPhone 12, Pixel 6a; LOW = Moto G Power 2021 and Lighthouse 4x throttle.

### J.9 Graceful degradation

- No JavaScript: the server HTML already contains every heading, paragraph, step list, poster and link; `<noscript><style>` hides the intro shell. Nothing is gated behind hydration.
- `canvas.getContext('2d')` null or canvas unsupported: LowPolyScene keeps the poster, marks itself static, reports once.
- A scene island throws: an `ErrorBoundary` per island falls back to poster + copy; the rest of the page is unaffected.
- Slow network: intro auto-skips at 1,200 ms; demos wait for their chunk silently (their step list is already readable).
- Browser matrix: last 2 Chrome/Edge/Firefox, Safari 16+, iOS 16+, Samsung Internet last 1 (`inert`, `dialog`, `IntersectionObserver`, AVIF all native in this matrix; no polyfills).
- `forced-colors: active`: canvases get an opaque `Canvas` background, beams hidden, nodes get system borders.

### J.10 Measurement and monitoring

- Lighthouse CI (`@lhci/cli`, `lighthouserc.js`) on every PR: `/`, `/features`, one secondary route; mobile + desktop; assertions from J.1; `budgets.json` resource budgets. Fails the PR.
- `size-limit` (`.size-limit.json`) per chunk from J.1. Fails the PR.
- `@next/bundle-analyzer` under `ANALYZE=true` for diffs in review.
- Field vitals: `useReportWebVitals` -> `navigator.sendBeacon('/api/vitals')` with route, profile, downgrade events; stored for p75 review per milestone (first-party, ~2 KB, no third-party tags on `/`).
- Playwright `tests/perf/scroll-trace.spec.ts`: CDP tracing while scrolling `/` at 4x CPU throttle; asserts no long task > 100 ms after load, dropped frames < 5 % (warn), zero layout shifts after LCP.
- Dev overlay `components/dev/FrameStats.tsx` (non-production only, `?debug=perf`, toggle `Shift+P`): fps, p95 frame ms, tris, particles, active profile, active scene, ScrollTrigger count, canvas backing size, downgrade log; samples at 1 Hz from `gsap.ticker`.
- Manual per milestone: Chrome Performance panel at 4x throttle; Layers panel count against J.2.

### J.11 Performance checks per milestone (§33)

| Milestone | Must be true (with evidence attached to the milestone report) |
|---|---|
| M1 Foundation | Empty shell first-load <= 110 KB gz; fonts <= 120 KB; CLS 0; LHCI, size-limit, bundle-analyzer, FrameStats wired; profile detection stubbed |
| M2 Nav + hero | LCP <= 2.0 s mobile on hero logo; intro chunk <= 12 KB; intro ends <= 4 s and auto-skips at 1,200 ms without engine; nav hide/show causes no CLS; TBT <= 150 ms |
| M3 LowPolyScene | HIGH 1,800 tris >= 58 fps on reference laptop; MEDIUM 1,000 tris >= 55 fps on iPhone 12 / Pixel 6a; LOW 500 tris >= 30 fps at 4x throttle; governor downgrade proven at 6x throttle; WebGL2 trigger decided with numbers |
| M4 SceneController | Zero React commits during scrub; <= 40 ScrollTriggers; <= 3 refreshes per load; INP <= 150 ms in Playwright; no long task > 100 ms post-load |
| M5 ShakirOne | Chunk <= 35 KB; loaded >= 1 viewport before entry; beam instances <= 2 |
| M6 FeatureUniverse | Chunk <= 45 KB; hover/focus visual response <= 100 ms; 21 nodes hydrate without a long task |
| M7 Demos | Each chunk <= 30 KB; one rAF loop active at a time; Network panel shows 0 video bytes until approach; Image AI gallery <= 420 KB |
| M8 Trust + CTA + footer | Final CTA collapse p95 frame <= 20 ms at HIGH; Trust scene <= 200 tris; footer logo asset <= 20 KB |
| M9 Responsive | Full mobile LHCI >= 90, LCP <= 2.0 s, images <= 900 KB; profile resolves MEDIUM on iPhone 12 and LOW on Moto G; no horizontal overflow at 360/412/768/1024/1440/1920 |
| M10 Final gate | Every row of J.1 and J.2 re-measured on production build; field vitals flowing; evidence table in the report; no PASS claimed without the numbers (§32) |

---

## K. ACCESSIBILITY PLAN

Scope: brief §23, §04 (reduced-motion alternative), §11, §20, §32. Target: WCAG 2.2 AA throughout, AAA for body-text contrast (1.4.6) and animation from interactions (2.3.3). Every important interaction works without a mouse (§23) and, by design, without the canvases.

### K.1 Semantic structure and heading outline

Landmarks: `<header>` (contains `<nav aria-label="Primary">`), `<main id="main">`, `<footer>` (contains `<nav aria-label="Footer">`). Each scene is `<section aria-labelledby="h-{scene}">`. `<html lang="en">`, unique `<title>` per route, `scroll-padding-top: 88px` on `html` so the fixed header never covers a focus target. ScrollTrigger pin-spacers are plain wrappers and change nothing semantically; DOM order equals narrative order in every scene.

Home page outline (one `h1`):
- `h1` ONE INTELLIGENCE. LIMITLESS POSSIBILITIES. (hero; the logo precedes it as `<img alt="SHAKIR AI">`)
- `h2` One Shakir. (ShakirOne) with a visible `<ol>` of USER REQUEST -> SHAKIR ONE -> UNDERSTAND -> ROUTE -> CREATE / RESEARCH / BUILD / ACT -> VERIFY -> RESULT
- `h2` Twenty-one capabilities. One system. (FeatureUniverse) with `h3` per world: CREATE, LEARN, BUILD & GROW, ACT, TRUST, HUMAN, and a `h3` "Chat and Shakir One" for the centre; nodes are `<li><button>` under each world
- `h2` per demo scene (Chat AI, Website Builder AI, Image AI, Video AI, Code AI, Skill AI, Business AI, Automation AI, Live AI), each with an `<ol>` of steps and `aria-current="step"`
- `h2` Power with control. (Trust) with a `<ul>` of the six items
- `h2` What will you create? (Final CTA)
- Footer links grouped under `nav aria-label="Footer"`; no heading needed

### K.2 Text alternatives for canvases and decorative art

Every `<canvas>` and decorative SVG (LowPolyScene, ShakirBeam, IntroSequence layer, particle layers) is `aria-hidden="true"`. Each scene has a server-rendered `<p class="sr-only" id="narrative-{scene}">` placed before its visible headline, written as prose that carries the story (for example, hero: "A low-poly landscape of blue, violet and teal facets shifts slowly behind the headline; a thin beam of light crosses it."). Narratives are static per scene, never updated per frame. ShakirOne's flow and FeatureUniverse's relationships are visible text, so no duplicate hidden copy. Business AI charts are `<figure>` with `<figcaption>` and a `<table class="sr-only">` of the plotted values. Logo: nav link name "SHAKIR AI, home"; hero `alt="SHAKIR AI"`; any further decorative instance `alt=""`.

### K.3 Keyboard model

| Element | Keys |
|---|---|
| Skip links (K.6) | first tab stops; Enter |
| Intro skip | `<button>` "Skip intro" is the first focusable element while the intro runs; Enter/Space; Escape anywhere skips; the intro never traps focus and `main` is never `inert` behind it |
| Primary nav | links via Tab; mobile menu `<button aria-expanded aria-controls="primary-menu">`, Escape closes and returns focus to the toggle, rest of page `inert` while open; the hide-on-scroll header re-shows itself on `:focus-within` |
| Motion toggle (K.7) | `<button aria-pressed>`; Enter/Space |
| Hero CTAs | real `<a>`; EXPLORE FEATURES targets `#feature-universe` and respects `scroll-behavior` per motion setting |
| FeatureUniverse (§10/§11) | one tab stop for the whole map (roving tabindex, default node = Chat AI at the centre, last focused node remembered); Arrow keys move spatially to the nearest node in that direction (dot-product + distance score on the current layout's node positions); Home = Chat AI; End = last node of HUMAN; first-letter type-ahead jumps to the next feature starting with that letter; Enter/Space opens the detail dialog; Escape collapses the expanded hover/focus state (1.4.13); a visible `<button aria-pressed>` "Show as list" swaps the map for a grouped list of 21 links (also the default under REDUCED_MOTION and LOW) |
| Feature node focus | identical to hover: polygon expands, name and description appear, connected capabilities light; the description and "Connected to Research, Business, ..." are always in the DOM and referenced by `aria-describedby` |
| FeatureDetailDialog | native `<dialog>` + `showModal()` (built-in focus trap and `inert` background); focus lands on the dialog `h2` (`tabIndex=-1`); Escape and the Close button close; focus returns to the opening node via `openerRef`; Prev/Next feature buttons, plus ArrowLeft/ArrowRight when focus is not in a text field, re-focus the heading so the new title is announced; `?feature={slug}` is mirrored with `router.replace(..., { scroll: false })`; page scroll locked with `overflow: hidden` on `html` + `scrollbar-gutter: stable` (never `position: fixed` on body, which would break ScrollTrigger) |
| Demo steppers (§12-§20) | each demo is `role="group" aria-roledescription="demonstration"` with a toolbar: Play/Pause (`aria-pressed`), Previous step, Next step, Restart; ArrowLeft/ArrowRight step while focus is inside the group; Space toggles play only when the Play button is focused (never steals page scroll); when the stepper is used, SceneController detaches the scroll scrub for that demo (`manualMode`) until focus leaves the group |
| Website Builder device tabs (§13) | `role="tablist"` Desktop / Tablet / Mobile, ArrowLeft/ArrowRight, automatic activation |
| Skill AI panels (§17) | seven `<button>`s in a `role="group"`, Tab between them, Enter activates one preview |
| Forms (K.8) | native controls; Enter submits |
| Footer nav | links via Tab |

Pointer-only affordances do not exist: anything that reacts to hover reacts identically to `:focus-visible`.

### K.4 Visible focus style

Two-ring design so the ring is visible on graphite and on bright gold/amber facets alike (2.4.11, 2.4.13):

```css
:focus-visible {
  outline: 2px solid #EAF6FF;        /* soft cyan-white, >= 3:1 against every palette facet and the base */
  outline-offset: 3px;
  box-shadow: 0 0 0 5px #0B0F14;     /* graphite halo separating the ring from bright geometry */
  border-radius: 6px;
}
:focus:not(:focus-visible) { outline: none; }   /* pointer users only; never a global outline: none */
```

Feature nodes are real `<button>`s positioned over the canvas; their ring is an SVG `<polygon class="node-ring">` following the facet shape (`stroke: #EAF6FF; stroke-width: 2; paint-order: stroke; filter: drop-shadow(0 0 0 2px #0B0F14)`) with the rectangular `outline` retained underneath for `forced-colors` (where it maps to `Highlight`). Focus ring transitions are 0 ms. Minimum target size 24x24 CSS px everywhere (2.5.8), 44x44 for nodes, stepper buttons and CTAs on touch.

### K.5 Contrast on low-poly backgrounds

- Body text #F2F4F7 on base #0B0F14 (about 17:1); body >= 7:1, headings >= 4.5:1, UI components, icons and focus rings >= 3:1; accent-coloured text (cyan, amber) only at >= 18 px bold and >= 4.5:1; links in copy are underlined, not colour-only.
- Text never sits on live geometry unprotected. Two mechanisms, both always on: (1) LowPolyScene `quietZones` prop: rectangles (the text blocks' boxes, reported by `ResizeObserver`) in which facet luminance is capped at 35 % and particle density is 0; (2) a scrim `linear-gradient(to top, rgba(8,10,14,.92) 0%, rgba(8,10,14,.72) 60%, transparent 100%)` or a text plate `rgba(8,10,14,.6)` + `backdrop-filter: blur(16px)` (opaque `.9` plate under LOW). Contrast is computed against the brightest facet the palette allows under the scrim (gold #E8C66B at 72 % graphite = ~#4A4030), which still yields >= 7:1 for body text.
- `prefers-contrast: more`: scrims go to `.96`, translucent plates become opaque, beam opacity drops to 40 %.
- Verified by the pixel-sampling test in K.10, not by eye.

### K.6 Skip links and pinned-scene behaviour

Skip links (visually hidden until focused, then a fixed top-left graphite plate, 44 px tall): "Skip to main content" (`#main`), "Skip intro" (present only while the intro runs), "Skip to feature worlds" (`#feature-universe`), and inside every pinned scene a "Skip past this demonstration" link to the next scene's heading, because pinned scenes can be 300-500 vh long.

Pinned scenes: all step content stays in the DOM in narrative order, so screen readers read the whole story regardless of pin state. Steps that are not yet revealed are `inert` so focus can never land on an invisible control (2.4.7, 2.4.11); in list view and REDUCED_MOTION nothing is `inert`. When focus enters a pinned scene (`focusin`), SceneController scrolls to the exact scroll position where that step is fully revealed (`trigger.start + stepProgress * (trigger.end - trigger.start)`, `behavior: 'auto'` under reduced motion, otherwise `'smooth'`), so keyboard and low-vision screen-reader users always see the state that matches the focused element. Keyboard scrolling (Space, PageDown, arrows) works natively through pins because scroll is never hijacked. Pins are disabled below 768 px width or 600 px height and under REDUCED_MOTION; at 400 % zoom (1280 -> 320 CSS px) the page reflows to the stacked mobile composition with no horizontal scroll (1.4.10); no text container has a fixed height, so user text-spacing overrides never clip (1.4.12).

### K.7 Reduced motion and the motion toggle

Source of truth is `hooks/useReducedMotion.ts`: resolves `data-motion` on `<html>` (`system | on | off`, persisted in `localStorage['shakir.motion']`, written by the inline head script before paint) against `prefers-reduced-motion`. A `<button aria-pressed>` "Motion" sits in the header utility area and the footer; changing it fires `shakir:motion-change`, SceneController reverts its `gsap.matchMedia` context and rebuilds from `animations/reduced-motion/` with one `ScrollTrigger.refresh()`.

What REDUCED_MOTION means (this is the §04 "reduced-motion alternative", applied site-wide): no IntroSequence (400 ms logo crossfade), no continuous canvas loop (posters), no parallax, no pinning, scene transitions are <= 200 ms opacity crossfades, ShakirBeam is a static gradient line, demos are plain steppers with no autoplay, no video autoplay, hover expansions are instant state changes, no counters, no typing effects (full text shown). The hero environment at full motion runs longer than 5 s, so the motion toggle is the required pause control for 2.2.2; it also pauses on `visibilitychange`. Flash safety (2.3.1): beam passes and light sweeps last >= 600 ms, never more than 3 luminance events per second, and no full-viewport luminance change exceeds 10 % within 300 ms.

### K.8 Live regions, demos, forms and errors

Live regions: one `<div class="sr-only" aria-live="polite" aria-atomic="true" id="status-{demo}">` per demo, updated only at step boundaries with one sentence ("Step 4 of 7: Fix. Shakir corrected the failing test."), rate-limited to one announcement per 1,500 ms, and only when the user drives the stepper (scroll-driven playback announces nothing; the step list already carries the content). Chat AI typing (§12): the full message exists in the DOM immediately in a visually hidden node and the visibly typed text is `aria-hidden`, so a screen reader hears each message once. Code AI (§16): final `<pre><code>` in DOM, diff animation visual-only. Live AI (§20): `<span role="status">LIVE</span>` with the sentence "Screen access in this demonstration is simulated and permission-based" as visible text.

Forms (`/contact` and any capture form): `<label for>` on every control, hint and error text linked through `aria-describedby`, `aria-invalid="true"` on failure, "(required)" written in the label, `autocomplete` on name/email, submit button never disabled; on submit with errors an error summary `role="alert"` lists the fields as links and focus moves to the first invalid control; errors say what to fix ("Enter an email address like name@example.com"); success is a `role="status"` message that also receives focus. Honeypot fields are `aria-hidden` and `tabindex="-1"`.

### K.9 Linting and component-level checks

`eslint-plugin-jsx-a11y` strict config in `lint` (§32). Vitest + Testing Library component tests with `vitest-axe` for Nav, MobileMenu, MotionToggle, FeatureNode, FeatureUniverse (arrow-key navigation table), FeatureDetailDialog (open, trap, Escape, focus return), DemoStepper, DeviceTabs, ContactForm (error summary, focus to first invalid). No Storybook in v1.

### K.10 Testing and acceptance thresholds

| Check | Tooling / script | Acceptance |
|---|---|---|
| Automated WCAG | `@axe-core/playwright` in `tests/a11y/axe.spec.ts`: every route, and on `/` every scene after scrolling it active; tags `wcag2a wcag2aa wcag21aa wcag22aa best-practice`; run in both motion modes (`emulateMedia({ reducedMotion })`), 3 viewports (360, 768, 1440), plus a `forced-colors` smoke run | 0 violations of any impact; any exemption must be listed in `tests/a11y/exemptions.ts` with a reason and reviewer |
| Keyboard-only | `tests/a11y/keyboard.spec.ts`: Tab through `/` end to end asserting the focused element sequence, that each focused element's box is inside the viewport and is the top-most element at its centre (`elementFromPoint`), dialog open/trap/close/return, FeatureUniverse arrow navigation reaches all 21 nodes, stepper controls, skip links; manual script in `docs/qa/keyboard-walkthrough.md` (30 steps) | 100 % of steps pass; focus never lands on an invisible or obscured element; no keyboard trap |
| Screen readers | Manual passes with `docs/qa/screen-reader-checklist.md`: VoiceOver + Safari (macOS), VoiceOver + iOS Safari, NVDA + Firefox, NVDA + Chrome; smoke passes at M2, M6, M7, full pass at M10, recorded as transcript or video evidence | Every scene narrative read in order; all 21 features discoverable, openable and closable with focus return; dialog announced with its name; no unnamed control; each stepper step announced once |
| Colour contrast | axe `color-contrast` plus `tests/a11y/contrast.spec.ts`: screenshots at 5 scroll positions per scene, samples the maximum background luminance under each text block, computes contrast against the text colour | Body >= 7:1, headings >= 4.5:1, UI >= 3:1 at every sampled position, both motion modes |
| Reduced motion | Playwright with `reducedMotion: 'reduce'` and with the in-page toggle set to off: asserts no `<canvas>` loop running (ticker inactive), no pinned sections, no `<video>` autoplay, intro absent | All assertions pass; toggle state persists across reload |
| Zoom and reflow | Playwright at 320 px width and at 400 % zoom emulation | No horizontal scroll; all content reachable |
| Lighthouse | LHCI accessibility category | 100 on every route |
| Target size | Script measures every interactive element's box at 360 px | >= 24x24; nodes, steppers, CTAs >= 44x44 |

Milestone mapping (§33): M1 lint + focus style + skip links + motion toggle in place; M2 intro skip and nav keyboard/axe green; M4 pinned-scene focus sync and `inert` steps; M5 ShakirOne text flow; M6 FeatureUniverse keyboard model, list view, dialog; M7 steppers and live regions; M8 forms; M9 zoom/reflow and target sizes; M10 the full table above with evidence attached, otherwise the gate does not pass (§32).
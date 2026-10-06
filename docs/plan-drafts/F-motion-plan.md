# F. GSAP / Motion plan

Scope: brief §04, §05, §06–§07, §08, §11, §22 (animation cleanup, GPU-friendly), §23 (reduced motion), §28. Everything below is written for the agreed stack (Next.js App Router, React, TypeScript, Tailwind, GSAP 3.13+ with ScrollTrigger). GSAP's formerly-paid plugins are free since 3.13; the plugin set is fixed below and nothing else is added.

## F.1 Motion architecture

### F.1.1 Dependencies and plugin set (fixed)

| Package / plugin | Used for | Not used |
|---|---|---|
| `gsap` 3.13+, `@gsap/react` (`useGSAP`) | core, React-safe context | — |
| `ScrollTrigger` | every scroll scene | `ScrollSmoother` (hijacks native scroll; breaks App Router, touch and AT) |
| `CustomEase` | the named eases in F.2 | `CustomBounce`, `CustomWiggle` (banned feel) |
| `Flip` | 3 moves only: intro logo → hero logo slot, hero logo → nav logo slot, feature node → detail header | — |
| `DrawSVGPlugin` | ShakirBeam traveling segment (`drawSVG: "a% b%"`) | `MotionPathPlugin` (beam head position comes from `path.getPointAtLength()`) |
| `SplitText` (`type: 'lines'`, `autoSplit: true`; `words` only for the hero headline) | text reveals | `chars` splitting (DOM count) |
| `Observer` | intro skip detection (wheel / touch / arrow keys) | `ScrollTrigger.normalizeScroll` (never) |

### F.1.2 Files (all animation code lives here; mirrors brief §26)

```
animations/
  motion/
    MotionProvider.tsx      // registers plugins once, owns profile + intensity, exposes registry via context
    registry.ts             // central timeline registry (F.1.3)
    eases.ts                // CustomEase registrations (F.2)
    durations.ts            // D.* constants (F.2)
    intensity.ts            // profile -> intensity scalar + per-profile caps (F.2.3)
    guards.ts               // dev-only forbidden-property guard (F.6.5)
    debug.tsx               // MotionDebugHud (dev only, ?motion=debug)
  timelines/
    intro.timeline.ts       // 'intro.main'
    hero.timeline.ts        // 'scene.hero' (idle + exit)
    fracture.timeline.ts    // 'scene.fracture'
    interface.timeline.ts   // 'scene.interface' (chat demo)
    universe.timeline.ts    // 'scene.universe'
    builder.timeline.ts     // 'scene.builder'
    automation.timeline.ts  // 'scene.automation'
    one.timeline.ts         // 'scene.one'
    cta.timeline.ts         // 'scene.cta'
    feature.micro.ts        // 'feature.hover', 'feature.select'
  scroll/
    SceneController.tsx     // one master scroll timeline per scene (F.1.5)
    conventions.ts          // ScrollTrigger defaults (F.1.4)
    refresh.ts              // resize/refresh policy (F.1.7)
    useSceneProgress.ts
  transitions/
    sceneCrossfade.ts       // DOM-layer handoff between scenes (F.6.3)
    featureDetail.ts        // route-level open/close
  beam/
    ShakirBeam.tsx          // SVG renderer (F.5)
    beamSpec.ts             // single source of width/color/speed for SVG and canvas renderers
    useBeamPass.ts
  reduced-motion/
    matrix.ts               // the F.8 table as code: class -> behaviour per profile
    posters.ts              // static end-states per scene
hooks/
  useGsap.ts                // thin wrapper over useGSAP (F.1.3)
  useReducedMotion.ts       // media query + user toggle (F.8.1)
  useScrollProgress.ts      // read-only subscription to a SceneController's progress
```

### F.1.3 Registry, `useGsap`, and the "no direct gsap" rule

- `registry.ts` exports `register(name, factory)`, `build(name, scope, opts)`, `get(name)`, `kill(name)`, `killAll()`, `rebuild()`. Every timeline in the site is a **factory** with the signature `(ctx: { scope: HTMLElement; q: gsap.utils.SelectorFunc; profile: PerformanceProfile; intensity: number; scene?: LowPolySceneHandle }) => gsap.core.Timeline`. Factories are pure: no listeners, no DOM creation; they build a paused timeline and return it. The registry stores the instance, tags it with `data.name`, and is the only place `gsap.timeline()` is called for page motion.
- `hooks/useGsap.ts` wraps `useGSAP` from `@gsap/react`: `useGsap((ctx) => { ... }, { scope: ref, dependencies: [profile], revertOnUpdate: true })`. The callback receives the registry-bound `build()` so a component writes `build('feature.hover', nodeEl)` and gets back a timeline; on unmount `gsap.context().revert()` kills every tween, ScrollTrigger, SplitText and Flip state created inside it. There is no other way to create motion in a component.
- Rule (enforced by ESLint `no-restricted-imports` for `gsap`, `gsap/*`, `@gsap/react` everywhere except `animations/**` and `hooks/useGsap.ts`): components never import gsap. They import `useGsap`, registry names, and `ShakirBeam`. A CI grep test fails the build on any other import.
- Global defaults set once in `MotionProvider`: `gsap.defaults({ ease: 'shakir.out', duration: D.base, overwrite: 'auto' })`, `gsap.config({ nullTargetWarn: false })`, `gsap.ticker.lagSmoothing(500, 33)` (default kept).
- No animation value ever lives in React state. Progress, pointer, and scene stage are written to refs / plain objects and read by `gsap.quickSetter` or the canvas loop. `onUpdate` callbacks never call `setState`.

### F.1.4 ScrollTrigger conventions (`scroll/conventions.ts`)

| Setting | Value | Reason |
|---|---|---|
| `scrub` | `0.6` desktop, `0.4` touch (touch scrolling already has inertia); Final CTA `0.8` | film-like weight without lag |
| `pin` | `pin: true, pinSpacing: true, anticipatePin: 1, pinType: 'fixed'` | one pin spacer, no pop at pin start |
| `start` / `end` | `'top top'` / `() => '+=' + length * innerHeight / 100` (length in vh) | function values so refresh recomputes |
| `invalidateOnRefresh` | `true` on every scene trigger | viewport-dependent tween values rebuild |
| `snap` | off by default; on only in FeatureUniverse: `{ snapTo: 'labels', duration: { min: 0.2, max: 0.6 }, delay: 0.1, ease: 'shakir.out', directional: true }`; off under REDUCED_MOTION | snapping fights the "controlled video" feel everywhere else; in the universe it makes a world a destination |
| `fastScrollEnd` | `2500` on pinned scenes that contain time-based text reveals | prevents half-played text states after a flick |
| `toggleActions` (non-scrubbed reveals in unpinned sections) | `'play none none reverse'`; hero/above-the-fold: `once: true` | reversible when scrolling back, no replay spam |
| `markers` | `process.env.NODE_ENV !== 'production' && location.search.includes('motion=debug')` via `ScrollTrigger.defaults({ markers })` | markers off in ordinary dev so layout reviews stay clean |
| `refreshPriority` | `-sceneIndex`, then `ScrollTrigger.sort()` after mount | guarantees top-to-bottom refresh order regardless of effect order |
| config | `ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' })` | address-bar resizes never refresh |
| breakpoints | all scene timelines are built inside `gsap.matchMedia()` with conditions `desktop: '(min-width: 1024px)'`, `tablet: '(min-width: 768px) and (max-width: 1023px)'`, `mobile: '(max-width: 767px)'`, `reduced: '(prefers-reduced-motion: reduce)'` | automatic revert + rebuild on breakpoint change |

### F.1.5 SceneController

One `SceneController` per scene; it owns exactly one master scroll timeline and is the only thing that creates a pinned ScrollTrigger.

```tsx
<SceneController
  id="hero"                 // unique; used as registry key suffix and data-scene attr
  stage="hero"              // LowPolyScene stage this scene drives
  length={150}              // vh of scroll travel while pinned (0 = unpinned reveal)
  pin                       // omitted on unpinned scenes
  scrub={0.6}
  snap={false}
  labels={{ hold: 0, exitUi: 0.35, fracture: 0.5, end: 1 }}
  build="scene.hero"        // registry factory name
>
```

- Master timeline: `gsap.timeline({ paused: true, defaults: { ease: 'none' } })` with `addLabel()` for every entry in `labels` (progress fractions × total duration of 1). The factory adds child timelines at labels: `master.add(build('hero.exitUi', scope), 'exitUi')`. The ScrollTrigger is attached by SceneController, never by the factory, so factories are testable without scroll.
- Progress exposure: `onUpdate: (self) => { progressRef.current = self.progress; setVar(self.progress); scene?.setStage(stage, self.progress); listeners.forEach(cb => cb(self.progress)); }` where `setVar = gsap.quickSetter(root, '--scene-progress')`. `LowPolyScene` receives the `(stage, progress)` pair through its imperative handle (`useImperativeHandle`: `setStage`, `set(params)`, `setPointer`, `setBeam`) and reads it inside its own render loop; `useScrollProgress(id)` lets a DOM child subscribe without rerendering.
- Label events: `SceneController.at(label, { enter, leave })` fires once when progress crosses a label in either direction (tracked in `onUpdate` against the previous progress), used for time-based typography reveals (F.6.2) and beam passes.
- Stage blending: `LowPolyScene` crossfades geometry parameters over the last 8% of the outgoing scene and the first 8% of the incoming one, so consecutive SceneControllers produce one continuous environment (the "no section-section-section" requirement of §06 is satisfied by a single persistent canvas, see F.4.6).

### F.1.6 Interruptibility (§28)

- Hover/focus/press states use one pre-built paused timeline per element and only `play()` / `reverse()`; new tweens are never created on events.
- Pointer-driven values use `gsap.quickTo()` (built-in overwrite).
- Every scrubbed timeline is interruptible by definition; time-based child reveals inside scenes use `overwrite: 'auto'` and can reverse from any progress.
- Intro skip tweens the intro's `progress` to the `handoff` label (F.3.3) instead of jumping; a second skip during the fast-forward is ignored.
- Feature detail open can be reversed from any progress (Escape mid-open reverses from current position, 420 ms).
- Time-driven loops (idle beam passes, light angle) are `gsap.delayedCall` / repeating tweens registered under `loop.*` and checked against `document.hidden` and viewport intersection before each cycle; `MotionProvider` pauses `loop.*` on `visibilitychange` and resumes on return.

### F.1.7 Cleanup, route change, resize/refresh (§22)

- Unmount: `useGsap` reverts its `gsap.context`, which kills tweens, ScrollTriggers (incl. pin spacers), SplitText, and Flip state. Nothing is left in `ScrollTrigger.getAll()` after the home page unmounts (asserted in a component test).
- Route change: `MotionProvider` watches `usePathname()`; on change it runs `registry.killAll()`, `ScrollTrigger.killAll()`, `ScrollTrigger.clearScrollMemory('manual')`, cancels `loop.*`, then after two animation frames on the new route calls `ScrollTrigger.refresh()`. The feature-detail intercepting route (F.7.3) does not change the home page's triggers; it pauses them (`ScrollTrigger.getAll().forEach(t => t.disable(false))`) while the modal is open and re-enables on close.
- Refresh triggers: `document.fonts.ready`, intro completion, `onLoad` of every `next/image` inside a pinned scene (debounced 150 ms), modal close, and breakpoint change (via matchMedia revert/rebuild). Resize: a 250 ms debounced listener refreshes only when `innerWidth` changed or (non-touch) `innerHeight` changed by more than 120 px.
- Pinned heights use `100svh` (fallback `100vh`) so mobile address-bar changes never shift pinned scenes.

## F.2 Easing, timing, and intensity vocabulary

### F.2.1 Named eases (`animations/motion/eases.ts`, registered via `CustomEase.create`)

| Name | Curve | Use |
|---|---|---|
| `shakir.out` | `M0,0 C0.19,1 0.22,1 1,1` | default; entrances, hover expand, UI arrival |
| `shakir.in` | `M0,0 C0.7,0 0.84,0 1,1` | exits only |
| `shakir.inOut` | `M0,0 C0.76,0 0.24,1 1,1` | assembly, camera dolly, feature-detail wipe |
| `shakir.facet` | `M0,0 C0.22,0.9 0.36,1.02 1,1` | triangle/facet settling (2% overshoot max, crystalline, not bouncy) |
| `shakir.beam` | `M0,0 C0.55,0 0.15,1 1,1` | every beam pass: fast launch, long decelerating tail |
| `shakir.settle` | alias `power3.out` | pointer return, hover release |
| `none` | linear | every scrubbed timeline |

Banned: `bounce`, `elastic`, `back` with overshoot > 1.2, `steps`. (§01: not childish.)

### F.2.2 Durations (`durations.ts`, seconds) and staggers

| Token | Value | Use |
|---|---|---|
| `D.instant` | 0 | state swaps, reduced-motion fallbacks |
| `D.micro` | 0.12 | focus ring, color/opacity ticks, press |
| `D.quick` | 0.22 | hover expand, label appear |
| `D.base` | 0.42 | standard reveal |
| `D.slow` | 0.70 | scene-piece transitions, feature-detail wipe (0.52) |
| `D.cinematic` | 1.20 | logo emergence, ShakirOne activation |
| `D.beam` | 1.60 | reference beam pass (actual pass duration is speed-derived, F.5.3) |

Staggers: `S.tight = 0.02`, `S.base = 0.05`, `S.wide = 0.09`; the total span of any stagger group is capped at 0.6 s (`stagger: { each, from: 'start' }` with `each = min(S.x, 0.6 / n)`).

### F.2.3 Motion-intensity scale tied to performance profiles (`intensity.ts`)

Durations never change across profiles (timing consistency); amplitudes, counts and cadence do.

| Profile | `intensity` | amplitude × | stagger × | idle loops | pointer response | idle beam passes | canvas loop |
|---|---|---|---|---|---|---|---|
| HIGH | 1.0 | 1.0 | 1.0 | all | on | every 9–14 s | 60 fps |
| MEDIUM | 0.7 | 0.7 | 1.0 | all, fewer facets | on × 0.6 | every 14–20 s | 60 fps |
| LOW | 0.4 | 0.4 | 0.5 | rotation only | off | none (scrubbed beams only) | 30 fps |
| REDUCED_MOTION | 0 | 0 | 0 | off | off | static line | static frame, redraw on resize/stage change only |

Caps per profile: simultaneous time-based timelines HIGH 6 / MEDIUM 4 / LOW 2; DOM composited layers per pinned scene HIGH 8 / MEDIUM 6 / LOW 4.

## F.3 IntroSequence (§04)

### F.3.1 Principle: the intro is the first 3.2 s of the hero, not a separate screen

`IntroSequence` does not own geometry. The hero's `LowPolyScene` mounts immediately in stage `intro` and the registry timeline `intro.main` drives its parameters (`points`, `assembly`, `cameraZ`), the hero's `ShakirBeam`, the hero's `Logo` node, and the hero UI. The final frame of the intro is literally the hero's resting state, so the handoff has no cut and no DOM swap. `IntroSequence` itself renders only the Skip control and the `aria-live` status text.

### F.3.2 Shot list (desktop, HIGH/MEDIUM; `t` in ms)

| # | t | Shot (brief §04 beat) | What animates |
|---|---|---|---|
| 1 | 0–150 | Black / deep graphite | hero background `#0A0B0E`; nothing else. Server-rendered, so there is no flash before hydration. |
| 2 | 150–700 | Tiny points of light | 48 (HIGH) / 24 (MEDIUM) 1–2 px points: opacity 0 → 0.9, `each: 0.012`, then twinkle 0.6↔0.9 with per-point phase |
| 3 | 500–1300 | Triangular fragments emerge | 120 (HIGH) / 72 (MEDIUM) fragments spawn at the points: scale 0 → 1, rotation ±12° → 0, `shakir.facet`, `each: 0.006` |
| 4 | 1100–2000 | Fragments assemble; environment forms | `assembly` 0 → 1 (each fragment lerps scattered → mesh position), `shakir.inOut`; far layer brightness 0 → 1 |
| 5 | 1800–2700 | Thin colored beam travels through it | canvas beam (F.5) one pass lower-left → upper-right through facet centroids, `variant: 'intelligence'`; facets within 60 px of the head brighten +10% for 400 ms |
| 6 | 2200–2900 | Logo emerges | official logo node: opacity 0 → 1, uniform scale 0.96 → 1, y 12 → 0, `shakir.out`. Uniform scale and opacity only; never skew, non-uniform scale, or a redraw |
| 7 | 2600–3000 | Light passes over logo | a 40%-wide diagonal soft-white band (opacity 0.3) sweeps across the logo bounds, `mask-image` = the logo alpha. Gated by `LOGO_HAS_ALPHA`; until the transparent asset arrives this shot is skipped, not approximated |
| 8 | 2800–3200 | "SHAKIR AI" appears | wordmark text: opacity 0 → 1, letter-spacing 0.32em → 0.24em, 400 ms |
| 9 | 3200–3600 | Scene transitions into hero (`handoff` label) | Flip move of the logo node from intro position (centered, 36vh tall) to its hero slot (transform-only, `Flip.fit` computed at build); `cameraZ` 1.08 → 1.0; headline lines y 24 → 0 + opacity (`each: 0.08`), support line, CTAs (`each: 0.06`), nav y −12 → 0; Skip control fades out |

Core intro: 3.2 s; interactive hero by 3.6 s (within the 2–4 s target; CTAs are focusable from `handoff`).

Start conditions ("no unnecessary delay"): the timeline starts on hydration only if `performance.now() < 1500` (otherwise the page is already visible and we warm-start, F.3.4) and after `logoImg.decode()` resolves or 800 ms elapses, whichever is first. Hidden tab at load: hold at shot 1 until `visibilitychange`, maximum 5 s, then mark done and warm-start.

### F.3.3 Skippable (button + keyboard + scroll)

- Button: `IntroSequence` renders `<button class="intro-skip">Skip intro</button>` from `t = 0` (first focusable element in the DOM during the intro; 44×44 px hit area; bottom-right, 24 px inset; opacity fades in 300–600 ms so it is never a flash).
- Keyboard: `Escape` anywhere; `Enter` / `Space` on the button; `ArrowDown`, `PageDown`, `End` (scroll intent) skip too.
- Scroll: `Observer.create({ type: 'wheel,touch', onDown: skip, tolerance: 10 })` — a wheel tick or a 10 px downward touch drag skips. Clicks on empty space do not (accidental taps).
- Skip behaviour: `gsap.to(introTl, { progress: handoffProgress, duration: 0.25, ease: 'shakir.out' })` then the `handoff` child plays at normal speed. Because the same `LowPolyScene` is being driven, fast-forward looks like an accelerated assembly, not a cut; the hero is fully interactive ~650 ms after a skip. Focus moves to the primary CTA after a keyboard skip, stays where it is after a pointer skip.

### F.3.4 Session gating and warm start

- Key: `sessionStorage['shakir:intro:v1'] = '1'`, written on completion or skip. A `beforeInteractive` inline script in `app/layout.tsx` reads it and sets `<html data-intro="pending" | "done">` before first paint; CSS hides the hero UI (`html[data-intro="pending"] .hero-ui { opacity: 0 }`) so there is no hydration flash. Warm start (`done`): no intro timeline; `LowPolyScene` mounts at `assembly = 1`, hero UI crossfades in over 600 ms. Only `/` runs the intro; other routes never do. Replays only in a new tab/session, never on in-app navigation (§04 "should not replay annoyingly").
- No-JS / slow-JS safety: `html[data-intro="pending"] .hero-ui { animation: introSafety 0.4s 2.5s forwards }` makes the hero visible at 2.5 s even if GSAP never arrives; `html:not([data-intro]) .hero-ui { opacity: 1 }` covers no-JS.

### F.3.5 Reduced-motion alternative (what the user sees)

No timeline. The page opens on the composed hero: static low-poly frame (`assembly = 1`), logo, wordmark, headline, CTAs, all present. A single 600 ms opacity crossfade from graphite to the hero is the only motion (opacity-only fades are acceptable under reduced motion). The beam is a static 1.5 px gradient line at 0.35 opacity resting in the geometry. The session key is still written. The Skip control is not rendered (nothing to skip).

### F.3.6 Mobile variant (≤ 767 px or `pointer: coarse`)

Total 2.2 s (handoff complete at 2.7 s): points 12, fragments 60 with no rotation, assembly 700–1400 ms, beam 1300–1900 ms along a short vertical path behind the logo, logo 1500–2000 ms centered, wordmark 1900–2200 ms, handoff 2200–2700 ms into the stacked mobile hero. Touch drag skips. LOW profile on any viewport runs a 1.6 s variant: points → assembly → logo → wordmark, no beam, no fragment rotation.

## F.4 Hero liveness (§05)

All hero idle motion is owned by `scene.hero` (registry) and rendered by the one `LowPolyScene` loop (`gsap.ticker.add(render)`; there is exactly one rAF consumer on the page). Budget: 4 GSAP tweens + 6 `quickTo` setters alive during idle.

### F.4.1 Triangle rotation
Each facet rotates about its centroid: amplitude ±1.5° (HIGH) / ±1.0° (MEDIUM) / ±0.5° (LOW), period 9–14 s randomized per facet, sinusoidal with per-facet phase, computed in the render loop (no per-triangle tweens).

### F.4.2 Light refraction
A virtual light vector revolves once per 48 s (`gsap.to(params, { lightAngle: 360, duration: 48, ease: 'none', repeat: -1 })`). Facet brightness = base + specular(normal · light); facets within 25° of the light pick up a 6–10% tint toward cyan or warm amber depending on their palette zone (the logo's own cool-to-warm split). A beam pass adds a transient +10% brightness to facets within 60 px of the head, decaying over 400 ms.

### F.4.3 Depth shift
Three depth layers (far / mid / near) with parallax factors 0.2 / 0.5 / 1.0. Breathing: layer scale 1.000 ↔ 1.015 over 12 s sine yoyo, far layer in opposite phase. Rendered as per-layer transforms of the canvas layer groups, not DOM.

### F.4.4 Pointer response
Pointer normalized to −1..1 from hero center (listener sets a target; consumed once per frame). Target offset per layer = pointer × max displacement: near 14 px, mid 8 px, far 3 px (HIGH); 8 / 5 / 2 px (MEDIUM); 0 on LOW, touch and REDUCED_MOTION. Light vector tilts toward the pointer by up to 12°. Smoothing: `gsap.quickTo(params, 'nearX', { duration: 0.8, ease: 'shakir.settle' })` per axis per layer; on `pointerleave` all return to 0 over 1.2 s. The logo, headline and CTAs never move with the pointer (brand stability); the beam never follows it.

### F.4.5 Scroll transition into scene 2 (`scene.hero`, pinned 150 vh desktop / 120 vh mobile, scrub 0.6)

| Progress | Motion |
|---|---|
| 0–0.35 | hold; idle motion continues |
| 0.35–0.60 | headline/support/CTAs: y 0 → −24, opacity 1 → 0 (time-based, triggered by `at('exitUi')`, reversible); hero logo Flips to the nav logo slot (transform-only, `invalidateOnRefresh`); nav logo becomes the live logo from here |
| 0.50–1.00 | `fracture` 0 → 1: facets separate along their normals up to 40 px (× intensity), rotate ±8°, far layer dims to 0.6; parallax factors × 1.6; `cameraZ` 1.0 → 1.12 (push-in); idle beam passes stop at 0.55 |
| 0.92–1.00 | LowPolyScene stage blend `hero` → `fracture` (8% window); scene 2's DOM layers fade in over the same window (F.6.3) |

### F.4.6 One persistent canvas
`LowPolyScene` is mounted once in the story layout (`position: fixed; inset: 0; z-index: -1`), with stages `intro | hero | fracture | network | interface | universe | engine | one | simplify`. Each `SceneController` reports `(stage, progress)`; the scene blends across boundaries. Unpinned sections between scenes keep the last stage at its end state (dimmed to 0.5 opacity behind reading content).

## F.5 ShakirBeam specification (§08)

### F.5.1 Construction
Two renderers, one spec (`beam/beamSpec.ts`): width, gradient stops, head/halo passes, speed.
- **SVG (DOM surfaces)** — `ShakirBeam` renders `<svg aria-hidden="true" focusable="false">` with three stacked `<path>` elements sharing one `d`: body (`stroke-width: 1.5`), head glow (`stroke-width: 6`, opacity 0.18, round caps), halo (`stroke-width: 14`, opacity 0.06; HIGH only). `vector-effect="non-scaling-stroke"`, `shape-rendering="geometricPrecision"`. Traveling segment via `DrawSVGPlugin`: `drawSVG: '0% 0%'` → `'0% 12%'` → `'88% 100%'` → `'100% 100%'`. No SVG filters, no `drop-shadow`, no blur anywhere (Safari GPU cost).
- **Canvas (inside geometry)** — `LowPolyScene`'s beam layer draws a polyline through facet centroids with the same width/gradient/head spec; the pass timeline tweens a plain object `{ t: 0 → 1 }` and the loop draws the segment at `t`. Used in the intro, hero, fracture, and final CTA. A region never has both renderers at once.
- Props: `path` (`d` string or `pathRef`), `variant: 'intelligence' | 'warm' | 'trust'`, `mode: 'pass' | 'scrub' | 'static'`, `segment = 0.12`, `onHead?(progress, point)` (fires every frame of a pass so nodes can light when the head arrives).

### F.5.2 Width and color behaviour
- Width 1.5 CSS px (never above 2 px); head near-white `#F4F6FA` at 0.9; colour varies **along the length**, never cycles over time (no rainbow animation).
- `intelligence` (default): cyan → electric blue → violet. `warm`: amber → gold (the crown), used only at ShakirOne activation and the final CTA. `trust`: teal → soft white at 0.6 opacity, used once in the Trust section.
- Gradient: `<linearGradient gradientUnits="userSpaceOnUse">` along the path with alpha stops so the tail fades to 0.

### F.5.3 Speed and cadence
Speed-derived, not fixed: 900 px/s on desktop, 700 px/s on mobile; pass duration clamped to 0.9–2.2 s; ease `shakir.beam`. Hero idle cadence: one pass every 9–14 s (HIGH), 14–20 s (MEDIUM), none (LOW); never two passes overlapping in one region.

### F.5.4 Where the beam appears

| Place | Renderer / mode | Behaviour |
|---|---|---|
| Intro shot 5 | canvas / pass | one pass, time-driven |
| Hero idle | canvas / pass | cadence above; stops at hero progress 0.55 |
| Scene transitions (hero→fracture, network→interface, engine→one) | SVG / scrub | one path per transition following the fracture direction, drawn over the boundary window, fades to 0 by the end of the window |
| ShakirOne (§09) | SVG / scrub then pass | 8 node→core paths draw with scroll ("light travels through connections"); at `activate` one simultaneous `warm` pulse core→outward along all 8, 1.2 s, once |
| Automation nodes (§19) | SVG / scrub | one path TRIGGER→…→COMPLETE; `onHead` lights each node (opacity 0.4 → 1, 180 ms) as the head passes |
| Chat demo (§12) | SVG / pass | traces the chat panel outline once (1.4 s) when "Shakir understands", then fades; never persistent |
| Feature hover (§11) | SVG / pass (short) | 220 ms draw along connection lines to related nodes (F.7) |
| Website Builder (§13) | SVG / pass | one pass around the device frame at WEBSITE COMPLETE |
| Primary CTA buttons | SVG / pass | on hover/focus, one 600 ms trace of the button border; never looping |
| Final CTA (§30) | canvas / pass | one `warm` pass through the simplifying geometry at progress 0.85 |
| Trust (§21) | SVG / pass | a single slow (3 s) `trust` underline of "POWER WITH CONTROL." on enter; nothing else |

Absent: navigation (always), footer, feature-detail reading surfaces, modals' backgrounds (paused), hidden tab, LOW during idle, REDUCED_MOTION (static only).

### F.5.5 Rule against a permanent glowing border (codified)
`beamSpec.maxConcurrentPerRegion = 1`, `beamSpec.restingOpacity = 0` (fully invisible between passes; no resting glow), `beamSpec.maxDwellMs = 2400` for time-driven beams. Scrubbed beams are state, not motion, but they also fade to 0 outside their scene window. A unit test over the registry asserts every `beam.*` timeline ends with the body opacity at 0. No beam ever wraps the viewport.

### F.5.6 Reduced-motion treatment
`mode: 'static'`: a 1.5 px gradient line at ≤ 0.45 opacity, fading in/out with opacity only (400 ms) when its scene is in view; scrubbed beams in ShakirOne/Automation render fully drawn at 0.45 opacity. LOW: no idle passes; scrubbed beams keep working; hover connection lines appear instantly.

## F.6 Scroll-driven video feel (§06–§07)

### F.6.1 Scene table (desktop lengths; mobile × 0.7)

| Order | Scene (`id` / stage) | Pinned? | Length | Scrub | Notes |
|---|---|---|---|---|---|
| 1 | `hero` / hero | yes | 150 vh | 0.6 | F.4.5 |
| 2 | `fracture` / fracture→network | yes | 220 vh | 0.6 | fragments break apart → become AI network |
| 3 | `interface` / interface | yes | 260 vh | 0.5 | network → chat interface; chat demo (§12) steps at labels |
| 4 | `universe` / universe | yes | 420 vh | 0.6 | FeatureUniverse, 6 world labels + center, snap on |
| 5a | `builder` / engine | yes | 300 vh | 0.6 | Website Builder cinematic (§13) |
| 5b | Image, Video, Code, Skill, Business, Live showcases | no | 100–140 vh each | — | unpinned reveals; each has a short scrubbed micro-timeline over its own travel (no pin) |
| 5c | `automation` / engine | yes | 200 vh | 0.6 | beam through workflow nodes (§19) |
| 6 | `one` / one | yes | 300 vh | 0.6 | beats at 0.10 / 0.30 / 0.50 / 0.75 / 0.90 (nodes, connections, light, one system, activate) |
| 7 | Trust | no | — | — | reveals only, no scrub, no pin (§21 calm) |
| 8 | `cta` / simplify | yes | 240 vh | 0.8 | thousands → hundreds → dozens → one symbol → logo (§30) |

Eight pinned scenes total; pinned travel ≈ 2090 vh desktop. More pins than this is "visually exhausting" (§01), so the showcases in 5b stay unpinned.

### F.6.2 Scrub vs. time rule
Geometry, camera, masks and beams are **scrubbed** (`ease: 'none'`). Typography inside a scene is **time-based** (`D.base`, `shakir.out`), triggered by `SceneController.at(label)` and reversed when scrolling back. Scrubbed text looks like a slider; time-based text looks like editing.

### F.6.3 Camera-like movement and scene handoff
- Each scene root has one `.scene-camera` wrapper; the "camera" is a single transform on it: dolly `scale 1.00 → 1.12` max, pan ±6 vw max, rotation ≤ 2°. Inside, ≤ 3 `.layer` elements get differing `translate3d` for parallax. One parent transform + three child transforms per frame.
- Handoff between consecutive pinned scenes (`transitions/sceneCrossfade.ts`): over the last 12% of the outgoing scene its DOM layers go `scale 1 → 1.06, opacity 1 → 0`; the incoming scene's layers are pre-rendered at their first frame and go `scale 0.96 → 1, opacity 0 → 1` over its first 12%. Continuity between the two is carried by the persistent `LowPolyScene`, which never cuts.

### F.6.4 Masked reveals
`clip-path: polygon(...)` with faceted (triangular) masks, same point count on both ends (6 points), animated by GSAP (`clipPath` interpolation). Used for: chat panel reveal, Website Builder device frames, feature-detail open. Never `mask-image` animation (full repaint); LOW and REDUCED_MOTION replace clip-path with opacity.

### F.6.5 Image sequences: decision — none
No image sequence anywhere. Every scrubbed moment is driven by the live `LowPolyScene` or DOM layers, which cost 0 bytes of imagery; a single 120-frame sequence at 60 KB/frame (7 MB) would exceed the whole page's asset budget and would need a second mobile set. The only candidate (Website Builder "complete" morph) is better as DOM layers. Real footage (Video AI §15) is a single lazy-loaded, poster-first, muted loop ≤ 1.5 MB that **plays** when in view; `currentTime` scrubbing is never used (janky on Safari).

### F.6.6 Keeping scrubbed timelines cheap (§22)
- Allowed animated properties: `transform` (x, y, scale, rotation), `opacity`, `clip-path` (limited, F.6.4), `stroke-dashoffset`/`drawSVG` (beams), canvas parameters, CSS custom properties consumed by the canvas. Forbidden: `width`, `height`, `top`, `left`, `margin`, `padding`, `filter`, `box-shadow`, `backdrop-filter`, `background-position`, `letter-spacing` (except the intro wordmark, time-based, once). `guards.ts` wraps the registry in dev and throws on a forbidden key in any tween's vars; a unit test runs every factory against a jsdom scope with the guard on.
- `will-change` is never set in stylesheets. `SceneController` adds `will-change: transform, opacity` to the scene's `.layer` elements on a companion trigger (`start: 'top bottom'`, `end: 'bottom top'`, `onEnter/onEnterBack`) and removes it `onLeave/onLeaveBack`. Hard cap 12 promoted DOM layers alive at once (debug HUD counts them).
- `force3D: true` on scrubbed layer tweens only.
- `onUpdate` writes to refs / `quickSetter` only; zero React renders during scroll (verified with React Profiler in the quality gate, §32).
- `SplitText` lines are split once per breakpoint (`autoSplit`), hidden lines use `opacity` + `y` only; no per-character DOM.
- LOW: canvas loop at 30 fps, `scrub` kept at 0.6, DOM layers ≤ 4 per scene, parallax child transforms disabled (camera only).

## F.7 Feature interaction micro-motion (§11)

Each feature node in `FeatureUniverse` is a `<button>` (detail opens via router push) containing a facet cluster (SVG, 5–9 triangles), icon, name, description. Two registry timelines per node, built on mount, paused.

### F.7.1 `feature.hover` (play on `pointerenter` / `focus-visible`; reverse on leave/blur at `timeScale(1.5)`)

| Offset | Target | Motion |
|---|---|---|
| 0–220 ms | facet cluster | scale 1 → 1.12 (origin center), `shakir.out`; each triangle translates 2–3 px along its centroid vector ("polygon expands", not a blob); highlight overlay opacity 0 → 0.12 |
| 80–300 ms | feature name | y 8 → 0, opacity 0 → 1, `D.quick` |
| 160–400 ms | short description | y 6 → 0, opacity 0 → 1, 240 ms |
| 200–500 ms | connections | pre-rendered connection paths to related nodes draw via `drawSVG` 0 → 100% over 300 ms, `each: 0.04`, beam-styled (1 px gradient, 0.6 opacity); related nodes' highlight 0 → 0.08; the central CHAT + SHAKIR ONE node always receives a faint pulse 0.04 → 0.10 (everything connects through it) |

Reverse completes in ~330 ms. Press: scale 1.12 → 1.08 over 90 ms on `pointerdown` / `keydown`, back on release.

### F.7.2 `feature.select` (click / Enter / Space)

| Offset | Motion |
|---|---|
| 0 ms | hover state holds (no reset) |
| 0–120 ms | other nodes opacity → 0.35; universe `.scene-camera` scale 1 → 1.04 |
| 120–640 ms | faceted wipe: detail surface `clip-path` polygon expands from the node bounds to the viewport, `shakir.inOut` (520 ms); `Flip` moves the node's icon + name into the detail header slot (transform-only) |
| 400–760 ms | detail content lines in: y 16 → 0, opacity, `each: 0.05`, `D.base` |
| 700–1600 ms | one beam pass traces the detail header, then fades to 0 |

Readable by 700 ms, fully settled by 900 ms. Close (Escape / close button / back): reverse at 420 ms; focus returns to the originating node; home ScrollTriggers re-enable. The detail is an intercepting route `/features/[slug]`: modal on the home page, full page on direct load (full page plays a 300 ms opacity reveal; no Flip, no wipe).

### F.7.3 Keyboard and touch parity (§23)
- `focus-visible` plays the same `feature.hover` timeline through `onFocus` / `onBlur`; focus ring (2 px soft-white outline, 2 px offset) is applied synchronously by class, never animated beyond a 120 ms opacity tick, and never waits for the timeline.
- Roving `tabindex` per world: Arrow keys move between nodes in a world, Tab moves to the next world's current node, Home/End jump within a world, Enter/Space select, Escape closes the detail. World snap (F.1.4) also fires on keyboard focus changes via `scrollIntoView({ block: 'center' })` with the snap ease.
- Touch: names are always visible (no hover state exists); tap selects directly, with `feature.hover`'s first 150 ms playing as press feedback.

## F.8 Reduced-motion matrix (§23) and LOW profile

### F.8.1 Gate
`useReducedMotion()` = `prefers-reduced-motion: reduce` OR the user toggle "Reduce motion" (footer + nav menu, persisted in `localStorage['shakir:motion'] = 'reduced' | 'full'`; an explicit user choice wins over the OS setting in both directions). The resolved value feeds `MotionProvider` → profile `REDUCED_MOTION` → `registry.rebuild()`; the `(prefers-reduced-motion: reduce)` matchMedia condition handles OS changes live. Under REDUCED_MOTION: `pin: false` and `scrub` removed on every SceneController; each scene becomes a normal 100 svh section showing its **poster** (`reduced-motion/posters.ts`: the scene's end state with all content visible); `LowPolyScene` renders one static frame per stage and crossfades posters (400 ms opacity) at stage changes. Opacity-only crossfades ≤ 400 ms triggered by user action are the only permitted motion.

### F.8.2 Matrix

| Animation class | HIGH / MEDIUM | LOW | REDUCED_MOTION |
|---|---|---|---|
| IntroSequence | full 3.2 s / mobile 2.2 s | 1.6 s short variant, no beam | none; composed hero, 600 ms crossfade |
| Hero idle (rotation, refraction, depth) | on | rotation only, 30 fps, no breathing | static frame |
| Hero pointer response | on (× 0.6 on MEDIUM) | off | off |
| Hero → scene 2 exit | scrubbed fracture + Flip to nav | scrubbed, amplitude × 0.4, no Flip (nav logo crossfades in) | hero section, nav logo always present |
| Pinned scrubbed geometry (all scenes) | scrubbed | scrubbed, amplitude × 0.4, 30 fps canvas | unpinned posters |
| Scene camera + layer crossfade | dolly/pan + crossfade | crossfade + dolly only (no child parallax) | instant state; 400 ms opacity between posters |
| Masked (clip-path) reveals | faceted wipe | opacity 300 ms | opacity 300 ms |
| Text reveals (SplitText lines) | y + opacity, staggered | opacity only, stagger × 0.5 | visible, no animation |
| ShakirBeam time-driven passes | per cadence | none | static line ≤ 0.45 opacity |
| ShakirBeam scrubbed (ShakirOne, Automation, transitions) | scrubbed draw | scrubbed draw | fully drawn static at 0.45 |
| ShakirOne activation pulse | 1.2 s warm pulse | 1.2 s pulse, body only (no halo) | nodes + connections shown lit; no pulse |
| FeatureUniverse snap | on | on | off |
| Feature hover/focus | full timeline | scale + text only (no facet split, no connection draw; connections appear instantly at 0.6) | instant state change (name/description shown, connections shown) |
| Feature select | wipe + Flip + beam trace | 300 ms opacity, no Flip, no beam | instant open / close with 200 ms opacity |
| Chat demo typing (§12) | characters revealed at labels | same | full conversation shown |
| Website Builder sequence (§13) | scrubbed | scrubbed, amplitude × 0.4 | final "complete" state with device frames |
| Image AI particles → image (§14) | scrubbed particle formation | opacity crossfade text → image | image shown |
| Video AI timeline (§15) | scrubbed stage reveal; footage plays in view | same, footage stays on poster until tapped | poster only, play on tap |
| Code AI steps (§16) | time-based at labels | same, stagger × 0.5 | all steps shown with PASS state |
| Business data viz (§18) | values tween in view (`D.slow`) | instant values | instant values |
| Automation workflow (§19) | beam scrub lights nodes | same | all nodes lit, beam static |
| LIVE indicator (§20) | 2 s opacity pulse 0.6↔1 | same | static indicator, no pulse |
| Trust section (§21) | fade-up reveals, one 3 s underline | fade-up | visible, static underline |
| Final CTA simplify (§30) | scrubbed thousands → one | scrubbed, 30 fps | poster: one symbol + logo |
| Nav hide/show on scroll | 220 ms y transform | same | instant |
| Buttons (primary CTA) | 600 ms beam trace on hover/focus; no magnetic buttons anywhere | opacity/background 120 ms only | opacity/background 120 ms only |
| Logo (all contexts) | opacity, uniform scale, Flip position only | same | opacity only |

Verification for this section (feeds §32): every row above is a case in `reduced-motion/matrix.test.ts` (factory built per profile, assertions on tween targets/vars), plus a Playwright run with `reducedMotion: 'reduce'` that asserts no `ScrollTrigger` pins exist and all scene posters are visible.
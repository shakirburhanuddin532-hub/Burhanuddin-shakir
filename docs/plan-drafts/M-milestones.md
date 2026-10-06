## M. Implementation milestones, quality gate and testing strategy

### M.1 Scope of this section and the one decision that reshapes the schedule

Brief §33 starts at "MILESTONE 1 — Foundation + design system". It assumes a repository that already builds. Ours does not: `/home/user/Burhanuddin-shakir` holds an unrelated vanilla-JS prototype (`index.html`, `assets/css/styles.css`, `assets/js/main.js`, `README.md`), no `package.json`, no `CLAUDE.md`, no `.github/`, no tests. **Milestone 0 is therefore added** (repo preparation, Next.js scaffold, tooling, CLAUDE.md, CI). It is not in the brief; it is the precondition for "RUN TESTS / RUN BUILD" being possible after Milestone 1 at all. Brief M1–M10 keep their numbers and names.

Fixed facts used below: Node `v22.22.0` and npm `10.9.4` are installed; remote is `github.com/shakirburhanuddin532-hub/Burhanuddin-shakir`; the only brand asset is `brand/shakir-logo-source.png` (1024×1024, white background, generator watermark bottom-right).

**Staffing and total.** One senior front-end engineer, full time. Sum of estimates = 45 working days; +15 % contingency reserved for M7 and M9 (the two riskiest) = **52 working days (~10.5 weeks)**. A second engineer from M5 onward (demos in M7 parallelise cleanly) brings calendar time to ~8 weeks without changing the gate.

| # | Milestone | Days | Depends on | Client checkpoint |
|---|---|---|---|---|
| M0 | Repository preparation (added) | 1.5 | — | — |
| M1 | Foundation + design system | 3 | M0 | Design-system sign-off |
| M2 | Navigation + cinematic hero (IntroSequence, first ShakirBeam) | 4 | M1, DEP-LOGO | Intro/hero sign-off (most important taste decision) |
| M3 | Low-poly visual engine (LowPolyScene) | 5 | M2 | — |
| M4 | Scroll storytelling system (SceneController) | 4 | M3 | — |
| M5 | ShakirOne visualization | 4 | M4 | ShakirOne sign-off |
| M6 | 21-feature universe (FeatureUniverse) | 5 | M4, M5 | Icon review (day 3) |
| M7 | Interactive feature demonstrations | 8 | M6, DEP-IMAGES | Demo scripts frozen (day 1) |
| M8 | Trust + Final CTA + Footer | 2.5 | M4, DEP-LINKS | — |
| M9 | Responsive / mobile optimization | 4 | M1–M8 | — |
| M10 | Accessibility + performance + testing hardening | 4 | M9 | Launch sign-off |

**External dependencies (tracked in `docs/DEPENDENCIES.md`, each with owner = client and a due milestone):**
- `DEP-LOGO` — transparent-background PNG (2048×2048) and SVG of the official logo, without the watermark. Due before M2 day 1. We never edit the source file. Interim treatment until delivered: the unmodified source PNG is displayed inside a soft-white (`--color-mist-50`) rounded plinth card so the white background reads as deliberate; nothing in the artwork is cropped, masked, recoloured or redrawn.
- `DEP-COPY` — final 21 feature descriptions (we draft; client approves). Due M6 day 1.
- `DEP-IMAGES` — 4 sample Image AI outputs for §14, or written approval to use our own abstract low-poly stills. Due M7 day 1.
- `DEP-LINKS` — real URLs for Product / Security / Privacy / Developers / Pricing / Contact. Due M8 day 1.
- `DEP-HOSTING` — Vercel account (decision: Vercel, because Next.js preview deployments per PR need zero config and give the client a URL to review every milestone). Not blocking: CI measures against a local `next start`.

---

### M.2 Milestone details

#### M0 — Repository preparation (1.5 days) — *added, not in brief §33*

**Goal.** A clean, tooled repository on which the full quality gate (§32) runs green on an empty page, so every later milestone inherits a working gate instead of building one.

**Scope.**
- `git mv index.html assets README.md prototypes/aurelia/`; add `prototypes/aurelia/README.md` first line: "Unrelated prototype. Not part of the SHAKIR AI site. Not built, linted, tested or deployed." The prototype keeps working standalone (its paths are relative).
- Scaffold at the root with `create-next-app` (latest stable Next.js, App Router, TypeScript, Tailwind, ESLint, `src/` directory, import alias `@/*`). Exact versions pinned (no `^`), `.nvmrc` = `22`, `engines.node = ">=22 <23"`, `.npmrc` with `engine-strict=true`. Package manager: npm (already installed; no extra tool to document).
- Root files: `package.json` scripts (see M.3), `tsconfig.json` (strict set, see M.3, `exclude: ["prototypes"]`), `eslint.config.mjs`, `.prettierrc`, `.editorconfig`, `.gitignore` (+ `/docs/evidence/**/*.webm` size-capped, see M.7), `vitest.config.ts`, `src/test/setup.ts`, `playwright.config.ts`, `lighthouserc.cjs`, `lighthouserc.mobile.cjs`, `budgets.json`, `scripts/check-budgets.mjs`, `scripts/evidence/capture.ts`, `scripts/evidence/validate-report.mjs`, `.github/workflows/ci.yml`, `.github/workflows/nightly.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/dependabot.yml` (monthly, grouped), `docs/evidence/README.md`, `docs/evidence/TEMPLATE-REPORT.md`, `docs/DEPENDENCIES.md`, `CLAUDE.md` (content in M.8).
- `brand/README.md` records the SHA-256 of `shakir-logo-source.png` and the rule "this file is never modified; derived assets come only from the client". Copy (not move) to `public/brand/shakir-logo-source.png`.
- Minimal `src/app/layout.tsx` (`<html lang="en">`, `color-scheme: dark`, metadata title "SHAKIR AI") and `src/app/page.tsx` rendering an `<h1>SHAKIR AI</h1>`.
- Branch protection on `main`: required checks `static`, `unit`, `build`, `e2e`, `lighthouse`; squash merges; branch naming `milestone/M{n}`, PR title prefix `feat(M{n}):`.

**Out of scope.** Any design token, component or animation.

**Dependencies.** None.

**Acceptance criteria.**
1. `npm run gate` (typecheck → lint → format:check → test → build → test:e2e → test:lhci) passes locally and in CI in ≤ 10 min wall-clock.
2. `prototypes/aurelia/index.html` still opens standalone; `tsc`, ESLint, Tailwind content globs and Vitest all exclude `prototypes/`.
3. `CLAUDE.md` exists with every heading listed in M.8.
4. CI run is green on the first PR and the five required checks are enforced by branch protection.

**Tests added.** Unit: `src/app/page.test.tsx` (h1 text). E2E: `e2e/smoke.spec.ts` (HTTP 200, `h1`, zero `console.error`), runs on all 6 Playwright projects. A11y: axe on `/` with 0 violations.

**Evidence.** `docs/evidence/M0/`: `next-build.txt`, CI run URL, five viewport screenshots of the smoke page (proves the capture script), Lighthouse baseline (expected 100/100/100/100 — the reference against which every later milestone's deltas are read), `axe-home-*.json`.

**Risks → mitigations.** Framework/major-version drift between plan and scaffold day → pin exact versions and record them in `docs/evidence/M0/REPORT.md`. Tailwind v4 config lives in CSS (`@theme`), not `tailwind.config.js` → tokens file designed for v4 from day one.

---

#### M1 — Foundation + design system (3 days)

**Goal.** Tokens, type, layout primitives, the `Logo` component, the motion core and the performance-profile detector that every later milestone imports — nothing visual yet beyond a dev-only system page.

**Scope.**
- `src/styles/tokens.css` (Tailwind v4 `@theme`): base surfaces (deep near-black, graphite, charcoal, soft white) and the accent set of brief §03 as named tokens (`--color-accent-blue`, `-violet`, `-cyan`, `-teal`, `-magenta`, `-amber`, `-peach`, `-gold`), text tokens, radius, z-index scale, easing tokens (`--ease-shakir: cubic-bezier(0.22, 1, 0.36, 1)`), duration tokens (120 / 220 / 420 / 800 ms).
- Typography via `next/font` (self-hosted woff2, `display: swap`, `adjustFontFallback`), type scale 12 → 96 px with fluid `clamp()` steps.
- `src/components/brand/Logo.tsx` — props `size: 'nav' | 'hero' | 'intro' | 'footer' | 'inline'` (rendered widths 32 / 360 (1440) → 200 (390) / 160 / 40 / 24 px), `priority`, `decorative`. Uses `next/image` with the intrinsic 1:1 ratio, `object-fit: contain`, **no CSS `filter`, `transform`, `clip-path`, `mix-blend-mode` on the image element** (unit-tested). `src/components/brand/Wordmark.tsx` — typeset "SHAKIR AI" used *beside* the logo (brief §05 "logo/wordmark"), never as a replacement.
- `src/components/ui/`: `Button` (primary / secondary / ghost; 44 px min height), `Container` (max-width 1440), `Section` (landmark + `aria-labelledby`), `Eyebrow`, `Heading`, `VisuallyHidden`, `SkipLink`.
- Motion core: `src/animations/core/gsap.ts` (single `registerPlugin(ScrollTrigger)`, `gsap.defaults({ ease: 'shakir', duration: 0.42 })`, `ScrollTrigger.config({ ignoreMobileResize: true })`), `src/animations/core/useGsapContext.ts` (`gsap.context` + `revert()` on unmount — the only sanctioned way to create tweens in components), `src/animations/reduced-motion/index.ts` (static-state helpers).
- `src/hooks/useReducedMotion.ts`, `src/hooks/usePerformanceProfile.ts` → `HIGH | MEDIUM | LOW | REDUCED_MOTION` with the rules fixed in section J, plus a runtime step-down: if the median of 60 consecutive frames exceeds 24 ms, drop one level (never back up during the session).
- `src/data/features.ts` (21 typed entries, worlds CREATE / LEARN / BUILD & GROW / ACT / TRUST / HUMAN, `CHAT` flagged `center: true`), `src/data/navigation.ts`.
- `src/app/dev/system/page.tsx` — tokens, type scale, buttons, `Logo` at every size, live profile readout. Decision: no Storybook (second build, ~30 MB of devDependencies); dev routes are gated by `SHAKIR_DEV_ROUTES=1` read at request time in `src/app/dev/layout.tsx` (`notFound()` otherwise).

**Out of scope.** Low-poly rendering, navigation, hero, any ScrollTrigger usage.

**Dependencies.** M0.

**Acceptance criteria.**
1. Every text token on every base surface ≥ 4.5:1 contrast; large display text ≥ 3:1 (unit test computes WCAG ratios from `tokens.css`).
2. `Logo` renders with `alt="SHAKIR AI"` (or `alt=""` when `decorative`), explicit `width`/`height`, and no transform/filter class or style (unit test); CLS on `/dev/system` = 0.
3. `usePerformanceProfile` returns the expected level for the 8-case matrix (reduced-motion, saveData, deviceMemory 2/4/8, hardwareConcurrency 2/4/8, coarse pointer) — unit test with mocked `navigator`/`matchMedia`.
4. Fonts: ≤ 4 woff2 files, ≤ 160 KB total, no FOIT (Lighthouse "font-display" audit passes).
5. Route `/` first-load JS ≤ 120 KB gzip (`next build` output).

**Tests added.** Unit: `tokens.contrast.test.ts`, `usePerformanceProfile.test.ts`, `useReducedMotion.test.ts`, `features.data.test.ts` (21 unique ids, every id in exactly one world, `CHAT` is center). Component: `Button.test.tsx` (role, `focus-visible` class, disabled semantics), `Logo.test.tsx`, `SkipLink.test.tsx`. E2E: `dev-system.spec.ts` screenshots at 5 viewports (first visual baselines). A11y: axe on `/dev/system`.

**Evidence.** 5 screenshots of `/dev/system`, `axe-dev-system-*.json`, `next-build.txt` with the budget table, Lighthouse desktop+mobile on `/`.

**Risks → mitigations.** Palette drifts toward "rainbow overload" (§01) once accents exist → the M3 palette guard is specified now and the tokens file carries the rule "max 2 accent hues per surface" in a comment the design review checks. `DEP-LOGO` late → interim plinth treatment (M.1) so M2 is not blocked.

---

#### M2 — Navigation + cinematic hero (4 days)

**Goal.** The first screen and the opening cinematic (brief §04, §05) with the first `ShakirBeam`, built against the `LowPolyScene` props contract with a static SVG implementation that M3 replaces behind the same interface.

**Scope.**
- `src/components/navigation/Nav.tsx` (fixed, 64 px desktop / 56 px mobile, `Logo size="nav"` + `Wordmark`, links from `navigation.ts`, "ENTER SHAKIR" `Button`; hides after 120 px of downward scroll, reappears on upward scroll; backdrop blur only once the hero is scrolled past), `MobileMenu.tsx` (`<dialog>`, focus trap, Escape, background `inert`), `NavProgressBeam.tsx` (1 px scroll-progress line in beam gradient, opacity 0.6 — the only persistent beam, and it is a line, not a border).
- `src/components/hero/Hero.tsx`, `HeroHeadline.tsx` ("ONE INTELLIGENCE." / "LIMITLESS POSSIBILITIES." as two lines, `<h1>` contains both), `HeroSupport.tsx` ("Create. Learn. Research. Build. Automate."), `HeroCtas.tsx`, `src/hooks/usePointerParallax.ts` (max 12 px at HIGH, 6 px MEDIUM, 0 at LOW/REDUCED_MOTION, `pointer: fine` only).
- `src/components/low-poly/LowPolyScene.types.ts` (the final props: `intensity`, `density`, `depth`, `motion`, `palette`, `interactive`, `performanceLevel`, `seed`, `from`, `to`, `progress`, `onReady`) and `LowPolyScene.static.tsx` (120 pre-generated SVG triangles via `scripts/gen-static-scene.ts`, no runtime loop).
- `src/components/hero/IntroSequence.tsx` + `src/animations/timelines/intro.ts` with labels `points → fragments → assemble → environment → beam → logo → lightPass → wordmark → handoff`. Durations: HIGH 3,200 ms, MEDIUM/LOW 2,400 ms (fewer fragments, same labels), REDUCED_MOTION 600 ms (logo + wordmark cross-fade, no fragments, no beam). "Skip" button visible from 400 ms (bottom-right, focusable; Escape also skips). Replays only once per browser session (`sessionStorage['shakir.intro.seen']`) and only on `/`. The light pass over the logo is a masked white gradient sweep at `mix-blend-mode: screen`, 500 ms, on an overlay element — the logo pixels are untouched.
- `src/components/low-poly/ShakirBeam.tsx` + `src/animations/beam/beamTimeline.ts`: SVG path, 1.5 px stroke, gradient blue → cyan → violet along the path, `stroke-dasharray` head of 18 % path length, `feGaussianBlur stdDeviation=2` glow; props `path`, `progress`, `length`, `intensity: 'low' | 'medium'`. No `'high'` exists (brief §08: subtle).

**Out of scope.** Canvas engine, scroll-driven scenes after the hero, any section below the hero.

**Dependencies.** M1; `DEP-LOGO` (interim plinth allowed for development, not for sign-off).

**Acceptance criteria.**
1. `performance.mark('intro:end') − mark('intro:start')` ≤ 3,300 ms at HIGH, ≤ 2,500 ms at MEDIUM/LOW, ≤ 700 ms REDUCED_MOTION (e2e reads marks).
2. Skip by click and by Escape hands off to the hero within 100 ms; second load in the same session fires `intro:skipped-session` and renders the hero directly.
3. Reduced motion: `document.getAnimations().length === 0` after 800 ms and the hero is fully visible.
4. Lighthouse mobile LCP ≤ 2.5 s with the intro **enabled** (no test-only bypass); CLS = 0 on intro removal (overlay is `position: fixed`).
5. Keyboard order: skip link → logo → nav links → ENTER SHAKIR → hero CTAs; mobile menu traps focus and restores it on close; axe 0 serious/critical at 5 viewports.
6. At 390 px the nav never overlaps the headline and the headline wraps to ≤ 4 lines (screenshot + bounding-rect test).
7. Route `/` first-load JS ≤ 150 KB gzip.

**Tests added.** Unit: `intro.timeline.test.ts` (label order, totals per profile), `introSession.test.ts`, `useNavVisibility.test.ts`, `beamTimeline.test.ts`. Component: `MobileMenu.test.tsx` (open/close, `aria-expanded`, trap), `HeroCtas.test.tsx` (hrefs). E2E: `intro.spec.ts` (timing, skip, session), `reduced-motion.spec.ts`, `nav-keyboard.spec.ts`, `hero.visual.spec.ts` (5 viewports after `intro:end`). A11y: axe `/` at 5 viewports, menu open at 390.

**Evidence.** Hero screenshots at 5 viewports; mobile menu open at 390; Playwright video of the intro at 1440 HIGH (`intro-1440-high.webm`); Lighthouse mobile+desktop; axe JSON; build output.

**Risks → mitigations.** Intro feels like a delay (§04) → hard cap 3.2 s, skip at 400 ms, session gating. LCP pushed by the overlay → measured here, not in M10. Static SVG hero looks flat until M3 → client sign-off explicitly covers timing, logo treatment and typography, with the engine review deferred to M3.

---

#### M3 — Low-poly visual engine (5 days)

**Goal.** The real `LowPolyScene`: a deterministic, profile-aware Canvas 2D renderer of faceted geometry with named formations that can morph into each other, plus `ShakirBeam` passing through the geometry.

**Scope.**
- Renderer decision: **Canvas 2D** (not SVG: > 300 animated triangles kills SVG; not WebGL: flat shaded triangles do not need it — brief §25). Escalation path if the budget fails (see risks) is a 200-line raw WebGL2 renderer behind the same props, **not Three.js**.
- `src/low-poly/engine/mesh.ts` (seeded jittered grid + Delaunay via `delaunator`, ~2 KB gzip), `formations/` (`mountain`, `fragments`, `network`, `interface`, `universe`, `engine`, `one`, `single` — each a point-set generator; `single` is one triangle), `morph.ts` (per-vertex lerp with per-triangle stagger so break-ups ripple), `light.ts` (flat facet colour from palette + Lambert term from a moving light direction; triangles within 40 px of the beam head gain +18 % luminance for 300 ms), `renderer2d.ts`, `palette.ts`, `profiles.ts`, `ticker.ts` (one `gsap.ticker` loop for the whole page; scenes pause via IntersectionObserver when < 5 % visible).
- `src/components/low-poly/LowPolyScene.tsx` (replaces `.static.tsx`; `aria-hidden`, `role="presentation"`; falls back to the static SVG when `canvas.getContext` is unavailable).
- Triangle / particle / DPR budgets: HIGH 1,400 tris, 240 particles, DPR ≤ 2 · MEDIUM 700 / 120 / ≤ 1.5 · LOW 300 / 0 / 1 · REDUCED_MOTION 220 static, rendered once, no loop.
- IntroSequence re-bound to formations (`points → fragments → assemble(mountain) → beam → logo`).
- `src/app/dev/scene/page.tsx` with formation / profile / seed controls.

**Out of scope.** Scroll-driven formation changes across sections (M4); ShakirOne and FeatureUniverse layouts.

**Dependencies.** M2.

**Acceptance criteria.**
1. Frame-time p95 (10 s sample, `scripts/perf/frame-profile.ts`): HIGH ≤ 16.7 ms on the reference desktop, MEDIUM ≤ 20 ms on the reference phone, LOW ≤ 24 ms under 4× CPU throttle; scene render ≤ 6 ms/frame at HIGH (`performance.measure('lowpoly:render')`). Reference devices: MacBook Air M1 (HIGH), iPhone 13 Safari and Pixel 7 Chrome (MEDIUM), Chrome 4× throttle on the M1 (LOW). CI runners have no GPU, so CI only asserts "no frame > 100 ms and the loop pauses off-screen"; thresholds are enforced locally and recorded as evidence.
2. Heap growth ≤ 5 MB over 60 s idle (CDP heap sampling in e2e).
3. Mount/unmount 50× leaves 0 rAF callbacks, 0 listeners, `gsap.globalTimeline.getChildren().length === 0`.
4. Same `seed` → identical mesh (snapshot of first 20 vertices); production seed is fixed (7) — variety comes from motion and light, not random meshes, which also makes screenshots stable.
5. **Palette guard (§01/§03):** per rendered frame, ≤ 3 accent hue families above 10 % coverage each, mean saturation ≤ 0.65, ≥ 55 % of canvas area in base tones. Enforced as a unit test over the palette tables and an e2e pixel sample of each formation.
6. `low-poly-engine` chunk ≤ 28 KB gzip and not in the initial route bundle (loaded via `next/dynamic` after `intro:start`).

**Tests added.** Unit: `mesh.test.ts`, `formations.test.ts` (count, bounds, no NaN), `morph.test.ts` (`morph(0) = from`, `morph(1) = to`), `profiles.test.ts`, `palette.guard.test.ts`. Component: `LowPolyScene.test.tsx` with `vitest-canvas-mock` (`onReady` fires; REDUCED_MOTION renders exactly one frame — render spy count). E2E: `scene-formations.visual.spec.ts` (8 formations at 1440, `maxDiffPixelRatio 0.05`), `scene-perf.spec.ts`, `scene-memory.spec.ts`, `scene-cleanup.spec.ts`. A11y: canvas `aria-hidden` assertion, axe on `/dev/scene`.

**Evidence.** 8 formation screenshots at 1440; hero with engine at 5 viewports; `frames-high.json`, `frames-medium.json`, `frames-low.json` + summary table; `heap-idle.json`; build output; Lighthouse.

**Risks → mitigations.** Canvas 2D misses 16.7 ms at 1,400 tris → one day of optimisation (batched paths by colour, integer coordinates, `desynchronized: true`); if still failing, drop HIGH to 1,100 tris first; only then the WebGL2 renderer with a 1-page justification in `docs/decisions/0001-renderer.md`. Looks like generic particle backgrounds → formations are faceted *surfaces* (mountain, crystal) not dots, lit by one moving light, in ≤ 3 hues — reviewed against the logo's own facet language.

---

#### M4 — Scroll storytelling system (4 days)

**Goal.** One orchestrator, `SceneController`, that turns scroll progress into formation morphs, transitions and beam hand-offs (brief §06, §07) without per-frame React renders.

**Scope.**
- `src/animations/scroll/SceneController.tsx` (registers scenes from `scenes/*.ts`, one pinned `ScrollTrigger` per scene: `scrub: 0.6`, `pin: true`, `anticipatePin: 1`, `invalidateOnRefresh: true`), `progressStore.ts` (`useSyncExternalStore`, ref-based; canvases subscribe without re-rendering), `src/hooks/useScrollProgress.ts`, `scenes/` registry entries with `id`, `pinVh` (desktop / mobile), `from`, `to`, `beamPath`, `enter`, `exit`.
- Journey scenes delivered here: `hero` (handoff), `breakup` (mountain → fragments, 150 vh), `network` (fragments → network, 200 vh), `interface` (network → interface, 150 vh). Later milestones register `shakir-one`, `feature-universe`, demos, `trust`, `final` into the same registry. Total scroll height ≤ 1,600 vh desktop, ≤ 1,100 vh mobile (pins −40 % below 834 px).
- `src/animations/transitions/`: `crossMorph`, `maskReveal` (triangular `clip-path` wipes — the identity's own shape), `depthZoom` (scale 1 → 1.08 with 4 px blur on exit), `beamHandoff` (ShakirBeam carries from scene A's end-point to B's start-point).
- Decision: **no scroll-hijack / smoothing library** (no Lenis). Native scroll + `scrub: 0.6` keeps accessibility, URL hashes and performance intact. `ScrollTrigger.normalizeScroll` stays off unless the M9 iOS test shows pin jumps.
- Reduced motion: `SceneController` renders every scene as a static, unpinned section with 300 ms opacity fades. `history.scrollRestoration = 'manual'`; reload restores to the nearest scene start. Hash anchors `#features`, `#shakir-one`, `#trust` map to scene starts.

**Out of scope.** Content of M5–M8 scenes.

**Dependencies.** M3.

**Acceptance criteria.**
1. CLS over a full scripted scroll ≤ 0.02 at 1440 and 390 (web-vitals attribution in e2e).
2. Scroll-journey frame-time p95 ≤ 20 ms at 1440 HIGH (local reference device).
3. Resize 1440 → 834 → 1440: pin start offsets equal the baseline within 2 px.
4. Every scene reaches `data-scene-state="complete"` in order; hash navigation lands within 8 px of the scene start.
5. Reduced-motion project: zero `.pin-spacer` elements; all content reachable by plain scroll.
6. Beam restraint (§08): no `ShakirBeam` instance is `position: fixed`; opacity ≤ 0.85; after 4 s without scroll every beam reports `data-beam-state="idle"`.
7. `scene-controller` chunk ≤ 12 KB gzip; zero React commits per frame during scrub (React Profiler assertion in a component test).

**Tests added.** Unit: `scenes.registry.test.ts` (unique ids, valid formation names, pin lengths numeric), `progressStore.test.ts` (notifies subscribers, no re-render), `transitions.test.ts` (durations, labels). E2E: `scroll-journey.spec.ts`, `cls.spec.ts`, `resize.spec.ts`, `hash-nav.spec.ts`, `beam-restraint.spec.ts`, `reduced-motion.spec.ts` (extended). A11y: axe at scroll positions 0 %, 50 %, 100 % × 5 viewports.

**Evidence.** Contact sheet: 6 scroll positions × 5 viewports (30 screenshots) via `capture.ts`; `cls.json`; `frames-journey-high.json`; Lighthouse; axe; build output.

**Risks → mitigations.** iOS address-bar resize breaks pins → `ignoreMobileResize` (M1) + `100dvh` + M9 real-device test. Long pins fatigue → every pin ≤ 200 vh. Scroll feels "hijacked" → native scroll only; scrub smoothing capped at 0.6.

---

#### M5 — ShakirOne visualization (4 days)

**Goal.** The "ONE SHAKIR." scene (brief §09): capability nodes appear, connect, light travels, everything unifies, SHAKIR ONE activates; then the request pipeline is explained.

**Scope.**
- `src/components/shakir-one/ShakirOne.tsx` (scene id `shakir-one`, pinned 250 vh desktop / 160 vh mobile), `ShakirOneCore.tsx` (the official logo mark, `Logo size="inline"` scaled to 120 px desktop / 72 px mobile, inside a faceted crystalline ring of 96 triangles rendered by `LowPolyScene formation="one"` — the "orb" is geometry around the real logo, never a redrawn logo), `CapabilityNode.tsx` × 6 (CREATE, LEARN, BUILD & GROW, ACT, TRUST, HUMAN at 60° intervals, radius 260 px desktop / 130 px mobile; CHAT is the core's label), `Connections.tsx` (SVG paths; `ShakirBeam` travels each in sequence), `PipelineFlow.tsx` (USER REQUEST → SHAKIR ONE → UNDERSTAND → ROUTE → CREATE / RESEARCH / BUILD / ACT → VERIFY → RESULT; horizontal at ≥ 1280, vertical below).
- `src/animations/timelines/shakirOne.ts` with progress bands: `nodesAppear` 0–0.25, `connectionsForm` 0.25–0.5, `lightTravels` 0.5–0.75, `unify` 0.75–0.9, `activate` 0.9–1.0 (headline "ONE SHAKIR." and "You ask. Shakir figures out what comes next.").
- Screen-reader narration: a visually-hidden ordered list mirroring the five stages and the seven pipeline steps.

**Out of scope.** Node interactivity (M6 adds anchor links into the FeatureUniverse worlds).

**Dependencies.** M4.

**Acceptance criteria.**
1. Core + 6 nodes + pipeline visible and non-overlapping at all 5 viewports (bounding-rect test, 0 intersections).
2. Beam traverses the 6 connections exactly once, in order (timeline label test); `activate` reached at scene end.
3. Copy equals brief §09 verbatim (unit test on strings).
4. Reduced motion renders the activated state with the full pipeline, no pin.
5. Frame-time p95 ≤ 20 ms through the scene (local); `shakir-one` chunk ≤ 30 KB gzip.

**Tests added.** Unit: `nodeLayout.test.ts` (polar positions, radius per breakpoint), `shakirOne.timeline.test.ts`. Component: `ShakirOne.test.tsx` (6 nodes, 7 steps, SR list, headings). E2E: `shakir-one.spec.ts` (five states at 1440 and 390, overlap test). A11y: axe at the scene × 5 viewports.

**Evidence.** 5 states × 1440; activated state × 5 viewports; axe; Lighthouse; frame profile; build output.

**Risks → mitigations.** Reads as a generic hub-and-spoke diagram → the core is the crown-hand logo, the connections are beams through faceted geometry, nodes are facets not circles; client sign-off at end of M5 on a real build.

---

#### M6 — 21-feature universe (5 days)

**Goal.** `FeatureUniverse`: six feature worlds as constellations around CHAT + SHAKIR ONE (brief §10, §11), with the detail experience as a deep-linkable route.

**Scope.**
- `src/components/features/FeatureUniverse.tsx` (scene `feature-universe`, pinned 300 vh desktop; on < 834 px unpinned, worlds stacked vertically, 2–3 nodes per row), `FeatureWorld.tsx` × 6, `FeatureNode.tsx` (`<button>`, 56–72 px faceted polygon; hover/focus: scale 1 → 1.18 in 220 ms, name + ≤ 90-char description panel, related nodes get `data-lit="true"`), `FeatureIcon.tsx` reading `public/icons/features.svg` (21 glyphs on a 24 px grid, 1.5 px stroke, each built on the same faceted construction grid, ≤ 600 bytes each), `CenterNode.tsx` (logo mark + CHAT).
- Detail: `src/app/features/[slug]/page.tsx` (full page on direct load) and intercepting route `src/app/@modal/(.)features/[slug]/page.tsx` (dialog over the universe, focus trap, back-button closes). Content: icon, headline, description, "works with" chips from `relations`, and a `DemoSlot` that M7 fills.
- `src/data/features.ts` finalised: `short ≤ 90`, `description ≤ 240` chars, `relations: slug[]`, `demo?: DemoId`. **Content rule test (§29):** a unit test fails on any of `#1`, `world's`, `best`, `guaranteed`, `instantly`, `master anything`, `unlimited`, `perfect`, `100%`, `revolutionary` in any copy file.

**Out of scope.** Demo content (M7).

**Dependencies.** M4, M5, `DEP-COPY`.

**Acceptance criteria.**
1. Exactly 21 features, each once, in the world brief §10 assigns; relations reference valid slugs and are symmetric.
2. Keyboard: Tab visits nodes in reading order, Enter opens detail, Escape closes, focus returns to the node; `/features/code-ai` works on direct load.
3. Focus/hover shows the description within 250 ms; focusing `business-ai` lights `marketing-content-creator-ai`, `goal-to-action-ai`, `website-builder-ai`.
4. No node < 44×44 px at 390; zero node overlaps at any of the 5 viewports.
5. Banned-phrase test passes; `features` chunk ≤ 45 KB gzip, icon sprite ≤ 14 KB, both lazy.

**Tests added.** Unit: `features.data.test.ts` (extended), `content.rule.test.ts`, `constellationLayout.test.ts`. Component: `FeatureNode.test.tsx` (role, `aria-describedby`, lit state), `FeatureDetail.test.tsx` (dialog semantics). E2E: `universe-keyboard.spec.ts`, `universe-hover.spec.ts`, `feature-detail-route.spec.ts`, `universe-overlap.spec.ts`, visual at 5 viewports + 2 detail screenshots. A11y: axe on the universe and on `/features/code-ai` × 5 viewports.

**Evidence.** Universe at 5 viewports; detail modal + direct route; axe; Lighthouse for `/` and `/features/code-ai`; build output; frame profile.

**Risks → mitigations.** 21 nodes crowd phones → stacked recomposition is designed in, not patched later. Icons look generic → shared faceted construction grid and a client icon review on day 3 before the remaining 11 are drawn.

---

#### M7 — Interactive feature demonstrations (8 days)

**Goal.** The nine scripted demonstrations of brief §12–§20, honest and deterministic, each an isolated lazy chunk.

**Scope.**
- `src/components/demonstrations/`: `ChatDemo` (§12), `WebsiteBuilderDemo` (§13), `ImageDemo` (§14), `VideoDemo` (§15), `CodeDemo` (§16), `SkillDemo` (§17), `BusinessDemo` (§18), `AutomationDemo` (§19), `LiveDemo` (§20); step data in `src/data/demos/*.ts`; timelines in `src/animations/timelines/demos/*.ts`; shared `DemoFrame.tsx` (Replay / Pause buttons, "Scripted demonstration" caption — believable rather than fake magic, §13/§29).
- Placement: all nine inside their `FeatureDetail` (play once when visible). Four also appear inline in the journey as pinned, scrub-driven scenes because they prove "one system" best: `ChatDemo` (right after ShakirOne — request routes to Research → Business → Website Builder → Content Creator → Goal-to-Action, 500 ms per activation with the beam connecting them), `WebsiteBuilderDemo` (9 steps; responsive preview is three CSS-only frames, no iframes), `CodeDemo` (7 states, ≤ 12-line TypeScript snippet with test output), `AutomationDemo` (6 nodes joined by `ShakirBeam`).
- Media decisions: `ImageDemo` morphs `LowPolyScene formation="fragments" density="sparse"` into 4 AVIF stills (640 px, ≤ 60 KB each, lazy, from `DEP-IMAGES`). `VideoDemo`'s VIDEO stage is a looping low-poly scene — **zero video files** in the build; if the client later supplies footage: `<video muted playsinline preload="none">` with poster, ≤ 1.5 MB. `BusinessDemo` uses small inline SVG charts, ≤ 3 series. `LiveDemo` shows a device frame, a `role="status"` LIVE indicator and an explicit "Permission required" consent step before SEE → UNDERSTAND → GUIDE → AUTHORIZED ACTION → VERIFY.
- Typewriter text uses a single `aria-live="polite"` announcement of the final sentence per step; demos pause off-screen; reduced motion shows the final state plus a static step list.

**Out of scope.** Real inference, user-typed prompts, video assets.

**Dependencies.** M6, `DEP-IMAGES`.

**Acceptance criteria.**
1. Each demo reaches its final `data-step` in order; Replay restarts from step 0; Pause halts within one frame.
2. Live-region mutations ≤ number of steps per run (no announcement spam).
3. Each demo chunk ≤ 35 KB gzip; none in the initial route bundle; images via `next/image` with `sizes`; 0 CLS from lazy demos (reserved `aspect-ratio` boxes).
4. Inline demos scrub with scroll; detail-only demos autoplay once when ≥ 50 % visible.
5. Frame-time p95 ≤ 20 ms through `ChatDemo` and `WebsiteBuilderDemo` inline scenes.
6. All demo copy passes the content-rule test.

**Tests added.** Unit: 9 × `demo.steps.test.ts` (order, count, copy), timeline builders. Component: 9 × final-state render under reduced motion, `DemoFrame.test.tsx`. E2E: `demos.spec.ts` (9 cases), `chat-demo-inline.spec.ts`, `live-indicator.spec.ts`. A11y: axe on the 9 detail routes at 390 and 1440.

**Evidence.** 9 final states × (1440, 390); the 4 inline demos at 5 viewports; axe × 9 routes; Lighthouse on `/`, `/features/chat-ai`, `/features/website-builder-ai`; build table of demo chunks; frame profiles.

**Risks → mitigations.** Largest milestone, scope creep → step lists frozen in data files on day 1 and signed off; afterwards only timing and visuals change. "Fake magic" → scripted caption and realistic pacing (no 50 ms "websites"). Perf → independent chunks, off-screen pause, no video.

---

#### M8 — Trust + Final CTA + Footer (2.5 days)

**Goal.** The calm break (§21), the simplifying ending (§30) and the minimal footer (§31).

**Scope.**
- `src/components/trust/TrustSection.tsx` (unpinned; "POWER WITH CONTROL."; PERMISSIONS / PRIVACY / VERIFICATION / USER APPROVAL / SECURITY / TRANSPARENCY as a 2×3 grid ≥ 1024 px, 1×6 below; `LowPolyScene intensity={0.15} motion="calm" palette="mono"` — graphite facets with a single teal accent; no beam).
- `src/components/cta/FinalCta.tsx` (scene `final`, pinned 200 vh; fragment schedule 1,400 → 400 → 60 → 1 → logo; the "one symbol" is the official logo (`Logo size="hero"`, 320 px at 1440 / 160 px at 390) scaling in from the last triangle; the intro's light pass is reused; "WHAT WILL YOU CREATE?", ENTER SHAKIR, EXPLORE SHAKIR → `#shakir-one`).
- `src/components/footer/Footer.tsx` (`Logo size="footer"`, links Product, Features (`#features`), Security and Privacy (`#trust` until `DEP-LINKS`), Developers, Pricing, Contact). Links without a client-supplied destination render as muted text, not dead anchors; a unit test fails on any `href` equal to `#` or empty.

**Out of scope.** Destination pages for footer links.

**Dependencies.** M4, `DEP-LINKS`.

**Acceptance criteria.**
1. Trust: accent pixel coverage ≤ 8 % (palette guard with `mono`), scene render ≤ 3 ms/frame, no pin.
2. Final: `data-fragments` passes through 1400 / 400 / 60 / 1 and ends with the logo visible at the stated sizes, unmodified.
3. `document.documentElement.scrollWidth === clientWidth` at every viewport at page end; footer tab order logo → links.
4. All rendered links return < 400 (e2e link check).

**Tests added.** Unit: `navigation.data.test.ts`, `fragmentSchedule.test.ts`. Component: `Footer.test.tsx`, `TrustSection.test.tsx`. E2E: `final-cta.spec.ts`, `footer-links.spec.ts`, `overflow.spec.ts`. A11y: axe at trust, final and footer positions × 5 viewports.

**Evidence.** Trust, final (4 states) and footer screenshots × 5 viewports; axe; Lighthouse; build output.

**Risks → mitigations.** Ending too loud → fragment count and beam usage are fixed numbers above; the last 0.9–1.0 of progress is logo + typography only.

---

#### M9 — Responsive / mobile optimization (4 days)

**Goal.** Recompose, not shrink (§24): every scene verified at the five review viewports plus landscape phone and portrait tablet, on real devices.

**Scope.**
- Tailwind screens aligned to the review viewports: `sm 640, md 834, lg 1024, xl 1280, 2xl 1440, 3xl 1920`. Content max-width 1440 at 1920 with scenes full-bleed.
- `docs/responsive-matrix.md`: scene × viewport → layout, pin length, triangle count, particles, parallax, font sizes — the contract the tests check.
- Profiles: MEDIUM default on tablets, LOW on phones with `deviceMemory ≤ 4`; parallax 0 on touch; pins −40 % below 834; hero `100dvh`; `env(safe-area-inset-*)` on nav and footer; tap targets ≥ 44 px; no hover-only affordances; body text ≥ 16 px on mobile.
- Real-device pass: iPhone 13 Safari, Pixel 7 Chrome, iPad (10th gen) Safari — recorded videos of the full journey.

**Out of scope.** New features.

**Dependencies.** M1–M8.

**Acceptance criteria.**
1. At 390×844, 834×1194, 1280×800, 1440×900, 1920×1080, 844×390 (landscape) and 768×1024: no horizontal overflow, no element outside the viewport, zero overlaps across all scenes, no text below the matrix minimums.
2. Lighthouse mobile (Moto G Power emulation, median of 3): performance ≥ 90, LCP ≤ 2.5 s, TBT ≤ 200 ms, CLS ≤ 0.05; tap-target audit passes.
3. LOW profile under 4× CPU throttle: frame-time p95 ≤ 24 ms, intro ≤ 2.5 s.
4. iOS Safari: no pin jump on address-bar collapse (video evidence); if it jumps, `normalizeScroll(true)` is enabled for iOS only and re-verified.
5. All visual baselines re-captured and reviewed for the 6 Playwright projects.

**Tests added.** E2E: full journey on every project + `landscape-844` project, `viewport-matrix.spec.ts` (overflow, overlap, font sizes), `touch-targets.spec.ts`, `slow-device.spec.ts` (4× throttle via CDP). A11y: axe × 5 viewports × 6 scroll positions.

**Evidence.** 30-screenshot contact sheet + landscape/tablet-portrait sheets; three real-device videos; Lighthouse mobile ×3 runs with medians; frame profiles LOW/MEDIUM.

**Risks → mitigations.** Mobile pins are the usual failure point → shortened pins, `dvh`, real-device videos required for PASS. Perf regressions discovered late → budgets have been enforced in CI since M1, so M9 is about composition, not emergency cuts.

---

#### M10 — Accessibility + performance + testing hardening (4 days)

**Goal.** WCAG 2.2 AA across the journey, final performance budgets, a non-flaky suite, and the complete §32 quality-gate report.

**Scope.**
- Accessibility: keyboard-only journey (Tab count documented per scene), VoiceOver (macOS + iOS) and NVDA scripts in `docs/a11y/sr-scripts.md` with findings; landmarks (`header`/`main`/`footer`, `aria-labelledby` per section); focus-visible style (2 px cyan outline, 2 px offset) on every control; `prefers-contrast: more` token overrides; `forced-colors: active` (nodes keep borders, beam hidden); alt review (logo `alt="SHAKIR AI"`, canvases `aria-hidden`); live regions audited.
- Performance: `@next/bundle-analyzer` report, `budgets.json` thresholds finalised, `Cache-Control: public, max-age=31536000, immutable` for `/brand/*`, `/icons/*`, fonts; preconnect audit; `SceneErrorBoundary` with static fallback per scene; dev routes return 404 without `SHAKIR_DEV_ROUTES`; `not-found.tsx`; `sitemap.ts`, `robots.ts`; OG image 1200×630 (logo unmodified on graphite); security headers in `next.config.ts` (CSP without `unsafe-eval` — GSAP needs none).
- Suite hardening: CI retries = 1, flaky tests quarantined with an issue (never deleted); coverage thresholds — lines ≥ 80 % in `src/animations`, `src/data`, `src/hooks`, `src/low-poly`; ≥ 60 % global; `eslint --max-warnings 0`; memory soak (5-minute scripted scroll loop, heap growth ≤ 10 MB); `console.error` count 0 across all e2e.

**Out of scope.** New content.

**Dependencies.** M9.

**Acceptance criteria (final quality gate, §32).**
1. Lighthouse (median of 3) on `/`, `/features/code-ai`, `/features/chat-ai`: mobile performance ≥ 90, desktop ≥ 95, accessibility 100, best practices ≥ 95, SEO 100.
2. axe with tags `wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice`: 0 violations of any impact on every page × 5 viewports × 6 scroll positions.
3. Keyboard-only journey completes with no trap (video); SR scripts pass; forced-colors and prefers-contrast e2e pass.
4. Lab CWV: LCP ≤ 2.5 s, INP ≤ 200 ms (FeatureNode open and MobileMenu open measured), CLS ≤ 0.05.
5. All budgets in `budgets.json` pass; 20 consecutive green nightly runs; 0 TypeScript errors, 0 lint warnings; coverage thresholds met.
6. `docs/evidence/M10/REPORT.md` has a proof link for every §32 line item; `validate-report.mjs` passes.

**Tests added.** A11y: `a11y-full.spec.ts`, `keyboard-journey.spec.ts`, `forced-colors.spec.ts`, `prefers-contrast.spec.ts`. Performance: `soak.spec.ts`, `budgets` CI step, `dev-routes-404.spec.ts` (second `next start` without the env var, same build). Unit: coverage gate.

**Evidence.** Final REPORT with the full §32 table; Lighthouse HTML/JSON × 3 routes × 2 presets × 3 runs; axe JSON set; SR notes + videos; keyboard video; bundle analyzer HTML; 20 CI run links.

**Risks → mitigations.** Late a11y findings in animated scenes → every milestone already shipped axe + keyboard tests, so M10 is hardening, not discovery. Flakiness from animation timing → tests wait on `data-ready` / `performance.mark`, never on fixed sleeps.

---

### M.3 Testing stack and configuration

| Layer | Tool | Location | Notes |
|---|---|---|---|
| Unit + component | Vitest 3 + React Testing Library 16 + `@testing-library/jest-dom` + `vitest-canvas-mock` | co-located `*.test.ts(x)` | `environment: 'jsdom'`, `globals: false`, `setupFiles: ['src/test/setup.ts']` (matchMedia, ResizeObserver, IntersectionObserver mocks; `gsap.globalTimeline.pause()`; real GSAP, timelines asserted via `progress(1)`), coverage `v8` with the M10 thresholds, reporters `default` + `junit` |
| E2E + visual | Playwright (latest stable) | `e2e/*.spec.ts`, `e2e/helpers/` (`scrollToScene(id, progress)`, `waitForMark(name)`, `expectNoOverlap(selector)`) | projects: `mobile-390` (390×844, DPR 3, touch, Chromium), `mobile-390-webkit` (iPhone 14 descriptor, WebKit), `tablet-834` (834×1194, WebKit), `laptop-1280` (1280×800), `desktop-1440` (1440×900), `large-1920` (1920×1080), `reduced-motion` (1440×900, `reducedMotion: 'reduce'`), `landscape-844` (from M9); `webServer: next build && SHAKIR_DEV_ROUTES=1 next start` (always the production build; `reuseExistingServer` locally); `retries: CI ? 1 : 0`; `trace`, `video`, `screenshot` = retain/only on failure; `toHaveScreenshot` with `maxDiffPixelRatio: 0.02` for DOM, `0.05` for canvas; layout snapshots mask `canvas` and are taken in the `reduced-motion` project, motion snapshots after `data-ready="true"` |
| Accessibility | `@axe-core/playwright` | `e2e/helpers/axe.ts` → `expectNoA11yViolations(page, { tags, evidencePath })` | fails on `critical`/`serious` from M0, on all impacts from M10; writes `axe-{route}-{viewport}.json` |
| Lighthouse | `@lhci/cli` | `lighthouserc.cjs` (desktop preset), `lighthouserc.mobile.cjs` (Moto G Power / slow 4G) | `numberOfRuns: 3`, `startServerCommand: npm run start`, URLs `/`, `/features/code-ai`, `/features/chat-ai`; `assert` thresholds per milestone (table below); `upload.target: 'filesystem'` → `docs/evidence/M{n}/lighthouse/` |
| Types | TypeScript 5, `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `isolatedModules` | `tsconfig.json` | `exclude: ["prototypes", "docs/evidence"]` |
| Lint / format | ESLint 9 flat config: `next/core-web-vitals`, `next/typescript`, `typescript-eslint` strict-type-checked, `jsx-a11y` strict, `react-hooks`, `playwright` (e2e only); Prettier 3 + `prettier-plugin-tailwindcss` | `eslint.config.mjs`, `.prettierrc` (`printWidth 100`, `singleQuote`, `trailingComma 'all'`) | custom rules: `no-restricted-imports` — `gsap` and `gsap/*` importable only under `src/animations/**` and `src/low-poly/**` (§28); `<img>` banned outside `src/components/brand/`; `--max-warnings 0` |
| Bundle | `@next/bundle-analyzer` + `scripts/check-budgets.mjs` | `budgets.json` | `ANALYZE=true npm run build` → `docs/evidence/M{n}/bundle/client.html`; budget script reads `.next/app-build-manifest.json`, gzips each chunk, fails CI on any breach |
| Perf scripts | Playwright + CDP | `scripts/perf/frame-profile.ts`, `scripts/perf/heap.ts` | 10 s rAF delta sampling → `frames-{profile}.json` (p50/p95/max); heap sampling |
| Git hooks | husky + lint-staged | `.husky/` | pre-commit: prettier + eslint on staged; pre-push: `typecheck` + `test` |

**`budgets.json` (gzip, enforced from the milestone where the chunk first exists):** shared first-load JS ≤ 105 KB · route `/` first-load ≤ 175 KB (M1 120, M2 150) · `low-poly-engine` ≤ 28 KB · `scene-controller` ≤ 12 KB · `shakir-one` ≤ 30 KB · `features` ≤ 45 KB · icon sprite ≤ 14 KB · each demo ≤ 35 KB · total JS over the full journey ≤ 480 KB · CSS ≤ 45 KB · fonts ≤ 160 KB · images on `/` ≤ 600 KB · video 0 B · full-journey page weight ≤ 1.8 MB desktop / ≤ 1.2 MB mobile.

**Lighthouse thresholds per milestone (mobile perf / desktop perf / a11y / best practices / SEO):** M0–M1: 95 / 98 / 100 / 95 / 100 · M2–M8: 85 / 92 / 100 / 95 / 100 · M9–M10: 90 / 95 / 100 / 95 / 100. Always measured with the intro enabled.

**Testability instrumentation (ships in production, cost negligible):** `data-scene`, `data-scene-state="idle|active|complete"`, `data-step`, `data-ready`, `data-beam-state`, `data-fragments`, `data-lit`; `performance.mark` names `intro:start`, `intro:end`, `intro:skipped-session`, `scene:{id}:complete`; `performance.measure('lowpoly:render')`. No `window` globals.

**`package.json` scripts:** `dev`, `build`, `start`, `typecheck`, `lint`, `format`, `format:check`, `test` (vitest run), `test:watch`, `test:e2e` (all projects), `test:e2e:ui`, `test:a11y` (axe-tagged specs), `test:lhci` (`lhci autorun` ×2 configs), `analyze`, `budgets`, `perf:frames`, `evidence:capture -- --milestone M{n}`, `evidence:validate -- M{n}`, `gate` (typecheck → lint → format:check → test → build → budgets → test:e2e → test:lhci).

---

### M.4 CI pipeline (`.github/workflows/ci.yml`, Node 22, `npm ci` with cache)

| Stage | Job | Runs | Target time | Required to merge |
|---|---|---|---|---|
| 1 | `install` | `npm ci`, cache `~/.npm` and Playwright browsers | 1 min | — |
| 2 | `static` (parallel ×3) | `tsc --noEmit`; `eslint --max-warnings 0`; `prettier --check` | 2 min | yes |
| 3 | `unit` | `vitest run --coverage`; upload junit + coverage | 2 min | yes |
| 4 | `build` | `next build` (log saved), `check-budgets`, `ANALYZE=true` artifact `.next` + `bundle/client.html` | 3 min | yes |
| 5 | `e2e` (matrix: 6–8 projects) | `next start` from the build artifact, Playwright incl. axe helpers; upload HTML report, traces, screenshots, axe JSON | 8 min | yes |
| 6 | `lighthouse` | LHCI desktop + mobile against `next start`; assert thresholds; upload HTML/JSON | 5 min | yes |
| 7 | `evidence` (on `milestone/*` branches and `m*-done` tags) | `evidence:capture`, `evidence:validate`, upload `docs/evidence/M{n}` artifact, post a PR comment with the gate table | 4 min | — |
| 8 | `deploy-preview` (when `DEP-HOSTING` exists) | Vercel preview URL on the PR | 2 min | — |

Wall-clock ≤ 20 min with parallel jobs. `nightly.yml`: full matrix + Firefox 1440 + WebKit 1440, `--repeat-each 3` for flake detection, soak test, results posted to `docs/evidence/nightly/`.

---

### M.5 Definition of Done

A PR is done when: CI green on all required checks · zero TypeScript errors and lint warnings · new behaviour has unit/component tests and, if user-visible, an e2e test and an axe assertion · visual baselines updated intentionally (diff reviewed, reason in the PR) · budgets pass · no `console.error` in e2e · GSAP used only through `src/animations/**` / `src/low-poly/**` · reduced-motion path implemented for any new motion · copy passes the content-rule test · the logo is only ever rendered through `Logo` · PR description links to the evidence folder it touched.

A milestone is done when: every acceptance criterion above is met with a proof link · the after-milestone ritual (M.6) is complete · `docs/evidence/M{n}/REPORT.md` passes `evidence:validate` · the tag `m{n}-done` points at the reported commit · the client checkpoint (where listed) is signed off in writing.

---

### M.6 "After every milestone" ritual (brief §33) — checklist

Branch `milestone/M{n}`, commit SHA recorded at the top of the report.

- [ ] **RUN TESTS** — `npm run typecheck && npm run lint && npm run format:check` → `logs/static.txt`; `npm run test -- --coverage` → `logs/unit.txt` + `coverage/`; `npm run test:e2e` (all projects) → `playwright-report/`, `axe/*.json`; `npm run perf:frames -- --profiles high,medium,low` on the reference devices → `frames-*.json`.
- [ ] **RUN BUILD** — `npm run build` → `build/next-build.txt` (full route/chunk table); `npm run budgets` → `build/budgets-result.json`; `npm run analyze` → `bundle/client.html`; `npm run test:lhci` → `lighthouse/`.
- [ ] **VISUALLY REVIEW** — `npm run evidence:capture -- --milestone M{n}` → `screens/` (5 viewports × the milestone's scroll positions, DPR 1, `oxipng`-optimised, ≤ 300 KB each, ≤ 8 MB per milestone, CI-checked). Then a human pass of every §32 item, each recorded as a row with a proof link: layout shifts (CLS JSON + eyes), overflow (`overflow.spec` + eyes), animation jank (frame JSON + video), text readability (contrast test + screenshots), focus states (keyboard video), loading (intro video + Lighthouse), errors (console log count), reduced motion (`reduced-motion` project screenshots), slow devices (`slow-device.spec` + LOW frame JSON). From M2: one real phone pass; from M9: three real devices with video.
- [ ] **FIX PROBLEMS** — every failure becomes an issue `M{n}-F{k}` linked in the report; fix; re-run the failed stage, then the full `npm run gate` once more; the report shows the final run only, with the issue list as history.
- [ ] **REPORT EVIDENCE** — fill `docs/evidence/M{n}/REPORT.md` from `TEMPLATE-REPORT.md`; `npm run evidence:validate -- M{n}` must pass; link the CI run; tag `m{n}-done`; request client sign-off where a checkpoint is listed. The next milestone starts only after the report is merged.

---

### M.7 Evidence format (no PASS without proof)

Folder: `docs/evidence/M{n}/` → `REPORT.md`, `screens/`, `lighthouse/`, `axe/`, `build/`, `perf/`, `video/`, `logs/`, `coverage-summary.json`. Committed to the repository so the client reviews evidence in the PR, not in a chat. Videos ≤ 10 MB (`.webm`), screenshots ≤ 300 KB, per-milestone folder ≤ 8 MB (CI-enforced).

**File naming.** `screens/m{n}-{scene}-{viewport}-{state}.png` (e.g. `m05-shakir-one-390-activate.png`), `lighthouse/lh-{route}-{preset}-run{1..3}.{json,html}` + `lighthouse/summary.json` (medians), `axe/axe-{route}-{viewport}-{position}.json`, `build/next-build.txt`, `build/budgets-result.json`, `bundle/client.html`, `perf/frames-{profile}.json`, `perf/heap-{scenario}.json`, `video/{what}-{viewport}-{profile}.webm`, `logs/{stage}.txt`.

**`REPORT.md` structure.** Header: milestone, commit SHA, date, Node version, browser versions, reference devices used, reviewer. Sections: 1 Summary (PASS / FAIL with counts) · 2 Acceptance criteria table · 3 Quality-gate table (every §32 line) · 4 Visual review table (every §32 "Check" item × viewport) · 5 Budgets · 6 Issues found and fixed (`M{n}-F{k}`) · 7 Open risks carried forward · 8 Client sign-off line.

Every table row has the columns **Check | Command | Result | Proof | Reviewer | Date**. `Result` may read `PASS` only when `Proof` is a relative path that exists in the folder or a CI/preview URL. `scripts/evidence/validate-report.mjs` parses the tables, resolves every proof path, checks the Lighthouse medians and axe counts in the JSON against the thresholds for that milestone, and fails on: a PASS without proof, a proof file that does not exist, a Lighthouse JSON under threshold, an axe JSON with `critical`/`serious` violations, a build log containing "error", or a budgets result with a breach. A FAIL row is allowed only with a linked issue id. The CI `evidence` job runs the validator, so an unproven PASS cannot merge.

---

### M.8 `CLAUDE.md` (written in M0, kept current every milestone)

Headings, in order:
1. **What this is** — official SHAKIR AI public website; brief at `docs/shakir-website-brief.md` is the source of truth; the approved plan at `docs/plan/` extends it; `prototypes/aurelia/` is unrelated and must not be edited, imported or built.
2. **Commands** — the `package.json` scripts above, with `npm run gate` as the one command to run before any claim of completion.
3. **Repository map** — `src/app`, `src/components/{brand,navigation,hero,low-poly,shakir-one,features,demonstrations,trust,cta,footer,ui}`, `src/animations/{core,timelines,scroll,transitions,beam,reduced-motion}`, `src/low-poly/engine`, `src/data`, `src/hooks`, `src/styles`, `e2e`, `scripts`, `docs/evidence`, `brand`, `public/brand`.
4. **Canonical names** — `LowPolyScene`, `ShakirBeam`, `SceneController`, `IntroSequence`, `FeatureUniverse`, `ShakirOne`; profiles `HIGH / MEDIUM / LOW / REDUCED_MOTION`; worlds `CREATE / LEARN / BUILD & GROW / ACT / TRUST / HUMAN` with `CHAT + SHAKIR ONE` at the center. Never invent synonyms.
5. **Hard rules** — the logo is rendered only via `Logo`, never filtered, transformed, cropped, recoloured or redrawn; the source PNG is never edited; GSAP only inside `src/animations/**` and `src/low-poly/**`; no Three.js or any 3D framework without `docs/decisions/` justification approved by the client; no video files without `DEP` approval; no scroll-hijack libraries; every animation cleans up via `useGsapContext`; every motion has a reduced-motion path; copy must pass `content.rule.test.ts` (brief §29); accents follow the palette guard (brief §01/§03); budgets in `budgets.json` are not negotiable in a PR.
6. **Performance profiles** — the detection rules and the triangle/particle/DPR table from M3.
7. **Testing** — where tests live, the Playwright projects, how to update visual baselines (`--update-snapshots` only with a reason in the PR), how to run axe locally.
8. **After every milestone** — the M.6 checklist and the rule: *never write PASS without a proof path; run `npm run evidence:validate` before reporting.*
9. **Branching and PRs** — `milestone/M{n}`, `feat(M{n}): …`, squash merge, PR template fields (scope, tests, evidence links, baselines changed, budgets).
10. **Open dependencies** — pointer to `docs/DEPENDENCIES.md` (`DEP-LOGO`, `DEP-COPY`, `DEP-IMAGES`, `DEP-LINKS`, `DEP-HOSTING`) and what to do while each is open.
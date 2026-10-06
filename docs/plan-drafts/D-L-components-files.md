## D. COMPONENT TREE

### D.0 Conventions that every component follows

- Source lives in `src/` (`@/` → `src/*`). Brief §26 folders are kept verbatim under `src/components`, `src/animations`, `src/data`, `src/hooks`; three folders are added: `components/ui` (primitives), `components/icons` (21 feature icons + UI glyphs), `components/providers`.
- **Server by default.** A component becomes `'use client'` only if it holds state, refs, GSAP, canvas, or browser APIs. Copy, headings and links are always rendered on the server so the story survives without JS and is indexable.
- **One motion library: GSAP 3.13** (ScrollTrigger, DrawSVGPlugin, MotionPathPlugin, SplitText, Flip, CustomEase — all free since 3.13). No Framer Motion, no Lenis/ScrollSmoother (native scroll + `scrub: 0.6` gives the inertia; scroll-hijacking breaks §23). No Three.js: every scene in this plan is reachable with Canvas 2D + SVG (§25). A `WebGLRenderer` slot exists in `lib/lowpoly/` and is built only if M3 profiling shows the HIGH profile below 55 fps at 1440×900 on an M1-class laptop.
- **GSAP is quarantined.** `gsap` may be imported only from `lib/gsap.ts`, `animations/**`, `hooks/useGsap.ts` and `components/low-poly/**` (enforced by `no-restricted-imports` in `eslint.config.mjs`). Components call timeline factories from `animations/timelines`, never `gsap.to` inline (§28).
- **One canvas.** The whole home journey renders one fixed, full-viewport `LowPolyScene` owned by `SceneController`; sections scroll over it and *morph* it. Only demos that need their own geometry (`SkillDemo`, `ImageDemo`) mount a second `LowPolyScene` in `mode="inline"` with `density ≤ 0.25`.
- Every animated node is `aria-hidden` or has a text equivalent; every pinned scene has a non-pinned recomposition for `REDUCED_MOTION` and for viewports < 768 px.

### D.1 Tree (home route)

```
app/layout.tsx (server)
└─ AppProviders (client)                      MotionProvider → SceneProvider(no-op outside home)
   ├─ IntroGateScript (server, inline <script>, 310 B)   sets <html data-intro="pending|seen"> before paint
   ├─ SkipLink (server)
   ├─ SiteHeader (server) → NavBar (client) → NavLink ×4, Button(primary "ENTER SHAKIR"), MobileMenu (client, Radix Dialog)
   ├─ {children} = app/page.tsx (server)
   │   └─ SceneController (client, owns the fixed LowPolyScene + chapter registry)
   │      ├─ LowPolyScene mode="fixed" (client, canvas, z-index 0)
   │      ├─ IntroSequence (client, portal overlay, session-gated)   ⟵ reuses the hero Logo DOM node via Flip
   │      ├─ Hero (server shell) → SceneChapter id="hero" → Logo, HeroHeadline(c), HeroSupport, HeroCtas, HeroScrollCue(c)
   │      ├─ ShakirOne (client, pinned) → OneCore, OneRing, OneNode ×27, OneConnections, OnePipeline
   │      ├─ ChatDemo context="inline" (client)                     "network becomes product interface"
   │      ├─ FeatureUniverse (client, pinned) → FeatureWorld ×6 + core, FeatureNode ×21, FeatureConnections, FeatureList (fallback)
   │      ├─ DemoShowcase (server) → WebsiteBuilderDemo, CodeDemo, AutomationDemo (client, lazy)   "creation engine"
   │      ├─ TrustSection (server) → SceneChapter id="calm" → TrustPillar ×6
   │      └─ FinalCTA (client, pinned) → Logo, Button ×2
   ├─ {modal} slot = app/@modal/(.)features/[slug] → FeatureDetailModal (client) → FeatureDetail (server-rendered RSC payload)
   └─ Footer (server) → Logo variant="full", FooterLinks, MotionToggle (client)
```
Default order shown; final section order is owned by plan section C — every chapter is registered declaratively, so reordering is a JSX change, not an engine change.

### D.2 Brand — `components/brand/`

**`Logo`** (server). Uses the official asset only (§02). Never rasterised from text, never cropped except the square favicon crop with 12 % padding (proportions untouched).

```ts
type LogoVariant = 'full' | 'mark' | 'mono';
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;   // mark height px: xs 24 · sm 32 · md 48 · lg 140 · xl 220
interface LogoProps {
  variant?: LogoVariant;            // default 'mark'
  size?: LogoSize;                  // default 'sm'
  priority?: boolean;               // next/image priority — nav, hero, intro only
  wordmarkPosition?: 'right' | 'below';   // 'full' only; default 'right'
  decorative?: boolean;             // alt="" when adjacent text already says "SHAKIR AI"
  id?: string;                      // stable id for Flip (intro → hero)
  className?: string;
}
```
- `mark`: `next/image` `/brand/shakir-mark.png` (1024×1024 intrinsic, `sizes` derived from `size`), `alt="SHAKIR AI"`, aspect locked 1:1, `object-fit: contain`, clear-space = 0.25 × height, never below 24 px.
- `full`: mark + `Wordmark` (typeset "SHAKIR AI", uppercase, tracking 0.18em, cap-height 0.42 × mark height, gap 0.45 × mark height). The wordmark is text, the mark is never text.
- `mono`: `<span role="img" aria-label="SHAKIR AI">` with `mask-image: url(/brand/shakir-mark.png)` + `background: currentColor` — the exact silhouette of the official alpha channel, no redraw. Used in footer legal line and print. **Blocked until the transparent asset arrives** (source PNG has a white background; see L, `docs/asset-requests.md`).
- Placements: nav `sm` (28 px on < 768), hero `xl` (`lg` on mobile), intro = same node as hero, ShakirOne core `size={96}`, FeatureDetail header `xs`, FinalCTA `xl`, footer `full`/`md`, `app/loading.tsx` `md`, OG image 400 px mark on graphite.

**`Wordmark`** (server) `{ size: number; as?: 'span'|'h1' }` — typographic "SHAKIR AI"; the only place the brand name is set as a display string besides copy.

**`LogoLightSweep`** (client) `{ children: ReactElement<LogoProps>; trigger: 'manual'|'inView'; duration?: 600 }` — a 24°-rotated linear-gradient band (soft white → warm amber → transparent, 18 % width) that passes over the logo through the same alpha mask, so light touches only logo pixels. Returns `{ play() }` via ref. Used by `IntroSequence` phase 5 and once by `ShakirOne` activation.

**`ShakirBeam`** (client, SVG) — the §08 motif.
```ts
interface ShakirBeamProps {
  path: string | { from: Point; to: Point; curvature?: number } | 'surface';  // 'surface' traces the parent's rounded rect
  preset?: 'trace' | 'flow' | 'connect' | 'sweep' | 'pulse';   // default 'trace'
  color?: PaletteId | string;       // default 'spectrum' (3-stop: electric blue → violet → warm amber)
  width?: number;                   // 1–2 px; default 1.5
  length?: number;                  // visible fraction of path, 0.05–0.4; default 0.18
  duration?: number;                // ms; default 1400
  trigger?: 'mount' | 'inView' | 'hover' | 'focus' | 'manual' | 'scroll';
  repeat?: number;                  // default 0; max 2 — never infinite on UI surfaces (§08)
  glow?: 0 | 1 | 2;                 // 0 none · 1 soft (feGaussianBlur σ=2) · 2 transitions only
  onComplete?(): void;
}
interface ShakirBeamHandle { play(): void; stop(): void; progress(t: number): void }
```
Implementation: `<path>` driven by DrawSVGPlugin (`"0% 0%" → "82% 100%"` with the `length` window) plus a 3 px head `<circle>` on MotionPathPlugin; `scroll` trigger binds `progress()` to the chapter's ScrollTrigger. Budget rule (§08): at most one beam animating per viewport; `trace` on buttons fires once per hover/focus (900 ms).

**`LoadingMark`** (client) — `Logo md` + one `ShakirBeam preset="trace" path="surface"` pass; static under REDUCED_MOTION. Used by `app/loading.tsx` (§02 "loading experience").

### D.3 Navigation — `components/navigation/`

- **`SiteHeader`** (server) — `<header>` landmark; composes `Logo sm priority`, `NavBar`, primary `Button`.
- **`NavBar`** (client) `{ items: NavItem[] }` — compacts 72→56 px after 80 px scroll, hides on down-scroll velocity > 8 px/frame and returns on up-scroll (GSAP `quickTo`, 240 ms), `backdrop-filter: blur(12px)` over graphite at 72 % alpha. Active link = `SceneController.activeChapter`. No permanent glowing border (§08).
- **`NavLink`** (client) `{ item: NavItem; active: boolean }` — underline draws left→right 180 ms; `aria-current="true"` when active.
- **`MobileMenu`** (client, Radix Dialog) — full-screen, links stagger 40 ms, static `FacetPanel` backdrop, focus-trapped, closes on route change.
- **`SkipLink`** (server) — "Skip to content", visible on focus.
- **`MotionToggle`** (client) — `system | reduced | full`, persisted in `localStorage['shakir.motion']`, rendered in `Footer`.

### D.4 Hero — `components/hero/`

- **`Hero`** (server) — wraps content in `SceneChapter id="hero" formation="terrain" palette="spectrum" intensity={0.55} depth={0.6} motion={0.4}`. Owns copy from `data/site.ts`.
- **`HeroHeadline`** (client) `{ lines: [string, string] }` — SplitText by lines, masked line reveal 720 ms, stagger 90 ms; plain text under REDUCED_MOTION.
- **`HeroSupport`** (server) — "Create. Learn. Research. Build. Automate." with the five words separated by 4 px faceted diamonds (`<svg>`), not bullets.
- **`HeroCtas`** (server) — `Button variant="primary" beam` ("ENTER SHAKIR", href = `NEXT_PUBLIC_APP_URL`) + `Button variant="ghost"` ("EXPLORE FEATURES", `#features`).
- **`HeroScrollCue`** (client) — 1 px line + "SCROLL", fades after first 40 px of scroll, never returns.

### D.5 Low-poly engine — `components/low-poly/`

**`LowPolyScene`** (client) — the engine (§27). Canvas 2D, flat-shaded triangles, three parallax layers, one `gsap.ticker` loop shared with all timelines.
```ts
type PerformanceProfile = 'HIGH' | 'MEDIUM' | 'LOW' | 'REDUCED_MOTION';
type Formation = 'void' | 'points' | 'fragments' | 'terrain' | 'network' | 'interface'
               | 'universe' | 'engine' | 'one' | 'calm' | 'collapse' | 'mark';
type PaletteId = 'spectrum' | 'create' | 'learn' | 'build' | 'act' | 'trust' | 'human' | 'crown' | 'graphite';

interface LowPolySceneProps {
  intensity?: number;        // 0–1: saturation × light energy × glow; default 0.6 (TRUST uses 0.15)
  density?: number;          // 0–1: fraction of the profile's triangle budget; default 1
  depth?: number;            // 0–1: layer separation (0 = flat, 1 = parallax factors 0.2/0.5/1.0); default 0.5
  motion?: number;           // 0–1: idle drift (simplex noise, 0–6 px) + facet rotation (0–3°); default 0.4
  palette?: PaletteId | PaletteDef;
  interactive?: boolean;     // pointer parallax ±14 px + hover refraction; default true; forced false on coarse pointer, LOW, REDUCED_MOTION
  performanceLevel?: PerformanceProfile | 'auto';   // default 'auto' (from MotionProvider)
  formation?: Formation;     // initial; default 'void'
  seed?: number;             // deterministic geometry; default 0x5348 ("SH")
  mode?: 'fixed' | 'inline'; // fixed = position:fixed inset-0; inline = fills parent box
  particles?: boolean;       // tiny points of light layer; default true (budget per profile)
  className?: string;
  onReady?(api: LowPolySceneHandle): void;
  onFrameStats?(stats: { avgMs: number; dropped: number }): void;   // feeds usePerformanceProfile downgrade
}
interface LowPolySceneHandle {
  morphTo(formation: Formation, opts?: { duration?: number; ease?: string }): gsap.core.Tween;
  setProgress(from: Formation, to: Formation, t: number): void;   // scrubbed morph, t 0–1
  set(partial: Partial<Pick<LowPolySceneProps,'intensity'|'density'|'depth'|'motion'|'palette'>>, duration?: number): void;
  pulse(origin: Point, strength?: number): void;                   // light burst (beam head passing through geometry)
  collapse(target: DOMRect, duration: number): gsap.core.Timeline; // §30: thousands → hundreds → dozens → one
  pause(): void; resume(): void;
}
```
Budgets (`lib/lowpoly/budgets.ts`): HIGH 1 400 triangles / 3 layers / 120 particles / DPR ≤ 1.5 · MEDIUM 700 / 2 / 60 / DPR ≤ 1.25 · LOW 320 / 1 / 0 / DPR 1 · REDUCED_MOTION 220 static, no rAF loop; morphs become a 320 ms opacity cross-fade between two offscreen canvases. Geometry is Poisson-disc points + Delaunay (`delaunator`, 4 KB) at a fixed vertex count, so every formation is a target `Float32Array` of the same length; a morph is one tween of `t` with a per-vertex stagger map. The loop pauses when `document.hidden` or when the canvas leaves the viewport. The `mark` formation samples the alpha of the transparent logo into a point cloud (`lib/lowpoly/silhouette.ts`) so fragments *converge into the logo's position* — never held as an image; the official asset cross-fades in at t = 0.85.

**`SceneController`** (client) — the scroll-storytelling orchestrator (§06–§07).
```ts
interface SceneChapterDef {
  id: SceneId; formation: Formation; palette: PaletteId;
  intensity: number; depth?: number; motion?: number;
  pin?: { lengthVh: number; mobileLengthVh: number };   // pinned chapters own a scrubbed timeline
  transition?: { start: string; end: string };           // default 'top 80%' → 'top 20%'
}
interface SceneContextValue {
  scene: LowPolySceneHandle | null;
  register(def: SceneChapterDef, el: HTMLElement): () => void;
  activeChapter: SceneId; progress: RefObject<number>;
}
```
Owns the fixed `LowPolyScene`, one ScrollTrigger per chapter, and the overlap rule: between chapter *n* and *n+1* it calls `scene.setProgress(n.formation, n+1.formation, p)` so the environment transforms *between* scenes (SCENE → TRANSITION → SCENE). Home chapters: `intro(void→fragments) → hero(terrain) → one(network→one) → interface → universe → engine → calm → collapse → mark`. Exposes `activeChapter` to `NavBar`.

**`SceneChapter`** (client wrapper, renders a `<section>`) — declarative registration: `<SceneChapter id formation palette intensity>` calls `useSceneChapter`.

**`IntroSequence`** (client; §04). Session gate + 3.2 s cinematic.
```ts
interface IntroSequenceProps { force?: boolean; maxDuration?: number /* 3200 */; onComplete(): void }
```
Phases (ms): 0–400 void → points (CSS radial dots, 48 of them) · 400–1400 fragments emerge and assemble (`scene.morphTo('terrain')`) · 1200–2000 `ShakirBeam preset="flow"` through the geometry with `scene.pulse` at the head · 1800–2400 logo emerges (scale 0.92→1, blur 8→0 px) · 2300–2700 `LogoLightSweep.play()` · 2600–3000 "SHAKIR AI" wordmark chars (stagger 24 ms) · 3000–3200 handoff: GSAP Flip moves the *same* `Logo#brand-hero` node to its hero position while the overlay fades. Skip: Escape, click, keydown, wheel, touchmove → `tl.timeScale(4)` then complete (interruptible, §28). Gate: `sessionStorage['shakir.intro.v1']` via `useIntroSeen`; `?intro=1` forces replay for QA; `IntroGateScript` sets `data-intro` before first paint so neither the hero nor the intro flashes. REDUCED_MOTION: 500 ms fade of logo + wordmark, no geometry.

**`FacetPanel`** (server, SVG) `{ seed: number; width: number; height: number; palette?: PaletteId; facets?: 12–40 }` — deterministic low-poly panel for cards/frames (trust pillars, device frames, storyboard frames). Pure SVG, no runtime cost.

### D.6 Shakir One — `components/features/one/`

**`ShakirOne`** (client, pinned 400 vh desktop / 250 vh mobile; §09) `{ worlds: World[]; pipeline: PipelineStep[] }`. Scrubbed phases: 0–0.20 `OneNode`s appear (6 world nodes on r = 220 px, 21 capability dots on r = 140/300 px) · 0.20–0.45 `OneConnections` draw (DrawSVG) · 0.45–0.65 beam travels the connections (`ShakirBeam preset="connect" trigger="scroll"`) · 0.65–0.80 dots converge into a single ring, `scene.set({ intensity: 0.9, palette: 'crown' })` · 0.80–1.0 `OneCore` activates (one `LogoLightSweep`, no loop) and `OnePipeline` reveals USER REQUEST → SHAKIR ONE → UNDERSTAND → ROUTE → CREATE / RESEARCH / BUILD / ACT → VERIFY → RESULT with the beam stepping 120 ms per node. Message "You ask. Shakir figures out what comes next." is server-rendered. Mobile: unpinned; ring 260 px, pipeline becomes a vertical rail.
- `OneCore` (server) — `Logo size={96}` inside a 12-facet gold ring (`FacetPanel palette="crown"`).
- `OneNode` (client) `{ kind: 'world'|'capability'; label; angle; radius; worldId }` — `<button>` for worlds (jumps to that world in `FeatureUniverse`), decorative dots for capabilities.
- `OneConnections` (client, SVG) — 27 paths, `stroke 1 px`, graphite at 24 % until lit.
- `OnePipeline` (server shell + client beam) — 7 nodes, `<ol>`.

### D.7 Feature universe — `components/features/`

**`FeatureUniverse`** (client, pinned 300 vh desktop; §10–§11) `{ features: Feature[]; worlds: World[]; layout: UniverseLayout }`. HTML `<button>` nodes (focusable) over an SVG connection layer. Assembly order while scrubbing: CREATE → LEARN → BUILD & GROW → ACT → TRUST → HUMAN around the centre CHAT + SHAKIR ONE; then connections draw; then the pin releases and the constellation is free to explore. Hover/focus: polygon scales 1→1.18 (transform only), name fades in at 120 ms, blurb at 200 ms, `connections[]` nodes get `data-lit` and their links draw. Selection: `router.push('/features/[slug]')` (intercepted as a modal on home; a real page on direct load). Keyboard: roving tabindex per world, arrows within a world, Tab to the next world, Enter opens, Escape returns focus to the node. Mobile (< 768): no pin — worlds become horizontally snapping clusters, 3 nodes visible, world label sticky. REDUCED_MOTION or no JS: `FeatureList`.
- `FeatureWorld` (client) `{ world: World; features: Feature[]; origin: Point }` — group label, cluster geometry, world palette.
- `FeatureNode` (client) `{ feature: Feature; position: Point; lit: boolean; onSelect }` — `<button aria-describedby>`; 7-sided faceted polygon (`FacetPanel` 12 facets), `FeatureIcon`.
- `FeatureConnections` (client, SVG) — edges from `connections[]`, draws only edges touching the hovered/focused node (max 5 lit at once).
- `FeatureList` (server) — all 21 grouped by world as `<ul>`s with links; also rendered in `<noscript>`.
- `FeatureDetail` (server) `{ feature: Feature; related: Feature[] }` — premium detail: world eyebrow, name, `longDescription`, demo via `demonstrations/registry` (lazy), "Connected capabilities" chips, prev/next in world.
- `FeatureDetailModal` (client, Radix Dialog) — hosts `FeatureDetail` for the intercepting route; `ShakirBeam path="surface"` traces the dialog once on open (§08 "travel around important UI surfaces").
- `FeatureIcon` (server) `{ iconId: IconId; size?: 20|24|32 }` — maps to `components/icons/feature/*`.

### D.8 Demonstrations — `components/demonstrations/`

Shared contract (all client, all lazy via `registry.ts` + `next/dynamic`, each ≤ 25 KB gz):
```ts
type DemoId = 'chat' | 'website-builder' | 'image' | 'video' | 'code' | 'skill' | 'business' | 'automation' | 'live';
interface DemoProps { context: 'inline' | 'detail'; mode?: 'auto' | 'scrub' | 'manual'; steps?: DemoStep[] }
interface DemoStep { id: string; label: string; caption: string; durationMs: number }
```
`mode: 'auto'` resolves to `scrub` (pinned, desktop ≥ 1024, HIGH/MEDIUM), `manual` (stepper with Play, mobile/LOW), or a static all-steps list (REDUCED_MOTION). Composition: `DemoFrame` (faceted chrome, title, `DemoStepper`, `DemoCaption`, live region announcing step labels) → demo body. All copy in `data/demos/*.ts`.

- **`ChatDemo`** (§12) — `ChatTranscript` (user bubble "Help me turn my idea into a business." → understanding state: three faceted dots 600 ms → plan line) + `CapabilityActivation` (chips Research → Business → Website Builder → Content Creator → Goal-to-Action, beam connects them 350 ms apart). Closing line: "Shakir figures out what comes next."
- **`WebsiteBuilderDemo`** (§13) — `PromptBar` ("Build a luxury architecture website."), `BuildStages` rail (9 stages), `DeviceFrame` × 3 (desktop 1280, tablet 834, mobile 390 → scaled) each rendering the *same* `MiniSite` (real HTML blocks, container queries, no screenshots) so RESPONSIVE PREVIEW is literally the layout reflowing; copy and images fill in per stage.
- **`ImageDemo`** (§14) — `PromptText` → `ParticleFormation` (inline `LowPolyScene density 0.25`, 600/300/150 triangles converge through an alpha mask) → `Gallery` (4 variations, `next/image` AVIF, 600 ms cross-fade + 12 px parallax). Images are client-supplied or licensed (asset request).
- **`VideoDemo`** (§15) — `TimelineRail` (IDEA → SCRIPT → STORYBOARD → SCENES → VIDEO); storyboard frames are `FacetPanel`s; VIDEO stage `<video muted playsInline preload="none">` 720p, ≤ 1.5 MB, 6 s loop, loaded via IntersectionObserver only on HIGH/MEDIUM without `saveData`; otherwise poster.
- **`CodeDemo`** (§16) — `CodePane` (line-by-line reveal), `TestRunner` (PASS/FAIL rows), `ErrorCallout`, `FixDiff` (2-line diff), `PreviewPane`. 7 steps; the ERROR → FIX → PASS beat is 1.4 s so verification is visibly the point.
- **`SkillDemo`** (§17) — central skill node + `VideoPanel` × 7 (FOUNDATION … FINAL PROJECT) on a 7-point ring (desktop) / 2-column stack (mobile); beam steps 1→7 on scrub.
- **`BusinessDemo`** (§18) — 8-stage transform; `DataViz` is SVG (one line, one bar group) drawn with DrawSVG, axes labelled "illustrative" (§29).
- **`AutomationDemo`** (§19) — `WorkflowCanvas` + `WorkflowNode` × 6 (TRIGGER, CONDITION, ACTION, ACTION, VERIFY, COMPLETE); edges are `ShakirBeam preset="connect"`.
- **`LiveDemo`** (§20) — `DeviceFrame`, `LiveIndicator` (amber dot, 1.2 s pulse, "LIVE"), `PermissionPrompt` ("Allow Shakir to view this screen?" Allow / Deny); SEE → UNDERSTAND → GUIDE → AUTHORIZED ACTION → VERIFY, and AUTHORIZED ACTION cannot start before the prompt shows Allow.
- **`DemoShowcase`** (server) — the home "creation engine" chapter; mounts Website Builder, Code and Automation inline; the other six open from `FeatureDetail`.

### D.9 Trust, CTA, Footer

- **`TrustSection`** (server; §21) — `SceneChapter id="calm" formation="calm" palette="graphite" intensity={0.15} motion={0.1}`; "POWER WITH CONTROL."; `TrustPillar` × 6 (PERMISSIONS, PRIVACY, VERIFICATION, USER APPROVAL, SECURITY, TRANSPARENCY) in 3×2 / 1-column; the only motion is a line reveal and one `ShakirBeam path="surface" glow={0}` pass on enter.
- **`FinalCTA`** (client, pinned 300 vh; §30) — `scene.collapse(logoRect, 2400)` reduces the field 1 400 → ~400 → ~40 → 1 with grouped folding; the official `Logo xl` cross-fades in at the exact target rect; "WHAT WILL YOU CREATE?", `Button` "ENTER SHAKIR", ghost "EXPLORE SHAKIR" (`/features`).
- **`Footer`** (server; §31) — `Logo variant="full" size="md"`, `FooterLinks` (Product, Features, Security, Privacy, Developers, Pricing, Contact), `MotionToggle`, legal line with `Logo variant="mono" size="xs"`. No beam, no geometry.

### D.10 UI, icons, providers

- `components/ui/`: `Button` (`variant: 'primary'|'ghost'|'link'`, `beam?: boolean`, `href`), `Dialog` (Radix wrapper), `Container` (max 1 280 / 1 440 / 1 600 px at lg/xl/2xl), `Section` (`<section aria-labelledby>`), `Eyebrow`, `Heading`, `VisuallyHidden`, `LiveRegion`.
- `components/icons/feature/` — 21 unique faceted line icons (24 px grid, 1.5 px stroke), `components/icons/ui/` — 10 glyphs.
- **`MotionProvider`** (client) — the single source of motion truth (§27–§28):
```ts
interface MotionContextValue {
  profile: PerformanceProfile;                 // REDUCED_MOTION overrides everything
  reducedMotion: boolean;                      // prefers-reduced-motion OR MotionToggle
  setMotionPreference(p: 'system' | 'reduced' | 'full'): void;
  downgrade(reason: string): void;             // one-way HIGH → MEDIUM → LOW, never upgrades (no flicker)
  gsapReady: boolean;
}
```
Registers plugins once (`lib/gsap.ts`), `gsap.defaults({ ease: 'shakir.out', duration: 0.8 })`, `ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true })`, refreshes ScrollTrigger after `document.fonts.ready` and after the intro completes, writes `data-profile` / `data-motion` on `<html>` for CSS.

### D.11 Hooks — `hooks/`

```ts
useReducedMotion(): boolean                                   // media query + toggle, SSR-safe (server snapshot false)
useScrollProgress(target: RefObject<Element>, opts?: { start?: string; end?: string; onUpdate?(p: number): void }): { progress: RefObject<number>; trigger: ScrollTrigger | null }   // ref, not state: zero rerenders per frame
useScrollProgressState(target, opts?): number                 // quantised to 0.01, for UI that must render
usePerformanceProfile(): PerformanceProfile                  // from MotionProvider; detection in lib/performance/profile.ts
useGsap(cb: (ctx: gsap.Context) => void | (() => void), deps: DependencyList, scope?: RefObject<HTMLElement>): { contextSafe }   // wraps @gsap/react useGSAP: gsap.context + ctx.revert() on unmount/deps change
useIntroSeen(): { seen: boolean; markSeen(): void; reset(): void }   // sessionStorage 'shakir.intro.v1', ?intro=1 override, server snapshot true
useSceneChapter(def: SceneChapterDef): RefCallback<HTMLElement>      // registers with SceneController
usePointerParallax(strength: number, enabled: boolean): RefObject<Point>   // quickTo-smoothed, 80 ms
useBeam(): ShakirBeamHandle                                   // imperative beam control for parents
useDemoTimeline(steps: DemoStep[], mode: DemoMode): { index: number; goTo(i): void; play(): void; pause(): void; tl: gsap.core.Timeline | null }
useRovingTabIndex(groupRef, { orientation: 'grid'|'row' })    // FeatureUniverse keyboard model
useFrameMonitor(onSlow: () => void)                           // rolling 120-frame avg > 20 ms for 2 s → onSlow
useMediaQuery(query: string): boolean · useInView(ref, margin) · useLockBodyScroll(active) · useIsomorphicLayoutEffect
```
Profile detection: `hardwareConcurrency ≥ 8 && deviceMemory ≥ 8 && !saveData && width ≥ 1024` → HIGH; `cores ≥ 4 && memory ≥ 4` → MEDIUM; else LOW; then a 500 ms idle rAF probe demotes one step if > 4 of 30 frames drop.

### D.12 Data model — `data/`

```ts
// data/features.ts
type WorldId = 'CREATE' | 'LEARN' | 'BUILD_GROW' | 'ACT' | 'TRUST' | 'HUMAN' | 'CORE';   // CORE = CHAT + SHAKIR ONE
type FeatureId = 'chat'|'study'|'skill'|'research'|'image'|'code'|'website-builder'|'video'|'video-search'|'writing'
  |'truth-verify'|'business'|'goal-to-action'|'agent'|'medical'|'offline'|'privacy'|'human-talent'|'marketing'|'automation'|'live';
interface Feature {
  id: FeatureId; slug: string; name: string; order: 1|2|…|21; world: WorldId;
  blurb: string;              // ≤ 90 chars, hover/focus
  longDescription: string;    // ≤ 400 chars, detail — §29: capability statements, no superlatives, no guarantees
  iconId: IconId;             // one of 21 unique icons
  connections: FeatureId[];   // 2–5 directed links; relatedTo(id) unions both directions
  demoComponent: DemoId | null;
}
export const features: readonly Feature[]; export const byWorld: Record<WorldId, Feature[]>; export function getFeature(slug): Feature | undefined;
```
| # | id | world | demo | connections |
|---|---|---|---|---|
| 01 | chat | CORE | chat | research, business, website-builder, marketing, goal-to-action |
| 02 | study | LEARN | — | skill, research, writing |
| 03 | skill | LEARN | skill | study, video, goal-to-action |
| 04 | research | LEARN | — | truth-verify, writing, business, study |
| 05 | image | CREATE | image | marketing, website-builder, video |
| 06 | code | CREATE | code | website-builder, automation, agent |
| 07 | website-builder | CREATE | website-builder | code, image, writing, business, marketing |
| 08 | video | CREATE | video | image, writing, marketing, skill |
| 09 | video-search | CREATE | — | video, research, study |
| 10 | writing | CREATE | — | research, business, marketing, website-builder |
| 11 | truth-verify | TRUST | — | research, medical, chat, code |
| 12 | business | BUILD_GROW | business | research, marketing, website-builder, goal-to-action, writing |
| 13 | goal-to-action | BUILD_GROW | — | business, agent, automation, skill |
| 14 | agent | ACT | — | automation, live, code, goal-to-action, privacy |
| 15 | medical | TRUST | — | truth-verify, research, privacy |
| 16 | offline | TRUST | — | privacy, chat |
| 17 | privacy | TRUST | — | offline, agent, live, medical |
| 18 | human-talent | HUMAN | — | business, goal-to-action, skill |
| 19 | marketing | BUILD_GROW | — | writing, image, video, business, website-builder |
| 20 | automation | ACT | automation | agent, code, goal-to-action, business |
| 21 | live | ACT | live | agent, privacy, truth-verify |

Video Search sits in CREATE beside Video for the same reason Image Search sits with Image. `data/worlds.ts` holds the 7 worlds (`id, label, palette, blurb, order`): CREATE violet→magenta · LEARN cyan→teal · BUILD & GROW amber→peach/gold · ACT electric blue · TRUST graphite + teal hint · HUMAN amber + soft magenta · CORE crown gold — every palette is sampled from the logo's facets.

```ts
// data/navigation.ts
interface NavItem { id: string; label: string; href: string; kind: 'anchor' | 'route' | 'external'; sceneId?: SceneId }
export const primaryNav: NavItem[] = [
  { id: 'one', label: 'Shakir One', href: '/#one', kind: 'anchor', sceneId: 'one' },
  { id: 'features', label: 'Features', href: '/#features', kind: 'anchor', sceneId: 'universe' },
  { id: 'trust', label: 'Trust', href: '/#trust', kind: 'anchor', sceneId: 'calm' },
  { id: 'pricing', label: 'Pricing', href: '/pricing', kind: 'route' },
];
export const ctas = { primary: { label: 'ENTER SHAKIR', href: env.NEXT_PUBLIC_APP_URL, external: true }, secondary: { label: 'EXPLORE FEATURES', href: '/#features' }, final: { label: 'EXPLORE SHAKIR', href: '/features' } };
export const footerLinks: NavItem[] = [Product → '/', Features → '/features', Security → '/security', Privacy → '/privacy', Developers → '/developers', Pricing → '/pricing', Contact → '/contact'];
```

## L. EXACT FILES TO CREATE

Milestone tags follow brief §33. Tests accrue with the milestone that creates the code they cover; M10 completes e2e, a11y and Lighthouse gates. Package manager pnpm, Node 22 LTS.

### L.0 Repository moves (M1, first commit)
```
git mv index.html prototypes/aurelia/index.html
git mv assets     prototypes/aurelia/assets
git mv README.md  prototypes/aurelia/README.md      # header line added: "Archived prototype — unrelated to SHAKIR AI"
brand/shakir-logo-source.png                         # stays: source of truth, never served, never edited
```
`prototypes/` is excluded from `tsconfig`, ESLint, Prettier, Tailwind `@source` and Vitest.

### L.1 Root / config
```
README.md                      — Shakir site: stack, commands, folder map, link to brief and plan            [M1]
CLAUDE.md                      — to be created: stack + commands; rules: GSAP only via animations/ + useGsap; server-by-default; never touch brand/shakir-logo-source.png or redraw the mark; quality gate = §32 list; milestone evidence format   [M1]
package.json                   — scripts: dev, build, start, typecheck, lint, format, test, test:component, test:e2e, test:a11y, lhci, analyze, check:logo   [M1]
pnpm-lock.yaml · .nvmrc (22) · .editorconfig · .gitignore · .env.example (NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_APP_URL)   [M1]
next.config.ts                 — images (avif, webp; device sizes 390…1920), reactStrictMode, bundle analyzer when ANALYZE=1, headers (CSP, COOP)   [M1]
tsconfig.json                  — strict, noUncheckedIndexedAccess, @/ → src/*, excludes prototypes/      [M1]
postcss.config.mjs             — @tailwindcss/postcss                                                    [M1]
tailwind.config.ts             — NOT created: Tailwind v4 is CSS-first; its role is played by src/styles/tokens.css (@theme). Recorded here so nobody adds one.   [M1]
eslint.config.mjs              — next/core-web-vitals, jsx-a11y strict, @typescript-eslint; no-restricted-imports fences gsap to lib/gsap.ts, animations/**, hooks/useGsap.ts, components/low-poly/**   [M1]
.prettierrc · .prettierignore  — prettier-plugin-tailwindcss                                             [M1]
vitest.config.ts               — jsdom, setup files, coverage thresholds (lib 90 %, hooks 85 %, components 70 %), excludes e2e   [M1]
playwright.config.ts           — projects: desktop-chromium 1440×900, laptop 1280×800, tablet iPad 768, mobile-safari iPhone 14, large 1920×1080, reduced-motion (chromium + emulate reduce), slow-cpu (4× throttle)   [M1 skeleton, M10 complete]
lighthouserc.cjs               — lhci autorun on `next start`; URLs: /, /features, /features/chat; mobile preset; budgets: perf ≥ 90, a11y = 100, LCP ≤ 2.0 s, CLS ≤ 0.05, TBT ≤ 200 ms, home JS ≤ 250 KB gz   [M1 skeleton, M10 enforced]
docs/asset-requests.md         — client asset list: transparent 1024² mark without watermark, SVG mark, 512 favicon crop, Image AI gallery images ×4, Video AI 720p clip + poster, final nav/footer URLs, secondary-page copy   [M1]
.github/workflows/ci.yml       — jobs: quality (typecheck, lint, prettier, check:logo) → test (vitest + coverage) → build (next build, upload .next) → e2e (Playwright image, all projects) → lighthouse (lhci on built output)   [M1 skeleton, M10 full]
.github/PULL_REQUEST_TEMPLATE.md — milestone evidence checklist (§33: tests, build, visual review at 5 viewports, reduced motion, slow device)   [M1]
scripts/check-logo-integrity.ts — asserts sha256 + 1:1 dimensions of public/brand/shakir-mark.png match brand/manifest.json; fails CI if the mark was altered (§02)   [M1]
scripts/measure-scene.ts       — Playwright + CDP: fps / long tasks per chapter on each profile, prints table for milestone evidence   [M3]
```

### L.2 `src/app/`
```
layout.tsx                     — <html lang> fonts, AppProviders, IntroGateScript, SkipLink, SiteHeader, {children}, {modal}, Footer   [M1]
page.tsx                       — home: SceneController + chapters in D.1 order                            [M2 → grows through M8]
loading.tsx                    — LoadingMark (§02 loading experience)                                     [M2]
not-found.tsx · error.tsx · global-error.tsx — graphite pages with Logo mark, no geometry                 [M1]
@modal/default.tsx             — returns null                                                              [M6]
@modal/(.)features/[slug]/page.tsx — intercepting route → FeatureDetailModal                              [M6]
features/page.tsx              — index of 21 features by world (FeatureList + links), target of "EXPLORE SHAKIR"   [M6]
features/[slug]/page.tsx       — FeatureDetail; generateStaticParams (21); generateMetadata                 [M6]
(site)/security|privacy|developers|pricing|contact/page.tsx — thin server pages, copy supplied by client (§29)   [M8]
sitemap.ts · robots.ts · manifest.ts — generated metadata                                                 [M1]
opengraph-image.tsx            — 1200×630: official mark (400 px) on graphite + wordmark; uses the asset, not a redraw   [M2]
icon.png (512) · apple-icon.png (180) — client-supplied square crops of the mark                            [M1 (pending asset)]
```

### L.3 `src/components/`
```
brand/        Logo.tsx [M1] · Wordmark.tsx [M1] · LogoLightSweep.tsx [M2] · ShakirBeam.tsx [M2] · LoadingMark.tsx [M2]
navigation/   SiteHeader.tsx · NavBar.tsx · NavLink.tsx · MobileMenu.tsx · SkipLink.tsx [M2] · MotionToggle.tsx [M8]
hero/         Hero.tsx · HeroHeadline.tsx · HeroSupport.tsx · HeroCtas.tsx · HeroScrollCue.tsx [M2]
low-poly/     LowPolyScene.tsx [M3] · SceneController.tsx [M4] · SceneChapter.tsx [M4] · IntroSequence.tsx [M2 v1: logo/text/beam; M3: fragment phases] · IntroGateScript.tsx [M2] · FacetPanel.tsx [M3]
features/     FeatureUniverse.tsx · FeatureWorld.tsx · FeatureNode.tsx · FeatureConnections.tsx · FeatureList.tsx · FeatureDetail.tsx · FeatureDetailModal.tsx · FeatureIcon.tsx [M6]
features/one/ ShakirOne.tsx · OneCore.tsx · OneNode.tsx · OneConnections.tsx · OnePipeline.tsx [M5]
demonstrations/ registry.ts · DemoFrame.tsx · DemoStepper.tsx · DemoCaption.tsx · DemoShowcase.tsx [M7]
  ChatDemo.tsx + chat/ChatTranscript.tsx, chat/CapabilityActivation.tsx                                   [M7]
  WebsiteBuilderDemo.tsx + website-builder/PromptBar.tsx, BuildStages.tsx, DeviceFrame.tsx, MiniSite.tsx   [M7]
  ImageDemo.tsx + image/ParticleFormation.tsx, image/Gallery.tsx                                           [M7]
  VideoDemo.tsx + video/TimelineRail.tsx, video/LazyVideo.tsx                                              [M7]
  CodeDemo.tsx + code/CodePane.tsx, TestRunner.tsx, ErrorCallout.tsx, FixDiff.tsx, PreviewPane.tsx         [M7]
  SkillDemo.tsx + skill/VideoPanel.tsx                                                                     [M7]
  BusinessDemo.tsx + business/DataViz.tsx                                                                  [M7]
  AutomationDemo.tsx + automation/WorkflowCanvas.tsx, WorkflowNode.tsx                                     [M7]
  LiveDemo.tsx + live/LiveIndicator.tsx, live/PermissionPrompt.tsx                                         [M7]
trust/        TrustSection.tsx · TrustPillar.tsx [M8]
cta/          FinalCTA.tsx [M8]
footer/       Footer.tsx · FooterLinks.tsx [M8]
ui/           Button.tsx · Dialog.tsx · Container.tsx · Section.tsx · Eyebrow.tsx · Heading.tsx · VisuallyHidden.tsx · LiveRegion.tsx [M1]
icons/        feature/*.tsx (21 files, one per iconId) · ui/*.tsx (ArrowRight, Close, Menu, Play, Pause, SkipForward, Check, Alert, Lock, Eye) · index.ts [M6; ui glyphs M1]
providers/    AppProviders.tsx · MotionProvider.tsx [M1]
```

### L.4 `src/animations/`
```
eases.ts                       — CustomEase 'shakir.out' (0.2,0.8,0.2,1), 'shakir.inOut', duration tokens 120/240/480/800/1400 ms   [M1]
types.ts                       — SceneId, Formation, timeline factory types                                  [M4]
timelines/introTimeline.ts     — the 3.2 s phase table from D.5                                              [M2]
timelines/heroTimeline.ts      — headline/support/CTA entrance after intro handoff                           [M2]
timelines/logoRevealTimeline.ts — emerge + light sweep, reused by ShakirOne and FinalCTA                     [M2]
timelines/shakirOneTimeline.ts — 5-phase scrubbed timeline                                                   [M5]
timelines/featureUniverseTimeline.ts — world assembly order + connection draw                                [M6]
timelines/demoTimelines.ts     — factory: DemoStep[] → scrubbable/autoplay timeline with labels per step      [M7]
timelines/finalCtaTimeline.ts  — collapse → logo → headline                                                   [M8]
scroll/scenes.ts               — homeChapters: SceneChapterDef[] (the single table of chapters, pins, palettes)   [M4]
scroll/createSceneTrigger.ts   — ScrollTrigger factory with overlap transition rule                            [M4]
scroll/pinSection.ts           — pin helper with mobile length + REDUCED_MOTION bypass                         [M4]
scroll/scrubTimeline.ts        — binds a timeline to a trigger, scrub 0.6                                      [M4]
transitions/sceneTransition.ts — formation-to-formation ease curves + stagger maps                             [M4]
transitions/maskReveal.ts · depthZoom.ts · textReveal.ts (SplitText lines, auto-revert)                       [M4]
transitions/routeTransition.ts — modal open/close 240 ms, View Transitions API when available                  [M6]
beam/beamPath.ts               — surface-trace path builder, node-to-node curves                               [M2]
beam/beamTimeline.ts           — DrawSVG + MotionPath driver for ShakirBeam                                     [M2]
beam/beamPresets.ts            — trace / flow / connect / sweep / pulse parameters                              [M2, flow+connect M4]
reduced-motion/motionPreferences.ts — media query + toggle resolver                                            [M1]
reduced-motion/staticFrames.ts — renders each Formation once to an offscreen canvas for cross-fade              [M3]
reduced-motion/reducedTimelines.ts — fade-only equivalents of every timeline (same labels)                     [M4]
```

### L.5 `src/data/`
```
site.ts          — headlines, support line, CTA labels, Shakir One message, trust headline, final headline (§05, §09, §21, §30)   [M2]
navigation.ts    — primaryNav, ctas, footerLinks (D.12)                                                [M2]
features.ts      — 21 Feature entries (D.12), byWorld, getFeature, relatedTo                            [M6]
worlds.ts        — 7 worlds with palette + blurb                                                        [M5]
feature-universe-layout.ts — node positions per breakpoint (desktop ring, tablet ring, mobile clusters)   [M6]
one-pipeline.ts  — 7 pipeline steps                                                                     [M5]
trust.ts         — 6 pillars with one-sentence descriptions (§29-safe)                                  [M8]
demos/chat.ts · website-builder.ts · image.ts · video.ts · code.ts · skill.ts · business.ts · automation.ts · live.ts — DemoStep[] + copy per demo   [M7]
```

### L.6 `src/hooks/`
```
useReducedMotion.ts · usePerformanceProfile.ts · useGsap.ts · useMediaQuery.ts · useIsomorphicLayoutEffect.ts   [M1]
useIntroSeen.ts · usePointerParallax.ts · useBeam.ts · useLockBodyScroll.ts                                     [M2]
useFrameMonitor.ts · useInView.ts                                                                                [M3]
useScrollProgress.ts · useSceneChapter.ts                                                                        [M4]
useRovingTabIndex.ts                                                                                             [M6]
useDemoTimeline.ts                                                                                               [M7]
```

### L.7 `src/lib/`
```
gsap.ts                    — registers ScrollTrigger, DrawSVG, MotionPath, SplitText, Flip, CustomEase once; exports gsap   [M1]
cn.ts · env.ts (zod-validated NEXT_PUBLIC_*) · constants.ts (breakpoints 640/768/1024/1440/1920, z-index, durations) · seo.ts (metadata builder) · fonts.ts (next/font/local, families per design system, two max)   [M1]
lowpoly/types.ts · budgets.ts · rng.ts (mulberry32) · noise.ts (simplex) · geometry.ts (Poisson + delaunator) · palette.ts · shading.ts (normal·light + beam point light) · renderer-canvas2d.ts · scene-state.ts (morph + stagger) · frame-loop.ts (gsap.ticker binding, visibility pause) · silhouette.ts · index.ts   [M3]
lowpoly/formations/void.ts · points.ts · fragments.ts · terrain.ts · network.ts · interface.ts · universe.ts · engine.ts · one.ts · calm.ts · collapse.ts · mark.ts   [M3; universe/one/engine/collapse tuned in M5–M8]
performance/profile.ts (detectProfile) · frame-monitor.ts · web-vitals.ts (useReportWebVitals → console in dev) · idle.ts   [M1; frame-monitor M3]
a11y/announce.ts · focus.ts                                                                                                    [M1]
```

### L.8 `src/styles/`
```
globals.css      — @import "tailwindcss"; @source excludes prototypes; base, body background graphite, focus ring 2 px soft white offset 2 px   [M1]
tokens.css       — @theme: colors (near-black #0A0A0C, graphite #141418, charcoal #1E1E24, soft white #F2F1EE, electric blue, violet, cyan, teal, soft magenta, warm amber, peach/gold), fonts, eases, durations, breakpoints, z-index   [M1]
typography.css   — display/body scales, tracking, measure 62ch                                                                     [M1]
motion.css       — [data-motion="reduced"] kill-switches, [data-intro="pending"] hero hidden, @media (prefers-reduced-motion)        [M1]
```

### L.9 `src/assets/` and `public/`
```
src/assets/fonts/*.woff2          — self-hosted families (next/font/local)                                      [M1]
public/brand/shakir-mark.png      — client-supplied transparent 1024² mark, no watermark (hash recorded in brand/manifest.json)   [M1 pending asset; M2 gate]
public/brand/shakir-mark.svg      — client-supplied vector, if available; enables per-facet beam pass later       [asset request]
public/brand/README.md            — usage rules: never edit, never redraw, sizes, clear space                     [M1]
brand/manifest.json               — sha256 + dimensions of the served mark for check-logo-integrity              [M1]
public/media/image-demo/variation-01…04.avif (+ .webp) — client/licensed images                                 [M7, asset request]
public/media/video-demo/preview-720.mp4 · preview-720.webm · poster.jpg — ≤ 1.5 MB, 6 s                          [M7, asset request]
```

### L.10 Tests
```
tests/setup/vitest.setup.ts · gsap.mock.ts · canvas.mock.ts (vitest-canvas-mock) · matchMedia.ts · observers.ts · test-utils.tsx (render with AppProviders + profile override)   [M1]
tests/fixtures/features.fixture.ts                                                                                [M6]
unit/   lib/lowpoly/geometry · rng · noise · palette · formations (same vertex count for all 12) · budgets         [M3]
        lib/performance/profile (matrix of device signals → profile)                                              [M1]
        lib/constants.css-sync (breakpoints in constants.ts === tokens.css)                                       [M1]
        animations/beam/beamPath · animations/scroll/scenes (chapters contiguous, pins have mobile lengths)        [M2, M4]
        data/features (21 entries, unique slug/order/iconId, connections resolve, every world non-empty, demoComponent ∈ registry, blurb ≤ 90, longDescription contains none of the §29 banned phrases) · data/navigation (hrefs valid, 7 footer links)   [M6]
        hooks/useIntroSeen · useReducedMotion · usePerformanceProfile · useScrollProgress                          [M2–M4]
component/ Logo (variants, sizes, alt, aspect, mono mask) · Button (beam fires once) · NavBar · MobileMenu (focus trap) · IntroSequence (gate, skip keys, reduced path, Flip handoff) · LowPolyScene (mounts canvas per profile, pauses when hidden, cleans up) · SceneController (chapter registration/unregistration) · ShakirBeam (presets, repeat cap) · ShakirOne (phases by progress) · FeatureUniverse (roving tabindex, arrows, Enter/Escape, lit connections) · FeatureDetail · DemoStepper + each of 9 demos (steps render, live region announces) · TrustSection · FinalCTA · Footer · MotionProvider (downgrade is one-way)   [with each milestone]
e2e/    home.spec (intro plays once per session, Escape skips, hero visible, no CLS > 0.05) · scroll-journey.spec (chapters activate in order, nav active state) · one.spec · features.spec (click, keyboard, deep link /features/code, modal vs page) · demos.spec · reduced-motion.spec · mobile.spec (no horizontal overflow at 375) · slow-cpu.spec (profile downgrades to LOW, page stays usable) · visual.spec (toHaveScreenshot at 375/768/1280/1440/1920 per chapter)   [M10, skeleton M2]
a11y/   axe.spec (every route + each pinned chapter state, zero serious/critical) · focus.spec (full tab order, visible focus on every control) · contrast.spec (text over scene at intensity 0.6 and 0.15)   [M10, skeleton M2]
```
## H. DESKTOP EXPERIENCE

Scene order used throughout H and I follows brief §06 (hero → fracture → network → interface → feature universe → creation engine → Shakir One → trust → final CTA). Scenes are keyed by name, so if section C reorders them, nothing in H/I changes except the running order.

### H.1 Viewport classes, grid and containers (shared with I)

Tailwind `screens` (exact, used everywhere; `xs` is the default/no-prefix range):

| Name | Width | Typical devices | Pointer rule |
|---|---|---|---|
| `xs` | 0–479 px | phones 320–430 | coarse |
| `sm` | 480–767 px | large phones, foldables, phone landscape | coarse |
| `md` | 768–1023 px | tablet portrait (768, 820, 834) | coarse |
| `lg` | 1024–1279 px | tablet landscape (1024, 1180, 1194), 125 %-zoomed laptops | coarse → tablet rules; fine → "laptop-lite" (desktop composition at `lg` sizes) |
| `xl` | 1280–1439 px | laptops 1280×720/800, 1366×768 | fine |
| `2xl` | 1440–1919 px | desktop reference 1440×900, 1536×864 | fine |
| `3xl` | 1920–2559 px | 1920×1080, 2048×1152 | fine |
| `uw` | ≥ 2560 px | 2560×1080/1440, 3440×1440, 5120×1440 | fine |

Non-width variants: `short` = `@media (max-height: 820px)` (laptop vertical squeeze), `landscape-phone` = `(orientation: landscape) and (max-height: 500px)`, `pointer-fine` = `(hover: hover) and (pointer: fine)`, `pointer-coarse` = `(hover: none) and (pointer: coarse)`. Interaction behaviour keys off pointer variants, never off width; layout keys off width.

Containers and grid: `xs/sm` 100 % − 32 px (16 px gutters, 4 columns, 16 px gap); `md` 100 % − 64 px (8 columns, 20 px gap); `lg` 100 % − 96 px (12 columns, 24 px gap); `xl` 1152 px; `2xl` 1280 px; `3xl` 1440 px (12 columns, 32 px gap); `uw` 1536 px. The LowPolyScene environment is always full-bleed (`width: 100%`, never `100vw`, `overflow-x: clip` on `body`); story content lives inside the container. Nav height: 72 px (`2xl`+), 64 px (`xl`, `md`, `lg`, `short`), 56 px (`xs/sm`).

Type scale (stepped per breakpoint, fixed inside a breakpoint so pinned scenes can measure text; rem-based, root 16 px):

| Token | `uw` | `3xl` | `2xl` | `xl` / `short` | `lg` | `md` | `xs/sm` | Line-height / tracking |
|---|---|---|---|---|---|---|---|---|
| `display-xl` (hero headline) | 104 | 96 | 88 | 72 | 64 | 56 | 40 (36 at ≤ 360) | 0.95 / −0.02em, uppercase |
| `display-l` (scene headlines) | 88 | 80 | 64 | 56 | 52 | 44 | 34 | 0.98 / −0.015em |
| `title-l` | 48 | 48 | 40 | 36 | 34 | 30 | 26 | 1.1 |
| `title-m` | 32 | 32 | 28 | 26 | 24 | 22 | 20 | 1.15 |
| `body-l` | 22 | 22 | 20 | 19 | 18 | 18 | 17 | 1.5, max 60ch (36ch on phone) |
| `body-m` | 18 | 18 | 17 | 16 | 16 | 16 | 16 | 1.5 |
| `label` | 14 | 14 | 13 | 13 | 13 | 12 | 12 | 1.2 / +0.12em, uppercase |
| `mono` (code, timecodes) | 14 | 14 | 13 | 13 | 13 | 12 | 12 | 1.45 |

The hero headline is set on three lines everywhere ("ONE INTELLIGENCE." / "LIMITLESS" / "POSSIBILITIES.") so "POSSIBILITIES." (≈ 0.62 em per glyph × 14) fits 8 columns at every size: 764 px at 88 px, 833 px at 96 px, 625 px at 72 px.

### H.2 Pinned-scene mechanics on desktop

- Every pinned scene is a `<section>` of `height: 100svh` (identical to `100vh` on desktop; one unit everywhere) with a CSS-grid stage inside; SceneController creates one ScrollTrigger per scene: `pin: true, pinSpacing: true, anticipatePin: 1, scrub: 0.6, invalidateOnRefresh: true, fastScrollEnd: true, preventOverlaps: 'scene'`, `start/end` given as functions so refresh re-measures. No smooth-scroll library and no `normalizeScroll`: native wheel/trackpad scroll, GSAP scrub smoothing only (0.6 s gives the "scrubbed film" weight without hijacking).
- Scene lengths are expressed as `end: '+=NNN%'` of viewport height (table in H.4). Only FeatureUniverse snaps (`snap: { snapTo: 1/6, duration: { min: 0.2, max: 0.6 }, ease: 'power1.inOut', delay: 0.1 }`); every other scene is free-scrub so the page never fights the user.
- The environment is one `position: fixed; inset: 0` LowPolyScene canvas behind the whole page; SceneController maps each scene's progress to `LowPolyScene.setState(sceneKey, progress)`. DOM content of adjacent pinned scenes crossfades over the last 10 % / first 10 % of their scrubs so there is never a hard cut; the geometry carries continuity (brief §06).
- Nav stays visible during pins (hiding it mid-scrub fights the user) but compacts from 72 px to 56 px after 120 px of scroll; its bottom hairline is traced once by ShakirBeam (300 ms) when a new scene becomes active (brief §08 "indicate activity", never a permanent glow).
- Pointer parallax is a `quickTo`-driven offset on three depth layers of LowPolyScene (far ±12 px, mid ±24 px, near ±40 px, near-layer tilt ±1.5°), 0.8 s `power3.out`; facets whose normal faces the pointer gain up to +18 % luminance (the "light source follows the hand"). Intensity scales 1.0 at HIGH, 0.5 at MEDIUM, 0 at LOW/REDUCED_MOTION.
- Buttons: magnetic pull ±6 px within a 48 px radius (`pointer-fine` only); hovering the primary CTA makes ShakirBeam trace the button outline once in 600 ms, not on loop. No custom cursor (the Aurelia prototype's custom cursor and film grain are not carried over; restraint, brief §01).
- Text over geometry on desktop uses LowPolyScene `quietZones` (array of container-relative rects where facet luminance variance drops to ≤ 12 % and saturation −40 %) plus a 0.35-opacity scrim under display text as insurance (full scrim spec in I.8).

### H.3 Scene-by-scene at 1440×900 (reference), with 1920×1080, ultrawide and laptop deltas

**Nav**: logo mark (the crowned hand) 36 px tall + wordmark, links Features · Shakir One · Security · Pricing · Developers, right-aligned "ENTER SHAKIR" 44 px button. Transparent over the hero; graphite at 72 % opacity with a 1 px hairline after 80 px of scroll.

**S0 IntroSequence (brief §04)**: full-viewport overlay (`100dvh`) drawn into the same fixed LowPolyScene canvas as the hero, so the intro's final state is the hero's initial state (no second canvas, no handoff flash). Desktop timeline 3.2 s: 0–0.4 s points of light (400 at HIGH); 0.4–1.4 s 320 fragments emerge and assemble; 1.4–2.0 s environment forms; 2.0–2.4 s ShakirBeam crosses; 2.4–2.9 s logo (512 px raster of the client's transparent file, never redrawn) emerges at viewport center at 480 px tall and light passes over it; 2.9–3.2 s "SHAKIR AI" label appears, then the logo FLIPs to its hero position (right column) over 500 ms. Skip: `Esc`, click, or the "Skip" button (bottom-right, 48 px); `sessionStorage['shakir.intro.seen'] = '1'` prevents replay on in-app navigation. 1920×1080: identical timing, logo 560 px. `short`: logo 360 px.

**S1 Hero (brief §05)**: 12-column grid, container 1280. Columns 1–8: `label` "SHAKIR AI", `display-xl` 88 px headline on three lines (252 px tall), `body-l` support line, CTA row (primary filled 52 px, secondary ghost 52 px, 16 px gap). Columns 9–12: logo 460 px tall (hand aspect ≈ 1:2, so ≈ 230 px wide), bottom-aligned with the CTA row baseline. Content block ≈ 420 px, vertically centered in the 828 px below the nav. Scroll cue: a 1 px, 40 px tall ShakirBeam tick 40 px above the bottom edge, pulsing every 2.4 s. Pinned `+=120%`: 0–30 % headline/CTAs rise 24 px and fade; 30–60 % logo shrinks and FLIPs into the nav logo slot (nav logo hidden until it arrives); 60–100 % the mountain ridge begins to fracture (hand-off to S2). 1920×1080: container 1440, headline 96 px, logo 560 px. `uw`: container 1536, headline 104 px, logo capped 640 px; the environment widens its field (average facet edge 96 px vs 64 px at `2xl`) rather than adding facets (H.5). `short` laptop (1366×768, 1280×720): headline 72 px, logo 340 px (300 px at 720 tall), block 360 px, CTA row 48 px.

**S2 Fracture → Network (brief §06 "mountain → fragments → AI network")**: pinned `+=200%`. Single statement centered, `title-l` 40 px, max 20ch: "Shakir is not a collection of tools. / It is one system." 0–40 % the 1,200-facet ridge breaks into 400 fragments; 40–75 % fragments drift and settle into a 48-node / 90-edge network; 75–100 % ShakirBeam travels the edges. Pointer: fragments repel softly within 160 px (force 0.15) at HIGH only; keyboard/no-pointer gets the same scene without repel. `uw`: the network graph is laid out inside a 1920 px stage centered; beyond it facets continue at reduced contrast. `short`: no change.

**S3 Chat AI (brief §12, "network becomes product interface")**: pinned `+=250%`. Left columns 1–6: chat panel max 560 × 520 px (graphite 80 %, 1 px hairline, 16 px radius), `body-m` 17 px messages, `label` 13 px meta. Right columns 7–12: activation constellation of five nodes (Research → Business → Website Builder → Content Creator → Goal-to-Action) 56 px each along a ShakirBeam path. Scrub: 0–20 % the user message types in; 20–35 % "Shakir understands" (beam traces the panel outline once); 35–85 % nodes activate in order with the beam; 85–100 % the reply appears. Hover a node: one-line tooltip (what it contributed) 240 px wide; nodes are focusable with the same tooltip on focus. 1920×1080: panel 600 × 560. `short`: panel height `min(520px, 58svh)` = 418 px at 720.

**S4 FeatureUniverse (brief §10–11)**: pinned `+=300%` with snap per world (six 50 % segments: CREATE, LEARN, BUILD & GROW, ACT, TRUST, HUMAN). Constellation centered on the viewport; hub node (CHAT + SHAKIR ONE, 96 px, logo mark inside) at center; constellation radius `R = min(0.42·svh, 0.28·vw, 420px)` → 378 px at 900 tall, 420 px at 1080. World anchors 64 px, feature nodes 44 px (56 px hit area), 21 nodes in six clusters. Each segment pans/scales the constellation (1.15×) toward the focused world and dims the others to 40 %; the focused world's node names show as `label` 13 px, others on hover only. Hover/focus: polygon expands 1 → 1.18 in 320 ms `power2.out`, name `title-m` 28 px + one-line `body-m` description in a 320 px card 16 px from the node, connected capabilities illuminate (edge stroke 1 → 2 px + glow at HIGH; stroke only at MEDIUM). Click/Enter opens S5. Left rail (columns 1–2): vertical index of the six worlds in `label` 13 px, current world lit, click scrolls to that segment. `uw`: R stays capped at 420 px so the constellation never spreads across 3440 px; the beam still travels edge to edge to use the width. `short`: R = 302 px at 720 tall; rail labels hide and become dots.

**S5 Feature detail (brief §11)**: an intercepted parallel route (`/features/[slug]`) rendered as a modal 1120 × `min(720px, 80svh)`, two columns: left visual demonstration (a local LowPolyScene at `density 0.4`, `interactive false`), right `title-l` 40 px, `body-l` 20 px, "Works with" chips (connected capabilities), CTA. `Esc`/backdrop closes; the pinned scene keeps its progress because the overlay never alters layout. Deep links open the same page unpinned at `/features/[slug]`.

**S6 Website Builder (brief §13)**: pinned `+=250%`. Prompt bar centered, max 720 px, at 0–15 % ("Build a luxury architecture website."); main stage a browser frame with `height: min(620px, 62svh); aspect-ratio: 16/10` (1040 × 620 at 1440×900; 1120 × 700 at 1920×1080; 714 × 446 at 1280×720). 15–85 %: design-system swatches → components → images → copy → animations, each as a masked reveal; 85–100 % the frame splits into desktop 640 / tablet 280 / mobile 160 side by side (24 px gaps). Beam connects the three previews once at 100 %.

**S7 Image AI (brief §14)**: flow section (120 vh), entry timeline triggered at 30 % visibility, not scrubbed. Columns 1–4 text; columns 5–12 a 3-up gallery (each 400 × 400 at `2xl`, 448 at `3xl`). Sequence: text → 300 facet particles → image forms through a 24-point `clip-path` polygon mask animating from facets to a full rectangle. Hover: 1.03 scale + ShakirBeam frame trace 400 ms.

**S8 Video AI (brief §15)**: flow (110 vh). Horizontal rail 1040 px wide, five stage cards 184 px (IDEA → SCRIPT → STORYBOARD → SCENES → VIDEO); the VIDEO card holds a 640 × 360 lazily loaded, muted, looping clip with poster. Beam runs the rail on entry (1.8 s).

**S9 Code AI (brief §16)**: pinned `+=200%`. A 1120 × 600 panel (editor 56 % / terminal + preview 44 %), `mono` 13 px, 14 visible lines. Scrub steps at 0 / 15 / 35 / 50 / 65 / 80 / 100 %: prompt → code typed → test → error line (amber, never red neon) → fix diff → pass (teal) → preview. `short`: panel `min(600px, 60svh)`.

**S10 Skill AI (brief §17)**: flow (120 vh). Central skill node 160 px, seven low-poly video panels 220 × 124 on an ellipse rx 440 / ry 260, numbered 01–07 in `label`; staggered entry 80 ms; hover lifts 8 px; beam runs 01 → 07 once. `short`: ry 200.

**S11 Business AI (brief §18)**: pinned `+=200%`. A 1040 px stepper (eight stages, `label` 13 px) above a single 1040 × 420 visualization that morphs through eight states, 25 % of scrub each; data visualizations use two accent hues max per state.

**S12 Automation AI (brief §19)**: flow (110 vh). Six nodes 160 × 88 in a row (TRIGGER → CONDITION → ACTION → ACTION → VERIFY → COMPLETE) joined by ShakirBeam, which flows left to right in 1.8 s on entry; hover/focus shows a node's two config lines.

**S13 Live AI (brief §20)**: flow (120 vh). A laptop-style device frame 960 × 600 with a LIVE indicator (8 px dot + `label` "LIVE" in a calm red-amber) and an explicit permission dialog ("Allow Shakir to view this screen?" Allow / Deny) shown before anything is "seen"; five-step rail beneath (SEE → UNDERSTAND → GUIDE → AUTHORIZED ACTION → VERIFY).

**S14 ShakirOne (brief §09)**: pinned `+=300%`. Core: logo mark inside a faceted orb 280 px (320 px at `3xl`); ring 1 R 300 px: six world nodes 56 px; ring 2 R 440 px: 21 capability nodes 28 px (names on hover/focus). Headline "ONE SHAKIR." `display-l` 64 px in columns 1–5 top-left, message `body-l` beneath. Scrub: 0–25 % nodes appear; 25–50 % connections draw (`stroke-dashoffset`); 50–75 % light travels; 75–90 % all connect, core brightens; 90–100 % activation: the seven-step rail (USER REQUEST → SHAKIR ONE → UNDERSTAND → ROUTE → CREATE / RESEARCH / BUILD / ACT → VERIFY → RESULT) slides up as a 120 px strip at the bottom. `uw`: rings unchanged, stage centered. `short`: rings R 220 / 330, orb 220 px, headline overlays top-left, rail 88 px.

**S15 Trust (brief §21)**: flow (120 vh), deliberately unpinned. Environment drops to 240 static facets in cool graphite with one teal accent, `motion 0.2`, no beam. "POWER WITH CONTROL." `display-l` 64 px centered; six items in a 3 × 2 grid (360 × 200 cells, icon 32 px, `title-m` 28, `body-m` 17). Only focus rings move here.

**S16 Final CTA (brief §30)**: pinned `+=250%`. Facet count ramps 2,400 → 400 → 36 → 1 across 0–75 % (HIGH), the final single faceted symbol resolving into the logo at 360 px center (75–90 %); "WHAT WILL YOU CREATE?" `display-l` 64 px and the two CTAs settle at 90–100 %. 1920×1080: logo 420 px.

**S17 Footer (brief §31)**: flow, 240 px tall; logo mark 48 px, seven links in one row (`body-m`), hairline above, environment fully calm.

### H.4 Desktop scroll budget

| Scene | Mode | Length |
|---|---|---|
| S1 Hero | pinned | 100 vh + 120 % |
| S2 Fracture → Network | pinned | 200 % |
| S3 Chat AI | pinned | 250 % |
| S4 FeatureUniverse | pinned, snap /6 | 300 % |
| S6 Website Builder | pinned | 250 % |
| S7 Image AI | flow | 120 vh |
| S8 Video AI | flow | 110 vh |
| S9 Code AI | pinned | 200 % |
| S10 Skill AI | flow | 120 vh |
| S11 Business AI | pinned | 200 % |
| S12 Automation AI | flow | 110 vh |
| S13 Live AI | flow | 120 vh |
| S14 ShakirOne | pinned | 300 % |
| S15 Trust | flow | 120 vh |
| S16 Final CTA | pinned | 250 % |
| S17 Footer | flow | 30 vh |

Total ≈ 2,900 vh ≈ 29 screens (≈ 26,000 px at 900 px tall). Flow sections never exceed 120 vh so the page breathes between pins.

### H.5 Ultrawide (≥ 2560 px)

- Content container caps at 1536 px; the outer two grid columns stay empty "atmosphere". Demo frames never exceed 1120 px; the FeatureUniverse and ShakirOne stages are fixed-radius (H.3), the hero logo caps at 640 px.
- LowPolyScene density is defined per area (facets per 100k px²) with a hard cap at the profile maximum, so a 3440×1440 canvas gets larger facets (average edge 96 px) rather than more facets; facets outside a centered 1920 px stage render at −30 % contrast so the eye stays on the story. Render width is capped at 3440 CSS px centered; beyond that (32:9) the body gradient fills.
- ShakirBeam is the one element allowed to use the full width: scene-entry traces run edge to edge.
- Pinned scenes vertically center their stage; no letterboxing.

### H.6 Laptop case (1280–1439 px, and any `short` viewport)

- `short` (≤ 820 px tall) overrides regardless of width: nav 64 px, `display-xl` 72, section vertical padding −40 % (96 → 56 px), all demo panels `min(60svh, …)`, FeatureUniverse R 302 px at 720, ShakirOne rings R 220 / 330 and rail 88 px, Chat panel 418 px, Website Builder frame 714 × 446.
- 1440×900 at 125 % zoom (effective 1152×720) lands in `lg` with a fine pointer → laptop-lite: desktop composition at `lg` type sizes, desktop pointer interactions, profile by probe.
- Vertical rhythm is preserved by removing the hero scroll cue at ≤ 720 px tall and by letting the hero logo bottom-align to the CTA row rather than centering independently.

## I. MOBILE (AND TABLET) EXPERIENCE

### I.1 Device classes and profile assignment

Device class = width breakpoint (H.1) + pointer variant; no UA sniffing. Performance profile is chosen by SceneController at boot and can only be demoted during the session (never re-promoted, to avoid visible flicker):

| Class | Default profile | Promotion / demotion |
|---|---|---|
| Phone (`xs/sm`, coarse) | LOW | MEDIUM if `deviceMemory ≥ 6`, `hardwareConcurrency ≥ 6` and the 60-frame probe during the intro averages ≤ 18 ms |
| Tablet (`md/lg`, coarse) | MEDIUM | never HIGH on touch (battery/thermal); LOW if probe > 24 ms |
| Laptop/desktop (fine) | HIGH | MEDIUM if probe > 20 ms; runtime demotion after 3 s averaging > 24 ms |
| `saveData` / `prefers-reduced-data` | LOW | — |
| `prefers-reduced-motion` | REDUCED_MOTION | overrides everything |

Budgets per profile (LowPolyScene props `density`, `intensity`, `motion` derive from these):

| Budget | HIGH | MEDIUM | LOW | REDUCED_MOTION |
|---|---|---|---|---|
| Hero facets / particles | 1,200 / 400 | 600 / 180 | 280 / 60 | 240 static / 0 |
| Intro fragments | 320 | 180 | 90 | none (600 ms crossfade) |
| Fracture fragments | 400 | 200 | 60 | 3 stills crossfaded |
| Final CTA peak facets | 2,400 | 1,200 | 600 | crossfade to logo |
| ShakirOne nodes | 6 + 21 | 6 + 21 | 6 (world nodes only) | 6 + 21 static |
| Canvas DPR cap | 2 | 1.5 | 1 | 1 |
| Environment frame rate | 60 | 60 | 30 (own throttled rAF; GSAP ticker stays 60 for DOM) | on demand |
| ShakirBeam | 2 px + glow sprite | 2 px, no glow | 1.5 px + 4 px 18 %-opacity under-stroke | static accent line |
| Parallax intensity | 1.0 (pointer + scroll) | 0.5 | 0.25 (scroll only) | 0 |
| Simultaneous hues per scene | 4 | 4 | 3, saturation −15 % | 2 |
| Concurrent animations | unlimited within scene | active scene + 1 ambient | active scene only; ambient loops paused offscreen | none |

The hue limit at LOW is deliberate: on a 390 px screen facets are large relative to the viewport, so the desktop palette would read as rainbow overload (brief §01).

### I.2 Viewport units, address bar and ScrollTrigger refresh policy

- Pinned scenes: `height: 100svh` (smallest viewport). They never change height while the browser chrome shows/hides, so no pin jumps.
- The fixed LowPolyScene canvas is sized `100lvh` × `100%` once; the strip between `svh` and `lvh` (56–100 px on iOS Safari) is therefore always covered by environment, never by a gap. Height-only resizes never reallocate the canvas buffer.
- `100dvh` is used only where tracking the chrome is desirable: the intro overlay, the mobile menu, the feature-detail sheet.
- Fallback: `@supports not (height: 100svh)` → `height: calc(var(--svh, 1vh) * 100)` with `--svh` set once at load (never on resize).
- ScrollTrigger: `ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' })`; `resize` is removed from auto-refresh. SceneController refreshes only when `innerWidth` changes or on `orientationchange`, debounced 250 ms after `visualViewport` settles, plus once after `document.fonts.ready` and once when the intro overlay unmounts. Before refresh it stores the active scene's progress and after refresh scrolls to `start + progress × (end − start)` so the user stays at the same story moment.
- All media sit in fixed `aspect-ratio` boxes, so lazy loads never shift layout or require refresh. Demo internals mount via IntersectionObserver (`rootMargin: '150%'`); `content-visibility` is not used (it changes measured heights under ScrollTrigger).
- `scrub: 0.35` on touch (momentum scroll already smooths; 0.6 feels laggy); `touch-action: pan-y` on pinned stages, `pan-x pan-y` on horizontal rails. `normalizeScroll` is not used (breaks pull-to-refresh and assistive tech).
- Safe areas: `padding-bottom: env(safe-area-inset-bottom)` on sticky CTAs, footer and the feature sheet; `padding-top: env(safe-area-inset-top)` on nav.

### I.3 Touch replacements for hover and focus states

| Desktop pointer behaviour | Touch behaviour (`pointer-coarse`) |
|---|---|
| Hover expands a FeatureUniverse node + card + lit connections | First tap: expand + card + lit connections; tap elsewhere collapses; "Open" button in the card (or second tap on the node) opens detail |
| Pointer parallax, pointer light source | Scroll-driven parallax at 25 % + slow autonomous drift; no device-orientation parallax (iOS permission prompt, battery) |
| Magnetic CTAs | None; press state scale 0.98 (120 ms) + a single beam tick |
| CTA hover beam trace | Beam traces the primary CTA once when its scene becomes active |
| Node tooltips (Chat, Automation) | Tap toggles the tooltip; auto-dismiss after 4 s; one open at a time |
| Gallery hover scale / frame trace | None |
| Skill panel lift | None; panels are plain tap targets to the Skill detail |
| Fragment repel (S2) | None |

iPads with trackpads match `(hover: hover)` and get hover enhancements on top of tap behaviour; the two never conflict because tap toggles and hover only previews. Focus: `:focus-visible` = 2 px cyan outline, 2 px offset, on every control; polygon nodes additionally get a 2 px facet stroke so the focused polygon reads as "selected" at any size. Minimum tap target 44 × 44 (nodes 48–56). Keyboard navigation on tablets with keyboards works identically to desktop.

### I.4 Scroll lengths per scene

| Scene | Desktop (vh) | Tablet portrait / landscape (svh) | Phone (svh) | Phone mode |
|---|---|---|---|---|
| S1 Hero | 100 + 120 | 100 + 100 | 100 + 60 | pinned |
| S2 Fracture | 200 | 160 | 140 | pinned |
| S3 Chat AI | 250 | 200 | 170 | pinned |
| S4 FeatureUniverse | 300 | 260 / 300 | ≈ 6 × 55 flow | flow (world rails) |
| S6 Website Builder | 250 | 220 | 180 | pinned |
| S7 Image AI | 120 | 110 | ≈ 130 | flow |
| S8 Video AI | 110 | 110 | ≈ 140 | flow |
| S9 Code AI | 200 | 180 | 150 | pinned |
| S10 Skill AI | 120 | 120 | ≈ 140 | flow |
| S11 Business AI | 200 | 180 | 180 | pinned |
| S12 Automation AI | 110 | 110 | ≈ 120 | flow |
| S13 Live AI | 120 | 120 | ≈ 130 | flow |
| S14 ShakirOne | 300 | 260 | 220 | pinned |
| S15 Trust | 120 | 110 | ≈ 110 | flow |
| S16 Final CTA | 250 | 220 | 170 | pinned |
| S17 Footer | 30 | 35 | ≈ 45 | flow |

Totals: tablet ≈ 2,600 svh, phone ≈ 2,500 svh (≈ 18,000 px at 700 px tall vs ≈ 26,000 px on desktop). Phone landscape (`landscape-phone`) unpins everything (SceneController `mode: 'flow'`): every pinned scene becomes a 100 svh flow section whose timeline plays once on entry.

### I.5 Per-scene recomposition (tablet and phone)

**S0 IntroSequence**: tablet 2.4 s, 180 fragments, logo 240 px; phone 1.8 s, 90 fragments, logo 160 px, no beam glow; both skip on any tap or the 48 px "Skip" button, both honor `sessionStorage['shakir.intro.seen']`. The intro never blocks LCP: the hero headline (DOM text) and the `priority` 512 px logo render beneath the overlay; the canvas starts drawing after first paint (`requestIdleCallback`, 200 ms fallback). Font wait is capped at 300 ms, then system fallback with `size-adjust` renders "SHAKIR AI". REDUCED_MOTION on any device: 600 ms crossfade from graphite to the hero with the logo already in place. `landscape-phone`: intro skipped (static logo 400 ms fade).

**S1 Hero**: tablet portrait stacks centered: logo 200 px, `display-xl` 56 px, support `body-l`, CTAs inline (two × 48 px); tablet landscape = desktop two-column at `lg` (64 px headline, logo 360 px). Phone: left-aligned single column: logo 120 px, `label`, 40 px headline (3 lines, 36 px at ≤ 360), support 17 px, two full-width stacked CTAs 52 px; scroll cue cut; the logo-to-nav FLIP is kept (one transform). Text block sits on a scrim (I.8). Environment LOW: 280 facets / 60 particles.

**S2 Fracture → Network**: tablet keeps the full sequence at 200 fragments and a 36-node network; phone: 60 fragments, 24-node / 40-edge network, statement at `title-l` 26 px; no repel.

**S3 Chat AI**: tablet portrait: chat panel 480 px centered (height 46 svh) with the five-node constellation beneath; landscape: desktop two-column. Phone: chat panel full-width (16 px margins, height 52 svh), typing animation kept, the constellation becomes a vertical list of five 40 px chips under the panel lit in sequence by a vertical ShakirBeam on the left; the panel's input uses 16 px text so iOS never zooms.

**S4 FeatureUniverse**: tablet portrait keeps the constellation, pinned 260 svh with snap, `R = min(0.36·vw, 300px)` = 276 px at 768, nodes 40 px (48 hit), names only on the focused world; the tap card docks full-width under the constellation instead of beside the node. Tablet landscape: desktop composition at `R = min(0.42·svh, 320px)`. Phone: not pinned; recomposed as "world rails": a sticky hub strip (56 px, CHAT + SHAKIR ONE with a short beam toward the active world) under the nav, then six blocks, one per world (CREATE 5, LEARN 3, BUILD & GROW 3, ACT 3, TRUST 4, HUMAN 1): world name `title-l` 26, one-line description, a horizontal scroll-snap rail of 220 × 148 cards (facet icon 40 px, name 17 px semibold, two-line 15 px description); HUMAN shows one full-width card. Tap a card: it grows in place to 236 px, shows the description and "Works with" chips (the illuminated connections) and an "Open" button; "Open" presents S5. The beam connects the hub strip to the current world as each block enters. The left world index is cut; the hub strip carries the current world's name instead.

**S5 Feature detail**: tablet: modal 90 vw × 80 svh, columns collapse to stacked at `md`. Phone: full-screen sheet (`100dvh`), visual 40 svh on top, text below, 44 px close button plus swipe-down, focus trapped, page scroll position retained.

**S6 Website Builder**: tablet: frame 640 × 400 centered; responsive-preview step shows three frames at 0.6 scale. Phone: pinned 180 svh; prompt bar full-width; a single phone-shaped frame 260 × 520 (at 390 wide) centered, and the responsive step morphs that one frame mobile → tablet (0.5 scale) → desktop (0.3 scale) in sequence instead of side by side. Stage reveals are the same masked timelines, lighter (no simultaneous image + animation stage).

**S7 Image AI**: tablet: 2 + 1 gallery at 320 px. Phone: text first, then a horizontal scroll-snap rail of three 280 × 280 images (560 px assets); 120 particles (60 at LOW); the polygon-mask reveal is kept (clip-path is cheap).

**S8 Video AI**: tablet: horizontal rail at 5 × 140 px cards, video 640 × 360. Phone: vertical five-step stepper with the beam running down on entry; 640 × 360 clip ≤ 900 KB with poster; at LOW with `saveData`, poster plus a play button only.

**S9 Code AI**: tablet: panel 90 vw × 52 svh two-pane. Phone: pinned 150 svh, one 56 svh pane with tabs (Editor / Terminal / Preview) switched by the scrub, `mono` 12 px, 9 visible lines, same seven states.

**S10 Skill AI**: tablet portrait: ellipse rx 300 / ry 220, panels 180 × 101. Phone: central skill 120 px at top, seven 160 × 90 panels in a vertical zigzag (alternating left/right) joined by the beam; no hover lift.

**S11 Business AI**: tablet: full eight-state visualization at 60 % size. Phone: pinned 180 svh; horizontally scrollable stepper labels (12 px) above a full-width 40 svh visualization; all eight states kept but each uses one hue.

**S12 Automation AI**: tablet portrait: 3 + 3 two rows; landscape: desktop row. Phone: vertical flow of six full-width 64 px nodes, beam runs down in 1.6 s; tap a node to toggle its config lines.

**S13 Live AI**: tablet: tablet-shaped frame 560 × 400. Phone: a 240 × 480 phone frame (reads as the user's own device), LIVE indicator, the permission dialog shown first, five-step vertical rail. The permission dialog is never cut on any breakpoint.

**S14 ShakirOne**: tablet portrait: orb 200 px, ring 1 R 220 (six world nodes 48 px), ring 2 R 300 (21 nodes 20 px, no labels); landscape R 200 / 300. Phone: pinned 220 svh; orb 140 px; one ring R 128 px with the six world nodes only, each carrying a count badge (e.g. "CREATE · 5") so the 21 capabilities are still accounted for; headline `display-l` 34 at top, message `body-l` 17 below; after the pin releases, the seven-step flow (USER REQUEST → … → RESULT) appears as a vertical stepper in flow.

**S15 Trust**: tablet: 3 × 2 grid at 220 × 180 cells. Phone: `display-l` 34, a 2 × 3 grid (icon 28, `title-m` 20, `body-m` 15); environment 120 static facets; only fades.

**S16 Final CTA**: tablet: 1,200 → 1 facets (MEDIUM), logo 280 px. Phone: pinned 170 svh, 600 → 1 (LOW), logo 200 px, headline 34, CTAs stacked full-width with safe-area bottom padding.

**S17 Footer**: phone stacks: logo 40 px, links in two columns, 16 px text; tablet one row.

**Nav / menu**: `md` and below: logo + "ENTER SHAKIR" (40 px) + 44 px menu button; the menu is a `100dvh` overlay with a static 80-facet backdrop, links at `title-l`, focus-trapped, closes on route change and `Esc`.

### I.6 Scene-by-scene table: desktop vs tablet vs phone

| Scene | Desktop (`2xl`/`3xl`, HIGH) | Tablet (`md`/`lg`, MEDIUM) | Phone (`xs`/`sm`, LOW) |
|---|---|---|---|
| S0 Intro | 3.2 s, 320 fragments, logo 480 px, beam glow, FLIP to hero | 2.4 s, 180 fragments, logo 240 px | 1.8 s, 90 fragments, logo 160 px, no glow; landscape: static fade |
| S1 Hero | 12-col, 8 + 4 split, headline 88/96, logo 460/560, pointer parallax, pinned +120 % | portrait stacked centered (56 px, logo 200); landscape 2-col (64 px, logo 360); pinned +100 % | single column, 40 px, logo 120, stacked CTAs, scrim, pinned +60 % |
| S2 Fracture → Network | 1,200 → 400 → 48-node net, repel, 200 % | 600 → 200 → 36 nodes, 160 svh | 280 → 60 → 24 nodes, 140 svh |
| S3 Chat AI | panel 560×520 left, 5-node constellation right, 250 % | panel 480 centered + constellation below (portrait), 200 svh | full-width panel 52 svh + vertical chip list, 170 svh |
| S4 FeatureUniverse | constellation R ≤ 420, hub 96, 21 nodes, hover cards, world rail, pinned 300 % snap | constellation R 276–320, nodes 40, docked tap card, pinned 260/300 svh | not pinned; sticky hub strip + six world rails of 220×148 cards, tap-to-expand, ≈ 330 svh |
| S5 Feature detail | modal 1120 × ≤ 720, 2-col | modal 90 vw × 80 svh, stacked at `md` | full-screen sheet, swipe-down close |
| S6 Website Builder | frame 1040×620 → 3 previews side by side, 250 % | frame 640×400 → 3 previews at 0.6×, 220 svh | one phone frame 260×520 morphing through 3 sizes, 180 svh |
| S7 Image AI | 3-up 400 px gallery, 300 particles, flow 120 vh | 2 + 1 at 320 px, 180 particles | 3-card snap rail 280 px, 60–120 particles |
| S8 Video AI | horizontal 5-stage rail, 640×360 clip | 5 × 140 cards, 640×360 | vertical stepper, 640×360 ≤ 900 KB or poster-only |
| S9 Code AI | 1120×600 two-pane, 14 lines, 200 % | 90 vw × 52 svh two-pane, 180 svh | single tabbed pane 56 svh, 9 lines, 150 svh |
| S10 Skill AI | ellipse 440/260, 7 panels 220×124, hover lift | ellipse 300/220, panels 180×101 | vertical zigzag of 7 panels 160×90 |
| S11 Business AI | 1040 stepper + 1040×420 morphing viz, 200 % | same at 60 %, 180 svh | scrollable stepper + 40 svh viz, 180 svh |
| S12 Automation AI | 6 nodes in a row, beam 1.8 s | 3 + 3 rows (portrait) | vertical 6-node flow, beam 1.6 s |
| S13 Live AI | laptop frame 960×600, LIVE, permission dialog | tablet frame 560×400 | phone frame 240×480, dialog kept |
| S14 ShakirOne | orb 280/320, rings R 300 (6) + 440 (21), bottom rail 120 px, 300 % | orb 200, R 220/300, 260 svh | orb 140, one ring R 128 with 6 badged nodes, flow stepper after pin, 220 svh |
| S15 Trust | 3 × 2 grid 360×200, 240 static facets | 3 × 2 at 220×180 | 2 × 3 grid, 120 facets |
| S16 Final CTA | 2,400 → 1 facets, logo 360/420, 250 % | 1,200 → 1, logo 280, 220 svh | 600 → 1, logo 200, 170 svh |
| S17 Footer | one row, logo 48 | one row | stacked, two link columns |

### I.7 Type scale per breakpoint

See the table in H.1: `md` column for tablet portrait, `lg` for tablet landscape, `xs/sm` for phones. Phone body never drops below 16 px (iOS input zoom, readability over geometry); phone display text uses `text-wrap: balance`; `display-xl` falls to 36 px at ≤ 360 px wide so three lines still fit 4 columns with 16 px gutters.

### I.8 Text scrims over geometry

- `Scrim` component rendered behind every text block that overlaps the environment: `background: linear-gradient(180deg, rgba(10,11,14,0) 0%, rgba(10,11,14,.78) 24%, rgba(10,11,14,.78) 76%, rgba(10,11,14,0) 100%)`, 24 px bleed beyond the text box, no `backdrop-filter` (too expensive on mobile, and blur over facets looks muddy). Opacity by breakpoint: 0.35 at `lg`+ (quiet zones do the work), 0.6 at `md`, 1.0 at `xs/sm`.
- LowPolyScene keeps facets under any `quietZones` rect at ≤ 35 % luminance and −40 % saturation; on phones the hero and ShakirOne text rects are registered as quiet zones as well, so scrim + quiet zone together hold ≥ 4.5:1 for body and ≥ 3:1 for ≥ 24 px display text (checked in the quality gate, brief §32).
- No text shadows; soft white text on graphite only. Chips, cards and chat panels use graphite 80–88 % surfaces with a 1 px hairline rather than translucent glass.

### I.9 Asset sizes

| Asset | Desktop | Tablet | Phone | Notes |
|---|---|---|---|---|
| Logo (client transparent file) | SVG; raster fallback 1024 px | SVG; 512 px | SVG; 256–512 px | `next/image` `priority` in hero and intro; never redrawn or approximated; AVIF fallback ≈ 40 KB at 512 |
| Image AI gallery | 1200 × 1200 AVIF q60 (≈ 90 KB) | 800 px | 560 px | WebP fallback, 24 px LQIP blur, `sizes` per breakpoint |
| Website Builder stage images | 960 px wide | 640 px | 400 px | lazy, inside fixed `aspect-ratio` boxes |
| Video AI clip | 1280 × 720 H.264 + AV1 WebM, 8 s loop, ≤ 2.5 MB | 960 × 540 ≤ 1.5 MB | 640 × 360 ≤ 900 KB | `preload="none"`, muted, `playsInline`, poster AVIF, loads at `rootMargin 200%`, pauses offscreen; LOW + `saveData` = poster only |
| Skill AI panels | 440 × 248 posters | 360 px | 320 px | stills only; no video in the ring |
| Device frames (Live, Builder) | SVG | SVG | SVG | one shared frame sprite |
| Fonts | 2 weights, subset, `font-display: swap` + `size-adjust` | same | same | ≤ 90 KB total |
| `next/image` `deviceSizes` | 480, 768, 1080, 1440, 1920, 2560 | | | AVIF first, WebP fallback |

### I.10 Orientation handling

- Phone landscape (`landscape-phone`): all scenes unpinned (flow, play-once timelines), hero becomes two columns (logo left 160 px, text right at 36 px), CTAs inline, intro replaced by a 400 ms fade, world rails become a two-row grid. Never show a "rotate your device" blocker.
- Tablet rotation: SceneController refreshes with progress preservation (I.2); LowPolyScene re-lays out from the same random seed so facets move rather than re-randomize, with a 200 ms crossfade; `md` ↔ `lg` compositions (e.g. Chat two-column ↔ stacked) swap at the same scene progress.
- Foldables: by width only (unfolded ≈ 717 px wide → `sm`, inner 884 px → `md`); no fold-specific code.
- Resume from background (`visibilitychange`): all timelines paused while hidden; on return, one refresh if `innerWidth` changed.

### I.11 Intro on mobile (brief §04)

Shorter and lighter, same storyboard beats in the same order: graphite → 60 points (phone) / 120 (tablet) → fragments assemble (90 / 180) → environment at LOW/MEDIUM density → single-stroke ShakirBeam (no glow) → logo at 160 / 240 px → light pass → "SHAKIR AI" label → the environment simply stays as the hero (no camera move; the logo FLIPs 48 px up into its hero slot). 1.8 s on phones, 2.4 s on tablets; skippable by any tap; `sessionStorage` suppresses replay for the session; the overlay is `100dvh` so it tracks the address bar; REDUCED_MOTION gets the 600 ms crossfade on every device. The intro's probe frames feed the profile decision in I.1, so a phone that cannot hold 60 fps on 90 fragments is already at LOW before the hero starts.

### I.12 Mobile-specific restraint checks (added to the quality gate, brief §32)

Inspect at 360×740, 390×844, 430×932, 768×1024, 1024×768, 1180×820 in both orientations, with the address bar shown and hidden, at DPR 2 and 3: no horizontal overflow, no pin jump on bar collapse, scrim contrast holds on every text block, no more than three hues visible in any phone scene, every tap target ≥ 44 px, the intro ≤ 1.8 s on a mid-range Android, LCP ≤ 2.5 s on throttled 4G, and the fixed canvas never reallocates on scroll.
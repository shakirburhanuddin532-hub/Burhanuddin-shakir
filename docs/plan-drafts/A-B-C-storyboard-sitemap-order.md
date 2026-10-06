# A. WEBSITE STORYBOARD · B. SITEMAP · C. SECTION ORDER

## A. Website storyboard (home page `/`)

### A.0 Conventions and contracts used below

- **Scroll length** = document height a scene consumes: desktop in `vh` (reference 1440×900), mobile in `svh` (reference 390×844, dynamic-viewport safe). For a pinned scene it is 100vh (the pinned viewport) + pin distance. Beats are given as % of pin distance.
- **Breakpoints**: mobile < 768px, tablet 768–1023px, desktop ≥ 1024px, large ≥ 1536px. Tablet runs the desktop storyboard on the MEDIUM profile with pin distances × 0.85; in portrait, the FeatureUniverse uses the mobile composition.
- **One environment, one canvas.** A single `LowPolyScene` instance (one persistent Canvas 2D element, `position: fixed`, z-index 0) runs the whole home page. `SceneController` owns one ScrollTrigger per scene and calls `LowPolyScene.setState(state, progress)`. The state names below are the contract with the low-poly section: `ridge`, `fracture`, `network`, `interface`, `universe`, `engine`, `one`, `calm`, `collapse`, `symbol`. No WebGL anywhere in this storyboard: the heaviest state is 2,000 flat-shaded triangles (final CTA, HIGH), inside Canvas 2D budget.
- **Triangle counts** are given as HIGH / MEDIUM / LOW. REDUCED_MOTION uses the LOW count, renders each state once (no per-frame animation) and crossfades states in 300 ms.
- **ShakirBeam** (§08): a 2px (desktop) / 1.5px (mobile) stroke, 160–320px travelling head with a 24px soft tail, hue drifting slowly electric blue → violet → cyan → teal. Magenta, amber and gold are reserved for facets (the logo's warm side), so the beam always reads as "the same light". Never more than two beams on screen; never a persistent border.
- **Text is DOM** (semantic HTML, z-index 10) over the canvas; the canvas is `aria-hidden`. Copy below is the final draft and follows §29: no "#1", no "guaranteed", no "instantly", no "master anything".
- **Logo**: the hand-with-crown PNG (`/brand/shakir-logo-source.png`) is the only logo. Scenes 0, 1, 4, 6, 8, nav and footer use the client-supplied transparent PNG/SVG master (dependency #1, requested now). Until it arrives, development uses the source PNG with only the bottom-right watermark cropped and the white background keyed out, at original proportions; no re-drawing. The "SHAKIR AI" wordmark is typeset text (uppercase, tracked), not a logo substitute; if the client has an official wordmark it replaces the typeset one.

### A.1 Scene table

| # | Scene | Anchor | Pinned | Desktop | Mobile | LowPolyScene state → next | Viewer should feel |
|---|---|---|---|---|---|---|---|
| 0 | IntroSequence | — | overlay, no scroll | 3.2 s | 2.8 s | points → fragments → `ridge` | anticipation, precision |
| 1 | Hero | `#hero` | pinned, pin 100vh | 200vh | 160svh | `ridge` → `fracture` | scale, confidence |
| 2 | One System | `#system` | pinned, pin 180vh | 280vh | 220svh | `fracture` → `network` | clarity: "it is one thing" |
| 3 | Chat | `#chat` | pinned, pin 200vh | 300vh | 200svh | `network` → `interface` | ease: "I just ask" |
| 4 | FeatureUniverse | `#universe` | pinned, pin 280vh (mobile: flowing) | 380vh | 400svh | `interface` → `universe` | discovery without clutter |
| 5 | Creation Engine | `#engine` | pinned, pin 520vh (mobile: 4 pins) | 620vh | 600svh | `universe` → `engine` | craft: "it does the work" |
| 6 | ShakirOne | `#shakir-one` | pinned, pin 280vh | 380vh | 260svh | `engine` → `one` | unity: the thesis lands |
| 7 | Trust | `#trust` | flowing | 160vh | 200svh | `one` → `calm` | calm, safety |
| 8 | Final CTA | `#create` | pinned, pin 180vh | 280vh | 220svh | `calm` → `collapse` → `symbol` | invitation |
| 9 | Footer | `#footer` | flowing | 60vh | 110svh | `symbol` held, canvas stops | closure |

**Totals**: desktop 2,660vh (~23,900px at a 900px viewport); mobile 2,370svh (~20,000px at 844px).

### A.2 Scene 0 — IntroSequence (brief §04)

- **Mount rule**: rendered only by `app/page.tsx`, only when `sessionStorage['shakir.intro.v1']` is unset; the key is written at shot 1, so back/forward, client-side navigation and reloads inside the session never replay it. `?intro=1` forces a replay for QA. Scroll is locked (`html { overflow: hidden }`) until 3,200 ms or skip.
- **It is the loading experience** (§02): the first 600 ms cover font and logo decode (both preloaded with `priority`). If the logo has not decoded by 2,300 ms, shot 4 holds its last 200 ms (max +1,500 ms), then continues.
- **Skip**: "SKIP" button bottom-right from 0 ms (11px tracked uppercase, 44px hit area), plus Esc, any key, tap, wheel or touch-move. Skip runs `tl.progress(1)` behind a 200 ms crossfade, never a hard cut; scroll unlocks immediately.
- **Shot list (desktop HIGH / MEDIUM)**:

| Shot | t (ms) | What happens |
|---|---|---|
| 1 Dark | 0–200 | Deep graphite field. Nothing else. Skip control fades in. |
| 2 Points | 200–700 | 64 points of light (1–2px) fade in along a loose ridge-line arc; 20% in electric blue / violet / cyan, the rest soft white. |
| 3 Fragments | 600–1,300 | Each point births triangles: 180 total, scale 0 → 1, opacity 0.6, low-saturation accents, slow drift. |
| 4 Assembly | 1,200–2,000 | Triangles ease (power3.out, 1.5 ms stagger) onto the `ridge` mesh positions: the hero mountain. This is the hero's environment forming, not a separate scene. |
| 5 Beam | 1,900–2,400 | ShakirBeam travels the ridge silhouette left → right in 500 ms; facets it crosses brighten for 300 ms. |
| 6 Logo | 2,300–2,800 | The logo rises into centre (y +24px → 0, scale 0.96 → 1, opacity 0 → 1, power2.out), 260px tall. |
| 7 Light over logo | 2,700–3,000 | A 30° highlight band (the crown-facet angle) sweeps across the logo's bounding box as a masked overlay at 35% screen-blend. The logo pixels are untouched. |
| 8 Wordmark | 2,900–3,200 | "SHAKIR AI" appears under the logo: tracking 0.30em → 0.18em, opacity 0 → 1. |
| 9 Handoff | 3,200–3,800 | Scroll unlocks at 3,200. The canvas is already the hero's canvas (no pixel handoff). The logo FLIPs to its hero position (desktop: right column; mobile: above the headline); a 32px copy settles into the nav; the wordmark becomes the hero eyebrow; the headline starts its entrance at 3,400. |

- **LOW profile**: 32 points, 80 triangles, assembly 500 ms; total 2.4 s. **Mobile**: counts halved, logo 180px, total 2.8 s.
- **REDUCED_MOTION**: graphite → logo + wordmark fade in (400 ms) → hold 400 ms → crossfade to the static hero (300 ms). 1.1 s, still skippable, no particles.

### A.3 Scene 1 — Hero (§05)

- **Environment `ridge`**: a low-poly mountain ridge in the bottom 58% of the viewport, three depth layers (far 420 / mid 640 / near 340 = 1,400 HIGH; 700 MEDIUM; 320 LOW). Facets 85% graphite (L 10–22%), 15% accents (electric blue, violet, teal) and one warm amber-to-gold cluster at the summit where the logo's metal base rests (the crown echo). Alive: a light source orbits with a 12 s period so facets brighten and dim ("refract"); the ridge rotates ±0.6° (2D affine); pointer parallax far 4px / mid 10px / near 18px, lerp 0.08; layer scale 1.00 → 1.04 across the pin ("shift depth").
- **Layout**: desktop 12-column grid, headline + copy + CTAs in columns 1–6, logo in columns 8–12 at 420px tall, its base aligned to a deliberately flat 220px summit facet so the logo stands on the mountain. Mobile: logo 200px centred above the headline, ridge in the bottom 45%.
- **Beats (pin 100vh)**: 0–30% hold (ambient motion only; scroll hint fades at 5%). 30–100% `ridge → fracture`: facets detach along the path the beam last travelled (the beam scores the mountain), each triangle gets a velocity 12–40px per 10% progress away from the ridge line, rotation ±25°, opacity → 0.7. Headline rises 24px and fades at 70–100%; the logo fades at 60–90%. The logo is not a fixed element; it returns at scenes 4, 6 and 8, so each return means something.
- **Text**: eyebrow "SHAKIR AI". H1 "ONE INTELLIGENCE. / LIMITLESS POSSIBILITIES." Supporting "Create. Learn. Research. Build. Automate." Primary "ENTER SHAKIR" (→ `NEXT_PUBLIC_APP_URL`, client-supplied). Secondary "EXPLORE FEATURES" (→ `SceneController.seek('#universe')`). Scroll hint "SCROLL" with a 24px vertical beam tick.
- **ShakirBeam**: one 1,600 ms pass along the ridge silhouette every 9 s. On hover/focus of the primary CTA the beam traces the button outline once (600 ms) and rests. No persistent glow.
- **Transition out**: the scrubbed fracture above ("fragments break apart"). Text crossfade with 24px rise.

### A.4 Scene 2 — One System (§06, Final Creative Direction)

- **Environment `fracture → network`**: 0–35% fragments keep drifting until 21 "hero" fragments (2× size, one per capability) hang isolated in a loose field. 35–70% the beam hops between hero fragments; each contact snaps the fragment to a node position and draws an edge (stroke-dashoffset scrub). 70–100% all 21 nodes are connected by 34 edges; small fragments settle onto edges as faint traffic. Counts: HIGH 21 nodes + 34 edges + 600 ambient; MEDIUM + 300; LOW + 120.
- **Text**: Phase A (0–35%) H2 "NOT A COLLECTION OF TOOLS." with 21 faint 11px labels (CODE, IMAGE, RESEARCH, STUDY, VIDEO…) attached to the hero fragments at 45% opacity. Phase B (40–100%) H2 swaps to "ONE INTELLIGENT SYSTEM." Supporting "Creation, learning, research, building, automation and action — connected, so each capability can hand work to the next." Labels dim to 25% as fragments become nodes.
- **ShakirBeam**: its defining moment: the beam *is* the connection. One beam, 1,200 ms-equivalent per hop; at 70% it loops the full network once.
- **Transition out**: nodes migrate to interface anchor points (the chat panel's four corners and five message-row margins); edges become the panel's 1px hairlines ("network becomes product interface").
- **Mobile**: ambient 120, nodes in a 3×7 grid instead of radial, labels hidden below 360px.

### A.5 Scene 3 — Chat (§12)

- **Environment `interface`**: the network freezes into a 720×480px panel frame drawn by the canvas (hairlines inherited from scene 2); ambient fragments at 15% opacity around it. The real, accessible chat transcript (DOM) sits exactly over the frame. Mobile: (100% − 32px) × 420px.
- **Beats (pin 200vh)**: 0–10% panel forms (clip-path inset reveal from centre). 10–25% user message types. 25–40% Shakir reply. 40–85% five capability rows, one per 9%. 85–100% closing line; beam traces the panel once.
- **Text**: H2 "SAY WHAT YOU NEED." Supporting "Shakir reads the request, then brings in the capabilities the job calls for." Transcript: user "Help me turn my idea into a business." Shakir "Understood. Here's how I'll approach it:" then rows Research AI — "Market, competitors, demand." / Business AI — "Model, pricing, positioning." / Website Builder AI — "A first site to launch with." / Marketing & Content Creator AI — "Launch content and campaigns." / Goal-to-Action AI — "A step-by-step plan with dates." Closing "Shall I start with the research?" Caption under the panel: "Illustrative conversation." (§29).
- **ShakirBeam**: flows from the user message into each capability row as it lands (240px run, 500 ms-equivalent), then traces the panel edge once at 85% (§08 "briefly trace the chat interface").
- **Transition out**: the panel scales to 0.18 and travels to the viewport centre, becoming the CHAT + SHAKIR ONE centre node; ambient fragments pull inward ("interface transforms into feature universe").

### A.6 Scene 4 — FeatureUniverse (§10, §11)

- **Environment `universe`**: centre node (logo at 96px inside a faceted ring) with six world clusters on 60° steps: CREATE top-right (5 nodes), LEARN right (3), BUILD & GROW bottom-right (3), ACT bottom-left (3), TRUST left (4), HUMAN top-left (1). Each node is a 56px faceted polygon (10 facets HIGH, 4 LOW); 21 spokes to the centre + 26 intra-world edges; ambient 400 / 200 / 80. Worlds differ in shape so they are recognisable at a glance: CREATE a fan, LEARN a stair, BUILD & GROW an ascending line, ACT a chevron, TRUST a shield outline, HUMAN one larger facet. Cluster pointer parallax 6px.
- **Beats (pin 280vh)**: 0–12% centre settles. 12–64% worlds bloom clockwise from CREATE (8.5% each, nodes stagger 40 ms). 64–93% HOLD: a flat segment in the scrubbed timeline; the constellation is stable and interactive (hover/focus: polygon expands 1.35× in 200 ms, name, one-line description, connected capabilities illuminate along the beam; Enter/click opens the feature-detail experience, see B.3; Tab order 01 → 21). 93–100% collapse begins.
- **Text**: H2 "TWENTY-ONE CAPABILITIES. / SIX WORLDS. / ONE CENTER." Supporting "Every capability belongs to a world, and every world connects through Chat and Shakir One. Hover a node to see what it does and what it works with." (mobile: "Tap a node…"). World labels 11px tracked uppercase; node numbers 01–21.
- **ShakirBeam**: idle, one slow orbit of the centre ring (8 s). On hover/focus a beam runs from the node along its edges to related nodes (max 4 edges, 400 ms) and returns.
- **Transition out**: the six clusters contract onto a 21-facet ring (radius 300px) around the centre; the centre dims into a stage ("feature universe becomes creation engine").
- **Mobile (flowing, 400svh)**: header band, then six world bands (~60svh each: world name, compact constellation at 48px nodes, tap opens the detail sheet) and a persistent 64px "connects through Chat + Shakir One" chip at the foot of each band. Reason: pinning 21 tap targets on a dynamic-viewport phone makes taps unreliable; flowing keeps them precise.

### A.7 Scene 5 — Creation Engine (§13, §16, §14, §19 on home; §15, §17, §18, §20 on feature pages)

- **Environment `engine`**: the 21-facet ring from scene 4 rotates 0.5° per 1% progress around an 880×540px stage; the active chapter's facet docks at 12 o'clock and brightens; the beam runs from the docked facet into the stage. Ambient 300 / 150 / 60. The stage is DOM product UI (the demonstrations section owns internals; this storyboard fixes beats and copy).
- **Decision**: four chapters on the home page (Website Builder, Code, Image, Automation) because they span CREATE and ACT, prove verification (Code) and make the beam structural (Automation). Video AI, Skill AI, Business AI and Live AI get their full showcases on `/features/[slug]` and are introduced in the exit beat. This keeps the home page under 2,700vh and the demos under one performance budget.
- **Chapters (pin 520vh = 4 × 120vh + 40vh exit)**; each chapter: 0–8% facet docks + title, 8–92% demo scrubs, 92–100% stage wipes with a 30° diagonal masked reveal.
  1. Website Builder — H3 "FROM A SENTENCE TO A SITE." Prompt "Build a luxury architecture website." Steps (~10% each): PROMPT → SHAKIR UNDERSTANDS → DESIGN SYSTEM → COMPONENTS APPEAR → IMAGES APPEAR → COPY APPEARS → ANIMATIONS ACTIVATE → RESPONSIVE PREVIEW (desktop → tablet → mobile frames) → WEBSITE COMPLETE. Supporting "Design system, components, images, copy, motion and a responsive preview — assembled in order, visible at every step."
  2. Code AI — H3 "WRITTEN. TESTED. FIXED. PASSED." Steps PROMPT → CODE → TEST → ERROR → FIX → PASS → PREVIEW. Supporting "Code AI runs the tests, reads the failure and fixes it before it shows you the preview."
  3. Image AI — H3 "WORDS BECOME IMAGES." Steps TEXT → GEOMETRIC PARTICLES → IMAGE FORMATION, then four variations in a gallery (crossfade + 2% scale). Supporting "One prompt, several directions. Text becomes particles; particles settle into an image."
  4. Automation AI — H3 "SET IT IN MOTION." Steps TRIGGER → CONDITION → ACTION → ACTION → VERIFY → COMPLETE, nodes joined by the beam. Supporting "A workflow you can read: trigger, condition, actions, verification, done."
  - Exit (40vh): the stage empties; the ring facets for Video AI, Skill AI, Business AI and Live AI light in turn with name + "→" link to their pages. H3 "THE SAME ENGINE BEHIND EVERY CAPABILITY."
- **ShakirBeam**: per chapter, one beam facet → stage, then along the step chain as each step lands. In Automation the beam is the edge between nodes (§19).
- **Transition out**: the ring draws inward to radius 180px; the stage dissolves; the centre becomes the Shakir core ("creation engine becomes Shakir One").
- **Mobile**: four separately pinned chapters of 150svh (pin 50svh, demos compressed to five beats), stage (100% − 32px) wide; the ring becomes a top strip of 21 facets with the active one lit.

### A.8 Scene 6 — ShakirOne (§09)

- **Environment `one`**: core = logo at 160px (mobile 112px) inside a translucent faceted orb (240 / 120 / 60 facets, 0.2 rpm); 21 capability nodes at radius 260px in their world clusters; 21 spokes + 12 inter-world edges.
- **Beats (pin 280vh)**: 0–25% capability nodes appear, world by world. 25–50% connections form (dashoffset). 50–70% light travels: the beam runs the spokes through all six worlds. 70–88% all nodes connect into one system: edges to full brightness, orb facets align into a regular pattern. 88–100% SHAKIR ONE activates: one pulse (orb scale 1 → 1.06 → 1), the beam converges into the core, and the pipeline draws beneath the orb (desktop horizontal, mobile vertical): USER REQUEST → SHAKIR ONE → UNDERSTAND → ROUTE → CREATE / RESEARCH / BUILD / ACT → VERIFY → RESULT.
- **Text**: H2 "ONE SHAKIR." Message at 70%: "You ask. / Shakir figures out what comes next." Supporting at 88%: "Shakir One is the system behind every capability. It understands the request, routes it to the right capabilities, checks the work and returns one result." Pipeline sub-labels: USER REQUEST — "In plain language." SHAKIR ONE — "One system receives it." UNDERSTAND — "Intent, context, constraints." ROUTE — "To the capabilities the task needs." CREATE / RESEARCH / BUILD / ACT — "The work happens here." VERIFY — "Checked before it reaches you." RESULT — "One answer, with its trail."
- **ShakirBeam**: most present here (travels, converges, draws the pipeline) but still ≤ 2 beams at once.
- **Transition out**: orb and nodes fade to 20%, edges flatten, the ambient field rises and desaturates to graphite + one teal ("calm"). Unpin.
- **Mobile**: node radius 128px; pipeline vertical with 56px rows.

### A.9 Scene 7 — Trust (§21)

- **Environment `calm`**: a flat field of 160 / 100 / 40 large, low-contrast triangles (luminance delta ≤ 8%), no accent except one teal facet near each principle, no beam, no pointer parallax; the only motion is a 20 s luminance drift.
- **Layout**: flowing, max-width 1120px. H2, lead line, six principles in a 3×2 grid (one column on mobile); each enters once (opacity + 16px rise, 500 ms, 80 ms stagger). Link to `/security`.
- **Text**: H2 "POWER WITH CONTROL." Lead "Trust is part of the system, not a setting." PERMISSIONS — "Screen, device and account access is granted by you and scoped to the task." PRIVACY — "Clear controls over what Shakir keeps, and Offline AI for work that stays on your device." VERIFICATION — "Truth & Verify checks claims; Code AI runs its tests. Results are checked before they reach you." USER APPROVAL — "Actions that change something outside the conversation wait for your approval." SECURITY — "Privacy & Security AI is a capability inside the system, applied to what you build and share." TRANSPARENCY — "Shakir shows which capabilities it used and why." Link "Read the security overview →".
- **ShakirBeam**: none. The absence is the point.
- **Transition out**: as the final CTA pin starts, each calm triangle subdivides into four: the "thousands" are born from the calm.

### A.10 Scene 8 — Final CTA (§30)

- **Environment `collapse → symbol`**: 0–35% thousands (2,000 / 1,000 / 400) drift to centre in a slight spiral. 35–60% merge into hundreds (300). 60–80% dozens (36 larger facets in the logo's colours: blue, violet, magenta, amber, gold). 80–90% one symbol: a single luminous triangle, 120px, the site's atom. 90–100% the triangle dissolves and the real logo (320px, mobile 200px) rises behind it; the beam passes over the logo once (echo of intro shot 7); wordmark "SHAKIR AI" below.
- **Text**: H2 "WHAT WILL YOU CREATE?" (appears at 85%). Primary "ENTER SHAKIR". Secondary "EXPLORE SHAKIR" (→ `/features`). Nothing else on screen.
- **ShakirBeam**: one final pass at 92%, then gone.
- **Transition out**: unpin; the logo stays as the last image; the footer flows in; the canvas RAF loop stops when the footer is fully in view.

### A.11 Scene 9 — Footer (§31)

Flowing, 60vh desktop / 110svh mobile; environment held static. Structure in B.4.

---

## B. Sitemap

### B.1 Routes and launch scope

| Route | Purpose | Launch scope | Notes |
|---|---|---|---|
| `/` | The cinematic home: scenes 0–9 | FULL | Only route that mounts `IntroSequence` and `SceneController`. |
| `/features` | The universe as a page: static constellation header (`LowPolyScene` state `universe`, not pinned), then the 21 features grouped by world with a world filter | FULL | Also the SEO entry, the no-JS fallback and the "EXPLORE SHAKIR" target. |
| `/features/[slug]` | Feature detail, 21 pages | FULL template; 9 with showcases, 12 standard | Standard = hero + description + relationship mini-constellation + CTA. Showcases: see B.2. |
| `/security` | Security overview: the six trust principles expanded, security contact for disclosures | SHORT | Facts client-supplied; no certifications or audits claimed unless documented (§29). |
| `/privacy` | Product privacy explainer: what Shakir keeps, controls, Offline AI; links to the policy | SHORT | Distinct from the legal policy. |
| `/developers` | Developer access: what is available, what is planned, interest form | SHORT | No fabricated API docs. |
| `/pricing` | Plans | SHORT template | `data/pricing.ts` is client-supplied; if absent at launch the page shows the "ENTER SHAKIR" path with "Pricing details on request". |
| `/contact` | Form (name, email, message) + addresses | SHORT | Server action; honeypot; no third-party widget. |
| `/legal/terms`, `/legal/privacy-policy`, `/legal/cookies` | Legal documents | SHORT | Client text in `content/legal/*.md` rendered by `LegalLayout`. |
| `not-found` | 404 | SHORT | One static low-poly symbol, link home. |
| `sitemap.xml`, `robots.txt`, `opengraph-image` | System | FULL | App Router metadata routes; OG image = logo on graphite. |

Title pattern: `Shakir AI — <page>`; home: `Shakir AI — One intelligence. Limitless possibilities.`

### B.2 Feature slugs (`data/features.ts` keys)

| World | Slug (number) | Showcase at launch |
|---|---|---|
| CENTER | `chat-ai` (01) | yes (§12) |
| CREATE | `image-ai` (05), `code-ai` (06), `website-builder-ai` (07), `video-ai` (08), `writing-document-ai` (10) | image, code, website-builder, video |
| LEARN | `study-ai` (02), `skill-ai` (03), `research-ai` (04) | skill |
| BUILD & GROW | `business-ai` (12), `goal-to-action-ai` (13), `marketing-content-ai` (19) | business |
| ACT | `agent-ai` (14), `automation-ai` (20), `live-ai` (21) | automation, live |
| TRUST | `truth-verify-ai` (11), `offline-ai` (16), `privacy-security-ai` (17), `medical-support-ai` (15) | — |
| HUMAN | `human-talent-ai` (18) | — |
| CREATE (search) | `video-search-ai` (09) | — |

Content notes: `medical-support-ai` copy carries a visible "Not a substitute for professional medical advice" line; `live-ai` copy and demo carry the explicit LIVE indicator and "permission-based" statement (§20).

### B.3 How the feature-detail experience opens from the home page

**Decision: intercepting route** `app/@modal/(.)features/[slug]/page.tsx` (parallel slot `@modal` in `app/layout.tsx`, `app/@modal/default.tsx` returns null), with `app/features/[slug]/page.tsx` as the full page.

- Selecting a node in `FeatureUniverse` (click, Enter, tap) pushes `/features/<slug>`; the interceptor renders `FeatureDetailOverlay` over the still-mounted home, so `SceneController` keeps its ScrollTrigger state and the visitor returns to the exact scroll position on close (Esc, close button, back). Desktop: 920px panel, enters with a 30° masked reveal; mobile: full-screen sheet.
- A hard load, refresh or shared link of `/features/<slug>` renders the full page with the same content; `generateStaticParams` prebuilds all 21.
- Reasoning: §11 asks for a premium detail experience on selection, §06 asks for one continuous journey; a page navigation would unmount the canvas at ~1,400vh and the back button would re-run the scroll story. A plain modal without a route would lose shareable URLs and SEO. The intercepting route gives both at the cost of one slot and one `default.tsx`.
- Inside the overlay, the beam traces the panel edge once on open (600 ms); related capabilities link to their own overlays (`router.push`, overlay content swaps, no close/open flicker).

### B.4 Navigation structure

- **Primary nav** (`data/navigation.ts`): logo (32px, links `/`) · FEATURES (`/features`) · SHAKIR ONE (`/#shakir-one`, seeks on home) · SECURITY (`/security`) · PRICING (`/pricing`) · CTA "ENTER SHAKIR". Five items, nothing else: Developers and Contact live in the footer.
- **Behaviour**: 72px transparent over the hero; from 80px of scroll it compacts to 56px on solid graphite at 92% opacity with a 1px hairline (no `backdrop-filter` on LOW). It does not hide on scroll-down: pinned scenes make hide/show jitter.
- **Mobile nav**: logo + "ENTER" CTA + menu button; menu is a full-screen overlay listing the five items + Developers + Contact, with the beam running down its left rail once on open.
- **BeamRail** (desktop ≥ 1024 only): a 1px vertical rail on the right edge with eight ticks (`#hero` … `#create`); the beam's position on the rail is the page progress; the current tick is lit; click or Enter seeks. This is wayfinding for a 2,660vh page and is the only place the beam is persistent, at 1px and 40% opacity, never a border.
- **Footer** (§31): row 1 left = logo (40px) + "SHAKIR AI" + one line "One intelligent system for creation, learning, research, building, automation and action."; row 1 right = three columns: PRODUCT (Features, Shakir One, Pricing) · TRUST (Security, Privacy) · COMPANY (Developers, Contact). Row 2: © Shakir AI {year} · Terms · Privacy Policy · Cookies. Nothing animated; the hairlines are static.

### B.5 Anchor ids and seeking

`#hero`, `#system`, `#chat`, `#universe`, `#engine` (+ `#engine-website`, `#engine-code`, `#engine-image`, `#engine-automation`), `#shakir-one`, `#trust`, `#create`, `#footer`.

Native hash jumps land on a pinned scene's start (the pin-spacer top), which is correct for scene anchors. Chapter sub-anchors and the in-page CTAs go through `SceneController.seek(id)` which maps id → `trigger.start + offset` and scrolls with `scrollTo` (GSAP, 900 ms, power2.inOut; instant under REDUCED_MOTION). On other pages, `/#id` loads the home with the intro skipped (session key) and seeks after `ScrollTrigger.refresh()`.

---

## C. Section order (home page)

Scroll length = document height consumed (desktop vh / mobile svh). Component paths follow brief §26; the files section (L) may rename folders but not the component names.

| # | Anchor | Component (file) | Desktop | Mobile | Reason for position |
|---|---|---|---|---|---|
| 0 | — | `IntroSequence` (`components/brand/IntroSequence.tsx`) | 0 (3.2 s) | 0 (2.8 s) | Forms the hero's own environment, so the first scroll continues the intro instead of following a cut. |
| 1 | `#hero` | `HeroScene` (`components/hero/HeroScene.tsx`) | 200vh | 160svh | Brand, headline and CTAs first; the mountain is the raw material every later scene is made from. |
| 2 | `#system` | `SystemScene` (`components/scenes/SystemScene.tsx`) | 280vh | 220svh | The one idea (not tools, one system) is stated before any feature so every feature is read as part of it. |
| 3 | `#chat` | `ChatScene` (`components/demonstrations/ChatScene.tsx`) | 300vh | 200svh | The network becomes the interface the visitor will actually use; proves "one request" before showing breadth. |
| 4 | `#universe` | `FeatureUniverse` (`components/features/FeatureUniverse.tsx`) | 380vh | 400svh | Breadth after the entry point: 21 capabilities shown as worlds around the chat, with detail on demand. |
| 5 | `#engine` | `CreationEngine` (`components/demonstrations/CreationEngine.tsx`) | 620vh | 600svh | Depth after breadth: four demonstrations of real work, placed mid-page where attention is still high. |
| 6 | `#shakir-one` | `ShakirOne` (`components/shakir-one/ShakirOne.tsx`) | 380vh | 260svh | The §06 chain ends here: everything just seen is unified into one system and one pipeline. |
| 7 | `#trust` | `TrustSection` (`components/trust/TrustSection.tsx`) | 160vh | 200svh | Calm break after the peak, answering "and I stay in control?" before the ask. |
| 8 | `#create` | `FinalCtaScene` (`components/cta/FinalCtaScene.tsx`) | 280vh | 220svh | The universe simplifies to the logo; the ask comes at the moment of maximum clarity. |
| 9 | `#footer` | `SiteFooter` (`components/footer/SiteFooter.tsx`) | 60vh | 110svh | Minimal close; no motion behind it. |

Persistent across all sections: `LowPolyScene` (`components/low-poly/LowPolyScene.tsx`, one canvas), `SceneController` (`animations/scroll/SceneController.ts`), `SiteNav` (`components/navigation/SiteNav.tsx`), `BeamRail` (`components/navigation/BeamRail.tsx`, desktop only), `FeatureDetailOverlay` (`components/features/FeatureDetailOverlay.tsx`, via `@modal`).

**Total page scroll length**: desktop 2,660vh (pinned 2,440vh + flowing 220vh; ~23,900px at 900px); mobile 2,370svh (pinned 1,770svh + flowing 600svh; ~20,000px at 844px). Tablet: desktop order, 2,340vh.
# G. 21-FEATURE PRESENTATION PLAN
FeatureUniverse · ShakirOne · demonstrations §12–§20 · trust §21

## G.0 Decisions this section is built on

1. **Scene order (section C owns the final order; this section assumes brief §06 literally).** Hero → network → **ChatDemo (§12, "product interface")** → **FeatureUniverse (§10/§11)** → **Creation Engine chapter (§13–§20, eight pinned demos)** → **ShakirOne (§09)** → **Trust (§21)** → Final CTA. Every scene below declares its entry and exit state so SceneController can hand off; if section C reorders, only the handoffs change, not the components.
2. **World hues are taken from the logo's facets, gold is reserved for the center.** The crown is the only gold on the site; the hand's facets give each world its hue. Tokens are named here, exact values are finalized in section E:

   | World | Logo facet it comes from | Token | Working value |
   |---|---|---|---|
   | CENTER (Chat AI + ShakirOne) | the crown | `--core-gold` | `#D4B365` |
   | CREATE | warm amber/orange facets where the fingers meet | `--world-create` | `#F2B35C` |
   | LEARN | teal/green facets of the thumb | `--world-learn` | `#4FD1C5` |
   | BUILD & GROW | electric-blue knuckle facets | `--world-build` | `#4C8DFF` |
   | ACT | violet facets of the lower palm | `--world-act` | `#8B6CF6` |
   | HUMAN | rose/magenta facets of the raised finger | `--world-human` | `#E884B8` |
   | TRUST | the brushed-metal base the hand stands on | `--world-trust` | `#B9C2CC` |

   Each world token has three facet tones (`base`, `light` = +12% L, `deep` = −14% L) so every low-poly gem is built from the same three-tone rule.
3. **Three presentation tiers.** 9 full cinematic demos (the nine the brief specifies, §12–§20), 7 interactive previews (one control, prebuilt data, no network), 5 illustrated cards (SVG, animates once in view). All 21 appear in the universe, in the feature-detail experience and on a standalone route; tier changes only what the detail experience contains.
4. **Voice rules for every string in this section (brief §29).** Verb first, present tense, concrete nouns. No "#1", "guaranteed", "instantly", "master", "any/everything", "perfect". Outcomes that depend on the user are phrased as "helps". Every demo surface carries a small `EXAMPLE` tag (10px, 50% opacity) and every number inside a demo is labelled illustrative. Claims about product behaviour (encryption, offline scope, data retention) are marked **[client to confirm]** and are not shipped until confirmed.
5. **Data model (single source for every scene in this section).** `data/features.ts` exports `features: Feature[]` with `{ id: '01'…'21', slug, name, shortName, world: WorldId, blurb, description, connections: FeatureSlug[], demo: { tier: 'cinematic' | 'preview' | 'card', component: string }, icon: IconId, angle: number, radius: number }`. `data/worlds.ts` exports `{ id, name, hueToken, arcStart, arcEnd, order }`. `connections` are stored as listed in G.1 (directed); rendering uses the undirected union, so a node may illuminate 5–6 neighbours. FeatureUniverse, ShakirOne, ChatDemo and FeatureDetail all read this file; nothing is hand-placed.

## G.1 Feature map

Angles are degrees clockwise from 12 o'clock on the desktop constellation (see G.2). "Full" = full cinematic demo (brief §), "Preview" = interactive preview, "Card" = illustrated card.

| # | Feature (brief §10) | slug | World | Blurb (content-rule voice) | Connects to | Presentation |
|---|---|---|---|---|---|---|
| 01 | Chat AI | `chat-ai` | CENTER, ring around ShakirOne | Where every request starts, and where Shakir decides what comes next. | Research, Writing + Document, Goal-to-Action, Agent (hover also lifts all worlds to 50%) | Full (§12) |
| 02 | Study AI | `study-ai` | LEARN · 95° | Turns your material into a plan, clear explanations and practice at your pace. | Skill, Research, Video Search, Writing + Document | Preview |
| 03 | Skill AI | `skill-ai` | LEARN · 113° | Teaches a skill in seven structured lessons, from foundation to a final project. | Study, Video, Human Talent | Full (§17) |
| 04 | Research AI | `research-ai` | LEARN · 59° | Gathers sources, compares them and writes up what holds, with citations you can check. | Truth & Verify, Writing + Document, Business, Study | Preview |
| 05 | Image AI + Image Search | `image-ai` | CREATE · −20° | Creates images from a description, offers variations, and finds existing images by meaning. | Website Builder, Marketing & Content, Video | Full (§14) |
| 06 | Code AI | `code-ai` | CREATE · 20° | Writes code, runs the tests, fixes what fails and shows the passing result. | Website Builder, Automation, Agent | Full (§16) |
| 07 | Website Builder AI | `website-builder-ai` | CREATE · 0° | Builds a complete, responsive website from one sentence: system, components, copy, images. | Code, Image, Writing + Document, Business | Full (§13) |
| 08 | Video AI | `video-ai` | CREATE · −40° | Takes an idea through script, storyboard and scenes to a finished video. | Image, Writing + Document, Marketing & Content, Video Search | Full (§15) |
| 09 | Video Search AI | `video-search-ai` | LEARN · 77° | Finds the exact moment inside hours of video from a plain-language question. | Video, Study, Research | Card |
| 10 | Writing + Document AI | `writing-document-ai` | CREATE · 40° | Drafts, edits and structures writing in your voice, from a note to a full report. | Research, Business, Marketing & Content, Chat | Preview |
| 11 | Truth & Verify AI | `truth-verify-ai` | TRUST · 301° | Checks claims against sources and shows what is supported, disputed or unknown. | Research, Chat, Medical Support, Writing + Document | Preview |
| 12 | Business AI | `business-ai` | BUILD & GROW · 146° | Carries one idea from market and customer through positioning, content, campaign and analytics. | Marketing & Content, Website Builder, Goal-to-Action, Research | Full (§18) |
| 13 | Goal-to-Action AI | `goal-to-action-ai` | BUILD & GROW · 130° | Turns a goal into milestones, tasks and a first next action, then tracks them with you. | Business, Agent, Automation, Study | Preview |
| 14 | Agent AI | `agent-ai` | ACT · 198° | Carries out multi-step tasks for you and pauses for approval at every consequential step. | Automation, Live AI, Code, Goal-to-Action | Preview |
| 15 | Medical Support AI | `medical-support-ai` | TRUST · 283° | Helps you understand health information and prepare for care conversations. It supports your clinician; it does not replace one. | Truth & Verify, Research, Privacy & Security | Card |
| 16 | Offline AI | `offline-ai` | TRUST · 265° | Keeps selected capabilities working without a connection, with that work staying on your device. | Privacy & Security, Writing + Document, Code | Card |
| 17 | Privacy & Security AI | `privacy-security-ai` | TRUST · 247° | Scoped permissions, encryption and a visible record of what Shakir accessed and why. | Offline, Live AI, Agent, Medical Support | Card |
| 18 | Human Talent AI | `human-talent-ai` | HUMAN · 180° | Matches skills to roles and teams, and maps the path from where you are to where you want to be. | Skill, Business, Marketing & Content | Card |
| 19 | Marketing & Content Creator AI | `marketing-content-ai` | BUILD & GROW · 162° | Plans and produces campaign content across channels, consistent with one brand voice. | Business, Writing + Document, Image, Video | Preview |
| 20 | Automation AI | `automation-ai` | ACT · 214° | Builds workflows you can see, trigger to action, and verifies each run before calling it complete. | Agent, Code, Business | Full (§19) |
| 21 | Live AI / Screen & Device AI | `live-ai` | ACT · 230° | Sees only what you share, guides first, and acts only with your approval, with a visible LIVE indicator. | Agent, Privacy & Security, Code, Automation | Full (§20) |

`shortName` for node labels: "Image AI", "Writing AI", "Marketing AI", "Live AI", "Truth & Verify", "Privacy & Security", "Website Builder", "Goal-to-Action"; all others as named.

**Icons (brief §11, "distinctive icon").** 21 glyphs in `components/features/icons/`, each a 24×24 SVG of 3–7 triangles cut from one 6×6 triangular lattice ("the facet grid"), filled with the world's three tones. Concepts: Chat = faceted speech facet; Study = open-book facets; Skill = seven-notch arc; Research = faceted magnifier; Image = low-poly mountain with sun facet; Code = two chevron facets; Website Builder = faceted browser frame; Video = faceted play triangle; Video Search = play triangle with a marker facet; Writing = faceted nib; Truth & Verify = check inside a shield facet; Business = rising facet steps; Goal-to-Action = target with an arrow facet; Agent = two linked facets with a pause bar; Medical Support = cross inside a soft facet (no heart, no pulse); Offline = facet with a severed link; Privacy & Security = faceted lock; Human Talent = two facet silhouettes; Marketing = faceted megaphone; Automation = three facets joined by a line; Live AI = faceted screen with a dot. One shared `<FeatureIcon id size />` component; icons are inline SVG, ~0.3 KB each.

## G.2 FeatureUniverse

### G.2.1 Desktop geometry (≥1024px and `pointer: fine`)

- **Design space** 1200×900, center (600, 470). Stage height `clamp(720px, 100vh, 960px)`; the universe scales by `min((vw − 64) / 1200, (stageHeight − 96) / 900)`. One DOM for all breakpoints: nodes are `<button>` elements positioned with CSS custom properties (`--angle`, `--r`) from `data/features.ts`; an `aria-hidden` SVG beneath draws constellation lines and beams. No layout shift between SSR and hydration because position is pure CSS.
- **Center cluster.** ShakirOne core = official logo (`<Logo variant="core" />`, 112px tall) at the exact center. Around it the **Chat AI node** is a gold faceted ring, r = 88px, 2px, 12 trapezoid segments, rotating one revolution per 90s; label "CHAT AI" at the 6 o'clock point of the ring, "SHAKIR ONE" in 10px tracking 0.2em under the logo. The ring is the hoverable/focusable Chat node; the logo itself is not interactive (it is the system, not a feature).
- **World arcs (clockwise from 12 o'clock), node pitch inside the arc = arc / n, node at `start + (i + 0.5) · pitch`:**
  CREATE −50°…50° (5 nodes, pitch 20°) · LEARN 50°…122° (4, 18°) · BUILD & GROW 122°…170° (3, 16°) · HUMAN 170°…190° (1) · ACT 190°…238° (3, 16°) · TRUST 238°…310° (4, 18°).
  Website Builder sits at exactly 0° (top center, the flagship); Human Talent at exactly 180° (bottom); TRUST on the left, "the base". Node order inside each world is fixed so related siblings touch across world borders (Writing 40° next to Research 59°; Live AI 230° next to Privacy & Security 247°; Skill 113° next to Goal-to-Action 130°).
- **Radii.** Base R = 300px; nodes alternate R + 24 / R − 24 within each world (even index outward) so the ring reads as a constellation, not a pie chart. World labels at r = 440 at the world's center angle: 11px, uppercase, tracking 0.2em, world hue at 70%. Position `x = 600 + r·sin θ`, `y = 470 − r·cos θ`.
- **Node sizes.** Gem 56px (cinematic tier adds a 72px faceted halo ring at 30% opacity; card tier gem 48px). Hit area is the button, minimum 56×56. Feature icon 16px at the gem's center.
- **Nodes are low-poly gems.** Each gem is an inline SVG of 8 triangles sharing the center, irregular heptagon silhouette, three-tone fill from the world token, 1px inner edges at 20% soft white. Triangle budget: 21 gems × 8 = 168 triangles plus the halo rings; the SVG layer is static except on hover.
- **Lines.** Sibling constellation lines (straight, 1px, graphite at 18%) link consecutive nodes within a world: 14 lines. Cross-world connections are drawn only on hover as quadratic Béziers whose control point is the midpoint pulled 25% toward the center (visually: everything routes near Shakir One).
- **Behind the stage** `LowPolyScene intensity={0.35} density="sparse" depth={0.4} motion="drift" palette="universe" interactive performanceLevel={profile}`: 240 / 120 / 60 / static triangles for HIGH / MEDIUM / LOW / REDUCED_MOTION. Pointer parallax: node layer ±8px, scene ±16px (HIGH and MEDIUM only).
- **Labels are always identifiable.** A quiet `shortName` label (12px, soft white 55%) is always present radially outside each node; the hover sequence raises it. Nodes must be identifiable without hover (accessibility and plain usability).
- **Entrance (plays once, `ScrollTrigger once: true` at 35% visibility, 1,400ms total).** Center fades in 0–300ms → nodes appear in world order 300–1,000ms (35ms stagger, scale 0.6→1, facets settle from ±10° rotation) → constellation lines draw 700–1,300ms → world labels 1,100–1,400ms. Handoff from ChatDemo: SceneController FLIPs the five lit capability chips of the chat reply (Research, Business, Website Builder, Content Creator, Goal-to-Action) into their node positions before the remaining 15 nodes appear. The stage is not pinned (exploration needs a static stage).

### G.2.2 Hover / focus sequence (brief §11, identical for `:hover` and `:focus-visible`)

| t | Event |
|---|---|
| 0 ms | Gem scales 1 → 1.25 (260ms, `power3.out`), each facet rotates ±6° independently (facet "breathing"), halo ring to 60%. |
| 80 ms | Feature name rises from 6px below to its prominent position above the gem (14px, 100%, 220ms). |
| 180 ms | Blurb fades in under the name (max 2 lines, 320px, 220ms). |
| 220 ms | Connected capabilities illuminate: `ShakirBeam mode="travel"` runs from the hovered gem to each connected gem along the Bézier (420ms each, 60ms stagger, gradient stroke from source hue to target hue, 6px head dot with a radial-gradient glow, 60px dash trail). Connected gems scale 1.1, facets +10% lightness, labels to 90%. Unrelated gems dim to 45%, their labels to 25%. World labels unchanged. |
| leave | Everything reverses at 1.6× speed; beams fade (not retraced). A new hover kills the running timeline (`overwrite: 'auto'`), so the sequence is interruptible (brief §28). |

Chat AI hover: beams to its four primary connections, and all 20 gems lift to 50% facet lightness (it connects everything, brief §10).

### G.2.3 Selection → feature-detail experience

- **URL.** `/features/[slug]` is a real static route (`generateStaticParams` for the 21 slugs). From the home page it opens through a Next.js intercepting route (`app/@modal/(.)features/[slug]/page.tsx`) so the home page stays mounted, scroll position is preserved and the browser Back button closes it. A direct load of `/features/code-ai` renders the same `FeatureDetail` as a full page with a reduced `LowPolyScene` header and a "Back to the universe" link to `/#features` (scrolls to the stage, focuses the node).
- **Open (480ms).** GSAP Flip from the node gem (`.fu-gem`) to the 72px gem in the detail header; backdrop deep graphite 92% + `backdrop-filter: blur(12px)` fades in 300ms; the universe behind scales to 0.94, blurs 8px, drops to 30% and its LowPolyScene receives `motion="paused"`; detail content rises 24px → 0 in three staggered groups (60ms). `ShakirBeam mode="trace"` runs once around the detail frame (1.2s) and fades over 0.8s (brief §08: no permanent border). `#page-root` gets `inert`; `useScrollLock` locks html; SceneController pauses home ScrollTriggers.
- **Contents (`components/features/FeatureDetail.tsx`, column max 1,120px).** `FeatureDetailHeader` (gem, world tag in world hue, name, blurb) → `description` (2–3 sentences, content-rule voice) → `FeatureDemoSlot` (dynamic import of the demo component in **user-stepped** mode; cinematic tier shows the full demo, preview tier the interactive preview, card tier the illustrated card) → `FeatureConnections` ("Works with": connected gems as 40px nodes; clicking crossfades to that feature's route, a beam links old to new header gem) → `FeatureInOne` (one line: how ShakirOne routes to it, e.g. "Routed when a request needs working code; always followed by a test run.") → CTA "ENTER SHAKIR" → `FeatureDetailNav` (previous / next in world order, 44px targets).
- **Close.** Esc, the 44px close button (top-right), backdrop click or Back. Reverse Flip 360ms, focus returns to the originating node, ScrollTriggers resume. Hovering a node for >150ms prefetches that feature's demo chunk.

### G.2.4 Keyboard model

- The stage is `role="group" aria-label="Shakir feature universe"` with a **roving tabindex**: one Tab stop; focus lands on Chat AI (center).
- `ArrowRight` / `ArrowLeft`: next / previous node in reading order (center, then clockwise through the 20 ring nodes). `ArrowDown` / `ArrowUp`: first node of the next / previous world. `Home` = center, `End` = last TRUST node. Type-ahead: a letter jumps to the next node whose `shortName` starts with it. `Enter` / `Space` opens the detail. `Esc` closes the detail and returns focus.
- Each button's accessible name is "{name}, {world} world"; `aria-describedby` points to its blurb. Focus ring: 2px soft white outline at 4px offset, following the gem's polygon via `outline` on the button (never removed).
- "View as list" link (top-right of the stage) switches to `FeatureList`: a semantic `<ul>` grouped by world with the same buttons, used also as the no-JS render and the REDUCED_MOTION default.

### G.2.5 Mobile recomposition (<1024px, or `pointer: coarse`)

- Same DOM, flow layout: worlds become a **vertical sequence of constellation bands** in the order Center → CREATE → LEARN → BUILD & GROW → HUMAN → ACT → TRUST. Each band: world name + one-line meaning ("CREATE — make things: images, video, words, websites, code"), then nodes in a two-column zigzag (gems 64px, name and blurb always visible under each gem, 16px side gutter, 20px vertical rhythm). A vertical constellation line joins consecutive nodes within the band; nothing overlaps.
- Center band: logo 80px tall, Chat AI ring r = 64, "CHAT AI" and "SHAKIR ONE" labels.
- No hover: tap opens the detail directly (labels and blurbs are already visible). Cross-world connections appear as "works with" chips (24px, world-hued dot + shortName) under each node; tapping a chip jumps to that node. No beams across bands.
- Entrance per band: a 300ms fade + 12px rise, once, at 30% visibility. Tablet portrait (768–1023) uses this layout; tablet landscape ≥1024 uses the constellation with scale ≈ 0.85.

## G.3 ShakirOne (brief §09)

Pinned scene, **420vh desktop / 300vh mobile / none in REDUCED_MOTION** (becomes a two-state static composition with a step control). One ScrollTrigger, one scrubbed master timeline (`scrub: 0.6`) built in `animations/timelines/shakirOne.ts`. The 20 capability nodes are the same gems and angles as the universe at a tighter radius **r = 220** (the system you just explored, pulled together), gem size 40px, names at 11px 40%.

| Progress | Brief step | What happens |
|---|---|---|
| 0.00–0.08 | — | "ONE SHAKIR." (display size, top-left on desktop, centered on mobile) settles; the incoming environment calms to a dark field; the core (logo, 112px) is present at center at 70% with its gold ring still. |
| 0.08–0.26 | nodes appear | 20 gems appear in world order, scale 0.5 → 1, 0.009 progress apart; each arrives from 40px further out (they come in toward the core). |
| 0.26–0.40 | connections form | 20 radial lines draw core→node (stroke-dashoffset scrub), then 14 sibling lines; 1px, graphite 30%. |
| 0.40–0.52 | light travels | Three `ShakirBeam` pulses, scrubbed: inward along all radials (ask), a single gold pulse of the ring (route), outward along all radials (result). Hues: node hue → gold inward, gold → node hue outward. |
| 0.52–0.62 | all nodes connect | The 37 directed connections from G.1 draw as Béziers → a mesh; nodes drift 12px inward; mesh brightens to 55% in unison. |
| 0.62–0.70 | SHAKIR ONE activates | A light pass crosses the logo left→right (1 pass, a masked 18%-white gradient overlay, the pixels of the logo are untouched); the gold ring brightens to 100% and one halo circle scales 1 → 1.6 while fading 0.5 → 0; "You ask. / Shakir figures out what comes next." fades in under the core. |
| 0.70–1.00 | request flow | The mesh and nodes fade to 18% and stay as background texture; the message moves up to caption position; the request-flow diagram draws across 1,120px with the beam traveling stop by stop (0.03 progress per hop). |

**Request-flow diagram.** Seven stops on one horizontal line (136px pitch, desktop) — USER REQUEST → **SHAKIR ONE** → UNDERSTAND → ROUTE → [CREATE / RESEARCH / BUILD / ACT] → VERIFY → RESULT. Stops are faceted pills (124×40, hexagonal ends, 1px world-trust edge); the SHAKIR ONE stop is the logo at 40px (the core is literally in the path); the branch stop is a vertical stack of four 124×32 pills with ROUTE fanning out to all four and all four converging into VERIFY. The example request lights RESEARCH and CREATE only; BUILD and ACT stay at 35% with "not needed for this request". VERIFY in `--world-trust`, RESULT in soft white. Mobile: vertical spine, branch as a 2×2 grid, pills full width. Drawn as SVG lines + DOM pills; `ShakirBeam mode="travel"` on each connector.

**Copy.**
- Headline: "ONE SHAKIR." · Message: "You ask. Shakir figures out what comes next." (both verbatim).
- Supporting line (0.62): "Twenty-one capabilities. One system that reads the request, chooses what it needs, runs it in order and checks the result before it reaches you."
- Stop captions (12px, appear as the beam arrives): USER REQUEST "Summarize this contract and draft a reply." · SHAKIR ONE "One entry point." · UNDERSTAND "Two jobs: read, then write. The reply depends on the summary." · ROUTE "Research AI first, Writing + Document AI second. Nothing else." · RESEARCH "Reads the contract; pulls out obligations, dates, amounts." · CREATE "Drafts the reply from the summary, in your tone." · VERIFY "Checks every figure in the reply against the contract." · RESULT "Summary, draft reply, and the three clauses worth a second look."

**The official logo is the core.** `<Logo variant="core" />` renders the client-supplied transparent asset at its native proportions; nothing is drawn on top of it except the time-limited light pass. Until the transparent/SVG version arrives, development uses the source PNG unmodified on a soft-white rounded plate behind a `TODO(brand)` flag; no production build ships with the white-background PNG, and the generator watermark must be absent from the delivered asset (requested from the client, never retouched by us). Exit state: core + mesh at 18% → SceneController drains hue and density over the next 60vh into the Trust scene.

## G.4 Demonstrations §12–§20

### G.4.0 Shared scaffolding (every demo uses it; brief §28 centralization)

- `components/demonstrations/DemoStage.tsx`: the low-poly frame (≈40 facet triangles, world-hued edge), the `DemoSteps` rail that shows the brief's exact step labels, the `EXAMPLE` tag, a replay button, and the mode switch. `useDemoTimeline(steps, build)` creates one GSAP timeline with a label per step; **scrub mode** (desktop/tablet home page) attaches a pinned ScrollTrigger (`scrub: 0.6`); **stepped mode** (feature-detail, mobile, LOW profile, REDUCED_MOTION) exposes `StepControl` (a `tablist`; arrow keys and clicks `tweenTo(label)`). Timelines live in `animations/timelines/demos/<name>.ts`; components wrap them in `gsap.context()` and revert on unmount.
- **Loading.** Each demo is a `next/dynamic` chunk that loads when its section start is within 150% of the viewport (IntersectionObserver rootMargin); image assets load at 200%. DOM demos SSR their final state (SEO and no-JS); canvas demos SSR a poster.
- **Mobile rule (<768px).** No pins. A demo autoplays once at 50% visibility, with the step strip across the top and a replay button; momentum scrolling makes scrubbing unreliable. Tablet (768–1023): pins at 70% of desktop length. LOW profile: never autoplays, stepped only.
- **Reduced-motion rule.** No pins, typing, particles or travel; every state reachable through `StepControl`; transitions are opacity-only crossfades ≤200ms; LowPolyScene in REDUCED_MOTION profile is a static composition.
- **Creation Engine chapter (§13–§20).** Eight separate pinned sections (not one 1,400vh pin: independent lazy loading, simpler ScrollTrigger math, easier debugging), with a persistent `CreationEngineRail` (eight ticks, fixed right edge, click = `scrollTo`) and matched exit/entry states so the frame appears continuous. Handoffs: finished website → shards → Image particles; last image → first storyboard frame; video timeline → Code terminal line; Code preview → Skill central node; seven panels → eight Business stages; analytics line → Automation's first connector; Automation COMPLETE node → Live AI device frame; Live AI VERIFY node → ShakirOne core.
- **E2E hooks.** Every step sets `data-step="<label>"` on the stage for the quality gate (brief §32).

### G.4.1 §12 Chat AI — `ChatDemo` (scene before the universe)

- **Chain:** user request → Shakir understands → Research → Business → Website Builder → Content Creator → Goal-to-Action.
- **What the viewer sees.** A 720px glass chat panel inside a low-poly frame; on the right, a five-gem mini-constellation (desktop). (1) The user message "Help me turn my idea into a business." types at 38ms/char. (2) `ShakirBeam mode="trace"` runs once around the panel (900ms, brief §08) and three understanding lines appear under the message: `Goal · launch a business` · `Input · an idea (one line is enough)` · `Output · a plan, first assets, next actions`. (3) The reply "Here's how I'd approach it:" then five rows, each row activating with its gem: **Research AI** "Check the market, comparable sellers, price band" → `4 comparable sellers found · typical price $38–$64 per set`; **Business AI** "Draft positioning and a simple model" → `Small-batch ceramic tableware for people who host`; **Website Builder AI** "Prepare a storefront" → `Storefront draft: 5 pages, waiting for your photos`; **Marketing & Content Creator AI** "Write launch content" → `Launch post, 3 product descriptions, 1 email`; **Goal-to-Action AI** "Turn it into a 30-day plan" → `12 tasks · first: photograph 6 pieces this week`. Each activation sends a beam from the row to its gem (420ms). (4) Closing line: "Want me to start with research, or review the plan first?" with two quiet buttons (Trust in the first demo).
- **Build.** DOM + one GSAP timeline; typing via GSAP TextPlugin; gems from `FeatureIcon`; no images. ≈9 KB gz. Desktop pin 220vh, scrubbed. Mobile: autoplay once, gems become inline chips at the row start. Reduced motion: full conversation rendered, rows lit; StepControl steps the five activations.
- **Takeaway (closing caption):** "One request. Five capabilities, in the right order, with you approving the next step. That is what makes Shakir more than a chatbot."

### G.4.2 §13 Website Builder — `WebsiteBuilderDemo`

- **Chain:** PROMPT → SHAKIR UNDERSTANDS → DESIGN SYSTEM → COMPONENTS APPEAR → IMAGES APPEAR → COPY APPEARS → ANIMATIONS ACTIVATE → RESPONSIVE PREVIEW → WEBSITE COMPLETE.
- **What the viewer sees.** Left: a 9-step rail; right: a 1,120×700 preview canvas (scaled to fit) that is a real DOM mini-site, not an image. (1) "Build a luxury architecture website." types. (2) Understanding chips: `Sector · architecture studio` · `Tone · quiet, material, editorial` · `Pages · Home, Projects, Studio, Process, Contact`. (3) Design-system panel fills with real tokens, line by line: `--color-ink #0E0F12`, `--color-stone #E9E5DD`, `--color-brass #B89B5E`, `font-display "Cormorant Garamond" 600`, `font-body "Inter" 400`, `space 8px scale`, `radius 0`, `grid 12 col / 80px gutter`. (4) Components appear as named wireframe blocks that fill in: `Nav`, `Hero`, `ProjectGrid (4)`, `Studio`, `Process (3 steps)`, `Contact`, `Footer`. (5) Four photographs fade into `Hero` and `ProjectGrid`. (6) Copy types in: hero "Buildings that hold light." / "Residential and cultural architecture, designed from the site outward." / project captions "Hillside House, 2024", "Reading Room, 2023". (7) The mini-site's own GSAP timeline plays: hero text rises, grid staggers, a brass hairline draws under the nav. (8) The canvas reflows through desktop (1,120) → tablet (768) → mobile (390) using container queries, ending with all three frames side by side. (9) Checklist: `7 sections · 4 images · 3 breakpoints · links, contrast and mobile layout checked`.
- **Build.** DOM mini-site with `contain: layout paint` and `@container` rules; GSAP timeline; the design-system panel and component list are DOM. Assets: 4 architecture photographs (licensed or client-supplied, 1,200px AVIF + WebP fallback, ≈45 KB each, 180 KB total, LQIP inline). ≈18 KB gz JS. Desktop pin 260vh (the longest demo; it is the flagship). Mobile: autoplay once, one device frame at a time, step strip on top. Reduced motion: nine static states, crossfade.
- **Takeaway:** "A real site system — tokens, components, copy, three breakpoints — not a screenshot."

### G.4.3 §14 Image AI — `ImageDemo`

- **Chain:** TEXT → GEOMETRIC PARTICLES → IMAGE FORMATION (+ variations).
- **What the viewer sees.** Prompt "A glass pavilion at dusk, low-poly, warm light inside." types; its letters dissolve into triangles that scatter, then converge onto positions sampled from the target image (edges + luminance); the triangles settle into a low-poly mosaic of the image, the photograph crossfades in beneath, the mosaic fades. Then a 4-image gallery (the same pavilion at dusk / at dawn / in snow / an interior) with a faceted wipe transition (12-triangle SVG clip-path, 700ms) stepped by the user (arrows, dots, keyboard).
- **Build.** Canvas 2D for particles — 1,200 / 500 / 220 / 0 triangles for HIGH / MEDIUM / LOW / REDUCED_MOTION; target positions precomputed at build time into a 1,200-point JSON per image (≈40 KB total); DOM for prompt and gallery. Assets: 4 images, 1,024px AVIF ≈60 KB each (240 KB); these images are produced for the site and approved by the client before use. ≈11 KB gz JS. Desktop pin 140vh (formation autoplays on scroll, gallery is user-stepped). Mobile: 400 triangles, 768px images. Reduced motion: prompt → image crossfade, gallery by buttons.
- **Takeaway:** "From a sentence to a finished image, with variations to choose from rather than a single take."

### G.4.4 §15 Video AI — `VideoDemo`

- **Chain:** IDEA → SCRIPT → STORYBOARD → SCENES → VIDEO.
- **What the viewer sees.** An editing-timeline rail across the bottom, a stage above. IDEA: "A 30-second launch film for small-batch ceramic tableware." SCRIPT: four lines with timecodes (`00:00 Hands at the wheel. V.O. "Made twelve at a time."` … `00:24 The table, set.`). STORYBOARD: four low-poly line-art frames (inline SVG) drop onto the rail. SCENES: each frame becomes a scene block with duration and camera note (`slow push-in`, `top-down`, `rack focus`, `wide, static`). VIDEO: the four scene stills play as a cross-dissolving sequence with gentle CSS transforms (Ken Burns) and a playhead running along the rail.
- **Build.** DOM + GSAP + SVG storyboard. No video file in the scroll scene. In the feature-detail only, an explicit "Play 6-second clip" button loads a muted 720p WebM/MP4 (≤900 KB, `preload="none"`, poster) — the one place video is justified. Assets: 4 stills, AVIF ≈50 KB each (200 KB). ≈9 KB gz JS. Desktop pin 160vh. Mobile: rail horizontally scrollable, stage above. Reduced motion: five stepped states, stills without Ken Burns.
- **Takeaway:** "Video AI works like a production — idea, script, storyboard, scenes — so you can change any stage before rendering."

### G.4.5 §16 Code AI — `CodeDemo`

- **Chain:** PROMPT → CODE → TEST → ERROR → FIX → PASS → PREVIEW.
- **What the viewer sees.** Editor pane (left), terminal pane (bottom), preview pane (right). PROMPT: "Add a 'Copy link' button to the share menu. It must still work when the Clipboard API isn't available." CODE: `copyLink.ts` reveals line by line (40ms/line) — `export async function copyLink(url: string): Promise<boolean>` using `navigator.clipboard.writeText(url)`, plus a `document.execCommand('copy')` fallback branch. TEST: `copyLink.test.ts` with two tests, "copies with the Clipboard API" and "falls back when clipboard is undefined". ERROR: terminal shows `1 passed · 1 failed` and `TypeError: Cannot read properties of undefined (reading 'writeText')` — the code touched `navigator.clipboard.writeText` without checking `navigator.clipboard`. FIX: a diff — `- await navigator.clipboard.writeText(url)` / `+ if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); return true; }` then the fallback. PASS: `2 passed · 0 failed · 412 ms`. PREVIEW: the share menu renders with the new button; the timeline clicks it and "Link copied" appears.
- **Build.** Code is highlighted at build time (static HTML, no runtime highlighter); DOM + GSAP; 12px mono. ≈8 KB gz, no assets. Desktop pin 180vh. Mobile: panes stack (code, terminal, preview). Reduced motion: seven stepped states.
- **Takeaway:** "Code AI verifies: it runs the tests, reads the failure, fixes the cause and shows the pass before it shows the preview."

### G.4.6 §17 Skill AI — `SkillDemo`

- **Chain:** 01 FOUNDATION → 02 CORE CONCEPTS → 03 DEMONSTRATION → 04 GUIDED PRACTICE → 05 COMMON MISTAKES → 06 ADVANCED APPLICATION → 07 FINAL PROJECT.
- **What the viewer sees.** A central skill gem "Public speaking" with seven low-poly video panels (160×96, faceted, play glyph, lesson number) on a heptagon of radius 260px. Panels appear 1→7 clockwise as you scroll, `ShakirBeam` links each to the next, a progress arc fills around the center. Hover/focus tilts a panel 4° and shows title and length: 01 "What a talk is for" 6 min · 02 "One idea, three supports" 9 min · 03 "A 3-minute talk, annotated" 7 min · 04 "Record your 60-second version" 12 min · 05 "Filler, pace, reading the slide" 6 min · 06 "Questions you didn't expect" 10 min · 07 "Deliver a 5-minute talk and get feedback" 15 min. Panels are illustrated frames, not playable; in the detail experience a panel click opens the lesson outline as text.
- **Build.** SVG panels (7 inline low-poly thumbnails, ≈6 KB total) + DOM labels + GSAP. ≈7 KB gz. Desktop pin 140vh. Mobile: skill at top, seven panels in a vertical list with the beam as a spine. Reduced motion: all seven visible, no orbit, stepped highlight.
- **Takeaway:** "Skill AI teaches in a fixed seven-step arc — practice and mistakes included — ending in a project you actually make."

### G.4.7 §18 Business AI — `BusinessDemo`

- **Chain:** IDEA → MARKET → CUSTOMER → POSITIONING → WEBSITE → CONTENT → CAMPAIGN → ANALYTICS.
- **What the viewer sees.** One SVG stage whose shapes morph between eight states (one object transforming, brief §18). IDEA: "A subscription for single-farm specialty coffee." MARKET: three horizontal facet bars, labelled `Illustrative`: `Specialty coffee at home`, `Coffee subscriptions`, `Single-origin buyers`. CUSTOMER: a persona card — "Home brewers, 28–45, buy two bags a month, care where it was grown." POSITIONING: a 2×2 map (Price × Origin transparency) with the idea's dot placed top-right. WEBSITE: the storefront wireframe (the WebsiteBuilder mini-site DOM reused at 0.4 scale). CONTENT: three content cards (launch email, farm story post, product description). CAMPAIGN: a four-week strip with send days marked. ANALYTICS: an SVG line of weekly sign-ups over 8 weeks (`Illustrative`, world-build hue, one line, no gridlines beyond a baseline).
- **Build.** SVG + GSAP MorphSVGPlugin (free since GSAP 3.13) for bars → dots → map → chart; DOM for cards; chart styling follows the site palette, one series, labelled axis, no fake precision. ≈14 KB gz, no raster assets. Desktop pin 180vh. Mobile: stage fits width, step strip on top. Reduced motion: eight stepped states, crossfade.
- **Takeaway:** "Business AI carries one idea through every stage in one connected workspace, so the market work feeds the website and the website feeds the campaign."

### G.4.8 §19 Automation AI — `AutomationDemo`

- **Chain:** TRIGGER → CONDITION → ACTION → ACTION → VERIFY → COMPLETE.
- **What the viewer sees.** A workflow canvas with hexagonal low-poly node cards and ports. TRIGGER "New order received (store)" → CONDITION "Order total ≥ $150?" with a lit `yes` branch and a dim `no → standard shipping` branch → ACTION "Create express shipping label (carrier)" → ACTION "Send thank-you email with tracking" → VERIFY "Label created · email delivered" (two checks tick in) → COMPLETE "Run finished · 3.8 s · log available". `ShakirBeam` draws each connector as the step activates; the branch not taken stays at 35% so the viewer sees a decision was made.
- **Build.** DOM nodes + SVG connectors (dash-offset draws) + GSAP; no drag-and-drop (unjustified weight for a demo). ≈8 KB gz, no assets. Desktop pin 160vh. Mobile: vertical flow, exactly the brief's arrows. Reduced motion: all nodes visible, static beam, stepped highlight.
- **Takeaway:** "Automation AI runs steps you can see, shows the branch it took, and checks the result before it calls the run complete."

### G.4.9 §20 Live AI — `LiveAIDemo`

- **Chain:** permission → SEE → UNDERSTAND → GUIDE → AUTHORIZED ACTION → VERIFY → sharing ended.
- **What the viewer sees.** A laptop frame with low-poly edges showing a spreadsheet-style app with an empty chart; the user asks "Why is this chart empty?" (0) A permission sheet appears first: "Shakir Live wants to view this window. [Allow once] [Always ask] [Don't allow]" — the demo chooses Allow once; a **LIVE** pill appears top-right: red dot pulsing at 1 Hz, "LIVE · Window shared", visible for the whole session. SEE: the beam traces the window edge once. UNDERSTAND: callout "The chart range points at column C, which is empty. Your values are in D2:D14." GUIDE: a ring highlights the range field with "Change the range to D2:D14 — or I can do it." AUTHORIZED ACTION: a second sheet "Apply this change? [Apply] [I'll do it myself]" → Apply → the field updates. VERIFY: the chart draws 13 points; "Verified: chart shows 13 values." Then "Sharing ended" and the pill switches to grey "ENDED".
- **Build.** DOM device frame, DOM app mock, SVG chart, GSAP; no video, no screenshots. ≈10 KB gz. Desktop pin 180vh (the permission sheets are shown as timeline states on the home page). In the feature-detail, stepped mode requires the viewer to click Allow and Apply themselves — the demo does not proceed without them. Mobile: phone frame, same flow. Reduced motion: seven stepped states; the LIVE dot does not pulse but stays solid red with the text label.
- **Takeaway:** "Live AI sees only what you share, when you share it; it guides first and acts only with your explicit approval, with a LIVE indicator on the whole time."

## G.5 The twelve without a dedicated demo

**Interactive previews** (`components/demonstrations/previews/`, one control each, prebuilt data, ≤8 KB gz, keyboard-operable, `EXAMPLE` tag; shown in the detail experience and as the hover demo thumbnail in the universe):

| Feature | Control | What it shows |
|---|---|---|
| Study AI | Topic selector (3: "Cell biology, exam in 2 weeks", "Spanish A2", "Linear algebra") | A 5-day plan, one plain explanation, one practice question with a reveal. |
| Research AI | Question chips (3) | Three example sources (type-labelled: paper / report / article), a synthesis paragraph with [1][2] citations, a "Show what's uncertain" toggle. |
| Writing + Document AI | Tone (Plain / Formal / Warm) × Length (Short / Full) | One paragraph morphing between six prewritten variants (crossfade). |
| Truth & Verify AI | Claim selector (3) | Verdict `Supported / Disputed / Not enough evidence`, two evidence lines, a confidence note. Never "detects all misinformation". |
| Goal-to-Action AI | Goal selector (3: "Run a 10 k in 12 weeks", "Launch a newsletter", "Read a balance sheet") | Three milestones, four first-week tasks with checkbox state. |
| Agent AI | Approve / Skip at gated steps | A five-step plan ("Book a table for four on Friday"): find → compare → choose → **confirm (needs your approval)** → add to calendar; the plan visibly waits at the gate. |
| Marketing & Content Creator AI | Channel selector (Email / Post / Product page) | One core message rendered three ways with the same brand voice. |

**Illustrated cards** (`components/demonstrations/cards/`, inline SVG + DOM, animate once in view, ≤4 KB each):

- **Video Search AI** — a timeline strip `0:00 – 1:42:00`, query "where she explains the budget", a highlighted segment at `0:47:12` with a thumbnail facet; the beam scrubs to the moment.
- **Medical Support AI** — TRUST silver, no pulse, no heart: a lab-report sketch → three plain-language notes → "Three questions to ask your doctor"; fixed footer line "Shakir helps you understand and prepare. Care decisions stay with you and your clinician."
- **Offline AI** — a connection glyph switches to offline; the capability list shows which keep working on-device and which pause with "needs a connection". **[client to confirm the exact list]**
- **Privacy & Security AI** — a permission ledger: `Camera — not granted` · `Screen — granted once, ended 14:02` · `Files — folder "Invoices" only` · line "Every access is listed here."
- **Human Talent AI** — two columns (skills ↔ roles) joined by facet lines; a growth path "Junior designer → Product designer: three skills to build" linking to Skill AI.

## G.6 Trust section (brief §21)

- **Purpose and placement.** The calm after ShakirOne's activation and before the Final CTA. Not pinned; min-height 100vh on desktop, auto on mobile; more whitespace than any other scene (section padding 160px desktop / 96px mobile).
- **Reducing intensity.** Geometry: `LowPolyScene intensity={0.12} density="sparse" depth={0.2} motion="drift" palette="trust" interactive={false}` — 60 / 40 / 24 / static large, slow triangles, one 12-second drift, no pointer response. Color: graphite + soft white only, with `--world-trust` as the sole accent; no world hues, no gold. Motion: no pin, no scrub, no traveling beam; items fade in once (400ms, 90ms stagger, 8px rise); no hover scale on anything. The beam **rests**: one static 1px horizontal line under the headline at 30% opacity, the only place on the site where `ShakirBeam mode="rest"` is used — energy at rest.
- **Layout.** Desktop: two columns. Left: "POWER WITH CONTROL." (display size, soft white), one paragraph, "Read the security overview" text link. Right: six items in a 2×3 grid, each a 20px flat line icon (not faceted, deliberately quieter than the feature gems), a title in small caps, two lines of copy. Mobile: single column, items in a one-column list with 24px spacing.
- **Copy** (all product-behaviour statements marked **[client to confirm]** must be verified before launch, brief §29):
  - Paragraph: "Shakir can do a great deal. It does it inside limits you set, with results you can check and actions you approve."
  - PERMISSIONS — "Shakir asks before it reaches your files, screen or accounts. Each permission is scoped to a task and can be withdrawn."
  - PRIVACY — "Your work stays your work. You decide what Shakir can see, and what it keeps." **[client to confirm retention behaviour]**
  - VERIFICATION — "Results are checked before they are presented: code is tested, claims are sourced, actions are confirmed."
  - USER APPROVAL — "Anything that changes something — sending, buying, publishing, editing your screen — waits for your go-ahead."
  - SECURITY — "Data is encrypted in transit and at rest. Access is logged and reviewable." **[client to confirm]**
  - TRANSPARENCY — "Shakir shows what it did, which capability did it and why, so every step can be reviewed."
- **Entry/exit.** Entry: over the 60vh after ShakirOne's end, SceneController fades hue and triangle density down to the Trust profile. Exit toward the Final CTA (owned by that section): the Trust scene hands over a sparse, monochrome field that the CTA's "thousands → one symbol" sequence refills.

## G.7 Budgets and profiles

| Scene | JS (gz, est.) | Assets | Triangles HIGH / MEDIUM / LOW / REDUCED | Scroll length desktop / mobile | Mode |
|---|---|---|---|---|---|
| FeatureUniverse | 14 KB (+21 icons 6 KB) | none | 240 / 120 / 60 / static backdrop; 168 gem facets | 100vh stage / auto bands | static, entrance once |
| ShakirOne | 12 KB | logo asset only | 20 gems + 71 lines (SVG); backdrop 160 / 80 / 40 / static | 420vh / 300vh pin | scrubbed; stepped in REDUCED |
| ChatDemo §12 | 9 KB | none | frame 40 | 220vh / autoplay once | scrubbed |
| WebsiteBuilderDemo §13 | 18 KB | 4 photos, 180 KB | frame 40 | 260vh / autoplay once | scrubbed |
| ImageDemo §14 | 11 KB | 4 images 240 KB + 40 KB point data | 1,200 / 500 / 220 / 0 particles | 140vh / autoplay once | scrubbed + stepped gallery |
| VideoDemo §15 | 9 KB | 4 stills 200 KB; 900 KB clip in detail only, on click | frame 40 | 160vh / autoplay once | scrubbed |
| CodeDemo §16 | 8 KB (incl. prehighlighted HTML) | none | frame 40 | 180vh / autoplay once | scrubbed |
| SkillDemo §17 | 7 KB | 7 inline SVG thumbs 6 KB | frame 40 + 7 panels | 140vh / autoplay once | scrubbed |
| BusinessDemo §18 | 14 KB (+MorphSVG shared 10 KB) | none | frame 40 | 180vh / autoplay once | scrubbed |
| AutomationDemo §19 | 8 KB | none | frame 40 | 160vh / autoplay once | scrubbed |
| LiveAIDemo §20 | 10 KB | none | frame 40 | 180vh / autoplay once | scrubbed; gated clicks in detail |
| 7 previews + 5 cards | ≤8 KB / ≤4 KB each, loaded only in detail | none | — | — | user-driven / once in view |
| Trust §21 | 3 KB | none | 60 / 40 / 24 / static | ~120vh / auto | fades once |

Totals the home page can pay for: ≈700 KB of lazy raster assets across the three demos that need them, zero autoplay video, all demo JS split into chunks that load within 150% of the viewport. Profile selection (HIGH / MEDIUM / LOW / REDUCED_MOTION) is read once from SceneController and passed as `performanceLevel` to every LowPolyScene and as `profile` to every demo; demos on LOW never autoplay and ImageDemo on LOW runs 220 particles, on REDUCED_MOTION none.
## E. Low-poly art system

Scope: brief §01, §02, §03, §05, §06, §24, §25, §27. Everything below is derived from the official logo as measured (1024×1024 PNG, object bounding box x 306–882, y 30–1000 = 576×970 px, aspect 0.594; light-grey backdrop #EDEDED, not pure white; generator watermark confined to x 950–990, y 945–985, outside the object box; seams are warm dark #312225, not black; gold crown facets ≈ 27 % of the coloured area, blue/teal/green ≈ 20 %, red/magenta ≈ 20 %, violet ≈ 12 %, amber/peach ≈ 10 %).

### E.1 Visual language derived from the logo

**The one rule.** The logo is a single object whose colour walks once around its surface: cool (teal → blue → green) on the left finger and thumb, through gold/amber at the crown and knuckles, into red → magenta on the right finger, and down to violet → blue on the lower palm, where it meets teal again. Every LowPolyScene state reproduces that walk: hue is a function of angle around one hub point (the logo / Shakir One position), never a random per-triangle pick. This is what makes the environment read as "the logo's material, extended," not as generic low-poly wallpaper.

**Facet scale.** The logo shows ≈ 280 facets over a 970 px tall object; median facet edge ≈ 48 px ≈ 5 % of object height. The scene uses three z-bands with the same ratio relative to the viewport:

| Band | Share of triangles | Edge length (desktop, 1440×900) | Edge length (mobile, 390×844) | Role |
|---|---|---|---|---|
| BACK | 50 % | 2.5–4 vh (22–36 px) | 3–4.5 vh | atmosphere, fog, particles sit in front of it |
| MID | 35 % | 4.5–7 vh (40–63 px) | 6–9 vh | the readable landscape |
| FRONT | 15 % | 8–12 vh (72–108 px) | 11–15 vh | the few large facets that carry accent colour and translucency |

Smaller facets further back is the primary depth cue (see "depth" below). Facet counts per profile are in E.4.

**Rainbow distribution — the SHAKIR RAMP.** A cyclic hue ramp of 8 stops in the logo's order; `ramp(u)` with `u ∈ [0,1)`:

```
u: 0.00 cyan → 0.14 teal → 0.30 gold → 0.42 amber → 0.55 peach → 0.68 magenta → 0.84 violet → 0.95 electric blue → (wraps to cyan)
```
The logo's olive-green facets between teal and gold are produced by the ramp blend between teal and gold; green is never a token. Per facet: `u = (atan2(cy − hy, cx − hx) / 2π + seedOffset + 0.06·noise(centroid)) mod 1`, where `(hx, hy)` is the hub. A world palette (E.2) restricts `u` to a sub-range of the ramp; only CHAT + SHAKIR ONE use the whole ramp — the hub is the only place the full rainbow is allowed, mirroring the logo itself.

**Accent share.** Colour sits on a minority of the surface, against graphite. A facet is "accent" only if `noise(centroid·k) > 1 − accentShare`, with `accentShare = 0.06 + 0.22·intensity` (so intensity 1.0 ⇒ 28 % of area coloured, intensity 0.25 ⇒ 11.5 %). The noise is a ridged fBm correlated with the state's z-field, so accent facets cluster along ridgelines and along the beam path — "colour emerges through geometry, light and motion" (§03) — rather than scattering. Non-accent facets are drawn in five graphite tiers (E.2). The TRUST world caps `accentShare` at 0.08 regardless of `intensity` (§21).

**Lighting model.** Flat shading per triangle, computed on the CPU each frame from a 2.5D normal (each vertex carries z):

- Key light: fixed direction `L = normalize(−0.45, −0.65, 0.61)` (upper-left, matching the logo's lit crown facets). `lambert = 0.55 + 0.45·max(0, n·L)` — the 0.55 floor is what keeps the dark side from reading as black and the overall surface "elegant, not harsh".
- Specular lift: facets whose normal is within 10° of the half-vector get +0.12 luminance and −10 % saturation, reproducing the pale, bright crown facets.
- ShakirBeam as a moving light: for each facet, `d` = distance from centroid to the beam head; within 140 px, `beamLift = 0.35·(1 − d/140)²` added to luminance and the hue pulled 20 % toward the beam's current ramp colour. After the head passes, the facet keeps a decaying tint (`τ = 600 ms`) — this is what "refract light" (§05) means in practice: light passes through geometry and the geometry remembers it briefly.
- Pointer tilts `L` by up to ±12° (E.3), so parallax also re-lights the facets rather than only moving them.

**Translucency rules.** Graphite facets are always opaque. Accent facets may be translucent only in the FRONT band and only in the FRAGMENTS, UNIVERSE and ENGINE states (alpha 0.55, blend `source-over`; `lighter` is used only for the ≤ 24 facets within 140 px of the beam head). Because translucent facets live in one band drawn last, no pixel ever stacks more than 2 translucent layers — overlapping rainbow sheets are exactly the "visually exhausting" look §01 forbids.

**Edge treatment.** One hairline seam, `1 / DPR` px, colour `rgba(7, 8, 10, 0.55)` (reads as the logo's warm-dark seam over any facet colour). Never white edges, never glowing edges, never per-facet strokes in accent colour. Seams are drawn as one stroke call per band (3 per frame), not per triangle.

**Grain / noise policy.** One static 256×256 tileable noise PNG (≈ 6 KB), applied by CSS on the scene container at `opacity: 0.035; mix-blend-mode: overlay` — HIGH and MEDIUM only. No animated grain, no per-facet texture on canvas. It gives the "brushed" surface the logo's facets have without any per-frame cost.

**How depth is faked (no camera, no perspective matrix).** Five cues, all cheap: (1) facet size per band; (2) atmospheric fog: BACK-band colours blended 45 % toward graphite, MID 15 %, FRONT 0 %; (3) a vertical fog gradient (`linear-gradient(to top, #07080A 0 %, transparent 38 %)`) over the scene; (4) per-band parallax amplitudes 6 / 14 / 26 px (E.3); (5) the lighting floor: BACK band lambert range is compressed to 0.65–0.85 so only MID/FRONT facets have strong light/shade contrast. A CSS vignette (`radial-gradient(ellipse at 50 % 40 %, transparent 55 %, rgba(7,8,10,0.6) 100 %)`) closes the frame.

### E.2 Palette tokens

All tokens live in `styles/tokens.css` (CSS custom properties) and are mirrored as a typed object in `lib/lowpoly/palette.ts`; the scene reads the same hex values so canvas and UI never drift. Accent hexes are the logo's measured facet colours lifted ~15 % in value so they hold on graphite (the logo was lit for a light background).

**Base**

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#07080A` | page background, deepest fog, vignette |
| `--graphite` | `#121418` | scene ground tone; default facet colour |
| `--charcoal` | `#1C1F25` | panels, cards, lit graphite facets |
| `--slate` | `#2A2E36` | borders, brightest graphite tier, disabled text |
| `--mist` | `#F2F1EC` | primary text, particles, logo sheen (warm, matching the logo backdrop's warmth) |
| `--mist-60` | `#A7ABB4` | secondary text |

Graphite facet tiers (lighting output is quantised to these five so the surface stays calm): `#0E1013 · #121418 · #171A1F · #1C1F25 · #2A2E36`.

**Accents (brief §03 list, in ramp order)**

| Token | Hex | Logo source facet | Ramp `u` |
|---|---|---|---|
| `--cyan` | `#5EC4E0` | #6CADC3 (thumb tip) | 0.00 |
| `--teal` | `#3FA99B` | #509C92 (thumb) | 0.14 |
| `--gold` | `#D9B26A` | crown (#8C7255 average, lit facets) | 0.30 |
| `--amber` | `#E0923A` | #D98724 (knuckle) | 0.42 |
| `--peach` | `#E8A07A` | #BA4711 softened (folded fingers) | 0.55 |
| `--magenta` | `#C8508F` | #BC407F (lower palm right) | 0.68 |
| `--violet` | `#7A4FD1` | #71357D / #664D87 (lower palm) | 0.84 |
| `--blue` | `#3B6CE6` | #395E92 (lower palm left) | 0.95 |
| `--crown-gold` | `#C9A24F` | crown metal | logo framing only (E.6), never a facet colour |

**Per-world accent assignment** (each world owns a contiguous slice of the ramp; `palette` prop in E.4 selects it)

| World | Ramp slice | Primary / secondary | Logo region it echoes | Reasoning |
|---|---|---|---|---|
| CREATE | 0.42–0.68 | amber / magenta | right finger + folded fingers (the warmest, most energetic region) | making is the hot side of the hand |
| LEARN | 0.95–0.14 (wrap) | blue / cyan | left raised finger | the cool, clear side |
| BUILD & GROW | 0.26–0.42 | gold / amber | the crown | structure and achievement |
| ACT | 0.84–0.95 | violet / blue | lower palm | the base the hand stands on; drive |
| TRUST | 0.08–0.16, saturation −35 % | teal / cyan (muted) | thumb (calm sage-teal) | §21: calm, reduced intensity |
| HUMAN | 0.50–0.60 | peach / gold | knuckles | warmth, skin tone |
| CHAT + SHAKIR ONE | full ramp 0–1 | all, hub = `--gold` core | the whole logo | only the hub shows the full walk |

**Text-on-geometry contrast rules**

1. Text never sits on accent facets. Each scene passes `textSafeZones` (E.4); inside a zone facets are forced to graphite tiers, `beamLift` is zeroed and particles are culled. Zones are inset 24 px beyond the text box.
2. Measured contrast on `--graphite`: `--mist` 16.3:1 (body, headlines); `--mist-60` 7.4:1 (secondary); `--amber` 7.3:1 (the one permitted coloured headline word); `--gold` 9.5:1 (eyebrow labels). `--blue` is 3.9:1 and `--violet` 2.9:1 on graphite — never used as text under 24 px; for coloured UI text use the lifted tints `--blue-text #7EA2F5` (7.1:1) and `--violet-text #B49AF0` (8.2:1).
3. Where translucent facets are allowed (E.1) a scrim `radial-gradient(ellipse, rgba(7,8,10,0.72) 0 %, transparent 70 %)` is rendered under every text block; the scrim is part of the text component, not the scene.
4. Minimum AA target 4.5:1 for all text; AAA 7:1 for body copy; verified by an automated contrast check over the 8 poster images at the text positions (ties into section K).

### E.3 Rendering decision and mesh model

**Decision: Canvas 2D is the primary renderer for LowPolyScene.** SVG is used for ShakirBeam, posters and icons; CSS for grain, fog, vignette, scrims and the logo sheen. WebGL is not used in v1.

- Why not SVG for the live mesh: 1,200–2,400 `<polygon>` nodes updated 60×/s means attribute writes plus layout/paint on thousands of DOM nodes; measured budgets for this pattern are ~12–20 ms/frame on a mid-range laptop, which fails §22. SVG is right for ≤ 300 mostly static shapes (posters, beam, icons).
- Why Canvas 2D meets §25: the whole per-frame job is typed-array lerps (≈ 13 k float ops at HIGH) and ≤ 2,400 `fill` calls at DPR ≤ 1.5, which lands at 4–6 ms/frame on a 2019 i5 laptop and ≈ 9 ms on a 2021 mid Android — within a 16.7 ms budget with GSAP's scroll work. One `<canvas>` element, no framework, no shader pipeline, ≈ 14 KB gzipped for the engine plus `delaunator` (≈ 5 KB gz).
- Colour strings are the known Canvas hot spot: facet colours are quantised to 12-bit (4/4/4) and looked up in a prebuilt 4,096-entry `fillStyle` LUT; opaque triangles with the same quantised colour inside one band are batched into one path, so a HIGH frame is typically 300–500 fill calls, not 2,400.
- **When WebGL is justified — precisely:** only if, after Milestone 3, the HIGH profile measures < 55 fps median at 1440×900 / DPR 1.5 on the reference laptop (MacBook Air M1 or an 8th-gen i5 with Intel UHD) with the full load (2,400 tris + 160 particles + beam + grain). In that case a hand-written WebGL2 flat-shaded renderer (≈ 6 KB, one VBO, one shader) is swapped in behind the same `LowPolyRenderer` interface (`draw(frame: MeshFrame): void`); Canvas 2D remains the MEDIUM/LOW path. **Three.js is never justified by this brief**: there is no camera, no materials, no scene graph, no 3D models — adding it would be the "heavy 3D framework because it sounds impressive" that §25 forbids.

**Mesh model — topology computed once, states are arrays.**

```ts
// lib/lowpoly/mesh.ts
type MeshTopology = {
  points: Float32Array;   // N·2  base (x,y) in unit space, overscanned to [-0.2, 1.2]
  tris:   Uint16Array;    // T·3  vertex indices from Delaunay (delaunator)
  band:   Uint8Array;     // T    0 BACK, 1 MID, 2 FRONT (by facet area tercile)
  cent:   Float32Array;   // T·2  centroids (cached)
};
type SceneState = {
  pos:   Float32Array;    // N·3  (x, y, z); z ∈ [0,1]
  col:   Float32Array;    // T·3  linear RGB before lighting
  alpha: Float32Array;    // T
  light: [number, number, number];
  beamPath: Float32Array; // K·2  Catmull-Rom anchors for ShakirBeam, K = 5–7
  hub: [number, number];  // the ramp origin
};
```

- **Point set**: Bridson Poisson-disc sampling seeded with `mulberry32(1021)`; radius chosen per profile so that `T ≈ 2N` hits the profile's triangle cap. Sampling order is deterministic and cumulative: points `[0, 300)` are the LOW set, `[0, 620)` MEDIUM, `[0, 1250)` HIGH. This makes every profile's mesh a refinement of the poster mesh (E.5).
- **Triangulation**: `delaunator` once at mount per profile (≈ 2 ms at HIGH). The same topology is shared by all eight states — the morph is purely per-vertex and per-triangle data with identical lengths, so blending is a lerp with no reindexing.
- **Morph targets** (eight named states; each is a pure generator `(topology, seed, viewport) → SceneState`, run at mount and cached — ≈ 360 KB total at HIGH):

| State | Brief | z-field (position) | Colour / alpha |
|---|---|---|---|
| `MOUNTAIN` | §05, §06 "mountain-like polygons" | ridged fBm, 4 octaves, horizon at 58 vh, a valley under the logo footprint | accent along ridgelines; hub at logo base |
| `FRAGMENTS` | "fragments break apart" | each triangle offset along its centroid's radial vector by 0.08–0.25 and rotated ±18° about its centroid; z randomised | alpha 0.55 on FRONT accents; accentShare ×1.3 |
| `NETWORK` | "fragments become AI network" | vertices attracted to 48 attractor nodes; z flat; node triangles enlarged | graphite with accent only at nodes; beam path connects nodes |
| `INTERFACE` | "network becomes product interface" | vertices snap to a 12-column grid forming 3 panel rectangles; z 0.2 | near-mono (charcoal/slate); accent only on one "active" panel edge |
| `UNIVERSE` | FeatureUniverse | vertices on 6 orbital rings (one per world) + hub cluster; z by ring | each ring takes its world's ramp slice; hub full ramp |
| `ENGINE` | "creation engine" | logarithmic spiral field, vertices advected by angle `θ(t)`; z rises toward centre | accent follows the spiral arms; translucency on |
| `ONE_CORE` | ShakirOne | concentric rings compressing toward the hub, centre hole = logo exclusion halo | full ramp around the hub; gold inner ring |
| `SYMBOL` | §30 "one symbol" | all vertices collapse to a 12-facet ring around the centre; everything else alpha → 0 | gold/graphite only; the official logo crossfades into the hole (E.6) — the mesh never draws the logo |

- **Blending**: `SceneController` owns one GSAP ScrollTrigger-scrubbed timeline per route and emits `progress ∈ [0,1]`. A keyframe table maps progress to `(from, to, t)`: e.g. home page `MOUNTAIN 0–0.12 → FRAGMENTS 0.12–0.22 → NETWORK 0.22–0.34 → INTERFACE 0.34–0.44 → UNIVERSE 0.44–0.62 → ENGINE 0.62–0.74 → ONE_CORE 0.74–0.88 → SYMBOL 0.88–1.0` (final values belong to section F; the engine only consumes the triple). The frame is `pos = mix(a.pos, b.pos, e)`, `col = mix` in linear RGB, `alpha = mix`, with `e = power2.inOut(t)`. During a transition a "shatter" term `sin(e·π)·0.08·noise(vertex)` is added to positions so mid-morph frames look like fragments breaking apart and reassembling rather than a mechanical slide (off in LOW; zero in REDUCED_MOTION).
- **Idle motion** (`motion` prop): each triangle rotates about its centroid ±1.5° at 0.1 Hz with a per-triangle phase (HIGH only); vertices breathe ±2 px at 0.07 Hz (HIGH/MEDIUM); 160 "points of light" particles (1–2 px, `--mist` at 40–70 % alpha) drift 4 px/s and twinkle at 0.2 Hz.
- **Pointer parallax model**: pointer position normalised to `[−1, 1]²`, smoothed with `lerp(current, target, 0.08)` per frame (≈ 180 ms settle, no overshoot). Band offsets `= pointer × depth × {6, 14, 26} px` for BACK/MID/FRONT (opposite sign for BACK so the layers shear like a parallax window). Key light tilts `±12° × pointer.x` and `±8° × pointer.y`. On coarse pointers (touch) there is no pointer input and no deviceorientation (avoids iOS permission prompts); instead a Lissajous drift with 14 s / 19 s periods at 40 % amplitude supplies the same shear so mobile still feels alive (§05).
- **Beam ↔ facets**: ShakirBeam is an SVG overlay (`<path>` with `stroke-dasharray` scrubbed by GSAP; a 1.5 px core at 100 % plus a 5 px halo stroke at 18 % alpha — no SVG filters). It reads `beamPath` from the current blended state and reports `{headX, headY, u}` back to LowPolyScene every frame; the scene applies the `beamLift`/tint/decay from E.1. The beam's colour at `u` is `ramp(u)` so a beam travelling toward the logo always arrives gold.
- **Render loop**: one `requestAnimationFrame` per scene; a scene renders only when dirty (progress, pointer, beam head or idle-motion clock changed) and only while its section is within 1 viewport of the screen (IntersectionObserver). Backing store = CSS size × `min(devicePixelRatio, dprCap)`. On unmount: cancel rAF, kill ScrollTriggers, drop typed arrays.

### E.4 LowPolyScene API and performance profiles

```ts
// components/low-poly/LowPolyScene.tsx
interface LowPolySceneProps {
  state: SceneStateName | { from: SceneStateName; to: SceneStateName; t: number }; // t ∈ [0,1]
  intensity?: number;      // 0–1, default 0.6. accentShare = 0.06 + 0.22·intensity; key-light contrast 0.25 + 0.2·intensity
  density?: number;        // 0–1, default 1. Scales the profile's point cap (0.5 ⇒ half the triangles; topology rebuilt)
  depth?: number;          // 0–1, default 0.7. Scales z range (0–0.35 vh of displacement), parallax amplitude and fog strength
  motion?: number;         // 0–1, default 0.5. Amplitude of idle rotation/breathing/particle drift; 0 freezes idle motion
  palette?: 'full'|'create'|'learn'|'build'|'act'|'trust'|'human'|'mono'; // ramp slice from E.2; 'mono' = graphite only
  interactive?: boolean;   // default true. Pointer parallax + light tilt; ignored on coarse pointers
  performanceLevel?: 'auto'|'HIGH'|'MEDIUM'|'LOW'|'REDUCED_MOTION'; // default 'auto'
  seed?: number;           // default 1021. Must match the poster's seed
  textSafeZones?: Rect[];  // viewport-fraction rects; forced graphite, no beam lift, no particles
  logoExclusion?: Rect;    // halo where no facets/particles render (E.6)
  beam?: BeamState | null; // { headX, headY, u, width } from ShakirBeam
  poster: { svg: string; raster: string; alt: string }; // first paint / no-JS / reduced motion (E.5)
  onReady?: () => void;    // first live frame drawn (IntroSequence waits for this)
  onProfileChange?: (p: Profile) => void;
  className?: string; ariaHidden?: boolean; // decorative scenes are aria-hidden; the poster alt is used when not
}
```

**Performance profiles** (`lib/lowpoly/profile.ts`)

| Setting | HIGH | MEDIUM | LOW | REDUCED_MOTION |
|---|---|---|---|---|
| Points / triangles | 1,250 / ≈ 2,400 | 620 / ≈ 1,200 | 300 / ≈ 560 | 300 / ≈ 560 (drawn once per state) |
| Particles | 160 | 80 | 24 (static) | 0 |
| Target fps / floor | 60 / 50 | 60 / 45 | 30 / 24 | n/a (no continuous animation) |
| DPR cap | 1.5 | 1.25 | 1.0 | 1.0 |
| Update rate | every frame | every frame while scrolling; idle motion at 30 Hz | 30 Hz; re-render only on scroll/pointer | on state change only |
| Parallax bands | 3 (6/14/26 px) | 2 (8/18 px) | 1 (10 px; off on touch) | off |
| Translucency | on (FRONT accents) | on, limited to 25 % of accent facets | off (alpha 1) | off |
| Per-triangle rotation | on | off | off | off |
| Transition shatter term | on | on | off | off |
| Beam lift / refraction decay | on / on | on / on | on / off | static gradient line, no travel |
| Grain overlay | on | on | off | off |
| State change | scrubbed blend | scrubbed blend | scrubbed blend | hard cut with 250 ms opacity crossfade between poster plates |
| Typical frame cost (reference laptop) | 4–6 ms | 2.5–3.5 ms | ≤ 2 ms | 0 |

**Profile selection heuristic** (`pickProfile()` runs once before the first live frame; result persisted in `sessionStorage` so route changes do not re-probe):

1. `prefers-reduced-motion: reduce` → `REDUCED_MOTION`, final. A visible "Enable motion" toggle in the footer (section K) can override it for the session.
2. Start at `HIGH`, then apply caps (a cap only lowers): `navigator.connection.saveData === true` → LOW; `deviceMemory ≤ 2` → LOW, `≤ 4` → MEDIUM; `hardwareConcurrency ≤ 2` → LOW, `≤ 4` → MEDIUM; `pointer: coarse` → MEDIUM; `viewport width < 768` → MEDIUM, and LOW if also `deviceMemory ≤ 4`; `viewport area × DPR > 4.5 MP` (4K at DPR 2) → keep level but DPR cap 1.0. `navigator.getBattery` (Chromium only, optional): level < 15 % and discharging → MEDIUM.
3. 1-second frame-time probe: the mesh is already running during the IntroSequence fragments phase (the real workload). From 300 ms to 1,300 ms after `onReady`, rAF deltas are collected; p75 > 20 ms → downgrade one level, p75 > 34 ms → two levels. The intro never waits for the probe.
4. Runtime downgrade: a rolling 120-frame window; if p75 > 22 ms in two consecutive windows, downgrade one level: the topology is rebuilt at the new point cap (a prefix of the same sampling order, so colours and positions stay coherent) and crossfaded over 400 ms. Profiles never auto-upgrade (prevents oscillation). `onProfileChange` lets ShakirBeam and FeatureUniverse drop their own effects in step.

### E.5 Static poster system

Purpose: first paint before JS (LCP), the no-JS experience, and the REDUCED_MOTION plates — all visually identical in topology and colour to the live mesh.

- **Generation**: `scripts/generate-posters.ts` runs the same `lib/lowpoly` generators in Node (no DOM dependency; the mesh module is isomorphic) at the LOW point set (300 points, seed 1021), applies the same lighting and quantised palette, and writes SVG `<polygon>` groups per band plus the fog gradient. Output: 8 states × 2 crops (desktop 1920×1080, mobile 1080×1920) = 16 SVGs at 45–60 KB raw / ≈ 18 KB gzipped each, under `public/posters/{state}-{desktop|mobile}.svg`, plus AVIF + WebP rasters of the two hero `MOUNTAIN` crops (≈ 80 KB AVIF desktop, ≈ 60 KB mobile) for the LCP image.
- **First paint**: the hero renders `<Image priority fetchpriority="high">` with the `MOUNTAIN` AVIF (WebP fallback) sized to the viewport via `sizes`; the canvas mounts over it and, after `onReady`, the poster fades out over 300 ms while the canvas fades in. Because the live mesh's first 300 points are the poster's points and colour is a pure function of `(centroid, state, seed, palette)`, the HIGH mesh is a visible refinement of the poster (facets subdivide; nothing jumps).
- **Reduced motion**: LowPolyScene renders the SVG poster for the current state inline (`<img src=…svg>`; SVG keeps facets crisp at any DPR); state changes are 250 ms opacity crossfades between two plates. Scroll still progresses the story; it just cuts instead of morphs.
- **No JS**: the hero `<img>` poster is in the server HTML; every other scene's `<noscript>` holds its state poster. Layout is reserved with explicit aspect ratios so there is zero CLS when the canvas mounts (§22).
- **Drift guard**: a visual regression test renders the live LOW mesh for each state to PNG and compares it against the poster (pixel diff ≤ 1 %); any generator change that breaks the match fails CI.

### E.6 Logo integration (no redesign, no approximation)

**Assets to request from the client** (interim rules until they arrive): (1) transparent-background PNG at 2048×2048; (2) SVG master; (3) a monochrome one-colour silhouette for ≤ 32 px uses (nav, favicon); (4) a square app-icon crop they approve. Interim: the only permitted operation on the source PNG is a crop to the object box (x 306–882, y 30–1000 — this removes the watermark without touching artwork) and a lossless alpha key of the flat #EDEDED backdrop, saved as `brand/shakir-logo-interim-cutout.png`. No repainting, no re-tracing, no vectorising by hand. The source PNG is never shown on a graphite surface uncut (its grey backdrop would read as a box).

**The `Logo` component** (`components/brand/Logo.tsx`): `variant: 'mark' | 'lockup' | 'mono'`, `height` (px or clamp), always uniform scale, `aspect-ratio: 576 / 970` reserved so it never stretches (§02). `'lockup'` places the typeset wordmark "SHAKIR AI" beside the mark — the mark is always the image; the wordmark is typography, never a replacement.

**Sizing rules**

| Placement | Mark height | Variant | Notes |
|---|---|---|---|
| Navigation | 32 px | mono below 40 px; full-colour at ≥ 40 px | facets become noise below 40 px |
| Loading screen | 56 px | full-colour | sheen loop at 1.4 s; static in REDUCED_MOTION |
| IntroSequence | 24 vh (max 300 px) | full-colour | see sequence below |
| Hero | desktop `clamp(240px, 48vh, 520px)`, right 5/12 column; mobile `clamp(150px, 26vh, 240px)` centred above the headline | full-colour | the environment frames it (below) |
| ShakirOne core | 160 px (mobile) – 220 px (desktop) | full-colour | inside the faceted lens |
| Final CTA | 36 vh (max 440 px), centred | full-colour | emerges from the `SYMBOL` ring |
| Footer | 40 px lockup | full-colour | |

**Surrounding geometry that frames it — the "pedestal field".** The mark is a tall object standing on a thin base, so the scene treats it as something standing on the landscape: (1) `logoExclusion` = the mark's box inset by −24 px: no facets, particles or beam lift render inside it, so geometry never overlaps the logo; (2) in `MOUNTAIN` and `ONE_CORE` the z-field dips under the logo footprint (a valley 1.3× the mark's width) and the facets there drop one graphite tier, giving the base a floor; (3) a soft ground reflection: a `--crown-gold` radial ellipse at 6 % opacity, 1.6× the mark's width, under the base; (4) in `ONE_CORE` and `SYMBOL` the exclusion halo is ringed by 12 (SYMBOL) or 24 (ONE_CORE) gold/graphite facets — the faceted lens — whose outer vertices are mesh vertices, so the ring morphs in and out with the environment; (5) the beam passes behind the mark at crown height on every visit and takes `--crown-gold` as it does.

**IntroSequence beats involving the logo** (timings within the 2–4 s window; the full timeline is section F): points of light 0–0.5 s → fragments and assembly 0.5–1.8 s (the frame-time probe runs here) → beam traverses 1.6–2.2 s → mark emerges 2.0–2.6 s with uniform scale 0.92 → 1.0 and opacity 0 → 1, no other transform → light passes over the logo 2.4–2.9 s: a `div` with `mask-image: url(logo)` (the logo's own alpha as mask) carrying a 120 px wide `--mist` gradient at 35 % moving left-to-right over 500 ms — the light touches only logo pixels and alters nothing → wordmark "SHAKIR AI" types in 2.8–3.2 s → the scene's `MOUNTAIN` state and the hero layout are already underneath, so the "camera" transition is the intro overlay dissolving (300 ms) while the mark travels to its hero position via a shared-element FLIP (translate + uniform scale only).

**ShakirOne core**: the mark sits in the 24-facet gold lens; capability nodes orbit at 1.9× and 2.6× the mark height; connections terminate on the lens rim, never on the logo; on activation the lens facets lift to the specular tier and the beam loops the rim once (1.2 s) then exits toward the next section.

**Final CTA**: `SYMBOL` collapse (thousands → hundreds → dozens happens by alpha quantiles: 100 % → 12 % → 1 % of triangles visible at progress 0.0 / 0.5 / 0.8 of the section) → 12-facet ring → the mark crossfades in (400 ms) at 36 vh, the ring facets fade to 20 % and hold as a halo → headline "WHAT WILL YOU CREATE?" → CTAs. The mesh never attempts to draw the hand; the hole in the ring is always exactly the official image.

### E.7 Icon style for the 21 features

One faceted glyph family (`components/brand/icons/`, 21 React SVG components, tree-shaken, ≈ 0.4 KB each) built from the same rules as the scene so a feature node and its environment read as one material.

- **Grid**: 24×24 viewBox, 2 px padding, 20×20 live area, drawn on an equilateral triangular lattice with 4 px pitch (5 rows × 10 cells). Every vertex snaps to the lattice; every edge uses one of six angles (0°, 30°, 60°, 90°, 120°, 150°). No curves anywhere — a circle is a hexagon, a pulse is a zig-zag. Sharp miter corners.
- **Facet budget**: 5–11 facets per glyph at 24 px; the 48 px feature-node size (same artwork scaled, `stroke-width` 2 instead of 1.5) may add up to 3 extra facets via a `detail` prop for the lit side.
- **Stroke**: 1.5 px seam at 24 px in `rgba(7,8,10,0.55)` on dark surfaces (`currentColor` at 55 % on light panels), matching the scene's hairline. No outer outline around the glyph silhouette.
- **Fill — three tiers, always in this proportion**: tier A, exactly one "lit facet" facing upper-left (the scene's key light), filled with the world's primary accent at 100 %; tier B, 2–4 facets in the world accent mixed 45 % with `--graphite`; tier C, the remainder in `--charcoal`. The world is passed as a prop (`world="learn"`) so the same glyph recolours per context; in the hub (ShakirOne) all 21 glyphs take their own world's colour, which is how the hub visibly becomes the full ramp.
- **Hover / focus (§11)**: the glyph scales 1.08 (transform, 220 ms), the lit facet's hue steps +0.04 along the ramp and a second facet rises to tier A; on blur both return. REDUCED_MOTION: colour change only.
- **Shared motifs**: a small 3-facet "crown notch" appears on the top edge of the three hub-adjacent glyphs (Chat, Agent, Automation) as a quiet nod to the crown; a diagonal single-facet "beam" slash marks glyphs whose feature verifies or routes (Truth & Verify, Code, Live AI, Automation).

Glyph concepts (all lattice-built, 24 px, world → lit-facet colour):

| # | Feature | World | Glyph concept |
|---|---|---|---|
| 01 | Chat AI | CHAT / hub | faceted speech gem: hexagon with one lower-left facet pulled down as the tail; lit facet top-left; crown notch |
| 02 | Study AI | LEARN | open book as two mirrored parallelograms meeting at a ridge |
| 03 | Skill AI | LEARN | seven-facet fan around a centre triangle (the seven-video arc, §17) |
| 04 | Research AI | LEARN | hexagonal lens on a 60° handle; one magenta-free inner facet reads as glass |
| 05 | Image AI + Image Search | CREATE | framed rectangle with a two-peak mountain of 3 facets and a lens hexagon in the corner |
| 06 | Code AI | CREATE | two 60° chevrons facing each other with a beam slash between |
| 07 | Website Builder AI | CREATE | browser slab: top strip of 3 small facets, body of 2 panels |
| 08 | Video AI | CREATE | faceted clapper: wedge top over a rectangle; lit facet is the wedge |
| 09 | Video Search AI | CREATE | play triangle inside a hexagonal lens |
| 10 | Writing + Document AI | CREATE | page with a folded corner (the fold is the lit facet) and 2 line facets |
| 11 | Truth & Verify AI | TRUST | shield of 4 facets with a beam slash check mark |
| 12 | Business AI | BUILD & GROW | three rising bars as parallelograms; lit facet on the tallest |
| 13 | Goal-to-Action AI | BUILD & GROW | hexagonal target with a 30° arrow of 2 facets entering it |
| 14 | Agent AI | ACT | faceted hexagon node with 3 radiating stubs; crown notch |
| 15 | Medical Support AI | TRUST | cross of 5 facets in a hexagon; muted teal lit facet |
| 16 | Offline AI | TRUST | hexagon with a severed link: two facets, a gap, no lit glow beyond tier A |
| 17 | Privacy & Security AI | TRUST | padlock: hexagonal body, shackle as 3 angular facets |
| 18 | Human Talent AI | HUMAN | head-and-shoulders as a hexagon over a trapezoid; peach lit facet |
| 19 | Marketing & Content Creator AI | BUILD & GROW | megaphone wedge of 3 facets with 2 beam lines |
| 20 | Automation AI | ACT | three hexagonal nodes joined by a zig-zag beam path; crown notch |
| 21 | Live AI / Screen & Device AI | ACT | device frame with a hexagonal "LIVE" dot that pulses by tier change (no glow) and a beam slash |

Delivered assets for Milestone 1: `styles/tokens.css`, `lib/lowpoly/{mesh,palette,profile,states/*,renderer-canvas}.ts`, `components/low-poly/LowPolyScene.tsx`, `components/brand/{Logo,icons/*}.tsx`, `scripts/generate-posters.ts`, `public/posters/*`, `public/textures/grain-256.png`, and the client asset request list in E.6.
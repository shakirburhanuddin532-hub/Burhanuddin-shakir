# Shakir AI — official website (demo build)

A cinematic, scroll-driven marketing site for **Shakir AI**: one intelligent system that connects creation,
learning, research, building, automation and action. Built from `docs/shakir-website-brief.md`.

## What is in the demo

- **Low-poly environment** — one persistent Canvas 2D scene (`src/lowpoly/`) behind the whole page. Every scene is a
  blend between two named states (ridge → fracture → network → interface → universe → engine → one → calm → collapse → symbol),
  driven by scroll. Facets are generated from a seeded Delaunay mesh; the palette is measured from the logo.
- **Opening cinematic** (3.2 s, skippable, once per session) that assembles the hero's own environment.
- **Scroll storytelling** — pinned, scrubbed scenes (`src/animations/scroll/useScene.ts`) with one master timeline each.
- **Shakir Beam** — the travelling light motif on the canvas and on SVG surfaces (`src/animations/beam/`).
- **Feature universe** — the 21 capabilities as six constellations with hover/focus/keyboard navigation and a
  detail dialog; vertical world bands on phones.
- **Creation engine** — nine demonstrations (Chat, Website Builder, Code, Image, Video, Skill, Business, Automation,
  Live AI), scrubbed on desktop, autoplayed on touch, stepped under reduced motion.
- **Shakir One**, **Trust**, **Final CTA** and footer.
- Performance profiles HIGH / MEDIUM / LOW / REDUCED_MOTION chosen by device heuristics and a runtime frame-time probe.

All product scenarios are illustrative; copy follows the brief's content rule.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static output in dist/ (relative asset paths; host anywhere)
npm run preview
```

Quality gate: `npm run check` (typecheck, lint, unit tests, build) and `npm run test:e2e` (Playwright, desktop + mobile, axe).

Developer aids: `/?intro=1` replays the intro; `/?demo=code&step=3` renders one demonstration at a step;
`node scripts/shot-page.mjs <dir>` and `node scripts/shot-demo.mjs <key> <dir>` capture screenshots.

## Structure

```
src/
  animations/   motion provider, GSAP setup, scroll scene controller, beam
  components/   brand, navigation, hero, scenes, features, demonstrations, shakir-one, trust, cta, footer
  data/         features (21), worlds, demos, navigation, copy, examples
  hooks/        reduced motion, media queries, gsap context, intro gate
  lowpoly/      engine, states, layout, palette, React provider
  styles/       Tailwind v4 tokens
docs/           brief, planning drafts, demo contract
brand/          logo source;  public/brand/  keyed-out logo in four sizes
prototypes/     earlier Aurelia prototype (unrelated to Shakir)
```

The Next.js version of this architecture is described in `docs/plan-drafts/`; this demo uses Vite + React so it can be
deployed as plain static files.

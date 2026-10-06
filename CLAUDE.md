# Shakir AI website — working notes for agents

- Brief: `docs/shakir-website-brief.md` is the source of truth. Content rule (§29): no hype, no unsupported claims.
- Stack: Vite 6, React 19, TypeScript strict, Tailwind v4 (tokens in `src/styles/globals.css`), GSAP 3 + ScrollTrigger.
- One canvas environment (`src/lowpoly/engine.ts`); scenes drive it through `useScene` (`src/animations/scroll/useScene.ts`).
  Never create ScrollTriggers elsewhere except inside `DemoChapter`.
- Demonstrations follow `docs/DEMO_CONTRACT.md`. Timeline position alone determines what is visible.
- Logo: `public/brand/shakir-logo*.png` are the only logo assets; never redraw, stretch or recolour them.
- Component classes live in `@layer components` so Tailwind utilities can override them.
- Before claiming done: `npm run check` and `npm run test:e2e`; look at screenshots from `scripts/shot-page.mjs`.

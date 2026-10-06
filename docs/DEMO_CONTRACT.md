# Demonstration component contract

Every demonstration (brief §12–§20) is one React component in `src/components/demonstrations/<Name>Demo.tsx`
with a default export of type `ComponentType<DemoProps>` (`./demoTypes.ts`):

```ts
interface DemoProps {
  tl: gsap.core.Timeline   // paused master timeline; label `step-${i}` at time i (seconds); total = steps.length s
  mode: 'scrub' | 'autoplay' | 'stepped'
  profile: 'HIGH' | 'MEDIUM' | 'LOW' | 'REDUCED_MOTION'
  reduced: boolean
  ready: () => void        // call once, after the tweens were added
}
```

Rules
- Steps (labels and order) are fixed in `src/data/demos.ts`; step `i` owns the time window `[i, i+1)`.
  Place tweens with `stepAt(i) + offset` (offset 0–0.9) and durations ≤ 0.9 so every step completes inside its window.
- Build all tweens in `useLayoutEffect` inside `gsap.context(() => {...}, rootRef)`; revert on cleanup; then call `ready()`.
  Use `tl.fromTo` so scrubbing backwards restores the previous state. Prefer `ease: 'none'` (timeline default).
- The timeline position alone must determine what is visible. No React state drives animation.
- Stage: fluid, ~860×520 on desktop, must work from 320px wide; `h-full`, no fixed widths above 100%.
- Styling: Tailwind v4 utilities + tokens (`bg-ink bg-graphite bg-charcoal text-mist text-mist-60 text-mist-40 border-slate`),
  world hues via `var(--world-create|learn|build|act|human|trust|center)` and `-text` variants, classes `.label .mono .eyebrow .panel .hairline`,
  fonts `font-display` (Sora), `font-mono` (JetBrains Mono).
- Content and visuals follow `docs/plan-drafts/G-feature-presentation.md` (section G.4.x for the demo). Content rule (brief §29):
  no hype, numbers labelled illustrative, the `EXAMPLE` tag is already provided by the frame.
- No raster images or video. SVG, CSS, DOM and (only where the plan says so) Canvas 2D.
- Animate only transform, opacity, clip-path, stroke-dashoffset/dasharray, width/height of bars, and text swaps. Keep the DOM under ~150 nodes.
- Reduced motion: gate any looping tween (`repeat: -1`) behind `!reduced`; the stepped timeline still works.
- Accessibility: root has `aria-label`; meaningful text is real DOM text; decorative SVG is `aria-hidden`; nothing depends on hover.
- Verify: `npx tsc --noEmit -p tsconfig.json`, `npx eslint <file>`, then `node scripts/shot-demo.mjs <key> <outDir>` and look at every step image.

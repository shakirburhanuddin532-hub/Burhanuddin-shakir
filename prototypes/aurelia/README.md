# Aurelia — a luxury, scroll-driven landing page for an AI product

A cinematic single-page website for **Aurelia**, a fictional private AI operating layer.
Built with plain HTML, CSS and JavaScript — no frameworks, no build step, no runtime dependencies.

## Highlights

- **Scroll-scrubbed cinematic sequence** — a pinned, full-screen canvas "film" that you scrub by scrolling.
  1,728 particles morph through four chapters (scatter → sphere → torus → lattice → wave) with a
  timecode, chapter timeline and captions, like a scroll-controlled video.
- **Hero neural orb** — a rotating particle sphere with orbit rings that reacts to the mouse and dissolves as you scroll.
- **Horizontal gallery** — a pinned section that slides four product panels sideways as you scroll down.
- **Word-by-word manifesto reveal**, animated counters, magnetic buttons, 3D tilt pricing cards,
  custom cursor, film grain, preloader with counter, and a nav that hides on scroll.
- **Inertia smoothing** on every scrubbed animation for a weighty, luxurious feel.
- Respects `prefers-reduced-motion`; works on touch devices; responsive from phones to wide desktops.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Everything is static, so it can be hosted on GitHub Pages, Netlify, Vercel or any file host.

## Structure

```
index.html            page markup and copy
assets/css/styles.css design system, layout, reveal transitions
assets/js/main.js     scroll engine: canvas sequences, pinned sections, interactions
```

Typography is loaded from Google Fonts (Cormorant Garamond + Manrope); the page falls back to system fonts offline.

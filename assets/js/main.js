/* ============================================================
   AURELIA — scroll engine
   Dependency-free: smooth inertia, pinned scroll-scrubbed
   canvas sequence, horizontal gallery, word-by-word reveal,
   counters, cursor, magnetic buttons, tilt cards.
   ============================================================ */
(() => {
  'use strict';

  /* ---------- utils ---------- */
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const SMOOTH = reduced ? 1 : 0.11; // inertia for scrubbed sections

  let vw = innerWidth, vh = innerHeight;
  let scrollY = window.scrollY;
  let time = 0;

  /* ---------- preloader ---------- */
  const preloader = $('#preloader');
  (function runPreloader() {
    const countEl = $('#preloaderCount'), barEl = $('#preloaderBar');
    const dur = reduced ? 150 : 1900;
    const start = performance.now();
    const tick = now => {
      const t = clamp((now - start) / dur, 0, 1);
      // ease with a deliberate hesitation near the end — like a needle settling
      const e = t < 0.8 ? easeOut(t / 0.8) * 0.92 : 0.92 + easeInOut((t - 0.8) / 0.2) * 0.08;
      countEl.textContent = String(Math.round(e * 100)).padStart(2, '0');
      barEl.style.transform = `scaleX(${e})`;
      if (t < 1) requestAnimationFrame(tick); else finish();
    };
    const finish = () => {
      preloader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      requestAnimationFrame(() => document.body.classList.add('is-ready'));
      setTimeout(() => preloader.remove(), 1400);
      measure();
    };
    requestAnimationFrame(tick);
  })();

  /* ---------- cursor ---------- */
  const cursor = $('#cursor');
  let cx = vw / 2, cy = vh / 2, tx = cx, ty = cy;
  if (!touch) {
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cursor.classList.add('is-visible'); }, { passive: true });
    addEventListener('mousedown', () => cursor.classList.add('is-press'));
    addEventListener('mouseup', () => cursor.classList.remove('is-press'));
    document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    $$('a, button, input, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  } else if (cursor) cursor.remove();

  /* ---------- nav + progress ---------- */
  const nav = $('#nav'), progressBar = $('#scrollProgress');
  let lastY = 0;
  function updateNav(y) {
    nav.classList.toggle('is-scrolled', y > 40);
    if (y > lastY + 6 && y > vh * 0.5) nav.classList.add('is-hidden');
    else if (y < lastY - 6) nav.classList.remove('is-hidden');
    lastY = y;
    const max = document.documentElement.scrollHeight - vh;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }

  /* ---------- measurement ---------- */
  const sections = {
    hero: $('#hero'),
    cinema: $('#engine'),
    suite: $('#suite'),
    manifesto: $('#manifesto'),
  };
  const box = {}; // top (document coords) + height
  function measure() {
    vw = innerWidth; vh = innerHeight;
    const y = window.scrollY;
    for (const k in sections) {
      const r = sections[k].getBoundingClientRect();
      box[k] = { top: r.top + y, h: r.height };
    }
    sizeCanvas(heroCanvas, heroCtx);
    sizeCanvas(cinemaCanvas, cinemaCtx);
    suiteMax = Math.max(0, suiteTrack.scrollWidth - vw);
  }
  function sizeCanvas(c, ctx) {
    c.width = Math.round(vw * DPR); c.height = Math.round(vh * DPR);
    c.style.width = vw + 'px'; c.style.height = vh + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  const pinnedProgress = (k, y) => clamp((y - box[k].top) / (box[k].h - vh), 0, 1);
  const inView = (k, y, pad = 0) => y + vh + pad > box[k].top && y - pad < box[k].top + box[k].h;

  /* ---------- hero canvas: neural orb ---------- */
  const heroCanvas = $('#heroCanvas'), heroCtx = heroCanvas.getContext('2d');
  const HERO_N = 1200;
  const heroPts = new Array(HERO_N);
  for (let i = 0; i < HERO_N; i++) {
    const y = 1 - (i / (HERO_N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * 2.399963229728653;
    heroPts[i] = { x: Math.cos(phi) * r, y, z: Math.sin(phi) * r, s: Math.random(), o: Math.random() * Math.PI * 2 };
  }
  let mx = 0, my = 0, mxs = 0, mys = 0; // mouse parallax (normalized), smoothed
  addEventListener('mousemove', e => { mx = (e.clientX / vw) * 2 - 1; my = (e.clientY / vh) * 2 - 1; }, { passive: true });

  function drawHero(p) {
    const ctx = heroCtx;
    ctx.clearRect(0, 0, vw, vh);
    if (p >= 1) return;
    mxs = lerp(mxs, mx, 0.05); mys = lerp(mys, my, 0.05);
    const desktop = vw > 900;
    const R = (desktop ? Math.min(vw, vh) * 0.36 : Math.min(vw, vh) * 0.42) * (1 + p * 0.5);
    const ox = desktop ? vw * 0.70 : vw * 0.5, oy = (desktop ? vh * 0.48 : vh * 0.34) + p * vh * 0.25;
    const fade = (1 - easeInOut(p)) * (desktop ? 1 : 0.55);
    const ry = time * 0.00011 + mxs * 0.5, rx = 0.28 - mys * 0.35;
    const cy_ = Math.cos(ry), sy_ = Math.sin(ry), cx_ = Math.cos(rx), sx_ = Math.sin(rx);

    // glow core
    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, R * 1.1);
    g.addColorStop(0, `rgba(214,179,112,${0.16 * fade})`);
    g.addColorStop(0.5, `rgba(214,179,112,${0.05 * fade})`);
    g.addColorStop(1, 'rgba(214,179,112,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, vw, vh);

    // orbit rings
    ctx.save(); ctx.translate(ox, oy);
    for (let k = 0; k < 3; k++) {
      ctx.save();
      ctx.rotate(0.5 + k * 1.05 + time * 0.00004 * (k + 1));
      ctx.scale(1, 0.18 + k * 0.12);
      ctx.beginPath(); ctx.arc(0, 0, R * (1.22 + k * 0.17), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(214,179,112,${(0.22 - k * 0.05) * fade})`; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // points
    ctx.globalCompositeOperation = 'lighter';
    const gold = [], ivory = [];
    for (let i = 0; i < HERO_N; i++) {
      const pt = heroPts[i];
      // rotate Y then X
      let x = pt.x * cy_ - pt.z * sy_, z = pt.x * sy_ + pt.z * cy_, y = pt.y;
      const y2 = y * cx_ - z * sx_; z = y * sx_ + z * cx_; y = y2;
      const f = 2.4 / (2.4 - z);
      const sx = ox + x * f * R, sy = oy + y * f * R;
      const depth = (z + 1) / 2; // 0 back .. 1 front
      const tw = 0.6 + 0.4 * Math.sin(time * 0.002 + pt.o);
      const a = (0.12 + depth * 0.75) * tw * fade;
      const size = (0.6 + depth * 1.6) * f * 0.9;
      (pt.s > 0.9 ? ivory : gold).push(sx, sy, size, a);
    }
    const paint = (arr, rgb) => {
      for (let i = 0; i < arr.length; i += 4) {
        ctx.fillStyle = `rgba(${rgb},${arr[i + 3].toFixed(3)})`;
        ctx.beginPath(); ctx.arc(arr[i], arr[i + 1], arr[i + 2], 0, Math.PI * 2); ctx.fill();
      }
    };
    paint(gold, '214,179,112'); paint(ivory, '244,239,230');
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- cinema: scroll-scrubbed sequence ---------- */
  const cinemaCanvas = $('#cinemaCanvas'), cinemaCtx = cinemaCanvas.getContext('2d');
  const captions = $$('.cinema__caption'), cinemaIntro = $('.cinema__intro');
  const cinemaTime = $('#cinemaTime'), cinemaBar = $('#cinemaBar'), cinemaChapter = $('#cinemaChapter');
  const CH = ['Chapter I — Ingest', 'Chapter II — Reason', 'Chapter III — Compose', 'Chapter IV — Deliver'];
  const N = 1728; // 12³ = 48 × 36
  const SHAPES = 5;
  const sx_ = new Float32Array(N * SHAPES), sy_ = new Float32Array(N * SHAPES), sz_ = new Float32Array(N * SHAPES);
  const tint = new Float32Array(N); // 0 gold .. 1 ivory
  (function buildShapes() {
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < N; i++) {
      tint[i] = rnd() > 0.88 ? 1 : 0;
      // 0 · cloud (scattered)
      { const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, r = Math.cbrt(rnd()) * 2.6; const q = Math.sqrt(1 - u * u);
        sx_[i] = q * Math.cos(th) * r; sy_[i] = u * r * 0.7; sz_[i] = q * Math.sin(th) * r; }
      // 1 · sphere (fibonacci)
      { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), phi = i * 2.399963229728653; const o = N;
        sx_[o + i] = Math.cos(phi) * r * 1.05; sy_[o + i] = y * 1.05; sz_[o + i] = Math.sin(phi) * r * 1.05; }
      // 2 · torus (72 × 24)
      { const u = (i % 72) / 72 * Math.PI * 2, v = Math.floor(i / 72) / 24 * Math.PI * 2, Rr = 0.95, rr = 0.36; const o = N * 2;
        sx_[o + i] = (Rr + rr * Math.cos(v)) * Math.cos(u); sy_[o + i] = rr * Math.sin(v); sz_[o + i] = (Rr + rr * Math.cos(v)) * Math.sin(u); }
      // 3 · lattice (12 × 12 × 12)
      { const gx = i % 12, gy = Math.floor(i / 12) % 12, gz = Math.floor(i / 144); const o = N * 3; const sp = 1.9 / 11;
        sx_[o + i] = -0.95 + gx * sp; sy_[o + i] = -0.95 + gy * sp; sz_[o + i] = -0.95 + gz * sp; }
      // 4 · wave plane (48 × 36)
      { const gx = i % 48, gz = Math.floor(i / 48); const o = N * 4;
        sx_[o + i] = -1.7 + (gx / 47) * 3.4; sy_[o + i] = 0; sz_[o + i] = -1.25 + (gz / 35) * 2.5; }
    }
  })();
  // lattice adjacency edges — read as structure in every phase
  const edges = [];
  for (let i = 0; i < N; i++) {
    if ((i + 1) % 12 !== 0) edges.push(i, i + 1);
    if (Math.floor(i / 12) % 12 !== 11) edges.push(i, i + 12);
    if (i + 144 < N) edges.push(i, i + 144);
  }
  const EDGE_W = [0.1, 0.45, 0.55, 1.0, 0.8]; // edge presence per shape
  const px = new Float32Array(N), py = new Float32Array(N), pd = new Float32Array(N);
  const BUCKETS = 7;
  const edgePaths = Array.from({ length: BUCKETS }, () => null);

  function drawCinema(p) {
    const ctx = cinemaCtx;
    ctx.clearRect(0, 0, vw, vh);
    const s = p * 4, k = Math.min(3, Math.floor(s)), t = easeInOut(clamp(s - k, 0, 1));
    const edgeW = lerp(EDGE_W[k], EDGE_W[k + 1], t);
    const R = Math.min(vw, vh) * (vw > 900 ? 0.40 : 0.36);
    const ox = vw * (vw > 1100 ? (k === 1 || k === 3 ? 0.62 : 0.38) : 0.5);
    const oxs = (drawCinema.ox = lerp(drawCinema.ox ?? ox, ox, 0.06));
    const oy = vh * (vw > 1100 ? 0.5 : 0.42);
    const ry = p * Math.PI * 2.4 + time * 0.00006, rx = 0.32 + Math.sin(p * Math.PI) * 0.45;
    const cy_ = Math.cos(ry), sy = Math.sin(ry), cx_ = Math.cos(rx), sxr = Math.sin(rx);
    const camera = 3.1;
    const breathe = reduced ? 0 : Math.sin(time * 0.0009) * 0.02;
    const waveT = k === 3 ? t : 0;

    // core glow
    const glowA = 0.07 + 0.05 * Math.sin(time * 0.0011) + (k === 1 ? 0.05 * t : 0);
    const g = ctx.createRadialGradient(oxs, oy, 0, oxs, oy, R * 1.25);
    g.addColorStop(0, `rgba(214,179,112,${glowA})`);
    g.addColorStop(0.55, `rgba(214,179,112,${glowA * 0.3})`);
    g.addColorStop(1, 'rgba(214,179,112,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, vw, vh);

    // project
    const oA = k * N, oB = (k + 1) * N;
    for (let i = 0; i < N; i++) {
      let x = lerp(sx_[oA + i], sx_[oB + i], t);
      let y = lerp(sy_[oA + i], sy_[oB + i], t);
      let z = lerp(sz_[oA + i], sz_[oB + i], t);
      if (waveT > 0) y += Math.sin(x * 2.2 + time * 0.0014 + z * 1.6) * 0.22 * waveT + Math.cos(z * 3.1 - time * 0.0009) * 0.08 * waveT;
      const bx = 1 + breathe;
      x *= bx; y *= bx; z *= bx;
      let x1 = x * cy_ - z * sy, z1 = x * sy + z * cy_;
      let y1 = y * cx_ - z1 * sxr; z1 = y * sxr + z1 * cx_;
      const f = camera / (camera - z1);
      px[i] = oxs + x1 * f * R; py[i] = oy + y1 * f * R; pd[i] = clamp((z1 + 1.4) / 2.8, 0, 1);
    }

    // edges — bucketed by alpha
    if (edgeW > 0.02) {
      const maxD = R * 0.19;
      for (let b = 0; b < BUCKETS; b++) edgePaths[b] = new Path2D();
      for (let e = 0; e < edges.length; e += 2) {
        const a = edges[e], b = edges[e + 1];
        const dx = px[a] - px[b], dy = py[a] - py[b];
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > maxD) continue;
        const alpha = (1 - d / maxD) * edgeW * (0.25 + 0.75 * (pd[a] + pd[b]) * 0.5);
        const bi = Math.min(BUCKETS - 1, Math.floor(alpha * BUCKETS));
        if (bi === 0) continue;
        edgePaths[bi].moveTo(px[a], py[a]); edgePaths[bi].lineTo(px[b], py[b]);
      }
      ctx.lineWidth = 1;
      for (let b = 1; b < BUCKETS; b++) {
        ctx.strokeStyle = `rgba(214,179,112,${(b / BUCKETS) * 0.42})`;
        ctx.stroke(edgePaths[b]);
      }
    }

    // points
    ctx.globalCompositeOperation = 'lighter';
    for (let pass = 0; pass < 2; pass++) {
      const rgb = pass === 0 ? '214,179,112' : '244,239,230';
      for (let b = 1; b <= 5; b++) {
        const path = new Path2D(); let any = false;
        for (let i = 0; i < N; i++) {
          if (tint[i] !== pass) continue;
          const bucket = Math.min(5, Math.max(1, Math.round(pd[i] * 5)));
          if (bucket !== b) continue;
          const size = 0.7 + pd[i] * 1.7 + (pass ? 0.4 : 0);
          path.moveTo(px[i] + size, py[i]); path.arc(px[i], py[i], size, 0, Math.PI * 2); any = true;
        }
        if (!any) continue;
        ctx.fillStyle = `rgba(${rgb},${(0.18 + (b / 5) * 0.72).toFixed(3)})`;
        ctx.fill(path);
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    // halo ring that widens with each chapter
    ctx.beginPath(); ctx.arc(oxs, oy, R * (1.35 + p * 0.25), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(214,179,112,${0.10 + 0.05 * Math.sin(time * 0.0007)})`; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(oxs, oy, R * (1.35 + p * 0.25), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
    ctx.strokeStyle = 'rgba(214,179,112,0.55)'; ctx.stroke();
  }

  function updateCinemaUI(p) {
    const s = p * 4;
    // intro title: visible before chapter 1 lands
    const introA = 1 - smooth(0.0, 0.12, p);
    cinemaIntro.style.opacity = introA.toFixed(3);
    cinemaIntro.style.transform = `translateY(${(-40 * (1 - introA)).toFixed(1)}px) scale(${(1 - 0.04 * (1 - introA)).toFixed(3)})`;
    captions.forEach((el, j) => {
      const q = s - j; // local progress for chapter j
      const fadeIn = smooth(0.12, 0.38, q);
      const fadeOut = j === 3 ? 1 : 1 - smooth(0.78, 0.98, q);
      const a = fadeIn * fadeOut;
      el.style.opacity = a.toFixed(3);
      const dy = (1 - fadeIn) * 36 - (1 - fadeOut) * 36;
      const base = vw >= 1100 ? 'translateY(-50%)' : '';
      el.style.transform = `${base} translateY(${dy.toFixed(1)}px)`;
    });
    const secs = p * 160;
    cinemaTime.textContent = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
    cinemaBar.style.transform = `scaleX(${p.toFixed(4)})`;
    cinemaChapter.textContent = CH[Math.min(3, Math.floor(s))];
  }

  /* ---------- suite: horizontal gallery ---------- */
  const suiteTrack = $('#suiteTrack'), suiteIndex = $('#suiteIndex');
  const panels = $$('.panel[data-i]');
  let suiteMax = 0;
  function updateSuite(p) {
    const x = -p * suiteMax;
    suiteTrack.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    const idx = Math.min(3, Math.floor(p * 4.4));
    suiteIndex.textContent = String(idx + 1).padStart(2, '0');
    // per-panel parallax of the visual as it crosses the viewport
    for (const el of panels) {
      const r = el.getBoundingClientRect();
      const c = (r.left + r.width / 2) / vw - 0.5; // -0.5 .. 0.5
      el.style.setProperty('--py', `${(c * -40).toFixed(1)}px`);
    }
  }

  /* ---------- manifesto: word-by-word reveal ---------- */
  const manifesto = $('#manifesto');
  manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', manifesto);
  function updateManifesto(y) {
    const b = box.manifesto;
    const p = clamp((y + vh * 0.82 - b.top) / (b.h + vh * 0.25), 0, 1);
    const n = words.length;
    for (let i = 0; i < n; i++) {
      const a = clamp((p * n - i) * 0.9, 0, 1);
      words[i].style.opacity = (0.14 + a * 0.86).toFixed(3);
    }
  }

  /* ---------- reveals + counters ---------- */
  const io = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  $$('.reveal').forEach(el => io.observe(el));

  const counters = $$('.count');
  const cio = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
  }, { threshold: 0.4 });
  counters.forEach(el => cio.observe(el));
  function animateCount(el) {
    const to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.decimals || '0', 10);
    const dur = reduced ? 1 : 1800, start = performance.now();
    const step = now => {
      const t = clamp((now - start) / dur, 0, 1), v = to * easeOut(t);
      el.textContent = v.toFixed(dec);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- magnetic + tilt ---------- */
  if (!touch && !reduced) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${(dx * 0.28).toFixed(1)}px, ${(dy * 0.28).toFixed(1)}px)`;
        el.style.transition = 'transform .2s ease-out, color .5s, border-color .5s, background .5s';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.transition = 'transform .9s cubic-bezier(.19,1,.22,1), color .5s, border-color .5s, background .5s';
      });
    });
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${(nx * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(ny * 100).toFixed(1)}%`);
        el.style.transform = `rotateX(${((0.5 - ny) * 7).toFixed(2)}deg) rotateY(${((nx - 0.5) * 7).toFixed(2)}deg) translateZ(0)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; el.style.transition = 'transform .9s cubic-bezier(.19,1,.22,1), border-color .6s'; });
      el.addEventListener('mouseenter', () => { el.style.transition = 'transform .2s ease-out, border-color .6s'; });
    });
  }

  /* ---------- access form ---------- */
  const form = $('#accessForm'), done = $('#accessDone');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#email');
    if (!email.checkValidity()) { email.style.borderColor = '#c97a6a'; email.focus(); return; }
    form.hidden = true; done.hidden = false;
  });

  /* ---------- main loop ---------- */
  const heroInner = $('.hero__inner');
  let cinemaP = 0, suiteP = 0, heroP = 0;
  let lastFrame = performance.now();
  function frame(now) {
    time = now;
    const dt = Math.min(64, now - lastFrame); lastFrame = now;
    const k = 1 - Math.pow(1 - SMOOTH, dt / 16.67); // frame-rate independent inertia
    scrollY = window.scrollY;
    updateNav(scrollY);

    // hero
    const heroTarget = clamp(scrollY / vh, 0, 1);
    heroP = lerp(heroP, heroTarget, k);
    if (scrollY < vh * 1.2) {
      drawHero(heroP);
      heroInner.style.transform = `translateY(${(heroP * vh * 0.28).toFixed(1)}px)`;
      heroInner.style.opacity = (1 - easeInOut(clamp(heroP * 1.5, 0, 1))).toFixed(3);
    }

    // cinema
    if (inView('cinema', scrollY, vh)) {
      cinemaP = lerp(cinemaP, pinnedProgress('cinema', scrollY), k);
      drawCinema(cinemaP);
      updateCinemaUI(cinemaP);
    }

    // suite
    if (inView('suite', scrollY, vh)) {
      suiteP = lerp(suiteP, pinnedProgress('suite', scrollY), k);
      updateSuite(suiteP);
    }

    // manifesto
    if (inView('manifesto', scrollY, vh)) updateManifesto(scrollY);

    // cursor
    if (!touch) {
      cx = lerp(cx, tx, 0.2); cy = lerp(cy, ty, 0.2);
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
    }
    requestAnimationFrame(frame);
  }

  /* ---------- boot ---------- */
  measure();
  addEventListener('resize', measure);
  if ('ResizeObserver' in window) new ResizeObserver(() => measure()).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  // Snap to initial state so the first frame is correct even when the page loads mid-way
  requestAnimationFrame(now => {
    scrollY = window.scrollY;
    heroP = clamp(scrollY / vh, 0, 1);
    cinemaP = pinnedProgress('cinema', scrollY);
    suiteP = pinnedProgress('suite', scrollY);
    frame(now);
  });
})();

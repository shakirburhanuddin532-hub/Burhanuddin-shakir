// Usage: node scripts/shot-page.mjs <outDir> [port]
// Builds nothing: serves dist/ with vite preview, scrolls through the home page at desktop + mobile, saves screenshots and console errors.
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const out = process.argv[2] || path.join(process.cwd(), 'test-results', 'page-shots')
const port = Number(process.argv[3] || 4300 + Math.floor(Math.random() * 300))
mkdirSync(out, { recursive: true })
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { stdio: 'ignore' })
const base = `http://127.0.0.1:${port}/`
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(base)).ok) break
  } catch {}
  await new Promise((r) => setTimeout(r, 500))
}
const ANCHORS = ['hero', 'system', 'chat', 'universe', 'engine', 'engine-website', 'engine-code', 'engine-image', 'engine-video', 'engine-skill', 'engine-business', 'engine-automation', 'engine-live', 'shakir-one', 'trust', 'create', 'footer']
try {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
  const errors = []
  for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1, hasTouch: name === 'mobile', isMobile: name === 'mobile' })
    page.on('pageerror', (e) => errors.push(`[${name}] pageerror: ${e.message}`))
    page.on('console', (m) => {
      if (m.type() === 'error' && !/fonts\.g|ERR_CERT/.test(m.text())) errors.push(`[${name}] console: ${m.text()}`)
    })
    await page.goto(base, { waitUntil: 'load' })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: path.join(out, `${name}-00-intro.png`) })
    await page.waitForFunction(() => document.documentElement.dataset.intro === 'done', null, { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(1200)
    await page.mouse.move(vp.width * 0.6, vp.height * 0.4)
    await page.screenshot({ path: path.join(out, `${name}-01-hero.png`) })
    // scroll through every scene: anchor start, and +50% of the pin distance when pinned
    const positions = await page.evaluate((anchors) => {
      const ST = window.ScrollTrigger
      const res = []
      for (const id of anchors) {
        const el = document.getElementById(id)
        if (!el) continue
        const st = ST?.getById?.(id)
        const pinned = !!(st && st.pin)
        const start = pinned ? st.start : el.getBoundingClientRect().top + window.scrollY - 72
        res.push([id, Math.max(0, Math.round(start + 2))])
        if (id === 'universe') res.push(['universe-stage', Math.round(start + 72 + Math.min(el.offsetHeight - window.innerHeight, 520))])
        if (pinned) {
          res.push([id + '-mid', Math.round(start + (st.end - st.start) * 0.5)])
          res.push([id + '-end', Math.round(start + (st.end - st.start) * 0.97)])
        }
      }
      return res
    }, ANCHORS)
    let n = 2
    for (const [label, y] of positions) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y)
      await page.waitForTimeout(900)
      await page.screenshot({ path: path.join(out, `${name}-${String(n++).padStart(2, '0')}-${label}.png`) })
    }
    const docH = await page.evaluate(() => document.documentElement.scrollHeight)
    console.log(`${name}: document height ${docH}px, ${positions.length} positions`)
    await page.close()
  }
  await browser.close()
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors')
} finally {
  server.kill('SIGTERM')
}

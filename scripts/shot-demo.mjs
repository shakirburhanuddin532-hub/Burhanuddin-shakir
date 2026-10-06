// Usage: node scripts/shot-demo.mjs <demoKey> [outDir] [port]
// Renders every step of one demonstration in the dev harness and saves screenshots + console errors.
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const key = process.argv[2]
const out = process.argv[3] || path.join(process.cwd(), 'test-results', 'demo-shots')
const port = Number(process.argv[4] || 5200 + Math.floor(Math.random() * 300))
if (!key) {
  console.error('demo key required')
  process.exit(1)
}
mkdirSync(out, { recursive: true })

const server = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { stdio: 'ignore' })
const base = `http://127.0.0.1:${port}/`
const wait = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(base)
      if (r.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('vite did not start')
}

try {
  await wait()
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' && !/fonts\.g|ERR_CERT/.test(m.text())) errors.push(`console: ${m.text()}`)
  })
  await page.goto(`${base}?demo=${key}&step=0`, { waitUntil: 'load' })
  await page.waitForTimeout(800)
  const steps = await page.evaluate(() => document.querySelectorAll('[aria-label="Steps"] li').length)
  for (let i = 0; i < steps; i++) {
    await page.goto(`${base}?demo=${key}&step=${i}`, { waitUntil: 'load' })
    await page.waitForFunction(() => document.documentElement.dataset.demoReady === '1', null, { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(700)
    await page.screenshot({ path: path.join(out, `${key}-${String(i).padStart(2, '0')}.png`) })
  }
  await browser.close()
  console.log(`${key}: ${steps} steps captured in ${out}`)
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors')
} finally {
  server.kill('SIGTERM')
}

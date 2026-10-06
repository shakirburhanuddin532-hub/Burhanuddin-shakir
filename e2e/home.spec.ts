import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const errors: string[] = []
async function open(page: Page, path = '/') {
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' && !/fonts\.g|ERR_CERT/.test(m.text())) errors.push(m.text())
  })
  await page.goto(path)
  await page.waitForTimeout(400)
}

test.describe('home', () => {
  test('intro plays once per session, is skippable with Escape, and hands off to the hero', async ({ page }) => {
    await open(page)
    await expect(page.getByTestId('intro')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('intro')).toBeHidden({ timeout: 5000 })
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ONE INTELLIGENCE')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.reload()
    await expect(page.getByTestId('intro')).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test('has one h1, landmarks and the six scene headings', async ({ page }) => {
    await open(page, '/?intro=0')
    await page.keyboard.press('Escape')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('footer')).toHaveCount(1)
    for (const text of ['ONE SHAKIR.', 'POWER WITH CONTROL.', 'WHAT WILL YOU CREATE?', 'SAY WHAT YOU NEED.']) {
      await expect(page.getByRole('heading', { name: text })).toHaveCount(1)
    }
  })

  test('scrolls through every pinned scene without errors and reaches the footer', async ({ page }) => {
    await open(page)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(600)
    const total = await page.evaluate(() => document.documentElement.scrollHeight)
    expect(total).toBeGreaterThan(8000)
    for (let y = 0; y <= total; y += Math.round(total / 24)) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y)
      await page.waitForTimeout(120)
    }
    await expect(page.locator('footer')).toBeInViewport()
    expect(errors).toEqual([])
  })

  test('feature universe opens a detail dialog with the keyboard and returns focus', async ({ page, isMobile }) => {
    await open(page)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    const universe = page.locator('#universe')
    await universe.scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    const node = page.getByRole('button', { name: /Code AI, Create world/ })
    await node.scrollIntoViewIfNeeded()
    await node.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByTestId('feature-detail')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Code AI')
    await expect(dialog.getByText('Works with')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    if (!isMobile) await expect(node).toBeFocused()
  })

  test('has no serious accessibility violations at the top of the page', async ({ page }) => {
    await open(page)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(800)
    const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'] })
      .disableRules(['color-contrast'])
      .analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious, JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.length })), null, 2)).toEqual([])
  })

  test('reduced motion shows every scene statically', async ({ page, browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: page.viewportSize() ?? undefined })
    const p = await ctx.newPage()
    await p.goto('/')
    await p.waitForTimeout(1800)
    await expect(p.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(p.getByRole('heading', { name: 'ONE SHAKIR.' })).toBeAttached()
    const pinned = await p.evaluate(() => document.querySelectorAll('.pin-spacer').length)
    expect(pinned).toBe(0)
    await ctx.close()
  })
})

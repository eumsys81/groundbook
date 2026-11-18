import { chromium, devices } from 'playwright'
import { mkdirSync } from 'fs'
import path from 'path'

const outDir = '/cursor/stores/self/media'
mkdirSync(outDir, { recursive: true })
const base = 'http://127.0.0.1:5173'

async function shot(page, name) {
  const file = path.join(outDir, name)
  await page.screenshot({ path: file, fullPage: false })
  console.log('shot', file)
}

const browser = await chromium.launch({ headless: true })
const desktop = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  locale: 'ko-KR',
})
const page = await desktop.newPage()

await page.goto(base + '/', { waitUntil: 'networkidle' })
await page.waitForSelector('.hero-brand')
const brand = await page.locator('.hero-brand').innerText()
console.log('brand:', brand.replace(/\s+/g, ' '))
await shot(page, 'verify-desktop-home.png')

await page.click('nav a[href="/standings"]')
await page.waitForURL('**/standings')
await page.waitForSelector('.page-title')
console.log('standings title:', await page.locator('.page-title').innerText())
await shot(page, 'verify-desktop-standings.png')

await page.click('nav a[href="/leaders"]')
await page.waitForURL('**/leaders')
await page.waitForSelector('.page-title')
console.log('leaders title:', await page.locator('.page-title').innerText())
await shot(page, 'verify-desktop-leaders.png')

await page.click('nav a[href="/schedule"]')
await page.waitForURL('**/schedule')
await page.waitForSelector('.day-rail')
console.log('schedule rail ok')
await shot(page, 'verify-desktop-schedule.png')

await page.click('nav a[href="/ops"]')
await page.waitForURL('**/ops')
await page.waitForSelector('.page-title')
console.log('ops title:', await page.locator('.page-title').innerText())
await shot(page, 'verify-desktop-ops.png')

await page.click('.ops-nav a[href="/ops/schedule"]')
await page.waitForURL('**/ops/schedule')
await page.click('a[href="/ops/games/g1"]')
await page.waitForURL('**/ops/games/g1')
await page.waitForSelector('.inning-grid')
console.log('game entry ok')
await shot(page, 'verify-desktop-game-entry.png')

const mobile = await browser.newContext({
  ...devices['iPhone 12'],
  locale: 'ko-KR',
})
const mpage = await mobile.newPage()
await mpage.goto(base + '/', { waitUntil: 'networkidle' })
await mpage.waitForSelector('.hero-brand')
const navVisible = await mpage.locator('nav.nav-links a').count()
console.log('mobile nav links:', navVisible)
await shot(mpage, 'verify-mobile-home.png')
await mpage.click('nav a[href="/roster"]')
await mpage.waitForURL('**/roster')
console.log('mobile roster title:', await mpage.locator('.page-title').innerText())
await shot(mpage, 'verify-mobile-roster.png')

await browser.close()
console.log('SMOKE_OK')

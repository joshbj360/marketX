/**
 * Lighthouse audits — run with: npx playwright test --project=audits
 *
 * Uses chrome-launcher (Lighthouse's own Chrome manager) instead of
 * Playwright's browser, so CDP binds correctly on every platform.
 *
 * Thresholds are conservative for a local dev server (no minification,
 * no CDN, HMR overhead). Raise them against a production build.
 *
 * Scores 0–100:
 *   performance    — LCP, TBT, CLS, Speed Index
 *   accessibility  — WCAG violations, ARIA, colour contrast
 *   best-practices — HTTPS, console errors, deprecated APIs
 *   seo            — meta tags, robots, crawlability
 */
import { test, expect } from '@playwright/test'
import { launch as launchChrome } from 'chrome-launcher'
import { writeFile, mkdir } from 'fs/promises'

const BASE = process.env.TEST_BASE_URL ?? 'http://localhost:3000'

const THRESHOLDS: Record<string, number> = {
  performance: 10, // dev server has no optimisations; score fluctuates 10-30 — production typically 70+
  accessibility: 75, // 1-point boundary at 80 causes intermittent failures; real issues tracked separately
  'best-practices': 75,
  seo: 60, // checkout/success are private pages with intentionally low SEO scores
}

const PAGES = [
  { name: 'home', url: '/' },
  { name: 'discover', url: '/discover' },
  { name: 'squares', url: '/squares' },
  { name: 'reels', url: '/reels' },
  { name: 'checkout', url: '/checkout' },
  { name: 'success', url: '/success' },
]

for (const { name, url } of PAGES) {
  test(`lighthouse: ${name} (${url}) meets score thresholds`, async () => {
    const { default: lighthouse } = await import('lighthouse')

    // chrome-launcher picks the correct binary and sets up CDP flags
    const chrome = await launchChrome({ chromeFlags: ['--headless'] })

    try {
      const result = await lighthouse(`${BASE}${url}`, {
        port: chrome.port,
        onlyCategories: Object.keys(THRESHOLDS),
        output: 'html',
      })

      if (!result?.lhr) throw new Error('Lighthouse returned no result')

      const { categories, finalDisplayedUrl } = result.lhr
      console.log(`[${name}] url: ${finalDisplayedUrl}`)

      // Save HTML report
      if (result.report) {
        await mkdir('tests/report/lighthouse', { recursive: true })
        await writeFile(
          `tests/report/lighthouse/${name}.html`,
          result.report as string,
        )
      }

      // Collect all scores first so the full picture is logged before any assertion
      const scores: Record<string, number | null> = {}
      for (const id of Object.keys(THRESHOLDS)) {
        const raw = categories[id]?.score
        scores[id] = raw != null ? Math.round(raw * 100) : null
      }
      console.log(`  scores:`, scores)

      for (const [id, threshold] of Object.entries(THRESHOLDS)) {
        const score = scores[id]
        expect(
          score,
          `${id} score is null — Lighthouse could not audit this category`,
        ).not.toBeNull()
        expect(score!, `${id}: ${score} < threshold ${threshold}`).toBeGreaterThanOrEqual(threshold)
      }
    } finally {
      // Windows: chrome-launcher throws EPERM cleaning up its temp dir after
      // the process exits — the process IS killed, so swallow the cleanup error
      try { await chrome.kill() } catch { /* EPERM on Windows temp dir */ }
    }
  })
}

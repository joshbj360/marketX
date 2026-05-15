import { test as base, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

type Fixtures = {
  /**
   * Structural a11y builder — WCAG 2.0/2.1 A/AA minus color-contrast.
   * Color-contrast violations are real bugs but are tracked separately via
   * `logColorViolations()` so they don't block CI on every run.
   *
   * Usage:
   *   const results = await makeAxeBuilder().analyze()
   *   expect(results.violations).toEqual([])
   */
  makeAxeBuilder: () => AxeBuilder
}

export const test = base.extend<Fixtures>({
  makeAxeBuilder: async ({ page }, use) => {
    await use(() =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(['color-contrast']), // tracked separately — see color-contrast tests
    )
  },
})

export { expect } from '@playwright/test'

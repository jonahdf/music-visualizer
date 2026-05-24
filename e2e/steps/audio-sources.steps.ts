/**
 * Steps for Feature 02: Audio sources.
 * File upload and mic connection shared steps live in common.steps.ts.
 */
import { Given, When, Then, expect } from '../support/fixtures';
import { initializeApp, openMenu, goToTab } from '../support/fixtures';

Then('I should see a source card for {string}', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.source-card:has-text("${label}")`)).toBeVisible();
});

Then('the {string} source card should not be disabled', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.source-card:has-text("${label}")`)).not.toHaveClass(/disabled/);
});

Then('the {string} source card should be disabled', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.source-card:has-text("${label}")`)).toHaveClass(/disabled/);
});

When('I click the {string} source card', async ({ appPage }, label: string) => {
  await appPage.locator(`.source-card:has-text("${label}")`).click();
  await appPage.waitForTimeout(500);
});

Then('the {string} source card should be active', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.source-card:has-text("${label}")`)).toHaveClass(/active/);
});

Then('the {string} source card should not be active', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.source-card:has-text("${label}")`)).not.toHaveClass(/active/);
});

Then('the HUD source label should show {string}', async ({ appPage }, expected: string) => {
  // Source shown as a pill badge in the bottom bar (e.g. "mic", "tab", "file")
  const pill = appPage.locator(`.bar-pill:has-text("${expected}")`);
  await expect(pill).toBeVisible();
});

Then('the {string} source card should show a Firefox badge', async ({ appPage }, label: string) => {
  const card = appPage.locator(`.source-card:has-text("${label}")`);
  await expect(card.locator('.source-badge-unsupported')).toBeVisible();
});

// ─── Firefox scenario ─────────────────────────────────────────────────────────
// Uses the firefoxPage fixture which injects a Firefox userAgent + getDisplayMedia rejection

Given('the page is running as Firefox', async ({ firefoxPage }) => {
  await firefoxPage.goto('/');
  await firefoxPage.waitForSelector('.app');
  const overlay = firefoxPage.locator('.start-overlay');
  if (await overlay.isVisible()) {
    await overlay.click();
    await overlay.waitFor({ state: 'detached', timeout: 15_000 });
  }
  await openMenu(firefoxPage);
  await goToTab(firefoxPage, 'Audio');
});

// The Firefox scenario uses firefoxPage fixture, so we need these steps to use it too.
// playwright-bdd matches fixtures by parameter name, so we need separate step definitions.
Then('the {string} source card should be disabled on Firefox', async ({ firefoxPage }, label: string) => {
  await expect(firefoxPage.locator(`.source-card:has-text("${label}")`)).toHaveClass(/disabled/);
});

Then('the {string} source card should show a Firefox badge on Firefox', async ({ firefoxPage }, label: string) => {
  const card = firefoxPage.locator(`.source-card:has-text("${label}")`);
  await expect(card.locator('.source-badge-unsupported')).toBeVisible();
});

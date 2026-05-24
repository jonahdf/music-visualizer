/**
 * Steps for Feature 04: Playlist management.
 * "a preset is active" and "the active preset should have changed" live in common.steps.ts.
 */
import { Given, When, Then, expect } from '../support/fixtures';
import { openMenu, goToTab } from '../support/fixtures';

// ─── Interval buttons ─────────────────────────────────────────────────────────

Then('the {string} interval button should be active', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.interval-btn:has-text("${label}")`)).toHaveClass(/active/);
});

Then('the {string} interval button should not be active', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.interval-btn:has-text("${label}")`)).not.toHaveClass(/active/);
});

When('I click the {string} interval button', async ({ appPage }, label: string) => {
  await appPage.locator(`.interval-btn:has-text("${label}")`).click();
});

// ─── Hold button ──────────────────────────────────────────────────────────────

Then('the hold button should not be visible', async ({ appPage }) => {
  await expect(appPage.locator('.hold-btn')).not.toBeVisible();
});

Then('the hold button should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.hold-btn')).toBeVisible();
});

Then('the hold button should display {string}', async ({ appPage }, text: string) => {
  await expect(appPage.locator('.hold-btn')).toContainText(text);
});

When('I click the hold button', async ({ appPage }) => {
  await appPage.locator('.hold-btn').click();
});

// ─── Playlist mode buttons ────────────────────────────────────────────────────

Then('the {string} mode button should be active', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.mode-btn:has-text("${label}")`)).toHaveClass(/active/);
});

Then('the {string} mode button should not be active', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.mode-btn:has-text("${label}")`)).not.toHaveClass(/active/);
});

When('I click the {string} mode button', async ({ appPage }, label: string) => {
  await appPage.locator(`.mode-btn:has-text("${label}")`).click();
});

// ─── Navigation buttons (in bottom bar) ──────────────────────────────────────

When('I click the Prev button', async ({ appPage }) => {
  await appPage.locator('.bar-btn[title*="Previous"]').click();
  await appPage.waitForTimeout(200);
});

When('I click the Next button', async ({ appPage }) => {
  await appPage.locator('.bar-btn[title*="Next"]').click();
  await appPage.waitForTimeout(200);
});

When('I click the Random button', async ({ appPage }) => {
  await appPage.locator('.bar-random').click();
  await appPage.waitForTimeout(200);
});

// ─── Favorites (managed in Presets tab) ──────────────────────────────────────

Given('I have favorited the first preset in the preset browser', async ({ appPage }) => {
  await openMenu(appPage);
  await goToTab(appPage, 'Presets');
  await appPage.locator('.preset-item').first().waitFor({ state: 'visible', timeout: 10_000 });

  const btn = appPage.locator('.preset-item').first().locator('.favorite-btn');
  const isActive = await btn.evaluate((el) => el.classList.contains('active'));
  if (!isActive) await btn.click();
  await expect(btn).toHaveClass(/active/);
});

Then("the first preset's favorite button should be active", async ({ appPage }) => {
  await openMenu(appPage);
  await goToTab(appPage, 'Presets');
  const btn = appPage.locator('.preset-item').first().locator('.favorite-btn');
  await expect(btn).toHaveClass(/active/);
});

When('I unfavorite the first preset in the preset browser', async ({ appPage }) => {
  await openMenu(appPage);
  await goToTab(appPage, 'Presets');
  const btn = appPage.locator('.preset-item').first().locator('.favorite-btn');
  await btn.click();
});

Then("the first preset's favorite button should not be active", async ({ appPage }) => {
  const btn = appPage.locator('.preset-item').first().locator('.favorite-btn');
  await expect(btn).not.toHaveClass(/active/);
});

// ─── Bottom bar preset name and heart ────────────────────────────────────────

Then('the bottom bar preset name should be visible and non-empty', async ({ appPage }) => {
  const nameEl = appPage.locator('.bar-preset-name');
  await expect(nameEl).toBeVisible();
  const text = await nameEl.textContent();
  expect(text?.trim().length).toBeGreaterThan(0);
});

When('I click the bottom bar heart button', async ({ appPage }) => {
  await appPage.mouse.move(400, 300);
  await appPage.waitForFunction(() => !document.querySelector('.bottom-bar')?.classList.contains('bar-hidden'));
  await appPage.locator('.bar-fav').click();
});

When('I click the bottom bar heart button again', async ({ appPage }) => {
  await appPage.locator('.bar-fav').click();
});

Then('the bottom bar heart should appear filled', async ({ appPage }) => {
  await expect(appPage.locator('.bar-fav')).toHaveClass(/active/);
  await expect(appPage.locator('.bar-fav')).toContainText('♥');
});

Then('the bottom bar heart should appear empty', async ({ appPage }) => {
  await expect(appPage.locator('.bar-fav')).not.toHaveClass(/active/);
  await expect(appPage.locator('.bar-fav')).toContainText('♡');
});

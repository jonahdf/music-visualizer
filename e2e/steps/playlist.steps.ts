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

// ─── Navigation buttons ───────────────────────────────────────────────────────

When('I click the Prev button', async ({ appPage }) => {
  await appPage.locator('.ctrl-btn:has-text("Prev")').click();
  await appPage.waitForTimeout(200);
});

When('I click the Next button', async ({ appPage }) => {
  await appPage.locator('.ctrl-btn:has-text("Next")').click();
  await appPage.waitForTimeout(200);
});

When('I click the Random button', async ({ appPage }) => {
  await appPage.locator('.ctrl-btn:has-text("Random")').click();
  await appPage.waitForTimeout(200);
});

// ─── Favorites list ───────────────────────────────────────────────────────────

Given('I have favorited the first preset in the preset browser', async ({ appPage }) => {
  await openMenu(appPage);
  await goToTab(appPage, 'Presets');
  await appPage.locator('.preset-item').first().waitFor({ state: 'visible', timeout: 10_000 });

  const name = await appPage.locator('.preset-item').first()
    .locator('.preset-name').textContent();
  (appPage as any).__favoritedPresetName = name?.trim();

  const btn = appPage.locator('.preset-item').first().locator('.favorite-btn');
  const isActive = await btn.evaluate((el) => el.classList.contains('active'));
  if (!isActive) await btn.click();
  await expect(btn).toHaveClass(/active/);

  await goToTab(appPage, 'Playlist');
});

Then('the favorites list should contain that preset', async ({ appPage }) => {
  const name: string = (appPage as any).__favoritedPresetName ?? '';
  expect(name.length).toBeGreaterThan(0);
  await expect(appPage.locator('.favorites-list')).toBeVisible();
  await expect(appPage.locator('.fav-item-name', { hasText: name })).toBeVisible();
});

When('I click the favorite button for that preset in the favorites list', async ({ appPage }) => {
  const name: string = (appPage as any).__favoritedPresetName ?? '';
  const favItem = appPage.locator('.fav-item', {
    has: appPage.locator(`.fav-item-name:has-text("${name}")`),
  });
  await favItem.locator('.favorite-btn').click();
});

Then('the favorites list should not contain that preset', async ({ appPage }) => {
  const name: string = (appPage as any).__favoritedPresetName ?? '';
  await expect(appPage.locator(`.fav-item-name:has-text("${name}")`)).not.toBeVisible();
});

// ─── Now Playing section ──────────────────────────────────────────────────────

Then('the Now Playing section should show a non-empty preset name', async ({ appPage }) => {
  const nameEl = appPage.locator('.now-playing-name');
  await expect(nameEl).toBeVisible();
  const text = await nameEl.textContent();
  expect(text?.trim().length).toBeGreaterThan(0);
});

When('I click the heart button in the Now Playing row', async ({ appPage }) => {
  await appPage.locator('.now-playing-row .favorite-btn').click();
});

When('I click the heart button in the Now Playing row again', async ({ appPage }) => {
  await appPage.locator('.now-playing-row .favorite-btn').click();
});

Then('the Now Playing heart should appear filled', async ({ appPage }) => {
  await expect(appPage.locator('.now-playing-row .favorite-btn')).toHaveClass(/active/);
});

Then('the Now Playing heart should appear empty', async ({ appPage }) => {
  await expect(appPage.locator('.now-playing-row .favorite-btn')).not.toHaveClass(/active/);
});

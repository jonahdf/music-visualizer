import { When, Then, expect } from '../support/fixtures';

// ─── Quality preset buttons ───────────────────────────────────────────────────

Then('the {string} quality button should be active', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.preset-btn:has-text("${label}")`)).toHaveClass(/active/);
});

Then('the {string} quality button should not be active', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.preset-btn:has-text("${label}")`)).not.toHaveClass(/active/);
});

When('I click the {string} quality button', async ({ appPage }, label: string) => {
  await appPage.locator(`.preset-btn:has-text("${label}")`).click();
});

// ─── Subtabs ──────────────────────────────────────────────────────────────────

When('I click the {string} subtab', async ({ appPage }, label: string) => {
  await appPage.locator(`.graphics-subtab:has-text("${label}")`).click();
});

Then('the Performance subtab content should be visible', async ({ appPage }) => {
  // FPS display and quality presets section are in the Performance subtab
  await expect(appPage.locator('.fps-display')).toBeVisible();
});

Then('the Visual subtab content should be visible', async ({ appPage }) => {
  // Blend time buttons are only in the Visual subtab
  await expect(appPage.locator('.blend-btn').first()).toBeVisible();
});

Then('the FPS display should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.fps-display')).toBeVisible();
});

// ─── Blend time buttons ───────────────────────────────────────────────────────

Then('blend time buttons should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.blend-btn').first()).toBeVisible();
});

Then('the {string} blend time button should be active', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.blend-btn:has-text("${label}")`)).toHaveClass(/active/);
});

Then('the {string} blend time button should not be active', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.blend-btn:has-text("${label}")`)).not.toHaveClass(/active/);
});

When('I click the {string} blend time button', async ({ appPage }, label: string) => {
  await appPage.locator(`.blend-btn:has-text("${label}")`).click();
});

// ─── Individual settings sliders ──────────────────────────────────────────────

Then('the Resolution Scale slider should be visible', async ({ appPage }) => {
  // The resolution scale setting row contains the label and a slider
  const row = appPage.locator('.setting-row', { has: appPage.locator('.setting-label:has-text("Resolution Scale")') });
  await expect(row.locator('.slider')).toBeVisible();
});

// ─── Description toggles ──────────────────────────────────────────────────────

When('I click the description toggle for {string}', async ({ appPage }, label: string) => {
  const row = appPage.locator('.setting-row', { has: appPage.locator(`.setting-label:has-text("${label}")`) });
  await row.locator('.desc-toggle').click();
});

Then('the description for {string} should be visible', async ({ appPage }, label: string) => {
  const row = appPage.locator('.setting-row', { has: appPage.locator(`.setting-label:has-text("${label}")`) });
  await expect(row.locator('.setting-description')).toBeVisible();
});

import path from 'path';
import { fileURLToPath } from 'url';
import { Given, When, Then, expect } from '../support/fixtures';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_PRESET_PATH = path.join(__dirname, '../support/test-preset.milk');
const PRESET_NAME = 'test-preset';

// ─── List visibility & counts ─────────────────────────────────────────────────

Then('the preset list should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.preset-list')).toBeVisible();
});

Then('the preset list should contain more than {int} presets', async ({ appPage }, min: number) => {
  // Wait for lazy-loaded presets to populate
  await appPage.waitForFunction(
    (count) => document.querySelectorAll('.preset-item').length > count,
    min,
    { timeout: 10_000 }
  );
  const items = appPage.locator('.preset-item');
  const count = await items.count();
  expect(count).toBeGreaterThan(min);
});

Then('the preset list should not be empty', async ({ appPage }) => {
  const items = appPage.locator('.preset-item');
  expect(await items.count()).toBeGreaterThan(0);
});

Then('the preset list should be empty', async ({ appPage }) => {
  await expect(appPage.locator('.preset-item')).toHaveCount(0);
});

Then('I should see the no-results message', async ({ appPage }) => {
  await expect(appPage.locator('.preset-empty')).toBeVisible();
});

// ─── Search ───────────────────────────────────────────────────────────────────

When('I type {string} in the search box', async ({ appPage }, text: string) => {
  await appPage.locator('.search-input').fill(text);
});

Given('I have typed {string} in the search box', async ({ appPage }, text: string) => {
  await appPage.locator('.search-input').fill(text);
  await appPage.waitForTimeout(200);
});

When('I clear the search box', async ({ appPage }) => {
  await appPage.locator('.search-input').fill('');
});

Then('all visible presets should contain {string} in their name', async ({ appPage }, text: string) => {
  const names = appPage.locator('.preset-name');
  const count = await names.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const name = await names.nth(i).textContent();
    expect(name?.toLowerCase()).toContain(text.toLowerCase());
  }
});

// ─── Selection ────────────────────────────────────────────────────────────────

When('I click the first preset in the list', async ({ appPage }) => {
  // Wait for at least one preset to appear (lazy-load)
  await appPage.locator('.preset-item').first().waitFor({ state: 'visible', timeout: 10_000 });
  // Store the name before clicking — it won't be accessible after the menu closes
  const name = await appPage.locator('.preset-item').first().locator('.preset-name').textContent();
  (appPage as any).__selectedPresetName = name?.trim() ?? '';
  await appPage.locator('.preset-item').first().click();
});

Then('the first preset should be marked active', async ({ appPage }) => {
  await expect(appPage.locator('.preset-item').first()).toHaveClass(/active/);
});

Then('the HUD preset name should match the preset I selected', async ({ appPage }) => {
  // Name was stored in "I click the first preset in the list" step
  const selectedName: string = (appPage as any).__selectedPresetName ?? '';
  expect(selectedName.length, 'No preset name was stored — ensure "I click the first preset" ran first').toBeGreaterThan(0);
  const hudName = await appPage.locator('.bar-preset-name').textContent();
  expect(hudName?.trim()).toBe(selectedName);
});

// ─── Favorites & exclusions ───────────────────────────────────────────────────

When('I click the favorite button on the first preset', async ({ appPage }) => {
  await appPage.locator('.preset-item').first().locator('.favorite-btn').click();
});

Then("the first preset's favorite button should appear filled", async ({ appPage }) => {
  const btn = appPage.locator('.preset-item').first().locator('.favorite-btn');
  await expect(btn).toHaveClass(/active/);
  await expect(btn).toContainText('♥');
});

Then("the first preset's favorite button should appear empty", async ({ appPage }) => {
  const btn = appPage.locator('.preset-item').first().locator('.favorite-btn');
  await expect(btn).not.toHaveClass(/active/);
  await expect(btn).toContainText('♡');
});

Given('the first preset is favorited', async ({ appPage }) => {
  const btn = appPage.locator('.preset-item').first().locator('.favorite-btn');
  const isActive = await btn.evaluate((el) => el.classList.contains('active'));
  if (!isActive) await btn.click();
  await expect(btn).toHaveClass(/active/);
});

When('I click the exclude button on the first preset', async ({ appPage }) => {
  await appPage.locator('.preset-item').first().locator('.exclude-btn').click();
});

Then('the first preset should be marked as excluded', async ({ appPage }) => {
  await expect(appPage.locator('.preset-item').first()).toHaveClass(/excluded/);
});

Then('the first preset should not be marked as excluded', async ({ appPage }) => {
  await expect(appPage.locator('.preset-item').first()).not.toHaveClass(/excluded/);
});

Given('the first preset is excluded', async ({ appPage }) => {
  const item = appPage.locator('.preset-item').first();
  const isExcluded = await item.evaluate((el) => el.classList.contains('excluded'));
  if (!isExcluded) await item.locator('.exclude-btn').click();
  await expect(item).toHaveClass(/excluded/);
});

// ─── Upload & delete ──────────────────────────────────────────────────────────

When('I upload the test preset file', async ({ appPage }) => {
  const fileInput = appPage.locator('input[type="file"][accept*=".milk"]');
  await fileInput.setInputFiles(TEST_PRESET_PATH);
  // Wait for IndexedDB write + React state update
  await expect(appPage.locator(`.preset-name:has-text("${PRESET_NAME}")`))
    .toBeVisible({ timeout: 8_000 });
});

Given('I have uploaded the test preset file', async ({ appPage }) => {
  const fileInput = appPage.locator('input[type="file"][accept*=".milk"]');
  await fileInput.setInputFiles(TEST_PRESET_PATH);
  await expect(appPage.locator(`.preset-name:has-text("${PRESET_NAME}")`))
    .toBeVisible({ timeout: 8_000 });
});

Then('the preset list should contain a preset named {string}', async ({ appPage }, name: string) => {
  await expect(appPage.locator(`.preset-name:has-text("${name}")`)).toBeVisible();
});

Then('the preset list should not contain {string}', async ({ appPage }, name: string) => {
  await expect(appPage.locator(`.preset-name:has-text("${name}")`)).not.toBeVisible();
});

Then('the {string} preset should have a user badge', async ({ appPage }, name: string) => {
  const item = appPage.locator('.preset-item', { has: appPage.locator(`.preset-name:has-text("${name}")`) });
  await expect(item.locator('.badge-user')).toBeVisible();
});

When('I click the remove button for {string}', async ({ appPage }, name: string) => {
  const item = appPage.locator('.preset-item', { has: appPage.locator(`.preset-name:has-text("${name}")`) });
  await item.locator('.remove-btn').click();
});

Then('the first preset in the list should not have a remove button', async ({ appPage }) => {
  // Wait for list to populate then check first item
  await appPage.locator('.preset-item').first().waitFor({ state: 'visible', timeout: 10_000 });
  const removeBtn = appPage.locator('.preset-item').first().locator('.remove-btn');
  // Remove button either doesn't exist or is not visible for builtin presets
  const count = await removeBtn.count();
  if (count > 0) {
    await expect(removeBtn).not.toBeVisible();
  }
});

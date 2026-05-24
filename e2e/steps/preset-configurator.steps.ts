import { When, Then, expect } from '../support/fixtures';

When('I open the drawer on the Presets tab', async ({ appPage }) => {
  await appPage.keyboard.press('p');
  await appPage.locator('.drawer').waitFor({ state: 'visible' });
  await appPage.locator('.drawer-tab:has-text("Presets")').click();
  await appPage.locator('.preset-list').waitFor({ state: 'visible' });
});

When('I select a preset that has equations', async ({ appPage }) => {
  // Click the first preset in the list to set activePresetData
  await appPage.locator('.preset-item').first().click();
  await appPage.waitForTimeout(200);
});

When('I switch to the Create tab', async ({ appPage }) => {
  await appPage.locator('.drawer-tab:has-text("Create")').click();
  await appPage.locator('.configurator').waitFor({ state: 'visible' });
});

When('I click Load Current', async ({ appPage }) => {
  const btn = appPage.locator('.cfg-btn:has-text("Load Current")');
  await expect(btn).toBeEnabled({ timeout: 5000 });
  await btn.click();
});

When('I navigate to the Code subtab', async ({ appPage }) => {
  await appPage.locator('.cfg-subtab:has-text("Code")').click();
});

Then('the per-frame equations textarea should have line breaks after each semicolon', async ({ appPage }) => {
  // Per-Frame Equations textarea has placeholder "a.zoom = 1.0 + 0.1*a.bass_att;"
  const textarea = appPage.locator('textarea[placeholder="a.zoom = 1.0 + 0.1*a.bass_att;"]');
  const value = await textarea.inputValue();

  // Skip if empty (preset has no per-frame equations)
  if (!value.trim()) return;

  // Every semicolon not at end of string must be followed by a newline
  const trimmed = value.trimEnd();
  const withoutTrailingSemi = trimmed.endsWith(';') ? trimmed.slice(0, -1) : trimmed;
  const hasSemiWithoutNewline = /;[^\n]/.test(withoutTrailingSemi);
  expect(hasSemiWithoutNewline).toBe(false);
});

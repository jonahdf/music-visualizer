/**
 * Steps for Feature 06: Keyboard shortcuts.
 * "a preset is active" and "the active preset should have changed" live in common.steps.ts.
 */
import { When, Then, expect } from '../support/fixtures';

When('I press {string}', async ({ appPage }, key: string) => {
  await appPage.keyboard.press(key);
  await appPage.waitForTimeout(200);
});

When('I focus the search input and press {string}', async ({ appPage }, key: string) => {
  await appPage.locator('.search-input').focus();
  await appPage.keyboard.press(key);
});

Then('the menu should still be open', async ({ appPage }) => {
  await expect(appPage.locator('.menu-overlay')).toBeVisible();
});

Then('the search input should contain a space', async ({ appPage }) => {
  await expect(appPage.locator('.search-input')).toHaveValue(/ /);
});

// ─── Hold button state ────────────────────────────────────────────────────────

Then('the HUD hold button should be active', async ({ appPage }) => {
  const holdBtn = appPage.locator('.hud-btn[title*="Hold"]');
  await expect(holdBtn).toBeVisible();
  await expect(holdBtn).toHaveClass(/active/);
});

Then('the HUD hold button should not be active', async ({ appPage }) => {
  const holdBtn = appPage.locator('.hud-btn[title*="Hold"]');
  await expect(holdBtn).toBeVisible();
  await expect(holdBtn).not.toHaveClass(/active/);
});

// ─── Mute button state ────────────────────────────────────────────────────────

Then('the HUD mute button should be active', async ({ appPage }) => {
  const muteBtn = appPage.locator('.hud-btn[title*="Mute"], .hud-btn[title*="Unmute"]');
  await expect(muteBtn).toBeVisible();
  await expect(muteBtn).toHaveClass(/active/);
});

Then('the HUD mute button should not be active', async ({ appPage }) => {
  const muteBtn = appPage.locator('.hud-btn[title*="Mute"], .hud-btn[title*="Unmute"]');
  await expect(muteBtn).toBeVisible();
  await expect(muteBtn).not.toHaveClass(/active/);
});

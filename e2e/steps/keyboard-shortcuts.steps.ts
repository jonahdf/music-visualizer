/**
 * Steps for Feature 06: Keyboard shortcuts.
 * "a preset is active" and "the active preset should have changed" live in common.steps.ts.
 */
import { When, Then, expect } from '../support/fixtures';

When('I press {string}', async ({ appPage }, key: string) => {
  await appPage.keyboard.press(key);
  await appPage.waitForTimeout(200);
});

Then('the quality pill should show {string}', async ({ appPage }, quality: string) => {
  // Quality is displayed as a pill badge in the bottom bar
  await expect(appPage.locator(`.bar-pill:has-text("${quality}")`)).toBeVisible();
});

When('I focus the search input and press {string}', async ({ appPage }, key: string) => {
  await appPage.locator('.search-input').focus();
  await appPage.keyboard.press(key);
});

Then('the menu should still be open', async ({ appPage }) => {
  await expect(appPage.locator('.drawer')).toHaveClass(/drawer-open/);
});

Then('the search input should contain a space', async ({ appPage }) => {
  await expect(appPage.locator('.search-input')).toHaveValue(/ /);
});

// ─── Hold button state ────────────────────────────────────────────────────────

Then('the HUD hold button should be active', async ({ appPage }) => {
  // bar-auto-held class indicates the held state on the bottom bar auto-advance button
  const holdBtn = appPage.locator('.bar-auto');
  await expect(holdBtn).toBeVisible();
  await expect(holdBtn).toHaveClass(/bar-auto-held/);
});

Then('the HUD hold button should not be active', async ({ appPage }) => {
  const holdBtn = appPage.locator('.bar-auto');
  await expect(holdBtn).toBeVisible();
  await expect(holdBtn).not.toHaveClass(/bar-auto-held/);
});

// ─── Mute button state ────────────────────────────────────────────────────────

Then('the HUD mute button should be active', async ({ appPage }) => {
  // bar-active class indicates muted state on the bottom bar mute button
  const muteBtn = appPage.locator('.bar-btn[title*="Mute"], .bar-btn[title*="Unmute"]');
  await expect(muteBtn).toBeVisible();
  await expect(muteBtn).toHaveClass(/bar-active/);
});

Then('the HUD mute button should not be active', async ({ appPage }) => {
  const muteBtn = appPage.locator('.bar-btn[title*="Mute"], .bar-btn[title*="Unmute"]');
  await expect(muteBtn).toBeVisible();
  await expect(muteBtn).not.toHaveClass(/bar-active/);
});

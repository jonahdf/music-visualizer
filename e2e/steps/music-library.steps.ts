/**
 * Steps for Feature 11: Sample music library.
 */
import { When, Then, expect } from '../support/fixtures';
import { closeMenu } from '../support/fixtures';

Then('the sample library should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.music-library')).toBeVisible();
});

Then('the sample library should have at least one track', async ({ appPage }) => {
  const count = await appPage.locator('.library-track').count();
  expect(count).toBeGreaterThan(0);
});

When('I click the first sample track', async ({ appPage }) => {
  await appPage.locator('.library-track').first().click();
  await appPage.waitForTimeout(500);
});

Then('the source pill should show {string}', async ({ appPage }, source: string) => {
  await expect(appPage.locator(`.bar-pill:has-text("${source}")`)).toBeVisible();
});

Then('the now playing HUD should be visible', async ({ appPage }) => {
  // NowPlayingHUD is visible when activeSource === 'library' and a track is loaded
  const hud = appPage.locator('.now-playing-hud');
  await expect(hud).toBeAttached();
  await expect(hud).not.toHaveClass(/hud-hidden/);
});

// closeMenu step is used from 'I close the menu' in common.steps.ts
// This file just re-exports for consistency, no new step needed.

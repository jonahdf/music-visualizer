import { Given, When, Then, expect } from '../support/fixtures';
import { openMenu } from '../support/fixtures';

// ─── HUD visibility ───────────────────────────────────────────────────────────
// Note: 'the HUD should be visible' lives in common.steps.ts.

Then('the HUD should be hidden', async ({ appPage }) => {
  await expect(appPage.locator('.bottom-bar')).toHaveClass(/bar-hidden/);
});

When('mouse activity stops for {float} seconds', async ({ appPage }, seconds: number) => {
  // Move mouse to a corner so the HUD timer resets, then wait
  await appPage.mouse.move(100, 100);
  await appPage.waitForTimeout(500); // let the reset settle
  await appPage.waitForTimeout(Math.ceil(seconds * 1000));
});

Given('the HUD is hidden due to inactivity', async ({ appPage }) => {
  await appPage.mouse.move(100, 100);
  await appPage.waitForTimeout(500);
  await appPage.waitForTimeout(3500); // 3s timeout + buffer
  await expect(appPage.locator('.bottom-bar')).toHaveClass(/bar-hidden/);
});

When('I move the mouse', async ({ appPage }) => {
  await appPage.mouse.move(400, 300);
  await appPage.waitForTimeout(100);
});

// ─── Contextual HUD buttons ───────────────────────────────────────────────────

Then('the HUD mute button should not be present', async ({ appPage }) => {
  // Mute button is only rendered when initialized && activeSource is set
  const muteBtn = appPage.locator('.bar-btn[title*="Mute"], .bar-btn[title*="Unmute"]');
  await expect(muteBtn).not.toBeVisible();
});

Then('the HUD mute button should be present', async ({ appPage }) => {
  const muteBtn = appPage.locator('.bar-btn[title*="Mute"], .bar-btn[title*="Unmute"]');
  await expect(muteBtn).toBeVisible();
});

Then('the HUD hold button should not be present', async ({ appPage }) => {
  // bar-auto button only renders when interval > 0
  const holdBtn = appPage.locator('.bar-auto');
  await expect(holdBtn).not.toBeVisible();
});

Then('the HUD hold button should be present', async ({ appPage }) => {
  const holdBtn = appPage.locator('.bar-auto');
  await expect(holdBtn).toBeVisible();
});

When('I enable auto-advance at {string}', async ({ appPage }, label: string) => {
  await openMenu(appPage);
  await appPage.locator('.drawer-tab:has-text("Settings")').click();
  await appPage.locator(`.interval-btn:has-text("${label}")`).click();
  // Close menu so bottom bar buttons are the primary target of assertions
  await appPage.locator('.drawer-close').click();
  await expect(appPage.locator('.drawer')).not.toHaveClass(/drawer-open/);
});

// ─── HUD preset name & favorites ──────────────────────────────────────────────

// Note: 'the HUD preset name should be visible and non-empty' lives in common.steps.ts.

When('I click the HUD heart button', async ({ appPage }) => {
  // Ensure bottom bar is visible and preset has loaded (bar-fav only renders when activePreset is set)
  await appPage.mouse.move(400, 300);
  const btn = appPage.locator('.bar-fav');
  await btn.waitFor({ state: 'visible', timeout: 10_000 });
  await btn.click();
});

Then('the HUD heart button should appear filled', async ({ appPage }) => {
  const btn = appPage.locator('.bar-fav');
  await expect(btn).toHaveClass(/active/);
  await expect(btn).toContainText('♥');
});

Then('the HUD heart button should appear empty', async ({ appPage }) => {
  const btn = appPage.locator('.bar-fav');
  await expect(btn).not.toHaveClass(/active/);
  await expect(btn).toContainText('♡');
});

Given('the current preset is favorited from the HUD', async ({ appPage }) => {
  // Move mouse to reset the auto-hide timer, then wait for bar-fav to appear
  // (it only renders when activePreset is loaded) and for bar-hidden to clear.
  await appPage.mouse.move(400, 300);
  const btn = appPage.locator('.bar-fav');
  await btn.waitFor({ state: 'visible', timeout: 10_000 });
  const isActive = await btn.evaluate((el) => el.classList.contains('active'));
  if (!isActive) await btn.click();
  await expect(btn).toHaveClass(/active/);
});

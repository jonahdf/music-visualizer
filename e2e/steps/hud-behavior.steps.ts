import { Given, When, Then, expect } from '../support/fixtures';
import { openMenu } from '../support/fixtures';

// ─── HUD visibility ───────────────────────────────────────────────────────────
// Note: 'the HUD should be visible' lives in common.steps.ts.

Then('the HUD should be hidden', async ({ appPage }) => {
  await expect(appPage.locator('.hud')).toHaveClass(/hud-hidden/);
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
  await expect(appPage.locator('.hud')).toHaveClass(/hud-hidden/);
});

When('I move the mouse', async ({ appPage }) => {
  await appPage.mouse.move(400, 300);
  await appPage.waitForTimeout(100);
});

// ─── Contextual HUD buttons ───────────────────────────────────────────────────

Then('the HUD mute button should not be present', async ({ appPage }) => {
  // Mute button is only rendered when initialized && activeSource is set
  const muteBtn = appPage.locator('.hud-btn[title*="Mute"], .hud-btn[title*="Unmute"]');
  await expect(muteBtn).not.toBeVisible();
});

Then('the HUD mute button should be present', async ({ appPage }) => {
  const muteBtn = appPage.locator('.hud-btn[title*="Mute"], .hud-btn[title*="Unmute"]');
  await expect(muteBtn).toBeVisible();
});

Then('the HUD hold button should not be present', async ({ appPage }) => {
  const holdBtn = appPage.locator('.hud-btn[title*="Hold"]');
  await expect(holdBtn).not.toBeVisible();
});

Then('the HUD hold button should be present', async ({ appPage }) => {
  const holdBtn = appPage.locator('.hud-btn[title*="Hold"]');
  await expect(holdBtn).toBeVisible();
});

When('I enable auto-advance at {string}', async ({ appPage }, label: string) => {
  await openMenu(appPage);
  await appPage.locator('.menu-tab:has-text("Playlist")').click();
  await appPage.locator(`.interval-btn:has-text("${label}")`).click();
  // Close menu so HUD buttons are the primary target of assertions
  await appPage.locator('.close-btn').click();
  await appPage.locator('.menu-overlay').waitFor({ state: 'hidden' });
});

// ─── HUD preset name & favorites ──────────────────────────────────────────────

// Note: 'the HUD preset name should be visible and non-empty' lives in common.steps.ts.

When('I click the HUD heart button', async ({ appPage }) => {
  // Move the mouse to ensure the HUD is visible (it auto-hides after 3s of inactivity)
  await appPage.mouse.move(400, 300);
  await appPage.waitForTimeout(100);
  await appPage.locator('.hud-now-playing .favorite-btn').click();
});

Then('the HUD heart button should appear filled', async ({ appPage }) => {
  const btn = appPage.locator('.hud-now-playing .favorite-btn');
  await expect(btn).toHaveClass(/active/);
  await expect(btn).toContainText('♥');
});

Then('the HUD heart button should appear empty', async ({ appPage }) => {
  const btn = appPage.locator('.hud-now-playing .favorite-btn');
  await expect(btn).not.toHaveClass(/active/);
  await expect(btn).toContainText('♡');
});

Given('the current preset is favorited from the HUD', async ({ appPage }) => {
  // Move mouse to reset the auto-hide timer, then wait for hud-hidden to clear.
  // .hud-hidden sets pointer-events:none, so the click only works when the HUD is visible.
  await appPage.mouse.move(400, 300);
  await appPage.waitForFunction(() => !document.querySelector('.hud')?.classList.contains('hud-hidden'));
  const btn = appPage.locator('.hud-now-playing .favorite-btn');
  const isActive = await btn.evaluate((el) => el.classList.contains('active'));
  if (!isActive) await btn.click();
  await expect(btn).toHaveClass(/active/);
});

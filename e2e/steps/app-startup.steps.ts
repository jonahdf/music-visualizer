/**
 * Steps specific to Feature 01: App startup
 * Shared assertions (HUD visible, menu open, preset name) live in hud-behavior.steps.ts
 * and keyboard-shortcuts.steps.ts to avoid duplication.
 */
import { When, Then, expect } from '../support/fixtures';

Then('the start overlay should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.start-overlay')).toBeVisible();
});

Then('the visualizer canvas should be present', async ({ appPage }) => {
  await expect(appPage.locator('.visualizer-canvas')).toBeAttached();
});

Then('the HUD fps counter should not be visible', async ({ appPage }) => {
  await expect(appPage.locator('.hud-fps')).not.toBeVisible();
});

Then('the HUD fps counter should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.hud-fps')).toBeVisible();
});

When('I click the start overlay', async ({ appPage }) => {
  await appPage.locator('.start-overlay').click();
  await appPage.locator('.start-overlay').waitFor({ state: 'detached', timeout: 15_000 });
  // Reset the HUD auto-hide timer — App.tsx starts a 3s countdown on mount, and by the
  // time the overlay detaches (WebGL init can take a few seconds) the HUD may already be
  // hidden. A mouse move mirrors what a real user would do after clicking the overlay.
  await appPage.mouse.move(400, 300);
});

When('I click the visualizer canvas', async ({ appPage }) => {
  // The start-overlay is positioned on top of the canvas (z-index: 10).
  // force: true sends the click directly to the canvas element regardless.
  // Both the canvas and the overlay call the same handleCanvasClick handler,
  // so either click initializes the app.
  await appPage.locator('.visualizer-canvas').click({ force: true });
  await appPage.locator('.start-overlay').waitFor({ state: 'detached', timeout: 15_000 });
});

When('I click the menu toggle button', async ({ appPage }) => {
  await appPage.locator('.menu-toggle').click();
});

Then('the start overlay should disappear', async ({ appPage }) => {
  await expect(appPage.locator('.start-overlay')).not.toBeAttached();
});

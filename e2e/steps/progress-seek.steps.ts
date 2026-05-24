import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Given, When, Then, expect } from '../support/fixtures';
import { openMenu, closeMenu, goToTab } from '../support/fixtures';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_AUDIO_PATH = path.join(__dirname, '../support/test-audio.mp3');

// ─── Background step ──────────────────────────────────────────────────────────

Given('a library track is loaded and playing', async ({ appPage }) => {
  // Intercept Wikimedia audio URLs and serve the local test audio file so the
  // track loads instantly without a real network call.
  const testAudioBuffer = fs.readFileSync(TEST_AUDIO_PATH);
  await appPage.route('**/wikipedia/commons/**', async (route) => {
    await route.fulfill({
      contentType: 'audio/mpeg',
      body: testAudioBuffer,
    });
  });

  await openMenu(appPage);
  await goToTab(appPage, 'Audio');

  // Click the first track in the sample library
  const track = appPage.locator('.library-track').first();
  await track.waitFor({ state: 'visible', timeout: 10_000 });
  await track.click();

  // Wait for the Now Playing HUD to appear (track loaded + source = 'library')
  const hud = appPage.locator('.now-playing-hud');
  await hud.waitFor({ state: 'attached', timeout: 15_000 });
  await expect(hud).not.toHaveClass(/hud-hidden/);

  await closeMenu(appPage);

  // Ensure the bottom bar / HUD is visible for interactions
  await appPage.mouse.move(400, 300);
});

// ─── Assertions ───────────────────────────────────────────────────────────────

Then('the progress bar should be visible in the Now Playing HUD', async ({ appPage }) => {
  await expect(appPage.locator('.hud-progress-bar')).toBeVisible();
});

Then('the progress bar should have a pointer cursor', async ({ appPage }) => {
  const cursor = await appPage.locator('.hud-progress-bar').evaluate(
    (el) => window.getComputedStyle(el).cursor
  );
  expect(cursor).toBe('pointer');
});

// ─── Seek interaction ─────────────────────────────────────────────────────────

When('I drag the progress bar to {int} percent', async ({ appPage }, percent: number) => {
  const bar = appPage.locator('.hud-progress-bar');
  await bar.waitFor({ state: 'visible' });
  const box = await bar.boundingBox();
  if (!box) throw new Error('.hud-progress-bar not found');
  const targetX = box.x + box.width * (percent / 100);
  const midY = box.y + box.height / 2;
  // Press and hold to enter dragging state — dragProgress drives the fill width
  await appPage.mouse.move(targetX, midY);
  await appPage.mouse.down();
  // Tiny move so the mousemove handler fires once to confirm drag state
  await appPage.mouse.move(targetX + 1, midY);
  await appPage.waitForTimeout(100);
});

Then('the progress fill should show approximately {int} percent width', async ({ appPage }, percent: number) => {
  // During drag the fill reflects dragProgress (set synchronously on mousedown)
  const fillWidth = await appPage.locator('.hud-progress-fill').evaluate(
    (el: HTMLElement) => parseFloat(el.style.width)
  );
  expect(fillWidth).toBeGreaterThan(percent - 12);
  expect(fillWidth).toBeLessThan(percent + 12);
  // Release the drag so subsequent scenarios start clean
  await appPage.mouse.up();
});

/**
 * Steps for Feature 08: Error handling.
 *
 * All scenarios use the standard `appPage` fixture. Mocks are injected at runtime
 * via page.evaluate() — this works because getUserMedia / getDisplayMedia are only
 * called on user interaction (mic button click), not during page initialization.
 */
import { Given, When, Then, expect } from '../support/fixtures';

// ─── Runtime mock injection ────────────────────────────────────────────────────

Given('microphone permission will be denied', async ({ appPage }) => {
  // Overwrite getUserMedia after page load — only called on button click so this is safe
  await appPage.evaluate(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException('Permission denied', 'NotAllowedError');
    };
  });
});

Given('getDisplayMedia returns no audio tracks', async ({ appPage }) => {
  // Overwrite getDisplayMedia to return a video-only stream
  await appPage.evaluate(() => {
    navigator.mediaDevices.getDisplayMedia = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.captureStream(1); // video track only, no audio
    };
  });
});

// ─── Error toast assertions ────────────────────────────────────────────────────

Then('the error toast should mention {string} or {string}', async ({ appPage }, word1: string, word2: string) => {
  const text = (await appPage.locator('.error-toast').textContent())?.toLowerCase() ?? '';
  const matches = text.includes(word1.toLowerCase()) || text.includes(word2.toLowerCase());
  expect(matches, `Expected error toast to mention "${word1}" or "${word2}", got: "${text}"`).toBe(true);
});

Then('the error toast should mention {string}', async ({ appPage }, word: string) => {
  const text = (await appPage.locator('.error-toast').textContent())?.toLowerCase() ?? '';
  expect(text, `Expected error toast to mention "${word}", got: "${text}"`).toContain(word.toLowerCase());
});

When('I click the error toast', async ({ appPage }) => {
  // Close the drawer first — it may intercept pointer events on the toast.
  // The error toast persists after drawer close, so this doesn't change scenario intent.
  const drawer = appPage.locator('.drawer');
  if (await drawer.evaluate(el => el.classList.contains('drawer-open'))) {
    await appPage.locator('.drawer-close').click();
    await expect(drawer).not.toHaveClass(/drawer-open/);
  }
  await appPage.locator('.error-toast').click();
  await appPage.waitForTimeout(200);
});

// ─── Recovery assertions ───────────────────────────────────────────────────────

Then('the menu toggle button should be visible and clickable', async ({ appPage }) => {
  // The ☰ menu button lives in the bottom bar
  const btn = appPage.locator('.bar-btn[title="Menu (P)"]');
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
});

Then('I should be able to open the menu again', async ({ appPage }) => {
  await appPage.locator('.bar-btn[title="Menu (P)"]').click();
  await expect(appPage.locator('.drawer')).toHaveClass(/drawer-open/);
});

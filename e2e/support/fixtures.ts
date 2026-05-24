import { test as base } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  MOCK_GET_DISPLAY_MEDIA,
  MOCK_GET_DISPLAY_MEDIA_REJECT,
  MOCK_GET_DISPLAY_MEDIA_NO_AUDIO,
  MOCK_GET_USER_MEDIA,
  MOCK_FIREFOX_UA,
  MOCK_MIC_DENIED,
} from './mocks';

// ─── Custom fixtures ──────────────────────────────────────────────────────────

type AppFixtures = {
  /** Standard page: getDisplayMedia mocked, mic auto-granted via Chromium flag. */
  appPage: Page;
  /** Page where getDisplayMedia is rejected (for Firefox-UA + permission tests). */
  firefoxPage: Page;
  /** Page where getUserMedia is rejected (for mic permission-denied tests). */
  micDeniedPage: Page;
  /** Page where getDisplayMedia returns a stream with no audio tracks. */
  noAudioTrackPage: Page;
};

export const test = base.extend<AppFixtures>({
  appPage: async ({ page }, use) => {
    // Mock both getUserMedia and getDisplayMedia — the headless Chromium shell
    // doesn't honour --use-fake-device-for-media-stream reliably; JS-level mocks work.
    await page.addInitScript(MOCK_GET_USER_MEDIA);
    await page.addInitScript(MOCK_GET_DISPLAY_MEDIA);
    await use(page);
  },

  firefoxPage: async ({ page }, use) => {
    await page.addInitScript(MOCK_FIREFOX_UA);
    await page.addInitScript(MOCK_GET_DISPLAY_MEDIA_REJECT);
    await use(page);
  },

  micDeniedPage: async ({ page }, use) => {
    await page.addInitScript(MOCK_MIC_DENIED);
    await use(page);
  },

  noAudioTrackPage: async ({ page }, use) => {
    await page.addInitScript(MOCK_GET_DISPLAY_MEDIA_NO_AUDIO);
    await use(page);
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);
export { expect };

// ─── Navigation helpers (used across step files) ──────────────────────────────

/** Navigate to the app and wait for the React root. */
export async function openApp(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForSelector('.app', { state: 'attached' });
}

/**
 * Navigate and click through the start overlay so AudioContext + renderer
 * are initialized. Waits for the overlay to detach (set by setInitialized(true)).
 *
 * After init, moves the mouse to reset the HUD auto-hide timer. App.tsx calls
 * resetTimer() on mount which starts a 3-second countdown immediately; the overlay
 * click + detach wait can take 3-4 s, leaving the HUD already hidden. A mouse move
 * after init mirrors what real users do and keeps the HUD visible for assertions.
 */
export async function initializeApp(page: Page): Promise<void> {
  await openApp(page);
  const overlay = page.locator('.start-overlay');
  await overlay.waitFor({ state: 'visible' });
  await overlay.click();
  // Overlay detaches once initialized=true is set in React
  await overlay.waitFor({ state: 'detached', timeout: 15_000 });
  // Reset the HUD auto-hide timer so the HUD is visible for assertions
  await page.mouse.move(400, 300);
}

/** Open the menu via Space key; wait for the panel to appear. */
export async function openMenu(page: Page): Promise<void> {
  const menu = page.locator('.menu-overlay');
  const isOpen = await menu.isVisible().catch(() => false);
  if (!isOpen) {
    await page.keyboard.press('Space');
    await menu.waitFor({ state: 'visible' });
  }
}

/** Close the menu via the close button; wait for the panel to disappear. */
export async function closeMenu(page: Page): Promise<void> {
  const menu = page.locator('.menu-overlay');
  const isOpen = await menu.isVisible().catch(() => false);
  if (isOpen) {
    await page.locator('.close-btn').click();
    await menu.waitFor({ state: 'hidden' });
  }
}

/** Navigate to a named tab in the menu (must already be open). */
export async function goToTab(
  page: Page,
  tab: 'Presets' | 'Playlist' | 'Source' | 'Graphics'
): Promise<void> {
  await page.locator(`.menu-tab:has-text("${tab}")`).click();
}

/**
 * Initialize the app, open the menu, and navigate to a tab.
 * Convenience helper for Background steps.
 */
export async function initAndOpenTab(
  page: Page,
  tab: 'Presets' | 'Playlist' | 'Source' | 'Graphics'
): Promise<void> {
  await initializeApp(page);
  await openMenu(page);
  await goToTab(page, tab);
}

/** Read the current active preset name from the HUD. */
export async function getActivePresetName(page: Page): Promise<string> {
  return (await page.locator('.hud-preset-name').textContent()) ?? '';
}

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
 * are initialized. Waits for the overlay to detach (set by setInitialized(true))
 * and for the first preset to be active (so bar-fav/bar-block are rendered).
 *
 * After init, moves the mouse to reset the bottom bar auto-hide timer. App.tsx calls
 * resetTimer() on mount which starts a 3-second countdown immediately; the overlay
 * click + detach wait can take 3-4 s, leaving the bar already hidden. A mouse move
 * after init mirrors what real users do and keeps the bar visible for assertions.
 */
export async function initializeApp(page: Page): Promise<void> {
  await openApp(page);
  const overlay = page.locator('.start-overlay');
  await overlay.waitFor({ state: 'visible' });
  await overlay.click();
  // Overlay detaches once initialized=true is set in React
  await overlay.waitFor({ state: 'detached', timeout: 15_000 });
  // Navigate to the first real preset so activePreset is non-null and bar-fav/bar-block render.
  // The app auto-loads a DEFAULT_PRESET (id='default') which is not in the presets array,
  // so bar-preset-name shows '—'. We wait for the lazy-imported preset bundles to finish
  // loading, then press ArrowRight to load pool[0].
  await page.locator('.preset-item').first().waitFor({ state: 'attached', timeout: 20_000 });
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(
    () => document.querySelector('.bar-preset-name')?.textContent !== '—',
    null,
    { timeout: 10_000 }
  );
  // Reset the bottom bar auto-hide timer so it stays visible for assertions
  await page.mouse.move(400, 300);
}

/** Open the drawer menu via the P key; wait for it to slide open. */
export async function openMenu(page: Page): Promise<void> {
  const drawer = page.locator('.drawer');
  const isOpen = await drawer.evaluate(el => el.classList.contains('drawer-open')).catch(() => false);
  if (!isOpen) {
    await page.keyboard.press('p');
    await expect(drawer).toHaveClass(/drawer-open/);
  }
}

/** Close the drawer via the ✕ button; wait for it to close. */
export async function closeMenu(page: Page): Promise<void> {
  const drawer = page.locator('.drawer');
  const isOpen = await drawer.evaluate(el => el.classList.contains('drawer-open')).catch(() => false);
  if (isOpen) {
    await page.locator('.drawer-close').click();
    await expect(drawer).not.toHaveClass(/drawer-open/);
  }
}

/** Navigate to a named tab in the drawer (must already be open). */
export async function goToTab(
  page: Page,
  tab: 'Presets' | 'Audio' | 'Settings' | 'Create'
): Promise<void> {
  await page.locator(`.drawer-tab:has-text("${tab}")`).click();
}

/**
 * Initialize the app, open the drawer, and navigate to a tab.
 * Convenience helper for Background steps.
 */
export async function initAndOpenTab(
  page: Page,
  tab: 'Presets' | 'Audio' | 'Settings' | 'Create'
): Promise<void> {
  await initializeApp(page);
  await openMenu(page);
  await goToTab(page, tab);
}

/** Read the current active preset name from the bottom bar. */
export async function getActivePresetName(page: Page): Promise<string> {
  return (await page.locator('.bar-preset-name').textContent()) ?? '';
}

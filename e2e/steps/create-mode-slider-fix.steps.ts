import { When, Then, expect } from '../support/fixtures';

// Helper: find the cfg-param-row for a given label text (exact match)
function paramRow(appPage: import('@playwright/test').Page, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return appPage.locator('.cfg-param-row').filter({
    has: appPage.locator('.cfg-param-label', { hasText: new RegExp(`^${escaped}$`) }),
  });
}

When('I navigate to the Motion subtab', async ({ appPage }) => {
  await appPage.locator('.cfg-subtab:has-text("Motion")').click();
});

When('I move the Zoom slider to {string}', async ({ appPage }, value: string) => {
  const slider = paramRow(appPage, 'Zoom').locator('.cfg-slider');
  await slider.waitFor({ state: 'visible' });
  // Use the native value setter so React detects the change
  await slider.evaluate((el: HTMLInputElement, v: string) => {
    const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (nativeSetter) nativeSetter.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  await appPage.waitForTimeout(200);
});

When('I enter per-frame equations {string}', async ({ appPage }, text: string) => {
  const textarea = appPage.locator('textarea[placeholder="a.zoom = 1.0 + 0.1*a.bass_att;"]');
  await textarea.waitFor({ state: 'visible' });
  await textarea.fill(text);
  await appPage.waitForTimeout(100);
});

Then('the combined frame equations should not have a static {string} override',
  async ({ appPage }, varName: string) => {
    // window.__lastLivePreset is set by App.tsx's handleLivePreviewChange for test observability
    const lastPreset = await appPage.evaluate(() => (window as any).__lastLivePreset);
    const frameEqs: string = lastPreset?.frame_eqs_str ?? '';
    // A static override looks like: a.varName = 1.050;  (plain number RHS, no operators/variables)
    const staticOverride = new RegExp(`^a\\.${varName}\\s*=\\s*-?\\d+\\.?\\d*\\s*;`, 'm');
    expect(staticOverride.test(frameEqs)).toBe(false);
  }
);

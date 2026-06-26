import { When, Then, expect } from '../support/fixtures';

// Helper: find the cfg-param-row for a given label text (exact match)
function paramRow(appPage: import('@playwright/test').Page, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return appPage.locator('.cfg-param-row').filter({
    has: appPage.locator('.cfg-param-label', { hasText: new RegExp(`^${escaped}$`) }),
  });
}

When('I open the drawer on the Presets tab', async ({ appPage }) => {
  await appPage.keyboard.press('p');
  await appPage.locator('.drawer').waitFor({ state: 'visible' });
  await appPage.locator('.drawer-tab:has-text("Presets")').click();
  await appPage.locator('.preset-list').waitFor({ state: 'visible' });
});

When('I select a preset that has equations', async ({ appPage }) => {
  // Click the first preset in the list to set activePresetData
  await appPage.locator('.preset-item').first().click();
  await appPage.waitForTimeout(200);
});

When('I switch to the Create tab', async ({ appPage }) => {
  await appPage.locator('.drawer-tab:has-text("Create")').click();
  await appPage.locator('.configurator').waitFor({ state: 'visible' });
});

When('I click Load Current', async ({ appPage }) => {
  const btn = appPage.locator('.cfg-btn:has-text("Load Current")');
  await expect(btn).toBeEnabled({ timeout: 5000 });
  await btn.click();
});

When('I navigate to the Code subtab', async ({ appPage }) => {
  await appPage.locator('.cfg-subtab:has-text("Code")').click();
});

When('I navigate to the Wave subtab', async ({ appPage }) => {
  await appPage.locator('.cfg-subtab:has-text("Wave")').click();
});

Then('the {string} slider min should be {string}', async ({ appPage }, label: string, expectedMin: string) => {
  const slider = paramRow(appPage, label).locator('.cfg-slider');
  await slider.waitFor({ state: 'visible' });
  const min = await slider.getAttribute('min');
  expect(min).toBe(expectedMin);
});

Then('the {string} slider max should be {string}', async ({ appPage }, label: string, expectedMax: string) => {
  const slider = paramRow(appPage, label).locator('.cfg-slider');
  await slider.waitFor({ state: 'visible' });
  const max = await slider.getAttribute('max');
  expect(max).toBe(expectedMax);
});

When('I click the {string} param value', async ({ appPage }, label: string) => {
  const valueSpan = paramRow(appPage, label).locator('.cfg-param-value');
  await valueSpan.waitFor({ state: 'visible' });
  await valueSpan.click();
});

When('I type {string} into the param value input and confirm', async ({ appPage }, value: string) => {
  const input = appPage.locator('.cfg-param-value-input');
  await input.waitFor({ state: 'visible' });
  await input.fill(value);
  await input.press('Enter');
  await appPage.waitForTimeout(100);
});

Then('the {string} displayed value should be {string}', async ({ appPage }, label: string, expectedValue: string) => {
  const valueSpan = paramRow(appPage, label).locator('.cfg-param-value');
  await valueSpan.waitFor({ state: 'visible' });
  const text = await valueSpan.textContent();
  expect(text?.trim()).toBe(expectedValue);
});

When('I set the {string} slider to its minimum value', async ({ appPage }, label: string) => {
  const slider = paramRow(appPage, label).locator('.cfg-slider');
  await slider.waitFor({ state: 'visible' });
  const min = await slider.getAttribute('min');
  // Use the native value setter + input event to trigger React's onChange
  await slider.evaluate((el: HTMLInputElement, v: string) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (setter) setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, min ?? '0');
  await appPage.waitForTimeout(100);
});

Then('the combined per-frame equations should not contain static overrides for variables already in user equations', async ({ appPage }) => {
  // Wait for Load Current to push combined equations to the renderer (window hook set in DEV build)
  await appPage.waitForFunction(() => (window as any).__bcLastCombinedPerFrameEqs !== undefined);
  const eqs: string = await appPage.evaluate(() => (window as any).__bcLastCombinedPerFrameEqs ?? '');

  // Find variables that appear in user equations (dynamic patterns like a.wave_r = a.wave_r + ...)
  const varPattern = /a\.(\w+)\s*=\s*a\.\1/g;
  const accumVars: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = varPattern.exec(eqs)) !== null) {
    accumVars.push(match[1]);
  }

  // For each accumulator variable, verify there is no static override line (a.varName = <number>;)
  // appearing before the accumulator equation in the combined output
  for (const varName of accumVars) {
    const staticOverride = new RegExp(`a\\.${varName}\\s*=\\s*[\\d.]+\\s*;`);
    const accumulatorEq = new RegExp(`a\\.${varName}\\s*=\\s*a\\.${varName}`);
    const staticMatch = staticOverride.exec(eqs);
    const accumMatch = accumulatorEq.exec(eqs);
    if (staticMatch && accumMatch) {
      // Static override must NOT appear before the accumulator equation
      const msg = `Static override for a.${varName} (pos ${staticMatch.index}) appears before accumulator equation (pos ${accumMatch.index}) in combined per-frame equations`;
      expect(staticMatch.index, msg).toBeGreaterThan(accumMatch.index);
    }
  }
});

Then('the per-frame equations textarea should have line breaks after each semicolon', async ({ appPage }) => {
  // Per-Frame Equations textarea has placeholder "a.zoom = 1.0 + 0.1*a.bass_att;"
  const textarea = appPage.locator('textarea[placeholder="a.zoom = 1.0 + 0.1*a.bass_att;"]');
  const value = await textarea.inputValue();

  // Skip if empty (preset has no per-frame equations)
  if (!value.trim()) return;

  // Every semicolon not at end of string must be followed by a newline
  const trimmed = value.trimEnd();
  const withoutTrailingSemi = trimmed.endsWith(';') ? trimmed.slice(0, -1) : trimmed;
  const hasSemiWithoutNewline = /;[^\n]/.test(withoutTrailingSemi);
  expect(hasSemiWithoutNewline).toBe(false);
});

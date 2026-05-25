import { When, Then, expect } from '../support/fixtures';

When('I open the drawer on the Create tab', async ({ appPage }) => {
  // Intercept clipboard.writeText before opening the drawer
  await appPage.evaluate(() => {
    (window as any).__lastClipboardText = null;
    const orig = navigator.clipboard.writeText.bind(navigator.clipboard);
    (navigator.clipboard as any).writeText = async (text: string) => {
      (window as any).__lastClipboardText = text;
      return orig(text).catch(() => {});
    };
  });
  await appPage.keyboard.press('p');
  await appPage.locator('.drawer').waitFor({ state: 'visible' });
  await appPage.locator('.drawer-tab:has-text("Create")').click();
  await appPage.locator('.configurator').waitFor({ state: 'visible' });
});

When('I copy the AI prompt', async ({ appPage }) => {
  await appPage.locator('.cfg-ai-btn').click();
  // Wait for clipboard to be populated
  await appPage.waitForFunction(() => (window as any).__lastClipboardText !== null, null, { timeout: 5000 });
});

Then('the AI prompt should mention {string} or {string}', async ({ appPage }, a: string, b: string) => {
  const text: string = await appPage.evaluate(() => (window as any).__lastClipboardText ?? '');
  const contains = text.includes(a) || text.includes(b);
  expect(contains, `Expected prompt to mention "${a}" or "${b}"`).toBe(true);
});

Then('the AI prompt should mention EEL syntax differences', async ({ appPage }) => {
  const text: string = await appPage.evaluate(() => (window as any).__lastClipboardText ?? '');
  // The prompt should call out that native Milkdrop EEL syntax does NOT work
  const mentionsEel = text.toLowerCase().includes('eel') || text.includes('sin(') || text.includes('above(') || text.includes('if(cond');
  expect(mentionsEel, 'Expected prompt to mention EEL syntax differences').toBe(true);
});

Then('the AI prompt should contain a beat-detection or audio-reactive example', async ({ appPage }) => {
  const text: string = await appPage.evaluate(() => (window as any).__lastClipboardText ?? '');
  // Should have a concrete code example showing bass/audio-reactive per-frame equations
  const hasBassExample = text.includes('bass') && text.includes('a.zoom') && text.includes('Math.sin');
  expect(hasBassExample, 'Expected prompt to contain a beat/audio-reactive code example with zoom and Math.sin').toBe(true);
});

Then('the AI prompt should contain a per-vertex or per-pixel example', async ({ appPage }) => {
  const text: string = await appPage.evaluate(() => (window as any).__lastClipboardText ?? '');
  // Should explain per-vertex equations with a.rad / a.ang / tunnel example
  const hasPerVertex = (text.includes('a.rad') || text.includes('a.ang')) && text.includes('per_pixel');
  expect(hasPerVertex, 'Expected prompt to contain a per-vertex/per-pixel example using a.rad or a.ang').toBe(true);
});

Then('the AI prompt should explain q-variable accumulation across frames', async ({ appPage }) => {
  const text: string = await appPage.evaluate(() => (window as any).__lastClipboardText ?? '');
  // q-variables persist across frames — critical for beat detection and color cycling
  const hasQVarAccum = (text.includes('q1') || text.includes('q2')) &&
    (text.includes('accum') || text.includes('persist') || text.includes('previous frame') || text.includes('accumulate') || text.includes('state'));
  expect(hasQVarAccum, 'Expected prompt to explain q-variable persistence across frames').toBe(true);
});

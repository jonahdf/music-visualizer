import { When, Then, expect } from '../support/fixtures';

// A minimal butterchurn preset JSON with a baseVals key
const FULL_PRESET_JSON = JSON.stringify({
  baseVals: { zoom: 1.05, decay: 0.98, wave_mode: 0 },
  waves: [],
  shapes: [],
  init_eqs_str: '',
  frame_eqs_str: '',
  pixel_eqs_str: '',
  warp: '',
  comp: '',
});

const FULL_PRESET_JSON_ZOOM_109 = JSON.stringify({
  baseVals: { zoom: 1.09, decay: 0.98, wave_mode: 0 },
  waves: [],
  shapes: [],
  init_eqs_str: '',
  frame_eqs_str: '',
  pixel_eqs_str: '',
  warp: '',
  comp: '',
});

When('I open the import panel', async ({ appPage }) => {
  const toggle = appPage.locator('.cfg-import-toggle');
  await toggle.waitFor({ state: 'visible' });
  const isActive = await toggle.evaluate(el => el.classList.contains('active'));
  if (!isActive) await toggle.click();
  await appPage.locator('.cfg-import-panel').waitFor({ state: 'visible' });
});

When('I paste a full butterchurn preset JSON into the import textarea', async ({ appPage }) => {
  const textarea = appPage.locator('.cfg-import-textarea');
  await textarea.waitFor({ state: 'visible' });
  await textarea.fill(FULL_PRESET_JSON);
});

When('I paste a full butterchurn preset JSON with zoom 1.09 into the import textarea', async ({ appPage }) => {
  const textarea = appPage.locator('.cfg-import-textarea');
  await textarea.waitFor({ state: 'visible' });
  await textarea.fill(FULL_PRESET_JSON_ZOOM_109);
});

When('I paste an AI diff JSON with zoom into the import textarea', async ({ appPage }) => {
  const textarea = appPage.locator('.cfg-import-textarea');
  await textarea.waitFor({ state: 'visible' });
  await textarea.fill(JSON.stringify({ zoom: 1.05 }));
});

When('I paste an AI diff JSON with zoom {float} into the import textarea', async ({ appPage }, zoom: number) => {
  const textarea = appPage.locator('.cfg-import-textarea');
  await textarea.waitFor({ state: 'visible' });
  await textarea.fill(JSON.stringify({ zoom }));
});

When('I click Apply in the import panel', async ({ appPage }) => {
  await appPage.locator('.cfg-import-actions .cfg-btn-accent').click();
  // Wait for the panel to close
  await appPage.locator('.cfg-import-panel').waitFor({ state: 'hidden', timeout: 5000 });
});

Then('the import hint should mention {string}', async ({ appPage }, keyword: string) => {
  const hint = appPage.locator('.cfg-import-hint');
  await hint.waitFor({ state: 'visible' });
  const text = await hint.textContent();
  expect(text?.toLowerCase()).toContain(keyword.toLowerCase());
});

Then('the import panel should show {string}', async ({ appPage }, text: string) => {
  const detect = appPage.locator('.cfg-import-detect');
  await detect.waitFor({ state: 'visible', timeout: 3000 });
  const content = await detect.textContent();
  expect(content).toContain(text);
});

Then('the "Replace entirely" checkbox should not be visible', async ({ appPage }) => {
  const checkbox = appPage.locator('.cfg-import-replace');
  await expect(checkbox).not.toBeVisible();
});

Then('the "Replace entirely" checkbox should be visible', async ({ appPage }) => {
  const checkbox = appPage.locator('.cfg-import-replace');
  await expect(checkbox).toBeVisible();
});

import { When, Then, expect } from '../support/fixtures';

When('I navigate to the Animate subtab', async ({ appPage }) => {
  await appPage.locator('.cfg-subtab:has-text("Animate")').click();
  await appPage.locator('.cfg-anim-panel').waitFor({ state: 'visible' });
});

Then('the {string} animation row should be active', async ({ appPage }, label: string) => {
  const row = appPage.locator('.cfg-anim-row', {
    has: appPage.locator('.cfg-anim-row-label', { hasText: label }),
  });
  await expect(row).toHaveClass(/active/);
});

Then('the configurator {string} button should be visible', async ({ appPage }, label: string) => {
  await expect(appPage.locator(`.configurator-toolbar .cfg-btn:has-text("${label}")`)).toBeVisible();
});

When('I click the configurator {string} button', async ({ appPage }, label: string) => {
  await appPage.locator(`.configurator-toolbar .cfg-btn:has-text("${label}")`).click();
});

Then('no animation rows should be active', async ({ appPage }) => {
  const activeRows = appPage.locator('.cfg-anim-row.active');
  await expect(activeRows).toHaveCount(0);
});

Then('the animations enabled toggle should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.cfg-anim-toggle')).toBeVisible();
});

When('I click the animations enabled toggle', async ({ appPage }) => {
  await appPage.locator('.cfg-anim-toggle').click();
});

Then('the animations enabled toggle should show as off', async ({ appPage }) => {
  await expect(appPage.locator('.cfg-anim-toggle')).toHaveClass(/off/);
});

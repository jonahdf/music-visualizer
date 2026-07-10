import { Then, expect } from '../support/fixtures';

Then('the {string} slider should not be visible', async ({ appPage }, label: string) => {
  const row = appPage.locator('.setting-row', {
    has: appPage.locator(`.setting-label:has-text("${label}")`),
  });
  await expect(row).not.toBeVisible();
});

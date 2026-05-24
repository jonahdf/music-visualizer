import { When, Then, expect } from '../support/fixtures';

Then('the changelog button should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.bar-changelog')).toBeVisible();
});

When('I click the changelog button', async ({ appPage }) => {
  // Move mouse to reset the auto-hide timer so the bar is visible for assertion purposes
  await appPage.mouse.move(400, 300);
  await appPage.waitForFunction(
    () => !document.querySelector('.bottom-bar')?.classList.contains('bar-hidden')
  );
  // JS .click() bypasses CSS pointer-events:none which bar-hidden may have re-applied
  await appPage.evaluate(() => {
    (document.querySelector('.bar-changelog') as HTMLElement)?.click();
  });
});

Then('the changelog modal should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.changelog-modal')).toBeVisible();
});

Then('the changelog modal should contain at least one release entry', async ({ appPage }) => {
  await appPage.locator('.changelog-section').first().waitFor({ state: 'visible', timeout: 3000 });
  const count = await appPage.locator('.changelog-section').count();
  expect(count).toBeGreaterThanOrEqual(1);
});

When('I close the changelog modal', async ({ appPage }) => {
  await appPage.locator('.changelog-close').click();
});

Then('the changelog modal should not be visible', async ({ appPage }) => {
  await expect(appPage.locator('.changelog-modal')).not.toBeVisible();
});

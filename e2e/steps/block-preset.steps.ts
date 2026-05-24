/**
 * Steps for Feature 10: Block preset from auto-advance.
 */
import { Given, When, Then, expect } from '../support/fixtures';

Then('the block button should be present in the bottom bar', async ({ appPage }) => {
  await expect(appPage.locator('.bar-block')).toBeVisible();
});

When('I click the block button', async ({ appPage }) => {
  await appPage.mouse.move(400, 300);
  await appPage.waitForFunction(() => !document.querySelector('.bottom-bar')?.classList.contains('bar-hidden'));
  await appPage.locator('.bar-block').click();
});

Then('the block button should appear active', async ({ appPage }) => {
  await expect(appPage.locator('.bar-block')).toHaveClass(/active/);
});

Then('the block button should not appear active', async ({ appPage }) => {
  await expect(appPage.locator('.bar-block')).not.toHaveClass(/active/);
});

Given('the current preset is blocked', async ({ appPage }) => {
  await appPage.mouse.move(400, 300);
  await appPage.waitForFunction(() => !document.querySelector('.bottom-bar')?.classList.contains('bar-hidden'));
  const btn = appPage.locator('.bar-block');
  const isActive = await btn.evaluate(el => el.classList.contains('active'));
  if (!isActive) await btn.click();
  await expect(btn).toHaveClass(/active/);
});

Then('the active preset should be marked as excluded in the list', async ({ appPage }) => {
  const activeItem = appPage.locator('.preset-item.active');
  await expect(activeItem).toHaveClass(/excluded/);
});

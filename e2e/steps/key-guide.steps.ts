/**
 * Steps for Feature 09: Keyboard shortcut guide overlay.
 */
import { Given, When, Then, expect } from '../support/fixtures';

Given('the key guide is open', async ({ appPage }) => {
  const guide = appPage.locator('.key-guide');
  const isHidden = await guide.evaluate(el => el.classList.contains('key-guide-hidden')).catch(() => true);
  if (isHidden) {
    await appPage.keyboard.press('?');
    await expect(guide).not.toHaveClass(/key-guide-hidden/);
  }
});

Then('the key guide should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.key-guide')).not.toHaveClass(/key-guide-hidden/);
});

Then('the key guide should not be visible', async ({ appPage }) => {
  await expect(appPage.locator('.key-guide')).toHaveClass(/key-guide-hidden/);
});

When('I click the key guide close button', async ({ appPage }) => {
  await appPage.locator('.key-guide-close').click();
});

Then('the key guide should mention {string}', async ({ appPage }, text: string) => {
  await expect(appPage.locator('.key-guide')).toContainText(text);
});

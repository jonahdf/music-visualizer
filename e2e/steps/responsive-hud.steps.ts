import { Then, expect } from '../support/fixtures';

Then('the bottom bar left edge should align with the drawer right edge', async ({ appPage }) => {
  const drawerRight = await appPage.locator('.drawer').evaluate(
    (el) => el.getBoundingClientRect().right
  );
  const barLeft = await appPage.locator('.bottom-bar').evaluate(
    (el) => el.getBoundingClientRect().left
  );
  expect(barLeft).toBeCloseTo(drawerRight, -1);
});

Then('the bottom bar left edge should be at the viewport left', async ({ appPage }) => {
  const barLeft = await appPage.locator('.bottom-bar').evaluate(
    (el) => el.getBoundingClientRect().left
  );
  expect(barLeft).toBeCloseTo(0, -1);
});

import { Then, expect } from '../support/fixtures';

const GITHUB_ISSUES_URL = 'https://github.com/jonahdf/music-visualizer/issues';

Then('the GitHub issues link should be visible', async ({ appPage }) => {
  await expect(appPage.locator('.github-issues-link')).toBeVisible();
});

Then('the GitHub issues link should have the correct href', async ({ appPage }) => {
  const link = appPage.locator('.github-issues-link');
  await expect(link).toHaveAttribute('href', GITHUB_ISSUES_URL);
});

import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'e2e/features/**/*.feature',
  // Include both step files and the fixtures file (which exports Given/When/Then)
  steps: ['e2e/steps/**/*.steps.ts', 'e2e/support/fixtures.ts'],
});

export default defineConfig({
  testDir,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  // Each scenario gets its own browser context (fresh localStorage, IndexedDB).
  // Cap at 2 workers — each browser runs WebGL2 via SwiftShader which is CPU-heavy;
  // running 5+ workers simultaneously causes resource exhaustion and test timeouts.
  workers: 2,
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: [
        // Allow AudioContext to start without a user gesture (needed for programmatic init)
        '--autoplay-policy=no-user-gesture-required',
        // Software WebGL2 renderer — no GPU required, works in CI
        '--use-gl=swiftshader',
        '--disable-gpu-sandbox',
        // Note: we do NOT use --use-fake-device-for-media-stream because the headless
        // Chromium shell does not honour it reliably (getUserMedia hangs).
        // getUserMedia and getDisplayMedia are mocked at the JS level via addInitScript.
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // In CI use the production build: butterchurn-presets ships as one optimised
    // chunk so initializeApp() finishes in ~3s instead of ~15s over the dev server.
    // Locally reuse whatever is already running on 5174 (npm run dev).
    command: process.env.CI
      ? 'npm run build && npx vite preview --port 5174'
      : 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    // Build + preview startup can take up to 90s on a slow CI runner.
    timeout: process.env.CI ? 90_000 : 30_000,
  },
});

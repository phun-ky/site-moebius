// End-to-end tests of the built site (#41), in the installed Google Chrome
// (set CHROME_PATH to use another binary), at desktop and phone size. Run
// after `npm run build`. A failed test keeps its trace in test-results/;
// open it with `npx playwright show-trace`. To run each test many times,
// use the E2E repeat workflow on GitHub instead of a laptop.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  // Each worker runs its own Chrome; two keep a laptop usable. CI uses the
  // runner's default
  workers: process.env.CI ? undefined : 2,
  forbidOnly: Boolean(process.env.CI),
  // A test that only passes on a second try is a bug to fix, not to hide
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    ...(process.env.CHROME_PATH
      ? { launchOptions: { executablePath: process.env.CHROME_PATH } }
      : { channel: 'chrome' }),
    // The copy buttons write to the clipboard, and the tests read it back
    permissions: ['clipboard-read', 'clipboard-write']
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } }
  ],
  webServer: {
    command: `node scripts/serve.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI
  }
});

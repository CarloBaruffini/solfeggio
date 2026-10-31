import { defineConfig, devices } from '@playwright/test';

import { FAKE_MICROPHONE_WAV } from './e2e/fakeMicrophone';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}/solfeggio/`;

/**
 * End-to-end tests run against the production build served by `vite preview`,
 * so they also cover the base path and the service worker.
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /microphone\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    { name: 'mobile', testIgnore: /microphone\.spec\.ts/, use: { ...devices['Pixel 7'] } },
    {
      // Chromium with a fake microphone that plays a looping A4.
      name: 'microphone',
      testMatch: /microphone\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['microphone'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            `--use-file-for-fake-audio-capture=${FAKE_MICROPHONE_WAV}`,
          ],
        },
      },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

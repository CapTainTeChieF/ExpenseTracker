import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: { baseURL: 'http://localhost:5173', trace:'retain-on-failure', screenshot:'only-on-failure' },
  projects: [
    { name:'chromium-desktop', use: {...devices['Desktop Chrome']} },
    { name:'chromium-mobile', use: {...devices['Pixel 7']} },
  ],
  reporter: [['list'], ['html',{outputFolder:'playwright-report',open:'never'}]],
  webServer: {
    command: 'npm run dev -- --mode qa --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 40_000,
  },
});

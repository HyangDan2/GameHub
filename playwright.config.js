import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4173/GameHub/', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/serve.mjs', env: { SERVE_DIR: 'dist' }, url: 'http://127.0.0.1:4173/GameHub/', reuseExistingServer: false },
});

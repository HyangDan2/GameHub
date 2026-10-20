import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { checkUrl } from './check-links.mjs';
const url = 'https://hyangdan2.github.io/GameHub/';
await checkUrl(url);
const expected = JSON.parse(await readFile('data/games.json', 'utf8')).games.filter(g => g.status !== 'draft');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('.game-card').last().waitFor();
  if (await page.locator('.game-card').count() !== expected.length) throw new Error('Hosted catalog count mismatch');
  for (const game of expected) {
    const card = page.locator(`[data-game="${game.id}"]`);
    if (!(await card.locator('img').evaluate(img => img.complete && img.naturalWidth > 0))) throw new Error(`Broken thumbnail: ${game.id}`);
    if (game.status === 'published') {
      if (await card.locator('a').getAttribute('href') !== game.playUrl) throw new Error(`Incorrect link: ${game.id}`);
      await checkUrl(game.playUrl);
    }
  }
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow at ${width}`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Hosted acceptance passed: ${url}; ${expected.length} cards, images, destinations, desktop/mobile layouts.`);
} finally { await browser.close(); }

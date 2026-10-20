import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const catalog = JSON.parse(await readFile(new URL('../../data/games.json', import.meta.url), 'utf8'));
const ready = async page => { await page.goto('./'); await expect(page.locator('.game-card')).toHaveCount(3); };
for (const width of [360, 390, 768, 1440]) {
  test(`production layout and assets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 }); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await ready(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const img of await page.locator('.card-image img').all()) await expect(img).toHaveJSProperty('naturalWidth', 960);
    for (const game of catalog.games) await expect(page.getByRole('link', { name: `${game.title} 플레이하기` })).toHaveAttribute('href', game.playUrl);
    expect(errors).toEqual([]);
  });
}
test('each game opens its exact URL in the same tab', async ({ page, context }) => {
  for (const game of catalog.games) {
    await page.route(game.playUrl, route => route.fulfill({ body: '<h1>Game destination</h1>', contentType: 'text/html' }));
    await ready(page);
    await page.getByRole('link', { name: `${game.title} 플레이하기` }).click();
    await expect(page).toHaveURL(game.playUrl); expect(context.pages()).toHaveLength(1);
  }
});
test('keyboard navigation has visible focus and activates a game', async ({ page }) => {
  await ready(page);
  await page.keyboard.press('Tab'); await expect(page.getByText('게임 목록으로 이동')).toBeFocused();
  const target = page.getByRole('link', { name: 'Particle Beat 플레이하기' });
  for (let i = 0; i < 12 && !(await target.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(target).toBeFocused();
  expect(await target.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.route(catalog.games[0].playUrl, route => route.fulfill({ body: 'Destination' }));
  await page.keyboard.press('Enter'); await expect(page).toHaveURL(catalog.games[0].playUrl);
});
test('catalog failure offers a working retry', async ({ page }) => {
  let fail = true;
  await page.route('**/data/games.json', route => fail ? route.fulfill({ status: 503, body: '' }) : route.fulfill({ json: catalog }));
  await page.goto('./'); await expect(page.getByRole('alert')).toBeVisible();
  fail = false; await page.getByRole('button', { name: '다시 불러오기' }).click(); await expect(page.locator('.game-card')).toHaveCount(3);
});
test('broken image falls back to a local placeholder', async ({ page }) => {
  await page.route('**/particle-beat.webp', route => route.abort());
  await ready(page); await expect(page.locator('[data-game="particle-beat"] img')).toHaveAttribute('src', './assets/games/placeholder.svg');
});
test('draft, unavailable, and hostile metadata render safely', async ({ page }) => {
  const data = structuredClone(catalog); data.games[0].status = 'draft'; data.games[1].status = 'unavailable'; data.games[2].title = '<img src=x onerror=alert(1)>';
  await page.route('**/data/games.json', route => route.fulfill({ json: data })); await page.goto('./');
  await expect(page.locator('.game-card')).toHaveCount(2);
  await expect(page.locator('[data-game="valkyrie"] a')).toHaveCount(0);
  await expect(page.locator('[data-game="chibilink"] h3')).toHaveText(data.games[2].title);
  await expect(page.locator('[data-game="chibilink"] h3 img')).toHaveCount(0);
});
test('large text and long titles fit a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const data = structuredClone(catalog); data.games[0].title = 'A very long game name for a very small mobile browser screen';
  await page.route('**/data/games.json', route => route.fulfill({ json: data }));
  await ready(page); await page.addStyleTag({ content: 'p,a,h2,h3,span {font-size:150% !important}' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('reduced motion removes transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await ready(page);
  expect(await page.locator('.game-card').first().evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});
test('touch can launch a game', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.route(catalog.games[1].playUrl, route => route.fulfill({ body: 'Game' }));
  await page.goto('http://127.0.0.1:4173/GameHub/');
  await page.getByRole('link', { name: 'VALKYRIE 플레이하기' }).tap();
  await expect(page).toHaveURL(catalog.games[1].playUrl); await context.close();
});

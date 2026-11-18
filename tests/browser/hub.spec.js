import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const catalog = JSON.parse(await readFile(new URL('../../data/games.json', import.meta.url), 'utf8'));
const gameById = id => catalog.games.find(game => game.id === id);
const visibleCount = data => data.games.filter(game => game.status !== 'draft').length;
const ready = async (page, data = catalog) => { await page.goto('./'); await expect(page.locator('.game-card')).toHaveCount(visibleCount(data)); };
for (const width of [360, 390, 768, 1440]) {
  test(`production layout and assets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 }); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await ready(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const img of await page.locator('.card-image img').all()) await expect(img).toHaveJSProperty('naturalWidth', 960);
    for (const game of catalog.games) await expect(page.getByRole('link', { name: `Play ${game.title}`, exact: true })).toHaveAttribute('href', game.playUrl);
    expect(errors).toEqual([]);
  });
}
test('each game opens its exact URL in the same tab', async ({ page, context }) => {
  for (const game of catalog.games) {
    await page.route(game.playUrl, route => route.fulfill({ body: '<h1>Game destination</h1>', contentType: 'text/html' }));
    await ready(page);
    await page.getByRole('link', { name: `Play ${game.title}`, exact: true }).click();
    await expect(page).toHaveURL(game.playUrl); expect(context.pages()).toHaveLength(1);
  }
});
test('keyboard navigation has visible focus and activates a game', async ({ page }) => {
  await ready(page);
  await page.keyboard.press('Tab'); await expect(page.getByText('Skip to games')).toBeFocused();
  const game = gameById('particle-beat');
  const target = page.getByRole('link', { name: `Play ${game.title}`, exact: true });
  for (let i = 0; i < 12 && !(await target.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(target).toBeFocused();
  expect(await target.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.route(game.playUrl, route => route.fulfill({ body: 'Destination' }));
  await page.keyboard.press('Enter'); await expect(page).toHaveURL(game.playUrl);
});
test('catalog failure offers a working retry', async ({ page }) => {
  let fail = true;
  await page.route('**/data/games.json', route => fail ? route.fulfill({ status: 503, body: '' }) : route.fulfill({ json: catalog }));
  await page.goto('./'); await expect(page.getByRole('alert')).toBeVisible();
  fail = false; await page.getByRole('button', { name: 'Try again' }).click(); await expect(page.locator('.game-card')).toHaveCount(visibleCount(catalog));
});
test('broken image falls back to a local placeholder', async ({ page }) => {
  await page.route('**/particle-beat.webp', route => route.abort());
  await ready(page); await expect(page.locator('[data-game="particle-beat"] img')).toHaveAttribute('src', './assets/games/placeholder.svg');
});
test('draft, unavailable, and hostile metadata render safely', async ({ page }) => {
  const data = structuredClone(catalog);
  data.games.find(game => game.id === 'particle-beat').status = 'draft';
  data.games.find(game => game.id === 'valkyrie').status = 'unavailable';
  data.games.find(game => game.id === 'chibilink').title = '<img src=x onerror=alert(1)>';
  await page.route('**/data/games.json', route => route.fulfill({ json: data })); await page.goto('./');
  await expect(page.locator('.game-card')).toHaveCount(visibleCount(data));
  await expect(page.locator('[data-game="valkyrie"] a')).toHaveCount(0);
  await expect(page.locator('[data-game="chibilink"] h3')).toHaveText(data.games.find(game => game.id === 'chibilink').title);
  await expect(page.locator('[data-game="chibilink"] h3 img')).toHaveCount(0);
});
test('large text and long titles fit a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const data = structuredClone(catalog); data.games.find(game => game.id === 'particle-beat').title = 'A very long game name for a very small mobile browser screen';
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
  const game = gameById('valkyrie');
  await page.route(game.playUrl, route => route.fulfill({ body: 'Game' }));
  await page.goto('http://127.0.0.1:4173/GameHub/');
  await page.getByRole('link', { name: `Play ${game.title}`, exact: true }).tap();
  await expect(page).toHaveURL(game.playUrl); await context.close();
});
test('HD2Lab brand and the shared hub tabs are linked', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.brand .brand-name')).toHaveText('HD2Lab');
  await expect(page.locator('.brand em')).toHaveText('GameHub');
  // One tab row for the whole family: Home, Apps, Play, Tech, Diary, About.
  const tabs = page.locator('.header-nav .nav-tab');
  await expect(tabs).toHaveCount(6);
  await expect(tabs.nth(0)).toHaveAttribute('href', 'https://hyangdan2.github.io/');
  await expect(tabs.nth(1)).toHaveText('Apps');
  await expect(tabs.nth(1)).toHaveAttribute('href', 'https://hyangdan2.github.io/ApplicationHub/');
  await expect(tabs.nth(2)).toHaveText('Play');
  await expect(tabs.nth(2)).toHaveAttribute('aria-current', 'page');
  await expect(tabs.nth(3)).toHaveAttribute('href', 'https://hyangdan2.github.io/TechnicalHub/');
  await expect(tabs.nth(4)).toHaveAttribute('href', 'https://hyangdan2.github.io/diary/');
  await expect(tabs.nth(5)).toHaveText('About');
  await expect(tabs.nth(5)).toHaveAttribute('href', 'https://hyangdan2.github.io/about/');
  await expect(page.locator('.header-nav [aria-current="page"]')).toHaveCount(1);
  await expect(page.locator('.web-hq-link, .hub-link')).toHaveCount(0);
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', './assets/branding/favicon.svg');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', './assets/branding/apple-touch-icon.png');
  await expect(page.locator('.header-inner .mark')).toHaveCount(1);
});

test('the mobile ≡ unfolds the right drawer with the full hub list', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await expect(page.locator('.header-nav')).toBeHidden();
  const menu = page.getByRole('button', { name: 'Open menu' });
  const box = await menu.boundingBox();
  expect(Math.round(box.width)).toBe(44);
  expect(Math.round(box.height)).toBe(44);
  await menu.click();
  const drawer = page.locator('#mobile-drawer');
  await expect(drawer).toHaveClass(/is-open/);
  await expect(drawer).toHaveAttribute('aria-hidden', 'false');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('body')).toHaveClass(/drawer-open/);
  await expect(page.locator('.drawer-backdrop')).toBeVisible();
  const items = drawer.locator('.drawer-item');
  await expect(items).toHaveCount(6);
  await expect(items.nth(0)).toContainText('00 / HQ');
  await expect(items.nth(1)).toContainText('01 / APPS');
  await expect(items.nth(2)).toContainText('02 / PLAY');
  await expect(items.nth(3)).toContainText('03 / EXPLORE');
  await expect(items.nth(4)).toContainText('04 / DIARY');
  await expect(items.nth(5)).toContainText('05 / ABOUT');
  await expect(items.nth(5)).toHaveAttribute('href', 'https://hyangdan2.github.io/about/');
  await expect(drawer.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(drawer.locator('[aria-current="page"]')).toContainText('GameHub');
  await expect.poll(() => page.locator('#theme-toggle').evaluate(node => getComputedStyle(node).opacity)).toBe('0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(drawer).not.toHaveClass(/is-open/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveClass(/drawer-open/);
  await expect(menu).toBeFocused();
});

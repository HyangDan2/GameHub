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
  // The three dropdown tabs add their panels to the tab order while focused,
  // so the card sits further down the sequence than it used to.
  for (let i = 0; i < 60 && !(await target.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
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
  // One tab row for the whole family: Home, Apps, Play, Tech, Diary (dropdown),
  // Info (dropdown), About.
  const tabs = page.locator('.header-nav .nav-tab');
  await expect(tabs).toHaveCount(7);
  await expect(tabs.nth(0)).toHaveAttribute('href', 'https://hyangdan2.github.io/');
  await expect(tabs.nth(1)).toHaveText('Apps');
  await expect(tabs.nth(1)).toHaveAttribute('href', 'https://hyangdan2.github.io/ApplicationHub/');
  await expect(tabs.nth(2)).toHaveText('Play');
  await expect(tabs.nth(2)).toHaveAttribute('aria-current', 'page');
  await expect(tabs.nth(3)).toHaveAttribute('href', 'https://hyangdan2.github.io/TechnicalHub/');
  await expect(tabs.nth(4)).toHaveAttribute('href', 'https://hyangdan2.github.io/diary/');
  await expect(tabs.nth(5)).toHaveText('Info');
  await expect(tabs.nth(5)).toHaveAttribute('href', 'https://hyangdan2.github.io/InformationHub/');
  await expect(tabs.nth(6)).toHaveText('About');
  await expect(tabs.nth(6)).toHaveAttribute('href', 'https://hyangdan2.github.io/about/');
  await expect(page.locator('.header-nav [aria-current="page"]')).toHaveCount(1);
  await expect(page.locator('.web-hq-link, .hub-link')).toHaveCount(0);
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', './assets/branding/favicon.svg');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', './assets/branding/apple-touch-icon.png');
  await expect(page.locator('.header-inner .mark')).toHaveCount(1);
});

const APPS_MENU = [
  ['Midpoint', 'https://hyangdan2.github.io/PKPilot0002/'],
  ['Film Studio', 'https://hyangdan2.github.io/AGPilot0007/'],
  ['Shutterplate', 'https://hyangdan2.github.io/PKPilot0003/'],
  ['DOS Player', 'https://hyangdan2.github.io/PKPilot0006/'],
  ['HD2Markdown Viewer', 'https://hyangdan2.github.io/PKPilot0008/'],
  ['Machine Learning Lab', 'https://hyangdan2.github.io/EDPilot0001/'],
  ['CinePlate', 'https://hyangdan2.github.io/PKPilot0011/'],
  ['ObjectLens', 'https://hyangdan2.github.io/PKPilot0012/'],
  ['CodePlayground', 'https://hyangdan2.github.io/PKPilot0013/'],
  ['SlideDeck', 'https://hyangdan2.github.io/PKPilot0014/'],
  ['FrameBuilder', 'https://hyangdan2.github.io/PKPilot0015/'],
];
const PUBLIC_GAMES = catalog.games.filter(game => game.status !== 'draft');
const PLAY_MENU = PUBLIC_GAMES.map(game => [game.title, game.playUrl]);
const DIARY_MENU = [
  ['Devlog', 'https://hyangdan2.github.io/diary/categories/devlog/'],
  ['Architecture', 'https://hyangdan2.github.io/diary/categories/architecture/'],
  ['Troubleshooting', 'https://hyangdan2.github.io/diary/categories/troubleshooting/'],
  ['Notes', 'https://hyangdan2.github.io/diary/categories/notes/'],
];
const INFO_MENU = [
  ['China AI', 'https://hyangdan2.github.io/InformationHub/china-ai/'],
  ['US Markets', 'https://hyangdan2.github.io/InformationHub/us-markets/'],
];

test('the mobile ≡ unfolds the right drawer as a one-line list whose Apps, Play, Diary, and Info rows unfold one at a time', async ({ page }) => {
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

  // One compact line per hub: no index meta, no description card.
  const items = drawer.locator('.drawer-item');
  await expect(items).toHaveCount(7);
  for (const [index, label] of ['Web-HQ', 'Apps', 'Play', 'Tech', 'Diary', 'Info', 'About'].entries()) {
    await expect(items.nth(index)).toHaveText(label);
    const row = await items.nth(index).boundingBox();
    expect(row.height).toBeGreaterThanOrEqual(44);
    expect(row.height).toBeLessThanOrEqual(48);
  }
  await expect(items.nth(0)).toHaveAttribute('href', 'https://hyangdan2.github.io/');
  await expect(items.nth(5)).toHaveAttribute('href', 'https://hyangdan2.github.io/InformationHub/');
  await expect(items.nth(6)).toHaveAttribute('href', 'https://hyangdan2.github.io/about/');
  await expect(drawer.locator('.drawer-item-meta, .drawer-item-desc')).toHaveCount(0);
  await expect(drawer.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(drawer.locator('[aria-current="page"]')).toHaveText('Play');
  // Web-HQ (Home), Tech, and About stay plain links: exactly four accordions.
  await expect(drawer.locator('.drawer-group')).toHaveCount(4);
  // No "Top" entry in any section list: the row label above is the top page.
  await expect(drawer.locator('.drawer-sub a').filter({ hasText: /^Top$/ })).toHaveCount(0);

  const group = key => drawer.locator(`.drawer-group[data-drawer-group="${key}"]`);
  const heightOf = locator => locator.evaluate(node => Math.round(node.getBoundingClientRect().height));
  const linksOf = key => group(key).locator('.drawer-sub a');

  // Play is the hub you are on, so its group starts unfolded.
  const playToggle = drawer.getByRole('button', { name: 'Play sections' });
  await expect(playToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(linksOf('play')).toHaveCount(PLAY_MENU.length);
  for (const [index, [label, href]] of PLAY_MENU.entries()) {
    await expect(linksOf('play').nth(index)).toHaveText(label);
    await expect(linksOf('play').nth(index)).toHaveAttribute('href', href);
  }
  expect(await heightOf(group('play').locator('.drawer-sub'))).toBeGreaterThan(PLAY_MENU.length * 38);

  // Apps starts closed; unfolding it folds Play, so the drawer never grows past
  // one section. Its 11 apps live in a five-row window that scrolls.
  const appsToggle = drawer.getByRole('button', { name: 'Apps sections' });
  await expect(appsToggle).toHaveAttribute('aria-expanded', 'false');
  expect(await heightOf(group('apps').locator('.drawer-sub'))).toBe(0);
  expect(await linksOf('apps').first().evaluate(node => node.closest('[inert]') !== null)).toBe(true);
  await appsToggle.click();
  await expect(appsToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(linksOf('apps')).toHaveCount(APPS_MENU.length);
  for (const [index, [label, href]] of APPS_MENU.entries()) {
    await expect(linksOf('apps').nth(index)).toHaveText(label);
    await expect(linksOf('apps').nth(index)).toHaveAttribute('href', href);
  }
  await expect.poll(() => heightOf(group('apps').locator('.drawer-sub'))).toBeGreaterThan(200);
  expect(await heightOf(group('apps').locator('.drawer-sub'))).toBeLessThanOrEqual(230);
  const appsList = await group('apps').locator('.drawer-sub').evaluate(node => ({
    client: node.clientHeight,
    scroll: node.scrollHeight,
  }));
  expect(appsList.client).toBeLessThanOrEqual(230);
  expect(appsList.scroll).toBeGreaterThan(appsList.client);
  expect(await linksOf('apps').first().evaluate(node => node.closest('[inert]') !== null)).toBe(false);
  // Play folded when Apps unfolded: one section open at a time.
  await expect(playToggle).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(() => heightOf(group('play').locator('.drawer-sub'))).toBe(0);
  // About stays on screen even with Apps open, because the list scrolls.
  await expect(drawer.locator('.drawer-item').filter({ hasText: /^About$/ })).toBeInViewport();

  // Diary is its own accordion with the four categories under it.
  const diaryRow = group('diary').locator('.drawer-split .drawer-item');
  await expect(diaryRow).toHaveAttribute('href', 'https://hyangdan2.github.io/diary/');
  const diaryToggle = drawer.getByRole('button', { name: 'Diary sections' });
  await expect(diaryToggle).toHaveAttribute('aria-expanded', 'false');
  await diaryToggle.click();
  await expect(diaryToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(linksOf('diary')).toHaveCount(DIARY_MENU.length);
  for (const [index, [label, href]] of DIARY_MENU.entries()) {
    await expect(linksOf('diary').nth(index)).toHaveText(label);
    await expect(linksOf('diary').nth(index)).toHaveAttribute('href', href);
  }
  await expect.poll(() => heightOf(group('diary').locator('.drawer-sub'))).toBeGreaterThan(150);
  await expect(appsToggle).toHaveAttribute('aria-expanded', 'false');

  // Info is its own accordion with the China AI channel under it.
  const infoRow = group('info').locator('.drawer-split .drawer-item');
  await expect(infoRow).toHaveAttribute('href', 'https://hyangdan2.github.io/InformationHub/');
  const infoToggle = drawer.getByRole('button', { name: 'Info sections' });
  await expect(infoToggle).toHaveAttribute('aria-expanded', 'false');
  await infoToggle.click();
  await expect(infoToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(linksOf('info')).toHaveCount(INFO_MENU.length);
  for (const [index, [label, href]] of INFO_MENU.entries()) {
    await expect(linksOf('info').nth(index)).toHaveText(label);
    await expect(linksOf('info').nth(index)).toHaveAttribute('href', href);
  }
  await expect.poll(() => heightOf(group('info').locator('.drawer-sub'))).toBeGreaterThan(38);
  await expect(diaryToggle).toHaveAttribute('aria-expanded', 'false');
  const infoLeft = (await infoRow.boundingBox()).x;
  expect((await linksOf('info').first().boundingBox()).x - infoLeft).toBeGreaterThanOrEqual(12);

  const diaryLeft = (await diaryRow.boundingBox()).x;
  const sectionLeft = (await linksOf('diary').first().boundingBox()).x;
  expect(sectionLeft - diaryLeft).toBeGreaterThanOrEqual(12);
  expect(await linksOf('diary').first().evaluate(node => getComputedStyle(node).paddingLeft)).toBe('20px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  // One section at a time: each click opens its own group and folds the last,
  // so a single click on the open row is what folds it back.
  await appsToggle.click();
  await expect(appsToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(diaryToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(infoToggle).toHaveAttribute('aria-expanded', 'false');
  await diaryToggle.click();
  await expect(diaryToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(appsToggle).toHaveAttribute('aria-expanded', 'false');
  await infoToggle.click();
  await expect(infoToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(diaryToggle).toHaveAttribute('aria-expanded', 'false');
  await infoToggle.click();
  await expect(appsToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(diaryToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(infoToggle).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(() => heightOf(group('apps').locator('.drawer-sub'))).toBe(0);
  await expect.poll(() => heightOf(group('diary').locator('.drawer-sub'))).toBe(0);
  await expect.poll(() => heightOf(group('info').locator('.drawer-sub'))).toBe(0);

  await expect.poll(() => page.locator('#theme-toggle').evaluate(node => getComputedStyle(node).opacity)).toBe('0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(drawer).not.toHaveClass(/is-open/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveClass(/drawer-open/);
  await expect(menu).toBeFocused();
});

test('the Apps, Play, Diary, and Info tabs unfold their sections on hover and keep their own links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./');
  const menus = [
    ['apps', 'Apps', 'https://hyangdan2.github.io/ApplicationHub/', APPS_MENU],
    ['play', 'Play', 'https://hyangdan2.github.io/GameHub/', PLAY_MENU],
    ['diary', 'Diary', 'https://hyangdan2.github.io/diary/', DIARY_MENU],
    ['info', 'Info', 'https://hyangdan2.github.io/InformationHub/', INFO_MENU],
  ];
  for (const [key, label, href, entries] of menus) {
    const wrapper = page.locator(`.nav-dropdown[data-nav-group="${key}"]`);
    const tab = wrapper.locator('.nav-tab');
    await expect(tab).toHaveText(label);
    await expect(tab).toHaveAttribute('href', href);
    const panel = wrapper.locator('.nav-dropdown-panel');
    const visibility = () => panel.evaluate(node => getComputedStyle(node).visibility);
    expect(await visibility()).toBe('hidden');

    await tab.hover();
    await expect.poll(visibility).toBe('visible');
    await expect(panel.locator('a')).toHaveCount(entries.length);
    for (const [index, [text, target]] of entries.entries()) {
      await expect(panel.locator('a').nth(index)).toHaveText(text);
      await expect(panel.locator('a').nth(index)).toHaveAttribute('href', target);
    }
    await expect(panel.locator('a').filter({ hasText: /^Top$/ })).toHaveCount(0);
    await expect(panel.locator('a').first()).toBeVisible();
    if (key === 'apps') {
      // 11 apps, a five-row window: the panel scrolls instead of running down
      // the page, and the pointer can still travel from the tab into it.
      const box = await panel.evaluate(node => ({ client: node.clientHeight, scroll: node.scrollHeight }));
      expect(box.client).toBeLessThanOrEqual(230);
      expect(box.scroll).toBeGreaterThan(box.client);
      expect(await panel.evaluate(node => getComputedStyle(node).overflowY)).toBe('auto');
      expect(await panel.evaluate(node => getComputedStyle(node).scrollbarWidth)).toBe('thin');
      const tabBox = await tab.boundingBox();
      const panelBox = await panel.boundingBox();
      await page.mouse.move(tabBox.x + tabBox.width / 2, tabBox.y + tabBox.height / 2);
      await page.mouse.move(panelBox.x + panelBox.width / 2, panelBox.y + 20, { steps: 8 });
      await page.waitForTimeout(150);
      await expect.poll(visibility).toBe('visible');
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(150);
      expect(await panel.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
      await expect(panel.locator('a').last()).toBeInViewport();
      await panel.evaluate(node => { node.scrollTop = 0; });
      await page.mouse.move(10, 600);
      await expect.poll(visibility).toBe('hidden');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.mouse.move(10, 600);
    await expect.poll(visibility).toBe('hidden');

    // Keyboard users reach the sections by focusing the tab, then tabbing in.
    await tab.focus();
    await expect.poll(visibility).toBe('visible');
    await page.keyboard.press('Tab');
    await expect(panel.locator('a').first()).toBeFocused();
    await expect.poll(visibility).toBe('visible');
    // Info holds a single channel; the others have more than one link.
    if (entries.length > 1) {
      await page.keyboard.press('Tab');
      await expect(panel.locator('a').nth(1)).toBeFocused();
      await expect.poll(visibility).toBe('visible');
    }
  }
});

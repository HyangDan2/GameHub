import { visibleGames, safePlayUrl } from './catalog.js';

const grid = document.querySelector('#game-grid');
const count = document.querySelector('#game-count');
const inputLabels = { keyboard: 'Keyboard', mouse: 'Mouse', touch: 'Touch', gamepad: 'Gamepad' };
const orientationLabels = { any: 'Portrait & Landscape', landscape: 'Mobile Landscape', portrait: 'Mobile Portrait', unknown: 'Orientation Unverified' };

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function card(game, index) {
  const article = element('article', 'game-card');
  article.dataset.game = game.id;
  if (/^#[0-9a-f]{6}$/i.test(game.accent ?? '')) article.style.setProperty('--accent', game.accent);
  const picture = element('div', 'card-image');
  const img = element('img');
  img.src = game.thumbnail;
  img.alt = game.thumbnailAlt;
  img.width = 960; img.height = 504;
  img.loading = 'lazy'; img.decoding = 'async';
  img.addEventListener('error', () => {
    img.src = './assets/games/placeholder.svg';
    img.alt = `${game.title} — image coming soon`;
  }, { once: true });
  picture.append(img, element('span', 'image-caption', game.imageKind === 'artwork' ? 'Official Art' : 'Gameplay Screen'));
  const body = element('div', 'card-body');
  const kicker = element('div', 'card-kicker');
  kicker.append(element('span', '', game.genre.toUpperCase()), element('span', 'card-index', String(index + 1).padStart(2, '0')));
  const meta = element('div', 'card-meta');
  meta.append(element('span', 'meta-pill', game.inputs.map(input => inputLabels[input]).join(' · ')));
  meta.append(element('span', `meta-pill${game.mobileOrientation === 'landscape' ? ' orientation' : ''}`, orientationLabels[game.mobileOrientation]));
  if (game.mobileSupport === 'unknown') meta.append(element('span', 'meta-pill', 'Mobile support unverified'));
  body.append(kicker, element('h3', 'card-title', game.title), element('p', 'card-subtitle', game.subtitle ?? ''), element('p', 'card-description', game.description), meta);
  if (game.status === 'published' && safePlayUrl(game.playUrl)) {
    const link = element('a', 'play-link', 'Play Now');
    link.href = game.playUrl;
    link.setAttribute('aria-label', `Play ${game.title}`);
    const arrow = element('span', '', '↗'); arrow.setAttribute('aria-hidden', 'true'); link.append(arrow);
    body.append(link);
  } else {
    body.append(element('span', 'play-link unavailable', 'Not ready yet'));
  }
  article.append(picture, body);
  return article;
}

async function load() {
  grid.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('./data/games.json');
    if (!response.ok) throw new Error('Catalog unavailable');
    const catalog = await response.json();
    if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.games)) throw new Error('Invalid catalog');
    const games = visibleGames(catalog);
    grid.replaceChildren(...games.map(card));
    if (!games.length) grid.append(element('p', 'load-message', 'New games are on the way. Check back soon.'));
    count.textContent = String(games.length).padStart(2, '0');
    count.hidden = false;
  } catch {
    const message = element('div', 'load-message');
    message.setAttribute('role', 'alert');
    message.append(element('p', '', 'Couldn’t load the game list. Check your connection and try again.'));
    const retry = element('button', '', 'Try again'); retry.type = 'button';
    retry.addEventListener('click', load); message.append(retry);
    grid.replaceChildren(message); count.hidden = true;
  } finally { grid.setAttribute('aria-busy', 'false'); }
}
load();

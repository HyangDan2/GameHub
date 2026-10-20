import { visibleGames, safePlayUrl } from './catalog.js';

const grid = document.querySelector('#game-grid');
const count = document.querySelector('#game-count');
const inputLabels = { keyboard: '키보드', mouse: '마우스', touch: '터치', gamepad: '게임패드' };
const orientationLabels = { any: '세로 · 가로', landscape: '모바일 가로 화면', portrait: '모바일 세로 화면', unknown: '화면 방향 미확인' };

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
    img.alt = `${game.title} — 이미지 준비 중`;
  }, { once: true });
  picture.append(img, element('span', 'image-caption', game.imageKind === 'artwork' ? '공식 프로모션 아트' : '실제 플레이 화면'));
  const body = element('div', 'card-body');
  const kicker = element('div', 'card-kicker');
  kicker.append(element('span', '', game.genre.toUpperCase()), element('span', 'card-index', String(index + 1).padStart(2, '0')));
  const meta = element('div', 'card-meta');
  meta.append(element('span', 'meta-pill', game.inputs.map(input => inputLabels[input]).join(' · ')));
  meta.append(element('span', `meta-pill${game.mobileOrientation === 'landscape' ? ' orientation' : ''}`, orientationLabels[game.mobileOrientation]));
  if (game.mobileSupport === 'unknown') meta.append(element('span', 'meta-pill', '모바일 지원 미확인'));
  body.append(kicker, element('h3', 'card-title', game.title), element('p', 'card-subtitle', game.subtitle ?? ''), element('p', 'card-description', game.description), meta);
  if (game.status === 'published' && safePlayUrl(game.playUrl)) {
    const link = element('a', 'play-link', '플레이하기');
    link.href = game.playUrl;
    link.setAttribute('aria-label', `${game.title} 플레이하기`);
    const arrow = element('span', '', '↗'); arrow.setAttribute('aria-hidden', 'true'); link.append(arrow);
    body.append(link);
  } else {
    body.append(element('span', 'play-link unavailable', '지금은 준비 중이에요'));
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
    if (!games.length) grid.append(element('p', 'load-message', '새로운 게임을 준비하고 있어요. 잠시 후 다시 방문해 주세요.'));
    count.textContent = String(games.length).padStart(2, '0');
    count.hidden = false;
  } catch {
    const message = element('div', 'load-message');
    message.setAttribute('role', 'alert');
    message.append(element('p', '', '게임 목록을 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.'));
    const retry = element('button', '', '다시 불러오기'); retry.type = 'button';
    retry.addEventListener('click', load); message.append(retry);
    grid.replaceChildren(message); count.hidden = true;
  } finally { grid.setAttribute('aria-busy', 'false'); }
}
load();

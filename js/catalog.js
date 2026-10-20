export function normalizeRepository(value) {
  const url = new URL(value);
  return `${url.hostname.toLowerCase()}${url.pathname.replace(/\/+$/, '').replace(/\.git$/i, '').toLowerCase()}`;
}

export function visibleGames(catalog) {
  return catalog.games.filter(game => game.status !== 'draft').sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}

export function safePlayUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
}

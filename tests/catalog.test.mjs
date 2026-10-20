import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateCatalog } from '../scripts/validate-catalog.mjs';
import { normalizeRepository, visibleGames, safePlayUrl } from '../js/catalog.js';
const source = JSON.parse(await readFile(new URL('../data/games.json', import.meta.url), 'utf8'));
test('published catalog has valid assets and evidence', async () => assert.deepEqual(await validateCatalog(source), []));
test('normalized repository comparison ignores casing and git suffix', () => assert.equal(normalizeRepository('https://GitHub.com/HYANGDAN2/GameHub.git/'), 'github.com/hyangdan2/gamehub'));
test('duplicate repository cannot masquerade as a new game', async () => {
  const data = structuredClone(source); data.games.push({ ...data.games[0], id: 'duplicate', repositoryUrl: data.games[0].repositoryUrl.toUpperCase().replace('HTTPS', 'https') + '.git/' });
  assert.ok((await validateCatalog(data, false)).some(e => e.includes('Duplicate repository')));
});
test('unsafe destination is rejected', async () => {
  const data = structuredClone(source); data.games[0].playUrl = 'javascript:alert(1)';
  assert.ok((await validateCatalog(data, false)).length);
  assert.equal(safePlayUrl('https://user:pass@example.com'), false);
});
test('invalid status is rejected', async () => {
  const data = structuredClone(source); data.games[0].status = 'live';
  assert.ok((await validateCatalog(data, false)).length);
});
test('missing thumbnail fails validation', async () => {
  const data = structuredClone(source); data.games[0].thumbnail = 'assets/games/missing.webp';
  assert.ok((await validateCatalog(data)).some(e => e.includes('Missing thumbnail')));
});
test('drafts are hidden and display order is stable', () => {
  const data = structuredClone(source); data.games[0].status = 'draft'; data.games[2].sortOrder = 0;
  assert.deepEqual(visibleGames(data).map(g => g.id), [data.games[2].id, data.games[1].id]);
});

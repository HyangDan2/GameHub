import { readFile } from 'node:fs/promises';
export async function checkUrl(url) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      let response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
      if (!response.ok) response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.url.startsWith('https://')) throw new Error('Non-HTTPS redirect');
      return { url, finalUrl: response.url, status: response.status };
    } catch (error) { last = error; }
  }
  throw new Error(`${url}: ${last.message}`);
}
if (process.argv[1]?.endsWith('check-links.mjs')) {
  const catalog = JSON.parse(await readFile('data/games.json', 'utf8'));
  const results = await Promise.allSettled(catalog.games.filter(g => g.status === 'published').map(g => checkUrl(g.playUrl)));
  for (const result of results) {
    if (result.status === 'fulfilled') console.log(JSON.stringify(result.value));
    else { console.error(result.reason.message); process.exitCode = 1; }
  }
}

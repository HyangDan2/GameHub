import Ajv from 'ajv';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalizeRepository, safePlayUrl } from '../js/catalog.js';

const root = new URL('../', import.meta.url);
const schema = JSON.parse(await readFile(new URL('schema/games.schema.json', root), 'utf8'));
const validate = new Ajv({ allErrors: true }).compile(schema);

export async function validateCatalog(catalog, checkFiles = true) {
  const errors = [];
  if (!validate(catalog)) return validate.errors.map(error => `${error.instancePath}: ${error.message}`);
  const ids = new Set(), repos = new Set();
  for (const game of catalog.games) {
    if (ids.has(game.id)) errors.push(`Duplicate ID: ${game.id}`);
    ids.add(game.id);
    if (!safePlayUrl(game.playUrl) || !safePlayUrl(game.repositoryUrl)) errors.push(`Unsafe URL: ${game.id}`);
    const normalized = normalizeRepository(game.repositoryUrl);
    if (repos.has(normalized)) errors.push(`Duplicate repository: ${game.repositoryUrl}`);
    repos.add(normalized);
    for (const field of ['title', 'description', 'genre', 'thumbnailAlt']) {
      if (!game[field].trim()) errors.push(`Blank ${field}: ${game.id}`);
    }
    if (checkFiles) {
      for (const field of ['thumbnail', 'evidencePath']) {
        try { if (!(await stat(new URL(game[field], root))).isFile()) throw new Error(); }
        catch { errors.push(`Missing ${field}: ${game[field]}`); }
      }
      if (game.mobileSupport === 'device-verified') {
        const evidence = await readFile(new URL(game.evidencePath, root), 'utf8').catch(() => '');
        if (!/Device verification:/i.test(evidence)) errors.push(`Missing device verification section: ${game.id}`);
      }
    }
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const catalog = JSON.parse(await readFile(new URL('data/games.json', root), 'utf8'));
  const errors = await validateCatalog(catalog);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log(`Catalog valid: ${catalog.games.length} games, local assets and evidence present.`);
}

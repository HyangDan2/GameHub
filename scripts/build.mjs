import { cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { validateCatalog } from './validate-catalog.mjs';
const catalog = JSON.parse(await readFile('data/games.json', 'utf8'));
const errors = await validateCatalog(catalog);
if (errors.length) throw new Error(errors.join('\n'));
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const file of ['index.html', 'css', 'js', 'assets']) await cp(file, `dist/${file}`, { recursive: true });
await mkdir('dist/data');
// Operational source revisions and evidence paths remain in the repository.
const publicCatalog = { schemaVersion: catalog.schemaVersion, games: catalog.games.filter(g => g.status !== 'draft').map(({ evidencePath, sourceRevision, ...game }) => game) };
await writeFile('dist/data/games.json', JSON.stringify(publicCatalog));
await writeFile('dist/.nojekyll', '');
console.log('Built dist/ with only public site files.');

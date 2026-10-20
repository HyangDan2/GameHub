import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.env.SERVE_DIR || '.');
const base = '/GameHub/';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/GameHub' || url.pathname === '/') { res.writeHead(302, { Location: base }); return res.end(); }
    if (!url.pathname.startsWith(base)) { res.writeHead(404); return res.end('Not found'); }
    const path = resolve(root, decodeURIComponent(url.pathname.slice(base.length)) || 'index.html');
    if (!path.startsWith(root + sep) || !(await stat(path)).isFile()) throw new Error();
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`http://127.0.0.1:${server.address().port}${base}`));

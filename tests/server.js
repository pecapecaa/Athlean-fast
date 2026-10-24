// A static server that serves the site the way Cloudflare Pages does.
//
// Pages does two things a plain file server does not: it serves foo.html at
// /foo, and it permanently redirects /foo.html to /foo. Testing against a
// plain file server means testing a different site than the one customers
// get — the URLs in the sitemap, in every canonical link and in every
// internal link would look right locally and redirect in production.
//
//   node tests/server.js [port]

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.argv[2] || 8299);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

// Never serve anything outside the site directory, whatever the request says.
function resolveSafe(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const full = path.normalize(path.join(ROOT, decoded));
  return full.startsWith(ROOT) ? full : null;
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let pathname = url.pathname;

  // Pages redirects the .html form to the extensionless one, permanently.
  if (pathname.endsWith('.html') && !pathname.endsWith('/index.html')) {
    const clean = pathname.slice(0, -'.html'.length);
    res.writeHead(308, { Location: clean + url.search });
    return res.end();
  }

  if (pathname === '/') pathname = '/index.html';

  let file = resolveSafe(pathname);
  if (!file) { res.writeHead(403); return res.end('Forbidden'); }

  // /vino is served from vino.html.
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const asHtml = resolveSafe(pathname + '.html');
    if (asHtml && fs.existsSync(asHtml)) file = asHtml;
  }

  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const notFound = path.join(ROOT, '404.html');
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    return res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found');
  }

  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));

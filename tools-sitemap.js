// Builds sitemap.xml and robots.txt from data.js.
//
//   node tools-sitemap.js
//
// Every level page comes from data.js, so the sitemap is generated rather
// than kept by hand: a hand-written one drifts the moment a level is added,
// and nothing complains.

const fs = require('fs');
const path = require('path');

// data.js is a plain script, not a module. Evaluate it and take what it defines.
const src = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
const load = new Function('window', 'document', 'localStorage', 'console',
  src + '\n;return { SITE_ORIGIN, LEVELS, levelHref };');
const { SITE_ORIGIN, LEVELS, levelHref } = load({}, {}, null, console);

const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: SITE_ORIGIN, priority: '1.0', changefreq: 'weekly' },
  ...LEVELS.map(l => ({ loc: SITE_ORIGIN + levelHref(l.id), priority: '0.8', changefreq: 'monthly' })),
];

const xmlEscape = s => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u =>
    '  <url>\n' +
    `    <loc>${xmlEscape(u.loc)}</loc>\n` +
    `    <lastmod>${today}</lastmod>\n` +
    `    <changefreq>${u.changefreq}</changefreq>\n` +
    `    <priority>${u.priority}</priority>\n` +
    '  </url>'
  ).join('\n') + '\n' +
  '</urlset>\n';

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml);
fs.writeFileSync(path.join(__dirname, 'robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: ' + SITE_ORIGIN + 'sitemap.xml\n');
console.log(`sitemap.xml: ${urls.length} URLs (1 + ${LEVELS.length} nivoa), robots.txt`);

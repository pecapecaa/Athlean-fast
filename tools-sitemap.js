// Builds sitemap.xml from the catalogue.
//
//   node tools-sitemap.js
//
// The sitemap has to list every wine and bundle page, and those pages come
// from data.js — so it is generated rather than kept by hand. A hand-written
// one drifts the moment a wine is added, and nothing complains: the page just
// stays invisible to search.

const fs = require('fs');
const path = require('path');

// data.js is a plain script, not a module. Evaluate it and take what it defines.
const src = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
const sandbox = { window: {}, document: { addEventListener() {} }, localStorage: null, console };
const load = new Function('window', 'document', 'localStorage', 'console',
  src + '\n;return { WINES, BUNDLES, wineHref, bundleHref };');
const { WINES, BUNDLES, wineHref, bundleHref } = load(
  sandbox.window, sandbox.document, sandbox.localStorage, console);

const ORIGIN = 'https://athlean-fast.pages.dev/';
const today = new Date().toISOString().slice(0, 10);

// A URL's priority says how it ranks against the rest of this site, nothing
// more. The homepage is the entry point; wines are the goods; bundles sit
// with them. Anything past two levels of distinction is noise.
const urls = [
  { loc: ORIGIN, priority: '1.0', changefreq: 'weekly' },
  ...WINES.map(w   => ({ loc: ORIGIN + wineHref(w.id),   priority: '0.8', changefreq: 'monthly' })),
  ...BUNDLES.map(b => ({ loc: ORIGIN + bundleHref(b.id), priority: '0.8', changefreq: 'monthly' })),
];

// & in a query string has to be escaped inside XML; the ids are ours and
// contain nothing else that needs escaping, but the escape is applied to the
// whole URL so a future id with an ampersand cannot break the file silently.
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
console.log(`sitemap.xml: ${urls.length} URLs (1 + ${WINES.length} vina + ${BUNDLES.length} paketa)`);

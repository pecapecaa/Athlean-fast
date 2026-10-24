// Search-metadata tests.
//
// The product pages are one HTML file each, told apart by a query parameter,
// so their canonical link and structured data are built at render time. That
// makes them invisible to any check that reads the HTML file — which is
// exactly how the bundle pages went live with neither, unnoticed.
//
// Run:  ./tests/run.sh

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:8299';
const ORIGIN = 'https://athlean-fast.pages.dev/';

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; failures.push(name); console.log(`  ✗ ${name}${detail ? '\n      ' + detail : ''}`); }
}

const canonical = page => page.evaluate(() => {
  const els = document.querySelectorAll('link[rel="canonical"]');
  return { count: els.length, href: els.length ? els[0].href : null };
});

const jsonLd = page => page.evaluate(() => {
  const els = document.querySelectorAll('script[type="application/ld+json"]');
  return Array.prototype.map.call(els, el => {
    try { return JSON.parse(el.textContent); } catch (e) { return { __parseError: el.textContent.slice(0, 120) }; }
  });
});

async function passAgeGate(page) {
  const gate = await page.$('#ageYes');
  if (gate && await gate.isVisible()) { await gate.click(); await page.waitForTimeout(100); }
}

// The catalogue, read the same way the sitemap generator reads it.
function catalogue() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
  const load = new Function('window', 'document', 'localStorage', 'console',
    src + '\n;return { WINES, BUNDLES, wineHref, bundleHref };');
  return load({}, { addEventListener() {} }, null, { warn() {} });
}

async function run() {
  const { WINES, BUNDLES, wineHref, bundleHref } = catalogue();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext();

  // ---- 1. Every wine page describes itself.
  {
    console.log('\n1. Wine pages');
    const page = await ctx.newPage();
    for (const w of WINES) {
      await page.goto(`${BASE}/${wineHref(w.id)}`);
      await passAgeGate(page);
      await page.waitForTimeout(150);
      const c = await canonical(page);
      const lds = await jsonLd(page);
      const p = lds.find(x => x['@type'] === 'Product');
      const ok =
        c.count === 1 &&
        c.href === ORIGIN + wineHref(w.id) &&
        p && p.name === w.name.sr && p.sku === w.id &&
        p.offers && p.offers.price === w.price &&
        p.offers.priceCurrency === 'RSD' &&
        p.offers.availability === 'https://schema.org/PreOrder' &&
        p.offers.url === ORIGIN + wineHref(w.id) &&
        typeof p.image === 'string' && p.image.startsWith(ORIGIN) &&
        p.brand && p.brand.name;
      check(`${w.name.sr}`, ok,
        ok ? '' : `canonical=${JSON.stringify(c)} product=${JSON.stringify(p)}`);
    }
    await page.close();
  }

  // ---- 2. Every bundle page does too, and names what is inside it.
  {
    console.log('\n2. Bundle pages');
    const page = await ctx.newPage();
    for (const b of BUNDLES) {
      await page.goto(`${BASE}/${bundleHref(b.id)}`);
      await passAgeGate(page);
      await page.waitForTimeout(150);
      const c = await canonical(page);
      const lds = await jsonLd(page);
      const p = lds.find(x => x['@type'] === 'Product');
      const ok =
        c.count === 1 &&
        c.href === ORIGIN + bundleHref(b.id) &&
        p && p.name === b.name.sr && p.sku === b.id &&
        p.offers && p.offers.price === b.price &&
        p.offers.availability === 'https://schema.org/PreOrder' &&
        Array.isArray(p.hasPart) && p.hasPart.length === b.wines.length;
      check(`${b.name.sr}`, ok,
        ok ? '' : `canonical=${JSON.stringify(c)} product=${JSON.stringify(p)}`);
    }
    await page.close();
  }

  // ---- 3. The price in the markup and the price in the structured data are
  // the same price. Telling Google one number and the buyer another is the
  // failure that actually costs something.
  {
    console.log('\n3. The advertised price matches the page');
    const page = await ctx.newPage();
    for (const w of WINES.slice(0, 4)) {
      await page.goto(`${BASE}/${wineHref(w.id)}`);
      await passAgeGate(page);
      await page.waitForTimeout(150);
      const shown = await page.evaluate(() => document.body.innerText);
      const p = (await jsonLd(page)).find(x => x['@type'] === 'Product');
      const ok = shown.includes(String(w.price)) && p.offers.price === w.price;
      check(`${w.name.sr}: ${w.price} RSD on the page and in the data`, ok);
    }
    await page.close();
  }

  // ---- 4. The sitemap lists every page, and nothing that does not exist.
  {
    console.log('\n4. sitemap.xml');
    const xml = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
    const locs = (xml.match(/<loc>(.*?)<\/loc>/g) || []).map(m => m.replace(/<\/?loc>/g, ''));
    const expected = [
      ORIGIN,
      ...WINES.map(w => ORIGIN + wineHref(w.id)),
      ...BUNDLES.map(b => ORIGIN + bundleHref(b.id)),
    ];
    check(`lists all ${expected.length} pages`, locs.length === expected.length,
      `found ${locs.length}`);
    const missing = expected.filter(u => !locs.includes(u));
    check('nothing is missing', missing.length === 0, missing.join(', '));
    const extra = locs.filter(u => !expected.includes(u));
    check('nothing points at a page that does not exist', extra.length === 0, extra.join(', '));
    check('every URL is absolute and on the real domain',
      locs.every(u => u.startsWith(ORIGIN)));
  }

  // ---- 5. An unknown product must not be advertised as a real one.
  {
    console.log('\n5. A URL for a product that does not exist');
    const page = await ctx.newPage();
    await page.goto(`${BASE}/vino.html?w=ne-postoji`);
    await passAgeGate(page);
    await page.waitForTimeout(200);
    const lds = await jsonLd(page);
    const p = lds.find(x => x['@type'] === 'Product');
    check('emits no Product record', !p, JSON.stringify(p));
    await page.close();
  }

  // ---- 6. The .html form still works for anyone holding an old link, and
  // lands on the address we publish rather than a second, parallel one.
  {
    console.log('\n6. Old .html links');
    const page = await ctx.newPage();
    const w = WINES[0];
    const res = await page.goto(`${BASE}/vino.html?w=${w.id}`);
    await passAgeGate(page);
    await page.waitForTimeout(150);
    check('still reaches the page', res.status() === 200, `status ${res.status()}`);
    check('ends up on the extensionless URL',
      new URL(page.url()).pathname === '/vino', page.url());
    const c = await canonical(page);
    check('canonical points at the final URL, not the redirect',
      c.href === ORIGIN + wineHref(w.id), c.href);
    await page.close();
  }

  await ctx.close();
  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('failed: ' + failures.join(', ')); process.exit(1); }
}

run().catch(e => { console.error(e); process.exit(1); });

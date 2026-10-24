// Search-metadata tests.
//
// The level and programme pages are one HTML file each, told apart by a
// query parameter, so their canonical link and structured data are built at
// render time — invisible to any check that only reads the HTML file.
//
// Run:  ./tests/run.sh

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:8299';

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

const jsonLd = page => page.evaluate(() =>
  Array.prototype.map.call(document.querySelectorAll('script[type="application/ld+json"]'), el => {
    try { return JSON.parse(el.textContent); } catch (e) { return { __parseError: el.textContent.slice(0, 120) }; }
  }));

// The content, read the same way the sitemap generator reads it.
function content() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
  const load = new Function('window', 'document', 'localStorage', 'console',
    src + '\n;return { SITE_ORIGIN, LEVELS, PROGRAMS, levelHref, programHref };');
  return load({}, {}, null, { warn() {} });
}

async function run() {
  const { SITE_ORIGIN, LEVELS, PROGRAMS, levelHref, programHref } = content();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // ---- 1. The homepage points at the address data.js publishes.
  {
    console.log('\n1. Homepage');
    await page.goto(BASE + '/');
    const c = await canonical(page);
    check('one canonical, on SITE_ORIGIN', c.count === 1 && c.href === SITE_ORIGIN, JSON.stringify(c));
    const og = await page.getAttribute('meta[property="og:url"]', 'content');
    check('og:url matches it', og === SITE_ORIGIN, og);
    const org = (await jsonLd(page)).find(x => x['@type'] === 'Organization');
    check('describes the organisation', org && org.url === SITE_ORIGIN && org.name === 'AthLean Fast');
  }

  // ---- 2. Every level page describes itself.
  {
    console.log('\n2. Level pages');
    for (const l of LEVELS) {
      await page.goto(`${BASE}/${levelHref(l.id)}`);
      await page.waitForTimeout(120);
      const c = await canonical(page);
      const plan = (await jsonLd(page)).find(x => x['@type'] === 'ExercisePlan');
      const ok = c.count === 1 && c.href === SITE_ORIGIN + levelHref(l.id)
        && plan && plan.name.includes(l.name.sr)
        && plan.url === SITE_ORIGIN + levelHref(l.id)
        && typeof plan.image === 'string' && plan.image.startsWith(SITE_ORIGIN);
      check(l.name.sr, ok, `canonical=${JSON.stringify(c)} plan=${JSON.stringify(plan)}`);
      const title = await page.title();
      check(`${l.name.sr}: the title names the level`, title.includes(l.name.sr), title);
    }
  }

  // ---- 3. Every programme page too — and claims no price it does not have.
  {
    console.log('\n3. Programme pages');
    for (const p of PROGRAMS) {
      await page.goto(`${BASE}/${programHref(p.id)}`);
      await page.waitForTimeout(120);
      const c = await canonical(page);
      const service = (await jsonLd(page)).find(x => x['@type'] === 'Service');
      const ok = c.count === 1 && c.href === SITE_ORIGIN + programHref(p.id)
        && service && service.name.includes(p.name.sr)
        && service.url === SITE_ORIGIN + programHref(p.id);
      check(p.name.sr, ok, `canonical=${JSON.stringify(c)} service=${JSON.stringify(service)}`);
      const hasOffer = !!(service && service.offers);
      check(`${p.name.sr}: an offer only when a price is set`,
        hasOffer === (typeof p.price === 'number'));
      if (hasOffer) {
        const shown = await page.evaluate(() => document.body.innerText);
        check(`${p.name.sr}: the price on the page and in the data agree`,
          service.offers.price === p.price && shown.includes(String(p.price)));
      }
    }
  }

  // ---- 4. The sitemap lists every page, and nothing that does not exist.
  {
    console.log('\n4. sitemap.xml and robots.txt');
    const xml = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
    const locs = (xml.match(/<loc>(.*?)<\/loc>/g) || []).map(m => m.replace(/<\/?loc>/g, ''));
    const expected = [
      SITE_ORIGIN,
      ...LEVELS.map(l => SITE_ORIGIN + levelHref(l.id)),
      ...PROGRAMS.map(p => SITE_ORIGIN + programHref(p.id)),
    ];
    check(`lists all ${expected.length} pages`, locs.length === expected.length, `found ${locs.length}`);
    const missing = expected.filter(u => !locs.includes(u));
    check('nothing is missing (run node tools-sitemap.js)', missing.length === 0, missing.join(', '));
    const extra = locs.filter(u => !expected.includes(u));
    check('nothing points at a page that does not exist', extra.length === 0, extra.join(', '));
    const robots = fs.readFileSync(path.join(__dirname, '..', 'robots.txt'), 'utf8');
    check('robots.txt points at the sitemap', robots.includes('Sitemap: ' + SITE_ORIGIN + 'sitemap.xml'));
  }

  // ---- 5. An unknown id is not advertised as a real page.
  {
    console.log('\n5. Unknown ids');
    await page.goto(`${BASE}/nivo?n=ne-postoji`);
    await page.waitForTimeout(150);
    check('level: no ExercisePlan', !(await jsonLd(page)).some(x => x['@type'] === 'ExercisePlan'));
    check('level: the not-found block shows',
      await page.evaluate(() => !document.getElementById('levelNotFound').hidden));
    await page.goto(`${BASE}/program?p=ne-postoji`);
    await page.waitForTimeout(150);
    check('programme: no Service', !(await jsonLd(page)).some(x => x['@type'] === 'Service'));
    check('programme: the not-found block shows',
      await page.evaluate(() => !document.getElementById('programNotFound').hidden));
  }

  // ---- 6. The .html form still works and lands on the published address.
  {
    console.log('\n6. Old .html links');
    const l = LEVELS[0];
    const res = await page.goto(`${BASE}/nivo.html?n=${l.id}`);
    await page.waitForTimeout(120);
    check('still reaches the page', res.status() === 200, `status ${res.status()}`);
    check('ends up on the extensionless URL', new URL(page.url()).pathname === '/nivo', page.url());
    const c = await canonical(page);
    check('canonical points at the final URL', c.href === SITE_ORIGIN + levelHref(l.id), c.href);
  }

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('failed: ' + failures.join(', ')); process.exit(1); }
}

run().catch(e => { console.error(e); process.exit(1); });

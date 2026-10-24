// Analytics tests.
//
// Every funnel and filter in Clarity is built on these event and tag names.
// A renamed or missing one does not break the site, so nothing complains —
// the funnel just quietly reports a number that is wrong. These tests are
// what stands between a typo and a month of misleading data.
//
// Run:  ./tests/run.sh   (or: node tests/analytics.spec.js with a server up)

const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:8299';
const WINE = 'tvrdos-vranac';
const BUNDLE = 'bundle-start-duo';

let pass = 0, fail = 0;
const failures = [];

function check(name, ok, detail) {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; failures.push(name); console.log(`  ✗ ${name}${detail ? '\n      ' + detail : ''}`); }
}

// Stand in for the Clarity tag: record every call, send nothing anywhere.
async function stubClarity(page) {
  await page.addInitScript(() => {
    window.__cl = [];
    window.clarity = function () {
      window.__cl.push(Array.prototype.slice.call(arguments).join(':'));
    };
  });
  // Never let the real tag load over the stub.
  await page.route('**clarity.ms/**', route => route.abort());
}

const calls  = page => page.evaluate(() => window.__cl.slice());
const events = async page => (await calls(page)).filter(c => c.startsWith('event:')).map(c => c.slice(6));
const tags   = async page => {
  const out = {};
  for (const c of await calls(page)) {
    if (c.startsWith('set:')) {
      const rest = c.slice(4);
      const i = rest.indexOf(':');
      out[rest.slice(0, i)] = rest.slice(i + 1);
    }
  }
  return out;
};

async function passAgeGate(page) {
  const gate = await page.$('#ageYes');
  if (gate && await gate.isVisible()) { await gate.click(); await page.waitForTimeout(120); }
}
async function openHome(page) { await page.goto(BASE + '/index.html'); await passAgeGate(page); }

async function fillCheckout(page, over) {
  const v = Object.assign({
    oName: 'Test Kupac', oEmail: 'test@example.com', oPhone: '0601234567',
    oCity: 'Novi Sad', oAddress: 'Ulica 1'
  }, over || {});
  for (const [id, val] of Object.entries(v)) await page.fill('#' + id, val);
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ---- 1. Every add fires the shared funnel step, whatever was added.
  {
    console.log('\n1. u_korpu fires for a wine and for a bundle');
    for (const [what, url, clickSel] of [
      ['a wine on the homepage',  '/index.html', '.wine-add'],
      ['a wine on its page',      `/vino.html?w=${WINE}`, '#wpAdd'],
      ['a bundle on its page',    `/paket.html?p=${BUNDLE}`, '#wpAdd'],
    ]) {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await stubClarity(page);
      await page.goto(BASE + url);
      await passAgeGate(page);
      await page.click(clickSel);
      await page.waitForTimeout(250);
      const ev = await events(page);
      const tg = await tags(page);
      check(`${what}: fires u_korpu`, ev.includes('u_korpu'), `got: ${ev.join(', ')}`);
      check(`${what}: tags tip_artikla`, !!tg.tip_artikla, `got: ${JSON.stringify(tg)}`);
      check(`${what}: tags mesto_dodavanja`, !!tg.mesto_dodavanja, `got: ${JSON.stringify(tg)}`);
      await ctx.close();
    }
  }

  // ---- 2. Checkout carries the numbers a funnel is read against.
  {
    console.log('\n2. Opening checkout tags the basket');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await stubClarity(page);
    await openHome(page);
    await page.click('.wine-add');
    await page.waitForTimeout(200);
    await page.click('#cartBtn'); await page.waitForTimeout(200);
    await page.click('#checkoutBtn'); await page.waitForTimeout(250);
    const tg = await tags(page);
    check('vrednost_korpe is set', !!tg.vrednost_korpe, JSON.stringify(tg));
    check('besplatna_dostava says ne for one bottle', tg.besplatna_dostava === 'ne', `got: ${tg.besplatna_dostava}`);
    check('broj_artikala is 1', tg.broj_artikala === '1', `got: ${tg.broj_artikala}`);
    await ctx.close();
  }

  // ---- 3. A basket over the threshold is tagged as such.
  {
    console.log('\n3. A basket over the free-delivery threshold');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await stubClarity(page);
    await page.goto(`${BASE}/paket.html?p=bundle-premium-trio`);   // 7590 RSD
    await passAgeGate(page);
    await page.click('#wpAdd');
    await page.waitForTimeout(200);
    await openHome(page);
    await page.click('#cartBtn'); await page.waitForTimeout(200);
    await page.click('#checkoutBtn'); await page.waitForTimeout(250);
    const tg = await tags(page);
    check('besplatna_dostava says da', tg.besplatna_dostava === 'da', `got: ${tg.besplatna_dostava}`);
    await ctx.close();
  }

  // ---- 4. Abandoning says which step it happened on.
  {
    console.log('\n4. Abandoning checkout, at each step');
    // Leaving on the details step.
    {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await stubClarity(page);
      await openHome(page);
      await page.click('.wine-add'); await page.waitForTimeout(200);
      await page.click('#cartBtn'); await page.waitForTimeout(200);
      await page.click('#checkoutBtn'); await page.waitForTimeout(250);
      await page.click('#checkoutClose'); await page.waitForTimeout(250);
      const ev = await events(page), tg = await tags(page);
      check('fires checkout_napusten', ev.includes('checkout_napusten'), ev.join(', '));
      check('tagged as the details step', tg.checkout_faza === 'podaci', `got: ${tg.checkout_faza}`);
      await ctx.close();
    }
    // Leaving on the review step.
    {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await stubClarity(page);
      await openHome(page);
      await page.click('.wine-add'); await page.waitForTimeout(200);
      await page.click('#cartBtn'); await page.waitForTimeout(200);
      await page.click('#checkoutBtn'); await page.waitForTimeout(250);
      await fillCheckout(page);
      await page.click('#checkoutNext'); await page.waitForTimeout(250);
      await page.click('#checkoutClose'); await page.waitForTimeout(250);
      const tg = await tags(page);
      check('tagged as the review step', tg.checkout_faza === 'pregled', `got: ${tg.checkout_faza}`);
      await ctx.close();
    }
  }

  // ---- 5. A rejected form says which field rejected it.
  {
    console.log('\n5. Form validation failures');
    const cases = [
      ['an empty phone', { oPhone: '' }, v => v.startsWith('prazno:') && v.includes('telefon')],
      ['a bad email',    { oEmail: 'nije-email' }, v => v === 'email'],
      ['a short phone',  { oPhone: '123' }, v => v === 'telefon'],
    ];
    for (const [label, over, want] of cases) {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await stubClarity(page);
      await openHome(page);
      await page.click('.wine-add'); await page.waitForTimeout(200);
      await page.click('#cartBtn'); await page.waitForTimeout(200);
      await page.click('#checkoutBtn'); await page.waitForTimeout(250);
      await fillCheckout(page, over);
      await page.click('#checkoutNext'); await page.waitForTimeout(250);
      const ev = await events(page), tg = await tags(page);
      check(`${label}: fires forma_greska`, ev.includes('forma_greska'), ev.join(', '));
      check(`${label}: names the field`, want(tg.greska_polje || ''), `got: ${tg.greska_polje}`);
      // And it must not have advanced.
      const onReview = await page.$eval('#checkoutStep2', el => el.style.display === 'block');
      check(`${label}: does not advance`, !onReview);
      await ctx.close();
    }
  }

  // ---- 6. Taking an item back out is recorded.
  {
    console.log('\n6. Removing from the cart');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await stubClarity(page);
    await openHome(page);
    await page.click('.wine-add'); await page.waitForTimeout(200);
    await page.click('#cartBtn'); await page.waitForTimeout(250);
    await page.click('.remove-btn'); await page.waitForTimeout(250);
    const ev = await events(page);
    check('fires iz_korpe_uklonjeno', ev.includes('iz_korpe_uklonjeno'), ev.join(', '));
    check('fires korpa_ispraznjena on the last one', ev.includes('korpa_ispraznjena'), ev.join(', '));
    await ctx.close();
  }

  // ---- 7. A completed order fires its event and keeps the session.
  {
    console.log('\n7. A completed order');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await stubClarity(page);
    await page.route('**formsubmit.co/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' }));
    await openHome(page);
    await page.click('.wine-add'); await page.waitForTimeout(200);
    await page.click('#cartBtn'); await page.waitForTimeout(200);
    await page.click('#checkoutBtn'); await page.waitForTimeout(250);
    await fillCheckout(page);
    await page.click('#checkoutNext'); await page.waitForTimeout(250);
    await page.click('#checkoutForm button[type="submit"]');
    await page.waitForTimeout(800);
    const ev = await events(page), all = await calls(page), tg = await tags(page);
    check('fires porudzbina_poslata', ev.includes('porudzbina_poslata'), ev.join(', '));
    check('upgrades the recording', all.includes('upgrade:porudzbina_poslata'), all.join(', '));
    check('tags vrednost_porudzbine', !!tg.vrednost_porudzbine, JSON.stringify(tg));
    check('does not also report an abandon', !ev.includes('checkout_napusten'), ev.join(', '));
    await ctx.close();
  }

  // ---- 8. A failed order is reported as failed, and kept.
  {
    console.log('\n8. A failed order');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await stubClarity(page);
    await page.route('**formsubmit.co/**', route => route.abort());
    await openHome(page);
    await page.click('.wine-add'); await page.waitForTimeout(200);
    await page.click('#cartBtn'); await page.waitForTimeout(200);
    await page.click('#checkoutBtn'); await page.waitForTimeout(250);
    await fillCheckout(page);
    await page.click('#checkoutNext'); await page.waitForTimeout(250);
    await page.click('#checkoutForm button[type="submit"]');
    await page.waitForTimeout(900);
    const ev = await events(page), all = await calls(page);
    check('fires porudzbina_neuspesna', ev.includes('porudzbina_neuspesna'), ev.join(', '));
    check('upgrades the recording', all.includes('upgrade:porudzbina_neuspesna'), all.join(', '));
    check('does not claim success', !ev.includes('porudzbina_poslata'), ev.join(', '));
    await ctx.close();
  }

  // ---- 9. A blocked Clarity tag must change nothing about the site.
  {
    console.log('\n9. With Clarity blocked entirely (adblocker)');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.route('**clarity.ms/**', route => route.abort());
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await openHome(page);
    await page.click('.wine-add'); await page.waitForTimeout(200);
    await page.click('#cartBtn'); await page.waitForTimeout(200);
    await page.click('#checkoutBtn'); await page.waitForTimeout(250);
    await fillCheckout(page);
    await page.click('#checkoutNext'); await page.waitForTimeout(300);
    const badge = await page.$eval('#cartCount', el => el.textContent.trim());
    check('no page errors', errors.length === 0, errors.join(' | '));
    check('the cart still works', badge === '1', `badge: ${badge}`);
    const onReview = await page.$eval('#checkoutStep2', el => el.style.display === 'block');
    check('checkout still advances', onReview);
    await ctx.close();
  }

  // ---- 10. The names a funnel is built on, spelled exactly once each.
  {
    console.log('\n10. The funnel names exist and are spelled as documented');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await stubClarity(page);
    await openHome(page);
    // One section at a time, with a pause: scrolling to both in the same tick
    // leaves only the final position for the observer to see, and the first
    // section never registers as reached.
    await page.evaluate(() => document.getElementById('wines').scrollIntoView());
    await page.waitForTimeout(400);
    await page.evaluate(() => document.getElementById('bundles').scrollIntoView());
    await page.waitForTimeout(400);
    await page.click('.wine-add'); await page.waitForTimeout(200);
    await page.click('#cartBtn'); await page.waitForTimeout(200);
    await page.click('#checkoutBtn'); await page.waitForTimeout(250);
    const ev = await events(page);
    for (const name of ['vina_videna', 'u_korpu', 'korpa_otvorena', 'checkout_otvoren']) {
      check(`${name} is emitted`, ev.includes(name), ev.join(', '));
    }
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('failed: ' + failures.join(', ')); process.exit(1); }
}

run().catch(e => { console.error(e); process.exit(1); });

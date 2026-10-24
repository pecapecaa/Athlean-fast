// Cart consistency tests.
//
// The cart lives in localStorage under one key and is read by three separate
// scripts (script.js on the homepage, vino.js on a wine page, paket.js on a
// bundle page). Nothing but these tests holds them to the same behaviour, and
// the badge silently disagreeing across pages is invisible until a customer
// hits it — which is exactly how it shipped once.
//
// Run:  node tests/cart.spec.js
// Needs: a static server on BASE (started by the runner below).

const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:8299';
const WINE = 'tribunija-bijelo';
const WINE2 = 'tvrdos-vranac';
const BUNDLE = 'bundle-start-duo';

let pass = 0, fail = 0;
const failures = [];

function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else {
    fail++; failures.push(name);
    console.log(`  ✗ ${name}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`);
  }
}

// The number in the header bubble, as a customer reads it.
const badge = page => page.$eval('#cartCount', el => el.textContent.trim());

// What is actually persisted, independent of what any page is showing.
const stored = page => page.evaluate(() => {
  const raw = localStorage.getItem('hercegCart');
  if (!raw) return null;
  const p = JSON.parse(raw);
  return p.items.map(i => ({ id: i.id, qty: i.qty, isBundle: !!i.isBundle }))
                .sort((a, b) => a.id.localeCompare(b.id));
});

// The age gate blocks every click until it is answered.
async function passAgeGate(page) {
  // The gate is answered once per session, after which the button is still in
  // the DOM but hidden — clicking it then would hang.
  const gate = await page.$('#ageYes');
  if (gate && await gate.isVisible()) { await gate.click(); await page.waitForTimeout(120); }
}

async function openHome(page)   { await page.goto(BASE + '/index.html'); await passAgeGate(page); }
async function openWine(page, id)   { await page.goto(`${BASE}/vino.html?w=${id}`); await passAgeGate(page); }
async function openBundle(page, id) { await page.goto(`${BASE}/paket.html?p=${id}`); await passAgeGate(page); }

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ---- 1. A wine added on its product page is in the cart on the homepage.
  {
    console.log('\n1. Wine added on the product page, then back to the homepage');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await openHome(page);
    check('homepage starts empty', await badge(page), '0');

    await openWine(page, WINE);
    await page.click('#wpAdd');
    await page.waitForTimeout(200);
    check('product page shows 1', await badge(page), '1');
    check('storage holds the wine', await stored(page), [{ id: WINE, qty: 1, isBundle: false }]);

    // Going back the way a customer does — the browser's own back button.
    await page.goBack();
    await page.waitForTimeout(300);
    check('homepage shows 1 after going back', await badge(page), '1');

    // And on a completely fresh load of the homepage.
    await openHome(page);
    check('homepage shows 1 on a fresh load', await badge(page), '1');
    await ctx.close();
  }

  // ---- 2. The same, in the other direction.
  {
    console.log('\n2. Wine added on the homepage, then opened on the product page');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await openHome(page);
    await page.click('.wine-add');
    await page.waitForTimeout(200);
    check('homepage shows 1', await badge(page), '1');

    await openWine(page, WINE);
    check('product page shows 1', await badge(page), '1');
    await ctx.close();
  }

  // ---- 3. Bundles behave the same way, and keep their isBundle flag.
  {
    console.log('\n3. Bundle added on the bundle page');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await openHome(page);
    await openBundle(page, BUNDLE);
    await page.click('#wpAdd');
    await page.waitForTimeout(200);
    check('bundle page shows 1', await badge(page), '1');
    check('stored as a bundle', await stored(page), [{ id: BUNDLE, qty: 1, isBundle: true }]);

    await page.goBack();
    await page.waitForTimeout(300);
    check('homepage shows 1 after going back', await badge(page), '1');

    await openHome(page);
    check('homepage shows 1 on a fresh load', await badge(page), '1');
    await ctx.close();
  }

  // ---- 4. Adding across all three pages accumulates into one cart.
  {
    console.log('\n4. Items added on three different pages land in one cart');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await openHome(page);
    await page.click('.wine-add');          // first wine on the homepage
    await page.waitForTimeout(150);
    const firstId = await page.$eval('.wine-add', el => el.dataset.id);

    await openWine(page, WINE2);
    await page.click('#wpAdd');
    await page.waitForTimeout(150);

    await openBundle(page, BUNDLE);
    await page.click('#wpAdd');
    await page.waitForTimeout(150);
    check('bundle page shows all three', await badge(page), '3');

    await openHome(page);
    check('homepage shows all three', await badge(page), '3');
    const expected = [
      { id: firstId, qty: 1, isBundle: false },
      { id: WINE2,   qty: 1, isBundle: false },
      { id: BUNDLE,  qty: 1, isBundle: true },
    ].sort((a, b) => a.id.localeCompare(b.id));
    check('all three are in storage', await stored(page), expected);
    await ctx.close();
  }

  // ---- 5. Adding the same wine twice is a quantity, not a second row.
  {
    console.log('\n5. Adding the same wine twice');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await openWine(page, WINE);
    await page.click('#wpAdd');
    await page.waitForTimeout(900);   // the homepage add-button has a 600ms guard
    await page.click('#wpAdd');
    await page.waitForTimeout(200);
    check('product page shows 2', await badge(page), '2');
    check('one row, qty 2', await stored(page), [{ id: WINE, qty: 2, isBundle: false }]);

    await openHome(page);
    check('homepage shows 2', await badge(page), '2');
    await ctx.close();
  }

  // ---- 6. A second tab must not show a stale number.
  {
    console.log('\n6. Two tabs open at once');
    const ctx = await browser.newContext();
    const home = await ctx.newPage();
    await openHome(home);
    const detail = await ctx.newPage();
    await openWine(detail, WINE);
    await detail.click('#wpAdd');
    await detail.waitForTimeout(400);
    check('the tab that added shows 1', await badge(detail), '1');
    await home.waitForTimeout(600);
    check('the other tab catches up', await badge(home), '1');
    await ctx.close();
  }

  // ---- 7. The cart survives a reload, and an emptied cart stays empty.
  {
    console.log('\n7. Reload, and emptying the cart');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await openWine(page, WINE);
    await page.click('#wpAdd');
    await page.waitForTimeout(200);
    await page.reload();
    await passAgeGate(page);
    check('still 1 after a reload', await badge(page), '1');

    await openHome(page);
    await page.click('#cartBtn');
    await page.waitForTimeout(300);
    await page.click('.remove-btn');
    await page.waitForTimeout(300);
    check('homepage is empty after removing', await badge(page), '0');
    await openWine(page, WINE);
    check('product page is empty too', await badge(page), '0');
    await ctx.close();
  }

  // ---- 8. The back button on a phone restores the previous page from memory
  // without re-running any script. This is the case that shipped broken: the
  // badge kept whatever number it was rendered with before the customer left.
  {
    console.log('\n8. Restored from the back/forward cache');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await openHome(page);
    check('homepage starts empty', await badge(page), '0');

    // Write the cart the way another page would, then replay exactly what a
    // bfcache restore delivers: a pageshow with persisted set, and nothing else.
    await page.evaluate(() => {
      localStorage.setItem('hercegCart', JSON.stringify({
        items: [{ id: 'tribunija-bijelo', qty: 2 }], savedAt: Date.now()
      }));
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    });
    await page.waitForTimeout(200);
    check('homepage picks the cart up on restore', await badge(page), '2');

    // The same page coming back to the foreground after the customer was in
    // another app — iOS does not always report that as a pageshow.
    await page.evaluate(() => {
      localStorage.setItem('hercegCart', JSON.stringify({
        items: [{ id: 'tribunija-bijelo', qty: 3 }], savedAt: Date.now()
      }));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(200);
    check('homepage picks it up on refocus', await badge(page), '3');
    await ctx.close();
  }

  // ---- 9. A cart older than its six-hour life is dropped, everywhere alike.
  {
    console.log('\n9. An expired cart');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await openHome(page);
    await page.evaluate(() => {
      localStorage.setItem('hercegCart', JSON.stringify({
        items: [{ id: 'tribunija-bijelo', qty: 1 }],
        savedAt: Date.now() - (7 * 60 * 60 * 1000)
      }));
    });
    await openHome(page);
    check('homepage drops it', await badge(page), '0');
    await page.evaluate(() => {
      localStorage.setItem('hercegCart', JSON.stringify({
        items: [{ id: 'tribunija-bijelo', qty: 1 }],
        savedAt: Date.now() - (7 * 60 * 60 * 1000)
      }));
    });
    await openWine(page, WINE);
    check('product page drops it too', await badge(page), '0');
    await ctx.close();
  }

  // ---- 10. Junk in storage must not take a page down or show a wrong number.
  {
    console.log('\n10. Corrupt or hostile storage');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const cases = [
      ['not JSON at all', 'oh no'],
      ['an array, the pre-expiry shape', '[{"id":"tribunija-bijelo","qty":1}]'],
      ['a wine that no longer exists', JSON.stringify({ items: [{ id: 'nema-me', qty: 1 }], savedAt: Date.now() })],
      ['a negative quantity', JSON.stringify({ items: [{ id: WINE, qty: -3 }], savedAt: Date.now() })],
      ['a missing id', JSON.stringify({ items: [{ qty: 2 }], savedAt: Date.now() })],
    ];
    for (const [label, raw] of cases) {
      await openHome(page);
      await page.evaluate(v => localStorage.setItem('hercegCart', v), raw);
      await openHome(page);
      check(`homepage survives: ${label}`, await badge(page), '0');
      await openWine(page, WINE);
      check(`product page survives: ${label}`, await badge(page), '0');
    }
    await ctx.close();
  }

  // ---- 11. A real order empties the cart on every page.
  {
    console.log('\n11. After an order goes through');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    // The order posts to FormSubmit; answer for it so the test never leaves
    // the machine and the success path is exercised deterministically.
    await page.route('**formsubmit.co/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' }));
    await openWine(page, WINE);
    await page.click('#wpAdd');
    await page.waitForTimeout(200);
    await openHome(page);
    check('homepage shows the wine', await badge(page), '1');

    await page.click('#cartBtn');
    await page.waitForTimeout(250);
    await page.click('#checkoutBtn');
    await page.waitForTimeout(250);
    await page.fill('#oName', 'Test Kupac');
    await page.fill('#oEmail', 'test@example.com');
    await page.fill('#oPhone', '0601234567');
    await page.fill('#oCity', 'Novi Sad');
    await page.fill('#oAddress', 'Ulica 1');
    await page.click('#checkoutNext');
    await page.waitForTimeout(250);
    await page.click('#checkoutForm button[type="submit"]');
    await page.waitForTimeout(700);
    check('homepage is empty after ordering', await badge(page), '0');
    check('storage is empty too', await stored(page), []);
    await openWine(page, WINE);
    check('product page is empty as well', await badge(page), '0');
    await ctx.close();
  }

  // ---- 12. A failed order must NOT empty the cart.
  {
    console.log('\n12. After an order fails to send');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.route('**formsubmit.co/**', route => route.abort());
    await openHome(page);
    await page.click('.wine-add');
    await page.waitForTimeout(200);
    await page.click('#cartBtn');
    await page.waitForTimeout(250);
    await page.click('#checkoutBtn');
    await page.waitForTimeout(250);
    await page.fill('#oName', 'Test Kupac');
    await page.fill('#oEmail', 'test@example.com');
    await page.fill('#oPhone', '0601234567');
    await page.fill('#oCity', 'Novi Sad');
    await page.fill('#oAddress', 'Ulica 1');
    await page.click('#checkoutNext');
    await page.waitForTimeout(250);
    await page.click('#checkoutForm button[type="submit"]');
    await page.waitForTimeout(900);
    check('the cart is kept so the order can be retried', await badge(page), '1');
    await ctx.close();
  }

  await browser.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('failed: ' + failures.join(', ')); process.exit(1); }
}

run().catch(e => { console.error(e); process.exit(1); });

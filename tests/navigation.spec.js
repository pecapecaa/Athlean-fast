// Navigation and age-gate tests.
//
// Two things a customer sees that nothing else checks: what the address bar
// says, and whether the site asks their age twice. Both were wrong in ways
// that no error reports and no page breaks over — the site simply looked
// unprofessional and asked a question it had already been answered.
//
// Run:  ./tests/run.sh

const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:8299';
const WINE = 'tvrdos-metoh-vranac';
const BUNDLE = 'bundle-start-duo';

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; failures.push(name); console.log(`  ✗ ${name}${detail ? '\n      ' + detail : ''}`); }
}

const gateVisible = page => page.evaluate(() => {
  const g = document.getElementById('ageGate');
  if (!g) return false;
  return !g.classList.contains('age-gate--hidden');
});

async function answerGate(page) {
  const btn = await page.$('#ageYes');
  if (btn && await btn.isVisible()) { await btn.click(); await page.waitForTimeout(150); }
}

const hashOf = page => new URL(page.url()).hash;

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ---- 1. The address bar never keeps an internal anchor.
  {
    console.log('\n1. The address bar after moving around the homepage');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE + '/');
    await answerGate(page);

    for (const label of ['O nama', 'Vina', 'Hercegovina', 'Kontakt']) {
      await page.click(`#navLinks a:has-text("${label}")`);
      await page.waitForTimeout(250);
      check(`"${label}" leaves the address clean`, hashOf(page) === '', page.url());
    }

    await page.click('.logo');
    await page.waitForTimeout(250);
    check('the logo leaves the address clean', hashOf(page) === '', page.url());

    await page.click('.hero-buttons a:has-text("Pogledaj vina")');
    await page.waitForTimeout(250);
    check('the hero button leaves the address clean', hashOf(page) === '', page.url());
    await ctx.close();
  }

  // ---- 2. Coming back from a product page: the fragment does its job and goes.
  {
    console.log('\n2. Coming back from a bottle to the wine list');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE + '/');
    await answerGate(page);
    await page.goto(`${BASE}/vino?w=${WINE}`);
    await page.waitForTimeout(200);

    await page.click('#navLinks a:has-text("Vina"), .nav-links a:has-text("Vina")');
    await page.waitForTimeout(600);
    check('lands on the homepage', new URL(page.url()).pathname === '/', page.url());
    check('the address is clean', hashOf(page) === '', page.url());
    const scrolled = await page.evaluate(() => {
      const wines = document.getElementById('wines');
      return wines ? wines.getBoundingClientRect().top < window.innerHeight : false;
    });
    check('but it still scrolled to the wines', scrolled);
    await ctx.close();
  }

  // ---- 3. A shared deep link still lands where it points.
  {
    console.log('\n3. A link shared as herczwines.rs/#bundles');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE + '/#bundles');
    await answerGate(page);
    await page.waitForTimeout(600);
    const atBundles = await page.evaluate(() => {
      const el = document.getElementById('bundles');
      const top = el.getBoundingClientRect().top;
      return top > -el.offsetHeight && top < window.innerHeight;
    });
    check('scrolls to the bundles', atBundles);
    check('and then cleans the address', hashOf(page) === '', page.url());
    await ctx.close();
  }

  // ---- 4. Back still goes back to the previous page, not through sections.
  {
    console.log('\n4. The back button');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE + '/');
    await answerGate(page);
    await page.goto(`${BASE}/vino?w=${WINE}`);
    await page.waitForTimeout(200);
    await page.goBack();
    await page.waitForTimeout(400);
    check('one Back returns to the homepage', new URL(page.url()).pathname === '/', page.url());
    await ctx.close();
  }

  // ---- 5. The age question is asked once, not once per tab. This is the
  // one a customer actually hit: open a bottle in a new tab, click through to
  // the homepage from there, and be asked again mid-shop.
  {
    console.log('\n5. The age gate across tabs');
    const ctx = await browser.newContext();
    const first = await ctx.newPage();
    await first.goto(BASE + '/');
    check('asked on the first visit', await gateVisible(first));
    await answerGate(first);
    check('gone once answered', !await gateVisible(first));

    const second = await ctx.newPage();
    await second.goto(BASE + '/');
    await second.waitForTimeout(250);
    check('not asked again in a second tab', !await gateVisible(second),
      'the gate came back in a new tab');

    // The route the customer took: straight into a bottle in a fresh tab,
    // then to the homepage from there.
    const third = await ctx.newPage();
    await third.goto(`${BASE}/vino?w=${WINE}`);
    await third.waitForTimeout(200);
    await third.click('.nav-links a:has-text("Vina")');
    await third.waitForTimeout(600);
    check('not asked after arriving from a bottle page', !await gateVisible(third),
      'the gate came back on the way from a product page');
    await ctx.close();
  }

  // ---- 6. A brand-new visitor is still asked.
  {
    console.log('\n6. A visitor who has never answered');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE + '/');
    await page.waitForTimeout(250);
    check('is asked', await gateVisible(page));
    const locked = await page.evaluate(() => document.body.style.overflow === 'hidden');
    check('and cannot scroll past it', locked);
    await ctx.close();
  }

  // ---- 7. An answer older than thirty days is not an answer any more.
  {
    console.log('\n7. An expired answer');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE + '/');
    await answerGate(page);
    await page.evaluate(() => {
      localStorage.setItem('hercegAge', String(Date.now() - 31 * 24 * 60 * 60 * 1000));
      sessionStorage.removeItem('ageVerified');
    });
    await page.reload();
    await page.waitForTimeout(250);
    check('is asked again', await gateVisible(page));
    await ctx.close();
  }

  // ---- 8. The bundle page links back the same way.
  {
    console.log('\n8. Coming back from a bundle');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE + '/');
    await answerGate(page);
    await page.goto(`${BASE}/paket?p=${BUNDLE}`);
    await page.waitForTimeout(200);
    await page.click('.wp-crumbs a:has-text("Paketi"), .nav-links a:has-text("Paketi")');
    await page.waitForTimeout(600);
    check('lands on the homepage', new URL(page.url()).pathname === '/', page.url());
    check('the address is clean', hashOf(page) === '', page.url());
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('failed: ' + failures.join(', ')); process.exit(1); }
}

run().catch(e => { console.error(e); process.exit(1); });

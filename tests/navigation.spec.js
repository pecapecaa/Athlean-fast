// Navigation tests.
//
// What the address bar says, and where links between the pages land. Both
// fail silently: nothing errors, the site just looks careless.
//
// Run:  ./tests/run.sh

const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:8299';
const LEVEL = 'srednji';
const PROGRAM = 'transformacija';

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; failures.push(name); console.log(`  ✗ ${name}${detail ? '\n      ' + detail : ''}`); }
}

const hashOf = page => new URL(page.url()).hash;
const inView = (page, id) => page.evaluate(i => {
  const el = document.getElementById(i);
  if (!el) return false;
  const top = el.getBoundingClientRect().top;
  return top > -el.offsetHeight && top < window.innerHeight;
}, id);

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ---- 1. Moving around the homepage never leaves #anchor behind.
  {
    console.log('\n1. The address bar on the homepage');
    const page = await browser.newPage();
    await page.goto(BASE + '/');
    for (const label of ['O programu', 'Rezultati', 'Nivoi', 'Mentorstvo', 'Kontakt']) {
      await page.click(`#navLinks a:has-text("${label}")`);
      await page.waitForTimeout(250);
      check(`"${label}" leaves the address clean`, hashOf(page) === '', page.url());
    }
    await page.click('.navbar .logo');
    await page.waitForTimeout(250);
    check('the logo leaves the address clean', hashOf(page) === '', page.url());
    await page.click('.hero-buttons a:has-text("Saznaj više")');
    await page.waitForTimeout(250);
    check('the hero link leaves the address clean', hashOf(page) === '', page.url());
    await page.click('#levelsGrid .card--teaser');
    await page.waitForTimeout(600);
    check('the "not sure" card goes to the coaching', await inView(page, 'programs'));
    check('and leaves the address clean', hashOf(page) === '', page.url());
    await page.close();
  }

  // ---- 2. Coming back from a level page lands on the levels.
  {
    console.log('\n2. From a level page back to the homepage');
    const page = await browser.newPage();
    await page.goto(`${BASE}/nivo?n=${LEVEL}`);
    await page.waitForTimeout(200);
    await page.click('.wp-crumbs a:has-text("Nivoi")');
    await page.waitForTimeout(700);
    check('lands on the homepage', new URL(page.url()).pathname === '/', page.url());
    check('the address is clean', hashOf(page) === '', page.url());
    check('scrolled to the levels', await inView(page, 'levels'));
    await page.close();
  }

  // ---- 3. And from a programme page to the coaching.
  {
    console.log('\n3. From a programme page back to the homepage');
    const page = await browser.newPage();
    await page.goto(`${BASE}/program?p=${PROGRAM}`);
    await page.waitForTimeout(200);
    await page.click('.wp-crumbs a:has-text("Mentorstvo")');
    await page.waitForTimeout(700);
    check('lands on the homepage', new URL(page.url()).pathname === '/', page.url());
    check('the address is clean', hashOf(page) === '', page.url());
    check('scrolled to the coaching', await inView(page, 'programs'));
    await page.close();
  }

  // ---- 4. A shared deep link still lands where it points.
  {
    console.log('\n4. A link shared as /#programs');
    const page = await browser.newPage();
    await page.goto(BASE + '/#programs');
    await page.waitForTimeout(700);
    check('scrolls to the coaching', await inView(page, 'programs'));
    check('and then cleans the address', hashOf(page) === '', page.url());
    await page.close();
  }

  // ---- 5. Cards open their own pages, and Back returns.
  {
    console.log('\n5. Cards and the back button');
    const page = await browser.newPage();
    await page.goto(BASE + '/');
    await page.click(`#levelsGrid a[data-level="${LEVEL}"]`);
    await page.waitForTimeout(300);
    check('a level card opens its page', page.url().includes(`/nivo?n=${LEVEL}`), page.url());
    check('which shows that level',
      await page.evaluate(() => document.getElementById('wpName').textContent) === 'Srednje napredni');
    await page.goBack();
    await page.waitForTimeout(300);
    check('one Back returns to the homepage', new URL(page.url()).pathname === '/', page.url());

    await page.click(`#programsGrid [data-program="${PROGRAM}"] .program-more`);
    await page.waitForTimeout(300);
    check('"Detalji" opens the programme page', page.url().includes(`/program?p=${PROGRAM}`), page.url());
    await page.close();
  }

  // ---- 6. The related cards on a subpage never repeat the page itself.
  {
    console.log('\n6. Related pages');
    const page = await browser.newPage();
    await page.goto(`${BASE}/nivo?n=${LEVEL}`);
    await page.waitForTimeout(200);
    const levels = await page.$$eval('#wpRelated a[data-level]', els => els.map(e => e.dataset.level));
    check('other levels only', levels.length === 2 && !levels.includes(LEVEL), levels.join(','));
    await page.goto(`${BASE}/program?p=${PROGRAM}`);
    await page.waitForTimeout(200);
    const programs = await page.$$eval('#wpRelated [data-program]', els => els.map(e => e.dataset.program));
    check('other programmes only', !programs.includes(PROGRAM) && programs.length >= 2, programs.join(','));
    await page.close();
  }

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('failed: ' + failures.join(', ')); process.exit(1); }
}

run().catch(e => { console.error(e); process.exit(1); });

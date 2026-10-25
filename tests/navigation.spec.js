// Navigation tests.
//
// What the address bar says, and where links between the pages land. Both
// fail silently: nothing errors, the site just looks careless.
//
// Run:  ./tests/run.sh

const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:8299';
const LEVEL = 'srednji';

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

  // ---- 1. One page that is only scrolled, and its in-page links never
  //         leave #anchor behind.
  {
    console.log('\n1. The homepage');
    const page = await browser.newPage();
    await page.goto(BASE + '/');
    const barLinks = await page.$$eval('.navbar a', els => els.map(e => e.getAttribute('href')));
    const inPage = barLinks.filter(h => h.startsWith('#'));
    check('the bar has no menu: the logo is its only link into the page',
      inPage.length === 1 && inPage[0] === '#hero', barLinks.join(','));
    check('Instagram is one tap away on the page',
      await page.$$eval('#instagram a', els => els.some(e => e.href.includes('instagram.com/sima.markoo'))));
    await page.click('.scroll-indicator');
    await page.waitForTimeout(250);
    check('the scroll arrow leaves the address clean', hashOf(page) === '', page.url());
    await page.click('.navbar .logo');
    await page.waitForTimeout(250);
    check('the logo leaves the address clean', hashOf(page) === '', page.url());
    await page.click('.hero-buttons a:has-text("Saznaj više")');
    await page.waitForTimeout(250);
    check('the hero link leaves the address clean', hashOf(page) === '', page.url());
    await page.close();
  }

  // ---- 2. Coming back from a level page lands on the levels.
  {
    console.log('\n2. From a level page back to the homepage');
    const page = await browser.newPage();
    await page.goto(`${BASE}/nivo?n=${LEVEL}`);
    await page.waitForTimeout(200);
    await page.click('.wp-back');
    await page.waitForTimeout(700);
    check('lands on the homepage', new URL(page.url()).pathname === '/', page.url());
    check('the address is clean', hashOf(page) === '', page.url());
    check('scrolled to the levels', await inView(page, 'levels'));

    await page.goto(`${BASE}/nivo?n=${LEVEL}`);
    await page.waitForTimeout(200);
    await page.click('.wp-related-more a');
    await page.waitForTimeout(700);
    check('"Pogledaj online mentorstvo" lands on the coaching', await inView(page, 'mentorship'));
    check('and leaves the address clean', hashOf(page) === '', page.url());
    await page.close();
  }

  // ---- 3. A shared deep link still lands where it points.
  {
    console.log('\n3. A link shared as /#mentorship');
    const page = await browser.newPage();
    await page.goto(BASE + '/#mentorship');
    await page.waitForTimeout(700);
    check('scrolls to the coaching', await inView(page, 'mentorship'));
    check('and then cleans the address', hashOf(page) === '', page.url());
    await page.close();
  }

  // ---- 4. A level card opens its page, and Back returns.
  {
    console.log('\n4. Cards and the back button');
    const page = await browser.newPage();
    await page.goto(BASE + '/');
    await page.click(`#levelsGrid a[data-level="${LEVEL}"]`);
    await page.waitForTimeout(300);
    check('a level card opens its page', page.url().includes(`/nivo?n=${LEVEL}`), page.url());
    check('which shows that level',
      await page.evaluate(() => document.getElementById('wpName').textContent) === 'Srednji nivo');
    await page.goBack();
    await page.waitForTimeout(300);
    check('one Back returns to the homepage', new URL(page.url()).pathname === '/', page.url());
    await page.close();
  }

  // ---- 5. The other levels on a level page never repeat the page itself.
  {
    console.log('\n5. Related levels');
    const page = await browser.newPage();
    await page.goto(`${BASE}/nivo?n=${LEVEL}`);
    await page.waitForTimeout(200);
    const levels = await page.$$eval('#wpRelated a[data-level]', els => els.map(e => e.dataset.level));
    check('other levels only', levels.length === 2 && !levels.includes(LEVEL), levels.join(','));
    await page.close();
  }

  // ---- 6. Each before/after photo is one frame with a line to move.
  {
    console.log('\n6. Transformations');
    const page = await browser.newPage();
    await page.goto(BASE + '/');
    const shown = await page.$$eval('#transformationsGrid .transformation', els =>
      els.map(f => (f.querySelector('.compare') ? 'slider' : 'pair') + ':' + f.querySelectorAll('img').length));
    const plan = await page.evaluate(() => {
      const kind = t => (t.layout === 'pair' ? 'pair' : 'slider');
      const view = TRANSFORMATIONS_VIEW;
      const grids = view === 'klizac' ? TRANSFORMATIONS.map(() => 'slider')
        : view === 'pored' ? TRANSFORMATIONS.map(() => 'pair')
        : view === 'izbor' ? [...TRANSFORMATIONS.filter(t => kind(t) === 'slider'), ...TRANSFORMATIONS.filter(t => kind(t) === 'pair')].map(kind)
        : [];
      return { grids: grids.map(k => k + ':2'), reel: view === 'izbor' || view === 'traka', count: TRANSFORMATIONS.length };
    });
    check('every transformation shows both photos, the way data.js asks',
      shown.join(',') === plan.grids.join(','), shown.join(','));
    const periods = await page.evaluate(() => {
      const want = TRANSFORMATIONS.flatMap(t => [t.period, t.result, t.detail]).filter(Boolean).map(v => v.sr);
      const text = document.getElementById('transformationsGrid').textContent;
      return want.filter(p => !text.includes(p));
    });
    check('how long each one took, what changed and any note are shown under it', periods.length === 0, 'missing: ' + periods.join(', '));
    if (plan.reel) {
      const cards = await page.$$eval('#transformationsGrid .reel-card', els => els.map(c => c.querySelectorAll('img').length));
      check('the strip carries every transformation (twice, to run on)',
        cards.length === plan.count * 2 && cards.every(n => n === 2), String(cards.length));
      const reel = page.locator('.tf-reel');
      await reel.scrollIntoViewIfNeeded();
      const x = () => page.$eval('.tf-reel-track', t => new DOMMatrix(getComputedStyle(t).transform).m41);
      await page.waitForTimeout(300);
      const x0 = await x();
      await page.waitForTimeout(800);
      const x1 = await x();
      check('the strip drifts by itself from left to right', x1 > x0 + 5, `${x0} -> ${x1}`);
      const box = await reel.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      const before = await x();
      await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2, { steps: 6 });
      const after = await x();
      await page.mouse.up();
      // The strip wraps by one set of cards, which looks the same; count the
      // move modulo that width.
      const copy = await page.$eval('.tf-reel-track', t => t.scrollWidth / 2);
      const moved = (((before - after) % copy) + copy) % copy;
      check('and can be dragged', Math.abs(moved - 120) < 3, `${before} -> ${after}`);
    }
    const range = page.locator('#transformationsGrid .compare-range').first();
    await range.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const pos = await page.$eval('#transformationsGrid .compare', el => el.style.getPropertyValue('--pos'));
    check('the arrow keys move the line', pos === '52%', pos);
    await page.close();
  }

  // ---- 7. The kettlebells are plain images and drop each time they arrive.
  {
    console.log('\n7. Kettlebells');
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(BASE + '/');
    const stage = page.locator('.kb-stage');
    const dropped = () => page.$eval('.kb-drop', el => el.classList.contains('is-dropped'));
    check('not dropped before they are reached', !(await dropped()));
    // Landing spot just peeking in at the bottom: they must already be
    // falling, or a visitor who keeps scrolling has passed them before
    // they land.
    await page.evaluate(() => {
      const r = document.querySelector('.kb-stage').getBoundingClientRect();
      window.scrollTo({ top: r.top + scrollY - innerHeight * 0.96, behavior: 'instant' });
    });
    await page.waitForTimeout(300);
    check('drop as soon as their spot peeks in at the bottom', await dropped());
    const loaded = await page.$$eval('.kb-solid', els => els.map(e => e.complete && e.naturalWidth > 0));
    check('both kettlebell images load', loaded.length === 2 && loaded.every(Boolean), loaded.join(','));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    check('reset once out of view', !(await dropped()));
    await stage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    check('and drop again on the way back', await dropped());
    await page.close();
  }

  // ---- 8. Contact details come from one place and reach every page.
  {
    console.log('\n8. Contact details');
    const page = await browser.newPage();
    for (const url of ['/', `/nivo?n=${LEVEL}`]) {
      await page.goto(BASE + url);
      await page.waitForTimeout(150);
      const empty = await page.$$eval('[data-contact]', els =>
        els.filter(el => el.getAttribute('href') === '#' || (el.dataset.contact.indexOf('link') < 0
          && el.dataset.contact !== 'whatsapp' && !el.textContent.trim())).length);
      check(`${url}: every contact link is filled in`, empty === 0, `${empty} empty`);
    }
    await page.close();
  }

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('failed: ' + failures.join(', ')); process.exit(1); }
}

run().catch(e => { console.error(e); process.exit(1); });

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

  // ---- 6. The transformations run in one strip that moves by itself.
  {
    console.log('\n6. Transformations');
    const page = await browser.newPage();
    await page.goto(BASE + '/');
    const count = await page.evaluate(() => TRANSFORMATIONS.length);
    const cards = await page.$$eval('#transformationsReel .reel-card', els => els.map(c => c.querySelectorAll('img').length));
    check('the strip carries every transformation (twice, to run on), both photos each',
      cards.length === count * 2 && cards.every(n => n === 2), String(cards.length));
    check('only the strip is left', (await page.$$('#transformationsReel > *')).length === 1);
    const missing = await page.evaluate(() => {
      const want = TRANSFORMATIONS.flatMap(t => [t.period, t.result, t.detail, t.name]).filter(Boolean).map(v => v.sr);
      const text = document.getElementById('transformationsReel').textContent;
      return want.filter(p => !text.includes(p));
    });
    check('how long each one took, what changed and any note are shown under it', missing.length === 0, 'missing: ' + missing.join(', '));

    const reel = page.locator('.tf-reel');
    await reel.scrollIntoViewIfNeeded();
    const x = () => page.$eval('.tf-reel-track', t => new DOMMatrix(getComputedStyle(t).transform).m41);
    // The strip wraps by one set of cards, which looks the same; count a
    // move modulo that width.
    const copy = await page.$$eval('.reel-card', c => c[c.length / 2].offsetLeft - c[0].offsetLeft);
    const shift = (from, to) => ((((to - from) % copy) + copy) % copy);
    await page.waitForTimeout(300);
    const x0 = await x();
    await page.waitForTimeout(800);
    const x1 = await x();
    check('the strip drifts by itself from left to right', x1 > x0 + 5, `${x0} -> ${x1}`);

    // Which card is in the middle, and how far from it (px).
    const centred = () => page.evaluate(() => {
      const reelBox = document.querySelector('.tf-reel').getBoundingClientRect();
      const mid = reelBox.left + reelBox.width / 2;
      const cards = [...document.querySelectorAll('.reel-card')];
      const n = cards.length / 2;
      let best = null;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const off = r.left + r.width / 2 - mid;
        if (!best || Math.abs(off) < Math.abs(best.off)) best = { i: i % n, off, n };
      });
      return best;
    });
    const settle = () => page.waitForTimeout(600);

    const box = await reel.boundingBox();
    const start = await centred();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    const before = await x();
    await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2, { steps: 6 });
    const after = await x();
    check('the strip follows a drag', Math.abs(shift(after, before) - 120) < 3, `${before} -> ${after}`);
    await page.mouse.up();
    await settle();
    const swiped = await centred();
    check('a swipe brings the next card to the middle, squarely',
      swiped.i === (start.i + 1) % start.n && Math.abs(swiped.off) < 2, JSON.stringify({ start, swiped }));

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 15, box.y + box.height / 2, { steps: 3 });
    await page.mouse.up();
    await settle();
    const nudged = await centred();
    check('a small nudge settles back on the same card', nudged.i === swiped.i && Math.abs(nudged.off) < 2, JSON.stringify(nudged));

    await page.click('.tf-arrow--next');
    await settle();
    const nexted = await centred();
    check('the right arrow brings the next card', nexted.i === (nudged.i + 1) % start.n && Math.abs(nexted.off) < 2, JSON.stringify(nexted));
    await page.click('.tf-arrow--prev');
    await page.click('.tf-arrow--prev');
    await settle();
    const preved = await centred();
    check('the left arrow goes back, as often as pressed', preved.i === (nexted.i - 2 + start.n) % start.n && Math.abs(preved.off) < 2, JSON.stringify(preved));

    await reel.focus();
    await page.keyboard.press('ArrowRight');
    await settle();
    const keyed = await centred();
    check('the arrow keys step it a card at a time', keyed.i === (preved.i + 1) % start.n && Math.abs(keyed.off) < 2, JSON.stringify(keyed));
    await page.waitForTimeout(1500);
    check('and it waits there instead of drifting off', Math.abs((await centred()).off) < 2);
    await page.close();
  }

  // ---- 6b. A photo in the strip is never an empty box: every one is fetched
  //          ahead, and a frame still waiting shows the wings until it comes.
  {
    console.log('\n6b. Photos in the strip');
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    // Photos held back, as on a slow connection.
    let release;
    const held = new Promise(resolve => { release = resolve; });
    await page.route(/transformacije\//, async route => { await held; await route.continue(); });
    await page.goto(BASE + '/#transformations');
    await page.waitForTimeout(800);
    const total = await page.$$eval('.transformation-shot', els => els.length);
    const waiting = await page.$$eval('.transformation-shot', els => els.filter(e =>
      e.classList.contains('img-wait') && getComputedStyle(e).backgroundImage.includes('logo-mark')).length);
    check('while a photo is on its way its frame shows the wings, not an empty box', waiting === total, `${waiting}/${total}`);
    release();
    await page.waitForTimeout(2000);
    const arrived = await page.$$eval('.transformation-shot', els => els.filter(e =>
      e.classList.contains('is-loaded') && !e.classList.contains('img-wait')).length);
    check('then every photo arrives, the ones off to the side included', arrived === total, `${arrived}/${total}`);
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const asked = new Set();
    page.on('request', r => { if (/transformacije\//.test(r.url())) asked.add(new URL(r.url()).pathname); });
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForTimeout(3800);
    const want = await page.evaluate(() => new Set(TRANSFORMATIONS.flatMap(t => [t.before, t.after])).size);
    check('they are fetched soon after the page loads, before anyone scrolls down to them', asked.size === want, `${asked.size}/${want}`);
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
          && el.dataset.contact !== 'chat' && !el.textContent.trim())).length);
      check(`${url}: every contact link is filled in`, empty === 0, `${empty} empty`);
      const chat = await page.$eval('.fab-chat', el => el.getAttribute('href'));
      check(`${url}: the message button opens the chat with a greeting already typed`,
        /(draft|text)=Zdravo%20Marko!%20/.test(chat), chat);
    }
    await page.goto(BASE + '/');
    const maps = await page.$$eval('#locationsGrid a.location--map', els =>
      els.map(el => el.target === '_blank' && /^https:\/\/maps\.app\.goo\.gl\//.test(el.href)));
    check('both Trebinje locations open on Google Maps in a new tab',
      maps.length === 2 && maps.every(Boolean), JSON.stringify(maps));
    await page.close();
  }

  // ---- 9. A first visit opens on the gold logo, which then gives way.
  {
    console.log('\n9. Logo on arrival');
    const shown = p => p.evaluate(() => {
      const el = document.getElementById('intro');
      if (!el) return false;
      const style = getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    const page = await browser.newPage();
    // Checked as soon as the page is drawn: waiting for every image could
    // outlast the logo's two seconds on a slow machine.
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    check('a first visit opens on the logo', await shown(page));
    await page.waitForTimeout(3500);
    check('which gives way to the page by itself', !(await shown(page)));
    await page.goto(BASE + '/');
    check('only once a visit', !(await shown(page)));
    await page.close();

    const tap = await browser.newPage();
    await tap.goto(BASE + '/');
    await tap.mouse.click(20, 400);
    await tap.waitForTimeout(600);
    check('a tap sends it off at once', !(await shown(tap)));
    await tap.close();

    const deep = await browser.newPage();
    await deep.goto(BASE + '/#levels');
    check('not when a link leads straight to a section', !(await shown(deep)));
    await deep.close();

    const calm = await browser.newPage({ reducedMotion: 'reduce' });
    await calm.goto(BASE + '/');
    check('not for a visitor who asked for less motion', !(await shown(calm)));
    await calm.close();
  }

  // ---- 10. The hero clip suits the screen, and its first frame stands in.
  //          This Chromium plays no H.264, so what is checked here is the
  //          choice of clip and the still that stays when it cannot play.
  {
    console.log('\n10. Hero video');
    for (const [label, viewport, still] of [
      ['a phone', { width: 390, height: 844 }, 'images/hero-poster.webp'],
      ['a wide screen', { width: 1366, height: 860 }, 'images/hero-wide-poster.webp']
    ]) {
      const page = await browser.newPage({ viewport });
      const loaded = [];
      page.on('response', r => { if (r.ok()) loaded.push(new URL(r.url()).pathname); });
      await page.goto(BASE + '/');
      await page.waitForTimeout(1500);
      const bg = await page.$eval('#heroBg', el => el.style.backgroundImage);
      check(`${label} gets its own first frame as the still`, bg.includes(still) && loaded.some(u => u.endsWith(still)), bg);
      await page.close();
    }
    for (const clip of ['videos/hero.mp4', 'videos/hero-wide.mp4']) {
      const page = await browser.newPage();
      const res = await page.request.head(BASE + '/' + clip);
      check(clip + ' is there', res.ok(), String(res.status()));
      await page.close();
    }
    {
      // Off screen the clip must not hold the connection the photos need.
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(BASE + '/');
      await page.waitForFunction(() => {
        const v = document.getElementById('heroVideo');
        return v && v.classList.contains('active');
      }, null, { timeout: 10000 }).catch(() => {});
      const state = () => page.evaluate(() => {
        const v = document.getElementById('heroVideo');
        if (!v) return { gone: true };
        const all = v.buffered.length === 1 && v.duration && v.buffered.end(0) >= v.duration - 0.5;
        return { paused: v.paused, downloading: !!v.getAttribute('src') && !all };
      });
      await page.evaluate(() => scrollTo({ top: 3000, behavior: 'instant' }));
      await page.waitForTimeout(600);
      const away = await state();
      check('scrolled away from, the hero clip pauses and stops downloading', away.paused && !away.downloading, JSON.stringify(away));
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(2000);
      const back = await state();
      check('and plays on once the hero is back', back.paused === false, JSON.stringify(back));
      await page.close();
    }
  }

  // ---- 11. Every level page opens on its own clip, and nothing jumps while
  //          nivo.js draws it.
  {
    console.log('\n11. Level videos');
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(() => {
      window.__shift = 0;
      new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) window.__shift += e.value; }))
        .observe({ type: 'layout-shift', buffered: true });
    });
    const levels = await (async () => { await page.goto(BASE + '/'); return page.evaluate(() => LEVELS.map(l => ({ id: l.id, video: l.video, poster: l.poster }))); })();
    for (const l of levels) {
      await page.goto(`${BASE}/nivo?n=${l.id}`);
      await page.waitForTimeout(300);
      const v = await page.$eval('#wpVideo', el => ({ src: el.getAttribute('src'), poster: el.getAttribute('poster') })).catch(() => null);
      const ok = !!v && v.src === l.video && v.poster === l.poster && (await page.request.head(BASE + '/' + l.video)).ok();
      check(`${l.id}: the clip is at the top, with its own first frame`, ok, JSON.stringify(v));
      const shift = await page.evaluate(() => window.__shift);
      check(`${l.id}: nothing jumps while the page is drawn (layout shift under 0.1)`, shift < 0.1, shift.toFixed(3));
    }
    const state = () => page.evaluate(() => ({ controls: document.getElementById('wpVideo').controls, button: !document.getElementById('wpPlay').hidden }));
    const before = await state();
    check('the clip waits behind one large play button, without the player\'s bar', before.button && !before.controls, JSON.stringify(before));
    await page.click('#wpPlay');
    const after = await state();
    check('a tap starts it and hands over to the player\'s controls', !after.button && after.controls, JSON.stringify(after));
    await page.goto(`${BASE}/nivo?n=${levels[0].id}`);
    await page.waitForTimeout(300);
    const fabs = () => page.$eval('.fab-buttons', el => getComputedStyle(el).visibility);
    await page.waitForTimeout(400);
    check('on a phone the quick-contact buttons stay off the clip\'s controls', (await fabs()) === 'hidden');
    await page.evaluate(() => window.scrollTo({ top: document.getElementById('trening').offsetTop, behavior: 'instant' }));
    await page.waitForTimeout(600);
    check('and come back once it is scrolled away', (await fabs()) === 'visible');
    // The join bar: off while the page's own button is in sight, on once it
    // has gone up, even when a jump skips straight over it.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(400);
    const bar = () => page.$eval('#wpSticky', el => !el.hidden);
    const atTop = await bar();
    await page.evaluate(() => window.scrollTo({ top: document.getElementById('fokus').offsetTop, behavior: 'instant' }));
    await page.waitForTimeout(400);
    const down = await bar();
    check('the join bar stays off at the top and comes up after a jump down the page', !atTop && down, JSON.stringify({ atTop, down }));
    await page.close();
  }

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('failed: ' + failures.join(', ')); process.exit(1); }
}

run().catch(e => { console.error(e); process.exit(1); });

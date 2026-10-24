// Analytics tests.
//
// Every funnel and filter in Clarity is built on these event and tag names.
// A renamed or missing one does not break the site, so nothing complains —
// the funnel just quietly reports a wrong number. These tests are what stands
// between a typo and a month of misleading data.
//
// Run:  ./tests/run.sh

const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:8299';

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
  await page.route('**clarity.ms/**', route => route.abort());
}

async function stubFormSubmit(page, ok = true) {
  await page.route('**/formsubmit.co/**', route => route.fulfill(ok
    ? { status: 200, contentType: 'application/json', body: '{"success":"true"}' }
    : { status: 500, contentType: 'application/json', body: '{"success":"false"}' }));
}

const calls = page => page.evaluate(() => window.__cl.slice());
const events = async page => (await calls(page)).filter(c => c.startsWith('event:')).map(c => c.slice(6));
const upgrades = async page => (await calls(page)).filter(c => c.startsWith('upgrade:')).map(c => c.slice(8));
const tags = async page => {
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

async function fillAndSend(page) {
  await page.fill('#jName', 'Test Klijent');
  await page.fill('#jEmail', 'test@example.com');
  await page.fill('#jPhone', '065 123 4567');
  await page.click('#joinNext');
  for (const label of ['Istopiti salo', 'Početni nivo', '30 minuta', 'Nemam još', 'Kod kuće']) {
    await page.click(`#joinQuestions label.choice:has-text("${label}")`);
  }
  await page.click('#joinSubmit');
  await page.waitForTimeout(400);
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  const fresh = async () => {
    const page = await browser.newPage();
    await stubClarity(page);
    return page;
  };

  // ---- 1. Opening the form says where it was opened from.
  {
    console.log('\n1. prijava_otvorena and its source');
    const page = await fresh();
    await page.goto(BASE + '/');
    await page.click('.hero-buttons [data-join]');
    check('prijava_otvorena fires', (await events(page)).includes('prijava_otvorena'));
    check('tagged with the hero as the source', (await tags(page)).prijava_izvor === 'hero');

    await page.keyboard.press('Escape');
    await page.click('#mentorship [data-join]');
    check('the coaching button tags itself', (await tags(page)).prijava_izvor === 'mentorstvo');

    await page.keyboard.press('Escape');
    await page.goto(BASE + '/?prijava=1&nivo=napredni&izvor=stranica_nivoa');
    await page.waitForTimeout(200);
    const t = await tags(page);
    check('arriving from a level page tags the level and the source',
      t.nivo === 'napredni' && t.prijava_izvor === 'stranica_nivoa', JSON.stringify(t));
    await page.close();
  }

  // ---- 2. Leaving the form says at which step.
  {
    console.log('\n2. Abandoning the form');
    const page = await fresh();
    await page.goto(BASE + '/');
    await page.click('#navJoin');
    await page.keyboard.press('Escape');
    check('prijava_napustena fires', (await events(page)).includes('prijava_napustena'));
    check('at the contact step', (await tags(page)).prijava_faza === 'podaci');
    check('and the recording is kept', (await upgrades(page)).includes('prijava_napustena'));

    await page.click('#navJoin');
    await page.fill('#jName', 'Test Klijent');
    await page.fill('#jEmail', 'test@example.com');
    await page.fill('#jPhone', '065 123 4567');
    await page.click('#joinNext');
    check('prijava_korak_1 fires on the way to the questions', (await events(page)).includes('prijava_korak_1'));
    await page.click('#joinClose');
    check('leaving at the questionnaire is tagged as such', (await tags(page)).prijava_faza === 'upitnik');
    await page.close();
  }

  // ---- 3. A rejected field says which field.
  {
    console.log('\n3. Form errors');
    const page = await fresh();
    await page.goto(BASE + '/');
    await page.click('#navJoin');
    await page.fill('#jName', 'Test');
    await page.click('#joinNext');
    check('forma_greska fires', (await events(page)).includes('forma_greska'));
    check('naming the empty fields', (await tags(page)).greska_polje === 'prazno:email+telefon', (await tags(page)).greska_polje);
    await page.fill('#jEmail', 'losa-adresa');
    await page.fill('#jPhone', '065 123 4567');
    await page.click('#joinNext');
    check('a bad email is tagged as such', (await tags(page)).greska_polje === 'email');
    await page.close();
  }

  // ---- 4. A sent sign-up is recorded once, and not as abandoned.
  {
    console.log('\n4. A completed sign-up');
    const page = await fresh();
    await stubFormSubmit(page);
    await page.goto(BASE + '/');
    await page.click('#navJoin');
    await fillAndSend(page);
    const ev = await events(page);
    check('prijava_poslata fires once', ev.filter(e => e === 'prijava_poslata').length === 1);
    check('the recording is kept', (await upgrades(page)).includes('prijava_poslata'));
    const t = await tags(page);
    check('tagged with level and goal', t.nivo === 'pocetni' && t.cilj === 'salo', JSON.stringify(t));
    await page.click('#joinDone');
    check('closing the success screen is not an abandonment',
      !(await events(page)).includes('prijava_napustena'));
    await page.close();
  }

  // ---- 5. A failed send never reports success.
  {
    console.log('\n5. A failed sign-up');
    const page = await fresh();
    await stubFormSubmit(page, false);
    await page.goto(BASE + '/');
    await page.click('#navJoin');
    await fillAndSend(page);
    const ev = await events(page);
    check('prijava_neuspjesna fires', ev.includes('prijava_neuspjesna'));
    check('prijava_poslata does not', !ev.includes('prijava_poslata'));
    check('the recording is kept', (await upgrades(page)).includes('prijava_neuspjesna'));
    await page.close();
  }

  // ---- 6. The subpages report themselves.
  {
    console.log('\n6. The level page');
    const page = await fresh();
    await page.goto(BASE + '/nivo?n=pocetni');
    await page.waitForTimeout(150);
    check('nivo_otvoren fires', (await events(page)).includes('nivo_otvoren'));
    check('tagged with the level', (await tags(page)).stranica_nivoa === 'pocetni');
    await page.close();
  }

  // ---- 7. Sections reached on the homepage.
  {
    console.log('\n7. Sections reached');
    const page = await fresh();
    await page.goto(BASE + '/');
    for (const id of ['results', 'levels', 'mentorship', 'contact']) {
      await page.evaluate(i => document.getElementById(i).scrollIntoView({ behavior: 'instant' }), id);
      await page.waitForTimeout(250);
    }
    const ev = await events(page);
    for (const name of ['rezultati_vidjeni', 'nivoi_vidjeni', 'mentorstvo_vidjeno', 'kontakt_vidjen']) {
      check(name + ' fires once', ev.filter(e => e === name).length === 1);
    }
    await page.close();
  }

  // ---- 8. With Clarity blocked the site works exactly the same.
  {
    console.log('\n8. With Clarity blocked entirely (adblocker)');
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await stubFormSubmit(page);
    await page.goto(BASE + '/');
    await page.click('#navJoin');
    await fillAndSend(page);
    check('no script errors', errors.length === 0, errors.join(' | '));
    check('the sign-up still goes through',
      await page.evaluate(() => !document.getElementById('joinSuccess').hidden));
    await page.close();
  }

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('failed: ' + failures.join(', ')); process.exit(1); }
}

run().catch(e => { console.error(e); process.exit(1); });

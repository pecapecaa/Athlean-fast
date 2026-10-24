// Join (questionnaire) tests.
//
// The questionnaire is the one thing on the site that brings in clients, and
// every way into it — the menu, the hero, the coaching section, the level
// page — has to land in the same form with the right answers already chosen.
// A form that silently drops a sign-up costs a client and nobody notices.
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

const isOpen = page => page.evaluate(() =>
  document.getElementById('joinOverlay').classList.contains('active'));
const step = page => page.evaluate(() =>
  document.getElementById('joinStep2').hidden ? 1 : 2);
const checked = (page, q) => page.evaluate(id => {
  const el = document.querySelector('input[name="q_' + id + '"]:checked');
  return el ? el.value : null;
}, q);

// Records what would have been sent, and answers like FormSubmit does.
async function stubFormSubmit(page, ok = true) {
  const sent = [];
  await page.route('**/formsubmit.co/**', async route => {
    sent.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill(ok
      ? { status: 200, contentType: 'application/json', body: '{"success":"true"}' }
      : { status: 500, contentType: 'application/json', body: '{"success":"false"}' });
  });
  return sent;
}

async function fillContact(page, over) {
  const v = Object.assign({ jName: 'Test Klijent', jEmail: 'test@example.com', jPhone: '065 123 4567', jAge: '' }, over || {});
  for (const id of Object.keys(v)) await page.fill('#' + id, v[id]);
}

async function answerAll(page) {
  for (const label of ['Izdefinisati tijelo', 'Srednji nivo', '45 minuta', 'Da, dva', 'Kod kuće']) {
    await page.click(`#joinQuestions label.choice:has-text("${label}")`);
  }
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ---- 1. The menu button opens the form; Escape closes it.
  {
    console.log('\n1. Opening and closing');
    const page = await browser.newPage();
    await page.goto(BASE + '/');
    await page.click('#navJoin');
    await page.waitForTimeout(200);
    check('the menu button opens the form', await isOpen(page));
    check('it opens on the first step', await step(page) === 1);
    check('the name field has focus', await page.evaluate(() => document.activeElement.id === 'jName'));
    check('the page behind does not scroll', await page.evaluate(() => document.body.style.overflow === 'hidden'));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    check('Escape closes it', !await isOpen(page));
    check('and the page scrolls again', await page.evaluate(() => document.body.style.overflow === ''));

    for (const sel of ['.hero-buttons [data-join]', '#mentorship [data-join]', '#join [data-join]']) {
      await page.click(sel);
      await page.waitForTimeout(150);
      check(`${sel} opens the form too`, await isOpen(page));
      await page.keyboard.press('Escape');
    }
    await page.close();
  }

  // ---- 2. The first step refuses what cannot be answered.
  {
    console.log('\n2. Contact details');
    const page = await browser.newPage();
    await page.goto(BASE + '/');
    await page.click('#navJoin');
    await page.click('#joinNext');
    check('empty fields keep it on step 1', await step(page) === 1);

    await fillContact(page, { jEmail: 'nije-mail' });
    await page.click('#joinNext');
    check('a bad email keeps it on step 1', await step(page) === 1);

    await fillContact(page, { jPhone: '123' });
    await page.click('#joinNext');
    check('a short phone number keeps it on step 1', await step(page) === 1);

    await fillContact(page, { jAge: '7' });
    await page.click('#joinNext');
    check('an impossible age keeps it on step 1', await step(page) === 1);

    await fillContact(page);
    await page.click('#joinNext');
    check('valid details move on to the questionnaire', await step(page) === 2);

    await page.click('#joinBack');
    check('Back returns to step 1', await step(page) === 1);
    check('with everything still filled in', await page.inputValue('#jName') === 'Test Klijent');
    await page.close();
  }

  // ---- 3. The questionnaire needs its required answers, then sends.
  {
    console.log('\n3. Sending a sign-up');
    const page = await browser.newPage();
    const sent = await stubFormSubmit(page);
    await page.goto(BASE + '/');
    await page.click('#navJoin');
    await fillContact(page);
    await page.click('#joinNext');
    await page.click('#joinSubmit');
    await page.waitForTimeout(200);
    check('nothing is sent without the required answers', sent.length === 0);
    check('the unanswered questions are marked',
      await page.evaluate(() => document.querySelectorAll('.join-question--invalid').length) > 0);

    await answerAll(page);
    await page.fill('#q_napomena', 'Bol u desnom koljenu');
    await page.click('#joinSubmit');
    await page.waitForTimeout(400);
    check('one sign-up is sent', sent.length === 1, `sent ${sent.length}`);
    const s = sent[0] || {};
    check('it carries the contact details',
      s['Ime i prezime'] === 'Test Klijent' && s['Email'] === 'test@example.com' && s['Telefon'] === '065 123 4567');
    check('answers arrive as readable labels, not codes',
      s['Koji ti je glavni cilj?'] === 'Izdefinisati tijelo' &&
      s['Koliko si utreniran?'] === 'Srednji nivo' &&
      s['Koliko vremena imaš za trening?'] === '45 minuta' &&
      s['Imaš li kettlebell?'] === 'Da, dva', JSON.stringify(s));
    check('the free-text note is included',
      s['Povrede, zdravstvena ograničenja ili napomene'] === 'Bol u desnom koljenu');
    check('the reply goes to the person who signed up', s._replyto === 'test@example.com');
    check('the subject names the person and the level',
      /Test Klijent/.test(s._subject) && /Srednji nivo/.test(s._subject), s._subject);
    check('the success screen shows',
      await page.evaluate(() => !document.getElementById('joinSuccess').hidden));

    await page.click('#joinDone');
    await page.click('#navJoin');
    await page.waitForTimeout(150);
    check('reopened after sending, it starts fresh',
      await step(page) === 1 && await page.inputValue('#jName') === '' && await checked(page, 'cilj') === null);
    await page.close();
  }

  // ---- 4. The level page sends people here with their level chosen.
  {
    console.log('\n4. From the level page');
    const page = await browser.newPage();
    await page.goto(`${BASE}/nivo?n=${LEVEL}`);
    await page.waitForTimeout(200);
    const href = await page.getAttribute('.wp-buy [data-join-link]', 'href');
    check('the join link carries the level', href.includes('nivo=' + LEVEL), href);
    await page.click('.wp-buy [data-join-link]');
    await page.waitForTimeout(400);
    check('following it opens the form on the homepage',
      new URL(page.url()).pathname === '/' && await isOpen(page), page.url());
    check('with the level chosen', await checked(page, 'nivo') === LEVEL);
    check('and the address cleaned up', new URL(page.url()).search === '', page.url());

    await page.goto(`${BASE}/?prijava=1&nivo=ne-postoji`);
    await page.waitForTimeout(200);
    check('an unknown level still opens the form', await isOpen(page));
    check('but chooses nothing', await checked(page, 'nivo') === null);
    await page.close();
  }

  // ---- 5. A failed send keeps everything, so the person can just retry.
  {
    console.log('\n5. When sending fails');
    const page = await browser.newPage();
    await stubFormSubmit(page, false);
    await page.goto(BASE + '/');
    await page.click('#navJoin');
    await fillContact(page);
    await page.click('#joinNext');
    await answerAll(page);
    await page.click('#joinSubmit');
    await page.waitForTimeout(400);
    check('no success is claimed',
      await page.evaluate(() => document.getElementById('joinSuccess').hidden));
    check('the answers are still there', await checked(page, 'cilj') === 'definicija');
    check('the send button works again',
      await page.evaluate(() => !document.getElementById('joinSubmit').disabled));
    await page.close();
  }

  // ---- 6. Switching language mid-form loses nothing.
  {
    console.log('\n6. Language switch mid-form');
    const page = await browser.newPage();
    await page.goto(BASE + '/');
    await page.click('#navJoin');
    await fillContact(page);
    await page.click('#joinNext');
    await answerAll(page);
    await page.evaluate(() => switchLanguage('en'));
    check('the questions are in English',
      await page.evaluate(() => document.querySelector('#joinQuestions legend').textContent.includes('goal')));
    check('the answers survived', await checked(page, 'cilj') === 'definicija' && await checked(page, 'nivo') === LEVEL);
    check('and it is still on the questionnaire', await step(page) === 2);
    await page.close();
  }

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('failed: ' + failures.join(', ')); process.exit(1); }
}

run().catch(e => { console.error(e); process.exit(1); });

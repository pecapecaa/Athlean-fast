// ===== AthLean Fast: homepage =====

// Mail na koji stižu prijave i poruke. FormSubmit pri prvoj prijavi šalje
// jednokratni link za potvrdu na tu adresu: dok se ne klikne, ništa ne stiže.
const RECIPIENT_EMAIL = 'markosima14@gmail.com';
const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/' + RECIPIENT_EMAIL;

const LANG_KEY = 'afLang';
let currentLang = 'sr';

// ===== Text set from script =====
const MSG = {
  before: { sr: 'Prije', en: 'Before' },
  after: { sr: 'Poslije', en: 'After' },
  reel: {
    sr: 'AthLean Fast rezultati: prevuci ili koristi strelice',
    en: 'AthLean Fast results: swipe or use the arrow keys'
  },
  reelPrev: { sr: 'Prethodna transformacija', en: 'Previous transformation' },
  reelNext: { sr: 'Sljedeća transformacija', en: 'Next transformation' },
  fillContact: { sr: 'Popuni ime, email i telefon', en: 'Please fill in your name, email and phone' },
  badEmail: { sr: 'Unesi ispravnu email adresu', en: 'Please enter a valid email address' },
  badPhone: { sr: 'Unesi ispravan broj telefona', en: 'Please enter a valid phone number' },
  badAge: { sr: 'Godine treba da budu između 14 i 99', en: 'Age should be between 14 and 99' },
  answerAll: { sr: 'Odgovori na sva obavezna pitanja', en: 'Please answer all the required questions' },
  sending: { sr: 'Slanje…', en: 'Sending…' },
  joinFailed: {
    sr: 'Slanje nije uspjelo. Pokušaj ponovo ili se javi telefonom.',
    en: 'Sending failed. Please try again or give us a call.'
  },
  messageFill: { sr: 'Popuni ime, email i poruku', en: 'Please fill in your name, email and message' },
  messageSent: { sr: 'Poruka je poslata!', en: 'Message sent!' },
  messageFailed: { sr: 'Greška pri slanju poruke. Pokušaj ponovo.', en: 'The message could not be sent. Please try again.' }
};

const JOIN_STEPS = {
  1: {
    title: { sr: 'Pridruži se', en: 'Join' },
    desc: { sr: 'Prvo par podataka o tebi, da znam kome se javljam.', en: 'First a few details about you, so I know who I am getting back to.' }
  },
  2: {
    title: { sr: 'Upitnik', en: 'Questionnaire' },
    desc: { sr: 'Odgovori iskreno: na osnovu ovoga pravim tvoj plan.', en: 'Answer honestly: your plan is built from this.' }
  }
};

const t = entry => entry[currentLang] || entry.sr;

// ===== Rendering =====
// The transformations run in one strip: each card is the before and after
// photos side by side, and under them how long it took and what changed
// (the way ShredFast shows it), then the client's words, name and a note.
function statsHtml(item) {
  if (!item.period && !item.result) return '';
  return `<span class="tf-stats">${
    item.period ? `<span class="tf-period">${ICONS.clock}${esc(t(item.period))}</span>` : ''}${
    item.result ? `<span class="tf-result">${esc(t(item.result))}</span>` : ''}</span>`;
}

function reelCaptionHtml(item) {
  if (!item.period && !item.result && !item.quote && !item.name && !item.detail) return '';
  return `
      <figcaption class="reel-caption">${statsHtml(item)}${
        item.quote ? `<p class="reel-quote">${esc(t(item.quote))}</p>` : ''}${
        item.name ? `<span class="reel-name">${esc(t(item.name))}</span>` : ''}${
        item.detail ? `<span class="reel-detail">${esc(t(item.detail))}</span>` : ''}</figcaption>`;
}

function shotHtml(src, label, after, hidden) {
  return `
        <div class="transformation-shot img-wait">
          <img data-src="${esc(src)}" alt="${hidden ? '' : esc(t(label))}" decoding="async">
          <span class="shot-label shot-label--${after ? 'after' : 'before'}">${esc(t(label))}</span>
        </div>`;
}

// The second set of cards is only there so the strip runs on without a
// seam; screen readers skip it.
function reelCardHtml(item, copy) {
  return `
    <figure class="reel-card"${copy ? ' aria-hidden="true"' : ''}>
      <div class="transformation-pair">${shotHtml(item.before, MSG.before, false, copy)}${shotHtml(item.after, MSG.after, true, copy)}
      </div>${reelCaptionHtml(item)}
    </figure>`;
}

function renderTransformations() {
  const el = document.getElementById('transformationsReel');
  if (!el || !TRANSFORMATIONS.length) return;
  const cards = copy => TRANSFORMATIONS.map(item => reelCardHtml(item, copy)).join('');
  el.innerHTML = `
    <div class="tf-reel-wrap">
      <div class="tf-reel" tabindex="0" aria-roledescription="carousel" aria-label="${esc(t(MSG.reel))}">
        <div class="tf-reel-track">${cards(false)}${cards(true)}</div>
      </div>
      <button type="button" class="tf-arrow tf-arrow--prev" aria-label="${esc(t(MSG.reelPrev))}">${ICONS.prev}</button>
      <button type="button" class="tf-arrow tf-arrow--next" aria-label="${esc(t(MSG.reelNext))}">${ICONS.next}</button>
    </div>`;
  runReel(el.querySelector('.tf-reel'), el.querySelector('.tf-arrow--prev'), el.querySelector('.tf-arrow--next'));
  loadReelPhotos(el);
}

// ===== The strip's photos =====
// The browser's own lazy loading asks for a photo only once it is nearly on
// screen, and in a strip that moves sideways (iPhone above all) that is too
// late on a slow connection: the card arrives empty. So every photo in the
// strip is fetched while the strip is still a few screens away, and in any
// case a few seconds after the page has loaded. Until a photo is there its
// frame shimmers softly; then the photo fades in. A failed photo is asked for
// once more.
const REEL_AHEAD = '300% 0px';  // how far ahead of the strip loading starts
const REEL_PREFETCH = 3000;     // ms after the page has loaded, at the latest
const PHOTO_RETRY = 1500;       // ms before a failed photo is asked for again

function loadReelPhotos(root) {
  const photos = Array.from(root.querySelectorAll('img[data-src]'));
  if (!photos.length) return;
  let started = false;

  const arrived = img => {
    img.parentElement.classList.remove('img-wait');
    img.parentElement.classList.add('is-loaded');
  };
  const fetchPhoto = img => {
    const src = img.dataset.src;
    img.removeAttribute('data-src');
    img.addEventListener('load', () => arrived(img));
    img.addEventListener('error', () => {
      if (img.dataset.retried) { img.parentElement.classList.remove('img-wait'); return; }
      img.dataset.retried = '1';
      setTimeout(() => { img.src = src + (src.indexOf('?') < 0 ? '?' : '&') + 'retry=1'; }, PHOTO_RETRY);
    });
    img.src = src;
    // Already in the cache: no load event may follow.
    if (img.complete && img.naturalWidth) arrived(img);
  };
  const start = () => {
    if (started) return;
    started = true;
    photos.forEach(fetchPhoto);
  };

  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      start();
    }, { rootMargin: REEL_AHEAD });
    near.observe(root);
  } else {
    start();
  }
  const saveData = navigator.connection && navigator.connection.saveData;
  if (!saveData) {
    const later = () => setTimeout(start, REEL_PREFETCH);
    if (document.readyState === 'complete') later();
    else window.addEventListener('load', later, { once: true });
  }
}

// ===== Moving strip =====
// The cards drift slowly from left to right on their own. A swipe, the
// arrows on either side or the arrow keys move it one card at a time, as a
// photo carousel does: whatever card it lands on glides to the middle. Any
// of them pauses the drift long enough to look. The card nearest the middle
// is shown full size, the ones towards the edges smaller and dimmer. The
// track holds the cards twice and wraps by one copy's width, so it never
// runs out. Only moves while it is on screen.
const REEL_SPEED = 28;       // px per second
const REEL_HOLD = 6000;      // ms the drift waits after the visitor moves it
const REEL_GLIDE = 380;      // ms a card takes to glide to the middle
const REEL_SWIPE = 40;       // px of travel that counts as a swipe
const REEL_FLICK = 0.35;     // px per ms that counts as a swipe though short...
const REEL_FLICK_MIN = 20;   // ...once it has travelled this far (px)
const LESS_MOTION = window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function runReel(reel, prevButton, nextButton) {
  const track = reel.querySelector('.tf-reel-track');
  const cards = Array.from(track.children);
  let copy = 0;          // width of one set of cards
  let offset = 0;        // how far the strip has moved to the right
  let shift = 0;         // where the track is drawn, from offset
  let visible = false;
  let heldUntil = 0;
  let last = 0;
  let centers = [];
  let glide = null;      // { delta, start, done }: a card on its way to the middle

  const measure = () => {
    centers = cards.map(c => c.offsetLeft + c.offsetWidth / 2);
    // One set's period: from a card to the same card in the second set.
    // (Half the track's width falls half a gap short, and the strip would
    // jump by that each time it wraps.)
    const half = cards.length / 2;
    copy = half >= 1 ? centers[half] - centers[0] : track.scrollWidth / 2;
  };
  const place = () => {
    if (!copy) return;
    offset = ((offset % copy) + copy) % copy;
    shift = offset - copy;
    track.style.transform = `translate3d(${shift}px, 0, 0)`;
    const mid = reel.clientWidth / 2;
    const reach = reel.clientWidth / 2 + 1;
    cards.forEach((card, i) => {
      const d = Math.min(Math.abs(centers[i] + shift - mid) / reach, 1);
      card.style.setProperty('--near', (1 - d).toFixed(3));
    });
  };
  const ease = p => 1 - Math.pow(1 - p, 3);
  const frame = now => {
    if (!reel.isConnected) return;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    if (glide) {
      // Moved by the change in eased progress, so wrapping round never
      // disturbs a glide.
      const p = Math.min((now - glide.start) / REEL_GLIDE, 1);
      offset += (ease(p) - glide.done) * glide.delta;
      glide.done = ease(p);
      if (p >= 1) glide = null;
    } else if (!LESS_MOTION && now > heldUntil) {
      offset += REEL_SPEED * dt;
    }
    place();
    if (visible) requestAnimationFrame(frame);
  };
  const wake = () => {
    if (visible) return;
    visible = true;
    last = 0;
    requestAnimationFrame(frame);
  };

  const mid = () => reel.clientWidth / 2;
  const step = () => (centers.length > 1 ? centers[1] - centers[0] : reel.clientWidth);
  // Where the card nearest the middle is, or will be once a glide ends.
  const nearestX = () => {
    const pending = glide ? glide.delta * (1 - glide.done) : 0;
    let best = Infinity;
    centers.forEach(c => {
      const x = c + shift + pending;
      if (Math.abs(x - mid()) < Math.abs(best - mid())) best = x;
    });
    return best;
  };
  const glideBy = delta => {
    const pending = glide ? glide.delta * (1 - glide.done) : 0;
    heldUntil = performance.now() + REEL_HOLD;
    if (LESS_MOTION) {
      glide = null;
      offset += delta + pending;
      place();
      return;
    }
    glide = { delta: delta + pending, start: performance.now(), done: 0 };
  };
  // dir +1: the next card (from the right) to the middle; -1: the previous.
  const goBy = dir => glideBy(mid() - (nearestX() + dir * step()));

  // Swiping, with a finger or a mouse. A finger's first few pixels decide:
  // mostly sideways moves the strip (and the page stays put), mostly
  // upwards scrolls the page as usual.
  let drag = null;
  reel.addEventListener('pointerdown', e => {
    if (e.button) return;
    const pending = glide ? glide.delta * (1 - glide.done) : 0;
    glide = null;
    offset += pending;      // a glide cut short lands where it was going
    place();
    drag = {
      x0: e.clientX, y0: e.clientY, x: e.clientX, t: e.timeStamp, vx: 0,
      axis: e.pointerType === 'mouse' ? 'x' : null,
      anchor: nearestX()
    };
    heldUntil = Infinity;
    reel.setPointerCapture(e.pointerId);
  });
  reel.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.axis) {
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (Math.hypot(dx, dy) < 6) return;
      drag.axis = Math.abs(dx) >= Math.abs(dy) * 0.7 ? 'x' : 'y';
      if (drag.axis === 'y') { drag = null; heldUntil = performance.now() + REEL_HOLD; return; }
      drag.x = e.clientX;  // the strip starts following from here
    }
    const moved = e.clientX - drag.x;
    const dt = Math.max(e.timeStamp - drag.t, 1);
    drag.vx = 0.7 * (moved / dt) + 0.3 * drag.vx;
    drag.t = e.timeStamp;
    drag.x = e.clientX;
    drag.travel = (drag.travel || 0) + moved;
    offset += moved;
    reel.classList.add('is-dragging');
    place();
  });
  // Once the strip has the gesture, the page does not scroll under it.
  reel.addEventListener('touchmove', e => {
    if (drag && drag.axis === 'x' && e.cancelable) e.preventDefault();
  }, { passive: false });
  const release = () => {
    if (!drag) return;
    const { axis, vx, anchor } = drag;
    const travel = drag.travel || 0;
    drag = null;
    reel.classList.remove('is-dragging');
    heldUntil = performance.now() + REEL_HOLD;
    if (axis !== 'x') return;
    const flick = Math.abs(travel) >= REEL_FLICK_MIN;
    const dir = travel < -REEL_SWIPE || (flick && vx < -REEL_FLICK) ? 1
      : travel > REEL_SWIPE || (flick && vx > REEL_FLICK) ? -1 : 0;
    // The card that was in the middle has moved by the travel; the one
    // the swipe asks for glides to the middle.
    glideBy(mid() - (anchor + travel + dir * step()));
  };
  reel.addEventListener('pointerup', release);
  reel.addEventListener('pointercancel', release);
  // Resting a mouse on it holds it still, to look closer. Only a real
  // mouse: after a tap a phone reports an "enter" that never leaves.
  reel.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !drag) heldUntil = Infinity; });
  reel.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !drag) heldUntil = performance.now() + 800; });
  reel.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    goBy(e.key === 'ArrowRight' ? 1 : -1);
  });
  if (prevButton) prevButton.addEventListener('click', () => goBy(-1));
  if (nextButton) nextButton.addEventListener('click', () => goBy(1));

  measure();
  place();
  // Cards are a fixed width, so photos arriving move nothing; only a resize
  // does, and it is measured once a frame at most (measuring forces layout).
  let remeasure = 0;
  window.addEventListener('resize', () => {
    if (remeasure) return;
    remeasure = requestAnimationFrame(() => { remeasure = 0; measure(); place(); });
  });
  if (!('IntersectionObserver' in window)) return wake();
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) wake();
    else visible = false;
  }).observe(reel);
}

function renderLevels() {
  const el = document.getElementById('levelsGrid');
  if (el) el.innerHTML = LEVELS.map(level => levelCardHtml(level, currentLang)).join('');
}

function renderFeatures(id, items) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = items.map(item => featureHtml(item, currentLang)).join('');
}

function renderLocations() {
  const el = document.getElementById('locationsGrid');
  if (el) el.innerHTML = LOCATIONS.map(loc => locationHtml(loc, currentLang)).join('');
}

function renderAll() {
  renderFeatures('resultsGrid', RESULTS);
  renderLevels();
  renderFeatures('mentorshipGrid', MENTORSHIP);
  renderTransformations();
  renderLocations();
  renderQuestions();
  observeFadeElements();
  watchPhotos();
}

// ===== Join (questionnaire) =====
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const join = { step: 1, source: '', opener: null, sent: false };

// A 'multi' question's answer is the list of what was ticked.
function readAnswers() {
  const answers = {};
  JOIN_QUESTIONS.forEach(q => {
    if (q.type === 'multi') {
      answers[q.id] = Array.from(document.querySelectorAll('input[name="q_' + q.id + '"]:checked')).map(i => i.value);
    } else if (q.type === 'choice') {
      const checked = document.querySelector('input[name="q_' + q.id + '"]:checked');
      answers[q.id] = checked ? checked.value : '';
    } else {
      const field = document.getElementById('q_' + q.id);
      answers[q.id] = field ? field.value.trim() : '';
    }
  });
  return answers;
}

function setAnswer(id, value) {
  const q = JOIN_QUESTIONS.find(x => x.id === id);
  if (!q || !value) return;
  if (q.type === 'choice' || q.type === 'multi') {
    [].concat(value).forEach(v => {
      const input = document.querySelector('input[name="q_' + id + '"][value="' + CSS.escape(v) + '"]');
      if (input) input.checked = true;
    });
  } else {
    const field = document.getElementById('q_' + id);
    if (field) field.value = value;
  }
}

// Drawn from JOIN_QUESTIONS, so changing the questionnaire never touches this
// file. Answers already given survive a redraw (a language switch mid-form).
function renderQuestions() {
  const el = document.getElementById('joinQuestions');
  if (!el) return;
  const kept = readAnswers();
  el.innerHTML = JOIN_QUESTIONS.map(q => {
    const optional = q.required ? '' : ' <span class="field-optional">(' + esc(currentLang === 'sr' ? 'nije obavezno' : 'optional') + ')</span>';
    const many = q.type === 'multi' ? ' <span class="field-optional">(' + esc(currentLang === 'sr' ? 'može više odgovora' : 'pick any') + ')</span>' : '';
    if (q.type === 'choice' || q.type === 'multi') {
      return `
        <fieldset class="join-question" data-question="${q.id}">
          <legend>${esc(t(q.label))}${optional}${many}</legend>
          <div class="choice-group">
            ${questionOptions(q).map(o => `
              <label class="choice">
                <input type="${q.type === 'multi' ? 'checkbox' : 'radio'}" name="q_${q.id}" value="${esc(o.value)}">
                <span>${esc(t(o.label))}</span>
              </label>`).join('')}
          </div>
        </fieldset>`;
    }
    return `
      <label class="field join-question" data-question="${q.id}">
        <span>${esc(t(q.label))}${optional}</span>
        <textarea id="q_${q.id}" rows="3" data-clarity-mask="true"
          placeholder="${q.placeholder ? esc(t(q.placeholder)) : ''}"></textarea>
      </label>`;
  }).join('');
  Object.keys(kept).forEach(id => setAnswer(id, kept[id]));
}

function setJoinStep(step) {
  join.step = step;
  document.getElementById('joinStep1').hidden = step !== 1;
  document.getElementById('joinStep2').hidden = step !== 2;
  document.getElementById('joinTitle').textContent = t(JOIN_STEPS[step].title);
  document.getElementById('joinDesc').textContent = t(JOIN_STEPS[step].desc);
  ['jpStep1', 'jpStep2'].forEach((id, i) => {
    const el = document.getElementById(id);
    el.classList.toggle('jp-step--active', i + 1 === step);
    el.classList.toggle('jp-step--done', i + 1 < step);
  });
  document.getElementById('jpLine').classList.toggle('jp-line--done', step > 1);
  document.getElementById('joinModal').scrollTop = 0;
}

function openJoin(opts) {
  const o = opts || {};
  join.source = o.source || 'nepoznato';
  join.opener = document.activeElement;
  join.sent = false;
  document.getElementById('joinFormWrap').hidden = false;
  document.getElementById('joinSuccess').hidden = true;
  document.getElementById('joinProgress').hidden = false;
  setJoinStep(1);
  if (o.level && LEVELS.some(l => l.id === o.level)) setAnswer('nivo', o.level);

  clTag('prijava_izvor', join.source);
  if (o.level) clTag('nivo', o.level);
  clEvent('prijava_otvorena');

  const overlay = document.getElementById('joinOverlay');
  overlay.classList.add('active');
  overlay.removeAttribute('inert');
  document.body.style.overflow = 'hidden';
  document.getElementById('jName').focus({ preventScroll: true });
}

function closeJoin() {
  const overlay = document.getElementById('joinOverlay');
  if (!overlay.classList.contains('active')) return;
  if (!join.sent) {
    // Leaving at the contact step is friction in the form; leaving at the
    // questionnaire is doubt about the questions. Same event, different fix.
    clTag('prijava_faza', join.step === 2 ? 'upitnik' : 'podaci');
    clKeep('prijava_napustena');
    clEvent('prijava_napustena');
  }
  overlay.classList.remove('active');
  overlay.setAttribute('inert', '');
  document.body.style.overflow = '';
  if (join.sent) {
    document.getElementById('joinForm').reset();
    join.sent = false;
  }
  if (join.opener && typeof join.opener.focus === 'function') join.opener.focus({ preventScroll: true });
}

function formError(field, message, focusEl) {
  clTag('greska_polje', field);
  clEvent('forma_greska');
  showToast(t(message), false);
  if (focusEl) focusEl.focus();
}

function contactDetails() {
  return {
    name: document.getElementById('jName').value.trim(),
    email: document.getElementById('jEmail').value.trim(),
    phone: document.getElementById('jPhone').value.trim(),
    age: document.getElementById('jAge').value.trim()
  };
}

function goToQuestions() {
  const d = contactDetails();
  if (!d.name || !d.email || !d.phone) {
    // Which field is empty is the point: "prazno:telefon" again and again
    // means people will not leave a number, which is a decision about the
    // form, not a bug.
    const empty = [!d.name && 'ime', !d.email && 'email', !d.phone && 'telefon'].filter(Boolean).join('+');
    const first = !d.name ? 'jName' : (!d.email ? 'jEmail' : 'jPhone');
    return formError('prazno:' + empty, MSG.fillContact, document.getElementById(first));
  }
  if (!EMAIL_RE.test(d.email)) return formError('email', MSG.badEmail, document.getElementById('jEmail'));
  if (d.phone.replace(/\D/g, '').length < 8) return formError('telefon', MSG.badPhone, document.getElementById('jPhone'));
  if (d.age && (!/^\d+$/.test(d.age) || +d.age < 14 || +d.age > 99)) {
    return formError('godine', MSG.badAge, document.getElementById('jAge'));
  }
  clEvent('prijava_korak_1');
  setJoinStep(2);
  const firstInput = document.querySelector('#joinQuestions input, #joinQuestions textarea');
  if (firstInput) firstInput.focus({ preventScroll: true });
}

const answered = value => (Array.isArray(value) ? value.length > 0 : !!value);

function missingAnswers(answers) {
  return JOIN_QUESTIONS.filter(q => q.required && !answered(answers[q.id]));
}

// What the coach reads in the email: the labels, several joined by commas.
function answerLabel(q, value) {
  if (!answered(value)) return '';
  if (q.type !== 'choice' && q.type !== 'multi') return value;
  return [].concat(value).map(v => {
    const option = questionOptions(q).find(o => o.value === v);
    return option ? option.label.sr : v;
  }).join(', ');
}

async function submitJoin(e) {
  e.preventDefault();
  if (join.step !== 2) return goToQuestions();

  const answers = readAnswers();
  document.querySelectorAll('.join-question').forEach(el => el.classList.remove('join-question--invalid'));
  const missing = missingAnswers(answers);
  if (missing.length) {
    missing.forEach(q => {
      const el = document.querySelector('[data-question="' + q.id + '"]');
      if (el) el.classList.add('join-question--invalid');
    });
    const firstEl = document.querySelector('[data-question="' + missing[0].id + '"] input');
    return formError('prazno:' + missing.map(q => q.id).join('+'), MSG.answerAll, firstEl);
  }

  const d = contactDetails();
  const levelLabel = answerLabel(JOIN_QUESTIONS.find(q => q.id === 'nivo') || { type: 'text' }, answers.nivo);
  const timestamp = new Date().toLocaleString('sr-RS', {
    timeZone: 'Europe/Belgrade',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Readable Serbian keys, because FormSubmit prints them as the rows of the
  // email the coach reads.
  const payload = {
    _subject: BRAND + ' | Nova prijava | ' + d.name + (levelLabel ? ' | ' + levelLabel : ''),
    _template: 'table',
    _captcha: 'false',
    _replyto: d.email,
    _autoresponse: 'Zdravo ' + d.name + ',\n\nhvala ti na prijavi za ' + BRAND + ' online mentorstvo.\n\n'
      + 'Tvoj upitnik je stigao. Pregledaću ga i javiti ti se sa sljedećim koracima.\n\n' + BRAND,
    'Datum i vrijeme': timestamp,
    'Ime i prezime': d.name,
    'Email': d.email,
    'Telefon': d.phone,
    'Godine': d.age || '-',
    'Odakle je otvorena prijava': join.source
  };
  JOIN_QUESTIONS.forEach(q => { payload[q.label.sr] = answerLabel(q, answers[q.id]) || '-'; });

  const submitBtn = document.getElementById('joinSubmit');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = t(MSG.sending);

  try {
    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data.success !== 'true' && data.success !== true) throw new Error('FormSubmit error');
  } catch (err) {
    // Never claim a success we cannot verify: everything typed stays in the
    // form so the person can simply press send again.
    console.error('Join submission failed:', err);
    clKeep('prijava_neuspjesna');
    clEvent('prijava_neuspjesna');
    showToast(t(MSG.joinFailed), false);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    return;
  }

  join.sent = true;
  clKeep('prijava_poslata');
  clTag('nivo', answers.nivo || '');
  clTag('cilj', [].concat(answers.cilj || []).join(','));
  clEvent('prijava_poslata');
  submitBtn.disabled = false;
  submitBtn.textContent = originalText;
  document.getElementById('joinFormWrap').hidden = true;
  document.getElementById('joinProgress').hidden = true;
  document.getElementById('joinSuccess').hidden = false;
  document.getElementById('joinDone').focus({ preventScroll: true });
}

// ===== Contact form =====
async function submitContact(e) {
  e.preventDefault();
  const form = e.target;
  const name = document.getElementById('cName').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const subject = document.getElementById('cSubject').value.trim() || 'Poruka sa sajta';
  const message = document.getElementById('cMessage').value.trim();
  if (!name || !email || !message) return showToast(t(MSG.messageFill), false);
  if (!EMAIL_RE.test(email)) return showToast(t(MSG.badEmail), false);

  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = t(MSG.sending);
  try {
    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: BRAND + ' | Poruka: ' + subject,
        _template: 'table',
        _captcha: 'false',
        _replyto: email,
        'Ime': name, 'Email': email, 'Naslov': subject, 'Poruka': message
      })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data.success !== 'true' && data.success !== true) throw new Error('FormSubmit error');
    clEvent('poruka_poslata');
    showToast(t(MSG.messageSent));
    form.reset();
  } catch (err) {
    console.error('Contact submission failed:', err);
    showToast(t(MSG.messageFailed), false);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

// ===== Language =====
function switchLanguage(lang) {
  currentLang = lang === 'en' ? 'en' : 'sr';
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-sr]').forEach(el => {
    const text = el.dataset[currentLang];
    if (text) el.textContent = text;
  });
  document.querySelectorAll('[data-sr-ph]').forEach(el => {
    el.placeholder = el.dataset[currentLang === 'sr' ? 'srPh' : 'enPh'];
  });
  document.getElementById('langToggle').innerHTML = currentLang === 'sr'
    ? '<span class="lang-active">SR</span> / <span>EN</span>'
    : '<span>SR</span> / <span class="lang-active">EN</span>';
  try { localStorage.setItem(LANG_KEY, currentLang); } catch (err) { /* storage off: not remembered */ }
  clTag('jezik', currentLang);
  applyContact();
  renderAll();
  setJoinStep(join.step);
}

// ===== Toast =====
function showToast(msg, success = true) {
  const toast = document.getElementById('toast');
  toast.innerHTML = success ? '<span class="toast-check" aria-hidden="true">✓</span>' : '';
  toast.appendChild(document.createTextNode(msg));
  toast.classList.add('active');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('active'), 3200);
}

// ===== Motion =====
let _fadeObserver = null;

// One observer for the life of the page; re-observing on every render is a
// no-op for elements it already holds.
function observeFadeElements() {
  ['.feature', '.card', '.transformation', '.location'].forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('fade-up', 'stagger-' + Math.min(i + 1, 4));
    });
  });
  document.querySelectorAll('.section-header, .about, .contact-item, .contact-form, .join-band, .section-cta')
    .forEach(el => el.classList.add('fade-up'));
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    return;
  }
  if (!_fadeObserver) {
    _fadeObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          _fadeObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
  }
  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => _fadeObserver.observe(el));
}

// The big figures count up from zero when they come into view and land with
// a short glow. They are set to zero only once it is certain the count will
// run, so no figure is ever left showing the wrong number.
function animateCounters() {
  if (LESS_MOTION || !('IntersectionObserver' in window)) return;
  const counters = Array.from(document.querySelectorAll('.stat-num, .feature-big'))
    .map(el => {
      const text = el.textContent.trim();
      const match = text.match(/^(\d+)/);
      return match && { el, target: parseInt(match[1], 10), suffix: text.slice(match[1].length) };
    })
    .filter(Boolean);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const c = counters.find(x => x.el === e.target);
      const start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / 1600, 1);
        c.el.textContent = Math.round(c.target * (1 - Math.pow(1 - p, 3))) + c.suffix;
        if (p < 1) requestAnimationFrame(step);
        else c.el.classList.add('is-counted');
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => {
    c.el.textContent = '0' + c.suffix;
    io.observe(c.el);
  });
}

// The kettlebells start falling the moment the spot where they land peeks
// in at the bottom of the screen: they come down from the top while the
// page is still being scrolled, and have landed by the time the eye gets
// there. They fall again each time they come back after leaving the
// screen. Armed here, so without script (or with reduced motion) they
// just stand.
function dropOnArrival() {
  const el = document.querySelector('.kb-drop');
  const stage = el && el.querySelector('.kb-stage');
  if (!stage || LESS_MOTION || !('IntersectionObserver' in window)) return;
  el.classList.add('is-armed');
  new IntersectionObserver(([e]) => {
    el.classList.toggle('is-dropped', e.isIntersecting);
  }).observe(stage);
}

// On a phone, "Pridruži se" waits at the bottom of the screen once the hero
// is passed. It steps aside where the page already offers the same button
// (the join band) or a form of its own (contact).
function mobileJoinBar() {
  const bar = document.getElementById('mobileJoin');
  const hero = document.querySelector('.hero-buttons');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;
  const controls = bar.querySelectorAll('button, a');
  let pastHero = false;
  const inTheWay = new Set();
  const update = () => {
    const show = pastHero && inTheWay.size === 0;
    bar.classList.toggle('is-on', show);
    bar.setAttribute('aria-hidden', String(!show));
    document.body.classList.toggle('past-hero', pastHero);
    controls.forEach(c => { c.tabIndex = show ? 0 : -1; });
    document.body.classList.toggle('has-mobile-join', show);
  };
  new IntersectionObserver(([e]) => {
    pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
    update();
  }).observe(hero);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? inTheWay.add(e.target) : inTheWay.delete(e.target)));
    update();
  });
  ['join', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
}

// Everything that reacts to scrolling runs here, at most once per frame,
// so layout is read and written once rather than per effect.
const _scrollJobs = [];
let _scrollTicking = false;

function onScrollFrame(job) { _scrollJobs.push(job); }

window.addEventListener('scroll', () => {
  if (_scrollTicking) return;
  _scrollTicking = true;
  requestAnimationFrame(() => {
    _scrollTicking = false;
    _scrollJobs.forEach(job => job());
  });
}, { passive: true });

// ===== Sections and the address bar =====
// Scrolling to a section never leaves #anchor in the address bar, and never
// adds a history entry, so Back still goes to the previous page.
function clearHash() {
  if (!location.hash) return;
  try {
    history.replaceState(null, '', location.pathname + location.search);
  } catch (err) {
    // Some embedded browsers refuse replaceState; the fragment is cosmetic.
  }
}

function goToSection(target, behavior) {
  target.scrollIntoView({ behavior: behavior || 'smooth' });
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  clearHash();
}

// Arriving from a subpage as ./#levels: land there, then tidy the address.
// One correction after load, unless the visitor has already started scrolling.
function landOnHash() {
  const wanted = location.hash;
  if (!wanted) return;
  clearHash();
  let target = null;
  try { target = document.querySelector(wanted); } catch (err) { return; }
  if (!target) return;
  goToSection(target, 'auto');
  let ownScroll = false;
  const noteScroll = () => { ownScroll = true; };
  window.addEventListener('wheel', noteScroll, { once: true, passive: true });
  window.addEventListener('touchstart', noteScroll, { once: true, passive: true });
  window.addEventListener('keydown', noteScroll, { once: true });
  const settle = () => { if (!ownScroll) goToSection(target, 'auto'); };
  if (document.readyState === 'complete') setTimeout(settle, 60);
  else window.addEventListener('load', () => setTimeout(settle, 60), { once: true });
}

// The level page's "Pridruži se" sends people here as ?prijava=1&nivo=<level>.
function openJoinFromUrl() {
  const params = new URLSearchParams(location.search);
  if (!params.has('prijava')) return;
  openJoin({ level: params.get('nivo'), source: params.get('izvor') || 'podstranica' });
  try {
    history.replaceState(null, '', location.pathname + location.hash);
  } catch (err) { /* cosmetic */ }
}

// Which parts of the page a visitor reaches. Each fires once.
function trackSections() {
  const once = (id, event) => {
    const el = document.getElementById(id);
    if (!el || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(entries => {
      if (entries.some(en => en.isIntersecting)) {
        clEvent(event);
        obs.disconnect();
      }
    });
    obs.observe(el);
  };
  once('results', 'rezultati_vidjeni');
  once('levels', 'nivoi_vidjeni');
  once('mentorship', 'mentorstvo_vidjeno');
  once('contact', 'kontakt_vidjen');
}

// ===== Hero video =====
// An upright screen gets the upright clip, a wider one the clip set in the
// middle of its own blur. Until it plays, and for visitors who asked for
// less motion or less data, its first frame stands in as a still; with no
// clip at all, the blue background does.
function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  const bg = document.getElementById('heroBg');
  const wide = window.matchMedia && window.matchMedia('(min-aspect-ratio: 1/1)').matches;
  const pickFor = name => video && ((wide && video.dataset[name + 'Wide']) || video.dataset[name]);
  const poster = pickFor('poster');
  let settled = false;

  if (bg && poster) {
    bg.style.backgroundImage = 'url("' + poster + '")';
    bg.classList.add('has-poster');
  }

  const useStatic = () => {
    if (settled) return;
    settled = true;
    if (video) video.remove();
    if (bg) bg.classList.add('visible');
  };
  const useVideo = () => {
    if (settled) return;
    settled = true;
    video.classList.add('active');
    if (bg) bg.classList.remove('visible');
  };

  const lessMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lessData = navigator.connection && navigator.connection.saveData;
  if (!video || lessMotion || lessData) return useStatic();

  // The static background shows straight away; the video fades over it only
  // once it actually plays.
  if (bg) bg.classList.add('visible');
  // Whichever clip is actually there: a WebM first where one is given and the
  // browser plays it, then the MP4. A missing file raises no prompt <video>
  // error, so each is checked first.
  const probe = document.createElement('video');
  const candidates = [];
  const webm = pickFor('srcWebm');
  if (webm && probe.canPlayType('video/webm; codecs="vp9"')) candidates.push(webm);
  if (pickFor('src')) candidates.push(pickFor('src'));
  const exists = url => fetch(url, { method: 'HEAD' }).then(res => res.ok, () => false);
  const pick = list => (list.length
    ? exists(list[0]).then(ok => (ok ? list[0] : pick(list.slice(1))))
    : Promise.reject(new Error('no clip')));

  pick(candidates)
    .then(src => {
      video.addEventListener('playing', useVideo, { once: true });
      video.addEventListener('error', useStatic, { once: true });
      video.src = src;
      const attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(useStatic);
      setTimeout(() => { if (!settled) useStatic(); }, 12000);
      pauseHeroOffScreen(video, bg, src);
    })
    .catch(useStatic);
}

// Scrolled away from, the hero clip pauses, and if it is still downloading
// the download stops too: on a slow connection it would otherwise take the
// whole line from the photos further down. Its still covers for it, and once
// the hero is back the clip carries on where it was.
function pauseHeroOffScreen(video, bg, src) {
  if (!('IntersectionObserver' in window)) return;
  const hero = video.closest('.hero') || video.parentElement;
  let resumeAt = -1;
  const loadedAll = () => video.buffered.length === 1 && video.duration
    && video.buffered.end(0) >= video.duration - 0.5;

  const watch = new IntersectionObserver(([e]) => {
    // The still took over for good (no clip, or it never started).
    if (!video.isConnected) { watch.disconnect(); return; }
    if (!e.isIntersecting) {
      video.pause();
      if (!loadedAll()) {
        resumeAt = video.currentTime || 0;
        if (bg) bg.classList.add('visible');
        video.classList.remove('active');
        video.removeAttribute('src');
        video.load();
      }
      return;
    }
    if (resumeAt >= 0) {
      const at = resumeAt;
      resumeAt = -1;
      video.addEventListener('loadedmetadata', () => {
        try { video.currentTime = at; } catch (err) { /* starts from the top */ }
      }, { once: true });
      video.addEventListener('playing', () => {
        video.classList.add('active');
        if (bg) bg.classList.remove('visible');
      }, { once: true });
      video.src = src;
    }
    const attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(() => { /* the still stays */ });
  });
  watch.observe(hero);
}

// ===== Logo on arrival =====
// The splash leaves by itself (styles.css); any sign that the visitor wants
// the page, a tap, a key, a wheel or a scroll, sends it off at once. Once it
// has faded it is taken out of the page.
function endIntroOnInput() {
  const intro = document.getElementById('intro');
  const root = document.documentElement;
  if (!intro) return;
  if (!root.classList.contains('has-intro')) {
    intro.remove();
    return;
  }
  const events = ['pointerdown', 'keydown', 'wheel', 'touchmove', 'scroll'];
  const skip = () => {
    events.forEach(type => window.removeEventListener(type, skip, true));
    root.classList.add('intro-skip');
  };
  events.forEach(type => window.addEventListener(type, skip, { capture: true, passive: true }));
  intro.addEventListener('animationend', e => {
    if (e.animationName !== 'introOut' && e.animationName !== 'introSkip') return;
    events.forEach(type => window.removeEventListener(type, skip, true));
    intro.remove();
  });
}

// ===== "Čitaj dalje" =====
function aboutReadMore() {
  const button = document.getElementById('aboutToggle');
  const more = document.getElementById('aboutMore');
  if (!button || !more) return;
  const labels = { false: { sr: 'Čitaj dalje', en: 'Read more' }, true: { sr: 'Prikaži manje', en: 'Show less' } };
  button.addEventListener('click', () => {
    const open = more.hidden;
    more.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.dataset.sr = labels[open].sr;
    button.dataset.en = labels[open].en;
    button.textContent = t(labels[open]);
    if (open) clEvent('tekst_otvoren');
  });
}

// ===== Init =====
// The band moves by half its width, so it carries its words twice; the
// copy is made here to keep the HTML to one list.
function fillMarquee() {
  document.querySelectorAll('.marquee-track').forEach(track => {
    const group = track.querySelector('.marquee-group');
    if (group && track.children.length === 1) track.appendChild(group.cloneNode(true));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  endIntroOnInput();
  fillMarquee();
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  const navbar = document.getElementById('navbar');
  onScrollFrame(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? Math.min(window.scrollY / max, 1) * 100 : 0) + '%';
  });

  document.getElementById('langToggle').addEventListener('click', () => {
    switchLanguage(currentLang === 'sr' ? 'en' : 'sr');
  });

  // Delegated, because cards are redrawn on every language switch.
  document.addEventListener('click', e => {
    const joinBtn = e.target.closest('[data-join]');
    if (joinBtn) {
      e.preventDefault();
      openJoin({ source: joinBtn.dataset.join });
      return;
    }
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const id = anchor.getAttribute('href');
      const target = id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;
      e.preventDefault();
      goToSection(target, 'smooth');
      return;
    }
    if (e.target.closest('a[href*="instagram.com"]')) {
      clEvent('instagram_kliknut');
      return;
    }
    if (e.target.closest('a[data-contact="chat"]')) {
      clEvent(CONTACT.chat + '_kliknut');
      return;
    }
    if (e.target.closest('a.location--map')) {
      clEvent('mapa_kliknuta');
      return;
    }
    const contact = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (contact && !contact.closest('.footer-credit')) clEvent(contact.getAttribute('href').startsWith('tel:') ? 'telefon_kliknut' : 'email_kliknut');
  });

  document.getElementById('joinNext').addEventListener('click', goToQuestions);
  document.getElementById('joinBack').addEventListener('click', () => setJoinStep(1));
  document.getElementById('joinForm').addEventListener('submit', submitJoin);
  document.getElementById('joinClose').addEventListener('click', closeJoin);
  document.getElementById('joinDone').addEventListener('click', closeJoin);
  document.getElementById('joinOverlay').addEventListener('click', e => {
    if (e.target.id === 'joinOverlay') closeJoin();
  });
  document.getElementById('joinQuestions').addEventListener('change', e => {
    const q = e.target.closest('.join-question');
    if (q) q.classList.remove('join-question--invalid');
  });
  // Enter in a contact field moves on rather than submitting half a form.
  document.getElementById('joinStep1').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault();
      goToQuestions();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeJoin();
  });

  document.getElementById('contactForm').addEventListener('submit', submitContact);
  applyContact();

  let saved = null;
  try { saved = localStorage.getItem(LANG_KEY); } catch (err) { /* storage off */ }
  // Serbian stays the default; only an explicit switch is remembered.
  switchLanguage(saved === 'en' ? 'en' : 'sr');

  aboutReadMore();
  landOnHash();
  openJoinFromUrl();
  animateCounters();
  dropOnArrival();
  mobileJoinBar();
  trackSections();
  initHeroVideo();
});

// ===== AthLean Fast: homepage =====

// PRIVREMENO: mail na koji stižu prijave i poruke. FormSubmit pri prvoj
// prijavi šalje jednokratni link za potvrdu na tu adresu.
const RECIPIENT_EMAIL = 'upiti@example.com';
const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/' + RECIPIENT_EMAIL;

const LANG_KEY = 'afLang';
let currentLang = 'sr';

// ===== Text set from script =====
const MSG = {
  before: { sr: 'Prije', en: 'Before' },
  after: { sr: 'Poslije', en: 'After' },
  fillContact: { sr: 'Popuni ime, email i telefon', en: 'Please fill in your name, email and phone' },
  badEmail: { sr: 'Unesi ispravnu email adresu', en: 'Please enter a valid email address' },
  badPhone: { sr: 'Unesi ispravan broj telefona', en: 'Please enter a valid phone number' },
  badAge: { sr: 'Godine treba da budu između 14 i 99', en: 'Age should be between 14 and 99' },
  answerAll: { sr: 'Odgovori na sva obavezna pitanja', en: 'Please answer all the required questions' },
  sending: { sr: 'Slanje...', en: 'Sending...' },
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
    desc: { sr: 'Prvo par podataka o tebi, da znamo kome se javljamo.', en: 'First a few details about you, so we know who to get back to.' }
  },
  2: {
    title: { sr: 'Upitnik', en: 'Questionnaire' },
    desc: { sr: 'Odgovori iskreno: na osnovu ovoga pravim tvoj plan.', en: 'Answer honestly: your plan is built from this.' }
  }
};

const t = entry => entry[currentLang] || entry.sr;

// ===== Rendering =====
function renderTransformations() {
  const el = document.getElementById('transformationsGrid');
  if (!el) return;
  el.classList.toggle('transformations--single', TRANSFORMATIONS.length === 1);
  el.innerHTML = TRANSFORMATIONS.map(item => `
    <figure class="transformation">
      <div class="transformation-pair">
        <div class="transformation-shot">
          <img src="${esc(item.before)}" alt="${esc(t(MSG.before))}" loading="lazy" decoding="async">
          <span class="shot-label">${esc(t(MSG.before))}</span>
        </div>
        <div class="transformation-shot">
          <img src="${esc(item.after)}" alt="${esc(t(MSG.after))}" loading="lazy" decoding="async">
          <span class="shot-label shot-label--after">${esc(t(MSG.after))}</span>
        </div>
      </div>
      <figcaption class="transformation-caption">
        <strong>${esc(t(item.name))}</strong>
        <span>${esc(t(item.detail))}</span>
      </figcaption>
    </figure>`).join('');
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
}

// ===== Join (questionnaire) =====
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const join = { step: 1, source: '', opener: null, sent: false };

function readAnswers() {
  const answers = {};
  JOIN_QUESTIONS.forEach(q => {
    if (q.type === 'choice') {
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
  if (q.type === 'choice') {
    const input = document.querySelector('input[name="q_' + id + '"][value="' + CSS.escape(value) + '"]');
    if (input) input.checked = true;
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
    if (q.type === 'choice') {
      return `
        <fieldset class="join-question" data-question="${q.id}">
          <legend>${esc(t(q.label))}${optional}</legend>
          <div class="choice-group">
            ${questionOptions(q).map(o => `
              <label class="choice">
                <input type="radio" name="q_${q.id}" value="${esc(o.value)}">
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

function missingAnswers(answers) {
  return JOIN_QUESTIONS.filter(q => q.required && !answers[q.id]);
}

function answerLabel(q, value) {
  if (!value) return '';
  if (q.type !== 'choice') return value;
  const option = questionOptions(q).find(o => o.value === value);
  return option ? option.label.sr : value;
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
  clTag('cilj', answers.cilj || '');
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
  document.querySelectorAll('.section-header, .about-content, .about-media, .contact-form, .join-band, .section-cta')
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

function animateCounters() {
  const counters = document.querySelectorAll('.stat-num');
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      io.unobserve(el);
      const text = el.textContent.trim();
      const match = text.match(/^(\d+)/);
      if (!match) return;
      const target = parseInt(match[1], 10);
      const suffix = text.slice(match[1].length);
      const start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / 1400, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => io.observe(el));
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
// Plays videos/hero.mp4 (or .webm) when the file exists. Without it, or for
// visitors who asked for less motion or less data, the still background
// carries the hero instead.
function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  const bg = document.getElementById('heroBg');
  let settled = false;

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
  const probe = document.createElement('video');
  const src = (video.dataset.srcWebm && probe.canPlayType('video/webm; codecs="vp9"'))
    ? video.dataset.srcWebm
    : video.dataset.src;

  // A missing file does not raise a prompt <video> error, so check first.
  fetch(src, { method: 'HEAD' })
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      video.addEventListener('playing', useVideo, { once: true });
      video.addEventListener('error', useStatic, { once: true });
      if (video.dataset.poster) video.poster = video.dataset.poster;
      video.src = src;
      const attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(useStatic);
      setTimeout(() => { if (!settled) useStatic(); }, 6000);
    })
    .catch(useStatic);
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  const navbar = document.getElementById('navbar');
  onScrollFrame(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? Math.min(window.scrollY / max, 1) * 100 : 0) + '%';
  });

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const setMenu = open => {
    navLinks.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));
  navLinks.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  document.getElementById('langToggle').addEventListener('click', () => {
    switchLanguage(currentLang === 'sr' ? 'en' : 'sr');
  });

  // Delegated, because cards are redrawn on every language switch.
  document.addEventListener('click', e => {
    const joinBtn = e.target.closest('[data-join]');
    if (joinBtn) {
      e.preventDefault();
      setMenu(false);
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
    const contact = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (contact) clEvent(contact.getAttribute('href').startsWith('tel:') ? 'telefon_kliknut' : 'email_kliknut');
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

  landOnHash();
  openJoinFromUrl();
  animateCounters();
  trackSections();
  initHeroVideo();
});

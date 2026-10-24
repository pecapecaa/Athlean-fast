// ===== Shared by the subpages (the level page) =====
// Loaded after data.js and components.js, before the page's own script.

const REDUCED_MOTION = window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wireNav() {
  applyContact();
  document.addEventListener('click', e => {
    const contact = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (contact) clEvent(contact.getAttribute('href').startsWith('tel:') ? 'telefon_kliknut' : 'email_kliknut');
  });
}

function showNotFound(id, title) {
  document.getElementById(id).hidden = false;
  document.title = title + ' | ' + BRAND;
  const rail = document.getElementById('wpRail');
  if (rail) rail.hidden = true;
}

// Every join link on the page carries the context it was opened from.
function setJoinLinks(opts) {
  document.querySelectorAll('[data-join-link]').forEach(a => {
    a.href = joinHref(Object.assign({}, opts, { source: a.dataset.joinLink }));
  });
}

// Progress bar, and the rail marking whichever section owns the middle of
// the screen. One listener, at most once per frame.
function scrollChrome() {
  const bar = document.getElementById('wpProgressBar');
  const rail = document.getElementById('wpRail');
  const links = rail ? Array.from(rail.querySelectorAll('a')).filter(a => !a.hidden) : [];
  const sections = links
    .map(a => ({ a, el: document.getElementById(a.dataset.rail) }))
    .filter(s => s.el && !s.el.hidden);
  let ticking = false;

  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    const mid = window.scrollY + window.innerHeight * 0.42;
    let current = sections[0];
    sections.forEach(s => { if (s.el.offsetTop <= mid) current = s; });
    if (current) links.forEach(a => a.classList.toggle('is-active', a === current.a));
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
  if (rail) setTimeout(() => rail.classList.add('wp-rail--ready'), 700);
}

// The rail's links jump within the page without leaving #anchor behind.
function wireRail() {
  const rail = document.getElementById('wpRail');
  if (!rail) return;
  rail.addEventListener('click', e => {
    const a = e.target.closest('a[data-rail]');
    if (!a) return;
    const target = document.getElementById(a.dataset.rail);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
  });
}

// The hero fades in on a timeout as well as on frames: a stalled tab can
// skip animation frames, and a hero that never appears is a blank page.
function heroReveal() {
  const stage = document.getElementById('wpStage');
  const intro = document.querySelector('.wp-intro');
  if (!stage || !intro) return;
  intro.classList.add('wp-reveal');
  const show = () => {
    stage.classList.add('is-in');
    intro.classList.add('is-in');
  };
  requestAnimationFrame(() => requestAnimationFrame(show));
  setTimeout(show, 400);
}

// The sticky bar shows only once the hero's own join button has scrolled away.
function stickyJoinBar() {
  const anchor = document.querySelector('.wp-buy');
  const sticky = document.getElementById('wpSticky');
  if (!anchor || !sticky || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(entries => {
    const show = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
    sticky.hidden = !show;
    document.body.classList.toggle('has-sticky', show);
  }, { rootMargin: '-72px 0px 0px 0px' }).observe(anchor);
}

// Marks what should arrive on scroll, so the HTML stays a description of the
// page rather than of its choreography.
function arrivals(rise, stagger) {
  document.querySelectorAll('.wp-section .section-header').forEach(e => { e.dataset.rise = ''; });
  (rise || []).forEach(sel => document.querySelectorAll(sel).forEach(e => { e.dataset.rise = ''; }));
  (stagger || []).forEach(sel => document.querySelectorAll(sel).forEach(e => { e.dataset.stagger = ''; }));

  const targets = document.querySelectorAll('[data-rise], [data-stagger]');
  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    targets.forEach(e => e.classList.add('is-shown'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-shown');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(e => io.observe(e));
}

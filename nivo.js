// ===== Level page =====
// One page for every level: the id arrives as ?n=<id> and every section is
// written from data.js, so a level is described in exactly one place.

const FOCUS_LABELS = {
  snaga: 'Snaga',
  kondicija: 'Kondicija',
  tehnika: 'Tehnika',
  mobilnost: 'Mobilnost',
  intenzitet: 'Intenzitet'
};

// A word beside each bar, because "4 / 5" says little on its own.
const FOCUS_WORDS = ['', 'Osnovno', 'Umjereno', 'Srednje', 'Visoko', 'Maksimalno'];

function focusBar(key, value) {
  if (!value) return '';
  const dots = Array.from({ length: 5 }, (_, i) =>
    '<span class="wp-dot' + (i < value ? ' wp-dot--on' : '') + '"></span>').join('');
  return '<div class="wp-bar" role="img" aria-label="' + FOCUS_LABELS[key] + ': ' + value + ' od 5">'
    + '<div class="wp-bar-head">'
    + '<span class="wp-bar-label">' + FOCUS_LABELS[key] + '</span>'
    + '<span class="wp-bar-word">' + FOCUS_WORDS[value] + '</span>'
    + '</div>'
    + '<div class="wp-dots" aria-hidden="true">' + dots + '</div>'
    + '</div>';
}

// The clip when there is one, otherwise its poster.
function stageMedia(level) {
  const name = esc(level.name.sr);
  if (level.video) {
    return '<video id="wpVideo" src="' + esc(level.video) + '" poster="' + esc(level.poster) + '"'
      + ' controls playsinline preload="metadata" aria-label="Primjer treninga: ' + name + '"></video>';
  }
  return '<img src="' + esc(level.poster) + '" alt="Primjer treninga: ' + name + '">';
}

function render(level, detail) {
  const name = level.name.sr;
  document.title = name + ': primjer treninga | ' + BRAND;
  const description = level.desc.sr;
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', name + ': primjer treninga | ' + BRAND);
  setMeta('meta[property="og:description"]', description);
  setCanonical(levelHref(level.id));

  // ExercisePlan is what this page is: a sample plan for one level. Only
  // facts the data actually holds are emitted.
  setPageJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ExercisePlan',
    name: BRAND + ': ' + name,
    description: description,
    url: absUrl(levelHref(level.id)),
    image: absUrl(level.poster),
    activityFrequency: level.frequency.sr,
    activityDuration: level.duration,
    provider: PROVIDER
  });

  document.getElementById('wpCrumbName').textContent = name;
  document.getElementById('wpStage').innerHTML = stageMedia(level);
  document.getElementById('wpStep').textContent = 'Nivo ' + level.step;
  document.getElementById('wpName').textContent = name;
  document.getElementById('wpSubtitle').textContent = level.subtitle.sr;
  document.getElementById('wpLead').textContent = detail.lead;

  document.getElementById('wpFacts').innerHTML = [
    ['Učestalost', level.frequency.sr],
    ['Trajanje', level.duration],
    ['Oprema', level.equipment.sr]
  ].map(([k, v]) => '<div class="wp-fact"><dt>' + k + '</dt><dd>' + esc(v) + '</dd></div>').join('');

  document.getElementById('wpWorkout').innerHTML = detail.workout.map((move, i) =>
    '<li class="wp-step">'
    + '<span class="wp-step-no">' + String(i + 1).padStart(2, '0') + '</span>'
    + '<span><span class="wp-step-name">' + esc(move.name) + '</span>'
    + (move.note ? '<span class="wp-step-note">' + esc(move.note) + '</span>' : '') + '</span>'
    + '<span class="wp-step-dose">' + esc(move.dose) + '</span>'
    + '</li>').join('');

  document.getElementById('wpForYou').innerHTML = detail.forYou
    .map(line => '<li>' + ICONS.check + '<span>' + esc(line) + '</span></li>').join('');
  document.getElementById('wpNotForYou').innerHTML =
    '<span class="wp-honest-label">Nije za tebe ako</span><p>' + esc(detail.notForYou) + '</p>';

  document.getElementById('wpFocus').innerHTML = Object.keys(FOCUS_LABELS)
    .map(key => focusBar(key, detail.focus[key])).join('');

  document.getElementById('wpRelated').innerHTML = LEVELS
    .filter(l => l.id !== level.id)
    .map(l => levelCardHtml(l, 'sr')).join('');

  document.getElementById('wpStickyName').textContent = 'Nivo ' + level.step + ': ' + name;
  setJoinLinks({ level: level.id });

  const video = document.getElementById('wpVideo');
  if (video) video.addEventListener('play', () => clEvent('video_pusten'), { once: true });

  document.getElementById('levelArticle').hidden = false;
}

// The focus bars fill in when the section is reached.
function measureOnScroll() {
  const el = document.getElementById('wpFocus');
  if (!el) return;
  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    el.classList.add('is-measured');
    return;
  }
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) {
      el.classList.add('is-measured');
      obs.disconnect();
    }
  }, { threshold: 0.3 }).observe(el);
}

document.addEventListener('DOMContentLoaded', () => {
  wireNav();
  const id = new URLSearchParams(location.search).get(LEVEL_URL_PARAM);
  const level = LEVELS.find(l => l.id === id);
  const detail = level ? LEVEL_DETAILS[level.id] : null;

  if (!level || !detail) {
    showNotFound('levelNotFound', 'Nivo nije pronađen');
    return;
  }

  clTag('stranica_nivoa', level.id);
  clEvent('nivo_otvoren');
  render(level, detail);
  wireRail();
  heroReveal();
  scrollChrome(['vrh', 'fokus']);
  stickyJoinBar();
  measureOnScroll();
  arrivals(['.wp-honest', '.wp-note', '.wp-related-more'], ['#wpWorkout', '#wpForYou', '#wpRelated']);

  document.querySelectorAll('[data-scroll]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.getElementById(a.dataset.scroll);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    });
  });
});

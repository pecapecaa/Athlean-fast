// ===== Shared markup =====
// Cards drawn the same way on every page that shows them: the homepage, the
// level page ("Ostali nivoi") and the programme page ("Ostali programi").
// Loaded after data.js.

const UI_TEXT = {
  level: { sr: 'Nivo', en: 'Level' },
  sampleWorkout: { sr: 'Primjer treninga', en: 'Sample workout' },
  join: { sr: 'Pridruži se', en: 'Join' },
  details: { sr: 'Detalji', en: 'Details' },
  teaserKicker: { sr: 'Ne znaš koji je tvoj nivo?', en: 'Not sure about your level?' },
  teaserTitle: { sr: 'Odredićemo ga zajedno', en: 'We will work it out together' },
  teaserText: {
    sr: 'U online mentorstvu nivo određujemo na osnovu tvog upitnika, a plan raste kako ti napreduješ.',
    en: 'In online coaching your level comes from your questionnaire, and the plan grows as you progress.'
  },
  teaserCta: { sr: 'Pogledaj mentorstvo', en: 'See the coaching' }
};

// Text from data.js goes through this before landing in markup, so a stray
// < or & in a description can never break a card.
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const tr = (entry, lang) => (entry && (entry[lang] || entry.sr)) || '';

const svgIcon = (paths, size) =>
  '<svg width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" fill="none" '
  + 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" '
  + 'aria-hidden="true" focusable="false">' + paths + '</svg>';

const ICONS = {
  play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z"/></svg>',
  arrow: svgIcon('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  check: svgIcon('<path d="M4 12.5l5 5L20 6.5"/>', 16),
  calendar: svgIcon('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', 14),
  clock: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 14),
  form: svgIcon('<path d="M9 4h6a1 1 0 011 1v1H8V5a1 1 0 011-1z"/><path d="M16 5h2a1 1 0 011 1v14a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h2"/><path d="M9 12l2 2 4-4"/>', 28),
  plan: svgIcon('<path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/>', 28),
  track: svgIcon('<path d="M4 19h16"/><path d="M4 15l5-5 4 4 7-7"/><path d="M15 7h5v5"/>', 28)
};

function levelCardHtml(level, lang) {
  return `
    <a class="card" href="${levelHref(level.id)}" data-level="${level.id}">
      <div class="card-media">
        <img src="${esc(level.poster)}" alt="" loading="lazy" decoding="async">
      </div>
      <span class="card-badge">${esc(tr(UI_TEXT.level, lang))} ${level.step}</span>
      <div class="card-body">
        <h3>${esc(tr(level.name, lang))}</h3>
        <div class="card-sub">${esc(tr(level.subtitle, lang))}</div>
        <p class="card-desc">${esc(tr(level.desc, lang))}</p>
        <div class="card-tags">
          <span class="card-tag">${ICONS.calendar}${esc(tr(level.frequency, lang))}</span>
          <span class="card-tag">${ICONS.clock}${esc(level.duration)}</span>
        </div>
        <div class="card-footer">
          <span class="card-cta">${esc(tr(UI_TEXT.sampleWorkout, lang))}</span>
          <span class="card-play" aria-hidden="true">${ICONS.play}</span>
        </div>
      </div>
    </a>`;
}

// The last level card catches whoever went through every level without
// seeing themselves in one, and hands them to the coaching, where the level
// is worked out for them.
function levelTeaserHtml(lang, href) {
  return `
    <a class="card card--teaser" href="${href}">
      <span class="teaser-mark" aria-hidden="true">?</span>
      <div class="card-body">
        <div class="teaser-kicker">${esc(tr(UI_TEXT.teaserKicker, lang))}</div>
        <h3>${esc(tr(UI_TEXT.teaserTitle, lang))}</h3>
        <p class="card-desc">${esc(tr(UI_TEXT.teaserText, lang))}</p>
        <div class="card-footer">
          <span class="card-cta">${esc(tr(UI_TEXT.teaserCta, lang))}</span>
          <span class="card-play" aria-hidden="true">${ICONS.arrow}</span>
        </div>
      </div>
    </a>`;
}

// joinSource: on the homepage the button opens the questionnaire in place
// (data-join); on a subpage it is a link to the homepage with the programme
// already chosen.
function programCardHtml(p, lang, opts) {
  const o = opts || {};
  const price = formatPrice(p);
  const joinLabel = esc(tr(UI_TEXT.join, lang));
  const joinControl = o.asLink
    ? `<a class="btn btn-primary" href="${joinHref({ program: p.id, source: o.joinSource })}">${joinLabel}</a>`
    : `<button type="button" class="btn btn-primary" data-join="${esc(o.joinSource || 'program_kartica')}" data-program="${p.id}">${joinLabel}</button>`;
  return `
    <article class="program-card${p.featured ? ' program-card--featured' : ''}" data-program="${p.id}">
      ${p.badge ? `<span class="program-badge">${esc(tr(p.badge, lang))}</span>` : ''}
      <a class="program-media" href="${programHref(p.id)}" tabindex="-1" aria-hidden="true">
        <img src="${esc(p.image)}" alt="" loading="lazy" decoding="async">
      </a>
      <div class="program-body">
        <div class="program-duration">${esc(tr(p.duration, lang))}</div>
        <h3><a href="${programHref(p.id)}">${esc(tr(p.name, lang))}</a></h3>
        <p class="program-desc">${esc(tr(p.desc, lang))}</p>
        <ul class="program-includes">
          ${tr(p.includes, lang).map(item => `<li>${ICONS.check}<span>${esc(item)}</span></li>`).join('')}
        </ul>
        <div class="program-footer">
          ${price ? `<div class="program-price">${esc(price)}</div>` : ''}
          <div class="program-actions">
            ${joinControl}
            <a class="program-more" href="${programHref(p.id)}">${esc(tr(UI_TEXT.details, lang))}</a>
          </div>
        </div>
      </div>
    </article>`;
}

function howCardHtml(step, index, lang) {
  return `
    <div class="how-card${index === 1 ? ' featured' : ''}">
      <span class="how-step" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
      <div class="how-icon">${ICONS[step.icon] || ''}</div>
      <h3>${esc(tr(step.title, lang))}</h3>
      <p>${esc(tr(step.text, lang))}</p>
    </div>`;
}

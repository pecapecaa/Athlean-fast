// ===== Shared markup =====
// Drawn the same way on every page that shows it: the homepage and the level
// page ("Ostali nivoi"). Loaded after data.js.

const UI_TEXT = {
  level: { sr: 'Nivo', en: 'Level' },
  sampleWorkout: { sr: 'Primjer treninga', en: 'Sample workout' }
};

// Text from data.js goes through this before landing in markup, so a stray
// < or & in a description can never break a card.
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const tr = (entry, lang) => (entry && (entry[lang] || entry.sr)) || '';

const svgIcon = (paths, size) =>
  '<svg width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" fill="none" '
  + 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" '
  + 'aria-hidden="true" focusable="false">' + paths + '</svg>';

// The result and coaching icons are drawn the way ShredFast's are: a heavy
// rounded line filling the whole square, most of them inside a rounded
// square of their own. The small ones (clock, check, pin...) stay light.
const ICONS = {
  play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z"/></svg>',
  check: svgIcon('<path d="M4 12.5l5 5L20 6.5"/>', 16),
  clock: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 14),
  kettlebell: svgIcon('<path d="M8.5 9.5a3.5 3.5 0 117 0"/><path d="M9 4.5h6"/><path d="M6.5 13a5.5 5.5 0 1111 0c0 2.8-1 5-2.2 6.5H8.7C7.5 18 6.5 15.8 6.5 13z"/>', 14),
  trophy: svgIcon('<rect x="2" y="2" width="20" height="20" rx="5.5"/><path d="M9 6.5h6v4a3 3 0 0 1-6 0z"/><path d="M9 7.6H6.2v.9a3.2 3.2 0 0 0 3 3.2M15 7.6h2.8v.9a3.2 3.2 0 0 1-3 3.2M12 13.5v2.9M9.6 17.4h4.8"/>', 34),
  bolt: svgIcon('<rect x="2" y="2" width="20" height="20" rx="5.5"/><path d="M13.2 5.6 8.4 12.6h3.9l-1.5 5.8 4.8-7h-3.9z"/>', 34),
  nutrition: svgIcon('<rect x="2" y="2" width="20" height="20" rx="5.5"/><path d="M12 9.4c-1.5-1.2-4.6-.7-4.6 2.6 0 2.7 2 5.8 3.5 5.8.5 0 .7-.3 1.1-.3s.6.3 1.1.3c1.5 0 3.5-3.1 3.5-5.8 0-3.3-3.1-3.8-4.6-2.6z"/><path d="M12 9.4c0-1.3.6-2.3 1.8-2.9"/>', 34),
  plan: svgIcon('<rect x="3.5" y="4.5" width="17" height="17.5" rx="4.5"/><path d="M9 6.5V4.2A2.2 2.2 0 0 1 11.2 2h1.6A2.2 2.2 0 0 1 15 4.2v2.3z" fill="currentColor"/><path d="M9.6 12h4.8M9.6 10.6v2.8M14.4 10.6v2.8M8 12h1.6M14.4 12H16M8 16h8M8 19h5"/>', 34),
  library: svgIcon('<rect x="2" y="2" width="20" height="20" rx="5.5"/><path d="M10 8.3v7.4l5.8-3.7z"/>', 34),
  timer: svgIcon('<rect x="2" y="2" width="20" height="20" rx="5.5"/><circle cx="12" cy="12.6" r="5.2"/><path d="M12 10v2.6l1.7 1.2M10.6 5.6h2.8"/>', 34),
  calendar: svgIcon('<rect x="2" y="4" width="20" height="18" rx="5.5"/><path d="M7.5 2v4M16.5 2v4M2 9.5h20"/><path d="M8.6 15.2l2.3 2.2 4.5-4.4"/>', 34),
  pin: svgIcon('<path d="M12 21s-7-6.1-7-11.5a7 7 0 0114 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', 22)
};

function levelCardHtml(level, lang) {
  return `
    <a class="card" href="${levelHref(level.id)}" data-level="${level.id}">
      <div class="card-media">
        <img src="${esc(level.poster)}" alt="" loading="lazy" decoding="async">
        <span class="card-media-play" aria-hidden="true">${ICONS.play}</span>
      </div>
      <span class="card-badge">${esc(tr(UI_TEXT.level, lang))} ${level.step}</span>
      <div class="card-body">
        <h3>${esc(tr(level.name, lang))}</h3>
        <div class="card-sub">${esc(tr(level.subtitle, lang))}</div>
        <p class="card-desc">${esc(tr(level.desc, lang))}</p>
        <div class="card-tags">
          <span class="card-tag">${ICONS.clock}${esc(level.duration)}</span>
          <span class="card-tag">${ICONS.kettlebell}${esc(tr(level.equipment, lang))}</span>
        </div>
        <div class="card-footer">
          <span class="card-cta">${esc(tr(UI_TEXT.sampleWorkout, lang))}</span>
          <span class="card-play" aria-hidden="true">${ICONS.play}</span>
        </div>
      </div>
    </a>`;
}

// A result or a coaching feature: a big figure or an icon, a title, a line.
function featureHtml(item, lang) {
  const head = item.big
    ? `<div class="feature-big">${esc(item.big)}</div>`
    : `<div class="feature-icon">${ICONS[item.icon] || ''}</div>`;
  return `
    <div class="feature${item.big === '24/7' ? ' feature--highlight' : ''}">
      <div class="feature-head">${head}</div>
      <h3>${esc(tr(item.title, lang))}</h3>
      <p>${esc(tr(item.text, lang))}</p>
    </div>`;
}

function locationHtml(loc, lang) {
  return `
    <div class="location">
      <span class="location-icon">${ICONS.pin}</span>
      <div>
        <h3>${esc(tr(loc.name, lang))}</h3>
        <p>${esc(tr(loc.place, lang))}</p>
        <small>${esc(tr(loc.note, lang))}</small>
      </div>
    </div>`;
}

// Phone, mail, WhatsApp and Instagram live in CONTACT (data.js); every page
// marks where they go and this fills them in.
function applyContact(root) {
  const scope = root || document;
  const wa = 'https://wa.me/' + CONTACT.whatsapp + '?text='
    + encodeURIComponent('Zdravo! Pišem sa sajta, zanima me ' + BRAND + '.');
  const set = {
    phone: el => { el.textContent = CONTACT.phone; if (el.tagName === 'A') el.href = 'tel:' + CONTACT.phoneHref; },
    'phone-link': el => { el.href = 'tel:' + CONTACT.phoneHref; },
    email: el => { el.textContent = CONTACT.email; if (el.tagName === 'A') el.href = 'mailto:' + CONTACT.email; },
    instagram: el => { el.textContent = CONTACT.instagram.handle; el.href = CONTACT.instagram.url; },
    'instagram-link': el => { el.href = CONTACT.instagram.url; },
    'instagram-handle': el => { el.textContent = CONTACT.instagram.handle; },
    whatsapp: el => { el.href = wa; }
  };
  scope.querySelectorAll('[data-contact]').forEach(el => {
    const fill = set[el.dataset.contact];
    if (fill) fill(el);
  });
}

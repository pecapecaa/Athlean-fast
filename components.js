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

const ICONS = {
  play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z"/></svg>',
  check: svgIcon('<path d="M4 12.5l5 5L20 6.5"/>', 16),
  clock: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 14),
  kettlebell: svgIcon('<path d="M8.5 9.5a3.5 3.5 0 117 0"/><path d="M9 4.5h6"/><path d="M6.5 13a5.5 5.5 0 1111 0c0 2.8-1 5-2.2 6.5H8.7C7.5 18 6.5 15.8 6.5 13z"/>', 14),
  trophy: svgIcon('<path d="M8 4h8v5a4 4 0 01-8 0V4z"/><path d="M16 5h3v2a3 3 0 01-3 3M8 5H5v2a3 3 0 003 3"/><path d="M12 13v4M8.5 20h7M10 17h4"/>', 34),
  bolt: svgIcon('<path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12L13 2z"/>', 34),
  nutrition: svgIcon('<path d="M12 7c-3-2.5-8-1-8 4.5C4 16 7.5 21 10 21c.8 0 1.3-.4 2-.4s1.2.4 2 .4c2.5 0 6-5 6-9.5C20 6 15 4.5 12 7z"/><path d="M12 7c0-2 1-3.5 3-4"/>', 34),
  plan: svgIcon('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>', 34),
  library: svgIcon('<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M10 8.5v5l4.5-2.5z"/><path d="M7 21h10"/>', 34),
  timer: svgIcon('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M10 2.5h4M12 2.5V6M18.5 6.5l1.5-1.5"/>', 34),
  calendar: svgIcon('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8.5 15l2.2 2.2 4.8-4.7"/>', 34),
  drag: svgIcon('<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>', 22),
  pin: svgIcon('<path d="M12 21s-7-6.1-7-11.5a7 7 0 0114 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', 22)
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
    ? `<div class="feature-big">${esc(item.big)}</div>${item.unit ? `<div class="feature-unit">${esc(tr(item.unit, lang))}</div>` : ''}`
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
    whatsapp: el => { el.href = wa; }
  };
  scope.querySelectorAll('[data-contact]').forEach(el => {
    const fill = set[el.dataset.contact];
    if (fill) fill(el);
  });
}

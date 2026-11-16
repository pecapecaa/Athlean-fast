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
  prev: svgIcon('<path d="M15 5l-7 7 7 7"/>', 22),
  next: svgIcon('<path d="M9 5l7 7-7 7"/>', 22),
  clock: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 14),
  kettlebell: svgIcon('<path d="M8.5 9.5a3.5 3.5 0 117 0"/><path d="M9 4.5h6"/><path d="M6.5 13a5.5 5.5 0 1111 0c0 2.8-1 5-2.2 6.5H8.7C7.5 18 6.5 15.8 6.5 13z"/>', 14),
  trophy: svgIcon('<rect x="2" y="2" width="20" height="20" rx="5.5"/><path d="M9 6.5h6v4a3 3 0 0 1-6 0z"/><path d="M9 7.6H6.2v.9a3.2 3.2 0 0 0 3 3.2M15 7.6h2.8v.9a3.2 3.2 0 0 1-3 3.2M12 13.5v2.9M9.6 17.4h4.8"/>', 34),
  bolt: svgIcon('<rect x="2" y="2" width="20" height="20" rx="5.5"/><path d="M13.2 5.6 8.4 12.6h3.9l-1.5 5.8 4.8-7h-3.9z"/>', 34),
  nutrition: svgIcon('<rect x="2" y="2" width="20" height="20" rx="5.5"/><path d="M12 9.4c-1.5-1.2-4.6-.7-4.6 2.6 0 2.7 2 5.8 3.5 5.8.5 0 .7-.3 1.1-.3s.6.3 1.1.3c1.5 0 3.5-3.1 3.5-5.8 0-3.3-3.1-3.8-4.6-2.6z"/><path d="M12 9.4c0-1.3.6-2.3 1.8-2.9"/>', 34),
  plan: svgIcon('<rect x="3.5" y="4.5" width="17" height="17.5" rx="4.5"/><path d="M9 6.5V4.2A2.2 2.2 0 0 1 11.2 2h1.6A2.2 2.2 0 0 1 15 4.2v2.3z" fill="currentColor"/><path d="M9.6 12h4.8M9.6 10.6v2.8M14.4 10.6v2.8M8 12h1.6M14.4 12H16M8 16h8M8 19h5"/>', 34),
  library: svgIcon('<rect x="2" y="2" width="20" height="20" rx="5.5"/><path d="M10 8.3v7.4l5.8-3.7z"/>', 34),
  timer: svgIcon('<rect x="2" y="2" width="20" height="20" rx="5.5"/><circle cx="12" cy="12.6" r="5.2"/><path d="M12 10v2.6l1.7 1.2M10.6 5.6h2.8"/>', 34),
  calendar: svgIcon('<rect x="2" y="4" width="20" height="18" rx="5.5"/><path d="M7.5 2v4M16.5 2v4M2 9.5h20"/><path d="M8.6 15.2l2.3 2.2 4.5-4.4"/>', 34),
  whatsapp: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
  viber: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
    + '<path d="M12 2.6c-5.3 0-8.6 2.4-8.6 7.7 0 2.9 1 5 2.9 6.3v4l3.3-2.5c.8.1 1.6.2 2.4.2 5.3 0 8.6-2.5 8.6-8S17.3 2.6 12 2.6z"/>'
    + '<path d="M12.7 6.3c1.9.2 3.2 1.5 3.4 3.4M12.8 8.2c.8.1 1.3.6 1.4 1.4"/>'
    + '<path fill="#fff" stroke="none" d="M8.9 6.9c.4-.4 1-.4 1.3 0l.9 1.1c.3.4.3.9 0 1.3l-.5.5c.4 1 1.2 1.8 2.2 2.2l.5-.5c.4-.3.9-.3 1.3 0l1.1.9c.4.3.4.9 0 1.3l-.6.6c-.5.5-1.3.7-2 .4-2-.8-3.6-2.4-4.4-4.4-.3-.7-.1-1.5.4-2z"/></svg>',
  pin: svgIcon('<path d="M12 21s-7-6.1-7-11.5a7 7 0 0114 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', 22)
};

function levelCardHtml(level, lang) {
  return `
    <a class="card" href="${levelHref(level.id)}" data-level="${level.id}">
      <div class="card-media">
        <img src="${esc(level.thumb || level.poster)}" alt="" loading="lazy" decoding="async">
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

// The message button opens Viber or WhatsApp, whichever CONTACT.chat names.
const CHATS = {
  whatsapp: {
    name: 'WhatsApp',
    href: () => 'https://wa.me/' + CONTACT.chatNumber + '?text='
      + encodeURIComponent('Zdravo! Pišem sa sajta, zanima me ' + BRAND + '.'),
    newTab: true
  },
  // Viber's own address: opens the chat in the app (a new tab would be left
  // empty behind it).
  viber: { name: 'Viber', href: () => 'viber://chat?number=%2B' + CONTACT.chatNumber, newTab: false }
};

// Phone, mail, the chat app and Instagram live in CONTACT (data.js); every
// page marks where they go and this fills them in.
function applyContact(root) {
  const scope = root || document;
  const app = CHATS[CONTACT.chat] ? CONTACT.chat : 'whatsapp';
  const set = {
    phone: el => { el.textContent = CONTACT.phone; if (el.tagName === 'A') el.href = 'tel:' + CONTACT.phoneHref; },
    'phone-link': el => { el.href = 'tel:' + CONTACT.phoneHref; },
    email: el => { el.textContent = CONTACT.email; if (el.tagName === 'A') el.href = 'mailto:' + CONTACT.email; },
    instagram: el => { el.textContent = CONTACT.instagram.handle; el.href = CONTACT.instagram.url; },
    'instagram-link': el => { el.href = CONTACT.instagram.url; },
    'instagram-handle': el => { el.textContent = CONTACT.instagram.handle; },
    chat: el => {
      el.href = CHATS[app].href();
      el.dataset.app = app;
      el.setAttribute('aria-label', CHATS[app].name);
      el.innerHTML = ICONS[app];
      if (CHATS[app].newTab) { el.target = '_blank'; el.rel = 'noopener'; } else { el.removeAttribute('target'); }
    }
  };
  scope.querySelectorAll('[data-contact]').forEach(el => {
    const fill = set[el.dataset.contact];
    if (fill) fill(el);
  });
}

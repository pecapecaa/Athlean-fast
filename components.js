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
  viber: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden="true" focusable="false">'
    + '<path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546-.596-.55-3.006-2.3-8.375-2.323 0 0-.395-.025-1.037-.017zm.058 1.693c.545-.004.88.017.88.017 4.542.02 6.717 1.388 7.222 1.846 1.675 1.435 2.53 4.868 1.906 9.897v.002c-.604 4.878-4.174 5.184-4.832 5.395-.28.09-2.882.737-6.153.524 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.188-.165-.414l.02-4.018c-4.762-1.32-4.485-6.292-4.43-8.895.054-2.604.543-4.738 1.996-6.173 1.96-1.773 5.474-2.018 7.11-2.03zm.38 2.602c-.167 0-.303.135-.304.302 0 .167.133.303.3.305 1.624.01 2.946.537 4.028 1.592 1.073 1.046 1.62 2.468 1.633 4.334.002.167.14.3.307.3.166-.002.3-.138.3-.304-.014-1.984-.618-3.596-1.816-4.764-1.19-1.16-2.692-1.753-4.447-1.765zm-3.96.695c-.19-.032-.4.005-.616.117l-.01.002c-.43.247-.816.562-1.146.932-.002.004-.006.004-.008.008-.267.323-.42.638-.46.948-.008.046-.01.093-.007.14 0 .136.022.27.065.4l.013.01c.135.48.473 1.276 1.205 2.604.42.768.903 1.5 1.446 2.186.27.344.56.673.87.984l.132.132c.31.308.64.6.984.87.686.543 1.418 1.027 2.186 1.447 1.328.733 2.126 1.07 2.604 1.206l.01.014c.13.042.265.064.402.063.046.002.092 0 .138-.008.31-.036.627-.19.948-.46.004 0 .003-.002.008-.005.37-.33.683-.72.93-1.148l.003-.01c.225-.432.15-.842-.18-1.12-.004 0-.698-.58-1.037-.83-.36-.255-.73-.492-1.113-.71-.51-.285-1.032-.106-1.248.174l-.447.564c-.23.283-.657.246-.657.246-3.12-.796-3.955-3.955-3.955-3.955s-.037-.426.248-.656l.563-.448c.277-.215.456-.737.17-1.248-.217-.383-.454-.756-.71-1.115-.25-.34-.826-1.033-.83-1.035-.137-.165-.31-.265-.502-.297zm4.49.88c-.158.002-.29.124-.3.282-.01.167.115.312.282.324 1.16.085 2.017.466 2.645 1.15.63.688.93 1.524.906 2.57-.002.168.13.306.3.31.166.003.305-.13.31-.297.025-1.175-.334-2.193-1.067-2.994-.74-.81-1.777-1.253-3.05-1.346h-.024zm.463 1.63c-.16.002-.29.127-.3.287-.008.167.12.31.288.32.523.028.875.175 1.113.422.24.245.388.62.416 1.164.01.167.15.295.318.287.167-.008.295-.15.287-.317-.03-.644-.215-1.178-.58-1.557-.367-.378-.893-.574-1.52-.607h-.018z"/></svg>',
  navigate: svgIcon('<path d="M3 11l19-9-9 19-2-8-8-2z"/>', 14),
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

// A photo frame still waiting for its photo shimmers softly (.img-wait in
// styles.css) until the photo is there, so a slow connection never shows an
// empty box. Without JavaScript nothing shimmers and the photo simply comes.
const PHOTO_FRAMES = '.about-media, .card-media';

function watchPhotos(root) {
  (root || document).querySelectorAll(PHOTO_FRAMES).forEach(frame => {
    const img = frame.querySelector('img');
    if (!img || (img.complete && img.naturalWidth)) return;
    const done = () => frame.classList.remove('img-wait');
    frame.classList.add('img-wait');
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });
}

const MAP_LABEL = { sr: 'Otvori mapu', en: 'Open map' };

// A location with a map link is one big link to it, opened in a new tab so
// the site stays where the visitor left it.
function locationHtml(loc, lang) {
  const body = `
      <span class="location-icon">${ICONS.pin}</span>
      <div>
        <h3>${esc(tr(loc.name, lang))}</h3>
        <p>${esc(tr(loc.place, lang))}</p>
        <small>${esc(tr(loc.note, lang))}</small>
      </div>`;
  if (!loc.map) return `<div class="location">${body}\n    </div>`;
  return `
    <a class="location location--map" href="${esc(loc.map)}" target="_blank" rel="noopener"
       aria-label="${esc(tr(loc.name, lang) + ', ' + tr(loc.place, lang) + ': ' + tr(MAP_LABEL, lang).toLowerCase())}">${body}
      <span class="location-map">${ICONS.navigate}${esc(tr(MAP_LABEL, lang))}</span>
    </a>`;
}

// The message already typed into the chat when it opens, in the page's
// language. The visitor can change it before sending.
function chatText() {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'sr';
  return encodeURIComponent(CONTACT.chatText[lang] || CONTACT.chatText.sr);
}

// The message button opens Viber or WhatsApp, whichever CONTACT.chat names.
const CHATS = {
  whatsapp: {
    name: 'WhatsApp',
    href: () => 'https://wa.me/' + CONTACT.chatNumber + '?text=' + chatText(),
    newTab: true
  },
  // Viber's own address opens the chat in the app (a new tab would be left
  // empty behind it); draft is the text waiting in the message box.
  viber: {
    name: 'Viber',
    href: () => 'viber://chat?number=%2B' + CONTACT.chatNumber + '&draft=' + chatText(),
    newTab: false
  }
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

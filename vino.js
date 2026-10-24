// ===== Product page =====
//
// One page serving all thirteen wines: the id arrives as ?w=<id> and every
// section below is written from data.js + wine-details.js. Thirteen static
// files would have meant thirteen places to update whenever a price moves,
// which is exactly the drift the shared catalogue was extracted to prevent.

// WINE_URL_PARAM and wineHref() come from data.js, shared with the homepage.

// ---------------------------------------------------------------- cart
// The page carries its own small cart implementation rather than loading
// script.js, which is bound to homepage-only elements and would throw on
// the first missing node. Same storage key and same shape, so a bottle
// added here is in the list when the shopper returns to the homepage.

// One cart, defined once in data.js and shared with every other page, so the
// number in this header and the number on the homepage can never disagree.
let cart = CartStore.read();

function saveCart() {
  CartStore.write(cart);
  updateCartCount();
}

// The stored cart can change while this page is already on screen: another
// tab, or the page being restored from the back/forward cache when someone
// taps back. Neither re-runs this file, so the count has to be refreshed.
function syncCartFromStorage() {
  const stored = CartStore.read();
  if (CartStore.same(stored, cart)) return;
  cart = stored;
  // The badge is not renderCart's job on any of the pages, so both have to be
  // called here — redrawing the panel alone is how the number goes stale.
  renderCart();
  updateCartCount();
}
CartStore.subscribe(syncCartFromStorage);

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (el) el.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function priceOf(id) {
  const w = WINES.find(x => x.id === id);
  if (w) return w.price;
  const b = BUNDLES.find(x => x.id === id);
  return b ? b.price : 0;
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  updateCartCount();
  if (!itemsEl) return;
  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Korpa je prazna</p>';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }
  itemsEl.innerHTML = cart.map(item => {
    const src = item.isBundle
      ? BUNDLES.find(b => b.id === item.id)
      : WINES.find(w => w.id === item.id);
    if (!src) return '';
    const label = item.isBundle
      ? '<span class="cart-bundle-label">Paket</span>'
      : '<span class="cart-volume">' + src.volume + '</span>';
    return '<div class="cart-item">'
      + '<div class="cart-item-img"><img src="' + src.img + '" alt=""></div>'
      + '<div class="cart-item-info">'
      + '<h4>' + src.name.sr + ' ' + label + '</h4>'
      + '<div class="cart-item-price">' + (priceOf(item.id) * item.qty) + ' RSD</div>'
      + '<div class="cart-item-controls">'
      + '<button type="button" class="qty-btn" data-qty="-1" data-id="' + item.id + '">−</button>'
      + '<span class="qty-val">' + item.qty + '</span>'
      + '<button type="button" class="qty-btn" data-qty="1" data-id="' + item.id + '">+</button>'
      + '<button type="button" class="remove-btn" data-remove="' + item.id + '">Ukloni</button>'
      + '</div></div></div>';
  }).join('');
  const total = cart.reduce((s, i) => s + priceOf(i.id) * i.qty, 0);
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = total + ' RSD';
  if (footerEl) footerEl.style.display = 'block';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('active');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('active'), 2600);
}

function addToCart(id) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  const wine = WINES.find(w => w.id === id);
  clTag('vino', wine ? wine.name.sr : id);
  clTag('tip_artikla', 'vino');
  // Whether the product pages actually earn their keep is answerable only if
  // an add says where it happened.
  clTag('mesto_dodavanja', 'stranica_vina');
  clEvent('dodato_u_korpu');
  clEvent('u_korpu');
  showToast((wine ? wine.name.sr : 'Vino') + ' dodato u korpu');
  const btn = document.getElementById('cartBtn');
  if (btn) {
    btn.classList.remove('cart-pulse');
    void btn.offsetWidth;
    btn.classList.add('cart-pulse');
    setTimeout(() => btn.classList.remove('cart-pulse'), 600);
  }
}

// ------------------------------------------------------------- rendering
const PROFILE_LABELS = {
  telo: 'Telo',
  kiselina: 'Svežina',
  tanin: 'Tanini',
  slatkoca: 'Slatkoća',
  aroma: 'Intenzitet arome'
};

// A word beside each bar, because "4 / 5" says nothing to someone who has
// never read a tasting note — which is exactly who this page is written for.
const PROFILE_WORDS = {
  telo: ['', 'Vrlo lagano', 'Lagano', 'Srednje', 'Punije', 'Puno'],
  kiselina: ['', 'Vrlo mekо', 'Meko', 'Uravnoteženo', 'Sveže', 'Vrlo sveže'],
  tanin: ['', 'Jedva primetni', 'Blagi', 'Umereni', 'Izraženi', 'Snažni'],
  slatkoca: ['', 'Potpuno suvo', 'Suvo', 'Blago voćno', 'Poluslatko', 'Slatko'],
  aroma: ['', 'Diskretno', 'Suzdržano', 'Primetno', 'Izraženo', 'Vrlo mirisno']
};

function bar(key, value) {
  if (!value) return '';
  const dots = Array.from({ length: 5 }, (_, i) =>
    '<span class="wp-dot' + (i < value ? ' wp-dot--on' : '') + '"></span>').join('');
  return '<div class="wp-bar">'
    + '<div class="wp-bar-head">'
    + '<span class="wp-bar-label">' + PROFILE_LABELS[key] + '</span>'
    + '<span class="wp-bar-word">' + PROFILE_WORDS[key][value] + '</span>'
    + '</div>'
    + '<div class="wp-dots">' + dots + '</div>'
    + '</div>';
}

const SERVE_ICONS = {
  temp: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13.5V5a2 2 0 114 0v8.5a4 4 0 11-4 0z"/><path d="M12 8v6"/></svg>',
  glass: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10l-1 8a4 4 0 01-8 0L7 3z"/><path d="M12 15v5M9 20h6"/></svg>',
  decant: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4v4.5l3.5 5.2A5 5 0 0113 21h-2a5 5 0 01-4.5-8.3L10 7.5V3z"/></svg>',
  open: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};

function serveCard(icon, label, value, note) {
  return '<div class="wp-serve-card">'
    + '<div class="wp-serve-icon">' + SERVE_ICONS[icon] + '</div>'
    + '<div class="wp-serve-label">' + label + '</div>'
    + '<div class="wp-serve-value">' + value + '</div>'
    + (note ? '<div class="wp-serve-note">' + note + '</div>' : '')
    + '</div>';
}

const PAIRING_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'
  + '<path d="M8 2v8a2 2 0 002 2 2 2 0 002-2V2M10 12v10M16 2c-1.6 2-2 4.6-2 6.5 0 1.4.9 2.5 2 2.5s2-1.1 2-2.5C18 6.6 17.6 4 16 2z"/>'
  + '<path d="M16 11v11"/></svg>';

function relatedCard(wine) {
  return '<a class="wine-card wine-card--link fade-up" href="' + wineHref(wine.id) + '">'
    + '<div class="wine-img-wrap">'
    + '<span class="wine-type-badge">' + wine.type.sr + '</span>'
    + '<img src="' + wine.img + '" alt="' + wine.name.sr + '" loading="lazy">'
    + '</div>'
    + '<div class="wine-card-body">'
    + '<h3>' + wine.name.sr + '</h3>'
    + '<div class="wine-srb">' + wine.subtitle.sr + '</div>'
    + '<p class="wine-desc">' + wine.desc.sr + '</p>'
    + '<div class="wine-footer">'
    + '<div class="wine-price-row"><span class="wine-price">' + wine.price + ' RSD</span>'
    + '<span class="wine-volume">' + wine.volume + '</span></div>'
    + '<span class="wine-more-link">Detaljnije</span>'
    + '</div></div></a>';
}

// Same producer first, then the same quick-pick group, then the same type —
// a shopper who opened a Tvrdoš red is likelier to want the next Tvrdoš than
// a random bottle, and this orders the shortlist that way without ever
// repeating the wine already on screen.
function relatedWines(wine, detail) {
  const score = other => {
    const od = WINE_DETAILS[other.id];
    let s = 0;
    if (od && detail && od.producer === detail.producer) s += 4;
    if (other.quickTag === wine.quickTag) s += 2;
    if (other.type.sr === wine.type.sr) s += 1;
    return s;
  };
  return WINES
    .filter(w => w.id !== wine.id)
    .map(w => ({ w, s: score(w) }))
    .sort((a, b) => b.s - a.s || a.w.price - b.w.price)
    .slice(0, 4)
    .map(x => x.w);
}

function setMeta(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', value);
}

function render(wine, detail) {
  clTag('stranica_vina', wine.name.sr);
  clEvent('vino_otvoreno');
  const variety = VARIETIES[detail.variety];
  const producer = PRODUCERS[detail.producer];

  // --- head ---
  const title = wine.name.sr + ' — ' + wine.volume + ' | Hercz Wines';
  document.title = title;
  const shortDesc = wine.desc.sr.length > 155
    ? wine.desc.sr.slice(0, 152).trim() + '…'
    : wine.desc.sr;
  setMeta('meta[name="description"]', shortDesc);
  setMeta('meta[property="og:title"]', wine.name.sr + ' — Hercz Wines');
  setMeta('meta[property="og:description"]', shortDesc);
  setMeta('meta[property="og:image"]', 'https://athlean-fast.pages.dev/' + wine.img);

  setCanonical(wineHref(wine.id));

  // Structured data, built through data.js so the wine page and the bundle
  // page cannot describe the same shop in two different ways.
  setProductJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: wine.name.sr,
    sku: wine.id,
    image: absUrl(wine.img),
    description: wine.desc.sr,
    brand: { '@type': 'Brand', name: producer.name.sr },
    category: wine.type.sr === 'Belo' ? 'Belo vino'
            : (wine.type.sr === 'Crveno' ? 'Crveno vino' : 'Rosé vino'),
    offers: productOffer(wine.price, wineHref(wine.id))
  });

  // --- hero ---
  document.getElementById('wpCrumbName').textContent = wine.name.sr;
  document.getElementById('wpType').textContent = wine.type.sr;
  // The hero uses a cut-out of the bottle — same photograph with its studio
  // black turned into transparency (see tools-cutout.py) — so the bottle
  // stands in the page instead of inside a rectangle of someone else's black.
  // Only the hero: the matte makes dark glass partly transparent, which reads
  // as glass on this dark stage and as a washed-out ghost anywhere light, so
  // every other place on the site keeps the original photograph.
  const img = document.getElementById('wpImg');
  const cut = wine.img.replace(/^images\//, 'images/cut/');
  img.src = cut;
  img.alt = wine.name.sr;
  img.addEventListener('error', () => { img.src = wine.img; }, { once: true });
  document.getElementById('wpHeroBg').style.backgroundImage = 'url("' + wine.img + '")';

  document.getElementById('wpEyebrow').textContent =
    wine.type.sr + ' vino' + (detail.vintage ? ' · berba ' + detail.vintage : '');
  document.getElementById('wpName').textContent = wine.name.sr;
  document.getElementById('wpProducer').textContent =
    producer.name.sr + ' · ' + producer.place.sr;

  const tags = [];
  if (wine.tag) {
    tags.push('<span class="wine-tag" data-quick="' + wine.quickTag + '">'
      + '<span class="wf-icon">' + (TAG_ICONS[wine.tagIcon] || '') + '</span>'
      + wine.tag.sr + '</span>');
  }
  if (wine.tag2) {
    tags.push('<span class="wine-tag wine-tag--mini">'
      + '<span class="wf-icon wf-icon--mini">' + GROUP_ICON + '</span>'
      + wine.tag2.sr + '</span>');
  }
  document.getElementById('wpTags').innerHTML = tags.join('');
  document.getElementById('wpLead').textContent = detail.lead.sr;

  // Only facts we hold, and only ones not already said. Type and region were
  // in here too, which put "Crveno" directly under an eyebrow reading "Crveno
  // vino" and "Trebinje, Hercegovina" directly under the producer line that
  // already ends in it — six cells that wrapped onto two ragged rows to
  // repeat two things. Four facts fit one clean row; three when the vintage
  // is unknown, which is a shorter row rather than an invented year.
  const facts = [
    ['Sorta', variety.name.sr],
    ['Zapremina', wine.volume],
    ['Vinarija', producer.name.sr]
  ];
  if (detail.vintage) facts.splice(2, 0, ['Berba', detail.vintage]);
  document.getElementById('wpFacts').innerHTML = facts.map(([k, v]) =>
    '<div class="wp-fact"><dt>' + k + '</dt><dd>' + v + '</dd></div>').join('');

  document.getElementById('wpPrice').textContent = wine.price + ' RSD';
  document.getElementById('wpVolume').textContent = wine.volume;

  // --- taste ---
  document.getElementById('wpAromas').innerHTML = detail.aromas.sr
    .map(a => '<span class="wp-aroma">' + a + '</span>').join('');
  document.getElementById('wpOccasion').textContent = detail.occasion.sr;
  document.getElementById('wpProfile').innerHTML =
    ['telo', 'kiselina', 'tanin', 'slatkoca', 'aroma']
      .map(k => bar(k, detail.profile[k])).join('');

  // --- serving ---
  const s = detail.serve;
  const cards = [
    serveCard('temp', 'Temperatura', s.temp, 'Izvadite iz frižidera na vreme'),
    serveCard('glass', 'Čaša', s.glass.sr, 'Punite do trećine, da aroma ima prostora')
  ];
  cards.push(s.decant
    ? serveCard('decant', 'Dekantiranje', s.decant + ' min', 'Otvorite ranije da se vino otvori')
    : serveCard('decant', 'Dekantiranje', 'Nije potrebno', 'Služi se odmah po otvaranju'));
  cards.push(serveCard('open', 'Otvorena flaša', '2-3 dana', 'Zatvorena, u frižideru - i crveno'));
  document.getElementById('wpServe').innerHTML = cards.join('');

  // --- pairing ---
  document.getElementById('wpPairing').innerHTML = detail.pairing.sr
    .map(p => '<div class="wp-pair">' + PAIRING_ICON + '<span>' + p + '</span></div>').join('');

  // --- story ---
  document.getElementById('wpVarietyName').textContent = variety.name.sr;
  document.getElementById('wpVarietyText').textContent = variety.sr;
  document.getElementById('wpProducerName').textContent = producer.name.sr;
  document.getElementById('wpProducerPlace').textContent = producer.place.sr;
  document.getElementById('wpProducerText').textContent = producer.sr;

  // --- related ---
  document.getElementById('wpRelated').innerHTML =
    relatedWines(wine, detail).map(relatedCard).join('');

  // --- sticky bar ---
  document.getElementById('wpStickyName').textContent = wine.name.sr;
  document.getElementById('wpStickyPrice').textContent = wine.price + ' RSD';

  // The oversized watermark behind the bottle. The vintage where we have one,
  // otherwise the variety — never a placeholder, since a blank slot in type
  // that large would be the most obvious hole on the page.
  // A vintage is four digits and a variety can be ten letters, so a single
  // font-size cannot serve both: "2017" sat comfortably inside the stage
  // while "Žilavka" ran out from under the bottle and across the text column.
  // Sized from the character count instead, so every wine fills the same
  // width whatever its watermark says.
  document.getElementById('wineArticle').hidden = false;
}

// -------------------------------------------------------------- motion
// Everything here is decoration, so it all checks prefers-reduced-motion and
// simply does not run when someone has asked the system for less movement.
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function heroMotion() {
  const stage = document.getElementById('wpStage');
  const intro = document.querySelector('.wp-intro');
  const bottle = document.getElementById('wpImg');
  const hero = document.querySelector('.wp-hero');
  if (!stage || !intro) return;

  intro.classList.add('wp-reveal');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    stage.classList.add('is-in');
    intro.classList.add('is-in');
  }));

  if (REDUCED || !bottle) return;

  // Pointer parallax. Deliberately small: the bottle should feel like it has
  // weight and depth, not like it is sliding around the page.
  let px = 0, py = 0, tx = 0, ty = 0, raf = null;
  const drift = () => {
    px += (tx - px) * 0.08;
    py += (ty - py) * 0.08;
    bottle.style.transform = 'translate3d(' + px.toFixed(2) + 'px,' + py.toFixed(2) + 'px,0)';
    raf = Math.abs(tx - px) > 0.1 || Math.abs(ty - py) > 0.1 ? requestAnimationFrame(drift) : null;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(drift); };

  if (window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 26;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 18;
      // The transition is for the entrance; once the pointer takes over it
      // has to go, or every frame fights an 0.5s ease and the bottle lags.
      bottle.style.transition = 'none';
      kick();
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  }
}

// Scroll-linked: progress bar, the rail's active mark, and the rail flipping
// to its light palette over the two dark bands. One listener, one rAF.
function scrollChrome() {
  const bar = document.getElementById('wpProgressBar');
  const rail = document.getElementById('wpRail');
  const links = rail ? Array.from(rail.querySelectorAll('a')) : [];
  const sections = links
    .map(a => ({ a, el: document.getElementById(a.dataset.rail) }))
    .filter(s => s.el);
  const darkIds = ['vrh', 'prica'];
  let ticking = false;

  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';

    // Whichever section owns the middle of the viewport is the current one.
    const mid = window.scrollY + window.innerHeight * 0.42;
    let current = sections[0];
    for (const s of sections) {
      if (s.el.offsetTop <= mid) current = s;
    }
    if (current) {
      links.forEach(a => a.classList.toggle('is-active', a === current.a));
      if (rail) rail.classList.toggle('wp-rail--dark', darkIds.includes(current.a.dataset.rail));
    }
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
  if (rail) setTimeout(() => rail.classList.add('wp-rail--ready'), 700);
}

// The card tag icons live in script.js, which this page does not load, so the
// two it needs are repeated here rather than pulling in the whole homepage.
const TAG_ICONS = {
  barrel: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12l1.2 8L18 20H6l-1.2-8L6 4z"/><path d="M5.3 9h13.4M5.6 15h12.8"/></svg>',
  droplet: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c4 5 7 9.5 7 13a7 7 0 01-14 0c0-3.5 3-8 7-13z"/></svg>',
  flower: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2.6"/><circle cx="12" cy="5.5" r="2.6"/><circle cx="12" cy="18.5" r="2.6"/><circle cx="5.5" cy="12" r="2.6"/><circle cx="18.5" cy="12" r="2.6"/></svg>',
  glass: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10l-1 7.5a4 4 0 01-8 0L7 3z"/><path d="M12 14.5V21M8 21h8"/></svg>',
  sun: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  heart: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.4-4.6-10-9.2C.4 8 2.3 4 6.2 4c2.2 0 3.8 1.2 5.8 3.6C14 5.2 15.6 4 17.8 4c3.9 0 5.8 4 4.2 7.8-2.6 4.6-10 9.2-10 9.2z"/></svg>',
  layers: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  flame: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c4 0 7-2.8 7-6.7 0-3.4-2.3-5.7-3.5-8.3-.8 2-1.5 3-1.5 4.7 0-2.6-1.2-4.4-2-5.7-2.6 2.6-4 5.3-4 7.6C8 19.2 9.6 22 12 22z"/></svg>',
  house: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/></svg>',
  feather: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4c-6.5 0-15 4-16 13.5C6 15.5 9 13 12 12.5"/><line x1="20" y1="4" x2="7" y2="17"/></svg>',
  ribbon: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12L4 5.5v13L12 12z"/><path d="M12 12l8-6.5v13L12 12z"/></svg>'
};

const GROUP_ICON =
  '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
  + '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/>'
  + '<circle cx="17" cy="9" r="2.4"/><path d="M14.5 14.3c2.7.4 4.5 2.6 4.5 5.7"/>'
  + '</svg>';

// ------------------------------------------------------------------ boot
document.addEventListener('DOMContentLoaded', function() {
  const id = new URLSearchParams(location.search).get(WINE_URL_PARAM);
  const wine = WINES.find(w => w.id === id);
  const detail = wine ? WINE_DETAILS[wine.id] : null;

  if (!wine || !detail) {
    document.getElementById('wineNotFound').hidden = false;
    document.title = 'Vino nije pronađeno — Hercz Wines';
    renderCart();
    wireChrome();
    return;
  }

  render(wine, detail);
  renderCart();
  wireChrome();
  heroMotion();
  scrollChrome();

  document.getElementById('wpAdd').addEventListener('click', () => addToCart(wine.id));
  document.getElementById('wpStickyAdd').addEventListener('click', () => addToCart(wine.id));

  // The sticky bar only earns its space once the real buy button is gone.
  const buyBar = document.querySelector('.wp-buy');
  const sticky = document.getElementById('wpSticky');
  if (buyBar && sticky && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      sticky.hidden = entries[0].isIntersecting;
    }, { rootMargin: '-72px 0px 0px 0px' }).observe(buyBar);
  }

  revealOnScroll();
  measureOnScroll();
  arrivals();
  heroParallax();
});

function wireChrome() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    // .active is what styles.css actually styles for this row — matches the
    // homepage's own toggle in script.js exactly, rather than inventing a
    // parallel class name that nothing draws.
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  const cartBtn = document.getElementById('cartBtn');
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const close = document.getElementById('cartClose');
  // Same .active class script.js's setPanelOpen() uses on the homepage. The
  // sidebar's visibility, transform and opacity are all keyed off it in
  // styles.css — cart-sidebar--open / cart-overlay--visible do not exist
  // there, so the cart button previously dropped `inert` but never made the
  // panel actually appear.
  const open = () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    sidebar.removeAttribute('inert');
  };
  const shut = () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    sidebar.setAttribute('inert', '');
  };
  if (cartBtn) cartBtn.addEventListener('click', open);
  if (close) close.addEventListener('click', shut);
  if (overlay) overlay.addEventListener('click', shut);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });

  // Quantity and remove are delegated: the rows are rewritten on every
  // change, so per-row listeners would be re-bound constantly.
  const items = document.getElementById('cartItems');
  if (items) {
    items.addEventListener('click', e => {
      const qty = e.target.closest('[data-qty]');
      if (qty) {
        const item = cart.find(i => i.id === qty.dataset.id);
        if (item) {
          item.qty += Number(qty.dataset.qty);
          if (item.qty <= 0) cart = cart.filter(i => i.id !== item.id);
          saveCart();
          renderCart();
        }
        return;
      }
      const rm = e.target.closest('[data-remove]');
      if (rm) {
        cart = cart.filter(i => i.id !== rm.dataset.remove);
        saveCart();
        renderCart();
      }
    });
  }

  // No scroll-triggered navbar state here: .navbar--solid is applied
  // unconditionally in the markup below, since this page has no transparent
  // hero for the bar to start over. The homepage toggles a scrolled state
  // for exactly that transition; this page never needs it.
}

// The five profile marks fill in when the section is reached, rather than
// being complete before anyone looks. It is the one number-shaped thing on
// the page, and watching it land is what makes it register as a reading.
function measureOnScroll() {
  const profile = document.getElementById('wpProfile');
  if (!profile) return;
  if (REDUCED || !('IntersectionObserver' in window)) {
    profile.classList.add('is-measured');
    return;
  }
  new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-measured');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.35 }).observe(profile);
}

// Marks up what should arrive and how. Kept here rather than in the markup
// so the HTML stays a description of the page and not of its choreography.
const RISE = [
  '.wp-taste .wp-aromas', '.wp-taste .wp-profile',
  '.wp-serve-sec .wp-disclaimer', '.wp-related-more'
];
const STAGGER = [
  '#wpAromas', '#wpServe', '#wpPairing', '.wp-story-grid'
];

function arrivals() {
  document.querySelectorAll('.wp-section .section-header').forEach(e => e.dataset.rise = '');
  RISE.forEach(sel => document.querySelectorAll(sel).forEach(e => e.dataset.rise = ''));
  STAGGER.forEach(sel => document.querySelectorAll(sel).forEach(e => e.dataset.stagger = ''));

  const targets = document.querySelectorAll('[data-rise], [data-stagger]');
  if (REDUCED || !('IntersectionObserver' in window)) {
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
    // rootMargin lifts the trigger line off the very bottom edge, so things
    // are already moving by the time they are properly in view rather than
    // starting the instant they clip the fold.
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(e => io.observe(e));
}

// Hands the scroll position to CSS as a 0-1 value across the first screen.
// A custom property rather than inline styles keeps the whole parallax
// declarative, and the handler stays a single variable write per frame.
function heroParallax() {
  const hero = document.querySelector('.wp-hero');
  if (!hero || REDUCED) return;
  document.body.classList.add('wp-hero-parallax');
  let ticking = false;
  const set = () => {
    ticking = false;
    const h = hero.offsetHeight || window.innerHeight;
    document.body.style.setProperty('--wp-scroll',
      Math.min(1, Math.max(0, window.scrollY / h)).toFixed(4));
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(set); }
  }, { passive: true });
  set();
}

function revealOnScroll() {
  const els = document.querySelectorAll('.fade-up');
  if (!('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(e => io.observe(e));
}

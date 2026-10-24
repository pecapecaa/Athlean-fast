// ===== Bundle page =====
//
// One page serving all three bundles: the id arrives as ?p=<id> and every
// section is written from data.js + bundle-details.js, for the same reason the
// wine page is — three static files would be three places a price could drift.
//
// The page answers a different question from the wine page. A wine page
// describes what is in the glass; this one has to settle whether the box is
// for you, so the argument runs: who it suits, what is inside and why each
// bottle earned its place, the order to open them in, and how it arrives.
//
// BUNDLE_URL_PARAM / bundleHref() and wineHref() come from data.js.

// ---------------------------------------------------------------- cart
// Same small implementation the wine page carries, and the same storage key:
// a box added here is in the cart when the shopper returns to the homepage.

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
      + '<div class="cart-item-img"><img src="' + src.img + '" alt="" decoding="async"></div>'
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

function addBundleToCart(id) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1, isBundle: true });
  saveCart();
  renderCart();
  const b = BUNDLES.find(x => x.id === id);
  clTag('paket', b ? b.name.sr : id);
  clTag('tip_artikla', 'paket');
  clTag('mesto_dodavanja', 'stranica_paketa');
  clEvent('paket_u_korpu');
  clEvent('u_korpu');
  showToast((b ? b.name.sr : 'Paket') + ' dodat u korpu');
  const btn = document.getElementById('cartBtn');
  if (btn) {
    btn.classList.remove('cart-pulse');
    void btn.offsetWidth;
    btn.classList.add('cart-pulse');
    setTimeout(() => btn.classList.remove('cart-pulse'), 600);
  }
}

// ------------------------------------------------------------- rendering
const CHECK_ICON =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
  + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<path d="M4 12.5l5 5L20 6.5"/></svg>';

const SHIP_STEPS = [
  {
    icon: '<path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>',
    title: 'Dostava širom Srbije',
    text: 'Za 2 do 4 dana. U Beogradu i Novom Sadu dostavljamo lično.'
  },
  {
    icon: '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>',
    title: 'Plaćanje pouzećem',
    text: 'Platite kuriru kada paket stigne. Ništa se ne plaća unapred.'
  },
  {
    icon: '<path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>',
    title: 'Spremno za poklon',
    text: 'Jedna kutija, flaše zaštićene pojedinačno. Ne treba ništa dodatno.'
  }
];

function shipCard(step) {
  return '<div class="pk-ship-card">'
    + '<span class="pk-ship-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" '
    + 'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" '
    + 'aria-hidden="true">' + step.icon + '</svg></span>'
    + '<h3 class="pk-ship-title">' + step.title + '</h3>'
    + '<p>' + step.text + '</p>'
    + '</div>';
}

// A bottle inside the box: its own photograph, the reason it is here, and a
// way through to its full page. The reason is the point — a list of names is
// a manifest, and a manifest does not persuade anybody of anything.
function bottleCard(wine, reason, index) {
  return '<a class="pk-bottle" href="' + wineHref(wine.id) + '">'
    + '<span class="pk-bottle-no">' + String(index + 1).padStart(2, '0') + '</span>'
    + '<span class="pk-bottle-img"><img src="' + wine.img + '" alt="' + wine.name.sr
    + '" loading="lazy" decoding="async"></span>'
    + '<span class="pk-bottle-body">'
    + '<span class="pk-bottle-type">' + wine.type.sr + ' &middot; ' + wine.volume + '</span>'
    + '<span class="pk-bottle-name">' + wine.name.sr + '</span>'
    + '<span class="pk-bottle-why">' + reason + '</span>'
    + '<span class="pk-bottle-link">Cela priča o ovom vinu'
    + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M5 12h14M13 6l6 6-6 6"/></svg></span>'
    + '</span></a>';
}

function orderStep(step, index) {
  const wine = WINES.find(w => w.id === step.id);
  if (!wine) return '';
  return '<li class="pk-order-step">'
    + '<span class="pk-order-mark">' + (index + 1) + '</span>'
    + '<span class="pk-order-body">'
    + '<span class="pk-order-name">' + wine.name.sr + '</span>'
    + '<span class="pk-order-note">' + step.note.sr + '</span>'
    + '</span></li>';
}

// The other bundles, drawn as the homepage draws them so the row is familiar
// rather than a third variation on the same card.
function relatedBundle(b) {
  const count = b.count + (b.count >= 5 ? ' flaša' : ' flaše');
  return '<a class="wine-card pk-related-card ' + b.id + '" href="' + bundleHref(b.id) + '">'
    + '<div class="wine-img-wrap">'
    + '<div class="bundle-badges"><span class="wine-type-badge">' + count + '</span></div>'
    + '<img src="' + b.img + '" alt="' + b.name.sr + '" loading="lazy" decoding="async">'
    + '</div>'
    + '<div class="wine-card-body">'
    + '<h3>' + b.name.sr + '</h3>'
    + '<div class="wine-srb">' + b.subtitle.sr + '</div>'
    + '<p class="wine-desc">' + b.desc.sr + '</p>'
    + '<div class="wine-footer"><span class="wine-price">' + b.price + ' RSD</span></div>'
    + '</div></a>';
}

function setMeta(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', value);
}

function render(bundle, detail) {
  clTag('stranica_paketa', bundle.name.sr);
  clEvent('paket_otvoren');
  const bottles = bundle.wines
    .map(id => WINES.find(w => w.id === id))
    .filter(Boolean);

  document.title = bundle.name.sr + ' — Hercz paket';
  const metaDesc = detail ? detail.promise.sr : bundle.desc.sr;
  setMeta('meta[name="description"]', metaDesc);
  setMeta('meta[property="og:title"]', bundle.name.sr + ' — Hercz Wines');
  setMeta('meta[property="og:description"]', metaDesc);
  setMeta('meta[property="og:image"]', absUrl(bundle.img));
  setCanonical(bundleHref(bundle.id));

  // A bundle is a product in its own right — it has its own price, its own
  // photograph and its own page — so it gets its own record rather than
  // being left out because it is not a single bottle. The bottles inside it
  // are named as parts, which is what isAccessoryOrSparePartFor cannot say
  // and hasPart can.
  setProductJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: bundle.name.sr,
    sku: bundle.id,
    image: absUrl(bundle.img),
    description: metaDesc,
    brand: { '@type': 'Brand', name: 'Hercz Wines' },
    category: 'Paket vina',
    hasPart: bottles.map(w => ({
      '@type': 'Product',
      name: w.name.sr,
      sku: w.id,
      url: absUrl(wineHref(w.id))
    })),
    offers: productOffer(bundle.price, bundleHref(bundle.id))
  });

  document.getElementById('wpCrumbName').textContent = bundle.name.sr;
  document.getElementById('wpCount').textContent =
    bundle.count + (bundle.count >= 5 ? ' flaša' : ' flaše');
  document.getElementById('wpEyebrow').textContent = 'Hercz paket';
  document.getElementById('wpName').textContent = bundle.name.sr;
  document.getElementById('wpSubtitle').textContent = bundle.subtitle.sr;
  document.getElementById('wpPromise').textContent =
    detail ? detail.promise.sr : bundle.desc.sr;

  document.getElementById('wpManifest').innerHTML = bottles
    .map(w => '<li>' + CHECK_ICON + '<span>' + w.name.sr
      + ' <em>' + w.volume + '</em></span></li>').join('');

  document.getElementById('wpPrice').textContent = bundle.price + ' RSD';
  document.getElementById('wpPer').textContent =
    Math.round(bundle.price / bundle.count) + ' RSD po flaši';
  // Gated on a real difference, the same way the catalogue card is: priced at
  // the sum of its bottles, the box shows one price and no strike.
  document.getElementById('wpWas').textContent =
    bundle.saving > 0 ? bundle.originalPrice + ' RSD' : '';

  // The free-delivery line is only shown where it is true, so it never
  // promises something the total does not earn.
  const assurances = [
    ['<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>', 'Plaćanje pouzećem'],
    ['<path d="M12 3l7.5 3.5v5c0 4.3-3.1 8.1-7.5 9.5-4.4-1.4-7.5-5.2-7.5-9.5v-5L12 3z"/>', 'Direktno od vinara']
  ];
  if (bundle.price >= 4000) {
    assurances.unshift([SHIP_STEPS[0].icon, 'Besplatna dostava']);
  } else {
    assurances.unshift([SHIP_STEPS[0].icon, 'Dostava širom Srbije']);
  }
  document.getElementById('wpAssurances').innerHTML = assurances
    .map(([d, label]) => '<li><svg width="17" height="17" viewBox="0 0 24 24" fill="none" '
      + 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" '
      + 'aria-hidden="true">' + d + '</svg><span>' + label + '</span></li>').join('');

  const img = document.getElementById('wpImg');
  img.src = bundle.img;
  img.alt = bundle.name.sr;
  document.getElementById('wpHeroBg').style.backgroundImage = 'url("' + bundle.img + '")';

  document.getElementById('wpStickyName').textContent = bundle.name.sr;
  document.getElementById('wpStickyPrice').textContent = bundle.price + ' RSD';

  if (detail) {
    document.getElementById('wpForYou').innerHTML = detail.forYou.sr
      .map(line => '<li>' + CHECK_ICON + '<span>' + line + '</span></li>').join('');
    document.getElementById('wpNotForYou').innerHTML =
      '<span class="pk-honest-label">Nije za vas ako</span><p>' + detail.notForYou.sr + '</p>';
    document.getElementById('wpWhy').textContent = detail.why.sr;
    document.getElementById('wpBottles').innerHTML = bottles
      .map((w, i) => bottleCard(w, detail.contents[w.id]
        ? detail.contents[w.id].sr : w.desc.sr, i)).join('');
    document.getElementById('wpOrder').innerHTML = detail.order.map(orderStep).join('');
    document.getElementById('wpGift').textContent = detail.gift.sr;
  } else {
    // No written copy for this bundle yet: the page still stands on the
    // catalogue text rather than showing empty sections.
    document.getElementById('wpWhy').textContent = bundle.desc.sr;
    document.getElementById('wpBottles').innerHTML = bottles
      .map((w, i) => bottleCard(w, w.desc.sr, i)).join('');
    ['za-koga', 'redosled'].forEach(id => {
      const sec = document.getElementById(id);
      if (sec) sec.hidden = true;
      const rail = document.querySelector('[data-rail="' + id + '"]');
      if (rail) rail.hidden = true;
    });
  }

  document.getElementById('wpShip').innerHTML = SHIP_STEPS.map(shipCard).join('');

  const others = BUNDLES.filter(b => b.id !== bundle.id);
  document.getElementById('wpRelated').innerHTML = others.map(relatedBundle).join('');

  document.getElementById('bundleArticle').hidden = false;
}

// The stage starts at opacity 0 in vino.css and only the `is-in` class brings
// it up. The wine page schedules that inside a double requestAnimationFrame;
// here it gets a timeout as well, because a hero photograph that never fades
// in is a blank page, and a frame callback is one of the things that does not
// always arrive — a stalled tab, a reduced-motion engine, an odd browser.
// Whichever fires first wins; adding the class twice costs nothing.
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

// -------------------------------------------------------------- chrome
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', function() {
  const id = new URLSearchParams(location.search).get(BUNDLE_URL_PARAM);
  const bundle = BUNDLES.find(b => b.id === id);

  if (!bundle) {
    document.getElementById('bundleNotFound').hidden = false;
    document.title = 'Paket nije pronađen — Hercz Wines';
    renderCart();
    wireChrome();
    return;
  }

  render(bundle, BUNDLE_DETAILS[bundle.id] || null);
  renderCart();
  wireChrome();
  heroReveal();
  scrollChrome();

  document.getElementById('wpAdd').addEventListener('click', () => addBundleToCart(bundle.id));
  document.getElementById('wpStickyAdd').addEventListener('click', () => addBundleToCart(bundle.id));

  const buyBar = document.querySelector('.wp-buy');
  const sticky = document.getElementById('wpSticky');
  if (buyBar && sticky && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      sticky.hidden = entries[0].isIntersecting;
    }, { rootMargin: '-72px 0px 0px 0px' }).observe(buyBar);
  }

  arrivals();
  heroParallax();
});

function wireChrome() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
  }

  const cartBtn = document.getElementById('cartBtn');
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const close = document.getElementById('cartClose');
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
}

function scrollChrome() {
  const bar = document.getElementById('wpProgressBar');
  const rail = document.getElementById('wpRail');
  const links = rail ? Array.from(rail.querySelectorAll('a')).filter(a => !a.hidden) : [];
  const sections = links
    .map(a => ({ a, el: document.getElementById(a.dataset.rail) }))
    .filter(s => s.el && !s.el.hidden);
  const darkIds = ['vrh', 'unutra'];
  let ticking = false;

  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';

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

const RISE = ['.pk-honest', '.pk-why', '.wp-related-more', '.pk-gift'];
const STAGGER = ['#wpForYou', '#wpBottles', '#wpOrder', '#wpShip', '#wpRelated'];

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
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(e => io.observe(e));
}

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

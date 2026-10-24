// TODO: upisati mail na koji stižu upiti (FormSubmit traži jednokratnu potvrdu na tom mailu).
const RECIPIENT_EMAIL = 'upiti@example.com';
const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/' + RECIPIENT_EMAIL;
let currentLang = 'sr';

// Prices are set, charged and recorded in dinars — the order that reaches the
// inbox is always in RSD, whichever page the buyer was reading. The euro
// figure exists so a visitor on the English page knows roughly what a bottle
// costs, and it is written with a ≈ so it never reads as a second, exact
// price. Where it matters — the cart and the reservation summary — the dinar
// amount is spelled out beside it as the sum actually collected at the door.
// PROVERITI: srednji kurs NBS. Jedini broj koji treba menjati kad kurs pomeri.
const RSD_PER_EUR = 117.5;

function fmtPrice(rsd) {
  if (currentLang === 'sr') return rsd + ' RSD';
  return '≈ €' + (rsd / RSD_PER_EUR).toFixed(2);
}

// The dinar sum, for the two places the buyer is committing to an amount.
// Empty in Serbian, where the price on screen is already that sum.
function chargedNote(rsd) {
  if (currentLang === 'sr') return '';
  return 'Charged in dinars: ' + rsd + ' RSD';
}

// Four corners pushing outward: the panel it opens is the card at full size.
const MORE_ICON =
  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
  + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
  + '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>'
  + '<line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>'
  + '</svg>';

// The four "Brzi izbor" glyphs (sun/star/leaf/crown) only say which bucket a
// wine sits in, not what it actually tastes like. The card's own tag speaks
// for the wine itself, so each gets an icon drawn from its own tag's theme —
// two wines only ever share an icon when they also share the exact same tag
// text (the 0.75L/1L sibling pairs).
const TAG_THEME_ICONS = {
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

function tagChip(wine, lang) {
  if (!wine.tag || !wine.quickTag) return '';
  const icon = TAG_THEME_ICONS[wine.tagIcon] || '';
  return '<span class="wine-tag" data-quick="' + wine.quickTag + '">'
    + '<span class="wf-icon">' + icon + '</span>' + wine.tag[lang] + '</span>';
}

// Only the 1L Blatina and Žilavka carry this — same wine, same taste tag as
// their 0.75L sibling, so nothing on the card said the bigger bottle is
// meant for a bigger table. A small second badge, not a second full tag.
const GROUP_ICON =
  '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
  + '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/>'
  + '<circle cx="17" cy="9" r="2.4"/><path d="M14.5 14.3c2.7.4 4.5 2.6 4.5 5.7"/>'
  + '</svg>';

function tag2Chip(wine, lang) {
  if (!wine.tag2) return '';
  return '<span class="wine-tag wine-tag--mini">'
    + '<span class="wf-icon wf-icon--mini">' + GROUP_ICON + '</span>' + wine.tag2[lang] + '</span>';
}

// The same trolley the header and the product page use. It was a shopping
// bag here and a trolley there, which put two glyphs for one basket on the
// same journey — the trolley wins because it is the one people read as "buy"
// without looking.
const CART_ICON =
  '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
  + 'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
  + '<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/>'
  + '<path d="M1.5 2h2.6l2.5 12.1a1.8 1.8 0 001.8 1.4h8.9a1.8 1.8 0 001.8-1.4L21 6H5.2"/>'
  + '</svg>';

// Bundles at or above this carry the free-delivery mark.
const FREE_SHIPPING_FROM = 4000;

// The same delivery truck the "Zašto mi" section uses, so the mark on a
// bundle and the promise further down the page read as one claim.
const SHIP_ICON =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
  + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 '
  + '01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 '
  + '1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 '
  + '18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 '
  + '1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>';

// The age gate was remembered in sessionStorage, which is per tab. Open a
// bottle in a new tab, click "Vina" from there, and that tab had never been
// answered — so the customer was asked their age again, in the middle of
// shopping, after already answering it. localStorage is shared across tabs
// and is what "I already told you" means to a person.
//
// Thirty days rather than forever: long enough that nobody is asked twice in
// the same shopping trip, short enough that a shared or public computer does
// not stay answered indefinitely.
const AGE_KEY = 'hercegAge';
const AGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function ageConfirmed() {
  try {
    const at = Number(localStorage.getItem(AGE_KEY));
    if (at && Date.now() - at <= AGE_TTL_MS) return true;
  } catch (err) {
    // Storage unavailable — fall through to the per-tab record below.
  }
  try {
    return sessionStorage.getItem('ageVerified') === '1';
  } catch (err) {
    return false;
  }
}

function rememberAge() {
  try {
    localStorage.setItem(AGE_KEY, String(Date.now()));
  } catch (err) {
    // Private mode or quota. The session record below still covers this tab,
    // which is no worse than the behaviour this replaced.
  }
  try {
    sessionStorage.setItem('ageVerified', '1');
  } catch (err) {
    // Nothing left to remember it with; the gate will ask again next time.
  }
}

// Reading and writing the cart is CartStore's job (data.js), shared with the
// wine and bundle pages so all three can never disagree about what is in it.
let cart = CartStore.read();

// The stored cart changed under a page that is already on screen — another
// tab, or this page coming back from the back/forward cache. Re-read it and
// redraw, skipping the redraw when nothing actually differs.
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

// ===== Render Wines =====
let activeWineFilter = 'all';
// Independent of the type filter — a shopper can combine "Nešto drugačije"
// with "Belo" and land on exactly the one wine that is both, same as the
// two rows read as separate questions in the design.
// Matches the pill already marked wf-btn--active in the markup — the two
// have to agree, or the button shows selected while the grid renders
// everything, or the wines section opens twice as tall as it needs to.
let activeQuickFilter = 'preporuka';

// Thirteen wines spread over four quick tags x three types leaves about one
// wine per cell, so empty combinations are arithmetic rather than accident:
// four of the twelve are empty, three of them because there is exactly one
// rose in the catalogue.
//
// The two rows are not peers. The quick row is the primary choice — picking
// one is a fresh look at the catalogue — and the type row refines whatever it
// selected. That ranking does the work:
//
//   - Choosing a quick tag clears the type filter (see the click handler), so
//     a quick pill always lands on that tag's whole group. Every group has
//     wines, so the quick row can never reach an empty grid and never needs
//     disabling. It stays fully tappable, which is what a primary control
//     should be.
//   - Only the type row can produce an empty combination, so only it disables
//     its zeroes.
//
// Either way the number on a pill is exactly what tapping it would show, which
// is what makes a 0 both the count and the reason the pill is unavailable.
function updateFilterCounts() {
  const quickRow = document.getElementById('quickFilters');
  const typeRow = document.getElementById('wineFilters');
  if (!quickRow || !typeRow) return;

  typeRow.querySelectorAll('.wf-btn').forEach(btn => {
    const t = btn.dataset.filter;
    const n = WINES.filter(w =>
      (t === 'all' || w.type.sr === t) &&
      (activeQuickFilter === 'all' || w.quickTag === activeQuickFilter)
    ).length;
    const el = btn.querySelector('.wf-count');
    if (el) el.textContent = n;
    // The active pill is never disabled even at zero — that would trap the
    // selection with nothing left to tap out of.
    btn.disabled = n === 0 && !btn.classList.contains('wf-btn--active');
  });

  quickRow.querySelectorAll('.wf-btn').forEach(btn => {
    // Its full total, not a count narrowed by the type row: tapping it drops
    // the type filter, so the total is genuinely where you land.
    const n = WINES.filter(w => w.quickTag === btn.dataset.quick).length;
    const el = btn.querySelector('.wf-count');
    if (el) el.textContent = n;
    btn.disabled = false;
  });
}

function renderWines() {
  const grid = document.getElementById('winesGrid');
  const list = WINES.filter(w =>
    (activeWineFilter === 'all' || w.type.sr === activeWineFilter) &&
    (activeQuickFilter === 'all' || w.quickTag === activeQuickFilter)
  );
  updateFilterCounts();
  // The rail always ends with the bundle card below, so it can never hold a
  // single card any more — the lone-card width rule it used to need is gone
  // with it.
  const addLabel = currentLang === 'sr' ? 'Dodaj u korpu' : 'Add to cart';
  const moreLabel = currentLang === 'sr' ? 'Prikaži detalje' : 'Show details';
  grid.innerHTML = list.map(wine => `
    <div class="wine-card fade-up" data-wine-page="${wineHref(wine.id)}">
      <div class="wine-img-wrap">
        <span class="wine-type-badge">${wine.type[currentLang]}</span>
        <img src="${wine.img}" alt="${wine.name[currentLang]}" loading="lazy" decoding="async">
      </div>
      <a class="wine-more" href="${wineHref(wine.id)}" aria-label="${wine.name[currentLang]}: ${moreLabel}" title="${moreLabel}">${MORE_ICON}</a>
      <div class="wine-card-body">
        <h3>${wine.name[currentLang]}</h3>
        <div class="wine-srb">${wine.subtitle[currentLang]}</div>
        <p class="wine-desc">${wine.desc[currentLang]}</p>
        <div class="wine-tag-group">${tagChip(wine, currentLang)}${tag2Chip(wine, currentLang)}</div>
        <div class="wine-footer">
          <div class="wine-price-row"><span class="wine-price">${fmtPrice(wine.price)}</span><span class="wine-volume">${wine.volume}</span></div>
          <button type="button" class="wine-add" data-id="${wine.id}" aria-label="${addLabel}" title="${addLabel}">${CART_ICON}</button>
        </div>
      </div>
    </div>
  `).join('') + bundleTeaserCard(currentLang);
  // Scoped to this grid, not the document. A bundle's add button carries
  // `wine-add` too, so the unscoped search also bound every bundle card to
  // addToCart — with a wine id of undefined, since bundles carry
  // data-bundle-id. Nothing broke only because the bundle's own handler runs
  // first and raises the busy flag this one checks; meanwhile a fresh copy of
  // the listener was added to each bundle on every filter tap, because those
  // cards are not the ones being re-rendered here.
  grid.querySelectorAll('.wine-add').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.id));
  });
  observeFadeElements();
}

// The last card in the rail is not a wine. Someone who has swiped to the end
// of the range without adding anything is, by definition, undecided — and the
// bundles are two sections further down where they will never look. This puts
// the offer at the moment the hesitation actually happens, inside the thing
// they are already using, rather than behind another button on the screen.
function bundleTeaserCard(lang) {
  const isSr = lang === 'sr';
  // Whichever bundle is marked featured, falling back to the first: the data
  // decides which one is shown here, not this function.
  const b = BUNDLES.find(x => x.featured) || BUNDLES[0];
  if (!b) return '';
  return `
    <a class="wine-card wine-card--teaser fade-up" href="#bundles">
      <div class="wine-img-wrap">
        <img src="${b.img}" alt="" loading="lazy" decoding="async">
      </div>
      <div class="wine-card-body">
        <div class="teaser-kicker">${isSr ? 'Ne možete da izaberete?' : 'Cannot decide?'}</div>
        <h3>${isSr ? 'Uzmite paket' : 'Take a bundle'}</h3>
        <p class="wine-desc">${isSr
          ? BUNDLES.length + ' gotova izbora, složena tako da se vina dopunjuju.'
          : BUNDLES.length + ' ready-made selections, put together so the wines complement each other.'}</p>
        <div class="wine-footer">
          <span class="teaser-cta">${isSr ? 'Pogledaj pakete' : 'See the bundles'}</span>
          <span class="teaser-arrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
        </div>
      </div>
    </a>
  `;
}

// ===== Render Bundles =====
function renderBundles() {
  const grid = document.getElementById('bundlesGrid');
  if (!grid) return;
  const isSr = currentLang === 'sr';
  grid.innerHTML = BUNDLES.map(function(bundle) {
    // No saving badge on the card any more. The struck-through price says the
    // same thing in the place where the decision is made, and a discount
    // sticker across a bottle photograph reads as a supermarket shelf.
    // Still gated on a real saving: with none, a struck-through price would
    // be claiming a discount that is not there.
    const hasSaving = bundle.saving > 0;
    const originalPrice = hasSaving
      ? '<span class="bundle-original">' + fmtPrice(bundle.originalPrice) + '</span>'
      : '';
    const featured = bundle.featured ? ' bundle-card--featured' : '';
    // The ribbon is the bundle's own label rather than a fixed one for the
    // featured card, because the entry bundle needs to say a different thing:
    // not that most people take it, but that it is where to start. Only the
    // featured card gets the solid gold, so the two do not compete.
    const topBadge = bundle.badge
      ? '<div class="bundle-top-badge' + (bundle.featured ? '' : ' bundle-top-badge--soft')
        + '">' + bundle.badge[currentLang] + '</div>'
      : '';
    const countLabel = bundle.count + (isSr ? (bundle.count >= 5 ? ' flaša' : ' flaše') : ' btl.');
    const btnLabel = isSr ? 'Dodaj paket u korpu' : 'Add bundle to cart';
    const moreLabel = isSr ? 'Prikaži detalje' : 'Show details';

    // Free delivery is called out from this threshold up.
    const freeShip = bundle.price >= FREE_SHIPPING_FROM
      ? '<div class="bundle-ship">'
        + SHIP_ICON
        + '<span>' + (isSr ? 'Besplatna dostava' : 'Free delivery') + '</span>'
        + '</div>'
      : '';
    return [
      '<div class="wine-card ' + bundle.id + featured + ' fade-up"'
        + ' data-wine-page="' + bundleHref(bundle.id) + '">',
        '<div class="wine-img-wrap">',
          '<div class="bundle-badges">',
            '<span class="wine-type-badge">' + countLabel + '</span>',
          '</div>',
          '<img src="' + bundle.img + '" alt="' + bundle.name[currentLang] + '" loading="lazy" decoding="async">',
        '</div>',
        '<a class="wine-more" href="' + bundleHref(bundle.id) + '"'
          + ' aria-label="' + bundle.name[currentLang] + ': ' + moreLabel + '"'
          + ' title="' + moreLabel + '">' + MORE_ICON + '</a>',
        topBadge,
        '<div class="wine-card-body">',
          '<h3>' + bundle.name[currentLang] + '</h3>',
          '<div class="wine-srb">' + bundle.subtitle[currentLang] + '</div>',
          '<p class="wine-desc">' + bundle.desc[currentLang] + '</p>',
          freeShip,
          '<div class="wine-footer">',
            '<div class="bundle-pricing">',
              originalPrice,
              '<span class="wine-price">' + fmtPrice(bundle.price) + '</span>',
            '</div>',
            '<button type="button" class="wine-add bundle-add" data-bundle-id="' + bundle.id + '"'
              + ' aria-label="' + btnLabel + '" title="' + btnLabel + '">' + CART_ICON + '</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }).join('');
  grid.querySelectorAll('.bundle-add').forEach(function(btn) {
    btn.addEventListener('click', function() { addBundleToCart(btn.dataset.bundleId); });
  });
  observeFadeElements();
}

// ===== Cart Logic =====
let _cartBusy = false;

// Clarity tags are text, so the total goes in as a band rather than an exact
// dinar figure: that keeps the filter list short and still answers the only
// question worth asking, which basket sizes actually reach the end.
function cartBand(total) {
  if (total < 2000) return 'do 2000';
  if (total < 4000) return '2000-4000';
  if (total < 8000) return '4000-8000';
  return '8000+';
}

function addBundleToCart(bundleId) {
  if (_cartBusy) return;
  _cartBusy = true;
  const bundle = BUNDLES.find(b => b.id === bundleId);
  if (!bundle) { _cartBusy = false; return; }
  const existing = cart.find(i => i.id === bundleId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: bundleId, qty: 1, isBundle: true });
  }
  saveCart();
  renderCart();
  clTag('paket', bundle.name.sr);
  clTag('tip_artikla', 'paket');
  clTag('mesto_dodavanja', 'pocetna');
  clEvent('paket_u_korpu');
  // A funnel step needs one event that covers every way of adding. Counting
  // only dodato_u_korpu would silently drop every customer who bought a
  // bundle, and the funnel would read as worse than the shop actually is.
  clEvent('u_korpu');
  showToast(currentLang === 'sr' ? `${bundle.name.sr} dodat u korpu` : `${bundle.name.en} added to cart`);
  const cartBtn = document.getElementById('cartBtn');
  cartBtn.classList.remove('cart-pulse');
  void cartBtn.offsetWidth;
  cartBtn.classList.add('cart-pulse');
  setTimeout(() => { cartBtn.classList.remove('cart-pulse'); _cartBusy = false; }, 600);
}

function addToCart(id) {
  if (_cartBusy) return;
  _cartBusy = true;
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart();
  renderCart();
  const wine = WINES.find(w => w.id === id);
  clTag('vino', wine.name.sr);
  clTag('tip_artikla', 'vino');
  clTag('mesto_dodavanja', 'pocetna');
  clEvent('dodato_u_korpu');
  clEvent('u_korpu');
  showToast(currentLang === 'sr' ? `${wine.name.sr} dodato u korpu` : `${wine.name.en} added to cart`);
  const cartBtn = document.getElementById('cartBtn');
  cartBtn.classList.remove('cart-pulse');
  void cartBtn.offsetWidth;
  cartBtn.classList.add('cart-pulse');
  setTimeout(() => { cartBtn.classList.remove('cart-pulse'); _cartBusy = false; }, 600);
}

function removeFromCart(id) {
  if (_cartBusy) return;
  _cartBusy = true;
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  clEvent('iz_korpe_uklonjeno');
  if (cart.length === 0) clEvent('korpa_ispraznjena');
  setTimeout(() => { _cartBusy = false; }, 300);
}

function updateQty(id, delta) {
  if (_cartBusy) return;
  _cartBusy = true;
  const item = cart.find(i => i.id === id);
  if (!item) { _cartBusy = false; return; }
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
    setTimeout(() => { _cartBusy = false; }, 300);
    return;
  }
  saveCart();
  renderCart();
  setTimeout(() => { _cartBusy = false; }, 300);
}

function updateCartCount() {
  document.getElementById('cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function saveCart() {
  CartStore.write(cart);
  updateCartCount();
}

function getItemPrice(item) {
  if (item.isBundle) {
    const bundle = BUNDLES.find(b => b.id === item.id);
    return bundle ? bundle.price : 0;
  }
  const wine = WINES.find(w => w.id === item.id);
  return wine ? wine.price : 0;
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + getItemPrice(item) * item.qty, 0);
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  updateCartCount();
  if (cart.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty">${currentLang === 'sr' ? 'Korpa je prazna' : 'Your cart is empty'}</p>`;
    footerEl.style.display = 'none';
    return;
  }
  // Wines and bundles share one row: a bundle has its own photo, so stacking
  // its member bottles here only overflowed the thumbnail box and pushed the
  // quantity buttons on top of the images.
  itemsEl.innerHTML = cart.map(item => {
    const source = item.isBundle
      ? BUNDLES.find(b => b.id === item.id)
      : WINES.find(w => w.id === item.id);
    if (!source) return '';
    const price = getItemPrice(item);
    const label = item.isBundle
      ? `<span class="cart-bundle-label">${currentLang === 'sr' ? 'Paket' : 'Bundle'}</span>`
      : `<span class="cart-volume">${source.volume}</span>`;
    const note = item.isBundle
      ? `<div class="cart-item-note">${source.count} ${currentLang === 'sr'
          ? (source.count >= 5 ? 'flaša' : 'flaše')
          : 'bottles'}</div>`
      : '';
    return `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${source.img}" alt="${source.name[currentLang]}" decoding="async"></div>
        <div class="cart-item-info">
          <h4>${source.name[currentLang]} ${label}</h4>
          ${note}
          <div class="cart-item-price">${fmtPrice(price * item.qty)}</div>
          <div class="cart-item-controls">
            <button type="button" class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button type="button" class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
            <button type="button" class="remove-btn" onclick="removeFromCart('${item.id}')">${currentLang === 'sr' ? 'Ukloni' : 'Remove'}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('cartTotal').textContent = fmtPrice(getCartTotal());
  const chargeEl = document.getElementById('cartChargeNote');
  if (chargeEl) chargeEl.textContent = chargedNote(getCartTotal());
  renderShippingLine(getCartTotal());
  footerEl.style.display = 'block';
}

// The threshold is stated on the "Zašto mi" card, but stating it is not the
// same as using it. Here it can still change what someone does: a shopper
// 600 RSD short is told exactly that, at the only moment the number is
// actionable, and a shopper already over it gets the confirmation rather
// than a rule they have to apply to themselves.
function renderShippingLine(total) {
  const el = document.getElementById('cartShip');
  if (!el) return;
  const isSr = currentLang === 'sr';
  const short = FREE_SHIPPING_FROM - total;
  if (short > 0) {
    el.className = 'cart-ship cart-ship--short';
    el.innerHTML = SHIP_ICON + '<span>' + (isSr
      ? 'Još ' + short + ' RSD do besplatne dostave'
      : fmtPrice(short) + ' more for free delivery') + '</span>';
  } else {
    el.className = 'cart-ship cart-ship--free';
    el.innerHTML = SHIP_ICON + '<span>' + (isSr
      ? 'Besplatna dostava' : 'Free delivery') + '</span>';
  }
}

// ===== Checkout =====
function updateProgress(step) {
  ['cpStep1', 'cpStep2'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('cp-step--active', 'cp-step--done');
    if (i + 1 < step) el.classList.add('cp-step--done');
    if (i + 1 === step) el.classList.add('cp-step--active');
  });
  const line = document.getElementById('cpLine1');
  if (line) line.classList.toggle('cp-line--done', step > 1);
}

function populateSummary() {
  document.getElementById('checkoutSummary').innerHTML = `
    <h4>${currentLang === 'sr' ? 'Vaša porudžbina' : 'Your order'}</h4>
    ${cart.map(item => {
      const price = getItemPrice(item);
      const wine = !item.isBundle ? WINES.find(w => w.id === item.id) : null;
      const label = item.isBundle
        ? `${BUNDLES.find(b => b.id === item.id).name[currentLang]} (${currentLang === 'sr' ? 'paket' : 'bundle'})`
        : `${wine.name[currentLang]} ${wine.volume}`;
      return `<div class="checkout-summary-item"><span>${label} × ${item.qty}</span><span>${fmtPrice(price * item.qty)}</span></div>`;
    }).join('')}
    <div class="checkout-summary-total"><span>${currentLang === 'sr' ? 'Ukupno' : 'Total'}</span><span>${fmtPrice(getCartTotal())}</span></div>
    <div class="checkout-charge-note">${chargedNote(getCartTotal())}</div>
  `;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function renderConfirmLines(elId, lines) {
  const el = document.getElementById(elId);
  el.textContent = '';
  const p = document.createElement('p');
  lines.forEach((line, i) => {
    if (i) p.appendChild(document.createElement('br'));
    p.appendChild(document.createTextNode(line));
  });
  el.appendChild(p);
}

function goToStep2() {
  const name    = document.getElementById('oName').value.trim();
  const email   = document.getElementById('oEmail').value.trim();
  const phone   = document.getElementById('oPhone').value.trim();
  const city    = document.getElementById('oCity').value.trim();
  const address = document.getElementById('oAddress').value.trim();
  if (!name || !email || !phone || !city || !address) {
    // Which field is empty is the whole point: "prazno:telefon" appearing
    // again and again means people will not leave a number, which is a
    // decision about the form, not a bug.
    const prazno = [
      !name && 'ime', !email && 'email', !phone && 'telefon',
      !city && 'grad', !address && 'adresa'
    ].filter(Boolean).join('+');
    clTag('greska_polje', 'prazno:' + prazno);
    clEvent('forma_greska');
    showToast(currentLang === 'sr' ? 'Popunite sva polja' : 'Please fill in all fields', false);
    return;
  }
  if (!EMAIL_RE.test(email)) {
    clTag('greska_polje', 'email');
    clEvent('forma_greska');
    showToast(currentLang === 'sr' ? 'Unesite ispravnu email adresu' : 'Please enter a valid email address', false);
    document.getElementById('oEmail').focus();
    return;
  }
  if (phone.replace(/\D/g, '').length < 8) {
    clTag('greska_polje', 'telefon');
    clEvent('forma_greska');
    showToast(currentLang === 'sr' ? 'Unesite ispravan broj telefona' : 'Please enter a valid phone number', false);
    document.getElementById('oPhone').focus();
    return;
  }
  renderConfirmLines('confirmContact', [name, email, phone]);
  renderConfirmLines('confirmDelivery', [city, address]);
  populateSummary();
  document.getElementById('checkoutStep1').style.display = 'none';
  document.getElementById('checkoutStep2').style.display = 'block';
  document.getElementById('checkoutStepTitle').textContent = currentLang === 'sr' ? 'Pregled porudžbine' : 'Order review';
  document.getElementById('checkoutStepDesc').textContent = currentLang === 'sr' ? 'Proverite detalje i potvrdite.' : 'Review the details and confirm.';
  updateProgress(2);
  clEvent('checkout_podaci_uneti');
  document.getElementById('checkoutModal').scrollTop = 0;
}

function goToStep1() {
  document.getElementById('checkoutStep2').style.display = 'none';
  document.getElementById('checkoutStep1').style.display = 'block';
  document.getElementById('checkoutStepTitle').textContent = currentLang === 'sr' ? 'Vaši podaci' : 'Your Details';
  document.getElementById('checkoutStepDesc').textContent = currentLang === 'sr' ? 'Popunite sve informacije za kupovinu.' : 'Fill in all details for your order.';
  updateProgress(1);
  document.getElementById('checkoutModal').scrollTop = 0;
}

// A panel that is visually hidden must also leave the tab order, or keyboard
// and screen-reader users keep landing inside it.
function setPanelOpen(id, open) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('active', open);
  if (open) el.removeAttribute('inert');
  else el.setAttribute('inert', '');
}

// ===== Card navigation =====
// Wines and bundles each have a page of their own now, so the panel that used
// to stand in for one is gone: nothing could open it any more.
function initDetail() {
  // Delegated, because both grids re-render whenever the filter or language
  // changes and per-button listeners would be lost with them. A real button
  // needs no key handling of its own — Enter and Space already fire a click.
  document.addEventListener('click', e => {
    // A wine card is a link in everything but markup — it cannot be an <a>,
    // because the add-to-cart button inside it would then be a control nested
    // in a link. So the whole card is clickable, minus the two things that
    // already do something of their own.
    const card = e.target.closest('[data-wine-page]');
    if (card && !e.target.closest('.wine-add') && !e.target.closest('a')) {
      window.location.href = card.dataset.winePage;
    }
  });
}

function setCartOpen(open) {
  if (open) clEvent('korpa_otvorena');
  setPanelOpen('cartOverlay', open);
  setPanelOpen('cartSidebar', open);
  if (open) document.getElementById('cartClose').focus();
}

function openCheckout() {
  if (cart.length === 0) {
    showToast(currentLang === 'sr' ? 'Korpa je prazna' : 'Your cart is empty', false);
    return;
  }
  document.getElementById('checkoutStep1').style.display = 'block';
  document.getElementById('checkoutStep2').style.display = 'none';
  document.getElementById('checkoutStepTitle').textContent = currentLang === 'sr' ? 'Vaši podaci' : 'Your Details';
  document.getElementById('checkoutStepDesc').textContent = currentLang === 'sr' ? 'Popunite sve informacije za kupovinu.' : 'Fill in all details for your order.';
  const total = getCartTotal();
  clTag('vrednost_korpe', cartBand(total));
  // The threshold is a lever we can move. Tagging which side of it a basket
  // landed on is what makes "would 5000 work better than 4000" answerable
  // from data instead of from opinion.
  clTag('besplatna_dostava', total >= FREE_SHIPPING_FROM ? 'da' : 'ne');
  clTag('broj_artikala', String(cart.reduce((n, i) => n + i.qty, 0)));
  clEvent('checkout_otvoren');
  updateProgress(1);
  setCartOpen(false);
  setPanelOpen('checkoutOverlay', true);
  document.getElementById('checkoutClose').focus();
}

async function submitOrder(e) {
  e.preventDefault();
  if (document.getElementById('checkoutStep2').style.display === 'none') return;
  const name = document.getElementById('oName').value;
  const email = document.getElementById('oEmail').value;
  const phone = document.getElementById('oPhone').value;
  const city = document.getElementById('oCity').value;
  const address = document.getElementById('oAddress').value;

  let orderLines = '';
  cart.forEach(item => {
    const price = getItemPrice(item);
    let label;
    if (item.isBundle) {
      const bundle = BUNDLES.find(b => b.id === item.id);
      label = bundle ? bundle.name.sr + ' (paket)' : item.id;
    } else {
      const wine = WINES.find(w => w.id === item.id);
      label = wine ? wine.name.sr + ' ' + wine.volume : item.id;
    }
    orderLines += label + ' × ' + item.qty + ' = ' + (price * item.qty) + ' RSD\n';
  });

  const timestamp = new Date().toLocaleString('sr-RS', {
    timeZone: 'Europe/Belgrade',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = currentLang === 'sr' ? 'Slanje...' : 'Sending...';
  }

  try {
    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: `Hercz Wines | Nova porudžbina | ${name} | ${getCartTotal()} RSD`,
        _template: 'table',
        _captcha: 'false',
        _replyto: email,
        _autoresponse: `Poštovani ${name},\n\nhvala Vam što ste odabrali Hercz Wines.\n\nVaša porudžbina je uspešno primljena.\n\nHercz je trenutno u pretprodajnoj fazi. Kontaktiraćemo Vas radi potvrde dostupnosti i isporuke u roku od 1–2 dana.\n\nHercz Wines tim`,
        datum_i_vreme: timestamp,
        name, email, phone, city, address,
        total: `${getCartTotal()} RSD`,
        order: orderLines
      })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data.success !== 'true' && data.success !== true) throw new Error('FormSubmit error');
  } catch (err) {
    // Never claim success we cannot verify — the cart stays intact so the
    // customer can retry instead of losing the order silently.
    console.error('Order submission failed:', err);
    // A failed order is the single most valuable recording on the site, so
    // the session is upgraded before anything else happens to it.
    clKeep('porudzbina_neuspesna');
    clEvent('porudzbina_neuspesna');
    showToast(currentLang === 'sr'
      ? 'Slanje nije uspelo. Pokušajte ponovo ili nas kontaktirajte telefonom.'
      : 'Sending failed. Please try again or contact us by phone.', false);
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
    return;
  }

  clKeep('porudzbina_poslata');
  clTag('vrednost_porudzbine', cartBand(getCartTotal()));
  clEvent('porudzbina_poslata');
  document.getElementById('checkoutFormWrap').style.display = 'none';
  document.getElementById('checkoutSuccess').style.display = 'block';
  updateProgress(2);
  cart = [];
  saveCart();
  renderCart();
  document.getElementById('checkoutForm').reset();
  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
}

// ===== Language Toggle =====
function switchLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === 'sr' ? 'sr' : 'en';
  document.querySelectorAll('[data-sr]').forEach(el => {
    const text = el.dataset[lang === 'sr' ? 'sr' : 'en'];
    if (text) {
      if (text.includes('<br>')) el.innerHTML = text;
      else el.textContent = text;
    }
  });
  document.querySelectorAll('[data-sr-ph]').forEach(el => {
    el.placeholder = el.dataset[lang === 'sr' ? 'srPh' : 'enPh'];
  });
  const btn = document.getElementById('langToggle');
  btn.innerHTML = lang === 'sr'
    ? '<span class="lang-active">SR</span> / <span>EN</span>'
    : '<span>SR</span> / <span class="lang-active">EN</span>';
  localStorage.setItem('hercegLang', lang);
  clTag('jezik', lang);
  renderWines();
  renderBundles();
  renderCart();
}

// ===== Toast =====
function showToast(msg, success = true) {
  const toast = document.getElementById('toast');
  if (success) {
    toast.innerHTML = `<span class="toast-check">✓</span>${msg}`;
  } else {
    toast.textContent = msg;
  }
  toast.classList.add('active');
  setTimeout(() => toast.classList.remove('active'), 3000);
}

// ===== Hero Particles =====
function createHeroParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = '-5%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
    container.appendChild(p);
  }
}

// ===== Counter Animation =====
function animateCounters() {
  const counters = document.querySelectorAll('.stat-num, .vf-num');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const text = el.textContent.trim();
        const match = text.match(/^(\d+)/);
        if (!match) return;
        const target = parseInt(match[1]);
        const suffix = text.replace(match[1], '');
        const duration = 1500;
        const start = performance.now();
        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  counters.forEach(el => io.observe(el));
}

// ===== Staggered Scroll Animations =====
let _fadeObserver = null;

function observeFadeElements() {
  const groups = ['.wine-card', '.visit-card', '.vf-item', '.about-stat'];
  groups.forEach(selector => {
    const items = document.querySelectorAll(selector);
    items.forEach((el, i) => {
      if (!el.classList.contains('fade-up')) el.classList.add('fade-up');
      el.classList.add('stagger-' + (i + 1));
    });
  });
  const singles = document.querySelectorAll('.about-content, .stone-frame, .contact-form, .vineyard-content, .section-header');
  singles.forEach(el => {
    if (!el.classList.contains('fade-up')) el.classList.add('fade-up');
  });
  // One observer for the life of the page. This function runs again on every
  // filter tap, every language switch and every cart render, and it used to
  // build a fresh observer each time and point it at every fading element on
  // the page — while the previous ones stayed alive watching the same
  // elements. A few minutes of browsing left dozens of live observers doing
  // identical work. Re-observing an element the observer already holds is a
  // no-op, so pointing this one at the new cards is enough, and the ones that
  // have already appeared are skipped outright.
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

// ===== Vineyard Parallax =====
// Two separate things used to react to scrolling — the navbar and progress
// bar, and the vineyard parallax — and each had its own listener on the raw
// scroll event. That fires dozens of times a second, and both handlers read
// layout (getBoundingClientRect, scrollHeight) and then write to it, so every
// read after a write forced the browser to lay the page out again in the
// middle of a scroll. They register here instead and run together, at most
// once per painted frame. Same arithmetic, same result, a fraction of the
// work — and a frame can never be laid out twice for two effects that are
// going to be drawn at the same moment anyway.
const _scrollJobs = [];
let _scrollTicking = false;

function onScrollFrame(job) {
  _scrollJobs.push(job);
}

window.addEventListener('scroll', () => {
  if (_scrollTicking) return;
  _scrollTicking = true;
  requestAnimationFrame(() => {
    _scrollTicking = false;
    for (let i = 0; i < _scrollJobs.length; i++) _scrollJobs[i]();
  });
}, { passive: true });

function initParallax() {
  const vineyard = document.querySelector('.section-vineyard');
  if (!vineyard) return;
  onScrollFrame(() => {
    const rect = vineyard.getBoundingClientRect();
    const windowH = window.innerHeight;
    if (rect.bottom > 0 && rect.top < windowH) {
      const progress = (windowH - rect.top) / (windowH + rect.height);
      const offset = (progress - 0.5) * 80;
      vineyard.style.setProperty('--parallax-y', offset + 'px');
    }
  });
}

// Scrolling to a section and leaving the address bar alone are one operation,
// because doing only the first is what put #hero and #bundles in front of
// customers in the first place.
function goToSection(target, behavior) {
  target.scrollIntoView({ behavior: behavior || 'smooth' });
  // Smooth scrolling alone leaves the keyboard focus behind, so the next Tab
  // would resume from the link instead of the section jumped to.
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  clearHash();
}

// Rewrites the address without the fragment, keeping any query string and
// without adding a history entry — so Back still goes to the previous page
// rather than stepping through the sections someone scrolled past.
function clearHash() {
  if (!location.hash) return;
  try {
    history.replaceState(null, '', location.pathname + location.search);
  } catch (err) {
    // Some embedded browsers refuse replaceState; the fragment is cosmetic,
    // so leaving it there is the correct failure.
  }
}

// Which parts of the page a visitor actually reaches, and whether they reach
// for the phone instead of the cart. Each fires once, so a long session does
// not flood the funnel with repeats.
function trackSections() {
  const once = (id, event) => {
    const el = document.getElementById(id);
    if (!el || !('IntersectionObserver' in window)) return;
    // No threshold. These sections are taller than a phone screen — #wines
    // contains the bundles too — and a ratio threshold is a fraction of the
    // ELEMENT, so a section three screens tall can never reach 25% no matter
    // how far someone scrolls through it. "Reached this section" is the top
    // edge coming into view, which is what a bare intersection means.
    const obs = new IntersectionObserver(entries => {
      if (entries.some(en => en.isIntersecting)) {
        clEvent(event);
        obs.disconnect();
      }
    });
    obs.observe(el);
  };
  once('wines', 'vina_videna');
  once('bundles', 'paketi_videni');
  once('contact', 'kontakt_vidjen');

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (!a) return;
    clEvent(a.getAttribute('href').startsWith('tel:') ? 'telefon_kliknut' : 'email_kliknut');
  });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  const ageGate = document.getElementById('ageGate');
  const alreadyOfAge = ageConfirmed();
  if (alreadyOfAge) {
    // Answered before, so the gate is never shown or focus-trapped again.
    ageGate.classList.add('age-gate--hidden');
    ageGate.setAttribute('inert', '');
  } else {
    document.body.style.overflow = 'hidden';
  }
  document.getElementById('ageYes').addEventListener('click', () => {
    clEvent('starost_potvrdjena');
    rememberAge();
    ageGate.classList.add('age-gate--hidden');
    ageGate.setAttribute('inert', '');
    document.body.style.overflow = '';
    // Focus would otherwise stay on the now-hidden gate button, stranding
    // keyboard users mid-page; hand it back to the top of the content.
    document.getElementById('main').focus();
  });
  document.getElementById('ageNo').addEventListener('click', () => {
    clEvent('starost_odbijena');
    document.getElementById('ageBtns').style.display = 'none';
    document.getElementById('ageDenied').style.display = 'block';
  });

  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  document.body.appendChild(scrollProgress);

  const navbar = document.getElementById('navbar');
  onScrollFrame(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    scrollProgress.style.width = Math.min(pct * 100, 100) + '%';
  });

  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
  });
  document.querySelectorAll('#navLinks a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('active'));
  });

  document.getElementById('langToggle').addEventListener('click', () => {
    switchLanguage(currentLang === 'sr' ? 'en' : 'sr');
  });

  // Serbian is the default and stays it; only an explicit switch is remembered,
  // so a first visit always opens in Serbian whatever the browser is set to.
  try {
    if (localStorage.getItem('hercegLang') === 'en') switchLanguage('en');
  } catch (err) {
    // Storage unavailable — the page stays in Serbian, which is the default.
  }

  document.getElementById('cartBtn').addEventListener('click', () => {
    setCartOpen(true);
  });
  document.getElementById('cartClose').addEventListener('click', () => {
    setCartOpen(false);
  });
  document.getElementById('cartOverlay').addEventListener('click', () => {
    setCartOpen(false);
  });

  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  document.getElementById('checkoutNext').addEventListener('click', goToStep2);
  document.getElementById('checkoutBack').addEventListener('click', goToStep1);
  function closeCheckout() {
    // Leaving the modal is not a page change, so Clarity cannot see it on its
    // own. The success panel shows only after an order went through, which is
    // what separates "finished" from "gave up".
    if (document.getElementById('checkoutSuccess').style.display !== 'block') {
      // Leaving at the form is friction in the form. Leaving at the review,
      // after seeing the total and the delivery line, is a reaction to the
      // price. Same event, opposite fix — so the step is tagged.
      const naPregledu = document.getElementById('checkoutStep2').style.display === 'block';
      clTag('checkout_faza', naPregledu ? 'pregled' : 'podaci');
      // These are the recordings worth watching, so they are kept.
      clKeep('checkout_napusten');
      clEvent('checkout_napusten');
    }
    setPanelOpen('checkoutOverlay', false);
    document.getElementById('checkoutFormWrap').style.display = '';
    document.getElementById('checkoutSuccess').style.display = 'none';
    document.getElementById('checkoutStep1').style.display = 'block';
    document.getElementById('checkoutStep2').style.display = 'none';
    document.getElementById('checkoutStepTitle').textContent = currentLang === 'sr' ? 'Vaši podaci' : 'Your Details';
    document.getElementById('checkoutStepDesc').textContent = currentLang === 'sr' ? 'Popunite sve informacije za kupovinu.' : 'Fill in all details for your order.';
    updateProgress(1);
  }
  document.getElementById('checkoutClose').addEventListener('click', closeCheckout);
  document.getElementById('successCloseBtn').addEventListener('click', closeCheckout);
  document.getElementById('checkoutForm').addEventListener('submit', submitOrder);

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('checkoutOverlay').classList.contains('active')) {
      closeCheckout();
    } else if (document.getElementById('cartSidebar').classList.contains('active')) {
      setCartOpen(false);
    }
  });

  document.getElementById('contactForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('cName').value;
    const email = document.getElementById('cEmail').value;
    const subject = document.getElementById('cSubject').value || 'Poruka sa sajta';
    const message = document.getElementById('cMessage').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = currentLang === 'sr' ? 'Slanje...' : 'Sending...'; }
    try {
      const res = await fetch(FORMSUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ _subject: `Kontakt: ${subject}`, _template: 'table', _captcha: 'false', name, email, subject, message })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data.success !== 'true' && data.success !== true) throw new Error('FormSubmit error');
      showToast(currentLang === 'sr' ? 'Poruka poslata!' : 'Message sent!');
      e.target.reset();
    } catch (err) {
      console.error('Contact submission failed:', err);
      showToast(currentLang === 'sr' ? 'Greška pri slanju poruke.' : 'Failed to send message.', false);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      goToSection(target, 'smooth');
    });
  });

  // The product pages link back here as index.html#wines and #bundles, because
  // a cross-page link has no other way to say which part of the page it means.
  // The browser then leaves that fragment sitting in the address bar, so
  // coming back from a bottle showed herczwines.rs/#wines — an internal
  // anchor presented to the customer as if it were the address of the page.
  // The fragment does its job on arrival and is then cleared: shared links
  // still land where they point, and the bar shows the address of the site.
  const wanted = location.hash;
  if (wanted) {
    // Cleared first, so the bar is right from the very first frame rather
    // than showing the anchor and tidying it up a moment later.
    clearHash();
    const target = document.querySelector(wanted);
    if (target) {
      goToSection(target, 'auto');
      // The wine cards and their photographs land after this runs and push
      // the section down, so the first jump can stop short. One correction
      // once everything has loaded — abandoned the moment the visitor
      // scrolls for themselves, because moving the page under someone who is
      // already reading is worse than stopping a little short.
      let ownScroll = false;
      const noteScroll = () => { ownScroll = true; };
      window.addEventListener('wheel', noteScroll, { once: true, passive: true });
      window.addEventListener('touchstart', noteScroll, { once: true, passive: true });
      window.addEventListener('keydown', noteScroll, { once: true });
      const settle = () => { if (!ownScroll) goToSection(target, 'auto'); };
      if (document.readyState === 'complete') setTimeout(settle, 60);
      else window.addEventListener('load', () => setTimeout(settle, 60), { once: true });
    }
  }

  currentLang = 'sr';
  renderWines();
  renderBundles();
  renderCart();
  initDetail();
  switchLanguage(currentLang);

  // A product page has no checkout of its own, so its cart panel sends people
  // back here with ?korpa=1 and the panel opens on arrival. Without this the
  // button said "continue to reservation" and quietly dropped them at the top
  // of the wine list with their cart closed.
  if (new URLSearchParams(location.search).get('korpa') === '1') {
    setCartOpen(true);
    history.replaceState(null, '', location.pathname + location.hash);
  }
  observeFadeElements();
  createHeroParticles();
  animateCounters();
  initParallax();
  trackSections();

  // The rail keeps whatever horizontal position a previous filter left it
  // at, which can show nothing at all once a new filter narrows the list —
  // scrolled to card 9 of 13, then filtered down to 3. Every filter change
  // resets the rail to its first card.
  function resetRailScroll() {
    const grid = document.getElementById('winesGrid');
    if (grid) grid.scrollLeft = 0;
  }

  document.getElementById('wineFilters').addEventListener('click', function(e) {
    const btn = e.target.closest('.wf-btn');
    if (!btn) return;
    // Scoped to this row only — the quick-pick row keeps its own selection
    // when this one changes, since the two filters combine rather than
    // replace each other.
    this.querySelectorAll('.wf-btn').forEach(b => b.classList.remove('wf-btn--active'));
    btn.classList.add('wf-btn--active');
    activeWineFilter = btn.dataset.filter;
    clTag('filter_vrsta', activeWineFilter);
    clEvent('filter_koriscen');
    renderWines();
    resetRailScroll();
  });

  document.getElementById('quickFilters').addEventListener('click', function(e) {
    const btn = e.target.closest('.wf-btn');
    if (!btn) return;
    const wasActive = btn.classList.contains('wf-btn--active');
    this.querySelectorAll('.wf-btn').forEach(b => b.classList.remove('wf-btn--active'));
    if (wasActive) {
      // Row has no "all" pill of its own — clicking the active one a second
      // time is how it clears back to showing every quick tag.
      activeQuickFilter = 'all';
    } else {
      btn.classList.add('wf-btn--active');
      activeQuickFilter = btn.dataset.quick;
    }
    clTag('filter_prilika', activeQuickFilter);
    clEvent('filter_koriscen');
    // This row outranks the type row: choosing a quick tag is a fresh look at
    // the catalogue, not a refinement of the last one. Carrying the old type
    // over is what used to strand people on an empty grid ("Rosé" held from a
    // group that had one, into a group that has none). Clearing it also means
    // this row can never land on nothing, so it never has to disable a pill.
    activeWineFilter = 'all';
    const typeRow = document.getElementById('wineFilters');
    typeRow.querySelectorAll('.wf-btn').forEach(b => b.classList.remove('wf-btn--active'));
    const allBtn = typeRow.querySelector('[data-filter="all"]');
    if (allBtn) allBtn.classList.add('wf-btn--active');
    renderWines();
    resetRailScroll();
  });
});

window.updateQty = updateQty;
window.removeFromCart = removeFromCart;

// ===== Hero Video =====
// Prefers the self-hosted file at videos/hero.mp4. If that file is not in the
// repository (or the browser cannot play it), this falls back to the YouTube
// embed automatically — so dropping the file in is the only step required.
(function() {
  var native = document.getElementById('heroVideoNative');
  var settled = false;

  function useNative() {
    if (settled) return;
    settled = true;
    native.classList.add('active');
    var wrap = document.getElementById('heroVideoWrap');
    if (wrap) wrap.remove();              // YouTube is never loaded at all
    var cover = document.getElementById('heroVideoCover');
    if (cover) cover.classList.add('hidden');
  }

  function useYouTube() {
    if (settled) return;
    settled = true;
    if (native) native.remove();
    startYouTube();
  }

  // Neither video source is worth several megabytes to someone who asked for
  // less motion or less data — the still background carries the hero instead.
  function useStatic() {
    if (settled) return;
    settled = true;
    if (native) native.remove();
    var wrap = document.getElementById('heroVideoWrap');
    if (wrap) wrap.remove();
    var bg = document.getElementById('heroBgFallback');
    if (bg) bg.classList.add('visible');
    var cover = document.getElementById('heroVideoCover');
    if (cover) cover.classList.add('hidden');
  }

  var wantsLessMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wantsLessData = navigator.connection && navigator.connection.saveData;

  if (native && (wantsLessMotion || wantsLessData)) {
    useStatic();
  } else if (native) {
    // Chrome/Firefox take the WebM, Safari the H.264 MP4.
    var probe = document.createElement('video');
    var chosen = (native.dataset.srcWebm && probe.canPlayType('video/webm; codecs="vp9"'))
      ? native.dataset.srcWebm
      : native.dataset.src;

    // A missing file does not raise <video> error promptly, which would leave
    // the hero dark for seconds. Probing first keeps the decision immediate.
    fetch(chosen, { method: 'HEAD' })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        native.addEventListener('playing', useNative, { once: true });
        native.addEventListener('error', useYouTube, { once: true });
        if (native.dataset.poster) native.poster = native.dataset.poster;
        native.src = chosen;
        var attempt = native.play();
        if (attempt && attempt.catch) attempt.catch(function() { useYouTube(); });
        setTimeout(function() { if (!settled) useYouTube(); }, 5000);
      })
      .catch(useYouTube);
  } else {
    useYouTube();
  }

function startYouTube() {
  // Set src dynamically so YouTube never renders thumbnail before cover is ready
  var iframe = document.getElementById('heroVideo');
  if (iframe) iframe.src = iframe.getAttribute('data-src');

  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  var ytPlayer;
  window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('heroVideo', {
      events: {
        onReady: function(e) {
          e.target.mute();
          e.target.playVideo();
          e.target.setPlaybackRate(0.75);
          var faded = false;
          var poll = setInterval(function() {
            try {
              var duration = ytPlayer.getDuration();
              var current = ytPlayer.getCurrentTime();
              if (duration > 0 && current >= duration - 2.5 && !faded) {
                faded = true;
                clearInterval(poll);
                var bg = document.getElementById('heroBgFallback');
                if (bg) bg.classList.add('visible');
              }
            } catch(err) {}
          }, 500);
        },
        onStateChange: function(e) {
          if (e.data === YT.PlayerState.PLAYING) {
            var cover = document.getElementById('heroVideoCover');
            if (cover) cover.classList.add('hidden');
          }
          if (e.data === YT.PlayerState.ENDED) {
            var wrap = document.getElementById('heroVideoWrap');
            if (wrap) { wrap.style.transition = 'opacity 0.3s ease'; wrap.style.opacity = '0'; }
            var bg = document.getElementById('heroBgFallback');
            if (bg) bg.classList.add('visible');
          }
        }
      }
    });
  };
}
})();

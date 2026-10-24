// ===== Catalogue =====
// Shared by the homepage and every product page, so a wine is described in
// exactly one place. Loaded before script.js / vino.js, which both read it.

// ===== Wines Data =====
const WINES = [
  {
    id: 'tvrdos-vranac',
    quickTag: 'preporuka',
    tag: { sr: 'Duboko i staloženo', en: 'Deep and composed' },
    tagIcon: 'barrel',
    name: { sr: 'Tvrdoš Vranac', en: 'Tvrdoš Vranac' },
    volume: '0.75L',
    subtitle: { sr: 'Crveno vino • Manastir Tvrdoš, Trebinje', en: 'Red Wine • Manastir Tvrdoš, Trebinje' },
    type: { sr: 'Crveno', en: 'Red' },
    desc: {
      sr: 'Vino iz manastirskih vinograda na stenovitim padinama iznad Trebinja. Monaška tradicija utkana u svaki gutljaj, kompleksno, dostojanstveno, duboko, za momente koji ostaju u sećanju.',
      en: 'Wine from monastery vineyards on rocky slopes above Trebinje. Monastic tradition woven into every sip, complex, dignified, deep, for moments that stay in memory.'
    },
    price: 1890,
    rank: 7,
    img: 'images/tvrdos-vranac.webp'
  },
  {
    id: 'tvrdos-zilavka',
    quickTag: 'preporuka',
    tag: { sr: 'Sveže i mineralno', en: 'Fresh and mineral' },
    tagIcon: 'droplet',
    name: { sr: 'Tvrdoš Žilavka', en: 'Tvrdoš Žilavka' },
    volume: '0.75L',
    subtitle: { sr: 'Belo vino • Manastir Tvrdoš, Trebinje', en: 'White Wine • Manastir Tvrdoš, Trebinje' },
    type: { sr: 'Belo', en: 'White' },
    desc: {
      sr: 'Žilavka iz manastirskih vinograda, sa notama zrele kruške i badema. Sveža kiselina i dug, mineralan završetak, vino koje otkriva novi sloj ukusa sa svakim gutljajem.',
      en: 'Žilavka from the monastery vineyards, with notes of ripe pear and almond. Fresh acidity and a long mineral finish, a wine that reveals a new layer with every sip.'
    },
    price: 2090,
    rank: 6,
    img: 'images/tvrdos-zilavka.webp'
  },
  {
    id: 'tamjanika-galerija',
    quickTag: 'drugacije',
    tag: { sr: 'Aromatično', en: 'Aromatic' },
    tagIcon: 'flower',
    name: { sr: 'Tamjanika Galerija', en: 'Tamjanika Galerija' },
    volume: '0.75L',
    subtitle: { sr: 'Belo vino • Podrumi Vukoje, Trebinje', en: 'White Wine • Podrumi Vukoje, Trebinje' },
    type: { sr: 'Belo', en: 'White' },
    desc: {
      sr: 'Izrazito mirisno belo vino sa aromama cvetne livade, grožđa i blagog meda. Pitko i osvežavajuće, savršeno za one koji vole da vino prvo osete nosom, pa tek onda ukusom.',
      en: 'A strikingly fragrant white with aromas of flowering meadow, grapes and a hint of honey. Easy to drink and refreshing, perfect for anyone who likes to taste a wine with their nose first.'
    },
    price: 1790,
    rank: 4,
    img: 'images/tamjanika-galerija.webp'
  },
  {
    id: 'tvrdos-metoh-vranac',
    quickTag: 'preporuka',
    tag: { sr: 'Opušteno i pitko', en: 'Relaxed and easy' },
    tagIcon: 'glass',
    name: { sr: 'Tvrdoš Metoh Vranac', en: 'Tvrdoš Metoh Vranac' },
    volume: '0.75L',
    subtitle: { sr: 'Crveno vino • Manastir Tvrdoš, Trebinje', en: 'Red Wine • Manastir Tvrdoš, Trebinje' },
    type: { sr: 'Crveno', en: 'Red' },
    desc: {
      sr: 'Mlađi, opušteniji Vranac iz istog manastirskog podruma. Ukus zrele šljive i višnje, meki tanini bez težine, vino za svaki dan kad poželite nešto ozbiljno, ali ne zahtevno.',
      en: 'A younger, more relaxed Vranac from the same monastery cellar. Ripe plum and cherry, soft tannins without the weight, a wine for when you want something serious but not demanding.'
    },
    price: 1590,
    rank: 3,
    img: 'images/tvrdos-metoh-vranac.webp'
  },
  {
    id: 'primavera-roze',
    quickTag: 'drugacije',
    tag: { sr: 'Osvežavajuće leto', en: 'Refreshing summer' },
    tagIcon: 'sun',
    name: { sr: 'Primavera cuvée rosé', en: 'Primavera cuvée rosé' },
    volume: '0.75L',
    subtitle: { sr: 'Rosé vino • Podrumi Vukoje, Trebinje', en: 'Rosé Wine • Podrumi Vukoje, Trebinje' },
    type: { sr: 'Rosé', en: 'Rosé' },
    desc: {
      sr: 'Svetlo rozé vino boje latica ruže, sa mirisom jagode i divlje kupine. Lagano, sveže i lako se pije, ide uz sve, od letnjeg druženja do prve večere na terasi.',
      en: 'A pale rosé the colour of rose petals, with aromas of strawberry and wild blackberry. Light, fresh and effortless to drink, pairs with everything from a summer gathering to the first dinner on the terrace.'
    },
    price: 1690,
    rank: 8,
    img: 'images/primavera-roze.webp'
  },
  {
    id: 'tvrdos-izba-merlot',
    quickTag: 'preporuka',
    tag: { sr: 'Mekše crveno', en: 'Softer red' },
    tagIcon: 'heart',
    name: { sr: 'Tvrdoš Izba Merlot', en: 'Tvrdoš Izba Merlot' },
    volume: '0.75L',
    subtitle: { sr: 'Crveno vino • Manastir Tvrdoš, Trebinje', en: 'Red Wine • Manastir Tvrdoš, Trebinje' },
    type: { sr: 'Crveno', en: 'Red' },
    desc: {
      sr: 'Merlot u svom najpitomijem izdanju, baršunast, okrugao, bez oštrih ivica. Ukus zrele šljive i tamne čokolade, savršen izbor za nekoga ko tek otkriva crvena vina.',
      en: 'Merlot at its most approachable, velvety, round, no rough edges. Ripe plum and dark chocolate, a perfect choice for someone just discovering red wine.'
    },
    price: 1490,
    rank: 9,
    img: 'images/tvrdos-izba-merlot.webp'
  },
  {
    id: 'zlatna-selekcija-bijelo',
    quickTag: 'premium',
    tag: { sr: 'Bogato i slojevito', en: 'Rich and layered' },
    tagIcon: 'layers',
    name: { sr: 'Zlatna Selekcija Bijelo', en: 'Zlatna Selekcija Bijelo' },
    volume: '0.75L',
    subtitle: { sr: 'Belo vino • Podrumi Vukoje, Trebinje', en: 'White Wine • Podrumi Vukoje, Trebinje' },
    type: { sr: 'Belo', en: 'White' },
    desc: {
      sr: 'Vrhunsko belo vino iz posebne selekcije, negovano sa više pažnje i vremena. Bogat, slojevit ukus zrelog voća i suptilne vanile, za trenutke kada želite da počastite sebe ili nekog drugog.',
      en: 'A premium white from a special selection, given extra care and time. A rich, layered taste of ripe fruit and subtle vanilla, for moments when you want to treat yourself or someone else.'
    },
    price: 3990,
    rank: 1,
    img: 'images/zlatna-selekcija-bijelo-v2.webp'
  },
  {
    id: 'vranac-reserve',
    quickTag: 'premium',
    tag: { sr: 'Baršunasto i začinjeno', en: 'Velvety and spiced' },
    tagIcon: 'flame',
    name: { sr: 'Vranac Reserve', en: 'Vranac Reserve' },
    volume: '0.75L',
    subtitle: { sr: 'Crveno vino • Podrumi Vukoje, Trebinje', en: 'Red Wine • Podrumi Vukoje, Trebinje' },
    type: { sr: 'Crveno', en: 'Red' },
    desc: {
      sr: 'Vranac u svom najboljem izdanju, odležao duže od ostalih da uhvati punu dubinu ukusa. Tamni bobičasti plodovi, začini i baršunasta struktura, vino za slavlje i posebne trenutke.',
      en: 'Vranac at its finest, aged longer than the rest to reach full depth. Dark berry fruit, spice and a velvety structure, a wine for celebration and special moments.'
    },
    price: 3990,
    rank: 2,
    img: 'images/vranac-reserve-v2.webp'
  },
  {
    id: 'blatina-citluk-075',
    quickTag: 'svakodnevno',
    tag: { sr: 'Snažno i domaće', en: 'Bold and homegrown' },
    tagIcon: 'house',
    name: { sr: 'Blatina Čitluk', en: 'Blatina Čitluk' },
    volume: '0.75L',
    subtitle: { sr: 'Crveno vino • Vinarija Čitluk', en: 'Red Wine • Vinarija Čitluk' },
    type: { sr: 'Crveno', en: 'Red' },
    desc: {
      sr: 'Jedinstven autohtoni crveni kultivar, uzgojen isključivo u Hercegovini. Tamno rubinska boja, arome višnje, šljive i začina. Srednji tanini, meki i savršeno balansirani.',
      en: 'A unique indigenous red cultivar, grown exclusively in Herzegovina. Dark ruby, aromas of cherry, plum and spice. Medium tannins, soft and perfectly balanced.'
    },
    price: 1290,
    rank: 10,
    img: 'images/blatina-citluk.webp'
  },
  {
    id: 'zilavka-citluk-075',
    quickTag: 'svakodnevno',
    tag: { sr: 'Laka klasika', en: 'Easy classic' },
    tagIcon: 'feather',
    name: { sr: 'Žilavka Čitluk', en: 'Žilavka Čitluk' },
    volume: '0.75L',
    subtitle: { sr: 'Belo vino • Vinarija Čitluk', en: 'White Wine • Vinarija Čitluk' },
    type: { sr: 'Belo', en: 'White' },
    desc: {
      sr: 'Elegantna Žilavka iz čuvene Vinarije Čitluk uz reku Neretvu. Sveža kiselina, voćna kompleksnost i dug, svilenkast završetak. Najprepoznatljivije belo vino BiH.',
      en: 'Elegant Žilavka from the renowned Vinarija Čitluk along the Neretva. Fresh acidity, fruity complexity and a long, silky finish. The most recognised white wine of BiH.'
    },
    price: 1090,
    rank: 11,
    img: 'images/zilavka-mostar.webp'
  },
  {
    id: 'blatina-citluk-1l',
    quickTag: 'svakodnevno',
    tag: { sr: 'Snažno i domaće', en: 'Bold and homegrown' },
    tagIcon: 'house',
    tag2: { sr: 'Za veće društvo', en: 'For a bigger crowd' },
    name: { sr: 'Blatina Čitluk', en: 'Blatina Čitluk' },
    volume: '1L',
    subtitle: { sr: 'Crveno vino • Vinarija Čitluk', en: 'Red Wine • Vinarija Čitluk' },
    type: { sr: 'Crveno', en: 'Red' },
    desc: {
      sr: 'Ista omiljena Blatina iz Vinarije Čitluk, sada u većem, praktičnom pakovanju od 1 litra. Idealna kada je društvo veće ili kada jednostavno ne želite da vam ponestane.',
      en: 'The same beloved Blatina from Vinarija Čitluk, now in a bigger, more practical 1-litre bottle. Ideal for a larger crowd, or simply so it does not run out mid-evening.'
    },
    // Its own photograph now — the 1L bottle carries a visibly different
    // label ("Hercegovačka Blatina", 1850, Mostarsko vinogorje) from the
    // 0.75L shot the two sizes used to share.
    price: 690,
    rank: 13,
    img: 'images/blatina-citluk-1l.webp'
  },
  {
    id: 'zilavka-citluk-1l',
    quickTag: 'svakodnevno',
    tag: { sr: 'Laka klasika', en: 'Easy classic' },
    tagIcon: 'feather',
    tag2: { sr: 'Za veće društvo', en: 'For a bigger crowd' },
    name: { sr: 'Žilavka Čitluk', en: 'Žilavka Čitluk' },
    volume: '1L',
    subtitle: { sr: 'Belo vino • Vinarija Čitluk', en: 'White Wine • Vinarija Čitluk' },
    type: { sr: 'Belo', en: 'White' },
    desc: {
      sr: 'Retka autohtona sorta uzgojena na karstu Hercegovine. Zlatno-žuta boja, bogata mineralna struktura, note zrele jabuke, breskve i mediteranskog bilja.',
      en: 'A rare indigenous variety grown on the Herzegovina karst. Golden-yellow, rich mineral structure, notes of ripe apple, peach and Mediterranean herbs.'
    },
    price: 690,
    rank: 12,
    img: 'images/zilavka-hercegovina.webp'
  },
  {
    id: 'tribunija-bijelo',
    quickTag: 'preporuka',
    tag: { sr: 'Elegantno i lako', en: 'Elegant and easy' },
    tagIcon: 'ribbon',
    name: { sr: 'Tribunia bijelo', en: 'Tribunia bijelo' },
    volume: '0.75L',
    subtitle: { sr: 'Belo vino • Podrumi Vukoje, Trebinje', en: 'White Wine • Podrumi Vukoje, Trebinje' },
    type: { sr: 'Belo', en: 'White' },
    desc: {
      sr: 'Belo vino iz podruma Vukoje u Trebinju, sa mirisom svežeg voća i blagom notom cvetova. Elegantno i lako pitko, ostavlja utisak a da nikoga ne optereti.',
      en: 'A white wine from the Vukoje cellars in Trebinje, with aromas of fresh fruit and a gentle floral note. Elegant and easy to drink, memorable without being demanding.'
    },
    price: 2090,
    rank: 5,
    img: 'images/tribunija-bijelo-v2.webp'
  }
];

// The rail leads with the wines that earn the most on a single bottle sold, so
// whichever filter someone lands on opens with its strongest earner rather than
// with whatever happened to be typed first. The order comes from the margin
// model in the pricing sheet; only the resulting position is kept here, because
// this file is served to anyone who opens the page and the figures behind it
// are not. A wine with no ranking sorts to the end instead of jumping ahead of
// one that has been costed.
WINES.sort((a, b) => (a.rank || 99) - (b.rank || 99));

// ===== Bundles Data =====
const BUNDLES = [
  {
    id: 'bundle-start-duo',
    name: { sr: 'Hercz Start Duo', en: 'Hercz Start Duo' },
    subtitle: { sr: 'Metoh Vranac + Tamjanika Galerija', en: 'Metoh Vranac + Tamjanika Galerija' },
    badge: { sr: 'Za prvi put', en: 'Start here' },
    desc: {
      sr: 'Jedno crveno i jedno belo, oba pitka i bez pretenzija. Najlakši način da vidite šta Hercegovina radi, bez velike porudžbine.',
      en: 'One red and one white, both easy and unpretentious. The simplest way to see what Herzegovina does, without committing to a big order.'
    },
    wines: ['tvrdos-metoh-vranac', 'tamjanika-galerija'],
    price: 3290,
    img: 'images/paket-start-duo-v3.webp'
  },
  {
    id: 'bundle-signature-trio',
    name: { sr: 'Hercz Signature Trio', en: 'Hercz Signature Trio' },
    subtitle: {
      sr: 'Metoh Vranac + Tamjanika Galerija + Tribunia bijelo',
      en: 'Metoh Vranac + Tamjanika Galerija + Tribunia bijelo'
    },
    desc: {
      sr: 'Naš glavni izbor: manastirsko crveno, aromatična Tamjanika i elegantna Tribunia. Tri različita karaktera u jednoj kutiji.',
      en: 'Our main selection: a monastery red, the aromatic Tamjanika and the elegant Tribunia. Three different characters in one box.'
    },
    badge: { sr: 'Najpopularnije', en: 'Most popular' },
    wines: ['tvrdos-metoh-vranac', 'tamjanika-galerija', 'tribunija-bijelo'],
    price: 5390,
    featured: true,
    img: 'images/paket-signature-trio-v3.webp'
  },
  {
    id: 'bundle-premium-trio',
    name: { sr: 'Hercz Premium Trio', en: 'Hercz Premium Trio' },
    subtitle: {
      sr: 'Metoh Vranac + Tribunia bijelo + Zlatna Selekcija',
      en: 'Metoh Vranac + Tribunia bijelo + Zlatna Selekcija'
    },
    desc: {
      sr: 'Manastirsko crveno, elegantna Tribunia i Zlatna Selekcija kao kruna. Paket za poklon ili za veče koje treba da se pamti.',
      en: 'A monastery red, the elegant Tribunia and the Zlatna Selekcija to crown it. A bundle for a gift, or for an evening meant to be remembered.'
    },
    wines: ['tvrdos-metoh-vranac', 'tribunija-bijelo', 'zlatna-selekcija-bijelo'],
    price: 7590,
    img: 'images/paket-premium-trio-v3.webp'
  }
];

// A bundle stores only its own price and which wines it contains. The sum of
// the parts, the difference against it and the bottle count are derived from
// WINES on every load, so changing a wine's price can never leave a bundle
// advertising a saving that no longer adds up. The bundles are currently
// priced at exactly the sum of their bottles — what they offer is the choosing
// and the single box, not a discount — so the difference is zero and the card
// shows no struck-through price. Price one below its parts and the saving
// reappears on its own.
(function deriveBundleTotals() {
  const priceOf = id => {
    const wine = WINES.find(w => w.id === id);
    if (!wine) throw new Error('Paket se poziva na nepoznato vino: ' + id);
    return wine.price;
  };
  BUNDLES.forEach(bundle => {
    bundle.count = bundle.wines.length;
    bundle.originalPrice = bundle.wines.reduce((sum, id) => sum + priceOf(id), 0);
    bundle.saving = bundle.originalPrice - bundle.price;
    if (bundle.saving < 0) {
      console.warn(
        `Paket "${bundle.name.sr}" je skuplji od zbira pojedinačnih cena ` +
        `(${bundle.price} > ${bundle.originalPrice}).`);
    }
  });
})();

// One place builds a product-page URL, so the homepage links and the page's
// own related-wine links can never drift into different shapes.
const WINE_URL_PARAM = 'w';
const BUNDLE_URL_PARAM = 'p';

// Cloudflare Pages serves vino.html at /vino and permanently redirects the
// .html form to it. Linking to vino.html therefore costs every visitor a
// redirect before the page even starts, and hands search engines an address
// that is not the one they will end up indexing — so the extensionless form
// is the only one this site ever writes down.
function wineHref(id) {
  return 'vino?' + WINE_URL_PARAM + '=' + encodeURIComponent(id);
}

function bundleHref(id) {
  return 'paket?' + BUNDLE_URL_PARAM + '=' + encodeURIComponent(id);
}

// ===== Cart storage =====
// The cart is read and written by three separate scripts: the homepage, the
// wine page and the bundle page. Each used to carry its own copy of this
// logic, and the copies drifted — one read a storage fallback the others
// never wrote, and none of them noticed the cart changing after the page had
// already rendered. That last gap is what a customer actually hit: a bottle
// added on a product page, then the back button, and the basket in the header
// said nothing was in it. A phone restores the previous page from the
// back/forward cache without re-running a line of this file, so a count
// computed once at load is a count that goes stale.
//
// There is one implementation now, and every page subscribes to it.
const CartStore = (function () {
  const KEY = 'hercegCart';
  // A cart still sitting there the next day reads as a glitch, not a
  // courtesy. Six hours covers "let me think it over and come back tonight";
  // the clock restarts on every write, so a long session never expires while
  // someone is still shopping.
  const TTL_MS = 6 * 60 * 60 * 1000;

  const isKnown = id => WINES.some(w => w.id === id) || BUNDLES.some(b => b.id === id);

  // Every row leaves this function in the same shape, whichever page wrote it,
  // so no page has to guess whether isBundle is missing or merely false.
  const normalise = i => ({ id: i.id, qty: i.qty, isBundle: !!i.isBundle });

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (err) {
      // Storage unavailable — there is nothing to clear.
    }
  }

  // Corrupt or unavailable storage must never take a page down.
  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
      // Carts written before the expiry existed are bare arrays with no
      // timestamp — those are exactly the stale ones this is meant to clear.
      const fresh = parsed
        && Array.isArray(parsed.items)
        && typeof parsed.savedAt === 'number'
        && Date.now() - parsed.savedAt <= TTL_MS;
      if (!fresh) {
        clear();
        return [];
      }
      // A saved cart outlives the catalogue, so drop anything that no longer
      // exists rather than rendering a broken row.
      return parsed.items
        .filter(i => i && typeof i.id === 'string' && i.qty > 0 && isKnown(i.id))
        .map(normalise);
    } catch (err) {
      return [];
    }
  }

  function write(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        items: items.map(normalise),
        savedAt: Date.now()
      }));
    } catch (err) {
      // Private mode or quota exceeded — the cart still works for this view.
    }
  }

  const count = items => items.reduce((sum, i) => sum + i.qty, 0);

  // Two carts are the same cart only if they hold the same rows in the same
  // order with the same quantities. Used to skip a re-render that would
  // change nothing on screen.
  const same = (a, b) => JSON.stringify(a.map(normalise)) === JSON.stringify(b.map(normalise));

  // Every way the stored cart can change while a page is already on screen:
  //   - another tab writes it (storage);
  //   - this page is restored from the back/forward cache, which is what the
  //     back button does on a phone, without re-running any script (pageshow
  //     with persisted);
  //   - the tab is brought back to the foreground after the customer was in
  //     another app, which iOS does not always report as a pageshow.
  function subscribe(onChange) {
    window.addEventListener('storage', e => {
      // A null key means the whole store was cleared.
      if (e.key === null || e.key === KEY) onChange();
    });
    window.addEventListener('pageshow', e => {
      if (e.persisted) onChange();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') onChange();
    });
  }

  return { KEY, TTL_MS, read, write, clear, count, same, subscribe };
})();

// ===== Search metadata =====
// The product pages are one HTML file each, told apart by a query parameter,
// so their canonical link and structured data cannot be written into the
// markup — they have to be built per product at render time. Both product
// pages do it through here rather than each keeping its own copy, which is
// how the bundle page ended up with neither.
const SITE_ORIGIN = 'https://athlean-fast.pages.dev/';

const absUrl = pathOrHref => SITE_ORIGIN + String(pathOrHref).replace(/^\//, '');

// Everything is sold before it is stocked: the shop is in its pre-sale phase
// and the confirmation says so. PreOrder is what that is, and claiming
// InStock instead would be a promise the shop has not made.
const SCHEMA_AVAILABILITY = 'https://schema.org/PreOrder';

const SELLER = { '@type': 'Organization', name: 'Hercz Wines', url: SITE_ORIGIN };

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = absUrl(href);
}

// Replaces any block this page wrote before, so re-rendering cannot leave two
// contradictory Product records in one document.
function setProductJsonLd(product) {
  const previous = document.getElementById('productJsonLd');
  if (previous) previous.remove();
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.id = 'productJsonLd';
  el.textContent = JSON.stringify(product);
  document.head.appendChild(el);
}

// Only fields the catalogue actually holds are emitted. No invented rating,
// review count or stock number — a fabricated one is worse than none, both
// for the buyer and for the search listing.
function productOffer(price, href) {
  return {
    '@type': 'Offer',
    price: price,
    priceCurrency: 'RSD',
    availability: SCHEMA_AVAILABILITY,
    itemCondition: 'https://schema.org/NewCondition',
    url: absUrl(href),
    seller: SELLER
  };
}

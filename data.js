// ===== Sadržaj sajta =====
// Jedino mesto gde se menja ono što sajt prikazuje: kontakt, rezultati,
// nivoi, mentorstvo, transformacije, lokacije i pitanja u upitniku. Početna
// stranica, stranica nivoa i sitemap čitaju sve odavde.
//
// Sve označeno sa PRIVREMENO je primer koji stoji dok ne stigne pravi
// sadržaj (snimci, slike, kontakt, lokacije).

// ===== Adresa sajta =====
// Menja se na jednom mestu kad se poveže pravi domen. Ista vrednost mora
// biti i u canonical/og linkovima u index.html (test to proverava).
const SITE_ORIGIN = 'https://pecapecaa.github.io/Athlean-fast/';
const BRAND = 'AthLean Fast';

// ===== Kontakt =====
// PRIVREMENO: broj i mail (Instagram je pravi). Upisuje se na sve stranice
// odavde.
const CONTACT = {
  phone: '+387 XX XXX XXX',
  phoneHref: '+38700000000',
  whatsapp: '38700000000',
  email: 'upiti@example.com',
  instagram: { handle: '@sima.markoo', url: 'https://www.instagram.com/sima.markoo/' }
};

// ===== Kakve rezultate donosi =====
// icon: ikonica iznad naslova; big: veliki broj umesto ikonice.
const RESULTS = [
  {
    icon: 'timer',
    title: { sr: 'Treniraj pametno', en: 'Train smart' },
    text: {
      sr: 'Ne rasipaj slobodno vrijeme. 30, 45 ili 60 minuta treninga.',
      en: 'Don\'t waste your free time. 30, 45 or 60 minutes of training.'
    }
  },
  {
    icon: 'trophy',
    title: { sr: 'Mentalna snaga', en: 'Mental strength' },
    text: {
      sr: 'Budi pobjednik i okruži se pobjednicima.',
      en: 'Be a winner and surround yourself with winners.'
    }
  },
  {
    icon: 'bolt',
    title: { sr: 'Energija', en: 'Energy' },
    text: {
      sr: 'Više energije, bolji fokus.',
      en: 'More energy, sharper focus.'
    }
  },
  {
    icon: 'calendar',
    title: { sr: '365 fit', en: '365 fit' },
    text: {
      sr: 'Izgradi mišić, istopi salo, izdefiniši tijelo i budi fit tokom cijele godine.',
      en: 'Build muscle, melt fat, define your body and stay fit all year round.'
    }
  }
];

// ===== Nivoi =====
// video: putanja do kratkog snimka (npr. 'videos/pocetni.mp4'). Dok je
// prazno, prikazuje se poster.
const LEVELS = [
  {
    id: 'pocetni',
    step: 1,
    name: { sr: 'Početni nivo', en: 'Beginner level' },
    subtitle: { sr: 'Za one koji tek kreću', en: 'For those just starting out' },
    desc: {
      sr: 'Učiš osnovne pokrete sa kettlebellom i vlastitim tijelom. Gradiš tehniku, naviku i kondiciju bez preopterećenja.',
      en: 'Learn the basic movements with a kettlebell and your own body. Build technique, the habit and conditioning without overload.'
    },
    duration: '30 min',
    equipment: { sr: '1–2 kettlebella', en: '1–2 kettlebells' },
    poster: 'images/nivoi/pocetni.svg',
    video: ''
  },
  {
    id: 'srednji',
    step: 2,
    name: { sr: 'Srednji nivo', en: 'Intermediate level' },
    subtitle: { sr: 'Za one koji već treniraju', en: 'For those already training' },
    desc: {
      sr: 'Veći tempo i složeniji pokreti. Gradiš mišić, topiš salo i podižeš kondiciju.',
      en: 'A faster pace and more complex movements. Build muscle, melt fat and raise your conditioning.'
    },
    duration: '45 min',
    equipment: { sr: '2 kettlebella', en: '2 kettlebells' },
    poster: 'images/nivoi/srednji.svg',
    video: ''
  },
  {
    id: 'napredni',
    step: 3,
    name: { sr: 'Napredni nivo', en: 'Advanced level' },
    subtitle: { sr: 'Za iskusne koji traže maksimum', en: 'For the experienced, chasing the maximum' },
    desc: {
      sr: 'Teški kompleksi sa 2 kettlebella i eksplozivni pokreti. Atletski izvajano tijelo na najvišem nivou.',
      en: 'Heavy double-kettlebell complexes and explosive movements. An athletic, sculpted body at the highest level.'
    },
    duration: '60 min',
    equipment: { sr: '2 kettlebella', en: '2 kettlebells' },
    poster: 'images/nivoi/napredni.svg',
    video: ''
  }
];

// Sadržaj stranice nivoa (samo srpski).
// PRIVREMENO: primeri treninga dok ne stignu pravi.
const LEVEL_DETAILS = {
  pocetni: {
    lead: 'Prvi korak je najvažniji. Učiš pravilnu tehniku osnovnih pokreta sa kettlebellom i vlastitim tijelom, korak po korak, bez preopterećenja i bez povreda.',
    workout: [
      { name: 'Zagrijavanje', dose: '5 min', note: 'Mobilnost zglobova i lagani kardio' },
      { name: 'Goblet čučanj', dose: '3 × 12', note: 'Kettlebell uz grudi, leđa prava' },
      { name: 'Kettlebell swing', dose: '3 × 15', note: 'Snaga dolazi iz kukova, ne iz ruku' },
      { name: 'Sklekovi', dose: '3 × 8–10', note: 'Na koljenima, dok ne ojača' },
      { name: 'Veslanje kettlebellom', dose: '3 × 10 po ruci', note: 'Lopatica ide ka kičmi' },
      { name: 'Iskorak u mjestu', dose: '3 × 10 po nozi', note: 'Kontrolisano, bez žurbe' },
      { name: 'Plank', dose: '3 × 30 s', note: 'Stomak i zadnjica zategnuti' }
    ],
    forYou: [
      'Tek počinješ da treniraš ili se vraćaš poslije duže pauze',
      'Želiš da naučiš pravilnu tehniku prije nego što podigneš tempo',
      'Imaš malo vremena i treba ti jasan, kratak trening'
    ],
    notForYou: 'Ako redovno treniraš i osnovne pokrete sa kettlebellom radiš bez problema, srednji nivo će ti dati više.',
    focus: { snaga: 2, kondicija: 3, tehnika: 5, mobilnost: 4, intenzitet: 2 }
  },
  srednji: {
    lead: 'Osnova je tu, sada gradimo mišić i podižemo tempo. Pokreti postaju složeniji, a trening zahtjevniji iz sedmice u sedmicu.',
    workout: [
      { name: 'Zagrijavanje i aktivacija', dose: '8 min', note: 'Mobilnost kukova i ramena' },
      { name: 'Dvoručni swing', dose: '4 × 20', note: 'Eksplozivno, pa kontrolisano nazad' },
      { name: 'Clean & press', dose: '4 × 8 po ruci', note: 'Jedan kettlebell, stabilan trup' },
      { name: 'Prednji čučanj sa 2 kettlebella', dose: '4 × 10', note: 'Laktovi ispod kettlebella' },
      { name: 'Renegade veslanje', dose: '3 × 8 po ruci', note: 'Iz pozicije skleka, kukovi mirni' },
      { name: 'Farmer\'s walk', dose: '3 × 40 m', note: '2 kettlebella, uspravno držanje' },
      { name: 'Kružni finiš', dose: '3 kruga × 40 s', note: 'Burpees, penjači, skokovi' }
    ],
    forYou: [
      'Treniraš redovno, ali si zapeo na istom mjestu',
      'Osnovne pokrete radiš pravilno i spreman si za veći tempo',
      'Želiš vidljivije rezultate u snazi i izgledu'
    ],
    notForYou: 'Ako tek počinješ, kreni od početnog nivoa: najbrži napredak dolazi iz dobre osnove.',
    focus: { snaga: 4, kondicija: 4, tehnika: 3, mobilnost: 3, intenzitet: 4 }
  },
  napredni: {
    lead: 'Trening kao kod sportista. Teški kompleksi sa 2 kettlebella, eksplozivni pokreti i metabolički finiš za atletski izvajano tijelo.',
    workout: [
      { name: 'Zagrijavanje i aktivacija', dose: '10 min', note: 'Dinamička mobilnost i aktivacija' },
      { name: 'Dupli clean & jerk', dose: '5 × 5', note: '2 kettlebella, eksplozivno' },
      { name: 'Dupli prednji čučanj', dose: '5 × 6', note: 'Puna dubina, puna kontrola' },
      { name: 'Snatch', dose: '4 × 8 po ruci', note: 'Kettlebell mekano preko šake' },
      { name: 'Pistol čučanj', dose: '4 × 5 po nozi', note: 'Kettlebell kao kontrateg' },
      { name: 'Veslanje sa 2 kettlebella', dose: '4 × 8', note: 'Pretklon, neutralna leđa' },
      { name: 'Metabolički finiš', dose: '10 min', note: 'Svakog minuta 10 swingova i 5 burpeesa' }
    ],
    forYou: [
      'Imaš bar godinu ili dvije ozbiljnog treninga iza sebe',
      'Želiš atletske performanse, a ne samo izgled',
      'Spreman si na zahtjevne treninge i disciplinu'
    ],
    notForYou: 'Ako nemaš ozbiljnu osnovu, ovaj intenzitet nosi rizik od povrede. Kreni od nivoa niže, stići ćeš brže nego što misliš.',
    focus: { snaga: 5, kondicija: 5, tehnika: 4, mobilnost: 3, intenzitet: 5 }
  }
};

// ===== Online mentorstvo =====
const MENTORSHIP = [
  {
    icon: 'nutrition',
    title: { sr: 'Plan ishrane', en: 'Nutrition plan' },
    text: { sr: 'Ishrana prilagođena tvom cilju, bez gladovanja.', en: 'Nutrition built around your goal, without starving.' }
  },
  {
    icon: 'plan',
    title: { sr: 'Plan treninga', en: 'Training plan' },
    text: { sr: 'Treninzi sa kettlebellom i vlastitim tijelom, složeni za tebe.', en: 'Kettlebell and bodyweight sessions, put together for you.' }
  },
  {
    icon: 'library',
    title: { sr: 'Baza vježbi', en: 'Exercise library' },
    text: { sr: 'Svaka vježba objašnjena kroz video, da tehnika bude ispravna.', en: 'Every exercise explained on video, so your technique is right.' }
  },
  {
    big: '24/7',
    title: { sr: 'Podrška trenera', en: 'Coach support' },
    text: { sr: 'Trener je tu za svako pitanje, kad god ti zatreba.', en: 'Your coach is there for every question, whenever you need it.' }
  }
];

// ===== Transformacije =====
// Slike pre/posle su uspravne (3:5). Nova transformacija je još jedan objekat
// u nizu.
//
// Kako se prikazuju, bira se jednom rečju:
//   'klizac'  jedna slika preko druge, sa linijom koja se pomera
//   'pored'   "Prije" i "Poslije" jedna pored druge
//   'traka'   sve transformacije u traci koja polako klizi sama
//   'izbor'   sva tri načina, jedan ispod drugog, dok se ne izabere: oni bez
//             layout idu u klizač, oni sa layout: 'pair' jedno pored drugog,
//             a u traci su svi
const TRANSFORMATIONS_VIEW = 'izbor';

// Ispod slika, ako postoje (nisu obavezni):
//   quote:  utisak klijenta, npr. { sr: 'Za 4 mjeseca...', en: 'In 4 months...' }
//   name:   ime, npr. { sr: 'Ana', en: 'Ana' }
//   detail: npr. { sr: '4 mjeseca', en: '4 months' }
const TRANSFORMATIONS = [
  {
    before: 'images/transformacije/marko-prije.jpg',
    after: 'images/transformacije/marko-poslije.jpg',
    name: { sr: 'Marko Simović', en: 'Marko Simović' },
    detail: { sr: 'Trener AthLean Fast', en: 'AthLean Fast coach' }
  },
  {
    before: 'images/transformacije/transformacija-1-prije.jpg',
    after: 'images/transformacije/transformacija-1-poslije.jpg'
  },
  {
    before: 'images/transformacije/transformacija-2-prije.jpg',
    after: 'images/transformacije/transformacija-2-poslije.jpg'
  },
  {
    before: 'images/transformacije/transformacija-3-prije.jpg',
    after: 'images/transformacije/transformacija-3-poslije.jpg',
    layout: 'pair'
  },
  {
    before: 'images/transformacije/transformacija-4-prije.jpg',
    after: 'images/transformacije/transformacija-4-poslije.jpg',
    layout: 'pair'
  },
  {
    before: 'images/transformacije/transformacija-5-prije.jpg',
    after: 'images/transformacije/transformacija-5-poslije.jpg',
    layout: 'pair'
  },
  {
    before: 'images/transformacije/transformacija-6-prije.jpg',
    after: 'images/transformacije/transformacija-6-poslije.jpg',
    layout: 'pair'
  }
];

// ===== Lokacije =====
// PRIVREMENO: prave lokacije treninga.
const LOCATIONS = [
  {
    name: { sr: 'Lokacija 1', en: 'Location 1' },
    place: { sr: 'Grad, adresa', en: 'City, address' },
    note: { sr: 'Treninzi uživo', en: 'In-person training' }
  },
  {
    name: { sr: 'Lokacija 2', en: 'Location 2' },
    place: { sr: 'Grad, adresa', en: 'City, address' },
    note: { sr: 'Treninzi uživo', en: 'In-person training' }
  },
  {
    name: { sr: 'Online', en: 'Online' },
    place: { sr: 'Bilo gdje', en: 'Anywhere' },
    note: { sr: 'Treniraš gdje ti odgovara', en: 'Train wherever suits you' }
  }
];

// ===== Upitnik za prijavu =====
// Drugi korak prijave se crta iz ove liste, pa se pitanja menjaju samo
// ovde. type: 'choice' (jedan odgovor) ili 'text' (slobodan unos).
// Pitanje 'nivo' dobija odgovore iz LEVELS.
const JOIN_QUESTIONS = [
  {
    id: 'cilj',
    type: 'choice',
    required: true,
    label: { sr: 'Koji ti je glavni cilj?', en: 'What is your main goal?' },
    options: [
      { value: 'misic', label: { sr: 'Izgraditi mišić', en: 'Build muscle' } },
      { value: 'salo', label: { sr: 'Istopiti salo', en: 'Melt fat' } },
      { value: 'definicija', label: { sr: 'Izdefinisati tijelo', en: 'Define my body' } },
      { value: 'energija', label: { sr: 'Više energije i kondicije', en: 'More energy and conditioning' } }
    ]
  },
  {
    id: 'nivo',
    type: 'choice',
    required: true,
    label: { sr: 'Koliko si utreniran?', en: 'How trained are you?' },
    options: 'levels'
  },
  {
    id: 'vrijeme',
    type: 'choice',
    required: true,
    label: { sr: 'Koliko vremena imaš za trening?', en: 'How much time do you have per session?' },
    options: [
      { value: '30', label: { sr: '30 minuta', en: '30 minutes' } },
      { value: '45', label: { sr: '45 minuta', en: '45 minutes' } },
      { value: '60', label: { sr: '60 minuta', en: '60 minutes' } }
    ]
  },
  {
    id: 'kettlebell',
    type: 'choice',
    required: true,
    label: { sr: 'Imaš li kettlebell?', en: 'Do you have kettlebells?' },
    options: [
      { value: 'dva', label: { sr: 'Da, dva', en: 'Yes, two' } },
      { value: 'jedan', label: { sr: 'Da, jedan', en: 'Yes, one' } },
      { value: 'nema', label: { sr: 'Nemam još', en: 'Not yet' } }
    ]
  },
  {
    id: 'mjesto',
    type: 'choice',
    required: true,
    label: { sr: 'Gdje bi trenirao?', en: 'Where would you train?' },
    options: [
      { value: 'kuca', label: { sr: 'Kod kuće', en: 'At home' } },
      { value: 'napolju', label: { sr: 'Napolju', en: 'Outdoors' } },
      { value: 'teretana', label: { sr: 'Teretana', en: 'Gym' } },
      { value: 'kombinovano', label: { sr: 'Kombinovano', en: 'A mix' } }
    ]
  },
  {
    id: 'napomena',
    type: 'text',
    required: false,
    label: { sr: 'Povrede, zdravstvena ograničenja ili napomene', en: 'Injuries, health limitations or notes' },
    placeholder: { sr: 'Npr. bol u koljenu, astma, radim u smjenama…', en: 'E.g. knee pain, asthma, shift work…' }
  }
];

// Odgovor "još ne znam" za pitanja čiji odgovori dolaze iz podataka.
const UNSURE_OPTION = { value: 'ne-znam', label: { sr: 'Ne znam', en: 'Not sure' } };

// Odgovori za pitanje, sa rešenim izvorima iz podataka.
function questionOptions(q) {
  if (q.options === 'levels') {
    return LEVELS.map(l => ({ value: l.id, label: l.name })).concat(UNSURE_OPTION);
  }
  return q.options || [];
}

// ===== Linkovi =====
// Jedan oblik adrese za svaku stranicu, da se linkovi nikad ne razilaze.
// Relativni su, pa sajt radi i na domenu i u podfolderu (GitHub Pages).
const LEVEL_URL_PARAM = 'n';

function levelHref(id) {
  return 'nivo?' + LEVEL_URL_PARAM + '=' + encodeURIComponent(id);
}

// Prijava se uvek otvara na početnoj stranici; stranica nivoa šalje ovamo
// sa izabranim nivoom.
function joinHref(opts) {
  const params = new URLSearchParams();
  params.set('prijava', '1');
  if (opts && opts.level) params.set('nivo', opts.level);
  if (opts && opts.source) params.set('izvor', opts.source);
  return './?' + params.toString();
}

// ===== Metapodaci za pretragu =====
const absUrl = href => SITE_ORIGIN + String(href).replace(/^\.?\//, '');

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = absUrl(href);
}

function setMeta(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', value);
}

// Zamenjuje blok koji je stranica ranije upisala, da ih nikad ne bude dva.
function setPageJsonLd(data) {
  const previous = document.getElementById('pageJsonLd');
  if (previous) previous.remove();
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.id = 'pageJsonLd';
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
}

const PROVIDER = { '@type': 'Organization', name: BRAND, url: SITE_ORIGIN };

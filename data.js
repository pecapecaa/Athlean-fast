// ===== Sadržaj sajta =====
// Jedino mesto gde se menja ono što sajt prikazuje: nivoi, programi
// mentorstva, transformacije i pitanja u upitniku. Početna stranica, stranica
// nivoa, stranica programa i sitemap čitaju sve odavde.
//
// Sve označeno sa PRIVREMENO je primer koji stoji dok ne stigne pravi
// sadržaj (tekst, snimci, slike, cene).

// ===== Adresa sajta =====
// Menja se na jednom mestu kad se poveže pravi domen. Ista vrednost mora
// biti i u canonical/og linkovima u index.html (test to proverava).
const SITE_ORIGIN = 'https://pecapecaa.github.io/Athlean-fast/';
const BRAND = 'AthLean Fast';

// ===== Nivoi utreniranosti =====
// video: putanja do kratkog snimka (npr. 'videos/pocetnik.mp4'). Dok je
// prazno, prikazuje se poster.
const LEVELS = [
  {
    id: 'pocetnik',
    step: 1,
    name: { sr: 'Početnik', en: 'Beginner' },
    subtitle: { sr: 'Za one koji tek kreću', en: 'For those just starting out' },
    desc: {
      sr: 'Učiš osnovne pokrete pravilno, gradiš naviku i kondiciju bez preopterećenja. Kratki, jasni treninzi koje možeš da odradiš i kod kuće.',
      en: 'Learn the basic movements properly, build the habit and your conditioning without overload. Short, clear sessions you can do at home too.'
    },
    // PRIVREMENO: parametri primera treninga
    frequency: { sr: '3× sedmično', en: '3× a week' },
    duration: '30–40 min',
    equipment: { sr: 'Bez opreme ili osnovna', en: 'None or basic' },
    poster: 'images/nivoi/pocetnik.svg',
    video: ''
  },
  {
    id: 'srednji',
    step: 2,
    name: { sr: 'Srednje napredni', en: 'Intermediate' },
    subtitle: { sr: 'Za one koji već treniraju', en: 'For those already training' },
    desc: {
      sr: 'Podižeš opterećenje i intenzitet, radiš na snazi i obliku tijela. Za one koji treniraju redovno, a žele da se pomjere sa mrtve tačke.',
      en: 'Raise the load and the intensity, work on strength and shape. For people who train regularly and want to get past a plateau.'
    },
    frequency: { sr: '4× sedmično', en: '4× a week' },
    duration: '45–60 min',
    equipment: { sr: 'Teretana ili bučice', en: 'Gym or dumbbells' },
    poster: 'images/nivoi/srednji.svg',
    video: ''
  },
  {
    id: 'napredni',
    step: 3,
    name: { sr: 'Napredni', en: 'Advanced' },
    subtitle: { sr: 'Za iskusne koji traže maksimum', en: 'For the experienced, chasing the maximum' },
    desc: {
      sr: 'Eksplozivnost, snaga i atletska izdržljivost na najvišem nivou. Zahtjevni treninzi za one koji imaju ozbiljnu osnovu iza sebe.',
      en: 'Explosiveness, strength and athletic endurance at the highest level. Demanding sessions for people with a serious base behind them.'
    },
    frequency: { sr: '5× sedmično', en: '5× a week' },
    duration: '60–75 min',
    equipment: { sr: 'Teretana', en: 'Gym' },
    poster: 'images/nivoi/napredni.svg',
    video: ''
  }
];

// Sadržaj stranice nivoa. Stranica je samo na srpskom.
// PRIVREMENO: primeri treninga i opisi dok ne stignu pravi.
const LEVEL_DETAILS = {
  pocetnik: {
    lead: 'Prvi korak je najvažniji. Na ovom nivou učiš pravilnu tehniku osnovnih pokreta i gradiš kondiciju korak po korak, bez preopterećenja i bez povreda.',
    workout: [
      { name: 'Zagrijavanje', dose: '5 min', note: 'Lagani kardio i mobilnost zglobova' },
      { name: 'Čučanj sa sopstvenom težinom', dose: '3 × 12', note: 'Leđa prava, koljena prate prste' },
      { name: 'Sklekovi', dose: '3 × 8–10', note: 'Na koljenima, dok ne ojača' },
      { name: 'Iskorak u mjestu', dose: '3 × 10 po nozi', note: 'Kontrolisano, bez žurbe' },
      { name: 'Veslanje sa trakom ili bučicom', dose: '3 × 12', note: 'Lopatice skupljene na vrhu pokreta' },
      { name: 'Plank', dose: '3 × 30 s', note: 'Stomak i zadnjica zategnuti' },
      { name: 'Istezanje', dose: '5 min', note: 'Cijelo tijelo, polako' }
    ],
    forYou: [
      'Tek počinješ da treniraš ili se vraćaš poslije duže pauze',
      'Želiš da naučiš pravilnu tehniku prije nego što podigneš intenzitet',
      'Imaš ograničeno vrijeme i treba ti jasan, kratak plan'
    ],
    notForYou: 'Ako redovno treniraš duže od godinu dana i osnovne pokrete radiš bez problema, srednji nivo će ti dati više.',
    focus: { snaga: 2, kondicija: 3, tehnika: 5, mobilnost: 4, intenzitet: 2 }
  },
  srednji: {
    lead: 'Osnova je tu, sada gradimo snagu i oblik. Opterećenje raste iz sedmice u sedmicu, a trening postaje raznovrsniji i zahtjevniji.',
    workout: [
      { name: 'Zagrijavanje i aktivacija', dose: '8 min', note: 'Kardio, mobilnost, aktivacija kukova i ramena' },
      { name: 'Čučanj sa opterećenjem', dose: '4 × 8', note: 'Šipka ili bučice' },
      { name: 'Potisak sa klupe', dose: '4 × 8', note: 'Ili sklekovi sa opterećenjem' },
      { name: 'Rumunsko mrtvo dizanje', dose: '3 × 10', note: 'Fokus na zadnju ložu' },
      { name: 'Zgibovi', dose: '3 × 6–8', note: 'Uz pomoć trake po potrebi' },
      { name: 'Kružni finiš', dose: '3 kruga × 40 s', note: 'Burpees, penjači, skokovi' },
      { name: 'Istezanje', dose: '5 min', note: 'Fokus na kukove i ramena' }
    ],
    forYou: [
      'Treniraš redovno, ali si zapeo na istom mjestu',
      'Osnovne pokrete radiš pravilno i spreman si za veće opterećenje',
      'Želiš vidljivije rezultate u snazi i izgledu'
    ],
    notForYou: 'Ako tek počinješ, kreni od početnog nivoa: najbrži napredak dolazi iz dobre osnove.',
    focus: { snaga: 4, kondicija: 4, tehnika: 3, mobilnost: 3, intenzitet: 4 }
  },
  napredni: {
    lead: 'Trening kao kod sportista. Teška opterećenja, eksplozivni pokreti i metabolički intervali za atletsku građu koja se vidi i osjeti.',
    workout: [
      { name: 'Zagrijavanje i aktivacija', dose: '10 min', note: 'Dinamička mobilnost i aktivacija' },
      { name: 'Čučanj', dose: '5 × 5', note: 'Teško, sa punom kontrolom' },
      { name: 'Mrtvo dizanje', dose: '4 × 5', note: 'Neutralna leđa kroz cijeli pokret' },
      { name: 'Potisak iznad glave', dose: '4 × 6', note: 'Stojeći, stabilan trup' },
      { name: 'Zgibovi sa opterećenjem', dose: '4 × 6', note: 'Puna amplituda' },
      { name: 'Skokovi na kutiju', dose: '4 × 5', note: 'Eksplozivno gore, mekano dolje' },
      { name: 'Sprint intervali', dose: '6 × 20 s', note: 'Pauza 40 s između' }
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
// PRIVREMENO: nazivi, trajanje i sadržaj programa.
// price: iznos u eurima (broj). null = cena se ne prikazuje dok se ne odredi.
const PROGRAMS = [
  {
    id: 'start',
    name: { sr: 'Start', en: 'Start' },
    duration: { sr: '1 mjesec', en: '1 month' },
    badge: { sr: 'Za početak', en: 'Start here' },
    desc: {
      sr: 'Mjesec dana da upoznaš način rada, dobiješ plan napravljen za tebe i vidiš prve rezultate.',
      en: 'One month to get to know the method, get a plan built for you and see the first results.'
    },
    includes: {
      sr: ['Plan treninga prilagođen tebi', 'Osnovne smjernice za ishranu', 'Sedmična provjera napretka'],
      en: ['A training plan built for you', 'Basic nutrition guidelines', 'Weekly progress check']
    },
    price: null,
    image: 'images/programi/start.svg'
  },
  {
    id: 'transformacija',
    name: { sr: 'Transformacija', en: 'Transformation' },
    duration: { sr: '3 mjeseca', en: '3 months' },
    badge: { sr: 'Najpopularnije', en: 'Most popular' },
    featured: true,
    desc: {
      sr: 'Dovoljno vremena za pravu promjenu. Trening i ishrana se prilagođavaju kako napreduješ, uz redovne provjere.',
      en: 'Enough time for real change. Training and nutrition adapt as you progress, with regular check-ins.'
    },
    includes: {
      sr: ['Plan treninga koji raste sa tobom', 'Plan ishrane prilagođen cilju', 'Sedmične provjere i korekcije', 'Analiza tehnike kroz video'],
      en: ['A training plan that grows with you', 'A nutrition plan built for your goal', 'Weekly check-ins and adjustments', 'Technique review on video']
    },
    price: null,
    image: 'images/programi/transformacija.svg'
  },
  {
    id: 'elite',
    name: { sr: 'Elite', en: 'Elite' },
    duration: { sr: '6 mjeseci', en: '6 months' },
    badge: { sr: 'Maksimalni rezultati', en: 'Maximum results' },
    desc: {
      sr: 'Pola godine rada jedan na jedan. Za one koji žele potpunu promjenu i atletsku formu koja ostaje.',
      en: 'Six months of one-to-one work. For people who want a complete change and athletic shape that lasts.'
    },
    includes: {
      sr: ['Sve iz programa Transformacija', 'Video poziv jednom mjesečno', 'Prioritetna podrška', 'Plan za održavanje forme poslije programa'],
      en: ['Everything in Transformation', 'A video call once a month', 'Priority support', 'A maintenance plan after the programme']
    },
    price: null,
    image: 'images/programi/elite.svg'
  }
];

// Sadržaj stranice programa (samo srpski).
const PROGRAM_DETAILS = {
  start: {
    promise: 'Mjesec dana da vidiš kako izgleda trening sa planom napravljenim samo za tebe, i da osjetiš prve promjene.',
    forYou: [
      'Želiš da probaš online mentorstvo prije dužeg angažmana',
      'Treba ti jasan plan i neko ko će ga prilagoditi tebi',
      'Želiš da kreneš odmah, bez velikog ulaganja'
    ],
    notForYou: 'Ako ciljaš veliku promjenu u izgledu i formi, mjesec dana je kratko. Program Transformacija ti daje dovoljno vremena.'
  },
  transformacija: {
    promise: 'Tri mjeseca, jedan cilj: vidljiva promjena u snazi, kondiciji i izgledu, uz plan koji se mijenja kako ti napreduješ.',
    forYou: [
      'Želiš vidljive rezultate, a ne samo bolji osjećaj',
      'Treba ti neko ko te drži odgovornim iz sedmice u sedmicu',
      'Spreman si da trening i ishranu shvatiš ozbiljno'
    ],
    notForYou: 'Ako tražiš brzo rješenje bez truda, ovo nije to. Rezultati dolaze iz rada, a mi ga činimo pametnijim.'
  },
  elite: {
    promise: 'Šest mjeseci rada jedan na jedan, za atletsku formu koja ne nestaje kada program završi.',
    forYou: [
      'Želiš potpunu promjenu tijela i navika',
      'Cijeniš direktan kontakt i redovne razgovore sa trenerom',
      'Želiš da naučiš da sam održavaš formu i poslije programa'
    ],
    notForYou: 'Ako još nisi siguran da je online mentorstvo za tebe, kreni sa programom Start pa nastavi.'
  }
};

// Koraci saradnje: sekcija "Kako funkcioniše" na početnoj i stranice programa.
const HOW_STEPS = [
  {
    icon: 'form',
    title: { sr: 'Prijava i upitnik', en: 'Sign-up and questionnaire' },
    text: {
      sr: 'Izabereš program i popuniš kratak upitnik o cilju, iskustvu i vremenu koje imaš.',
      en: 'Choose a programme and fill in a short questionnaire about your goal, experience and time.'
    }
  },
  {
    icon: 'plan',
    title: { sr: 'Tvoj plan', en: 'Your plan' },
    text: {
      sr: 'Na osnovu upitnika dobijaš plan treninga i ishrane napravljen samo za tebe.',
      en: 'Based on the questionnaire you get a training and nutrition plan made just for you.'
    }
  },
  {
    icon: 'track',
    title: { sr: 'Praćenje i korekcije', en: 'Tracking and adjustments' },
    text: {
      sr: 'Redovno pratimo napredak i prilagođavamo plan, dok ne dođeš do cilja.',
      en: 'We track your progress and adjust the plan regularly until you reach your goal.'
    }
  }
];

// ===== Transformacije =====
// PRIVREMENO: slike pre/posle, uz dozvolu klijenata.
const TRANSFORMATIONS = [
  {
    before: 'images/transformacije/prije.svg',
    after: 'images/transformacije/poslije.svg',
    name: { sr: 'Ime klijenta', en: 'Client name' },
    detail: { sr: 'Trajanje · rezultat', en: 'Duration · result' }
  },
  {
    before: 'images/transformacije/prije.svg',
    after: 'images/transformacije/poslije.svg',
    name: { sr: 'Ime klijenta', en: 'Client name' },
    detail: { sr: 'Trajanje · rezultat', en: 'Duration · result' }
  },
  {
    before: 'images/transformacije/prije.svg',
    after: 'images/transformacije/poslije.svg',
    name: { sr: 'Ime klijenta', en: 'Client name' },
    detail: { sr: 'Trajanje · rezultat', en: 'Duration · result' }
  }
];

// ===== Upitnik za prijavu =====
// Drugi korak prijave se crta iz ove liste, pa se pitanja menjaju samo
// ovde. type: 'choice' (jedan odgovor) ili 'text' (slobodan unos).
// Pitanje 'program' i 'nivo' dobijaju odgovore iz PROGRAMS i LEVELS.
const JOIN_QUESTIONS = [
  {
    id: 'program',
    type: 'choice',
    required: true,
    label: { sr: 'Koji program te zanima?', en: 'Which programme interests you?' },
    options: 'programs'
  },
  {
    id: 'cilj',
    type: 'choice',
    required: true,
    label: { sr: 'Koji ti je glavni cilj?', en: 'What is your main goal?' },
    options: [
      { value: 'masnoca', label: { sr: 'Skidanje masnoće', en: 'Fat loss' } },
      { value: 'misici', label: { sr: 'Mišićna masa', en: 'Muscle gain' } },
      { value: 'atletska', label: { sr: 'Atletska građa', en: 'Athletic build' } },
      { value: 'kondicija', label: { sr: 'Kondicija i snaga', en: 'Conditioning and strength' } }
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
    id: 'dani',
    type: 'choice',
    required: true,
    label: { sr: 'Koliko dana sedmično možeš da treniraš?', en: 'How many days a week can you train?' },
    options: [
      { value: '2-3', label: { sr: '2–3 dana', en: '2–3 days' } },
      { value: '4', label: { sr: '4 dana', en: '4 days' } },
      { value: '5+', label: { sr: '5 i više', en: '5 or more' } }
    ]
  },
  {
    id: 'mjesto',
    type: 'choice',
    required: true,
    label: { sr: 'Gdje treniraš?', en: 'Where do you train?' },
    options: [
      { value: 'teretana', label: { sr: 'Teretana', en: 'Gym' } },
      { value: 'kuca', label: { sr: 'Kod kuće', en: 'At home' } },
      { value: 'napolju', label: { sr: 'Napolju', en: 'Outdoors' } },
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
const UNSURE_OPTION = { value: 'ne-znam', label: { sr: 'Još ne znam', en: 'Not sure yet' } };

// Odgovori za pitanje, sa rešenim izvorima iz podataka.
function questionOptions(q) {
  if (q.options === 'programs') {
    return PROGRAMS.map(p => ({
      value: p.id,
      label: { sr: p.name.sr + ' · ' + p.duration.sr, en: p.name.en + ' · ' + p.duration.en }
    })).concat(UNSURE_OPTION);
  }
  if (q.options === 'levels') {
    return LEVELS.map(l => ({ value: l.id, label: l.name })).concat(UNSURE_OPTION);
  }
  return q.options || [];
}

// ===== Linkovi =====
// Jedan oblik adrese za svaku stranicu, da se linkovi nikad ne razilaze.
// Relativni su, pa sajt radi i na domenu i u podfolderu (GitHub Pages).
const LEVEL_URL_PARAM = 'n';
const PROGRAM_URL_PARAM = 'p';

function levelHref(id) {
  return 'nivo?' + LEVEL_URL_PARAM + '=' + encodeURIComponent(id);
}

function programHref(id) {
  return 'program?' + PROGRAM_URL_PARAM + '=' + encodeURIComponent(id);
}

// Prijava se uvek otvara na početnoj stranici; podstranice šalju ovamo sa
// izabranim programom i/ili nivoom.
function joinHref(opts) {
  const params = new URLSearchParams();
  params.set('prijava', (opts && opts.program) || '1');
  if (opts && opts.level) params.set('nivo', opts.level);
  if (opts && opts.source) params.set('izvor', opts.source);
  return './?' + params.toString();
}

// ===== Cena =====
function formatPrice(program) {
  if (typeof program.price !== 'number') return '';
  return program.price.toLocaleString('de-DE') + ' €';
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

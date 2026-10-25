# AthLean Fast

Sajt za AthLean Fast: „Atletski izvajano tijelo. Brzo do rezultata."
Sistem treninga sa vlastitim tijelom i kettlebellom, uz online mentorstvo.
Statičan sajt (HTML, CSS, JavaScript), bez build koraka.

Uživo: https://pecapecaa.github.io/Athlean-fast/

## Stranice

| Adresa | Fajlovi | Sadržaj |
|---|---|---|
| `/` | `index.html`, `script.js` | Šta je AthLean Fast, rezultati, nivoi, online mentorstvo, transformacije, pridruži se (upitnik), lokacije, kontakt |
| `/nivo?n=<id>` | `nivo.html`, `nivo.js` | Nivo (početni, srednji, napredni): prvo video, ispod primer treninga, za koga je, fokus |

Početna je jedna stranica koja se samo skroluje: nema menija ni posebnih
stranica za „O nama" i kontakt, gore je samo logo i „Pridruži se".

Zajedničko: `data.js` (sav sadržaj), `components.js` (kartice i kontakt),
`detail.js` + `detail.css` (stranica nivoa), `styles.css` (ceo izgled).

## Gde se šta menja

- **Sadržaj:** rezultati, nivoi, primeri treninga, mentorstvo, transformacije,
  lokacije i pitanja u upitniku su u `data.js`. Sve što je primer označeno je
  sa `PRIVREMENO`.
- **Telefon, mail, WhatsApp i Instagram:** `CONTACT` u `data.js`. Upisuju se
  na sve stranice odatle.
- **Mail na koji stižu prijave:** `RECIPIENT_EMAIL` u `script.js`. FormSubmit
  pri prvoj prijavi šalje jednokratni link za potvrdu na tu adresu.
- **Tekst „Šta je AthLean Fast":** `index.html`.
- **Boje i fontovi:** promenljive na vrhu `styles.css` (`:root`), po uzoru
  na ShredFast:
  - crna osnova
  - kraljevsko plava (`--blue`, `--blue-bright`) je prepoznatljiva boja:
    dugmad, veliki brojevi, najvažnije
  - bela je za kontrast, zlatna (`--gold`) samo za sitne detalje
  - naslovi su Oswald, tekst Lato
- **Logo:** vektorski, u `images/`:
  - `logo.svg` je horizontalni (gornja traka i futer)
  - `logo-stacked.svg` je uspravni
  - `logo-mark.svg` su samo krila (početna, ikonica sajta, stranica 404)

## Snimci i slike

- Fotografija trenera: `images/trener.jpg` (uspravna, 4:5), u delu „Šta je
  AthLean Fast".

- Uvodni video: dovoljno je ubaciti `videos/hero.mp4` (po želji i manji
  `videos/hero.webm`). Dok fajla nema, prikazuje se satenska pozadina, ništa
  drugo ne treba menjati. Najbolje kratak (10–20 s, vrti se u krug), bez
  zvuka (sajt ga ionako pušta bez zvuka) i do oko 10 MB, da se brzo učita.
- Video po nivou: upisati putanju u `video` kod nivoa u `data.js`
  (npr. `videos/pocetni.mp4`), a `poster` zameniti slikom iz snimka.
- Način prikaza transformacija: `TRANSFORMATIONS_VIEW` u `data.js`
  (`'klizac'`, `'pored'`, `'traka'`, ili `'izbor'` za sva tri dok se ne
  odluči).
- Transformacije: slike pre/posle (uspravne, 3:5) u `images/transformacije/`,
  putanje u `TRANSFORMATIONS` u `data.js` (samo uz dozvolu klijenata). Utisak
  klijenta (`quote`), ime i trajanje se dopisuju uz istu transformaciju i
  pojavljuju se ispod slike.

## Domen

Kad se poveže pravi domen:
1. Promeniti `SITE_ORIGIN` u `data.js`.
2. Promeniti canonical i og adrese i JSON-LD u `index.html`, kao i `og:image`
   u `nivo.html`.
3. Pokrenuti `node tools-sitemap.js`.

## Posle svake izmene stila ili skripte

    node tools-version.js

Upisuje novu oznaku (`?v=`) uz stilove i skripte na stranicama, da posetioci
ne dobiju staru kopiju iz keša. Testovi padaju ako se ovo zaboravi.

## Testovi

    ./tests/run.sh

Detalji u `tests/README.md`.

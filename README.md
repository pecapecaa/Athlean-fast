# AthLean Fast

Sajt za online treninge i mentorstvo: „Atletska građa koja se brzo postiže".
Statičan sajt (HTML, CSS, JavaScript), bez build koraka.

Uživo: https://pecapecaa.github.io/Athlean-fast/

## Stranice

| Adresa | Fajlovi | Sadržaj |
|---|---|---|
| `/` | `index.html`, `script.js` | Šta je AthLean Fast, rezultati, nivoi, online mentorstvo, kako funkcioniše, kontakt, prijava (upitnik) |
| `/nivo?n=<id>` | `nivo.html`, `nivo.js` | Nivo utreniranosti: video, primer treninga, za koga je, fokus |
| `/program?p=<id>` | `program.html`, `program.js` | Program mentorstva: šta dobijaš, za koga je, kako izgleda saradnja |

Zajedničko: `data.js` (sav sadržaj), `components.js` (kartice), `detail.js` +
`detail.css` (podstranice), `styles.css` (ceo izgled).

## Gde se šta menja

- **Tekst, nivoi, programi, cene, transformacije, pitanja u upitniku:**
  `data.js`. Sve što je primer označeno je sa `PRIVREMENO`.
- **Tekst „Šta je AthLean Fast", kontakt, WhatsApp:** `index.html` (oznake
  `PRIVREMENO`), kontakt i u futeru na `nivo.html` i `program.html`.
- **Mail na koji stižu prijave:** `RECIPIENT_EMAIL` u `script.js`. FormSubmit
  pri prvoj prijavi šalje jednokratni link za potvrdu na tu adresu.
- **Boje i fontovi:** promenljive na vrhu `styles.css` (`:root`).
- **Logo:** privremeno je tekstualni (`.logo-mark` / `.logo-text`); kad stigne
  vektor, zameniti u zaglavlju i futeru.

## Snimci i slike

- Uvodni video: `videos/hero.mp4` (po želji i `videos/hero.webm`). Dok fajla
  nema, prikazuje se statična pozadina, ništa drugo ne treba menjati.
- Video po nivou: upisati putanju u `video` kod nivoa u `data.js`
  (npr. `videos/pocetnik.mp4`), a `poster` zameniti slikom iz snimka.
- Fotografija trenera: `images/trener.svg` → prava fotografija, putanja u
  `index.html`.
- Transformacije: slike pre/posle u `images/transformacije/`, putanje i imena
  u `TRANSFORMATIONS` u `data.js` (samo uz dozvolu klijenata).

## Domen

Kad se poveže pravi domen: promeniti `SITE_ORIGIN` u `data.js`, canonical/og
adrese i JSON-LD u `index.html` i `og:image` u `nivo.html` / `program.html`,
pa pokrenuti `node tools-sitemap.js`.

## Testovi

    ./tests/run.sh

Detalji u `tests/README.md`.

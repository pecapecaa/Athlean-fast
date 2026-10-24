# AthLean Fast

Sajt za AthLean Fast: „Atletski izvajano tijelo. Brzo do rezultata."
Sistem treninga sa vlastitim tijelom i kettlebellom, uz online mentorstvo.
Statičan sajt (HTML, CSS, JavaScript), bez build koraka.

Uživo: https://pecapecaa.github.io/Athlean-fast/

## Stranice

| Adresa | Fajlovi | Sadržaj |
|---|---|---|
| `/` | `index.html`, `script.js` | Šta je AthLean Fast, rezultati, nivoi, online mentorstvo, transformacije, pridruži se (upitnik), lokacije, kontakt |
| `/nivo?n=<id>` | `nivo.html`, `nivo.js` | Nivo (početni, srednji, napredni): video, primer treninga, za koga je, fokus |

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
- **Boje i fontovi:** promenljive na vrhu `styles.css` (`:root`).
  Kraljevsko plava (`--royal`) naglašava najvažnije (dugmad, istaknut tekst),
  zlatna (`--gold`) služi za tanke akcente. Sekcije se smenjuju svetle
  (`.section-light`) i tamne (`.section-dark`), sa kosim ivicama između.
  Naslovi su Oswald (tanji rezovi, 400–500), tekst Lato.
- **Logo:** vektorski, u `images/`:
  - `logo.svg` je horizontalni (meni i futer)
  - `logo-stacked.svg` je uspravni
  - `logo-mark.svg` su samo krila (početna, ikonica sajta, stranica 404)

## Snimci i slike

- Uvodni video: `videos/hero.mp4` (po želji i `videos/hero.webm`). Dok fajla
  nema, prikazuje se statična pozadina, ništa drugo ne treba menjati.
- Video po nivou: upisati putanju u `video` kod nivoa u `data.js`
  (npr. `videos/pocetni.mp4`), a `poster` zameniti slikom iz snimka.
- Fotografija trenera: `images/trener.svg` zameniti pravom fotografijom i
  promeniti putanju u `index.html`.
- Transformacije: slike pre/posle (uspravne, 3:5) u `images/transformacije/`,
  putanje i imena u `TRANSFORMATIONS` u `data.js` (samo uz dozvolu klijenata).

## Domen

Kad se poveže pravi domen:
1. Promeniti `SITE_ORIGIN` u `data.js`.
2. Promeniti canonical i og adrese i JSON-LD u `index.html`, kao i `og:image`
   u `nivo.html`.
3. Pokrenuti `node tools-sitemap.js`.

## Testovi

    ./tests/run.sh

Detalji u `tests/README.md`.

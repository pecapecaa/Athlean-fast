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
  - tamnoplava (`--velvet`, #00072d) je najtamnija plava sa fotografije
    logoa i jedina plava pozadina: ulaz, početna dok nema videa, nivoi i
    stranica nivoa
  - bela je za kontrast, zlatna (`--gold`) samo za sitne detalje
  - font je Figtree, besplatna zamena za Proxima Nova koji koristi ShredFast;
    veličine i debljine su prepisane sa njihovog sajta
- **Logo:** vektorski, u `images/`:
  - `logo.svg` je horizontalni (gornja traka i futer)
  - `logo-stacked.svg` je uspravni
  - `logo-mark.svg` su samo krila (početna, ikonica sajta, stranica 404)

## Snimci i slike

- Logo na ulasku: pri prvom ulasku u posetu početna se otvara samo zlatnim
  logom (`images/logo-stacked.svg`) na plavoj, pa posle oko 2 sekunde prelazi
  u uvodni deo. Trajanje je `--intro` u `styles.css`.

- Fotografija trenera: `images/trener.jpg` (uspravna, 4:5), u delu „Šta je
  AthLean Fast".

- Uvodni video: dovoljno je ubaciti `videos/hero.mp4` (po želji i manji
  `videos/hero.webm`). Dok fajla nema, prikazuje se satenska pozadina, ništa
  drugo ne treba menjati. Najbolje kratak (10–20 s, vrti se u krug), bez
  zvuka (sajt ga ionako pušta bez zvuka) i do oko 10 MB, da se brzo učita.
- Video po nivou: upisati putanju u `video` kod nivoa u `data.js`
  (npr. `videos/pocetni.mp4`), a `poster` zameniti slikom iz snimka.
- Transformacije: prikazuju se u traci koja polako klizi sama. Slike
  pre/posle (uspravne, 3:5) su u `images/transformacije/`, a putanje u
  `TRANSFORMATIONS` u `data.js` (samo uz dozvolu klijenata). Uz istu
  transformaciju se dopisuju trajanje (`period`), rezultat (`result`, npr.
  „−8 kg"), utisak klijenta (`quote`), ime i napomena (`detail`), i
  pojavljuju se ispod slika.

## Prethodni stil (`elegantna/`)

`elegantna/` je zamrznuta kopija sajta pre prelaska na ShredFast slova
(tanki Oswald, tanke ikonice), da se dve verzije uporede:
https://pecapecaa.github.io/Athlean-fast/elegantna/

Stil joj se ne menja (dodat je samo potpis u futeru) i ne ulazi u
pretragu (`noindex`). `node tools-version.js` obeležava i njene stranice.
Kad se izabere jedna verzija, fascikla se briše.

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

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

- Uvodni video: `videos/hero.mp4` je uspravan (720×1280) za telefon,
  `videos/hero-wide.mp4` isti snimak u sredini sa zamućenim stranama
  (1280×720) za šire ekrane. Prvi kadar svakog (`images/hero-poster.jpg`,
  `images/hero-wide-poster.jpg`) stoji dok se video učitava, i umesto njega
  kad ne može da se pusti (štednja baterije, manje pokreta, štednja
  podataka). Isečeno je 23 s iz Markovog snimka (1,9–25,1 s), bez zvuka,
  25 sličica u sekundi, oko 4 i 3 MB. Novi snimak se priprema isto:

      ffmpeg -ss POČETAK -to KRAJ -i snimak.mp4 -an -vf "fps=25,scale=720:1280" \
        -c:v libx264 -preset slower -crf 29 -movflags +faststart videos/hero.mp4
- Video po nivou: `videos/pocetni.mp4`, `srednji.mp4`, `napredni.mp4`
  (uspravni, 720×1280, svaki tačno 27 s, sa zvukom ujednačene jačine).
  Snimljeni su na iPhone-u u HDR-u, pa su prebačeni u obične boje (bez toga
  na sajtu izgledaju isprano). Naslovna slika svakog je `images/nivoi/*.jpg`
  (1080×1920): najoštriji kadar iz originala, ne iz smanjenog snimka, uz
  malo kontrasta i boje. Stoji na kartici i na stranici nivoa, ispod
  dugmeta za puštanje. Putanje su kod nivoa u `data.js`.
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

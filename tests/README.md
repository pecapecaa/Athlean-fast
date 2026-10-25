# Testovi

    ./tests/run.sh

Podiže lokalni server, pokrene sve provere i ugasi server. Izlazni kod 0
znači da je sve prošlo.

Server je `tests/server.js`, a ne običan fajl-server: Cloudflare Pages (i
GitHub Pages) poslužuje `nivo.html` na adresi `/nivo`, a Cloudflare trajno
preusmerava `.html` oblik na nju. Sa običnim serverom testirali bismo drugačiji
sajt od onog koji posetioci dobijaju.

## Šta se proverava

`join.spec.js` — prijava (upitnik), jedino što na sajtu dovodi klijente.

1. Svako dugme „Pridruži se" otvara formu na prvom koraku, fokus je na imenu,
   Escape je zatvara.
2. Prvi korak ne pušta dalje prazna polja, pogrešan email, prekratak telefon
   ni nemoguće godine; „Nazad" čuva upisano.
3. Bez obaveznih odgovora ništa se ne šalje. Poslata prijava nosi kontakt,
   odgovore kao čitljiv tekst (ne kodove), napomenu, `_replyto` i naslov sa
   imenom i nivoom. Ponovo otvorena forma posle slanja je prazna.
4. Dugme sa stranice nivoa otvara formu na početnoj sa izabranim nivoom i
   čisti adresu; nepoznat nivo ne izabere ništa.
5. Kad slanje ne uspe, odgovori ostaju i dugme ponovo radi.
6. Promena jezika usred forme ne briše odgovore.

`analytics.spec.js` — imena događaja i tagova za Clarity. Ako se ime promeni,
sajt i dalje radi, samo levak tiho prijavljuje pogrešan broj.

Proverava se:
- `prijava_otvorena` sa izvorom (`hero`, `meni`, `mentorstvo`,
  `stranica_nivoa`…)
- `prijava_napustena` sa korakom (`podaci` / `upitnik`)
- `forma_greska` sa poljem
- `prijava_poslata` tačno jednom i bez lažnog napuštanja
- `prijava_neuspjesna` bez lažnog uspeha
- `nivo_otvoren`
- dosegnute sekcije
- da sajt radi normalno kad je Clarity blokiran

`seo.spec.js` — canonical i strukturirani podaci (`Organization` na početnoj,
`ExercisePlan` za nivoe), potpunost `sitemap.xml` i `robots.txt`, da
nepostojeći nivo ne objavi lažnu stranicu i da stari `.html` link završi na
pravoj adresi.

`navigation.spec.js` — proverava:
- da početna nema meni (samo logo i Instagram), jer se cela stranica samo
  skroluje
- da adresa ostaje čista (bez `#sekcija`) pri kretanju po početnoj i pri
  povratku sa stranice nivoa
- da deljeni link `/#mentorship` stiže gde treba
- da kartice otvaraju svoje stranice i da „Nazad" vraća na početnu
- da je svaka transformacija jedna slika sa linijom koja se pomera (i
  strelicama na tastaturi)
- da su kontakt podaci iz `data.js` upisani na svakoj stranici

## Kad menjaš sadržaj

Posle dodavanja ili brisanja nivoa u `data.js` pokreni:

    node tools-sitemap.js

Sitemap i robots.txt se generišu iz `data.js` da ne bi mogli da se razmimoiđu.

## Pre svakog pusha

Pokreni `./tests/run.sh`. I proveri da test stvarno hvata grešku: privremeno
pokvari kod, vidi da test pukne, pa vrati.

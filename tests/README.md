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

1. Dugme u meniju otvara formu na prvom koraku, fokus je na imenu, Escape je
   zatvara.
2. Prvi korak ne pušta dalje prazna polja, pogrešan email, prekratak telefon
   ni nemoguće godine; „Nazad" čuva upisano.
3. Bez obaveznih odgovora ništa se ne šalje; poslata prijava nosi kontakt,
   odgovore kao čitljiv tekst (ne kodove), napomenu, `_replyto` i naslov sa
   imenom i programom. Ponovo otvorena forma posle slanja je prazna.
4. Kartica programa otvara formu sa već izabranim programom.
5. Link sa podstranice (`?prijava=…&nivo=…`) otvara formu sa izborom i čisti
   adresu; nepoznati id-jevi ne izaberu ništa.
6. Dugmad „Pridruži se" na stranici programa i nivoa nose svoj izbor.
7. Kad slanje ne uspe, odgovori ostaju i dugme ponovo radi.
8. Promena jezika usred forme ne briše odgovore.

`analytics.spec.js` — imena događaja i tagova za Clarity. Ako se ime promeni,
sajt i dalje radi, samo levak tiho prijavljuje pogrešan broj.

Proverava se: `prijava_otvorena` sa izvorom (`hero`, `meni`,
`program_kartica`…); `prijava_napustena` sa korakom (`podaci` / `upitnik`);
`forma_greska` sa poljem; `prijava_poslata` tačno jednom i bez lažnog
napuštanja; `prijava_neuspjesna` bez lažnog uspeha; `nivo_otvoren` i
`program_otvoren`; dosegnute sekcije; i da sajt radi normalno kad je Clarity
blokiran.

`seo.spec.js` — canonical i strukturirani podaci (`ExercisePlan` za nivoe,
`Service` za programe), ponuda sa cenom samo kad je cena upisana, potpunost
`sitemap.xml` i `robots.txt`, da nepostojeći id ne objavi lažnu stranicu i da
stari `.html` link završi na pravoj adresi.

`navigation.spec.js` — adresa ostaje čista (bez `#sekcija`) pri kretanju po
početnoj i pri povratku sa podstranica, deljeni link `/#programs` stiže gde
treba, kartice otvaraju svoje stranice, „Nazad" vraća na početnu.

## Kad menjaš sadržaj

Posle dodavanja ili brisanja nivoa ili programa u `data.js` pokreni:

    node tools-sitemap.js

Sitemap i robots.txt se generišu iz `data.js` da ne bi mogli da se razmimoiđu.

## Pre svakog pusha

Pokreni `./tests/run.sh`. I proveri da test stvarno hvata grešku: privremeno
pokvari kod, vidi da test pukne, pa vrati.

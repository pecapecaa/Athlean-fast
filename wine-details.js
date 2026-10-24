// ===== Product page content =====
//
// Everything the detail page shows beyond the catalogue entry itself.
//
// A hard rule runs through this file: nothing here is invented. Where a fact
// is known it is stated; where it is not, the field is left out and the page
// simply renders one section fewer. That is why most wines carry no vintage
// and none carries an alcohol figure — the supplier price lists give a year
// for the Vukoje range and nothing else, so that is all that is claimed.
//
// The tasting profile and the serving/pairing advice are a different kind of
// statement and are labelled as such on the page: the profile is our own
// reading of the wine, and the serving guidance is ordinary oenological
// practice for that style, not a specification handed down by the producer.

// --- Shared: the grape varieties ---------------------------------------
// Real, checkable background on the varieties themselves. Written for someone
// who has never read a wine book: what it is, where it grows, what to expect.
const VARIETIES = {
  zilavka: {
    name: { sr: 'Žilavka', en: 'Žilavka' },
    sr: 'Autohtona hercegovačka bela sorta, jedna od najstarijih na Balkanu. Raste na kršu — kamenom, sunčanom tlu koje zadržava malo vode, pa loza mora duboko da traži. Upravo odatle joj dolazi ona prepoznatljiva mineralna nota i čvrsta kiselina koja vino drži svežim. Ime je dobila po tankim „žilicama" koje se vide na zrelom zrnu.',
    en: 'An indigenous Herzegovinian white variety, among the oldest in the Balkans. It grows on karst — stony, sun-baked ground that holds little water, so the vine has to search deep. That is where its recognisable mineral note and firm, refreshing acidity come from. It is named after the thin veins visible on a ripe berry.'
  },
  blatina: {
    name: { sr: 'Blatina', en: 'Blatina' },
    sr: 'Crvena sorta koja raste samo u Hercegovini i skoro nigde drugde na svetu. Ima jednu neobičnu osobinu: cvet joj je funkcionalno ženski, pa ne može sama da se oplodi — mora joj se u vinogradu zasaditi druga sorta kao oprašivač. Zato je rod nepredvidiv, a vino retko. Daje tamnu boju, ukus višnje i šljive i meke, zaobljene tanine.',
    en: 'A red variety grown in Herzegovina and almost nowhere else. It has an unusual trait: its flower is functionally female, so it cannot pollinate itself — another variety has to be planted alongside it. That makes the yield unpredictable and the wine scarce. It gives a dark colour, cherry and plum fruit, and soft, rounded tannins.'
  },
  vranac: {
    name: { sr: 'Vranac', en: 'Vranac' },
    sr: 'Ime znači „vran konj" — crn, snažan. Sorta koja vlada jugom: Hercegovina, Crna Gora, Makedonija. Daje duboko tamno vino, gusto i ozbiljno, sa ukusom zrele šljive, višnje i tamnog voća. Mlad Vranac je snažan i direktan; kad odleži, tanini se smire i vino dobije baršunastu, zaokruženu teksturu.',
    en: 'The name means "black stallion" — dark, powerful. It rules the south: Herzegovina, Montenegro, North Macedonia. It yields a deeply dark wine, dense and serious, tasting of ripe plum, sour cherry and dark fruit. Young Vranac is bold and direct; with age the tannins settle and the wine turns velvety and rounded.'
  },
  merlot: {
    name: { sr: 'Merlot', en: 'Merlot' },
    sr: 'Svetski poznata crvena sorta, poreklom iz Bordoa, koja se u Hercegovini odlično snašla na toplom kamenu. Cenjena je jer je pitoma: manje oštrih tanina nego kod većine crvenih, više okruglog voća. Zbog toga je često prvo crveno vino koje neko zavoli.',
    en: 'A world-famous red from Bordeaux that has taken well to the warm stone of Herzegovina. It is prized for being gentle: fewer sharp tannins than most reds, more round fruit. That is why it is so often the first red someone falls for.'
  },
  tamjanika: {
    name: { sr: 'Tamjanika', en: 'Tamjanika' },
    sr: 'Naš naziv za sortu iz porodice muskata, a ime nosi po tamjanu — po tome koliko snažno miriše. To je vino koje osetite pre nego što ga probate: cveće, grožđe, med. Aromatično bez da je slatko, jer se najčešće pravi suvo.',
    en: 'Our name for a member of the Muscat family, called after frankincense — after how strongly it smells. This is a wine you notice before you taste it: flowers, grapes, honey. Aromatic without being sweet, since it is most often made dry.'
  },
  cuvee: {
    name: { sr: 'Cuvée', en: 'Cuvée' },
    sr: 'Cuvée znači da vino nije od jedne sorte, nego je spoj više njih. Vinar bira šta se s čim slaže, tražeći ravnotežu koju nijedna sorta sama ne bi dala — jedna donese voće, druga svežinu, treća strukturu.',
    en: 'A cuvée means the wine is not from a single variety but a blend of several. The winemaker chooses what goes with what, chasing a balance no single grape would give on its own — one brings fruit, another freshness, a third structure.'
  }
};

// --- Shared: the producers ---------------------------------------------
// Kept to what is actually known about each house. No founding dates or
// production figures are given where they were never supplied.
const PRODUCERS = {
  tvrdos: {
    name: { sr: 'Manastir Tvrdoš', en: 'Tvrdoš Monastery' },
    place: { sr: 'Trebinje, Hercegovina', en: 'Trebinje, Herzegovina' },
    sr: 'Manastir iznad Trebinja, na stenovitim padinama nad Trebišnjicom, u kojem se vino pravi kao deo monaškog života, a ne kao industrija. Podrum je usečen u kamen. Vinogradi su na kršu, na malo zemlje između stena, i rod je po prirodi stvari ograničen. To je razlog zbog kog ova vina imaju karakter koji se ne može napraviti u velikoj proizvodnji.',
    en: 'A monastery above Trebinje, on the rocky slopes over the Trebišnjica, where wine is made as part of monastic life rather than as industry. The cellar is cut into the rock. The vineyards sit on karst, on the little soil there is between stones, and the yield is limited by nature. That is why these wines carry a character large-scale production cannot manufacture.'
  },
  vukoje: {
    name: { sr: 'Podrumi Vukoje 1982', en: 'Vukoje 1982 Cellars' },
    place: { sr: 'Trebinje, Hercegovina', en: 'Trebinje, Herzegovina' },
    sr: 'Porodični podrum iz Trebinja, jedno od najpoznatijih imena hercegovačkog vinarstva. Godina u imenu je početak priče koja i danas traje kroz istu porodicu. Njihova ponuda ide od svakodnevnih, pitkih vina do ozbiljnih selekcija koje dugo odležavaju — a prepoznatljivi su i po etiketama koje se izdvajaju na polici.',
    en: 'A family cellar in Trebinje, one of the best-known names in Herzegovinian winemaking. The year in the name is where the story starts, and the same family carries it on. Their range runs from everyday, easy-drinking bottles to serious long-aged selections — and their labels are recognisable on any shelf.'
  },
  citluk: {
    name: { sr: 'Vinarija Čitluk', en: 'Vinarija Čitluk' },
    place: { sr: 'Čitluk, Hercegovina', en: 'Čitluk, Herzegovina' },
    sr: 'Vinarija iz Čitluka, u srcu hercegovačkog vinogorja uz Neretvu. Njihove Žilavka i Blatina su za mnoge ono što se podrazumeva pod hercegovačkim vinom — pouzdana, prepoznatljiva, i tu su decenijama. To su vina koja se ne kupuju za posebnu priliku nego zato što su uvek dobra.',
    en: 'A winery in Čitluk, in the heart of the Herzegovinian wine country along the Neretva. For many people their Žilavka and Blatina simply are what Herzegovinian wine means — dependable, recognisable, and around for decades. These are not special-occasion bottles; they are bought because they are always good.'
  }
};

// --- Per-wine detail ----------------------------------------------------
// profile values are 1-5 and are our own reading, labelled that way on the
// page. `vintage` appears only where a supplier price list actually gave one.
const WINE_DETAILS = {

  'tvrdos-vranac': {
    variety: 'vranac', producer: 'tvrdos',
    lead: {
      sr: 'Ovo je vino koje ne žuri. Dolazi iz manastirskih vinograda na kamenu iznad Trebinja, gde loza raste teško i daje malo — a upravo to malo nosi svu koncentraciju. U čaši je tamno, gotovo neprozirno, i traži da mu se posveti trenutak. Nije vino za usput; to je vino za sto za kojim se sedi duže.',
      en: 'This is a wine in no hurry. It comes from monastery vineyards on the stone above Trebinje, where the vine struggles and gives little — and that little carries all the concentration. In the glass it is dark, almost opaque, and it asks for a moment of attention. Not a wine for passing through; a wine for a table you stay at.'
    },
    aromas: {
      sr: ['Zrela šljiva', 'Višnja', 'Suvo lišće', 'Kamen', 'Tamna čokolada'],
      en: ['Ripe plum', 'Sour cherry', 'Dry leaves', 'Stone', 'Dark chocolate']
    },
    profile: { telo: 5, kiselina: 3, tanin: 4, slatkoca: 1, aroma: 4 },
    serve: { temp: '16–18 °C', glass: { sr: 'Široka čaša za crveno', en: 'Large red-wine glass' }, decant: 45 },
    pairing: {
      sr: ['Jagnjetina ispod sača', 'Pečena govedina', 'Suvo meso i tvrdi sir', 'Sarma', 'Divljač'],
      en: ['Slow-roasted lamb', 'Roast beef', 'Cured meat and hard cheese', 'Stuffed cabbage', 'Game']
    },
    occasion: {
      sr: 'Kad je povod stvaran — slava, dogovor, ozbiljan ručak koji traje.',
      en: 'When the occasion is real — a feast day, an agreement, a long serious lunch.'
    }
  },

  'tvrdos-zilavka': {
    variety: 'zilavka', producer: 'tvrdos',
    lead: {
      sr: 'Belo vino iz istog manastirskog podruma, i odmah se prepozna odakle dolazi: ima onu suvu, kamenu notu koju daje samo krš. Miriše na zrelu krušku i badem, a završetak je dug i čist, bez ijedne teške note. Vino koje se otvara polako — druga čaša kaže više nego prva.',
      en: 'A white from the same monastery cellar, and its origin shows at once: it carries the dry, stony note only karst gives. It smells of ripe pear and almond, and the finish is long and clean, without a heavy note anywhere. A wine that opens slowly — the second glass tells you more than the first.'
    },
    aromas: {
      sr: ['Zrela kruška', 'Badem', 'Beli cvet', 'Kamen', 'Limunova kora'],
      en: ['Ripe pear', 'Almond', 'White blossom', 'Stone', 'Lemon peel']
    },
    profile: { telo: 3, kiselina: 4, tanin: 0, slatkoca: 1, aroma: 3 },
    serve: { temp: '10–12 °C', glass: { sr: 'Čaša za belo', en: 'White-wine glass' }, decant: 0 },
    pairing: {
      sr: ['Riba sa roštilja', 'Škampi i plodovi mora', 'Mladi sir', 'Rižoto', 'Piletina sa limunom']
      , en: ['Grilled fish', 'Prawns and seafood', 'Fresh cheese', 'Risotto', 'Lemon chicken']
    },
    occasion: {
      sr: 'Večera uz more, ili svaki put kad se na sto iznese riba.',
      en: 'Dinner by the sea, or any time fish comes to the table.'
    }
  },

  'tvrdos-metoh-vranac': {
    variety: 'vranac', producer: 'tvrdos',
    lead: {
      sr: 'Isti podrum, isti Vranac, ali mlađe i opuštenije izdanje. Sve što veliki Vranac ima — šljiva, višnja, dubina — ovde je lakše i pristupačnije, bez težine koja traži poseban povod. Ovo je crveno vino koje možete da otvorite u utorak uveče i da vam ne bude šteta.',
      en: 'The same cellar, the same Vranac, in a younger and more relaxed form. Everything the big Vranac has — plum, cherry, depth — is lighter and more approachable here, without the weight that demands an occasion. This is a red you can open on a Tuesday evening without feeling you wasted it.'
    },
    aromas: {
      sr: ['Šljiva', 'Višnja', 'Ljubičica', 'Blagi začin'],
      en: ['Plum', 'Sour cherry', 'Violet', 'Gentle spice']
    },
    profile: { telo: 3, kiselina: 3, tanin: 2, slatkoca: 1, aroma: 3 },
    serve: { temp: '15–17 °C', glass: { sr: 'Čaša za crveno', en: 'Red-wine glass' }, decant: 0 },
    pairing: {
      sr: ['Pljeskavica i roštilj', 'Pasta sa mesom', 'Pica', 'Punjene paprike', 'Polutvrdi sir'],
      en: ['Grilled meat', 'Meat pasta', 'Pizza', 'Stuffed peppers', 'Semi-hard cheese']
    },
    occasion: {
      sr: 'Obična večera koju ne planirate unapred.',
      en: 'The ordinary dinner you did not plan.'
    }
  },

  'tvrdos-izba-merlot': {
    variety: 'merlot', producer: 'tvrdos',
    lead: {
      sr: 'Ako vam je crveno vino do sada bilo pregrubo — probajte ovo. Merlot je po prirodi najpitomija crvena sorta, a ovaj je zaobljen do kraja: nema oštrih ivica, nema stezanja u ustima. Ukus zrele šljive i tamne čokolade, mek od prvog do poslednjeg gutljaja. Najbolje crveno vino za nekoga ko tek počinje.',
      en: 'If red wine has felt too rough until now — try this. Merlot is the gentlest red by nature, and this one is rounded all the way: no sharp edges, no grip in the mouth. Ripe plum and dark chocolate, soft from the first sip to the last. The best red for someone just starting.'
    },
    aromas: {
      sr: ['Zrela šljiva', 'Tamna čokolada', 'Kupina', 'Vanila'],
      en: ['Ripe plum', 'Dark chocolate', 'Blackberry', 'Vanilla']
    },
    profile: { telo: 3, kiselina: 2, tanin: 2, slatkoca: 2, aroma: 3 },
    serve: { temp: '16–18 °C', glass: { sr: 'Čaša za crveno', en: 'Red-wine glass' }, decant: 20 },
    pairing: {
      sr: ['Pečena piletina', 'Testenine sa sosom', 'Blaži sirevi', 'Musaka', 'Tamna čokolada'],
      en: ['Roast chicken', 'Pasta with sauce', 'Milder cheeses', 'Moussaka', 'Dark chocolate']
    },
    occasion: {
      sr: 'Prvo crveno vino koje nudite nekome ko kaže da ne voli crveno.',
      en: 'The first red you pour for someone who says they do not like red.'
    }
  },

  'tribunija-bijelo': {
    variety: 'cuvee', producer: 'vukoje',
    vintage: '2025',
    lead: {
      sr: 'Belo vino iz trebinjskog podruma Vukoje, napravljeno da bude lako — ali ne i prazno. Miriše na sveže voće i blagi cvet, pije se bez napora, a ipak ostavi utisak. Ovo je ono vino koje stavite na sto kad ne znate ko sve dolazi, jer teško da će nekome smetati.',
      en: 'A white from the Vukoje cellars in Trebinje, built to be easy — but not empty. It smells of fresh fruit and soft blossom, drinks effortlessly, and still leaves an impression. This is the bottle you put out when you do not know who is coming, because it is hard for anyone to object to it.'
    },
    aromas: {
      sr: ['Zelena jabuka', 'Beli cvet', 'Kruška', 'Sveža trava'],
      en: ['Green apple', 'White blossom', 'Pear', 'Fresh grass']
    },
    profile: { telo: 2, kiselina: 3, tanin: 0, slatkoca: 1, aroma: 3 },
    serve: { temp: '9–11 °C', glass: { sr: 'Čaša za belo', en: 'White-wine glass' }, decant: 0 },
    pairing: {
      sr: ['Salate', 'Bela riba', 'Testenine sa povrćem', 'Mladi sir', 'Predjelo'],
      en: ['Salads', 'White fish', 'Vegetable pasta', 'Fresh cheese', 'Starters']
    },
    occasion: {
      sr: 'Popodne na terasi, bez posebnog razloga.',
      en: 'An afternoon on the terrace, for no particular reason.'
    }
  },

  'tamjanika-galerija': {
    variety: 'tamjanika', producer: 'vukoje',
    vintage: '2025',
    lead: {
      sr: 'Ovo vino ćete osetiti pre nego što ga probate. Čim se natoči, iz čaše krene miris cvetne livade, grožđa i blagog meda — toliko izražen da ga primete i ljudi koji inače „ne osećaju ništa" u vinu. A onda, kad ga probate, nije slatko: suvo je, sveže i pitko. Ta razlika između mirisa i ukusa je ceo šarm Tamjanike.',
      en: 'You will notice this wine before you taste it. The moment it is poured, the glass gives off flowering meadow, grape and soft honey — so pronounced that even people who normally "smell nothing" in wine catch it. And then, in the mouth, it is not sweet: dry, fresh and easy. That gap between aroma and taste is the whole charm of Tamjanika.'
    },
    aromas: {
      sr: ['Cvetna livada', 'Muskatno grožđe', 'Med', 'Breskva', 'Bazga'],
      en: ['Flowering meadow', 'Muscat grape', 'Honey', 'Peach', 'Elderflower']
    },
    profile: { telo: 2, kiselina: 3, tanin: 0, slatkoca: 2, aroma: 5 },
    serve: { temp: '8–10 °C', glass: { sr: 'Čaša za belo, uža', en: 'Narrower white glass' }, decant: 0 },
    pairing: {
      sr: ['Aperitiv, samo', 'Azijska hrana', 'Voćni dezert', 'Zreli sir', 'Dimljena riba'],
      en: ['On its own, as an aperitif', 'Asian food', 'Fruit desserts', 'Ripe cheese', 'Smoked fish']
    },
    occasion: {
      sr: 'Prva čaša večeri, dok se hrana još sprema.',
      en: 'The first glass of the evening, while the food is still cooking.'
    }
  },

  'primavera-roze': {
    variety: 'cuvee', producer: 'vukoje',
    vintage: '2025',
    lead: {
      sr: 'Boje latica ruže, i tačno onakvog ukusa kakav ta boja obećava: jagoda, divlja kupina, ništa teško. Rozé je vino koje rešava problem kad je pola stola za belo a pola za crveno — dovoljno sveže da ide uz laganu hranu, dovoljno voćno da izdrži i roštilj. Najbolje je dobro rashlađeno, na suncu.',
      en: 'The colour of rose petals, and exactly the taste that colour promises: strawberry, wild blackberry, nothing heavy. Rosé is the wine that settles it when half the table wants white and half wants red — fresh enough for light food, fruity enough to hold up to the grill. Best well chilled, in the sun.'
    },
    aromas: {
      sr: ['Jagoda', 'Divlja kupina', 'Latice ruže', 'Nar', 'Citrus'],
      en: ['Strawberry', 'Wild blackberry', 'Rose petal', 'Pomegranate', 'Citrus']
    },
    profile: { telo: 2, kiselina: 4, tanin: 1, slatkoca: 1, aroma: 3 },
    serve: { temp: '8–10 °C', glass: { sr: 'Čaša za belo', en: 'White-wine glass' }, decant: 0 },
    pairing: {
      sr: ['Roštilj', 'Salata sa sirom', 'Morski plodovi', 'Prosciutto i dinja', 'Lagana pasta'],
      en: ['Barbecue', 'Salad with cheese', 'Seafood', 'Prosciutto and melon', 'Light pasta']
    },
    occasion: {
      sr: 'Leto, društvo, i sto koji se ne raspravlja oko boje vina.',
      en: 'Summer, company, and a table that will not argue about colour.'
    }
  },

  'zlatna-selekcija-bijelo': {
    variety: 'cuvee', producer: 'vukoje',
    vintage: '2019',
    lead: {
      sr: 'Ovo nije vino koje se pije usput. Iz posebne selekcije podruma Vukoje, negovano duže i pažljivije od ostalih, i to se oseti odmah — nije samo sveže, nego ima slojeve. Zrelo voće, suptilna vanila, i telo koje ostaje u ustima i pošto si progutao. Belo vino koje se ponaša ozbiljno kao dobro crveno.',
      en: 'This is not a wine to drink in passing. From a special selection of the Vukoje cellars, given more time and more care than the rest, and it shows at once — not merely fresh, but layered. Ripe fruit, subtle vanilla, and a body that stays in the mouth after you swallow. A white that carries itself as seriously as a good red.'
    },
    aromas: {
      sr: ['Zrela breskva', 'Vanila', 'Lešnik', 'Med', 'Suvo cveće'],
      en: ['Ripe peach', 'Vanilla', 'Hazelnut', 'Honey', 'Dried flowers']
    },
    profile: { telo: 4, kiselina: 3, tanin: 0, slatkoca: 2, aroma: 4 },
    serve: { temp: '11–13 °C', glass: { sr: 'Široka čaša — i za belo', en: 'Large glass, even for white' }, decant: 20 },
    pairing: {
      sr: ['Riba u sosu', 'Pečena teletina', 'Zreli tvrdi sir', 'Gljive', 'Tartufi'],
      en: ['Fish in sauce', 'Roast veal', 'Aged hard cheese', 'Mushrooms', 'Truffles']
    },
    occasion: {
      sr: 'Kad počastite sebe, ili kad hoćete da poklon nešto znači.',
      en: 'When you treat yourself, or when a gift has to mean something.'
    }
  },

  'vranac-reserve': {
    variety: 'vranac', producer: 'vukoje',
    vintage: '2017',
    lead: {
      sr: 'Vranac koji je čekao duže od ostalih, i to je cela poenta. Godine u podrumu smire tanine i pretvore snagu u baršun — ono što bi u mladom vinu bilo oštro, ovde je gusto i toplo. Tamno bobičasto voće, začin, i završetak koji traje. Ovo je flaša koja se ne otvara slučajno.',
      en: 'A Vranac that waited longer than the rest, and that is the whole point. Years in the cellar settle the tannins and turn power into velvet — what would be sharp in a young wine is dense and warm here. Dark berry fruit, spice, and a finish that lasts. This is not a bottle you open by accident.'
    },
    aromas: {
      sr: ['Zrela kupina', 'Suva šljiva', 'Crni biber', 'Duvan', 'Kakao'],
      en: ['Ripe blackberry', 'Prune', 'Black pepper', 'Tobacco', 'Cocoa']
    },
    profile: { telo: 5, kiselina: 3, tanin: 4, slatkoca: 1, aroma: 5 },
    serve: { temp: '17–18 °C', glass: { sr: 'Široka čaša za crveno', en: 'Large red-wine glass' }, decant: 60 },
    pairing: {
      sr: ['Divljač', 'Biftek', 'Jagnjetina', 'Zreli sir sa plemenitom plesni', 'Pršut'],
      en: ['Game', 'Steak', 'Lamb', 'Blue cheese', 'Prosciutto']
    },
    occasion: {
      sr: 'Slavlje, ili veče kad se otvara ono što je čuvano.',
      en: 'A celebration, or the night you open what was being saved.'
    }
  },

  'blatina-citluk-075': {
    variety: 'blatina', producer: 'citluk',
    lead: {
      sr: 'Blatina je vino koje postoji skoro samo u Hercegovini — i to nije marketinška fraza nego botanička činjenica: sorta se ne može sama oploditi, pa se rod nikad ne zna unapred. Ono što stigne u flašu je tamno rubinsko, sa ukusom višnje, šljive i začina, i taninima koji su prisutni ali meki. Domaće vino u najboljem smislu te reči.',
      en: 'Blatina is a wine that exists almost only in Herzegovina — and that is botany, not marketing: the variety cannot pollinate itself, so the crop is never known in advance. What reaches the bottle is dark ruby, tasting of sour cherry, plum and spice, with tannins that are present but soft. A local wine in the best sense.'
    },
    aromas: {
      sr: ['Višnja', 'Šljiva', 'Začin', 'Suvo voće', 'Duvan'],
      en: ['Sour cherry', 'Plum', 'Spice', 'Dried fruit', 'Tobacco']
    },
    profile: { telo: 4, kiselina: 3, tanin: 3, slatkoca: 1, aroma: 3 },
    serve: { temp: '16–18 °C', glass: { sr: 'Čaša za crveno', en: 'Red-wine glass' }, decant: 30 },
    pairing: {
      sr: ['Roštilj i pečenje', 'Jagnjetina', 'Suvo meso', 'Kajmak i tvrdi sir', 'Pasulj'],
      en: ['Grilled and roasted meat', 'Lamb', 'Cured meat', 'Kajmak and hard cheese', 'Bean stew']
    },
    occasion: {
      sr: 'Nedeljni ručak, roštilj, sto pun ljudi.',
      en: 'Sunday lunch, the grill, a full table.'
    }
  },

  'zilavka-citluk-075': {
    variety: 'zilavka', producer: 'citluk',
    lead: {
      sr: 'Za mnoge je ovo prosto — Žilavka. Vino koje se decenijama pravi u Čitluku uz Neretvu i koje je za ceo region postalo mera po kojoj se ostala bela vina porede. Sveža kiselina, voćna punoća i dug, svilenkast završetak. Ne pokušava da bude ništa drugo osim dobro, i u tome uspeva svaki put.',
      en: 'For a lot of people this is simply — Žilavka. Made for decades in Čitluk along the Neretva, and the yardstick the region measures other whites against. Fresh acidity, fruity depth and a long, silky finish. It tries to be nothing other than good, and it manages that every time.'
    },
    aromas: {
      sr: ['Zelena jabuka', 'Breskva', 'Badem', 'Mediteransko bilje', 'Kamen'],
      en: ['Green apple', 'Peach', 'Almond', 'Mediterranean herbs', 'Stone']
    },
    profile: { telo: 3, kiselina: 4, tanin: 0, slatkoca: 1, aroma: 3 },
    serve: { temp: '10–12 °C', glass: { sr: 'Čaša za belo', en: 'White-wine glass' }, decant: 0 },
    pairing: {
      sr: ['Riba', 'Plodovi mora', 'Piletina', 'Mladi sir', 'Povrće sa roštilja'],
      en: ['Fish', 'Seafood', 'Chicken', 'Fresh cheese', 'Grilled vegetables']
    },
    occasion: {
      sr: 'Vino koje uvek stoji u frižideru.',
      en: 'The bottle that is always in the fridge.'
    }
  },

  'blatina-citluk-1l': {
    variety: 'blatina', producer: 'citluk',
    lead: {
      sr: 'Ista Blatina iz Čitluka, samo u litru — a to menja povod. Litarska flaša nije za dvoje uz večeru; ona je za sto oko kog sedi šest ljudi i niko ne broji čaše. Isti ukus višnje, šljive i začina, ista meka struktura, samo dovoljno da ne morate da ustajete po drugu flašu.',
      en: 'The same Blatina from Čitluk, in a litre — and that changes the occasion. A litre bottle is not for two over dinner; it is for a table of six where nobody is counting glasses. The same cherry, plum and spice, the same soft structure, just enough that you do not have to get up for a second bottle.'
    },
    aromas: {
      sr: ['Višnja', 'Šljiva', 'Začin', 'Suvo voće', 'Duvan'],
      en: ['Sour cherry', 'Plum', 'Spice', 'Dried fruit', 'Tobacco']
    },
    profile: { telo: 4, kiselina: 3, tanin: 3, slatkoca: 1, aroma: 3 },
    serve: { temp: '16–18 °C', glass: { sr: 'Čaša za crveno', en: 'Red-wine glass' }, decant: 30 },
    pairing: {
      sr: ['Roštilj za društvo', 'Pečenje', 'Suvo meso', 'Pasulj', 'Tvrdi sir'],
      en: ['Barbecue for a crowd', 'Roast meat', 'Cured meat', 'Bean stew', 'Hard cheese']
    },
    occasion: {
      sr: 'Veće društvo, duži sto, veče koje se otegne.',
      en: 'A bigger crowd, a longer table, an evening that runs on.'
    }
  },

  'zilavka-citluk-1l': {
    variety: 'zilavka', producer: 'citluk',
    lead: {
      sr: 'Ista Žilavka iz Čitluka, u litarskom pakovanju. Zlatno-žuta, sa notama zrele jabuke, breskve i mediteranskog bilja, i onom mineralnom čvrstinom koju daje hercegovački krš. U litru zato što ovo nije vino koje se štedi — ovo je vino koje se toči.',
      en: 'The same Žilavka from Čitluk, in a litre. Golden-yellow, with ripe apple, peach and Mediterranean herbs, and the mineral backbone the Herzegovinian karst gives. In a litre because this is not a wine to ration — it is a wine to pour.'
    },
    aromas: {
      sr: ['Zrela jabuka', 'Breskva', 'Mediteransko bilje', 'Kamen', 'Citrus'],
      en: ['Ripe apple', 'Peach', 'Mediterranean herbs', 'Stone', 'Citrus']
    },
    profile: { telo: 3, kiselina: 4, tanin: 0, slatkoca: 1, aroma: 3 },
    serve: { temp: '10–12 °C', glass: { sr: 'Čaša za belo', en: 'White-wine glass' }, decant: 0 },
    pairing: {
      sr: ['Riba za društvo', 'Roštilj od piletine', 'Salate', 'Mladi sir', 'Predjela'],
      en: ['Fish for a crowd', 'Grilled chicken', 'Salads', 'Fresh cheese', 'Starters']
    },
    occasion: {
      sr: 'Ručak na otvorenom, kad je društvo veće nego što si planirao.',
      en: 'Lunch outdoors, when there are more people than you planned for.'
    }
  }
};

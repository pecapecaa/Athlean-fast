// ===== Bundle copy =====
// What a bundle page has to do is not what a wine page does. A wine page
// describes a thing; a bundle page settles a question — is this box the one
// for me. So the copy here is written as recognition rather than description:
// the reader should find their own situation in the list and stop deliberating.
//
// Every bundle also says who it is NOT for. That single line is what makes the
// ones above it worth believing: a box that claims to suit everyone is read,
// correctly, as a box that suits no one in particular.
//
// Keyed by bundle id from data.js. A bundle with no entry here still gets a
// page — it just falls back to the catalogue description.

const BUNDLE_DETAILS = {

  'bundle-start-duo': {
    promise: {
      sr: 'Dve flaše, jedno crveno i jedno belo, i nijedna odluka koju morate sami da donesete.',
      en: 'Two bottles, one red and one white, and not a single decision left to you.'
    },
    forYou: {
      sr: [
        'Prvi put naručujete hercegovačko vino i ne znate odakle da počnete',
        'Očekujete goste, pa treba i belo i crveno jer ne znate ko šta pije',
        'Tražite poklon koji je pažljiv, a ne pretenciozan'
      ],
      en: [
        'This is your first Herzegovinian wine and you have no idea where to start',
        'People are coming over and you need both a white and a red, because you cannot know who drinks what',
        'You want a gift that is thoughtful without being grand'
      ]
    },
    notForYou: {
      sr: 'Ako već znate šta volite i tražite jednu određenu flašu — uzmite je pojedinačno, izaći će vas jeftinije.',
      en: 'If you already know what you like and want one particular bottle, buy it on its own — it will cost you less.'
    },
    why: {
      sr: 'Dva vina koja se ne takmiče. Jedno je belo koje se prvo oseti nosom, drugo je crveno bez oštrih ivica. Ko god da sedne za sto, jedno od ta dva mu odgovara — a vi ne morate da pogađate unapred.',
      en: 'Two wines that do not compete. One is a white you smell before you taste; the other a red with no sharp edges. Whoever sits down at the table, one of the two suits them — and you did not have to guess in advance.'
    },
    contents: {
      'tvrdos-metoh-vranac': {
        sr: 'Crveno koje ne traži prigodu. Meko, sa zrelom šljivom i bez težine u tanimima — pije se uz običnu večeru isto tako lako kao uz slavlje.',
        en: 'A red that asks for no occasion. Soft, ripe plum, no weight in the tannins — as easy over an ordinary dinner as over a celebration.'
      },
      'tamjanika-galerija': {
        sr: 'Belo koje se prvo oseti nosom. Cvetno i pitko, i najlakše ulazi onima koji inače kažu da ne piju belo.',
        en: 'A white you meet with your nose first. Floral and easy, and the one that most often converts people who say they do not drink white.'
      }
    },
    order: [
      { id: 'tamjanika-galerija', note: {
        sr: 'Počnite od belog. Lakše je, otvara nepce i ne pokriva ono što dolazi posle.',
        en: 'Start with the white. It is lighter, it opens the palate, and it does not bury what comes next.'
      }},
      { id: 'tvrdos-metoh-vranac', note: {
        sr: 'Crveno kada stigne hrana. Uz meso i uz sto za kojim se sedi duže.',
        en: 'The red once the food arrives. With meat, and with a table people stay at.'
      }}
    ],
    gift: {
      sr: 'Dve flaše u jednoj kutiji izgledaju kao poklon koji je biran, a ne kao nešto uzeto usput.',
      en: 'Two bottles in one box read as a gift that was chosen, not as something picked up on the way.'
    }
  },

  'bundle-signature-trio': {
    promise: {
      sr: 'Tri različita karaktera iz istog kraja, složena tako da se nijedan ne ponavlja.',
      en: 'Three different characters from one region, put together so that none of them repeats another.'
    },
    forYou: {
      sr: [
        'Probali ste ponešto i sada želite da vidite raspon, a ne još jednu flašu istog',
        'Spremate večeru za više ljudi i treba vam izbor koji pokriva ceo sto',
        'Zanima vas kako dva bela iz dva različita podruma stoje jedno pored drugog'
      ],
      en: [
        'You have tasted a few and now want range, not another bottle of the same',
        'You are cooking for several people and need a choice that covers the whole table',
        'You are curious how two whites from two different cellars stand next to each other'
      ]
    },
    notForYou: {
      sr: 'Ako pijete isključivo crveno — dve od tri flaše ovde su bela. Premium Trio ili pojedinačne flaše su bolji izbor.',
      en: 'If you drink only red, note that two of these three are white. The Premium Trio or single bottles will serve you better.'
    },
    why: {
      sr: 'Ovo je najbliže degustaciji koju možete da napravite kod kuće. Dva bela namerno stoje jedno uz drugo jer se najviše nauči iz razlike, a ne iz jedne flaše: Tamjanika je aromatična i cvetna, Tribunia suva i uzdržanija. Crveno zatvara veče.',
      en: 'This is the closest thing to a tasting you can set up at home. The two whites sit side by side on purpose — you learn more from the difference than from any single bottle: the Tamjanika aromatic and floral, the Tribunia dry and more reserved. The red closes the evening.'
    },
    contents: {
      'tvrdos-metoh-vranac': {
        sr: 'Manastirsko crveno, mekano i bez pretenzija. Ovde je zato što posle dva bela treba nešto što smiruje, a ne nešto što nadglasava.',
        en: 'A monastery red, soft and unpretentious. It is here because after two whites you want something that settles the evening, not something that shouts over it.'
      },
      'tamjanika-galerija': {
        sr: 'Aromatično belo, cvetno i odmah prepoznatljivo. Prva flaša u nizu jer najbrže pokazuje šta Hercegovina radi drugačije.',
        en: 'An aromatic white, floral and instantly recognisable. First in the line because it shows fastest what Herzegovina does differently.'
      },
      'tribunija-bijelo': {
        sr: 'Suvo belo iz podruma Vukoje, elegantnije i ozbiljnije od Tamjanike. Poređenje ove dve flaše je ono zbog čega paket postoji.',
        en: 'A dry white from the Vukoje cellars, more elegant and more serious than the Tamjanika. The comparison between these two is why this box exists.'
      }
    },
    order: [
      { id: 'tamjanika-galerija', note: {
        sr: 'Aromatično ide prvo. Da se zapamti miris pre nego što ga bilo šta drugo pokrije.',
        en: 'The aromatic one goes first, so the scent is remembered before anything else covers it.'
      }},
      { id: 'tribunija-bijelo', note: {
        sr: 'Odmah zatim suvo belo — razlika se najbolje čuje dok je prvo još u sećanju.',
        en: 'The dry white straight after: the difference reads clearest while the first is still in memory.'
      }},
      { id: 'tvrdos-metoh-vranac', note: {
        sr: 'Crveno na kraju, uz jelo. Posle njega se belo više ne vraća.',
        en: 'The red last, with food. After it, no one goes back to white.'
      }}
    ],
    gift: {
      sr: 'Tri flaše su granica na kojoj poklon prestaje da bude ljubaznost i postaje gest.',
      en: 'Three bottles is the point at which a gift stops being a courtesy and becomes a gesture.'
    }
  },

  'bundle-premium-trio': {
    promise: {
      sr: 'Isti pouzdani par, i jedna flaša koja se pamti.',
      en: 'The same dependable pair, and one bottle that gets remembered.'
    },
    forYou: {
      sr: [
        'Tražite poklon koji treba da ostavi utisak, a ne samo da bude pristojan',
        'Imate povod — slavlje, godišnjicu, poslovni poklon',
        'Već znate Vukoje i hoćete da probate njihovu vrhunsku selekciju',
        'Volite da imate jednu flašu za sada i jednu koja čeka pravi trenutak'
      ],
      en: [
        'You want a gift that has to make an impression, not merely be presentable',
        'There is an occasion — a celebration, an anniversary, a corporate gift',
        'You already know Vukoje and want to try their top selection',
        'You like having one bottle for now and one that waits for the right moment'
      ]
    },
    notForYou: {
      sr: 'Ako vam je ovo prva porudžbina — Start Duo je jeftiniji način da proverite da li vam stil uopšte odgovara.',
      en: 'If this is your first order, the Start Duo is a cheaper way to find out whether the style suits you at all.'
    },
    why: {
      sr: 'Paket je namerno neujednačen. Dve flaše su tu da se otvore bez razmišljanja, a treća nije — Zlatna Selekcija je vino koje se čuva za povod. Da su sve tri na tom nivou, kutija bi bila skuplja nego što ijedno veče traži.',
      en: 'The box is deliberately uneven. Two bottles are there to be opened without thinking about it; the third is not — the Zlatna Selekcija is a wine you keep for an occasion. Had all three been at that level, the box would cost more than any one evening asks for.'
    },
    contents: {
      'tvrdos-metoh-vranac': {
        sr: 'Crveno koje drži svakodnevni deo kutije. Ono što se otvori kada nema posebnog razloga.',
        en: 'The red that holds up the everyday half of the box. The one you open when there is no particular reason.'
      },
      'tribunija-bijelo': {
        sr: 'Elegantno suvo belo — most između svakodnevnog i vrhunskog. Dovoljno ozbiljno za goste, dovoljno pitko za utorak.',
        en: 'An elegant dry white, the bridge between the everyday and the top shelf. Serious enough for guests, easy enough for a Tuesday.'
      },
      'zlatna-selekcija-bijelo': {
        sr: 'Flaša zbog koje se paket zove premium. Bogato, slojevito belo iz posebne selekcije, negovano duže i sa više pažnje. Ovo se ne otvara usput.',
        en: 'The bottle the box is named for. A rich, layered white from a special selection, given more time and more care. This one does not get opened in passing.'
      }
    },
    order: [
      { id: 'tribunija-bijelo', note: {
        sr: 'Počnite odavde. Postavlja nivo, a ne troši povod.',
        en: 'Start here. It sets the level without spending the occasion.'
      }},
      { id: 'tvrdos-metoh-vranac', note: {
        sr: 'Crveno uz jelo, kad god vam se otvori.',
        en: 'The red with food, whenever you feel like opening it.'
      }},
      { id: 'zlatna-selekcija-bijelo', note: {
        sr: 'Zlatnu Selekciju ostavite za kraj — i to ne za kraj večeri, nego za veče koje to zaslužuje.',
        en: 'Keep the Zlatna Selekcija for last — and not for the end of an evening, but for an evening that deserves it.'
      }}
    ],
    gift: {
      sr: 'Ako se poklanja, recite onome ko ga dobija koja je flaša ona treća. Inače će je otvoriti u utorak.',
      en: 'If you are giving it away, tell them which of the three is the third one. Otherwise they will open it on a Tuesday.'
    }
  }
};

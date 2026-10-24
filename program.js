// ===== Programme page =====
// One page for every coaching programme: the id arrives as ?p=<id> and every
// section is written from data.js.
//
// The page has one job: settle whether this programme is the right one. So
// it runs who it suits, how the work goes, and the alternatives.

function render(program, detail) {
  const name = program.name.sr;
  const price = formatPrice(program);
  const promise = detail ? detail.promise : program.desc.sr;

  document.title = name + ': online mentorstvo | ' + BRAND;
  setMeta('meta[name="description"]', promise);
  setMeta('meta[property="og:title"]', name + ': online mentorstvo | ' + BRAND);
  setMeta('meta[property="og:description"]', promise);
  setMeta('meta[property="og:image"]', absUrl(program.image));
  setCanonical(programHref(program.id));

  // A Service, not a Product: what is sold is coaching. The offer is listed
  // only once a real price is set; an invented one is worse than none.
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: BRAND + ' ' + name,
    serviceType: 'Online mentorstvo',
    description: promise,
    url: absUrl(programHref(program.id)),
    image: absUrl(program.image),
    provider: PROVIDER
  };
  if (typeof program.price === 'number') {
    service.offers = {
      '@type': 'Offer',
      price: program.price,
      priceCurrency: 'EUR',
      url: absUrl(programHref(program.id))
    };
  }
  setPageJsonLd(service);

  document.getElementById('wpCrumbName').textContent = name;
  document.getElementById('wpStage').innerHTML =
    '<img src="' + esc(program.image) + '" alt="' + esc(name + ', ' + program.duration.sr) + '">';
  document.getElementById('wpDuration').textContent = program.duration.sr;
  document.getElementById('wpName').textContent = name;
  document.getElementById('wpPromise').textContent = promise;
  document.getElementById('wpIncludes').innerHTML = program.includes.sr
    .map(item => '<li>' + ICONS.check + '<span>' + esc(item) + '</span></li>').join('');
  document.getElementById('wpPrice').textContent = price;

  if (detail) {
    document.getElementById('wpForYou').innerHTML = detail.forYou
      .map(line => '<li>' + ICONS.check + '<span>' + esc(line) + '</span></li>').join('');
    document.getElementById('wpNotForYou').innerHTML =
      '<span class="wp-honest-label">Nije za tebe ako</span><p>' + esc(detail.notForYou) + '</p>';
  } else {
    // No written copy for this programme yet: one section fewer rather than
    // an empty one.
    document.getElementById('za-koga').hidden = true;
    const rail = document.querySelector('[data-rail="za-koga"]');
    if (rail) rail.hidden = true;
  }

  document.getElementById('wpHow').innerHTML = HOW_STEPS.map((s, i) => howCardHtml(s, i, 'sr')).join('');

  document.getElementById('wpRelated').innerHTML = PROGRAMS
    .filter(p => p.id !== program.id)
    .map(p => programCardHtml(p, 'sr', { asLink: true, joinSource: 'ostali_programi' })).join('');

  document.getElementById('wpStickyName').textContent = name;
  document.getElementById('wpStickySub').textContent = program.duration.sr + (price ? ' · ' + price : '');
  setJoinLinks({ program: program.id });

  document.getElementById('programArticle').hidden = false;
}

document.addEventListener('DOMContentLoaded', () => {
  wireNav();
  const id = new URLSearchParams(location.search).get(PROGRAM_URL_PARAM);
  const program = PROGRAMS.find(p => p.id === id);

  if (!program) {
    showNotFound('programNotFound', 'Program nije pronađen');
    return;
  }

  clTag('stranica_programa', program.id);
  clEvent('program_otvoren');
  render(program, PROGRAM_DETAILS[program.id] || null);
  wireRail();
  heroReveal();
  scrollChrome(['vrh']);
  stickyJoinBar();
  arrivals(['.wp-honest', '.wp-related-more'], ['#wpForYou', '#wpHow', '#wpRelated']);
});

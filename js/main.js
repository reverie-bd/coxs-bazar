// ── Nav: transparent → solid on scroll ──
const header = document.getElementById('site-header');
const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Back to Top ──
const backToTop = document.createElement('button');
backToTop.id = 'back-to-top';
backToTop.setAttribute('aria-label', 'Back to top');
backToTop.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
document.body.appendChild(backToTop);

const onScrollTopBtn = () => {
  backToTop.classList.toggle('visible', window.scrollY > 600);
};
window.addEventListener('scroll', onScrollTopBtn, { passive: true });
onScrollTopBtn();

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Mobile nav toggle ──
const toggle = document.getElementById('nav-toggle');
const menu   = document.getElementById('nav-menu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
});

// ── Nav dropdowns ──
function closeAllDropdowns() {
  document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
    d.classList.remove('open');
    d.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
  });
}

// On page load: remove any hard-coded open class from HTML
document.addEventListener('DOMContentLoaded', function () {
  closeAllDropdowns();
});

document.querySelectorAll('.nav-dropdown-toggle').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var dropdown = btn.closest('.nav-dropdown');
    var isOpen = dropdown.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// Hovering into another dropdown closes any JS-opened one — desktop only, avoids touch-device conflicts
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.nav-dropdown').forEach(function (dd) {
    dd.addEventListener('mouseenter', function () {
      document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
        if (d !== dd) {
          d.classList.remove('open');
          d.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
        }
      });
    });
  });
}

// Outside click closes all
document.addEventListener('click', function (e) {
  if (!e.target.closest('.nav-dropdown')) {
    closeAllDropdowns();
  }
});

// Close mobile nav on link click (real navigation links only — excludes
// dropdown-toggle buttons so they can expand/collapse instead of closing
// the whole menu)
menu.querySelectorAll('.nav-link:not(.nav-dropdown-toggle), .nav-dropdown-link').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});


// ── Hero subtle zoom-in on load ──
const hero = document.getElementById('hero');
if (hero) {
  window.addEventListener('load', () => hero.classList.add('loaded'));
}

// ── Scroll-reveal: fade-up on entry ──
const revealEls = document.querySelectorAll(
  '.card, .exp-card, .identity-stat, .editorial-body, .atmo-text, .reveal'
);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => {
    el.classList.add('reveal-ready');
    observer.observe(el);
  });
}

// ── Live Coast Conditions (month-based, no API needed) ──
const coastData = {
  //        season              sea           boats                       beach         temp
  1:  ['Peak Season',     'Calm · Clear',   'Capped · Cox\'s Bazar',      'Inani',      '18–22°C'],
  2:  ['Peak Season',     'Calm · Clear',   'Closed (Reef Season)',       'Inani',      '20–24°C'],
  3:  ['Shoulder',        'Calm',           'Closed (Reef Season)',       'Laboni',     '24–28°C'],
  4:  ['Shoulder',        'Gentle Swell',   'Closed (Reef Season)',       'Laboni',     '27–31°C'],
  5:  ['Pre-Monsoon',     'Moderate Swell', 'Closed (Reef Season)',       'Laboni',     '28–32°C'],
  6:  ['Monsoon',         'Rough',          'Closed (Reef Season)',       'Himchari',   '27–30°C'],
  7:  ['Monsoon',         'Very Rough',     'Closed (Reef Season)',       'Himchari',   '27–29°C'],
  8:  ['Monsoon',         'Very Rough',     'Closed (Reef Season)',       'Himchari',   '27–29°C'],
  9:  ['Late Monsoon',    'Rough',          'Closed (Reef Season)',       'Laboni',     '27–30°C'],
  10: ['Transition',      'Calming',        'Reopens Nov 1',              'Laboni',     '25–28°C'],
  11: ['Peak Season',     'Calm · Clear',   'Capped · Cox\'s Bazar',      'Inani',      '20–25°C'],
  12: ['Peak Season',     'Calm · Clear',   'Capped · Cox\'s Bazar',      'Inani',      '16–21°C'],
};

const m = new Date().getMonth() + 1;
const d = coastData[m];
if (d) {
  var elSeason = document.getElementById('cond-season');
  var elSea    = document.getElementById('cond-sea');
  var elBoats  = document.getElementById('cond-boats');
  var elBeach  = document.getElementById('cond-beach');
  var elTemp   = document.getElementById('cond-temp');
  if (elSeason) elSeason.textContent = d[0];
  if (elSea)    elSea.textContent    = d[1];
  if (elBoats)  elBoats.textContent  = d[2];
  if (elBeach)  elBeach.textContent  = d[3];
  if (elTemp)   elTemp.textContent   = d[4];
}

// ── Open-Meteo Live Weather (Cox's Bazar: 21.4272°N, 92.0058°E) ──
function updateWeather() {
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=21.4272&longitude=92.0058&current=temperature_2m,weathercode,windspeed_10m&wind_speed_unit=kmh&timezone=Asia%2FDhaka';
  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var c = data.current;
      var temp = Math.round(c.temperature_2m) + '°C';
      var wind = Math.round(c.windspeed_10m) + ' km/h wind';
      var code = c.weathercode;
      var condition =
        code === 0 ? 'Clear Sky' :
        code <= 2  ? 'Partly Cloudy' :
        code === 3 ? 'Overcast' :
        code <= 49 ? 'Foggy' :
        code <= 59 ? 'Drizzle' :
        code <= 69 ? 'Rain' :
        code <= 79 ? 'Snow' :
        code <= 82 ? 'Rain Showers' :
        code <= 99 ? 'Thunderstorm' : 'Variable';

      var tempEl  = document.getElementById('cond-temp');
      var seaEl   = document.getElementById('cond-sea');
      if (tempEl) tempEl.textContent  = temp;
      if (seaEl)  seaEl.textContent   = condition + ' · ' + wind;
    })
    .catch(function() {});
}
updateWeather();

// ── Lunr.js Search ──
function initSearch() {
  if (typeof lunr === 'undefined' || typeof searchIndex === 'undefined') return;

  var idx = lunr(function() {
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('body');
    searchIndex.forEach(function(doc) { this.add(doc); }, this);
  });

  var input   = document.getElementById('nav-search-input');
  var results = document.getElementById('nav-search-results');
  if (!input || !results) return;

  input.addEventListener('input', function() {
    var q = input.value.trim();
    results.innerHTML = '';
    if (q.length < 2) { results.hidden = true; return; }

    var hits = [];
    try { hits = idx.search(q + '~1'); } catch(e) { hits = []; }

    if (hits.length === 0) {
      results.innerHTML = '<div class="search-no-results">No results for "' + q + '"</div>';
      results.hidden = false;
      return;
    }

    hits.slice(0, 5).forEach(function(hit) {
      var doc = searchIndex.filter(function(d) { return d.id === hit.ref; })[0];
      if (!doc) return;
      var a = document.createElement('a');
      a.className = 'search-result-item';
      a.href = doc.url;
      a.innerHTML =
        '<div class="search-result-title">' + doc.title + '</div>' +
        '<div class="search-result-excerpt">' + doc.body.substring(0, 80) + '…</div>';
      results.appendChild(a);
    });
    results.hidden = false;
  });

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.hidden = true;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}

// ── Coast Map Interaction ──
var zoneData = {
  laboni:   { title: 'Laboni Beach', desc: 'The lively heart of Cox\'s Bazar — kites, horses, food stalls, and the longest unbroken view of open sea you will ever stand in front of.', link: 'beach.html' },
  kolatoli: { title: 'Kolatoli Beach', desc: 'The main hotel strip, just south of Laboni — busy and lively, with Sugandha\'s sunset views an easy walk away in the evening.', link: 'beach.html' },
  inani:    { title: 'Inani Beach', desc: '32 km south — coral stones embedded in the sand, teal water, dramatically quieter. The beach photographers come for.', link: 'explore.html#inani' },
  himchari: { title: 'Himchari & the Hills', desc: 'Forested hills tumbling to the sea, a waterfall most powerful in monsoon, and the only elevated view of the full coastline.', link: 'explore.html#himchari' },
  teknaf:   { title: 'Teknaf Peninsula', desc: 'The southern tip — where Bangladesh ends, the Naf River begins, and Myanmar lies across the water.', link: 'explore.html#teknaf' },
  stmartin: { title: "Saint Martin's Island", desc: "Bangladesh's only coral island — 9 km offshore from Teknaf. Turquoise shallows, coral reefs, and the clearest water in the country.", link: 'explore.html#saint-martin' }
};

var mapTitle   = document.getElementById('map-zone-title');
var mapDesc    = document.getElementById('map-zone-desc');
var mapLink    = document.getElementById('map-zone-link');
var mapZones   = document.querySelectorAll('.coast-zone');

var defaultTitle = 'Not just a beach.<br>A world of its own.';
var defaultDesc  = 'Cox\'s Bazar stretches 120 kilometres from Laboni south to Teknaf — coral islands, forested hills, Buddhist temples, and the Bay of Bengal, all within one coastline. Hover a zone to explore.';

mapZones.forEach(function(zone) {
  zone.addEventListener('mouseenter', function() {
    var key  = zone.getAttribute('data-zone');
    var info = zoneData[key];
    if (!info) return;
    mapZones.forEach(function(z) { z.classList.remove('active'); });
    zone.classList.add('active');
    mapTitle.innerHTML = info.title;
    mapDesc.textContent = info.desc;
    mapLink.href = info.link;
    mapLink.style.display = 'inline-flex';
  });

  zone.addEventListener('mouseleave', function() {
    zone.classList.remove('active');
    mapTitle.innerHTML = defaultTitle;
    mapDesc.textContent = defaultDesc;
    mapLink.style.display = 'none';
  });

  zone.addEventListener('click', function() {
    var key = zone.getAttribute('data-zone');
    var info = zoneData[key];
    if (info) window.location.href = info.link;
  });
});

// ── Trivia Quiz ──
var TRIVIA_QUESTIONS = [
  { q: "How long is Cox's Bazar's beach?", opts: ["About 60 km", "About 120 km", "About 250 km"], correct: 1 },
  { q: "Who is Cox's Bazar named after?", opts: ["A local fisherman", "A British East India Company officer", "A Mughal governor"], correct: 1 },
  { q: "Where do Saint Martin's Island ships currently depart from?", opts: ["Teknaf", "Inani", "Cox's Bazar"], correct: 2 },
  { q: "Which community has lived on this coast since the 9th century?", opts: ["The Rakhine", "The Santal", "The Chakma"], correct: 0 },
  { q: "What is Nazirartek best known for?", opts: ["Coral reefs", "Dried fish production", "Tea gardens"], correct: 1 },
  { q: "Globally, Cox's Bazar ranks as the ___ longest beach in the world.", opts: ["3rd", "8th", "15th"], correct: 0 },
  { q: "What was Cox's Bazar called before it had that name?", opts: ["Sonadia", "Panowa", "Ramu"], correct: 1 },
  { q: "Which island is Bangladesh's only coral island?", opts: ["Sonadia", "Moheshkhali", "Saint Martin"], correct: 2 },
  { q: "What is Bangladesh's weekend?", opts: ["Saturday–Sunday", "Friday–Saturday", "Sunday–Monday"], correct: 1 },
  { q: "Cox's Bazar was a finalist in which global campaign?", opts: ["New7Wonders of Nature", "UNESCO World Heritage", "World's Best Beaches Award"], correct: 0 }
];

function initTrivia() {
  var card = document.getElementById('trivia-quiz');
  if (!card) return;

  var startEl = document.getElementById('trivia-start');
  var qEl = document.getElementById('trivia-question');
  var resultEl = document.getElementById('trivia-result');
  var qnumEl = document.getElementById('trivia-qnum');
  var qtextEl = document.getElementById('trivia-qtext');
  var optionsEl = document.getElementById('trivia-options');
  var scoreEl = document.getElementById('trivia-score');
  var messageEl = document.getElementById('trivia-message');

  var current = 0;
  var score = 0;

  function showQuestion() {
    var item = TRIVIA_QUESTIONS[current];
    qnumEl.textContent = current + 1;
    qtextEl.textContent = item.q;
    optionsEl.innerHTML = '';
    item.opts.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.style.width = '100%';
      btn.style.textAlign = 'left';
      btn.textContent = opt;
      btn.addEventListener('click', function () { selectAnswer(i, btn); });
      optionsEl.appendChild(btn);
    });
  }

  function selectAnswer(i, btn) {
    var item = TRIVIA_QUESTIONS[current];
    var allBtns = optionsEl.querySelectorAll('.quiz-option');
    allBtns.forEach(function (b) { b.disabled = true; });
    if (i === item.correct) {
      score++;
      btn.style.background = '#3a7d44';
      btn.style.color = '#fff';
      btn.style.borderColor = '#3a7d44';
    } else {
      btn.style.background = '#c0392b';
      btn.style.color = '#fff';
      btn.style.borderColor = '#c0392b';
      allBtns[item.correct].style.background = '#3a7d44';
      allBtns[item.correct].style.color = '#fff';
      allBtns[item.correct].style.borderColor = '#3a7d44';
    }
    setTimeout(function () {
      current++;
      if (current < TRIVIA_QUESTIONS.length) {
        showQuestion();
      } else {
        showResult();
      }
    }, 700);
  }

  function showResult() {
    qEl.hidden = true;
    resultEl.hidden = false;
    scoreEl.textContent = score + ' / 10';
    var msg;
    if (score >= 9) msg = "Outstanding — you know this coast better than most visitors.";
    else if (score >= 7) msg = "Great result — you clearly know your way around.";
    else if (score >= 4) msg = "Decent! A bit more reading and you'll ace it.";
    else msg = "Worth another look around the site before your trip.";
    messageEl.textContent = msg;
  }

  document.getElementById('trivia-begin').addEventListener('click', function () {
    startEl.hidden = true;
    qEl.hidden = false;
    current = 0;
    score = 0;
    showQuestion();
  });

  document.getElementById('trivia-retry').addEventListener('click', function () {
    resultEl.hidden = true;
    startEl.hidden = false;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTrivia);
} else {
  initTrivia();
}

// ── Wishlist (localStorage) ──
function getWishlist() {
  try { return JSON.parse(localStorage.getItem('cbwishlist') || '[]'); }
  catch(e) { return []; }
}

function saveWishlist(list) {
  localStorage.setItem('cbwishlist', JSON.stringify(list));
}

function updateWishlistBadge() {
  var badges = document.querySelectorAll('.wishlist-badge');
  var count = getWishlist().length;
  badges.forEach(function(b) {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

function initWishlistButtons() {
  var btns = document.querySelectorAll('.wish-btn');
  var list = getWishlist();
  btns.forEach(function(btn) {
    var id    = btn.getAttribute('data-id');
    var title = btn.getAttribute('data-title');
    var url   = btn.getAttribute('data-url');
    var img   = btn.getAttribute('data-img');
    if (list.find(function(i){ return i.id === id; })) {
      btn.classList.add('wished');
      btn.setAttribute('aria-label', 'Remove from wishlist');
    }
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var current = getWishlist();
      var exists  = current.findIndex(function(i){ return i.id === id; });
      if (exists > -1) {
        current.splice(exists, 1);
        btn.classList.remove('wished');
        btn.setAttribute('aria-label', 'Save to wishlist');
      } else {
        current.push({ id: id, title: title, url: url, img: img });
        btn.classList.add('wished');
        btn.setAttribute('aria-label', 'Remove from wishlist');
      }
      saveWishlist(current);
      updateWishlistBadge();
    });
  });
  updateWishlistBadge();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWishlistButtons);
} else {
  initWishlistButtons();
}

// ── Season Tab Switcher ──
function initSeasonTabs() {
  var tabs   = document.querySelectorAll('.season-tab');
  var panels = document.querySelectorAll('.season-panel');

  if (!tabs.length || !panels.length) return;

  // Force hide all panels first
  panels.forEach(function(p) {
    p.style.setProperty('display', 'none', 'important');
  });

  // Show peak
  var peakPanel = document.getElementById('season-peak');
  if (peakPanel) {
    peakPanel.style.setProperty('display', 'grid', 'important');
  }

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.getAttribute('data-season');

      panels.forEach(function(p) {
        p.style.setProperty('display', 'none', 'important');
      });
      tabs.forEach(function(t) {
        t.classList.remove('active');
      });

      var panel = document.getElementById('season-' + target);
      if (panel) {
        panel.style.setProperty('display', 'grid', 'important');
      }
      tab.classList.add('active');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSeasonTabs);
} else {
  initSeasonTabs();
}

// ── Wishlist Page Renderer ──
var wishlistGrid  = document.getElementById('wishlist-grid');
var wishlistEmpty = document.getElementById('wishlist-empty');

if (wishlistGrid) {
  var saved = getWishlist();
  if (saved.length === 0) {
    wishlistEmpty.style.display = 'block';
  } else {
    saved.forEach(function(item) {
      var card = document.createElement('div');
      card.className = 'act-card';
      card.innerHTML =
        '<button class="wish-btn wished" data-id="' + item.id + '" data-title="' + item.title + '" data-url="' + item.url + '" data-img="' + item.img + '" aria-label="Remove from wishlist">♡</button>' +
        '<div class="act-icon-wrap" style="background: linear-gradient(135deg,#1A5F7A,#7EC8C8); background-image: url(images/' + item.img + '); background-size: cover; background-position: center; height: 160px;"></div>' +
        '<div class="act-body">' +
          '<h3>' + item.title + '</h3>' +
          '<a href="' + item.url + '" class="coast-map-link" style="margin-top:8px; display:inline-flex;">View details →</a>' +
        '</div>';
      wishlistGrid.appendChild(card);
    });
    initWishlistButtons();
  }
}
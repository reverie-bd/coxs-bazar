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
  laboni:   { title: 'Laboni Beach', desc: 'The lively heart of Cox\'s Bazar — kites, horses, food stalls, and the longest unbroken view of open sea you will ever stand in front of.', link: 'destinations.html' },
  kolatoli: { title: 'Kolatoli Beach', desc: 'The main hotel strip, just south of Laboni — busy and lively, with Sugandha\'s sunset views an easy walk away in the evening.', link: 'destinations.html' },
  inani:    { title: 'Inani Beach', desc: '32 km south — coral stones embedded in the sand, teal water, dramatically quieter. The beach photographers come for.', link: 'destinations.html#inani' },
  himchari: { title: 'Himchari & the Hills', desc: 'Forested hills tumbling to the sea, a waterfall most powerful in monsoon, and the only elevated view of the full coastline.', link: 'destinations.html#himchari' },
  teknaf:   { title: 'Teknaf Peninsula', desc: 'The southern tip — where Bangladesh ends, the Naf River begins, and Myanmar lies across the water.', link: 'destinations.html#teknaf' },
  stmartin: { title: "Saint Martin's Island", desc: "Bangladesh's only coral island — 9 km offshore from Teknaf. Turquoise shallows, coral reefs, and the clearest water in the country.", link: 'destinations.html#saint-martin' }
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

// ── Community Voices — user-submitted notes ──
function escapeVoiceText(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getCommunityNotes() {
  try { return JSON.parse(localStorage.getItem('cbCommunityNotes') || '[]'); }
  catch (e) { return []; }
}

function saveCommunityNotes(list) {
  localStorage.setItem('cbCommunityNotes', JSON.stringify(list));
}

function renderCommunityNotes() {
  var wall = document.getElementById('voice-notes-wall');
  if (!wall) return;
  var notes = getCommunityNotes();
  wall.innerHTML = '';
  notes.forEach(function (note) {
    var thread = document.createElement('div');
    thread.className = 'forum-thread';
    thread.innerHTML =
      '<div class="forum-post">' +
        '<span class="forum-avatar">🧳</span>' +
        '<div class="forum-post-body">' +
          '<p class="forum-author">' + escapeVoiceText(note.name) + '</p>' +
          '<p class="forum-text">' + escapeVoiceText(note.text) + '</p>' +
        '</div>' +
      '</div>';
    wall.appendChild(thread);
  });
}

function initCommunityForm() {
  var form = document.getElementById('voice-note-form');
  if (!form) return;

  renderCommunityNotes();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nameInput = document.getElementById('voice-note-name');
    var textInput = document.getElementById('voice-note-text');
    var name = nameInput.value.trim() || 'A traveller';
    var text = textInput.value.trim();
    if (!text) return;

    var notes = getCommunityNotes();
    notes.unshift({ name: name, text: text });
    saveCommunityNotes(notes);
    renderCommunityNotes();
    form.reset();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCommunityForm);
} else {
  initCommunityForm();
}

// ── Destinations page tab switcher ──
function initDestinationTabs() {
  var tabs = document.querySelectorAll('.dest-tab');
  var views = document.querySelectorAll('.destination-view');
  if (!tabs.length) return;

  function showView(name) {
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-view') === name);
    });
    views.forEach(function (v) {
      v.hidden = (v.id !== 'view-' + name);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      showView(tab.getAttribute('data-view'));
    });
  });

  // If someone links straight to a spot inside "Beyond the Beach"
  // (e.g. destinations.html#saint-martin), open that tab first so
  // the page can actually scroll to it.
  var hash = window.location.hash.replace('#', '');
  if (hash) {
    var target = document.getElementById(hash);
    if (target && target.closest('#view-beyond')) {
      showView('beyond');
      setTimeout(function () { target.scrollIntoView({ behavior: 'smooth' }); }, 50);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDestinationTabs);
} else {
  initDestinationTabs();
}

// ── Play With Us widget (reusable across pages, cycles through a shuffled question set) ──
var PLAY_WIDGET_SETS = {
  'coxsbazar-facts': [
    { q: "What share of Bangladesh's dried fish supply comes from Nazirartek, right here on this coast?", opts: ["15%", "45%", "85%"], correct: 2, fact: "Nazirartek, just north of the main beach, produces around 85% of Bangladesh's entire dried fish supply — a real percentage, not an estimate." },
    { q: "How long is Cox's Bazar's beach, roughly?", opts: ["60 km", "120 km", "250 km"], correct: 1, fact: "Cox's Bazar's beach runs roughly 120 km from Laboni to Teknaf — one of the longest unbroken stretches of natural beach on Earth." },
    { q: "How long has the Rakhine community lived on this coast?", opts: ["About 200 years", "Since the 9th century", "Since the 15th century"], correct: 1, fact: "The Rakhine community's presence on this coast dates back to the 9th century — over a thousand years before the town had its current name." },
    { q: "Which island is Bangladesh's only coral island?", opts: ["Sonadia", "Moheshkhali", "Saint Martin"], correct: 2, fact: "Saint Martin's Island, about 9 km off Teknaf, is Bangladesh's only coral island." },
    { q: "What is Bangladesh's weekend?", opts: ["Saturday–Sunday", "Friday–Saturday", "Sunday–Monday"], correct: 1, fact: "Bangladesh's weekend runs Friday–Saturday, not Saturday–Sunday — worth knowing when planning around bank or office hours." },
    { q: "Who is Cox's Bazar named after?", opts: ["A local fisherman", "A British East India Company officer", "A Mughal governor"], correct: 1, fact: "Cox's Bazar is named after Captain Hiram Cox, a British East India Company officer posted here in 1798 to oversee the resettlement of Arakanese refugees." },
    { q: "Cox's Bazar was an official finalist in which global campaign?", opts: ["New7Wonders of Nature", "UNESCO World Heritage", "World's Best Beaches Award"], correct: 0, fact: "Cox's Bazar was an official finalist in the New7Wonders of Nature campaign, alongside Komodo Island and the Amazon Rainforest — it didn't win, but the nomination says a lot." },
    { q: "How long is Marine Drive, the coastal road running the length of the beach?", opts: ["25 km", "80 km", "150 km"], correct: 1, fact: "Marine Drive runs about 80 km along the full length of the beach — one of South Asia's most scenic coastal roads." },
    { q: "When is peak season in Cox's Bazar?", opts: ["June–September", "November–February", "March–May"], correct: 1, fact: "November to February is peak season — calm seas, clear skies, and temperatures around 18–25°C." },
    { q: "What is Dulahazara Safari Park known for?", opts: ["Bangladesh's largest safari park", "A butterfly sanctuary", "A working lighthouse"], correct: 0, fact: "Dulahazara Safari Park, north of Cox's Bazar, is Bangladesh's largest safari park — about 900 hectares with Asian elephants, deer, and over 200 bird species." }
  ]
};

function initPlayWidgets() {
  document.querySelectorAll('.play-widget').forEach(function (widget) {
    var questions = PLAY_WIDGET_SETS[widget.getAttribute('data-set')];
    if (!questions || !questions.length) return;

    function shuffledIndices() {
      var arr = questions.map(function (_, i) { return i; });
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
      return arr;
    }

    var order = shuffledIndices();
    var current = 0;

    var qEl = widget.querySelector('.play-question');
    var optsEl = widget.querySelector('.play-options');
    var revealEl = widget.querySelector('.play-reveal');
    var nextBtn = widget.querySelector('.play-next');
    var progCurrent = widget.querySelector('.play-progress-current');
    var progTotal = widget.querySelector('.play-progress-total');
    if (progTotal) progTotal.textContent = order.length;

    function renderDone() {
      qEl.textContent = "You've been through all " + order.length + " facts about Cox's Bazar!";
      optsEl.innerHTML = '';
      revealEl.hidden = true;
      if (progCurrent) progCurrent.textContent = order.length;
      nextBtn.hidden = false;
      nextBtn.textContent = 'Play again ↺';
      nextBtn.dataset.restart = 'true';
    }

    function renderQuestion() {
      if (current >= order.length) { renderDone(); return; }
      var item = questions[order[current]];
      qEl.textContent = item.q;
      optsEl.innerHTML = '';
      revealEl.hidden = true;
      nextBtn.hidden = true;
      delete nextBtn.dataset.restart;
      if (progCurrent) progCurrent.textContent = current + 1;

      item.opts.forEach(function (opt, i) {
        var btn = document.createElement('button');
        btn.className = 'play-option';
        btn.type = 'button';
        btn.textContent = opt;
        btn.addEventListener('click', function () {
          var allBtns = optsEl.querySelectorAll('.play-option');
          allBtns.forEach(function (b) { b.disabled = true; });
          if (i === item.correct) {
            btn.classList.add('correct');
          } else {
            btn.classList.add('wrong');
            allBtns[item.correct].classList.add('correct');
          }
          revealEl.textContent = item.fact;
          revealEl.hidden = false;
          nextBtn.hidden = false;
          nextBtn.textContent = current < order.length - 1 ? 'Next question →' : 'See recap →';
        });
        optsEl.appendChild(btn);
      });
    }

    nextBtn.addEventListener('click', function () {
      if (nextBtn.dataset.restart === 'true') {
        order = shuffledIndices();
        current = 0;
      } else {
        current++;
      }
      renderQuestion();
    });

    renderQuestion();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayWidgets);
} else {
  initPlayWidgets();
}
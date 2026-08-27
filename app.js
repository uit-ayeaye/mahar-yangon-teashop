/* =========================================================
   မဟာရန်ကုန် လက်ဖက်ရည်ဆိုင် · Mahar Yangon Teashop (Nok)
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }

  /* ---------------- preloader ---------------- */
  var pre = $('#preloader');
  function hidePreloader() {
    if (!pre || pre.classList.contains('done')) return;
    pre.classList.add('done');
    window.setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 800);
  }
  window.addEventListener('load', function () { window.setTimeout(hidePreloader, reduce ? 0 : 480); });
  window.setTimeout(hidePreloader, 3200); // never trap the visitor

  /* ---------------- language ---------------- */
  var LANG_KEY = 'mytea-lang';
  function readStoredLang() {
    try { return localStorage.getItem(LANG_KEY); } catch (e) { return null; }
  }
  function storeLang(v) {
    try { localStorage.setItem(LANG_KEY, v); } catch (e) { /* private mode */ }
  }
  function applyLang(lang) {
    doc.body.setAttribute('data-lang', lang);
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'my' ? 'my' : 'en');
    var t = $('#langToggle');
    if (t) t.setAttribute('aria-label', lang === 'my' ? 'Switch to English' : 'မြန်မာဘာသာသို့ ပြောင်းရန်');
    try { doc.dispatchEvent(new CustomEvent('mytea:lang', { detail: lang })); } catch (e) { /* old browser */ }
  }
  var stored = readStoredLang();
  var initial = stored || ((navigator.language || 'en').toLowerCase().indexOf('my') === 0 ? 'my' : 'en');
  applyLang(initial);

  var langBtn = $('#langToggle');
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      var next = doc.body.getAttribute('data-lang') === 'my' ? 'en' : 'my';
      applyLang(next);
      storeLang(next);
    });
  }

  /* ---------------- nav ---------------- */
  var nav = $('#nav');
  var burger = $('#navBurger');
  var navLinks = $('#navLinks');
  var dock = $('#dock');
  var bar = $('#scrollProgress');

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    doc.addEventListener('click', function (e) {
      if (!navLinks.classList.contains('open')) return;
      if (e.target.closest('#navLinks') || e.target.closest('#navBurger')) return;
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  }

  var toTop = $('#toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('stuck', y > 40);
    if (dock) dock.classList.toggle('show', y > 420);
    if (toTop) toTop.classList.toggle('show', y > 900);
    if (bar) {
      var h = doc.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* active section in nav */
  var sections = $$('main section[id]');
  var navAnchors = $$('#navLinks a');
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------- reveal on scroll ----------------
     IntersectionObserver callbacks are deferred while a tab is hidden
     (prerender, background tab, some in-app browsers). Without a safety
     net every .reveal would stay at opacity:0 and the page would look
     blank, so we also sweep on a timer, on scroll and on visibilitychange. */
  var revealables = $$('.reveal');

  function revealAll() { revealables.forEach(function (el) { el.classList.add('in'); }); }

  // Anything at or near the viewport gets shown no matter what the observer does.
  function sweepVisible() {
    var limit = window.innerHeight * 1.15;
    revealables.forEach(function (el) {
      if (el.classList.contains('in')) return;
      if (el.getBoundingClientRect().top < limit) el.classList.add('in');
    });
  }

  if (reduce || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var rObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        var el = en.target;
        window.setTimeout(function () { el.classList.add('in'); }, Math.min(i, 6) * 70);
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { rObs.observe(el); });

    window.setTimeout(sweepVisible, 1200);
    window.setTimeout(sweepVisible, 2600);
    window.addEventListener('scroll', sweepVisible, { passive: true });
    doc.addEventListener('visibilitychange', function () { if (!doc.hidden) sweepVisible(); });
    // last resort: never leave a visitor staring at an empty page
    window.setTimeout(revealAll, 8000);
  }

  /* ---------------- hero video ---------------- */
  var hero = $('#heroVideo');
  if (hero) {
    var landscape = window.matchMedia('(min-width: 781px)');
    function heroSrc() {
      return landscape.matches
        ? { v: 'assets/video/hero-landscape.mp4', p: 'assets/img/hero-landscape-poster.jpg' }
        : { v: 'assets/video/hero-portrait.mp4', p: 'assets/img/hero-portrait-poster.jpg' };
    }
    function loadHero() {
      var s = heroSrc();
      hero.setAttribute('poster', s.p);
      if (reduce || saveData) return;          // poster only
      if (hero.getAttribute('src') === s.v) return;
      hero.setAttribute('src', s.v);
      hero.load();
      var p = hero.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked — poster stays */ });
    }
    loadHero();
    if (landscape.addEventListener) landscape.addEventListener('change', loadHero);
    else if (landscape.addListener) landscape.addListener(loadHero);

    // don't burn battery while the hero is off-screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (!hero.getAttribute('src')) return;
        if (en[0].isIntersecting) { var p = hero.play(); if (p && p.catch) p.catch(function () {}); }
        else hero.pause();
      }, { threshold: 0.05 }).observe(hero);
    }
  }

  /* ---------------- stat counters ---------------- */
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    function settle() { el.textContent = target.toLocaleString('en-US') + suffix; }
    if (el.getAttribute('data-plain')) { el.textContent = target + suffix; return; }
    if (reduce) { settle(); return; }
    var dur = 1500, t0 = null, done = false;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US') + (k === 1 ? suffix : '');
      if (k < 1) window.requestAnimationFrame(step); else done = true;
    }
    window.requestAnimationFrame(step);
    // rAF is throttled/paused in hidden tabs — never leave a half-counted number on screen
    window.setTimeout(function () { if (!done) settle(); }, dur + 900);
    doc.addEventListener('visibilitychange', function () { if (!doc.hidden && !done) settle(); });
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var cObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        runCount(en.target); obs.unobserve(en.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cObs.observe(el); });
  } else {
    counters.forEach(runCount);
  }


  /* ---------------- tea picker ----------------
     The five .tea-card list items in the markup are the single source of
     truth: they hold the names, the copy, the sweet/rich meters and the
     brew colours, and they are what a visitor without JS sees. Everything
     below reads that list and builds the pick-your-cup stage on top of it.

     To add or change a cup, edit the <li> in index.html — nothing here
     needs to know how many there are. */
  (function buildTeaPicker() {
    var mount = $('#teaPicker');
    var grid = $('#teaGrid');
    if (!mount || !grid) return;

    var teas = $$('.tea-card', grid).map(function (card, i) {
      var meters = $$('.meter', card).map(function (m) {
        return {
          my: m.getAttribute('data-label-my') || '',
          en: m.getAttribute('data-label-en') || '',
          value: $$('i.on', m).length,
          total: $$('i', m).length
        };
      });
      return {
        i: i,
        my: ($('b', card) || {}).textContent || '',
        en: ($('i', card) || {}).textContent || '',
        descMy: (($('p .t-my', card) || {}).textContent || ''),
        descEn: (($('p .t-en', card) || {}).textContent || ''),
        meters: meters,
        sweet: meters[0] ? meters[0].value : 3,
        rich: meters[1] ? meters[1].value : 3,
        steps: meters[0] ? meters[0].total : 5,
        top: card.getAttribute('data-top') || '#C89050',
        mid: card.getAttribute('data-mid') || '#A96F36',
        bot: card.getAttribute('data-bot') || '#6F4322',
        foam: parseFloat(card.getAttribute('data-foam') || '.2'),
        sugar: parseFloat(card.getAttribute('data-sugar') || '.4'),
        photo: card.getAttribute('data-photo') || ''
      };
    });
    if (teas.length < 2) return;

    var STEPS = teas[0].steps || 5;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };

    function meterHTML(m) {
      var pips = '';
      for (var k = 0; k < m.total; k++) {
        pips += '<i class="' + (k < m.value ? 'on' : '') + '" style="--k:' + k + '"></i>';
      }
      return '<span class="meter" data-label-my="' + m.my + '" data-label-en="' + m.en + '">' + pips + '</span>';
    }

    /* The glass. Colours, foam depth and the sweet layer at the bottom all
       come from the card's data-* attributes, so every cup pours differently. */
    var GLASS =
      '<svg class="cup-svg" viewBox="0 0 140 172" role="img" aria-hidden="true" focusable="false">' +
        '<defs>' +
          '<linearGradient id="teaFill" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="var(--tea-top)"/>' +
            '<stop offset="52%" stop-color="var(--tea-mid)"/>' +
            '<stop offset="100%" stop-color="var(--tea-bot)"/>' +
          '</linearGradient>' +
          '<clipPath id="glassClip">' +
            '<path d="M40 34h60l-7 96a15 15 0 0 1-15 14H62a15 15 0 0 1-15-14z"/>' +
          '</clipPath>' +
        '</defs>' +
        '<ellipse class="cup-shadow" cx="70" cy="152" rx="45" ry="8"/>' +
        '<g clip-path="url(#glassClip)">' +
          '<rect class="cup-empty" x="34" y="30" width="72" height="120"/>' +
          '<g class="cup-pour">' +
            '<rect class="cup-liquid" x="34" y="44" width="72" height="106" fill="url(#teaFill)"/>' +
            '<rect class="cup-sweet" x="34" width="72"/>' +
            '<ellipse class="cup-swirl s1" cx="58" cy="96" rx="26" ry="9"/>' +
            '<ellipse class="cup-swirl s2" cx="84" cy="116" rx="21" ry="7"/>' +
          '</g>' +
          '<ellipse class="cup-foam" cx="70" cy="45" rx="36"/>' +
          '<rect class="cup-shine" x="48" y="38" width="9" height="104" rx="5"/>' +
        '</g>' +
        '<path class="cup-glass" d="M40 34h60l-7 96a15 15 0 0 1-15 14H62a15 15 0 0 1-15-14z"/>' +
        '<path class="cup-rim" d="M38 34h64"/>' +
        '<path class="cup-saucer" d="M28 152h84"/>' +
      '</svg>';

    mount.innerHTML =
      '<div class="tea-stage">' +
        '<span class="stage-glow" aria-hidden="true"></span>' +
        '<span class="stage-frame" aria-hidden="true"></span>' +
        '<button class="stage-arrow prev" type="button" aria-label="Previous cup">' +
          '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M15 5 8 12l7 7"/></svg></button>' +
        '<button class="stage-arrow next" type="button" aria-label="Next cup">' +
          '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
        '<div class="stage-card" id="teaStageCard" role="tabpanel" aria-live="polite">' +
          '<span class="stage-index" aria-hidden="true"><b>01</b><i>/</i>' + pad(teas.length) + '</span>' +
          '<div class="stage-cup">' +
            '<span class="cup-halo" aria-hidden="true"></span>' +
            GLASS +
            '<span class="ssteam" aria-hidden="true"><i></i><i></i><i></i></span>' +
            '<img class="cup-photo" alt="" hidden>' +
          '</div>' +
          '<div class="stage-body">' +
            '<b class="stage-my"></b>' +
            '<i class="stage-en"></i>' +
            '<p class="stage-desc"><span class="t-my"></span><span class="t-en"></span></p>' +
            '<div class="stage-meters"></div>' +
            '<a class="btn btn-gold stage-cta bounce" href="tel:+959882090011">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.6a1 1 0 0 1-.25 1z"/></svg>' +
              '<span class="t-my">ဒီတစ်ခွက် မှာမယ်</span><span class="t-en">Order this cup</span>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="tea-rail-wrap">' +
        '<div class="tea-rail" id="teaRail" role="tablist" aria-label="Choose your cup">' +
          teas.map(function (t, i) {
            return '<button class="tea-token" type="button" role="tab" data-i="' + i + '" ' +
                   'aria-selected="' + (i === 0 ? 'true' : 'false') + '" tabindex="' + (i === 0 ? '0' : '-1') + '">' +
                     '<span class="token-gem" style="--tea-mid:' + t.mid + ';--tea-bot:' + t.bot + '">' +
                       '<span class="token-ring" aria-hidden="true"></span>' +
                       '<span class="token-brew" aria-hidden="true"></span>' +
                       '<svg class="ico" aria-hidden="true"><use href="#i-cup"/></svg></span>' +
                     '<span class="token-my">' + t.my + '</span>' +
                     '<span class="token-en">' + t.en + '</span>' +
                   '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<p class="tea-hint"><span class="t-my">ခွက်တစ်ခုကို ရွေးကြည့်ပါ</span><span class="t-en">Tap a cup to see how it drinks</span></p>' +

      /* the dial: describe the cup you want and we name it for you */
      '<div class="taste" id="taste">' +
        '<p class="taste-head">' +
          '<svg class="ico" aria-hidden="true"><use href="#i-sparkle"/></svg>' +
          '<span class="t-my">ဒါမှမဟုတ် ကြိုက်တဲ့အရသာကို ချိန်ကြည့်ပါ</span>' +
          '<span class="t-en">Or dial in the cup you want</span>' +
        '</p>' +
        '<div class="dial">' +
          dialRow('sweet', teas[0].meters[0]) +
          dialRow('rich', teas[0].meters[1]) +
        '</div>' +
        '<p class="taste-out">' +
          '<span class="t-my">ကျွန်ုပ်တို့ ဖျော်ပေးမယ့်ခွက် —</span>' +
          '<span class="t-en">We&rsquo;d pour you a</span>' +
          '<b class="taste-pick"></b>' +
        '</p>' +
      '</div>';

    function dialRow(axis, m) {
      if (!m) return '';
      var pips = '';
      for (var k = 1; k <= STEPS; k++) {
        pips += '<button class="pip" type="button" data-v="' + k + '" tabindex="-1" aria-hidden="true"></button>';
      }
      return '<div class="dial-row" data-axis="' + axis + '">' +
               '<span class="dial-label" data-label-my="' + m.my + '" data-label-en="' + m.en + '"></span>' +
               '<span class="dial-pips" role="slider" tabindex="0" aria-valuemin="1" aria-valuemax="' + STEPS + '" ' +
                 'aria-valuenow="3" aria-label="' + m.en + '">' + pips + '</span>' +
               '<span class="dial-num"><b>3</b>/' + STEPS + '</span>' +
             '</div>';
    }

    var card = $('#teaStageCard', mount);
    var rail = $('#teaRail', mount);
    var tokens = $$('.tea-token', mount);
    var elMy = $('.stage-my', card), elEn = $('.stage-en', card);
    var elDescMy = $('.stage-desc .t-my', card), elDescEn = $('.stage-desc .t-en', card);
    var elMeters = $('.stage-meters', card), elIndex = $('.stage-index b', card);
    var elCup = $('.stage-cup', card);
    var elSweetRect = $('.cup-sweet', card), elFoam = $('.cup-foam', card);
    var elPhoto = $('.cup-photo', card);
    var pickOut = $('.taste-pick', mount);
    var dialRows = $$('.dial-row', mount);
    var current = -1;
    var dial = { sweet: teas[0].sweet, rich: teas[0].rich };

    /* fade the rail's edges only while there is actually something off-screen */
    var railWrap = $('.tea-rail-wrap', mount);
    function paintRail() {
      if (!rail || !railWrap) return;
      var max = rail.scrollWidth - rail.clientWidth;
      railWrap.classList.toggle('scrollable', max > 4);
      railWrap.classList.toggle('at-start', rail.scrollLeft < 4);
      railWrap.classList.toggle('at-end', rail.scrollLeft > max - 4);
    }
    if (rail) {
      var rTick = false;
      rail.addEventListener('scroll', function () {
        if (rTick) return;
        rTick = true;
        window.requestAnimationFrame(function () { paintRail(); rTick = false; });
      }, { passive: true });
      window.addEventListener('resize', paintRail);
    }

    /* Scroll the rail itself — never scrollIntoView(), which walks up to the
       document and drags the whole page sideways on narrow screens. */
    function centreToken(i) {
      var t = tokens[i];
      if (!rail || !t || rail.scrollWidth <= rail.clientWidth + 1) return;
      var target = t.offsetLeft - (rail.clientWidth - t.offsetWidth) / 2;
      target = Math.max(0, Math.min(target, rail.scrollWidth - rail.clientWidth));
      if (Math.abs(target - rail.scrollLeft) < 2) return;
      if (rail.scrollTo) rail.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
      else rail.scrollLeft = target;
    }

    function paintDial() {
      dialRows.forEach(function (row) {
        var axis = row.getAttribute('data-axis');
        var v = dial[axis];
        var pips = $$('.pip', row);
        pips.forEach(function (p, k) { p.classList.toggle('on', k < v); });
        var slider = $('.dial-pips', row);
        if (slider) slider.setAttribute('aria-valuenow', String(v));
        var num = $('.dial-num b', row);
        if (num) num.textContent = String(v);
      });
    }

    function matchDial() {
      var best = 0, bestD = Infinity;
      teas.forEach(function (t, i) {
        var d = Math.abs(t.sweet - dial.sweet) * 1.15 + Math.abs(t.rich - dial.rich);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }

    function select(i, opts) {
      opts = opts || {};
      i = (i + teas.length) % teas.length;
      if (i === current) return;
      var t = teas[i];
      current = i;

      card.classList.remove('swap');
      void card.offsetWidth;           // restart the entrance animation
      card.classList.add('swap');

      /* pour this cup's colours into the glass */
      card.style.setProperty('--tea-top', t.top);
      card.style.setProperty('--tea-mid', t.mid);
      card.style.setProperty('--tea-bot', t.bot);
      if (elFoam) elFoam.setAttribute('ry', String(3 + t.foam * 13));
      if (elSweetRect) {
        var h = 6 + t.sugar * 30;
        elSweetRect.setAttribute('height', String(h));
        elSweetRect.setAttribute('y', String(150 - h));
      }
      if (elPhoto) {                    // real photo wins over the drawn glass
        if (t.photo) { elPhoto.src = t.photo; elPhoto.alt = t.en; elPhoto.hidden = false; elCup.classList.add('has-photo'); }
        else { elPhoto.removeAttribute('src'); elPhoto.hidden = true; elCup.classList.remove('has-photo'); }
      }

      elMy.textContent = t.my;
      elEn.textContent = t.en;
      elDescMy.textContent = t.descMy;
      elDescEn.textContent = t.descEn;
      elIndex.textContent = pad(i + 1);
      elMeters.innerHTML = t.meters.map(meterHTML).join('');
      if (pickOut) { pickOut.setAttribute('data-my', t.my); pickOut.setAttribute('data-en', t.en); paintPick(); }

      tokens.forEach(function (b, k) {
        var on = k === i;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.setAttribute('tabindex', on ? '0' : '-1');
      });
      if (opts.focusToken && tokens[i]) tokens[i].focus();
      if (opts.syncDial !== false) { dial.sweet = t.sweet; dial.rich = t.rich; paintDial(); }
      if (opts.scroll !== false) centreToken(i);
    }

    tokens.forEach(function (b) {
      b.addEventListener('click', function () { select(parseInt(b.getAttribute('data-i'), 10)); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(current + 1, { focusToken: true }); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(current - 1, { focusToken: true }); }
        else if (e.key === 'Home') { e.preventDefault(); select(0, { focusToken: true }); }
        else if (e.key === 'End') { e.preventDefault(); select(teas.length - 1, { focusToken: true }); }
      });
    });

    $$('.stage-arrow', mount).forEach(function (a) {
      a.addEventListener('click', function () {
        select(current + (a.classList.contains('next') ? 1 : -1));
      });
    });

    /* the dial */
    dialRows.forEach(function (row) {
      var axis = row.getAttribute('data-axis');
      function setV(v) {
        v = Math.max(1, Math.min(STEPS, v));
        if (v === dial[axis]) return;
        dial[axis] = v;
        paintDial();
        row.classList.remove('nudge'); void row.offsetWidth; row.classList.add('nudge');
        select(matchDial(), { syncDial: false });
      }
      $$('.pip', row).forEach(function (p) {
        p.addEventListener('click', function () { setV(parseInt(p.getAttribute('data-v'), 10)); });
      });
      var slider = $('.dial-pips', row);
      if (slider) {
        slider.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setV(dial[axis] + 1); }
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setV(dial[axis] - 1); }
          else if (e.key === 'Home') { e.preventDefault(); setV(1); }
          else if (e.key === 'End') { e.preventDefault(); setV(STEPS); }
        });
      }
    });

    /* swipe the stage to move between cups */
    var sx = 0, sy = 0;
    card.addEventListener('touchstart', function (e) {
      sx = e.changedTouches[0].clientX; sy = e.changedTouches[0].clientY;
    }, { passive: true });
    card.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) select(current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    /* the dial labels and the matched cup are bilingual and swap with the toggle */
    function isMy() { return doc.body.getAttribute('data-lang') === 'my'; }
    function paintPick() {
      if (!pickOut) return;
      pickOut.textContent = pickOut.getAttribute(isMy() ? 'data-my' : 'data-en') || '';
    }
    function paintDialLabels() {
      var my = isMy();
      $$('.dial-label', mount).forEach(function (l) {
        l.textContent = l.getAttribute(my ? 'data-label-my' : 'data-label-en') || '';
      });
      paintPick();
    }
    paintDialLabels();
    doc.addEventListener('mytea:lang', paintDialLabels);

    grid.setAttribute('hidden', '');
    mount.removeAttribute('hidden');
    /* No rail scrolling on the first paint: the page has just loaded and the
       visitor is still up at the hero. */
    select(0, { scroll: false });
    paintDial();
    paintRail();
  })();

  /* ---------------- reels ----------------
     A horizontal rail of the shop's TikToks. Every way of moving through it
     drives the same scroller: drag, swipe, the arrows, the dots, the keyboard
     and the mouse wheel. Add or remove an <article class="reel"> in the markup
     and the arrows, dots and keyboard all follow automatically. */
  var reelsRoot = $('#reelsRail');
  var reels = $$('.reel');
  var allReelVideos = [];
  var reelApi = [];          // one entry per reel: { play, stop, ensure }

  reels.forEach(function (reel, index) {
    var phone = $('.phone', reel);
    var vid = $('.reel-v', reel);
    var src = reel.getAttribute('data-src');
    var sound = $('.reel-sound', reel);
    var bar = $('.reel-bar i', reel);
    if (!phone || !vid || !src) return;
    allReelVideos.push(vid);

    function ensureSrc() {
      if (!vid.getAttribute('src')) { vid.setAttribute('src', src); vid.load(); }
    }
    function setSoundIcon() {
      if (!sound) return;
      var u = sound.querySelector('use');
      if (u) u.setAttribute('href', vid.muted ? '#i-mute' : '#i-sound');
    }
    function stopOthers() {
      allReelVideos.forEach(function (o) { if (o !== vid) { o.pause(); o.muted = true; } });
      $$('.phone').forEach(function (p) { if (p !== phone) p.classList.remove('playing'); });
    }

    // tap = play with sound (a user gesture, so unmuting is allowed)
    phone.addEventListener('click', function () {
      ensureSrc();
      if (vid.paused) {
        stopOthers();
        vid.muted = false;
        var p = vid.play();
        if (p && p.catch) p.catch(function () { vid.muted = true; vid.play(); });
        phone.classList.add('playing');
      } else if (vid.muted) {
        stopOthers();
        vid.muted = false;
      } else {
        vid.pause();
        phone.classList.remove('playing');
      }
      setSoundIcon();
    });

    vid.addEventListener('volumechange', setSoundIcon);
    vid.addEventListener('pause', function () {
      if (vid.muted) phone.classList.remove('playing');
    });
    vid.addEventListener('timeupdate', function () {
      if (bar && vid.duration) bar.style.transform = 'scaleX(' + (vid.currentTime / vid.duration) + ')';
    });
    // a Yangon mobile connection can sit on a poster for a while — say so
    ['loadstart', 'waiting', 'stalled'].forEach(function (ev) {
      vid.addEventListener(ev, function () { if (!vid.getAttribute('src')) return; phone.classList.add('buffering'); });
    });
    ['loadeddata', 'canplay', 'playing', 'error'].forEach(function (ev) {
      vid.addEventListener(ev, function () { phone.classList.remove('buffering'); });
    });
    vid.addEventListener('loadeddata', function () { phone.classList.add('ready'); });
    vid.addEventListener('error', function () { phone.classList.add('failed'); });

    reelApi[index] = {
      // muted auto-preview — the TikTok feel, but only ever one at a time
      preview: function () {
        if (reduce || saveData) return;
        ensureSrc();
        if (vid.paused && vid.muted !== false) {
          vid.muted = true;
          var p = vid.play();
          if (p && p.catch) p.catch(function () {});
          phone.classList.add('playing');
          setSoundIcon();
        }
      },
      // never interrupt a clip the visitor deliberately turned the sound on for
      rest: function () {
        if (!vid.muted && !vid.paused) return;
        vid.pause();
        vid.muted = true;
        phone.classList.remove('playing');
        setSoundIcon();
      }
    };
  });

  // pause everything when the tab is hidden
  doc.addEventListener('visibilitychange', function () {
    if (doc.hidden) {
      allReelVideos.forEach(function (v) { v.pause(); });
      if (hero) hero.pause();
    } else if (hero && hero.getAttribute('src')) {
      var p = hero.play(); if (p && p.catch) p.catch(function () {});
    }
  });

  /* ---- driving the rail ----
     Drag, swipe, wheel, arrows, dots and the keyboard all move the same
     scroller, and whichever reel ends up centred is the one that previews —
     so a wide screen showing five phones still only downloads and plays one. */
  if (reelsRoot && reels.length) {
    var dots = $$('.reel-dot');
    var prevBtn = $('#reelsPrev');
    var nextBtn = $('#reelsNext');
    var railInView = false;
    var previewing = -1;

    function nearestReel() {
      var maxLeft = reelsRoot.scrollWidth - reelsRoot.clientWidth;
      if (reelsRoot.scrollLeft <= 2) return 0;
      if (reelsRoot.scrollLeft >= maxLeft - 2) return reels.length - 1;
      var mid = reelsRoot.scrollLeft + reelsRoot.clientWidth / 2;
      var best = 0, bestD = Infinity;
      reels.forEach(function (r, i) {
        var c = r.offsetLeft + r.offsetWidth / 2;
        var d = Math.abs(c - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }
    function goTo(i) {
      i = Math.max(0, Math.min(reels.length - 1, i));
      var r = reels[i];
      if (!r) return;
      var left = r.offsetLeft - (reelsRoot.clientWidth - r.offsetWidth) / 2;
      left = Math.max(0, Math.min(left, reelsRoot.scrollWidth - reelsRoot.clientWidth));
      if (reelsRoot.scrollTo) reelsRoot.scrollTo({ left: left, behavior: reduce ? 'auto' : 'smooth' });
      else reelsRoot.scrollLeft = left;
    }
    function stepBy(dir) {
      var a = reels[0], b = reels[1];
      var step = (a && b) ? Math.abs(b.offsetLeft - a.offsetLeft) : reelsRoot.clientWidth * 0.8;
      var maxLeft = reelsRoot.scrollWidth - reelsRoot.clientWidth;
      var left = Math.max(0, Math.min(reelsRoot.scrollLeft + dir * step, maxLeft));
      if (reelsRoot.scrollTo) reelsRoot.scrollTo({ left: left, behavior: reduce ? 'auto' : 'smooth' });
      else reelsRoot.scrollLeft = left;
    }
    function setPreview(i) {
      if (i === previewing) return;
      reelApi.forEach(function (a, k) { if (a && k !== i) a.rest(); });
      previewing = i;
      if (railInView && i >= 0 && reelApi[i]) reelApi[i].preview();
    }
    function paintRail() {
      var i = nearestReel();
      dots.forEach(function (d, k) {
        d.classList.toggle('on', k === i);
        d.setAttribute('aria-selected', k === i ? 'true' : 'false');
      });
      var maxLeft = reelsRoot.scrollWidth - reelsRoot.clientWidth;
      if (prevBtn) prevBtn.disabled = reelsRoot.scrollLeft < 4;
      if (nextBtn) nextBtn.disabled = reelsRoot.scrollLeft > maxLeft - 4;
      reelsRoot.classList.toggle('at-start', reelsRoot.scrollLeft < 4);
      reelsRoot.classList.toggle('at-end', reelsRoot.scrollLeft > maxLeft - 4);
      setPreview(i);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { stepBy(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stepBy(1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });

    reelsRoot.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); stepBy(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stepBy(-1); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(reels.length - 1); }
    });

    var railTick = false;
    reelsRoot.addEventListener('scroll', function () {
      if (railTick) return;
      railTick = true;
      window.requestAnimationFrame(function () { paintRail(); railTick = false; });
    }, { passive: true });
    window.addEventListener('resize', paintRail);

    // nothing downloads or plays until the rail is actually on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        railInView = en[0].isIntersecting;
        if (railInView) { var i = previewing; previewing = -1; setPreview(i < 0 ? nearestReel() : i); }
        else { reelApi.forEach(function (a) { if (a) a.rest(); }); previewing = -1; }
      }, { threshold: 0.35 }).observe(reelsRoot);
    } else {
      railInView = true;
    }
    paintRail();

    /* drag-to-scroll with a mouse; a real click still gets through because we
       only swallow it once the pointer has actually travelled. */
    var down = false, startX = 0, startScroll = 0, moved = 0;
    reelsRoot.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startScroll = reelsRoot.scrollLeft;
      reelsRoot.classList.add('dragging');
    });
    reelsRoot.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      reelsRoot.scrollLeft = startScroll - dx;
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      reelsRoot.addEventListener(ev, function () { down = false; reelsRoot.classList.remove('dragging'); });
    });
    reelsRoot.addEventListener('click', function (e) {
      if (moved > 8) { e.stopPropagation(); e.preventDefault(); }
    }, true);

    /* a trackpad's sideways swipe already works; give a plain wheel one too,
       but only while the rail still has somewhere to go, so the page keeps
       scrolling normally at either end. */
    reelsRoot.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      var maxLeft = reelsRoot.scrollWidth - reelsRoot.clientWidth;
      if (maxLeft < 4) return;
      var next = reelsRoot.scrollLeft + e.deltaY;
      if (next <= 0 || next >= maxLeft) return;
      e.preventDefault();
      reelsRoot.scrollLeft = next;
    }, { passive: false });
  }

  /* ---------------- lightbox ---------------- */
  var figures = $$('#masonry .ph');
  var lb = $('#lightbox');
  var lbImg = $('#lbImg');
  var lbCap = $('#lbCap');
  var idx = 0;
  var lastFocus = null;

  function captionFor(fig) {
    var lang = doc.body.getAttribute('data-lang');
    var el = $(lang === 'my' ? '.b-my' : '.b-en', fig) || $('figcaption', fig);
    return el ? el.textContent.trim() : '';
  }
  function showAt(i) {
    if (!figures.length) return;
    idx = (i + figures.length) % figures.length;
    var fig = figures[idx];
    var img = $('img', fig);
    if (!img) return;
    lbImg.setAttribute('src', img.currentSrc || img.src);
    lbImg.setAttribute('alt', img.alt || '');
    lbCap.textContent = captionFor(fig);
  }
  function openLb(i) {
    if (!lb) return;
    lastFocus = doc.activeElement;
    showAt(i);
    lb.hidden = false;
    doc.body.style.overflow = 'hidden';
    var c = $('#lbClose'); if (c) c.focus();
  }
  function closeLb() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    doc.body.style.overflow = '';
    lbImg.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  figures.forEach(function (fig, i) {
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.addEventListener('click', function () { openLb(i); });
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); }
    });
  });

  if (lb) {
    var cl = $('#lbClose'), pv = $('#lbPrev'), nx = $('#lbNext');
    if (cl) cl.addEventListener('click', closeLb);
    if (pv) pv.addEventListener('click', function () { showAt(idx - 1); });
    if (nx) nx.addEventListener('click', function () { showAt(idx + 1); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.tagName === 'FIGURE') closeLb();
    });
    doc.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') showAt(idx - 1);
      else if (e.key === 'ArrowRight') showAt(idx + 1);
    });
    // swipe
    var tsX = 0;
    lb.addEventListener('touchstart', function (e) { tsX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var d = e.changedTouches[0].clientX - tsX;
      if (Math.abs(d) > 50) showAt(idx + (d < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---------------- button shine follows the cursor ---------------- */
  if (!reduce) {
    $$('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        b.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }


  /* ---------------- motion polish ----------------
     Pointer-driven flourishes for devices that actually have a pointer.
     All of it is skipped under prefers-reduced-motion and on touch. */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!reduce && finePointer) {
    // buttons lean toward the cursor
    $$('.btn.bounce, .stage-cta').forEach(function (b) {
      var raf = null;
      function move(e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          raf = null;
          var r = b.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          b.style.setProperty('--pull-x', (dx * 7).toFixed(2) + 'px');
          b.style.setProperty('--pull-y', (dy * 5).toFixed(2) + 'px');
        });
      }
      b.addEventListener('pointermove', move);
      b.addEventListener('pointerleave', function () {
        b.style.setProperty('--pull-x', '0px');
        b.style.setProperty('--pull-y', '0px');
      });
    });

    // cards tip very slightly toward the cursor
    $$('.dish, .vcard, .pillars li, .tea-token, .ph').forEach(function (c) {
      var raf = null;
      c.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          raf = null;
          var r = c.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          c.style.setProperty('--tilt-x', (-py * 5).toFixed(2) + 'deg');
          c.style.setProperty('--tilt-y', (px * 5).toFixed(2) + 'deg');
        });
      });
      c.addEventListener('pointerleave', function () {
        c.style.setProperty('--tilt-x', '0deg');
        c.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  // hero drifts a touch slower than the page beneath it
  if (!reduce) {
    var heroInner = $('.hero-inner');
    var heroSec = $('.hero');
    if (heroInner && heroSec) {
      var pTick = false;
      window.addEventListener('scroll', function () {
        if (pTick) return;
        pTick = true;
        window.requestAnimationFrame(function () {
          pTick = false;
          var y = window.scrollY || 0;
          if (y > window.innerHeight) return;
          var k = Math.min(y / window.innerHeight, 1);
          heroInner.style.transform = 'translate3d(0,' + (k * 46).toFixed(1) + 'px,0)';
          heroInner.style.opacity = String(Math.max(1 - k * 1.15, 0));
        });
      }, { passive: true });
    }
  }

  /* ---------------- misc ---------------- */
  var y = $('#year');
  if (y) y.textContent = String(new Date().getFullYear());

  // smooth in-page scrolling that respects the sticky nav
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      var t = doc.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });
})();

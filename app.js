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
    if (el.getAttribute('data-plain') || reduce) { el.textContent = target + suffix; return; }
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
     The five tea cards stay in the DOM as the data source and as the
     no-JS fallback. Here we read them and build a pick-your-cup stage
     on top, then hide the plain list. */
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
        meters: meters
      };
    });
    if (teas.length < 2) return;

    function meterHTML(m) {
      var pips = '';
      for (var k = 0; k < m.total; k++) {
        pips += '<i class="' + (k < m.value ? 'on' : '') + '" style="--k:' + k + '"></i>';
      }
      return '<span class="meter" data-label-my="' + m.my + '" data-label-en="' + m.en + '">' + pips + '</span>';
    }

    var pad = function (n) { return (n < 10 ? '0' : '') + n; };

    mount.innerHTML =
      '<div class="tea-stage">' +
        '<span class="stage-glow" aria-hidden="true"></span>' +
        '<span class="stage-frame" aria-hidden="true"></span>' +
        '<div class="stage-card" id="teaStageCard" role="tabpanel" aria-live="polite">' +
          '<span class="stage-index" aria-hidden="true"><b>01</b><i>/</i>' + pad(teas.length) + '</span>' +
          '<span class="stage-cup"><svg class="ico" aria-hidden="true"><use href="#i-cup"/></svg>' +
            '<span class="ssteam"><i></i><i></i><i></i></span></span>' +
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
      '<div class="tea-rail" role="tablist" aria-label="Choose your cup">' +
        teas.map(function (t, i) {
          return '<button class="tea-token" type="button" role="tab" data-i="' + i + '" ' +
                 'aria-selected="' + (i === 0 ? 'true' : 'false') + '" tabindex="' + (i === 0 ? '0' : '-1') + '">' +
                   '<span class="token-gem"><span class="token-ring" aria-hidden="true"></span>' +
                     '<svg class="ico" aria-hidden="true"><use href="#i-cup"/></svg></span>' +
                   '<span class="token-my">' + t.my + '</span>' +
                   '<span class="token-en">' + t.en + '</span>' +
                 '</button>';
        }).join('') +
      '</div>' +
      '<p class="tea-hint"><span class="t-my">ခွက်တစ်ခုကို ရွေးကြည့်ပါ</span><span class="t-en">Tap a cup to see how it drinks</span></p>';

    var card = $('#teaStageCard', mount);
    var tokens = $$('.tea-token', mount);
    var elMy = $('.stage-my', card), elEn = $('.stage-en', card);
    var elDescMy = $('.stage-desc .t-my', card), elDescEn = $('.stage-desc .t-en', card);
    var elMeters = $('.stage-meters', card), elIndex = $('.stage-index b', card);
    var current = -1;

    function select(i, focusToken) {
      i = (i + teas.length) % teas.length;
      if (i === current) return;
      var t = teas[i];
      current = i;

      card.classList.remove('swap');
      void card.offsetWidth;           // restart the entrance animation
      card.classList.add('swap');

      elMy.textContent = t.my;
      elEn.textContent = t.en;
      elDescMy.textContent = t.descMy;
      elDescEn.textContent = t.descEn;
      elIndex.textContent = pad(i + 1);
      elMeters.innerHTML = t.meters.map(meterHTML).join('');

      tokens.forEach(function (b, k) {
        var on = k === i;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.setAttribute('tabindex', on ? '0' : '-1');
      });
      if (focusToken && tokens[i]) tokens[i].focus();
      var t2 = tokens[i];
      if (t2 && t2.scrollIntoView) t2.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
    }

    tokens.forEach(function (b) {
      b.addEventListener('click', function () { select(parseInt(b.getAttribute('data-i'), 10)); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(current + 1, true); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(current - 1, true); }
        else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        else if (e.key === 'End') { e.preventDefault(); select(teas.length - 1, true); }
      });
    });

    // swipe the stage to move between cups
    var sx = 0, sy = 0;
    card.addEventListener('touchstart', function (e) {
      sx = e.changedTouches[0].clientX; sy = e.changedTouches[0].clientY;
    }, { passive: true });
    card.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) select(current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    grid.setAttribute('hidden', '');
    mount.removeAttribute('hidden');
    select(0);
  })();

  /* ---------------- reels ---------------- */
  var reels = $$('.reel');
  var allReelVideos = [];

  reels.forEach(function (reel) {
    var phone = $('.phone', reel);
    var vid = $('.reel-v', reel);
    var src = reel.getAttribute('data-src');
    var sound = $('.reel-sound', reel);
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

    // tap = play, and unmute (this is a user gesture, so sound is allowed)
    phone.addEventListener('click', function () {
      ensureSrc();
      if (vid.paused) {
        allReelVideos.forEach(function (o) { if (o !== vid) { o.pause(); o.muted = true; } });
        $$('.phone').forEach(function (p) { if (p !== phone) p.classList.remove('playing'); });
        vid.muted = false;
        var p = vid.play();
        if (p && p.catch) p.catch(function () { vid.muted = true; vid.play(); });
        phone.classList.add('playing');
      } else if (vid.muted) {
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

    // auto-preview (muted) while the reel sits in view — the TikTok feel
    if (!reduce && !saveData && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) {
          ensureSrc();
          if (vid.paused && vid.muted !== false) {
            vid.muted = true;
            var p = vid.play();
            if (p && p.catch) p.catch(function () {});
            phone.classList.add('playing');
            setSoundIcon();
          }
        } else {
          vid.pause();
          vid.muted = true;
          phone.classList.remove('playing');
          setSoundIcon();
        }
      }, { threshold: 0.62 }).observe(phone);
    }
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

  /* drag-to-scroll the reels rail on desktop */
  var rail = $('#reelsRail');
  if (rail) {
    var down = false, startX = 0, startScroll = 0, moved = 0;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startScroll = rail.scrollLeft;
      rail.style.cursor = 'grabbing';
    });
    rail.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      rail.scrollLeft = startScroll - dx;
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      rail.addEventListener(ev, function () { down = false; rail.style.cursor = ''; });
    });
    rail.addEventListener('click', function (e) {
      if (moved > 8) { e.stopPropagation(); e.preventDefault(); }
    }, true);
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

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

  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('stuck', y > 40);
    if (dock) dock.classList.toggle('show', y > 420);
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
      if (sound) sound.textContent = vid.muted ? '🔇' : '🔊';
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

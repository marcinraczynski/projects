/* K+ PA – animacje przy przewijaniu (GSAP + ScrollTrigger, pliki lokalne).
   Desktop (>=1024px): przypięte sekcje "Kiedy warto" i "Jak pracujemy", karty projektów nakładają się.
   Mobile: bez przypinania, stany zmieniają się w trakcie zwykłego przewijania.
   prefers-reduced-motion: brak animacji, treść widoczna od razu. */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---------- Kiedy warto: 8 pozycji, licznik 01–08, segmenty ---------- */
  var when = $('.when');
  var whenItems = $$('.when__item');
  var whenNum = $('.counter__num b');
  var segs = $$('.segs i');
  var whenIdx = -1;
  function setWhen(i) {
    i = Math.max(0, Math.min(whenItems.length - 1, i));
    if (i === whenIdx) return;
    whenIdx = i;
    whenItems.forEach(function (el, k) {
      el.classList.toggle('is-past', k < i);
      el.classList.toggle('is-active', k === i);
    });
    segs.forEach(function (el, k) { el.classList.toggle('on', k <= i); });
    if (whenNum) whenNum.textContent = pad(i + 1);
  }

  /* ---------- Jak pracujemy: 4 etapy, łuk domyka okrąg ---------- */
  var arc = $('.cycle__arc');
  var nodes = $$('.cycle__node');
  var names = $$('.cycle__name');
  var stage = $('.stage');
  var stageLis = $$('.stage__list li');
  var kicker = $('.stage__kicker'), sName = $('.stage__name'), sDesc = $('.stage__desc');
  var stages = stageLis.map(function (li) {
    var sr = li.querySelector('.sr-only');
    var label = li.querySelector('span:last-child').firstChild.textContent;
    return { name: label, desc: sr ? sr.textContent.replace(/^:\s*/, '') : '' };
  });
  var cycle = $('.cycle');
  var howIdx = -1, howDone = null, swapT = null;
  /* "Monitor & Adapt": "& Adapt" w nowej linii, żeby znak & nie zostawał sam na końcu wiersza. */
  var esc = function (t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  var nameHtml = function (t) { return esc(t).replace(/\s&amp;\s/, '<br>&amp;&nbsp;'); };
  function setHow(i, progress) {
    if (arc && progress != null) arc.style.strokeDashoffset = String(1 - progress);
    i = Math.max(0, Math.min(stages.length - 1, i));
    /* Po przejściu całej drogi: wszystkie etapy zaliczone, środek koła granatowy z ptaszkiem. */
    var done = progress != null && progress >= .97;
    if (i === howIdx && done === howDone) return;
    var first = howIdx === -1, changed = i !== howIdx;
    howIdx = i; howDone = done;
    if (cycle) cycle.classList.toggle('is-complete', done);
    nodes.forEach(function (el, k) { el.classList.toggle('is-done', k < i || done); el.classList.toggle('is-active', k === i && !done); });
    names.forEach(function (el, k) { el.classList.toggle('is-done', k < i || done); el.classList.toggle('is-active', k === i && !done); });
    stageLis.forEach(function (el, k) { el.classList.toggle('is-active', k === i); el.classList.toggle('is-done', k < i || done); });
    if (!changed) return;
    function fill() {
      kicker.textContent = 'Etap ' + pad(i + 1) + ' / ' + pad(stages.length);
      sName.innerHTML = nameHtml(stages[i].name);
      sDesc.textContent = stages[i].desc;
      stage.classList.remove('is-swapping');
    }
    clearTimeout(swapT);
    if (first) { fill(); return; }
    stage.classList.add('is-swapping');
    swapT = setTimeout(fill, 220);
  }

  var mm = gsap.matchMedia();

  mm.add({
    desktop: '(min-width: 1024px)',
    mobile: '(max-width: 1023px)',
    motion: '(prefers-reduced-motion: no-preference)'
  }, function (ctx) {
    var c = ctx.conditions;
    if (!c.motion) {
      /* Bez ruchu: statyczny stan z HTML, bez przypinania. */
      return;
    }

    /* Fade-up: filary Podejścia i karty Usług (stagger 60 ms). */
    [['.pillar'], ['.svc']].forEach(function (sel) {
      var els = $$(sel[0]);
      if (!els.length) return;
      gsap.set(els, { autoAlpha: 0, y: 32 });
      ST.batch(els, {
        start: 'top 88%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out', stagger: .06, overwrite: true });
        }
      });
    });

    /* Kiedy warto */
    if (when && whenItems.length) {
      setWhen(0);
      if (c.desktop) {
        /* Sekcja ma najwyżej wysokość okna; lista przesuwa się w środku, lewa kolumna stoi.
           Dzięki temu pod listą nie zostaje puste miejsce po odpięciu. */
        var list = $('.when__list');
        var wbox = $('.box', when);
        when.classList.add('when--pin');
        var overflow = function () {
          var padB = parseFloat(getComputedStyle(wbox).paddingBottom) || 0;
          return Math.max(0, list.offsetTop + list.offsetHeight - (wbox.clientHeight - padB));
        };
        gsap.to(list, {
          y: function () { return -overflow(); }, ease: 'none',
          scrollTrigger: {
            trigger: when, start: 'top top', end: '+=' + (whenItems.length * 0.25 * 100) + '%',
            pin: true, pinSpacing: true, anticipatePin: 1, scrub: true, invalidateOnRefresh: true,
            onUpdate: function (self) { setWhen(Math.floor(self.progress * whenItems.length)); }
          }
        });
      } else {
        whenItems.forEach(function (el, k) {
          ST.create({ trigger: el, start: 'top 60%', end: 'bottom 60%',
            onToggle: function (self) { if (self.isActive) setWhen(k); } });
        });
      }
    }

    /* Jak pracujemy */
    var how = $('#jak-pracujemy');
    if (how && stages.length && arc) {
      setHow(0, 0);
      var upd = function (self) {
        var p = self.progress;
        setHow(Math.floor(p * stages.length), p);
      };
      if (c.desktop) {
        ST.create({ trigger: how, start: 'top top', end: '+=200%', pin: true, anticipatePin: 1, scrub: true, onUpdate: upd });
      } else {
        ST.create({ trigger: '.how__cycle', start: 'top 70%', end: 'bottom 30%', onUpdate: upd });
      }
    }

    /* Doświadczenie: liczniki od zera */
    var counters = $$('.kpi__num b[data-count]');
    var finals = counters.map(function (b) { return b.innerHTML; });
    counters.forEach(function (b) {
      var target = +b.getAttribute('data-count');
      var suffix = b.getAttribute('data-suffix') || '';
      var final = b.innerHTML;
      var o = { v: 0 };
      var fmt = function (v) {
        var s = String(Math.round(v));
        if (s.length > 3) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return s + suffix;
      };
      b.textContent = fmt(0);
      gsap.to(o, {
        v: target, duration: target > 100 ? 2 : 1.4, ease: 'power2.out',
        scrollTrigger: { trigger: b, start: 'top 85%', once: true },
        onUpdate: function () { b.textContent = fmt(o.v); },
        onComplete: function () { b.innerHTML = final; }
      });
    });

    /* Oś 6 lat rysuje się od lewej */
    var bars = $$('.years__bars i');
    if (bars.length) {
      gsap.from(bars, { scaleX: 0, transformOrigin: '0 50%', duration: .5, ease: 'power2.out', stagger: .12,
        scrollTrigger: { trigger: '.years', start: 'top 90%', once: true } });
    }

    /* 40 kropek zapala się po kolei */
    var dots = $$('.dots i');
    if (dots.length) {
      gsap.from(dots, { opacity: .12, scale: .6, duration: .35, ease: 'power1.out', stagger: .035,
        scrollTrigger: { trigger: '.dots', start: 'top 90%', once: true } });
    }

    /* Karty projektów: poprzednia zmniejsza się do 0.96, gdy nachodzi następna (tylko desktop ze sticky). */
    if (c.desktop) {
      var cards = $$('.project');
      cards.forEach(function (card, k) {
        var next = cards[k + 1];
        if (!next || getComputedStyle(card).position !== 'sticky') return;
        gsap.to(card, { scale: .96, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', scrub: true, invalidateOnRefresh: true,
            end: function () { return 'top ' + (parseFloat(getComputedStyle(next).top) || 0) + 'px'; } } });
      });
    }

    return function () {
      gsap.set($$('.pillar, .svc, .project, .when__list, .years__bars i, .dots i'), { clearProps: 'all' });
      when && when.classList.remove('when--pin');
      if (arc) arc.style.strokeDashoffset = '';
      counters.forEach(function (b, k) { b.innerHTML = finals[k]; });
    };
  });

  /* Po załadowaniu fontów i obrazów przelicz pozycje. */
  window.addEventListener('load', function () { ST.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();

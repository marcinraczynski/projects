/* K+ PA – nawigacja mobilna i panel bio zespołu. Formularz dojdzie w kroku 5. */
(function () {
  var btn = document.querySelector('.nav__burger');
  var menu = document.getElementById('menu');
  if (!btn || !menu) return;
  function set(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
  }
  btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) set(false); });
})();

/* Panel bio: otwarcie z karty osoby, focus trap, Esc, klik w tło, powrót fokusu. */
(function () {
  var bio = document.getElementById('bio');
  if (!bio) return;
  var panel = bio.querySelector('.bio__panel');
  var content = document.getElementById('bio-content');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var opener = null, closeTimer = null;
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

  function open(btn) {
    var tpl = document.getElementById(btn.getAttribute('data-bio'));
    if (!tpl) return;
    clearTimeout(closeTimer);
    opener = btn;
    content.innerHTML = '';
    content.appendChild(tpl.content.cloneNode(true));
    panel.scrollTop = 0;
    bio.hidden = false;
    document.documentElement.classList.add('bio-open');
    bio.offsetWidth; /* wymuś reflow, żeby zadziałało przejście */
    bio.classList.add('is-open');
    bio.querySelector('.bio__close').focus();
  }
  function close() {
    if (bio.hidden) return;
    bio.classList.remove('is-open');
    document.documentElement.classList.remove('bio-open');
    closeTimer = setTimeout(function () { bio.hidden = true; content.innerHTML = ''; }, reduce.matches ? 0 : 450);
    if (opener) opener.focus();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-bio]');
    if (btn) { open(btn); return; }
    if (!bio.hidden && e.target.closest('#bio [data-close]')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (bio.hidden || !bio.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(panel.querySelectorAll(FOCUSABLE), function (el) { return el.offsetParent !== null; });
    if (!f.length) { e.preventDefault(); return; }
    var first = f[0], last = f[f.length - 1];
    if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();

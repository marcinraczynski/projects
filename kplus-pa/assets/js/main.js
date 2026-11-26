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

/* Formularz kontaktowy: walidacja w przeglądarce, wysyłka fetch do send.php, komunikat w miejscu formularza. */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var ts = form.querySelector('[name="ts"]');
  if (ts) ts.value = String(Date.now());
  var en = (form.querySelector('[name="lang"]') || {}).value === 'en';
  var M = en ? {
    name: 'Please enter your full name.', email: 'Please enter a valid email address.',
    message: 'Please write a few words about your matter.', consent: 'Please tick the consent box so we can reply.',
    invalid: 'Please correct the highlighted fields.', fail: 'We could not send your message. Please try again or email us directly.'
  } : {
    name: 'Podaj imię i nazwisko.', email: 'Podaj poprawny adres e-mail.',
    message: 'Napisz kilka słów o sprawie.', consent: 'Zaznacz zgodę, abyśmy mogli odpowiedzieć.',
    invalid: 'Popraw zaznaczone pola.', fail: 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz do nas bezpośrednio.'
  };
  var body = form.querySelector('.form__body');
  var done = form.querySelector('.form__done');
  var status = form.querySelector('.form__status');
  var btn = form.querySelector('[type="submit"]');
  var btnLabel = btn.textContent;
  var touched = false;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function wrap(name) {
    var el = form.elements[name];
    return name === 'consent' ? el.closest('.consent') : el.closest('.field');
  }
  function setError(name, msg) {
    var el = form.elements[name], w = wrap(name);
    var id = 'err-' + name;
    var box = document.getElementById(id);
    w.classList.toggle('is-invalid', !!msg);
    if (msg) {
      if (!box) {
        box = document.createElement('p');
        box.id = id;
        box.className = 'field__error' + (name === 'consent' ? ' consent__error' : '');
        if (name === 'consent') w.parentNode.insertBefore(box, w.nextSibling); else w.appendChild(box);
      }
      box.textContent = msg;
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', id);
    } else {
      if (box) box.remove();
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    }
  }
  function check() {
    var e = {};
    var v = function (n) { return form.elements[n].value.trim(); };
    if (v('name').length < 2) e.name = M.name;
    if (!EMAIL.test(v('email'))) e.email = M.email;
    if (v('message').length < 5) e.message = M.message;
    if (!form.elements.consent.checked) e.consent = M.consent;
    ['name', 'email', 'message', 'consent'].forEach(function (n) { setError(n, e[n]); });
    return e;
  }
  function setStatus(msg, isError) {
    status.textContent = msg || '';
    status.classList.toggle('is-error', !!isError);
  }

  form.addEventListener('input', function () { if (touched) check(); });
  form.addEventListener('change', function () { if (touched) check(); });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    touched = true;
    setStatus('');
    var errs = check();
    var first = Object.keys(errs)[0];
    if (first) { setStatus(M.invalid, true); form.elements[first].focus(); return; }

    form.classList.add('is-sending');
    btn.disabled = true;
    btn.textContent = btn.getAttribute('data-sending') || btnLabel;

    fetch(form.getAttribute('action'), {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'fetch' }
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false }; });
    }).then(function (res) {
      if (res && res.ok) {
        body.hidden = true;
        done.hidden = false;
        done.focus();
        return;
      }
      var fe = (res && res.errors) || {};
      Object.keys(fe).forEach(function (n) { if (form.elements[n]) setError(n, fe[n]); });
      setStatus((res && res.message) || M.fail, true);
    }).catch(function () {
      setStatus(M.fail, true);
    }).then(function () {
      form.classList.remove('is-sending');
      btn.disabled = false;
      btn.textContent = btnLabel;
    });
  });

  /* Powrót po wysyłce bez JS (send.php przekierowuje z ?form=ok|error). */
  var q = /[?&]form=(ok|error)/.exec(location.search);
  if (q) {
    if (q[1] === 'ok') { body.hidden = true; done.hidden = false; }
    else setStatus(M.fail, true);
  }
})();

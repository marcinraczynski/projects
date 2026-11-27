/* Filtr kategorii realizacji. Kategoria karty = etykieta na zdjęciu (span w .cut-s).
   Adres realizacje.html#magazynowe otwiera listę z włączonym filtrem. */
(function () {
  var chips = [].slice.call(document.querySelectorAll('.chip'));
  var cards = [].slice.call(document.querySelectorAll('.rcard'));
  if (!chips.length || !cards.length) return;
  function norm(t) { return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').trim(); }
  function catOf(card) { var s = card.querySelector('.cut-s span'); return s ? norm(s.textContent) : ''; }
  function label(chip) { return norm(chip.firstChild.textContent); }
  function pick(name) {
    chips.forEach(function (c) { var on = label(c) === name; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    cards.forEach(function (card) { card.style.display = (name === 'wszystkie' || catOf(card) === name) ? '' : 'none'; });
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var n = label(c); pick(n);
      history.replaceState(null, '', n === 'wszystkie' ? location.pathname : '#' + n);
    });
  });
  var h = norm(decodeURIComponent(location.hash.slice(1)));
  if (h && chips.some(function (c) { return label(c) === h; })) {
    pick(h);
    var g = chips[0].closest('section'); if (g) g.scrollIntoView();
  }
  cards.forEach(function (card) { card.addEventListener('click', function (e) { e.preventDefault(); }); card.style.cursor = 'default'; });
})();

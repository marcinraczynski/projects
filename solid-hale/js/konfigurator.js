/* Start konfiguratora w podglądzie. Adresy:
   konfigurator.html#magazyn | #warsztat | #produkcja | #rolnicza | #wynajem  - wybrane przeznaczenie
   konfigurator.html#wariant-1 | #wariant-2 | #wariant-3                     - gotowy wariant
   Wysyłka formularza jest tu tylko symulowana (backend w fazie WordPress). */
(function () {
  var root = document.getElementById('kf-root'), tpl = document.getElementById('kf-tpl');
  if (!root || !tpl || !window.dcMount) return;
  window.kf = window.dcMount(Component, tpl, root, function (c) {
    var h = decodeURIComponent(location.hash.slice(1));
    var w = h.match(/^wariant-([123])$/);
    if (w) Object.assign(c.state, PRESETS[+w[1] - 1].s, { step: 2 });
    else if (USES.some(function (u) { return u.id === h; })) { c.applyUse(h); c.state.step = 1; }
  });
})();

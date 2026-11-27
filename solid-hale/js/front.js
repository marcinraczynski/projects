/* Wspólny skrypt podglądu: zamknięcie menu mobilnego klawiszem Esc. */
document.addEventListener('keydown', function (e) {
  var c = document.getElementById('mnav');
  if (e.key === 'Escape' && c && c.checked) c.checked = false;
});

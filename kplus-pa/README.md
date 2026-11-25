# K+ Group | Public Affairs – landing

Statyczna strona (HTML, CSS, JS) + `send.php` dla formularza. Wersja PL: `index.html`, EN: `en/index.html` (krok 6).

Podgląd: https://marcinraczynski.github.io/projects/kplus-pa/ (noindex).
Produkcja: `kplus.agency/public-affairs/` – wgrać zawartość folderu przez FTP do `/public-affairs/` i **usunąć** `<meta name="robots" content="noindex, nofollow">`.

## Twarde spacje
Po każdej zmianie tekstów: `python3 tools/sieroty.py index.html` (idempotentne).

## Stan
- [x] 1. Szkielet PL, tokeny, wszystkie sekcje, desktop
- [x] 2. Mobile  - [ ] 3. GSAP, panel bio  - [ ] 4. Hero z bryłami  - [ ] 5. PHP  - [ ] 6. EN  - [ ] 7. Akceptacja i FTP

## Assety tymczasowe
- `tomasz-alberski.webp`: zdjęcie z sesji (1.1), bo w Figmie jest tylko 590 px. Podmienić na oryginał.
- `capchem.webp`, `slonie-na-balkonie.webp`, logotypy Effie i Złote Spinacze: eksport 1x z Figmy. Potrzebne oryginały / wektory.
- `bryla-siec.png`: statyczny kadr, zastąpi go animacja w kroku 4.

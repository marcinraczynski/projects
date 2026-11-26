# K+ Group | Public Affairs – landing

Statyczna strona (HTML, CSS, JS) + `send.php` dla formularza. Wersja PL: `index.html`, EN: `en/index.html` (krok 6).

Podgląd: https://marcinraczynski.github.io/projects/kplus-pa/ (noindex).
Produkcja: `kplus.agency/public-affairs/` – wgrać zawartość folderu przez FTP do `/public-affairs/` i **usunąć** `<meta name="robots" content="noindex, nofollow">`.

## Twarde spacje
Po każdej zmianie tekstów: `python3 tools/sieroty.py index.html` (idempotentne).

## Stan
- [x] 1. Szkielet PL, tokeny, wszystkie sekcje, desktop
- [x] 2. Mobile  - [x] 3. GSAP, panel bio  - [x] 4. Hero z bryłami  - [x] 5. PHP  - [x] 6. EN  - [ ] 7. Akceptacja i FTP

## Assety tymczasowe
- `tomasz-alberski.webp`: zdjęcie z sesji (1.1), bo w Figmie jest tylko 590 px. Podmienić na oryginał.
- `capchem.webp`, `slonie-na-balkonie.webp`, logotypy Effie i Złote Spinacze: eksport 1x z Figmy. Potrzebne oryginały / wektory.
- `bryla-siec.png`: statyczny kadr, zastąpi go animacja w kroku 4.

## Animacje (krok 3)
- GSAP 3.12.5 + ScrollTrigger jako pliki lokalne w `assets/vendor/gsap/` (bez CDN), logika w `assets/js/scroll.js`.
- Desktop (od 1024 px): przypięte „Kiedy warto” i „Jak pracujemy”, karty projektów nakładają się (sticky, tylko gdy okno ma min. 760 px wysokości).
- Mobile: bez przypinania i nakładania, stany zmieniają się przy zwykłym przewijaniu.
- `prefers-reduced-motion: reduce`: brak animacji, widoczny statyczny stan z HTML.
- Panel bio zespołu: `assets/js/main.js` (focus trap, Esc, klik w tło, powrót fokusu na kartę).

## Hero (krok 4)
- Bryła w WebGL: three.js r128 lokalnie w `assets/vendor/three/` (licencja MIT w `LICENSE.txt`), logika w `assets/js/hero.js` (na bazie `kplus-hero/`, kolory przestawione na granat).
- Pętla: plus → sieć → plus → kula → plus → fala. Paski tematów pokazują postęp, klik (albo strzałki na klawiaturze) przełącza bryłę.
- Animacja pauzuje, gdy hero jest poza ekranem lub karta jest w tle.
- Bez WebGL zostaje statyczny `bryla-siec.png`; przy `prefers-reduced-motion` bryła stoi i nie przełącza się sama (klik nadal działa).

## Formularz (krok 5)
- `send.php` wysyła zapytanie przez SMTP (PHPMailer 6.12 w `lib/PHPMailer/`, licencja LGPL w `LICENSE.txt`) i odpowiada w JSON. Bez JS wraca na stronę z `?form=ok|error#kontakt`.
- Konfiguracja: skopiuj `config.example.php` jako `config.php` obok `send.php` i wpisz dane SMTP oraz adres odbiorcy. `config.php` jest w `.gitignore`, a `.htaccess` blokuje dostęp do niego i do `lib/`.
- Antyspam: honeypot `website` (bot dostaje udawany sukces), minimalny czas wypełnienia (pole `ts` z JS, domyślnie 3 s), limit 5 wysyłek z IP na godzinę (plik w katalogu tymczasowym PHP).
- Walidacja w przeglądarce i na serwerze; błędy przy polach, komunikat sukcesu w miejscu formularza.
- `dry_run => true` w `config.php` zapisuje maila do pliku zamiast wysyłać (do testów na serwerze).
- Na GitHub Pages PHP nie działa, więc formularz pokazuje tam komunikat błędu. Działa dopiero na serwerze K+.
- Wymagania: PHP 7.4+ z `mbstring` i `openssl`.

## Wersja EN (krok 6)
- `en/index.html` (ścieżki do zasobów przez `../`), formularz wysyła do `../send.php` z `lang=en`, komunikaty serwera po angielsku.
- Kotwice EN: `#services`, `#how-we-work`, `#experience`, `#team`, `#contact`.
- Skrypty rozpoznają język po `<html lang>` (menu, „Stage”, separator tysięcy w licznikach).
- Tłumaczenie przygotował Claude; nazwy usług i etapów bez zmian. Do akceptacji przez K+.

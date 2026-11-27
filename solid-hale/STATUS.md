# Solid Hale: status prac

Gałąź robocza: `solid-hale/front-klikalny`. Plan całości: `PLAN.md`.

## Zrobione

- [x] Etap 1.1: plan i status w repo.
- [x] Etap 1.2: 14 stron z paczki + zdjęcia, noindex na każdej. Źródła (spec konfiguratora, logika, założenia WP) w `_zrodla/`.
- [x] Etap 1.3: wspólny pasek górny i nagłówek z menu mobilnym na wszystkich stronach (`css/front.css`), bieżąca strona podświetlona w menu.
- [x] Etap 1.4: linki „#” podpięte (menu, stopka, CTA, rodzaje hal, karty realizacji, mapa Google). Celowo zostają „#”: Blog, Polityka prywatności, Polityka cookies, Facebook, Instagram (brak adresów, do uzupełnienia).
- [x] Etap 1.5: filtr kategorii na stronie Realizacje (`js/realizacje.js`), adres `realizacje.html#magazynowe` otwiera z filtrem; podstrony rodzajów linkują z filtrem.
- [x] Etap 1.6: konfigurator działa (`konfigurator.html`): logika 1:1 z projektu (`js/konfigurator-logika.js`), silnik szablonu `js/dc-lite.js`, start `js/konfigurator.js`. Wysyłka tylko symulowana. Adresy: `#wariant-1..3`, `#magazyn`, `#warsztat`, `#produkcja`, `#rolnicza`, `#wynajem` (linkowane ze strony głównej i podstron rodzajów).
- [x] Etap 1.7: przegląd 390 / 820 / 1440 px: brak poziomego przewijania i błędów JS na wszystkich 14 stronach.

## Następny krok

- [ ] Etap 1.8: PR do pokazania klientowi (otwarty, czeka na akceptację Marcina i klienta; merge = publikacja na GitHub Pages).

## Drobne poprawki na później

- Konfigurator na telefonie: spec mówi, że rysunek i szacunek mają być nad krokiem; teraz są pod nim.
- Adresy Facebook / Instagram, strona Blog i polityki: brak, linki zostają „#”.
- Strona główna: sekcja konfiguratora prowadzi do `konfigurator.html` (nie jest interaktywna na miejscu).

## Jak wznowić

1. `git checkout solid-hale/front-klikalny`
2. Przeczytaj ten plik i `PLAN.md`, zrób pierwszy niezaznaczony punkt.
3. Paczka źródłowa (designy, spec konfiguratora) jest w uploadach projektu jako `solid-hale-wp-2026-11-27.zip`.

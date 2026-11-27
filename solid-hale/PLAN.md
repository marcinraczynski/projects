# Solid Hale: plan wdrożenia

Plan całej realizacji nowej strony solidhale.pl. Bieżący stan prac jest w `STATUS.md`.
Źródło: paczka `solid-hale-wp-2026-11-27.zip` (projekt z Claude Design, specyfikacja konfiguratora, notatka projektowa).

## Zasady pracy

- Praca w małych, zamkniętych etapach. Każdy etap to osobny commit na gałęzi roboczej, po którym strona działa.
- Po każdym commicie aktualizujemy `STATUS.md` (co zrobione, co następne), żeby przerwanie w dowolnym momencie niczego nie psuło.
- `main` publikuje GitHub Pages, więc do `main` trafia tylko to, co Marcin zaakceptuje (merge PR).
- Każda strona podglądu ma `noindex, nofollow`.

## Faza 1: klikalny front statyczny (do akceptacji klienta)

Folder `solid-hale/`, czysty HTML/CSS/JS, bez builda.

1. Plan i status w repo.
2. Wszystkie 14 stron z projektu + zdjęcia, noindex na każdej.
3. Wspólny nagłówek z menu mobilnym (jak na stronie głównej) na wszystkich podstronach, oznaczenie bieżącej strony w menu.
4. Podpięcie linków „#” (menu, stopka, CTA „Wyceń halę”, karty rodzajów hal, karty realizacji).
5. Realizacje: działający filtr kategorii.
6. Konfigurator: działający, 6 kroków, dwie ścieżki, wycena i rysunek wg `docs/konfigurator-spec.md`. Wysyłka formularza w podglądzie tylko symulowana (bez backendu).
7. Przegląd na 390 / 820 / 1440 px, poprawki mobilne podstron.
8. PR z podglądem do pokazania klientowi.

## Faza 2: WordPress (po akceptacji frontu)

1. Ustalenia z Marcinem: hosting, staging, wtyczki (domyślnie własny lekki motyw bez page buildera).
2. SEO przed budową: crawl obecnej solidhale.pl, mapa stary adres → nowy, przekierowania 301.
3. Motyw: zmienne CSS, fonty Barlow lokalnie (RODO), nagłówek, stopka, sekcja kontaktu, wzorce bloków.
4. Strony w kolejności: główna, oferta, hale stalowe + 7 rodzajów (jeden szablon), realizacje, o nas, kontakt, polityka prywatności.
5. CPT: realizacje (kategoria rodzaj hali, pola, galeria), opinie. Import realizacji ze zdjęciami.
6. Filtr twardych spacji (sieroty) na treściach, tytułach i polach.

## Faza 3: animacje i dopracowanie

- Hero ze sliderem i rysunkiem konstrukcji (CSS, bez bibliotek), `prefers-reduced-motion`.
- Animacje wejścia sekcji (lekkie, IntersectionObserver), bez wpływu na wydajność.

## Faza 4: formularze i zabezpieczenia

- Konfigurator jako moduł/wtyczka: stawki w panelu admina, wysyłka przez REST + `wp_mail`, nonce, honeypot, limit wysyłek.
- Formularz kontaktowy (strona Kontakt i sekcja na dole stron), ta sama mechanika.
- Zabezpieczenia WP: aktualizacje, ograniczenie logowania, 2FA dla admina, nagłówki bezpieczeństwa, wyłączenie XML-RPC, kopie zapasowe.

## Faza 5: SEO techniczne, wydajność, analityka (na końcu)

- Meta tytuły i opisy, jedno H1, dane strukturalne (LocalBusiness, BreadcrumbList, FAQPage), sitemap, robots, canonical.
- Obrazy WebP, srcset, lazy loading poza hero.
- Analityka (GA4 / GTM) z banerem zgód (Consent Mode v2), zdarzenia: wysłanie konfiguratora, formularza, kliknięcia tel/mail.
- Zdjęcie noindex na produkcji, przekierowania, test po migracji.

## Do weryfikacji z klientem

Z `docs/wiedza-projekt.md`: liczby (10+ lat, 250+ hal, 150 tys. m²), lokalizacja i powierzchnia Fimm Logistick, parametry w tabelach, stawki konfiguratora, oferta pracy.

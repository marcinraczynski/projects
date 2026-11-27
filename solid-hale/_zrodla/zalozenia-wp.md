# Solid Hale: wdrożenie nowej strony na WordPressie

Ten folder to punkt startowy do zbudowania nowej strony solidhale.pl w WordPressie. Projekt graficzny wszystkich stron jest gotowy (Claude Design). Zadanie: przenieść go na WordPress jeden do jednego, z działającym konfiguratorem, wersją mobilną i bez utraty pozycji w Google, które ma obecna strona.

Pracujesz z Marcinem (Detal Studio), grafikiem i web developerem, który zaprojektował stronę i wdraża ją dla klienta. Pisz do niego po polsku, krótko i konkretnie.

## Co jest w paczce

```
CLAUDE.md                         ten plik
docs/wiedza-projekt.md            historia projektu, dane firmy, treści do weryfikacji
docs/konfigurator-spec.md         zatwierdzona specyfikacja konfiguratora (kroki, pola, stawki, teksty)
projekt/*.html                    statyczny eksport 14 stron z projektu (wzorzec wizualny, desktop 1440 px)
projekt/img/                      zdjęcia i logo użyte w projekcie
projekt/zrodla-canvas/            pliki źródłowe z Claude Design (.dc.html) + canvas.json
konfigurator/logika-konfiguratora-dclogic.js   logika konfiguratora z projektu (stan, kroki, wycena)
materialy/logo/                   oryginalne pliki logo od klienta
```

Strony w `projekt/`: index (strona główna), oferta, hale-stalowe (zbiorcza), hale-magazynowe, hale-produkcyjne, hale-uslugowe, hale-komercyjne, hale-rolnicze, chlodnie-i-mroznie, wiaty-i-zadaszenia, realizacje, konfigurator, o-nas, kontakt.

Otwieraj je w przeglądarce, żeby zobaczyć projekt. To wzorzec, nie kod produkcyjny: style są w dużej mierze inline, bo tak działa narzędzie projektowe. W motywie przepisz je na porządny CSS z klasami i zmiennymi.

Uwagi do eksportu:
- **Wersja mobilna** jest dopracowana tylko na stronie głównej (`index.html`): menu hamburger, marginesy, układ sekcji (reguły `@media` w `<style>`). Ten sam nagłówek i te same zasady zastosuj na wszystkich podstronach. Pozostałe podstrony sprawdź i dopracuj na 390 px i 820 px.
- **Realizacje i konfigurator** są w eksporcie pokazane w stanie początkowym (filtry i kroki nie klikają się). Logika filtrów jest w `projekt/zrodla-canvas/Realizacje.dc.html`, logika konfiguratora w `konfigurator/` i w specyfikacji.
- Linki, które w projekcie prowadzą do „#” (np. „Wyceń halę”, karty realizacji, blog, polityka prywatności), trzeba podpiąć pod właściwe strony.

## Założenia techniczne (WordPress)

Na starcie potwierdź z Marcinem podejście. Domyślna propozycja:

- **Własny, lekki motyw** (blokowy lub hybrydowy), bez page buildera i bez ciężkich motywów kupnych. Sekcje projektu jako wzorce bloków (block patterns) lub własne bloki, żeby klient mógł edytować teksty i zdjęcia bez dotykania kodu.
- **Typy treści:**
  - strony: główna, oferta, o nas, kontakt, konfigurator, polityka prywatności;
  - rodzaje hal: 7 podstron pod wspólnym rodzicem „Hale stalowe” (strona zbiorcza), jeden szablon;
  - realizacje: własny typ wpisu (CPT) z kategorią „rodzaj hali”, polami: nazwa, lokalizacja, powierzchnia, rodzaj, obudowa, wyposażenie, galeria; filtr po kategorii na stronie Realizacje; realizacje danego rodzaju wyświetlane na podstronie rodzaju;
  - opinie: prosty CPT lub blok z listą (autor, firma, treść, źródło Google);
  - blog: standardowe wpisy (klient planuje blog i treści przyjazne dla wyszukiwarek i modeli AI).
- **Konfigurator:** osobna wtyczka lub moduł motywu, wstawiany blokiem/shortcode na stronę Konfigurator i jako sekcja na stronie głównej. Vanilla JS, bez bibliotek. Logika, kroki, stawki i teksty dokładnie jak w `docs/konfigurator-spec.md`. Stawki w ustawieniach (panel admina), bo są przykładowe i klient je podmieni. Wysyłka zapytania przez endpoint REST WordPressa i `wp_mail` na adres firmy (bez CRM), z całą konfiguracją i szacunkiem w treści maila. Zabezpieczenie: nonce, honeypot, limit wysyłek. Zestawienie PDF na e-mail klienta planowane później, nie teraz.
- **Formularz kontaktowy** (strona Kontakt i sekcja na dole stron): pola jak w projekcie, wysyłka mailem. Może być ta sama mechanika co w konfiguratorze albo lekka wtyczka formularzy.
- **Fonty:** Barlow Condensed (nagłówki) i Barlow (tekst), hostowane lokalnie w motywie (RODO), nie z Google Fonts.
- **Zdjęcia:** przez bibliotekę mediów, z rozmiarami responsywnymi (srcset), WebP, lazy loading poza hero.
- **Wydajność:** animacja hero (slider z rysunkiem konstrukcji) jest w CSS, bez bibliotek; zachowaj ją. Szanuj `prefers-reduced-motion` (reguła jest w projekcie).

## SEO i przeniesienie strony (ważne)

Obecna strona solidhale.pl ma już pozycje w Google i klient nie może na zmianie stracić.

1. Przed budową zrób listę wszystkich adresów obecnej strony (mapa witryny, crawl) i ich tytułów.
2. Ustal mapowanie stary adres → nowy adres. Gdzie się da, zachowaj te same adresy. Resztę przekieruj 301.
3. Przenieś lub przepisz treści, które dziś dają ruch, zamiast je usuwać.
4. Tytuły, opisy meta, nagłówki H1/H2 ustaw świadomie na każdej stronie. Jedno H1 na stronę.
5. Dane strukturalne: LocalBusiness/Organization (dane firmy niżej), BreadcrumbList, FAQPage na podstronach rodzajów hal (mają sekcję pytań).
6. Mapa witryny XML, robots.txt, poprawne kanoniczne adresy.
7. Wersja testowa (staging) musi mieć noindex. Na produkcji noindex zdjąć.

## Styl wizualny

- Kolory: żółty `#FFDA00` (akcent, przyciski, wyróżnienia), grafit `#1F2124` / `#1A1C1E` / `#17191B` (ciemne sekcje), jasne tło `#F3F3F1`, biel. Ciemny brąz-oliwka `#6B5B00` dla małych nadtytułów na jasnym tle.
- Ciemne sekcje mają siatkę „blueprint” (klasa `.bp` w projekcie).
- Ścięty prawy górny róg przycisków i kart (`.cut`, `.cut-s`, clip-path).
- Nagłówki: Barlow Condensed 800, wersaliki. Tekst: Barlow 400-600.
- Żółte izometryczne rysunki konstrukcji hal jako ilustracje (SVG w projekcie).
- Nagłówek strony: przezroczysty na hero, po przewinięciu ciemne tło z rozmyciem (klasa `.stick.on`, skrypt na dole stron w eksporcie).

## Zasady tekstów (obowiązują wszędzie)

- Jednoliterowe wyrazy i krótkie przyimki (a, i, o, u, w, z, do, na, od, po...) nie mogą zostawać na końcu wiersza. Łącz je twardą spacją z następnym słowem. Liczba nie rozdziela się od jednostki („400 m²”, „530 tys. zł”). Zrób to automatycznie filtrem na treści (`the_content`, tytuły, pola), a nie ręcznie.
- Bez długich myślników (– —). Tylko zwykły „-”.
- Język prosty, bez marketingu i żargonu. Do klienta na „ty”.
- Nie wymyślaj faktów o firmie. Liczby i dane do weryfikacji są wypisane w `docs/wiedza-projekt.md`.

## Dane firmy

Solid Hale Sp. z o.o., producent i generalny wykonawca hal stalowych spod Warszawy, od 2016 r.
Siedziba: ul. Młochowska 88, 05-831 Rozalin. Adres rejestrowy: ul. Szkolna 7, 05-552 Mroków.
NIP 734 354 39 56, REGON 365876867, KRS 0000646211.
Tel. +48 507 444 570, biuro@solidhale.pl, pn.-pt. 8:00-16:00.

## Kolejność pracy (propozycja)

1. Potwierdź z Marcinem podejście (motyw, hosting, wtyczki, czy jest staging).
2. Zbierz adresy obecnej strony i zrób mapę przekierowań.
3. Motyw: zmienne, typografia, nagłówek z menu mobilnym, stopka, sekcja kontaktu.
4. Strona główna, potem pozostałe strony w kolejności: oferta, hale stalowe + rodzaje, realizacje, o nas, kontakt.
5. Konfigurator jako moduł, z ustawieniami stawek i wysyłką maila.
6. CPT realizacji i opinii, import realizacji ze zdjęciami.
7. SEO, dane strukturalne, przekierowania, test mobilny i wydajności.
8. Po każdym etapie pokaż Marcinowi zrzuty desktop i mobile, zanim pójdziesz dalej.

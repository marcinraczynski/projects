# Konfigurator hal Solid Hale - specyfikacja

Zatwierdzona wersja konfiguratora wyceny. Nowa strona ma używać tego konfiguratora, a nie osobnego formularza wyceny. Wygląd jak w projekcie nowej strony (`projekt/konfigurator.html` i sekcja konfiguratora na stronie głównej). Logika z tego pliku i z `konfigurator/logika-konfiguratora-dclogic.js`.

## Założenia, których nie zmieniamy

- Jedno narzędzie z dwiema ścieżkami, wybór w pierwszym kroku.
- Widełki ceny klient widzi w trakcie konfiguracji, bez podawania danych. Kontakt dopiero na końcu, przy wysyłce zestawienia.
- Prawie wszystko klikane (kafelki, suwaki, liczniki). Jedno pole tekstowe, opcjonalne.
- Na wyniku zawsze lista "w cenie" i "poza ceną". To ma odsiewać nierealne zapytania.
- Zapytania idą na e-mail (bez CRM). Mail zawiera całą konfigurację i szacunek. Zestawienie PDF na e-mail klienta planowane później.
- Asystenta AI (chatbot) na razie nie łączymy z konfiguratorem.

## Układ

1. Nagłówek: "Skonfiguruj halę i sprawdź koszt" + "Kilka kliknięć, bez podawania danych. Szacunek widzisz od razu, a szczegółowe zestawienie wyślemy na e-mail."
2. Gotowe warianty (3 karty). Klik wypełnia pola i przenosi do kroku "Wymiary". Każda karta pokazuje "od X zł netto" liczone tym samym wzorem.
   - Magazyn na nawozy: 20 × 20 m, 400 m², hala zimna, 2 bramy 5 × 5 m
   - Warsztat z zapleczem: 20 × 25 m, 500 m², hala ciepła, 2 bramy 4 × 4 m, posadzka przemysłowa, 4 okna, 30 m² zaplecza
   - Magazyn pod wynajem: 30 × 40 m, 1200 m², hala ciepła, 4 bramy 4 × 4 m, posadzka przemysłowa
3. Pasek kroków (klikalne pigułki).
4. Dwie kolumny: lewa karta bieżącego kroku (Wstecz / Dalej, na przedostatnim "Pokaż wynik"), prawa przyklejona: rysunek hali + panel szacunku. Na telefonie jedna kolumna, rysunek i szacunek nad krokiem.

## Ścieżki i kroki

Krok 1 "Czego potrzebujesz?" - 3 kafelki, każdy z linią i podpisem z ikonką "i" na tej samej wysokości:

| Kafelek | Opis | Podpis |
| --- | --- | --- |
| Hala w standardzie | Fundamenty, posadzka, konstrukcja, obudowa, bramy i stolarka | 6 kroków, ok. 2 min · widełki ceny od razu |
| Zaprojektuj i wybuduj | Stan deweloperski z instalacjami i projektem | 4 kroki · kwota orientacyjna i rozmowa |
| Nie wiem | Policzymy halę w standardzie, a doradca podpowie resztę | jak hala w standardzie |

"Nie wiem" idzie ścieżką standardu, ale w zapytaniu zaznaczamy, że klient był niezdecydowany.

Standard: Zakres → Przeznaczenie → Wymiary → Obudowa → Wyposażenie → Lokalizacja → Wynik.
Zaprojektuj i wybuduj: Zakres → Przeznaczenie → Wymiary → Lokalizacja → Wynik.

### Przeznaczenie
6 kafelków. Wybór ustawia domyślne wartości dalszych kroków:

| Kafelek | Opis | Domyślnie |
| --- | --- | --- |
| Magazyn | Składowanie, logistyka | ciepła, wys. 7 m, 2 bramy 4 × 4, posadzka betonowa |
| Warsztat lub serwis | Pierwsza własna hala firmy | ciepła, 6 m, 1 brama 4 × 4, przemysłowa, zaplecze 30 m² |
| Produkcja | Maszyny, linie, suwnice | ciepła, 7 m, 2 bramy 5 × 5, przemysłowa, zaplecze 40 m² |
| Hala rolnicza | Maszyny, nawozy, zboże | zimna, 6 m, 2 bramy 5 × 5, betonowa |
| Pod wynajem | Moduły dla najemców | ciepła, 7 m, 4 bramy 4 × 4, przemysłowa |
| Inne | Opiszesz w uwagach | bez zmian |

### Wymiary
- Wymiary zewnętrzne, wysokość do okapu.
- Szybki wybór: 300 / 500 / 800 / 1000 m² (15 × 20, 20 × 25, 20 × 40, 25 × 40 m).
- Suwak + pole liczbowe: szerokość 8-40 m (co 1), długość 10-120 m (co 1), wysokość w okapie 4-12 m (co 0,5).
- Licznik powierzchni na żywo. Poniżej 200 m²: "Hale poniżej 200 m² wyceniamy indywidualnie", liczymy dalej.
- Dach: dwuspadowy (domyślnie) / jednospadowy.

### Obudowa (tylko standard)
- Ciepła: płyta warstwowa z izolacją, "ok. 880 zł/m²"
- Zimna: blacha trapezowa bez izolacji, "ok. 680 zł/m²"
- Notka: rynny i obróbki blacharskie są w cenie każdej hali.

### Wyposażenie (tylko standard)
- Bramy segmentowe z napędem: 0-12, rozmiar 3 × 3 / 4 × 4 / 5 × 5 m
- Drzwi stalowe: 1-6 (jedne w cenie)
- Okna: 0-20
- Świetliki dachowe: przełącznik
- Posadzka: betonowa (w cenie) / przemysłowa (+90 zł/m²)
- Zaplecze socjalne lub biuro: suwak 0-120 m² co 5

### Lokalizacja
- Kod pocztowy działki (strefa śniegowa i dojazd)
- Etap: Szukam działki / Mam działkę / Mam warunki zabudowy lub plan miejscowy / Mam pozwolenie na budowę
- Start: W ciągu 6 miesięcy / Za 6-12 miesięcy / Później

### Wynik
- Widełki netto, m², zł/m², dopisek: szacunek czy kwota orientacyjna.
- Bez kodu pocztowego: komunikat, że strefa i dojazd nie są uwzględnione.
- Standard, w cenie: fundamenty i posadzka; konstrukcja stalowa z projektem wykonawczym; obudowa, rynny i obróbki; bramy, drzwi, okna; świetliki i zaplecze, jeśli wybrane; transport i montaż. Poza ceną: projekt budowlany i formalności; przyłącza i instalacje wewnętrzne; drogi, plac, ogrodzenie; VAT.
- Zaprojektuj i wybuduj, w cenie: projekt budowlany i pozwolenie; hala z obudową, bramami i stolarką; instalacje elektryczna, wod-kan, ogrzewanie; stan deweloperski części socjalnej; nadzór i odbiory. Poza ceną: przyłącza do granicy działki; drogi, plac, ogrodzenie; wyposażenie technologiczne; VAT.
- Formularz: imię i nazwisko (wymagane), firma, telefon, e-mail (wymagany telefon LUB e-mail), uwagi ("np. potrzebna suwnica, hala przy granicy działki"), zgoda RODO (wymagana). Przycisk "Wyślij zestawienie" / "Umów rozmowę".
- Po wysłaniu: "Wysłano. Zestawienie trafi na podany adres. Doradca skontaktuje się, żeby potwierdzić szczegóły."

## Panel szacunku
- Przed krokiem "Wymiary": "Pojawi się po podaniu wymiarów."
- Potem: widełki, zł/m², m² i krótka specyfikacja (wymiary, obudowa, bramy, posadzka, zaplecze, lokalizacja). Aktualizuje się przy każdej zmianie.

## Wycena (stawki przykładowe, do podmiany na stawki Solid Hale, trzymać w ustawieniach)

Standard:
```
baza       = 880 zł/m² (ciepła) lub 680 zł/m² (zimna)
metraż     = <300 m²: ×1,15 | 300-499: ×1,06 | 500-999: ×1,00 | 1000-1999: ×0,94 | ≥2000: ×0,90
wysokość   = 6 m w cenie; każdy metr wyżej +4%, każdy metr niżej -2%
koszt      = m² × baza × metraż × wysokość
           + posadzka przemysłowa 90 zł/m²
           + bramy: 3×3 9 000 zł | 4×4 13 500 zł | 5×5 19 000 zł (za sztukę)
           + drzwi: (liczba - 1) × 3 500 zł
           + okna: 2 500 zł/szt.
           + świetliki: 35 zł/m²
           + zaplecze: 2 800 zł/m²
koszt      × (1 + dopłata lokalizacji)
widełki    = koszt × 0,92 do koszt × 1,12
```
Zaprojektuj i wybuduj: m² × 2 500 do m² × 3 200 zł, × (1 + dopłata lokalizacji).

Dopłata lokalizacji wg pierwszej cyfry kodu pocztowego (baza Rozalin): 0 → 0%, 1 → 5%, 2 → 2%, 3 → 5%, 4 → 4%, 5 → 5%, 6 → 4%, 7 → 5%, 8 → 4%, 9 → 2%. Bez kodu: 0%.

Zapis kwot: poniżej miliona zaokrąglone do 10 tys. ("530 - 650 tys. zł"); od miliona w milionach, do 50 tys. ("1,1 - 1,35 mln zł"; na granicy "920 tys. - 1,1 mln zł").

Kontrola: hala ciepła 600 m² z 2 bramami wychodzi ok. 530-650 tys. zł.

## Rysunek hali
- Widok techniczny: obok siebie szczyt i ściana boczna (przy wąskich i długich halach jeden pod drugim), w tej samej skali. Bez rzutu izometrycznego.
- Przy szczycie sylwetka człowieka 1,8 m jako skala.
- Wymiary żółtymi liniami wymiarowymi.
- Hala ciepła: poziome linie paneli; zimna: pionowe linie blachy.
- Bramy najpierw na szczycie, reszta na ścianie bocznej; drzwi przy lewym końcu ściany bocznej; okna równo rozłożone; świetliki na pasie dachu.
- Pod rysunkiem: przeznaczenie · typ hali i powierzchnia.

Pierwotny działający prototyp (jeden plik HTML, ciemny motyw, inne fonty) jest w projekcie Claude „Solid Hale” jako `claude/konfigurator-solid-hale.html`. Kolorystyki z niego nie bierz, tylko zachowanie.

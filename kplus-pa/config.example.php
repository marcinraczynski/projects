<?php
/*
 * K+ Group | Public Affairs – konfiguracja formularza.
 * Skopiuj ten plik jako config.php (w tym samym folderze co send.php) i uzupełnij dane.
 * config.php nie trafia do repozytorium (.gitignore), a .htaccess blokuje do niego dostęp z przeglądarki.
 */
return [
    // Serwer SMTP
    'smtp_host'   => 'smtp.example.com',
    'smtp_port'   => 587,
    'smtp_secure' => 'tls',          // 'tls' (STARTTLS, port 587) albo 'ssl' (port 465)
    'smtp_user'   => 'formularz@example.com',
    'smtp_pass'   => '',

    // Nadawca wiadomości (zwykle ta sama skrzynka co smtp_user)
    'from_email'  => 'formularz@example.com',
    'from_name'   => 'K+ Group | Public Affairs',

    // Adres, na który trafiają zapytania z formularza
    'to_email'    => 'aknowska@kplus.agency',
    'to_name'     => 'Anna Knowska',

    // Ochrona przed spamem
    'min_seconds' => 3,              // minimalny czas wypełniania formularza
    'max_per_hour'=> 5,              // limit wysyłek z jednego IP na godzinę

    // Tryb testowy: true = nie wysyła maila, tylko zapisuje go do pliku w katalogu tymczasowym
    'dry_run'     => false,
];

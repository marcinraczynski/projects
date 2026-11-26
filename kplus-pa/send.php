<?php
/*
 * K+ Group | Public Affairs – obsługa formularza kontaktowego.
 * Wysyłka przez SMTP (PHPMailer), odpowiedź w JSON. Bez JS (zwykły POST) wraca na stronę z ?form=ok|error#kontakt.
 * Ochrona: honeypot "website", minimalny czas wypełnienia (pole "ts"), limit prób z IP, walidacja po stronie serwera.
 */
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

$lang = (($_POST['lang'] ?? '') === 'en') ? 'en' : 'pl';
$T = [
    'pl' => [
        'method'   => 'Nieprawidłowe żądanie.',
        'config'   => 'Formularz jest chwilowo niedostępny. Napisz do nas bezpośrednio.',
        'invalid'  => 'Popraw zaznaczone pola.',
        'name'     => 'Podaj imię i nazwisko.',
        'email'    => 'Podaj poprawny adres e-mail.',
        'message'  => 'Napisz kilka słów o sprawie.',
        'consent'  => 'Zaznacz zgodę, abyśmy mogli odpowiedzieć.',
        'toolong'  => 'Tekst jest za długi.',
        'rate'     => 'Wysłano zbyt wiele wiadomości. Spróbuj ponownie za godzinę.',
        'fast'     => 'Formularz wysłano zbyt szybko. Spróbuj ponownie.',
        'fail'     => 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz do nas bezpośrednio.',
        'ok'       => 'Dziękujemy. Wiadomość dotarła, odezwiemy się wkrótce.',
        'subject'  => 'Zapytanie ze strony Public Affairs',
    ],
    'en' => [
        'method'   => 'Invalid request.',
        'config'   => 'The form is temporarily unavailable. Please email us directly.',
        'invalid'  => 'Please correct the highlighted fields.',
        'name'     => 'Please enter your full name.',
        'email'    => 'Please enter a valid email address.',
        'message'  => 'Please write a few words about your matter.',
        'consent'  => 'Please tick the consent box so we can reply.',
        'toolong'  => 'The text is too long.',
        'rate'     => 'Too many messages sent. Please try again in an hour.',
        'fast'     => 'The form was sent too quickly. Please try again.',
        'fail'     => 'We could not send your message. Please try again or email us directly.',
        'ok'       => 'Thank you. Your message has arrived and we will be in touch soon.',
        'subject'  => 'Public Affairs website enquiry',
    ],
][$lang];

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false
    || ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'fetch';

function respond(bool $ok, string $message, array $errors = [], int $code = 200): void
{
    global $wantsJson;
    if (!$wantsJson) {
        $back = './' . ($GLOBALS['lang'] === 'en' ? 'en/' : '') . '?form=' . ($ok ? 'ok' : 'error') . '#kontakt';
        header('Location: ' . $back, true, 303);
        exit;
    }
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode(['ok' => $ok, 'message' => $message, 'errors' => (object) $errors], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, $T['method'], [], 405);
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    error_log('[kplus-pa] brak config.php');
    respond(false, $T['config'], [], 500);
}
$cfg = require $configFile;

/* ---------- pola ---------- */
$clean = static function (string $key, int $max) {
    $v = (string) ($_POST[$key] ?? '');
    $v = str_replace("\0", '', $v);
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    $v = trim($v);
    return [$v, mb_strlen($v) > $max];
};
[$name, $nameLong]   = $clean('name', 120);
[$org, $orgLong]     = $clean('organization', 160);
[$email, $emailLong] = $clean('email', 190);
[$phone, $phoneLong] = $clean('phone', 40);
[$msg, $msgLong]     = $clean('message', 5000);
$consent = ($_POST['consent'] ?? '') === '1';

/* Pola jednowierszowe: bez znaków nowej linii (ochrona nagłówków maila). */
$name = preg_replace('/[\r\n]+/', ' ', $name) ?? '';
$org  = preg_replace('/[\r\n]+/', ' ', $org) ?? '';
$phone = preg_replace('/[^0-9+()\-\s.]/', '', $phone) ?? '';

/* ---------- antyspam ---------- */
// Honeypot: boty wypełniają ukryte pole. Udajemy sukces, żeby nie dawać wskazówek.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(true, $T['ok']);
}

// Czas wypełniania (ts ustawia JS przy załadowaniu strony, w milisekundach).
$ts = (int) ($_POST['ts'] ?? 0);
$elapsed = $ts > 0 ? (microtime(true) * 1000 - $ts) / 1000 : -1;
if ($elapsed < (int) ($cfg['min_seconds'] ?? 3) || $elapsed > 60 * 60 * 24 * 2) {
    respond(false, $T['fast'], [], 429);
}

// Limit prób z IP (plik w katalogu tymczasowym, klucz to skrót IP).
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rateFile = rtrim(sys_get_temp_dir(), '/\\') . '/kplus-pa-rate-' . hash('sha256', $ip . __DIR__) . '.json';
$now = time();
$hits = [];
if (is_file($rateFile)) {
    $hits = json_decode((string) @file_get_contents($rateFile), true) ?: [];
    $hits = array_values(array_filter($hits, static fn($t) => is_int($t) && $t > $now - 3600));
}
if (count($hits) >= (int) ($cfg['max_per_hour'] ?? 5)) {
    respond(false, $T['rate'], [], 429);
}

/* ---------- walidacja ---------- */
$errors = [];
if ($name === '' || mb_strlen($name) < 2) $errors['name'] = $T['name'];
elseif ($nameLong) $errors['name'] = $T['toolong'];
if ($orgLong) $errors['organization'] = $T['toolong'];
if ($email === '' || $emailLong || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = $T['email'];
if ($phoneLong) $errors['phone'] = $T['toolong'];
if ($msg === '' || mb_strlen($msg) < 5) $errors['message'] = $T['message'];
elseif ($msgLong) $errors['message'] = $T['toolong'];
if (!$consent) $errors['consent'] = $T['consent'];
if ($errors) {
    respond(false, $T['invalid'], $errors, 422);
}

/* Zapisz próbę przed wysyłką (liczą się też nieudane wysyłki). */
$hits[] = $now;
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);

/* ---------- wiadomość ---------- */
$body = implode("\n", [
    'Nowe zapytanie z formularza K+ Group | Public Affairs (' . strtoupper($lang) . ')',
    '',
    'Imię i nazwisko: ' . $name,
    'Organizacja: ' . ($org !== '' ? $org : '-'),
    'E-mail: ' . $email,
    'Telefon: ' . ($phone !== '' ? $phone : '-'),
    '',
    'Wiadomość:',
    $msg,
    '',
    '---',
    'Zgoda na przetwarzanie danych: tak',
    'Wysłano: ' . date('Y-m-d H:i:s'),
]);
$subject = $T['subject'] . ': ' . mb_substr($name, 0, 80);

if (!empty($cfg['dry_run'])) {
    @file_put_contents(rtrim(sys_get_temp_dir(), '/\\') . '/kplus-pa-last-mail.txt', "Subject: $subject\nReply-To: $email\n\n$body");
    respond(true, $T['ok']);
}

$mail = new PHPMailer(true);
try {
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->isSMTP();
    $mail->Host = (string) $cfg['smtp_host'];
    $mail->Port = (int) $cfg['smtp_port'];
    $mail->SMTPAuth = ($cfg['smtp_user'] ?? '') !== '';
    $mail->Username = (string) ($cfg['smtp_user'] ?? '');
    $mail->Password = (string) ($cfg['smtp_pass'] ?? '');
    $secure = (string) ($cfg['smtp_secure'] ?? 'tls');
    $mail->SMTPSecure = $secure === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : ($secure === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : '');
    $mail->Timeout = 15;

    $mail->setFrom((string) $cfg['from_email'], (string) ($cfg['from_name'] ?? ''));
    $mail->addAddress((string) $cfg['to_email'], (string) ($cfg['to_name'] ?? ''));
    $mail->addReplyTo($email, $name);
    $mail->Subject = $subject;
    $mail->Body = $body;
    $mail->isHTML(false);
    $mail->send();
} catch (MailException $e) {
    error_log('[kplus-pa] błąd wysyłki: ' . $mail->ErrorInfo);
    respond(false, $T['fail'], [], 502);
}

respond(true, $T['ok']);

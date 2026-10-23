# Security Policy / Политика безопасности

## Supported versions

Only the latest release (the current `main` branch) receives security fixes.

Поддерживается только последняя версия (текущая ветка `main`).

## Reporting a vulnerability

Please report vulnerabilities **privately** through GitHub Security Advisories: open the repository's **Security** tab, choose **Report a vulnerability**, and describe the problem (affected version, steps to reproduce, impact). Do not open public issues or pull requests for security problems, and do not post exploit details publicly before a fix is released.

Не создавайте публичные issue и pull request об уязвимостях. Отправьте приватный отчёт через GitHub Security Advisories: вкладка **Security** репозитория → **Report a vulnerability**. Укажите версию, шаги воспроизведения и последствия. Не публикуйте подробности до выхода исправления.

Never include real passwords, vault contents or private keys in a report. / Не присылайте реальные пароли, содержимое хранилища и ключи.

## What to expect

This is a volunteer-maintained project without a service-level agreement. We aim to:

- acknowledge your report within about 7 days;
- give an assessment and a rough plan within about 30 days;
- credit you in the release notes if you wish, once a fix is published.

Проект поддерживается на добровольных началах, гарантированных сроков нет. Стараемся ответить в течение примерно 7 дней, дать оценку и план в течение примерно 30 дней, а после выхода исправления указать вас в заметках к релизу, если вы этого хотите.

## Scope and known limits

No independent security audit has been performed; see [AUDIT.md](AUDIT.md) for the self-review and the threat model in [README.md](README.md). Issues in third-party dependencies should also be reported upstream.

Known limits that are documented and not treated as vulnerabilities (details in README):

- sign-in for a username is locked for up to 15 minutes after 10 failed attempts, from any IP;
- family items can be edited and deleted by every family member;
- escrow for the administrator is a checkbox at registration, on by default;
- the encrypted offline copy stays in the browser after sign-out; clear site data on shared devices;
- per-IP limits rely on the reverse proxy appending `X-Forwarded-For`; the header is trusted only from `TRUSTED_PROXIES`, and the container port must not be published to the network;
- until the first account exists, anyone who can open the address can become the administrator unless `SETUP_TOKEN` is set;
- the browser extension asks for confirmation before filling a site that does not match the item's address, but it cannot tell a look-alike domain you saved yourself from the real one.

Известные ограничения, описанные в README и не считающиеся уязвимостями: блокировка входа для логина после 10 неудачных попыток за 15 минут (с любого IP); семейные записи правят и удаляют все участники; escrow для администратора — галочка при регистрации, по умолчанию включена; зашифрованная офлайн-копия остаётся в браузере после выхода (на общих устройствах очищайте данные сайта); лимиты по IP зависят от того, что прокси дописывает `X-Forwarded-For` (заголовку верим только от `TRUSTED_PROXIES`, порт контейнера не публикуйте в сеть); пока нет первого аккаунта, администратором может стать любой, кто откроет адрес, если не задан `SETUP_TOKEN`; расширение спрашивает подтверждение, если сайт не совпадает с адресом записи, но не отличит похожий домен, который вы сами сохранили в записи.

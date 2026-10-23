# FravashiVault

**English** | [Русский](README.ru.md)

A self-hosted, zero-knowledge password manager for one person or a family. The server stores only encrypted data; everything is encrypted and decrypted in the browser.

Backend: Rust (Axum, SQLite). Frontend: Vue, no build step for the JavaScript.

> **Disclaimer.** No independent security audit has been performed. The project has only a self-review ([AUDIT.md](AUDIT.md)). Use it at your own risk and keep your own backups.

## Features

- Item types: logins, bank cards, loyalty cards (barcode / QR code, full screen for the checkout), notes, Wi-Fi networks (with a scannable QR code); several sub-accounts under one item, custom fields, password history, favourites, folders, trash
- One-time codes (TOTP): the secret is stored inside the encrypted item, the code is computed in the browser
- Password generator and a duplicate / weak password overview
- Password breach check via Have I Been Pwned using k-anonymity (only the first 5 characters of the SHA-1 hash are sent to `api.pwnedpasswords.com`)
- Offline mode: after a successful login the encrypted items and the wrapped keys are cached in the browser; without a connection you can sign in with the master password and read (not edit) the vault
- Installable PWA (manifest plus a service worker that caches the app shell)
- Browser extension (Manifest V3), generated and downloaded from the app: fills logins and, after an explicit confirmation, bank cards; interface in Russian and English; access to a tab only when you click the extension icon (see [Browser extension](#browser-extension))
- Import from JSON (this app's format) and CSV; export to JSON (unencrypted, see below)
- Personal and family items. Family items are encrypted with a shared family key and are shared for editing: every member can change, move to trash and permanently delete any family item. Only the member who created a family item can turn it into a personal one
- Invite codes: the administrator creates a one-time code (valid 60 minutes from the UI, 5 minutes to 24 hours via the API; 80 bits of randomness); a new member registers with it
- Emergency recovery key: lets you set a new master password without losing data
- Optional two-factor sign-in (TOTP): a code from an authenticator app after the master password, plus 10 one-time backup codes; also supported by the browser extension (see [Two-factor sign-in](#two-factor-sign-in-totp))
- The administrator can reset a member's password (see the threat model for what that implies)
- Auto-lock after 15 minutes of inactivity; the clipboard is cleared 30 seconds after copying a password
- Activity log of security events, visible to the administrator (kept in server memory: last 300 entries, lost on restart)
- Interface in Russian and English

## Parameters

| What | Value | Where |
|---|---|---|
| Item encryption | AES-256-GCM, in the browser | `static/app.js` |
| Master password KDF | PBKDF2-HMAC-SHA256, 600,000 iterations | `KDF_ITERATIONS` in `static/app.js` |
| Key separation | HKDF-SHA256 with separate labels for the encryption key, the login value, escrow and invites | `static/app.js` |
| Server-side hashing of the login value | Argon2id (crate defaults: 19 MiB memory, 2 passes, 1 lane), at most 4 hashes at once | `main.rs` |
| Quota per user | 50 MiB of ciphertext for personal items; family items share one 50 MiB quota; at most 20,000 items per user | `MAX_BYTES_PER_USER`, `MAX_ITEMS_PER_USER` |
| Single request | body up to 512 KiB; import batch up to 5,000 items / 16 MiB | `main.rs` |
| Session | expires after 12 h of inactivity and at most 24 h after login | `SESSION_TTL`, `SESSION_ABS_TTL` |
| Two-factor sign-in | TOTP (RFC 6238): HMAC-SHA1, 6 digits, 30-second step, the neighbouring step (±1) is accepted, an already used step is rejected; the secret is stored encrypted with AES-256-GCM under a key derived from the server secret; 10 backup codes of 80 bits each, stored only as HMAC | `main.rs` |
| Attempt limits (15-minute window) | login: 20 per IP and 10 per username; second sign-in step (code): 20 per IP and 10 per user, and one pending sign-in is cancelled after 5 wrong codes or 5 minutes; enabling or disabling two-factor sign-in: 20 / 10; password change: 20 / 10; recovery: 10 / 10; registration: 10 per IP; invite lookup: 10 per IP; administrator resetting a member's password: 5 per IP and 5 per administrator; KDF parameters: 60 per IP per minute | `main.rs` |
| Response headers | `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Strict-Transport-Security` (1 year), `Permissions-Policy` (camera, microphone, geolocation off), `Cache-Control: no-store` on `/api/` | `security_headers_middleware` |

## Security model

- **Zero-knowledge for content.** Item data is encrypted in the browser with AES-256-GCM. The master password is stretched with PBKDF2; the encryption key and the login value are derived separately with HKDF, so the server never receives a key that can decrypt your data.
- **Server side.** The login value sent by the client is hashed again with Argon2id before it is stored.
- **What it protects against:** a stolen or leaked server database or backup (an attacker must still guess the master password); a curious server operator who only reads the database; passive network observers (when used over HTTPS).
- **What the server does see (metadata):** usernames, which items exist, their sizes, folder/category label, favourite and trash flags, personal/family scope, timestamps. Your reverse proxy will also see IP addresses and request times.
- **Family administrator.** The registration form for a new member has a checkbox "Allow the admin to restore my access", which is **on by default**. If the member leaves it on, a copy of their vault key is sealed to the administrator's key (ECDH P-256). This lets the administrator reset a forgotten master password, and it also means the administrator can technically gain access to that member's personal items. If the member turns it off, no copy is made: the administrator cannot reset that password, and only the member's own recovery key works. The choice is made once, at registration. Only make people administrators if you trust them.
- **Family items** are shared by all members for editing and deletion (see Features). A member who should not be able to delete something should keep it personal.
- **Usernames are not revealed** to someone who is not signed in: for an unknown username the server returns salts computed from a server secret, and the recovery endpoints return the same error for an unknown username and a wrong recovery key.
- **Sign-in lockout is a known trade-off.** After 10 failed sign-ins for one username within 15 minutes, further attempts for that username are refused until the window passes, from any IP address. This slows down password guessing, but it also means someone who knows your username can keep you locked out for a while.
- **Offline copy in the browser.** For offline mode, the browser keeps the encrypted items, the wrapped vault key and the salt in local storage, and they stay there after you sign out. They are useless without the master password, but anyone with access to that browser profile can copy them and try to guess the password offline. On shared or public computers, clear the site data after use (browser settings → site data for this address).
- **What it does NOT protect against:**
  - a weak master password: someone holding the database can try to guess it offline;
  - malware, a keylogger or a malicious extension on your device;
  - a compromised or malicious server: the JavaScript is delivered by the server on every visit, so a modified server could ship code that steals your password. Self-hosting on your own hardware reduces but does not remove this;
  - a lost master password together with a lost recovery key: there is no other way back;
  - the exported JSON file, which is **not** encrypted and contains all passwords;
  - an unlocked app: while it is open, the decrypted vault key lives in the browser's memory.
- **No independent security audit has been performed.** Only a self-review exists ([AUDIT.md](AUDIT.md)).
- HTTPS is mandatory. Run the service only behind a reverse proxy with a valid certificate.

## Two-factor sign-in (TOTP)

Optional and per user. Users who do not turn it on sign in exactly as before.

- **Turning it on.** Settings & tools → Two-factor authentication. Enter the master password, scan the QR code with an authenticator app (Aegis, 2FAS, Google Authenticator, etc.) or type the key manually, then enter the 6-digit code. Two-factor sign-in starts working only after a correct code. The QR code is drawn in the browser.
- **Backup codes.** Right after it is turned on, 10 backup codes are shown **once**, with Copy and Download buttons. Keep them away from the phone. Each code works once instead of an app code; the window shows how many are left. The server stores only an HMAC of each code.
- **Signing in.** After the master password the app asks for the code; "Use a backup code" accepts a backup code instead. The browser extension has the same second step.
- **Turning it off.** In the same window: the master password plus an app code or a backup code.
- **What it gives.** Someone who learns your master password (phishing, a password reused elsewhere) still cannot sign in to the server without the code, so they get no session and cannot download your encrypted vault through the API.
- **What it does NOT give:**
  - it protects sign-in to the account, not encryption: items are still encrypted only with keys derived from the master password, and the TOTP secret plays no part in encryption;
  - someone with a copy of the database or a backup needs no code: they attack the master password offline, as before;
  - offline mode does not ask for a code: the encrypted copy cached in the browser opens with the master password alone;
  - the TOTP secret is encrypted with a key derived from the server secret, which is kept in the same database (`server_meta`). This protects against a leak of the TOTP table alone, not against theft of the whole database file;
  - sessions that are already open stay open when two-factor sign-in is turned on.
- **Lost phone.** Use a backup code. Without backup codes: resetting the master password with the recovery key ("Recovery key" link on the sign-in screen) also turns two-factor sign-in off, and so does an administrator resetting a member's password (only for members who allowed it at registration). After that, sign in with the new password and turn two-factor sign-in on again if you want it. This also means the recovery key, and the administrator for such members, can bypass the second factor: keep the recovery key as safe as the backup codes.

## Browser extension

Generated in the browser when you press "Download fravashi-extension.zip" (`static/extension-build.js`) and installed as an unpacked extension in Chromium-based desktop browsers. The server address and the window language are taken from the app at the moment of download; if that language is missing, the browser language is used. Version 1.3.2.

**Installing it, step by step:**

1. Sign in to the app over `https://` and open "Settings & services" → "Vault tools" → "Extension (ZIP)" → "Download fravashi-extension.zip". The archive is built for the address of your server, so download it from the server you will use.
2. Unpack the zip into a folder you will keep (the browser reads the extension from there).
3. In Chrome, Edge, Brave or another Chromium browser open `chrome://extensions` (Edge: `edge://extensions`) and turn on "Developer mode".
4. Click "Load unpacked" and select the unpacked folder.

The extension works only with an `https://` server address.

**Permissions** (`manifest.json`):

| Permission | Why |
|---|---|
| `activeTab` | access to the current tab only after you click the extension icon, and only until that tab navigates to another site; no access to other tabs or in the background |
| `scripting` | to run the fill function in that tab (`chrome.scripting.executeScript`) when you press a button in the extension window |
| host permission for the server address only (`https://<your server>/*`) | sign-in and loading the encrypted vault through the API |

No `<all_urls>`, no content scripts on every site, no `tabs`, `storage`, `clipboardWrite`, cookies or history. The extension stores nothing: the master password (and the code) are asked every time the window is opened. Version 1.2.0 and earlier had `<all_urls>`, `tabs`, `storage` and a content script on all sites; reinstall the extension to drop them.

**Filling a login.** "⚡ Fill" compares the site in the tab with the address saved in the item (the same host or its subdomain). If they do not match, or the item has no address, a warning is shown and filling happens only after you confirm. The fill function in the page checks the host once more, so nothing is filled if the page has meanwhile moved to another site.

**Filling a bank card.** Card items get a "Fill card" button. It never fills on its own: a confirmation in the extension window always shows the card name, the last 4 digits and the host of the current page, plus a separate "Fill CVV" checkbox that is **off** by default. Only after "Fill" are the data sent to the page. Where the data come from: card number — the item's "Login" field, CVV — the "Password" field, expiry and holder — custom fields labelled "Expiry"/"Срок" and "Holder"/"Владелец" (as in the app). Fields are found by `autocomplete` (`cc-number`, `cc-exp`, `cc-exp-month`, `cc-exp-year`, `cc-name`, `cc-csc`), then by `name`/`id`/`placeholder`/`aria-label` in English and Russian; only visible, editable `<input>` elements of the page itself. Expiry is accepted as MM/YY or MM/YYYY and written in the format the field suggests.

**Limits:**
- payment forms embedded from a payment provider (an `<iframe>` from another domain) cannot be filled; the extension does not try to get around this and says "No card fields found on this page, or they are inside an embedded payment form";
- `<select>` lists for month/year and card numbers split into four inputs are not filled;
- the host check cannot tell a look-alike domain saved in the item from the real one, and a card has no saved address to compare with: read the host in the confirmation before pressing "Fill";
- the "Password" field of a card item is labelled "CVV / PIN" in the app: if you keep a PIN there, do not tick "Fill CVV";
- the page receives the data it was filled with, as with manual typing: fill cards only on sites you trust.

## Roadmap

The order is not a promise.

- done: optional two-factor sign-in (TOTP), see [Two-factor sign-in](#two-factor-sign-in-totp)
- done: browser extension 1.3.2 — English interface, narrow permissions (`activeTab`, `scripting`, the server address only), bank card autofill with confirmation, see [Browser extension](#browser-extension)
- deferred on purpose: browser extension session ("stay unlocked for N minutes"). For now the extension asks for the master password (and the code, if two-factor sign-in is on) every time its window is opened
- planned: quick unlock with Face ID / Touch ID / Windows Hello / passkey (WebAuthn PRF)
- done: loyalty cards with a barcode / QR code (EAN-13, EAN-8, Code 128, Code 39, QR); the extension skips them
- planned: filling `<select>` expiry lists and split card number fields in the extension
- done: no `unsafe-eval` in the Content Security Policy: the Vue template is precompiled (`static/app-render.js`) and the page uses the runtime-only Vue build
- planned: count metadata in the quota
- **Not planned:** in-store payments (NFC). This is a password manager, not a wallet.

## Quick start (Docker)

Requirements: Docker with Compose and, for any access other than from the host itself, a reverse proxy that terminates HTTPS (nginx, Caddy, Traefik, the Synology DSM reverse proxy, etc.).

**Why HTTPS.** The app encrypts everything in the browser with the Web Crypto API (`crypto.subtle`), and browsers expose it only in a secure context. Opening the server over plain `http://` from another device will not work. Browsers treat `http://127.0.0.1:8585` and `http://localhost:8585` as secure, so to try the app on the host itself you do not need a proxy. The browser extension also works only with an `https://` server address.

```sh
git clone https://github.com/miki-113/fravashi-vault.git fravashi
cd fravashi
mkdir data
cp .env.example .env        # Windows (PowerShell): Copy-Item .env.example .env
```

Edit `.env` (all variables are described in `.env.example`). `VAULT_UID` and `VAULT_GID` must be the owner of `./data` (check with `stat -c '%u:%g' data`; the default is 1000:1000).

**Permissions on `data/` (Linux only).** Make the directory belong to that user:

```sh
sudo chown -R 1000:1000 ./data && sudo chmod 700 ./data
```

On Docker Desktop (Windows/macOS) this is not needed. Then start:

```sh
docker compose up -d --build
```

If the names `fravashi` (container or image) clash with something you already run, remove `container_name` and `image` from `docker-compose.yml`.

The container listens on `127.0.0.1:8585` only (it is not reachable from the network directly). Put an HTTPS reverse proxy in front of it, for example for `https://vault.example.com`:

```
# Caddy (Caddyfile)
vault.example.com {
    reverse_proxy 127.0.0.1:8585 {
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

```
# nginx (inside a server block with your TLS certificate)
location / {
    proxy_pass http://127.0.0.1:8585;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Register the owner before the instance is reachable from the internet.** Until the first account exists, anyone who opens the address can register and become the administrator. To close that window, set `SETUP_TOKEN` in `.env` to a long random string:

```sh
openssl rand -hex 16        # copy the result into SETUP_TOKEN=... in .env
docker compose up -d        # apply the change
curl http://127.0.0.1:8585/api/status
```

`/api/status` must contain `"setup_token_required": true` (it is `false` once an administrator exists or when the token is not set). The first registration then shows a "Setup token" field and is accepted only with the matching value (compared in constant time). After the administrator exists, the token is no longer used and can be removed. If `SETUP_TOKEN` is not set, the first registration works without it.

**First registration.** Open the address and register; the first user becomes the administrator and can then invite other family members with one-time invite codes. After registering, the app shows a **recovery key**. Download it and store it separately from the master password (not in the same password manager, not next to the password). The master password and the recovery key are the only ways to your data: if you lose **both**, the data cannot be recovered by anyone, including the server administrator.

**Reverse proxy and client IP addresses.** Attempt limits are counted per client IP. Behind a proxy, the server sees the proxy's address, so it takes the client address from the **last** entry of `X-Forwarded-For`. Your proxy must append the client address to that header (see the examples above). The header is trusted only when the connection comes from a trusted proxy address: by default loopback and private ranges (`127.0.0.0/8`, `::1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`), which covers a proxy on the same host and the Docker gateway. To change this, set `TRUSTED_PROXIES` to a comma-separated list of addresses or subnets, or to `none` to ignore the header. Do not publish the container port to the network (keep `127.0.0.1:8585`): a client that can connect directly from a private range could otherwise fake its address.

The container runs as an unprivileged user with a read-only root file system and all capabilities dropped. Synology NAS is one example of a host; any machine with Docker works.

## Build from source

Requires a recent stable Rust toolchain.

```sh
cargo build --release --locked
DB_PATH=./data/vault-v2.db ./target/release/fravashi   # listens on port 8000
cargo test
node --test tests/*.mjs
```

The binary serves `index.html` and the `static/` directory from its working directory.

After changing the markup inside `<div id="app">` in `index.html`, rebuild the precompiled template and commit `static/app-render.js` (Node.js is needed only for this step, not for Docker or running the server):

```sh
npm install
npm run build:templates
```

`node --test` fails if `static/app-render.js` is out of date.

## Backup and restore

All state is in the `data/` directory (SQLite database `vault-v2.db` with WAL files). Stop the container before copying, otherwise the copy may be inconsistent:

```sh
docker compose stop
sudo cp -a data /path/to/backup/data-$(date +%F)
docker compose start
```

`sudo` is needed because the files belong to `VAULT_UID`; `cp -a` keeps ownership and permissions.

To restore, stop the container, replace the contents of `data/` with the backup, fix ownership (`sudo chown -R <VAULT_UID>:<VAULT_GID> data`) and start it again. Store backups somewhere safe: they are encrypted, but they can be attacked offline. Also export a JSON copy from the app from time to time; that file is **not** encrypted, so delete it after use.

## Update

1. Make a backup of `data/` (see above).
2. Update and rebuild:

```sh
git pull
docker compose up -d --build
```

After an update, reinstall the browser extension and the PWA if the release notes say the key scheme or caches changed.

## Screenshots

**Sign-in screen**

![Sign-in screen](docs/screenshots/login.png)

**Item list and item details**

![Item list with details](docs/screenshots/list.png)

**Bank card**

![Bank card view](docs/screenshots/card.png)

**Folders, tools and security watchtower**

![Folders, tools and security watchtower](docs/screenshots/tools.png)

**Dark theme**

![Dark theme](docs/screenshots/dark.png)

All data in the screenshots is fictional.

## About the name

Fravashi (Avestan *fravashi*) is, in Zoroastrianism, the guardian spirit of a person and of their lineage. This is a family vault, and the name fits.

## License

[GNU Affero General Public License v3.0](LICENSE). If you run a modified version of this program and let users interact with it over a network, you must offer those users the source code of your modified version. Third-party components and their licenses are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Copyright (C) 2026 FravashiVault contributors

## Security

To report a vulnerability, see [SECURITY.md](SECURITY.md). Do not open public issues for security problems. The self-review is in [AUDIT.md](AUDIT.md).

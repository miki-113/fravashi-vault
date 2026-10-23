# FravashiVault

**English** | [Русский](README.ru.md)

A self-hosted, zero-knowledge password manager for one person or a family. The server stores only encrypted data; everything is encrypted and decrypted in the browser.

Backend: Rust (Axum, SQLite). Frontend: Vue, no build step for the JavaScript.

> **Disclaimer.** No independent security audit has been performed. The project has only a self-review ([AUDIT.md](AUDIT.md)). Use it at your own risk and keep your own backups.

## Features

- Item types: logins, bank cards, notes, Wi-Fi networks (with a scannable QR code); several sub-accounts under one item, custom fields, password history, favourites, folders, trash
- One-time codes (TOTP): the secret is stored inside the encrypted item, the code is computed in the browser
- Password generator and a duplicate / weak password overview
- Password breach check via Have I Been Pwned using k-anonymity (only the first 5 characters of the SHA-1 hash are sent to `api.pwnedpasswords.com`)
- Offline mode: after a successful login the encrypted items and the wrapped keys are cached in the browser; without a connection you can sign in with the master password and read (not edit) the vault
- Installable PWA (manifest plus a service worker that caches the app shell)
- Browser extension (Manifest V3), generated and downloaded from the app: autofills logins. Before filling, it checks that the site in the active tab matches the address saved in the item (the same host or its subdomain); if it does not match, or the item has no address, it shows a warning and fills only after you confirm
- Import from JSON (this app's format) and CSV; export to JSON (unencrypted, see below)
- Personal and family items. Family items are encrypted with a shared family key and are shared for editing: every member can change, move to trash and permanently delete any family item. Only the member who created a family item can turn it into a personal one
- Invite codes: the administrator creates a one-time code (valid 60 minutes from the UI, 5 minutes to 24 hours via the API; 80 bits of randomness); a new member registers with it
- Emergency recovery key: lets you set a new master password without losing data
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
| Attempt limits (15-minute window) | login: 20 per IP and 10 per username; password change: 20 / 10; recovery: 10 / 10; registration: 10 per IP; invite lookup: 10 per IP; administrator resetting a member's password: 5 per IP and 5 per administrator; KDF parameters: 60 per IP per minute | `main.rs` |
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
  - script injection, only partly: the Content Security Policy contains `unsafe-eval` because the Vue templates are compiled in the browser from the page (in-DOM templates). See Roadmap;
  - an unlocked app: while it is open, the decrypted vault key lives in the browser's memory.
- **No independent security audit has been performed.** Only a self-review exists ([AUDIT.md](AUDIT.md)).
- HTTPS is mandatory. Run the service only behind a reverse proxy with a valid certificate.

## Roadmap

Not implemented yet; the order is not a promise.

- planned: browser extension session ("stay unlocked for N minutes"), optional
- planned: optional TOTP at sign-in
- planned: quick unlock with Face ID / Touch ID / Windows Hello (WebAuthn PRF)
- planned: loyalty cards with a barcode / QR code
- planned: bank card autofill in the browser extension
- planned: remove `unsafe-eval` from the Content Security Policy (precompiled templates)
- planned: count metadata in the quota
- **Not planned:** in-store payments (NFC). This is a password manager, not a wallet.

## Quick start (Docker)

Requirements: Docker with Compose, and a reverse proxy that terminates HTTPS (nginx, Caddy, Traefik, the Synology DSM reverse proxy, etc.).

```sh
git clone https://github.com/miki-113/fravashi-vault.git fravashi
cd fravashi
mkdir data
```

Create a `.env` file next to `docker-compose.yml`. `VAULT_UID` and `VAULT_GID` must be the owner of `./data` (check with `stat -c '%u:%g' data`; the default is 1000:1000):

```
VAULT_UID=1000
VAULT_GID=1000
# TZ=UTC
# SETUP_TOKEN=<a long random string>   # optional, see below
# TRUSTED_PROXIES=                        # optional, see below
```

```sh
sudo chown -R 1000:1000 ./data && sudo chmod 700 ./data
docker compose up -d --build
```

The container listens on `127.0.0.1:8585` only (it is not reachable from the network directly). Point your HTTPS reverse proxy at `http://127.0.0.1:8585`, for example `https://vault.example.com`. Open that address and register; the first user becomes the administrator and can then invite other family members with one-time invite codes.

**Register the owner before the instance is reachable from the internet.** Until the first account exists, anyone who opens the address can register and become the administrator. To close that window, set `SETUP_TOKEN` in `.env` to a long random string: the first registration then shows a "Setup token" field and is accepted only with the matching value (compared in constant time). After the administrator exists, the token is no longer used and can be removed. If `SETUP_TOKEN` is not set, the first registration works as before.

**Reverse proxy and client IP addresses.** Attempt limits are counted per client IP. Behind a proxy, the server sees the proxy's address, so it takes the client address from the **last** entry of `X-Forwarded-For`. Your proxy must append the client address to that header (nginx: `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`). The header is trusted only when the connection comes from a trusted proxy address: by default loopback and private ranges (`127.0.0.0/8`, `::1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`), which covers a proxy on the same host and the Docker gateway. To change this, set `TRUSTED_PROXIES` to a comma-separated list of addresses or subnets, or to `none` to ignore the header. Do not publish the container port to the network (keep `127.0.0.1:8585`): a client that can connect directly from a private range could otherwise fake its address.

The container runs as an unprivileged user with a read-only root file system and all capabilities dropped. Synology NAS is one example of a host; any Linux machine with Docker works.

## Build from source

Requires a recent stable Rust toolchain.

```sh
cargo build --release --locked
DB_PATH=./data/vault-v2.db ./target/release/fravashi   # listens on port 8000
cargo test
node --test tests/*.mjs
```

The binary serves `index.html` and the `static/` directory from its working directory.

## Backup and restore

All state is in the `data/` directory (SQLite database `vault-v2.db`).

```sh
docker compose stop
cp -a data /path/to/backup/data-$(date +%F)
docker compose start
```

To restore, stop the container, replace the contents of `data/` with the backup, fix ownership (`chown -R <VAULT_UID>:<VAULT_GID> data`) and start it again. Store backups somewhere safe: they are encrypted, but they can be attacked offline. Also export a JSON copy from the app from time to time; that file is **not** encrypted, so delete it after use.

## Update

```sh
git pull
docker compose up -d --build
```

Make a backup first. After an update, reinstall the browser extension and the PWA if the release notes say the key scheme or caches changed.

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

use axum::{
    extract::{ConnectInfo, DefaultBodyLimit, Path, Request, State},
    http::{header, HeaderMap, HeaderName, HeaderValue, StatusCode},
    middleware::{self, Next},
    response::{Html, IntoResponse, Response},
    routing::{delete, get, post, put},
    Json, Router,
};
use chrono::Local;
use tower_http::services::ServeDir;
use flate2::{write::ZlibEncoder, Compression};
use aes_gcm::{
    aead::{Aead, KeyInit, Payload},
    Aes256Gcm, Key, Nonce,
};
use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use rand::{rngs::OsRng, RngCore};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use sha1::Sha1;
use sha2::{Digest, Sha256};
use std::{
    collections::{HashMap, VecDeque},
    env,
    fs,
    io::Write,
    net::{IpAddr, SocketAddr},
    path::Path as FsPath,
    sync::{Arc, Mutex},
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tokio::sync::Semaphore;

const SESSION_TTL: i64 = 3600 * 12; // idle: продлевается каждым запросом
const SESSION_ABS_TTL: i64 = 3600 * 24; // абсолютный срок от входа

// Лимиты попыток (скользящее окно). IP — по всем запросам, логин — отдельно, чтобы один IP не закрыл вход всем
const RATE_WINDOW: i64 = 900;
const PARAMS_WINDOW: i64 = 60;
const LOGIN_IP_LIMIT: usize = 20;
const LOGIN_USER_LIMIT: usize = 10;
const CHPW_IP_LIMIT: usize = 20;
const CHPW_USER_LIMIT: usize = 10;
const RECOVERY_IP_LIMIT: usize = 10;
const RECOVERY_USER_LIMIT: usize = 10;
const REGISTER_IP_LIMIT: usize = 10;
const INVITE_IP_LIMIT: usize = 10;
const PARAMS_IP_LIMIT: usize = 60;
const ADMIN_RESET_LIMIT: usize = 5;
const RATE_MAX_KEYS: usize = 100_000;

const BODY_LIMIT: usize = 512 * 1024;
const BATCH_BODY_LIMIT: usize = 16 * 1024 * 1024;
// Лимиты полей и объёма на пользователя (этап 3)
const MAX_USERNAME_LEN: usize = 64;
const MAX_BLOB_LEN: usize = 8 * 1024; // обёрнутые ключи, соли, идентификаторы
const MAX_CIPHERTEXT_LEN: usize = 400_000; // base64-шифртекст одной записи (тело запроса ограничено 512 КиБ)
const MAX_IV_LEN: usize = 64;
const MAX_CATEGORY_LEN: usize = 64;
const MAX_BATCH_ITEMS: usize = 5_000;
const MAX_ITEMS_PER_USER: i64 = 20_000;
const MAX_BYTES_PER_USER: i64 = 50 * 1024 * 1024; // суммарный объём шифртекста записей одного пользователя
const ARGON_MAX_CONCURRENT: usize = 4;
// legacy-идентификатор протокола, не переименовывать: сломает существующие сейфы
const KDF_VERSION: i64 = 2;
const INVITE_TTL_MIN_MINUTES: i64 = 5;
const INVITE_TTL_MAX_MINUTES: i64 = 1440;

// Двухфакторный вход (TOTP, RFC 6238): SHA-1, 6 цифр, шаг 30 с, допускается соседний шаг (±1)
const TOTP_STEP: i64 = 30;
const TOTP_DIGITS: u32 = 6;
const TOTP_SKEW: i64 = 1;
const TOTP_SECRET_LEN: usize = 20;
const TOTP_ISSUER: &str = "FravashiVault";
// Незавершённое включение (секрет выдан, код ещё не подтверждён) действует 15 минут
const TOTP_SETUP_TTL: i64 = 900;
// Одноразовый challenge второго шага входа: 5 минут и не больше 5 неверных кодов
const TOTP_CHALLENGE_TTL: i64 = 300;
const TOTP_CHALLENGE_MAX_FAILS: u32 = 5;
const TOTP_MAX_CHALLENGES: usize = 10_000;
const TOTP_IP_LIMIT: usize = 20;
const TOTP_USER_LIMIT: usize = 10;
const BACKUP_CODES_COUNT: usize = 10;
const BACKUP_CODE_BYTES: usize = 10; // 80 бит, 16 символов base32

#[derive(Clone)]
struct SessionInfo {
    user_id: i64,
    username: String,
    is_admin: bool,
    created: i64,
    exp: i64,
}

// Ожидающий второй шаг входа. Ключ в карте — SHA-256 токена, сам токен сервер не хранит
struct TotpChallenge {
    user_id: i64,
    username: String,
    exp: i64,
    fails: u32,
}

#[derive(Clone, Serialize)]
struct LogEntry {
    id: String,
    ts: String,
    level: String,
    user: String,
    action: String,
    detail: String,
}

struct AppState {
    db: Mutex<Connection>,
    sessions: Mutex<HashMap<String, SessionInfo>>,
    limiter: Mutex<RateLimiter>,
    argon_sem: Arc<Semaphore>,
    logs: Mutex<VecDeque<LogEntry>>,
    // Verifier для несуществующих логинов: вход тратит столько же времени на Argon2id
    dummy_verifier: String,
    // Ключ HMAC для фиктивных солей несуществующих логинов (см. load_server_secret)
    fake_salt_secret: Vec<u8>,
    // Ключ AES-256-GCM для секретов TOTP и HMAC резервных кодов; выводится из секрета сервера
    totp_key: [u8; 32],
    totp_challenges: Mutex<HashMap<String, TotpChallenge>>,
    trusted_proxies: Vec<Cidr>,
    // SETUP_TOKEN: если задан, первая регистрация (создание админа) требует его
    setup_token: Option<String>,
    png_192: Vec<u8>,
    png_512: Vec<u8>,
}

impl AppState {
    fn new(conn: Connection, dummy_verifier: String, png_192: Vec<u8>, png_512: Vec<u8>) -> Self {
        let permits = std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(2)
            .clamp(1, ARGON_MAX_CONCURRENT);
        let fake_salt_secret = load_server_secret(&conn);
        let totp_key = hmac_sha256(&fake_salt_secret, b"fravashi-totp-key-v1");
        let trusted_proxies = parse_trusted_proxies(env::var("TRUSTED_PROXIES").ok().as_deref())
            .unwrap_or_else(|bad| panic!("TRUSTED_PROXIES: неверный адрес или подсеть «{bad}»"));
        let setup_token = env::var("SETUP_TOKEN").ok().filter(|s| !s.trim().is_empty());
        AppState {
            fake_salt_secret,
            totp_key,
            totp_challenges: Mutex::new(HashMap::new()),
            trusted_proxies,
            setup_token,
            db: Mutex::new(conn),
            sessions: Mutex::new(HashMap::new()),
            limiter: Mutex::new(RateLimiter::default()),
            argon_sem: Arc::new(Semaphore::new(permits)),
            logs: Mutex::new(VecDeque::with_capacity(300)),
            dummy_verifier,
            png_192,
            png_512,
        }
    }
}

// detail — стабильный код ошибки (клиент переводит его сам), params — числа для подстановки в текст
struct AppError(StatusCode, &'static str, Option<serde_json::Value>);

fn err(status: StatusCode, code: &'static str) -> AppError {
    AppError(status, code, None)
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let body = match self.2 {
            Some(params) => serde_json::json!({ "detail": self.1, "params": params }),
            None => serde_json::json!({ "detail": self.1 }),
        };
        (self.0, Json(body)).into_response()
    }
}

fn now_ts() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

fn random_hex(bytes_len: usize) -> String {
    let mut buf = vec![0u8; bytes_len];
    OsRng.fill_bytes(&mut buf);
    hex::encode(buf)
}

// authKey с клиента: HKDF-SHA256 → 32 байта → 64 hex-символа
fn is_valid_auth_key(auth_key: &str) -> bool {
    auth_key.len() == 64 && auth_key.bytes().all(|b| b.is_ascii_hexdigit())
}

// Argon2id(authKey) со своей случайной солью на каждый verifier; результат — PHC-строка
fn hash_auth_key(auth_key: &str) -> Result<String, AppError> {
    if !is_valid_auth_key(auth_key) {
        return Err(err(StatusCode::BAD_REQUEST, "invalid_auth_key"));
    }
    let mut salt_bytes = [0u8; 16];
    OsRng.fill_bytes(&mut salt_bytes);
    let salt = SaltString::encode_b64(&salt_bytes)
        .map_err(|_| err(StatusCode::INTERNAL_SERVER_ERROR, "internal"))?;
    Argon2::default()
        .hash_password(auth_key.to_ascii_lowercase().as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|_| err(StatusCode::INTERNAL_SERVER_ERROR, "internal"))
}

// Сравнение внутри argon2 выполняется за постоянное время
fn verify_auth_key(auth_key: &str, verifier: &str) -> bool {
    if !is_valid_auth_key(auth_key) {
        return false;
    }
    match PasswordHash::new(verifier) {
        Ok(parsed) => Argon2::default()
            .verify_password(auth_key.to_ascii_lowercase().as_bytes(), &parsed)
            .is_ok(),
        Err(_) => false,
    }
}

// В БД лежит только SHA-256(invite_id), сам invite_id сервер не хранит
fn invite_lookup_hash(invite_id: &str) -> String {
    hex::encode(Sha256::digest(invite_id.trim().to_ascii_lowercase().as_bytes()))
}

// HMAC (RFC 2104) поверх sha1/sha2: отдельный крейт ради одной функции не нужен.
// Блок 64 байта — верно для SHA-1 и SHA-256, других хешей здесь нет
fn hmac<D: Digest>(key: &[u8], msg: &[u8]) -> Vec<u8> {
    let mut k = [0u8; 64];
    if key.len() > 64 {
        let h = D::digest(key);
        k[..h.len()].copy_from_slice(&h);
    } else {
        k[..key.len()].copy_from_slice(key);
    }
    let pad = |b: u8| k.iter().map(|x| x ^ b).collect::<Vec<u8>>();
    let inner = D::new().chain_update(pad(0x36)).chain_update(msg).finalize();
    D::new().chain_update(pad(0x5c)).chain_update(inner).finalize().to_vec()
}

fn hmac_sha256(key: &[u8], msg: &[u8]) -> [u8; 32] {
    let mut out = [0u8; 32];
    out.copy_from_slice(&hmac::<Sha256>(key, msg));
    out
}

// Сравнение секретов за постоянное время: сравниваются SHA-256 обеих строк, поэтому длина не важна
fn ct_eq(a: &str, b: &str) -> bool {
    let (x, y) = (Sha256::digest(a.as_bytes()), Sha256::digest(b.as_bytes()));
    x.iter().zip(y.iter()).fold(0u8, |acc, (p, q)| acc | (p ^ q)) == 0
}

// Секрет сервера для фиктивных солей несуществующих логинов. Создаётся один раз и лежит в той же БД
// (каталог data/ доступен только процессу), поэтому соли стабильны между перезапусками
fn load_server_secret(conn: &Connection) -> Vec<u8> {
    conn.execute(
        "INSERT OR IGNORE INTO server_meta (key, value) VALUES ('fake_salt_secret', ?1)",
        params![random_hex(32)],
    )
    .expect("Не удалось записать секрет сервера");
    let hex_secret: String = conn
        .query_row("SELECT value FROM server_meta WHERE key = 'fake_salt_secret'", [], |r| r.get(0))
        .expect("Не удалось прочитать секрет сервера");
    hex::decode(hex_secret).expect("Повреждён секрет сервера в server_meta")
}

// Фиктивная соль в том же формате, что настоящая (16 байт hex); метка разводит kdf и recovery
fn fake_salt(secret: &[u8], label: &str, uname: &str) -> String {
    hex::encode(&hmac_sha256(secret, format!("{label}|{uname}").as_bytes())[..16])
}

// ---------- TOTP ----------

// HOTP (RFC 4226) с динамическим усечением; digits — 6 в работе, 8 в тестовых векторах RFC 6238
fn hotp(secret: &[u8], counter: u64, digits: u32) -> u32 {
    let mac = hmac::<Sha1>(secret, &counter.to_be_bytes());
    let off = (mac[mac.len() - 1] & 0x0f) as usize;
    let bin = u32::from_be_bytes([mac[off] & 0x7f, mac[off + 1], mac[off + 2], mac[off + 3]]);
    bin % 10u32.pow(digits)
}

// Шаг, на котором код совпал (текущий ±TOTP_SKEW). Шаги не новее last_step не принимаются:
// уже использованный код (и любой более ранний) повторно не сработает
fn totp_match(secret: &[u8], code: &str, now: i64, last_step: i64) -> Option<i64> {
    if code.len() != TOTP_DIGITS as usize || !code.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    let cur = now / TOTP_STEP;
    let mut found = None;
    for step in (cur - TOTP_SKEW)..=(cur + TOTP_SKEW) {
        let expected = format!("{:0w$}", hotp(secret, step as u64, TOTP_DIGITS), w = TOTP_DIGITS as usize);
        // без раннего выхода: время проверки не зависит от того, какой шаг совпал
        if ct_eq(&expected, code) && step > last_step && found.is_none() {
            found = Some(step);
        }
    }
    found
}

// Base32 (RFC 4648) без «=»: формат секрета в otpauth:// и алфавит резервных кодов
fn base32_encode(data: &[u8]) -> String {
    const ALPHABET: &[u8; 32] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let (mut out, mut buf, mut bits) = (String::new(), 0u32, 0u32);
    for &b in data {
        buf = (buf << 8) | b as u32;
        bits += 8;
        while bits >= 5 {
            bits -= 5;
            out.push(ALPHABET[((buf >> bits) & 31) as usize] as char);
        }
        buf &= (1 << bits) - 1;
    }
    if bits > 0 {
        out.push(ALPHABET[((buf << (5 - bits)) & 31) as usize] as char);
    }
    out
}

// Процентное кодирование метки otpauth:// (всё, кроме unreserved из RFC 3986)
fn percent_encode(s: &str) -> String {
    s.bytes()
        .map(|b| match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'.' | b'_' | b'~' => (b as char).to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect()
}

fn totp_uri(username: &str, secret_b32: &str) -> String {
    format!(
        "otpauth://totp/{issuer}:{user}?secret={secret_b32}&issuer={issuer}&algorithm=SHA1&digits={TOTP_DIGITS}&period={TOTP_STEP}",
        issuer = TOTP_ISSUER,
        user = percent_encode(username)
    )
}

// Секрет TOTP в БД — только AES-256-GCM под ключом сервера; AAD привязывает шифртекст к пользователю
fn seal_totp_secret(key: &[u8; 32], user_id: i64, secret: &[u8]) -> Result<String, AppError> {
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
    let mut nonce = [0u8; 12];
    OsRng.fill_bytes(&mut nonce);
    let aad = format!("totp|{user_id}");
    let ct = cipher
        .encrypt(Nonce::from_slice(&nonce), Payload { msg: secret, aad: aad.as_bytes() })
        .map_err(|_| internal_error())?;
    Ok(format!("v1:{}:{}", hex::encode(nonce), hex::encode(ct)))
}

fn open_totp_secret(key: &[u8; 32], user_id: i64, sealed: &str) -> Option<Vec<u8>> {
    let mut parts = sealed.split(':');
    if parts.next() != Some("v1") {
        return None;
    }
    let nonce = hex::decode(parts.next()?).ok().filter(|n| n.len() == 12)?;
    let ct = hex::decode(parts.next()?).ok()?;
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
    let aad = format!("totp|{user_id}");
    cipher
        .decrypt(Nonce::from_slice(&nonce), Payload { msg: &ct, aad: aad.as_bytes() })
        .ok()
}

// Введённый код: без пробелов и дефисов, буквы заглавные (резервные коды — base32)
fn normalize_code(code: &str) -> String {
    code.chars()
        .filter(|c| !c.is_whitespace() && *c != '-')
        .collect::<String>()
        .to_ascii_uppercase()
}

// В БД — только HMAC резервного кода под ключом сервера
fn backup_code_hash(key: &[u8; 32], normalized: &str) -> String {
    hex::encode(hmac_sha256(key, format!("backup|{normalized}").as_bytes()))
}

// Случайные коды по 80 бит; для показа — группы по 4 символа через дефис
fn generate_backup_codes() -> Vec<String> {
    (0..BACKUP_CODES_COUNT)
        .map(|_| {
            let mut b = [0u8; BACKUP_CODE_BYTES];
            OsRng.fill_bytes(&mut b);
            let s = base32_encode(&b);
            s.as_bytes()
                .chunks(4)
                .map(|c| String::from_utf8_lossy(c).into_owned())
                .collect::<Vec<_>>()
                .join("-")
        })
        .collect()
}

// Ошибка БД — это ошибка, а не «TOTP выключен»: иначе сбой запроса пропускал бы вход без второго фактора
fn totp_enabled(conn: &Connection, user_id: i64) -> Result<bool, AppError> {
    conn.query_row(
        "SELECT 1 FROM user_totp WHERE user_id = ?1 AND enabled = 1",
        params![user_id],
        |_| Ok(()),
    )
    .optional()
    .map(|r| r.is_some())
    .map_err(|_| internal_error())
}

// Второй фактор: 6 цифр — код TOTP (шаг запоминается, повтор не пройдёт), иначе — резервный код
// (удаляется при использовании). Обновления условные: два параллельных запроса с одним кодом не пройдут оба
fn verify_second_factor(conn: &Connection, key: &[u8; 32], user_id: i64, code: &str, now: i64) -> bool {
    let norm = normalize_code(code);
    if norm.is_empty() || norm.len() > 64 || !totp_enabled(conn, user_id).unwrap_or(false) {
        return false;
    }
    if norm.len() == TOTP_DIGITS as usize && norm.bytes().all(|b| b.is_ascii_digit()) {
        let row: Option<(String, i64)> = conn
            .query_row(
                "SELECT secret_enc, last_step FROM user_totp WHERE user_id = ?1 AND enabled = 1",
                params![user_id],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .optional()
            .unwrap_or(None);
        let Some((sealed, last_step)) = row else { return false };
        let Some(secret) = open_totp_secret(key, user_id, &sealed) else { return false };
        match totp_match(&secret, &norm, now, last_step) {
            Some(step) => conn
                .execute(
                    "UPDATE user_totp SET last_step = ?1 WHERE user_id = ?2 AND enabled = 1 AND last_step < ?1",
                    params![step, user_id],
                )
                .map(|n| n == 1)
                .unwrap_or(false),
            None => false,
        }
    } else {
        conn.execute(
            "DELETE FROM totp_backup_codes WHERE user_id = ?1 AND code_hash = ?2",
            params![user_id, backup_code_hash(key, &norm)],
        )
        .map(|n| n == 1)
        .unwrap_or(false)
    }
}

// Полное отключение TOTP: настройки, резервные коды и ожидающие второго шага входы
fn remove_totp(state: &AppState, conn: &Connection, user_id: i64) {
    let _ = conn.execute("DELETE FROM user_totp WHERE user_id = ?1", params![user_id]);
    let _ = conn.execute("DELETE FROM totp_backup_codes WHERE user_id = ?1", params![user_id]);
    state.totp_challenges.lock().unwrap().retain(|_, c| c.user_id != user_id);
}

fn purge_expired_invites(conn: &Connection) {
    let _ = conn.execute("DELETE FROM invites WHERE expires_at < ?1", params![now_ts()]);
}

fn add_log(state: &AppState, level: &str, action: &str, detail: &str, user: &str) {
    let mut logs = state.logs.lock().unwrap();
    if logs.len() >= 300 {
        logs.pop_back();
    }
    logs.push_front(LogEntry {
        id: random_hex(4),
        ts: Local::now().format("%H:%M:%S").to_string(),
        level: level.to_string(),
        user: user.to_string(),
        action: action.to_string(),
        detail: detail.to_string(),
    });
}

// Подсеть доверенного прокси: адрес и длина префикса
#[derive(Clone, Copy, Debug, PartialEq)]
struct Cidr(IpAddr, u8);

impl Cidr {
    fn contains(&self, ip: IpAddr) -> bool {
        match (self.0, ip.to_canonical()) {
            (IpAddr::V4(net), IpAddr::V4(a)) => {
                let mask = u32::MAX.checked_shl(32 - self.1 as u32).unwrap_or(0);
                u32::from(net) & mask == u32::from(a) & mask
            }
            (IpAddr::V6(net), IpAddr::V6(a)) => {
                let mask = u128::MAX.checked_shl(128 - self.1 as u32).unwrap_or(0);
                u128::from(net) & mask == u128::from(a) & mask
            }
            _ => false,
        }
    }
}

// Loopback и частные сети: обратный прокси на том же хосте или шлюз Docker
const DEFAULT_TRUSTED_PROXIES: &str = "127.0.0.0/8, ::1/128, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7";

// TRUSTED_PROXIES: список адресов или подсетей через запятую или пробел; пусто — значения по умолчанию,
// "none" — X-Forwarded-For не учитывается вовсе
fn parse_trusted_proxies(spec: Option<&str>) -> Result<Vec<Cidr>, String> {
    let spec = match spec.map(str::trim) {
        None | Some("") => DEFAULT_TRUSTED_PROXIES,
        Some(s) if s.eq_ignore_ascii_case("none") => return Ok(vec![]),
        Some(s) => s,
    };
    spec.split(|c: char| c == ',' || c.is_whitespace())
        .filter(|s| !s.is_empty())
        .map(|item| {
            let (addr, len) = item.split_once('/').unwrap_or((item, ""));
            let ip: IpAddr = addr.parse().map_err(|_| item.to_string())?;
            let max = if ip.is_ipv4() { 32 } else { 128 };
            let len = if len.is_empty() { max } else { len.parse::<u8>().map_err(|_| item.to_string())? };
            if len > max {
                return Err(item.to_string());
            }
            Ok(Cidr(ip, len))
        })
        .collect()
}

// Сервер стоит за обратным прокси, поэтому адрес соединения — это прокси/шлюз Docker.
// Настоящий IP клиента прокси дописывает в КОНЕЦ X-Forwarded-For; всё левее присылает сам клиент.
// Заголовку верим, только если соединение пришло от доверенного прокси: иначе его подделает кто угодно.
fn client_ip(headers: &HeaderMap, peer: IpAddr, trusted: &[Cidr]) -> IpAddr {
    if !trusted.iter().any(|c| c.contains(peer)) {
        return peer;
    }
    headers
        .get_all("x-forwarded-for")
        .iter()
        .last()
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.rsplit(',').next())
        .and_then(|s| s.trim().parse::<IpAddr>().ok())
        .unwrap_or(peer)
}

// Ключ для лимитера: IPv6 группируется по /64, иначе перебор обходится сменой адреса внутри сети
fn ip_key(ip: IpAddr) -> String {
    match ip.to_canonical() {
        IpAddr::V4(v4) => v4.to_string(),
        IpAddr::V6(v6) => {
            let s = v6.segments();
            format!("{:x}:{:x}:{:x}:{:x}::/64", s[0], s[1], s[2], s[3])
        }
    }
}

fn client_key(state: &AppState, headers: &HeaderMap, peer: IpAddr) -> String {
    ip_key(client_ip(headers, peer, &state.trusted_proxies))
}

fn user_key_part(uname: &str) -> String {
    uname.chars().take(64).collect()
}

// Скользящее окно: хранятся метки времени попыток по ключу. Отклонённые запросы не пишутся,
// поэтому блокировка заканчивается ровно через окно после самой ранней учтённой попытки.
#[derive(Default)]
struct RateLimiter {
    events: HashMap<String, VecDeque<i64>>,
}

impl RateLimiter {
    // Ok — попытка учтена; Err(секунды до освобождения) — лимит исчерпан
    fn hit(&mut self, key: &str, limit: usize, window: i64, now: i64) -> Result<(), i64> {
        if self.events.len() >= RATE_MAX_KEYS {
            self.sweep(now);
        }
        let q = self.events.entry(key.to_string()).or_default();
        while q.front().is_some_and(|&t| t <= now - window) {
            q.pop_front();
        }
        if q.len() >= limit {
            return Err((q[0] + window - now).max(1));
        }
        q.push_back(now);
        Ok(())
    }

    fn reset(&mut self, key: &str) {
        self.events.remove(key);
    }

    // Окна у ключей разные, но не длиннее RATE_WINDOW: всё старше него уже не влияет
    fn sweep(&mut self, now: i64) {
        self.events
            .retain(|_, q| q.back().is_some_and(|&t| t > now - RATE_WINDOW));
    }
}

fn rate_limit(state: &AppState, key: &str, limit: usize, window: i64) -> Result<(), AppError> {
    let res = state.limiter.lock().unwrap().hit(key, limit, window, now_ts());
    res.map_err(|wait| {
        AppError(
            StatusCode::TOO_MANY_REQUESTS,
            "too_many_attempts",
            Some(serde_json::json!({ "minutes": wait / 60 + 1 })),
        )
    })
}

fn bearer_token(headers: &HeaderMap) -> Option<&str> {
    headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|a| a.strip_prefix("Bearer "))
}

fn require_user(state: &AppState, headers: &HeaderMap) -> Result<SessionInfo, AppError> {
    let token = bearer_token(headers)
        .ok_or_else(|| err(StatusCode::UNAUTHORIZED, "auth_required"))?;
    let now = now_ts();
    let mut sessions = state.sessions.lock().unwrap();
    if let Some(sess) = sessions.get_mut(token) {
        // Скользящий idle-срок плюс абсолютный срок от входа
        if sess.exp >= now && now - sess.created < SESSION_ABS_TTL {
            sess.exp = now + SESSION_TTL;
            return Ok(sess.clone());
        }
    }
    sessions.remove(token);
    Err(err(StatusCode::UNAUTHORIZED, "session_expired"))
}

fn require_admin(state: &AppState, headers: &HeaderMap) -> Result<SessionInfo, AppError> {
    let sess = require_user(state, headers)?;
    if !sess.is_admin {
        return Err(err(StatusCode::FORBIDDEN, "admin_only"));
    }
    Ok(sess)
}

// Отзыв всех сессий пользователя, кроме keep (текущая сессия при смене своего пароля)
fn revoke_user_sessions(state: &AppState, user_id: i64, keep: Option<&str>) -> usize {
    let mut sessions = state.sessions.lock().unwrap();
    let before = sessions.len();
    sessions.retain(|tok, s| s.user_id != user_id || keep == Some(tok.as_str()));
    before - sessions.len()
}

// Периодическая чистка, чтобы карты сессий и лимитера не росли бесконечно
fn sweep_state(state: &AppState, now: i64) {
    state
        .sessions
        .lock()
        .unwrap()
        .retain(|_, s| s.exp >= now && now - s.created < SESSION_ABS_TTL);
    state.limiter.lock().unwrap().sweep(now);
    state.totp_challenges.lock().unwrap().retain(|_, c| c.exp >= now);
}

fn internal_error() -> AppError {
    err(StatusCode::INTERNAL_SERVER_ERROR, "internal")
}

// Argon2id тяжёлый: считаем вне async-рантайма и не больше N вычислений одновременно
async fn run_argon<T, F>(state: &AppState, f: F) -> Result<T, AppError>
where
    F: FnOnce() -> T + Send + 'static,
    T: Send + 'static,
{
    let permit = state
        .argon_sem
        .clone()
        .acquire_owned()
        .await
        .map_err(|_| internal_error())?;
    tokio::task::spawn_blocking(move || {
        let out = f();
        drop(permit);
        out
    })
    .await
    .map_err(|_| internal_error())
}

async fn hash_auth_key_async(state: &AppState, auth_key: &str) -> Result<String, AppError> {
    if !is_valid_auth_key(auth_key) {
        return Err(err(StatusCode::BAD_REQUEST, "invalid_auth_key"));
    }
    let key = auth_key.to_owned();
    run_argon(state, move || hash_auth_key(&key)).await?
}

async fn verify_auth_key_async(state: &AppState, auth_key: &str, verifier: &str) -> Result<bool, AppError> {
    if !is_valid_auth_key(auth_key) {
        return Ok(false);
    }
    let (key, ver) = (auth_key.to_owned(), verifier.to_owned());
    run_argon(state, move || verify_auth_key(&key, &ver)).await
}

// Защитные заголовки на все ответы.
// Оставшиеся послабления CSP: 'unsafe-eval' в script-src (Vue компилирует in-DOM шаблоны через new Function)
// и 'unsafe-inline' только для атрибутов style (style-src-attr).
const CSP: &str = "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self'; style-src-attr 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self' https://api.pwnedpasswords.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

async fn security_headers_middleware(req: Request, next: Next) -> Response {
    let is_api = req.uri().path().starts_with("/api/");
    let mut res = next.run(req).await;
    let h = res.headers_mut();
    if is_api {
        h.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    }
    h.insert(header::CONTENT_SECURITY_POLICY, HeaderValue::from_static(CSP));
    h.insert(header::X_FRAME_OPTIONS, HeaderValue::from_static("DENY"));
    h.insert(header::X_CONTENT_TYPE_OPTIONS, HeaderValue::from_static("nosniff"));
    h.insert(header::REFERRER_POLICY, HeaderValue::from_static("no-referrer"));
    h.insert(
        header::STRICT_TRANSPORT_SECURITY,
        HeaderValue::from_static("max-age=31536000"),
    );
    h.insert(
        HeaderName::from_static("permissions-policy"),
        HeaderValue::from_static("camera=(), microphone=(), geolocation=()"),
    );
    res
}

fn init_db(db_path: &str) -> Connection {
    if let Some(parent) = FsPath::new(db_path).parent() {
        let _ = fs::create_dir_all(parent);
    }
    let conn = Connection::open(db_path).expect("Не удалось открыть SQLite базу");
    conn.execute_batch(
        "
        PRAGMA journal_mode=WAL;
        PRAGMA foreign_keys=ON;

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            is_admin INTEGER DEFAULT 0,
            kdf_version INTEGER NOT NULL DEFAULT 2,
            kdf_salt TEXT NOT NULL,
            server_auth_verifier TEXT NOT NULL,
            encrypted_vault_key TEXT NOT NULL,
            recovery_salt TEXT NOT NULL,
            recovery_auth_verifier TEXT NOT NULL,
            recovery_encrypted_vault_key TEXT NOT NULL,
            encrypted_family_key TEXT,
            admin_escrow_vault_key TEXT,
            encrypted_escrow_private_key TEXT,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS vault_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER NOT NULL,
            scope TEXT NOT NULL CHECK(scope IN ('personal', 'family')),
            category TEXT DEFAULT 'general',
            is_favorite INTEGER DEFAULT 0,
            is_trashed INTEGER DEFAULT 0,
            trashed_at INTEGER DEFAULT NULL,
            ciphertext TEXT NOT NULL,
            iv TEXT NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS invites (
            id_hash TEXT PRIMARY KEY,
            encrypted_family_key_for_invite TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            created_by INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS server_meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        -- TOTP: секрет зашифрован ключом сервера; enabled = 0 — включение начато, код ещё не подтверждён
        CREATE TABLE IF NOT EXISTS user_totp (
            user_id INTEGER PRIMARY KEY,
            secret_enc TEXT NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 0,
            last_step INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- Резервные коды: только HMAC, использованный код удаляется
        CREATE TABLE IF NOT EXISTS totp_backup_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            code_hash TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_totp_backup_user ON totp_backup_codes(user_id);
        ",
    )
    .expect("Ошибка инициализации схемы БД");

    // Старую БД (v1) не трогаем: схема несовместима, данные переносятся импортом из JSON
    let mut has_kdf_version = false;
    let mut has_invite_id_hash = false;
    for (table, col, flag) in [
        ("users", "kdf_version", &mut has_kdf_version),
        ("invites", "id_hash", &mut has_invite_id_hash),
    ] {
        if let Ok(mut stmt) = conn.prepare(&format!("PRAGMA table_info({});", table)) {
            if let Ok(rows) = stmt.query_map([], |row| row.get::<_, String>(1)) {
                *flag = rows.flatten().any(|c| c == col);
            }
        }
    }
    if !has_kdf_version || !has_invite_id_hash {
        panic!(
            "БД {} создана старой версией (kdf v1). Укажите DB_PATH на новый файл, например /app/data/vault-v2.db",
            db_path
        );
    }

    conn
}

#[derive(Deserialize)]
struct RegisterRequest {
    username: String,
    kdf_salt: String,
    client_auth_hash: String,
    encrypted_vault_key: String,
    recovery_salt: String,
    recovery_auth_hash: String,
    recovery_encrypted_vault_key: String,
    encrypted_family_key: String,
    admin_escrow_vault_key: Option<String>,
    // Только у первого пользователя (админа): приватный ECDH-ключ escrow, обёрнутый его ключом сейфа
    encrypted_escrow_private_key: Option<String>,
    invite_id: Option<String>,
    // Только для первой регистрации, если на сервере задан SETUP_TOKEN
    setup_token: Option<String>,
}

#[derive(Deserialize)]
struct InviteLookupRequest {
    invite_id: String,
}

#[derive(Deserialize)]
struct LoginRequest {
    username: String,
    client_auth_hash: String,
}

#[derive(Deserialize)]
struct ChangePasswordRequest {
    current_client_auth_hash: String,
    new_kdf_salt: String,
    new_client_auth_hash: String,
    new_encrypted_vault_key: String,
    new_recovery_salt: Option<String>,
    new_recovery_auth_hash: Option<String>,
    new_recovery_encrypted_vault_key: Option<String>,
}

#[derive(Deserialize)]
struct VaultItemCreate {
    scope: String,
    #[serde(default = "default_category")]
    category: String,
    #[serde(default)]
    is_favorite: bool,
    #[serde(default)]
    is_trashed: bool,
    ciphertext: String,
    iv: String,
}

fn default_category() -> String {
    "general".to_string()
}

#[derive(Deserialize)]
struct BatchImportRequest {
    items: Vec<VaultItemCreate>,
}

#[derive(Deserialize)]
struct BatchDeleteRequest {
    ids: Vec<i64>,
}

#[derive(Deserialize)]
struct RecoveryResetRequest {
    username: String,
    recovery_auth_hash: String,
    new_kdf_salt: String,
    new_client_auth_hash: String,
    new_encrypted_vault_key: String,
}

#[derive(Deserialize)]
struct AdminCreateInviteRequest {
    invite_id: String,
    encrypted_family_key_for_invite: String,
    #[serde(default = "default_ttl")]
    ttl_minutes: i64,
}

fn default_ttl() -> i64 {
    60
}

#[derive(Deserialize)]
struct AdminResetMemberRequest {
    target_user_id: i64,
    new_kdf_salt: String,
    new_client_auth_hash: String,
    new_encrypted_vault_key: String,
}

fn bad_request(code: &'static str) -> AppError {
    err(StatusCode::BAD_REQUEST, code)
}

fn check_blob_lens(fields: &[&str]) -> Result<(), AppError> {
    if fields.iter().any(|f| f.len() > MAX_BLOB_LEN) {
        return Err(bad_request("field_too_long"));
    }
    Ok(())
}

fn check_username_len(uname: &str) -> Result<(), AppError> {
    if uname.chars().count() > MAX_USERNAME_LEN {
        return Err(bad_request("username_too_long"));
    }
    Ok(())
}

fn validate_item(item: &VaultItemCreate) -> Result<(), AppError> {
    if item.scope != "personal" && item.scope != "family" {
        return Err(bad_request("bad_scope"));
    }
    if item.category.len() > MAX_CATEGORY_LEN || item.iv.len() > MAX_IV_LEN || item.ciphertext.len() > MAX_CIPHERTEXT_LEN {
        return Err(bad_request("item_field_too_long"));
    }
    Ok(())
}

fn check_item_quota(conn: &Connection, user_id: i64, adding: usize) -> Result<(), AppError> {
    let have: i64 = conn
        .query_row("SELECT COUNT(*) FROM vault_items WHERE owner_id = ?1", params![user_id], |r| r.get(0))
        .unwrap_or(0);
    if have + adding as i64 > MAX_ITEMS_PER_USER {
        return Err(err(StatusCode::PAYLOAD_TOO_LARGE, "item_limit"));
    }
    Ok(())
}

// Квоты по объёму (в байтах): personal — на владельца, family — общая на все семейные записи.
// add_* — сколько байт добавляется, exclude — запись, которую заменяет обновление (её старый размер не считается).
// Вызывать внутри транзакции вместе с записью, чтобы параллельные запросы не обходили квоту.
fn check_bytes_quota(
    conn: &Connection,
    owner_id: i64,
    add_personal: usize,
    add_family: usize,
    exclude: Option<i64>,
) -> Result<(), AppError> {
    // CAST AS BLOB: LENGTH для TEXT считает символы и обрывается на NUL, а квота — в байтах, как len() в Rust
    let used = |sql: &str, p: &[&dyn rusqlite::ToSql]| -> Result<i64, AppError> {
        conn.query_row(sql, p, |r| r.get(0))
            .map_err(|_| err(StatusCode::INTERNAL_SERVER_ERROR, "internal"))
    };
    let excl = exclude.unwrap_or(-1);
    let limit_mib = MAX_BYTES_PER_USER / 1024 / 1024;
    if add_personal > 0 {
        let have = used(
            "SELECT COALESCE(SUM(LENGTH(CAST(ciphertext AS BLOB))), 0) FROM vault_items
             WHERE owner_id = ?1 AND scope = 'personal' AND id != ?2",
            params![owner_id, excl],
        )?;
        if have + add_personal as i64 > MAX_BYTES_PER_USER {
            return Err(AppError(
                StatusCode::PAYLOAD_TOO_LARGE,
                "personal_quota",
                Some(serde_json::json!({ "mib": limit_mib })),
            ));
        }
    }
    if add_family > 0 {
        let have = used(
            "SELECT COALESCE(SUM(LENGTH(CAST(ciphertext AS BLOB))), 0) FROM vault_items
             WHERE scope = 'family' AND id != ?1",
            params![excl],
        )?;
        if have + add_family as i64 > MAX_BYTES_PER_USER {
            return Err(AppError(
                StatusCode::PAYLOAD_TOO_LARGE,
                "family_quota",
                Some(serde_json::json!({ "mib": limit_mib })),
            ));
        }
    }
    Ok(())
}

// Разбивка размера записи по областям для check_bytes_quota
fn split_bytes(scope: &str, len: usize) -> (usize, usize) {
    if scope == "family" { (0, len) } else { (len, 0) }
}

async fn api_status(State(state): State<Arc<AppState>>) -> Result<Json<serde_json::Value>, AppError> {
    let cnt: i64 = {
        let conn = state.db.lock().unwrap();
        conn.query_row("SELECT COUNT(*) FROM users", [], |r| r.get(0))
            .unwrap_or(0)
    };
    // Без входа — только то, что нужно экрану входа: число пользователей и версию не раскрываем
    Ok(Json(serde_json::json!({
        "initialized": cnt > 0,
        "setup_token_required": cnt == 0 && state.setup_token.is_some()
    })))
}

async fn api_get_logs(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let _sess = require_admin(&state, &headers)?;
    let logs: Vec<LogEntry> = state.logs.lock().unwrap().iter().cloned().collect();
    Ok(Json(serde_json::json!({ "logs": logs })))
}

async fn api_clear_logs(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_admin(&state, &headers)?;
    state.logs.lock().unwrap().clear();
    add_log(&state, "INFO", "LOGS_CLEARED", "Log cleared", &sess.username);
    Ok(Json(serde_json::json!({ "status": "ok" })))
}

async fn api_auth_params(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    Path(username): Path<String>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let ip = client_key(&state, &headers, peer.ip());
    rate_limit(&state, &format!("params:ip:{ip}"), PARAMS_IP_LIMIT, PARAMS_WINDOW)?;
    let uname = username.trim().to_lowercase();
    let row: Option<(String, String)> = {
        let conn = state.db.lock().unwrap();
        conn.query_row(
            "SELECT kdf_salt, recovery_salt FROM users WHERE username = ?1",
            params![uname],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()
        .unwrap_or(None)
    };

    if let Some((kdf_salt, recovery_salt)) = row {
        Ok(Json(serde_json::json!({
            "kdf_salt": kdf_salt,
            "recovery_salt": recovery_salt
        })))
    } else {
        // Соли разные и стабильные для имени, но без секрета сервера их не вычислить:
        // по ответу нельзя отличить несуществующий логин от настоящего
        Ok(Json(serde_json::json!({
            "kdf_salt": fake_salt(&state.fake_salt_secret, "kdf", &uname),
            "recovery_salt": fake_salt(&state.fake_salt_secret, "recovery", &uname)
        })))
    }
}

async fn api_invite_lookup(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(req): Json<InviteLookupRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let ip = client_key(&state, &headers, peer.ip());
    rate_limit(&state, &format!("invite:ip:{ip}"), INVITE_IP_LIMIT, RATE_WINDOW)?;
    let row: Option<String> = {
        let conn = state.db.lock().unwrap();
        purge_expired_invites(&conn);
        conn.query_row(
            "SELECT encrypted_family_key_for_invite FROM invites WHERE id_hash = ?1 AND expires_at >= ?2",
            params![invite_lookup_hash(&req.invite_id), now_ts()],
            |r| r.get(0),
        )
        .optional()
        .unwrap_or(None)
    };

    match row {
        Some(fam_key) => Ok(Json(serde_json::json!({
            "encrypted_family_key_for_invite": fam_key
        }))),
        None => Err(err(StatusCode::NOT_FOUND, "invite_not_found")),
    }
}

async fn api_register(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(req): Json<RegisterRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let ip = client_key(&state, &headers, peer.ip());
    rate_limit(&state, &format!("register:ip:{ip}"), REGISTER_IP_LIMIT, RATE_WINDOW)?;
    let uname = req.username.trim().to_lowercase();
    if uname.len() < 2 {
        return Err(err(StatusCode::BAD_REQUEST, "username_too_short"));
    }
    check_username_len(&uname)?;
    check_blob_lens(&[
        &req.kdf_salt,
        &req.encrypted_vault_key,
        &req.recovery_salt,
        &req.recovery_encrypted_vault_key,
        &req.encrypted_family_key,
        req.admin_escrow_vault_key.as_deref().unwrap_or(""),
        req.encrypted_escrow_private_key.as_deref().unwrap_or(""),
        req.invite_id.as_deref().unwrap_or(""),
    ])?;
    if !is_valid_auth_key(&req.client_auth_hash) || !is_valid_auth_key(&req.recovery_auth_hash) {
        return Err(err(StatusCode::BAD_REQUEST, "invalid_auth_key"));
    }
    let invite_id = req.invite_id.as_deref().unwrap_or("");

    // Дешёвые проверки и инвайт — до Argon2id: без действующего инвайта нагрузить CPU нельзя
    let is_first = {
        let conn = state.db.lock().unwrap();
        let total_users: i64 = conn
            .query_row("SELECT COUNT(*) FROM users", [], |r| r.get(0))
            .unwrap_or(0);
        let is_first = total_users == 0;
        if is_first {
            if let Some(expected) = &state.setup_token {
                if !ct_eq(req.setup_token.as_deref().unwrap_or("").trim(), expected.trim()) {
                    return Err(err(StatusCode::FORBIDDEN, "setup_token_invalid"));
                }
            }
            if req.encrypted_escrow_private_key.as_deref().unwrap_or("").is_empty() {
                return Err(err(StatusCode::BAD_REQUEST, "no_admin_escrow_key"));
            }
        } else {
            purge_expired_invites(&conn);
            if invite_id.is_empty() {
                return Err(err(StatusCode::FORBIDDEN, "invite_required"));
            }
            let valid = conn
                .query_row(
                    "SELECT 1 FROM invites WHERE id_hash = ?1 AND expires_at >= ?2",
                    params![invite_lookup_hash(invite_id), now_ts()],
                    |r| r.get::<_, i64>(0),
                )
                .optional()
                .unwrap_or(None)
                .is_some();
            if !valid {
                return Err(err(StatusCode::FORBIDDEN, "invite_invalid"));
            }
        }
        is_first
    };

    let server_verifier = hash_auth_key_async(&state, &req.client_auth_hash).await?;
    let recovery_verifier = hash_auth_key_async(&state, &req.recovery_auth_hash).await?;

    let (user_id, is_first_admin) = {
        let conn = state.db.lock().unwrap();
        let exists: Option<i64> = conn
            .query_row("SELECT id FROM users WHERE username = ?1", params![uname], |r| r.get(0))
            .optional()
            .unwrap_or(None);
        if exists.is_some() {
            return Err(err(StatusCode::BAD_REQUEST, "user_exists"));
        }

        let total_users: i64 = conn
            .query_row("SELECT COUNT(*) FROM users", [], |r| r.get(0))
            .unwrap_or(0);
        // Пока считался Argon2id, мог зарегистрироваться другой первый пользователь
        if (total_users == 0) != is_first {
            return Err(err(StatusCode::CONFLICT, "retry_registration"));
        }

        if !is_first {
            // Удаление и есть окончательная проверка: инвайт одноразовый, повторно им не воспользоваться
            let used = conn
                .execute(
                    "DELETE FROM invites WHERE id_hash = ?1 AND expires_at >= ?2",
                    params![invite_lookup_hash(invite_id), now_ts()],
                )
                .unwrap_or(0);
            if used == 0 {
                return Err(err(StatusCode::FORBIDDEN, "invite_invalid"));
            }
        }

        conn.execute(
            "INSERT INTO users (
                username, is_admin, kdf_version, kdf_salt, server_auth_verifier,
                encrypted_vault_key, recovery_salt, recovery_auth_verifier,
                recovery_encrypted_vault_key, encrypted_family_key, admin_escrow_vault_key,
                encrypted_escrow_private_key, created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
            params![
                uname,
                if is_first { 1 } else { 0 },
                KDF_VERSION,
                req.kdf_salt,
                server_verifier,
                req.encrypted_vault_key,
                req.recovery_salt,
                recovery_verifier,
                req.recovery_encrypted_vault_key,
                req.encrypted_family_key,
                if is_first { None } else { req.admin_escrow_vault_key.clone() },
                if is_first { req.encrypted_escrow_private_key.clone() } else { None },
                now_ts()
            ],
        )
        .map_err(|_| internal_error())?;

        (conn.last_insert_rowid(), is_first)
    };

    add_log(&state, "INFO", "REGISTER", "Account created", &uname);

    Ok(Json(serde_json::json!({
        "status": "ok",
        "user_id": user_id,
        "is_admin": is_first_admin
    })))
}

async fn api_login(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(req): Json<LoginRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let ip = client_key(&state, &headers, peer.ip());
    rate_limit(&state, &format!("login:ip:{ip}"), LOGIN_IP_LIMIT, RATE_WINDOW)?;
    let uname = req.username.trim().to_lowercase();
    check_username_len(&uname)?;
    let user_key = format!("login:user:{}", user_key_part(&uname));
    rate_limit(&state, &user_key, LOGIN_USER_LIMIT, RATE_WINDOW)?;

    let row: Option<(i64, String, String)> = {
        let conn = state.db.lock().unwrap();
        conn.query_row(
            "SELECT id, username, server_auth_verifier FROM users WHERE username = ?1",
            params![uname],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .optional()
        .unwrap_or(None)
    };

    let (id, db_uname, srv_verifier) = match row {
        Some(v) => v,
        None => {
            verify_auth_key_async(&state, &req.client_auth_hash, &state.dummy_verifier).await?;
            return Err(err(StatusCode::UNAUTHORIZED, "bad_credentials"));
        }
    };

    if !verify_auth_key_async(&state, &req.client_auth_hash, &srv_verifier).await? {
        return Err(err(StatusCode::UNAUTHORIZED, "bad_credentials"));
    }

    // Включён TOTP: пароль верный, но сессии ещё нет — нужен второй шаг с одноразовым challenge.
    // Счётчик по логину сбросится только после второго шага
    let needs_totp = totp_enabled(&state.db.lock().unwrap(), id)?;
    if needs_totp {
        let challenge = random_hex(32);
        let now = now_ts();
        let mut ch = state.totp_challenges.lock().unwrap();
        if ch.len() >= TOTP_MAX_CHALLENGES {
            ch.retain(|_, c| c.exp >= now);
        }
        ch.insert(
            hex::encode(Sha256::digest(challenge.as_bytes())),
            TotpChallenge { user_id: id, username: db_uname, exp: now + TOTP_CHALLENGE_TTL, fails: 0 },
        );
        return Ok(Json(serde_json::json!({ "totp_required": true, "challenge": challenge })));
    }

    // Счётчик по логину сбрасывается; по IP — нет, иначе вход в свой аккаунт обнулял бы перебор чужих
    state.limiter.lock().unwrap().reset(&user_key);
    issue_session(&state, id)
}

// Сессия и данные для расшифровки сейфа на клиенте: ответ и первого, и второго шага входа
fn issue_session(state: &AppState, id: i64) -> Result<Json<serde_json::Value>, AppError> {
    let (db_uname, is_admin_int, kdf_salt, enc_escrow_priv, enc_vk, enc_fk, escrow) = {
        let conn = state.db.lock().unwrap();
        conn.query_row(
            "SELECT username, is_admin, kdf_salt, encrypted_escrow_private_key,
                    encrypted_vault_key, encrypted_family_key, admin_escrow_vault_key
             FROM users WHERE id = ?1",
            params![id],
            |r| {
                Ok((
                    r.get::<_, String>(0)?,
                    r.get::<_, i64>(1)?,
                    r.get::<_, String>(2)?,
                    r.get::<_, Option<String>>(3)?,
                    r.get::<_, String>(4)?,
                    r.get::<_, Option<String>>(5)?,
                    r.get::<_, Option<String>>(6)?,
                ))
            },
        )
        .map_err(|_| internal_error())?
    };
    let token = random_hex(32);
    let is_admin = is_admin_int != 0;

    let now = now_ts();
    state.sessions.lock().unwrap().insert(
        token.clone(),
        SessionInfo {
            user_id: id,
            username: db_uname.clone(),
            is_admin,
            created: now,
            exp: now + SESSION_TTL,
        },
    );
    add_log(&state, "INFO", "LOGIN_OK", "Signed in", &db_uname);

    Ok(Json(serde_json::json!({
        "token": token,
        "username": db_uname,
        "is_admin": is_admin,
        "kdf_salt": kdf_salt,
        "encrypted_vault_key": enc_vk,
        "encrypted_family_key": enc_fk,
        "encrypted_escrow_private_key": if is_admin { enc_escrow_priv } else { None },
        "has_admin_escrow": escrow.is_some()
    })))
}

async fn api_change_password(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(req): Json<ChangePasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    let ip = client_key(&state, &headers, peer.ip());
    rate_limit(&state, &format!("chpw:ip:{ip}"), CHPW_IP_LIMIT, RATE_WINDOW)?;
    let user_key = format!("chpw:user:{}", sess.user_id);
    rate_limit(&state, &user_key, CHPW_USER_LIMIT, RATE_WINDOW)?;
    check_blob_lens(&[
        &req.new_kdf_salt,
        &req.new_encrypted_vault_key,
        req.new_recovery_salt.as_deref().unwrap_or(""),
        req.new_recovery_encrypted_vault_key.as_deref().unwrap_or(""),
    ])?;
    let srv_verifier: String = {
        let conn = state.db.lock().unwrap();
        conn.query_row(
            "SELECT server_auth_verifier FROM users WHERE id = ?1",
            params![sess.user_id],
            |r| r.get(0),
        )
        .optional()
        .unwrap_or(None)
        .ok_or_else(|| err(StatusCode::NOT_FOUND, "user_not_found"))?
    };

    if !verify_auth_key_async(&state, &req.current_client_auth_hash, &srv_verifier).await? {
        return Err(err(StatusCode::UNAUTHORIZED, "wrong_current_password"));
    }

    state.limiter.lock().unwrap().reset(&user_key);

    // Новый verifier — с новой солью Argon2id
    let new_srv_verifier = hash_auth_key_async(&state, &req.new_client_auth_hash).await?;
    let new_rec_verifier = match &req.new_recovery_auth_hash {
        Some(h) => Some(hash_auth_key_async(&state, h).await?),
        None => None,
    };

    {
        let conn = state.db.lock().unwrap();
        if let (Some(rec_salt), Some(new_rec_verifier), Some(rec_vk)) = (
            &req.new_recovery_salt,
            &new_rec_verifier,
            &req.new_recovery_encrypted_vault_key,
        ) {
            let _ = conn.execute(
                "UPDATE users
                 SET kdf_salt = ?1, server_auth_verifier = ?2, encrypted_vault_key = ?3,
                     recovery_salt = ?4, recovery_auth_verifier = ?5, recovery_encrypted_vault_key = ?6
                 WHERE id = ?7",
                params![
                    req.new_kdf_salt,
                    new_srv_verifier,
                    req.new_encrypted_vault_key,
                    rec_salt,
                    new_rec_verifier,
                    rec_vk,
                    sess.user_id
                ],
            );
        } else {
            let _ = conn.execute(
                "UPDATE users SET kdf_salt = ?1, server_auth_verifier = ?2, encrypted_vault_key = ?3 WHERE id = ?4",
                params![req.new_kdf_salt, new_srv_verifier, req.new_encrypted_vault_key, sess.user_id],
            );
        }
    }

    // Остальные сессии (в том числе украденные) перестают действовать; текущая остаётся.
    // Ожидающие второго шага входы прошли проверку старого пароля — тоже аннулируются
    revoke_user_sessions(&state, sess.user_id, bearer_token(&headers));
    state.totp_challenges.lock().unwrap().retain(|_, c| c.user_id != sess.user_id);
    add_log(&state, "INFO", "PASS_CHANGED", "Master password changed", &sess.username);
    Ok(Json(serde_json::json!({ "status": "ok" })))
}

async fn api_logout(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Json<serde_json::Value> {
    if let Some(token) = bearer_token(&headers) {
        state.sessions.lock().unwrap().remove(token);
    }
    Json(serde_json::json!({ "status": "ok" }))
}

#[derive(Deserialize)]
struct LoginTotpRequest {
    challenge: String,
    code: String,
}

#[derive(Deserialize)]
struct TotpSetupRequest {
    client_auth_hash: String,
}

#[derive(Deserialize)]
struct TotpEnableRequest {
    code: String,
}

#[derive(Deserialize)]
struct TotpDisableRequest {
    client_auth_hash: String,
    code: String,
}

// Второй шаг входа: challenge из /api/auth/login и код TOTP или резервный код
async fn api_login_totp(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(req): Json<LoginTotpRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let ip = client_key(&state, &headers, peer.ip());
    rate_limit(&state, &format!("totp:ip:{ip}"), TOTP_IP_LIMIT, RATE_WINDOW)?;
    check_blob_lens(&[&req.challenge, &req.code])?;
    let key = hex::encode(Sha256::digest(req.challenge.as_bytes()));
    let now = now_ts();

    let (uid, uname) = {
        let mut ch = state.totp_challenges.lock().unwrap();
        match ch.get(&key) {
            Some(c) if c.exp >= now => (c.user_id, c.username.clone()),
            _ => {
                ch.remove(&key);
                return Err(err(StatusCode::UNAUTHORIZED, "totp_challenge_expired"));
            }
        }
    };
    let user_key = format!("totp:user:{uid}");
    rate_limit(&state, &user_key, TOTP_USER_LIMIT, RATE_WINDOW)?;

    let ok = verify_second_factor(&state.db.lock().unwrap(), &state.totp_key, uid, &req.code, now);
    {
        let mut ch = state.totp_challenges.lock().unwrap();
        if !ok {
            // После TOTP_CHALLENGE_MAX_FAILS неверных кодов challenge аннулируется: снова нужен пароль
            if let Some(c) = ch.get_mut(&key) {
                c.fails += 1;
                if c.fails >= TOTP_CHALLENGE_MAX_FAILS {
                    ch.remove(&key);
                }
            }
            return Err(err(StatusCode::UNAUTHORIZED, "bad_totp"));
        }
        // challenge одноразовый; если его уже забрал параллельный запрос — сессию не выдаём
        if ch.remove(&key).is_none() {
            return Err(err(StatusCode::UNAUTHORIZED, "totp_challenge_expired"));
        }
    }

    {
        let mut limiter = state.limiter.lock().unwrap();
        limiter.reset(&user_key);
        limiter.reset(&format!("login:user:{}", user_key_part(&uname)));
    }
    issue_session(&state, uid)
}

async fn api_totp_status(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    let conn = state.db.lock().unwrap();
    let enabled = totp_enabled(&conn, sess.user_id)?;
    let left: i64 = conn
        .query_row("SELECT COUNT(*) FROM totp_backup_codes WHERE user_id = ?1", params![sess.user_id], |r| r.get(0))
        .unwrap_or(0);
    Ok(Json(serde_json::json!({ "enabled": enabled, "backup_codes_left": if enabled { left } else { 0 } })))
}

// Повторная проверка мастер-пароля для настроек TOTP; лимиты — как у смены пароля
async fn totp_check_password(
    state: &AppState,
    headers: &HeaderMap,
    peer: SocketAddr,
    sess: &SessionInfo,
    client_auth_hash: &str,
) -> Result<(), AppError> {
    let ip = client_key(state, headers, peer.ip());
    rate_limit(state, &format!("totpcfg:ip:{ip}"), CHPW_IP_LIMIT, RATE_WINDOW)?;
    rate_limit(state, &format!("totpcfg:user:{}", sess.user_id), CHPW_USER_LIMIT, RATE_WINDOW)?;
    let srv_verifier: String = {
        let conn = state.db.lock().unwrap();
        conn.query_row(
            "SELECT server_auth_verifier FROM users WHERE id = ?1",
            params![sess.user_id],
            |r| r.get(0),
        )
        .optional()
        .unwrap_or(None)
        .ok_or_else(|| err(StatusCode::NOT_FOUND, "user_not_found"))?
    };
    if !verify_auth_key_async(state, client_auth_hash, &srv_verifier).await? {
        return Err(err(StatusCode::UNAUTHORIZED, "wrong_current_password"));
    }
    Ok(())
}

// Начало включения: новый секрет (ещё не действует), otpauth:// для QR и сам секрет для ручного ввода
async fn api_totp_setup(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(req): Json<TotpSetupRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    totp_check_password(&state, &headers, peer, &sess, &req.client_auth_hash).await?;
    let mut secret = [0u8; TOTP_SECRET_LEN];
    OsRng.fill_bytes(&mut secret);
    let sealed = seal_totp_secret(&state.totp_key, sess.user_id, &secret)?;
    {
        let conn = state.db.lock().unwrap();
        if totp_enabled(&conn, sess.user_id)? {
            return Err(err(StatusCode::CONFLICT, "totp_already_enabled"));
        }
        conn.execute(
            "INSERT OR REPLACE INTO user_totp (user_id, secret_enc, enabled, last_step, created_at)
             VALUES (?1, ?2, 0, 0, ?3)",
            params![sess.user_id, sealed, now_ts()],
        )
        .map_err(|_| internal_error())?;
    }
    let b32 = base32_encode(&secret);
    Ok(Json(serde_json::json!({ "secret": b32, "otpauth_uri": totp_uri(&sess.username, &b32) })))
}

// Завершение включения: верный код из приложения → TOTP действует, резервные коды показываются один раз
async fn api_totp_enable(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(req): Json<TotpEnableRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    let ip = client_key(&state, &headers, peer.ip());
    rate_limit(&state, &format!("totpcfg:ip:{ip}"), CHPW_IP_LIMIT, RATE_WINDOW)?;
    rate_limit(&state, &format!("totpcfg:user:{}", sess.user_id), CHPW_USER_LIMIT, RATE_WINDOW)?;
    check_blob_lens(&[&req.code])?;
    let now = now_ts();
    let mut conn = state.db.lock().unwrap();
    let pending: Option<(String, i64)> = conn
        .query_row(
            "SELECT secret_enc, created_at FROM user_totp WHERE user_id = ?1 AND enabled = 0",
            params![sess.user_id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()
        .unwrap_or(None);
    let secret = match pending {
        Some((sealed, created)) if now - created <= TOTP_SETUP_TTL => {
            open_totp_secret(&state.totp_key, sess.user_id, &sealed).ok_or_else(internal_error)?
        }
        _ => return Err(bad_request("totp_setup_required")),
    };
    let step = totp_match(&secret, &normalize_code(&req.code), now, 0)
        .ok_or_else(|| err(StatusCode::UNAUTHORIZED, "bad_totp"))?;

    let codes = generate_backup_codes();
    let tx = conn.transaction().map_err(|_| internal_error())?;
    let updated = tx
        .execute(
            "UPDATE user_totp SET enabled = 1, last_step = ?1 WHERE user_id = ?2 AND enabled = 0",
            params![step, sess.user_id],
        )
        .map_err(|_| internal_error())?;
    if updated != 1 {
        return Err(bad_request("totp_setup_required"));
    }
    tx.execute("DELETE FROM totp_backup_codes WHERE user_id = ?1", params![sess.user_id])
        .map_err(|_| internal_error())?;
    for c in &codes {
        tx.execute(
            "INSERT INTO totp_backup_codes (user_id, code_hash) VALUES (?1, ?2)",
            params![sess.user_id, backup_code_hash(&state.totp_key, &normalize_code(c))],
        )
        .map_err(|_| internal_error())?;
    }
    tx.commit().map_err(|_| internal_error())?;
    drop(conn);
    add_log(&state, "INFO", "TOTP_ENABLED", "Two-factor sign-in enabled", &sess.username);
    Ok(Json(serde_json::json!({ "status": "ok", "backup_codes": codes })))
}

// Отключение: мастер-пароль и верный код (TOTP или резервный)
async fn api_totp_disable(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(req): Json<TotpDisableRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    check_blob_lens(&[&req.code])?;
    totp_check_password(&state, &headers, peer, &sess, &req.client_auth_hash).await?;
    {
        let conn = state.db.lock().unwrap();
        if !totp_enabled(&conn, sess.user_id)? {
            return Err(bad_request("totp_not_enabled"));
        }
        if !verify_second_factor(&conn, &state.totp_key, sess.user_id, &req.code, now_ts()) {
            return Err(err(StatusCode::UNAUTHORIZED, "bad_totp"));
        }
        remove_totp(&state, &conn, sess.user_id);
    }
    add_log(&state, "INFO", "TOTP_DISABLED", "Two-factor sign-in disabled", &sess.username);
    Ok(Json(serde_json::json!({ "status": "ok" })))
}

async fn api_recovery_fetch(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(req): Json<LoginRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let ip = client_key(&state, &headers, peer.ip());
    rate_limit(&state, &format!("recovery:ip:{ip}"), RECOVERY_IP_LIMIT, RATE_WINDOW)?;
    let uname = req.username.trim().to_lowercase();
    check_username_len(&uname)?;
    rate_limit(
        &state,
        &format!("recovery:user:{}", user_key_part(&uname)),
        RECOVERY_USER_LIMIT,
        RATE_WINDOW,
    )?;

    let row: Option<(String, String)> = {
        let conn = state.db.lock().unwrap();
        conn.query_row(
            "SELECT recovery_auth_verifier, recovery_encrypted_vault_key FROM users WHERE username = ?1",
            params![uname],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()
        .unwrap_or(None)
    };

    let (rec_verifier, rec_vk) = match row {
        Some(v) => v,
        None => {
            // Тот же код и статус, что при неверном ключе: по ответу не узнать, есть ли такой логин
            verify_auth_key_async(&state, &req.client_auth_hash, &state.dummy_verifier).await?;
            return Err(err(StatusCode::UNAUTHORIZED, "bad_recovery_key"));
        }
    };

    if !verify_auth_key_async(&state, &req.client_auth_hash, &rec_verifier).await? {
        return Err(err(StatusCode::UNAUTHORIZED, "bad_recovery_key"));
    }

    Ok(Json(serde_json::json!({ "recovery_encrypted_vault_key": rec_vk })))
}

async fn api_recovery_reset(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(req): Json<RecoveryResetRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let ip = client_key(&state, &headers, peer.ip());
    rate_limit(&state, &format!("recovery:ip:{ip}"), RECOVERY_IP_LIMIT, RATE_WINDOW)?;
    let uname = req.username.trim().to_lowercase();
    check_username_len(&uname)?;
    rate_limit(
        &state,
        &format!("recovery:user:{}", user_key_part(&uname)),
        RECOVERY_USER_LIMIT,
        RATE_WINDOW,
    )?;

    check_blob_lens(&[&req.new_kdf_salt, &req.new_encrypted_vault_key])?;
    let row: Option<(i64, String)> = {
        let conn = state.db.lock().unwrap();
        conn.query_row(
            "SELECT id, recovery_auth_verifier FROM users WHERE username = ?1",
            params![uname],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()
        .unwrap_or(None)
    };

    let (uid, rec_verifier) = match row {
        Some(v) => v,
        None => {
            verify_auth_key_async(&state, &req.recovery_auth_hash, &state.dummy_verifier).await?;
            return Err(err(StatusCode::UNAUTHORIZED, "bad_recovery_key"));
        }
    };

    if !verify_auth_key_async(&state, &req.recovery_auth_hash, &rec_verifier).await? {
        return Err(err(StatusCode::UNAUTHORIZED, "bad_recovery_key"));
    }

    let new_srv_verifier = hash_auth_key_async(&state, &req.new_client_auth_hash).await?;
    {
        let conn = state.db.lock().unwrap();
        let _ = conn.execute(
            "UPDATE users SET kdf_salt = ?1, server_auth_verifier = ?2, encrypted_vault_key = ?3 WHERE id = ?4",
            params![req.new_kdf_salt, new_srv_verifier, req.new_encrypted_vault_key, uid],
        );
        // Ключ восстановления заменяет и второй фактор: иначе потеря телефона означала бы потерю доступа
        remove_totp(&state, &conn, uid);
    }

    // Пароль сброшен по аварийному ключу: все сессии пользователя недействительны
    revoke_user_sessions(&state, uid, None);
    add_log(&state, "INFO", "RECOVERY_RESET", "Password reset with recovery key", &uname);
    Ok(Json(serde_json::json!({ "status": "ok" })))
}

async fn api_get_vault(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    let items: Vec<serde_json::Value> = {
        let conn = state.db.lock().unwrap();
        let mut stmt = conn
            .prepare(
                "SELECT v.id, v.owner_id, u.username as owner_name, v.scope, v.category,
                        v.is_favorite, COALESCE(v.is_trashed, 0) as is_trashed, v.trashed_at,
                        v.ciphertext, v.iv, v.updated_at
                 FROM vault_items v
                 JOIN users u ON u.id = v.owner_id
                 WHERE (v.scope = 'personal' AND v.owner_id = ?1) OR (v.scope = 'family')
                 ORDER BY v.is_favorite DESC, v.updated_at DESC",
            )
            .map_err(|_| internal_error())?;

        let rows = stmt
            .query_map(params![sess.user_id], |r| {
                Ok(serde_json::json!({
                    "id": r.get::<_, i64>(0)?,
                    "owner_id": r.get::<_, i64>(1)?,
                    "owner_name": r.get::<_, String>(2)?,
                    "scope": r.get::<_, String>(3)?,
                    "category": r.get::<_, String>(4)?,
                    "is_favorite": r.get::<_, i64>(5)?,
                    "is_trashed": r.get::<_, i64>(6)?,
                    "trashed_at": r.get::<_, Option<i64>>(7)?,
                    "ciphertext": r.get::<_, String>(8)?,
                    "iv": r.get::<_, String>(9)?,
                    "updated_at": r.get::<_, i64>(10)?,
                }))
            })
            .map_err(|_| internal_error())?;

        rows.flatten().collect()
    };

    Ok(Json(serde_json::json!({ "items": items })))
}

async fn api_create_vault_item(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(item): Json<VaultItemCreate>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    validate_item(&item)?;
    let now = now_ts();
    let id = {
        let mut conn = state.db.lock().unwrap();
        let conn = conn
            .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
            .map_err(|_| internal_error())?;
        check_item_quota(&conn, sess.user_id, 1)?;
        let (p, f) = split_bytes(&item.scope, item.ciphertext.len());
        check_bytes_quota(&conn, sess.user_id, p, f, None)?;
        conn.execute(
            "INSERT INTO vault_items (owner_id, scope, category, is_favorite, is_trashed, ciphertext, iv, updated_at)
             VALUES (?1, ?2, ?3, ?4, 0, ?5, ?6, ?7)",
            params![
                sess.user_id,
                item.scope,
                item.category,
                if item.is_favorite { 1 } else { 0 },
                item.ciphertext,
                item.iv,
                now
            ],
        )
        .map_err(|_| internal_error())?;
        let id = conn.last_insert_rowid();
        conn.commit()
            .map_err(|_| internal_error())?;
        id
    };

    Ok(Json(serde_json::json!({ "id": id, "updated_at": now })))
}

async fn api_update_vault_item(
    State(state): State<Arc<AppState>>,
    Path(item_id): Path<i64>,
    headers: HeaderMap,
    Json(item): Json<VaultItemCreate>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    validate_item(&item)?;
    let now = now_ts();
    {
        let mut conn = state.db.lock().unwrap();
        let conn = conn
            .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
            .map_err(|_| internal_error())?;
        let existing: Option<(i64, String)> = conn
            .query_row(
                "SELECT owner_id, scope FROM vault_items WHERE id = ?1",
                params![item_id],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .optional()
            .unwrap_or(None);

        let (owner_id, scope) =
            existing.ok_or_else(|| err(StatusCode::NOT_FOUND, "item_not_found"))?;
        if scope == "personal" && owner_id != sess.user_id {
            return Err(err(StatusCode::FORBIDDEN, "forbidden"));
        }
        // Семейную запись правят все участники, но сделать её личной может только владелец:
        // иначе она пропала бы у остальных, а владелец не смог бы её прочитать
        if scope == "family" && item.scope == "personal" && owner_id != sess.user_id {
            return Err(err(StatusCode::FORBIDDEN, "forbidden"));
        }

        let (p, f) = split_bytes(&item.scope, item.ciphertext.len());
        check_bytes_quota(&conn, owner_id, p, f, Some(item_id))?;
        let trashed_ts: Option<i64> = if item.is_trashed { Some(now) } else { None };

        conn.execute(
            "UPDATE vault_items
             SET scope = ?1, category = ?2, is_favorite = ?3, is_trashed = ?4, trashed_at = ?5, ciphertext = ?6, iv = ?7, updated_at = ?8
             WHERE id = ?9",
            params![
                item.scope,
                item.category,
                if item.is_favorite { 1 } else { 0 },
                if item.is_trashed { 1 } else { 0 },
                trashed_ts,
                item.ciphertext,
                item.iv,
                now,
                item_id
            ],
        )
        .map_err(|_| internal_error())?;
        conn.commit()
            .map_err(|_| internal_error())?;
    }

    Ok(Json(serde_json::json!({
        "status": "ok",
        "updated_at": now,
        "is_trashed": item.is_trashed
    })))
}

async fn api_trash_item(
    State(state): State<Arc<AppState>>,
    Path(item_id): Path<i64>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    {
        let conn = state.db.lock().unwrap();
        let existing: Option<(i64, String)> = conn
            .query_row("SELECT owner_id, scope FROM vault_items WHERE id = ?1", params![item_id], |r| {
                Ok((r.get(0)?, r.get(1)?))
            })
            .optional()
            .unwrap_or(None);

        let (owner_id, scope) =
            existing.ok_or_else(|| err(StatusCode::NOT_FOUND, "item_not_found"))?;
        if scope == "personal" && owner_id != sess.user_id {
            return Err(err(StatusCode::FORBIDDEN, "forbidden"));
        }

        let now = now_ts();
        let _ = conn.execute(
            "UPDATE vault_items SET is_trashed = 1, trashed_at = ?1, updated_at = ?1 WHERE id = ?2",
            params![now, item_id],
        );
    }
    Ok(Json(serde_json::json!({ "status": "ok", "id": item_id, "is_trashed": true })))
}

async fn api_restore_item(
    State(state): State<Arc<AppState>>,
    Path(item_id): Path<i64>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    {
        let conn = state.db.lock().unwrap();
        let existing: Option<(i64, String)> = conn
            .query_row("SELECT owner_id, scope FROM vault_items WHERE id = ?1", params![item_id], |r| {
                Ok((r.get(0)?, r.get(1)?))
            })
            .optional()
            .unwrap_or(None);

        let (owner_id, scope) =
            existing.ok_or_else(|| err(StatusCode::NOT_FOUND, "item_not_found"))?;
        if scope == "personal" && owner_id != sess.user_id {
            return Err(err(StatusCode::FORBIDDEN, "forbidden"));
        }

        let now = now_ts();
        let _ = conn.execute(
            "UPDATE vault_items SET is_trashed = 0, trashed_at = NULL, updated_at = ?1 WHERE id = ?2",
            params![now, item_id],
        );
    }
    Ok(Json(serde_json::json!({ "status": "ok", "id": item_id, "is_trashed": false })))
}

async fn api_batch_delete(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(req): Json<BatchDeleteRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    let mut deleted = 0;
    {
        let conn = state.db.lock().unwrap();
        for item_id in req.ids {
            let existing: Option<(i64, String)> = conn
                .query_row("SELECT owner_id, scope FROM vault_items WHERE id = ?1", params![item_id], |r| {
                    Ok((r.get(0)?, r.get(1)?))
                })
                .optional()
                .unwrap_or(None);
            if let Some((owner_id, scope)) = existing {
                if scope == "family" || owner_id == sess.user_id {
                    let _ = conn.execute("DELETE FROM vault_items WHERE id = ?1", params![item_id]);
                    deleted += 1;
                }
            }
        }
    }
    Ok(Json(serde_json::json!({ "status": "ok", "deleted_count": deleted })))
}

async fn api_empty_trash(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    let deleted = {
        let conn = state.db.lock().unwrap();
        conn.execute(
            "DELETE FROM vault_items WHERE is_trashed = 1 AND ((scope = 'personal' AND owner_id = ?1) OR scope = 'family')",
            params![sess.user_id],
        )
        .unwrap_or(0)
    };
    Ok(Json(serde_json::json!({ "status": "ok", "deleted": deleted })))
}

async fn api_delete_item(
    State(state): State<Arc<AppState>>,
    Path(item_id): Path<i64>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    {
        let conn = state.db.lock().unwrap();
        let existing: Option<(i64, String)> = conn
            .query_row("SELECT owner_id, scope FROM vault_items WHERE id = ?1", params![item_id], |r| {
                Ok((r.get(0)?, r.get(1)?))
            })
            .optional()
            .unwrap_or(None);

        let (owner_id, scope) =
            existing.ok_or_else(|| err(StatusCode::NOT_FOUND, "item_not_found"))?;
        if scope == "personal" && owner_id != sess.user_id {
            return Err(err(StatusCode::FORBIDDEN, "forbidden"));
        }

        let _ = conn.execute("DELETE FROM vault_items WHERE id = ?1", params![item_id]);
    }
    Ok(Json(serde_json::json!({ "status": "ok" })))
}

async fn api_batch_import(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: axum::body::Body,
) -> Result<Json<serde_json::Value>, AppError> {
    // Сначала авторизация, потом чтение тела: без сессии крупный импорт даже не принимается.
    // Сырой Body не подпадает под DefaultBodyLimit, поэтому отдельный (больший) лимит задан явно.
    let sess = require_user(&state, &headers)?;
    let bytes = axum::body::to_bytes(body, BATCH_BODY_LIMIT)
        .await
        .map_err(|_| err(StatusCode::PAYLOAD_TOO_LARGE, "import_too_large"))?;
    let batch: BatchImportRequest = serde_json::from_slice(&bytes)
        .map_err(|_| err(StatusCode::BAD_REQUEST, "import_bad_format"))?;
    if batch.items.len() > MAX_BATCH_ITEMS {
        return Err(err(StatusCode::PAYLOAD_TOO_LARGE, "import_too_many"));
    }
    for it in &batch.items {
        validate_item(it)?;
    }
    let now = now_ts();
    let count = batch.items.len();
    {
        let mut conn = state.db.lock().unwrap();
        let tx = conn
            .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
            .map_err(|_| internal_error())?;
        check_item_quota(&tx, sess.user_id, count)?;
        let (mut p, mut f) = (0, 0);
        for it in &batch.items {
            let (ip, if_) = split_bytes(&it.scope, it.ciphertext.len());
            p += ip;
            f += if_;
        }
        check_bytes_quota(&tx, sess.user_id, p, f, None)?;

        // Любая ошибка — выход до commit: транзакция откатывается при drop, частичного импорта нет
        for it in batch.items {
            tx.execute(
                "INSERT INTO vault_items (owner_id, scope, category, is_favorite, is_trashed, ciphertext, iv, updated_at)
                 VALUES (?1, ?2, ?3, ?4, 0, ?5, ?6, ?7)",
                params![
                    sess.user_id,
                    it.scope,
                    it.category,
                    if it.is_favorite { 1 } else { 0 },
                    it.ciphertext,
                    it.iv,
                    now
                ],
            )
            .map_err(|_| internal_error())?;
        }
        tx.commit().map_err(|_| internal_error())?;
    }
    Ok(Json(serde_json::json!({ "status": "ok", "imported_count": count })))
}

async fn api_admin_create_invite(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(req): Json<AdminCreateInviteRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    if !sess.is_admin {
        return Err(err(StatusCode::FORBIDDEN, "admin_only"));
    }
    if !is_valid_auth_key(&req.invite_id) {
        return Err(err(StatusCode::BAD_REQUEST, "invite_bad_id"));
    }
    check_blob_lens(&[&req.encrypted_family_key_for_invite])?;
    let ttl = req.ttl_minutes.clamp(INVITE_TTL_MIN_MINUTES, INVITE_TTL_MAX_MINUTES);
    let expires = now_ts() + (ttl * 60);
    {
        let conn = state.db.lock().unwrap();
        purge_expired_invites(&conn);
        conn.execute(
            "INSERT INTO invites (id_hash, encrypted_family_key_for_invite, expires_at, created_by)
             VALUES (?1, ?2, ?3, ?4)",
            params![
                invite_lookup_hash(&req.invite_id),
                req.encrypted_family_key_for_invite,
                expires,
                sess.user_id
            ],
        )
        .map_err(|_| err(StatusCode::CONFLICT, "invite_create_failed"))?;
    }
    Ok(Json(serde_json::json!({ "status": "ok", "expires_at": expires })))
}

async fn api_admin_members(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    if !sess.is_admin {
        return Err(err(StatusCode::FORBIDDEN, "admin_only"));
    }
    let members: Vec<serde_json::Value> = {
        let conn = state.db.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT id, username, is_admin, created_at, admin_escrow_vault_key FROM users ORDER BY id ASC")
            .map_err(|_| internal_error())?;

        let rows = stmt
            .query_map([], |r| {
                let escrow: Option<String> = r.get(4)?;
                Ok(serde_json::json!({
                    "id": r.get::<_, i64>(0)?,
                    "username": r.get::<_, String>(1)?,
                    "is_admin": r.get::<_, i64>(2)? != 0,
                    "created_at": r.get::<_, i64>(3)?,
                    "can_admin_recover": escrow.is_some(),
                    "admin_escrow_vault_key": escrow
                }))
            })
            .map_err(|_| internal_error())?;

        rows.flatten().collect()
    };

    Ok(Json(serde_json::json!({ "members": members })))
}

async fn api_admin_recover_member(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(req): Json<AdminResetMemberRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sess = require_user(&state, &headers)?;
    if !sess.is_admin {
        return Err(err(StatusCode::FORBIDDEN, "admin_only"));
    }
    // Сброс чужого пароля — редкая операция: украденная сессия админа не сбросит всех подряд
    let ip = client_key(&state, &headers, peer.ip());
    rate_limit(&state, &format!("admreset:ip:{ip}"), ADMIN_RESET_LIMIT, RATE_WINDOW)?;
    rate_limit(&state, &format!("admreset:user:{}", sess.user_id), ADMIN_RESET_LIMIT, RATE_WINDOW)?;
    check_blob_lens(&[&req.new_kdf_salt, &req.new_encrypted_vault_key])?;
    let new_verifier = hash_auth_key_async(&state, &req.new_client_auth_hash).await?;
    {
        let conn = state.db.lock().unwrap();
        let escrow: Option<String> = conn
            .query_row(
                "SELECT admin_escrow_vault_key FROM users WHERE id = ?1",
                params![req.target_user_id],
                |r| r.get(0),
            )
            .optional()
            .unwrap_or(None)
            .flatten();

        if escrow.is_none() {
            return Err(err(StatusCode::BAD_REQUEST, "recovery_not_allowed"));
        }
        let _ = conn.execute(
            "UPDATE users SET kdf_salt = ?1, server_auth_verifier = ?2, encrypted_vault_key = ?3 WHERE id = ?4",
            params![req.new_kdf_salt, new_verifier, req.new_encrypted_vault_key, req.target_user_id],
        );
        remove_totp(&state, &conn, req.target_user_id);
    }
    revoke_user_sessions(&state, req.target_user_id, None);
    add_log(
        &state,
        "WARN",
        "ADMIN_RESET",
        &format!("id={}", req.target_user_id),
        &sess.username,
    );
    Ok(Json(serde_json::json!({ "status": "ok" })))
}

fn generate_pwa_png(size: u32) -> Vec<u8> {
    let mut raw = Vec::with_capacity((size * (size * 4 + 1)) as usize);
    for y in 0..size {
        raw.push(0);
        let ny = (y as f32 / size as f32) * 2.0 - 1.0;
        for x in 0..size {
            let nx = (x as f32 / size as f32) * 2.0 - 1.0;
            let ax = nx.abs();
            let mut in_shield = false;
            if (-0.62..=0.72).contains(&ny) {
                let max_w = 0.56 * (1.0 - ((ny + 0.08) / 0.82).max(0.0).powf(1.65));
                let top_edge = -0.62 + 0.22 * ax;
                if ax <= max_w && ny >= top_edge {
                    in_shield = true;
                }
            }
            if in_shield {
                let dist_circle = (nx * nx + (ny + 0.08) * (ny + 0.08)).sqrt();
                let in_keyhole = dist_circle <= 0.13
                    || ((-0.05..=0.28).contains(&ny) && ax <= 0.05 + 0.04 * (ny + 0.05));
                if in_keyhole {
                    raw.extend_from_slice(&[255, 255, 255, 255]);
                } else {
                    raw.extend_from_slice(&[37, 99, 235, 255]);
                }
            } else {
                raw.extend_from_slice(&[15, 23, 42, 255]);
            }
        }
    }

    fn crc32(bytes: &[u8]) -> u32 {
        let mut c = 0xffff_ffffu32;
        for &b in bytes {
            c ^= b as u32;
            for _ in 0..8 {
                c = if c & 1 != 0 { 0xedb8_8320 ^ (c >> 1) } else { c >> 1 };
            }
        }
        !c
    }

    fn make_chunk(tag: &[u8; 4], data: &[u8]) -> Vec<u8> {
        let mut chunk = Vec::with_capacity(12 + data.len());
        chunk.extend_from_slice(&(data.len() as u32).to_be_bytes());
        chunk.extend_from_slice(tag);
        chunk.extend_from_slice(data);
        let crc = crc32(&chunk[4..]);
        chunk.extend_from_slice(&crc.to_be_bytes());
        chunk
    }

    let mut ihdr = Vec::with_capacity(13);
    ihdr.extend_from_slice(&size.to_be_bytes());
    ihdr.extend_from_slice(&size.to_be_bytes());
    ihdr.extend_from_slice(&[8, 6, 0, 0, 0]);

    let mut encoder = ZlibEncoder::new(Vec::new(), Compression::default());
    let _ = encoder.write_all(&raw);
    let compressed = encoder.finish().unwrap_or_default();

    let mut png = Vec::new();
    png.extend_from_slice(b"\x89PNG\r\n\x1a\n");
    png.extend_from_slice(&make_chunk(b"IHDR", &ihdr));
    png.extend_from_slice(&make_chunk(b"IDAT", &compressed));
    png.extend_from_slice(&make_chunk(b"IEND", &[]));
    png
}

async fn serve_icon_svg() -> Response {
    let svg = r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
        <rect width="512" height="512" rx="120" fill="#0f172a"/>
        <path d="M256 72L104 140v112c0 108.5 64.9 207.3 152 240 87.1-32.7 152-131.5 152-240V140L256 72z" fill="#2563eb"/>
        <circle cx="256" cy="236" r="42" fill="#ffffff"/>
        <path d="M238 262h36l10 82h-56l10-82z" fill="#ffffff"/>
    </svg>"##;
    ([(header::CONTENT_TYPE, "image/svg+xml")], svg).into_response()
}

async fn serve_icon_192(State(state): State<Arc<AppState>>) -> Response {
    ([(header::CONTENT_TYPE, "image/png")], state.png_192.clone()).into_response()
}

async fn serve_icon_512(State(state): State<Arc<AppState>>) -> Response {
    ([(header::CONTENT_TYPE, "image/png")], state.png_512.clone()).into_response()
}

async fn serve_manifest() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "id": "/",
        "name": "FravashiVault",
        "short_name": "FravashiVault",
        "description": "Защищенный семейный сейф паролей и 2FA-кодов",
        "start_url": "/",
        "scope": "/",
        "display": "standalone",
        "background_color": "#090d14",
        "theme_color": "#090d14",
        "orientation": "any",
        "icons": [
            { "src": "/static/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
            { "src": "/static/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
            { "src": "/static/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
            { "src": "/static/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" },
            { "src": "/static/icons/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" }
        ]
    }))
}

// Service worker: кэш версионируется параметром ?v=<APP_BUILD> (его передаёт app.js), все ресурсы — локальные.
const SW_JS: &str = r##"const BUILD = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE_NAME = 'fravashi-pwa-' + BUILD;
const PRECACHE = [
    '/', '/manifest.json',
    '/static/icons/icon.svg', '/static/icons/favicon.svg', '/static/icons/favicon-32.png', '/static/icons/apple-touch-icon.png',
    '/static/icons/icon-192.png', '/static/icons/icon-512.png', '/static/icons/icon-maskable-192.png', '/static/icons/icon-maskable-512.png',
    '/static/app.js', '/static/import-json.js', '/static/extension-build.js', '/static/app.css',
    '/static/i18n/ru.js', '/static/i18n/en.js',
    '/static/vendor/vue.global.prod.js', '/static/vendor/papaparse.min.js', '/static/vendor/qrcode.js',
    '/static/vendor/fonts/fonts.css', '/static/vendor/fontawesome/css/all.min.css',
    '/static/vendor/fontawesome/webfonts/fa-solid-900.woff2',
    '/static/vendor/fontawesome/webfonts/fa-regular-400.woff2',
    '/static/vendor/fontawesome/webfonts/fa-brands-400.woff2',
    '/static/vendor/fontawesome/webfonts/fa-v4compatibility.woff2',
    ...['400', '500', '600', '700', '800'].flatMap((w) => ['cyrillic', 'latin'].map((s) => '/static/vendor/fonts/inter-' + s + '-' + w + '-normal.woff2')),
    ...['400', '500', '600', '700'].flatMap((w) => ['cyrillic', 'latin'].map((s) => '/static/vendor/fonts/jetbrains-mono-' + s + '-' + w + '-normal.woff2')),
];
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u))))
            .then(() => self.skipWaiting())
    );
});
// Удаляются все кеши, кроме текущего, в том числе старые aegis-pwa-* (до переименования в Fravashi).
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    if (e.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
    e.respondWith(
        fetch(e.request).then((res) => {
            if (res.ok) {
                const clone = res.clone();
                caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
            }
            return res;
        }).catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
});"##;

async fn serve_sw() -> Response {
    ([(header::CONTENT_TYPE, "application/javascript")], SW_JS).into_response()
}

async fn serve_spa() -> Html<String> {
    let content = fs::read_to_string("index.html")
        .unwrap_or_else(|_| "<h3>Файл index.html не найден</h3>".to_string());
    Html(content)
}

fn build_app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/status", get(api_status))
        .route("/api/logs", get(api_get_logs).delete(api_clear_logs))
        .route("/api/auth/params/:username", get(api_auth_params))
        .route("/api/invite/lookup", post(api_invite_lookup))
        .route("/api/auth/register", post(api_register))
        .route("/api/auth/login", post(api_login))
        .route("/api/auth/login/totp", post(api_login_totp))
        .route("/api/auth/totp", get(api_totp_status))
        .route("/api/auth/totp/setup", post(api_totp_setup))
        .route("/api/auth/totp/enable", post(api_totp_enable))
        .route("/api/auth/totp/disable", post(api_totp_disable))
        .route("/api/auth/change-password", post(api_change_password))
        .route("/api/auth/logout", post(api_logout))
        .route("/api/auth/recovery-fetch", post(api_recovery_fetch))
        .route("/api/auth/recovery-reset", post(api_recovery_reset))
        .route("/api/vault", get(api_get_vault).post(api_create_vault_item))
        .route("/api/vault/batch", post(api_batch_import))
        .route("/api/vault/batch-delete", post(api_batch_delete))
        .route("/api/vault/trash/empty", delete(api_empty_trash))
        .route("/api/vault/:item_id", put(api_update_vault_item).delete(api_delete_item))
        .route("/api/vault/:item_id/trash", post(api_trash_item))
        .route("/api/vault/:item_id/restore", post(api_restore_item))
        .route("/api/admin/invites", post(api_admin_create_invite))
        .route("/api/admin/members", get(api_admin_members))
        .route("/api/admin/recover-member", post(api_admin_recover_member))
        .route("/icon.svg", get(serve_icon_svg))
        .route("/icon-192.png", get(serve_icon_192))
        .route("/icon-512.png", get(serve_icon_512))
        .route("/manifest.json", get(serve_manifest))
        .route("/sw.js", get(serve_sw))
        .route("/", get(serve_spa))
        // Статика из каталога static/: ServeDir не отдаёт листинг каталогов и не выходит за корень
        .nest_service("/static", ServeDir::new("static"))
        .layer(DefaultBodyLimit::max(BODY_LIMIT))
        // Самым внешним слоем: заголовки получают и ответы на OPTIONS, и ошибки 413/404
        .layer(middleware::from_fn(security_headers_middleware))
        .with_state(state)
}

// Режим для HEALTHCHECK: в образе нет ни curl, ни wget. Выход 0, если /api/status отвечает 200.
fn healthcheck() -> ! {
    use std::io::{Read, Write};
    let ok = std::net::TcpStream::connect_timeout(&SocketAddr::from(([127, 0, 0, 1], 8000)), Duration::from_secs(3))
        .and_then(|mut s| {
            s.set_read_timeout(Some(Duration::from_secs(3)))?;
            s.write_all(b"GET /api/status HTTP/1.0\r\nHost: localhost\r\n\r\n")?;
            let mut buf = [0u8; 32];
            let n = s.read(&mut buf)?;
            Ok(buf[..n].starts_with(b"HTTP/1.1 200") || buf[..n].starts_with(b"HTTP/1.0 200"))
        })
        .unwrap_or(false);
    std::process::exit(if ok { 0 } else { 1 });
}

#[tokio::main]
async fn main() {
    if env::args().nth(1).as_deref() == Some("--healthcheck") {
        healthcheck();
    }
    let db_path = env::var("DB_PATH").unwrap_or_else(|_| "/app/data/vault-v2.db".to_string());
    let conn = init_db(&db_path);
    let dummy_verifier = hash_auth_key(&random_hex(32))
        .unwrap_or_else(|_| panic!("Не удалось инициализировать Argon2id"));

    let state = Arc::new(AppState::new(
        conn,
        dummy_verifier,
        generate_pwa_png(192),
        generate_pwa_png(512),
    ));

    add_log(&state, "INFO", "STARTUP", "FravashiVault server (Rust/Axum) started", "system");

    let sweeper = state.clone();
    tokio::spawn(async move {
        let mut tick = tokio::time::interval(Duration::from_secs(60));
        loop {
            tick.tick().await;
            sweep_state(&sweeper, now_ts());
        }
    });

    let app = build_app(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!(" FravashiVault Rust/Axum listening on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    // ConnectInfo нужен лимитеру как запасной адрес, если X-Forwarded-For нет
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::Method;

    fn sample_auth_key() -> String {
        "a1".repeat(32)
    }

    #[test]
    fn argon2_verifier_accepts_correct_auth_key() {
        let key = sample_auth_key();
        let verifier = hash_auth_key(&key).ok().unwrap();
        assert!(verifier.starts_with("$argon2id$"));
        assert!(verify_auth_key(&key, &verifier));
    }

    #[test]
    fn argon2_verifier_rejects_wrong_auth_key() {
        let verifier = hash_auth_key(&sample_auth_key()).ok().unwrap();
        let mut wrong = sample_auth_key();
        wrong.replace_range(63..64, "0");
        assert!(!verify_auth_key(&wrong, &verifier));
        assert!(!verify_auth_key(&"00".repeat(32), &verifier));
    }

    #[test]
    fn argon2_verifier_rejects_malformed_input() {
        let verifier = hash_auth_key(&sample_auth_key()).ok().unwrap();
        assert!(!verify_auth_key("", &verifier));
        assert!(!verify_auth_key(&"zz".repeat(32), &verifier));
        assert!(!verify_auth_key(&sample_auth_key()[..62], &verifier));
        assert!(!verify_auth_key(&sample_auth_key(), "not-a-phc-string"));
        assert!(hash_auth_key("short").is_err());
    }

    #[test]
    fn argon2_uses_fresh_salt_per_hash() {
        let key = sample_auth_key();
        let v1 = hash_auth_key(&key).ok().unwrap();
        let v2 = hash_auth_key(&key).ok().unwrap();
        assert_ne!(v1, v2);
        assert!(verify_auth_key(&key, &v1) && verify_auth_key(&key, &v2));
    }

    #[test]
    fn init_db_refuses_v1_database() {
        let path = env::temp_dir().join(format!("fravashi-v1-{}.db", random_hex(8)));
        let path_str = path.to_string_lossy().to_string();
        Connection::open(&path)
            .unwrap()
            .execute_batch("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, server_auth_salt TEXT);")
            .unwrap();
        let result = std::panic::catch_unwind(|| init_db(&path_str));
        let _ = fs::remove_file(&path);
        assert!(result.is_err());
    }

    #[test]
    fn init_db_creates_v2_schema() {
        let path = env::temp_dir().join(format!("fravashi-v2-{}.db", random_hex(8)));
        let conn = init_db(&path.to_string_lossy());
        let cols: Vec<String> = conn
            .prepare("PRAGMA table_info(users);")
            .unwrap()
            .query_map([], |r| r.get::<_, String>(1))
            .unwrap()
            .flatten()
            .collect();
        drop(conn);
        let _ = fs::remove_file(&path);
        assert!(cols.iter().any(|c| c == "kdf_version"));
        assert!(!cols.iter().any(|c| c == "server_auth_salt"));
    }

    #[test]
    fn invite_lookup_hash_is_not_the_invite_id() {
        let id = sample_auth_key();
        let h = invite_lookup_hash(&id);
        assert_eq!(h.len(), 64);
        assert_ne!(h, id);
        assert_eq!(h, invite_lookup_hash(&id.to_uppercase()));
    }

    // ---------- этап 2: IP клиента, лимитер, сессии, заголовки ----------

    use axum::body::Body;
    use tower::ServiceExt;

    fn peer() -> IpAddr {
        "10.0.0.1".parse().unwrap()
    }

    fn xff(values: &[&str]) -> HeaderMap {
        let mut h = HeaderMap::new();
        for v in values {
            h.append("x-forwarded-for", HeaderValue::from_str(v).unwrap());
        }
        h
    }

    // client_ip со списком доверенных прокси по умолчанию (peer() = 10.0.0.1 в него входит)
    fn ci(h: &HeaderMap, p: IpAddr) -> IpAddr {
        client_ip(h, p, &parse_trusted_proxies(None).unwrap())
    }

    #[test]
    fn xff_is_ignored_unless_peer_is_trusted_proxy() {
        let trusted = parse_trusted_proxies(None).unwrap();
        let h = xff(&["1.1.1.1, 2.2.2.2"]);
        // частные сети и loopback по умолчанию доверенные
        for p in ["10.0.0.1", "172.17.0.1", "192.168.1.5", "127.0.0.1", "::1", "fd00::5", "::ffff:172.20.0.1"] {
            assert_eq!(client_ip(&h, p.parse().unwrap(), &trusted), "2.2.2.2".parse::<IpAddr>().unwrap(), "{p}");
        }
        // прямое соединение из интернета: заголовок подделан, берётся адрес соединения
        for p in ["203.0.113.7", "172.32.0.1", "2001:db8::1", "fe80::1"] {
            let peer: IpAddr = p.parse().unwrap();
            assert_eq!(client_ip(&h, peer, &trusted), peer, "{p}");
        }
        // "none" — заголовку не верим никогда
        let none = parse_trusted_proxies(Some("none")).unwrap();
        assert_eq!(client_ip(&h, peer(), &none), peer());
    }

    #[test]
    fn trusted_proxies_parsing() {
        let l = parse_trusted_proxies(Some("203.0.113.0/24, 198.51.100.9 2001:db8::/32")).unwrap();
        assert_eq!(l.len(), 3);
        assert!(l[0].contains("203.0.113.200".parse().unwrap()) && !l[0].contains("203.0.114.1".parse().unwrap()));
        assert!(l[1].contains("198.51.100.9".parse().unwrap()) && !l[1].contains("198.51.100.10".parse().unwrap()));
        assert!(l[2].contains("2001:db8:ffff::1".parse().unwrap()));
        assert_eq!(parse_trusted_proxies(Some("")).unwrap(), parse_trusted_proxies(None).unwrap());
        assert!(Cidr("0.0.0.0".parse().unwrap(), 0).contains("8.8.8.8".parse().unwrap()));
        for bad in ["10.0.0.0/33", "foo", "10.0.0.0/x", "::/129"] {
            assert!(parse_trusted_proxies(Some(bad)).is_err(), "{bad}");
        }
    }

    #[test]
    fn hmac_sha256_matches_rfc4231() {
        // RFC 4231, тест 2
        let mac = hmac_sha256(b"Jefe", b"what do ya want for nothing?");
        assert_eq!(hex::encode(mac), "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843");
        // ключ длиннее блока (тест 6)
        let mac = hmac_sha256(&[0xaa; 131], b"Test Using Larger Than Block-Size Key - Hash Key First");
        assert_eq!(hex::encode(mac), "60e431591ee0b67f0d8a26aacbf5b77f8e0bc6213728c5140546040f0ee37f54");
        assert!(ct_eq("abc", "abc") && !ct_eq("abc", "abd") && !ct_eq("abc", "abcd") && !ct_eq("", "x"));
    }

    #[test]
    fn client_ip_takes_last_xff_entry() {
        // левое значение присылает клиент, правое дописал nginx
        assert_eq!(ci(&xff(&["1.1.1.1, 2.2.2.2"]), peer()), "2.2.2.2".parse::<IpAddr>().unwrap());
        assert_eq!(ci(&xff(&["3.3.3.3"]), peer()), "3.3.3.3".parse::<IpAddr>().unwrap());
        assert_eq!(
            ci(&xff(&["1.1.1.1, 2.2.2.2,  4.4.4.4 "]), peer()),
            "4.4.4.4".parse::<IpAddr>().unwrap()
        );
        // несколько строк заголовка: берётся последняя
        assert_eq!(
            ci(&xff(&["1.1.1.1", "9.9.9.9, 2.2.2.2"]), peer()),
            "2.2.2.2".parse::<IpAddr>().unwrap()
        );
    }

    #[test]
    fn client_ip_falls_back_to_peer() {
        assert_eq!(ci(&HeaderMap::new(), peer()), peer());
        assert_eq!(ci(&xff(&["not-an-ip"]), peer()), peer());
        assert_eq!(ci(&xff(&["1.1.1.1, "]), peer()), peer());
        assert_eq!(ci(&xff(&[""]), peer()), peer());
    }

    #[test]
    fn ip_key_groups_ipv6_by_64() {
        let a: IpAddr = "2001:db8:1:2:aaaa::1".parse().unwrap();
        let b: IpAddr = "2001:db8:1:2:bbbb::9".parse().unwrap();
        let c: IpAddr = "2001:db8:1:3::1".parse().unwrap();
        assert_eq!(ip_key(a), ip_key(b));
        assert_ne!(ip_key(a), ip_key(c));
        assert_eq!(ip_key("1.2.3.4".parse().unwrap()), "1.2.3.4");
        assert_eq!(ip_key("::ffff:1.2.3.4".parse().unwrap()), "1.2.3.4");
    }

    #[test]
    fn limiter_blocks_after_limit_and_reports_wait() {
        let mut l = RateLimiter::default();
        for i in 0..3 {
            assert!(l.hit("k", 3, 100, 1000 + i).is_ok());
        }
        assert_eq!(l.hit("k", 3, 100, 1010), Err(90)); // самая ранняя попытка в 1000
        assert!(l.hit("other", 3, 100, 1010).is_ok()); // ключи независимы
    }

    #[test]
    fn limiter_window_slides() {
        let mut l = RateLimiter::default();
        assert!(l.hit("k", 2, 100, 1000).is_ok());
        assert!(l.hit("k", 2, 100, 1050).is_ok());
        assert!(l.hit("k", 2, 100, 1099).is_err());
        // попытка из 1000 вышла из окна, из 1050 — ещё нет
        assert!(l.hit("k", 2, 100, 1100).is_ok());
        assert!(l.hit("k", 2, 100, 1101).is_err());
    }

    #[test]
    fn limiter_rejected_hits_are_not_counted() {
        let mut l = RateLimiter::default();
        assert!(l.hit("k", 1, 100, 1000).is_ok());
        for t in 1001..1050 {
            assert!(l.hit("k", 1, 100, t).is_err());
        }
        assert!(l.hit("k", 1, 100, 1100).is_ok());
    }

    #[test]
    fn limiter_reset_and_sweep_free_memory() {
        let mut l = RateLimiter::default();
        l.hit("a", 5, RATE_WINDOW, 1000).unwrap();
        l.hit("b", 5, RATE_WINDOW, 1000 + RATE_WINDOW).unwrap();
        l.reset("a");
        assert!(!l.events.contains_key("a"));
        l.hit("c", 5, RATE_WINDOW, 1000).unwrap();
        l.sweep(1000 + RATE_WINDOW + 1);
        assert!(!l.events.contains_key("c"));
        assert!(l.events.contains_key("b"));
    }

    fn test_state() -> Arc<AppState> {
        test_state_with(|_| {})
    }

    fn test_state_with(f: impl FnOnce(&mut AppState)) -> Arc<AppState> {
        let path = env::temp_dir().join(format!("fravashi-t-{}.db", random_hex(8)));
        let conn = init_db(&path.to_string_lossy());
        let mut st = AppState::new(conn, "dummy".into(), vec![], vec![]);
        f(&mut st);
        Arc::new(st)
    }

    async fn body_json(r: Response) -> serde_json::Value {
        serde_json::from_slice(&axum::body::to_bytes(r.into_body(), 1 << 20).await.unwrap()).unwrap()
    }

    fn add_session(state: &AppState, user_id: i64, is_admin: bool) -> String {
        let token = random_hex(16);
        let now = now_ts();
        state.sessions.lock().unwrap().insert(
            token.clone(),
            SessionInfo {
                user_id,
                username: format!("u{user_id}"),
                is_admin,
                created: now,
                exp: now + SESSION_TTL,
            },
        );
        token
    }

    fn bearer(token: &str) -> HeaderMap {
        let mut h = HeaderMap::new();
        h.insert(header::AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {token}")).unwrap());
        h
    }

    fn insert_user(state: &AppState, name: &str, is_admin: bool, auth_key: &str, escrow: bool) -> i64 {
        let verifier = hash_auth_key(auth_key).ok().unwrap();
        let conn = state.db.lock().unwrap();
        conn.execute(
            "INSERT INTO users (username, is_admin, kdf_version, kdf_salt, server_auth_verifier,
                encrypted_vault_key, recovery_salt, recovery_auth_verifier, recovery_encrypted_vault_key,
                admin_escrow_vault_key, created_at)
             VALUES (?1, ?2, 2, 's', ?3, 'vk', 'rs', ?3, 'rvk', ?4, 0)",
            params![name, is_admin as i64, verifier, if escrow { Some("esc") } else { None }],
        )
        .unwrap();
        conn.last_insert_rowid()
    }

    async fn send(
        app: &Router,
        method: Method,
        uri: &str,
        headers: &[(&str, &str)],
        body: Vec<u8>,
    ) -> Response {
        let mut b = axum::http::Request::builder().method(method).uri(uri);
        for (k, v) in headers {
            b = b.header(*k, *v);
        }
        let mut req = b.body(Body::from(body)).unwrap();
        req.extensions_mut()
            .insert(ConnectInfo(SocketAddr::from(([10, 0, 0, 1], 1234))));
        app.clone().oneshot(req).await.unwrap()
    }

    fn json_body(v: serde_json::Value) -> Vec<u8> {
        serde_json::to_vec(&v).unwrap()
    }

    const JSON_CT: (&str, &str) = ("content-type", "application/json");

    #[test]
    fn revoke_user_sessions_keeps_only_current_and_other_users() {
        let state = test_state();
        let a1 = add_session(&state, 1, false);
        let a2 = add_session(&state, 1, false);
        let b = add_session(&state, 2, false);
        assert_eq!(revoke_user_sessions(&state, 1, Some(&a1)), 1);
        {
            let s = state.sessions.lock().unwrap();
            assert!(s.contains_key(&a1) && !s.contains_key(&a2) && s.contains_key(&b));
        }
        assert_eq!(revoke_user_sessions(&state, 1, None), 1);
        let s = state.sessions.lock().unwrap();
        assert!(!s.contains_key(&a1) && s.contains_key(&b));
    }

    #[test]
    fn sessions_expire_idle_and_absolute() {
        let state = test_state();
        let tok = add_session(&state, 1, false);
        assert!(require_user(&state, &bearer(&tok)).is_ok());

        // абсолютный срок: активность его не продлевает
        state.sessions.lock().unwrap().get_mut(&tok).unwrap().created = now_ts() - SESSION_ABS_TTL - 1;
        assert!(require_user(&state, &bearer(&tok)).is_err());
        assert!(!state.sessions.lock().unwrap().contains_key(&tok));

        // idle-срок
        let tok = add_session(&state, 1, false);
        state.sessions.lock().unwrap().get_mut(&tok).unwrap().exp = now_ts() - 1;
        assert!(require_user(&state, &bearer(&tok)).is_err());

        assert!(require_user(&state, &HeaderMap::new()).is_err());
    }

    #[tokio::test]
    async fn logout_deletes_token() {
        let state = test_state();
        let tok = add_session(&state, 1, false);
        let app = build_app(state.clone());
        let auth = format!("Bearer {tok}");
        let res = send(&app, Method::POST, "/api/auth/logout", &[("authorization", &auth)], vec![]).await;
        assert_eq!(res.status(), StatusCode::OK);
        assert!(state.sessions.lock().unwrap().is_empty());
    }

    #[test]
    fn sweep_state_drops_stale_sessions() {
        let state = test_state();
        let live = add_session(&state, 1, false);
        let dead = add_session(&state, 2, false);
        state.sessions.lock().unwrap().get_mut(&dead).unwrap().exp = now_ts() - 5;
        sweep_state(&state, now_ts());
        let s = state.sessions.lock().unwrap();
        assert!(s.contains_key(&live) && !s.contains_key(&dead));
    }

    #[tokio::test]
    async fn change_password_revokes_other_sessions_keeps_current() {
        let state = test_state();
        let key = sample_auth_key();
        let uid = insert_user(&state, "alice", false, &key, false);
        let current = add_session(&state, uid, false);
        let stolen = add_session(&state, uid, false);
        let other_user = add_session(&state, uid + 100, false);
        let app = build_app(state.clone());
        let auth = format!("Bearer {current}");
        let body = json_body(serde_json::json!({
            "current_client_auth_hash": key,
            "new_kdf_salt": "ns",
            "new_client_auth_hash": "b2".repeat(32),
            "new_encrypted_vault_key": "nvk"
        }));
        let r = send(&app, Method::POST, "/api/auth/change-password", &[JSON_CT, ("authorization", &auth)], body).await;
        assert_eq!(r.status(), StatusCode::OK);
        let s = state.sessions.lock().unwrap();
        assert!(s.contains_key(&current) && !s.contains_key(&stolen) && s.contains_key(&other_user));
    }

    #[tokio::test]
    async fn recovery_reset_revokes_all_sessions_of_user() {
        let state = test_state();
        let key = sample_auth_key();
        let uid = insert_user(&state, "bob", false, &key, false);
        let t1 = add_session(&state, uid, false);
        let t2 = add_session(&state, uid, false);
        let other = add_session(&state, uid + 100, false);
        let app = build_app(state.clone());
        let body = json_body(serde_json::json!({
            "username": "bob",
            "recovery_auth_hash": key,
            "new_kdf_salt": "ns",
            "new_client_auth_hash": "b2".repeat(32),
            "new_encrypted_vault_key": "nvk"
        }));
        let r = send(&app, Method::POST, "/api/auth/recovery-reset", &[JSON_CT], body).await;
        assert_eq!(r.status(), StatusCode::OK);
        let s = state.sessions.lock().unwrap();
        assert!(!s.contains_key(&t1) && !s.contains_key(&t2) && s.contains_key(&other));
    }

    #[tokio::test]
    async fn admin_reset_revokes_target_sessions() {
        let state = test_state();
        let key = sample_auth_key();
        let admin_id = insert_user(&state, "admin", true, &key, false);
        let target_id = insert_user(&state, "carol", false, &key, true);
        let admin_tok = add_session(&state, admin_id, true);
        let target_tok = add_session(&state, target_id, false);
        let app = build_app(state.clone());
        let auth = format!("Bearer {admin_tok}");
        let body = json_body(serde_json::json!({
            "target_user_id": target_id,
            "new_kdf_salt": "ns",
            "new_client_auth_hash": "b2".repeat(32),
            "new_encrypted_vault_key": "nvk"
        }));
        let r = send(&app, Method::POST, "/api/admin/recover-member", &[JSON_CT, ("authorization", &auth)], body).await;
        assert_eq!(r.status(), StatusCode::OK);
        let s = state.sessions.lock().unwrap();
        assert!(s.contains_key(&admin_tok) && !s.contains_key(&target_tok));
    }

    #[tokio::test]
    async fn security_headers_on_every_response() {
        let app = build_app(test_state());
        for (m, uri) in [
            (Method::GET, "/api/status"),
            (Method::GET, "/no-such-page"),
            (Method::OPTIONS, "/api/auth/login"),
            (Method::GET, "/api/logs"),
        ] {
            let res = send(&app, m, uri, &[], vec![]).await;
            let h = res.headers();
            assert!(
                h[header::CONTENT_SECURITY_POLICY].to_str().unwrap().contains("frame-ancestors 'none'"),
                "{uri}"
            );
            assert_eq!(h[header::X_FRAME_OPTIONS], "DENY");
            assert_eq!(h[header::X_CONTENT_TYPE_OPTIONS], "nosniff");
            assert_eq!(h[header::REFERRER_POLICY], "no-referrer");
            assert_eq!(h[header::STRICT_TRANSPORT_SECURITY], "max-age=31536000");
            let pp = h["permissions-policy"].to_str().unwrap();
            assert!(pp.contains("camera=()") && pp.contains("microphone=()") && pp.contains("geolocation=()"));
        }
    }

    #[tokio::test]
    async fn logs_are_admin_only() {
        let state = test_state();
        let member = format!("Bearer {}", add_session(&state, 2, false));
        let admin = format!("Bearer {}", add_session(&state, 1, true));
        let app = build_app(state.clone());

        let r = send(&app, Method::GET, "/api/logs", &[], vec![]).await;
        assert_eq!(r.status(), StatusCode::UNAUTHORIZED);
        for m in [Method::GET, Method::DELETE] {
            let r = send(&app, m, "/api/logs", &[("authorization", &member)], vec![]).await;
            assert_eq!(r.status(), StatusCode::FORBIDDEN);
        }
        add_log(&state, "INFO", "X", "y", "z");
        let r = send(&app, Method::GET, "/api/logs", &[("authorization", &admin)], vec![]).await;
        assert_eq!(r.status(), StatusCode::OK);
        // участник не смог стереть журнал, админ может
        assert!(!state.logs.lock().unwrap().is_empty());
        let r = send(&app, Method::DELETE, "/api/logs", &[("authorization", &admin)], vec![]).await;
        assert_eq!(r.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn params_limit_uses_last_xff_and_cannot_be_bypassed() {
        let app = build_app(test_state());
        let uri = "/api/auth/params/someone";
        for i in 0..PARAMS_IP_LIMIT {
            // каждый раз новое «левое» значение — на лимит это не влияет
            let fake = format!("7.7.{}.{}, 5.5.5.5", i / 200, i % 200);
            let r = send(&app, Method::GET, uri, &[("x-forwarded-for", &fake)], vec![]).await;
            assert_eq!(r.status(), StatusCode::OK);
        }
        let r = send(&app, Method::GET, uri, &[("x-forwarded-for", "8.8.8.8, 5.5.5.5")], vec![]).await;
        assert_eq!(r.status(), StatusCode::TOO_MANY_REQUESTS);
        // другой реальный клиент (последний адрес) не заблокирован
        let r = send(&app, Method::GET, uri, &[("x-forwarded-for", "5.5.5.5, 6.6.6.6")], vec![]).await;
        assert_eq!(r.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn login_limit_is_per_username_not_global() {
        let app = build_app(test_state());
        let login = |u: &str| json_body(serde_json::json!({ "username": u, "client_auth_hash": "bad" }));
        for _ in 0..LOGIN_USER_LIMIT {
            let r = send(&app, Method::POST, "/api/auth/login", &[JSON_CT], login("victim")).await;
            assert_eq!(r.status(), StatusCode::UNAUTHORIZED);
        }
        let r = send(&app, Method::POST, "/api/auth/login", &[JSON_CT], login("victim")).await;
        assert_eq!(r.status(), StatusCode::TOO_MANY_REQUESTS);
        // другой логин с того же IP по-прежнему может пытаться войти
        let r = send(&app, Method::POST, "/api/auth/login", &[JSON_CT], login("someone-else")).await;
        assert_eq!(r.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn invite_lookup_is_rate_limited_per_ip() {
        let app = build_app(test_state());
        let body = |n: usize| json_body(serde_json::json!({ "invite_id": format!("{n:064x}") }));
        for n in 0..INVITE_IP_LIMIT {
            let r = send(&app, Method::POST, "/api/invite/lookup", &[JSON_CT], body(n)).await;
            assert_eq!(r.status(), StatusCode::NOT_FOUND);
        }
        let r = send(&app, Method::POST, "/api/invite/lookup", &[JSON_CT], body(99)).await;
        assert_eq!(r.status(), StatusCode::TOO_MANY_REQUESTS);
    }

    #[tokio::test]
    async fn body_limits_default_and_batch() {
        let state = test_state();
        let auth = format!("Bearer {}", add_session(&state, 1, false));
        let app = build_app(state);
        let pad = |n: usize| {
            let mut v = br#"{"items":[]}"#.to_vec();
            v.extend(std::iter::repeat(b' ').take(n));
            v
        };

        // обычные эндпоинты: выше BODY_LIMIT — 413
        let r = send(&app, Method::POST, "/api/auth/login", &[JSON_CT], pad(BODY_LIMIT + 1)).await;
        assert_eq!(r.status(), StatusCode::PAYLOAD_TOO_LARGE);
        // импорт без сессии: 401 ещё до чтения тела
        let r = send(&app, Method::POST, "/api/vault/batch", &[JSON_CT], pad(BODY_LIMIT * 4)).await;
        assert_eq!(r.status(), StatusCode::UNAUTHORIZED);
        // импорт с сессией: больше обычного лимита проходит, выше своего — 413
        let hdrs = [JSON_CT, ("authorization", auth.as_str())];
        let r = send(&app, Method::POST, "/api/vault/batch", &hdrs, pad(BODY_LIMIT * 4)).await;
        assert_eq!(r.status(), StatusCode::OK);
        let r = send(&app, Method::POST, "/api/vault/batch", &hdrs, pad(BATCH_BODY_LIMIT + 1)).await;
        assert_eq!(r.status(), StatusCode::PAYLOAD_TOO_LARGE);
    }

    #[tokio::test]
    async fn change_password_is_rate_limited_per_user() {
        let state = test_state();
        let key = sample_auth_key();
        let uid = insert_user(&state, "dave", false, &key, false);
        let auth = format!("Bearer {}", add_session(&state, uid, false));
        let app = build_app(state);
        let body = || {
            json_body(serde_json::json!({
                "current_client_auth_hash": "00".repeat(32),
                "new_kdf_salt": "ns",
                "new_client_auth_hash": "b2".repeat(32),
                "new_encrypted_vault_key": "nvk"
            }))
        };
        let hdrs = [JSON_CT, ("authorization", auth.as_str())];
        for _ in 0..CHPW_USER_LIMIT {
            let r = send(&app, Method::POST, "/api/auth/change-password", &hdrs, body()).await;
            assert_eq!(r.status(), StatusCode::UNAUTHORIZED);
        }
        let r = send(&app, Method::POST, "/api/auth/change-password", &hdrs, body()).await;
        assert_eq!(r.status(), StatusCode::TOO_MANY_REQUESTS);
    }

    #[tokio::test]
    async fn change_password_ip_limit_spans_users() {
        let state = test_state();
        let key = sample_auth_key();
        let app = build_app(state.clone());
        let body = json_body(serde_json::json!({
            "current_client_auth_hash": "00".repeat(32),
            "new_kdf_salt": "ns",
            "new_client_auth_hash": "b2".repeat(32),
            "new_encrypted_vault_key": "nvk"
        }));
        // каждая попытка — от нового пользователя, но с одного IP
        for i in 0..CHPW_IP_LIMIT {
            let uid = insert_user(&state, &format!("u-{i}"), false, &key, false);
            let auth = format!("Bearer {}", add_session(&state, uid, false));
            let r = send(&app, Method::POST, "/api/auth/change-password", &[JSON_CT, ("authorization", &auth)], body.clone()).await;
            assert_eq!(r.status(), StatusCode::UNAUTHORIZED);
        }
        let uid = insert_user(&state, "late", false, &key, false);
        let auth = format!("Bearer {}", add_session(&state, uid, false));
        let r = send(&app, Method::POST, "/api/auth/change-password", &[JSON_CT, ("authorization", &auth)], body).await;
        assert_eq!(r.status(), StatusCode::TOO_MANY_REQUESTS);
    }

    #[tokio::test]
    async fn family_quota_is_shared_bytes_based_and_keeps_idor_checks() {
        let state = test_state();
        let key = sample_auth_key();
        let owner = insert_user(&state, "olga", false, &key, false);
        let member = insert_user(&state, "mike", false, &key, false);
        let (small_fam, owner_personal) = {
            let conn = state.db.lock().unwrap();
            let n = MAX_BYTES_PER_USER / 2 - 100;
            let ins = |scope: &str, ct: &str| {
                conn.execute(
                    "INSERT INTO vault_items (owner_id, scope, category, is_favorite, is_trashed, ciphertext, iv, updated_at)
                     VALUES (?1, ?2, 'x', 0, 0, ?3, 'iv', 0)",
                    params![owner, scope, ct],
                )
                .unwrap();
                conn.last_insert_rowid()
            };
            // почти вся семейная квота занята записью владельца (hex(zeroblob(n)) даёт 2n байт)
            conn.execute(
                "INSERT INTO vault_items (owner_id, scope, category, is_favorite, is_trashed, ciphertext, iv, updated_at)
                 VALUES (?1, 'family', 'x', 0, 0, hex(zeroblob(?2)), 'iv', 0)",
                params![owner, n],
            )
            .unwrap();
            (ins("family", "abcd"), ins("personal", "secret"))
        };
        let owner_auth = format!("Bearer {}", add_session(&state, owner, false));
        let member_auth = format!("Bearer {}", add_session(&state, member, false));
        let app = build_app(state);
        let item = |scope: &str, c: &str, n: usize| {
            serde_json::json!({ "scope": scope, "category": "x", "ciphertext": c.repeat(n), "iv": "iv" })
        };
        let oh = [JSON_CT, ("authorization", owner_auth.as_str())];
        let mh = [JSON_CT, ("authorization", member_auth.as_str())];

        // 110 кириллических символов = 220 байт > остатка семейной квоты (196), хотя символов меньше
        let r = send(&app, Method::POST, "/api/vault", &mh, json_body(item("family", "я", 110))).await;
        assert_eq!(r.status(), StatusCode::PAYLOAD_TOO_LARGE);
        // квота общая: участник увеличивает запись владельца, пока сумма в пределах
        let uri = format!("/api/vault/{small_fam}");
        let r = send(&app, Method::PUT, &uri, &mh, json_body(item("family", "a", 100))).await;
        assert_eq!(r.status(), StatusCode::OK);
        // а за пределы — 413 с сообщением про семейную квоту
        let r = send(&app, Method::PUT, &uri, &mh, json_body(item("family", "a", 300))).await;
        assert_eq!(r.status(), StatusCode::PAYLOAD_TOO_LARGE);
        let text = String::from_utf8_lossy(&axum::body::to_bytes(r.into_body(), 1 << 20).await.unwrap()).to_string();
        assert!(text.contains("family_quota"), "{text}");
        // импорт учитывает scope каждой записи: семейные не помещаются, личные — да
        let fam_batch = json_body(serde_json::json!({ "items": [item("family", "a", 60), item("family", "a", 60)] }));
        let r = send(&app, Method::POST, "/api/vault/batch", &mh, fam_batch).await;
        assert_eq!(r.status(), StatusCode::PAYLOAD_TOO_LARGE);
        let pers_batch = json_body(serde_json::json!({ "items": [item("personal", "a", 1000)] }));
        let r = send(&app, Method::POST, "/api/vault/batch", &mh, pers_batch).await;
        assert_eq!(r.status(), StatusCode::OK);
        // личная квота отдельная: семейная заполненность на неё не влияет
        let r = send(&app, Method::POST, "/api/vault", &mh, json_body(item("personal", "a", 5000))).await;
        assert_eq!(r.status(), StatusCode::OK);

        // IDOR не ослаблен: чужая личная запись недоступна на запись
        let uri = format!("/api/vault/{owner_personal}");
        let r = send(&app, Method::PUT, &uri, &mh, json_body(item("personal", "a", 1))).await;
        assert_eq!(r.status(), StatusCode::FORBIDDEN);
        let r = send(&app, Method::PUT, &uri, &oh, json_body(item("personal", "a", 1))).await;
        assert_eq!(r.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn byte_quota_blocks_create_batch_and_growing_update() {
        let state = test_state();
        let key = sample_auth_key();
        let uid = insert_user(&state, "erin", false, &key, false);
        let auth = format!("Bearer {}", add_session(&state, uid, false));
        // запись, занимающая почти всю квоту (hex(zeroblob(n)) даёт строку длиной 2n)
        let big_id = {
            let conn = state.db.lock().unwrap();
            let n = MAX_BYTES_PER_USER / 2 - 100;
            conn.execute(
                "INSERT INTO vault_items (owner_id, scope, category, is_favorite, is_trashed, ciphertext, iv, updated_at)
                 VALUES (?1, 'personal', 'x', 0, 0, hex(zeroblob(?2)), 'iv', 0)",
                params![uid, n],
            )
            .unwrap();
            conn.last_insert_rowid()
        };
        let app = build_app(state);
        let hdrs = [JSON_CT, ("authorization", auth.as_str())];
        let item = |len: usize| {
            serde_json::json!({ "scope": "personal", "category": "x", "ciphertext": "a".repeat(len), "iv": "iv" })
        };

        let r = send(&app, Method::POST, "/api/vault", &hdrs, json_body(item(1000))).await;
        assert_eq!(r.status(), StatusCode::PAYLOAD_TOO_LARGE);
        let batch = json_body(serde_json::json!({ "items": [item(70), item(70), item(70)] }));
        let r = send(&app, Method::POST, "/api/vault/batch", &hdrs, batch).await;
        assert_eq!(r.status(), StatusCode::PAYLOAD_TOO_LARGE);
        // небольшая запись помещается
        let r = send(&app, Method::POST, "/api/vault", &hdrs, json_body(item(50))).await;
        assert_eq!(r.status(), StatusCode::OK);
        // обновление большой записи не считает её старый размер дважды
        let uri = format!("/api/vault/{big_id}");
        let r = send(&app, Method::PUT, &uri, &hdrs, json_body(item(10))).await;
        assert_eq!(r.status(), StatusCode::OK);
    }

    // ---------- аудит 2026-10-23 ----------

    #[tokio::test]
    async fn fake_salts_are_distinct_stable_and_secret_keyed() {
        let state = test_state();
        let key = sample_auth_key();
        insert_user(&state, "real", false, &key, false);
        let app = build_app(state.clone());
        let params = |u: &str| {
            let app = app.clone();
            let uri = format!("/api/auth/params/{u}");
            async move { body_json(send(&app, Method::GET, &uri, &[], vec![]).await).await }
        };

        let a = params("ghost").await;
        let (kdf, rec) = (a["kdf_salt"].as_str().unwrap(), a["recovery_salt"].as_str().unwrap());
        assert_ne!(kdf, rec);
        for s in [kdf, rec] {
            assert!(s.len() == 32 && s.bytes().all(|b| b.is_ascii_hexdigit()), "{s}");
        }
        // старая формула без секрета больше не совпадает
        assert!(!hex::encode(Sha256::digest(b"fake_salt_ghost")).starts_with(kdf));
        // стабильны для имени (и регистра), разные для разных имён
        assert_eq!(params("GHOST").await, a);
        assert_ne!(params("ghost2").await["kdf_salt"], a["kdf_salt"]);
        // реальный пользователь получает свои соли из БД
        let r = params("real").await;
        assert_eq!((r["kdf_salt"].as_str(), r["recovery_salt"].as_str()), (Some("s"), Some("rs")));

        // другой секрет — другие соли: без него их не вычислить
        let other = test_state();
        assert_ne!(other.fake_salt_secret, state.fake_salt_secret);
        assert_ne!(fake_salt(&other.fake_salt_secret, "kdf", "ghost"), kdf);
    }

    #[test]
    fn server_secret_survives_restart_and_old_users_keep_working() {
        // БД, созданная до появления server_meta: таблицы нет, пользователь и запись уже есть
        let path = env::temp_dir().join(format!("fravashi-up-{}.db", random_hex(8)));
        let key = sample_auth_key();
        {
            let conn = init_db(&path.to_string_lossy());
            conn.execute_batch("DROP TABLE server_meta;").unwrap();
            conn.execute(
                "INSERT INTO users (username, is_admin, kdf_version, kdf_salt, server_auth_verifier,
                    encrypted_vault_key, recovery_salt, recovery_auth_verifier, recovery_encrypted_vault_key, created_at)
                 VALUES ('old', 1, 2, 'oldsalt', ?1, 'vk', 'rs', ?1, 'rvk', 0)",
                params![hash_auth_key(&key).ok().unwrap()],
            )
            .unwrap();
            conn.execute(
                "INSERT INTO vault_items (owner_id, scope, ciphertext, iv, updated_at) VALUES (1, 'personal', 'ct', 'iv', 0)",
                [],
            )
            .unwrap();
        }
        let s1 = AppState::new(init_db(&path.to_string_lossy()), "d".into(), vec![], vec![]).fake_salt_secret;
        let s2 = AppState::new(init_db(&path.to_string_lossy()), "d".into(), vec![], vec![]).fake_salt_secret;
        assert_eq!(s1.len(), 32);
        assert_eq!(s1, s2, "секрет создаётся один раз");

        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            let state = Arc::new(AppState::new(init_db(&path.to_string_lossy()), "d".into(), vec![], vec![]));
            let app = build_app(state);
            let p = body_json(send(&app, Method::GET, "/api/auth/params/old", &[], vec![]).await).await;
            assert_eq!(p["kdf_salt"], "oldsalt");
            let login = json_body(serde_json::json!({ "username": "old", "client_auth_hash": key }));
            let r = send(&app, Method::POST, "/api/auth/login", &[JSON_CT], login).await;
            assert_eq!(r.status(), StatusCode::OK);
            let tok = body_json(r).await["token"].as_str().unwrap().to_string();
            let auth = format!("Bearer {tok}");
            let v = body_json(send(&app, Method::GET, "/api/vault", &[("authorization", &auth)], vec![]).await).await;
            assert_eq!(v["items"][0]["ciphertext"], "ct");
        });
        let _ = fs::remove_file(&path);
    }

    #[tokio::test]
    async fn recovery_errors_do_not_reveal_username() {
        let state = test_state();
        insert_user(&state, "frank", false, &sample_auth_key(), false);
        let app = build_app(state);
        let wrong = "00".repeat(32);
        type Body = fn(&str, &str) -> serde_json::Value;
        let cases: [(&str, Body); 2] = [
            ("/api/auth/recovery-fetch", |u: &str, k: &str| serde_json::json!({ "username": u, "client_auth_hash": k })),
            ("/api/auth/recovery-reset", |u: &str, k: &str| serde_json::json!({
                "username": u, "recovery_auth_hash": k,
                "new_kdf_salt": "ns", "new_client_auth_hash": "b2".repeat(32), "new_encrypted_vault_key": "nvk"
            })),
        ];
        for (uri, body) in cases {
            let existing = send(&app, Method::POST, uri, &[JSON_CT], json_body(body("frank", &wrong))).await;
            let missing = send(&app, Method::POST, uri, &[JSON_CT], json_body(body("nobody", &wrong))).await;
            assert_eq!(existing.status(), StatusCode::UNAUTHORIZED, "{uri}");
            assert_eq!(missing.status(), existing.status(), "{uri}");
            let (e, m) = (body_json(existing).await, body_json(missing).await);
            assert_eq!(e, m, "{uri}");
            assert_eq!(e["detail"], "bad_recovery_key");
        }
    }

    fn first_register_body(setup_token: Option<&str>) -> Vec<u8> {
        json_body(serde_json::json!({
            "username": "owner", "kdf_salt": "s", "client_auth_hash": sample_auth_key(),
            "encrypted_vault_key": "vk", "recovery_salt": "rs", "recovery_auth_hash": "b2".repeat(32),
            "recovery_encrypted_vault_key": "rvk", "encrypted_family_key": "fk",
            "encrypted_escrow_private_key": "epk", "setup_token": setup_token
        }))
    }

    #[tokio::test]
    async fn setup_token_guards_first_registration() {
        let state = test_state_with(|s| s.setup_token = Some("let-me-in".into()));
        let app = build_app(state);
        let st = body_json(send(&app, Method::GET, "/api/status", &[], vec![]).await).await;
        assert_eq!(st, serde_json::json!({ "initialized": false, "setup_token_required": true }));

        for bad in [None, Some(""), Some("let-me-i"), Some("let-me-in!")] {
            let r = send(&app, Method::POST, "/api/auth/register", &[JSON_CT], first_register_body(bad)).await;
            assert_eq!(r.status(), StatusCode::FORBIDDEN, "{bad:?}");
            assert_eq!(body_json(r).await["detail"], "setup_token_invalid");
        }
        let r = send(&app, Method::POST, "/api/auth/register", &[JSON_CT], first_register_body(Some("let-me-in"))).await;
        assert_eq!(r.status(), StatusCode::OK);
        assert_eq!(body_json(r).await["is_admin"], true);
        let st = body_json(send(&app, Method::GET, "/api/status", &[], vec![]).await).await;
        assert_eq!(st, serde_json::json!({ "initialized": true, "setup_token_required": false }));
    }

    #[tokio::test]
    async fn without_setup_token_first_registration_is_unchanged() {
        let app = build_app(test_state_with(|s| s.setup_token = None));
        let st = body_json(send(&app, Method::GET, "/api/status", &[], vec![]).await).await;
        // число пользователей и версия без входа не раскрываются
        assert_eq!(st, serde_json::json!({ "initialized": false, "setup_token_required": false }));
        let r = send(&app, Method::POST, "/api/auth/register", &[JSON_CT], first_register_body(None)).await;
        assert_eq!(r.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn admin_reset_is_rate_limited() {
        let state = test_state();
        let key = sample_auth_key();
        let admin_id = insert_user(&state, "admin", true, &key, false);
        let auth = format!("Bearer {}", add_session(&state, admin_id, true));
        let app = build_app(state);
        // несуществующий участник: попытки всё равно считаются
        let body = json_body(serde_json::json!({
            "target_user_id": 999, "new_kdf_salt": "ns",
            "new_client_auth_hash": "b2".repeat(32), "new_encrypted_vault_key": "nvk"
        }));
        let hdrs = [JSON_CT, ("authorization", auth.as_str())];
        for _ in 0..ADMIN_RESET_LIMIT {
            let r = send(&app, Method::POST, "/api/admin/recover-member", &hdrs, body.clone()).await;
            assert_eq!(r.status(), StatusCode::BAD_REQUEST);
        }
        let r = send(&app, Method::POST, "/api/admin/recover-member", &hdrs, body).await;
        assert_eq!(r.status(), StatusCode::TOO_MANY_REQUESTS);
    }

    #[tokio::test]
    async fn only_owner_can_make_family_item_personal() {
        let state = test_state();
        let key = sample_auth_key();
        let owner = insert_user(&state, "olga", false, &key, false);
        let member = insert_user(&state, "mike", false, &key, false);
        let fam = {
            let conn = state.db.lock().unwrap();
            conn.execute(
                "INSERT INTO vault_items (owner_id, scope, ciphertext, iv, updated_at) VALUES (?1, 'family', 'ct', 'iv', 0)",
                params![owner],
            )
            .unwrap();
            conn.last_insert_rowid()
        };
        let oh = format!("Bearer {}", add_session(&state, owner, false));
        let mh = format!("Bearer {}", add_session(&state, member, false));
        let app = build_app(state.clone());
        let uri = format!("/api/vault/{fam}");
        let item = |scope: &str| json_body(serde_json::json!({ "scope": scope, "ciphertext": "new", "iv": "iv" }));

        // участник правит семейную запись, но сделать её личной не может
        let r = send(&app, Method::PUT, &uri, &[JSON_CT, ("authorization", &mh)], item("family")).await;
        assert_eq!(r.status(), StatusCode::OK);
        let r = send(&app, Method::PUT, &uri, &[JSON_CT, ("authorization", &mh)], item("personal")).await;
        assert_eq!(r.status(), StatusCode::FORBIDDEN);
        let scope: String = state.db.lock().unwrap()
            .query_row("SELECT scope FROM vault_items WHERE id = ?1", params![fam], |r| r.get(0)).unwrap();
        assert_eq!(scope, "family");
        // владелец может
        let r = send(&app, Method::PUT, &uri, &[JSON_CT, ("authorization", &oh)], item("personal")).await;
        assert_eq!(r.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn batch_import_failure_rolls_back_and_reports_error() {
        let state = test_state();
        let uid = insert_user(&state, "gina", false, &sample_auth_key(), false);
        // Сбой INSERT на второй записи имитируется триггером
        state.db.lock().unwrap().execute_batch(
            "CREATE TRIGGER boom BEFORE INSERT ON vault_items WHEN NEW.category = 'boom'
             BEGIN SELECT RAISE(ABORT, 'boom'); END;",
        ).unwrap();
        let auth = format!("Bearer {}", add_session(&state, uid, false));
        let app = build_app(state.clone());
        let hdrs = [JSON_CT, ("authorization", auth.as_str())];
        let it = |cat: &str| serde_json::json!({ "scope": "personal", "category": cat, "ciphertext": "c", "iv": "iv" });

        let r = send(&app, Method::POST, "/api/vault/batch", &hdrs, json_body(serde_json::json!({ "items": [it("ok"), it("boom")] }))).await;
        assert_eq!(r.status(), StatusCode::INTERNAL_SERVER_ERROR);
        assert_eq!(body_json(r).await["detail"], "internal");
        let n: i64 = state.db.lock().unwrap()
            .query_row("SELECT COUNT(*) FROM vault_items", [], |r| r.get(0)).unwrap();
        assert_eq!(n, 0, "первая запись откатилась вместе со второй");

        let r = send(&app, Method::POST, "/api/vault/batch", &hdrs, json_body(serde_json::json!({ "items": [it("ok"), it("ok")] }))).await;
        assert_eq!(r.status(), StatusCode::OK);
        assert_eq!(body_json(r).await["imported_count"], 2);
    }

    // ---------- TOTP ----------

    fn code_at(secret: &[u8], ts: i64) -> String {
        format!("{:06}", hotp(secret, (ts / TOTP_STEP) as u64, TOTP_DIGITS))
    }

    // TOTP включён напрямую в БД (минуя API): секрет и резервные коды для проверок входа
    fn enable_totp_direct(state: &AppState, uid: i64) -> (Vec<u8>, Vec<String>) {
        let mut secret = vec![0u8; TOTP_SECRET_LEN];
        OsRng.fill_bytes(&mut secret);
        let codes = generate_backup_codes();
        let conn = state.db.lock().unwrap();
        conn.execute(
            "INSERT INTO user_totp (user_id, secret_enc, enabled, last_step, created_at) VALUES (?1, ?2, 1, 0, 0)",
            params![uid, seal_totp_secret(&state.totp_key, uid, &secret).ok().unwrap()],
        )
        .unwrap();
        for c in &codes {
            conn.execute(
                "INSERT INTO totp_backup_codes (user_id, code_hash) VALUES (?1, ?2)",
                params![uid, backup_code_hash(&state.totp_key, &normalize_code(c))],
            )
            .unwrap();
        }
        (secret, codes)
    }

    async fn login(app: &Router, user: &str, key: &str) -> Response {
        let body = json_body(serde_json::json!({ "username": user, "client_auth_hash": key }));
        send(app, Method::POST, "/api/auth/login", &[JSON_CT], body).await
    }

    async fn login_challenge(app: &Router, user: &str, key: &str) -> String {
        let r = login(app, user, key).await;
        assert_eq!(r.status(), StatusCode::OK);
        let v = body_json(r).await;
        assert_eq!(v["totp_required"], true);
        assert!(v.get("token").is_none(), "без второго шага сессии нет");
        v["challenge"].as_str().unwrap().to_string()
    }

    async fn totp_step(app: &Router, challenge: &str, code: &str) -> Response {
        let body = json_body(serde_json::json!({ "challenge": challenge, "code": code }));
        send(app, Method::POST, "/api/auth/login/totp", &[JSON_CT], body).await
    }

    async fn detail(r: Response) -> (StatusCode, serde_json::Value) {
        let st = r.status();
        (st, body_json(r).await["detail"].clone())
    }

    #[test]
    fn totp_matches_rfc6238_sha1_vectors() {
        // RFC 6238, приложение B (SHA-1, 8 цифр)
        let secret = b"12345678901234567890";
        for (t, code) in [
            (59u64, 94287082),
            (1111111109, 7081804),
            (1111111111, 14050471),
            (1234567890, 89005924),
            (2000000000, 69279037),
            (20000000000, 65353130),
        ] {
            assert_eq!(hotp(secret, t / 30, 8), code, "t={t}");
        }
        // 6 цифр — младшие разряды того же числа
        assert_eq!(format!("{:06}", hotp(secret, 59 / 30, 6)), "287082");
        assert_eq!(totp_match(secret, "287082", 59, 0), Some(1));
        assert_eq!(totp_match(secret, "081804", 1111111109, 0), Some(1111111109 / 30));
    }

    #[test]
    fn totp_window_is_plus_minus_one_step_and_replay_is_rejected() {
        let secret = b"window-test-secret!!";
        let now = 1_700_000_015; // середина шага
        let cur = now / TOTP_STEP;
        for d in -1..=1 {
            let code = code_at(secret, now + d * TOTP_STEP);
            assert_eq!(totp_match(secret, &code, now, 0), Some(cur + d), "сдвиг {d}");
        }
        for d in [-2, 2] {
            assert_eq!(totp_match(secret, &code_at(secret, now + d * TOTP_STEP), now, 0), None, "сдвиг {d}");
        }
        // использованный шаг и более ранние повторно не принимаются, следующий — да
        let code = code_at(secret, now);
        assert_eq!(totp_match(secret, &code, now, cur), None);
        assert_eq!(totp_match(secret, &code_at(secret, now - TOTP_STEP), now, cur), None);
        assert_eq!(totp_match(secret, &code_at(secret, now + TOTP_STEP), now, cur), Some(cur + 1));
        for bad in ["", "12345", "1234567", "12a456", " 12345"] {
            assert_eq!(totp_match(secret, bad, now, 0), None, "{bad:?}");
        }
    }

    #[test]
    fn base32_matches_rfc4648_and_uri_is_well_formed() {
        for (input, out) in [("", ""), ("f", "MY"), ("fo", "MZXQ"), ("foo", "MZXW6"), ("foob", "MZXW6YQ"), ("fooba", "MZXW6YTB"), ("foobar", "MZXW6YTBOI")] {
            assert_eq!(base32_encode(input.as_bytes()), out, "{input}");
        }
        assert_eq!(base32_encode(&[0u8; TOTP_SECRET_LEN]).len(), 32);
        assert_eq!(
            totp_uri("анна b", "ABC"),
            "otpauth://totp/FravashiVault:%D0%B0%D0%BD%D0%BD%D0%B0%20b?secret=ABC&issuer=FravashiVault&algorithm=SHA1&digits=6&period=30"
        );
    }

    #[test]
    fn totp_secret_is_sealed_and_bound_to_user() {
        let key = [7u8; 32];
        let secret = b"0123456789abcdefghij";
        let sealed = seal_totp_secret(&key, 5, secret).ok().unwrap();
        assert!(sealed.starts_with("v1:"));
        assert!(!sealed.contains(&hex::encode(secret)) && !sealed.contains(&base32_encode(secret)));
        assert_ne!(sealed, seal_totp_secret(&key, 5, secret).ok().unwrap(), "новый nonce каждый раз");
        assert_eq!(open_totp_secret(&key, 5, &sealed).as_deref(), Some(&secret[..]));
        assert!(open_totp_secret(&key, 6, &sealed).is_none(), "чужой пользователь");
        assert!(open_totp_secret(&[8u8; 32], 5, &sealed).is_none(), "другой ключ");
        let mut tampered = sealed.clone();
        let last = tampered.pop().unwrap();
        tampered.push(if last == '0' { '1' } else { '0' });
        assert!(open_totp_secret(&key, 5, &tampered).is_none());
        assert!(open_totp_secret(&key, 5, "garbage").is_none());
    }

    #[test]
    fn backup_codes_are_random_80_bit_and_hashed() {
        let codes = generate_backup_codes();
        assert_eq!(codes.len(), BACKUP_CODES_COUNT);
        let uniq: std::collections::HashSet<_> = codes.iter().collect();
        assert_eq!(uniq.len(), codes.len());
        for c in &codes {
            assert_eq!(c.len(), 19, "{c}"); // 16 символов base32 (80 бит) + 3 дефиса
            assert!(normalize_code(c).bytes().all(|b| b.is_ascii_uppercase() || (b'2'..=b'7').contains(&b)));
        }
        let key = [1u8; 32];
        let h = backup_code_hash(&key, &normalize_code(&codes[0]));
        assert_eq!(h, backup_code_hash(&key, &normalize_code(&codes[0].to_lowercase().replace('-', " "))));
        assert!(!h.contains(&normalize_code(&codes[0])));
    }

    #[tokio::test]
    async fn totp_enable_flow_and_backup_codes_are_single_use() {
        let state = test_state();
        let key = sample_auth_key();
        let uid = insert_user(&state, "tina", false, &key, false);
        let auth = format!("Bearer {}", add_session(&state, uid, false));
        let app = build_app(state.clone());
        let hdrs = [JSON_CT, ("authorization", auth.as_str())];

        let st = body_json(send(&app, Method::GET, "/api/auth/totp", &hdrs, vec![]).await).await;
        assert_eq!(st, serde_json::json!({ "enabled": false, "backup_codes_left": 0 }));

        // без верного мастер-пароля секрет не выдаётся
        let r = send(&app, Method::POST, "/api/auth/totp/setup", &hdrs, json_body(serde_json::json!({ "client_auth_hash": "00".repeat(32) }))).await;
        assert_eq!(detail(r).await, (StatusCode::UNAUTHORIZED, serde_json::json!("wrong_current_password")));

        let r = send(&app, Method::POST, "/api/auth/totp/setup", &hdrs, json_body(serde_json::json!({ "client_auth_hash": key }))).await;
        assert_eq!(r.status(), StatusCode::OK);
        let setup = body_json(r).await;
        let b32 = setup["secret"].as_str().unwrap().to_string();
        assert_eq!(b32.len(), 32);
        // add_session подписывает тестовую сессию именем u<id>
        let uri = setup["otpauth_uri"].as_str().unwrap();
        assert!(uri.starts_with(&format!("otpauth://totp/FravashiVault:u{uid}?secret={b32}&issuer=FravashiVault")), "{uri}");
        let stored: String = state.db.lock().unwrap()
            .query_row("SELECT secret_enc FROM user_totp WHERE user_id = ?1", params![uid], |r| r.get(0)).unwrap();
        assert!(stored.starts_with("v1:") && !stored.contains(&b32), "секрет в БД только зашифрованным");
        let secret = open_totp_secret(&state.totp_key, uid, &stored).unwrap();
        assert_eq!(base32_encode(&secret), b32);

        // пока код не подтверждён, вход — как раньше
        assert!(body_json(login(&app, "tina", &key).await).await["token"].is_string());

        let now = now_ts();
        let wrong = format!("{:06}", (code_at(&secret, now).parse::<u32>().unwrap() + 1) % 1_000_000);
        let r = send(&app, Method::POST, "/api/auth/totp/enable", &hdrs, json_body(serde_json::json!({ "code": wrong }))).await;
        assert_eq!(detail(r).await, (StatusCode::UNAUTHORIZED, serde_json::json!("bad_totp")));
        let r = send(&app, Method::POST, "/api/auth/totp/enable", &hdrs, json_body(serde_json::json!({ "code": code_at(&secret, now) }))).await;
        assert_eq!(r.status(), StatusCode::OK);
        let codes: Vec<String> = serde_json::from_value(body_json(r).await["backup_codes"].clone()).unwrap();
        assert_eq!(codes.len(), BACKUP_CODES_COUNT);
        let st = body_json(send(&app, Method::GET, "/api/auth/totp", &hdrs, vec![]).await).await;
        assert_eq!(st, serde_json::json!({ "enabled": true, "backup_codes_left": 10 }));
        let r = send(&app, Method::POST, "/api/auth/totp/setup", &hdrs, json_body(serde_json::json!({ "client_auth_hash": key }))).await;
        assert_eq!(detail(r).await, (StatusCode::CONFLICT, serde_json::json!("totp_already_enabled")));
        // в БД — только хеши резервных кодов
        let hashes: Vec<String> = state.db.lock().unwrap()
            .prepare("SELECT code_hash FROM totp_backup_codes").unwrap()
            .query_map([], |r| r.get(0)).unwrap().flatten().collect();
        assert_eq!(hashes.len(), 10);
        assert!(codes.iter().all(|c| !hashes.iter().any(|h| h.contains(&normalize_code(c)))));

        // резервный код (в любом регистре и с пробелами) входит один раз
        let ch = login_challenge(&app, "tina", &key).await;
        let typed = codes[0].to_lowercase().replace('-', " ");
        let r = totp_step(&app, &ch, &typed).await;
        assert_eq!(r.status(), StatusCode::OK);
        assert!(body_json(r).await["encrypted_vault_key"].is_string());
        let ch = login_challenge(&app, "tina", &key).await;
        assert_eq!(detail(totp_step(&app, &ch, &codes[0]).await).await, (StatusCode::UNAUTHORIZED, serde_json::json!("bad_totp")));
        let st = body_json(send(&app, Method::GET, "/api/auth/totp", &hdrs, vec![]).await).await;
        assert_eq!(st["backup_codes_left"], 9);

        // отключение: пароль + код; шаг, использованный при включении, уже не годится
        let disable = |code: String| json_body(serde_json::json!({ "client_auth_hash": key, "code": code }));
        let r = send(&app, Method::POST, "/api/auth/totp/disable", &hdrs, disable(code_at(&secret, now))).await;
        assert_eq!(detail(r).await, (StatusCode::UNAUTHORIZED, serde_json::json!("bad_totp")));
        let r = send(&app, Method::POST, "/api/auth/totp/disable", &hdrs, json_body(serde_json::json!({ "client_auth_hash": "00".repeat(32), "code": codes[1] }))).await;
        assert_eq!(detail(r).await, (StatusCode::UNAUTHORIZED, serde_json::json!("wrong_current_password")));
        let r = send(&app, Method::POST, "/api/auth/totp/disable", &hdrs, disable(code_at(&secret, now + TOTP_STEP))).await;
        assert_eq!(r.status(), StatusCode::OK);
        let n: i64 = state.db.lock().unwrap()
            .query_row("SELECT (SELECT COUNT(*) FROM user_totp) + (SELECT COUNT(*) FROM totp_backup_codes)", [], |r| r.get(0)).unwrap();
        assert_eq!(n, 0);
        assert!(body_json(login(&app, "tina", &key).await).await["token"].is_string());
        let r = send(&app, Method::POST, "/api/auth/totp/disable", &hdrs, disable(codes[2].clone())).await;
        assert_eq!(detail(r).await, (StatusCode::BAD_REQUEST, serde_json::json!("totp_not_enabled")));
    }

    #[tokio::test]
    async fn totp_login_rejects_replayed_code() {
        let state = test_state();
        let key = sample_auth_key();
        let uid = insert_user(&state, "rita", false, &key, false);
        let (secret, _) = enable_totp_direct(&state, uid);
        let app = build_app(state.clone());
        let now = now_ts();

        let ch = login_challenge(&app, "rita", &key).await;
        let r = totp_step(&app, &ch, &code_at(&secret, now)).await;
        assert_eq!(r.status(), StatusCode::OK);
        let v = body_json(r).await;
        assert!(v["token"].is_string() && v["username"] == "rita");

        let ch = login_challenge(&app, "rita", &key).await;
        assert_eq!(detail(totp_step(&app, &ch, &code_at(&secret, now)).await).await, (StatusCode::UNAUTHORIZED, serde_json::json!("bad_totp")));
        // код следующего шага (в пределах окна) проходит
        assert_eq!(totp_step(&app, &ch, &code_at(&secret, now + TOTP_STEP)).await.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn totp_challenge_is_single_use_expires_and_bound_to_user() {
        let state = test_state();
        let key = sample_auth_key();
        let a = insert_user(&state, "anna", false, &key, false);
        let b = insert_user(&state, "boris", false, &key, false);
        let (sa, codes_a) = enable_totp_direct(&state, a);
        let (sb, codes_b) = enable_totp_direct(&state, b);
        let app = build_app(state.clone());
        let now = now_ts();
        let expired = (StatusCode::UNAUTHORIZED, serde_json::json!("totp_challenge_expired"));
        let bad = (StatusCode::UNAUTHORIZED, serde_json::json!("bad_totp"));

        // код и резервный код другого пользователя к чужому challenge не подходят
        let ch = login_challenge(&app, "anna", &key).await;
        assert_eq!(detail(totp_step(&app, &ch, &codes_b[0]).await).await, bad);
        if code_at(&sb, now) != code_at(&sa, now) {
            assert_eq!(detail(totp_step(&app, &ch, &code_at(&sb, now)).await).await, bad);
        }
        // challenge в карте лежит хешем, а не самим токеном
        assert!(!state.totp_challenges.lock().unwrap().contains_key(&ch));
        let r = totp_step(&app, &ch, &codes_a[0]).await;
        assert_eq!(body_json(r).await["username"], "anna");
        // повтор того же challenge
        assert_eq!(detail(totp_step(&app, &ch, &codes_a[1]).await).await, expired);
        assert_eq!(detail(totp_step(&app, "no-such-challenge", &codes_a[1]).await).await, expired);

        // срок 5 минут
        let ch = login_challenge(&app, "anna", &key).await;
        for c in state.totp_challenges.lock().unwrap().values_mut() {
            c.exp = now_ts() - 1;
        }
        assert_eq!(detail(totp_step(&app, &ch, &codes_a[1]).await).await, expired);

        // после TOTP_CHALLENGE_MAX_FAILS неверных кодов challenge аннулирован, даже верный код не поможет
        let ch = login_challenge(&app, "boris", &key).await;
        for _ in 0..TOTP_CHALLENGE_MAX_FAILS {
            assert_eq!(detail(totp_step(&app, &ch, "AAAA-AAAA-AAAA-AAAA").await).await, bad);
        }
        assert_eq!(detail(totp_step(&app, &ch, &codes_b[1]).await).await, expired);
        // резервный код от этого не потрачен
        let ch = login_challenge(&app, "boris", &key).await;
        assert_eq!(totp_step(&app, &ch, &codes_b[1]).await.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn totp_step_is_rate_limited_per_user_and_ip() {
        let state = test_state();
        let key = sample_auth_key();
        let uid = insert_user(&state, "lena", false, &key, false);
        let (_, codes) = enable_totp_direct(&state, uid);
        let app = build_app(state.clone());

        // по пользователю: неверные коды считаются и через новые challenge
        let mut ch = login_challenge(&app, "lena", &key).await;
        for i in 0..TOTP_USER_LIMIT {
            if i > 0 && i as u32 % TOTP_CHALLENGE_MAX_FAILS == 0 {
                ch = login_challenge(&app, "lena", &key).await;
            }
            assert_eq!(totp_step(&app, &ch, "000000").await.status(), StatusCode::UNAUTHORIZED, "{i}");
        }
        let ch = login_challenge(&app, "lena", &key).await;
        let r = totp_step(&app, &ch, &codes[0]).await;
        assert_eq!(detail(r).await, (StatusCode::TOO_MANY_REQUESTS, serde_json::json!("too_many_attempts")));

        // по IP: несуществующие challenge тоже считаются
        let state = test_state();
        let app = build_app(state);
        for _ in 0..TOTP_IP_LIMIT {
            assert_eq!(totp_step(&app, "x", "000000").await.status(), StatusCode::UNAUTHORIZED);
        }
        assert_eq!(totp_step(&app, "x", "000000").await.status(), StatusCode::TOO_MANY_REQUESTS);
    }

    #[tokio::test]
    async fn recovery_and_admin_reset_disable_totp() {
        let state = test_state();
        let key = sample_auth_key();
        let admin = insert_user(&state, "admin", true, &key, false);
        let u = insert_user(&state, "vera", false, &key, true);
        let app = build_app(state.clone());
        let totp_rows = |uid: i64| -> i64 {
            state.db.lock().unwrap().query_row(
                "SELECT (SELECT COUNT(*) FROM user_totp WHERE user_id = ?1) + (SELECT COUNT(*) FROM totp_backup_codes WHERE user_id = ?1)",
                params![uid], |r| r.get(0)).unwrap()
        };
        let new_key = "b2".repeat(32);

        // сброс по ключу восстановления (в insert_user он совпадает с ключом входа)
        enable_totp_direct(&state, u);
        let pending = login_challenge(&app, "vera", &key).await;
        let body = json_body(serde_json::json!({
            "username": "vera", "recovery_auth_hash": key,
            "new_kdf_salt": "ns", "new_client_auth_hash": new_key, "new_encrypted_vault_key": "nvk"
        }));
        assert_eq!(send(&app, Method::POST, "/api/auth/recovery-reset", &[JSON_CT], body).await.status(), StatusCode::OK);
        assert_eq!(totp_rows(u), 0);
        assert!(state.totp_challenges.lock().unwrap().is_empty(), "ожидающие входы аннулированы");
        assert_eq!(detail(totp_step(&app, &pending, "000000").await).await.1, "totp_challenge_expired");
        assert!(body_json(login(&app, "vera", &new_key).await).await["token"].is_string());

        // сброс админом
        enable_totp_direct(&state, u);
        let auth = format!("Bearer {}", add_session(&state, admin, true));
        let body = json_body(serde_json::json!({
            "target_user_id": u, "new_kdf_salt": "ns", "new_client_auth_hash": key, "new_encrypted_vault_key": "nvk"
        }));
        let r = send(&app, Method::POST, "/api/admin/recover-member", &[JSON_CT, ("authorization", &auth)], body).await;
        assert_eq!(r.status(), StatusCode::OK);
        assert_eq!(totp_rows(u), 0);
        assert!(body_json(login(&app, "vera", &key).await).await["token"].is_string());
    }

    #[tokio::test]
    async fn login_fails_closed_when_totp_state_is_unreadable() {
        let state = test_state();
        let key = sample_auth_key();
        insert_user(&state, "olga", false, &key, false);
        // сбой запроса к user_totp: вход не должен пройти без второго фактора
        state.db.lock().unwrap().execute_batch("DROP INDEX idx_totp_backup_user; DROP TABLE totp_backup_codes; DROP TABLE user_totp;").unwrap();
        let app = build_app(state.clone());
        let (st, d) = detail(login(&app, "olga", &key).await).await;
        assert_eq!((st, d), (StatusCode::INTERNAL_SERVER_ERROR, serde_json::json!("internal")));
        assert!(state.sessions.lock().unwrap().is_empty());
    }

    #[tokio::test]
    async fn change_password_cancels_pending_totp_sign_ins() {
        let state = test_state();
        let key = sample_auth_key();
        let uid = insert_user(&state, "petr", false, &key, false);
        let other = insert_user(&state, "zoya", false, &key, false);
        let (_, codes) = enable_totp_direct(&state, uid);
        let (_, other_codes) = enable_totp_direct(&state, other);
        let app = build_app(state.clone());
        // ожидающий вход по старому паролю (например, у того, кто его украл)
        let pending = login_challenge(&app, "petr", &key).await;
        let other_pending = login_challenge(&app, "zoya", &key).await;
        let auth = format!("Bearer {}", add_session(&state, uid, false));
        let body = json_body(serde_json::json!({
            "current_client_auth_hash": key, "new_kdf_salt": "ns",
            "new_client_auth_hash": "b2".repeat(32), "new_encrypted_vault_key": "nvk"
        }));
        let r = send(&app, Method::POST, "/api/auth/change-password", &[JSON_CT, ("authorization", &auth)], body).await;
        assert_eq!(r.status(), StatusCode::OK);
        assert_eq!(detail(totp_step(&app, &pending, &codes[0]).await).await.1, "totp_challenge_expired");
        // чужие ожидающие входы не затронуты
        assert_eq!(totp_step(&app, &other_pending, &other_codes[0]).await.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn login_without_totp_is_unchanged() {
        let state = test_state();
        let key = sample_auth_key();
        insert_user(&state, "ivan", false, &key, true);
        let app = build_app(state.clone());
        let r = login(&app, "ivan", &key).await;
        assert_eq!(r.status(), StatusCode::OK);
        let v = body_json(r).await;
        let mut fields: Vec<&str> = v.as_object().unwrap().keys().map(|k| k.as_str()).collect();
        fields.sort();
        assert_eq!(
            fields,
            ["encrypted_escrow_private_key", "encrypted_family_key", "encrypted_vault_key", "has_admin_escrow", "is_admin", "kdf_salt", "token", "username"]
        );
        assert_eq!(v["username"], "ivan");
        assert_eq!(v["kdf_salt"], "s");
        assert_eq!(v["encrypted_vault_key"], "vk");
        assert_eq!(v["has_admin_escrow"], true);
        assert!(state.sessions.lock().unwrap().contains_key(v["token"].as_str().unwrap()));
        assert!(state.totp_challenges.lock().unwrap().is_empty());
        // неверный пароль — прежний код ошибки
        assert_eq!(detail(login(&app, "ivan", &"00".repeat(32)).await).await, (StatusCode::UNAUTHORIZED, serde_json::json!("bad_credentials")));
    }

    #[test]
    fn database_without_totp_tables_is_migrated() {
        // БД, созданная до появления TOTP: таблиц user_totp и totp_backup_codes нет, данные уже есть
        let path = env::temp_dir().join(format!("fravashi-totp-up-{}.db", random_hex(8)));
        let key = sample_auth_key();
        let secret_before = {
            let conn = init_db(&path.to_string_lossy());
            conn.execute_batch("DROP INDEX idx_totp_backup_user; DROP TABLE totp_backup_codes; DROP TABLE user_totp;").unwrap();
            conn.execute(
                "INSERT INTO users (username, is_admin, kdf_version, kdf_salt, server_auth_verifier,
                    encrypted_vault_key, recovery_salt, recovery_auth_verifier, recovery_encrypted_vault_key, created_at)
                 VALUES ('old', 1, 2, 'oldsalt', ?1, 'vk', 'rs', ?1, 'rvk', 0)",
                params![hash_auth_key(&key).ok().unwrap()],
            )
            .unwrap();
            conn.execute(
                "INSERT INTO vault_items (owner_id, scope, ciphertext, iv, updated_at) VALUES (1, 'personal', 'ct', 'iv', 0)",
                [],
            )
            .unwrap();
            load_server_secret(&conn)
        };
        let conn = init_db(&path.to_string_lossy());
        let tables: Vec<String> = conn
            .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").unwrap()
            .query_map([], |r| r.get(0)).unwrap().flatten().collect();
        assert!(tables.contains(&"user_totp".to_string()) && tables.contains(&"totp_backup_codes".to_string()));
        let state = Arc::new(AppState::new(conn, "d".into(), vec![], vec![]));
        assert_eq!(state.fake_salt_secret, secret_before, "секрет сервера не меняется");

        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            let app = build_app(state.clone());
            let r = login(&app, "old", &key).await;
            assert_eq!(r.status(), StatusCode::OK);
            let v = body_json(r).await;
            assert!(v.get("totp_required").is_none());
            let auth = format!("Bearer {}", v["token"].as_str().unwrap());
            let items = body_json(send(&app, Method::GET, "/api/vault", &[("authorization", &auth)], vec![]).await).await;
            assert_eq!(items["items"][0]["ciphertext"], "ct");
            let st = body_json(send(&app, Method::GET, "/api/auth/totp", &[("authorization", &auth)], vec![]).await).await;
            assert_eq!(st["enabled"], false);
        });
        drop(state);
        let _ = fs::remove_file(&path);
    }
}

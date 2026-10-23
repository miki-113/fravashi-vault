// Версия сборки: кэш браузера чистится только при смене версии (иначе ломается офлайн-запуск).
// При каждом обновлении файла на сервере увеличивайте это значение.
const APP_BUILD = "2026-10-23-5";

// Миграция localStorage после переименования проекта (aegis_* → fravashi_*).
// Выполняется до любых чтений. offline_auth_* / offline_vault_* имён не меняли, офлайн-копия сохраняется.
(function migrateLegacyStorage() {
    try {
        for (const name of ["build", "custom_folders", "folder_map", "ignored_dups", "local_trash_ids", "mockup_theme"]) {
            const oldKey = "aegis_" + name, newKey = "fravashi_" + name;
            const oldVal = localStorage.getItem(oldKey);
            if (oldVal === null) continue;
            if (localStorage.getItem(newKey) === null) localStorage.setItem(newKey, oldVal);
            localStorage.removeItem(oldKey);
        }
    } catch (e) {}
})();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            if (navigator.onLine && localStorage.getItem("fravashi_build") !== APP_BUILD) {
                if ('caches' in window) {
                    const keys = await caches.keys();
                    for (const k of keys) await caches.delete(k);
                }
                localStorage.setItem("fravashi_build", APP_BUILD);
            }
            const reg = await navigator.serviceWorker.register('/sw.js?v=' + APP_BUILD);
            reg.update();
        } catch (e) {}
    });
}

const { createApp, ref, computed, onMounted } = Vue;

// Локализация: словари static/i18n/*.js подключаются до app.js и кладут себя в window.FRAVASHI_I18N[язык].
// Язык — реактивный ref: шаблоны, вызывающие t(), перерисовываются при смене.
const I18N = window.FRAVASHI_I18N || {};
const LANGS = ["ru", "en"];
function detectLang() {
    try {
        const saved = localStorage.getItem("fravashi_lang");
        if (LANGS.includes(saved)) return saved;
    } catch (e) {}
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    return /^ru/i.test(nav) ? "ru" : "en";
}
const lang = ref(detectLang());
// Порядок поиска: текущий язык → ru → сам ключ
function t(key, params) {
    let s = I18N[lang.value]?.[key];
    if (s === undefined) s = I18N.ru?.[key];
    if (s === undefined) return key;
    return params ? s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m)) : s;
}
// Множественное число: ключ key.<форма> (en: one/other; ru: one/few/many/other) по Intl.PluralRules; запасная форма — other
const pluralRules = {};
function tp(key, n, params) {
    const lg = lang.value;
    const rules = pluralRules[lg] || (pluralRules[lg] = new Intl.PluralRules(lg === "ru" ? "ru-RU" : "en-US"));
    const cat = rules.select(Number(n) || 0);
    const dict = I18N[lg] || {};
    const pick = (d) => d[key + "." + cat] ?? d[key + ".other"];
    let s = pick(dict);
    if (s === undefined) s = pick(I18N.ru || {});
    if (s === undefined) return key;
    const p = Object.assign({ n }, params);
    return s.replace(/\{(\w+)\}/g, (m, k) => (k in p ? String(p[k]) : m));
}
function hasKey(key) {
    return Boolean(I18N[lang.value] && key in I18N[lang.value]) || Boolean(I18N.ru && key in I18N.ru);
}
function currentLocale() {
    return lang.value === "ru" ? "ru-RU" : "en-US";
}
function applyLangToDocument() {
    document.documentElement.lang = lang.value;
    document.title = t("app.title");
}
function setLang(l) {
    if (!LANGS.includes(l)) return;
    lang.value = l;
    try { localStorage.setItem("fravashi_lang", l); } catch (e) {}
    applyLangToDocument();
}
applyLangToDocument();

// Ошибка API: detail — стабильный код сервера, params — подстановки. Неизвестный код → общее сообщение.
function serverErrorText(body, fallbackKey = "server.unknown") {
    const code = body && typeof body.detail === "string" ? body.detail : "";
    if (code && /^[a-z_]+$/.test(code) && hasKey("server." + code)) {
        return t("server." + code, body.params && typeof body.params === "object" ? body.params : undefined);
    }
    return t(fallbackKey);
}
async function apiErrorText(res, fallbackKey) {
    let body = null;
    try { body = await res.json(); } catch (e) {}
    return serverErrorText(body, fallbackKey);
}

// Лимит бездействия: 15 минут (900 000 мс)
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

const ENTRY_COLORS = [
    "#9a315d", "#d49b22", "#4565bc", "#d46b3e",
    "#bd682c", "#795fb5", "#587d79", "#484d4d", "#9757a7"
];

// В записях хранится только id папки, название берётся из словаря (folder.<id>) на текущем языке
const DEFAULT_FOLDERS = [
    { id: "shopping", icon: "fa-solid fa-bag-shopping", tintClass: "bg-[#ffb5a6] text-[#763b39]" },
    { id: "mail", icon: "fa-regular fa-envelope", tintClass: "bg-[#91d2ff] text-[#214b7c]" },
    { id: "work", icon: "fa-solid fa-briefcase", tintClass: "bg-[#c5a9ff] text-[#4c347a]" },
    { id: "finance", icon: "fa-solid fa-coins", tintClass: "bg-[#8adbc4] text-[#205945]" },
    { id: "social", icon: "fa-solid fa-play", tintClass: "bg-[#ffd875] text-[#67511a]" },
    { id: "gov", icon: "fa-solid fa-building-columns", tintClass: "bg-[#b3c8ff] text-[#2c437e]" },
    { id: "cloud", icon: "fa-solid fa-server", tintClass: "bg-[#a4e1ca] text-[#1e594a]" }
];

function punycodeDecodePart(input) {
    try {
        if (!input || !input.toLowerCase().startsWith("xn--")) return input;
        const encoded = input.slice(4).toLowerCase();
        const base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700;
        let bias = 72, n = 128, i = 0;
        const output = [];
        let basic = encoded.lastIndexOf("-");
        if (basic < 0) basic = 0;
        for (let j = 0; j < basic; j++) output.push(encoded.charCodeAt(j));
        for (let index = basic > 0 ? basic + 1 : 0; index < encoded.length; ) {
            let oldi = i, w = 1;
            for (let k = base; ; k += base) {
                if (index >= encoded.length) break;
                const code = encoded.charCodeAt(index++);
                const digit = code - 48 < 10 ? code - 22 : code - 97 < 26 ? code - 97 : base;
                i += digit * w;
                const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                if (digit < t) break;
                w *= (base - t);
            }
            const out = output.length + 1;
            let delta = i - oldi;
            delta = oldi === 0 ? Math.floor(delta / damp) : delta >> 1;
            delta += Math.floor(delta / out);
            let k = 0;
            while (delta > (((base - tMin) * tMax) >> 1)) {
                delta = Math.floor(delta / (base - tMin));
                k += base;
            }
            bias = Math.floor(k + ((base - tMin + 1) * delta) / (delta + skew));
            n += Math.floor(i / out);
            i %= out;
            output.splice(i++, 0, n);
        }
        return String.fromCodePoint(...output);
    } catch (e) {
        return input;
    }
}

function decodePunycodeText(str) {
    if (!str || typeof str !== "string") return "";
    let res = str.replace(/xn--[a-z0-9-]+/gi, (match) => punycodeDecodePart(match));
    try {
        if (res.includes("%")) res = decodeURIComponent(res);
    } catch (e) {}
    return res;
}

function isAndroidAppUrl(url) {
    return Boolean(url && typeof url === "string" && url.trim().startsWith("android://"));
}

function extractAndroidPkg(url) {
    if (!url || typeof url !== "string") return "";
    const raw = url.trim();
    const atIdx = raw.indexOf("@");
    if (atIdx !== -1) return raw.substring(atIdx + 1).replace(/\/+$/, "");
    return raw.replace(/^android:\/\//, "").replace(/\/+$/, "");
}

function resolveDomainFromAndroidPkg(pkg, fallbackTitle = "") {
    const p = (pkg || "").toLowerCase();
    const t = (fallbackTitle || "").toLowerCase();
    if (p.includes("aliexpress") || p.includes("alibaba")) return "aliexpress.ru";
    if (p.includes("s7.android") || t.includes("s7.ru")) return "s7.ru";
    if (p.includes("papajohns") || t.includes("papajohns")) return "papajohns.ru";
    if (p.includes("ycc365plus") || t.includes("ycc365plus")) return "ycc365plus.com";
    if (p.includes("xm.csee") || t.includes("csee.xm.com")) return "xmeye.net";
    if (p.includes("discord") || t.includes("discord")) return "discord.com";
    if (p.includes("setinbox") || t.includes("setinbox")) return "setinbox.com";
    if (p.includes("immich") || t.includes("immich")) return "immich.app";
    if (p.includes("tplink") || t.includes("tplink")) return "tplink.com";
    if (p.includes("yandex") || t.includes("yandex")) return "yandex.ru";
    if (p.includes("ivuu") || t.includes("ivuu")) return "ivuu.com";
    if (p.includes("realme") || t.includes("realme")) return "realme.com";

    if (t.includes(".") && !t.includes(" ") && !t.startsWith("android://")) {
        const cleanTitle = t.replace(/^(android|app|mobile|game|aws|csee)\./, "");
        if (cleanTitle.includes(".")) return cleanTitle;
    }
    const parts = p.split(".").filter(Boolean);
    if (parts.length >= 2) return `${parts[1]}.${parts[0]}`;
    return "play.google.com";
}

function getWorkingWebUrl(url, title = "") {
    if (!url || typeof url !== "string") return "#";
    const raw = url.trim();
    if (isAndroidAppUrl(raw)) {
        const pkg = extractAndroidPkg(raw);
        const domain = resolveDomainFromAndroidPkg(pkg, title);
        if (domain === "play.google.com") {
            return `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}`;
        }
        return decodePunycodeText(`https://${domain}`);
    }
    const fullUrl = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;
    return decodePunycodeText(fullUrl);
}

function getGooglePlayUrl(url) {
    const pkg = extractAndroidPkg(url);
    return `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}`;
}

function generateWifiQrSvg(ssid, password) {
    try {
        if (typeof qrcode === "undefined" || !ssid) return "";
        // Спецсимволы формата WIFI: нужно экранировать \ ; , : "
        const esc = (s) => String(s || "").replace(/([\\;,:"])/g, "\\$1");
        const qr = qrcode(0, 'M');
        qr.addData(`WIFI:S:${esc(ssid)};T:WPA;P:${esc(password)};;`);
        qr.make();
        return qr.createSvgTag({ cellSize: 3, margin: 1 });
    } catch (e) {
        return "";
    }
}

// QR для otpauth:// при включении двухфакторной защиты (рисуется локально, секрет никуда не уходит)
function generateQrSvg(text) {
    try {
        if (typeof qrcode === "undefined" || !text) return "";
        const qr = qrcode(0, 'M');
        qr.addData(text);
        qr.make();
        return qr.createSvgTag({ cellSize: 4, margin: 2 });
    } catch (e) {
        return "";
    }
}

// Оформление банковской карты. Регулярки getCardExtra ищут подписи доп. полей в данных пользователя на обоих языках.
function formatCardNumber(n) {
    const d = String(n || "").replace(/\D/g, "");
    return d ? d.replace(/(.{4})/g, "$1 ").trim() : (n || "•••• •••• •••• ••••");
}
function detectCardBrand(n) {
    const d = String(n || "").replace(/\D/g, "");
    if (/^220[0-4]/.test(d)) return t("card.brandMir");
    if (/^4/.test(d)) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
    if (/^62/.test(d)) return "UnionPay";
    return "";
}
function getCardExtra(data) {
    const cf = Array.isArray(data?.customFields) ? data.customFields : [];
    const find = (re) => (cf.find(f => re.test(String(f.label || "").toLowerCase())) || {}).value || "";
    return {
        expiry: find(/срок|valid|expir|mm\/yy|мм\/гг/), // i18n-ignore
        holder: find(/владел|holder|держател|имя|name/) // i18n-ignore
    };
}

// Безопасный случайный индекс без смещения (rejection sampling)
function secureRandomInt(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do { window.crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
}

async function sha1HexUpper(str) {
    const buf = await window.crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function createUncompressedZipBlob(filesMap) {
    const enc = new TextEncoder();
    const entries = [];
    const crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        crcTable[n] = c;
    }
    function crc32(bytes) {
        let c = 0xffffffff;
        for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
        return (c ^ 0xffffffff) >>> 0;
    }
    let offset = 0;
    const localChunks = [];
    const centralChunks = [];
    for (const [name, contentStr] of Object.entries(filesMap)) {
        const nameBytes = enc.encode(name);
        const dataBytes = enc.encode(contentStr);
        const crc = crc32(dataBytes);
        const size = dataBytes.length;

        const localHdr = new Uint8Array(30 + nameBytes.length);
        const lv = new DataView(localHdr.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0x0800, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, size, true);
        lv.setUint32(22, size, true);
        lv.setUint16(26, nameBytes.length, true);
        localHdr.set(nameBytes, 30);
        localChunks.push(localHdr, dataBytes);

        const centralHdr = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(centralHdr.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0x0800, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, size, true);
        cv.setUint32(24, size, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint32(42, offset, true);
        centralHdr.set(nameBytes, 46);
        centralChunks.push(centralHdr);
        offset += localHdr.length + size;
        entries.push(name);
    }
    const centralSize = centralChunks.reduce((acc, c) => acc + c.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    return new Blob([...localChunks, ...centralChunks, eocd], { type: "application/zip" });
}

function bytesToHex(bytes) {
    if (!bytes) return "";
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
function hexToBytes(hex) {
    if (!hex || typeof hex !== "string") return new Uint8Array(0);
    const clean = hex.trim();
    const bytes = new Uint8Array(Math.floor(clean.length / 2));
    for (let c = 0; c < bytes.length * 2; c += 2) {
        bytes[c / 2] = parseInt(clean.substring(c, c + 2), 16);
    }
    return bytes;
}

// KDF v2: master = PBKDF2-SHA256(secret, salt, 600k) → из него HKDF-SHA256 с разными info.
// encKey (обёртка ключа сейфа) не покидает браузер, на сервер уходит только authKey.
const KDF_ITERATIONS = 600000;
// legacy-идентификаторы протокола, не переименовывать: сломает существующие сейфы
const HKDF_INFO_ENC = "aegis-v2-enc";
const HKDF_INFO_AUTH = "aegis-v2-auth";
const HKDF_INFO_INVITE_ID = "aegis-v2-invite-id";
const HKDF_INFO_INVITE_WRAP = "aegis-v2-invite-wrap";
const HKDF_INFO_ESCROW = "aegis-v2-escrow";
const INVITE_KDF_SALT = "aegis-v2-invite-salt";
const INVITE_CODE_LENGTH = 16;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const ECDH_P256 = { name: "ECDH", namedCurve: "P-256" };

async function deriveV2Bits(secret, saltBytes, infos, iterations = KDF_ITERATIONS) {
    const enc = new TextEncoder();
    const pwKey = await window.crypto.subtle.importKey("raw", enc.encode(secret), { name: "PBKDF2" }, false, ["deriveBits"]);
    const masterBits = await window.crypto.subtle.deriveBits(
        { name: "PBKDF2", salt: saltBytes, iterations, hash: "SHA-256" }, pwKey, 256
    );
    const master = await window.crypto.subtle.importKey("raw", masterBits, "HKDF", false, ["deriveBits"]);
    new Uint8Array(masterBits).fill(0);
    const out = [];
    for (const info of infos) {
        const bits = await window.crypto.subtle.deriveBits(
            { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: enc.encode(info) }, master, 256
        );
        out.push(new Uint8Array(bits));
    }
    return out;
}

async function importWrapKey(bytes) {
    const key = await window.crypto.subtle.importKey("raw", bytes, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    bytes.fill(0);
    return key;
}

async function deriveKeyFromPasswordAndSalt(password, saltBytes, iterations = KDF_ITERATIONS) {
    const [encBits, authBits] = await deriveV2Bits(password, saltBytes, [HKDF_INFO_ENC, HKDF_INFO_AUTH], iterations);
    return { encKey: await importWrapKey(encBits), authHash: bytesToHex(authBits) };
}

function base32Encode(bytes) {
    let bits = 0, value = 0, out = "";
    for (const b of bytes) {
        value = (value << 8) | b;
        bits += 8;
        while (bits >= 5) {
            out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    return out;
}

// 10 байт CSPRNG = 80 бит = ровно 16 символов base32
function generateInviteCode() {
    return base32Encode(window.crypto.getRandomValues(new Uint8Array(10)));
}
function normalizeInviteCode(code) {
    return String(code || "").toUpperCase().replace(/[^A-Z2-7]/g, "");
}
function formatInviteCode(code) {
    return normalizeInviteCode(code).replace(/(.{4})(?=.)/g, "$1-");
}

async function deriveInviteSecrets(code, iterations = KDF_ITERATIONS) {
    const [idBits, wrapBits] = await deriveV2Bits(
        normalizeInviteCode(code), new TextEncoder().encode(INVITE_KDF_SALT),
        [HKDF_INFO_INVITE_ID, HKDF_INFO_INVITE_WRAP], iterations
    );
    return { inviteId: bytesToHex(idBits), wrapKey: await importWrapKey(wrapBits) };
}

// Escrow: ECDH(эфемерный ключ, публичный ключ админа) → HKDF → AES-GCM. Открыть может только админ.
async function escrowKeyFromShared(sharedBits, epkBytes) {
    const ikm = await window.crypto.subtle.importKey("raw", sharedBits, "HKDF", false, ["deriveKey"]);
    return window.crypto.subtle.deriveKey(
        { name: "HKDF", hash: "SHA-256", salt: epkBytes, info: new TextEncoder().encode(HKDF_INFO_ESCROW) },
        ikm, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
    );
}

async function sealForAdmin(adminPubHex, dataObj) {
    const adminPub = await window.crypto.subtle.importKey("raw", hexToBytes(adminPubHex), ECDH_P256, false, []);
    const eph = await window.crypto.subtle.generateKey(ECDH_P256, false, ["deriveBits"]);
    const epk = new Uint8Array(await window.crypto.subtle.exportKey("raw", eph.publicKey));
    const shared = await window.crypto.subtle.deriveBits({ name: "ECDH", public: adminPub }, eph.privateKey, 256);
    const key = await escrowKeyFromShared(shared, epk);
    return { v: 2, epk: bytesToHex(epk), ...(await encryptData(key, dataObj)) };
}

async function openSealedForAdmin(adminPrivateKey, blob) {
    if (!adminPrivateKey || !blob || blob.v !== 2 || !blob.epk) return null;
    const epk = hexToBytes(blob.epk);
    const ephPub = await window.crypto.subtle.importKey("raw", epk, ECDH_P256, false, []);
    const shared = await window.crypto.subtle.deriveBits({ name: "ECDH", public: ephPub }, adminPrivateKey, 256);
    return decryptData(await escrowKeyFromShared(shared, epk), blob.ciphertext, blob.iv);
}

// Самопроверка KDF при старте: только консоль, в UI ничего не выводится
async function runCryptoSelfTest() {
    const iters = 1000; // на разделение ключей число итераций не влияет, полные 600k при старте не нужны
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const [encBits, authBits] = await deriveV2Bits("self-test", salt, [HKDF_INFO_ENC, HKDF_INFO_AUTH], iters);
    const encHex = bytesToHex(encBits), authHex = bytesToHex(authBits);
    const { encKey, authHash } = await deriveKeyFromPasswordAndSalt("self-test", salt, iters);
    const blob = await encryptData(encKey, { probe: 1 });
    const authAsKey = await importWrapKey(hexToBytes(authHash));
    const inv = await deriveInviteSecrets(generateInviteCode(), iters);
    const checks = {
        "encKey != authKey": encHex !== authHex,
        "authKey == HKDF(auth)": authHash === authHex,
        "authKey does not unwrap": (await decryptData(authAsKey, blob.ciphertext, blob.iv)) === null,
        "encKey not extractable": encKey.extractable === false,
        "invite code is 16 base32 chars": /^[A-Z2-7]{16}$/.test(generateInviteCode()),
        "invite_id is 256 bits": /^[0-9a-f]{64}$/.test(inv.inviteId)
    };
    const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
    if (failed.length) console.error("[FravashiVault] Crypto self-test FAILED:", failed);
    else console.info("[FravashiVault] Crypto self-test passed:", Object.keys(checks).join("; "));
}

async function deriveKeyAndAuthHash(password, saltHex) {
    const salt = (saltHex && typeof saltHex === "string")
        ? hexToBytes(saltHex)
        : window.crypto.getRandomValues(new Uint8Array(16));
    const { encKey, authHash } = await deriveKeyFromPasswordAndSalt(password, salt);
    return { saltHex: bytesToHex(salt), encKey, authHash };
}

async function encryptData(key, dataObj) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(dataObj));
    const ciphertext = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, encoded);
    return { ciphertext: bytesToHex(new Uint8Array(ciphertext)), iv: bytesToHex(iv) };
}

async function decryptData(key, ciphertextHex, ivHex) {
    try {
        if (!key || !ciphertextHex || !ivHex) return null;
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: hexToBytes(ivHex) }, key, hexToBytes(ciphertextHex)
        );
        return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (e) {
        return null;
    }
}

function base32toHex(base32) {
    const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "", hex = "";
    const clean = (base32 || "").replace(/\s+/g, '').replace(/=+$/, '').toUpperCase();
    for (let i = 0; i < clean.length; i++) {
        let val = base32Chars.indexOf(clean.charAt(i));
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        hex += parseInt(bits.substring(i, i + 8), 2).toString(16).padStart(2, '0');
    }
    return hex;
}

async function generateTOTP(secretBase32) {
    try {
        const hexKey = base32toHex(secretBase32);
        if (!hexKey) return { code: "------", secondsLeft: 30 };
        const keyBytes = hexToBytes(hexKey);
        const epoch = Math.floor(Date.now() / 1000);
        const timeStep = 30;
        const counter = Math.floor(epoch / timeStep);
        const msgBuffer = new ArrayBuffer(8);
        new DataView(msgBuffer).setUint32(4, counter, false);
        const cryptoKey = await window.crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
        const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, msgBuffer);
        const hmacResult = new Uint8Array(signature);
        const offset = hmacResult[hmacResult.length - 1] & 0xf;
        const binary = ((hmacResult[offset] & 0x7f) << 24) | ((hmacResult[offset + 1] & 0xff) << 16) | ((hmacResult[offset + 2] & 0xff) << 8) | (hmacResult[offset + 3] & 0xff);
        return { code: (binary % 1000000).toString().padStart(6, '0'), secondsLeft: timeStep - (epoch % timeStep) };
    } catch (e) {
        return { code: "------", secondsLeft: 30 };
    }
}

createApp({
    setup() {
        const loading = ref(true);
        const hasUsers = ref(false);
        // Сервер требует SETUP_TOKEN для первой регистрации (создания админа)
        const setupTokenRequired = ref(false);
        const savedTheme = localStorage.getItem("fravashi_mockup_theme");
        const theme = ref(["light", "dark"].includes(savedTheme) ? savedTheme : "light");

        const mobileNavOpen = ref(false);
        const activeSubCardIdx = ref(0);
        const subCardsViewAll = ref(false);
        const shownPwds = ref({});
        const pwnedResults = ref({});

        // Отслеживание последней активности пользователя для 15-минутного автовыхода + живой обратный отсчёт
        let lastActivityTime = Date.now();
        const idleSecondsLeft = ref(Math.floor(IDLE_TIMEOUT_MS / 1000));
        const idleLabel = computed(() => {
            const s = Math.max(0, idleSecondsLeft.value);
            return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
        });
        function resetIdleTimer() {
            lastActivityTime = Date.now();
            idleSecondsLeft.value = Math.floor(IDLE_TIMEOUT_MS / 1000);
        }

        const showExtensionModal = ref(false);
        const showPwaModal = ref(false);
        const canInstallPwa = ref(false);
        const showLogsModal = ref(false);
        const systemLogs = ref([]);
        const currentOrigin = ref(window.location.origin);
        let deferredPwaPrompt = null;

        function triggerPwaInstall() {
            mobileNavOpen.value = false;
            showPwaModal.value = true;
        }

        async function installPwaNow() {
            if (!deferredPwaPrompt) return showToast(t("pwa.noPrompt"), "warn");
            deferredPwaPrompt.prompt();
            try { await deferredPwaPrompt.userChoice; } catch (e) {}
            deferredPwaPrompt = null;
            canInstallPwa.value = false;
            showPwaModal.value = false;
        }

        async function openLogsModal() {
            mobileNavOpen.value = false;
            if (sessionToken.value === "OFFLINE_MODE") return showToast(t("logs.offline"), "warn");
            try {
                const res = await fetch("/api/logs", { headers: { "Authorization": `Bearer ${sessionToken.value}` } });
                if (res.ok) {
                    const data = await res.json();
                    systemLogs.value = data.logs || [];
                } else {
                    showToast(t("logs.loadFailed"), "error");
                }
            } catch (e) {
                showToast(t("logs.loadFailed"), "error");
            }
            showLogsModal.value = true;
        }

        async function clearSystemLogs() {
            try {
                await fetch("/api/logs", { method: "DELETE", headers: { "Authorization": `Bearer ${sessionToken.value}` } });
                systemLogs.value = [];
                showToast(t("logs.cleared"));
            } catch (e) {}
        }

        function downloadBrowserExtensionZip() {
            const srvOrigin = window.location.origin;
            const manifestJson = JSON.stringify({
                manifest_version: 3,
                name: "FravashiVault — Автозаполнение паролей", // i18n-ignore
                version: "1.2.0",
                description: "Браузерное расширение FravashiVault для автозаполнения паролей на сайтах", // i18n-ignore
                permissions: ["storage", "activeTab", "scripting", "tabs"],
                host_permissions: ["<all_urls>"],
                action: { default_popup: "popup.html", default_title: "FravashiVault" },
                content_scripts: [{ matches: ["http://*/*", "https://*/*"], js: ["content.js"], run_at: "document_idle" }]
            }, null, 2);

            const popupText = {
                mismatch: t("extension.popup.mismatch"), noUrl: t("extension.popup.noUrl"),
                fillAnyway: t("extension.popup.fillAnyway"), cancel: t("extension.popup.cancel"), noTab: t("extension.popup.noTab")
            };
            const popupHtml = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>FravashiVault</title><style>*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;}body{width:350px;min-height:440px;max-height:560px;background:#17223a;color:#f1f5f9;display:flex;flex-direction:column;overflow:hidden;}.header{padding:12px 14px;background:#1d315b;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;font-weight:800;font-size:15px;}.container{padding:14px;flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;}input{width:100%;padding:9px 11px;border-radius:8px;border:1px solid #364768;background:#202d49;color:#f8fafc;font-size:13px;outline:none;}.btn{cursor:pointer;padding:8px 12px;border-radius:8px;border:1px solid #364768;background:#202d49;color:#f8fafc;font-weight:600;font-size:12px;}.btn-primary{background:#315bd7;border-color:transparent;color:#fff;}.item-card{background:#202d49;border:1px solid #364768;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px;}.hidden{display:none!important;}</style></head><body><div class="header"><span>️ FravashiVault</span><button id="btnLock" class="btn hidden" style="padding:4px 8px;color:#fb7185;">Выход</button></div><div id="statusBox" style="padding:6px 10px;font-size:12px;text-align:center;display:none;"></div><div id="confirmBox" class="hidden" style="margin:10px 14px 0;padding:10px;border-radius:10px;border:1px solid #f59e0b;background:#3a2a10;color:#fde68a;font-size:12px;display:flex;flex-direction:column;gap:8px;"><div id="confirmText"></div><div style="display:flex;gap:6px;"><button id="btnConfirmNo" class="btn btn-primary" style="flex:1;"></button><button id="btnConfirmYes" class="btn" style="flex:1;color:#fb7185;"></button></div></div><div id="loginView" class="container"><input id="serverUrl" type="text" value="${srvOrigin}" placeholder="Адрес сервера"><input id="username" type="text" placeholder="Логин"><input id="password" type="password" placeholder="Мастер-пароль"><button id="btnUnlock" class="btn btn-primary" style="width:100%;padding:10px;">Разблокировать сейф</button><div id="totpBox" class="hidden" style="margin-top:10px;"><input id="totpCode" type="text" autocomplete="one-time-code" placeholder="Код из приложения или резервный код"><button id="btnTotp" class="btn btn-primary" style="width:100%;padding:10px;">Подтвердить код</button></div></div><div id="vaultView" class="container hidden"><input id="searchBox" type="text" placeholder="Поиск по сайтам..."><div id="itemsList" style="display:flex;flex-direction:column;gap:8px;"></div></div><script src="popup.js"><\/script></body></html>`; // i18n-ignore

            const contentJs = `function setNativeValue(el,val){if(!el)return;el.focus();const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value")?.set;if(s)s.call(el,val);else el.value=val;el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}));}chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{if(msg.action==="AEGIS_AUTOFILL"){if(!msg.host||location.hostname.toLowerCase()!==msg.host){sendResponse({status:"host_changed"});return;}const p=Array.from(document.querySelectorAll('input[type="password"]')).filter(e=>e.offsetParent!==null);if(p.length>0){setNativeValue(p[0],msg.password);const f=p[0].closest("form")||document.body;const u=Array.from(f.querySelectorAll('input[type="text"],input[type="email"],input[type="tel"],input:not([type])')).filter(e=>e.offsetParent!==null&&!e.readOnly);if(u.length>0)setNativeValue(u[u.length-1],msg.username);}sendResponse({status:"ok"});}});`;

            // legacy-идентификаторы протокола внутри popupJs ("aegis-v2-enc", "aegis-v2-auth") и действие AEGIS_AUTOFILL, не переименовывать: сломает существующие сейфы
            const popupJs = `const DEFAULT_SRV="${srvOrigin}";const L=${JSON.stringify(popupText)};function hostOf(u){try{const s=String(u||"").trim();if(!s)return "";return new URL(s.includes("://")?s:"https://"+s).hostname.toLowerCase().replace(/^www[.]/,"");}catch(e){return "";}}function hostMatches(tab,saved){return saved.includes(".")&&(tab===saved||tab.endsWith("."+saved));}function ask(text,onYes){const b=document.getElementById("confirmBox");document.getElementById("confirmText").textContent=text;b.classList.remove("hidden");document.getElementById("btnConfirmYes").onclick=()=>{b.classList.add("hidden");onYes();};document.getElementById("btnConfirmNo").onclick=()=>b.classList.add("hidden");}function fill(it){chrome.tabs.query({active:true,currentWindow:true},t=>{const tab=t[0];if(!tab)return;let th="";try{const u=new URL(tab.url||"");if(u.protocol==="http:"||u.protocol==="https:")th=u.hostname.toLowerCase();}catch(e){}if(!th)return msg(L.noTab);const send=()=>chrome.tabs.sendMessage(tab.id,{action:"AEGIS_AUTOFILL",host:th,username:it.username,password:it.password});const sh=hostOf(it.url);if(hostMatches(th.replace(/^www[.]/,""),sh))return send();ask((sh?L.mismatch:L.noUrl).replace("{site}",th).replace("{saved}",sh),send);});}let state={serverUrl:DEFAULT_SRV,token:null,vaultKeyHex:null,items:[]};function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}function bytesToHex(b){return Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join('');}function hexToBytes(h){const c=(h||"").trim(),b=new Uint8Array(Math.floor(c.length/2));for(let i=0;i<b.length*2;i+=2)b[i/2]=parseInt(c.substring(i,i+2),16);return b;}async function derive(p,s){const e=new TextEncoder(),c=crypto.subtle,m=await c.importKey("raw",e.encode(p),{name:"PBKDF2"},false,["deriveBits"]);const mb=await c.deriveBits({name:"PBKDF2",salt:s,iterations:600000,hash:"SHA-256"},m,256);const h=await c.importKey("raw",mb,"HKDF",false,["deriveBits"]);const x=async i=>new Uint8Array(await c.deriveBits({name:"HKDF",hash:"SHA-256",salt:new Uint8Array(0),info:e.encode(i)},h,256));const eb=await x("aegis-v2-enc"),ab=await x("aegis-v2-auth");const k=await c.importKey("raw",eb,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);eb.fill(0);return{encKey:k,authHash:bytesToHex(ab)};}async function dec(k,c,iv){try{const d=await crypto.subtle.decrypt({name:"AES-GCM",iv:hexToBytes(iv)},k,hexToBytes(c));return JSON.parse(new TextDecoder().decode(d));}catch(e){return null;}}function msg(t){const b=document.getElementById("statusBox");b.textContent=t;b.style.display="block";setTimeout(()=>b.style.display="none",2500);}async function loadVault(){const r=await fetch(state.serverUrl+"/api/vault",{headers:{"Authorization":"Bearer "+state.token}});const d=await r.json();const vk=await crypto.subtle.importKey("raw",hexToBytes(state.vaultKeyHex),{name:"AES-GCM",length:256},true,["encrypt","decrypt"]);const list=[];for(const it of(d.items||[])){if(it.is_trashed)continue;const o=await dec(vk,it.ciphertext,it.iv);if(o&&!o._trashed&&o.itemType!=="note")list.push({title:o.title||"Сайт",username:o.username||"",password:o.password||"",url:o.url||""});}state.items=list;render();}function render(){const q=(document.getElementById("searchBox").value||"").toLowerCase(),box=document.getElementById("itemsList");box.innerHTML="";state.items.filter(x=>(x.title||"").toLowerCase().includes(q)||(x.username||"").toLowerCase().includes(q)).slice(0,50).forEach(it=>{const el=document.createElement("div");el.className="item-card";el.innerHTML='<div style="font-weight:700;font-size:13px;">'+esc(it.title)+'</div><div style="font-size:11.5px;color:#94a3b8;">'+esc(it.username||"—")+'</div><div style="display:flex;gap:6px;"><button class="btn btn-primary" style="flex:1;">⚡ Заполнить</button><button class="btn">Пароль</button></div>';const btns=el.querySelectorAll("button");btns[0].onclick=()=>fill(it);btns[1].onclick=()=>{navigator.clipboard.writeText(it.password);msg("Пароль скопирован!");};box.appendChild(el);});}let pend=null;function resetTotp(){pend=null;document.getElementById("totpBox").classList.add("hidden");document.getElementById("totpCode").value="";}async function openVault(ld,encKey){const eo=JSON.parse(ld.encrypted_vault_key);const vo=await dec(encKey,eo.ciphertext,eo.iv);state.token=ld.token;state.vaultKeyHex=vo.rawKey;resetTotp();await loadVault();document.getElementById("loginView").classList.add("hidden");document.getElementById("vaultView").classList.remove("hidden");document.getElementById("btnLock").classList.remove("hidden");}document.addEventListener("DOMContentLoaded",()=>{document.getElementById("btnConfirmYes").textContent=L.fillAnyway;document.getElementById("btnConfirmNo").textContent=L.cancel;document.getElementById("searchBox").oninput=render;document.getElementById("btnLock").onclick=()=>{document.getElementById("confirmBox").classList.add("hidden");document.getElementById("vaultView").classList.add("hidden");document.getElementById("loginView").classList.remove("hidden");document.getElementById("btnLock").classList.add("hidden");resetTotp();};document.getElementById("btnUnlock").onclick=async()=>{try{const srv=document.getElementById("serverUrl").value.trim().replace(/\\/+$/,""),u=document.getElementById("username").value.trim().toLowerCase(),p=document.getElementById("password").value;state.serverUrl=srv;const sr=await fetch(srv+"/api/auth/params/"+encodeURIComponent(u));const sd=await sr.json();const{encKey,authHash}=await derive(p,hexToBytes(sd.kdf_salt));const lr=await fetch(srv+"/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u,client_auth_hash:authHash})});if(!lr.ok)throw new Error("Неверный пароль");const ld=await lr.json();document.getElementById("password").value="";if(ld.totp_required){pend={encKey,challenge:ld.challenge};document.getElementById("totpCode").value="";document.getElementById("totpBox").classList.remove("hidden");msg("Введите код двухфакторной защиты");return;}await openVault(ld,encKey);}catch(e){msg(e.message||"Ошибка входа");}};document.getElementById("btnTotp").onclick=async()=>{try{if(!pend)throw new Error("Сначала введите мастер-пароль");const r=await fetch(state.serverUrl+"/api/auth/login/totp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({challenge:pend.challenge,code:document.getElementById("totpCode").value.trim()})});if(!r.ok){let d={};try{d=await r.json();}catch(x){}if(d.detail==="totp_challenge_expired"){resetTotp();throw new Error("Время на ввод кода истекло, войдите заново");}throw new Error(d.detail==="too_many_attempts"?"Слишком много попыток, подождите":"Неверный код");}const ld=await r.json();await openVault(ld,pend.encKey);}catch(e){msg(e.message||"Ошибка входа");}};});`; // i18n-ignore

            const blob = createUncompressedZipBlob({
                "manifest.json": manifestJson,
                "popup.html": popupHtml,
                "popup.js": popupJs,
                "content.js": contentJs
            });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "fravashi-extension.zip";
            a.click();
            showToast(t("extension.downloaded"));
        }

        const navSections = ref({ folders: true, tools: true });
        function toggleNavSection(k) { navSections.value[k] = !navSections.value[k]; }

        const customFolders = ref(JSON.parse(localStorage.getItem("fravashi_custom_folders") || "[]"));
        const allFolders = computed(() => [...DEFAULT_FOLDERS.map(f => ({ ...f, name: t("folder." + f.id) })), ...customFolders.value]);
        const localFolderMap = ref(JSON.parse(localStorage.getItem("fravashi_folder_map") || "{}"));

        const multiSelectMode = ref(false);
        const manualSelectedIds = ref([]);
        const dupGroupByMode = ref("domain");

        // В офлайн-режиме сейф открыт только для чтения
        function isOfflineBlocked() {
            if (sessionToken.value === "OFFLINE_MODE") {
                showToast(t("offline.readOnly"), "warn");
                return true;
            }
            return false;
        }

        function toggleMultiSelectMode() {
            multiSelectMode.value = !multiSelectMode.value;
            if (!multiSelectMode.value) manualSelectedIds.value = [];
        }

        function toggleManualSelectId(id) {
            const idx = manualSelectedIds.value.indexOf(id);
            if (idx === -1) manualSelectedIds.value.push(id);
            else manualSelectedIds.value.splice(idx, 1);
        }

        function startMergeFromCurrentItem(item) {
            if (!item) return;
            multiSelectMode.value = true;
            if (!manualSelectedIds.value.includes(item.id)) manualSelectedIds.value = [item.id];
            selectedItem.value = null;
            showToast(t("merge.pickHint"), "warn");
        }

        async function mergeManualSelectedAsMultiCard() {
            const selectedCards = activeItems.value.filter(i => manualSelectedIds.value.includes(i.id));
            if (selectedCards.length < 2) return;
            const rootTitle = getRootBrandDomain(formatDomain(selectedCards[0].decrypted?.url)) || decodePunycodeText(selectedCards[0].decrypted?.title);
            await combineIntoMultiCard({
                title: rootTitle,
                primaryId: selectedCards[0].id,
                items: selectedCards.map(c => ({ ...c, mergeSelected: true }))
            });
            multiSelectMode.value = false;
            manualSelectedIds.value = [];
        }

        async function mergeManualSelectedIntoOne() {
            const selectedCards = activeItems.value.filter(i => manualSelectedIds.value.includes(i.id));
            if (selectedCards.length < 2) return;
            await mergeSingleGroup({
                title: decodePunycodeText(selectedCards[0].decrypted?.title),
                primaryId: selectedCards[0].id,
                items: selectedCards.map(c => ({ ...c, mergeSelected: true }))
            });
            multiSelectMode.value = false;
            manualSelectedIds.value = [];
        }

        async function deleteSelectedInGroup(grp) {
            if (isOfflineBlocked()) return;
            const toDelete = grp.items.filter(i => i.mergeSelected !== false);
            if (toDelete.length === 0) return;
            if (!confirm(tp("dup.confirmTrash", toDelete.length))) return;
            for (const item of toDelete) await moveToTrash(item);
            showToast(t("dup.trashed", { n: toDelete.length }));
        }

        function createNewCustomFolder() {
            const name = prompt(t("folder.newPrompt"));
            if (!name || !name.trim()) return;
            const id = "custom_" + Date.now();
            customFolders.value.push({
                id,
                name: name.trim(),
                icon: "fa-solid fa-folder",
                tintClass: "bg-[#b3c8ff] text-[#2c437e]"
            });
            localStorage.setItem("fravashi_custom_folders", JSON.stringify(customFolders.value));
            showToast(t("folder.added", { name: name.trim() }));
        }

        function getItemFolderId(item) {
            if (!item) return "";
            return item.decrypted?.folder || localFolderMap.value[item.id] || detectFolderByKeywords(item);
        }

        function getItemFolderName(item) {
            const fid = getItemFolderId(item);
            if (!fid) return "";
            const found = allFolders.value.find(f => f.id === fid);
            return found ? found.name : "";
        }

        const countByFolder = (fid) => activeItems.value.filter(i => getItemFolderId(i) === fid).length;

        async function quickAssignFolder(item, folderId) {
            if (!item) return;
            localFolderMap.value[item.id] = folderId;
            localStorage.setItem("fravashi_folder_map", JSON.stringify(localFolderMap.value));
            item.decrypted.folder = folderId;
            if (sessionToken.value === "OFFLINE_MODE") return showToast(t("folder.savedLocally"));
            try {
                const keyToUse = (item.scope === 'family' && familyKey) ? familyKey : vaultKey;
                const { ciphertext, iv } = await encryptData(keyToUse, item.decrypted);
                await fetch(`/api/vault/${item.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                    body: JSON.stringify({
                        scope: item.scope,
                        category: item.category || "login",
                        is_favorite: Boolean(item.is_favorite),
                        is_trashed: Boolean(item.is_trashed),
                        ciphertext, iv
                    })
                });
                showToast(t("folder.updated"));
            } catch (e) {}
        }

        function detectFolderByKeywords(item) {
            const text = `${decodePunycodeText(item.decrypted?.title || "")} ${decodePunycodeText(item.decrypted?.url || "")}`.toLowerCase();
            if (/lamoda|leroymerlin|леруа|dns-shop|aliexpress|alibaba|ozon|wildberries|wb\.ru|avito|market|decathlon|emex|exist|autodoc|eldorado|mvideo|citilink|sportmaster|shop|store|apt|perekrestok|lenta|papajohns|s7\.android|s7\.ru|vseinstrumenti|ikea|hoff|petrovich/.test(text)) return "shopping"; // i18n-ignore
            if (/mail\.ru|yandex|ya\.ru|google|gmail|rambler|outlook|icloud|bk\.ru|list\.ru|inbox\.ru|telegram|whatsapp|viber|skype|discord/.test(text)) return "mail";
            if (/gosuslugi|nalog|fns|pfr|sfr|mos\.ru|notariat|ссту|фнс|госуслуги|суд|кад|росреестр|гибдд|мвд/.test(text)) return "gov"; // i18n-ignore
            if (/sber|tinkoff|tbank|vtb|alfabank|gazprombank|raiffeisen|qiwi|yoomoney|bank|pay|kassa|брокер|финанс/.test(text)) return "finance"; // i18n-ignore
            if (/beget|handyhost|justhost|adminvps|reg\.ru|timeweb|selectel|cloudflare|github|gitlab|docker|synology|immich|tplink|ycc365plus|csee|xm\.com|ivuu|realme|unisender|redsms|cheapsender|smartape|nethouse|hosting|vds|vps/.test(text)) return "cloud";
            if (/kinopoisk|4pda|pspx|vk\.com|ok\.ru|youtube|twitch|instagram|facebook|twitter|tiktok|pikabu|habr|forum|club|cub\.red|cub\.rip|setinbox/.test(text)) return "social";
            if (/notion|стройлогистика|ispring|cryptopro|криптопро|sbis|kontur|1c|bitrix|crm|work|office|b2b|triasoft|notarix/.test(text)) return "work"; // i18n-ignore
            return "";
        }

        async function autoSortItemsIntoFolders(forceRecalculate = false) {
            let count = 0;
            for (const it of activeItems.value) {
                if (forceRecalculate || !localFolderMap.value[it.id]) {
                    const guessed = detectFolderByKeywords(it);
                    if (guessed) {
                        localFolderMap.value[it.id] = guessed;
                        it.decrypted.folder = guessed;
                        count++;
                    }
                }
            }
            localStorage.setItem("fravashi_folder_map", JSON.stringify(localFolderMap.value));
            mobileNavOpen.value = false;
            showToast(t("folder.autoSorted", { n: count }));
        }

        const ignoredDupKeys = ref(JSON.parse(localStorage.getItem("fravashi_ignored_dups") || "[]"));
        function ignoreDuplicateGroup(groupKey) {
            if (!ignoredDupKeys.value.includes(groupKey)) {
                ignoredDupKeys.value.push(groupKey);
                localStorage.setItem("fravashi_ignored_dups", JSON.stringify(ignoredDupKeys.value));
            }
            showToast(t("dup.hidden"));
        }
        function resetIgnoredDuplicates() {
            ignoredDupKeys.value = [];
            localStorage.setItem("fravashi_ignored_dups", "[]");
        }

        const sessionToken = ref(null);
        const currentUsername = ref("");
        const currentUserSalt = ref("");
        const isAdmin = ref(false);
        const searchInputRef = ref(null);
        const displayUsername = computed(() =>
            sessionToken.value === "OFFLINE_MODE" ? `${currentUsername.value} ${t("auth.offlineSuffix")}` : currentUsername.value);

        const authMode = ref("login");
        const showLoginPwd = ref(false);
        const showModalPwd = ref(false);
        const loginForm = ref({ username: "", password: "" });
        const regForm = ref({ username: "", password: "", passwordConfirm: "", inviteCode: "", setupToken: "", allowEscrow: true });
        const recForm = ref({ username: "", recoveryKey: "", newPassword: "" });
        // Второй шаг входа и настройки двухфакторной защиты
        const totpStepActive = ref(false);
        const totpUseBackup = ref(false);
        const totpLoginCode = ref("");
        const totpStatus = ref({ loaded: false, enabled: false, backupCodesLeft: 0 });
        const totpSetup = ref(null);
        const totpForm = ref({ password: "", code: "" });
        const totpBackupCodes = ref([]);

        const currentView = ref("all");
        const currentCategory = ref("all");
        const currentFolder = ref("all");
        const rightPaneMode = ref("item");
        const searchQuery = ref("");
        const sortBy = ref("alpha");
        const vaultItems = ref([]);
        const selectedItem = ref(null);

        let vaultKey = null;
        let familyKey = null;
        // Только у админа: приватный ECDH-ключ escrow (неизвлекаемый) и его публичная часть
        let escrowPrivateKey = null;
        let escrowPublicKeyHex = null;

        const showSecurityModal = ref(false);
        const showTotpModal = ref(false);
                const siteIconsEnabled = ref(false);
        const pwdChangeForm = ref({ currentPassword: "", newPassword: "", confirmPassword: "" });

        const showItemModal = ref(false);
        const editingItem = ref(null);
        const itemForm = ref({
            scope: "personal", itemType: "login", folder: "", title: "", url: "", username: "",
            password: "", totpSecret: "", note: "", customFields: [], passwordHistory: [], subCards: []
        });

        // Генератор паролей
        const showGenModal = ref(false);
        const genLength = ref(18);
        const generatedPasswordString = ref("");
        const genOpts = ref({ upper: true, lower: true, digits: true, symbols: true });
        const genOptionList = [
            { key: "upper", label: "A-Z" },
            { key: "lower", label: "a-z" },
            { key: "digits", label: "0-9" },
            { key: "symbols", label: "!@#$%" }
        ];
        const GEN_SETS = {
            upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
            lower: "abcdefghijkmnopqrstuvwxyz",
            digits: "23456789",
            symbols: "!@#$%^&*_+-="
        };

        function toggleGenOpt(key) {
            const next = { ...genOpts.value, [key]: !genOpts.value[key] };
            if (!Object.values(next).some(Boolean)) return showToast(t("gen.needSet"), "warn");
            genOpts.value = next;
            generatePasswordPreview();
        }

        const genStrength = computed(() => {
            let pool = 0;
            for (const k of Object.keys(GEN_SETS)) if (genOpts.value[k]) pool += GEN_SETS[k].length;
            if (!pool) pool = GEN_SETS.lower.length;
            const bits = Math.round(genLength.value * Math.log2(pool));
            let label, color;
            if (bits < 50) { label = t("gen.strength.weak"); color = "#e11d48"; }
            else if (bits < 75) { label = t("gen.strength.medium"); color = "#f59e0b"; }
            else if (bits < 100) { label = t("gen.strength.good"); color = "#84cc16"; }
            else { label = t("gen.strength.excellent"); color = "#10b981"; }
            return { bits, label, color, percent: Math.min(100, Math.round(bits / 128 * 100)) };
        });

        const showImportModal = ref(false);
        const importTargetScope = ref("personal");
        const parsedCsvItems = ref([]);

        const showRecoveryModal = ref(false);
        const userRecoveryKeyPlain = ref("");

        const showAdminModal = ref(false);
        const familyMembers = ref([]);
        const lastCreatedInvite = ref("");

        const toasts = ref([]);

        const activeCardData = computed(() => {
            if (!selectedItem.value || !selectedItem.value.decrypted) return {};
            const subs = selectedItem.value.decrypted.subCards;
            if (Array.isArray(subs) && subs.length > 0 && subs[activeSubCardIdx.value]) {
                return subs[activeSubCardIdx.value];
            }
            return selectedItem.value.decrypted;
        });

        const isMultiCard = computed(() => {
            const subs = selectedItem.value?.decrypted?.subCards;
            return Array.isArray(subs) && subs.length > 0;
        });
        const showSingleView = computed(() => !(isMultiCard.value && subCardsViewAll.value));
        const cardExtra = computed(() => getCardExtra(selectedItem.value?.decrypted));

        function pwnedKey(idx) {
            return `${selectedItem.value?.id}_${idx}`;
        }
        function toggleShownPwd(key) {
            shownPwds.value[key] = !shownPwds.value[key];
        }
        function pwnedInfo(key) {
            const r = pwnedResults.value[key];
            if (!r) return null;
            if (r.state === "loading") return { text: t("pwned.loading"), cls: "opacity-70" };
            if (r.state === "pwned") return { text: tp("pwned.found", r.count, { count: new Intl.NumberFormat(currentLocale()).format(r.count) }), cls: "text-[#e11d48]" };
            if (r.state === "safe") return { text: t("pwned.safe"), cls: "text-[#10b981]" };
            return { text: t("pwned.error"), cls: "text-[#f59e0b]" };
        }

        // Проверка по HaveIBeenPwned (k-Anonymity): на сервер уходят только первые 5 символов SHA-1
        async function checkPwned(password, key) {
            if (!password) return showToast(t("pwned.empty"), "warn");
            if (sessionToken.value === "OFFLINE_MODE" || !navigator.onLine) return showToast(t("pwned.needOnline"), "warn");
            pwnedResults.value[key] = { state: "loading" };
            try {
                const hash = await sha1HexUpper(password);
                const prefix = hash.slice(0, 5), suffix = hash.slice(5);
                const res = await fetch("https://api.pwnedpasswords.com/range/" + prefix);
                if (!res.ok) throw new Error("HTTP " + res.status);
                const text = await res.text();
                let count = 0;
                for (const line of text.split("\n")) {
                    const [h, c] = line.trim().split(":");
                    if (h === suffix) { count = parseInt(c, 10) || 0; break; }
                }
                pwnedResults.value[key] = count > 0 ? { state: "pwned", count } : { state: "safe" };
            } catch (e) {
                pwnedResults.value[key] = { state: "error" };
            }
        }

        function setTheme(newTheme) {
            theme.value = newTheme;
            localStorage.setItem("fravashi_mockup_theme", newTheme);
        }

        const CATEGORY_TITLES = ["all", "favorites", "login", "card", "wifi", "note", "apps", "trash", "weak", "reused"];
        const currentTitle = computed(() => {
            if (currentFolder.value !== "all") {
                const fld = allFolders.value.find(f => f.id === currentFolder.value);
                return fld ? fld.name : t("title.folder");
            }
            return t("title.category." + (CATEGORY_TITLES.includes(currentCategory.value) ? currentCategory.value : "all"));
        });

        const PANE_TITLES = ["duplicates", "totp_hub", "watchtower", "home"];
        const rightPaneTitle = computed(() =>
            PANE_TITLES.includes(rightPaneMode.value) ? t("title.pane." + rightPaneMode.value) : t("title.vault"));

        function openFullPageMode(modeName) {
            selectedItem.value = null;
            searchQuery.value = "";
            multiSelectMode.value = false;
            manualSelectedIds.value = [];
            mobileNavOpen.value = false;
            rightPaneMode.value = modeName;
        }

        function openHomeOverview() { openFullPageMode("home"); }
        function openWatchtowerDashboard() { openFullPageMode("watchtower"); }
        function openDuplicatesView() { openFullPageMode("duplicates"); }

        function onSearchInput() {
            selectedItem.value = null;
            if (rightPaneMode.value !== "item") rightPaneMode.value = "item";
        }

        function resetAllFilters() {
            selectedItem.value = null;
            searchQuery.value = "";
            currentView.value = "all";
            currentCategory.value = "all";
            currentFolder.value = "all";
            multiSelectMode.value = false;
            manualSelectedIds.value = [];
            mobileNavOpen.value = false;
            rightPaneMode.value = "item";
        }

        function selectItemCard(item) {
            selectedItem.value = item;
            activeSubCardIdx.value = 0;
            subCardsViewAll.value = false;
            rightPaneMode.value = "item";
        }

        function getEntryColorHex(title) {
            const str = (title || "aegis").toLowerCase();
            let hash = 0;
            for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
            return ENTRY_COLORS[Math.abs(hash) % ENTRY_COLORS.length];
        }

        function formatDomain(url) {
            if (!url || typeof url !== "string") return "";
            const raw = url.trim();
            if (isAndroidAppUrl(raw)) return extractAndroidPkg(raw);
            try {
                const host = new URL(raw.startsWith("http") ? raw : "https://" + raw).hostname.replace(/^www\./, '');
                return decodePunycodeText(host);
            } catch (e) { return decodePunycodeText(raw); }
        }

        function getRootBrandDomain(hostname) {
            if (!hostname) return "";
            const clean = hostname.toLowerCase().replace(/^https?:\/\//, '').split('/')[0].split(':')[0].replace(/^www\./, '');
            const parts = clean.split('.');
            if (parts.length > 2) {
                const prefixes = ["my", "panel", "cp", "account", "accounts", "login", "auth", "id", "client", "lk", "cabinet", "passport", "mail", "sso", "help", "support", "app", "web", "online", "nibbler", "data", "iot", "game", "aws", "csee", "android", "best"];
                if (prefixes.includes(parts[0]) || parts[0].startsWith("acc-")) return parts.slice(1).join('.');
            }
            return parts.join('.');
        }

        // Иконки сайтов отключены (AUDIT.md, этап 3): внешний сервис иконок получал бы список доменов из сейфа,
        // а сервиса без такой утечки нет. Всегда null — в списке остаются буквы на цветном фоне.
        function getFaviconUrl(decryptedObj) {
            return null;
        }

        function checkFaviconQuality(event, item) {
            const img = event.target;
            if (img && img.naturalWidth <= 16) item.badFavicon = true;
        }

        function formatTimestamp(ts) {
            if (!ts) return t("time.recently");
            try {
                return new Intl.DateTimeFormat(currentLocale(), { day: "numeric", month: "short" }).format(new Date(ts * 1000));
            } catch (e) { return t("time.recently"); }
        }

        let toastSeq = 0;
        // kind: "success" (по умолчанию) | "warn" (подсказка, нет сети/прав) | "error" (сбой операции)
        function showToast(text, kind = "success") {
            const id = ++toastSeq;
            toasts.value.push({ id, text, kind });
            setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id); }, 2800);
        }

        function setFilter(view, category, folder = "all") {
            selectedItem.value = null;
            currentView.value = view;
            currentCategory.value = category;
            currentFolder.value = folder;
            searchQuery.value = "";
            multiSelectMode.value = false;
            manualSelectedIds.value = [];
            mobileNavOpen.value = false;
            rightPaneMode.value = "item";
        }

        function getInitials(title) {
            const clean = (title || "?").replace(/^https?:\/\//, '').replace(/^www\./, '').trim();
            return clean.substring(0, 1).toUpperCase();
        }

        function formatTotp(code) {
            if (!code || code.length !== 6) return code || "------";
            return code.substring(0, 3) + " " + code.substring(3);
        }

        const activeItems = computed(() => vaultItems.value.filter(i => !i.is_trashed));
        const trashedItems = computed(() => vaultItems.value.filter(i => i.is_trashed));
        const itemsWithTotp = computed(() => activeItems.value.filter(i => i.decrypted?.totpSecret));
        const countApps = computed(() => activeItems.value.filter(i => isAndroidAppUrl(i.decrypted?.url)).length);

        const duplicateGroups = computed(() => {
            const map = new Map();
            for (const it of activeItems.value) {
                if (it.decrypted?.itemType === 'note') continue;
                let rootService = "";
                if (isAndroidAppUrl(it.decrypted?.url)) {
                    rootService = resolveDomainFromAndroidPkg(extractAndroidPkg(it.decrypted.url), it.decrypted?.title || "");
                } else {
                    const rawDom = formatDomain(it.decrypted?.url) || decodePunycodeText(it.decrypted?.title) || "";
                    rootService = getRootBrandDomain(rawDom);
                }
                if (!rootService) continue;

                const user = (it.decrypted?.username || "").toLowerCase().trim();
                const key = dupGroupByMode.value === "domain"
                    ? `${it.scope}::${rootService}`
                    : `${it.scope}::${rootService}::${user}`;

                if (ignoredDupKeys.value.includes(key)) continue;

                if (!map.has(key)) {
                    map.set(key, {
                        key,
                        title: rootService,
                        username: user,
                        primaryId: it.id,
                        items: []
                    });
                }
                if (it.mergeSelected === undefined) it.mergeSelected = true;
                map.get(key).items.push(it);
            }
            return Array.from(map.values()).filter(g => g.items.length > 1);
        });

        async function combineIntoMultiCard(grp) {
            if (isOfflineBlocked()) return;
            try {
                const selectedForMerge = grp.items.filter(i => i.mergeSelected !== false);
                if (selectedForMerge.length < 2) return;

                const primary = selectedForMerge.find(i => i.id === grp.primaryId) || selectedForMerge[0];
                const others = selectedForMerge.filter(i => i.id !== primary.id);

                const mergedDecrypted = JSON.parse(JSON.stringify(primary.decrypted));
                const existingSubCards = Array.isArray(mergedDecrypted.subCards) ? mergedDecrypted.subCards : [];

                const newSubCards = [...existingSubCards];
                for (const card of selectedForMerge) {
                    const d = card.decrypted || {};
                    newSubCards.push({
                        originalId: card.id,
                        title: d.title || grp.title,
                        username: d.username || "",
                        password: d.password || "",
                        url: d.url || "",
                        note: d.note || "",
                        showSubPwd: false
                    });
                }
                mergedDecrypted.subCards = newSubCards;
                mergedDecrypted.title = grp.title;

                const keyToUse = (primary.scope === 'family' && familyKey) ? familyKey : vaultKey;
                const { ciphertext, iv } = await encryptData(keyToUse, mergedDecrypted);

                await fetch(`/api/vault/${primary.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                    body: JSON.stringify({
                        scope: primary.scope,
                        category: primary.category || "login",
                        is_favorite: Boolean(primary.is_favorite),
                        is_trashed: false,
                        ciphertext, iv
                    })
                });

                for (const o of others) {
                    await fetch(`/api/vault/${o.id}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${sessionToken.value}` }
                    });
                }

                await loadVault();
                const updatedPrimary = vaultItems.value.find(x => x.id === primary.id);
                if (updatedPrimary) {
                    selectedItem.value = updatedPrimary;
                    activeSubCardIdx.value = 0;
                    subCardsViewAll.value = false;
                    rightPaneMode.value = "item";
                }
                showToast(t("merge.multiDone"));
            } catch (e) {}
        }

        async function unmergeMultiCard(item) {
            if (isOfflineBlocked()) return;
            if (!confirm(t("merge.confirmUnmerge"))) return;
            try {
                const subCards = item.decrypted.subCards || [];
                if (subCards.length === 0) return;

                const keyToUse = (item.scope === 'family' && familyKey) ? familyKey : vaultKey;
                const [first, ...rest] = subCards;

                const cleanedMain = {
                    ...item.decrypted,
                    title: first.title || item.decrypted.title,
                    username: first.username,
                    password: first.password,
                    url: first.url,
                    note: first.note,
                    subCards: []
                };
                const encMain = await encryptData(keyToUse, cleanedMain);
                await fetch(`/api/vault/${item.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                    body: JSON.stringify({
                        scope: item.scope, category: item.category || "login",
                        is_favorite: Boolean(item.is_favorite), is_trashed: false,
                        ciphertext: encMain.ciphertext, iv: encMain.iv
                    })
                });

                for (const sc of rest) {
                    const newCardObj = {
                        itemType: "login",
                        title: sc.title || item.decrypted.title,
                        username: sc.username || "",
                        password: sc.password || "",
                        url: sc.url || "",
                        note: sc.note || "",
                        customFields: [], passwordHistory: [], subCards: []
                    };
                    const encSub = await encryptData(keyToUse, newCardObj);
                    await fetch("/api/vault", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                        body: JSON.stringify({
                            scope: item.scope, category: "login",
                            is_favorite: false, is_trashed: false,
                            ciphertext: encSub.ciphertext, iv: encSub.iv
                        })
                    });
                }

                await loadVault();
                showToast(t("merge.unmerged"));
            } catch (e) {}
        }

        async function mergeSingleGroup(grp) {
            if (isOfflineBlocked()) return;
            try {
                const selectedForMerge = grp.items.filter(i => i.mergeSelected !== false);
                if (selectedForMerge.length < 2) return;

                const primary = selectedForMerge.find(i => i.id === grp.primaryId) || selectedForMerge[0];
                const others = selectedForMerge.filter(i => i.id !== primary.id);

                const mergedDecrypted = JSON.parse(JSON.stringify(primary.decrypted));
                const keyToUse = (primary.scope === 'family' && familyKey) ? familyKey : vaultKey;
                const { ciphertext, iv } = await encryptData(keyToUse, mergedDecrypted);

                await fetch(`/api/vault/${primary.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                    body: JSON.stringify({
                        scope: primary.scope, category: primary.category || "login",
                        is_favorite: Boolean(primary.is_favorite), is_trashed: false,
                        ciphertext, iv
                    })
                });

                for (const o of others) {
                    await fetch(`/api/vault/${o.id}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${sessionToken.value}` }
                    });
                }

                await loadVault();
                showToast(t("merge.singleDone"));
            } catch (e) {}
        }

        const countByScope = (sc) => activeItems.value.filter(i => i.scope === sc).length;
        const countFavorites = computed(() => activeItems.value.filter(i => i.is_favorite).length);
        const countByCategory = (cat) => activeItems.value.filter(i => (i.decrypted.itemType || 'login') === cat).length;

        function isWeakPassword(item) {
            if (item.decrypted?.itemType === 'note') return false;
            const p = item.decrypted?.password || "";
            return p.length > 0 && p.length < 10;
        }
        function isReusedPassword(item) {
            if (item.decrypted?.itemType === 'note') return false;
            const p = item.decrypted?.password || "";
            if (!p) return false;
            return activeItems.value.filter(other => other.id !== item.id && other.decrypted?.itemType !== 'note' && other.decrypted?.password === p).length > 0;
        }

        const weakCount = computed(() => activeItems.value.filter(it => isWeakPassword(it)).length);
        const reusedCount = computed(() => activeItems.value.filter(it => isReusedPassword(it)).length);

        const securityScore = computed(() => {
            const loginItems = activeItems.value.filter(i => i.decrypted?.itemType !== 'note');
            if (loginItems.length === 0) return 100;
            const bad = loginItems.filter(it => isWeakPassword(it) || isReusedPassword(it)).length;
            return Math.max(0, Math.round(((loginItems.length - bad) / loginItems.length) * 100));
        });

        // Данные для круговой диаграммы «Дозора безопасности»
        const securityBreakdown = computed(() => {
            let weak = 0, reused = 0, good = 0;
            for (const it of activeItems.value) {
                if (it.decrypted?.itemType === 'note') continue;
                if (isWeakPassword(it)) weak++;
                else if (isReusedPassword(it)) reused++;
                else good++;
            }
            const total = weak + reused + good;
            const C = 2 * Math.PI * 52;
            let acc = 0;
            const mk = (value, color, label) => {
                const len = total ? (value / total) * C : 0;
                const seg = { value, color, label, dash: `${len} ${C - len}`, offset: -acc };
                acc += len;
                return seg;
            };
            return { total, segs: [mk(good, "#10b981", "good"), mk(reused, "#f59e0b", "reused"), mk(weak, "#e11d48", "weak")] };
        });

        async function checkStatus() {
            try {
                const res = await fetch("/api/status");
                const data = await res.json();
                hasUsers.value = Boolean(data.initialized);
                setupTokenRequired.value = Boolean(data.setup_token_required);
                if (!data.initialized) authMode.value = "register";
            } catch (e) {} finally { loading.value = false; }
        }

        async function importKeyFromHex(hex) {
            return window.crypto.subtle.importKey("raw", hexToBytes(hex), { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
        }

        async function handleLogin() {
            const uname = (loginForm.value.username || "").trim().toLowerCase();
            const pwd = loginForm.value.password || "";
            if (!uname || !pwd) return showToast(t("auth.err.enterCredentials"), "warn");

            try {
                let saltRes;
                try { saltRes = await fetch(`/api/auth/params/${encodeURIComponent(uname)}`); }
                catch (netErr) { throw new Error("OFFLINE_FALLBACK"); }
                if (!saltRes.ok) throw new Error("OFFLINE_FALLBACK");
                const saltData = await saltRes.json();
                const { encKey, authHash } = await deriveKeyFromPasswordAndSalt(pwd, hexToBytes(saltData.kdf_salt));

                let res;
                try {
                    res = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username: uname, client_auth_hash: authHash })
                    });
                } catch (netErr) { throw new Error("OFFLINE_FALLBACK"); }
                if (!res.ok) throw new Error(await apiErrorText(res, "server.bad_credentials"));
                const data = await res.json();

                // Включена двухфакторная защита: пароль верный, сессии ещё нет — нужен код
                if (data.totp_required) {
                    startTotpLoginStep({ uname, encKey, kdfSalt: saltData.kdf_salt, challenge: data.challenge });
                    return;
                }
                await completeLogin(uname, encKey, saltData.kdf_salt, data);
            } catch (e) {
                if (e.message === "OFFLINE_FALLBACK") {
                    const cachedAuth = localStorage.getItem(`offline_auth_${uname}`);
                    if (!cachedAuth) return showToast(t("auth.err.offlineNoCopy"), "warn");
                    try {
                        const offlineData = JSON.parse(cachedAuth);
                        const { encKey } = await deriveKeyFromPasswordAndSalt(pwd, hexToBytes(offlineData.kdf_salt));
                        const encVK = JSON.parse(offlineData.encrypted_vault_key);
                        const vkRaw = await decryptData(encKey, encVK.ciphertext, encVK.iv);
                        if (!vkRaw) throw new Error("bad password");
                        vaultKey = await importKeyFromHex(vkRaw.rawKey);

                        if (offlineData.encrypted_family_key) {
                            const encFam = JSON.parse(offlineData.encrypted_family_key);
                            const famRaw = await decryptData(vaultKey, encFam.ciphertext, encFam.iv);
                            if (famRaw?.rawKey) familyKey = await importKeyFromHex(famRaw.rawKey);
                        }

                        resetIdleTimer();
                        sessionToken.value = "OFFLINE_MODE";
                        currentUsername.value = offlineData.username;
                        isAdmin.value = false;
                        loginForm.value = { username: "", password: "" };
                        await loadVault();
                        setFilter("all", "all", "all");
                        showToast(t("auth.offlineOpened"));
                    } catch (offErr) {
                        vaultKey = null;
                        familyKey = null;
                        showToast(t("auth.err.wrongMasterPassword"), "error");
                    }
                    return;
                }
                showToast(e.message || t("auth.err.loginFailed"), "error");
            }
        }

        // Второй шаг входа (TOTP): ключ пароля держится в памяти только до кода, не дольше срока challenge
        let pendingLogin = null;
        let pendingLoginTimer = null;
        function startTotpLoginStep(p) {
            pendingLogin = p;
            loginForm.value.password = "";
            totpLoginCode.value = "";
            totpUseBackup.value = false;
            totpStepActive.value = true;
            clearTimeout(pendingLoginTimer);
            pendingLoginTimer = setTimeout(() => {
                if (pendingLogin === p) { cancelTotpLogin(); showToast(t("server.totp_challenge_expired"), "warn"); }
            }, 5 * 60 * 1000);
        }
        function cancelTotpLogin() {
            clearTimeout(pendingLoginTimer);
            pendingLogin = null;
            totpLoginCode.value = "";
            totpUseBackup.value = false;
            totpStepActive.value = false;
        }
        function toggleTotpBackup() {
            totpUseBackup.value = !totpUseBackup.value;
            totpLoginCode.value = "";
        }

        async function handleTotpLogin() {
            const code = (totpLoginCode.value || "").trim();
            if (!pendingLogin) return cancelTotpLogin();
            if (!code) return showToast(t("totp.enterCode"), "warn");
            const p = pendingLogin;
            try {
                let res;
                try {
                    res = await fetch("/api/auth/login/totp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ challenge: p.challenge, code })
                    });
                } catch (netErr) { return showToast(t("auth.err.loginFailed"), "error"); }
                if (!res.ok) {
                    let body = null;
                    try { body = await res.json(); } catch (e) {}
                    if (body?.detail === "totp_challenge_expired") cancelTotpLogin();
                    totpLoginCode.value = "";
                    return showToast(serverErrorText(body, "server.bad_totp"), "error");
                }
                const data = await res.json();
                cancelTotpLogin();
                await completeLogin(p.uname, p.encKey, p.kdfSalt, data);
            } catch (e) {
                showToast(e.message || t("auth.err.loginFailed"), "error");
            }
        }

        // Общее завершение входа: ответ /api/auth/login или /api/auth/login/totp
        async function completeLogin(uname, encKey, kdfSalt, data) {
            currentUserSalt.value = kdfSalt;

            localStorage.setItem(`offline_auth_${uname}`, JSON.stringify({
                kdf_salt: kdfSalt,
                encrypted_vault_key: data.encrypted_vault_key,
                encrypted_family_key: data.encrypted_family_key,
                username: data.username,
                is_admin: data.is_admin
            }));

            const encVaultKeyObj = JSON.parse(data.encrypted_vault_key);
            const vaultKeyRawObj = await decryptData(encKey, encVaultKeyObj.ciphertext, encVaultKeyObj.iv);
            vaultKey = await importKeyFromHex(vaultKeyRawObj.rawKey);

            if (data.encrypted_family_key) {
                const encFamObj = JSON.parse(data.encrypted_family_key);
                const famKeyRawObj = await decryptData(vaultKey, encFamObj.ciphertext, encFamObj.iv);
                if (famKeyRawObj?.rawKey) familyKey = await importKeyFromHex(famKeyRawObj.rawKey);
            }

            if (data.encrypted_escrow_private_key) {
                const encEscrowObj = JSON.parse(data.encrypted_escrow_private_key);
                const escrowObj = await decryptData(vaultKey, encEscrowObj.ciphertext, encEscrowObj.iv);
                if (escrowObj?.pkcs8 && escrowObj?.pub) {
                    escrowPrivateKey = await window.crypto.subtle.importKey("pkcs8", hexToBytes(escrowObj.pkcs8), ECDH_P256, false, ["deriveBits"]);
                    escrowPublicKeyHex = escrowObj.pub;
                }
            }

            resetIdleTimer();
            sessionToken.value = data.token;
            currentUsername.value = data.username;
            isAdmin.value = Boolean(data.is_admin);
            loginForm.value = { username: "", password: "" };
            await loadVault();
            setFilter("all", "all", "all");
            loadTotpStatus();
        }

        function openSecuritySettingsModal() {
            pwdChangeForm.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
            mobileNavOpen.value = false;
            showSecurityModal.value = true;
        }

        function openTotpModal() {
            totpSetup.value = null;
            totpForm.value = { password: "", code: "" };
            totpBackupCodes.value = [];
            mobileNavOpen.value = false;
            showTotpModal.value = true;
            loadTotpStatus();
        }

        function closeTotpModal() {
            showTotpModal.value = false;
            totpSetup.value = null;
            totpForm.value = { password: "", code: "" };
            totpBackupCodes.value = [];
        }

        // Настройки двухфакторной защиты (TOTP) в окне безопасности
        function resetTotpSettings() {
            totpStatus.value = { loaded: false, enabled: false, backupCodesLeft: 0 };
            totpSetup.value = null;
            totpForm.value = { password: "", code: "" };
            totpBackupCodes.value = [];
        }

        function authJsonHeaders() {
            return { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` };
        }

        async function loadTotpStatus() {
            if (!sessionToken.value || sessionToken.value === "OFFLINE_MODE") return;
            try {
                const res = await fetch("/api/auth/totp", { headers: { "Authorization": `Bearer ${sessionToken.value}` } });
                if (!res.ok) return;
                const d = await res.json();
                totpStatus.value = { loaded: true, enabled: Boolean(d.enabled), backupCodesLeft: Number(d.backup_codes_left) || 0 };
            } catch (e) {}
        }

        async function currentAuthHash(pwd) {
            const { authHash } = await deriveKeyFromPasswordAndSalt(pwd, hexToBytes(currentUserSalt.value));
            return authHash;
        }

        async function startTotpSetup() {
            if (isOfflineBlocked()) return;
            const pwd = totpForm.value.password;
            if (!pwd) return showToast(t("totp.enterPassword"), "warn");
            try {
                const res = await fetch("/api/auth/totp/setup", {
                    method: "POST", headers: authJsonHeaders(),
                    body: JSON.stringify({ client_auth_hash: await currentAuthHash(pwd) })
                });
                if (!res.ok) return showToast(await apiErrorText(res, "totp.failed"), "error");
                const d = await res.json();
                totpSetup.value = { secret: d.secret, qr: generateQrSvg(d.otpauth_uri) };
                totpForm.value = { password: "", code: "" };
            } catch (e) {
                showToast(t("totp.failed"), "error");
            }
        }

        function cancelTotpSetup() {
            totpSetup.value = null;
            totpForm.value = { password: "", code: "" };
        }

        async function confirmTotpEnable() {
            if (isOfflineBlocked()) return;
            const code = (totpForm.value.code || "").trim();
            if (!code) return showToast(t("totp.enterCode"), "warn");
            try {
                const res = await fetch("/api/auth/totp/enable", {
                    method: "POST", headers: authJsonHeaders(), body: JSON.stringify({ code })
                });
                if (!res.ok) {
                    totpForm.value.code = "";
                    return showToast(await apiErrorText(res, "totp.failed"), "error");
                }
                const d = await res.json();
                totpSetup.value = null;
                totpForm.value = { password: "", code: "" };
                // Резервные коды приходят один раз: показываем, пока пользователь не закроет
                totpBackupCodes.value = Array.isArray(d.backup_codes) ? d.backup_codes : [];
                showToast(t("totp.enabled"));
                await loadTotpStatus();
            } catch (e) {
                showToast(t("totp.failed"), "error");
            }
        }

        async function disableTotp() {
            if (isOfflineBlocked()) return;
            const pwd = totpForm.value.password;
            const code = (totpForm.value.code || "").trim();
            if (!pwd || !code) return showToast(t("totp.enterPasswordAndCode"), "warn");
            try {
                const res = await fetch("/api/auth/totp/disable", {
                    method: "POST", headers: authJsonHeaders(),
                    body: JSON.stringify({ client_auth_hash: await currentAuthHash(pwd), code })
                });
                if (!res.ok) return showToast(await apiErrorText(res, "totp.failed"), "error");
                totpForm.value = { password: "", code: "" };
                showToast(t("totp.disabled"));
                await loadTotpStatus();
            } catch (e) {
                showToast(t("totp.failed"), "error");
            }
        }

        function copyBackupCodes() {
            copyText(totpBackupCodes.value.join("\n"), false);
        }

        function downloadBackupCodes() {
            const text = t("totp.backup.sheet", { user: currentUsername.value, codes: totpBackupCodes.value.join("\n") });
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "fravashi_backup_codes.txt";
            a.click();
        }

        async function handleChangeOwnPassword() {
            if (isOfflineBlocked()) return;
            try {
                const curPwd = pwdChangeForm.value.currentPassword;
                const newPwd = pwdChangeForm.value.newPassword;
                const confPwd = pwdChangeForm.value.confirmPassword;
                if (!curPwd || !newPwd || newPwd !== confPwd) return showToast(t("security.checkFields"), "warn");

                const { authHash: currentClientAuthHash } = await deriveKeyFromPasswordAndSalt(curPwd, hexToBytes(currentUserSalt.value));
                const rawVaultKeyHex = bytesToHex(new Uint8Array(await window.crypto.subtle.exportKey("raw", vaultKey)));
                const { saltHex: newSaltHex, encKey: newEncKey, authHash: newClientAuthHash } = await deriveKeyAndAuthHash(newPwd, null);
                const newEncryptedVaultKeyObj = await encryptData(newEncKey, { rawKey: rawVaultKeyHex });

                const newRecKeyPlain = Array.from(window.crypto.getRandomValues(new Uint8Array(12))).map(b => b.toString(16).padStart(2, '0')).join('-').toUpperCase();
                const { saltHex: newRecSaltHex, encKey: newRecEncKey, authHash: newRecAuthHash } = await deriveKeyAndAuthHash(newRecKeyPlain, null);
                const newRecEncryptedVaultKeyObj = await encryptData(newRecEncKey, { rawKey: rawVaultKeyHex });

                const res = await fetch("/api/auth/change-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                    body: JSON.stringify({
                        current_client_auth_hash: currentClientAuthHash,
                        new_kdf_salt: newSaltHex,
                        new_client_auth_hash: newClientAuthHash,
                        new_encrypted_vault_key: JSON.stringify(newEncryptedVaultKeyObj),
                        new_recovery_salt: newRecSaltHex,
                        new_recovery_auth_hash: newRecAuthHash,
                        new_recovery_encrypted_vault_key: JSON.stringify(newRecEncryptedVaultKeyObj)
                    })
                });
                if (!res.ok) throw new Error(await apiErrorText(res, "security.changeFailed"));

                currentUserSalt.value = newSaltHex;
                showSecurityModal.value = false;
                userRecoveryKeyPlain.value = newRecKeyPlain;
                showRecoveryModal.value = true;
                showToast(t("security.changed"));
            } catch (e) {
                showToast(e.message, "error");
            }
        }

        async function handleRegister() {
            try {
                const uname = (regForm.value.username || "").trim().toLowerCase();
                const pwd = regForm.value.password || "";
                if (!uname || !pwd || pwd !== regForm.value.passwordConfirm) return showToast(t("auth.err.checkFields"), "warn");

                const newVaultKey = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
                const rawVaultKeyHex = bytesToHex(new Uint8Array(await window.crypto.subtle.exportKey("raw", newVaultKey)));
                
                const { saltHex, encKey, authHash } = await deriveKeyAndAuthHash(pwd, null);
                const encryptedVaultKeyObj = await encryptData(encKey, { rawKey: rawVaultKeyHex });

                const recKeyPlain = Array.from(window.crypto.getRandomValues(new Uint8Array(12))).map(b => b.toString(16).padStart(2, '0')).join('-').toUpperCase();
                const { saltHex: recSaltHex, encKey: recEncKey, authHash: recAuthHash } = await deriveKeyAndAuthHash(recKeyPlain, null);
                const recoveryEncryptedVaultKeyObj = await encryptData(recEncKey, { rawKey: rawVaultKeyHex });

                let encryptedFamilyKey = null;
                let adminEscrowVaultKey = null;
                let encryptedEscrowPrivateKey = null;
                let inviteId = null;

                if (!hasUsers.value) {
                    const newFamKey = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
                    const rawFamHex = bytesToHex(new Uint8Array(await window.crypto.subtle.exportKey("raw", newFamKey)));
                    encryptedFamilyKey = JSON.stringify(await encryptData(newVaultKey, { rawKey: rawFamHex }));

                    // Пара ECDH админа: приватный ключ хранится только обёрнутым его ключом сейфа
                    const escrowPair = await window.crypto.subtle.generateKey(ECDH_P256, true, ["deriveBits"]);
                    const pkcs8Hex = bytesToHex(new Uint8Array(await window.crypto.subtle.exportKey("pkcs8", escrowPair.privateKey)));
                    const pubHex = bytesToHex(new Uint8Array(await window.crypto.subtle.exportKey("raw", escrowPair.publicKey)));
                    encryptedEscrowPrivateKey = JSON.stringify(await encryptData(newVaultKey, { pkcs8: pkcs8Hex, pub: pubHex }));
                } else {
                    const inviteCodeClean = normalizeInviteCode(regForm.value.inviteCode);
                    if (inviteCodeClean.length !== INVITE_CODE_LENGTH) throw new Error(t("auth.err.badInvite"));
                    const inv = await deriveInviteSecrets(inviteCodeClean);
                    const invRes = await fetch("/api/invite/lookup", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ invite_id: inv.inviteId })
                    });
                    if (!invRes.ok) throw new Error(await apiErrorText(invRes, "auth.err.badInvite"));
                    const invData = await invRes.json();
                    const invFamBlob = JSON.parse(invData.encrypted_family_key_for_invite);
                    // Публичный ключ админа приходит внутри блоба под ключом из инвайт-кода: сервер его не подменит
                    const invPayload = await decryptData(inv.wrapKey, invFamBlob.ciphertext, invFamBlob.iv);
                    if (!invPayload?.rawKey) throw new Error(t("auth.err.badInvite"));
                    encryptedFamilyKey = JSON.stringify(await encryptData(newVaultKey, { rawKey: invPayload.rawKey }));

                    if (regForm.value.allowEscrow && invPayload.adminPub) {
                        adminEscrowVaultKey = JSON.stringify(await sealForAdmin(invPayload.adminPub, { rawKey: rawVaultKeyHex }));
                    }
                    inviteId = inv.inviteId;
                }

                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: uname, kdf_salt: saltHex, client_auth_hash: authHash,
                        encrypted_vault_key: JSON.stringify(encryptedVaultKeyObj),
                        recovery_salt: recSaltHex, recovery_auth_hash: recAuthHash,
                        recovery_encrypted_vault_key: JSON.stringify(recoveryEncryptedVaultKeyObj),
                        encrypted_family_key: encryptedFamilyKey,
                        admin_escrow_vault_key: adminEscrowVaultKey,
                        encrypted_escrow_private_key: encryptedEscrowPrivateKey,
                        invite_id: inviteId,
                        setup_token: hasUsers.value ? null : (regForm.value.setupToken || "").trim() || null
                    })
                });
                if (!res.ok) throw new Error(await apiErrorText(res, "auth.err.registerFailed"));

                hasUsers.value = true;
                setupTokenRequired.value = false;
                userRecoveryKeyPlain.value = recKeyPlain;
                showRecoveryModal.value = true;
                authMode.value = "login";
                loginForm.value.username = uname;
            } catch (e) {
                showToast(e.message, "error");
            }
        }

        async function handleRecoveryReset() {
            try {
                const uname = (recForm.value.username || "").trim().toLowerCase();
                const recKey = (recForm.value.recoveryKey || "").trim().toUpperCase();
                const newPwd = recForm.value.newPassword || "";
                const saltRes = await fetch(`/api/auth/params/${encodeURIComponent(uname)}`);
                const saltData = await saltRes.json();
                const { encKey: recEncKey, authHash: recAuthHash } = await deriveKeyFromPasswordAndSalt(recKey, hexToBytes(saltData.recovery_salt));

                const fetchRes = await fetch("/api/auth/recovery-fetch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: uname, client_auth_hash: recAuthHash })
                });
                if (!fetchRes.ok) throw new Error(await apiErrorText(fetchRes, "auth.err.badRecoveryKey"));
                const fetchData = await fetchRes.json();
                const recObj = JSON.parse(fetchData.recovery_encrypted_vault_key);
                const rawVaultKeyObj = await decryptData(recEncKey, recObj.ciphertext, recObj.iv);

                const { saltHex: newSaltHex, encKey: newEncKey, authHash: newAuthHash } = await deriveKeyAndAuthHash(newPwd, null);
                const newEncryptedVaultKeyObj = await encryptData(newEncKey, { rawKey: rawVaultKeyObj.rawKey });

                const resetRes = await fetch("/api/auth/recovery-reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: uname, recovery_auth_hash: recAuthHash,
                        new_kdf_salt: newSaltHex, new_client_auth_hash: newAuthHash,
                        new_encrypted_vault_key: JSON.stringify(newEncryptedVaultKeyObj)
                    })
                });
                if (!resetRes.ok) throw new Error(await apiErrorText(resetRes, "auth.err.resetFailed"));
                showToast(t("auth.accessRestored"));
                authMode.value = "login";
            } catch (e) {
                showToast(e.message, "error");
            }
        }

        function handleLogout(isAutoIdle = false) {
            if (sessionToken.value && sessionToken.value !== "OFFLINE_MODE") {
                fetch("/api/auth/logout", { method: "POST", headers: { "Authorization": `Bearer ${sessionToken.value}` } }).catch(() => {});
            }
            // Стираем ключи и всё расшифрованное из памяти
            sessionToken.value = null;
            vaultKey = null;
            familyKey = null;
            escrowPrivateKey = null;
            escrowPublicKeyHex = null;
            vaultItems.value = [];
            selectedItem.value = null;
            editingItem.value = null;
            itemForm.value = {
                scope: "personal", itemType: "login", folder: "", title: "", url: "", username: "",
                password: "", totpSecret: "", note: "", customFields: [], passwordHistory: [], subCards: []
            };
            generatedPasswordString.value = "";
            userRecoveryKeyPlain.value = "";
            lastCreatedInvite.value = "";
            parsedCsvItems.value = [];
            systemLogs.value = [];
            familyMembers.value = [];
            pwnedResults.value = {};
            shownPwds.value = {};
            pwdChangeForm.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
            resetTotpSettings();
            cancelTotpLogin();
            mobileNavOpen.value = false;
            showItemModal.value = false;
            showAdminModal.value = false;
            showSecurityModal.value = false;
            showTotpModal.value = false;
            resetTotpSettings();
            showLogsModal.value = false;
            showGenModal.value = false;
            showImportModal.value = false;
            showRecoveryModal.value = false;
            showExtensionModal.value = false;
            showPwaModal.value = false;
            idleSecondsLeft.value = Math.floor(IDLE_TIMEOUT_MS / 1000);
            if (isAutoIdle === true) showToast(t("auth.autoLocked"));
        }

        function getLocalTrashedSet() {
            try { return new Set(JSON.parse(localStorage.getItem("fravashi_local_trash_ids") || "[]")); }
            catch (e) { return new Set(); }
        }
        function saveLocalTrashedSet(setObj) {
            localStorage.setItem("fravashi_local_trash_ids", JSON.stringify(Array.from(setObj)));
        }

        async function loadVault() {
            if (!vaultKey) return handleLogout();
            let rawItems = [];
            const unameKey = currentUsername.value.toLowerCase();

            if (sessionToken.value !== "OFFLINE_MODE") {
                try {
                    const res = await fetch("/api/vault", { headers: { "Authorization": `Bearer ${sessionToken.value}` } });
                    if (!res.ok) return handleLogout();
                    const data = await res.json();
                    rawItems = Array.isArray(data.items) ? data.items : [];
                    localStorage.setItem(`offline_vault_${unameKey}`, JSON.stringify(rawItems));
                } catch (e) {
                    const cached = localStorage.getItem(`offline_vault_${unameKey}`);
                    rawItems = cached ? JSON.parse(cached) : [];
                }
            } else {
                const cached = localStorage.getItem(`offline_vault_${unameKey}`);
                rawItems = cached ? JSON.parse(cached) : [];
            }

            const localTrash = getLocalTrashedSet();
            const list = [];
            for (const it of rawItems) {
                const keyToUse = (it.scope === 'family' && familyKey) ? familyKey : vaultKey;
                const dec = await decryptData(keyToUse, it.ciphertext, it.iv) || { title: t("item.undecryptable"), itemType: "login" };
                if (!dec.itemType) dec.itemType = "login";
                const isTrashedFlag = Boolean(it.is_trashed) || Boolean(dec._trashed) || localTrash.has(it.id);
                list.push({
                    ...it,
                    is_trashed: isTrashedFlag,
                    decrypted: dec,
                    showPwd: false,
                    badFavicon: false,
                    mergeSelected: true,
                    totpCode: "",
                    totpSecondsLeft: 30
                });
            }
            vaultItems.value = list;
            if (selectedItem.value) {
                selectedItem.value = vaultItems.value.find(x => x.id === selectedItem.value.id) || null;
            }
        }

        const filteredItems = computed(() => {
            if (!Array.isArray(vaultItems.value)) return [];
            let list = vaultItems.value.filter(it => {
                if (!it || !it.decrypted) return false;
                if (currentCategory.value === 'trash') return Boolean(it.is_trashed);
                if (it.is_trashed) return false;

                if (currentView.value !== 'all' && it.scope !== currentView.value) return false;
                if (currentFolder.value !== 'all' && getItemFolderId(it) !== currentFolder.value) return false;
                if (currentCategory.value === 'favorites' && !it.is_favorite) return false;
                if (currentCategory.value === 'weak' && !isWeakPassword(it)) return false;
                if (currentCategory.value === 'reused' && !isReusedPassword(it)) return false;
                if (currentCategory.value === 'apps' && !isAndroidAppUrl(it.decrypted?.url)) return false;
                if (['login', 'card', 'wifi', 'note'].includes(currentCategory.value) && (it.decrypted.itemType || 'login') !== currentCategory.value) return false;

                if (searchQuery.value && searchQuery.value.trim()) {
                    const q = searchQuery.value.toLowerCase();
                    const t = decodePunycodeText(it.decrypted.title || "").toLowerCase();
                    const u = (it.decrypted.username || "").toLowerCase();
                    const l = decodePunycodeText(it.decrypted.url || "").toLowerCase();
                    const n = (it.decrypted.note || "").toLowerCase();
                    return t.includes(q) || u.includes(q) || l.includes(q) || n.includes(q);
                }
                return true;
            });
            if (sortBy.value === "alpha") {
                const collator = new Intl.Collator(currentLocale(), { sensitivity: "base", numeric: true });
                list = [...list].sort((a, b) => collator.compare(decodePunycodeText(a.decrypted.title || ""), decodePunycodeText(b.decrypted.title || "")));
            }
            return list;
        });

        function openItemModal(item) {
            showModalPwd.value = false;
            mobileNavOpen.value = false;
            if (item) {
                editingItem.value = item;
                itemForm.value = {
                    scope: item.scope,
                    itemType: item.decrypted.itemType || "login",
                    folder: getItemFolderId(item),
                    title: decodePunycodeText(item.decrypted.title || ""),
                    url: decodePunycodeText(item.decrypted.url || ""),
                    username: item.decrypted.username || "",
                    password: item.decrypted.password || "",
                    totpSecret: item.decrypted.totpSecret || "",
                    note: item.decrypted.note || "",
                    customFields: Array.isArray(item.decrypted.customFields) ? JSON.parse(JSON.stringify(item.decrypted.customFields)) : [],
                    passwordHistory: Array.isArray(item.decrypted.passwordHistory) ? JSON.parse(JSON.stringify(item.decrypted.passwordHistory)) : [],
                    subCards: Array.isArray(item.decrypted.subCards) ? JSON.parse(JSON.stringify(item.decrypted.subCards)) : []
                };
            } else {
                editingItem.value = null;
                itemForm.value = {
                    scope: currentView.value === 'family' ? 'family' : 'personal',
                    itemType: ['login', 'card', 'wifi', 'note'].includes(currentCategory.value) ? currentCategory.value : 'login',
                    folder: currentFolder.value !== 'all' ? currentFolder.value : '',
                    title: "", url: "", username: "", password: "", totpSecret: "", note: "", customFields: [], passwordHistory: [], subCards: []
                };
            }
            showItemModal.value = true;
        }

        async function saveItem() {
            if (isOfflineBlocked()) return;
            if (!itemForm.value.title) return showToast(t("item.err.titleRequired"), "warn");

            // История паролей: при смене пароля старый уходит в passwordHistory (последние 5)
            if (editingItem.value && editingItem.value.decrypted?.password && editingItem.value.decrypted.password !== itemForm.value.password) {
                if (!Array.isArray(itemForm.value.passwordHistory)) itemForm.value.passwordHistory = [];
                itemForm.value.passwordHistory.unshift({
                    password: editingItem.value.decrypted.password,
                    changedAt: Math.floor(Date.now() / 1000)
                });
                itemForm.value.passwordHistory = itemForm.value.passwordHistory.slice(0, 5);
            }

            const keyToUse = (itemForm.value.scope === 'family' && familyKey) ? familyKey : vaultKey;
            const { ciphertext, iv } = await encryptData(keyToUse, itemForm.value);
            const payload = {
                scope: itemForm.value.scope,
                category: itemForm.value.itemType || "general",
                is_favorite: editingItem.value ? Boolean(editingItem.value.is_favorite) : false,
                is_trashed: false,
                ciphertext, iv
            };

            const url = editingItem.value ? `/api/vault/${editingItem.value.id}` : "/api/vault";
            const method = editingItem.value ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                if (editingItem.value && itemForm.value.folder !== undefined) {
                    localFolderMap.value[editingItem.value.id] = itemForm.value.folder;
                    localStorage.setItem("fravashi_folder_map", JSON.stringify(localFolderMap.value));
                }
                showItemModal.value = false;
                await loadVault();
                showToast(t("item.saved"));
            } else {
                showToast(await apiErrorText(res, "item.err.saveFailed"), "error");
            }
        }

        async function toggleFavorite(item) {
            if (isOfflineBlocked()) return;
            const payload = {
                scope: item.scope, category: item.category || "general",
                is_favorite: !item.is_favorite, is_trashed: Boolean(item.is_trashed),
                ciphertext: item.ciphertext, iv: item.iv
            };
            const res = await fetch(`/api/vault/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) item.is_favorite = !item.is_favorite;
        }

        async function moveToTrash(item) {
            if (isOfflineBlocked()) return;
            try {
                const localTrash = getLocalTrashedSet();
                localTrash.add(item.id);
                saveLocalTrashedSet(localTrash);

                const updatedDec = { ...item.decrypted, _trashed: true };
                const keyToUse = (item.scope === 'family' && familyKey) ? familyKey : vaultKey;
                const { ciphertext, iv } = await encryptData(keyToUse, updatedDec);

                await fetch(`/api/vault/${item.id}/trash`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${sessionToken.value}` }
                }).catch(() => {});

                await fetch(`/api/vault/${item.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                    body: JSON.stringify({
                        scope: item.scope, category: item.category || "general",
                        is_favorite: Boolean(item.is_favorite), is_trashed: true,
                        ciphertext, iv
                    })
                });

                item.is_trashed = true;
                if (selectedItem.value && selectedItem.value.id === item.id) selectedItem.value = null;
                showToast(t("trash.moved"));
            } catch (e) {}
        }

        async function restoreFromTrash(item) {
            if (isOfflineBlocked()) return;
            try {
                const localTrash = getLocalTrashedSet();
                localTrash.delete(item.id);
                saveLocalTrashedSet(localTrash);

                const updatedDec = { ...item.decrypted };
                delete updatedDec._trashed;
                const keyToUse = (item.scope === 'family' && familyKey) ? familyKey : vaultKey;
                const { ciphertext, iv } = await encryptData(keyToUse, updatedDec);

                await fetch(`/api/vault/${item.id}/restore`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${sessionToken.value}` }
                }).catch(() => {});

                await fetch(`/api/vault/${item.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                    body: JSON.stringify({
                        scope: item.scope, category: item.category || "general",
                        is_favorite: Boolean(item.is_favorite), is_trashed: false,
                        ciphertext, iv
                    })
                });

                item.is_trashed = false;
                selectedItem.value = null;
                showToast(t("trash.restored"));
            } catch (e) {}
        }

        async function deletePermanently(id) {
            if (isOfflineBlocked()) return;
            if (!confirm(t("trash.confirmDelete"))) return;
            const res = await fetch(`/api/vault/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${sessionToken.value}` }
            });
            if (res.ok) {
                const localTrash = getLocalTrashedSet();
                localTrash.delete(id);
                saveLocalTrashedSet(localTrash);
                vaultItems.value = vaultItems.value.filter(i => i.id !== id);
                selectedItem.value = null;
                showToast(t("trash.deleted"));
            }
        }

        async function emptyTrashAll() {
            if (isOfflineBlocked()) return;
            if (!confirm(t("trash.confirmEmpty"))) return;
            for (const it of trashedItems.value) {
                await fetch(`/api/vault/${it.id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${sessionToken.value}` }
                });
            }
            saveLocalTrashedSet(new Set());
            selectedItem.value = null;
            await loadVault();
            showToast(t("trash.emptied"));
        }

        function openPasswordGenerator() { generatePasswordPreview(); mobileNavOpen.value = false; showGenModal.value = true; }
        function generatePasswordPreview() {
            const sets = [];
            for (const k of Object.keys(GEN_SETS)) if (genOpts.value[k]) sets.push(GEN_SETS[k]);
            if (!sets.length) { genOpts.value = { ...genOpts.value, lower: true }; sets.push(GEN_SETS.lower); }
            const all = sets.join("");
            const len = Math.max(genLength.value, sets.length);
            const out = [];
            for (let i = 0; i < len; i++) out.push(all[secureRandomInt(all.length)]);
            // Гарантируем хотя бы по одному символу из каждого выбранного набора
            const used = new Set();
            for (const s of sets) {
                let pos;
                do { pos = secureRandomInt(len); } while (used.has(pos));
                used.add(pos);
                out[pos] = s[secureRandomInt(s.length)];
            }
            generatedPasswordString.value = out.join("");
        }
        function generatePasswordIntoForm() { generatePasswordPreview(); itemForm.value.password = generatedPasswordString.value; showModalPwd.value = true; }

        function openImportModal() { parsedCsvItems.value = []; resetJsonImport(); importTab.value = "csv"; mobileNavOpen.value = false; showImportModal.value = true; }
        function handleCsvFileSelect(e) {
            const file = e.target.files?.[0];
            if (!file) return;
            Papa.parse(file, {
                header: true, skipEmptyLines: true,
                complete: (results) => {
                    const rows = Array.isArray(results.data) ? results.data : [];
                    parsedCsvItems.value = rows.map(row => ({
                        itemType: "login",
                        title: decodePunycodeText(row.name || row.title || row.url || t("import.defaultTitle")),
                        url: row.url || row.login_uri || "",
                        username: row.username || row.login_username || row.email || "",
                        password: row.password || row.login_password || "",
                        totpSecret: row.totp || row.login_totp || "",
                        note: row.note || row.notes || row.comment || "",
                        customFields: [], passwordHistory: [], subCards: []
                    })).filter(r => r.username || r.password || r.url);
                }
            });
        }

        async function executeCsvImport() {
            if (isOfflineBlocked()) return;
            const keyToUse = (importTargetScope.value === 'family' && familyKey) ? familyKey : vaultKey;
            const batchPayload = [];
            for (const item of parsedCsvItems.value) {
                const { ciphertext, iv } = await encryptData(keyToUse, item);
                batchPayload.push({ scope: importTargetScope.value, category: "login", is_favorite: false, is_trashed: false, ciphertext, iv });
            }
            const res = await fetch("/api/vault/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                body: JSON.stringify({ items: batchPayload })
            });
            if (res.ok) {
                showImportModal.value = false;
                parsedCsvItems.value = [];
                await loadVault();
                showToast(t("import.done", { n: batchPayload.length }));
            } else {
                showToast(await apiErrorText(res, "import.err.server"), "error");
            }
        }

        // Импорт из JSON (разбор и проверка — static/import-json.js)
        const importTab = ref("csv");
        const jsonPreview = ref(null);
        const jsonError = ref("");
        const jsonForcePersonal = ref(false);
        const jsonBusy = ref(false);
        const jsonResult = ref("");
        const jsonFamilyMissing = computed(() => Boolean(jsonPreview.value && jsonPreview.value.stats.family > 0) && !familyKey);

        function resetJsonImport() {
            jsonPreview.value = null; jsonError.value = ""; jsonForcePersonal.value = false; jsonResult.value = "";
        }

        async function handleJsonFileSelect(e) {
            resetJsonImport();
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > FravashiImport.MAX_FILE_BYTES) { jsonError.value = t("import.err.fileTooBig", { mb: FravashiImport.MAX_FILE_BYTES / 1024 / 1024 }); return; }
            let text;
            try { text = await file.text(); } catch (err) { jsonError.value = t("import.err.readFailed"); return; }
            const r = FravashiImport.parseVaultJson(text, file.size, { defaultTitle: t("import.defaultTitle") });
            if (!r.ok) { jsonError.value = importErrorText(r); return; }
            jsonPreview.value = r;
        }

        async function executeJsonImport() {
            if (isOfflineBlocked() || !jsonPreview.value || jsonBusy.value) return;
            if (jsonFamilyMissing.value && !jsonForcePersonal.value) return;
            const items = jsonPreview.value.items;
            if (!items.length) return;
            jsonBusy.value = true;
            jsonError.value = "";
            try {
                // Шифруем всё до отправки: при ошибке шифрования ничего не уходит на сервер
                const payload = [];
                for (const it of items) {
                    const scope = (it.scope === "family" && familyKey) ? "family" : "personal";
                    const keyToUse = scope === "family" ? familyKey : vaultKey;
                    const { ciphertext, iv } = await encryptData(keyToUse, it.data);
                    payload.push({ scope, category: it.data.itemType, is_favorite: it.is_favorite, is_trashed: false, ciphertext, iv });
                }
                // Порции до ~8 МБ (лимит тела запроса 16 МБ); каждая порция принимается или отклоняется целиком
                const chunks = [];
                let cur = [], curSize = 0;
                for (const p of payload) {
                    const sz = p.ciphertext.length + p.iv.length + 200;
                    if (cur.length && (curSize + sz > 8 * 1024 * 1024 || cur.length >= 500)) { chunks.push(cur); cur = []; curSize = 0; }
                    cur.push(p); curSize += sz;
                }
                if (cur.length) chunks.push(cur);

                let done = 0;
                for (const chunk of chunks) {
                    const res = await fetch("/api/vault/batch", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                        body: JSON.stringify({ items: chunk })
                    });
                    if (!res.ok) {
                        const msg = await apiErrorText(res, res.status === 413 ? "import.err.tooLarge" : "import.err.server");
                        jsonError.value = t("import.err.partial", { msg, done, total: payload.length });
                        if (done) await loadVault();
                        return;
                    }
                    done += chunk.length;
                }
                // Пользовательские папки: добавляем недостающие, существующие не трогаем
                let foldersAdded = 0;
                for (const f of jsonPreview.value.customFolders) {
                    if (!customFolders.value.some(x => x.id === f.id)) { customFolders.value.push(f); foldersAdded++; }
                }
                if (foldersAdded) localStorage.setItem("fravashi_custom_folders", JSON.stringify(customFolders.value));
                const nFam = payload.filter(p => p.scope === "family").length;
                const asPersonal = payload.filter((p, i) => items[i].scope === "family" && p.scope === "personal").length;
                jsonResult.value = [
                    t("import.result.main", { done, personal: done - nFam, family: nFam }),
                    asPersonal ? tp("import.result.asPersonal", asPersonal) : "",
                    jsonPreview.value.skipped ? t("import.result.skipped", { n: jsonPreview.value.skipped }) : "",
                    foldersAdded ? t("import.result.folders", { n: foldersAdded }) : ""
                ].filter(Boolean).join("; ") + ". " + t("import.result.deleteFile");
                jsonPreview.value = null;
                await loadVault();
                showToast(t("import.done", { n: done }));
            } catch (err) {
                jsonError.value = t("import.err.generic", { msg: err && err.message ? err.message : t("import.err.unknown") });
            } finally {
                jsonBusy.value = false;
            }
        }

        function exportVaultJSON() {
            const items = activeItems.value.map(it => ({
                scope: it.scope,
                is_favorite: Boolean(it.is_favorite),
                ...it.decrypted,
                folder: it.decrypted.folder || localFolderMap.value[it.id] || ""
            }));
            const clean = { version: 2, exportedAt: new Date().toISOString(), customFolders: customFolders.value, items };
            const a = document.createElement('a');
            a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clean, null, 2));
            a.download = `fravashi_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
        }

        // Ошибка разбора JSON: код + место (запись, папка, поле) из import-json.js
        function importErrorText(r) {
            const w = r.where || {};
            const parts = [];
            if (w.item) parts.push(t("import.where.item", { n: w.item }) + (r.itemTitle ? " «" + r.itemTitle + "»" : ""));
            if (w.folder) parts.push(t("import.where.folder", { n: w.folder }));
            if (w.field) parts.push(t("import.field." + w.field, { n: w.n }));
            const noteTooLong = r.error === "tooLong" && w.field === "note";
            const msg = t(noteTooLong ? "import.err.noteTooLong" : "import.err." + r.error, r.params || {});
            return parts.length ? parts.join(", ") + ": " + msg : msg;
        }

        // Журнал: action — код события сервера; для неизвестных показывается detail как есть
        function logText(l) {
            return hasKey("log." + l.action) ? t("log." + l.action, { detail: l.detail }) : `${l.action}: ${l.detail}`;
        }

        function downloadRecoverySheet() {
            const text = t("recovery.sheet", { user: currentUsername.value || loginForm.value.username, key: userRecoveryKeyPlain.value });
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "fravashi_recovery_key.txt";
            a.click();
        }

        async function openAdminModal() {
            const res = await fetch("/api/admin/members", { headers: { "Authorization": `Bearer ${sessionToken.value}` } });
            if (!res.ok) return showToast(await apiErrorText(res), "error");
            const data = await res.json();
            familyMembers.value = Array.isArray(data.members) ? data.members : [];
            mobileNavOpen.value = false;
            showAdminModal.value = true;
        }

        async function createInviteCode() {
            if (!familyKey || !escrowPublicKeyHex) return showToast(t("admin.noKeys"), "warn");
            const plainCode = generateInviteCode();
            const { inviteId, wrapKey } = await deriveInviteSecrets(plainCode);
            const rawFamHex = bytesToHex(new Uint8Array(await window.crypto.subtle.exportKey("raw", familyKey)));
            const encFamObj = await encryptData(wrapKey, { rawKey: rawFamHex, adminPub: escrowPublicKeyHex });

            const res = await fetch("/api/admin/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                body: JSON.stringify({ invite_id: inviteId, encrypted_family_key_for_invite: JSON.stringify(encFamObj), ttl_minutes: 60 })
            });
            if (res.ok) { lastCreatedInvite.value = formatInviteCode(plainCode); showToast(t("admin.inviteCreated")); }
            else showToast(await apiErrorText(res), "error");
        }

        async function adminResetMemberPassword(member) {
            const tempPassword = prompt(t("admin.tempPasswordPrompt", { user: member.username }));
            if (!tempPassword) return;
            try {
                const escrowBlob = JSON.parse(member.admin_escrow_vault_key);
                const memberVaultKeyRaw = await openSealedForAdmin(escrowPrivateKey, escrowBlob);
                if (!memberVaultKeyRaw?.rawKey) throw new Error("escrow");
                const { saltHex: newSaltHex, encKey: newEncKey, authHash: newAuthHash } = await deriveKeyAndAuthHash(tempPassword, null);
                const newEncryptedVaultKeyObj = await encryptData(newEncKey, { rawKey: memberVaultKeyRaw.rawKey });

                const res = await fetch("/api/admin/recover-member", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken.value}` },
                    body: JSON.stringify({
                        target_user_id: member.id,
                        new_kdf_salt: newSaltHex,
                        new_client_auth_hash: newAuthHash,
                        new_encrypted_vault_key: JSON.stringify(newEncryptedVaultKeyObj)
                    })
                });
                if (res.ok) showToast(t("admin.resetDone", { user: member.username }));
                else showToast(await apiErrorText(res, "admin.resetFailed"), "error");
            } catch (e) {
                showToast(t("admin.resetFailed"), "error");
            }
        }

        function copyText(text, autoClear = false) {
            if (!text) return;
            navigator.clipboard.writeText(text).catch(() => {});
            showToast(autoClear ? t("copy.passwordAutoClear") : t("copy.done"));
            // Документ может быть не в фокусе (NotAllowedError) — тогда очистка просто не выполняется
            if (autoClear) setTimeout(() => {
                try { navigator.clipboard.writeText("").catch(() => {}); } catch (e) { }
            }, 30000);
        }

        onMounted(() => {
            runCryptoSelfTest().catch((e) => console.error("[FravashiVault] Crypto self-test crashed:", e));
            window.addEventListener("beforeinstallprompt", (e) => {
                e.preventDefault();
                deferredPwaPrompt = e;
                canInstallPwa.value = true;
            });
            window.addEventListener("appinstalled", () => {
                deferredPwaPrompt = null;
                canInstallPwa.value = false;
                showToast(t("pwa.installed"));
            });
            
            // Любое действие сбрасывает таймер автоблокировки на 15:00
            ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"].forEach(evt => {
                window.addEventListener(evt, resetIdleTimer, { passive: true });
            });

            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "visible" && sessionToken.value) {
                    if (Date.now() - lastActivityTime >= IDLE_TIMEOUT_MS) {
                        handleLogout(true);
                    } else if (sessionToken.value !== "OFFLINE_MODE") {
                        loadVault();
                    }
                }
            });

            window.addEventListener("keydown", (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                    e.preventDefault();
                    searchInputRef.value?.focus();
                }
                if (e.key === "Escape") {
                    showItemModal.value = false;
                    showGenModal.value = false;
                    showImportModal.value = false;
                    showSecurityModal.value = false;
                    closeTotpModal();
                    showAdminModal.value = false;
                    showExtensionModal.value = false;
                    showPwaModal.value = false;
                    showLogsModal.value = false;
                    multiSelectMode.value = false;
                    mobileNavOpen.value = false;
                }
            });

            setInterval(async () => {
                if (sessionToken.value) {
                    const left = Math.ceil((IDLE_TIMEOUT_MS - (Date.now() - lastActivityTime)) / 1000);
                    idleSecondsLeft.value = Math.max(0, left);
                    if (left <= 0) {
                        handleLogout(true);
                        return;
                    }
                }
                if (Array.isArray(vaultItems.value)) {
                    for (const it of vaultItems.value) {
                        if (it.decrypted?.totpSecret) {
                            const { code, secondsLeft } = await generateTOTP(it.decrypted.totpSecret);
                            it.totpCode = code;
                            it.totpSecondsLeft = secondsLeft;
                        }
                    }
                }
            }, 1000);

            checkStatus();
        });

        return {
            t, tp, lang, setLang, displayUsername,
            loading, hasUsers, setupTokenRequired, theme, setTheme, getEntryColorHex, decodePunycodeText, currentTitle, rightPaneTitle, logText,
            isAndroidAppUrl, extractAndroidPkg, getWorkingWebUrl, getGooglePlayUrl, generateWifiQrSvg, activeCardData,
            activeSubCardIdx, subCardsViewAll, isMultiCard, showSingleView, deleteSelectedInGroup,
            formatCardNumber, detectCardBrand, cardExtra,
            shownPwds, toggleShownPwd, pwnedKey, pwnedInfo, checkPwned,
            idleSecondsLeft, idleLabel,
            showExtensionModal, showPwaModal, canInstallPwa, installPwaNow, showLogsModal, systemLogs, openLogsModal, clearSystemLogs, currentOrigin, triggerPwaInstall, downloadBrowserExtensionZip,
            allFolders, currentFolder, countByFolder, createNewCustomFolder, getItemFolderId, getItemFolderName, quickAssignFolder, autoSortItemsIntoFolders,
            multiSelectMode, manualSelectedIds, toggleMultiSelectMode, toggleManualSelectId, startMergeFromCurrentItem, mergeManualSelectedAsMultiCard, mergeManualSelectedIntoOne,
            dupGroupByMode, mobileNavOpen,
            navSections, toggleNavSection, resetAllFilters, openFullPageMode, openHomeOverview, openWatchtowerDashboard, onSearchInput,
            ignoredDupKeys, ignoreDuplicateGroup, resetIgnoredDuplicates,
            combineIntoMultiCard, unmergeMultiCard,
            sessionToken, currentUsername, isAdmin, searchInputRef,
            authMode, showLoginPwd, showModalPwd, loginForm, regForm, recForm, handleLogin, handleRegister, handleRecoveryReset, handleLogout,
            showSecurityModal, showTotpModal, openTotpModal, closeTotpModal, siteIconsEnabled, pwdChangeForm, openSecuritySettingsModal, handleChangeOwnPassword,
            totpStepActive, totpUseBackup, totpLoginCode, handleTotpLogin, cancelTotpLogin, toggleTotpBackup,
            totpStatus, totpSetup, totpForm, totpBackupCodes, startTotpSetup, cancelTotpSetup, confirmTotpEnable, disableTotp,
            copyBackupCodes, downloadBackupCodes,
            currentView, currentCategory, rightPaneMode, searchQuery, sortBy,
            vaultItems, activeItems, trashedItems, itemsWithTotp, countApps, filteredItems,
            duplicateGroups, openDuplicatesView, mergeSingleGroup,
            selectedItem, selectItemCard, setFilter, loadVault, showToast,
            countByScope, countFavorites, countByCategory,
            weakCount, reusedCount, securityScore, securityBreakdown,
            getFaviconUrl, checkFaviconQuality, formatDomain, formatTimestamp, getInitials, formatTotp,
            showItemModal, editingItem, itemForm, openItemModal, saveItem, toggleFavorite,
            moveToTrash, restoreFromTrash, deletePermanently, emptyTrashAll,
            showGenModal, genLength, generatedPasswordString, genOpts, genOptionList, toggleGenOpt, genStrength,
            openPasswordGenerator, generatePasswordPreview, generatePasswordIntoForm,
            showImportModal, importTargetScope, parsedCsvItems, importTab, jsonPreview, jsonError, jsonForcePersonal, jsonBusy, jsonResult, jsonFamilyMissing, handleJsonFileSelect, executeJsonImport, openImportModal, handleCsvFileSelect, executeCsvImport,
            exportVaultJSON, showRecoveryModal, userRecoveryKeyPlain, downloadRecoverySheet,
            showAdminModal, familyMembers, lastCreatedInvite, openAdminModal, createInviteCode, adminResetMemberPassword,
            copyText, toasts
        };
    }
}).mount('#app');

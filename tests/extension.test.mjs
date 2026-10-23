import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const src = fs.readFileSync(new URL("static/app.js", root), "utf8");

// Файлы расширения собираются шаблонными строками в downloadBrowserExtensionZip: вычисляем их так же
function build(name) {
    const m = src.match(new RegExp("const " + name + " = (`[^\\n]*`);"));
    assert.ok(m, name);
    return new Function("srvOrigin", "popupText", "return " + m[1])("https://vault.test", {
        mismatch: "M {site} {saved}", noUrl: "N {site}", fillAnyway: "Y", cancel: "C", noTab: "T"
    });
}

// Объекты из vm-контекста — с чужими прототипами: сравниваем их как JSON
const plain = (x) => JSON.parse(JSON.stringify(x));

function el() {
    return { value: "", textContent: "", style: {}, classList: { add() {}, remove() {} }, querySelectorAll: () => [] };
}

function loadPopup(tabUrl) {
    const sent = [];
    const els = {};
    const sandbox = {
        document: { getElementById: (id) => (els[id] ||= el()), addEventListener() {}, createElement: el },
        chrome: { tabs: {
            query: (_q, cb) => cb(tabUrl === null ? [] : [{ id: 7, url: tabUrl }]),
            sendMessage: (id, m) => sent.push([id, m]),
        } },
        setTimeout() {}, URL, TextEncoder, TextDecoder,
    };
    const api = vm.runInNewContext(build("popupJs") + ";({hostOf,hostMatches,fill})", sandbox);
    return { ...api, sent, els };
}

test("файлы расширения — корректный JS, версия поднята", () => {
    new vm.Script(build("popupJs"));
    new vm.Script(build("contentJs"));
    assert.match(src, /version: "1\.2\.0"/);
});

test("hostOf и hostMatches: хост или его поддомен", () => {
    const { hostOf, hostMatches } = loadPopup("https://x.test/");
    assert.equal(hostOf("https://www.Example.com/login"), "example.com");
    assert.equal(hostOf("example.com/path"), "example.com");
    assert.equal(hostOf(""), "");
    assert.equal(hostOf("http://[bad"), "");
    assert.ok(hostMatches("example.com", "example.com"));
    assert.ok(hostMatches("login.example.com", "example.com"));
    assert.ok(!hostMatches("example.com.evil.test", "example.com"));
    assert.ok(!hostMatches("badexample.com", "example.com"));
    assert.ok(!hostMatches("example.com", "login.example.com"));
    // запись с «адресом» без точки не совпадает ни с чем
    assert.ok(!hostMatches("anything.com", "com"));
});

test("заполнение: при совпадении — сразу, иначе — только после подтверждения", () => {
    const item = { username: "u", password: "p", url: "https://example.com" };

    let p = loadPopup("https://login.example.com/form");
    p.fill(item);
    assert.equal(p.sent.length, 1);
    assert.deepEqual(plain(p.sent[0][1]), { action: "AEGIS_AUTOFILL", host: "login.example.com", username: "u", password: "p" });

    p = loadPopup("https://example.com.evil.test/");
    p.fill(item);
    assert.equal(p.sent.length, 0, "без подтверждения не отправляется");
    assert.equal(p.els.confirmText.textContent, "M example.com.evil.test example.com");
    p.els.btnConfirmNo.onclick();
    assert.equal(p.sent.length, 0);
    p.fill(item);
    p.els.btnConfirmYes.onclick();
    assert.equal(p.sent.length, 1);

    p = loadPopup("https://example.com/");
    p.fill({ ...item, url: "" });
    assert.equal(p.sent.length, 0);
    assert.equal(p.els.confirmText.textContent, "N example.com");

    p = loadPopup("chrome://extensions/");
    p.fill(item);
    assert.equal(p.sent.length, 0);
});

test("контент-скрипт не заполняет, если страница ушла на другой хост", () => {
    const run = (hostname, msg) => {
        let listener;
        const input = { offsetParent: {}, focus() {}, dispatchEvent() {}, closest: () => null, value: "" };
        const sandbox = {
            location: { hostname },
            window: { HTMLInputElement: { prototype: {} } },
            Event: class {}, Object, Array,
            document: { querySelectorAll: (q) => (q.includes("password") ? [input] : []), body: { querySelectorAll: () => [] } },
            chrome: { runtime: { onMessage: { addListener: (f) => (listener = f) } } },
        };
        vm.runInNewContext(build("contentJs"), sandbox);
        let resp;
        listener({ action: "AEGIS_AUTOFILL", username: "u", password: "p", ...msg }, null, (r) => (resp = r));
        return plain({ resp, value: input.value });
    };
    assert.deepEqual(run("example.com", { host: "example.com" }), { resp: { status: "ok" }, value: "p" });
    assert.deepEqual(run("evil.test", { host: "example.com" }), { resp: { status: "host_changed" }, value: "" });
    assert.equal(run("example.com", {}).value, "");
});

// Полный popup: обработчики из DOMContentLoaded, классы элементов и подменённый fetch
function loadPopupWithServer(reply) {
    const calls = [];
    const els = {};
    let onReady;
    const mk = () => {
        const classes = new Set();
        return {
            value: "", textContent: "", innerHTML: "", style: {}, classes,
            classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c) },
            querySelectorAll: () => [], appendChild() {}, focus() {},
        };
    };
    const sandbox = {
        document: {
            getElementById: (id) => (els[id] ||= mk()),
            addEventListener: (ev, f) => { if (ev === "DOMContentLoaded") onReady = f; },
            createElement: mk,
        },
        chrome: { tabs: { query() {}, sendMessage() {} } },
        fetch: async (url, opts = {}) => {
            calls.push({ url, headers: opts.headers || {}, body: opts.body ? JSON.parse(opts.body) : null });
            const [status, body] = await reply(url, calls);
            return { ok: status === 200, status, json: async () => body };
        },
        crypto: globalThis.crypto, setTimeout() {}, URL, TextEncoder, TextDecoder, Uint8Array, JSON,
    };
    const api = vm.runInNewContext(build("popupJs") + ";({derive,bytesToHex})", sandbox);
    // начальное состояние как в popup.html: сейф и поле кода скрыты
    for (const id of ["serverUrl", "username", "password", "statusBox", "totpCode"]) sandbox.document.getElementById(id);
    for (const id of ["totpBox", "vaultView"]) sandbox.document.getElementById(id).classes.add("hidden");
    onReady();
    els.serverUrl.value = "https://vault.test";
    els.username.value = "anna";
    els.password.value = "pw";
    return { api, els, calls };
}

// Сейф, зашифрованный ключом, который popup выведет из пароля «pw»: так проверяется весь путь до /api/vault
async function sealedVaultKey(api, saltHex) {
    const { encKey } = await api.derive("pw", Uint8Array.from(saltHex.match(/../g).map((h) => parseInt(h, 16))));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plain = new TextEncoder().encode(JSON.stringify({ rawKey: "ab".repeat(32) }));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, encKey, plain));
    const hex = (b) => Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
    return JSON.stringify({ ciphertext: hex(ct), iv: hex(iv) });
}

test("второй шаг входа: код уходит вместе с challenge, сейф открывается только после верного кода", async () => {
    const salt = "11".repeat(16);
    let vaultKey = null;
    let totpAnswers = [];
    const p = loadPopupWithServer(async (url) => {
        if (url.endsWith("/api/auth/params/anna")) return [200, { kdf_salt: salt }];
        if (url.endsWith("/api/auth/login")) return [200, { totp_required: true, challenge: "ch-1" }];
        if (url.endsWith("/api/auth/login/totp")) return totpAnswers.shift();
        if (url.endsWith("/api/vault")) return [200, { items: [] }];
        throw new Error("неожиданный запрос " + url);
    });
    vaultKey = await sealedVaultKey(p.api, salt);
    const urls = () => p.calls.map((c) => c.url.replace("https://vault.test", ""));

    await p.els.btnUnlock.onclick();
    assert.deepEqual(urls(), ["/api/auth/params/anna", "/api/auth/login"]);
    assert.ok(!p.els.totpBox.classes.has("hidden"), "поле кода показано");
    assert.equal(p.els.password.value, "", "пароль из поля стёрт");

    // неверный код: сейф закрыт, поле кода остаётся
    totpAnswers = [[401, { detail: "bad_totp" }]];
    p.els.totpCode.value = " 123456 ";
    await p.els.btnTotp.onclick();
    assert.deepEqual(plain(p.calls.at(-1).body), { challenge: "ch-1", code: "123456" });
    assert.equal(p.els.statusBox.textContent, "Неверный код");
    assert.ok(!urls().includes("/api/vault"));

    totpAnswers = [[200, { token: "T", encrypted_vault_key: vaultKey }]];
    p.els.totpCode.value = "654321";
    await p.els.btnTotp.onclick();
    const v = p.calls.at(-1);
    assert.equal(v.url, "https://vault.test/api/vault");
    assert.equal(v.headers.Authorization, "Bearer T");
    assert.ok(p.els.totpBox.classes.has("hidden") && !p.els.vaultView.classes.has("hidden"));
});

test("второй шаг входа: истёкший challenge возвращает к паролю, вход без TOTP не изменился", async () => {
    const salt = "22".repeat(16);
    let vaultKey = null;
    const p = loadPopupWithServer(async (url) => {
        if (url.endsWith("/api/auth/params/anna")) return [200, { kdf_salt: salt }];
        if (url.endsWith("/api/auth/login")) return [200, { totp_required: true, challenge: "ch-2" }];
        if (url.endsWith("/api/auth/login/totp")) return [401, { detail: "totp_challenge_expired" }];
        throw new Error("неожиданный запрос " + url);
    });
    await p.els.btnUnlock.onclick();
    p.els.totpCode.value = "111111";
    await p.els.btnTotp.onclick();
    assert.ok(p.els.totpBox.classes.has("hidden"));
    assert.match(p.els.statusBox.textContent, /войдите заново/);
    const n = p.calls.length;
    await p.els.btnTotp.onclick();
    assert.equal(p.calls.length, n, "без нового пароля код не отправляется");

    // пользователь без TOTP: сразу сессия, как раньше
    const q = loadPopupWithServer(async (url) => {
        if (url.endsWith("/api/auth/params/anna")) return [200, { kdf_salt: salt }];
        if (url.endsWith("/api/auth/login")) return [200, { token: "T2", encrypted_vault_key: vaultKey }];
        if (url.endsWith("/api/vault")) return [200, { items: [] }];
        throw new Error("неожиданный запрос " + url);
    });
    vaultKey = await sealedVaultKey(q.api, salt);
    await q.els.btnUnlock.onclick();
    assert.equal(q.calls.at(-1).headers.Authorization, "Bearer T2");
    assert.ok(q.els.totpBox.classes.has("hidden") && !q.els.vaultView.classes.has("hidden"));
    assert.ok(!q.calls.some((c) => c.url.endsWith("/login/totp")));
});

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
const ext = createRequire(import.meta.url)("../static/extension-build.js");

function loadDicts() {
    const sandbox = { window: {} };
    for (const l of ["ru", "en"]) vm.runInNewContext(read(`static/i18n/${l}.js`), sandbox);
    return sandbox.window.FRAVASHI_I18N;
}
const dicts = loadDicts();
const ORIGIN = "https://vault.test";
const ICON_FILES = { "favicon-32.png": new Uint8Array([1, 2, 3]), "icon-192.png": new Uint8Array([4, 5, 6]) };
const build = (lang = "ru", origin = ORIGIN) => ext.buildExtensionFiles({ origin, lang, dicts, icons: ICON_FILES });

// Объекты из vm-контекста — с чужими прототипами: сравниваем их как JSON
const plain = (x) => JSON.parse(JSON.stringify(x));

// Окно расширения: элементы по id, вкладка, executeScript и fetch подменены
function loadPopup({ tabUrl = "https://x.test/", lang = "ru", reply = async () => [404, {}], inject, navigatorLang } = {}) {
    const calls = [];
    const injected = [];
    const els = {};
    let onReady;
    const mk = () => {
        const classes = new Set();
        return {
            value: "", textContent: "", innerHTML: "", checked: false, style: {}, classes,
            classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c) },
            querySelectorAll: () => [], appendChild() {}, focus() {},
        };
    };
    const sandbox = {
        document: {
            getElementById: (id) => (els[id] ||= mk()),
            addEventListener: (ev, f) => { if (ev === "DOMContentLoaded") onReady = f; },
            createElement: mk,
            querySelectorAll: () => [],
        },
        chrome: {
            tabs: { query: async () => (tabUrl === null ? [] : [{ id: 7, url: tabUrl }]) },
            scripting: { executeScript: async (o) => { injected.push(o); return [{ result: inject ? inject(o) : { status: "ok" } }]; } },
        },
        fetch: async (url, opts = {}) => {
            calls.push({ url, headers: opts.headers || {}, body: opts.body ? JSON.parse(opts.body) : null });
            const [status, body] = await reply(url, calls);
            return { ok: status === 200, status, json: async () => body };
        },
        crypto: globalThis.crypto, setTimeout() {}, URL, TextEncoder, TextDecoder, Uint8Array, JSON,
    };
    if (navigatorLang) sandbox.navigator = { language: navigatorLang };
    const api = vm.runInNewContext(build(lang)["popup.js"] + ";({hostOf,hostMatches,fill,askCard,toItem,derive,tr,LANG})", sandbox);
    // начальное состояние как в popup.html: сейф, поле кода и диалоги скрыты
    for (const id of ["username", "password", "statusBox", "totpCode"]) sandbox.document.getElementById(id);
    for (const id of ["totpBox", "vaultView", "confirmBox", "cardBox"]) sandbox.document.getElementById(id).classes.add("hidden");
    onReady();
    return { api, els, calls, injected };
}

// Выполнение функции во «вкладке» так же, как это делает Chrome: только текст функции и аргументы
function runInPage(call, page) {
    return plain(vm.runInNewContext("(" + call.func.toString() + ").apply(null, " + JSON.stringify(call.args) + ")", page));
}
function input(props) {
    const attrs = props.attrs || {};
    return {
        type: "text", name: "", id: "", placeholder: "", maxLength: -1, offsetParent: {}, disabled: false, readOnly: false,
        value: "", focus() {}, dispatchEvent() {}, closest: () => null, getAttribute: (n) => (n in attrs ? attrs[n] : null), ...props,
    };
}
function page(hostname, inputs) {
    return {
        location: { hostname }, window: { HTMLInputElement: { prototype: {} } }, Event: class {}, Object, Array,
        document: {
            querySelectorAll: (q) => (q === "input" ? inputs : q.includes("password") ? inputs.filter((i) => i.type === "password") : []),
            body: { querySelectorAll: () => inputs.filter((i) => i.type === "text") },
        },
    };
}

test("манифест: версия 1.3.1, иконки, только activeTab и scripting, сеть — только сервер, без content_scripts", () => {
    const files = build("ru");
    const m = JSON.parse(files["manifest.json"]);
    assert.equal(m.manifest_version, 3);
    assert.equal(m.version, "1.3.1");
    assert.equal(ext.EXT_VERSION, "1.3.1");
    assert.deepEqual(m.permissions, ["activeTab", "scripting"]);
    assert.deepEqual(m.host_permissions, ["https://vault.test/*"]);
    for (const k of ["content_scripts", "optional_permissions", "optional_host_permissions", "background", "web_accessible_resources", "externally_connectable"]) {
        assert.ok(!(k in m), `лишний ключ ${k}`);
    }
    assert.deepEqual(Object.keys(files).sort(), ["_locales/en/messages.json", "_locales/ru/messages.json", "icons/favicon-32.png", "icons/icon-192.png", "manifest.json", "popup.html", "popup.js"]);
    const ICONS = { 16: "icons/favicon-32.png", 32: "icons/favicon-32.png", 48: "icons/icon-192.png", 128: "icons/icon-192.png" };
    assert.deepEqual(m.icons, ICONS);
    assert.deepEqual(m.action.default_icon, ICONS);
    for (const p of new Set(Object.values(ICONS))) assert.ok(p in files, p);
    const all = Object.values(files).join("\n");
    for (const bad of ["<all_urls>", "*://*/*", "http://*/*", "https://*/*", "sendMessage", "onMessage"]) assert.ok(!all.includes(bad), bad);
    assert.equal(m.default_locale, "ru");
    assert.equal(JSON.parse(build("en")["manifest.json"]).default_locale, "en");
    assert.equal(JSON.parse(files["_locales/en/messages.json"]).extName.message, dicts.en["extension.popup.extName"]);
    // адрес с портом: шаблон без порта (в Chrome он совпадает с любым портом этого хоста)
    assert.equal(ext.hostPattern("http://localhost:8585"), "http://localhost/*");
    // файлы расширения — корректный JS
    new vm.Script(files["popup.js"]);
});

test("i18n: наборы ключей окна расширения ru и en совпадают, все используемые ключи есть", () => {
    const keys = (d) => Object.keys(d).filter((k) => k.startsWith(ext.DICT_PREFIX)).sort();
    assert.deepEqual(keys(dicts.ru), keys(dicts.en));
    const files = build("ru");
    const used = new Set([
        ...[...files["popup.js"].matchAll(/\btr\("([A-Za-z0-9]+)"/g)].map((m) => m[1]),
        ...[...files["popup.js"].matchAll(/\btr\([^)]*\? "([A-Za-z0-9]+)" : "([A-Za-z0-9]+)"/g)].flatMap((m) => [m[1], m[2]]),
        ...[...files["popup.html"].matchAll(/data-i18n(?:-ph)?="([A-Za-z0-9]+)"/g)].map((m) => m[1]),
        "extName", "extDesc", "cardFilledNoCvv", "hostChanged", "injectFailed", "noLoginFields", "cardNotFound", "filled", "cardFilled",
    ]);
    assert.ok(used.size > 30, `ключей: ${used.size}`);
    for (const k of used) for (const l of ["ru", "en"]) assert.ok(dicts[l][ext.DICT_PREFIX + k], `${l}: ${k}`);
    // в разметке окна нет текста на конкретном языке
    assert.ok(!/[Ѐ-ӿ]/.test(files["popup.html"]));
    assert.equal(dicts.ru["extension.popup.cardNotFound"], "Поля карты не найдены на этой странице или находятся во вложенной платёжной форме");
});

test("язык окна: язык приложения при скачивании, иначе — язык браузера", () => {
    assert.equal(loadPopup({ lang: "en" }).api.LANG, "en");
    assert.equal(loadPopup({ lang: "en" }).api.tr("unlock"), "Unlock vault");
    assert.equal(loadPopup({ lang: "ru" }).api.tr("unlock"), "Разблокировать сейф");
    assert.equal(loadPopup({ lang: "de", navigatorLang: "ru-RU" }).api.LANG, "ru");
    assert.equal(loadPopup({ lang: "de", navigatorLang: "fr-FR" }).api.LANG, "en");
    assert.equal(loadPopup({ lang: "de" }).api.LANG, "en");
});

test("hostOf и hostMatches: хост или его поддомен", () => {
    const { hostOf, hostMatches } = loadPopup().api;
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

test("заполнение логина: при совпадении — сразу через executeScript, иначе — только после подтверждения", async () => {
    const item = { username: "u", password: "p", url: "https://example.com" };

    let p = loadPopup({ tabUrl: "https://login.example.com/form" });
    await p.api.fill(item);
    assert.equal(p.injected.length, 1);
    assert.equal(p.injected[0].func.name, "fillLoginInPage");
    assert.deepEqual(plain(p.injected[0].target), { tabId: 7 });
    assert.deepEqual(plain(p.injected[0].args), ["login.example.com", "u", "p"]);
    assert.equal(p.els.statusBox.textContent, dicts.ru["extension.popup.filled"]);

    p = loadPopup({ tabUrl: "https://example.com.evil.test/", lang: "en" });
    await p.api.fill(item);
    assert.equal(p.injected.length, 0, "без подтверждения не заполняется");
    assert.ok(!p.els.confirmBox.classes.has("hidden"));
    assert.equal(p.els.confirmText.textContent, dicts.en["extension.popup.mismatch"].replace("{site}", "example.com.evil.test").replace("{saved}", "example.com"));
    p.els.btnConfirmNo.onclick();
    assert.equal(p.injected.length, 0);
    await p.api.fill(item);
    await p.els.btnConfirmYes.onclick();
    assert.equal(p.injected.length, 1);

    p = loadPopup({ tabUrl: "https://example.com/" });
    await p.api.fill({ ...item, url: "" });
    assert.equal(p.injected.length, 0);
    assert.equal(p.els.confirmText.textContent, dicts.ru["extension.popup.noUrl"].replace("{site}", "example.com"));

    p = loadPopup({ tabUrl: "chrome://extensions/" });
    await p.api.fill(item);
    assert.equal(p.injected.length, 0);
    assert.equal(p.els.statusBox.textContent, dicts.ru["extension.popup.noTab"]);

    // вкладка недоступна (нет activeTab) — понятное сообщение, а не исключение
    p = loadPopup({ tabUrl: "https://example.com/", inject: () => { throw new Error("Cannot access contents of the page"); } });
    await p.api.fill(item);
    assert.equal(p.els.statusBox.textContent, dicts.ru["extension.popup.injectFailed"]);
});

test("заполнение логина во вкладке: не заполняет, если страница ушла на другой хост", async () => {
    const p = loadPopup({ tabUrl: "https://example.com/" });
    await p.api.fill({ username: "u", password: "p", url: "example.com" });
    const call = p.injected[0];
    const run = (hostname) => {
        const pw = input({ type: "password" }), user = input({ type: "text" });
        return { r: runInPage(call, page(hostname, [user, pw])), pw: pw.value, user: user.value };
    };
    assert.deepEqual(run("example.com"), { r: { status: "ok" }, pw: "p", user: "u" });
    assert.deepEqual(run("evil.test"), { r: { status: "host_changed" }, pw: "", user: "" });
    assert.deepEqual(runInPage(call, page("example.com", [])), { status: "no_fields" });
});

test("classifyField: autocomplete, затем name/id/placeholder/aria-label на en и ru", () => {
    const c = (a) => ext.classifyField(a);
    assert.equal(c({ autocomplete: "cc-number" }), "number");
    assert.equal(c({ autocomplete: "section-pay billing cc-exp" }), "exp");
    assert.equal(c({ autocomplete: "cc-exp-month" }), "expMonth");
    assert.equal(c({ autocomplete: "cc-exp-year" }), "expYear");
    assert.equal(c({ autocomplete: "cc-name" }), "name");
    assert.equal(c({ autocomplete: "cc-csc", type: "password" }), "csc");
    assert.equal(c({ name: "cardNumber" }), "number");
    assert.equal(c({ placeholder: "1234 5678 9012 3456", type: "tel" }), "number");
    assert.equal(c({ ariaLabel: "Номер карты" }), "number");
    assert.equal(c({ placeholder: "MM / YY" }), "exp");
    assert.equal(c({ placeholder: "ММ/ГГ" }), "exp");
    assert.equal(c({ id: "expiry-date" }), "exp");
    assert.equal(c({ placeholder: "Срок действия" }), "exp");
    assert.equal(c({ id: "cc-exp-month" }), "expMonth");
    assert.equal(c({ name: "expYear" }), "expYear");
    assert.equal(c({ placeholder: "Месяц" }), "expMonth");
    assert.equal(c({ placeholder: "Год" }), "expYear");
    assert.equal(c({ name: "cardholder" }), "name");
    assert.equal(c({ placeholder: "Имя владельца карты" }), "name");
    assert.equal(c({ name: "cvv" }), "csc");
    assert.equal(c({ ariaLabel: "Security code" }), "csc");
    assert.equal(c({ placeholder: "Код безопасности" }), "csc");
    // не поля карты
    assert.equal(c({ name: "email" }), "");
    assert.equal(c({ name: "city", placeholder: "Город" }), "");
    assert.equal(c({ name: "comment" }), "");
    assert.equal(c({}), "");
    assert.equal(c({ type: "hidden", autocomplete: "cc-number" }), "");
    assert.equal(c({ type: "checkbox", name: "cvv" }), "");
    assert.equal(c({ type: "email", name: "cardNumber" }), "");
    assert.equal(c({ autocomplete: "current-password", name: "card_code" }), "");
});

test("parseExpiry: MM/YY и MM/YYYY", () => {
    const p = (s) => plain(ext.parseExpiry(s));
    assert.deepEqual(p("07/27"), { month: "07", year: "2027" });
    assert.deepEqual(p("7/2027"), { month: "07", year: "2027" });
    assert.deepEqual(p(" 12 / 30 "), { month: "12", year: "2030" });
    assert.deepEqual(p("01-28"), { month: "01", year: "2028" });
    assert.deepEqual(p("03.2029"), { month: "03", year: "2029" });
    for (const bad of ["", null, "13/27", "00/27", "07/7", "07/202", "0727", "abc", "07/27/1"]) assert.equal(ext.parseExpiry(bad), null, String(bad));
});

test("expiryValue: формат по placeholder и maxlength", () => {
    const e = { month: "07", year: "2027" };
    const v = (k, a) => ext.expiryValue(k, e, a);
    assert.equal(v("exp", {}), "07/27");
    assert.equal(v("exp", { placeholder: "MM/YYYY" }), "07/2027");
    assert.equal(v("exp", { placeholder: "ММ/ГГГГ" }), "07/2027");
    assert.equal(v("exp", { placeholder: "MM / YY", maxLength: 7 }), "07/27");
    assert.equal(v("exp", { maxLength: 4 }), "0727");
    assert.equal(v("expMonth", {}), "07");
    assert.equal(v("expYear", {}), "2027");
    assert.equal(v("expYear", { placeholder: "YY" }), "27");
    assert.equal(v("expYear", { placeholder: "ГГ" }), "27");
    assert.equal(v("expYear", { maxLength: 2 }), "27");
    assert.equal(v("expYear", { placeholder: "YYYY", maxLength: 4 }), "2027");
});

test("toItem: номер, CVV, срок и владелец карты — из полей записи и доп. полей", () => {
    const { toItem } = loadPopup().api;
    assert.deepEqual(plain(toItem({
        itemType: "card", title: "Моя карта", username: "2200 1234 5678 9012", password: "123",
        customFields: [{ label: "Срок", value: "07/27" }, { label: "Владелец", value: "ANNA I" }]
    })), { kind: "card", title: "Моя карта", number: "2200123456789012", cvc: "123", holder: "ANNA I", expiry: "07/27" });
    assert.equal(toItem({ itemType: "login", username: "u", password: "p" }).kind, "login");
    // совпадение с регулярками приложения
    assert.deepEqual(plain(ext.cardExtra({ customFields: [{ label: "Expiry date", value: "1/30" }, { label: "Card holder", value: "X" }] })), { expiry: "1/30", holder: "X" });
});

const CARD = { kind: "card", title: "Visa", number: "4111111111111111", cvc: "321", holder: "ANNA I", expiry: "07/27" };

test("карта: заполнение только после подтверждения, CVV — только с галочкой", async () => {
    let p = loadPopup({ tabUrl: "https://shop.test/checkout" });
    await p.api.askCard(CARD);
    assert.equal(p.injected.length, 0, "до подтверждения ничего не заполняется");
    assert.ok(!p.els.cardBox.classes.has("hidden"));
    assert.equal(p.els.cardText.textContent, "Заполнить карту «Visa» (•••• 1111) на странице shop.test?");
    assert.equal(p.els.cardCvv.checked, false, "галочка CVV по умолчанию выключена");
    p.els.btnCardNo.onclick();
    assert.ok(p.els.cardBox.classes.has("hidden"));
    assert.equal(p.injected.length, 0);

    await p.api.askCard(CARD);
    await p.els.btnCardYes.onclick();
    assert.equal(p.injected.length, 1);
    assert.equal(p.injected[0].func.name, "fillCardInPage");
    assert.deepEqual(plain(p.injected[0].args), ["shop.test", { number: "4111111111111111", holder: "ANNA I", exp: { month: "07", year: "2027" }, cvc: "" }]);

    await p.api.askCard(CARD);
    p.els.cardCvv.checked = true;
    await p.els.btnCardYes.onclick();
    assert.equal(plain(p.injected[1].args)[1].cvc, "321");
    assert.equal(p.els.cardCvv.checked, false, "галочка сбрасывается после заполнения");

    // служебная страница и запись без номера — без диалога
    p = loadPopup({ tabUrl: "chrome://newtab/" });
    await p.api.askCard(CARD);
    assert.ok(p.els.cardBox.classes.has("hidden"));
    p = loadPopup({ tabUrl: "https://shop.test/" });
    await p.api.askCard({ ...CARD, number: "" });
    assert.ok(p.els.cardBox.classes.has("hidden"));
    assert.equal(p.els.statusBox.textContent, dicts.ru["extension.popup.cardNoNumber"]);

    // поля не найдены — сообщение про вложенную платёжную форму
    p = loadPopup({ tabUrl: "https://shop.test/", inject: () => ({ status: "no_fields" }) });
    await p.api.askCard(CARD);
    await p.els.btnCardYes.onclick();
    assert.equal(p.els.statusBox.textContent, dicts.ru["extension.popup.cardNotFound"]);
});

test("cardExtra: владелец — только подпись владельца, название и «Card name» не подходят", () => {
    const h = (cf) => ext.cardExtra({ title: "Test card", customFields: cf }).holder;
    assert.equal(h([{ label: "Card name", value: "Test card" }]), "");
    assert.equal(h([{ label: "Название", value: "Test card" }]), "");
    assert.equal(h([]), "");
    assert.equal(h([{ label: "Владелец", value: "ANNA I" }]), "ANNA I");
    assert.equal(h([{ label: "Name", value: "ANNA I" }]), "ANNA I");
    assert.equal(h([{ label: "Holder", value: " " }, { label: "Cardholder", value: "ANNA I" }]), "ANNA I");
});

test("карта во вкладке: в cc-name и по имени поля идёт владелец, без владельца поле не трогаем", async () => {
    const run = async (card, fields) => {
        const p = loadPopup({ tabUrl: "https://shop.test/" });
        await p.api.askCard(card);
        await p.els.btnCardYes.onclick();
        return runInPage(p.injected[0], page("shop.test", fields));
    };
    const num = () => input({ attrs: { autocomplete: "cc-number" } });
    let name = input({ attrs: { autocomplete: "cc-name" } });
    await run({ ...CARD, title: "Test card" }, [num(), name]);
    assert.equal(name.value, "ANNA I");
    name = input({ name: "cardholder" });
    await run({ ...CARD, title: "Test card" }, [num(), name]);
    assert.equal(name.value, "ANNA I");
    name = input({ attrs: { autocomplete: "cc-name" } });
    await run({ ...CARD, title: "Test card", holder: "" }, [num(), name]);
    assert.equal(name.value, "", "без владельца поле не заполняется, название записи не подставляется");
});

test("карта во вкладке: поиск видимых полей, срок, CVV, смена хоста", async () => {
    const p = loadPopup({ tabUrl: "https://shop.test/" });
    await p.api.askCard(CARD);
    p.els.cardCvv.checked = true;
    await p.els.btnCardYes.onclick();
    const call = p.injected[0];

    // разметка с autocomplete
    let f = {
        num: input({ type: "tel", attrs: { autocomplete: "cc-number" } }),
        exp: input({ attrs: { autocomplete: "cc-exp" }, placeholder: "MM / YY" }),
        name: input({ attrs: { autocomplete: "cc-name" } }),
        csc: input({ type: "password", attrs: { autocomplete: "cc-csc" } }),
        hiddenNum: input({ attrs: { autocomplete: "cc-number" }, offsetParent: null }),
        email: input({ type: "email", name: "email" }),
    };
    let r = runInPage(call, page("shop.test", [f.hiddenNum, f.email, f.num, f.exp, f.name, f.csc]));
    assert.deepEqual(r, { status: "ok", expiry: true, cvcMissing: false });
    assert.deepEqual([f.num, f.exp, f.name, f.csc, f.hiddenNum, f.email].map((x) => x.value), ["4111111111111111", "07/27", "ANNA I", "321", "", ""]);

    // русские подписи, месяц и год отдельно, без поля CVV
    f = {
        num: input({ placeholder: "Номер карты" }),
        mm: input({ placeholder: "ММ" }),
        yy: input({ placeholder: "ГГ" }),
    };
    r = runInPage(call, page("shop.test", [f.num, f.mm, f.yy]));
    assert.deepEqual(r, { status: "ok", expiry: true, cvcMissing: true });
    assert.deepEqual([f.num.value, f.mm.value, f.yy.value], ["4111111111111111", "07", "27"]);

    // нет полей (форма во iframe) и смена хоста
    assert.deepEqual(runInPage(call, page("shop.test", [input({ name: "email", type: "email" })])), { status: "no_fields" });
    const n = input({ attrs: { autocomplete: "cc-number" } });
    assert.deepEqual(runInPage(call, page("evil.test", [n])), { status: "host_changed" });
    assert.equal(n.value, "");
});

// Сейф, зашифрованный ключом, который popup выведет из пароля «pw»: так проверяется весь путь до /api/vault
async function sealedVaultKey(api, saltHex) {
    const { encKey } = await api.derive("pw", Uint8Array.from(saltHex.match(/../g).map((h) => parseInt(h, 16))));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plain = new TextEncoder().encode(JSON.stringify({ rawKey: "ab".repeat(32) }));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, encKey, plain));
    const hex = (b) => Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
    return JSON.stringify({ ciphertext: hex(ct), iv: hex(iv) });
}
function loadPopupWithServer(reply) {
    const p = loadPopup({ reply });
    p.els.username.value = "anna";
    p.els.password.value = "pw";
    return p;
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
    assert.equal(p.els.serverUrl.value, "https://vault.test");

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

test("splitCardFields/joinCardFields: старые записи читаются и собираются обратно без потерь", () => {
    const cf = [
        { label: "Банк", value: "Тест" }, { label: "Expiry date", value: "07/27" }, { label: "Card holder", value: "ANNA I" },
        { label: "ПИН", value: "1234" }, { label: "Card name", value: "Test card" }
    ];
    const s = plain(ext.splitCardFields(cf));
    assert.deepEqual([s.expiry, s.holder, s.pin], ["07/27", "ANNA I", "1234"]);
    assert.deepEqual(s.rest, [{ label: "Банк", value: "Тест" }, { label: "Card name", value: "Test card" }]);
    // совпадает с cardExtra (его же использует расширение)
    assert.deepEqual({ expiry: s.expiry, holder: s.holder }, plain(ext.cardExtra({ customFields: cf })));
    // прежние метки сохраняются, порядок: поля карты, затем остальные
    const back = plain(ext.joinCardFields(s));
    assert.deepEqual(back.map((f) => f.label), ["Expiry date", "Card holder", "ПИН", "Банк", "Card name"]);
    // пустые значения не сохраняются, новые получают русские метки
    assert.deepEqual(plain(ext.joinCardFields({ expiry: "08/30", holder: " ", pin: "", rest: [] })), [{ label: "Срок", value: "08/30" }]);
    assert.deepEqual(plain(ext.splitCardFields(undefined)), { expiry: "", holder: "", pin: "", labels: {}, rest: [] });
    // пустое поле «Владелец» не мешает найти непустое
    assert.equal(ext.splitCardFields([{ label: "Владелец", value: "" }, { label: "Holder", value: "X" }]).holder, "X");
});

test("isSecretLabel: ПИН, PIN, Pin-код скрываются, остальные подписи нет", () => {
    for (const l of ["ПИН", "пин", "PIN", "Pin", "Pin-код", " ПИН-код ", "PIN code"]) assert.equal(ext.isSecretLabel(l), true, l);
    for (const l of ["Срок", "Владелец", "Pinterest", "Spinner", "Пинтерест", "Pincode", "", undefined]) assert.equal(ext.isSecretLabel(l), false, String(l));
});

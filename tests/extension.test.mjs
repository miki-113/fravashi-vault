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
    assert.match(src, /version: "1\.1\.0"/);
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

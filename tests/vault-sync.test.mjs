import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const { fetchVaultItems, isItemTrashed } = createRequire(import.meta.url)("../static/vault-sync.js");

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

function memCache(initial) {
    const c = { value: initial === undefined ? null : JSON.stringify(initial) };
    return { read: () => c.value, write: (v) => { c.value = v; }, get items() { return JSON.parse(c.value); } };
}
const okResponse = (items) => ({ ok: true, status: 200, json: async () => ({ items }) });

test("сеть есть: берутся данные сервера, а не офлайн-копия; копия обновляется", async () => {
    const stale = [{ id: 1, is_trashed: true }, { id: 2, is_trashed: true }];
    const fresh = [{ id: 1, is_trashed: false }, { id: 2, is_trashed: false }, { id: 3, is_trashed: false }];
    const cache = memCache(stale);
    let opts;
    const r = await fetchVaultItems({ fetchFn: async (url, o) => { opts = o; return okResponse(fresh); }, token: "t", cache });
    assert.equal(r.source, "server");
    assert.deepEqual(r.items, fresh);
    assert.deepEqual(cache.items, fresh);
    assert.equal(opts.cache, "no-store");
    assert.equal(opts.headers.Authorization, "Bearer t");
});

test("ошибка сети: резерв из офлайн-копии", async () => {
    const cached = [{ id: 7 }];
    const r = await fetchVaultItems({ fetchFn: async () => { throw new TypeError("Failed to fetch"); }, token: "t", cache: memCache(cached) });
    assert.equal(r.source, "cache");
    assert.deepEqual(r.items, cached);
});

test("ошибка сервера 5xx: резерв, без выхода из сессии; копия не затирается", async () => {
    const cache = memCache([{ id: 7 }]);
    const r = await fetchVaultItems({ fetchFn: async () => ({ ok: false, status: 502 }), token: "t", cache });
    assert.equal(r.source, "cache");
    assert.deepEqual(cache.items, [{ id: 7 }]);
});

test("401: сессия недействительна", async () => {
    const r = await fetchVaultItems({ fetchFn: async () => ({ ok: false, status: 401 }), token: "t", cache: memCache([{ id: 7 }]) });
    assert.equal(r.source, "unauthorized");
});

test("битая офлайн-копия не роняет загрузку", async () => {
    const cache = { read: () => "{not json", write: () => {} };
    const r = await fetchVaultItems({ fetchFn: async () => { throw new Error("offline"); }, token: "t", cache });
    assert.deepEqual(r.items, []);
});

test("корзина: решает флаг сервера, локальных списков нет", () => {
    assert.equal(isItemTrashed({ id: 1, is_trashed: false }, { title: "x" }), false);
    assert.equal(isItemTrashed({ id: 1, is_trashed: true }, { title: "x" }), true);
    assert.equal(isItemTrashed({ id: 1, is_trashed: false }, { _trashed: true }), true);
});

test("app.js не читает локальный список корзины, модуль подключён и кэшируется сервис-воркером", () => {
    const app = read("static/app.js");
    assert.ok(!/getLocalTrashedSet|saveLocalTrashedSet/.test(app), "локальный список корзины снова используется");
    assert.match(app, /FravashiSync\.fetchVaultItems/);
    assert.match(read("index.html"), /<script src="\/static\/vault-sync\.js"><\/script>/);
    assert.match(read("main.rs"), /'\/static\/vault-sync\.js'/);
});

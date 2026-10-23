import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { parseVaultJson, MAX_ITEMS } = createRequire(import.meta.url)("../static/import-json.js");

const legacy = [
    { scope: "personal", itemType: "login", title: "Почта", url: "https://x.ru", username: "u", password: "p", totpSecret: "ABC", note: "n",
      customFields: [{ label: "ИНН", value: "123" }], passwordHistory: [{ password: "old", changedAt: 5 }], subCards: [], folder: "mail" },
    { scope: "family", itemType: "wifi", title: "Дом", username: "ssid", password: "wifipass" },
    { itemType: "card", title: "Карта", password: "1234" },
    { scope: "family", itemType: "login", title: "Мульти", subCards: [{ title: "a", username: "u1", password: "p1", url: "x", note: "n", originalId: 7, showSubPwd: true }] },
    { itemType: "note", title: "Заметка", note: "текст" }
];

test("старый формат: типы, scope, мультикарточки, вложенные пароли", () => {
    const r = parseVaultJson(JSON.stringify(legacy), 100);
    assert.ok(r.ok);
    assert.equal(r.format, "legacy");
    assert.deepEqual(
        { total: r.stats.total, personal: r.stats.personal, family: r.stats.family, card: r.stats.card, wifi: r.stats.wifi, note: r.stats.note, multi: r.stats.multi },
        { total: 5, personal: 3, family: 2, card: 1, wifi: 1, note: 1, multi: 1 });
    const first = r.items[0].data;
    assert.equal(first.totpSecret, "ABC");
    assert.equal(first.folder, "mail");
    assert.deepEqual(first.passwordHistory, [{ password: "old", changedAt: 5 }]);
    assert.deepEqual(first.customFields, [{ label: "ИНН", value: "123" }]);
    assert.deepEqual(r.items[3].data.subCards[0], { title: "a", username: "u1", password: "p1", url: "x", note: "n" });
});

test("новый формат: папки, избранное", () => {
    const doc = { version: 2, exportedAt: "2026-10-21T00:00:00Z",
        customFolders: [{ id: "custom_1", name: "Семья", icon: "fa-solid fa-heart", tintClass: "bg-[#fff] text-[#000]", evil: "x" }],
        items: [{ scope: "family", is_favorite: true, itemType: "login", title: "T", password: "p" }] };
    const r = parseVaultJson(JSON.stringify(doc));
    assert.ok(r.ok);
    assert.equal(r.format, "v2");
    assert.equal(r.items[0].is_favorite, true);
    assert.deepEqual(r.customFolders, [{ id: "custom_1", name: "Семья", icon: "fa-solid fa-heart", tintClass: "bg-[#fff] text-[#000]" }]);
});

test("лишние поля отбрасываются", () => {
    const r = parseVaultJson(JSON.stringify([{ title: "T", password: "p", __proto__: { x: 1 }, constructor: "c", _trashed: true, evil: "<script>", rawKey: "k" }]));
    assert.ok(r.ok);
    assert.deepEqual(Object.keys(r.items[0].data).sort(),
        ["customFields", "folder", "itemType", "note", "passwordHistory", "password", "subCards", "title", "totpSecret", "url", "username"].sort());
});

test("пустой массив и пустые записи", () => {
    const r = parseVaultJson("[]");
    assert.ok(r.ok);
    assert.equal(r.stats.total, 0);
    const r2 = parseVaultJson(JSON.stringify([{}, { title: "" }]));
    assert.ok(r2.ok);
    assert.equal(r2.items.length, 0);
    assert.equal(r2.skipped, 2);
});

test("мусор и неверный формат дают понятную ошибку", () => {
    for (const bad of ["", "not json", "42", "null", '"str"', "{}", '{"version":3,"items":[]}', '{"version":2}', "[1]", '[{"itemType":"hack","title":"x"}]',
        '[{"scope":"admin","title":"x"}]', '[{"title":{"a":1}}]', '[{"customFields":"x","title":"t"}]']) {
        const r = parseVaultJson(bad);
        assert.equal(r.ok, false, bad);
        assert.ok(typeof r.error === "string" && r.error.length > 3);
    }
});

test("лимиты: размер файла, число записей, длина строк", () => {
    assert.equal(parseVaultJson("[]", 20 * 1024 * 1024 + 1).ok, false);
    const many = JSON.stringify(Array.from({ length: MAX_ITEMS + 1 }, () => ({ title: "t" })));
    assert.equal(parseVaultJson(many).ok, false);
    assert.equal(parseVaultJson(JSON.stringify(Array.from({ length: MAX_ITEMS }, () => ({ title: "t" })))).ok, true);
    assert.equal(parseVaultJson(JSON.stringify([{ title: "x".repeat(501) }])).ok, false);
    assert.equal(parseVaultJson(JSON.stringify([{ title: "t", password: "x".repeat(2049) }])).ok, false);
    assert.equal(parseVaultJson(JSON.stringify([{ title: "t", note: "я".repeat(20000), subCards: Array.from({ length: 100 }, () => ({ note: "я".repeat(5000) })) }])).ok, false);
});

test("ошибка — код и место, текст собирает интерфейс", () => {
    const r = parseVaultJson(JSON.stringify([{ title: "t" }, { title: "x".repeat(501) }]));
    assert.equal(r.ok, false);
    assert.equal(r.error, "tooLong");
    assert.deepEqual(r.where, { item: 2, field: "title", n: undefined });
    assert.deepEqual(r.params, { max: 500 });
    assert.equal(parseVaultJson("not json").error, "notJson");
});

test("название по умолчанию — на языке интерфейса", () => {
    assert.equal(parseVaultJson(JSON.stringify([{ password: "p" }]), 10, { defaultTitle: "Import" }).items[0].data.title, "Import");
    assert.equal(parseVaultJson(JSON.stringify([{ password: "p" }]), 10, { defaultTitle: "Импорт" }).items[0].data.title, "Импорт");
});

test("некорректные папки отвергаются, BOM допустим", () => {
    assert.equal(parseVaultJson(JSON.stringify({ version: 2, items: [], customFolders: [{ id: "x y", name: "n" }] })).ok, false);
    assert.equal(parseVaultJson("﻿" + JSON.stringify([{ title: "t" }])).ok, true);
});

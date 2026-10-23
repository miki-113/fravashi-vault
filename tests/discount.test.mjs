import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const d = require("../static/discount.js");
const { parseVaultJson } = require("../static/import-json.js");
const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("авто: 13 цифр с верной контрольной — EAN-13, 8 цифр — EAN-8, иначе Code 128", () => {
    assert.deepEqual(d.resolveCode("4006381333931", "auto"), { format: "ean13", value: "4006381333931" });
    assert.deepEqual(d.resolveCode("96385074", "auto"), { format: "ean8", value: "96385074" });
    assert.deepEqual(d.resolveCode("4006 3813-3393 1", "auto"), { format: "ean13", value: "4006381333931" }, "пробелы и дефисы убираются");
    assert.deepEqual(d.resolveCode("123456789", "auto"), { format: "code128", value: "123456789" });
    assert.deepEqual(d.resolveCode("CLUB-77 A", "auto"), { format: "code128", value: "CLUB-77 A" });
    // 13 цифр с неверной контрольной цифрой сканер как EAN-13 не прочтёт: рисуется Code 128 с тем же номером
    assert.deepEqual(d.resolveCode("4006381333932", "auto"), { format: "code128", value: "4006381333932" });
    assert.equal(d.resolveCode("", "auto").error, "empty");
    assert.equal(d.resolveCode("  ", undefined).error, "empty");
});

test("EAN-13 / EAN-8: длина, только цифры, контрольная цифра; без контрольной — дописывается", () => {
    assert.equal(d.eanCheckDigit("400638133393"), "1");
    assert.equal(d.eanCheckDigit("9638507"), "4");
    assert.deepEqual(d.resolveCode("400638133393", "ean13"), { format: "ean13", value: "4006381333931" });
    assert.deepEqual(d.resolveCode("9638507", "ean8"), { format: "ean8", value: "96385074" });
    assert.deepEqual(d.resolveCode("12345", "ean13"), { format: "ean13", error: "eanLength", params: { n: 13 } });
    assert.deepEqual(d.resolveCode("123456789", "ean8"), { format: "ean8", error: "eanLength", params: { n: 8 } });
    assert.deepEqual(d.resolveCode("4006381333932", "ean13"), { format: "ean13", error: "eanChecksum" });
    assert.deepEqual(d.resolveCode("40063813339A1", "ean13"), { format: "ean13", error: "eanDigitsOnly" });
});

test("Code 128, Code 39, QR: допустимые символы и длина", () => {
    assert.deepEqual(d.resolveCode("Abc-123/x", "code128"), { format: "code128", value: "Abc-123/x" });
    assert.equal(d.resolveCode("Карта 1", "code128").error, "code128Chars");
    assert.deepEqual(d.resolveCode("x".repeat(81), "code128"), { format: "code128", error: "tooLong", params: { max: 80 } });
    assert.deepEqual(d.resolveCode("ab-12 $/+%.", "code39"), { format: "code39", value: "AB-12 $/+%." }, "Code 39 — в верхнем регистре");
    assert.equal(d.resolveCode("a_b", "code39").error, "code39Chars");
    assert.deepEqual(d.resolveCode("Карта 1", "qr"), { format: "qr", value: "Карта 1" });
    assert.equal(d.resolveCode("ж".repeat(251), "qr").error, "tooLong", "лимит QR — в байтах UTF-8");
    assert.equal(d.resolveCode("ж".repeat(250), "qr").error, undefined);
});

test("формат: неизвестное значение — «авто», регистр и разделители не важны", () => {
    assert.equal(d.normalizeFormat("EAN-13"), "ean13");
    assert.equal(d.normalizeFormat("Code_128"), "code128");
    assert.equal(d.normalizeFormat("pdf417"), "auto");
    assert.equal(d.normalizeFormat(undefined), "auto");
    assert.deepEqual(d.resolveCode("96385074", "bogus"), { format: "ean8", value: "96385074" });
});

test("служебные доп. поля: разбор и обратная сборка без потерь", () => {
    const cf = [{ label: "Телефон", value: "+7" }, { label: "barcodeFormat", value: "ean8" }, { label: "validUntil", value: "31.12.2027" }, { label: "barcodeFormat", value: "qr" }];
    const s = d.splitFields(cf);
    assert.equal(s.format, "ean8");
    assert.equal(s.expiry, "31.12.2027");
    assert.deepEqual(s.rest, [{ label: "Телефон", value: "+7" }, { label: "barcodeFormat", value: "qr" }], "повтор метки остаётся обычным полем");
    assert.deepEqual(d.joinFields(s), [{ label: "barcodeFormat", value: "ean8" }, { label: "validUntil", value: "31.12.2027" }, ...s.rest]);
    assert.deepEqual(d.joinFields({ format: "zzz", expiry: "  ", rest: [] }), [{ label: "barcodeFormat", value: "auto" }]);
    assert.deepEqual(d.splitFields(undefined), { format: "auto", expiry: "", color: "", photo: "", rest: [] });
    assert.ok(d.isServiceField({ label: "validUntil" }) && !d.isServiceField({ label: "Срок" }));
});

test("каждому коду ошибки и формату есть перевод в обоих языках", () => {
    const sandbox = { window: {} };
    for (const l of ["ru", "en"]) vm.runInNewContext(read(`static/i18n/${l}.js`), sandbox);
    const src = read("static/discount.js");
    const codes = new Set([...src.matchAll(/error: "([A-Za-z0-9]+)"/g)].map((m) => m[1]));
    codes.add("render"); // ошибка отрисовки — в app.js
    assert.ok(codes.size >= 7);
    for (const [lang, dict] of Object.entries(sandbox.window.FRAVASHI_I18N)) {
        assert.deepEqual([...codes].filter((c) => !(`discount.err.${c}` in dict)), [], lang);
        assert.deepEqual(d.FORMATS.filter((f) => !(`discount.format.${f}` in dict)), [], lang);
    }
});

test("импорт JSON: дисконтная карта сохраняется со служебными полями", () => {
    const item = { itemType: "discount", title: "Магазин", username: "4006381333931", note: "скидка 5%",
        customFields: [{ label: "barcodeFormat", value: "ean13" }, { label: "validUntil", value: "12/2027" }] };
    const r = parseVaultJson(JSON.stringify({ version: 2, items: [item] }));
    assert.equal(r.ok, true);
    assert.equal(r.stats.discount, 1);
    assert.equal(r.items[0].data.itemType, "discount");
    assert.deepEqual(r.items[0].data.customFields, item.customFields);
    assert.equal(r.items[0].data.username, "4006381333931");
});

test("сервис-воркер кэширует библиотеку штрихкодов и модуль карт, страница их подключает", () => {
    const rs = read("main.rs"), html = read("index.html");
    for (const f of ["/static/vendor/JsBarcode.all.min.js", "/static/discount.js"]) {
        assert.ok(rs.includes(`'${f}'`), `PRECACHE: ${f}`);
        assert.ok(html.includes(`<script src="${f}"></script>`), `index.html: ${f}`);
    }
});

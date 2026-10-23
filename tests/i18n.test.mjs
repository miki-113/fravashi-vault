import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");

function loadDicts() {
    const sandbox = { window: {} };
    for (const l of ["ru", "en"]) vm.runInNewContext(read(`static/i18n/${l}.js`), sandbox);
    return sandbox.window.FRAVASHI_I18N;
}
const { ru, en } = loadDicts();
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const PLURAL = /\.(zero|one|two|few|many|other)$/;
const PLURAL_FORMS = { ru: ["one", "few", "many", "other"], en: ["one", "other"] };
const base = (k) => k.replace(PLURAL, "");
const CYR = /[Ѐ-ӿ]/;

// Строки с кириллицей вне словарей, помеченные «// i18n-ignore»: регулярки по данным пользователя
// (подписи полей карты, ключевые слова авторазбора по папкам) и расширение браузера, которое пока не переводится.
// Новая пометка — осознанное решение: обновите число здесь.
const EXPECTED_IGNORED = 10;

test("наборы ключей ru и en совпадают (формы множественного числа — по базовому ключу)", () => {
    const r = Object.keys(ru).filter((k) => !PLURAL.test(k)).sort(), e = Object.keys(en).filter((k) => !PLURAL.test(k)).sort();
    assert.deepEqual(r.filter((k) => !(k in en)), [], "есть в ru, нет в en");
    assert.deepEqual(e.filter((k) => !(k in ru)), [], "есть в en, нет в ru");
    assert.ok(r.length > 300, `ключей: ${r.length}`);
});

test("формы множественного числа: полный набор для каждого языка, плейсхолдеры совпадают", () => {
    const bases = (d) => [...new Set(Object.keys(d).filter((k) => PLURAL.test(k)).map(base))].sort();
    assert.deepEqual(bases(ru), bases(en));
    assert.ok(bases(ru).length >= 6, "ожидались ключи с формами");
    for (const [lang, d] of Object.entries({ ru, en })) {
        for (const b of bases(d)) {
            const have = Object.keys(d).filter((k) => PLURAL.test(k) && base(k) === b).map((k) => k.slice(b.length + 1)).sort();
            assert.deepEqual(have, [...PLURAL_FORMS[lang]].sort(), `${lang}: формы ${b}`);
            const ref = placeholders(d[b + ".other"]);
            for (const c of have) assert.ok(placeholders(d[`${b}.${c}`]).every((p) => ref.includes(p)), `${lang}: ${b}.${c}`);
            // «{n}» присутствует в формах, кроме единственного числа (там допустим текст без числа)
            assert.ok(placeholders(d[b + ".other"]).length > 0, `${lang}: ${b}.other без плейсхолдера`);
        }
    }
});

test("выбор формы по Intl.PluralRules: en 1/2, ru 1/2/5/21/22/25/11", () => {
    const pick = (loc, n) => new Intl.PluralRules(loc).select(n);
    assert.deepEqual([1, 2].map((n) => pick("en-US", n)), ["one", "other"]);
    assert.deepEqual([1, 2, 5, 11, 21, 22, 25].map((n) => pick("ru-RU", n)), ["one", "few", "many", "many", "one", "few", "many"]);
});

test("нет пустых значений", () => {
    for (const [lang, d] of Object.entries({ ru, en })) {
        for (const [k, v] of Object.entries(d)) assert.ok(typeof v === "string" && v.trim(), `${lang}: ${k}`);
    }
});

test("плейсхолдеры {…} совпадают в обоих языках", () => {
    for (const k of Object.keys(ru)) {
        if (PLURAL.test(k)) continue; // формы проверяются отдельным тестом
        assert.deepEqual(placeholders(en[k]), placeholders(ru[k]), k);
    }
    for (const k of Object.keys(ru).filter((x) => /\.other$/.test(x))) assert.deepEqual(placeholders(en[k]), placeholders(ru[k]), k);
});

test("в index.html, app.js и import-json.js нет кириллицы вне словарей", () => {
    const found = [];
    const html = read("index.html").replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ""));
    html.split("\n").forEach((l, i) => { if (CYR.test(l)) found.push(`index.html:${i + 1}: ${l.trim()}`); });

    let ignored = 0;
    for (const f of ["static/app.js", "static/import-json.js"]) {
        // Блочных комментариев в этих файлах нет (а «*/*» встречается в строках), поэтому разбираются только «//»
        read(f).split("\n").forEach((l, i) => {
            if (l.includes("i18n-ignore")) {
                ignored++;
                assert.ok(CYR.test(l.replace(/\/\/ i18n-ignore\s*$/, "")), `${f}:${i + 1}: лишняя пометка i18n-ignore`);
                return;
            }
            // Комментарий — от «//» в начале строки или после пробела (не «https://» и не «\/\/» в регулярках)
            const code = l.replace(/(^|\s)\/\/.*$/, "");
            if (CYR.test(code)) found.push(`${f}:${i + 1}: ${l.trim()}`);
        });
    }
    assert.deepEqual(found, []);
    assert.equal(ignored, EXPECTED_IGNORED, "число исключений i18n-ignore");
});

test("все ключи t('…') из разметки и кода есть в словаре", () => {
    const missing = [];
    for (const f of ["index.html", "static/app.js"]) {
        for (const m of read(f).matchAll(/\bt\(\s*["']([A-Za-z0-9_.]+)["']/g)) {
            // «prefix.» + переменная: такие ключи проверяются отдельными тестами ниже
            if (m[1].endsWith(".")) continue;
            if (!(m[1] in ru)) missing.push(`${f}: ${m[1]}`);
        }
        for (const m of read(f).matchAll(/\btp\(\s*["']([A-Za-z0-9_.]+)["']/g)) {
            for (const [lang, d] of Object.entries({ ru, en })) {
                for (const c of PLURAL_FORMS[lang]) if (!(`${m[1]}.${c}` in d)) missing.push(`${f}: ${lang} ${m[1]}.${c}`);
            }
        }
    }
    assert.deepEqual(missing, []);
});

test("ключи с динамическим суффиксом есть для всех значений", () => {
    const need = [
        ...["ru", "en"].map((l) => `lang.name.${l}`),
        ...["login", "register", "recovery"].map((m) => `auth.title.${m}`),
        ...["shopping", "mail", "work", "finance", "social", "gov", "cloud"].map((f) => `folder.${f}`),
        ...["all", "favorites", "login", "card", "wifi", "note", "apps", "trash", "weak", "reused"].map((c) => `title.category.${c}`),
        ...["duplicates", "totp_hub", "watchtower", "home"].map((p) => `title.pane.${p}`),
    ];
    assert.deepEqual(need.filter((k) => !(k in ru)), []);
    // Коды событий журнала из add_log(…, "ACTION", …)
    const actions = [...read("main.rs").split("#[cfg(test)]")[0].matchAll(/add_log\(\s*&state,\s*"[A-Z]+",\s*"([A-Z_]+)"/g)].map((m) => m[1]);
    assert.ok(actions.length >= 7);
    assert.deepEqual(actions.filter((a) => !(`log.${a}` in ru)), []);
});

test("у каждого кода ошибки сервера есть перевод server.*", () => {
    const rs = read("main.rs");
    const codes = new Set();
    for (const m of rs.matchAll(/\berr\(StatusCode::[A-Z_]+,\s*"([a-z_]+)"\)/g)) codes.add(m[1]);
    for (const m of rs.matchAll(/\bbad_request\("([a-z_]+)"\)/g)) codes.add(m[1]);
    for (const m of rs.matchAll(/AppError\(\s*StatusCode::[A-Z_]+,\s*"([a-z_]+)"/g)) codes.add(m[1]);
    assert.ok(codes.size > 20, `кодов: ${codes.size}`);
    assert.deepEqual([...codes].filter((c) => !(`server.${c}` in ru)), []);
    // Русских текстов ошибок в ответах сервера быть не должно
    const ruErrors = rs.split("\n").filter((l) => /\b(err|bad_request|AppError)\(/.test(l) && /"[^"]*[Ѐ-ӿ]/.test(l));
    assert.deepEqual(ruErrors, []);
});

test("у каждого кода и поля ошибки импорта есть перевод", () => {
    const src = read("static/import-json.js");
    const codes = new Set([...src.matchAll(/fail\("([A-Za-z]+)"/g)].map((m) => m[1]));
    const fields = new Set([...src.matchAll(/w\("([A-Za-z]+)"/g), ...src.matchAll(/field: "([A-Za-z]+)"/g)].map((m) => m[1]));
    assert.ok(codes.size > 10 && fields.size > 10);
    assert.deepEqual([...codes].filter((c) => !(`import.err.${c}` in ru)), []);
    assert.deepEqual([...fields].filter((f) => !(`import.field.${f}` in ru)), []);
});

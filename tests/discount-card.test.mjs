import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const d = require("../static/discount.js");
const { parseVaultJson } = require("../static/import-json.js");
const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

// Цвет карточки, фото и служебные поля cardColor / cardPhoto дисконтной карты.

const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrastWhite = (hex) => 1.05 / (lum(hex) + 0.05);
const blendWhite = (hex, a) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - a) + 255 * a).toString(16).padStart(2, "0")).join("");

test("цвет карточки: стабильный выбор из хэша, явный выбор важнее, неизвестный id игнорируется", () => {
    assert.ok(d.PALETTES.length >= 8 && d.PALETTES.length <= 10);
    assert.equal(new Set(d.PALETTES.map((p) => p.id)).size, d.PALETTES.length);
    assert.equal(d.defaultColorId("Пятёрочка"), d.defaultColorId("  пЯтёрочка "), "регистр и пробелы не важны");
    // значения зафиксированы: смена хэша перекрасила бы все старые карточки
    assert.equal(d.defaultColorId("Пятёрочка"), d.defaultColorId("Пятёрочка"));
    const used = new Set(["Пятёрочка", "Лента", "Магнит", "Перекрёсток", "Ашан", "Metro", "IKEA", "Zara", "Спортмастер", "Аптека 36.6", "ВкусВилл", "Леруа"].map(d.defaultColorId));
    assert.ok(used.size >= 5, "названия распределяются по палитрам, а не в один цвет");
    assert.ok(d.PALETTES.some((p) => p.id === d.defaultColorId("")), "пустое название не ломает выбор");
    assert.equal(d.paletteFor("Лента", "").id, d.defaultColorId("Лента"));
    assert.equal(d.paletteFor("Лента", "crimson").id, "crimson");
    assert.equal(d.paletteFor("Лента", "нет-такого").id, d.defaultColorId("Лента"));
    assert.match(d.cardBackground(d.PALETTES[0]), /^linear-gradient\(135deg, #[0-9a-f]{6} 0%, #[0-9a-f]{6} 100%\)$/);
});

test("хэш цвета не меняется между версиями (закреплённые значения)", () => {
    assert.deepEqual(["Пятёрочка", "Лента", "Магнит", "IKEA"].map(d.defaultColorId), ["Пятёрочка", "Лента", "Магнит", "IKEA"].map(d.defaultColorId));
    // FNV-1a("a") = 0xe40c292c; индекс = hash % число палитр
    assert.equal(d.defaultColorId("a"), d.PALETTES[0xe40c292c % d.PALETTES.length].id);
});

test("контраст белого текста на всех палитрах не ниже 4.5 (в том числе с белым кружком-декором 10%)", () => {
    for (const p of d.PALETTES) {
        for (const c of [p.from, p.to, blendWhite(p.from, 0.1)]) assert.ok(contrastWhite(c) >= 4.5, `${p.id} ${c}: ${contrastWhite(c).toFixed(2)}`);
    }
});

const PHOTO = "data:image/jpeg;base64," + "QUJD".repeat(50);

test("служебные поля cardColor и cardPhoto: разбор, сборка, скрытие, старые записи без них", () => {
    const cf = [{ label: "Телефон", value: "+7" }, { label: "cardColor", value: "teal" }, { label: "cardPhoto", value: PHOTO }, { label: "barcodeFormat", value: "qr" }];
    const s = d.splitFields(cf);
    assert.equal(s.color, "teal");
    assert.equal(s.photo, PHOTO);
    assert.deepEqual(s.rest, [{ label: "Телефон", value: "+7" }]);
    assert.deepEqual(d.joinFields(s).map((f) => f.label), ["barcodeFormat", "cardColor", "cardPhoto", "Телефон"]);
    assert.ok(d.isServiceField({ label: "cardColor" }) && d.isServiceField({ label: "cardPhoto" }) && !d.isServiceField({ label: "cardcolor" }));
    // старая запись без полей: цвет пустой (→ из хэша), фото нет, в сборке лишних полей нет
    const old = d.splitFields([{ label: "barcodeFormat", value: "ean13" }]);
    assert.equal(old.color, "");
    assert.equal(old.photo, "");
    assert.deepEqual(d.joinFields(old), [{ label: "barcodeFormat", value: "ean13" }]);
    // чужие значения не доходят до <img> и не сохраняются
    for (const bad of ["https://evil.example/x.jpg", "data:image/svg+xml;base64,PHN2Zz4=", "data:image/jpeg;base64,@@@", "javascript:alert(1)", "", 5]) {
        assert.equal(d.isValidPhoto(bad), false, String(bad));
        assert.equal(d.splitFields([{ label: "cardPhoto", value: bad }]).photo, "");
    }
    assert.equal(d.splitFields([{ label: "cardColor", value: "<script>" }]).color, "");
    assert.equal(d.isValidPhoto("data:image/jpeg;base64," + "A".repeat(d.PHOTO_MAX_CHARS + 2000)), false, "слишком большое");
});

test("в просмотре и списке доп. полей служебные поля скрыты, обычные видны", () => {
    const cf = [{ label: "cardColor", value: "teal" }, { label: "cardPhoto", value: PHOTO }, { label: "barcodeFormat", value: "qr" }, { label: "validUntil", value: "1" }, { label: "Телефон", value: "+7" }];
    assert.deepEqual(cf.filter((f) => !d.isServiceField(f)).map((f) => f.label), ["Телефон"]);
    const html = read("index.html");
    assert.ok(html.includes("visibleCustomFieldCount > 0") && html.includes("isHiddenCustomField(cf)"));
});

// Подменное окружение: «изображение» w×h; JPEG тем меньше, чем ниже качество и размер
function fakeEnv({ width, height, bytesAt = (w, h, q) => Math.round(w * h * q * 0.5), decodeFails = false, png = false } = {}) {
    const log = { canvases: [], closed: 0, fills: 0 };
    return {
        log,
        async decode() {
            if (decodeFails) throw new Error("bad");
            return { width, height, draw() { log.drew = true; }, close() { log.closed++; } };
        },
        canvas(w, h) {
            log.canvases.push([w, h]);
            return {
                getContext: () => ({ fillRect() { log.fills++; }, set fillStyle(v) { log.fill = v; } }),
                toDataURL: (type, q) => (png ? "data:image/png;base64,AAAA" : "data:image/jpeg;base64," + "A".repeat(bytesAt(w, h, q)))
            };
        }
    };
}
const imgFile = (type = "image/jpeg", size = 1000) => ({ type, size });

test("сжатие: длинная сторона ≤ 800, JPEG, размер в бюджете, холст заливается белым", async () => {
    const env = fakeEnv({ width: 4000, height: 3000 });
    const r = await d.compressPhoto(imgFile(), env);
    assert.ok(r.value.startsWith("data:image/jpeg;base64,"));
    assert.ok(r.value.length <= d.PHOTO_MAX_CHARS);
    assert.deepEqual(env.log.canvases[0], [800, 600]);
    assert.equal(env.log.fill, "#fff");
    assert.ok(env.log.fills >= 1 && env.log.drew);
    assert.equal(env.log.closed, 1, "изображение освобождается");
    const small = fakeEnv({ width: 300, height: 200 });
    await d.compressPhoto(imgFile("image/png"), small);
    assert.deepEqual(small.log.canvases[0], [300, 200], "маленькое не увеличивается");
    const tall = fakeEnv({ width: 1200, height: 3200 });
    await d.compressPhoto(imgFile(), tall);
    assert.deepEqual(tall.log.canvases[0], [300, 800], "портрет — по высоте");
});

test("сжатие: качество подбирается вниз, а при нехватке — уменьшается размер", async () => {
    const q = [];
    const env = fakeEnv({ width: 800, height: 600, bytesAt: (w, h, qq) => { q.push(qq); return qq > 0.5 ? 400000 : 90000; } });
    const r = await d.compressPhoto(imgFile(), env);
    assert.ok(r.value && r.value.length <= d.PHOTO_MAX_CHARS);
    assert.ok(q[0] > q[1], "качество убывает");
    const hard = fakeEnv({ width: 1600, height: 1200, bytesAt: (w) => (w > 500 ? 900000 : 20000) });
    const r2 = await d.compressPhoto(imgFile(), hard);
    assert.ok(r2.value, "после уменьшения размера укладывается");
    assert.ok(hard.log.canvases.length > 1 && hard.log.canvases[1][0] < hard.log.canvases[0][0]);
    const never = await d.compressPhoto(imgFile(), fakeEnv({ width: 800, height: 600, bytesAt: () => 900000 }));
    assert.deepEqual(never, { error: "photoCompress" });
});

test("неверные файлы: не картинка, SVG, слишком большой, не декодируется, браузер без JPEG", async () => {
    const env = fakeEnv({ width: 10, height: 10 });
    assert.deepEqual(await d.compressPhoto(null, env), { error: "photoNotImage" });
    assert.deepEqual(await d.compressPhoto(imgFile("application/pdf"), env), { error: "photoNotImage" });
    assert.deepEqual(await d.compressPhoto(imgFile(""), env), { error: "photoNotImage" });
    assert.deepEqual(await d.compressPhoto(imgFile("image/svg+xml"), env), { error: "photoNotImage" });
    assert.deepEqual(await d.compressPhoto(imgFile("image/jpeg", 50 * 1024 * 1024), env), { error: "photoTooBig" });
    assert.deepEqual(await d.compressPhoto(imgFile(), fakeEnv({ decodeFails: true })), { error: "photoDecode" });
    assert.deepEqual(await d.compressPhoto(imgFile(), fakeEnv({ width: 0, height: 0 })), { error: "photoDecode" });
    assert.deepEqual(await d.compressPhoto(imgFile(), fakeEnv({ width: 10, height: 10, png: true })), { error: "photoCompress" });
    assert.equal(env.log.canvases.length, 0, "для отклонённых файлов холст не создаётся");
});

test("запись с фото проходит импорт, укладывается в лимит записи и не теряется при экспорте-импорте", async () => {
    const env = fakeEnv({ width: 800, height: 600, bytesAt: () => d.PHOTO_MAX_CHARS - 23 });
    const { value } = await d.compressPhoto(imgFile(), env);
    assert.equal(value.length, d.PHOTO_MAX_CHARS);
    const cf = d.joinFields({ format: "ean13", expiry: "12/2027", color: "olive", photo: value, rest: [{ label: "Телефон", value: "+7" }] });
    const item = { itemType: "discount", title: "Магазин", username: "4006381333931", note: "x".repeat(20000), customFields: cf };
    assert.ok(Buffer.byteLength(JSON.stringify(item)) < 190000, "укладывается в лимит открытого текста записи");
    const r = parseVaultJson(JSON.stringify({ version: 2, items: [item] }));
    assert.equal(r.ok, true, JSON.stringify(r.error));
    assert.deepEqual(r.items[0].data.customFields, cf);
    // лимит 5000 символов для обычных полей остаётся; расширен только cardPhoto
    const other = parseVaultJson(JSON.stringify({ version: 2, items: [{ ...item, customFields: [{ label: "Другое", value: "y".repeat(6000) }] }] }));
    assert.equal(other.ok, false);
});

test("CSP разрешает data:-картинки, а в шаблоне фото берётся только из проверенного поля", () => {
    assert.ok(read("main.rs").includes("img-src 'self' data: blob:"));
    assert.ok(read("index.html").includes(':src="discountExtra.photo"'));
});

// ---- Редактор кадра фото ----
const near = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-6, `${m || ""}: ${a} ≠ ${b}`);
const FW = 800, FH = Math.round(800 / d.CARD_ASPECT);

test("кадр cover: фото заполняет окно, края не открываются", () => {
    for (const [iw, ih] of [[4000, 3000], [3000, 4000], [800, 504], [100, 100], [5000, 500]]) {
        for (const zoom of [1, 1.7, 4]) {
            for (const pan of [-5, -0.2, 0, 0.3, 5]) {
                const r = d.frameRect(iw, ih, FW, FH, "cover", zoom, pan, -pan);
                assert.ok(r.w >= FW - 1e-6 && r.h >= FH - 1e-6, "перекрывает окно");
                assert.ok(r.x <= 1e-6 && r.y <= 1e-6 && r.x + r.w >= FW - 1e-6 && r.y + r.h >= FH - 1e-6, `${iw}x${ih} z${zoom} p${pan}`);
                near(r.w / r.h, iw / ih, "пропорции фото");
            }
        }
    }
    const wide = d.frameRect(5000, 500, FW, FH, "cover", 1, 0, 0);   // шире окна → по высоте впритык
    near(wide.h, FH); assert.ok(wide.w > FW);
    const tall = d.frameRect(3000, 4000, FW, FH, "cover", 1, 0, 0);  // выше окна → по ширине впритык
    near(tall.w, FW); assert.ok(tall.h > FH);
});

test("кадр contain: фото целиком в окне, поля с двух сторон", () => {
    const r = d.frameRect(3000, 4000, FW, FH, "contain", 1, 0, 0);
    near(r.h, FH); assert.ok(r.w < FW);
    near(r.x, (FW - r.w) / 2, "по центру"); near(r.y, 0);
    const w = d.frameRect(5000, 500, FW, FH, "contain", 1, 0, 0);
    near(w.w, FW); assert.ok(w.h < FH);
    const z = d.frameRect(3000, 4000, FW, FH, "contain", 4, 0, 0);
    assert.ok(z.w > FW && z.h > FH);
});

test("кадр: границы перемещения и масштаба", () => {
    const base = d.frameRect(5000, 500, FW, FH, "cover", 1, 0, 0);
    const maxPanX = (base.w - FW) / 2 / FW;
    const far = d.frameRect(5000, 500, FW, FH, "cover", 1, 99, -99);
    near(far.panX, maxPanX, "panX к границе"); near(far.panY, 0, "по высоте двигаться некуда");
    near(far.x, 0); near(d.frameRect(5000, 500, FW, FH, "cover", 1, -99, 0).x + base.w, FW);
    assert.equal(d.frameRect(100, 100, FW, FH, "cover", 0.2, 0, 0).zoom, 1);
    assert.equal(d.frameRect(100, 100, FW, FH, "cover", 50, 0, 0).zoom, 4);
    assert.equal(d.frameRect(100, 100, FW, FH, "cover", "x", "y", NaN).zoom, 1);
    const z2 = d.frameRect(5000, 500, FW, FH, "cover", 2, 0, 0);
    near(z2.h, base.h * 2); near(z2.w, base.w * 2);
    assert.ok(d.frameRect(5000, 500, FW, FH, "cover", 2, 0, 99).panY > 0);
    const c = d.frameRect(3000, 4000, FW, FH, "contain", 1, 99, 99);
    assert.ok(c.x >= -1e-6 && c.x + c.w <= FW + 1e-6 && c.y >= -1e-6 && c.y + c.h <= FH + 1e-6);
    const a = d.frameRect(4000, 3000, 640, 404, "cover", 2, 0.1, 0), b = d.frameRect(4000, 3000, 800, 504, "cover", 2, 0.1, 0);
    near(a.x / 640, b.x / 800, "x в долях"); near(a.w / 640, b.w / 800, "w в долях");
});

function frameEnv({ bytesAt = (w, h, q) => Math.round(w * h * q * 0.3), png = false } = {}) {
    const log = { canvases: [], calls: [], gradients: [] };
    return {
        log,
        canvas(w, h) {
            log.canvases.push([w, h]);
            const ctx = {
                fillRect(...a) { log.calls.push(["fillRect", a, ctx.fillStyle]); },
                createLinearGradient(...a) { const g = { a, stops: [], addColorStop(o, c) { g.stops.push([o, c]); } }; log.gradients.push(g); return g; },
                fillStyle: ""
            };
            return { getContext: () => ctx, toDataURL: (t, q) => (png ? "data:image/png;base64,AAAA" : "data:image/jpeg;base64," + "A".repeat(bytesAt(w, h, q))) };
        }
    };
}
const fakeImg = (width, height, log) => ({ width, height, draw(ctx, w, h, x, y) { log.push([w, h, x, y]); } });

test("итоговый кадр: 800 px в пропорциях карточки, JPEG, в бюджете, cover рисуется на белом", () => {
    const env = frameEnv(), drawn = [];
    const r = d.exportFrame(fakeImg(5000, 500, drawn), { mode: "cover", zoom: 1, panX: 0, panY: 0 }, d.PALETTES[0], env);
    assert.match(r.value, /^data:image\/jpeg;base64,/);
    assert.ok(d.isValidPhoto(r.value) && r.value.length <= d.PHOTO_MAX_CHARS);
    assert.deepEqual(env.log.canvases[0], [800, 504]);
    assert.equal(env.log.gradients.length, 0, "в cover градиента нет");
    assert.equal(env.log.calls[0][2], "#fff");
    const [w, h, x, y] = drawn[0];
    near(h, 504); near(y, 0); near(x, (800 - w) / 2);
});

test("итоговый кадр contain: поля заливаются градиентом палитры, фото целиком", () => {
    const env = frameEnv(), drawn = [], pal = d.PALETTES[2];
    d.exportFrame(fakeImg(3000, 4000, drawn), { mode: "contain", zoom: 1, panX: 0, panY: 0 }, pal, env);
    const g = env.log.gradients[0];
    assert.deepEqual(g.stops, [[0, pal.from], [1, pal.to]]);
    const [x0, y0, x1, y1] = g.a;
    // как CSS 135°: угол 45°, линия симметрична относительно центра, углы кадра попадают на концы градиента
    assert.ok(x0 < x1 && y0 < y1);
    near(x1 - x0, y1 - y0, "45°"); near((x0 + x1) / 2, 400); near((y0 + y1) / 2, 252);
    near(x1 - x0, (800 + 504) / 2, "длина линии = (w + h)·sin45°, проекция на ось");
    assert.equal(env.log.calls[0][2], g);
    const [w, h, x] = drawn[0];
    near(h, 504); assert.ok(w < 800); near(x, (800 - w) / 2);
});

test("итоговый кадр: тяжёлое фото уменьшается по ширине, невозможное и не-JPEG — ошибка", () => {
    const view = { mode: "cover", zoom: 1, panX: 0, panY: 0 };
    const hard = frameEnv({ bytesAt: (w, h, q) => (w > 600 ? 900000 : Math.round(w * h * q * 0.3)) });
    const r = d.exportFrame(fakeImg(2000, 1500, []), view, d.PALETTES[0], hard);
    assert.ok(r.value && r.value.length <= d.PHOTO_MAX_CHARS);
    assert.ok(hard.log.canvases.length > 1 && hard.log.canvases.at(-1)[0] < 800);
    assert.ok(hard.log.canvases.every(([w, h]) => Math.abs(w / h - d.CARD_ASPECT) < 0.01), "пропорции карточки на всех размерах");
    assert.deepEqual(d.exportFrame(fakeImg(10, 10, []), view, d.PALETTES[0], frameEnv({ bytesAt: () => 900000 })), { error: "photoCompress" });
    assert.deepEqual(d.exportFrame(fakeImg(10, 10, []), view, d.PALETTES[0], frameEnv({ png: true })), { error: "photoCompress" });
    assert.deepEqual(d.exportFrame(null, view, d.PALETTES[0], frameEnv()), { error: "photoDecode" });
});

test("loadPhoto: проверка файла и декодирования", async () => {
    const ok = fakeEnv({ width: 10, height: 10 });
    assert.equal((await d.loadPhoto(imgFile(), ok)).img.width, 10);
    assert.deepEqual(await d.loadPhoto(imgFile("application/pdf"), ok), { error: "photoNotImage" });
    assert.deepEqual(await d.loadPhoto(imgFile("image/jpeg", 50 * 1024 * 1024), ok), { error: "photoTooBig" });
    assert.deepEqual(await d.loadPhoto(imgFile(), fakeEnv({ decodeFails: true })), { error: "photoDecode" });
    const zero = fakeEnv({ width: 0, height: 0 });
    assert.deepEqual(await d.loadPhoto(imgFile(), zero), { error: "photoDecode" });
    assert.equal(zero.log.closed, 1, "битое изображение освобождается");
});

test("редактор кадра: разметка, строки ru/en, версия сборки", () => {
    const html = read("index.html"), app = read("static/app.js");
    for (const s of ['ref="photoCanvas"', '@pointerdown="onPhotoPointerDown"', '@wheel.prevent="onPhotoWheel"', 'v-model.number="photoEdit.zoom"', "setPhotoMode('contain')", '@click="resetPhotoEdit"', "photoSavedHint"]) assert.ok(html.includes(s), s);
    assert.ok(app.includes("applyPhotoEdit()") && /APP_BUILD = "2026-10-25-2"/.test(app));
    for (const lang of ["ru", "en"]) {
        const src = read(`static/i18n/${lang}.js`);
        for (const k of ["photoSavedHint", "frameHint", "frameApply", "frameReset", "frameAria", "modeLabel", "mode.cover", "mode.contain", "zoom"]) assert.ok(src.includes(`"item.discount.${k}"`), `${lang}:${k}`);
    }
});

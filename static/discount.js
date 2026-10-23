// Дисконтные карты: выбор формата штрихкода, проверка номера, служебные доп. поля, цвет карточки, сжатие фото. Чистые функции без DOM: тесты в tests/discount.test.mjs (node --test).
// Схема записи как у банковской карты: номер — username, формат и срок — доп. поля с постоянными (не переводимыми) метками.
// Ошибка возвращается кодом (discount.err.*), текст собирает интерфейс.
(function (root) {
    "use strict";

    const FORMATS = ["auto", "ean13", "ean8", "code128", "code39", "qr"];
    const FORMAT_FIELD = "barcodeFormat";
    const EXPIRY_FIELD = "validUntil";
    const COLOR_FIELD = "cardColor";
    const PHOTO_FIELD = "cardPhoto";
    const PHOTO_MAX_SIDE = 800;
    const PHOTO_MAX_CHARS = 150000;          // data URL ≈ 112 КБ JPEG; вместе с остальными полями запись остаётся в лимите 190 000 байт открытого текста
    const PHOTO_MAX_INPUT_BYTES = 40 * 1024 * 1024;
    const PHOTO_PREFIX = "data:image/jpeg;base64,";
    const PHOTO_QUALITIES = [0.82, 0.72, 0.62, 0.52, 0.42, 0.32];
    // Палитры карточки: белый текст читается на обоих концах градиента (контраст ≥ 4.5, проверяется тестом)
    const PALETTES = [
        { id: "blue", from: "#2f5fd0", to: "#142a63" },
        { id: "emerald", from: "#0c6e53", to: "#0a3d33" },
        { id: "crimson", from: "#c0283f", to: "#5e1223" },
        { id: "violet", from: "#6d3fd1", to: "#2e1a63" },
        { id: "amber", from: "#a24a0c", to: "#5a2608" },
        { id: "teal", from: "#0c6a85", to: "#0b3b4d" },
        { id: "magenta", from: "#a8267f", to: "#4d1038" },
        { id: "slate", from: "#3f4f6b", to: "#171f33" },
        { id: "indigo", from: "#3b3fb5", to: "#1a1c5c" },
        { id: "olive", from: "#456e0d", to: "#233a07" }
    ];
    const MAX_LINEAR = 80;   // длиннее линейный штрихкод на экране телефона уже не читается
    const MAX_QR_BYTES = 500;

    function normalizeFormat(v) {
        const s = String(v || "").toLowerCase().replace(/[\s_-]/g, "");
        return FORMATS.includes(s) ? s : "auto";
    }

    // «4600 1234-5678» → «460012345678»: пробелы и дефисы убираются только у чисто цифровых номеров
    function compactNumber(raw) {
        const s = String(raw || "").trim();
        return /^[\d\s-]+$/.test(s) ? s.replace(/[\s-]/g, "") : s;
    }

    // Контрольная цифра EAN-8/EAN-13: веса 3 и 1 справа налево (без последней цифры)
    function eanCheckDigit(body) {
        let sum = 0;
        for (let i = 0; i < body.length; i++) {
            const d = body.charCodeAt(body.length - 1 - i) - 48;
            sum += i % 2 === 0 ? d * 3 : d;
        }
        return String((10 - (sum % 10)) % 10);
    }
    function eanValid(digits) {
        return /^\d+$/.test(digits) && eanCheckDigit(digits.slice(0, -1)) === digits.slice(-1);
    }

    function utf8Length(s) { return new TextEncoder().encode(s).length; }

    function checkEan(value, len) {
        if (!/^\d+$/.test(value)) return { error: "eanDigitsOnly" };
        if (value.length === len - 1) return { value: value + eanCheckDigit(value) };
        if (value.length !== len) return { error: "eanLength", params: { n: len } };
        if (!eanValid(value)) return { error: "eanChecksum" };
        return { value };
    }

    // number + выбранный формат → { format, value } для отрисовки или { format, error, params }.
    // Авто: 13 цифр с верной контрольной цифрой — EAN-13, 8 цифр — EAN-8, иначе Code 128.
    function resolveCode(number, format) {
        const f = normalizeFormat(format);
        const value = compactNumber(number);
        if (!value) return { format: f === "auto" ? "code128" : f, error: "empty" };
        let r;
        if (f === "auto") {
            if (/^\d{13}$/.test(value) && eanValid(value)) return { format: "ean13", value };
            if (/^\d{8}$/.test(value) && eanValid(value)) return { format: "ean8", value };
            return resolveCode(value, "code128");
        }
        if (f === "ean13") r = checkEan(value, 13);
        else if (f === "ean8") r = checkEan(value, 8);
        else if (f === "code128") {
            if (!/^[\x20-\x7E]+$/.test(value)) r = { error: "code128Chars" };
            else if (value.length > MAX_LINEAR) r = { error: "tooLong", params: { max: MAX_LINEAR } };
            else r = { value };
        } else if (f === "code39") {
            const v = value.toUpperCase();
            if (!/^[0-9A-Z\-. $/+%]+$/.test(v)) r = { error: "code39Chars" };
            else if (v.length > MAX_LINEAR) r = { error: "tooLong", params: { max: MAX_LINEAR } };
            else r = { value: v };
        } else {
            r = utf8Length(value) > MAX_QR_BYTES ? { error: "tooLong", params: { max: MAX_QR_BYTES } } : { value };
        }
        return { format: f, ...r };
    }

    // FNV-1a от названия без регистра: стабильный индекс палитры
    function defaultColorId(title) {
        let h = 0x811c9dc5;
        const s = String(title || "").trim().toLowerCase();
        for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
        return PALETTES[h % PALETTES.length].id;
    }
    // Явный выбор (если он есть в палитре) или цвет из хэша названия
    function paletteFor(title, colorId) {
        const id = String(colorId || "");
        return PALETTES.find((p) => p.id === id) || PALETTES.find((p) => p.id === defaultColorId(title));
    }
    function cardBackground(palette) { return "linear-gradient(135deg, " + palette.from + " 0%, " + palette.to + " 100%)"; }

    // В <img> попадает только JPEG data URL нужного размера: чужие URL из синхронизации или импорта не грузятся
    function isValidPhoto(v) {
        return typeof v === "string" && v.length > PHOTO_PREFIX.length && v.length <= PHOTO_MAX_CHARS + 1000
            && v.startsWith(PHOTO_PREFIX) && /^[A-Za-z0-9+/]+={0,2}$/.test(v.slice(PHOTO_PREFIX.length));
    }

    // Доп. поля записи → { format, expiry, color, photo, rest }; служебные поля ищутся по точной метке
    function splitFields(customFields) {
        const cf = Array.isArray(customFields) ? customFields : [];
        const out = { format: "auto", expiry: "", color: "", photo: "", rest: [] };
        const seen = {};
        for (const f of cf) {
            const label = f && f.label;
            if (label === FORMAT_FIELD && !seen[label]) { seen[label] = 1; out.format = normalizeFormat(f.value); }
            else if (label === EXPIRY_FIELD && !seen[label]) { seen[label] = 1; out.expiry = String(f.value || ""); }
            else if (label === COLOR_FIELD && !seen[label]) { seen[label] = 1; out.color = PALETTES.some((p) => p.id === f.value) ? f.value : ""; }
            else if (label === PHOTO_FIELD && !seen[label]) { seen[label] = 1; out.photo = isValidPhoto(f.value) ? f.value : ""; }
            else out.rest.push(f);
        }
        return out;
    }

    // Обратная сборка: формат сохраняется всегда, остальное — только если задано
    function joinFields({ format, expiry, color, photo, rest }) {
        const own = [{ label: FORMAT_FIELD, value: normalizeFormat(format) }];
        if (String(expiry || "").trim()) own.push({ label: EXPIRY_FIELD, value: String(expiry).trim() });
        if (PALETTES.some((p) => p.id === color)) own.push({ label: COLOR_FIELD, value: color });
        if (isValidPhoto(photo)) own.push({ label: PHOTO_FIELD, value: photo });
        return own.concat(Array.isArray(rest) ? rest : []);
    }

    function isServiceField(f) { return !!f && [FORMAT_FIELD, EXPIRY_FIELD, COLOR_FIELD, PHOTO_FIELD].includes(f.label); }

    // Сжатие фото карты. env даёт доступ к DOM (в тестах подменяется):
    //   decode(file) → Promise<{ width, height, draw(ctx, w, h), close() }> (EXIF-поворот уже применён),
    //   canvas(w, h) → { getContext(), toDataURL(type, q) }.
    // Результат: { value: dataURL } или { error: код } (discount.err.*). Сеть не используется.
    async function compressPhoto(file, env) {
        if (!file || !/^image\/(?!svg)/i.test(file.type || "")) return { error: "photoNotImage" };
        if (file.size > PHOTO_MAX_INPUT_BYTES) return { error: "photoTooBig" };
        let img;
        try { img = await env.decode(file); } catch (e) { return { error: "photoDecode" }; }
        try {
            if (!(img.width > 0 && img.height > 0)) return { error: "photoDecode" };
            let scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(img.width, img.height));
            for (let attempt = 0; attempt < 4; attempt++, scale *= 0.8) {
                const w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
                let cv;
                try {
                    cv = env.canvas(w, h);
                    const ctx = cv.getContext("2d");
                    ctx.fillStyle = "#fff";   // JPEG без прозрачности: PNG с альфой не должен стать чёрным
                    ctx.fillRect(0, 0, w, h);
                    img.draw(ctx, w, h);
                } catch (e) { return { error: "photoCompress" }; }
                for (const q of PHOTO_QUALITIES) {
                    let url;
                    try { url = cv.toDataURL("image/jpeg", q); } catch (e) { return { error: "photoCompress" }; }
                    if (!url.startsWith(PHOTO_PREFIX)) return { error: "photoCompress" };   // браузер не умеет JPEG и отдал PNG
                    if (url.length <= PHOTO_MAX_CHARS) return { value: url };
                }
            }
            return { error: "photoCompress" };
        } finally {
            try { if (img.close) img.close(); } catch (e) { }
        }
    }

    const api = { FORMATS, FORMAT_FIELD, EXPIRY_FIELD, COLOR_FIELD, PHOTO_FIELD, PALETTES, PHOTO_MAX_SIDE, PHOTO_MAX_CHARS, defaultColorId, paletteFor, cardBackground, isValidPhoto, compressPhoto, normalizeFormat, compactNumber, eanCheckDigit, eanValid, resolveCode, splitFields, joinFields, isServiceField };
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    else root.FravashiDiscount = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

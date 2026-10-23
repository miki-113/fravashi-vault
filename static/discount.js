// Дисконтные карты: выбор формата штрихкода, проверка номера, служебные доп. поля. Чистые функции без DOM: тесты в tests/discount.test.mjs (node --test).
// Схема записи как у банковской карты: номер — username, формат и срок — доп. поля с постоянными (не переводимыми) метками.
// Ошибка возвращается кодом (discount.err.*), текст собирает интерфейс.
(function (root) {
    "use strict";

    const FORMATS = ["auto", "ean13", "ean8", "code128", "code39", "qr"];
    const FORMAT_FIELD = "barcodeFormat";
    const EXPIRY_FIELD = "validUntil";
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

    // Доп. поля записи → { format, expiry, labels, rest }; служебные поля ищутся по точной метке
    function splitFields(customFields) {
        const cf = Array.isArray(customFields) ? customFields : [];
        const out = { format: "auto", expiry: "", rest: [] };
        let hasFormat = false, hasExpiry = false;
        for (const f of cf) {
            const label = f && f.label;
            if (label === FORMAT_FIELD && !hasFormat) { hasFormat = true; out.format = normalizeFormat(f.value); }
            else if (label === EXPIRY_FIELD && !hasExpiry) { hasExpiry = true; out.expiry = String(f.value || ""); }
            else out.rest.push(f);
        }
        return out;
    }

    // Обратная сборка: формат сохраняется всегда, пустой срок — нет
    function joinFields({ format, expiry, rest }) {
        const own = [{ label: FORMAT_FIELD, value: normalizeFormat(format) }];
        if (String(expiry || "").trim()) own.push({ label: EXPIRY_FIELD, value: String(expiry).trim() });
        return own.concat(Array.isArray(rest) ? rest : []);
    }

    function isServiceField(f) { return !!f && (f.label === FORMAT_FIELD || f.label === EXPIRY_FIELD); }

    const api = { FORMATS, FORMAT_FIELD, EXPIRY_FIELD, normalizeFormat, compactNumber, eanCheckDigit, eanValid, resolveCode, splitFields, joinFields, isServiceField };
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    else root.FravashiDiscount = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

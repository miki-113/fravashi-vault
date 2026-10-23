// Разбор и проверка JSON для импорта сейфа. Чистые функции без DOM: тесты в tests/import-json.test.mjs (node --test).
// Форматы: старый «Бэкап JSON» (массив записей) и новый {version: 2, exportedAt, customFolders, items}.
// Ошибка возвращается кодом: { ok: false, error: <код>, where: {item|folder, field, n}, params } — текст собирает интерфейс (import.err.*).
(function (root) {
    "use strict";

    const MAX_FILE_BYTES = 20 * 1024 * 1024;
    const MAX_ITEMS = 5000;
    const MAX_ITEM_PLAIN_BYTES = 190000; // сервер принимает шифртекст до 400 000 hex-символов (200 000 байт открытого текста)
    const ITEM_TYPES = ["login", "card", "wifi", "note", "discount"];
    const SCOPES = ["personal", "family"];
    const LIMITS = {
        title: 500, url: 2048, username: 500, password: 2048, totpSecret: 512, note: 20000, folder: 64,
        label: 200, value: 5000, photoValue: 160000   // photoValue — только для служебного поля cardPhoto (фото дисконтной карты)
    };
    const MAX_CUSTOM_FIELDS = 50, MAX_HISTORY = 20, MAX_SUBCARDS = 100, MAX_FOLDERS = 100;

    class ImportError extends Error {
        constructor(code, where, params) {
            super(code);
            this.code = code;
            this.where = where || null;
            this.params = params || {};
        }
    }

    function fail(code, where, params) { throw new ImportError(code, where, params); }

    function str(v, max, where) {
        if (v === undefined || v === null) return "";
        if (typeof v === "number" || typeof v === "boolean") v = String(v);
        if (typeof v !== "string") fail("expectedString", where);
        if (v.length > max) fail("tooLong", where, { max });
        return v;
    }

    function isObj(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }

    function list(v, max, where) {
        if (v === undefined || v === null) return [];
        if (!Array.isArray(v)) fail("expectedList", where);
        if (v.length > max) fail("tooMany", where, { max });
        return v;
    }

    function normalizeItem(raw, idx, defaultTitle) {
        const item = idx + 1;
        const w = (field, n) => (field ? { item, field, n } : { item });
        if (!isObj(raw)) fail("expectedObject", w());
        const itemType = raw.itemType === undefined || raw.itemType === null || raw.itemType === "" ? "login" : raw.itemType;
        if (!ITEM_TYPES.includes(itemType)) fail("unknownType", w(), { value: String(itemType).slice(0, 30) });
        const scope = raw.scope === undefined || raw.scope === null || raw.scope === "" ? "personal" : raw.scope;
        if (!SCOPES.includes(scope)) fail("unknownScope", w(), { value: String(scope).slice(0, 30) });

        const data = {
            itemType,
            folder: str(raw.folder, LIMITS.folder, w("folder")),
            title: str(raw.title, LIMITS.title, w("title")),
            url: str(raw.url, LIMITS.url, w("url")),
            username: str(raw.username, LIMITS.username, w("username")),
            password: str(raw.password, LIMITS.password, w("password")),
            totpSecret: str(raw.totpSecret, LIMITS.totpSecret, w("totp")),
            note: str(raw.note, LIMITS.note, w("note")),
            customFields: list(raw.customFields, MAX_CUSTOM_FIELDS, w("customFields")).map((f, i) => {
                if (!isObj(f)) fail("expectedObject", w("customField", i + 1));
                return { label: str(f.label, LIMITS.label, w("customField", i + 1)), value: str(f.value, f.label === "cardPhoto" ? LIMITS.photoValue : LIMITS.value, w("customField", i + 1)) };
            }),
            passwordHistory: list(raw.passwordHistory, MAX_HISTORY, w("passwordHistory")).map((h, i) => {
                if (!isObj(h)) fail("expectedObject", w("historyEntry", i + 1));
                const at = Number(h.changedAt);
                return { password: str(h.password, LIMITS.password, w("historyEntry", i + 1)), changedAt: Number.isFinite(at) ? Math.floor(at) : 0 };
            }),
            subCards: list(raw.subCards, MAX_SUBCARDS, w("subCards")).map((s, i) => {
                if (!isObj(s)) fail("expectedObject", w("subCard", i + 1));
                const sw = w("subCard", i + 1);
                return {
                    title: str(s.title, LIMITS.title, sw), username: str(s.username, LIMITS.username, sw),
                    password: str(s.password, LIMITS.password, sw), url: str(s.url, LIMITS.url, sw),
                    note: str(s.note, LIMITS.note, sw)
                };
            })
        };
        const hasContent = data.title || data.url || data.username || data.password || data.note || data.totpSecret ||
            data.customFields.length || data.subCards.length;
        if (!hasContent) return null; // пустая запись
        if (!data.title) data.title = defaultTitle;
        if (new TextEncoder().encode(JSON.stringify(data)).length > MAX_ITEM_PLAIN_BYTES) {
            fail("itemTooBig", w());
        }
        return { scope, is_favorite: raw.is_favorite === true, data };
    }

    function normalizeFolders(raw) {
        return list(raw, MAX_FOLDERS, { field: "folders" }).map((f, i) => {
            const w = { folder: i + 1 };
            if (!isObj(f)) fail("expectedObject", w);
            const id = str(f.id, 64, w), name = str(f.name, 64, w).trim();
            if (!/^custom_[A-Za-z0-9_-]{1,50}$/.test(id)) fail("badFolderId", w);
            if (!name) fail("emptyFolderName", w);
            const icon = typeof f.icon === "string" && /^fa-(solid|regular) fa-[a-z0-9-]{1,40}$/.test(f.icon) ? f.icon : "fa-solid fa-folder";
            const tint = typeof f.tintClass === "string" && /^[A-Za-z0-9#:\[\]\- ]{1,100}$/.test(f.tintClass) ? f.tintClass : "bg-[#b3c8ff] text-[#2c437e]";
            return { id, name, icon, tintClass: tint };
        });
    }

    // text — содержимое файла, size — размер файла в байтах (если известен),
    // opts.defaultTitle — название для записей без названия (на языке интерфейса)
    function parseVaultJson(text, size, opts) {
        const defaultTitle = (opts && typeof opts.defaultTitle === "string" && opts.defaultTitle) || "Import";
        try {
            if (typeof size === "number" && size > MAX_FILE_BYTES) fail("fileTooBig", null, { mb: MAX_FILE_BYTES / 1024 / 1024 });
            if (typeof text !== "string" || text.length === 0) fail("emptyFile");
            let doc;
            try { doc = JSON.parse(text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text); }
            catch (e) { fail("notJson"); }

            let rawItems, rawFolders = [], format;
            if (Array.isArray(doc)) { format = "legacy"; rawItems = doc; }
            else if (isObj(doc) && doc.version === 2) { format = "v2"; rawItems = doc.items; rawFolders = doc.customFolders; }
            else if (isObj(doc) && doc.version !== undefined) fail("unsupportedVersion", null, { value: String(doc.version).slice(0, 20) });
            else fail("unknownFormat");

            if (!Array.isArray(rawItems)) fail("noItems");
            if (rawItems.length > MAX_ITEMS) fail("tooManyItems", null, { max: MAX_ITEMS });

            const customFolders = normalizeFolders(rawFolders);
            const items = [];
            let skipped = 0;
            rawItems.forEach((r, i) => {
                let it;
                try { it = normalizeItem(r, i, defaultTitle); }
                catch (e) {
                    if (e instanceof ImportError && isObj(r) && typeof r.title === "string") e.itemTitle = r.title.slice(0, 60);
                    throw e;
                }
                if (it) items.push(it); else skipped++;
            });
            return { ok: true, format, items, customFolders, skipped, stats: summarize(items) };
        } catch (e) {
            if (e instanceof ImportError) return { ok: false, error: e.code, where: e.where, params: e.params, itemTitle: e.itemTitle };
            throw e;
        }
    }

    function summarize(items) {
        const s = { total: items.length, personal: 0, family: 0, login: 0, card: 0, wifi: 0, note: 0, discount: 0, multi: 0, favorites: 0 };
        for (const it of items) {
            s[it.scope]++;
            s[it.data.itemType]++;
            if (it.data.subCards.length) s.multi++;
            if (it.is_favorite) s.favorites++;
        }
        return s;
    }

    const api = { parseVaultJson, summarize, MAX_FILE_BYTES, MAX_ITEMS };
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    else root.FravashiImport = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

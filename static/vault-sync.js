// Загрузка списка записей сейфа. Чистые функции без DOM: тесты в tests/vault-sync.test.mjs (node --test).
// Правило: при наличии сети источник истины — сервер; офлайн-копия (localStorage offline_vault_*) — только резерв при ошибке сети или сервера.
(function (root) {
    "use strict";

    // Раз в столько миллисекунд открытое окно перечитывает список с сервера
    const AUTO_REFRESH_MS = 3 * 60 * 1000;

    function readCachedItems(cache) {
        try {
            const raw = cache.read();
            const items = raw ? JSON.parse(raw) : [];
            return Array.isArray(items) ? items : [];
        } catch (e) { return []; }
    }

    // Результат: { source: "server" | "cache" | "unauthorized", items }
    //   server       — свежий список с сервера, офлайн-копия перезаписана;
    //   cache        — сервер недоступен (сеть или 5xx), отдана офлайн-копия;
    //   unauthorized — сессия недействительна (401), список не трогать, нужен выход.
    async function fetchVaultItems({ fetchFn, token, cache }) {
        let res;
        try {
            res = await fetchFn("/api/vault", { headers: { "Authorization": `Bearer ${token}` }, cache: "no-store" });
        } catch (e) {
            return { source: "cache", items: readCachedItems(cache) };
        }
        if (res.status === 401) return { source: "unauthorized", items: [] };
        if (!res.ok) return { source: "cache", items: readCachedItems(cache) };
        let data;
        try { data = await res.json(); } catch (e) { return { source: "cache", items: readCachedItems(cache) }; }
        const items = Array.isArray(data?.items) ? data.items : [];
        try { cache.write(JSON.stringify(items)); } catch (e) {}
        return { source: "server", items };
    }

    // Признак корзины берётся из записи сервера (или из офлайн-копии его ответа), без локальных списков вкладки.
    function isItemTrashed(rawItem, decrypted) {
        return Boolean(rawItem?.is_trashed) || Boolean(decrypted?._trashed);
    }

    const api = { fetchVaultItems, readCachedItems, isItemTrashed, AUTO_REFRESH_MS };
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    else root.FravashiSync = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

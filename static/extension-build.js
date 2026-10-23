// Сборка браузерного расширения (Manifest V3): файлы архива fravashi-extension.zip. Тесты: tests/extension.test.mjs.
// Код окна расширения написан обычными функциями, в popup.js попадает их исходный текст (Function.prototype.toString):
// они не должны ссылаться ни на что вне popup.js. Функции *InPage выполняются во вкладке через chrome.scripting.executeScript
// и должны быть полностью самодостаточными (Chrome передаёт во вкладку только их текст и аргументы).
// legacy-идентификаторы протокола ("aegis-v2-enc", "aegis-v2-auth") не переименовывать: сломает существующие сейфы.
(function (root) {
    "use strict";

    const EXT_VERSION = "1.3.0";
    const DICT_PREFIX = "extension.popup.";

    // ---- Чистые функции (используются и приложением, и расширением) ----

    // Срок и владелец карты лежат в доп. полях записи; регулярки ищут подписи полей на обоих языках
    function cardExtra(data) {
        const cf = Array.isArray(data && data.customFields) ? data.customFields : [];
        const find = (re) => (cf.find((f) => re.test(String(f.label || "").toLowerCase())) || {}).value || "";
        return {
            expiry: find(/срок|valid|expir|mm\/yy|мм\/гг/), // i18n-ignore
            holder: find(/владел|holder|держател|имя|name/) // i18n-ignore
        };
    }

    // «07/27», «7/2027», «07-27», «07.2027» → { month: "07", year: "2027" }; иначе null
    function parseExpiry(s) {
        const m = String(s || "").trim().match(/^(\d{1,2})\s*[\/.-]\s*(\d{2}|\d{4})$/);
        if (!m) return null;
        const mo = Number(m[1]);
        if (mo < 1 || mo > 12) return null;
        return { month: String(mo).padStart(2, "0"), year: m[2].length === 2 ? "20" + m[2] : m[2] };
    }

    // Тип поля карты по атрибутам input: number | exp | expMonth | expYear | name | csc | "" (не поле карты)
    function classifyField(a) {
        const type = String(a.type || "text").toLowerCase();
        if (!["text", "tel", "number", "password", "search"].includes(type)) return "";
        const AC = { "cc-number": "number", "cc-exp": "exp", "cc-exp-month": "expMonth", "cc-exp-year": "expYear", "cc-name": "name", "cc-csc": "csc" };
        const tokens = String(a.autocomplete || "").toLowerCase().split(/\s+/).filter(Boolean);
        for (const tk of tokens) if (AC[tk]) return AC[tk];
        // Поле явно помечено как не карточное: логин, пароль, почта, адрес
        const OTHER = ["username", "email", "current-password", "one-time-code", "tel", "street-address", "postal-code", "address-line1", "address-line2", "organization"];
        if (tokens.some((tk) => OTHER.includes(tk))) return "";
        const s = [a.name, a.id, a.placeholder, a.ariaLabel].map((x) => String(x || "").toLowerCase()).join(" | ");
        if (!s.replace(/[\s|]/g, "")) return "";
        const RULES = [
            ["csc", /cvv|cvc|csc|cvn|security.?code|card.?code|код.{0,8}(безопасн|провер)/], // i18n-ignore
            ["exp", /(mm|мм)\s*[\/.-]\s*(yy|гг)/], // i18n-ignore
            ["expMonth", /month|(^|[^a-z])mm($|[^a-z])|месяц|(^|[^а-яё])мм($|[^а-яё])/], // i18n-ignore
            ["expYear", /year|(^|[^a-z])yy(yy)?($|[^a-z])|(^|[^а-яё])(год|гг|гггг)($|[^а-яё])/], // i18n-ignore
            ["exp", /expir|exp.?date|valid.?(thru|until|till)|validity|cc.?exp|срок|действ|годен/], // i18n-ignore
            ["name", /holder|name.?on.?card|card.?name|cc.?name|владел|держател|имя.{0,12}карт/], // i18n-ignore
            ["number", /card.?(num|no)|cc.?num|(^|[^a-z])pan($|[^a-z])|номер.{0,12}карт|\d{4}[ -]?\d{4}[ -]?\d{4}/] // i18n-ignore
        ];
        for (const [kind, re] of RULES) if (re.test(s)) return kind;
        return "";
    }

    // Значение для поля срока: формат подбирается по placeholder и maxlength поля
    function expiryValue(kind, exp, a) {
        const ph = String(a.placeholder || "").toLowerCase();
        const max = Number(a.maxLength) || 0;
        const yy = exp.year.slice(-2);
        const longYear = /yyyy|гггг/.test(ph); // i18n-ignore
        if (kind === "expMonth") return exp.month;
        if (kind === "expYear") return longYear || !(/yy|гг/.test(ph) || (max > 0 && max < 4)) ? exp.year : yy; // i18n-ignore
        if (longYear) return exp.month + "/" + exp.year;
        if (max === 4) return exp.month + yy;
        return exp.month + "/" + yy;
    }

    // ---- Функции, выполняемые во вкладке (executeScript) ----

    function fillLoginInPage(host, username, password) {
        if (!host || location.hostname.toLowerCase() !== host) return { status: "host_changed" };
        const set = (el, val) => {
            el.focus();
            const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            if (s) s.call(el, val); else el.value = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
        };
        const p = Array.from(document.querySelectorAll('input[type="password"]')).filter((e) => e.offsetParent !== null);
        if (!p.length) return { status: "no_fields" };
        set(p[0], password);
        const f = p[0].closest("form") || document.body;
        const u = Array.from(f.querySelectorAll('input[type="text"],input[type="email"],input[type="tel"],input:not([type])')).filter((e) => e.offsetParent !== null && !e.readOnly);
        if (u.length) set(u[u.length - 1], username);
        return { status: "ok" };
    }

    // CLASSIFY_FIELD и EXPIRY_VALUE заменяются при сборке текстом classifyField и expiryValue
    function fillCardInPage(host, card) {
        const classifyField = CLASSIFY_FIELD;
        const expiryValue = EXPIRY_VALUE;
        if (!host || location.hostname.toLowerCase() !== host) return { status: "host_changed" };
        const set = (el, val) => {
            el.focus();
            const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            if (s) s.call(el, val); else el.value = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
        };
        // Только видимые поля самой страницы: вложенные платёжные формы (iframe) не трогаем
        const found = {};
        for (const el of Array.from(document.querySelectorAll("input"))) {
            if (el.offsetParent === null || el.disabled || el.readOnly) continue;
            const kind = classifyField({
                type: el.type, autocomplete: el.getAttribute("autocomplete"), name: el.name, id: el.id,
                placeholder: el.placeholder, ariaLabel: el.getAttribute("aria-label")
            });
            if (kind && !found[kind]) found[kind] = el;
        }
        if (!found.number) return { status: "no_fields" };
        set(found.number, card.number);
        if (found.name && card.holder) set(found.name, card.holder);
        if (card.exp) {
            const kinds = found.exp ? ["exp"] : ["expMonth", "expYear"];
            for (const k of kinds) if (found[k]) set(found[k], expiryValue(k, card.exp, { placeholder: found[k].placeholder, maxLength: found[k].maxLength }));
        }
        if (found.csc && card.cvc) set(found.csc, card.cvc);
        return { status: "ok", expiry: !!card.exp, cvcMissing: !!card.cvc && !found.csc };
    }

    // ---- Окно расширения ----

    function pickLang() {
        if (CFG.dicts[CFG.lang]) return CFG.lang;
        const n = String((typeof navigator !== "undefined" && navigator.language) || "").toLowerCase();
        return n.startsWith("ru") ? "ru" : "en";
    }
    function tr(k, p) {
        let s = CFG.dicts[LANG][k] || CFG.dicts.en[k] || k;
        for (const [a, b] of Object.entries(p || {})) s = s.split("{" + a + "}").join(b);
        return s;
    }
    function $(id) { return document.getElementById(id); }
    function hostOf(u) {
        try {
            const s = String(u || "").trim();
            if (!s) return "";
            return new URL(s.includes("://") ? s : "https://" + s).hostname.toLowerCase().replace(/^www[.]/, "");
        } catch (e) { return ""; }
    }
    function hostMatches(tab, saved) { return saved.includes(".") && (tab === saved || tab.endsWith("." + saved)); }
    function tabHost(tab) {
        try {
            const u = new URL(tab.url || "");
            if (u.protocol === "http:" || u.protocol === "https:") return u.hostname.toLowerCase();
        } catch (e) {}
        return "";
    }
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
    function msg(t) {
        const b = $("statusBox");
        b.textContent = t;
        b.style.display = "block";
        setTimeout(() => (b.style.display = "none"), 3500);
    }
    function hideDialogs() {
        $("confirmBox").classList.add("hidden");
        $("cardBox").classList.add("hidden");
        $("cardCvv").checked = false;
    }
    function ask(text, onYes) {
        hideDialogs();
        $("confirmText").textContent = text;
        $("confirmBox").classList.remove("hidden");
        $("btnConfirmYes").onclick = () => { hideDialogs(); onYes(); };
        $("btnConfirmNo").onclick = hideDialogs;
    }
    // Активная вкладка доступна по activeTab: пользователь открыл окно расширения на этой вкладке
    async function currentTab() {
        const t = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = t && t[0];
        const host = tab ? tabHost(tab) : "";
        if (!host) { msg(tr("noTab")); return null; }
        return { id: tab.id, host };
    }
    async function runInTab(tabId, func, args) {
        try {
            const r = await chrome.scripting.executeScript({ target: { tabId }, func, args });
            return (r && r[0] && r[0].result) || { status: "inject_failed" };
        } catch (e) { return { status: "inject_failed" }; }
    }
    function report(r, okKey, noFieldsKey) {
        if (r.status === "ok") return msg(tr(r.cvcMissing ? "cardFilledNoCvv" : okKey));
        msg(tr(r.status === "no_fields" ? noFieldsKey : r.status === "host_changed" ? "hostChanged" : "injectFailed"));
    }
    async function fill(it) {
        const tab = await currentTab();
        if (!tab) return;
        const send = async () => report(await runInTab(tab.id, fillLoginInPage, [tab.host, it.username, it.password]), "filled", "noLoginFields");
        const sh = hostOf(it.url);
        if (hostMatches(tab.host.replace(/^www[.]/, ""), sh)) return send();
        ask(tr(sh ? "mismatch" : "noUrl", { site: tab.host, saved: sh }), send);
    }
    // Карта: заполнение только после подтверждения в окне расширения, CVV — только с отмеченной галочкой
    async function askCard(it) {
        const tab = await currentTab();
        if (!tab) return;
        if (!it.number) return msg(tr("cardNoNumber"));
        hideDialogs();
        $("cardText").textContent = tr("cardConfirm", { title: it.title || "—", last4: it.number.slice(-4), site: tab.host });
        $("cardCvvRow").classList[it.cvc ? "remove" : "add"]("hidden");
        $("cardBox").classList.remove("hidden");
        $("btnCardNo").onclick = hideDialogs;
        $("btnCardYes").onclick = async () => {
            const withCvv = !!$("cardCvv").checked;
            hideDialogs();
            let card = { number: it.number, holder: it.holder, exp: parseExpiry(it.expiry), cvc: withCvv ? it.cvc : "" };
            const r = await runInTab(tab.id, fillCardInPage, [tab.host, card]);
            card = null;
            report(r, "cardFilled", "cardNotFound");
        };
    }

    // Изменяемое состояние окна (state, pend) объявляется в начале popup.js при сборке
    function bytesToHex(b) { return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join(""); }
    function hexToBytes(h) {
        const c = (h || "").trim(), b = new Uint8Array(Math.floor(c.length / 2));
        for (let i = 0; i < b.length * 2; i += 2) b[i / 2] = parseInt(c.substring(i, i + 2), 16);
        return b;
    }
    async function derive(p, s) {
        const e = new TextEncoder(), c = crypto.subtle, m = await c.importKey("raw", e.encode(p), { name: "PBKDF2" }, false, ["deriveBits"]);
        const mb = await c.deriveBits({ name: "PBKDF2", salt: s, iterations: 600000, hash: "SHA-256" }, m, 256);
        const h = await c.importKey("raw", mb, "HKDF", false, ["deriveBits"]);
        const x = async (i) => new Uint8Array(await c.deriveBits({ name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: e.encode(i) }, h, 256));
        const eb = await x("aegis-v2-enc"), ab = await x("aegis-v2-auth");
        const k = await c.importKey("raw", eb, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
        eb.fill(0);
        return { encKey: k, authHash: bytesToHex(ab) };
    }
    async function dec(k, c, iv) {
        try {
            const d = await crypto.subtle.decrypt({ name: "AES-GCM", iv: hexToBytes(iv) }, k, hexToBytes(c));
            return JSON.parse(new TextDecoder().decode(d));
        } catch (e) { return null; }
    }
    function toItem(o) {
        if (o.itemType === "card") {
            const ex = cardExtra(o);
            return { kind: "card", title: o.title || "", number: String(o.username || "").replace(/\D/g, ""), cvc: String(o.password || ""), holder: ex.holder, expiry: ex.expiry };
        }
        return { kind: "login", title: o.title || tr("untitled"), username: o.username || "", password: o.password || "", url: o.url || "" };
    }
    async function loadVault() {
        const r = await fetch(CFG.srv + "/api/vault", { headers: { "Authorization": "Bearer " + state.token } });
        const d = await r.json();
        const vk = await crypto.subtle.importKey("raw", hexToBytes(state.vaultKeyHex), { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
        const list = [];
        for (const it of (d.items || [])) {
            if (it.is_trashed) continue;
            const o = await dec(vk, it.ciphertext, it.iv);
            if (o && !o._trashed && o.itemType !== "note") list.push(toItem(o));
        }
        state.items = list;
        render();
    }
    function render() {
        const q = ($("searchBox").value || "").toLowerCase(), box = $("itemsList");
        box.innerHTML = "";
        state.items.filter((x) => x.title.toLowerCase().includes(q) || (x.kind === "login" && x.username.toLowerCase().includes(q))).slice(0, 50).forEach((it) => {
            const el = document.createElement("div");
            el.className = "item-card";
            const sub = it.kind === "card" ? (it.number ? "•••• " + it.number.slice(-4) : "—") : (it.username || "—");
            const btns = it.kind === "card"
                ? '<button class="btn btn-primary" style="flex:1;">' + esc(tr("fillCard")) + "</button>"
                : '<button class="btn btn-primary" style="flex:1;">' + esc(tr("fill")) + '</button><button class="btn">' + esc(tr("copyPassword")) + "</button>";
            el.innerHTML = '<div style="font-weight:700;font-size:13px;">' + esc(it.title || "—") + '</div><div style="font-size:11.5px;color:#94a3b8;">' + esc(sub) + '</div><div style="display:flex;gap:6px;">' + btns + "</div>";
            const b = el.querySelectorAll("button");
            if (it.kind === "card") b[0].onclick = () => askCard(it);
            else {
                b[0].onclick = () => fill(it);
                b[1].onclick = () => { navigator.clipboard.writeText(it.password); msg(tr("passwordCopied")); };
            }
            box.appendChild(el);
        });
    }
    function resetTotp() {
        pend = null;
        $("totpBox").classList.add("hidden");
        $("totpCode").value = "";
    }
    async function openVault(ld, encKey) {
        const eo = JSON.parse(ld.encrypted_vault_key);
        const vo = await dec(encKey, eo.ciphertext, eo.iv);
        state.token = ld.token;
        state.vaultKeyHex = vo.rawKey;
        resetTotp();
        await loadVault();
        $("loginView").classList.add("hidden");
        $("vaultView").classList.remove("hidden");
        $("btnLock").classList.remove("hidden");
    }
    function init() {
        if (document.documentElement) document.documentElement.lang = LANG;
        for (const e of Array.from(document.querySelectorAll("[data-i18n]"))) e.textContent = tr(e.getAttribute("data-i18n"));
        for (const e of Array.from(document.querySelectorAll("[data-i18n-ph]"))) e.placeholder = tr(e.getAttribute("data-i18n-ph"));
        $("serverUrl").value = CFG.srv;
        $("searchBox").oninput = render;
        $("btnLock").onclick = () => {
            hideDialogs();
            state = { token: null, vaultKeyHex: null, items: [] };
            $("itemsList").innerHTML = "";
            $("vaultView").classList.add("hidden");
            $("loginView").classList.remove("hidden");
            $("btnLock").classList.add("hidden");
            resetTotp();
        };
        $("btnUnlock").onclick = async () => {
            try {
                const u = $("username").value.trim().toLowerCase(), p = $("password").value;
                const sr = await fetch(CFG.srv + "/api/auth/params/" + encodeURIComponent(u));
                const sd = await sr.json();
                const { encKey, authHash } = await derive(p, hexToBytes(sd.kdf_salt));
                const lr = await fetch(CFG.srv + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: u, client_auth_hash: authHash }) });
                if (!lr.ok) throw new Error(tr("wrongPassword"));
                const ld = await lr.json();
                $("password").value = "";
                if (ld.totp_required) {
                    pend = { encKey, challenge: ld.challenge };
                    $("totpCode").value = "";
                    $("totpBox").classList.remove("hidden");
                    msg(tr("enterTotp"));
                    return;
                }
                await openVault(ld, encKey);
            } catch (e) { msg(e.message || tr("loginFailed")); }
        };
        $("btnTotp").onclick = async () => {
            try {
                if (!pend) throw new Error(tr("passwordFirst"));
                const r = await fetch(CFG.srv + "/api/auth/login/totp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challenge: pend.challenge, code: $("totpCode").value.trim() }) });
                if (!r.ok) {
                    let d = {};
                    try { d = await r.json(); } catch (x) {}
                    if (d.detail === "totp_challenge_expired") { resetTotp(); throw new Error(tr("totpExpired")); }
                    throw new Error(tr(d.detail === "too_many_attempts" ? "tooManyAttempts" : "wrongCode"));
                }
                const ld = await r.json();
                await openVault(ld, pend.encKey);
            } catch (e) { msg(e.message || tr("loginFailed")); }
        };
    }

    const POPUP_FUNCS = [pickLang, tr, $, hostOf, hostMatches, tabHost, esc, msg, hideDialogs, ask, currentTab, runInTab, report, fill,
        askCard, cardExtra, parseExpiry, bytesToHex, hexToBytes, derive, dec, toItem, loadVault, render, resetTotp, openVault, init];

    const POPUP_CSS = "*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;}body{width:350px;min-height:440px;max-height:560px;background:#17223a;color:#f1f5f9;display:flex;flex-direction:column;overflow:hidden;}.header{padding:12px 14px;background:#1d315b;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;font-weight:800;font-size:15px;}.container{padding:14px;flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;}input{width:100%;padding:9px 11px;border-radius:8px;border:1px solid #364768;background:#202d49;color:#f8fafc;font-size:13px;outline:none;}input[readonly]{opacity:0.6;}.btn{cursor:pointer;padding:8px 12px;border-radius:8px;border:1px solid #364768;background:#202d49;color:#f8fafc;font-weight:600;font-size:12px;}.btn-primary{background:#315bd7;border-color:transparent;color:#fff;}.item-card{background:#202d49;border:1px solid #364768;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px;}.dialog{margin:10px 14px 0;padding:10px;border-radius:10px;font-size:12px;display:flex;flex-direction:column;gap:8px;}.warn{border:1px solid #f59e0b;background:#3a2a10;color:#fde68a;}.info{border:1px solid #315bd7;background:#1d315b;color:#e2e8f0;}.row{display:flex;gap:6px;}.check{display:flex;align-items:center;gap:6px;}.check input{width:auto;}.hidden{display:none!important;}";

    const POPUP_HTML = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FravashiVault</title><style>' + POPUP_CSS + '</style></head><body>'
        + '<div class="header"><span>FravashiVault</span><button id="btnLock" class="btn hidden" style="padding:4px 8px;color:#fb7185;" data-i18n="lock"></button></div>'
        + '<div id="statusBox" style="padding:6px 10px;font-size:12px;text-align:center;display:none;"></div>'
        + '<div id="confirmBox" class="dialog warn hidden"><div id="confirmText"></div><div class="row"><button id="btnConfirmNo" class="btn btn-primary" style="flex:1;" data-i18n="cancel"></button><button id="btnConfirmYes" class="btn" style="flex:1;color:#fb7185;" data-i18n="fillAnyway"></button></div></div>'
        + '<div id="cardBox" class="dialog info hidden"><div id="cardText"></div><label id="cardCvvRow" class="check"><input id="cardCvv" type="checkbox"><span data-i18n="fillCvv"></span></label><div class="row"><button id="btnCardNo" class="btn" style="flex:1;" data-i18n="cancel"></button><button id="btnCardYes" class="btn btn-primary" style="flex:1;" data-i18n="fillCardConfirm"></button></div></div>'
        + '<div id="loginView" class="container"><input id="serverUrl" type="text" readonly><input id="username" type="text" data-i18n-ph="username"><input id="password" type="password" data-i18n-ph="masterPassword"><button id="btnUnlock" class="btn btn-primary" style="width:100%;padding:10px;" data-i18n="unlock"></button>'
        + '<div id="totpBox" class="hidden" style="margin-top:10px;"><input id="totpCode" type="text" autocomplete="one-time-code" data-i18n-ph="totpPlaceholder"><button id="btnTotp" class="btn btn-primary" style="width:100%;padding:10px;margin-top:8px;" data-i18n="totpConfirm"></button></div></div>'
        + '<div id="vaultView" class="container hidden"><input id="searchBox" type="text" data-i18n-ph="search"><div id="itemsList" style="display:flex;flex-direction:column;gap:8px;"></div></div>'
        + '<script src="popup.js"></script></body></html>';

    // Права: окно расширения ходит только на сервер, с которого скачан архив; вкладка — только по нажатию (activeTab)
    function hostPattern(origin) {
        const u = new URL(origin);
        return u.protocol + "//" + u.hostname + "/*";
    }

    // Словарь окна расширения: ключи extension.popup.* из словаря приложения, без префикса
    function popupDict(d) {
        const out = {};
        for (const [k, v] of Object.entries(d || {})) if (k.startsWith(DICT_PREFIX)) out[k.slice(DICT_PREFIX.length)] = v;
        return out;
    }

    // origin — адрес сервера, lang — язык приложения при скачивании, dicts — { ru: {...}, en: {...} } словари приложения
    function buildExtensionFiles({ origin, lang, dicts }) {
        const ext = { ru: popupDict(dicts.ru), en: popupDict(dicts.en) };
        const cfg = { srv: origin, lang, dicts: ext };
        const pageFill = fillCardInPage.toString()
            .replace("CLASSIFY_FIELD", () => classifyField.toString())
            .replace("EXPIRY_VALUE", () => expiryValue.toString());
        const popupJs = '"use strict";\nconst CFG = ' + JSON.stringify(cfg) + ";\n"
            + "let state = { token: null, vaultKeyHex: null, items: [] };\nlet pend = null;\n"
            + POPUP_FUNCS.map((f) => f.toString()).join("\n")
            + "\n" + fillLoginInPage.toString() + "\n" + pageFill
            + "\nconst LANG = pickLang();\ndocument.addEventListener(\"DOMContentLoaded\", init);\n";
        const manifest = {
            manifest_version: 3,
            name: "__MSG_extName__",
            version: EXT_VERSION,
            description: "__MSG_extDesc__",
            default_locale: ext[lang] ? lang : "en",
            permissions: ["activeTab", "scripting"],
            host_permissions: [hostPattern(origin)],
            action: { default_popup: "popup.html", default_title: "FravashiVault" }
        };
        const files = {
            "manifest.json": JSON.stringify(manifest, null, 2),
            "popup.html": POPUP_HTML,
            "popup.js": popupJs
        };
        for (const l of ["ru", "en"]) {
            files["_locales/" + l + "/messages.json"] = JSON.stringify({
                extName: { message: ext[l].extName }, extDesc: { message: ext[l].extDesc }
            }, null, 2);
        }
        return files;
    }

    const api = { EXT_VERSION, DICT_PREFIX, buildExtensionFiles, cardExtra, parseExpiry, classifyField, expiryValue, hostPattern };
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    else root.FravashiExtension = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

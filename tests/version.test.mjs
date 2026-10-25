import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('APP_VERSION в static/app.js совпадает с версией в Cargo.toml и Cargo.lock', () => {
    const appVersion = /const APP_VERSION = "(\d+\.\d+\.\d+)";/.exec(read('static/app.js'))?.[1];
    assert.ok(appVersion, 'APP_VERSION не найден');
    const cargo = /\[package\][^[]*?\nversion = "([^"]+)"/.exec(read('Cargo.toml'))?.[1];
    assert.equal(appVersion, cargo, 'поднимите Cargo.toml и APP_VERSION вместе');
    const lock = /name = "fravashi"\r?\nversion = "([^"]+)"/.exec(read('Cargo.lock'))?.[1];
    assert.equal(lock, cargo, 'Cargo.lock не совпадает с Cargo.toml');
});

test('версия показана в интерфейсе, строки есть в ru и en', () => {
    assert.ok(read('index.html').includes("t('settings.version', { version: APP_VERSION, build: APP_BUILD })"));
    for (const lang of ['ru', 'en']) {
        const src = read(`static/i18n/${lang}.js`);
        assert.ok(/"settings\.version": ".*\{version\}.*\{build\}/.test(src), lang);
    }
});

test('/api/status не раскрывает версию', () => {
    const main = read('main.rs');
    assert.ok(!/CARGO_PKG_VERSION/.test(main));
});

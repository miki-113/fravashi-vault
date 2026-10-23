// static/app-render.js должен соответствовать шаблону #app в index.html (пересборка: npm run build:templates).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readTemplate, templateHash, generatedHash, OUTPUT_PATH } from '../tools/template-source.mjs';

const generated = readFileSync(OUTPUT_PATH, 'utf8');

test('app-render.js собран из текущего шаблона index.html', () => {
    assert.equal(generatedHash(generated), templateHash(readTemplate()),
        'шаблон в index.html изменился: выполните npm run build:templates и закоммитьте static/app-render.js');
});

test('app-render.js совпадает с выводом компилятора (если установлен @vue/compiler-dom)', async (t) => {
    let buildRenderModule;
    try {
        ({ buildRenderModule } = await import('../tools/compile-templates.mjs'));
    } catch (e) {
        if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e;
        t.skip('нет node_modules: выполните npm install');
        return;
    }
    assert.equal(generated.replace(/\r\n/g, '\n'), buildRenderModule(readTemplate()),
        'static/app-render.js изменён вручную или собран другой версией компилятора: npm run build:templates');
});

test('index.html подключает runtime-only Vue и предкомпилированный шаблон перед app.js', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    assert.ok(html.includes('/static/vendor/vue.runtime.global.prod.js'));
    assert.ok(!html.includes('vue.global.prod.js'));
    assert.ok(html.indexOf('/static/app-render.js') < html.indexOf('/static/app.js'));
});

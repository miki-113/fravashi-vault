// Предкомпиляция шаблона #app из index.html в render-функцию (static/app-render.js).
// Нужна, чтобы работать на runtime-only сборке Vue без 'unsafe-eval' в CSP.
// Запуск: npm run build:templates (после npm install). Результат коммитится в репозиторий.
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { compile } from '@vue/compiler-dom';
import { readTemplate, templateHash, OUTPUT_PATH } from './template-source.mjs';

export function buildRenderModule(template) {
    const source = template.replace(/\r\n/g, '\n');
    const errors = [];
    const { code } = compile(source, {
        mode: 'function',
        prefixIdentifiers: true,
        hoistStatic: true,
        cacheHandlers: true,
        comments: false,
        whitespace: 'condense',
        onError: (e) => errors.push(e),
        onWarn: (e) => errors.push(e),
    });
    if (errors.length) throw new Error('Ошибки компиляции шаблона:\n' + errors.map((e) => e.message).join('\n'));
    return [
        '// Сгенерировано tools/compile-templates.mjs из index.html (корень #app). Не править вручную:',
        '// после изменения разметки выполнить npm run build:templates.',
        '// template-sha256: ' + templateHash(template),
        'window.FravashiRender = (function () {',
        code.trim(),
        '})();',
        '',
    ].join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    writeFileSync(OUTPUT_PATH, buildRenderModule(readTemplate()));
    console.log('static/app-render.js обновлён');
}

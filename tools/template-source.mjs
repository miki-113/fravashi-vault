// Извлечение шаблона приложения из index.html. Без зависимостей: используется и сборкой, и тестом.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const START = '<div id="app" v-cloak>';
const END = '<!-- КОНЕЦ ЧАСТИ 1 -->';

export const INDEX_PATH = new URL('../index.html', import.meta.url);
export const OUTPUT_PATH = new URL('../static/app-render.js', import.meta.url);

// Шаблон — содержимое <div id="app">: от открывающего тега до последнего </div> перед маркером конца.
export function extractTemplate(html) {
    const start = html.indexOf(START);
    const end = html.indexOf(END);
    if (start < 0 || end < 0 || html.indexOf(START, start + 1) >= 0) throw new Error('index.html: не найден корень #app или маркер конца');
    const close = html.lastIndexOf('</div>', end);
    if (close <= start) throw new Error('index.html: не найден закрывающий </div> корня #app');
    return html.slice(start + START.length, close);
}

export function templateHash(template) {
    return createHash('sha256').update(template.replace(/\r\n/g, '\n')).digest('hex');
}

export function readTemplate() {
    return extractTemplate(readFileSync(INDEX_PATH, 'utf8'));
}

// Хэш шаблона, из которого собран static/app-render.js (строка в шапке файла).
export function generatedHash(code) {
    const m = code.match(/^\/\/ template-sha256: ([0-9a-f]{64})$/m);
    return m ? m[1] : null;
}

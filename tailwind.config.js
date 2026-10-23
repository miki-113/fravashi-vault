// Сборка static/app.css (Tailwind 3.4.17, ставить во временную папку вне проекта, не глобально):
//   node <tmp>/node_modules/tailwindcss/lib/cli.js -c tailwind.config.js -i static/input.css -o static/app.css --minify
module.exports = {
    darkMode: 'class',
    content: ['./index.html', './static/app.js'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
                mono: ['"JetBrains Mono"', 'monospace']
            }
        }
    }
};

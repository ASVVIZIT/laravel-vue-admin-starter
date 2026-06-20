/**
 * i18n Parser v3 — максимально устойчивый парсер
 * Использование: node scripts/parse_i18n.js <path_to_file.js>
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import os from 'os';

const require = createRequire(import.meta.url);
const filePath = process.argv[2];

if (!filePath) {
    console.log('[]');
    process.exit(1);
}

try {
    const fullPath = path.resolve(filePath);
    let content = fs.readFileSync(fullPath, 'utf8');

    // 🔥 ШАГ 1: Агрессивная очистка
    content = content
        // Убираем многострочные комментарии
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Убираем однострочные комментарии
        .replace(/(^|[^:"'])\/\/.*$/gm, '$1')
        // Убираем export default
        .replace(/export\s+default\s+/, '')
        // Заменяем обратные кавычки на обычные
        .replace(/`/g, '"')
        // Убираем template expressions ${...}
        .replace(/\$\{[^}]*\}/g, '')
        // Убираем trailing commas перед } и ]
        .replace(/,(\s*[}\]])/g, '$1')
        // Убираем вызовы функций t('...'), $t('...')
        .replace(/\$?t\([^)]*\)/g, '""')
        // Убираем любые вызовы функций
        .replace(/[a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\)/g, '""')
        .trim();

    // 🔥 ШАГ 2: Создаём временный .cjs файл
    const tempFile = path.join(os.tmpdir(), `i18n_${Date.now()}_${Math.random().toString(36).slice(2)}.cjs`);
    const cjsContent = `module.exports = ${content};`;

    fs.writeFileSync(tempFile, cjsContent, 'utf8');

    try {
        // 🔥 ШАГ 3: Используем require() для парсинга
        const obj = require(tempFile);

        // 🔥 ШАГ 4: Рекурсивно извлекаем ТОЛЬКО конечные строковые ключи
        function flatten(obj, prefix = '') {
            let keys = [];

            if (!obj || typeof obj !== 'object') return keys;

            for (const key in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

                const fullKey = prefix ? prefix + '.' + key : key;
                const value = obj[key];

                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    // Вложенный объект — рекурсия
                    keys = keys.concat(flatten(value, fullKey));
                } else if (typeof value === 'string') {
                    // Конечная строка — добавляем ключ
                    keys.push(fullKey);
                }
                // Игнорируем: числа, boolean, null, массивы, функции
            }
            return keys;
        }

        const result = flatten(obj);

        // 🔥 ШАГ 5: Удаляем временный файл
        try { fs.unlinkSync(tempFile); } catch (e) {}

        console.log(JSON.stringify(result));

    } catch (evalError) {
        // Если require не сработал — фолбэк на regex
        try { fs.unlinkSync(tempFile); } catch (e) {}

        console.error('Require failed, using regex fallback: ' + evalError.message);

        // 🔥 ФОЛБЭК: Regex парсер
        const keys = [];
        const pattern = /["']([a-zA-Z0-9_\-\.а-яА-ЯёЁ²]+)["']\s*:\s*(?:"([^"]*)"|'([^']*)')/g;
        let match;

        while ((match = pattern.exec(content)) !== null) {
            const key = match[1];
            if (key && key.length > 0) {
                keys.push(key);
            }
        }

        console.log(JSON.stringify([...new Set(keys)]));
    }

} catch (e) {
    console.error('Fatal error: ' + e.message);
    console.log('[]');
    process.exit(0);
}

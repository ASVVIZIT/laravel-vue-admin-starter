import type { App, Plugin } from 'vue'

// Автоматический реестр директивных плагинов модулей.
//
// Соглашение: любой файл вида:
//   resources/js/modules/<Module>/Directives/**/*Directive.ts
// экспортирует default Vue-plugin (объект с install(app) или функция),
// который регистрирует свои директивы через app.directive(...).
//
// Примеры, которые подхватятся сейчас и в будущем:
//   modules/TalkStream/Directives/Loading/loadingDirective.ts
//   modules/TalkStream/Directives/Tooltip/tooltipDirective.ts
//   modules/<Other>/Directives/Clipboard/clipboardDirective.ts
//
// Правила, чтобы реестр не ловил мусор:
// - файлы-реестры заканчиваются ровно на "Directive.ts" (заглавная D);
// - вспомогательные файлы НЕ называются *Directive.ts, поэтому не подхватятся:
//   create-loading-directive.ts, v-loading-talkstream.ts и т.п. — мимо;
// - если чужой модуль случайно положит сюда не-плагин, isPlugin() его
//   отфильтрует и в DEV выдаст warn, а не уронит установку.
//
// Ограничение, которое надо принять: eager:true статически включает все
// совпавшие реестры в бандл. Поэтому в *Directive.ts допускается только
// лёгкий registration-код (app.directive(...)). Нельзя класть на верхний
// уровень тяжёлые вычисления, обращения к API, инициализацию сторов до
// app.use(pinia) или побочные эффекты, которые должны выполняться по запросу.
//
// Важно про glob:
// - import.meta.glob не использует алиасы @/, @modules, @/modules из
//   tsconfig.json, jsconfig.json или vite.config.mts;
// - паттерн обязан быть относительным от этого файла или абсолютным от корня;
// - поэтому здесь используется ../modules, а не @/modules;
// - регистр "../modules" обязан совпадать с реальным регистром папки на диске;
// - если discovered в DEV пустой, проверь Get-ChildItem resources\js -Directory.

const directivePlugins = import.meta.glob(
    '../modules/*/Directives/**/*Directive.ts',
    { eager: true, import: 'default' }
) as Record<string, unknown>

function isPlugin(value: unknown): value is Plugin {
    if (typeof value === 'function') {
        return true
    }

    return (
        typeof value === 'object' &&
        value !== null &&
        'install' in value &&
        typeof (value as { install?: unknown }).install === 'function'
    )
}

export default {
    install(app: App): void {
        const entries = Object.entries(directivePlugins).sort((a, b) =>
            a[0].localeCompare(b[0])
        )

        const paths = entries.map(([path]) => path)

        if (import.meta.env.DEV) {
            console.info('[moduleDirectives] discovered:', paths)
        }

        if (paths.length === 0) {
            console.warn(
                '[moduleDirectives] glob не нашёл ни одного *Directive.ts — ' +
                'проверь регистр папки modules и структуру modules/<Module>/Directives/**/*Directive.ts'
            )
        }

        for (const [path, value] of entries) {
            if (!isPlugin(value)) {
                if (import.meta.env.DEV) {
                    console.warn(`[moduleDirectives] skipped non-plugin: ${path}`)
                }
                continue
            }

            app.use(value)
        }
    }
}

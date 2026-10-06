import type { App, Plugin } from 'vue'

// Автоматический реестр директивных плагинов модулей.
//
// Соглашение: любой файл вида:
//   resources/js/Modules/<Module>/Directives/**/*Directive.ts
// экспортирует default Vue-plugin (объект с install(app) или функция),
// который регистрирует свои директивы через app.directive(...).
//
// Примеры, которые подхватятся сейчас и в будущем:
//   Modules/TalkStream/Directives/Loading/loadingDirective.ts
//   Modules/TalkStream/Directives/Tooltip/tooltipDirective.ts
//   Modules/<Other>/Directives/Clipboard/clipboardDirective.ts
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
// - алиасы (@/, @modules/) внутри паттерна не работают, поэтому относительный путь;
// - регистр "../Modules" обязан совпадать с реальным регистром папки на диске
//   (NTFS отдаёт имена как лежат; на Linux расхождение регистра сломает glob);
// - если discovered в DEV пустой, сверь регистр с Get-ChildItem и поправь паттерн.

const directivePlugins = import.meta.glob(
    '../Modules/*/Directives/**/*Directive.ts',
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
        const paths = Object.keys(directivePlugins)

        if (import.meta.env.DEV) {
            console.info('[moduleDirectives] discovered:', paths)
        }

        if (paths.length === 0) {
            console.warn(
                '[moduleDirectives] glob не нашёл ни одного *Directive.ts — ' +
                'проверь регистр папки Modules и структуру Modules/<Module>/Directives/**/*Directive.ts'
            )
        }

        for (const [path, value] of Object.entries(directivePlugins)) {
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

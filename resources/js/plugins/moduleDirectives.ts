// resources/js/plugins/moduleDirectives.ts

import type { App, Plugin } from 'vue'

type UnknownRecord = Record<string, unknown>

/**
 * Автоматический реестр директивных плагинов модулей.
 *
 * Соглашение:*/
//   resources/js/modules/<Module>/Directives/**/*Directive.ts
/**
* Каждый такой файл должен экспортировать default Vue-plugin:
*   export default {
    *     install(app: App) {
    *       app.directive('...', directive)
        *     }
    *   }
*
* Важно:
* - сами директивы лучше называть:
    *     v-loading-talkstream.ts
*     v-loading-talkstream-small.ts
*     v-loading-talkstream-inline.ts
* - фабрику лучше называть:
    *     create-loading-directive.ts
* - автозагрузчик должен подхватывать только файлы, заканчивающиеся на:
    *     Directive.ts
*
* Это нужно, чтобы в бандл не летели вспомогательные файлы.
*/

const lowerPlugins = import.meta.glob(
    '../modules/*/Directives/**/*Directive.ts',
    {
        eager: true,
        import: 'default',
    },
) as UnknownRecord

const upperPlugins = import.meta.glob(
    '../Modules/*/Directives/**/*Directive.ts',
    {
        eager: true,
        import: 'default',
    },
) as UnknownRecord

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

const merged = new Map<string, { path: string; value: unknown }>()

for (const [path, value] of [
    ...Object.entries(lowerPlugins),
    ...Object.entries(upperPlugins),
]) {
    const key = path.toLowerCase()

    if (!merged.has(key)) {
        merged.set(key, { path, value })
    }
}

const entries = [...merged.values()].sort((a, b) =>
    a.path.localeCompare(b.path),
)

export default {
    install(app: App): void {
        if (entries.length === 0) {
            console.warn(
                '[moduleDirectives] glob не нашёл ни одного *Directive.ts — ' +
                'проверь структуру: modules/<Module>/Directives/**/*Directive.ts',
            )

            return
        }

        const installedPlugins = new Set<Plugin>()

        for (const { path, value } of entries) {
            if (!isPlugin(value)) {
                if (import.meta.env.DEV) {
                    console.warn(`[moduleDirectives] skipped non-plugin: ${path}`)
                }

                continue
            }

            if (installedPlugins.has(value)) {
                continue
            }

            installedPlugins.add(value)

            try {
                app.use(value)

                if (import.meta.env.DEV) {
                    console.info(`[moduleDirectives] installed: ${path}`)
                }
            } catch (error) {
                console.error(`[moduleDirectives] failed to install: ${path}`, error)
            }
        }

        if (import.meta.env.DEV) {
            console.info(
                `[moduleDirectives] total plugin candidates: ${entries.length}`,
            )
        }
    },
}

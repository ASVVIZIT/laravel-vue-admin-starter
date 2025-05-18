/**
 * ========================================================
 * Vite Configuration File (v4.1) - ESM-совместимая версия
 * ========================================================
 *
 * Основные режимы работы:
 * [Переменная окружения VITE_MODE в .env-файле]
 *
 * 1. local-dev    - Локальная разработка (режим по умолчанию)
 * 2. docker-dev   - Сборка для Docker-окружения
 * 3. production   - Продакшен-сборка с оптимизациями
 *
 * Команды запуска:
 * ┌──────────────┬───────────────────────┬────────────────────────┐
 * │   Режим      │       Команда         │ Переменная окружения   │
 * ├──────────────┼───────────────────────┼────────────────────────┤
 * │ local-dev    │ npm run dev           │ VITE_MODE=development  │
 * │ docker-dev   │ npm run docker-dev    │ VITE_MODE=docker       │
 * │ production   │ npm run build         │ VITE_MODE=production   │
 * └──────────────┴───────────────────────┴────────────────────────┘
 *
 * Особенности реализации:
 * - Конфигурация адаптирована для TypeScript и ESM-модулей
 * - Поддержка Vue 3 с JSX и плагинами Element Plus
 * - Интеграция с Laravel Vite Plugin
 * - Анализ размера бандла через rollup-plugin-visualizer
 * ================================================================
 */


import path from 'path'
import * as sass from 'sass'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
import { defineConfig, loadEnv } from 'vite'
import laravel from 'laravel-vite-plugin'
import VueSetupExtend from 'unplugin-vue-setup-extend/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import compress from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// Конфиг визуализатора
const BUNDLE_ANALYZER = {
    open: false,
    filename: 'public/stats.html',
    template: 'treemap',
    gzipSize: true,
    brotliSize: true,
    projectRoot: '/', // Показывать пути от корня проекта
    sourcemap: true // Учитывать sourcemaps
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ['VITE_', 'APP_'])
    const isProduction = env.VITE_MODE === 'production'
    const isDocker = env.VITE_MODE === 'docker'
    const isDev = env.VITE_MODE === 'development'

    // ==================== Общие настройки ====================
    const commonConfig = {
        define: {
            'process.platform': null,
            'process.version': null,
            'import.meta.env': {}
        },
        plugins: [
            laravel({
                input: 'resources/js/app.js',
                refresh: true,
                // Фикс для горячей перезагрузки в development
                handleHotUpdate({ file, server }) {
                    if (file.endsWith('.blade.php')) {
                        server.ws.send({ type: 'full-reload' })
                    }
                }
            }),
            vue({
                template: {
                    transformAssetUrls: {
                        base: null,
                        includeAbsolute: false
                    }
                }
            }),
            vueJsx(),
            VueSetupExtend(),
            ElementPlus({ useSource: true }),
            AutoImport({
                imports: ['vue', 'vue-router'],
                dts: 'types/auto-imports.d.ts',
                eslintrc: {
                    enabled: true, // Default `false`
                    filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
                    globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
                },
            }),
            compress()
        ],
        resolve: {
            alias: createAliases(),
            extensions: ['.jsx', '.js', '.vue', '.json', '.scss', '.sass']
        },
        css: {
            devSourcemap: true,
            postcss: {
                plugins: [
                    charsetRemovalPlugin()
                ]
            },
            preprocessorOptions: {
                scss: {
                    api: "modern",
                    sassOptions: {
                        quietDeps: true
                    },
                    implementation: sass,
                    additionalData: `
                                @use "@/styles/core/variables" as *;
                                @use "@/styles/custom-element-plus/proxy" as *;
                              `,
                }
            }
        }
    }

    // ==================== Режим Dev ====================
    const devConfig = {
        base: '/',
        server: {
            host: '0.0.0.0',
            port: 5173,
            strictPort: true,
            open: true,
            hmr: { protocol: 'ws' }
        },
        build: { sourcemap: true },
        css: { devSourcemap: true }
    }

    // ==================== Режим Docker-Dev ====================
    const dockerConfig = {
        base: '/',
        server: {
            host: '0.0.0.0',
            port: 5173,
            hmr: {
                host: 'host.docker.internal',
                protocol: 'ws',
                clientPort: 5173
            }
        },
        build: { sourcemap: false },
        css: { devSourcemap: false }
    }

    // ==================== Production-режим ====================
    const productionConfig = {
        base: '/build',
        build: {
            sourcemap: true,
            manifest: 'manifest.json',
            outDir: 'public/build',
            copyPublicDir: true,
            emptyOutDir: true,
            chunkSizeWarningLimit: 500,
            cssCodeSplit: true,
            rollupOptions: {
                input: 'resources/js/app.js',
                plugins: [
                    visualizer({
                        ...BUNDLE_ANALYZER,
                        title: `Анализ сборки (${mode.toUpperCase()})` // Динамическое название
                    }),
                ],
                output: {
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    assetFileNames: ({ name }) => assetNamingStrategy(name)
                }
            },
            terserOptions: {
                compress: {
                    drop_console: false,
                    pure_funcs: ['console.log', 'console.info'],
                    drop_debugger: false,
                    passes: 3
                }
            }
        }
    }

    // ==================== Сборка конфигурации ====================
    return {
        ...commonConfig,
        ...(isDev && devConfig),
        ...(isDocker && dockerConfig),
        ...(isProduction && productionConfig)
    }
})

// ==================== Вспомогательные функции ====================

/** Создание алиасов для путей */
function createAliases() {
    const root = path.join(__dirname, '/resources/js')
    return {
        '@': root,
        '@font': path.join(__dirname, '/resources/font'),
        '@styles': `${root}/styles`,
        '@api': `${root}/api`,
        '@lang': `${root}/lang`,
        '@utils': `${root}/utils`,
        '@router': `${root}/router`,
        '@assets': `${root}/assets`,
        '@constants': `${root}/constants`,
        '@layout': `${root}/layout`,
        '@components': `${root}/components`,
        '@store': `${root}/store`,
        '@views': `${root}/views`,
        'element-plus': path.resolve(__dirname, 'node_modules/element-plus'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
    }
}

/** Стратегия именования ассетов */
function assetNamingStrategy(name) {
    const ext = name?.split('.').pop()?.toLowerCase() || 'misc'

    const formatMap = {
        css: 'assets/css/[name]-[hash][extname]',
        js: 'assets/js/[name]-[hash][extname]',
        png: 'assets/images/[name]-[hash][extname]',
        jpg: 'assets/images/[name]-[hash][extname]',
        jpeg: 'assets/images/[name]-[hash][extname]',
        gif: 'assets/images/[name]-[hash][extname]',
        svg: 'assets/images/[name]-[hash][extname]',
        default: 'assets/[ext]/[name]-[hash][extname]'
    }

    return formatMap[ext] || formatMap.default
}

/** Удаление @charset из CSS */
function charsetRemovalPlugin() {
    return {
        postcssPlugin: 'internal:charset-removal',
        AtRule: {
            charset: (atRule) => {
                if (atRule.name === 'charset') atRule.remove()
            }
        }
    }
}

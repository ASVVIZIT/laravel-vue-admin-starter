/**
 * ========================================================
 * Vite Configuration File (v5.4+) - ESM-совместимая версия
 * ========================================================
 *
 * █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
 *                     РЕЖИМЫ РАБОТЫ
 * █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█
 *
 * [Переменная окружения APP_ENV в .env]
 *
 * 1. development    — Локальная разработка (default)
 *    → .env: APP_ENV=development
 *    → Особенности: HMR, sourcemaps, dev-сервер
 *
 * 2. docker-dev   — Docker-окружение
 *    → .env: APP_ENV=docker
 *    → Особенности: HMR через host.docker.internal
 *
 * 3. production   — Продакшен-сборка
 *    → .env: APP_ENV=production
 *    → Особенности: минификация, чанкинг, Brotli-сжатие
 *
 *
 * █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
 *                     КОМАНДЫ ЗАПУСКА
 * █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█
 *
 * ┌──────────────┬───────────────────────┬───────────────────────┐
 * │   РЕЖИМ      │       КОМАНДА         │ ПЕРЕМЕННЫЕ .ENV       │
 * ├──────────────┼───────────────────────┼───────────────────────┤
 * │ development  │ npm run dev           │ VITE_DEV_SERVER_URL=  │
 * │              │                       │ http://localhost:5173 │
 * ├──────────────┼───────────────────────┼───────────────────────┤
 * │ docker-dev   │ npm run docker-dev    │ VITE_DOCKER_SERVER_URL│
 * │              │                       │ =http://host.docker...│
 * ├──────────────┼───────────────────────┼───────────────────────┤
 * │ production   │ npm run build         │ VITE_BASE_PATH=/build/│
 * └──────────────┴───────────────────────┴───────────────────────┘
 *
 *
 * █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
 *               ОСОБЕННОСТИ РЕАЛИЗАЦИИ
 * █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█
 *
 * ✓ Поддержка Vue 3 Composition API + JSX
 * ✓ Интеграция с Element Plus (кастомизация темы)
 * ✓ Автоматический импорт компонентов (unplugin-auto-import)
 * ✓ Полная поддержка TypeScript (строгая типизация)
 * ✓ Оптимизированные алиасы путей (@/ → /resources/js)
 * ✓ Анализ бандла через rollup-plugin-visualizer
 * ✓ Горячая перезагрузка Blade-шаблонов
 * ✓ Поддержка SCSS-модулей с глобальными переменными
 * ✓ PostCSS-обработка (автопрефиксер, чистка CSS)
 *
 *
 * █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
 *                 ТРЕБОВАНИЯ К ОКРУЖЕНИЮ
 * █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█
 *
 • Node.js 20.02+ • npm 11.3+ • PHPStorm 2021.2+ • Docker 24+
 * ========================================================
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import laravel from 'laravel-vite-plugin'
import vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import VueSetupExtend from 'unplugin-vue-setup-extend/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import compress from 'vite-plugin-compression'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createHtmlPlugin } from 'vite-plugin-html'
import { visualizer } from 'rollup-plugin-visualizer'
import * as sass from 'sass'

// Получение ESM-совместимого __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, 'resources/js')
const typesRoot = path.join(__dirname, 'types')

// Конфиг визуализатора
const BUNDLE_ANALYZER = {
    open: false,
    filename: 'public/stats.html',
    template: 'treemap',
    gzipSize: true,
    brotliSize: true,
    projectRoot: '/',
    sourcemap: true
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ['VITE_', 'APP_'])
    const isProduction = env.APP_ENV === 'production'
    const isDocker = env.APP_ENV === 'docker'
    const isDev = env.APP_ENV === 'development'

    // ==================== Общие настройки ====================
    const commonConfig = {
        define: {
            __VUE_PROD_DEVTOOLS__: true,
            'process.platform': null,
            'process.version': null,
            'import.meta.env': {}
        },
        plugins: [
            laravel({
                input: [
                    'resources/js/app.js'
                ],
                refresh: [
                    {
                        paths: ['resources/views/**/*.blade.php'],
                        config: { delay: 300 }
                    }
                ],
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
                    },
                    compilerOptions: {
                        isCustomElement: tag => tag.startsWith('x-')
                    }
                }
            }),
            vueDevTools(),
            createHtmlPlugin({}),
            VueJsx(),
            VueSetupExtend(),
            ElementPlus({
                useSource: true,
                defaultLocale: 'ru'
            }),
            AutoImport({
                imports: ['vue', 'vue-router', 'pinia'],
                resolvers: [
                    ElementPlusResolver(),
                    IconsResolver({
                        prefix: 'Icon',
                    }),
                ],
                dts: 'types/auto-imports.d.ts',
                eslintrc: {
                    enabled: true,
                    filepath: './.eslintrc-auto-import.json',
                    globalsPropValue: true
                }
            }),
             Components({
                dirs: ['resources/js/components/!**!/!*.vue'],
                extensions: ['vue','js', 'jsx'],
                resolvers: [
                    ElementPlusResolver({ importStyle: 'sass' }),
                    IconsResolver({ prefix: 'Icon', enabledCollections: ['ep'] }),
                ],
                dts: 'types/components.d.ts'
            }),
            Icons({
                autoInstall: true,
            }),
            compress({
                algorithm: 'brotliCompress',
                ext: '.br'
            })
        ],
        resolve: {
            alias: createAliases(),
            extensions: ['.jsx', '.mjs', '.js', '.ts', '.vue', '.json', '.scss', '.sass']
        },
        css: {
            devSourcemap: true,
            postcss: {
                plugins: [charsetRemovalPlugin()]
            },
            preprocessorOptions: {
                scss: {
                    api: "modern",
                    sassOptions: { quietDeps: true },
                    implementation: sass,
                    additionalData: `
                            @use "@/styles/core/variables" as *;
                            @use "@/styles/custom-element-plus/proxy" as *;
                        `
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
            open: '/',
            hmr: {
                protocol: 'ws',
                host: 'localhost',
                port: 5173
            },
            watch: {
                usePolling: true,
                interval: 1000
            }
        },
        build: {
            sourcemap: 'inline',
            minify: false,
            cssCodeSplit: false
        },
        optimizeDeps: {
            include: [
                'vue',
                'element-plus',
                'element-plus/dist/locale/ru.mjs'
            ],
            exclude: ['vue-demi']
        }
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
                        title: `Анализ сборки (${mode.toUpperCase()})`
                    })
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

    return {
        ...commonConfig,
        ...(isDev && devConfig),
        ...(isDocker && dockerConfig),
        ...(isProduction && productionConfig)
    }
})

// ==================== Вспомогательные функции ====================
function createAliases() {
    return {
        '@': root,
        '~': path.resolve(__dirname, 'node_modules'),
        '@font': path.join(__dirname, 'resources/font'),
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

function assetNamingStrategy(name: string) {
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
    return formatMap[ext as keyof typeof formatMap] || formatMap.default
}

function charsetRemovalPlugin() {
    return {
        postcssPlugin: 'internal:charset-removal',
        AtRule: {
            charset: (atRule: { name: string; remove: () => void }) => {
                if (atRule.name === 'charset') atRule.remove()
            }
        }
    }
}

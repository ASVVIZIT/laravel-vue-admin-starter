/**
 * ============================================================================
 * VITE CONFIGURATION — FenixPortal
 * ============================================================================
 *
 * 📁 Файл: vite.config.mts
 * 📝 Описание: Главный конфиг Vite для сборки проекта
 * 🔗 Документация: https://vitejs.dev/
 *
 * ============================================================================
 * БЫСТРЫЙ СТАРТ
 * ============================================================================
 *
 * npm run dev                          # Локальная разработка
 * npm run build                        # Production (с логами)
 * BUILD_MODE=size npm run build        # Production (мин. размер)
 * APP_ENV=docker npm run build         # Docker сборка
 * ANALYZE=true npm run build           # Анализ чанков
 *
 * ============================================================================
 * СТРУКТУРА
 * ============================================================================
 *
 * vite.config.mts              ← Этот файл (главный конфиг)
 * vite.config.helpers.mts      ← Вспомогательные функции (логи, чанки, алиасы)
 *
 * logs/                        ← Папка логов (создаётся автоматически)
 * ├── build-time.log           ← История сборок
 * ├── chunk-sizes.log          ← История размеров чанков
 * ├── build-*.json             ← Детальные отчёты
 * └── chunks-*.json            ← Размеры чанков JSON
 *
 * ============================================================================
 * BUILD_MODE — РЕЖИМЫ СБОРКИ
 * ============================================================================
 *
 * | Режим    | Команда                    | Console.log | Размер | Время  |
 * |----------|----------------------------|-------------|--------|--------|
 * | dev      | npm run dev                | ✅ Да       | ~15 MB | 5 сек  |
 * | fast     | npm run build              | ✅ Да       | ~3.5 MB| 45 сек |
 * | size     | BUILD_MODE=size npm run... | ❌ Нет      | ~2.5 MB| 90 сек |
 * | docker   | APP_ENV=docker npm run...  | ✅ Да       | ~3.5 MB| 45 сек |
 *
 * ============================================================================
 * УПРАВЛЕНИЕ CONSOLE.LOG
 * ============================================================================
 *
 * ✅ ВКЛЮЧИТЬ (production с логами):
 * • npm run build (режим fast по умолчанию)
 * • В конфиге: esbuild: undefined, terserOptions: undefined
 *
 * ❌ ВЫКЛЮЧИТЬ (production без логов):
 * • BUILD_MODE=size npm run build
 * • В конфиге: esbuild: { drop: ['console', 'debugger'] }
 *
 * ============================================================================
 * ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (.env)
 * ============================================================================
 *
 * APP_ENV          | production | development | docker
 * BUILD_MODE       | fast       | dev         | fast
 * BUILD_LOGS       | true       | true        | false
 *
 * VITE_APP_HOST    | fenixlaravel.loc
 * VITE_REVERB_*    | Reverb WebSocket настройки
 *
 * ============================================================================
 * VUE DEVTOOLS В PRODUCTION
 * ============================================================================
 *
 * ✅ Включено по умолчанию (__VUE_PROD_DEVTOOLS__: true)
 * 🔍 Открывается через Ctrl+Shift+V (Chrome) или F12 → Vue
 *
 * ============================================================================
 * ПОСЛЕДНЕЕ ОБНОВЛЕНИЕ: 2025-01-24
 * ВЕРСИЯ: 2.0 (разделённый конфиг)
 * СТАТУС: ✅ РАБОЧИЙ
 * ============================================================================
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
import { VitePWA } from 'vite-plugin-pwa'
import * as sass from 'sass'

import {
    buildTimeLogger,
    chunkSizeLogger,
    BUNDLE_ANALYZER,
    ELEMENT_LOCALES,
    createAliases,
    assetNamingStrategy,
    charsetRemovalPlugin,
    createManualChunks
} from './vite.config.helpers.mts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, 'resources/js')
const logsDir = path.join(__dirname, 'logs')
const buildDir = path.join(__dirname, 'public/build/assets/js')

export default defineConfig(function({ mode }) {
    const env = loadEnv(mode, process.cwd(), ['VITE_', 'APP_', 'REVERB_', 'PUSHER_', 'BUILD_'])
    const isProduction = env.APP_ENV === 'production'
    const isDocker = env.APP_ENV === 'docker'
    const isDev = env.APP_ENV === 'development'

    const buildMode = env.BUILD_MODE || (isDev ? 'dev' : 'fast')
    const isFastBuild = buildMode === 'fast'
    const isSizeBuild = buildMode === 'size'
    const isDevBuild = buildMode === 'dev'

    const manualChunks = createManualChunks()

    console.log('')
    console.log('BUILD MODE: ' + buildMode.toUpperCase())
    console.log('  Speed: ' + (isFastBuild ? 'MAX' : isSizeBuild ? 'SLOW' : 'MAX'))
    console.log('  Size:  ' + (isSizeBuild ? 'MIN' : isFastBuild ? 'LARGER' : 'LARGER'))
    console.log('')

    const commonConfig = {
        cacheDir: 'node_modules/.vite',

        define: {
            __VUE_PROD_DEVTOOLS__: true,
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
            'process.platform': null,
            'process.version': null,
            'import.meta.env': {
                ...env,
                VITE_APP_HOST: JSON.stringify(process.env.VITE_APP_HOST),
                VITE_REVERB_APP_KEY: JSON.stringify(process.env.VITE_REVERB_APP_KEY),
                VITE_REVERB_HOST: JSON.stringify(process.env.VITE_REVERB_HOST),
                VITE_REVERB_PORT: JSON.stringify(process.env.VITE_REVERB_PORT),
                VITE_REVERB_SCHEME: JSON.stringify(process.env.VITE_REVERB_SCHEME),
                VITE_REVERB_AUTH_ENDPOINT: JSON.stringify(process.env.VITE_REVERB_AUTH_ENDPOINT),
                VITE_REVERB_PATH: JSON.stringify(process.env.VITE_REVERB_PATH),
                VITE_SANCTUM_CSRF_ENDPOINT: JSON.stringify(process.env.VITE_SANCTUM_CSRF_ENDPOINT)
            }
        },

        plugins: [
            buildTimeLogger(),
            chunkSizeLogger(),

            laravel({
                input: ['resources/js/app.js'],
                refresh: [
                    {
                        paths: ['resources/views/**/*.blade.php'],
                        config: { delay: 300 }
                    }
                ],
                handleHotUpdate: function({ file, server }) {
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
                        isCustomElement: function(tag) { return tag.startsWith('x-') }
                    }
                }
            }),

            vueDevTools(),

            createHtmlPlugin({
                minify: isProduction,
                inject: {
                    data: {
                        preloadLinks: isProduction
                            ? ELEMENT_LOCALES.map(function(path) {
                                return '<link rel="modulepreload" href="/' + path + '" as="script" crossorigin="anonymous">'
                            }).join('')
                            : ''
                    }
                }
            }),

            VitePWA({
                registerType: 'autoUpdate',
                workbox: {
                    globDirectory: 'public/build',
                    maximumFileSizeToCacheInBytes: 100 * 1024 * 1024,
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf,woff}'],
                    runtimeCaching: [
                        {
                            urlPattern: function({ url }) {
                                return ELEMENT_LOCALES.some(function(locale) { return url.pathname.includes(locale) })
                            },
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'element-locales',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 30
                                }
                            }
                        },
                        {
                            urlPattern: function({ url }) {
                                return url.pathname.endsWith('.ttf') ||
                                    url.pathname.endsWith('.woff') ||
                                    url.pathname.endsWith('.woff2')
                            },
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'fonts',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365
                                }
                            }
                        },
                        {
                            urlPattern: function({ url }) {
                                return url.pathname.startsWith('/api/')
                            },
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'api-cache',
                                expiration: {
                                    maxEntries: 50,
                                    maxAgeSeconds: 60 * 60 * 24
                                },
                                networkTimeoutSeconds: 10
                            }
                        }
                    ]
                },
                manifest: {
                    name: 'FenixPortal',
                    short_name: 'Fenix',
                    description: 'FenixPortal Application',
                    theme_color: '#409EFF',
                    background_color: '#ffffff',
                    display: 'standalone',
                    start_url: '/',
                    icons: [
                        {
                            src: '/favicon.ico',
                            sizes: 'any',
                            type: 'image/x-icon'
                        }
                    ]
                }
            }),

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
                    IconsResolver({ prefix: 'Icon' })
                ],
                dts: 'types/auto-imports.d.ts',
                eslintrc: {
                    enabled: true,
                    filepath: './.eslintrc-auto-import.json',
                    globalsPropValue: true
                }
            }),

            Components({
                dirs: ['resources/js/components/**/*.vue'],
                extensions: ['vue', 'js', 'jsx'],
                resolvers: [
                    ElementPlusResolver({ importStyle: 'sass' }),
                    IconsResolver({ prefix: 'Icon', enabledCollections: ['ep'] })
                ],
                dts: 'types/components.d.ts'
            }),

            Icons({
                autoInstall: true
            }),

            compress({
                threshold: 10240,
                algorithm: isSizeBuild ? 'brotliCompress' : 'gzip',
                ext: isSizeBuild ? '.br' : '.gz',
                deleteOriginFile: false
            })
        ],

        resolve: {
            alias: createAliases(root, __dirname),
            extensions: ['.jsx', '.mjs', '.js', '.ts', '.vue', '.json', '.scss', '.sass']
        },

        css: {
            devSourcemap: !isFastBuild,
            postcss: {
                plugins: [charsetRemovalPlugin()]
            },
            preprocessorOptions: {
                scss: {
                    api: 'modern',
                    sassOptions: {
                        quietDeps: true
                    },
                    implementation: sass,
                    additionalData: '\n@use "@/styles/core/variables" as *;\n@use "@/styles/custom-element-plus/proxy" as *;\n'
                }
            }
        }
    }

    const devConfig = {
        base: '/',
        server: {
            host: '0.0.0.0',
            port: 5173,
            strictPort: false,
            open: false,
            hmr: {
                protocol: 'ws',
                host: 'localhost',
                port: 5173,
                clientPort: 5173
            },
            watch: {
                usePolling: false,
                interval: 100,
                ignored: [
                    '**/node_modules/**',
                    '**/vendor/**',
                    '**/storage/**',
                    '**/.git/**'
                ]
            },
            cors: {
                origin: true,
                credentials: true
            },
            proxy: {
                '/api': {
                    target: 'http://94.41.87.10:8050',
                    changeOrigin: true,
                    secure: false,
                    ws: true
                },
                '/sanctum/csrf-cookie': {
                    target: 'http://94.41.87.10:8050',
                    changeOrigin: true,
                    secure: false
                },
                '/broadcasting/auth': {
                    target: 'http://94.41.87.10:8050',
                    changeOrigin: true,
                    secure: false,
                    ws: true
                },
                '/reverb': {
                    target: 'ws://94.41.87.10:8080',
                    changeOrigin: true,
                    secure: false,
                    ws: true
                }
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
                'vue-router',
                'pinia',
                'element-plus',
                'element-plus/es',
                '@element-plus/icons-vue',
                'axios'
            ].concat(ELEMENT_LOCALES),
            exclude: ['vue-demi'],
            force: false,
            esbuildOptions: {
                target: 'es2020',
                keepNames: true
            }
        }
    }

    const dockerConfig = {
        base: '/',
        server: {
            host: '0.0.0.0',
            port: 5173,
            hmr: {
                host: new URL(env.VITE_DOCKER_SERVER_URL || 'http://localhost:5173').hostname,
                protocol: 'ws',
                clientPort: 80
            },
            proxy: {
                '/api': {
                    target: 'http://host.docker.internal:8050',
                    changeOrigin: true,
                    secure: false,
                    rewrite: function(path) { return path.replace(/^\/api/, '') }
                },
                '/broadcasting/auth': {
                    target: 'http://host.docker.internal:8080',
                    changeOrigin: true,
                    secure: false,
                    ws: true
                }
            }
        },
        build: {
            outDir: 'public/build',
            manifest: true,
            sourcemap: false,
            minify: 'esbuild',
            rollupOptions: {
                input: 'resources/js/app.js'
            }
        },
        css: { devSourcemap: false }
    }

    const productionConfig = {
        base: '/build',
        server: {
            host: process.env.VITE_APP_HOST || 'fenixlaravel.loc',
            port: 8050,
            cors: {
                origin: [
                    'http://fenixlaravel.loc',
                    'http://94.41.87.10',
                    'http://localhost:5173'
                ],
                credentials: true
            }
        },
        build: {
            sourcemap: 'hidden',
            minify: isSizeBuild ? 'terser' : 'esbuild',
            target: 'es2020',
            cssTarget: 'chrome80',
            chunkSizeWarningLimit: 5000,
            cssCodeSplit: true,
            esbuild: isFastBuild || isDevBuild ? undefined : undefined,
            terserOptions: isSizeBuild ? {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.log', 'console.info', 'console.warn'],
                    passes: 2
                }
            } : undefined,
            rollupOptions: {
                input: 'resources/js/app.js',
                plugins: process.env.ANALYZE ? [visualizer({
                    ...BUNDLE_ANALYZER,
                    title: 'Build analysis (' + mode.toUpperCase() + ')'
                })] : [],
                output: {
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    assetFileNames: function({ name }) { return assetNamingStrategy(name) },
                    manualChunks: manualChunks
                }
            }
        },
        optimizeDeps: {
            include: [
                'vue',
                'vue-router',
                'pinia',
                'element-plus',
                'element-plus/es',
                '@element-plus/icons-vue',
                'axios'
            ].concat(ELEMENT_LOCALES),
            exclude: ['vue-demi'],
            force: false,
            esbuildOptions: {
                target: 'es2020',
                keepNames: true
            }
        }
    }

    return Object.assign({},
        commonConfig,
        (isDev ? devConfig : {}),
        (isDocker ? dockerConfig : {}),
        (isProduction ? productionConfig : {})
    )
})

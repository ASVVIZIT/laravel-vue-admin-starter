import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv, Plugin } from 'vite'
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
import BrowserSync from 'vite-plugin-browser-sync'
import * as sass from 'sass'
import fs from 'node:fs'

// ============================================================================
// ПУТИ
// ============================================================================
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, 'resources/js')
const logsDir = path.join(__dirname, 'logs')
const buildDir = path.join(__dirname, 'public/build/assets/js')

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ВРЕМЕНИ (UTC+5 Екатеринбург)
// ============================================================================
function getLocalTime() {
    const now = new Date()
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Yekaterinburg'
    }
    return now.toLocaleString('ru-RU', options)
}

function getTimestamp() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds + ' (UTC+5)'
}

// ============================================================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ formatBytes
// ============================================================================
function formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ============================================================================
// ПЛАГИН ДЛЯ ЛОГИРОВАНИЯ СКОРОСТИ СБОРКИ
// ============================================================================
function buildTimeLogger() {
    var startTime = 0
    var buildMode = 'unknown'

    return {
        name: 'build-time-logger',
        enforce: 'pre',
        configResolved: function(config) {
            buildMode = config.mode
        },
        buildStart: function() {
            startTime = Date.now()
            var timestamp = getTimestamp()
            var localTime = getLocalTime()

            console.log('')
            console.log('================================================================================')
            console.log('START BUILD')
            console.log('================================================================================')
            console.log('  Date/Time:        ' + localTime)
            console.log('  Timestamp:        ' + timestamp)
            console.log('  Mode:             ' + buildMode.toUpperCase())
            console.log('  Node.js:          ' + process.version)
            console.log('  Platform:         ' + process.platform + ' ' + process.arch)
            console.log('================================================================================')
            console.log('PATHS')
            console.log('================================================================================')
            console.log('  Project Root:     ' + __dirname)
            console.log('  Logs Folder:      ' + logsDir)
            console.log('  Build Folder:     ' + buildDir)
            console.log('================================================================================')
            console.log('LOG FILES')
            console.log('================================================================================')
            console.log('  Build Time:       ' + path.join(logsDir, 'build-time.log'))
            console.log('  Chunk Sizes:      ' + path.join(logsDir, 'chunk-sizes.log'))
            console.log('  Detail Report:    build-<milliseconds>.json (example: build-1740347860123.json)')
            console.log('  Detail Report:    chunks-<milliseconds>.json (example: chunks-1740347860456.json)')
            console.log('================================================================================')
            console.log('CREATED FILES')
            console.log('================================================================================')
            console.log('  public/build/assets/js/*.js   - JavaScript chunks')
            console.log('  public/build/assets/css/*.css - CSS chunks')
            console.log('  public/build/manifest.json    - Manifest file')
            console.log('  logs/build-time.log           - Build history')
            console.log('  logs/chunk-sizes.log          - Size history')
            console.log('================================================================================')
            console.log('')
        },
        buildEnd: function(error) {
            var duration = Date.now() - startTime
            var minutes = Math.floor(duration / 60000)
            var seconds = ((duration % 60000) / 1000).toFixed(2)

            console.log('')
            console.log('================================================================================')
            console.log('BUILD REPORT')
            console.log('================================================================================')
            console.log('  Date:             ' + getLocalTime())
            console.log('  Mode:             ' + buildMode)
            console.log('  Duration:         ' + (minutes > 0 ? minutes + ' min ' : '') + seconds + ' sec')
            console.log('  Status:           ' + (error ? 'ERROR' : 'SUCCESS'))
            if (error) {
                console.log('  Error:            ' + error.message)
            }
            console.log('================================================================================')
            console.log('')

            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true })
                console.log('Logs folder created: ' + logsDir)
            }

            var logFile = path.join(logsDir, 'build-time.log')
            var timestamp = getTimestamp()
            fs.appendFileSync(logFile, '[' + timestamp + '] ' + buildMode + ': ' + (minutes > 0 ? minutes + 'm ' : '') + seconds + 's' + (error ? ' ERROR' : ' OK') + '\n')

            var detailFile = path.join(logsDir, 'build-' + Date.now() + '.json')
            fs.writeFileSync(detailFile, JSON.stringify({
                timestamp: timestamp,
                localTime: getLocalTime(),
                mode: buildMode,
                duration: {
                    milliseconds: duration,
                    seconds: duration / 1000,
                    minutes: duration / 60000
                },
                success: !error,
                error: error ? error.message : null,
                paths: {
                    projectRoot: __dirname,
                    logsDir: logsDir,
                    buildDir: buildDir,
                    logFile: logFile,
                    detailFile: detailFile
                }
            }, null, 2))

            console.log('Log saved: ' + logFile)
            console.log('Detail report: ' + detailFile)
            console.log('')
        }
    }
}

// ============================================================================
// ПЛАГИН ДЛЯ ЛОГИРОВАНИЯ РАЗМЕРА ЧАНКОВ
// ============================================================================
function chunkSizeLogger() {
    return {
        name: 'chunk-size-logger',
        enforce: 'post',
        closeBundle: function() {
            if (!fs.existsSync(buildDir)) {
                console.log('Build folder not found: ' + buildDir)
                return
            }

            var files = fs.readdirSync(buildDir)
                .filter(function(file) { return file.endsWith('.js') })
                .map(function(file) {
                    var filePath = path.join(buildDir, file)
                    var stats = fs.statSync(filePath)
                    var gzipSize = stats.size * 0.3
                    return {
                        name: file,
                        size: stats.size,
                        gzip: gzipSize,
                        sizeFormatted: formatBytes(stats.size),
                        gzipFormatted: formatBytes(gzipSize)
                    }
                })
                .sort(function(a, b) { return b.size - a.size })

            var totalSize = files.reduce(function(sum, file) { return sum + file.size }, 0)
            var totalGzip = files.reduce(function(sum, file) { return sum + file.gzip }, 0)

            console.log('')
            console.log('================================================================================')
            console.log('CHUNK SIZES')
            console.log('================================================================================')

            files.forEach(function(file, index) {
                console.log('  ' + String(index + 1).padStart(2) + '. ' + file.name.padEnd(50) + ' ' + file.sizeFormatted.padStart(10) + ' | gzip: ' + file.gzipFormatted)
            })

            console.log('--------------------------------------------------------------------------------')
            console.log('  TOTAL: ' + files.length + ' files | ' + formatBytes(totalSize).padStart(10) + ' | gzip: ' + formatBytes(totalGzip))
            console.log('  PATH: ' + buildDir)
            console.log('================================================================================')
            console.log('')

            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true })
                console.log('Logs folder created: ' + logsDir)
            }

            var logFile = path.join(logsDir, 'chunk-sizes.log')
            var timestamp = getTimestamp()
            fs.appendFileSync(logFile, '\n[' + timestamp + ']\n')

            var detailFile = path.join(logsDir, 'chunks-' + Date.now() + '.json')
            fs.writeFileSync(detailFile, JSON.stringify({
                timestamp: timestamp,
                localTime: getLocalTime(),
                chunks: files,
                total: {
                    size: totalSize,
                    sizeFormatted: formatBytes(totalSize),
                    gzip: totalGzip,
                    gzipFormatted: formatBytes(totalGzip)
                },
                paths: {
                    buildDir: buildDir,
                    logFile: logFile,
                    detailFile: detailFile
                }
            }, null, 2))

            console.log('Log saved: ' + logFile)
            console.log('Detail report: ' + detailFile)
            console.log('')
        }
    }
}

// ============================================================================
// КОНФИГ ВИЗУАЛИЗАТОРА
// ============================================================================
const BUNDLE_ANALYZER = {
    open: false,
    filename: 'public/stats.html',
    template: 'treemap',
    gzipSize: true,
    brotliSize: true,
    projectRoot: '/',
    sourcemap: true
}

const ELEMENT_LOCALES = [
    'element-plus/dist/locale/ru.mjs',
    'element-plus/dist/locale/en.mjs',
    'element-plus/dist/locale/zh-cn.mjs'
]

// ============================================================================
// ЭКСПОРТ КОНФИГА
// ============================================================================
export default defineConfig(function({ mode }) {
    const env = loadEnv(mode, process.cwd(), ['VITE_', 'APP_', 'REVERB_', 'PUSHER_', 'BUILD_'])
    const isProduction = env.APP_ENV === 'production'
    const isDocker = env.APP_ENV === 'docker'
    const isDev = env.APP_ENV === 'development'

    const buildMode = env.BUILD_MODE || (isDev ? 'dev' : 'fast')
    const isFastBuild = buildMode === 'fast'
    const isSizeBuild = buildMode === 'size'
    const isDevBuild = buildMode === 'dev'

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
            alias: createAliases(),
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

    // ============================================================================
    // DEV CONFIG (ИСПРАВЛЕНО ДЛЯ HMR)
    // ============================================================================
    const devConfig = {
        base: '/',
        server: {
            // ✅ СЛУШАТЬ ВСЕ ИНТЕРФЕЙСЫ
            host: '0.0.0.0',
            port: 5173,
            strictPort: false,
            open: false,

            // ✅ HMR ДЛЯ АВТО-ПЕРЕЗАГРУЗКИ
            hmr: {
                protocol: 'ws',
                host: 'localhost',
                port: 5173,
                clientPort: 5173
            },

            // ✅ WATCH ДЛЯ ОТСЛЕЖИВАНИЯ ФАЙЛОВ
            watch: {
                usePolling: false,  // false для скорости (Windows)
                interval: 100,
                ignored: [
                    '**/node_modules/**',
                    '**/vendor/**',
                    '**/storage/**',
                    '**/.git/**'
                ]
            },

            // ✅ CORS ДЛЯ ДОСТУПА
            cors: {
                origin: true,
                credentials: true
            },

            // ✅ PROXY НА LARAVEL (API запросы)
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
            // 🔴 КРИТИЧНО: Выключить source maps в production
            sourcemap: false,
            // 🔴 КРИТИЧНО: Всегда минифицировать
            minify: isSizeBuild ? 'terser' : 'esbuild',
            // ✅ Целевая платформа
            target: 'es2020',
            cssTarget: 'chrome80',
            // ✅ Лимит предупреждений
            chunkSizeWarningLimit: 5000,
            // ✅ Code splitting
            cssCodeSplit: true,
            // ✅ Настройки для esbuild (быстрый)
            esbuild: isFastBuild || isDevBuild ? {
                drop: ['console', 'debugger']
            } : undefined,
            // ✅ Настройки для terser (медленный но лучшее сжатие)
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
                    // 🟢 РАЗБИТЬ VENDOR НА МЕНЬШИЕ ЧАНКИ
                    manualChunks: function(id) {
                        // ELEMENT PLUS ЛОКАЛИ — ВСЕ ЛОКАЛИ В ОДНОМ ЧАНКЕ
                        if (id.includes('element-plus/dist/locale')) {
                            return 'element-locales'
                        }
                        // VUE ЭКОСИСТЕМА
                        if (id.includes('node_modules/vue') && !id.includes('node_modules/@vue')) {
                            return 'vue-core'
                        }
                        if (id.includes('node_modules/vue-router')) {
                            return 'vue-router'
                        }
                        if (id.includes('node_modules/pinia')) {
                            return 'pinia'
                        }
                        if (id.includes('node_modules/@vueuse')) {
                            return 'vueuse'
                        }
                        // ELEMENT PLUS (БЕЗ ЛОКАЛЕЙ)
                        if (id.includes('node_modules/element-plus') && !id.includes('element-plus/dist/locale')) {
                            return 'element-plus'
                        }
                        // HTTP КЛИЕНТЫ
                        if (id.includes('node_modules/axios')) {
                            return 'http-client'
                        }
                        if (id.includes('node_modules/laravel-echo')) {
                            return 'laravel-echo'
                        }
                        if (id.includes('node_modules/pusher-js')) {
                            return 'pusher'
                        }
                        // ВИЗУАЛИЗАЦИЯ
                        if (id.includes('node_modules/echarts')) {
                            return 'echarts'
                        }
                        if (id.includes('node_modules/three')) {
                            return 'three'
                        }
                        // УТИЛИТЫ
                        if (id.includes('node_modules/lodash') || id.includes('node_modules/lodash-es')) {
                            return 'lodash'
                        }
                        if (id.includes('node_modules/dayjs')) {
                            return 'dayjs'
                        }
                        if (id.includes('node_modules/moment')) {
                            return 'moment'
                        }
                        // QR CODE
                        if (id.includes('node_modules/qrcode')) {
                            return 'qrcode'
                        }
                        // DRAG AND DROP
                        if (id.includes('node_modules/vuedraggable') || id.includes('node_modules/vue-draggable')) {
                            return 'draggable'
                        }
                        // ОСТАЛЬНОЙ VENDOR
                        if (id.includes('node_modules')) {
                            return 'vendor'
                        }
                        // ШРИФТЫ
                        if (id.includes('.ttf') || id.includes('.woff') || id.includes('.woff2')) {
                            return 'fonts'
                        }
                        return undefined
                    }
                }
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

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================
function createAliases() {
    return {
        '@': root,
        '~': path.resolve(__dirname, 'node_modules'),
        '@font': path.join(__dirname, 'resources/font'),
        '@styles': root + '/styles',
        '@api': root + '/api',
        '@lang': root + '/lang',
        '@utils': root + '/utils',
        '@router': root + '/router',
        '@assets': root + '/assets',
        '@constants': root + '/constants',
        '@layout': root + '/layout',
        '@components': root + '/components',
        '@store': root + '/store',
        '@views': root + '/views',
        '@plugins': root + '/plugins',
        '@modules': root + '/modules',
        'element-plus': path.resolve(__dirname, 'node_modules/element-plus'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
    }
}

function assetNamingStrategy(name) {
    const ext = name ? name.split('.').pop().toLowerCase() : 'misc'
    const formatMap = {
        css: 'assets/css/[name]-[hash][extname]',
        js: 'assets/js/[name]-[hash][extname]',
        png: 'assets/images/[name]-[hash][extname]',
        jpg: 'assets/images/[name]-[hash][extname]',
        jpeg: 'assets/images/[name]-[hash][extname]',
        gif: 'assets/images/[name]-[hash][extname]',
        svg: 'assets/images/[name]-[hash][extname]',
        ttf: 'fonts/[name][extname]',
        woff: 'fonts/[name][extname]',
        woff2: 'fonts/[name][extname]',
        default: 'assets/[ext]/[name]-[hash][extname]'
    }
    return formatMap[ext] || formatMap.default
}

function charsetRemovalPlugin() {
    return {
        postcssPlugin: 'internal:charset-removal',
        AtRule: {
            charset: function(atRule) {
                if (atRule.name === 'charset') atRule.remove()
            }
        }
    }
}

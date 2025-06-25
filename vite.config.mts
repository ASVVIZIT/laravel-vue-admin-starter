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

// Список локалей для Element Plus
const ELEMENT_LOCALES = [
    'element-plus/dist/locale/ru.mjs',
    'element-plus/dist/locale/en.mjs',
    'element-plus/dist/locale/zh-cn.mjs'
]

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ['VITE_', 'APP_', 'REVERB_', 'PUSHER_'])
    const isProduction = env.APP_ENV === 'production'
    const isDocker = env.APP_ENV === 'docker'
    const isDev = env.APP_ENV === 'development'

    // ==================== Общие настройки ====================
    const commonConfig = {
        define: {
            __VUE_PROD_DEVTOOLS__: true,
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
                VITE_SANCTUM_CSRF_ENDPOINT: JSON.stringify(process.env.VITE_SANCTUM_CSRF_ENDPOINT),
            },
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
            createHtmlPlugin({
                minify: isProduction,
                inject: {
                    data: {
                        // Добавляем предзагрузку только для локалей
                        preloadLinks: isProduction ?
                            ELEMENT_LOCALES.map(path =>
                                `<link rel="modulepreload" href="/${path}" as="script" crossorigin="anonymous">`
                            ).join('') : ''
                    }
                }
            }),
            VitePWA({
                // Конфиг для кэширования локалей
                registerType: 'autoUpdate',
                workbox: {
                    globDirectory: 'public/build',
                    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
                    // ИСПРАВЛЕННЫЙ ПАТТЕРН:
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                    runtimeCaching: [
                        {
                            urlPattern: ({ url }) =>
                                ELEMENT_LOCALES.some(locale => url.pathname.includes(locale)),
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'element-locales',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 дней
                                }
                            }
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
                dirs: ['resources/js/components/**/*.vue'],
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
            /*            compress({
                            threshold: 10240,
                            algorithm: 'brotliCompress',
                            ext: '.br'
                        })*/
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
                    sassOptions: {
                        quietDeps: true
                    },
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
                port: 5173,
                clientPort: 5173
            },
            watch: {
                usePolling: true,
                interval: 1000
            },
            proxy: {
                // API запросы
                '/api': {
                    target: 'http://94.41.87.10:8050',
                    changeOrigin: true,
                    secure: false,
                    ws: true
                },

                // CSRF токен
                '/sanctum/csrf-cookie': {
                    target: 'http://94.41.87.10:8050',
                    changeOrigin: true,
                    secure: false
                },

                // Аутентификация каналов (важно для Echo.js)
                '/broadcasting/auth': {
                    target: 'http://94.41.87.10:8050',
                    changeOrigin: true,
                    secure: false,
                    ws: true
                },

                // WebSocket для Reverb
                '/reverb': {
                    target: 'ws://localhost:8080',
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
                'element-plus',
                ...ELEMENT_LOCALES
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
                host: new URL(env.VITE_DOCKER_SERVER_URL || 'http://localhost:5173').hostname,
                protocol: 'ws',
                clientPort: 80
            },
            proxy: {
                '/api': {
                    target: 'http://host.docker.internal:8050',
                    changeOrigin: true,
                    secure: false,
                    rewrite: path => path.replace(/^\/api/, '')
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

    // ==================== Production-режим ====================
    const productionConfig = {
        base: '/build',
        server: {
            host: process.env.VITE_APP_HOST || 'fenixlaravel.loc',
            port: 8050,
            // 🌐 Разрешить подключения с внешнего IP
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
                    }),
                ],
                output: {
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    assetFileNames: ({ name }) => assetNamingStrategy(name),
                    // Оптимизация для локалей
                    manualChunks: (id) => {
                        if (id.includes('element-plus/dist/locale')) {
                            return 'element-locales'
                        }

                        if (id.includes('node_modules')) {
                            return 'vendor'
                        }
                    }
                }
            },
            terserOptions: {
                compress: {
                    drop_console: false,
                    pure_funcs: ['console.log', 'console.info'],
                    drop_debugger: false,
                    passes: 1
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
        '@plugins': `${root}/plugins`,
        '@modules': `${root}/modules`,
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

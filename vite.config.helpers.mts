/**
 * ============================================================================
 * VITE CONFIG HELPERS — FenixPortal
 * ============================================================================
 *
 * 📁 Файл: vite.config.helpers.mts
 * 📝 Описание: Вспомогательные функции для Vite конфига
 * 🔗 Импортируется в: vite.config.mts
 *
 * ============================================================================
 * ЭКСПОРТИРУЕМЫЕ ФУНКЦИИ
 * ============================================================================
 *
 * buildTimeLogger()        ← Плагин логирования времени сборки
 * chunkSizeLogger()        ← Плагин логирования размеров чанков
 * createAliases()          ← Создание алиасов путей (@, ~, и т.д.)
 * assetNamingStrategy()    ← Стратегия именования ассетов
 * charsetRemovalPlugin()   ← Удаление @charset из CSS
 * createManualChunks()     ← Ручное разделение на чанки (vendor, vue, и т.д.)
 *
 * ============================================================================
 * КОНСТАНТЫ
 * ============================================================================
 *
 * BUNDLE_ANALYZER          ← Настройки визуализатора чанков
 * ELEMENT_LOCALES          ← Локали Element Plus (ru, en, zh-cn)
 * logsDir                  ← Путь к папке логов
 * buildDir                 ← Путь к папке сборки
 *
 * ============================================================================
 * ЛОГИРОВАНИЕ
 * ============================================================================
 *
 * 📄 build-time.log        ← История всех сборок (время, статус)
 * 📄 chunk-sizes.log       ← История размеров чанков
 * 📄 build-*.json          ← Детальный JSON отчёт о сборке
 * 📄 chunks-*.json         ← Детальные размеры чанков JSON
 *
 * ============================================================================
 * ЧАНКИ (MANUAL CHUNKS)
 * ============================================================================
 *
 * | Чанк          | Описание                    | Размер    |
 * |---------------|-----------------------------|-----------|
 * | vue-core      | Vue 3 ядро                  | ~160 KB   |
 * | vue-runtime   | Vue runtime DOM             | ~70 KB    |
 * | vue-router    | Vue Router                  | ~30 KB    |
 * | pinia         | Pinia store                 | ~16 KB    |
 * | element-plus  | Element Plus UI             | ~765 KB   |
 * | element-locales| Element Plus локали        | ~25 KB    |
 * | http-client   | Axios                       | ~37 KB    |
 * | laravel-echo  | Laravel Echo                | ~11 KB    |
 * | pusher        | Pusher JS                   | ~63 KB    |
 * | vendor        | Остальные npm пакеты        | ~650 KB   |
 * | fonts         | Шрифты (ttf, woff, woff2)   | varies    |
 *
 * ============================================================================
 * ПРИМЕР ИСПОЛЬЗОВАНИЯ
 * ============================================================================
 *
 * // В vite.config.mts:
 * import {
 *     buildTimeLogger,
 *     chunkSizeLogger,
 *     createAliases,
 *     createManualChunks
 * } from './vite.config.helpers.mts'
 *
 * const manualChunks = createManualChunks()
 *
 * export default defineConfig({
 *     plugins: [buildTimeLogger(), chunkSizeLogger(), ...],
 *     resolve: { alias: createAliases(root, __dirname) },
 *     build: { rollupOptions: { output: { manualChunks } } }
 * })
 *
 * ============================================================================
 * ПОСЛЕДНЕЕ ОБНОВЛЕНИЕ: 2025-01-24
 * ВЕРСИЯ: 2.0 (разделённый конфиг)
 * СТАТУС: ✅ РАБОЧИЙ
 * ============================================================================
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Plugin } from 'vite'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const logsDir = path.join(__dirname, 'logs')
export const buildDir = path.join(__dirname, 'public/build/assets/js')

export function getLocalTime() {
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

export function getTimestamp() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds + ' (UTC+5)'
}

export function formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function buildTimeLogger() {
    var startTime = 0
    var buildMode = 'unknown'

    return {
        name: 'build-time-logger',
        enforce: 'pre',
        configResolved: function(config) {
            buildMode = config.mode
            process.stdout.write('\n================================================================================\n')
            process.stdout.write('START BUILD\n')
            process.stdout.write('================================================================================\n')
            process.stdout.write('  Mode:             ' + buildMode.toUpperCase() + '\n')
            process.stdout.write('================================================================================\n\n')
        },
        buildStart: function() {
            startTime = Date.now()
        },
        buildEnd: function(error) {
            var duration = Date.now() - startTime
            var minutes = Math.floor(duration / 60000)
            var seconds = ((duration % 60000) / 1000).toFixed(2)
            var timestamp = getTimestamp()
            var localTime = getLocalTime()

            process.stdout.write('\n================================================================================\n')
            process.stdout.write('BUILD REPORT\n')
            process.stdout.write('================================================================================\n')
            process.stdout.write('  Date:             ' + localTime + '\n')
            process.stdout.write('  Mode:             ' + buildMode + '\n')
            process.stdout.write('  Duration:         ' + (minutes > 0 ? minutes + ' min ' : '') + seconds + ' sec\n')
            process.stdout.write('  Status:           ' + (error ? '❌ ERROR' : '✅ SUCCESS') + '\n')
            if (error) {
                process.stdout.write('  Error:            ' + error.message + '\n')
            }
            process.stdout.write('================================================================================\n\n')

            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true })
            }

            var logFile = path.join(logsDir, 'build-time.log')
            fs.appendFileSync(logFile, '[' + timestamp + '] ' + buildMode + ': ' + (minutes > 0 ? minutes + 'm ' : '') + seconds + 's' + (error ? ' ERROR' : ' OK') + '\n')

            var detailFile = path.join(logsDir, 'build-' + Date.now() + '.json')
            fs.writeFileSync(detailFile, JSON.stringify({
                timestamp: timestamp,
                localTime: localTime,
                mode: buildMode,
                duration: {
                    milliseconds: duration,
                    seconds: duration / 1000,
                    minutes: duration / 60000
                },
                success: !error,
                error: error ? error.message : null
            }, null, 2))

            process.stdout.write('📄 Log saved: ' + logFile + '\n')
            process.stdout.write('📄 Detail report: ' + detailFile + '\n\n')
        }
    }
}

export function chunkSizeLogger() {
    return {
        name: 'chunk-size-logger',
        enforce: 'post',
        closeBundle: function() {
            if (!fs.existsSync(buildDir)) {
                process.stdout.write('⚠️  Build folder not found: ' + buildDir + '\n')
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

            process.stdout.write('\n================================================================================\n')
            process.stdout.write('CHUNK SIZES\n')
            process.stdout.write('================================================================================\n')

            files.forEach(function(file, index) {
                process.stdout.write('  ' + String(index + 1).padStart(2) + '. ' + file.name.padEnd(50) + ' ' + file.sizeFormatted.padStart(10) + ' | gzip: ' + file.gzipFormatted + '\n')
            })

            process.stdout.write('--------------------------------------------------------------------------------\n')
            process.stdout.write('  TOTAL: ' + files.length + ' files | ' + formatBytes(totalSize).padStart(10) + ' | gzip: ' + formatBytes(totalGzip) + '\n')
            process.stdout.write('  PATH: ' + buildDir + '\n')
            process.stdout.write('================================================================================\n\n')

            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true })
            }

            var logFile = path.join(logsDir, 'chunk-sizes.log')
            var timestamp = getTimestamp()
            fs.appendFileSync(logFile, '\n[' + timestamp + ']\n')

            var detailFile = path.join(logsDir, 'chunks-' + Date.now() + '.json')
            fs.writeFileSync(detailFile, JSON.stringify({
                timestamp: timestamp,
                chunks: files,
                total: {
                    size: totalSize,
                    sizeFormatted: formatBytes(totalSize),
                    gzip: totalGzip,
                    gzipFormatted: formatBytes(totalGzip)
                }
            }, null, 2))

            process.stdout.write('📄 Log saved: ' + logFile + '\n')
            process.stdout.write('📄 Detail report: ' + detailFile + '\n\n')
        }
    }
}

export const BUNDLE_ANALYZER = {
    open: false,
    filename: 'public/stats.html',
    template: 'treemap',
    gzipSize: true,
    brotliSize: true,
    projectRoot: '/',
    sourcemap: true
}

export const ELEMENT_LOCALES = [
    'element-plus/dist/locale/ru.mjs',
    'element-plus/dist/locale/en.mjs',
    'element-plus/dist/locale/zh-cn.mjs'
]

export function createAliases(root, __dirname) {
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

export function assetNamingStrategy(name) {
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

export function charsetRemovalPlugin() {
    return {
        postcssPlugin: 'internal:charset-removal',
        AtRule: {
            charset: function(atRule) {
                if (atRule.name === 'charset') atRule.remove()
            }
        }
    }
}

export function createManualChunks() {
    return function(id) {
        if (id.includes('element-plus/dist/locale')) {
            return 'element-locales'
        }
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
        if (id.includes('node_modules/element-plus') && !id.includes('element-plus/dist/locale')) {
            return 'element-plus'
        }
        if (id.includes('node_modules/axios')) {
            return 'http-client'
        }
        if (id.includes('node_modules/laravel-echo')) {
            return 'laravel-echo'
        }
        if (id.includes('node_modules/pusher-js')) {
            return 'pusher'
        }
        if (id.includes('node_modules/echarts')) {
            return 'echarts'
        }
        if (id.includes('node_modules/three')) {
            return 'three'
        }
        if (id.includes('node_modules/lodash') || id.includes('node_modules/lodash-es')) {
            return 'lodash'
        }
        if (id.includes('node_modules/dayjs')) {
            return 'dayjs'
        }
        if (id.includes('node_modules/moment')) {
            return 'moment'
        }
        if (id.includes('node_modules/qrcode')) {
            return 'qrcode'
        }
        if (id.includes('node_modules/vuedraggable') || id.includes('node_modules/vue-draggable')) {
            return 'draggable'
        }
        if (id.includes('node_modules')) {
            return 'vendor'
        }
        if (id.includes('.ttf') || id.includes('.woff') || id.includes('.woff2')) {
            return 'fonts'
        }
        return undefined
    }
}

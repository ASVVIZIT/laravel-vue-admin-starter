// bs-config.cjs
module.exports = {
    port: 3000,

    // ✅ ОПТИМИЗИРОВАННЫЙ ПРОКСИ
    proxy: {
        target: 'http://94.41.87.10:8050',
        ws: true,

        // ✅ НЕ МЕНЯТЬ ЗАГОЛОВКИ (меньше накладных расходов)
        proxyReq: [],
        proxyRes: []
    },

    // ✅ СЛУШАТЬ ВСЕ ИНТЕРФЕЙСЫ
    listen: '0.0.0.0',

    // ✅ ОТСЛЕЖИВАТЬ ТОЛЬКО JS/CSS (не blade)
    files: [
        'public/build/assets/js/**/*.js',
        'public/build/assets/css/**/*.css'
    ],

    // ✅ ОТКЛЮЧИТЬ ЛИШНЕЕ
    notify: false,
    open: false,
    ghostMode: false,  // ← ← ← ОТКЛЮЧИТЬ СИНХРОНИЗАЦИЮ

    // ✅ МИНИМАЛЬНЫЕ ЗАДЕРЖКИ
    reloadDelay: 1000,  // Было 3000
    reloadDebounce: 500, // Было 2000
    reloadThrottle: 0,

    // ✅ ОТКЛЮЧИТЬ HTTPS
    https: false,

    // ✅ ИГНОРИРОВАТЬ
    ignore: ['node_modules', 'vendor', 'storage', 'logs', '.git'],

    // ✅ МИНИМАЛЬНОЕ ЛОГИРОВАНИЕ
    logLevel: 'warn',
    logPrefix: 'BS',
    logConnections: false,
    logFileChanges: false,  // ← ← ← ОТКЛЮЧИТЬ

    // ✅ CORS
    cors: {
        origin: true,
        credentials: true
    },

    // ✅ ТУННЕЛЬ ОТКЛЮЧЕН
    tunnel: false,
    online: true
}

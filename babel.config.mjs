// babel.config.cjs
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: '20.0.0', // Целевая версия Node.js
                    browsers: 'defaults and supports es6-module' // Современные браузеры с поддержкой ES модулей
                },
                modules: false, // Сохранять ES модули для tree-shaking
                bugfixes: true,
                useBuiltIns: 'usage',
                corejs: { version: '3.26', proposals: true }
            }
        ],
        [
            '@babel/preset-typescript',
            {
                allExtensions: true,
                isTSX: true,
                jsxPragma: 'h',
                allowDeclareFields: true
            }
        ]
    ],
    plugins: [
        // Поддержка Vue 3 Composition API
        ['@babel/plugin-proposal-decorators', { version: '2023-05' }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],

        // Оптимизации для Vue 3
        ['@vue/babel-plugin-jsx', {
            // Опциональные настройки
            optimize: true,
            enableObjectSlots: false
        }],
        '@babel/plugin-transform-runtime'
    ],
    assumptions: {
        setPublicClassFields: true,
        privateFieldsAsProperties: true
    },
    env: {
        production: {
            plugins: [
                ['transform-remove-console', { exclude: ['error', 'warn'] }]
            ]
        }
    }
};

import path from 'path'
import {defineConfig} from 'vite'
import laravel from 'laravel-vite-plugin';
import VueSetupExtend from 'unplugin-vue-setup-extend/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'

function resolve(dir: any) {

    return path.join(

        __dirname,
        '/resources/js',
        dir
    );
}

export default defineConfig({
    base: '/build/',
    //define global var
    define: {
        //fix "path" module issue
        'process.platform': null,
        'process.version': null,
        'import.meta.env': {}
    },
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
        vue(),
        vueJsx(),
        VueSetupExtend(),
        ElementPlus({
            useSource: true,
        }),
        //https://github.com/antfu/unplugin-auto-import/blob/HEAD/src/types.ts
        AutoImport({
            // resolvers: [ElementPlusResolver()],
            imports: [
                'vue',
                'vue-router'
            ],
            eslintrc: {
                enabled: true, // Default `false`
                filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
                globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
            },
            dts: true //auto generation auto-imports.d.ts file
        }),
    ],
    resolve: {
        alias: {
            '@': path.join(__dirname, '/resources/js'),
            '@styles': path.join(__dirname, '/resources/js/styles'),
            '@api': path.join(__dirname, '/resources/js/api'),
            '@lang': path.join(__dirname, '/resources/js/lang'),
            '@utils': path.join(__dirname, '/resources/js/utils'),
            '@router': path.join(__dirname, '/resources/js/router'),
            '@assets': path.join(__dirname, '/resources/js/assets'),
            '@constants': path.join(__dirname, '/resources/js/constants'),
            '@layout': path.join(__dirname, '/resources/js/layout'),
            '@components': path.join(__dirname, '/resources/js/components'),
            '@store': path.join(__dirname, '/resources/js/store'),
            '@views': path.join(__dirname, '/resources/js/views'),
            'element-plus': path.resolve(__dirname, 'node_modules/element-plus'),
            //remove i18n waring
            'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
        },
        extensions: ['.jsx', '.js', '.vue', '.json', '.scss', '.sass']
    },
    build: {
        // Сгенерируйте манифест в OutDir.json-файл
        manifest: 'manifest.json',
        copyPublicDir: true,
        outDir: 'public/build',
        // Устраните предупреждения о превышении размера пакета
        chunkSizeWarningLimit: 2000,
        //remote console.log in prod
        terserOptions: {
            //detail to look https://terser.org/docs/api-reference#compress-options
            compress: {
                drop_console: false,
                pure_funcs: ['console.log', 'console.info'],
                drop_debugger: false
            }
        },
        rollupOptions: {
            // 覆盖默认的 .html 入口
            input: 'resources/js/app.js',
            output: {
                // Форсируем генерацию манифеста в outDir
                entryFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash].[ext]'
            }
        }
    },
    css: {
        devSourcemap: true,
        postcss: {
            //remove build charset warning
            plugins: [
                {
                    postcssPlugin: 'internal:charset-removal',
                    AtRule: {
                        charset: (atRule) => {
                            if (atRule.name === 'charset') {
                                atRule.remove()
                            }
                        }
                    }
                }
            ]
        },
        preprocessorOptions: {
            //define global scss variable
            scss: {
                //implementation: require('sass'),
                api: "modern",
                quietDeps: true,
                additionalData: `
                    @use "@/styles/core/variables" as *;
                    @use "@/styles/custom-element-plus/proxy" as *;
                `
            }
        }
    },
})

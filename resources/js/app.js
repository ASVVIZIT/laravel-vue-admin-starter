// resources/js/App.js

// ==============================================
// SECTION 1: — Bootstrap (настройка axios)
// ==============================================
import '@/bootstrap'  // Настраивает window.axios

// ==============================================
// SECTION 2: 🔥 Загрузка конфига авторизации
// ==============================================
import { initAuthConfig } from '@/utils/authConfig'

// ==============================================
// SECTION 3: Импорт глобальных стилей и иконок
// ==============================================
import '@styles/main.scss'
import 'bootstrap-icons/font/bootstrap-icons.scss'

// ==============================================
// SECTION 4: Импорт сторонних библиотек
// ==============================================
import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
const pinia = createPinia()

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { dayjs } from 'element-plus'

import moment from 'moment-timezone'

// ==============================================
// SECTION 5: Импорт компонентов приложения
// ==============================================
import App from '@views/App.vue'
import Icon from '@components/Icon/Icon.vue'
import SvgIcon from '@components/SvgIcon.vue'

// ==============================================
// SECTION 6: Маршрутизация и безопасность
// ==============================================
import router from '@/router'
import '@/permission'

// ==============================================
// SECTION 7: Локализация
// ==============================================
import i18n, { getLanguage } from './lang'

// ==============================================
// SECTION 8: Инициализация временных настроек
// ==============================================
const timeZone = "Asia/Yekaterinburg"
moment.locale('ru-ru')
moment.tz(timeZone)

// ==============================================
// SECTION 9: Директивы
// ==============================================
import TalkStreamDirective from '@/modules/TalkStream/Directives/loadingDirective'

// ==============================================
// SECTION 10: 🔥 АСИНХРОННАЯ ИНИЦИАЛИЗАЦИЯ
// ==============================================
(async () => {
    // 1️⃣ Загружаем конфиг авторизации ПЕРЕД монтированием
    await initAuthConfig()

    // 2️⃣ Создаём приложение
    const app = createApp(App)
    app.config.devtools = true
    app.config.globalProperties.moment = moment

    const initialLanguage = getLanguage()
    dayjs.locale(initialLanguage)

    // 3️⃣ Подключаем плагины
    app.use(pinia)
    app.use(ElementPlus, { size: 'small' })
    app.use(i18n)
    app.use(router)
    app.use(TalkStreamDirective)

    // 4️⃣ Глобальная регистрация компонентов
    app.component('SvgIcon', SvgIcon)
    app.component('Icon', Icon)

    // 5️⃣ Монтируем приложение
    app.mount('#app')

    // 6️⃣ Следим за изменением языка
    watch(
        () => i18n.global.locale.value,
        (newLang) => {
            dayjs.locale(newLang)
        }
    )

    console.log('[App] ✅ Приложение инициализировано')
})()

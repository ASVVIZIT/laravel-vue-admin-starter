// resources/js/App.js

// ==============================================
// SECTION 1: Импорт глобальных стилей и иконок
// ==============================================
import '@styles/main.scss'
import 'bootstrap-icons/font/bootstrap-icons.scss'

// ==============================================
// SECTION 2: Импорт сторонних библиотек
// SUBSECTION 2.1: Базовые утилиты
// ----------------------------
import { createApp, watch } from 'vue'
// Подключение Pinia
import { createPinia } from 'pinia'
const pinia = createPinia()

// ----------------------------
// SUBSECTION 2.2: UI-библиотека ElementPlus
// ----------------------------
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { dayjs } from 'element-plus'

// ----------------------------
// SUBSECTION 2.3: Работа с датами/временем
// ----------------------------
import moment from 'moment-timezone'

// ==============================================
// SECTION 3: Импорт компонентов приложения
// ==============================================
import App from '@views/App.vue' // Обновленный App.vue
import Icon from '@components/Icon/Icon.vue'
import SvgIcon from '@components/SvgIcon.vue'

// ==============================================
// SECTION 4: Маршрутизация и безопасность
// ==============================================
import router from '@/router'
import '@/permission'

// ==============================================
// SECTION 5: Локализация
// ==============================================
import i18n, { getLanguage } from './lang'

// ==============================================
// SECTION 6: Инициализация временных настроек
// ==============================================
const timeZone = "Asia/Yekaterinburg"
moment.locale('ru-ru')
moment.tz(timeZone)

// Глобальные настройки
const app = createApp(App)
app.config.devtools = true
app.config.globalProperties.moment = moment

// Установка начальной локали dayjs
const initialLanguage = getLanguage()
dayjs.locale(initialLanguage)

// ==============================================
// SECTION 7: Подключение плагинов
// ==============================================
app.use(pinia)
app.use(ElementPlus, {
    size: 'small',
})
app.use(i18n)
app.use(router)

import TalkStreamDirective from '@/modules/TalkStream/Directives/loadingDirective'
app.use(TalkStreamDirective)

// ==============================================
// SECTION 8: Глобальная регистрация компонентов
// ==============================================
app.component('SvgIcon', SvgIcon)
app.component('Icon', Icon)

app.mount('#app')

// Следим за изменением языка только для dayjs
watch(
    () => i18n.global.locale.value,
    (newLang) => {
        dayjs.locale(newLang)
    }
)

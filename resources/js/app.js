// ==============================================
// SECTION 1: Импорт глобальных стилей и иконок
// ==============================================
import '@styles/main.scss'
import 'bootstrap-icons/font/bootstrap-icons.scss'

// ==============================================
// SECTION 2: Импорт сторонних библиотек
// SUBSECTION 2.1: Базовые утилиты
// ----------------------------
import Cookies from 'js-cookie'
import { createApp, watch } from 'vue'
const app = createApp(App)

// Подключение Pinia
import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)

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
/*import 'dayjs/locale/ru'
import 'dayjs/locale/en'
import 'dayjs/locale/zh'*/

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
app.config.devtools = true;
app.config.globalProperties.moment = moment

// Установка начальной локали dayjs
const initialLanguage = getLanguage();
dayjs.locale(initialLanguage);

// ==============================================
// SECTION 8: Подключение плагинов
// ==============================================

// Подключаем ElementPlus без передачи локали
app.use(ElementPlus, {
  size: 'small',
  //i18n: (key, value) => i18n.t(key, value), // Интеграция с системой i18n
})

// ==============================================
// SECTION 9: Глобальная регистрация компонентов
// ==============================================
app.component('SvgIcon', SvgIcon)
app.component('Icon', Icon)

// ==============================================
// SECTION 10: Запуск приложения
// ==============================================
app
    .use(i18n)
    .use(router)

// Следим за изменением языка только для dayjs
watch(
    () => i18n.global.locale.value,
    (newLang) => {
      dayjs.locale(newLang);
    }
);

app.mount('#app')

// ==============================================
// SECTION 1: Импорт глобальных стилей и иконок
// ==============================================
import '@styles/main.scss'          // Основные SCSS-стили проекта (кастомные переменные, миксины, сброс стилей)
import 'bootstrap-icons/font/bootstrap-icons.scss' // Иконки Bootstrap (глобальное подключение всех иконок)

// ==============================================
// SECTION 2: Импорт сторонних библиотек
// SUBSECTION 2.1: Базовые утилиты
// ----------------------------
import Cookies from 'js-cookie'      // Работа с cookies (хранение настроек размера компонентов)
import { createApp } from 'vue'      // Ядро Vue 3 для создания экземпляра приложения

const app = createApp(App)           // Инициализация Vue-приложения

// Подключение Pinia (состояние приложения)
import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)

/*import { appStore } from '@/store/app'
const store = appStore()*/

// ----------------------------
// SUBSECTION 2.2: UI-библиотека ElementPlus
// ----------------------------
import ElementPlus from 'element-plus' // Основной пакет ElementPlus UI-компонентов
import 'element-plus/dist/index.css'   // Базовые стили ElementPlus (обязательное подключение)
import { dayjs } from 'element-plus'   // Интеграция dayjs для работы с датами в ElementPlus
import elementLocale from 'element-plus/es/locale/lang/ru' // Локализация ElementPlus на русский язык

// ----------------------------
// SUBSECTION 2.3: Работа с датами/временем
// ----------------------------
import moment from 'moment-timezone'      // Библиотека для продвинутой работы с датами и временными зонами
import dayjsLocale from 'dayjs/locale/ru' // Локализация dayjs для русского языка

// ==============================================
// SECTION 3: Импорт компонентов приложения
// ==============================================
import App from '@views/App.vue'                  // Корневой компонент-контейнер приложения
import Icon from '@components/Icon/Icon.vue'      // Кастомный компонент для SVG-иконок
import SvgIcon from '@components/SvgIcon.vue' // Обёртка для иконок ElementPlus

// ==============================================
// SECTION 4: Маршрутизация и безопасность
// ==============================================
import router from '@/router'        // Конфигурация маршрутов (vue-router)
import '@/permission'                // Система контроля доступа (навигационные хуки)

// ==============================================
// SECTION 5: Локализация
// ==============================================
import i18n from './lang'            // Модуль интернационализации (vue-i18n конфиг)

// ==============================================
// SECTION 6: Инициализация временных настроек
// ==============================================
const timeZone = "Asia/Yekaterinburg"  // Установка временной зоны для всего приложения
moment.locale('ru-ru')         // Локализация moment.js
moment.tz(timeZone)                    // Применение временной зоны

// Глобальные настройки
app.config.devtools = true;
app.config.globalProperties.moment = moment // Экспорт moment в глобальные свойства
dayjs.locale(dayjsLocale)                   // Применение локали для dayjs

// ==============================================
// SECTION 8: Подключение плагинов
// ==============================================

// Подключение ElementPlus с кастомными параметрами

app.use(ElementPlus, {
  size: 'small',
  i18n: (key, value) => i18n.t(key, value), // Интеграция с системой i18n
  locale: elementLocale                     // Применение русской локализации
})

// ==============================================
// SECTION 9: Глобальная регистрация компонентов
// ==============================================
app.component('SvgIcon', SvgIcon) // Глобальная регистрация SVG-иконок
app.component('Icon', Icon)           // Глобальная регистрация кастомных иконок

// ==============================================
// SECTION 10: Запуск приложения
// ==============================================
app
    .use(i18n)                  // Активация системы i18n
    .use(router)                // Активация маршрутизатора
    .mount('#app')   // Монтирование в DOM-элемент #app

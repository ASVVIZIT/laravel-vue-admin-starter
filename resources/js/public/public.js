import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// ✅ ВАЖНО: Порядок установки плагинов
app.use(createPinia())
app.use(router)          // ← Роутер ДО ElementPlus
app.use(ElementPlus)

// ✅ Монтируем ПОСЛЕ установки всех плагинов
app.mount('#public-app')

console.log('[Public] App mounted successfully')

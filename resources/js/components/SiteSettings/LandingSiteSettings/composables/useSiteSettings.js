import { ref, computed } from 'vue'
import request from '@/utils/request'

const MODES = [
    { value: 'maintenance', icon: '🚧', label: 'Заглушка', description: 'Страница "В разработке"', color: '#f39c12' },
    { value: 'landing', icon: '🎨', label: 'Лендинг', description: 'Показать выбранный лендинг', color: '#3498db' },
    { value: 'production', icon: '🚀', label: 'Продакшн', description: 'Полноценный сайт', color: '#27ae60' },
    { value: 'preview', icon: '👁️', label: 'Превью', description: 'Только для админов', color: '#9b59b6' },
]

export function useSiteSettings() {
    const loading = ref(false)
    const saving = ref(false)
    const error = ref(null)
    const currentMode = ref('maintenance')
    const maintenanceHtml = ref('')

    const modes = computed(() => MODES)
    const currentModeMeta = computed(() => MODES.find(m => m.value === currentMode.value) || MODES[0])

    async function fetchSettings() {
        loading.value = true
        error.value = null
        try {
            console.log(' [API] Запрос настроек к серверу...')
            const { data } = await request.get('/landing/settings/public-mode')

            console.log('✅ [API] Ответ от сервера:', data)

            // Проверяем, пришел ли HTML с сервера
            if (data.maintenance_html && data.maintenance_html.length > 0) {
                console.log('💾 [DB] Найден сохраненный HTML в базе! Длина:', data.maintenance_html.length)
                maintenanceHtml.value = data.maintenance_html
            } else {
                console.warn('⚠️ [DB] В базе HTML пустой. Загружаю дефолтный...')
                maintenanceHtml.value = getDefaultMaintenanceHtml()
            }

            currentMode.value = data.mode || 'maintenance'

        } catch (e) {
            console.error('❌ [API] Ошибка загрузки:', e)
            error.value = 'Не удалось загрузить настройки режима'
            maintenanceHtml.value = getDefaultMaintenanceHtml() // Фолбэк
        } finally {
            loading.value = false
        }
    }

    async function switchMode(mode) {
        saving.value = true
        error.value = null
        try {
            // ✅ БЕЗ /api
            await request.post(`/landing/settings/switch/${mode}`)
            currentMode.value = mode
        } catch (e) {
            error.value = `Не удалось переключить режим: ${e.message}`
            console.error('[useSiteSettings] switchMode:', e)
            throw e
        } finally {
            saving.value = false
        }
    }

    async function saveMaintenanceHtml(html) {
        saving.value = true
        error.value = null

        console.log(' [1] НАЧАЛО СОХРАНЕНИЯ')
        console.log('   Длина HTML:', html.length)
        console.log('   Первые 100 символов:', html.substring(0, 100))

        try {
            console.log('🔵 [2] Отправляю POST запрос на landing/settings/maintenance-html')

            const response = await request.post('/landing/settings/maintenance-html', { html })

            console.log('🟢 [3] Ответ от сервера:', response)
            console.log('   Тип ответа:', typeof response)
            console.log('   Содержимое:', JSON.stringify(response))

            maintenanceHtml.value = html

        } catch (e) {
            console.error(' [ОШИБКА] Не удалось сохранить:', e)
            console.error('   Response data:', e.response?.data)
            console.error('   Status:', e.response?.status)
            error.value = `Не удалось сохранить HTML: ${e.message}`
            throw e
        } finally {
            saving.value = false
        }
    }

    function getDefaultMaintenanceHtml() {
        return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Сайт в разработке</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0e27; color: #fff; font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
    h1 { font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(135deg, #ff6b35, #f7931e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { font-size: 1.2rem; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚧 Сайт в разработке</h1>
    <p>Мы готовим что-то невероятное. Скоро открытие!</p>
  </div>
</body>
</html>`
    }

    return { loading, saving, error, currentMode, maintenanceHtml, modes, currentModeMeta, fetchSettings, switchMode, saveMaintenanceHtml }
}

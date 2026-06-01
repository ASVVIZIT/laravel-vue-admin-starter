/**
 * ============================================================================
 * TRAINING FILTER CONFIG — ДИНАМИЧЕСКАЯ КОНФИГУРАЦИЯ
 * ============================================================================
 */

import { InfoFilled, CircleCheck, Clock, Calendar } from '@element-plus/icons-vue'

export const FILTER_BLOCKS = {
    date: {
        shortcuts: [
            { text: 'Сегодня', value: () => new Date() },
            { text: 'Вчера', value: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d } },
            { text: 'Завтра', value: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d } }
        ],
        quickButtons: [
            { id: 'today', label: 'Сегодня' },
            { id: 'yesterday', label: 'Вчера' },
            { id: 'tomorrow', label: 'Завтра' }
        ]
    },
    exercise: {
        hint: {
            none: { text: 'Выберите упражнение', icon: InfoFilled },
            all: { text: 'Доступны все упражнения из базы', icon: InfoFilled },
            filtered: { text: 'Показаны только выполненные', icon: CircleCheck }
        }
    },
    range: {
        shortcuts: [
            { text: 'Неделя', value: () => { const d = new Date(); const s = new Date(d); s.setDate(d.getDate() - (d.getDay() || 7) + 1); return [s, d] } },
            { text: 'Месяц', value: () => { const d = new Date(); return [new Date(d.getFullYear(), d.getMonth(), 1), d] } }
        ],
        quickButtons: [
            { id: 'week', label: 'Неделя' },
            { id: 'month', label: 'Месяц' },
            { id: 'quarter', label: 'Квартал' },
            { id: 'halfyear', label: 'Полгода' }
        ],
        hint: {
            none: { text: 'Период не выбран', icon: Clock },
            active: { text: 'Фильтр по периоду активен', icon: Calendar }
        }
    }
}

export default { FILTER_BLOCKS }

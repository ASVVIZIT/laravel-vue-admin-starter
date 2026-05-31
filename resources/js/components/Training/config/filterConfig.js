/**
 * ============================================================================
 * TRAINING FILTER CONFIG — КОНФИГУРАЦИЯ ФИЛЬТРОВ
 * ============================================================================
 */

export const QUICK_DATES = [
    { id: 'today', label: 'Сегодня', offsetDays: 0 },
    { id: 'yesterday', label: 'Вчера', offsetDays: -1 },
    { id: 'tomorrow', label: 'Завтра', offsetDays: 1 }
]

export const QUICK_RANGES = [
    { id: 'week', label: 'Неделя', type: 'week' },
    { id: 'month', label: 'Месяц', type: 'month' },
    { id: 'quarter', label: 'Квартал', type: 'quarter' },
    { id: 'halfyear', label: 'Полгода', type: 'halfyear' }
]

export const DATE_SHORTCUTS = [
    { text: 'Сегодня', value: () => new Date() },
    { text: 'Вчера', value: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d } },
    { text: 'Завтра', value: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d } }
]

export const RANGE_SHORTCUTS = [
    { text: 'Эта неделя', value: () => {
            const d = new Date(); const day = d.getDay() || 7; const s = new Date(d); s.setDate(d.getDate() - day + 1); return [s, d]
        }},
    { text: 'Этот месяц', value: () => { const d = new Date(); return [new Date(d.getFullYear(), d.getMonth(), 1), d] } },
    { text: 'Квартал', value: () => {
            const d = new Date(); const q = Math.floor(d.getMonth() / 3); const s = new Date(d.getFullYear(), q * 3, 1); const e = new Date(d.getFullYear(), q * 3 + 3, 0); return [s, e]
        }},
    { text: 'Полгода', value: () => {
            const d = new Date(); const h = d.getMonth() >= 6 ? 6 : 0; return [new Date(d.getFullYear(), h, 1), d]
        }}
]

export default { QUICK_DATES, QUICK_RANGES, DATE_SHORTCUTS, RANGE_SHORTCUTS }

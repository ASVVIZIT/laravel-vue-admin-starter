// ============================================================================
// УТИЛИТЫ СОРТИРОВКИ — КАНАЛЫ
// ============================================================================
// 📁 Путь: utils/sortChannels.js
// ✅ Используется: channelStore.js, ChannelList.vue
// ✅ Безопасно менять — влияет только на сортировку каналов
// ============================================================================

// ============================================================================
// SORT CHANNELS — Сортировка каналов
// ============================================================================

export function sortChannels(channels, sortValue) {
    const sorted = [...channels];

    switch (sortValue) {
        case 'id_asc':
            return sorted.sort((a, b) => a.id - b.id);

        case 'id_desc':
            return sorted.sort((a, b) => b.id - a.id);

        case 'type_asc':
            return sorted.sort((a, b) => (a.type || '').localeCompare(b.type || ''));

        case 'type_desc':
            return sorted.sort((a, b) => (b.type || '').localeCompare(a.type || ''));

        case 'title_asc':
            return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

        case 'title_desc':
            return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));

        case 'company_asc':
            return sorted.sort((a, b) => {
                const aCompany = a.company?.name || '';
                const bCompany = b.company?.name || '';
                return aCompany.localeCompare(bCompany);
            });

        case 'company_desc':
            return sorted.sort((a, b) => {
                const aCompany = a.company?.name || '';
                const bCompany = b.company?.name || '';
                return bCompany.localeCompare(aCompany);
            });

        case 'order_asc':
            return sorted.sort((a, b) => (a.order_column || 0) - (b.order_column || 0));

        case 'order_desc':
            return sorted.sort((a, b) => (b.order_column || 0) - (a.order_column || 0));

        case 'created_at_desc':
            return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        case 'created_at_asc':
            return sorted.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

        default:
            // По умолчанию сортировка по order_column
            return sorted.sort((a, b) => (a.order_column || 0) - (b.order_column || 0));
    }
}

// ============================================================================
// SORT ITEMS — Универсальная сортировка (уже есть в utils/sort.js)
// ============================================================================
// export function sortItems(items, sortValue, key = null) { ... }
// Можно импортировать из utils/sort.js

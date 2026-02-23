// ============================================================================
// УТИЛИТЫ СОРТИРОВКИ
// ============================================================================

export function sortCompanies(companies, sortValue) {
    const sorted = [...companies];

    switch (sortValue) {
        case 'id_asc':
            return sorted.sort((a, b) => a.id - b.id);
        case 'id_desc':
            return sorted.sort((a, b) => b.id - a.id);
        case 'name_asc':
            return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        case 'name_desc':
            return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        case 'created_at_desc':
            return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        case 'created_at_asc':
            return sorted.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        default:
            return sorted;
    }
}

export function sortItems(items, sortValue, key = null) {
    const sorted = [...items];

    if (key) {
        return sorted.sort((a, b) => {
            const aVal = a[key] || '';
            const bVal = b[key] || '';
            return sortValue === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        });
    }

    return sortCompanies(sorted, sortValue);
}

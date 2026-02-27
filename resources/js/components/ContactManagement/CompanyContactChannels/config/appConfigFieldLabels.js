// ============================================================================
// APP CONFIG FIELD LABELS — ПОЛЯ И МЕТОК
// ============================================================================
// 📁 Путь: config/appConfigFieldLabels.js
// ✅ Используется: CompanyForm.vue, CompanyList.vue, CompanyTable.vue
// ✅ Безопасно менять — влияет только на отображение меток полей
// ============================================================================

// ============================================================================
// COMPANY FIELD LABELS
// ============================================================================

export const COMPANY_FIELD_LABELS = {
    id: 'ID',
    name: 'Название',
    description: 'Описание',
    address: 'Адрес',
    'settings.icon': 'Иконка',
    'settings.color': 'Цвет',
    phone: 'Телефон',
    email: 'Email',
    website: 'Сайт',
    created_at: 'Дата создания',
    updated_at: 'Дата обновления',
};

// ============================================================================
// CONTACT CHANNEL FIELD LABELS
// ============================================================================

export const CONTACT_CHANNEL_FIELD_LABELS = {
    id: 'ID',
    type: 'Тип',
    value: 'Значение',
    label: 'Метка',
    is_primary: 'Основной',
    sort_order: 'Порядок',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getFieldLabel(fieldName, entityType = 'company', fallback = fieldName) {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    const labels = labelsMap[entityType] || COMPANY_FIELD_LABELS;
    return labels[fieldName] || fallback;
}

export function getFieldLabels(entityType = 'company') {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    return labelsMap[entityType] || COMPANY_FIELD_LABELS;
}

export function setFieldLabel(fieldName, label, entityType = 'company') {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    const labels = labelsMap[entityType] || COMPANY_FIELD_LABELS;
    labels[fieldName] = label;
}

export function hasFieldLabel(fieldName, entityType = 'company') {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    const labels = labelsMap[entityType] || COMPANY_FIELD_LABELS;
    return fieldName in labels;
}

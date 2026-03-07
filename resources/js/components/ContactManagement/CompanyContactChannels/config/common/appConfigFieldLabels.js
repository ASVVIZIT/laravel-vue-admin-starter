// ============================================================================
// APP CONFIG FIELD LABELS — ПОЛЯ И МЕТОК
// ============================================================================
// 📁 Путь: config/common/appConfigFieldLabels.js
// ✅ Используется: CompanyForm.vue, CompanyList.vue, CompanyTable.vue
// ✅ Безопасно менять — влияет только на отображение меток полей
// ============================================================================

// ============================================================================
// COMPANY FIELD LABELS (метки полей компании)
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
// CONTACT CHANNEL FIELD LABELS (метки полей каналов связи)
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

// ✅ Получить метку поля
export function getFieldLabel(fieldName, entityType = 'company', fallback = fieldName) {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    const labels = labelsMap[entityType] || COMPANY_FIELD_LABELS;
    return labels[fieldName] || fallback;
}

// ✅ Получить все метки полей
export function getFieldLabels(entityType = 'company') {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    return labelsMap[entityType] || COMPANY_FIELD_LABELS;
}

// ✅ Установить метку поля
export function setFieldLabel(fieldName, label, entityType = 'company') {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    const labels = labelsMap[entityType] || COMPANY_FIELD_LABELS;
    labels[fieldName] = label;
}

// ✅ Проверить наличие метки поля
export function hasFieldLabel(fieldName, entityType = 'company') {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    const labels = labelsMap[entityType] || COMPANY_FIELD_LABELS;
    return fieldName in labels;
}

// ✅ Получить все доступные типы сущностей
export function getEntityTypes() {
    return ['company', 'contactChannel'];
}

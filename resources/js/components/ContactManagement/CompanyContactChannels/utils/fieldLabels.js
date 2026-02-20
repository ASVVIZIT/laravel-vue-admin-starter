// ============================================================================
// 🏷️ ЛОКАЛИЗАЦИЯ НАЗВАНИЙ ПОЛЕЙ (БЕЗ i18n)
// ============================================================================

/**
 * Названия полей для компании (Company)
 */
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

/**
 * Названия полей для контактных каналов (ContactChannel)
 */
export const CONTACT_CHANNEL_FIELD_LABELS = {
    id: 'ID',
    type: 'Тип',
    value: 'Значение',
    label: 'Метка',
    is_primary: 'Основной',
    sort_order: 'Порядок',
};

/**
 * Универсальная функция получения названия поля
 */
export function getFieldLabel(fieldName, entityType = 'company', fallback = fieldName) {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    const labels = labelsMap[entityType] || COMPANY_FIELD_LABELS;
    return labels[fieldName] || fallback;
}

/**
 * Получить все метки для типа сущности
 */
export function getFieldLabels(entityType = 'company') {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    return labelsMap[entityType] || COMPANY_FIELD_LABELS;
}

/**
 * Добавить или обновить метку поля
 */
export function setFieldLabel(fieldName, label, entityType = 'company') {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    const labels = labelsMap[entityType] || COMPANY_FIELD_LABELS;
    labels[fieldName] = label;
}

/**
 * Проверить существует ли метка для поля
 */
export function hasFieldLabel(fieldName, entityType = 'company') {
    const labelsMap = {
        company: COMPANY_FIELD_LABELS,
        contactChannel: CONTACT_CHANNEL_FIELD_LABELS,
    };

    const labels = labelsMap[entityType] || COMPANY_FIELD_LABELS;
    return fieldName in labels;
}

/**
 * Экспорт по умолчанию (для удобства)
 */
export default {
    COMPANY_FIELD_LABELS,
    CONTACT_CHANNEL_FIELD_LABELS,
    getFieldLabel,
    getFieldLabels,
    setFieldLabel,
    hasFieldLabel,
};

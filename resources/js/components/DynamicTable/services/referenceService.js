// resources/js/components/DynamicTable/services/referenceService.js
import { referenceApi } from '../api/referenceApi';
import { MOCK_REFERENCE_DATA } from './mockData';

// Кэш для типов справочников
const entityTypeCache = {
    data: null,
    timestamp: null,
    loading: false
};

// Кэш для полей справочников
const referenceFieldsCache = new Map();

// Кэш для данных справочников
const referenceDataCache = new Map();

// Время жизни кэша (5 минут)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Загружает типы справочников с кэшированием
 *
 * @returns {Promise<Array>} Массив типов справочников
 * @throws {Error} При ошибке загрузки
 */
export const getEntityTypes = async () => {
    // Проверяем кэш
    const now = Date.now();

    if (entityTypeCache.data && (now - entityTypeCache.timestamp < CACHE_TTL)) {
        console.log('[referenceService.getEntityTypes] Returning cached data');
        return entityTypeCache.data;
    }

/*    // Проверяем, идет ли уже загрузка
    if (entityTypeCache.loading) {
        console.log('[referenceService.getEntityTypes] Already loading, waiting...');
        // Ожидаем завершения текущей загрузки
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (!entityTypeCache.loading) {
                    clearInterval(checkInterval);
                    if (entityTypeCache.data) {
                        console.log('[referenceService.getEntityTypes] Resolved after wait');
                        resolve(entityTypeCache.data);
                    } else {
                        console.error('[referenceService.getEntityTypes] Rejected after wait');
                        reject(new Error('Failed to load entity types'));
                    }
                }
            }, 100);

            // Таймаут на случай, если загрузка зависнет
            setTimeout(() => {
                clearInterval(checkInterval);
                console.error('[referenceService.getEntityTypes] Timeout while waiting');
                reject(new Error('Timeout while loading entity types'));
            }, 5000);
        });
    }*/

    try {
        entityTypeCache.loading = true;
        console.log('[referenceService.getEntityTypes] Starting API call...');
        const response = await referenceApi.getTypes();

        // Правильная обработка ответа API
        let types;
        if (response && response.data !== undefined) {
            // Если ответ приходит в свойстве data
            types = response.data;
        } else {
            // Если ответ приходит напрямую
            types = response;
        }

        // Форматируем ответ
        const formattedTypes = (types || []).map(type => ({
            value: type.value || type.name,
            label: type.label || type.name,
            description: type.description
        }));

        entityTypeCache.data = formattedTypes;
        entityTypeCache.timestamp = Date.now();
        console.log('[referenceService.getEntityTypes] Cache updated:', formattedTypes);
        return formattedTypes;
    } catch (error) {
        console.error('[referenceService.getEntityTypes] Error:', error);
        let errorMessage = 'Не удалось загрузить типы справочников';
        if (error.code === 'ERR_NETWORK') {
            errorMessage = 'Ошибка сети (CORS) при загрузке типов справочников.';
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    } finally {
        entityTypeCache.loading = false;
    }
};

/**
 * Загружает информацию о полях справочника с кэшированием
 *
 * @param {string} entityType - Тип справочника
 * @returns {Promise<Object>} Информация о полях справочника
 * @throws {Error} При ошибке загрузки
 */
export const getReferenceFields = async (entityType) => {
    const cleanEntityType = entityType.replace(/\/$/, '');

    // Проверяем кэш
    if (referenceFieldsCache.has(cleanEntityType)) {
        const { data, timestamp } = referenceFieldsCache.get(cleanEntityType);

        if (Date.now() - timestamp < CACHE_TTL) {
            console.log(`[referenceService.getReferenceFields] Returning cached data for: ${cleanEntityType}`);
            return data;
        }
    }

    try {
        console.log(`[referenceService.getReferenceFields] Starting API call for: ${cleanEntityType}`);
        const response = await referenceApi.getFieldInfo(cleanEntityType);

        // Правильная обработка структуры ответа
        let availableKeys;

        // Проверяем различные возможные структуры ответа
        if (response && response.data && response.data.availableKeys) {
            // Структура { data: { data: { availableKeys: [...] } } }
            availableKeys = response.data.availableKeys;
        } else if (response && response.data && Array.isArray(response.data)) {
            // Структура { data: [...] }
            availableKeys = response.data;
        } else if (response && response.availableKeys) {
            // Структура { availableKeys: [...] }
            availableKeys = response.availableKeys;
        } else if (Array.isArray(response)) {
            // Структура [...]
            availableKeys = response;
        } else {
            availableKeys = [];
        }

        // Форматируем поля
        const formattedFields = (availableKeys || []).map(key => {
            // Если key - объект, извлекаем информацию
            if (typeof key === 'object' && key !== null) {
                return {
                    key: key.key || key.name,
                    label: key.label || key.name,
                    type: key.type || 'string'
                };
            }
            // Если key - строка
            return {
                key: key,
                label: key,
                type: 'string'
            };
        });

        // Сохраняем в кэш
        referenceFieldsCache.set(cleanEntityType, {
            data: formattedFields,
            timestamp: Date.now()
        });
        console.log(`[referenceService.getReferenceFields] Cache updated for: ${cleanEntityType}`, formattedFields);

        return formattedFields;
    } catch (error) {
        console.error(`[referenceService.getReferenceFields] Error for ${cleanEntityType}:`, error);
        let errorMessage = 'Ошибка загрузки полей справочника';
        if (error.code === 'ERR_NETWORK') {
            errorMessage = 'Ошибка сети (CORS) при загрузке полей справочника.';
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
};

/**
 * Загружает данные справочника с кэшированием
 *
 * @param {string} entityType - Тип справочника
 * @returns {Promise<Array>} Данные справочника
 * @throws {Error} При ошибке загрузки
 */
export const getReferenceData = async (entityType) => {
    const cleanEntityType = entityType.replace(/\/$/, '');

    // Проверяем кэш
    if (referenceDataCache.has(cleanEntityType)) {
        const { data, timestamp } = referenceDataCache.get(cleanEntityType);

        if (Date.now() - timestamp < CACHE_TTL) {
            console.log(`[referenceService.getReferenceData] Returning cached data for: ${cleanEntityType}`);
            return data;
        }
    }

    try {
        console.log(`[referenceService.getReferenceData] Starting API call for: ${cleanEntityType}`);
        const response = await referenceApi.getData(cleanEntityType);

        // Правильная обработка структуры ответа
        let data;

        // Проверяем различные возможные структуры ответа
        if (response && response.data !== undefined) {
            // Если ответ приходит в свойстве data
            data = response.data;
        } else {
            // Если ответ приходит напрямую
            data = response;
        }

        // Убедимся, что data - это массив
        if (!Array.isArray(data)) {
            console.warn(`[referenceService.getReferenceData] Expected array for ${cleanEntityType}, got:`, data);
            data = [];
        }

        // Сохраняем в кэш
        referenceDataCache.set(cleanEntityType, {
            data: data,
            timestamp: Date.now()
        });
        console.log(`[referenceService.getReferenceData] Cache updated for: ${cleanEntityType}`, data);

        return data;
    } catch (error) {
        console.error(`[referenceService.getReferenceData] Error for ${cleanEntityType}:`, error);
        let errorMessage = 'Ошибка загрузки данных справочника';
        if (error.code === 'ERR_NETWORK') {
            errorMessage = 'Ошибка сети (CORS) при загрузке данных справочника.';
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
};

/**
 * Очищает кэш сервиса
 */
export const clearCache = () => {
    console.log('[referenceService.clearCache] Clearing all caches');
    entityTypeCache.data = null;
    entityTypeCache.timestamp = null;
    referenceFieldsCache.clear();
    referenceDataCache.clear();
};

/**
 * Получает пример формата для типа справочника
 *
 * @param {string} entityType - Тип справочника
 * @returns {string} Пример формата
 */
export const getExampleFormat = (entityType) => {
    switch(entityType) {
        case 'accessory': return '{id} {brand.name} {type.name} - ({brand.country}) {model} {series}';
        case 'brand': return '{name} ({country})';
        case 'device_type': return '{name} ({code})';
        case 'measurement_category': return '{name} ({description})';
        default: return '{id} - {name}';
    }
};

/**
 * Получает доступные ключи для формата
 *
 * @param {string} entityType - Тип справочника
 * @returns {Array} Массив доступных ключей
 */
export const getAvailableKeys = (entityType) => {
    switch(entityType) {
        case 'accessory': return ['id', 'name', 'model', 'series', 'brand.name', 'brand.country', 'type.name', 'type.code'];
        case 'brand': return ['id', 'name', 'country', 'website'];
        case 'device_type': return ['id', 'name', 'code'];
        case 'measurement_category': return ['id', 'name', 'description'];
        default: return ['id', 'name'];
    }
};

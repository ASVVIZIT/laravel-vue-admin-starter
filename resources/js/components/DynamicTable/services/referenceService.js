// resources/js/services/referenceService.js
import Resource from '../api/resource';
import { referenceApi } from '../api/referenceApi';

const referenceResource = new Resource('references');

export const referenceService = {
    /**
     * Получение списка типов справочников
     */
    async getTypes() {
        try {
            const response = await referenceResource.list({}, 'types');
            return response || [];
        } catch (error) {
            console.error('Ошибка загрузки типов справочников:', error);
            // Передаем ошибку дальше, чтобы её мог обработать вызывающий код
            throw error;
        }
    },

    /**
     * Получение информации о полях модели справочника
     * @param {string} modelName - Название модели в snake_case (например, 'accessory', 'brand')
     * @returns {Promise<{ data: { availableKeys: string[] } }>}
     */
    async getFieldInfo (modelName) {
        if (!modelName) {
            console.warn('referenceService.getInfo: modelName is required');
            return Promise.resolve({ data: { availableKeys: [] } }); // Возвращаем ожидаемую структуру
        }

        try {
            // === ИСПРАВЛЕНИЕ: Вызываем referenceApi.getFieldInfo ===
            const response = await referenceApi.getFieldInfo(modelName); // <-- ВАЖНО

            // === ИСПРАВЛЕНИЕ: Преобразуем ответ API в ожидаемый фронтендом формат ===
            // Ожидаем response.data = { modelName: '...', fillable: [...], relations: {...}, ... }
            const fieldInfoData = response.data; // <-- response.data, а не весь response

            if (!fieldInfoData || !Array.isArray(fieldInfoData.fillable)) {
                // Если структура неверна, логируем и выбрасываем ошибку с понятным сообщением
                console.error(`[referenceService.getInfo] Invalid response structure. Expected { data: { fillable: string[], relations: object } }. Got:`, response);
                throw new Error(`Invalid response structure from referenceApi.getFieldInfo for ${modelName}. Missing or invalid 'fillable'.`);
            }

            // 1. Базовые fillable поля
            let availableKeys = [...fieldInfoData.fillable];

            // 2. Добавляем поля из отношений (если они есть и корректны)
            if (fieldInfoData.relations && typeof fieldInfoData.relations === 'object') {
                Object.entries(fieldInfoData.relations).forEach(([relationName, relationInfo]) => {
                    // relationInfo = { type: 'BelongsTo', related: '...', foreignKey: '...', ... }
                    // Добавляем ключи в формате 'relationName.fieldKey'
                    // Для простоты, добавим сам relationName как ключ, чтобы его можно было перетащить
                    // Более сложная логика может потребоваться, если API будет возвращать поля related модели
                    availableKeys.push(relationName); // Пример: 'brand', 'type'
                    // TODO: Если API будет возвращать поля related модели, добавить их как 'brand.name', 'brand.country'
                });
            }

            // 3. Убираем служебные поля
            availableKeys = availableKeys.filter(key =>
                !['id', 'created_at', 'updated_at', 'deleted_at'].includes(key)
            );

            // 4. Формируем ожидаемый фронтендом формат
            const result = {
                data: {
                    availableKeys: availableKeys,
                    // Можно добавить другие поля, если они нужны фронтенду, например:
                     defaultDisplayFormat: fieldInfoData.defaultDisplayFormat || `{${availableKeys[0] || 'id'}}`,
                     columnTypes: fieldInfoData.columnTypes || {}
                }
            };

            console.log(`[referenceService.getInfo] Processed field info for ${modelName}:`, result);
            return result; // <-- Возвращаем преобразованный результат

        } catch (error) {
            console.error(`referenceService.getInfo: Error fetching info for "${modelName}":`, error);

            // Формируем понятное сообщение об ошибке
            let errorMessage = 'Unknown error';
            if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Ошибка сети (CORS) при загрузке информации о полях справочника.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            // Передаем ошибку дальше, чтобы её мог обработать вызывающий код
            throw new Error(`Ошибка загрузки информации о полях справочника "${modelName}": ${errorMessage}`);
        }
    },

    /**
     * УНИВЕРСАЛЬНЫЙ метод для получения данных справочника по типу (модели)
     * @param {string} modelName - Название модели в snake_case (например, 'accessory', 'brand')
     * @param {Object} params - Дополнительные параметры запроса (search, for_dropdown, per_page и т.д.)
     * @returns {Promise<Object>} - Промис с данными справочника
     */
    async getData(modelName, params = {}) {
        if (!modelName) {
            console.warn('referenceService.getData: modelName is required');
            return Promise.resolve({ data: [], meta: {} });
        }

        try {
            // Делаем запрос к универсальному API: GET /api/references/{modelName}?...
            // Например, GET /api/references/accessory?search=ABB&for_dropdown=1
            // ИСПОЛЬЗУЕМ referenceApi.getData для централизованной обработки ошибок
            const response = await referenceApi.getData(modelName, params); // list(params, entityType)
            // Предполагаем, что данные находятся в response.data, а метаинформация в response.meta
            return {
                data: response.data || [],
                meta: response.meta || {}
            };
        } catch (error) {
            console.error(`referenceService.getData: Error fetching data for "${modelName}":`, error);
            // Передаем ошибку дальше, чтобы её мог обработать вызывающий код
            throw error;
        }
    },


    /**
     * Получение данных справочника
     * @param {string} modelName - Название модели в snake_case (например, 'accessory', 'brand')
     * @returns {Promise<Array>} - Промис с массивом данных справочника
     */
    async getReferenceData(modelName) {
        if (this.source === 'mock') {
            return this.getMockReferenceData(modelName);
        }

        // ИСПОЛЬЗУЕМ НОВЫЙ УНИВЕРСАЛЬНЫЙ referenceService.getData
        // Передаем modelName и параметр for_dropdown: true для получения всех записей
        try {
            const response = await this.getData(modelName, { for_dropdown: true });
            return response.data || [];
        } catch (error) {
            // Логируем ошибку
            console.error(`referenceService.getReferenceData: Error fetching data for "${modelName}":`, error);
            // ВАЖНО: Возвращаем пустой массив вместо того, чтобы "ломать" вызывающий код исключением
            return [];
        }
    },

    async getAllReferenceData() {
        try {
            const types = await this.getTypes();
            const referenceData = {};

            for (const type of types) {
                try {
                    referenceData[type.value] = await this.getReferenceData(type.value);
                } catch (error) {
                    console.error(`referenceService.getAllReferenceData: Error fetching data for "${type.value}":`, error);
                    // В случае ошибки для одного типа, продолжаем загрузку остальных
                    referenceData[type.value] = [];
                }
            }

            return referenceData;
        } catch (error) {
            console.error('Ошибка загрузки всех данных справочников:', error);
            throw error;
        }
    }
};

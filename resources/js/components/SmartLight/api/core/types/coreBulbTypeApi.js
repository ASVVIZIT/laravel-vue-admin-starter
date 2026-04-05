/**
 * ============================================================================
 * CORE BULB TYPE API — НИЗКОУРОВНЕВЫЙ API ДЛЯ ТИПОВ ЛАМП
 * ============================================================================
 * 📁 Путь: api/core/types/coreBulbTypeApi.js
 * ✅ Используется: CoreTypesApi, Services
 * ✅ Назначение: Прямые запросы к эндпоинтам /bulb-types
 * ✅ Рефакторинг: методы с суффиксом TypeApi()
 * ============================================================================
 */

import { CoreBulbTypeResource } from '@components/SmartLight/api/core/resource/coreBulbTypeResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class CoreBulbTypeApi {
    constructor() {
        this.resource = new CoreBulbTypeResource();
    }

    /**
     * Получение всех типов ламп (суффикс TypeApi)
     */
    async getAllBulbTypesTypeApi() {
        logDebugUtils('coreBulbTypeApi', 'Получение всех типов ламп');

        try {
            const response = await this.resource.getAllResource();

            if (!response || !response.data || !Array.isArray(response.data)) {
                logDebugUtils('coreBulbTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: true,
                    data: [],
                    message: 'Получен некорректный ответ от API'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Типы ламп успешно загружены'
            };
        } catch (error) {
            logErrorUtils('coreBulbTypeApi', 'Ошибка загрузки типов ламп', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы ламп',
                error: error.message
            };
        }
    }

    /**
     * Получение типа лампы по ID (суффикс TypeApi)
     */
    async getBulbTypeByIdTypeApi(id) {
        logDebugUtils('coreBulbTypeApi', 'Получение типа лампы по ID', { id });

        try {
            const response = await this.resource.getByIdResource(id);

            if (!response || !response.data) {
                logDebugUtils('coreBulbTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: true,
                    data: null,
                    message: 'Получен некорректный ответ от API'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Тип лампы успешно загружен'
            };
        } catch (error) {
            logErrorUtils('coreBulbTypeApi', 'Ошибка загрузки типа лампы', error);
            return {
                success: false,
                message: 'Не удалось загрузить тип лампы',
                error: error.message
            };
        }
    }

    /**
     * Получение типов ламп для выпадающего списка (суффикс TypeApi)
     */
    async getBulbTypesForDropdownTypeApi() {
        logDebugUtils('coreBulbTypeApi', 'Получение типов ламп для выпадающего списка');

        try {
            const response = await this.resource.getForDropdownResource();

            if (!response || !response.data || !Array.isArray(response.data)) {
                logDebugUtils('coreBulbTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: true,
                    data: [],
                    message: 'Получен некорректный ответ от API'
                };
            }

            return {
                success: true,
                data: response.data.map(type => ({
                    id: type.id,
                    label: type.name,
                    value: type.id,
                    disabled: false,
                    category: type.category,
                    baseType: type.base_type
                })),
                message: 'Типы ламп успешно загружены'
            };
        } catch (error) {
            logErrorUtils('coreBulbTypeApi', 'Ошибка загрузки типов ламп', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы ламп',
                error: error.message
            };
        }
    }

    /**
     * Проверка совместимости типа лампы с устройством (суффикс TypeApi)
     */
    async checkBulbTypeCompatibilityTypeApi(bulbTypeId, deviceId) {
        logDebugUtils('coreBulbTypeApi', 'Проверка совместимости типа лампы', {
            bulbTypeId,
            deviceId
        });

        try {
            const response = await this.resource.checkCompatibilityResource(bulbTypeId, deviceId);

            return {
                success: true,
                response,
                message: 'Совместимость проверена'
            };
        } catch (error) {
            logErrorUtils('coreBulbTypeApi', 'Ошибка проверки совместимости', error);
            return {
                success: false,
                message: 'Не удалось проверить совместимость',
                error: error.message
            };
        }
    }
}

// ✅ Экспорт экземпляра
export const coreBulbTypeApi = new CoreBulbTypeApi();

// ✅ Экспорт по умолчанию
export default coreBulbTypeApi;

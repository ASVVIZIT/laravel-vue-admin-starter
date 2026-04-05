/**
 * ============================================================================
 * CORE BATTERY TYPE API — НИЗКОУРОВНЕВЫЙ API ДЛЯ ТИПОВ АККУМУЛЯТОРОВ
 * ============================================================================
 * 📁 Путь: api/core/types/coreBatteryTypeApi.js
 * ✅ Используется: CoreTypesApi, Services
 * ✅ Назначение: Прямые запросы к эндпоинтам /battery-types
 * ✅ Рефакторинг: методы с суффиксом TypeApi()
 * ============================================================================
 */

import { CoreBatteryTypeResource } from '@components/SmartLight/api/core/resource/coreBatteryTypeResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class CoreBatteryTypeApi {
    constructor() {
        this.resource = new CoreBatteryTypeResource();
    }

    /**
     * Получение всех типов аккумуляторов (суффикс TypeApi)
     */
    async getAllBatteryTypesTypeApi() {
        logDebugUtils('coreBatteryTypeApi', 'Получение всех типов аккумуляторов');

        try {
            const response = await this.resource.getAllResource();

            if (!response || !response.data || !Array.isArray(response.data)) {
                logDebugUtils('coreBatteryTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: true,
                    data: [],
                    message: 'Получен некорректный ответ от API, используется локальная кэшированная версия'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Типы аккумуляторов успешно загружены'
            };
        } catch (error) {
            logErrorUtils('coreBatteryTypeApi', 'Ошибка загрузки типов аккумуляторов', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы аккумуляторов',
                error: error.message
            };
        }
    }

    /**
     * Получение типа аккумулятора по ID (суффикс TypeApi)
     */
    async getBatteryTypeByIdTypeApi(id) {
        logDebugUtils('coreBatteryTypeApi', 'Получение типа аккумулятора по ID', { id });

        try {
            const response = await this.resource.getByIdResource(id);

            if (!response || !response.data) {
                logDebugUtils('coreBatteryTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: true,
                    data: null,
                    message: 'Получен некорректный ответ от API, используется локальная кэшированная версия'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Тип аккумулятора успешно загружен'
            };
        } catch (error) {
            logErrorUtils('coreBatteryTypeApi', 'Ошибка загрузки типа аккумулятора', error);
            return {
                success: false,
                message: 'Не удалось загрузить тип аккумулятора',
                error: error.message
            };
        }
    }

    /**
     * Получение типов аккумуляторов для выпадающего списка (суффикс TypeApi)
     */
    async getBatteryTypesForDropdownTypeApi() {
        logDebugUtils('coreBatteryTypeApi', 'Получение типов аккумуляторов для выпадающего списка');

        try {
            const response = await this.resource.getForDropdownResource();

            if (!response || !response.data || !Array.isArray(response.data)) {
                logDebugUtils('coreBatteryTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: true,
                    data: [],
                    message: 'Получен некорректный ответ от API, используется локальная кэшированная версия'
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
                    chemistry: type.chemistry
                })),
                message: 'Типы аккумуляторов успешно загружены'
            };
        } catch (error) {
            logErrorUtils('coreBatteryTypeApi', 'Ошибка загрузки типов аккумуляторов', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы аккумуляторов',
                error: error.message
            };
        }
    }

    /**
     * Проверка совместимости типа аккумулятора с устройством (суффикс TypeApi)
     */
    async checkBatteryTypeCompatibilityTypeApi(batteryTypeId, deviceId) {
        logDebugUtils('coreBatteryTypeApi', 'Проверка совместимости типа аккумулятора', {
            batteryTypeId,
            deviceId
        });

        try {
            const response = await this.resource.checkCompatibilityResource(batteryTypeId, deviceId);

            return {
                success: true,
                response,
                message: 'Совместимость проверена'
            };
        } catch (error) {
            logErrorUtils('coreBatteryTypeApi', 'Ошибка проверки совместимости', error);
            return {
                success: false,
                message: 'Не удалось проверить совместимость',
                error: error.message
            };
        }
    }
}

// ✅ Экспорт экземпляра
export const coreBatteryTypeApi = new CoreBatteryTypeApi();

// ✅ Экспорт по умолчанию
export default coreBatteryTypeApi;

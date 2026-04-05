/**
 * ============================================================================
 * CORE POWER SUPPLY TYPE API — НИЗКОУРОВНЕВЫЙ API ДЛЯ ТИПОВ ИСТОЧНИКОВ ПИТАНИЯ
 * ============================================================================
 * 📁 Путь: api/core/types/corePowerSupplyTypeApi.js
 * ✅ Используется: CoreTypesApi, Services
 * ✅ Назначение: Прямые запросы к эндпоинтам /power-supplies
 * ✅ Рефакторинг: методы с суффиксом TypeApi()
 * ============================================================================
 */

import { CorePowerSupplyTypeResource } from '@components/SmartLight/api/core/resource/corePowerSupplyTypeResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class CorePowerSupplyTypeApi {
    constructor() {
        this.resource = new CorePowerSupplyTypeResource();
    }

    /**
     * Получить все типы источников питания (суффикс TypeApi)
     */
    async getAllPowerSupplyTypesTypeApi() {
        logDebugUtils('corePowerSupplyTypeApi', 'getAllPowerSupplyTypesTypeApi');

        try {
            const response = await this.resource.getAllResource();

            if (!response || !response.data || !Array.isArray(response.data)) {
                return {
                    success: true,
                    data: [],
                    message: 'Получен некорректный ответ от API'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Типы источников питания успешно загружены'
            };
        } catch (error) {
            logErrorUtils('corePowerSupplyTypeApi', 'Ошибка загрузки', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы источников питания',
                error: error.message
            };
        }
    }

    /**
     * Получить тип источника питания по ID (суффикс TypeApi)
     */
    async getPowerSupplyTypeByIdTypeApi(id) {
        logDebugUtils('corePowerSupplyTypeApi', 'getPowerSupplyTypeByIdTypeApi', { id });

        try {
            const response = await this.resource.getByIdResource(id);

            if (!response || !response.data) {
                return {
                    success: true,
                    data: null,
                    message: 'Получен некорректный ответ от API'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Тип источника питания успешно загружен'
            };
        } catch (error) {
            logErrorUtils('corePowerSupplyTypeApi', 'Ошибка загрузки', error);
            return {
                success: false,
                message: 'Не удалось загрузить тип источника питания',
                error: error.message
            };
        }
    }

    /**
     * Проверить совместимость типа источника питания с устройством (суффикс TypeApi)
     */
    async checkPowerSupplyTypeCompatibilityTypeApi(supplyTypeId, deviceId) {
        logDebugUtils('corePowerSupplyTypeApi', 'checkPowerSupplyTypeCompatibilityTypeApi', { supplyTypeId, deviceId });

        try {
            const response = await this.resource.checkCompatibilityResource(supplyTypeId, deviceId);

            return {
                success: true,
                response: response,
                message: 'Совместимость проверена'
            };
        } catch (error) {
            logErrorUtils('corePowerSupplyTypeApi', 'Ошибка проверки совместимости', error);
            return {
                success: false,
                message: 'Не удалось проверить совместимость',
                error: error.message
            };
        }
    }
}

// ✅ Экспорт экземпляра
export const corePowerSupplyTypeApi = new CorePowerSupplyTypeApi();

// ✅ Экспорт по умолчанию
export default corePowerSupplyTypeApi;

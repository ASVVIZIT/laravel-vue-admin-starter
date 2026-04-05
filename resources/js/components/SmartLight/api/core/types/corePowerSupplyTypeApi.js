/**
 * ============================================================================
 * POWER SUPPLY TYPE API — НИЗКОУРОВНЕВЫЙ API ДЛЯ ТИПОВ ИСТОЧНИКОВ ПИТАНИЯ
 * ============================================================================
 * 📁 Путь: api/core/types/powerSupplyTypes/corePowerSupplyTypeApi.js
 * ✅ Используется: CoreTypesApi, Services
 * ✅ Назначение: Прямые запросы к эндпоинтам /power-supplies
 * ============================================================================
 */

import { CorePowerSupplyTypeResource } from '@components/SmartLight/api/core/resource/corePowerSupplyTypeResource.js';
import { logDebug, logError } from '@components/SmartLight/api/core/utils/coreApiLogger.js';

export class CorePowerSupplyTypeApi {
    constructor() {
        this.resource = new CorePowerSupplyTypeResource();
    }

    /**
     * Получить все типы источников питания
     */
    async getAllPowerSupplyTypes() {
        logDebug('corePowerSupplyTypeApi', 'getAllPowerSupplyTypes');

        try {
            const response = await this.resource.getAll();

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
            logError('corePowerSupplyTypeApi', 'Ошибка загрузки', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы источников питания',
                error: error.message
            };
        }
    }

    /**
     * Получить тип источника питания по ID
     */
    async getPowerSupplyTypeById(id) {
        logDebug('corePowerSupplyTypeApi', 'getPowerSupplyTypeById', { id });

        try {
            const response = await this.resource.getById(id);

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
            logError('corePowerSupplyTypeApi', 'Ошибка загрузки', error);
            return {
                success: false,
                message: 'Не удалось загрузить тип источника питания',
                error: error.message
            };
        }
    }

    /**
     * Проверить совместимость типа источника питания с устройством
     */
    async checkPowerSupplyTypeCompatibility(supplyTypeId, deviceId) {
        logDebug('corePowerSupplyTypeApi', 'checkCompatibility', { supplyTypeId, deviceId });

        try {
            const response = await this.resource.checkPowerSupplyTypeCompatibility(supplyTypeId, deviceId);

            return {
                success: true,
                response: response,
                message: 'Совместимость проверена'
            };
        } catch (error) {
            logError('corePowerSupplyTypeApi', 'Ошибка проверки совместимости', error);
            return {
                success: false,
                message: 'Не удалось проверить совместимость',
                error: error.message
            };
        }
    }
}

// ✅ Экспорт экземпляра (критично для импорта в coreTypesApi.js)
export const corePowerSupplyTypeApi = new CorePowerSupplyTypeApi();

// ✅ Экспорт по умолчанию для совместимости
export default corePowerSupplyTypeApi;

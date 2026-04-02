/**
 * ============================================================================
 * FORMATTERS — ФОРМАТТЕРЫ ДЛЯ SMARTLIGHT
 * ============================================================================
 * 📁 Путь: utils/appFormatters.js
 * ✅ Используется: DeviceCard, DeviceGrid, PowerMonitoringCompact, таблицы
 * ============================================================================
 */

import { logDebug } from './appLogger.js';

/**
 * Форматирование напряжения
 * @param {number|string} voltage - Напряжение
 * @returns {string} - Форматированное напряжение (например, "3.95 В")
 */
export const formatVoltage = (voltage) => {
    const num = typeof voltage === 'number' ? voltage : parseFloat(voltage) || 0;
    return num.toFixed(2) + ' В';
};

/**
 * Форматирование времени в полный формат (Дни Часы Минуты Секунды)
 * @param {number} hours - Время в часах
 * @returns {string} - Форматированная строка (например, "1д 2ч 30м 15с")
 */
export const formatRuntimeFull = (hours) => {
    if (!hours || hours <= 0 || isNaN(hours)) return 'N/A';

    const totalSeconds = Math.floor(hours * 3600);

    const days = Math.floor(totalSeconds / 86400);
    const hoursRemaining = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];

    if (days > 0) parts.push(`${days}д`);
    if (hoursRemaining > 0) parts.push(`${hoursRemaining}ч`);
    if (minutes > 0) parts.push(`${minutes}м`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}с`);

    return parts.join(' ');
};

/**
 * Форматирование времени в короткий формат (только часы/дни)
 * @param {number} hours - Время в часах
 * @returns {string} - Форматированная строка (например, "26ч" или "1д 2ч")
 */
export const formatRuntimeShort = (hours) => {
    if (!hours || hours <= 0 || isNaN(hours)) return 'N/A';

    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const hoursRemaining = Math.floor(hours % 24);
        return `${days}д ${hoursRemaining}ч`;
    }

    return `${Math.floor(hours)}ч`;
};

/**
 * Форматирование времени работы (старая функция для совместимости)
 * @param {number} hours - Время в часах
 * @returns {string} - Форматированная строка
 */
export const formatRuntime = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} мин`;
    if (hours < 24) return `${Math.round(hours)} ч`;
    return `${Math.floor(hours / 24)} дн`;
};

/**
 * Получение формата времени из настроек
 * @returns {string} - 'full' или 'short'
 */
export const getRuntimeFormat = () => {
    try {
        const settings = localStorage.getItem('smartlight_display_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            return parsed.runtimeFormat || 'full';
        }
    } catch (e) {
        console.error('[appFormatters] Failed to load runtime format', e);
    }
    return 'full'; // По умолчанию полный формат
};

/**
 * Сохранение формата времени в настройки
 * @param {string} format - 'full' или 'short'
 */
export const setRuntimeFormat = (format) => {
    try {
        const settings = localStorage.getItem('smartlight_display_settings');
        let parsed = settings ? JSON.parse(settings) : {};
        parsed.runtimeFormat = format;
        localStorage.setItem('smartlight_display_settings', JSON.stringify(parsed));
        logDebug('appFormatters', `Runtime format saved: ${format}`);
    } catch (e) {
        console.error('[appFormatters] Failed to save runtime format', e);
    }
};

/**
 * Форматирование времени с учетом настроек
 * @param {number} hours - Время в часах
 * @returns {string} - Форматированная строка
 */
export const formatRuntimeWithSettings = (hours) => {
    const format = getRuntimeFormat();

    if (format === 'short') {
        return formatRuntimeShort(hours);
    }

    return formatRuntimeFull(hours);
};

/**
 * Форматирование статуса устройства
 * @param {string} status - Статус устройства
 * @returns {string} - Форматированный статус
 */
export const formatDeviceStatus = (status) => {
    const statusMap = {
        'ON': 'Включено',
        'OFF': 'Выключено',
        'SLEEPING': 'Спящий режим',
        'LOW_POWER': 'Низкий заряд',
        'ERROR': 'Ошибка'
    };
    return statusMap[status] || status;
};

/**
 * Форматирование параметров группировки
 * @param {Object} groupConfig - Конфигурация группировки
 * @returns {string} - Форматированная строка
 */
export const formatGroupConfig = (groupConfig) => {
    if (!groupConfig?.enabled) return 'Нет группировки';
    const typeMap = {
        'series': 'Последовательная',
        'parallel': 'Параллельная',
        'series_parallel': 'Последовательно-параллельная'
    };
    return `${typeMap[groupConfig.type] || groupConfig.type} (${groupConfig.count} шт.)`;
};

/**
 * Форматирование данных для API
 * @param {Object} settings - Настройки
 * @returns {Object} - Отформатированные данные
 */
export const formatForApi = (settings) => {
    return {
        critical_voltage: Number(settings.critical_voltage),
        sleep_interval: Number(settings.sleep_interval),
        emergency_sleep_interval: Number(settings.emergency_sleep_interval),
        battery_group_config: {
            enabled: !!settings.battery_group_config?.enabled,
            type: settings.battery_group_config?.type || 'series',
            count: Number(settings.battery_group_config?.count) || 1,
            connections: settings.battery_group_config?.connections || []
        }
    };
};

/**
 * Форматирование данных из API
 * @param {Object} apiData - Данные из API
 * @returns {Object} - Отформатированные данные
 */
export const formatFromApi = (apiData) => {
    return {
        ...apiData,
        critical_voltage: apiData.critical_voltage ? Number(apiData.critical_voltage) : 3.0,
        sleep_interval: apiData.sleep_interval ? Number(apiData.sleep_interval) : 600,
        emergency_sleep_interval: apiData.emergency_sleep_interval ? Number(apiData.emergency_sleep_interval) : 3600,
        battery_group_config: {
            enabled: !!apiData.battery_group_config?.enabled,
            type: apiData.battery_group_config?.type || 'series',
            count: Number(apiData.battery_group_config?.count) || 1,
            connections: apiData.battery_group_config?.connections || []
        }
    };
};

/**
 * Форматирование данных для таблицы
 * @param {Array} devices - Массив устройств
 * @returns {Array} - Отформатированные данные
 */
export const formatForTable = (devices) => {
    return devices.map(device => ({
        ...device,
        formattedVoltage: formatVoltage(device.voltage),
        formattedRuntime: formatRuntimeWithSettings(device.runtimeHours),
        formattedStatus: formatDeviceStatus(device.status),
        formattedGroupConfig: formatGroupConfig(device.battery_group_config)
    }));
};

/**
 * Форматирование данных устройства
 * @param {Object} device - Устройство
 * @returns {Object} - Отформатированные данные
 */
export const formatDeviceData = (device) => {
    if (!device) return { device_id: 'N/A', name: 'N/A', status: 'N/A', voltage: 'N/A', intensity: 'N/A' };
    return {
        device_id: device.device_id,
        name: device.name,
        status: formatDeviceStatus(device.status),
        voltage: formatVoltage(device.voltage),
        intensity: `${device.intensity}%`
    };
};

export default {
    formatVoltage,
    formatRuntime,
    formatRuntimeFull,
    formatRuntimeShort,
    formatRuntimeWithSettings,
    getRuntimeFormat,
    setRuntimeFormat,
    formatDeviceStatus,
    formatGroupConfig,
    formatForApi,
    formatFromApi,
    formatForTable,
    formatDeviceData
};

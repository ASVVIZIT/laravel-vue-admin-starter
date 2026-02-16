import { logDebug } from '@/components/SmartLight/api/utils/logger';

/**
 * Форматирует напряжение
 */
export const formatVoltage = (voltage, precision = 2) => {
    logDebug('Formatters', 'Форматирование напряжения', { voltage, precision });

    if (voltage === null || voltage === undefined) {
        return 'N/A';
    }

    return `${voltage.toFixed(precision)} В`;
};

/**
 * Форматирует время работы
 */
export const formatRuntime = (hours) => {
    logDebug('Formatters', 'Форматирование времени работы', { hours });

    if (hours < 1) {
        const minutes = Math.round(hours * 60);
        return `${minutes} ${declineWord(minutes, ['минута', 'минуты', 'минут'])}`;
    }

    if (hours < 24) {
        return `${hours.toFixed(1)} ${declineWord(Math.floor(hours), ['час', 'часа', 'часов'])}`;
    }

    const days = hours / 24;
    return `${days.toFixed(1)} ${declineWord(Math.floor(days), ['день', 'дня', 'дней'])}`;
};

/**
 * Склонение слов
 */
const declineWord = (number, words) => {
    logDebug('Formatters', 'Склонение слова', { number, words });

    const num = Math.abs(number) % 100;
    const lastDigit = num % 10;

    if (num > 10 && num < 20) {
        return words[2];
    }

    if (lastDigit === 1) {
        return words[0];
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return words[1];
    }

    return words[2];
};

/**
 * Форматирует статус устройства
 */
export const formatDeviceStatus = (status) => {
    logDebug('Formatters', 'Форматирование статуса', { status });

    const statusMap = {
        'ON': 'Включено',
        'OFF': 'Выключено',
        'SLEEPING': 'Спящий режим',
        'LOW_POWER': 'Низкий заряд'
    };

    return statusMap[status] || status;
};

/**
 * Форматирует данные для отображения
 */
export const formatDeviceData = (device) => {
    logDebug('Formatters', 'Форматирование данных устройства', { device });

    if (!device) {
        return {
            device_id: 'N/A',
            name: 'N/A',
            status: 'N/A',
            voltage: 'N/A',
            intensity: 'N/A'
        };
    }

    return {
        device_id: device.device_id,
        name: device.name,
        status: formatDeviceStatus(device.status),
        voltage: formatVoltage(device.voltage),
        intensity: `${device.intensity}%`
    };
};

/**
 * Форматирует параметры группировки
 */
export const formatGroupConfig = (groupConfig) => {
    logDebug('Formatters', 'Форматирование параметров группировки', { groupConfig });

    if (!groupConfig?.enabled) {
        return 'Нет группировки';
    }

    const typeMap = {
        'series': 'Последовательная',
        'parallel': 'Параллельная',
        'series_parallel': 'Последовательно-параллельная'
    };

    return `${typeMap[groupConfig.type] || groupConfig.type} (${groupConfig.count} шт.)`;
};

/**
 * Форматирует данные для API
 */
export const formatForApi = (settings) => {
    logDebug('Formatters', 'Форматирование данных для API', { settings });

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
 * Форматирует данные из API
 */
export const formatFromApi = (apiData) => {
    logDebug('Formatters', 'Форматирование данных из API', { apiData });

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
 * Форматирует данные для отображения в таблице
 */
export const formatForTable = (devices) => {
    logDebug('Formatters', 'Форматирование данных для таблицы', {
        deviceCount: devices.length
    });

    return devices.map(device => ({
        ...device,
        formattedVoltage: formatVoltage(device.voltage),
        formattedRuntime: formatRuntime(device.voltage),
        formattedStatus: formatDeviceStatus(device.status),
        formattedGroupConfig: formatGroupConfig(device.battery_group_config)
    }));
};

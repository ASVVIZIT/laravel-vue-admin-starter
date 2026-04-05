/**
 * ============================================================================
 * FORMATTERS UTILS — ФОРМАТТЕРЫ ДЛЯ SMARTLIGHT (УТИЛИТЫ)
 * ============================================================================
 * 📁 Путь: utils/appFormattersUtils.js
 * ✅ Используется: Компоненты, сервисы, композиблы приложения
 * ✅ Рефакторинг: все функции имеют суффикс Utils
 * ✅ Добавлено: normalizeValidationErrorsUtils, showBoundaryHintUtils
 * ============================================================================
 */

import { logDebugUtils } from './appLoggerUtils.js';

// ============================================================================
// ФОРМАТИРОВАНИЕ НАПРЯЖЕНИЯ
// ============================================================================

/**
 * Форматирование напряжения (суффикс Utils)
 * @param {number|string} voltage - Напряжение
 * @returns {string} Форматированное напряжение (например, "3.95 В")
 */
export const formatVoltageUtils = (voltage) => {
    const num = typeof voltage === 'number' ? voltage : parseFloat(voltage) || 0;
    return num.toFixed(2) + ' В';
};

// ============================================================================
// ФОРМАТИРОВАНИЕ ВРЕМЕНИ
// ============================================================================

/**
 * Форматирование времени в полный формат (суффикс Utils)
 * @param {number} hours - Время в часах
 * @returns {string} Форматированная строка (например, "1д 2ч 30м 15с")
 */
export const formatRuntimeFullUtils = (hours) => {
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
 * Форматирование времени в короткий формат (суффикс Utils)
 * @param {number} hours - Время в часах
 * @returns {string} Форматированная строка (например, "26ч" или "1д 2ч")
 */
export const formatRuntimeShortUtils = (hours) => {
    if (!hours || hours <= 0 || isNaN(hours)) return 'N/A';
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const hoursRemaining = Math.floor(hours % 24);
        return `${days}д ${hoursRemaining}ч`;
    }
    return `${Math.floor(hours)}ч`;
};

/**
 * Форматирование времени работы (совместимость, суффикс Utils)
 * @param {number} hours - Время в часах
 * @returns {string} Форматированная строка
 */
export const formatRuntimeUtils = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} мин`;
    if (hours < 24) return `${Math.round(hours)} ч`;
    return `${Math.floor(hours / 24)} дн`;
};

/**
 * Получение формата времени из настроек (суффикс Utils)
 * @returns {string} 'full' или 'short'
 */
export const getRuntimeFormatUtils = () => {
    try {
        const settings = localStorage.getItem('smartlight_display_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            return parsed.runtimeFormat || 'full';
        }
    } catch (e) {
        console.error('[appFormattersUtils] Failed to load runtime format', e);
    }
    return 'full';
};

/**
 * Сохранение формата времени в настройки (суффикс Utils)
 * @param {string} format - 'full' или 'short'
 */
export const setRuntimeFormatUtils = (format) => {
    try {
        const settings = localStorage.getItem('smartlight_display_settings');
        let parsed = settings ? JSON.parse(settings) : {};
        parsed.runtimeFormat = format;
        localStorage.setItem('smartlight_display_settings', JSON.stringify(parsed));
        logDebugUtils('appFormattersUtils', `Runtime format saved: ${format}`);
    } catch (e) {
        console.error('[appFormattersUtils] Failed to save runtime format', e);
    }
};

/**
 * Форматирование времени с учетом настроек (суффикс Utils)
 * @param {number} hours - Время в часах
 * @returns {string} Форматированная строка
 */
export const formatRuntimeWithSettingsUtils = (hours) => {
    const format = getRuntimeFormatUtils();
    return format === 'short' ? formatRuntimeShortUtils(hours) : formatRuntimeFullUtils(hours);
};

// ============================================================================
// ФОРМАТИРОВАНИЕ СТАТУСОВ
// ============================================================================

/**
 * Форматирование статуса устройства (суффикс Utils)
 * @param {string} status - Статус устройства
 * @returns {string} Форматированный статус
 */
export const formatDeviceStatusUtils = (status) => {
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
 * Форматирование параметров группировки (суффикс Utils)
 * @param {Object} groupConfig - Конфигурация группировки
 * @returns {string} Форматированная строка
 */
export const formatGroupConfigUtils = (groupConfig) => {
    if (!groupConfig?.enabled) return 'Нет группировки';
    const typeMap = {
        'series': 'Последовательная',
        'parallel': 'Параллельная',
        'series_parallel': 'Последовательно-параллельная'
    };
    return `${typeMap[groupConfig.type] || groupConfig.type} (${groupConfig.count} шт.)`;
};

// ============================================================================
// ФОРМАТИРОВАНИЕ ДЛЯ API
// ============================================================================

/**
 * Форматирование данных для API (суффикс Utils)
 * @param {Object} settings - Настройки
 * @returns {Object} Отформатированные данные
 */
export const formatForApiUtils = (settings) => {
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
 * Форматирование данных из API (суффикс Utils)
 * @param {Object} apiData - Данные из API
 * @returns {Object} Отформатированные данные
 */
export const formatFromApiUtils = (apiData) => {
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

// ============================================================================
// ФОРМАТИРОВАНИЕ ДЛЯ ТАБЛИЦ И КАРТОЧЕК
// ============================================================================

/**
 * Форматирование данных для таблицы (суффикс Utils)
 * @param {Array} devices - Массив устройств
 * @returns {Array} Отформатированные данные
 */
export const formatForTableUtils = (devices) => {
    return devices.map(device => ({
        ...device,
        formattedVoltage: formatVoltageUtils(device.voltage),
        formattedRuntime: formatRuntimeWithSettingsUtils(device.runtimeHours),
        formattedStatus: formatDeviceStatusUtils(device.status),
        formattedGroupConfig: formatGroupConfigUtils(device.battery_group_config)
    }));
};

/**
 * Форматирование данных устройства (суффикс Utils)
 * @param {Object} device - Устройство
 * @returns {Object} Отформатированные данные
 */
export const formatDeviceDataUtils = (device) => {
    if (!device) return { device_id: 'N/A', name: 'N/A', status: 'N/A', voltage: 'N/A', intensity: 'N/A' };
    return {
        device_id: device.device_id,
        name: device.name,
        status: formatDeviceStatusUtils(device.status),
        voltage: formatVoltageUtils(device.voltage),
        intensity: `${device.intensity}%`
    };
};

// ============================================================================
// ВАЛИДАЦИЯ: НОРМАЛИЗАЦИЯ ОШИБОК
// ============================================================================

/**
 * Нормализует ключи ошибок валидации: 'settings.field' → 'field'
 * Также обрабатывает вложенные ключи: 'battery_group_config.enabled' → 'battery_group_config.enabled'
 * @param {Object} errors - Объект ошибок от бэкенда
 * @returns {Object} Нормализованный объект ошибок
 */
export const normalizeValidationErrorsUtils = (errors) => {
    if (!errors || typeof errors !== 'object') return {};

    const normalized = {};
    for (const [key, messages] of Object.entries(errors)) {
        // Убираем префикс 'settings.' если есть
        const cleanKey = key.replace(/^settings\./, '');
        normalized[cleanKey] = messages;
    }
    return normalized;
};

// ============================================================================
// UI: ПОДСКАЗКИ ГРАНИЧНЫХ ЗНАЧЕНИЙ
// ============================================================================

/**
 * Показывает временную подсказку о достижении границы значения
 * @param {HTMLElement} inputElement - DOM-элемент input-number
 * @param {string} boundary - 'min' | 'max'
 * @param {string} fieldName - Имя поля для сообщения
 * @param {number} limit - Значение границы
 */
export const showBoundaryHintUtils = (inputElement, boundary, fieldName, limit) => {
    if (!inputElement) return;

    // Удаляем старую подсказку если есть
    const oldHint = inputElement.querySelector('.boundary-hint');
    if (oldHint) oldHint.remove();

    // Создаём новую подсказку
    const hint = document.createElement('div');
    hint.className = `boundary-hint boundary-hint--${boundary}`;

    // Сообщения для разных полей и границ
    const messages = {
        'min': {
            'critical_voltage': 'Минимальное безопасное напряжение достигнуто',
            'min_controller_voltage': 'Ниже этого значения контроллер не работает',
            'sleep_interval': 'Минимальный интервал: 60 секунд',
            'emergency_sleep_interval': 'Минимальный аварийный интервал: 300 секунд',
            'controller_runtime': 'Минимальное время работы: 1 час',
            'battery_group_config.count': 'Минимум 1 элемент в группе',
            'default': `Минимальное значение: ${limit}`
        },
        'max': {
            'critical_voltage': 'Максимальное безопасное напряжение достигнуто',
            'min_controller_voltage': 'Выше этого значения предупреждение не сработает',
            'sleep_interval': 'Максимальный интервал: 24 часа',
            'emergency_sleep_interval': 'Максимальный аварийный интервал: 24 часа',
            'controller_runtime': 'Максимальное время работы: 7 дней (для сети)',
            'battery_group_config.count': 'Максимум 15 элементов в группе',
            'default': `Максимальное значение: ${limit}`
        }
    };

    // Определяем ключ поля (убираем вложенность типа 'battery_group_config.count')
    const fieldKey = fieldName.includes('.') ? fieldName.split('.')[1] : fieldName;
    const message = messages[boundary]?.[fieldKey] || messages[boundary]?.default || 'Достигнуто предельное значение';

    // Создаём HTML подсказки
    hint.innerHTML = `⚠️ ${message}`;
    hint.style.cssText = `
        position: absolute;
        ${boundary === 'max' ? 'top: -28px' : 'bottom: -28px'};
        right: 0;
        background: ${boundary === 'max' ? '#fef0f0' : '#fdf6ec'};
        border: 1px solid ${boundary === 'max' ? '#f56c6c' : '#e6a23c'};
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 9px;
        color: ${boundary === 'max' ? '#f56c6c' : '#e6a23c'};
        font-weight: 500;
        white-space: nowrap;
        z-index: 1000;
        animation: fadeInHint 0.15s ease;
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    // Добавляем анимацию в <head> если ещё нет
    if (!document.getElementById('boundary-hint-animation')) {
        const style = document.createElement('style');
        style.id = 'boundary-hint-animation';
        style.textContent = `
            @keyframes fadeInHint {
                from { opacity: 0; transform: translateY(4px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOutHint {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Позиционируем относительно input
    const inputWrapper = inputElement.closest('.el-input-number') || inputElement;
    inputWrapper.style.position = 'relative';
    inputWrapper.appendChild(hint);

    // Авто-удаление через 2 секунды
    setTimeout(() => {
        hint.style.animation = 'fadeOutHint 0.15s ease';
        setTimeout(() => hint.remove(), 150);
    }, 2000);
};

// ============================================================================
// ЭКСПОРТ ПО УМОЛЧАНИЮ
// ============================================================================

export default {
    // Форматирование напряжения
    formatVoltageUtils,

    // Форматирование времени
    formatRuntimeUtils,
    formatRuntimeFullUtils,
    formatRuntimeShortUtils,
    formatRuntimeWithSettingsUtils,
    getRuntimeFormatUtils,
    setRuntimeFormatUtils,

    // Форматирование статусов
    formatDeviceStatusUtils,
    formatGroupConfigUtils,

    // Форматирование для API
    formatForApiUtils,
    formatFromApiUtils,

    // Форматирование для таблиц и карточек
    formatForTableUtils,
    formatDeviceDataUtils,

    // Валидация
    normalizeValidationErrorsUtils,

    // UI подсказки
    showBoundaryHintUtils
};

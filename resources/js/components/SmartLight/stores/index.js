/**
 * Точка входа для сторов
 *
 * Экспортируем только единый стор Smartlight
 *
 * @file stores/index.js
 */

import { useSmartlightStore } from './smartlightStore';

/**
 * Экспортируем единый стор Smartlight
 */
export {
    useSmartlightStore
};

/**
 * Экспортируем утилиты для работы с устройствами
 */
export * from '@/components/SmartLight/utils/deviceUtils';

/**
 * Экспортируем утилиты для работы с питанием
 */
export * from '@/components/SmartLight/utils/powerUtils';

/**
 * Экспортируем валидаторы
 */
export * from '@/components/SmartLight/utils/validators';

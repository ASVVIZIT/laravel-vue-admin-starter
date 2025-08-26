// resources/js/components/DynamicTable/services/mockData.js

// === ЕДИНАЯ СТРУКТУРА ДЛЯ ВСЕХ МОКОВЫХ ДАННЫХ СПРАВОЧНИКОВ ===
export const MOCK_REFERENCE_DATA = {
    // === Аксессуары ===
    accessory: [
        { id: 1, brand: { name: 'ABB' }, model: 'SH200', series: 'S200', name: 'ABB SH200' },
        { id: 2, brand: { name: 'Legrand' }, model: 'DX 3', series: 'DX3', name: 'Legrand DX 3' },
        { id: 3, brand: { name: 'IEK' }, model: 'VA47-29', series: 'VA47', name: 'IEK VA47-29' },
        { id: 4, brand: { name: 'Schneider Electric' }, model: 'Acti9', series: 'iC60', name: 'Schneider Electric Acti9 iC60' },
        { id: 5, brand: { name: 'Hager' }, model: 'NG125', series: 'NG', name: 'Hager NG125' }
    ],

    // === Бренды ===
    brand: [
        { id: 1, name: 'ABB', country: 'Швейцария', website: 'https://www.abb.com' },
        { id: 2, name: 'Legrand', country: 'Франция', website: 'https://www.legrand.com' },
        { id: 3, name: 'IEK', country: 'Россия', website: 'https://www.iek.ru' },
        { id: 4, name: 'Schneider Electric', country: 'Франция', website: 'https://www.se.com' },
        { id: 5, name: 'Hager', country: 'Германия', website: 'https://www.hager.com' }
    ],

    // === Типы устройств ===
    device_type: [
        { id: 1, name: 'Автоматический выключатель', code: 'ACB' },
        { id: 2, name: 'УЗО', code: 'RCD' },
        { id: 3, name: 'Дифавтомат', code: 'RCBO' },
        { id: 4, name: 'Контактор', code: 'CTR' },
        { id: 5, name: 'Пускатель', code: 'STTR' }
    ],

    // === Категории измерений ===
    measurement_category: [
        { id: 1, name: 'Единицы измерения электрического тока', description: 'Амперы, миллиамперы и т.д.' },
        { id: 2, name: 'Единицы измерения напряжения', description: 'Вольты, киловольты и т.д.' },
        { id: 3, name: 'Единицы измерения мощности', description: 'Ватты, киловатты и т.д.' },
        { id: 4, name: 'Единицы измерения сопротивления', description: 'Омы, килоомы и т.д.' },
        { id: 5, name: 'Единицы измерения частоты', description: 'Герцы, килогерцы и т.д.' }
    ],

    // === Единицы измерения ===
    measurement_unit: [
        { id: 1, name: 'Ампер', symbol: 'a', display_symbol: 'A', physical_quantity: 'Сила тока', measurement_category_id: 1 },
        { id: 2, name: 'Вольт', symbol: 'v', display_symbol: 'V', physical_quantity: 'Напряжение', measurement_category_id: 2 },
        { id: 3, name: 'Ватт', symbol: 'w', display_symbol: 'W', physical_quantity: 'Мощность', measurement_category_id: 3 },
        { id: 4, name: 'Ом', symbol: 'ohm', display_symbol: 'Ω', physical_quantity: 'Сопротивление', measurement_category_id: 4 },
        { id: 5, name: 'Герц', symbol: 'hz', display_symbol: 'Hz', physical_quantity: 'Частота', measurement_category_id: 5 }
    ],

    // === Кабели ===
    cable: [
        { id: 1, model: 'ВВГнг(А)-LS', name: 'Кабель силовой', brand: { name: 'IEK' }, type: { name: 'Силовой кабель' }, insulation: 'ПВХ', cores: 3, cross_section: 2.5, current_rating: 16, temperature_range_min: -40, temperature_range_max: 70 },
        { id: 2, model: 'NYM', name: 'Кабель монтажный', brand: { name: 'Legrand' }, type: { name: 'Монтажный кабель' }, insulation: 'ПВХ', cores: 2, cross_section: 1.5, current_rating: 10, temperature_range_min: -30, temperature_range_max: 70 },
        { id: 3, model: 'КГ', name: 'Кабель гибкий', brand: { name: 'ABB' }, type: { name: 'Гибкий кабель' }, insulation: 'Резина', cores: 3, cross_section: 4, current_rating: 25, temperature_range_min: -40, temperature_range_max: 60 }
    ]
};
// === КОНЕЦ ЕДИНОЙ СТРУКТУРЫ ===

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С МОКОВЫМИ ДАННЫМИ ===

/**
 * Получение моковых данных для конкретного типа справочника
 * @param {string} entityType - Тип справочника (например, 'accessory', 'brand')
 * @returns {Array} - Массив моковых данных
 */
export const getMockReferenceData = (entityType) => {
    // Проверяем, существуют ли моковые данные для этого типа
    if (MOCK_REFERENCE_DATA[entityType]) {
        // Возвращаем копию массива, чтобы избежать мутаций оригинальных данных
        return [...MOCK_REFERENCE_DATA[entityType]];
    }

    // Если данные не найдены, возвращаем пустой массив
    console.warn(`[mockData] Mock data for entityType "${entityType}" not found.`);
    return [];
};

/**
 * Получение всех доступных типов справочников из моковых данных
 * @returns {Array} - Массив объектов { value, label }
 */
export const getMockReferenceTypes = () => {
    // Получаем ключи объекта MOCK_REFERENCE_DATA как массив типов
    return Object.keys(MOCK_REFERENCE_DATA).map(type => ({
        value: type,
        // Преобразуем snake_case в человекочитаемый формат
        label: type
            .replace(/_/g, ' ') // Заменяем подчеркивания на пробелы
            .replace(/\b\w/g, l => l.toUpperCase()) // Делаем первую букву каждого слова заглавной
    }));
};

/**
 * Получение примера формата отображения для типа справочника
 * @param {string} entityType - Тип справочника
 * @returns {string} - Пример формата отображения
 */
export const getExampleFormatForType = (entityType) => {
    // Определяем пример формата в зависимости от типа
    switch (entityType) {
        case 'accessory':
            return '{brand.name} {model} ({series})';
        case 'brand':
            return '{name} ({country})';
        case 'device_type':
            return '{name} ({code})';
        case 'measurement_category':
            return '{name} - {description}';
        case 'measurement_unit':
            return '{name} ({display_symbol})';
        case 'cable':
            return '{brand.name} {model} ({insulation}, {cores}x{cross_section} мм²)';
        default:
            // По умолчанию используем первое доступное поле или 'id'
            const data = MOCK_REFERENCE_DATA[entityType];
            if (data && data.length > 0) {
                const firstItem = data[0];
                // Пытаемся найти подходящее поле для отображения
                if (firstItem.name) return '{name}';
                if (firstItem.label) return '{label}';
                if (firstItem.title) return '{title}';
                // Если ничего не найдено, возвращаем 'id'
                return '{id}';
            }
            // Если данных нет, возвращаем 'id'
            return '{id}';
    }
};

/**
 * Получение доступных ключей для формата отображения
 * @param {string} entityType - Тип справочника
 * @returns {Array} - Массив доступных ключей
 */
export const getAvailableKeysForType = (entityType) => {
    // Получаем данные для типа
    const data = MOCK_REFERENCE_DATA[entityType];

    // Если данных нет, возвращаем пустой массив
    if (!data || data.length === 0) {
        return ['id', 'name']; // Значения по умолчанию
    }

    // Берем первый элемент для анализа структуры
    const firstItem = data[0];

    // Получаем ключи первого уровня
    const keys = Object.keys(firstItem);

    // Фильтруем служебные поля
    const filteredKeys = keys.filter(key => !['id', 'created_at', 'updated_at'].includes(key));

    // Добавляем вложенные ключи (например, brand.name)
    const availableKeys = [...filteredKeys];

    // Проверяем, есть ли вложенные объекты
    for (const key of filteredKeys) {
        if (typeof firstItem[key] === 'object' && firstItem[key] !== null) {
            // Получаем ключи вложенного объекта
            const nestedKeys = Object.keys(firstItem[key]);

            // Добавляем их как ключи второго уровня
            for (const nestedKey of nestedKeys) {
                if (!['id', 'created_at', 'updated_at'].includes(nestedKey)) {
                    availableKeys.push(`${key}.${nestedKey}`);
                }
            }
        }
    }

    return availableKeys;
};
// === КОНЕЦ ВСПОМОГАТЕЛЬНЫХ ФУНКЦИЙ ===

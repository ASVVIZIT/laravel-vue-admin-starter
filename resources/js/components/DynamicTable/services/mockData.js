// resources/js/components/DynamicTable/services/mockData.js
export const MOCK_ACCESSORIES = [
    { id: 1, brand: { name: 'ABB' }, model: 'SH200', series: 'S200', name: 'ABB SH200' },
    { id: 2, brand: { name: 'Legrand' }, model: 'DX 3', series: 'DX3', name: 'Legrand DX 3' },
    { id: 3, brand: { name: 'IEK' }, model: 'VA47-29', series: 'VA47', name: 'IEK VA47-29' },
    { id: 4, brand: { name: 'Schneider Electric' }, model: 'Acti9', series: 'iC60', name: 'Schneider Electric Acti9 iC60' },
    { id: 5, brand: { name: 'Hager' }, model: 'NG125', series: 'NG', name: 'Hager NG125' }
];

export const MOCK_BRANDS = [
    { id: 1, name: 'ABB', country: 'Швейцария', website: 'https://www.abb.com' },
    { id: 2, name: 'Legrand', country: 'Франция', website: 'https://www.legrand.com' },
    { id: 3, name: 'IEK', country: 'Россия', website: 'https://www.iek.ru' },
    { id: 4, name: 'Schneider Electric', country: 'Франция', website: 'https://www.se.com' },
    { id: 5, name: 'Hager', country: 'Германия', website: 'https://www.hager.com' }
];

export const MOCK_DEVICE_TYPES = [
    { id: 1, name: 'Автоматический выключатель', code: 'ACB' },
    { id: 2, name: 'УЗО', code: 'RCD' },
    { id: 3, name: 'Дифавтомат', code: 'RCBO' },
    { id: 4, name: 'Контактор', code: 'CTR' },
    { id: 5, name: 'Пускатель', code: 'STTR' }
];

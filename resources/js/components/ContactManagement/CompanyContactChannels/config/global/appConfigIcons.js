// ============================================================================
// APP CONFIG ICONS — ICON CONFIGURATION
// ============================================================================
// 📁 Путь: config/global/appConfigIcons.js
// ✅ Используется: CompanyTable.vue, CompanyForm.vue, CompanyList.vue,
//                  Filters.vue, SettingsModal.vue
// ✅ Безопасно менять — влияет только на отображение иконок
// ✅ Зависит от: @element-plus/icons-vue
// ============================================================================

import {
    Link as DefaultIcon,
    OfficeBuilding,
    House,
    VideoCamera,
    ChatLineSquare,
    Position,
    Guide,
    Picture,
    Connection,
    Monitor,
} from '@element-plus/icons-vue';

// ============================================================================
// ICON MAP (для CompanyTable.vue)
// ============================================================================

export function getIconMap(fenixIconStore) {
    const map = {
        'el-icon-office-building': OfficeBuilding,
        'el-icon-house': House,
        'el-icon-fenix-custom': fenixIconStore?.getIconByName?.('FenixCustom') || DefaultIcon,
        'el-icon-link': DefaultIcon,
        'el-icon-video-camera': VideoCamera,
        'el-icon-chat-line-square': ChatLineSquare,
        'el-icon-position': Position,
        'el-icon-guide': Guide,
        'el-icon-picture': Picture,
        'el-icon-connection': Connection,
        'el-icon-monitor': Monitor,
        'default': DefaultIcon,
    };

    console.log('[appConfigIcons] getIconMap:', Object.keys(map).length, 'icons');
    return map;
}

// ============================================================================
// ICON OPTIONS (для CompanyForm.vue) — С component!
// ============================================================================

export function getIconOptions() {
    const options = [
        { value: 'el-icon-office-building', label: 'Офисное здание', component: OfficeBuilding },
        { value: 'el-icon-house', label: 'Дом', component: House },
        { value: 'el-icon-fenix-custom', label: 'Fenix Custom', component: DefaultIcon },
        { value: 'el-icon-link', label: 'Ссылка', component: DefaultIcon },
        { value: 'el-icon-video-camera', label: 'Видеокамера', component: VideoCamera },
        { value: 'el-icon-chat-line-square', label: 'Чат', component: ChatLineSquare },
        { value: 'el-icon-position', label: 'Позиция', component: Position },
        { value: 'el-icon-guide', label: 'Гид', component: Guide },
        { value: 'el-icon-picture', label: 'Картинка', component: Picture },
        { value: 'el-icon-connection', label: 'Соединение', component: Connection },
        { value: 'el-icon-monitor', label: 'Монитор', component: Monitor },
    ];

    console.log('[appConfigIcons] getIconOptions:', options.length, 'options');
    return options;
}

// ============================================================================
// HELPER FUNCTION (для getIconComponent в CompanyForm.vue)
// ============================================================================

export function getIconComponentByName(iconName) {
    const iconMap = {
        'el-icon-office-building': OfficeBuilding,
        'el-icon-house': House,
        'el-icon-fenix-custom': DefaultIcon,
        'el-icon-link': DefaultIcon,
        'el-icon-video-camera': VideoCamera,
        'el-icon-chat-line-square': ChatLineSquare,
        'el-icon-position': Position,
        'el-icon-guide': Guide,
        'el-icon-picture': Picture,
        'el-icon-connection': Connection,
        'el-icon-monitor': Monitor,
    };

    return iconMap[iconName] || DefaultIcon;
}

// ============================================================================
// CONSTANTS (для быстрого доступа)
// ============================================================================

export const ICON_DEFAULT = DefaultIcon;
export const ICON_DEFAULT_NAME = 'el-icon-link';
export const ICON_COUNT = 11;

export const ICON_VALUES = [
    'el-icon-office-building',
    'el-icon-house',
    'el-icon-fenix-custom',
    'el-icon-link',
    'el-icon-video-camera',
    'el-icon-chat-line-square',
    'el-icon-position',
    'el-icon-guide',
    'el-icon-picture',
    'el-icon-connection',
    'el-icon-monitor',
];

// ============================================================================
// ICON FILTER OPTIONS (для Filters.vue и SettingsModal.vue)
// ============================================================================

export const ICON_FILTER_OPTIONS = [
    {
        value: '',
        label: 'Все',
        description: 'Показать все компании',
    },
    {
        value: 'with',
        label: 'С иконкой',
        description: 'Только компании с иконкой',
    },
    {
        value: 'without',
        label: 'Без иконки',
        description: 'Только компании без иконки',
    },
];

// ============================================================================
// ICON FILTER MESSAGES (для локализации)
// ============================================================================

export const ICON_FILTER_MESSAGES = {
    ALL: 'Все',
    WITH_ICON: 'С иконкой',
    WITHOUT_ICON: 'Без иконки',
    PLACEHOLDER: 'Выберите фильтр',
    LABEL: 'Фильтр по иконке:',
    HINT: 'Фильтр по иконкам применяемый при загрузке',
};

// ============================================================================
// HELPER FUNCTIONS (для filter)
// ============================================================================

export function getIconFilterOptions() {
    return ICON_FILTER_OPTIONS;
}

export function getIconFilterLabel(value) {
    const option = ICON_FILTER_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : ICON_FILTER_MESSAGES.ALL;
}

export function parseIconFilterValue(value) {
    if (value === '' || value === null || value === undefined) return '';
    if (value === 'true' || value === true || value === 'with') return 'with';
    if (value === 'false' || value === false || value === 'without') return 'without';
    return '';
}

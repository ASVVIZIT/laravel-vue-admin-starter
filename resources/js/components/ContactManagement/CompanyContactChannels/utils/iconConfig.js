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
    QuestionFilled,
} from '@element-plus/icons-vue';

// ============================================================================
// МАППИНГ ИКОНОК (для CompanyTable.vue)
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

    console.log('[iconConfig] getIconMap:', Object.keys(map).length, 'icons');
    return map;
}

// ============================================================================
// ОПЦИИ ДЛЯ SELECT (для CompanyForm.vue) - С component!
// ============================================================================

export function getIconOptions() {
    const options = [
        {
            value: 'el-icon-office-building',
            label: 'Офисное здание',
            component: OfficeBuilding,
        },
        {
            value: 'el-icon-house',
            label: 'Дом',
            component: House,
        },
        {
            value: 'el-icon-fenix-custom',
            label: 'Fenix Custom',
            component: DefaultIcon,
        },
        {
            value: 'el-icon-link',
            label: 'Ссылка',
            component: DefaultIcon,
        },
        {
            value: 'el-icon-video-camera',
            label: 'Видеокамера',
            component: VideoCamera,
        },
        {
            value: 'el-icon-chat-line-square',
            label: 'Чат',
            component: ChatLineSquare,
        },
        {
            value: 'el-icon-position',
            label: 'Позиция',
            component: Position,
        },
        {
            value: 'el-icon-guide',
            label: 'Гид',
            component: Guide,
        },
        {
            value: 'el-icon-picture',
            label: 'Картинка',
            component: Picture,
        },
        {
            value: 'el-icon-connection',
            label: 'Соединение',
            component: Connection,
        },
        {
            value: 'el-icon-monitor',
            label: 'Монитор',
            component: Monitor,
        },
    ];

    console.log('[iconConfig] getIconOptions:', options.length, 'options');
    console.log('[iconConfig] getIconOptions sample:', options[0]);

    return options;
}

// ============================================================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ (для getIconComponent в CompanyForm.vue)
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

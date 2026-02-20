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
    Monitor
} from '@element-plus/icons-vue';

export function getIconMap(fenixIconStore) {
    return {
        'el-icon-office-building': OfficeBuilding,
        'el-icon-house': House,
        'el-icon-fenix-custom': fenixIconStore.getIconByName('FenixCustom') || DefaultIcon,
        'el-icon-link': DefaultIcon,
        'el-icon-video-camera': VideoCamera,
        'el-icon-chat-line-square': ChatLineSquare,
        'el-icon-position': Position,
        'el-icon-guide': Guide,
        'el-icon-picture': Picture,
        'el-icon-connection': Connection,
        'el-icon-monitor': Monitor,
        'default': DefaultIcon
    };
}

export function getIconOptions() {
    return [
        { value: 'el-icon-office-building', label: 'Офисное здание' },
        { value: 'el-icon-house', label: 'Дом' },
        { value: 'el-icon-fenix-custom', label: 'Fenix Custom' },
        { value: 'el-icon-link', label: 'Ссылка' },
        { value: 'el-icon-video-camera', label: 'Видеокамера' },
        { value: 'el-icon-chat-line-square', label: 'Чат' },
        { value: 'el-icon-position', label: 'Позиция' },
        { value: 'el-icon-guide', label: 'Гид' },
        { value: 'el-icon-picture', label: 'Картинка' },
        { value: 'el-icon-connection', label: 'Соединение' },
        { value: 'el-icon-monitor', label: 'Монитор' }
    ];
}

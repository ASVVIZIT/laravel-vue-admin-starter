export function getInitialPaginationState() {
    return {
        currentPage: 1,
        perPage: 15,
        lastPage: 1,
    };
}

export const COMPANY_FORM_PROPS_CONFIG = {
    visible: { type: Boolean, default: false },
    company: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    iconOptions: { type: Array, default: () => [] },
    iconMap: { type: Object, default: () => ({}) },
};

export const COMPANY_FORM_UI = {
    DIALOG_WIDTH: '500px',
    LABEL_WIDTH: '80px',
    LABEL_POSITION: 'right',
    FORM_SIZE: 'small',
    ICON_SELECT_WIDTH: '100%',
};

export const COMPANY_FORM_FIELDS = {
    NAME: { key: 'name', label: 'Название', placeholder: 'Введите название компании', maxLength: 255 },
    DESCRIPTION: { key: 'description', label: 'Описание', placeholder: 'Введите описание компании', maxLength: 1000, rows: 3 },
    ADDRESS: { key: 'address', label: 'Адрес', placeholder: 'Введите адрес компании', maxLength: 500 },
    ICON: { key: 'settings.icon', label: 'Иконка', placeholder: 'Выберите иконку', clearable: true },
};

export const COMPANY_FORM_MESSAGES = {
    TITLE_CREATE: 'Добавить Компанию',
    TITLE_EDIT: 'Редактировать Компанию',
    SUBMIT_CREATE: 'Создать',
    SUBMIT_EDIT: 'Сохранить',
    CANCEL: 'Отмена',
    FIELD_REQUIRED: (field) => `Поле "${field}" обязательно`,
    FIELD_MIN_LENGTH: (field, min) => `Минимум ${min} символов`,
    FIELD_MAX_LENGTH: (field, max) => `Максимум ${max} символов`,
};

export const COMPANY_FORM_VALIDATION = {
    NAME: { required: true, min: 2, max: 255, trigger: ['blur', 'change'] },
    DESCRIPTION: { required: false, max: 1000, trigger: ['blur', 'change'] },
    ADDRESS: { required: false, max: 500, trigger: ['blur', 'change'] },
};

export function getDefaultCompanyFormValidation() {
    return {
        name: [
            { required: COMPANY_FORM_VALIDATION.NAME.required, message: COMPANY_FORM_MESSAGES.FIELD_REQUIRED('Название'), trigger: COMPANY_FORM_VALIDATION.NAME.trigger },
            { min: COMPANY_FORM_VALIDATION.NAME.min, message: COMPANY_FORM_MESSAGES.FIELD_MIN_LENGTH('Название', COMPANY_FORM_VALIDATION.NAME.min), trigger: COMPANY_FORM_VALIDATION.NAME.trigger },
            { max: COMPANY_FORM_VALIDATION.NAME.max, message: COMPANY_FORM_MESSAGES.FIELD_MAX_LENGTH('Название', COMPANY_FORM_VALIDATION.NAME.max), trigger: COMPANY_FORM_VALIDATION.NAME.trigger },
        ],
        description: [
            { max: COMPANY_FORM_VALIDATION.DESCRIPTION.max, message: COMPANY_FORM_MESSAGES.FIELD_MAX_LENGTH('Описание', COMPANY_FORM_VALIDATION.DESCRIPTION.max), trigger: COMPANY_FORM_VALIDATION.DESCRIPTION.trigger },
        ],
        address: [
            { max: COMPANY_FORM_VALIDATION.ADDRESS.max, message: COMPANY_FORM_MESSAGES.FIELD_MAX_LENGTH('Адрес', COMPANY_FORM_VALIDATION.ADDRESS.max), trigger: COMPANY_FORM_VALIDATION.ADDRESS.trigger },
        ],
        'settings.icon': [],
    };
}

export function getInitialCompanyFormState() {
    return {
        formData: { name: '', description: '', address: '', settings: { icon: '' } },
    };
}

export const COMPANY_TABLE_PROPS_CONFIG = {
    data: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    iconMap: { type: Object, required: true },
    iconOptions: { type: Array, required: true },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 15 },
    tableHeight: { type: String, default: '300' },
};

export const COMPANY_TABLE_UI = {
    HEADER_BACKGROUND: '#f5f7fa',
    HEADER_COLOR: '#606266',
    HEADER_FONT_WEIGHT: '600',
    HOVER_COLOR: '#f5f7fa',
    TABLE_HEIGHT: 'calc(100vh - 290px)',
};

export const PAGINATION_PROPS_CONFIG = {
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 15 },
    loadedCount: { type: Number, required: true },
    totalItems: { type: Number, default: 0 },
    availableSizes: { type: Array, required: true },
    disabled: { type: Boolean, default: false },
};

export const PAGINATION_UI = {
    GAP: '8px',
    MARGIN_TOP: '8px',
    PADDING: '4px 0',
    FONT_SIZE: '8.5px',
    BUTTON_HEIGHT: '17px',
    BUTTON_WIDTH: '17px',
    BUTTON_PADDING: '0 4px',
    BUTTON_MARGIN: '0 1.5px',
    BORDER_RADIUS: '2px',
    INPUT_WIDTH: '32px',
    INPUT_HEIGHT: '17px',
    INPUT_PADDING: '1px 4px',
    SELECT_WIDTH: '70px',
    SELECT_HEIGHT: '17px',
    DROPDOWN_PADDING: '3px 7px',
    TOTAL_MARGIN: '6px',
    JUMP_MARGIN: '6px',
};

export const PAGINATOR_DISPLAY = {
    LAYOUT: 'total, prev, pager, next, jumper',
    PAGER_COUNT: 5,
    HIDE_ON_SINGLE: true,
};

export const PAGINATION_LABELS = {
    PAGE_SIZE_SUFFIX: 'на странице',
    ALL_ITEMS: 'Все',
};

export const PAGE_SIZE_SELECTOR_PROPS_CONFIG = {
    modelValue: { type: Number, default: 15 },
    totalItems: { type: Number, default: 0 },
    loadedCount: { type: Number, default: 0 },
    availableSizes: { type: Array, default: () => [] },
    allLabel: { type: String, default: 'Все' },
    showLabel: { type: Boolean, default: false },
    label: { type: String, default: 'На странице:' },
    selectSize: { type: String, default: 'small' },
    className: { type: String, default: '' },
    selectClass: { type: String, default: '' },
};

export const PAGE_SIZE_SELECTOR_UI = {
    SHOW_LABEL: false,
    SELECT_SIZE: 'small',
    SELECT_WIDTH: '70px',
    CLASS_NAME: '',
    SELECT_CLASS: '',
    LABEL_COLOR: '#606266',
    LABEL_FONT_SIZE: '8.5px',
    GAP: '8px',
};

export const PAGE_SIZE_OPTIONS = {
    BASE_AVAILABLE: [5, 10, 15, 30, 50, 100, 200, 500, 1000],
    MIN: 5,
    MAX: 1000,
};

export function generateAvailablePageSizes(totalItems) {
    const baseSizes = PAGE_SIZE_OPTIONS.BASE_AVAILABLE;
    if (totalItems <= 0) return baseSizes;
    const filtered = baseSizes.filter(size => size <= totalItems);
    if (!filtered.includes(totalItems) && totalItems <= PAGE_SIZE_OPTIONS.MAX) {
        filtered.push(totalItems);
    }
    return filtered.sort((a, b) => a - b);
}

export const CHUNK_CONFIG = {
    SIZE: 500,
    DELAY: 200,
    MAX_CONCURRENT: 1,
};

export const COMPANY_LIST_THRESHOLDS = {
    SHOW_LOAD_BUTTONS_MIN: 1000,
    CONFIRM_LOAD_ALL_MIN: 5000,
};

export const COMPANY_LIST_FILTERS = {
    SEARCH_DEBOUNCE: 700,
    FILTER_TRANSITION_DELAY: 100,
    PAGE_SIZE_TRANSITION_DELAY: 150,
};

export const COMPANY_LIST_UI = {
    PADDING: '5px',
    HEADER_GAP: '8px',
    HEADER_ACTIONS_GAP: '8px',
    HEADER_TITLE_FILTERS_GAP: '12px',
    LOAD_STATUS_TAG_HEIGHT: '20px',
    LOAD_STATUS_TAG_PADDING: '0 6px',
    LOAD_STATUS_TAG_FONT_SIZE: '10px',
    TABLE_WRAPPER_MARGIN_BOTTOM: '10px',
    TABLE_WRAPPER_BORDER: '0.01rem solid #e9e9e9',
    TABLE_WRAPPER_BORDER_RADIUS: '2px',
    TABLE_WRAPPER_MIN_HEIGHT: '300px',
    LOADING_SPINNER_SIZE: '32px',
    LOADING_SPINNER_COLOR: '#409EFF',
    LOADING_TEXT_COLOR: '#606266',
    LOADING_TEXT_SIZE: '12px',
};

export const COMPANY_LIST_PROPS_CONFIG = {
    tableMaxHeight: { type: String, default: 'calc(100vh - 320px)' },
    tableMinHeight: { type: String, default: 'calc(100vh - 320px)' },
};

export const COMPANY_LIST_MESSAGES = {
    LOADING_INITIAL: 'Загрузка...',
    LOADING_CHUNKS: (progress) => `Загрузка ${progress}%...`,
    LOADING_DEFAULT: 'Загрузка...',
    CONFIRM_LOAD_ALL_TITLE: 'Предупреждение',
    CONFIRM_LOAD_ALL_CONFIRM: 'Да',
    CONFIRM_LOAD_ALL_CANCEL: 'Нет',
    CONFIRM_LOAD_ALL_MESSAGE: (total) => `Загрузка ${total} записей займёт 1-2 минуты. Продолжить?`,
    SUCCESS_CHUNK_LOADED: (count) => `Загружено ещё ${count} записей`,
    SUCCESS_ALL_LOADED: (total) => `Загружено все ${total} записей`,
    SUCCESS_COMPANY_CREATED: 'Компания создана',
    SUCCESS_COMPANY_UPDATED: 'Компания обновлена',
    SUCCESS_COMPANY_DELETED: (name) => `Компания "${name}" удалена`,
    SUCCESS_FILTERS_RESET: 'Фильтры сброшены',
    ERROR_LOADING: 'Ошибка при загрузке',
    ERROR_DELETING: 'Ошибка при удалении',
    ERROR_SAVING: 'Ошибка при сохранении',
};

export function getInitialCompanyListState() {
    return {
        dialogVisible: false,
        editingCompany: null,
        formLoading: false,
        deletionLoading: false,
        deleteConfirmDialogVisible: false,
        companyToDelete: null,
        filteringLoading: false,
        pageSizeLoading: false,
        searchQuery: '',
        filterHasIcon: '',
        sortBy: 'id_asc',
        filteredCount: 0,
        totalPages: 0,
    };
}

export const CHUNK_PROGRESS_PROPS_CONFIG = {
    loaded: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    chunkProgress: { type: Number, default: 0 },
    isLoading: { type: Boolean, default: false },
};

export const CHUNK_PROGRESS_CONFIG = {
    HEIGHT: '20px',
    BORDER_RADIUS: '10px',
    LOADING_COLOR: '#409EFF',
    LOADING_COLOR_LIGHT: '#66b1ff',
    CHUNK_COLOR: '#FF9500',
    CHUNK_COLOR_LIGHT: '#FFB140',
    BACKGROUND_COLOR: '#e0e0e0',
    STRIPE_WIDTH: '10px',
    STRIPE_ANGLE: '45deg',
    STRIPE_ANIMATION_DURATION: '4s',
    STRIPE_OPACITY: '0.25',
    STRIPE_ANIMATION_DELAY: '0s',
    STRIPES_WIDTH: '400%',
    STRIPES_LEFT_OFFSET: '-150%',
    STRIPES_ANIMATION_DISTANCE: '60px',
    SHINE_WIDTH: '300px',
    SHINE_DURATION: '4s',
    SHINE_COLOR: 'rgba(255, 255, 255, 0.5)',
    SHINE_LEFT_START: '-150%',
    SHINE_LEFT_END: '150%',
    SHINE_ANIMATION_DELAY: '0s',
    CHUNK_OVERSHOOT_PERCENT: '12%',
    CHUNK_MIN_WIDTH: '5%',
    CHUNK_CATCHUP_DELAY: '600ms',
    CHUNK_CATCHUP_DURATION: '0.6s',
    CHUNK_GROWTH_DURATION: '0.8s',
    CHUNK_SHADOW: '0 0 10px rgba(255, 149, 0, 0.8), inset 0 0 5px rgba(255, 255, 255, 0.3)',
    CHUNK_BORDER: '2px solid rgba(255, 255, 255, 0.6)',
    CHUNK_GRADIENT_ANGLE: '90deg',
    CHUNK_Z_INDEX: 1,
    LOADED_Z_INDEX: 10,
    CHUNK_BORDER_RADIUS: '8px',
    FONT_SIZE: '9px',
    FONT_SIZE_PERCENTAGE: '8px',
    FONT_WEIGHT: '700',
    TEXT_COLOR: '#FFFFFF',
    TEXT_SHADOW: '0 2px 4px rgba(0, 0, 0, 0.5)',
    TRANSITION_DURATION: '0.8s',
    TRANSITION_TIMING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    BOX_SHADOW: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',
};

export const EDITABLE_CELL_PROPS_CONFIG = {
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: 'Введите значение' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: '—' },
    maxLength: { type: Number, default: 255 },
    rows: { type: Number, default: 1 },
    showEditButton: { type: Boolean, default: true },
    showActionButtons: { type: Boolean, default: false },
    validator: { type: Function, default: null },
};

export const EDITABLE_CELL_UI = {
    FONT_SIZE: '8px',
    LINE_HEIGHT: '14px',
    INPUT_HEIGHT: '18px',
    INPUT_PADDING: '1px 4px',
    BUTTON_FONT_SIZE: '10px',
    ERROR_COLOR: '#f56c6c',
};

export const FILTERS_PROPS_CONFIG = {
    totalItems: { type: Number, default: 0 },
    totalFiltered: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false },
    availableSizes: { type: Array, default: () => [] },
    showIconFilter: { type: Boolean, default: true },
    searchDebounce: { type: Number, default: 700 },
};

export const FILTERS_UI = {
    HEIGHT: '24px',
    INPUT_WIDTH: '100px',
    INPUT_WIDTH_FOCUSED: '200px',
    SELECT_WIDTH: '100px',
    GAP: '6px',
    FONT_SIZE: '9px',
    TRANSITION_DURATION: '0.3s',
};

export const FILTERS_MESSAGES = {
    SEARCH_PLACEHOLDER: 'Поиск...',
    ICON_FILTER_LABEL: 'Иконка',
    ICON_FILTER_ALL: 'Все',
    ICON_FILTER_WITH: 'С иконкой',
    ICON_FILTER_WITHOUT: 'Без иконки',
    SORT_LABEL: 'Сортировка',
};

export const DELETE_CONFIRM_PROPS_CONFIG = {
    visible: { type: Boolean, default: false },
    item: { type: Object, default: null },
    itemName: { type: String, default: '' },
    entityLabel: { type: String, default: 'запись' },
    loading: { type: Boolean, default: false },
};

export const DELETE_CONFIRM_UI = {
    DIALOG_WIDTH: '400px',
    ICON_SIZE: '48px',
    ICON_COLOR: '#f56c6c',
};

export const DELETE_CONFIRM_MESSAGES = {
    TITLE: 'Подтверждение удаления',
    MESSAGE: (name, label) => `Удалить ${label} "${name}"?`,
    CONFIRM: 'Удалить',
    CANCEL: 'Отмена',
};

export const COMMON_PROPS_CONFIG = {
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
};

export const LOADING_DATA_ACTIONS_PROPS_CONFIG = {
    loaded: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    chunkSize: { type: Number, default: 500 },
    disabled: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
    showLoadMore: { type: Boolean, default: true },
    showLoadAll: { type: Boolean, default: true },
    showRefresh: { type: Boolean, default: false },
    chunkProgress: { type: Number, default: 0 },
};

export const LOADING_DATA_ACTIONS_UI = {
    HEIGHT: '28px',
    GAP: '8px',
    PADDING: '4px 8px',
    BACKGROUND: '#f5f7fa',
    BORDER_RADIUS: '4px',
    BORDER: '1px solid #e4e7ed',
    BUTTON_FONT_SIZE: '10px',
    BUTTON_HEIGHT: '22px',
    BUTTON_PADDING: '3px 8px',
    BUTTON_BORDER_RADIUS: '3px',
    ICON_SIZE: '12px',
    ICON_MARGIN: '2px',
    MAIN_BUTTON_MIN_WIDTH: '70px',
    REFRESH_BUTTON_PADDING: '3px 6px',
};

export const LOADING_DATA_ACTIONS_COLORS = {
    BTN_MORE_GRADIENT_FROM: '#67c23a',
    BTN_MORE_GRADIENT_TO: '#529b33',
    BTN_MORE_GRADIENT_FROM_HOVER: '#85ce61',
    BTN_MORE_GRADIENT_TO_HOVER: '#67c23a',
    BTN_MAIN_GRADIENT_FROM: '#e6a23c',
    BTN_MAIN_GRADIENT_TO: '#c98b2f',
    BTN_MAIN_GRADIENT_FROM_HOVER: '#ebb563',
    BTN_MAIN_GRADIENT_TO_HOVER: '#e6a23c',
    BTN_REFRESH_GRADIENT_FROM: '#909399',
    BTN_REFRESH_GRADIENT_TO: '#73767a',
    BTN_REFRESH_GRADIENT_FROM_HOVER: '#a6a9ad',
    BTN_REFRESH_GRADIENT_TO_HOVER: '#909399',
    TEXT_COLOR: '#FFF',
    DISABLED_OPACITY: '0.6',
};

export const LOADING_DATA_ACTIONS_MESSAGES = {
    TOOLTIP_LOAD_MORE: 'Загрузить ещё 500 записей',
    TOOLTIP_LOAD_ALL: 'Загрузить все записи',
    TOOLTIP_PAUSE: 'Приостановить загрузку',
    TOOLTIP_RESUME: 'Возобновить загрузку',
    TOOLTIP_REFRESH: 'Проверить новые записи',
    BTN_LOAD_MORE: '+500',
    BTN_LOAD_ALL: 'Все',
    BTN_PAUSE: 'Пауза',
    BTN_RESUME: 'Продолжить',
    STATUS_LOADING: 'Загрузка...',
    STATUS_PAUSED: 'Пауза',
    STATUS_COMPLETE: 'Готово',
    STATUS_WAITING: 'Ожидание',
};

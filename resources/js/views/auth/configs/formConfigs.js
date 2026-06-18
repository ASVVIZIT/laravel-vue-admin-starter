/**
 * Конфигурации форм входа для разных типов пользователей
 *
 * Легко добавлять новые типы, поля, валидацию
 */

export const formConfigs = {
    // ========================================================================
    // 👤 ОБЫЧНЫЙ ПОЛЬЗОВАТЕЛЬ
    // ========================================================================
    user: {
        title: 'login.title',
        fields: [
            {
                name: 'email',
                type: 'email',
                placeholder: 'login.email',
                icon: 'person-fill',
                required: true,
                validation: {
                    type: 'email',
                    message: 'validation.rules.email.type'
                }
            },
            {
                name: 'password',
                type: 'password',
                placeholder: 'validation.rules.password.placeholder',
                icon: 'shield-lock',
                required: true,
                showPasswordToggle: true,
                validation: {
                    minLength: 6,
                    message: 'validation.rules.password.minLength'
                }
            }
        ],
        buttons: [
            {
                type: 'submit',
                label: 'login.logIn',
                style: 'primary'
            }
        ],
        links: [
            { label: 'login.forgotPassword', path: '/forgot-password' },
            { label: 'login.register', path: '/register' }
        ],
        features: {
            captcha: false,
            twoFactor: false,
            oauth: false,
            rememberMe: true
        }
    },

    // ========================================================================
    // 🔐 АДМИНИСТРАТОР (с 2FA)
    // ========================================================================
    admin: {
        title: 'login.adminTitle',
        fields: [
            {
                name: 'email',
                type: 'email',
                placeholder: 'login.email',
                icon: 'person-fill',
                required: true,
                validation: {
                    type: 'email',
                    message: 'validation.rules.email.type'
                }
            },
            {
                name: 'password',
                type: 'password',
                placeholder: 'validation.rules.password.placeholder',
                icon: 'shield-lock',
                required: true,
                showPasswordToggle: true,
                validation: {
                    minLength: 8,
                    message: 'validation.rules.password.minLength'
                }
            },
            {
                name: 'twoFactorCode',
                type: 'text',
                placeholder: 'login.twoFactorCode',
                icon: 'key',
                required: true,
                maxLength: 6,
                validation: {
                    pattern: /^\d{6}$/,
                    message: 'validation.rules.twoFactor.pattern'
                }
            }
        ],
        buttons: [
            {
                type: 'submit',
                label: 'login.logIn',
                style: 'primary'
            }
        ],
        links: [
            { label: 'login.forgotPassword', path: '/forgot-password' }
        ],
        features: {
            captcha: false,
            twoFactor: true,
            oauth: false,
            rememberMe: false
        }
    },

    // ========================================================================
    // 🧪 ТЕСТЕР (без пароля, только выбор роли)
    // ========================================================================
    tester: {
        title: 'login.testerTitle',
        fields: [
            {
                name: 'role',
                type: 'select',
                placeholder: 'login.selectRole',
                icon: 'person-badge',
                required: true,
                defaultValue: 'user',
                options: [
                    { value: 'admin', label: 'roles.admin' },
                    { value: 'user', label: 'roles.user' },
                    { value: 'moderator', label: 'roles.moderator' }
                ]
            }
        ],
        buttons: [
            {
                type: 'submit',
                label: 'login.loginAsTester',
                style: 'primary'
            }
        ],
        links: [],
        features: {
            captcha: false,
            twoFactor: false,
            oauth: false,
            rememberMe: false
        }
    },

    // ========================================================================
    // 🛡️ МОДЕРАТОР (с капчей)
    // ========================================================================
    moderator: {
        title: 'login.moderatorTitle',
        fields: [
            {
                name: 'email',
                type: 'email',
                placeholder: 'login.email',
                icon: 'person-fill',
                required: true,
                validation: {
                    type: 'email',
                    message: 'validation.rules.email.type'
                }
            },
            {
                name: 'password',
                type: 'password',
                placeholder: 'validation.rules.password.placeholder',
                icon: 'shield-lock',
                required: true,
                showPasswordToggle: true,
                validation: {
                    minLength: 8,
                    message: 'validation.rules.password.minLength'
                }
            },
            {
                name: 'captcha',
                type: 'captcha',
                placeholder: 'login.captcha',
                icon: 'shield-check',
                required: true,
                validation: {
                    required: true,
                    message: 'validation.rules.captcha.required'
                }
            }
        ],
        buttons: [
            {
                type: 'submit',
                label: 'login.logIn',
                style: 'primary'
            }
        ],
        links: [
            { label: 'login.forgotPassword', path: '/forgot-password' }
        ],
        features: {
            captcha: true,
            twoFactor: false,
            oauth: false,
            rememberMe: false
        }
    },

    // ========================================================================
    // 💎 VIP (с OAuth и 2FA)
    // ========================================================================
    vip: {
        title: 'login.vipTitle',
        fields: [
            {
                name: 'email',
                type: 'email',
                placeholder: 'login.email',
                icon: 'person-fill',
                required: true,
                validation: {
                    type: 'email',
                    message: 'validation.rules.email.type'
                }
            },
            {
                name: 'password',
                type: 'password',
                placeholder: 'validation.rules.password.placeholder',
                icon: 'shield-lock',
                required: true,
                showPasswordToggle: true,
                validation: {
                    minLength: 10,
                    message: 'validation.rules.password.minLength'
                }
            },
            {
                name: 'twoFactorCode',
                type: 'text',
                placeholder: 'login.twoFactorCode',
                icon: 'key',
                required: true,
                maxLength: 6,
                validation: {
                    pattern: /^\d{6}$/,
                    message: 'validation.rules.twoFactor.pattern'
                }
            },
            {
                name: 'vipCode',
                type: 'text',
                placeholder: 'login.vipCode',
                icon: 'award',
                required: true,
                validation: {
                    pattern: /^VIP-[A-Z0-9]{8}$/,
                    message: 'validation.rules.vipCode.pattern'
                }
            }
        ],
        buttons: [
            {
                type: 'submit',
                label: 'login.logIn',
                style: 'primary'
            }
        ],
        links: [
            { label: 'login.forgotPassword', path: '/forgot-password' }
        ],
        features: {
            captcha: false,
            twoFactor: true,
            oauth: true,
            rememberMe: false
        }
    }
};

/**
 * Получить конфиг формы по типу
 */
export function getFormConfig(type) {
    // P0: Защита от undefined
    if (!type || typeof type !== 'string') {
        console.warn('[formConfigs] Неверный тип:', type);
        return formConfigs.user;
    }

    return formConfigs[type] || formConfigs.user;
}

/**
 * Получить все доступные типы
 */
export function getAvailableTypes() {
    return Object.keys(formConfigs);
}

/**
 * Получить все поля для типа
 */
export function getFieldsByType(type) {
    const config = getFormConfig(type);
    return config?.fields || [];
}

/**
 * Получить все кнопки для типа
 */
export function getButtonsByType(type) {
    const config = getFormConfig(type);
    return config?.buttons || [];
}

/**
 * Получить все ссылки для типа
 */
export function getLinksByType(type) {
    const config = getFormConfig(type);
    return config?.links || [];
}

/**
 * Получить features для типа
 */
export function getFeaturesByType(type) {
    const config = getFormConfig(type);
    return config?.features || {};
}

/**
 * Проверить существует ли тип
 */
export function isValidType(type) {
    return type && typeof type === 'string' && formConfigs.hasOwnProperty(type);
}

/**
 * Добавить новый тип формы (для динамического расширения)
 */
export function addFormType(type, config) {
    if (!type || !config) {
        console.error('[formConfigs] Невалидные параметры для addFormType');
        return false;
    }

    formConfigs[type] = config;
    return true;
}

/**
 * Удалить тип формы
 */
export function removeFormType(type) {
    if (type === 'user') {
        console.error('[formConfigs] Нельзя удалить базовый тип user');
        return false;
    }

    if (formConfigs.hasOwnProperty(type)) {
        delete formConfigs[type];
        return true;
    }

    return false;
}

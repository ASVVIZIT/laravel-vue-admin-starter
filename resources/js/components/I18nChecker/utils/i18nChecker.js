/**
 * Утилита для проверки ключей i18n
 */

export const keysToCheck = [
    // ========================================================================
    // 🔐 LOGIN
    // ========================================================================
    { key: 'login.title',              category: 'Login',      priority: 'critical' },
    { key: 'login.adminTitle',         category: 'Login',      priority: 'critical' },
    { key: 'login.testerTitle',        category: 'Login',      priority: 'critical' },
    { key: 'login.moderatorTitle',     category: 'Login',      priority: 'normal' },
    { key: 'login.vipTitle',           category: 'Login',      priority: 'normal' },
    { key: 'login.email',              category: 'Login',      priority: 'critical' },
    { key: 'login.password',           category: 'Login',      priority: 'critical' },
    { key: 'login.confirmPassword',    category: 'Login',      priority: 'critical' },
    { key: 'login.username',           category: 'Login',      priority: 'normal' },
    { key: 'login.twoFactorCode',      category: 'Login',      priority: 'normal' },
    { key: 'login.captcha',            category: 'Login',      priority: 'normal' },
    { key: 'login.vipCode',            category: 'Login',      priority: 'normal' },
    { key: 'login.selectRole',         category: 'Login',      priority: 'critical' },
    { key: 'login.logIn',              category: 'Login',      priority: 'critical' },
    { key: 'login.loginAsTester',      category: 'Login',      priority: 'critical' },
    { key: 'login.rememberMe',         category: 'Login',      priority: 'normal' },
    { key: 'login.forgotPassword',     category: 'Login',      priority: 'critical' },
    { key: 'login.register',           category: 'Login',      priority: 'critical' },
    { key: 'login.loginSuccess',       category: 'Login',      priority: 'critical' },
    { key: 'login.loginFailed',        category: 'Login',      priority: 'critical' },
    { key: 'login.thirdparty',         category: 'Login',      priority: 'low' },
    { key: 'login.thirdpartyTips',     category: 'Login',      priority: 'low' },

    // ========================================================================
    // 🔑 AUTH
    // ========================================================================
    { key: 'auth.forgotPasswordTitle',       category: 'Auth', priority: 'critical' },
    { key: 'auth.forgotPasswordSubtitle',    category: 'Auth', priority: 'critical' },
    { key: 'auth.sendResetLink',             category: 'Auth', priority: 'critical' },
    { key: 'auth.emailSent',                 category: 'Auth', priority: 'critical' },
    { key: 'auth.checkEmail',                category: 'Auth', priority: 'critical' },
    { key: 'auth.resetLinkSent',             category: 'Auth', priority: 'critical' },
    { key: 'auth.resetFailed',               category: 'Auth', priority: 'critical' },
    { key: 'auth.backToLogin',               category: 'Auth', priority: 'critical' },
    { key: 'auth.resetPasswordTitle',        category: 'Auth', priority: 'critical' },
    { key: 'auth.resetPasswordSubtitle',     category: 'Auth', priority: 'critical' },
    { key: 'auth.resetPassword',             category: 'Auth', priority: 'critical' },
    { key: 'auth.passwordResetSuccess',      category: 'Auth', priority: 'critical' },
    { key: 'auth.invalidResetLink',          category: 'Auth', priority: 'critical' },
    { key: 'auth.registerTitle',             category: 'Auth', priority: 'critical' },
    { key: 'auth.registerSubtitle',          category: 'Auth', priority: 'critical' },
    { key: 'auth.register',                  category: 'Auth', priority: 'critical' },
    { key: 'auth.registerSuccess',           category: 'Auth', priority: 'critical' },
    { key: 'auth.registerFailed',            category: 'Auth', priority: 'critical' },
    { key: 'auth.alreadyHaveAccount',        category: 'Auth', priority: 'critical' },
    { key: 'auth.agreeTerms',                category: 'Auth', priority: 'critical' },
    { key: 'auth.mustAgreeTerms',            category: 'Auth', priority: 'critical' },
    { key: 'auth.emailVerificationTitle',    category: 'Auth', priority: 'critical' },
    { key: 'auth.emailVerificationSubtitle', category: 'Auth', priority: 'critical' },
    { key: 'auth.emailVerified',             category: 'Auth', priority: 'critical' },
    { key: 'auth.checkYourEmail',            category: 'Auth', priority: 'critical' },
    { key: 'auth.goToLogin',                 category: 'Auth', priority: 'critical' },
    { key: 'auth.verificationResent',        category: 'Auth', priority: 'critical' },
    { key: 'auth.resendFailed',              category: 'Auth', priority: 'critical' },
    { key: 'auth.resendVerification',        category: 'Auth', priority: 'critical' },
    { key: 'auth.resendCooldown',            category: 'Auth', priority: 'critical' },
    { key: 'auth.sending',                   category: 'Auth', priority: 'critical' },
    { key: 'auth.verifying',                 category: 'Auth', priority: 'normal' },
    { key: 'auth.invalidVerificationLink',   category: 'Auth', priority: 'critical' },
    { key: 'auth.verificationFailed',        category: 'Auth', priority: 'critical' },

    // ========================================================================
    // ✅ VALIDATION
    // ========================================================================
    { key: 'validation.general.required',      category: 'Validation', priority: 'critical' },
    { key: 'validation.general.minLength',     category: 'Validation', priority: 'critical' },
    { key: 'validation.general.email',         category: 'Validation', priority: 'critical' },
    { key: 'validation.general.phone',         category: 'Validation', priority: 'normal' },
    { key: 'validation.general.match',         category: 'Validation', priority: 'normal' },
    { key: 'validation.general.matchPassword', category: 'Validation', priority: 'normal' },
    { key: 'validation.fields.name',           category: 'Validation', priority: 'critical' },
    { key: 'validation.fields.email',          category: 'Validation', priority: 'critical' },
    { key: 'validation.fields.password',       category: 'Validation', priority: 'critical' },
    { key: 'validation.fields.phone',          category: 'Validation', priority: 'normal' },
    { key: 'validation.rules.email.required',  category: 'Validation', priority: 'critical' },
    { key: 'validation.rules.email.type',      category: 'Validation', priority: 'critical' },
    { key: 'validation.rules.password.required',   category: 'Validation', priority: 'critical' },
    { key: 'validation.rules.password.minLength',  category: 'Validation', priority: 'critical' },
    { key: 'validation.rules.password.placeholder', category: 'Validation', priority: 'critical' },
    { key: 'validation.rules.confirmPassword.required',   category: 'Validation', priority: 'critical' },
    { key: 'validation.rules.confirmPassword.mismatched', category: 'Validation', priority: 'critical' },
    { key: 'validation.rules.name.required',   category: 'Validation', priority: 'critical' },
    { key: 'validation.rules.role.required',   category: 'Validation', priority: 'normal' },
    { key: 'validation.rules.sex.required',    category: 'Validation', priority: 'normal' },
    { key: 'validation.rules.twoFactor.required',  category: 'Validation', priority: 'normal' },
    { key: 'validation.rules.twoFactor.pattern',   category: 'Validation', priority: 'normal' },
    { key: 'validation.rules.twoFactor.placeholder', category: 'Validation', priority: 'normal' },
    { key: 'validation.rules.captcha.required', category: 'Validation', priority: 'normal' },
    { key: 'validation.rules.captcha.invalid',  category: 'Validation', priority: 'normal' },
    { key: 'validation.rules.vipCode.required', category: 'Validation', priority: 'low' },
    { key: 'validation.rules.vipCode.pattern',  category: 'Validation', priority: 'low' },

    // ========================================================================
    // 👥 ROLES
    // ========================================================================
    { key: 'roles.admin',                   category: 'Roles', priority: 'critical' },
    { key: 'roles.user',                    category: 'Roles', priority: 'critical' },
    { key: 'roles.moderator',               category: 'Roles', priority: 'critical' },
    { key: 'roles.name',                    category: 'Roles', priority: 'normal' },
    { key: 'roles.description.superadmin',  category: 'Roles', priority: 'normal' },
    { key: 'roles.description.admin',       category: 'Roles', priority: 'normal' },
    { key: 'roles.description.manager',     category: 'Roles', priority: 'normal' },
    { key: 'roles.description.editor',      category: 'Roles', priority: 'normal' },
    { key: 'roles.description.user',        category: 'Roles', priority: 'normal' },
    { key: 'roles.description.visitor',     category: 'Roles', priority: 'normal' },
    { key: 'roles.description.moderator',   category: 'Roles', priority: 'normal' },
    { key: 'roles.description.vip',         category: 'Roles', priority: 'low' },

    // ========================================================================
    // 🧭 NAVBAR
    // ========================================================================
    { key: 'navbar.home',      category: 'Navbar', priority: 'critical' },
    { key: 'navbar.profile',   category: 'Navbar', priority: 'critical' },
    { key: 'navbar.github',    category: 'Navbar', priority: 'normal' },
    { key: 'navbar.logout',    category: 'Navbar', priority: 'critical' },
    { key: 'navbar.dashboard', category: 'Navbar', priority: 'critical' },
    { key: 'navbar.logOut',    category: 'Navbar', priority: 'critical' },
    { key: 'navbar.theme',     category: 'Navbar', priority: 'normal' },
    { key: 'navbar.size',      category: 'Navbar', priority: 'normal' },

    // ========================================================================
    // 🔍 I18N CHECKER — ПОЛНЫЙ СПИСОК (78 ключей)
    // ========================================================================

    // Основные
    { key: 'i18nChecker.title',                category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.subtitle',             category: 'I18nChecker', priority: 'critical' },

    // Режимы
    { key: 'i18nChecker.simpleMode',           category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.simpleDesc',           category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.scannerMode',          category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.scannerDesc',          category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.validatorMode',        category: 'I18nChecker', priority: 'critical' },

    // Сканер
    { key: 'i18nChecker.startScan',            category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.scanning',             category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.scanComplete',         category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.scanFailed',           category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.scanError',            category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.scanHint',             category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.keysInCode',           category: 'I18nChecker', priority: 'normal' },

    // Validator
    { key: 'i18nChecker.validating',           category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.startValidation',      category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.validateHint',         category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.validationComplete',   category: 'I18nChecker', priority: 'critical' },

    // Статистика
    { key: 'i18nChecker.totalKeys',            category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.coverage',             category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.usedInCode',           category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.missingKeys',          category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.unusedKeys',           category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.duplicates',           category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.wrongPaths',           category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.flatKeys',             category: 'I18nChecker', priority: 'normal' },

    // Фильтры и поиск
    { key: 'i18nChecker.searchKey',            category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.allFiles',             category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.allCategories',        category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.all',                  category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.statusFound',          category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.statusMissing',        category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.search',               category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.refresh',              category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.exportMissing',        category: 'I18nChecker', priority: 'normal' },

    // Таблица
    { key: 'i18nChecker.colKey',               category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.colCategory',          category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.colPriority',          category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.colTranslation',       category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.colStatus',            category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.key',                  category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.priority',             category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.translation',          category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.files',                category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.paths',                category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.wrongPath',            category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.correctPath',          category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.usedIn',               category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.language',             category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.category',             category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.status',               category: 'I18nChecker', priority: 'normal' },

    // Приоритеты
    { key: 'i18nChecker.priorityCritical',     category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.priorityNormal',       category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.priorityLow',          category: 'I18nChecker', priority: 'normal' },

    // Статусы
    { key: 'i18nChecker.ok',                   category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.miss',                 category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.notTranslated',        category: 'I18nChecker', priority: 'normal' },

    // Секции
    { key: 'i18nChecker.missingIn',            category: 'I18nChecker', priority: 'critical' },
    { key: 'i18nChecker.unusedIn',             category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.duplicatesFound',      category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.wrongPathsFound',      category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.flatKeysFound',        category: 'I18nChecker', priority: 'normal' },

    // Копирование
    { key: 'i18nChecker.copy',                 category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.copyFilteredKeys',     category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.copyAllKeys',          category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.copyFilteredTemplate', category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.copyAllTemplate',      category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.copiedCount',          category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.copyFailed',           category: 'I18nChecker', priority: 'low' },

    // Простой режим (Simple)
    { key: 'i18nChecker.total',                category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.found',                category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.missing',              category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.foundKeys',            category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.byCategory',           category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.detailedResults',      category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.showing',              category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.from',                 category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.entries',              category: 'I18nChecker', priority: 'normal' },

    // Сообщения
    { key: 'i18nChecker.noMissing',            category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.exported',             category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.copied',               category: 'I18nChecker', priority: 'low' },
    { key: 'i18nChecker.noIssues',             category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.noPathIssues',         category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.clickToScan',          category: 'I18nChecker', priority: 'normal' },
    { key: 'i18nChecker.clickToValidate',      category: 'I18nChecker', priority: 'normal' },

    // ========================================================================
    // 🌐 I18N VIEW (страница i18n)
    // ========================================================================
    { key: 'i18nView.title',             category: 'I18nView', priority: 'critical' },
    { key: 'i18nView.note',              category: 'I18nView', priority: 'normal' },
    { key: 'i18nView.datePlaceholder',   category: 'I18nView', priority: 'normal' },
    { key: 'i18nView.selectPlaceholder', category: 'I18nView', priority: 'normal' },
    { key: 'i18nView.default',           category: 'I18nView', priority: 'critical' },
    { key: 'i18nView.primary',           category: 'I18nView', priority: 'critical' },
    { key: 'i18nView.success',           category: 'I18nView', priority: 'critical' },
    { key: 'i18nView.info',              category: 'I18nView', priority: 'critical' },
    { key: 'i18nView.warning',           category: 'I18nView', priority: 'critical' },
    { key: 'i18nView.danger',            category: 'I18nView', priority: 'critical' },
    { key: 'i18nView.tableName',         category: 'I18nView', priority: 'normal' },
    { key: 'i18nView.tableDate',         category: 'I18nView', priority: 'normal' },
    { key: 'i18nView.tableAddress',      category: 'I18nView', priority: 'normal' },
    { key: 'i18nView.one',               category: 'I18nView', priority: 'low' },
    { key: 'i18nView.two',               category: 'I18nView', priority: 'low' },
    { key: 'i18nView.three',             category: 'I18nView', priority: 'low' },
];

export function getCategories() {
    return [...new Set(keysToCheck.map(item => item.category))];
}

export function getPriorities() {
    return [...new Set(keysToCheck.map(item => item.priority))];
}

export function checkTranslations(i18n, lang) {
    const results = {
        found: [],
        missing: [],
        stats: {
            total: keysToCheck.length,
            found: 0,
            missing: 0,
            byCategory: {},
            byPriority: {}
        }
    };

    keysToCheck.forEach(item => {
        const translation = i18n.global.t(item.key, {}, { locale: lang });
        const isValid = translation !== item.key && translation && translation.trim() !== '';

        const result = {
            key: item.key,
            category: item.category,
            priority: item.priority,
            value: isValid ? translation : null
        };

        if (isValid) {
            results.found.push(result);
            results.stats.found++;
        } else {
            results.missing.push(result);
            results.stats.missing++;
        }

        if (!results.stats.byCategory[item.category]) {
            results.stats.byCategory[item.category] = { total: 0, found: 0, missing: 0 };
        }
        results.stats.byCategory[item.category].total++;
        if (isValid) {
            results.stats.byCategory[item.category].found++;
        } else {
            results.stats.byCategory[item.category].missing++;
        }

        if (!results.stats.byPriority[item.priority]) {
            results.stats.byPriority[item.priority] = { total: 0, found: 0, missing: 0 };
        }
        results.stats.byPriority[item.priority].total++;
        if (isValid) {
            results.stats.byPriority[item.priority].found++;
        } else {
            results.stats.byPriority[item.priority].missing++;
        }
    });

    return results;
}

export function exportMissingAsJS(missingKeys, lang) {
    const grouped = {};
    missingKeys.forEach(item => {
        const parts = item.key.split('.');
        const section = parts[0];
        if (!grouped[section]) grouped[section] = {};

        let current = grouped[section];
        for (let i = 1; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = 'TODO: translate';
    });

    return JSON.stringify(grouped, null, 2);
}

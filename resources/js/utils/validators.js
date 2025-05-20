import { useI18n } from 'vue-i18n'

export default (form) => {
    const { t } = useI18n()

    // Вспомогательные функции
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) =>
                acc && acc[part] !== undefined ? acc[part] : null,
            obj)
    }

    const baseValidator = (condition, errorKey, params = {}) => ({
        validator: (rule, value, callback) => {
            condition(value)
                ? callback()
                : callback(new Error(t(errorKey, params)))
        },
        trigger: ['blur', 'change']
    })

    return {
        /**
         * Проверка обязательного поля
         * @param {string} [msgKey='validation.required'] - Ключ перевода
         */
        required(msgKey = 'validation.general.required') {
            return baseValidator(
                value => !!value?.toString().trim(),
                msgKey
            )
        },

        /**
         * Минимальная длина строки
         * @param {number} min - Минимальная длина
         * @param {string} [msgKey='validation.minLength'] - Ключ перевода
         */
        minLength(min, msgKey = 'validation.general.minLength') {
            return baseValidator(
                value => value?.length >= min,
                msgKey,
                { min }
            )
        },

        /**
         * Проверка email
         * @param {string} [msgKey='validation.email'] - Ключ перевода
         */
        email(msgKey = 'validation.general.email') {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return baseValidator(
                value => regex.test(value),
                msgKey
            )
        },

        /**
         * Проверка телефонного номера
         * @param {string} [msgKey='validation.phone'] - Ключ перевода
         * @param {Object} [options] - Дополнительные параметры
         * @param {boolean} [options.requireCountryCode=false] - Требовать код страны
         */
        phone(msgKey = 'validation.general.phone', options = {}) {
            const { requireCountryCode = false } = options
            const regex = requireCountryCode
                ? /^\+[1-9]\d{1,14}$/ // E.164 с обязательным кодом
                : /^\+?[1-9]\d{1,14}$/ // E.164 без обязательного кода

            return baseValidator(
                value => regex.test(value),
                msgKey,
                { requireCountryCode }
            )
        },

        /**
         * Проверка совпадения полей
         * @param {string} fieldPath - Путь к сравниваемому полю
         * @param {string} [msgKey='validation.match'] - Ключ перевода
         */
        match(fieldPath, msgKey = 'validation.general.match') {
            return {
                validator: (rule, value, callback) => {
                    const targetValue = getNestedValue(form, fieldPath)
                    const fieldName = fieldPath.split('.').pop()

                    value === targetValue
                        ? callback()
                        : callback(new Error(t(msgKey, {
                            field: t(`validation.fields.${fieldName}`, fieldPath)
                        })))
                },
                trigger: ['blur', 'change']
            }
        },

        /**
         * Проверка неравенства полей
         * @param {string} fieldPath - Путь к сравниваемому полю
         * @param {string} [msgKey='validation.notMatch'] - Ключ перевода
         */
        notMatch(fieldPath, msgKey = 'validation.general.notMatch') {
            return {
                validator: (rule, value, callback) => {
                    const targetValue = getNestedValue(form, fieldPath)
                    const fieldName = fieldPath.split('.').pop()

                    value !== targetValue
                        ? callback()
                        : callback(new Error(t(msgKey, {
                            field: t(`validation.fields.${fieldName}`, fieldPath)
                        })))
                },
                trigger: ['blur', 'change']
            }
        },

        /**
         * Проверка наличия специальных символов
         * @param {number} [min=1] - Минимальное количество
         * @param {string} [msgKey='validation.specialChars'] - Ключ перевода
         */
        specialChars(min = 1, msgKey = 'validation.general.specialChars') {
            const regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/g
            return baseValidator(
                value => (value.match(regex) || []).length >= min,
                msgKey,
                { min }
            )
        },

        /**
         * Кастомная регулярная проверка
         * @param {RegExp} regex - Регулярное выражение
         * @param {string} msgKey - Ключ перевода ошибки
         */
        customRegex(regex, msgKey) {
            return baseValidator(
                value => regex.test(value),
                msgKey
            )
        }
    }
}

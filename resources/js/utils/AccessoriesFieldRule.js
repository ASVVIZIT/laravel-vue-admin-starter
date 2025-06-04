// AccessoriesFieldRule.js
import { useI18n } from 'vue-i18n'

export const useAccessoryRules = (form) => {
    const { t } = useI18n()

    // Вспомогательная функция для получения вложенных значений
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) =>
                acc && acc[part] !== undefined ? acc[part] : null,
            obj
        )
    }

    // Базовый валидатор с локализацией
    const baseValidator = (condition, errorKey, params = {}) => ({
        validator: (rule, value, callback) => {
            // Выполняем условие и вызываем callback
            condition(value)
                ? callback()
                : callback(new Error(t(errorKey, params)))
        },
        trigger: ['blur', 'change'] // Триггер для валидации
    })

    return {
        // Проверка обязательного поля
        required(field, msgKey = 'validation.required') {
            return baseValidator(
                value => value !== null && value !== undefined && value !== '',
                msgKey,
                { field: t(`fields.${field}`) } // Передаем локализованный текст
            )
        },

        // Проверка минимальной длины
        minLength(min, field, msgKey = 'validation.minLength') {
            return baseValidator(
                value => value?.toString().length >= min,
                msgKey,
                { min, field: t(`fields.${field}`) }
            )
        },

        // Проверка положительного числа
        positiveNumber(field, msgKey = 'validation.positiveNumber') {
            return baseValidator(
                value => typeof value === 'number' && value > 0,
                msgKey,
                { field: t(`fields.${field}`) }
            )
        },

        // Проверка целого числа
        integer(field, msgKey = 'validation.integer') {
            return baseValidator(
                value => Number.isInteger(value),
                msgKey,
                { field: t(`fields.${field}`) }
            )
        },

        // Проверка уникальности модели
        uniqueModel() {
            return {
                async validator(rule, value, callback) {
                    try {
                        // Проверка уникальности через API
                        const exists = await accessoryStore.checkModelExists(value)
                        exists ? callback(new Error(t('validation.model_exists'))) : callback()
                    } catch (e) { callback() }
                },
                trigger: 'blur'
            }
        },

        // Проверка категории единицы измерения
        validUnitCategory(category) {
            return (rule, value, callback) => {
                const unit = measurementUnitStore.units.find(u => u.id === value)
                if (unit?.category === category) callback()
                else callback(new Error(t('validation.invalid_unit', { category })))
            }
        },

        // Проверка формата совместимых моделей
        compatibleModelsFormat() {
            return baseValidator(
                value => value.split(',').every(m => m.trim().length > 2),
                'validation.compatible_models_invalid'
            )
        },

        // Проверка формата IP рейтинга
        ipRatingFormat() {
            return baseValidator(
                value => /^IP\d{2}$/.test(value),
                'validation.ip_format'
            )
        },

        // Проверка температурного диапазона
        temperatureRange() {
            return (rule, value, callback) => {
                const min = form.temperature_range_min
                const max = form.temperature_range_max
                if (min < -50 || max > 70) callback(new Error(t('validation.temperature_range_invalid')))
                else if (min > max) callback(new Error(t('validation.temperature_inverted')))
                else callback()
            }
        }
    }
}

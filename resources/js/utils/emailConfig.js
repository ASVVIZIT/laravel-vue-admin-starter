/**
 * Конфигурация системных email
 * Для таких адресов не показывается статус верификации и кнопка перепроверки
 */

// Список доменов, которые считаются системными/тестовыми
export const SYSTEM_EMAIL_DOMAINS = [
    //'fenix.dev', // временно закомментировано для разработки
    'example.com',
    'test.com',
    'localhost'
]

// Конкретные email, которые всегда считаются системными
export const SYSTEM_EMAILS = [
    'admin@fenix.dev',
    'superadmin@fenix.dev'
]

/**
 * Проверяет, является ли email системным
 * @param {string} email - Email для проверки
 * @returns {boolean}
 */
export function isSystemEmail(email) {
    if (!email) return false

    // Проверяем точное совпадение
    if (SYSTEM_EMAILS.includes(email.toLowerCase())) {
        return true
    }

    // Проверяем домен
    const domain = email.split('@')[1]?.toLowerCase()
    return SYSTEM_EMAIL_DOMAINS.includes(domain)
}

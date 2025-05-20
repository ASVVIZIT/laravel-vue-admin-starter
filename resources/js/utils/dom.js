/**
 * Проверяет существование элемента в DOM
 * @param {string} selector - CSS селектор
 * @returns {boolean}
 */
export const checkElementExistence = (selector) => {
    try {
        return !!document.querySelector(selector)
    } catch (e) {
        console.error(`Ошибка проверки элемента: ${selector}`, e)
        return false
    }
}

/**
 * Фильтрует шаги, оставляя только с существующими элементами
 * @param {Array} steps - Массив шагов руководства
 * @returns {Array}
 */
export const filterStepsByExistingElements = (steps) => {
    return steps.filter(step => {
        const exists = checkElementExistence(step.element)
        if (!exists && process.env.NODE_ENV === 'development') {
            console.warn(`[Guide] Элемент не найден: ${step.element}`)
        }
        return exists
    })
}

/**
 * Ожидает появления элемента в DOM
 * @param {string} selector - CSS селектор
 * @param {number} timeout - Максимальное время ожидания (мс)
 * @returns {Promise<boolean>}
 */
export const waitForElement = (selector, timeout = 2000) => {
    return new Promise((resolve) => {
        const start = Date.now()
        const check = () => {
            if (document.querySelector(selector)) {
                resolve(true)
            } else if (Date.now() - start < timeout) {
                setTimeout(check, 100)
            } else {
                resolve(false)
            }
        }
        check()
    })
}

/**
 * Проверяет видимость элемента
 * @param {string} selector - CSS селектор
 * @returns {boolean}
 */
export const checkElementVisibility = (selector) => {
    const el = document.querySelector(selector)
    if (!el) return false
    const style = window.getComputedStyle(el)
    return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        el.offsetParent !== null
}

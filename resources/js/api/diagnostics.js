import request from '@/utils/request'

export default {
    // ========================================================================
    // КОНФИГУРАЦИЯ И ЧЕК-ЛИСТЫ (B1)
    // ========================================================================
    getConfig() {
        return request({ url: '/diagnostics/config', method: 'get' })
    },
    getChecks(entity) {
        return request({ url: `/diagnostics/${entity}/checks`, method: 'get' })
    },

    // ========================================================================
    // ИНСПЕКТ И СИМУЛЯЦИЯ (B1 заглушки)
    // ========================================================================
    inspect(entity, value) {
        return request({ url: `/diagnostics/${entity}/inspect`, method: 'get', params: { value } })
    },
    runCrud(entity) {
        return request({ url: `/diagnostics/${entity}/crud`, method: 'post' })
    },
    runSimulate(entity, step, payload = {}) {
        return request({ url: `/diagnostics/${entity}/simulate`, method: 'post', data: { step, payload } })
    },

    // ========================================================================
    // ИНСПЕКТОР EMAIL (B3)
    // ========================================================================
    inspectEmail(email) {
        return request({ url: '/diagnostics/email/inspect', method: 'post', data: { email } })
    },

    // ========================================================================
    // СИСТЕМНЫЕ ПОЛЬЗОВАТЕЛИ: СПИСОК + СБРОС (B3)
    // ========================================================================
    getSystemUsers() {
        return request({ url: '/diagnostics/system-users', method: 'get' })
    },
    resetSystemUsers() {
        return request({ url: '/diagnostics/system-users/reset', method: 'post' })
    },

    // ========================================================================
    // P2: CRUD СИСТЕМНЫХ ПОЛЬЗОВАТЕЛЕЙ
    // ========================================================================
    storeSystemUser(data) {
        return request({ url: '/diagnostics/system-users', method: 'post', data })
    },
    updateSystemUser(id, data) {
        return request({ url: `/diagnostics/system-users/${id}`, method: 'put', data })
    },
    deleteSystemUser(id) {
        return request({ url: `/diagnostics/system-users/${id}`, method: 'delete' })
    },
    restoreSystemUser(id) {
        return request({ url: `/diagnostics/system-users/${id}/restore`, method: 'post' })
    }
}

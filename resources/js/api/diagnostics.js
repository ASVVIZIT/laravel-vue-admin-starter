import request from '@/utils/request'

export default {
    getConfig() {
        return request({ url: '/diagnostics/config', method: 'get' })
    },
    getChecks(entity) {
        return request({ url: `/diagnostics/${entity}/checks`, method: 'get' })
    },
    inspect(entity, value) {
        return request({ url: `/diagnostics/${entity}/inspect`, method: 'get', params: { value } })
    },
    runCrud(entity) {
        return request({ url: `/diagnostics/${entity}/crud`, method: 'post' })
    },
    runSimulate(entity, step, payload = {}) {
        return request({ url: `/diagnostics/${entity}/simulate`, method: 'post', data: { step, payload } })
    },
    inspectEmail(email) {
        return request({ url: '/diagnostics/email/inspect', method: 'post', data: { email } })
    },
    getSystemUsers() {
        return request({ url: '/diagnostics/system-users', method: 'get' })
    },
    resetSystemUsers() {
        return request({ url: '/diagnostics/system-users/reset', method: 'post' })
    }
}

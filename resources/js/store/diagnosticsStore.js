import { defineStore } from 'pinia'
import diagnosticsApi from '@/api/diagnostics'

export const useDiagnosticsStore = defineStore('diagnostics', {
    state: () => ({
        registry: [],
        activeEntity: 'users',
        checks: [],
        summary: { ok: 0, warn: 0, fail: 0 },
        loading: false
    }),

    actions: {
        async fetchConfig() {
            try {
                const res = await diagnosticsApi.getConfig()
                this.registry = res.data?.entities || []
                return res.data
            } catch (error) {
                console.error('Failed to fetch diagnostics config:', error)
            }
        },

        async fetchChecks(entity) {
            this.loading = true
            this.activeEntity = entity
            try {
                const res = await diagnosticsApi.getChecks(entity)
                this.checks = res.data?.checks || []
                this.summary = res.data?.summary || { ok: 0, warn: 0, fail: 0 }
            } catch (error) {
                console.error(`Failed to fetch checks for ${entity}:`, error)
            } finally {
                this.loading = false
            }
        }
    }
})

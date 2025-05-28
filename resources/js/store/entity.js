import { defineStore } from 'pinia'

export const appEntityStore = defineStore('entity', {
    state: () => ({
        entities: {},
        loading: false,
        error: null,
    }),
    actions: {
        async loadEntities(entityName, fetchFn) {
            this.loading = true
            try {
                const data = await fetchFn()

                console.log('data',data)
                this.entities[entityName] = data
                this.error = null
            } catch (err) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        },
        clearEntity(entityName) {
            this.entities[entityName] = []
        },
    },
})

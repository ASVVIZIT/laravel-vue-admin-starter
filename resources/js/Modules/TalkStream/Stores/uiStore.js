import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
    state: () => ({
        isContactsPanelCollapsed: false,
    }),
    actions: {
        toggleContactsPanel() {
            this.isContactsPanelCollapsed = !this.isContactsPanelCollapsed
            localStorage.setItem('contactsPanelCollapsed', this.isContactsPanelCollapsed)
        },
        setContactsPanelState(state) {
            this.isContactsPanelCollapsed = state
        }
    }
})

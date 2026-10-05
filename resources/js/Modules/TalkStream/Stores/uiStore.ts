import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
    state: () => ({
        isContactsPanelCollapsed: false,
    }),

    actions: {
        toggleContactsPanel() {
            this.isContactsPanelCollapsed = !this.isContactsPanelCollapsed
            try {
                localStorage.setItem('contactsPanelCollapsed', String(this.isContactsPanelCollapsed))
            } catch (e) {
                // ignore storage errors
            }
        },

        setContactsPanelState(state: boolean) {
            this.isContactsPanelCollapsed = state
        },

        reset() {
            this.isContactsPanelCollapsed = false
        }
    },

    getters: {
        panelState: (state): boolean => state.isContactsPanelCollapsed
    }
})

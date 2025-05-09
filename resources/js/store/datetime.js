import { defineStore } from 'pinia';

export const useDateTimeStore = defineStore('datetime', {
    state: () => ({
        selectedTimezone: 'UTC',
        dateFormat: 'HH:mm',
        dateLuxonFormat: 'HH:mm',
        showSeconds: false,
        showLuxonSeconds: false
    }),
    actions: {
        setTimezone(timezone) {
            this.selectedTimezone = timezone;
        },
        setShowSeconds(value) {
            this.showSeconds = value;
        },
        setDateFormat(format) {
            this.dateFormat = format;
        },

        setLuxonFormat(format) {
            this.dateLuxonFormat = format;
        },
        setLuxonSeconds(value) {
            this.showLuxonSeconds = value;
        }
    }
});

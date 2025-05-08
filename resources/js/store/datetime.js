import { defineStore } from 'pinia';

export const useDateTimeStore = defineStore('datetime', {
    state: () => ({
        selectedTimezone: 'UTC',
        dateFormat: 'HH:mm',
        showSeconds: false
    }),
    actions: {
        setTimezone(timezone) {
            this.selectedTimezone = timezone;
        },
        setDateFormat(format) {
            this.dateFormat = format;
        },
        setShowSeconds(value) {
            this.showSeconds = value;
        }
    }
});

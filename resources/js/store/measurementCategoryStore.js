import { defineStore } from 'pinia';
import MeasurementCategoryResource from '@/api/measurementCategoryResource';

export const useMeasurementCategoryStore = defineStore('measurementCategory', {
    state: () => ({
        categories: [],
        loading: false,
    }),
    actions: {
        async fetchAll() {
            this.loading = true;
            try {
                const res = await new MeasurementCategoryResource().list();
                console.log('res ', res)
                this.categories = res.data;
            } catch (error) {
                console.error('MeasurementCategory fetch error:', error);
            } finally {
                this.loading = false;
            }
        },
    },
});

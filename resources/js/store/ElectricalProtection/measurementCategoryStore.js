// resources/js/store/ElectricalProtection/measurementCategoryStore.js
import { defineStore } from 'pinia';
import MeasurementCategoryResource from '@api/ElectricalProtection/measurementCategoryResource.js';

export const useMeasurementCategoryStore = defineStore('measurementCategory', {
    state: () => ({
        categories: [],         // Для таблицы (с пагинацией)
        dropdownCategories: [], // Для выпадающих списков (все записи)
        loading: false,
    }),
    actions: {
        async fetchPaginated() {
            this.loading = true;
            try {
                const res = await new MeasurementCategoryResource().listPaginated();
                console.log('res ', res)
                this.categories = res.data;
            } catch (error) {
                console.error('MeasurementCategory fetch Paginated error:', error);
            } finally {
                this.loading = false;
            }
        },

        // Для выпадающих списков (все записи)
        async fetchAllForDropdown() {
            if (this.dropdownCategories.length > 0) return; // Уже загружены

            this.loading = true;
            try {
                const res = await new MeasurementCategoryResource().listForDropdown();
                this.dropdownCategories = res.data;
            } catch (error) {
                console.error('MeasurementCategory fetch dropdown error:', error);
            } finally {
                this.loading = false;
            }
        },
    },
});

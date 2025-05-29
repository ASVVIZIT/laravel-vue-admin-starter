import { defineStore } from 'pinia';
import MeasurementUnitResource from '@/api/measurementUnitResource';

export const useMeasurementUnitStore = defineStore('measurementUnit', {
    state: () => ({
        measurementUnits: [],
        loading: false,
        pagination: {
            total: 0,
            per_page: 10,
            current_page: 1,
            last_page: 1
        }
    }),
    actions: {
        async fetchAll(params = {}) {
            this.loading = true;
            try {
                const res = await new MeasurementUnitResource().list({
                    page: params.page || this.pagination.current_page,
                    per_page: params.per_page || this.pagination.per_page,
                    search: params.search || ''
                });

                this.measurementUnits = res.data;
                this.pagination = {
                    total: res.meta.total,
                    per_page: res.meta.per_page,
                    current_page: res.meta.current_page,
                    last_page: res.meta.last_page
                };
            } catch (error) {
                console.error('MeasurementUnit fetch error:', error);
            } finally {
                this.loading = false;
            }
        },

        async delete(id) {
            try {
                await new MeasurementUnitResource().destroy(id);
                await this.fetchAll({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page
                });
            } catch (error) {
                console.error('MeasurementUnit delete error:', error);
                throw error;
            }
        },

        async create(data) {
            try {
                await new MeasurementUnitResource().store(data);
                await this.fetchAll({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page
                });
            } catch (error) {
                console.error('MeasurementUnit create error:', error);
                throw error;
            }
        },

        async update(id, data) {
            try {
                await new MeasurementUnitResource().update(id, data);
                await this.fetchAll({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page
                });
            } catch (error) {
                console.error('MeasurementUnit update error:', error);
                throw error;
            }
        }
    }
});

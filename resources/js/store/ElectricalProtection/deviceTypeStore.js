import MeasurementUnitResource from "@api/measurementUnitResource.js";
import { defineStore } from 'pinia';
import DeviceTypeResource from '@/api/deviceTypeResource';

export const useDeviceTypeStore = defineStore('deviceType', {
    state: () => ({
        deviceTypes: [],
        dropdownDeviceTypes: [],
        loading: false,
        pagination: {
            total: 0,
            per_page: 10,
            current_page: 1,
            last_page: 1
        }
    }),
    actions: {
        async fetchPaginated(params = {}) {
            this.loading = true;
            try {
                const res = await new DeviceTypeResource().listPaginated({
                    page: params.page || this.pagination.current_page,
                    per_page: params.per_page || this.pagination.per_page,
                    search: params.search || ''
                });

                this.deviceTypes = res.data;
                this.pagination = {
                    total: res.meta.total,
                    per_page: res.meta.per_page,
                    current_page: res.meta.current_page,
                    last_page: res.meta.last_page
                };
            } catch (error) {
                console.error('DeviceType fetch Paginated error:', error);
            } finally {
                this.loading = false;
            }
        },

        // Для выпадающих списков (все записи)
        async fetchAllForDropdown() {
            if (this.dropdownDeviceTypes.length > 0) return; // Уже загружены

            this.loading = true;
            try {
                const res = await new DeviceTypeResource().listForDropdown();
                this.dropdownDeviceTypes = res.data;
            } catch (error) {
                console.error('DeviceType fetch dropdown error:', error);
            } finally {
                this.loading = false;
            }
        },

        async delete(id) {
            try {
                await new DeviceTypeResource().destroy(id);
                await this.fetchPaginated({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page,
                    search: params.search || ''
                });
            } catch (error) {
                console.error('DeviceType delete error:', error);
                throw error;
            }
        },

        async create(data) {
            try {
                await new DeviceTypeResource().store(data);
                await this.fetchPaginated({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page,
                    search: params.search || ''
                });
            } catch (error) {
                console.error('DeviceType create error:', error);
                throw error;
            }
        },

        async update(id, data) {
            try {
                await new DeviceTypeResource().update(id, data);
                await this.fetchPaginated({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page,
                    search: params.search || ''
                });
            } catch (error) {
                console.error('DeviceType update error:', error);
                throw error;
            }
        }
    }
});

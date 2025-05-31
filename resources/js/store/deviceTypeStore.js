import { defineStore } from 'pinia';
import DeviceTypeResource from '@/api/deviceTypeResource';

export const useDeviceTypeStore = defineStore('deviceType', {
    state: () => ({
        deviceTypes: [],
        loading: false,
        pagination: {
            total: 0,
            per_page: '',
            current_page: 1,
            last_page: 1
        }
    }),
    actions: {
        async fetchAll(params = {}) {
            this.loading = true;
            try {
                const res = await new DeviceTypeResource().list({
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
                console.error('DeviceType fetch error:', error);
            } finally {
                this.loading = false;
            }
        },

        async delete(id) {
            try {
                await new DeviceTypeResource().destroy(id);
                await this.fetchAll({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page
                });
            } catch (error) {
                console.error('DeviceType delete error:', error);
                throw error;
            }
        },

        async create(data) {
            try {
                await new DeviceTypeResource().store(data);
                await this.fetchAll({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page
                });
            } catch (error) {
                console.error('DeviceType create error:', error);
                throw error;
            }
        },

        async update(id, data) {
            try {
                await new DeviceTypeResource().update(id, data);
                await this.fetchAll({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page
                });
            } catch (error) {
                console.error('DeviceType update error:', error);
                throw error;
            }
        }
    }
});

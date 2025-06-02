import BrandResource from "@api/brandResource.js";
import { defineStore } from 'pinia';
import AccessoryResource from '@/api/accessoryResource';

export const useAccessoryStore = defineStore('accessory', {
    state: () => ({
        accessories: [],
        dropdownAccessories: [],
        currentAccessory: null,
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
                const res = await new AccessoryResource().listPaginated({
                    page: params.page || this.pagination.current_page,
                    per_page: params.per_page || this.pagination.per_page,
                    search: params.search || ''
                });

                this.accessories = res.data;
                this.pagination = {
                    total: res.meta.total,
                    per_page: res.meta.per_page,
                    current_page: res.meta.current_page,
                    last_page: res.meta.last_page
                };
            } catch (error) {
                console.error('Accessory fetch Paginated error:', error);
            } finally {
                this.loading = false;
            }
        },

        // Для выпадающих списков (все записи)
        async fetchAllForDropdown() {
            if (this.dropdownAccessories.length > 0) return; // Уже загружены

            this.loading = true;
            try {
                const res = await new AccessoryResource().listForDropdown();
                this.dropdownAccessories = res.data;
            } catch (error) {
                console.error('Accessory fetch dropdown error:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchById(id) {
            this.loading = true;
            try {
                const res = await new AccessoryResource().get(id);
                this.currentAccessory = res;
                return res;
            } catch (error) {
                console.error('Accessory fetch by ID error:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async delete(id) {
            try {
                await new AccessoryResource().destroy(id);
                await this.fetchPaginated({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page
                });
            } catch (error) {
                console.error('Accessory delete error:', error);
                throw error;
            }
        },

        async create(data) {
            try {
                const res = await new AccessoryResource().store(data);
                return res;
            } catch (error) {
                console.error('Accessory create error:', error);
                throw error;
            }
        },

        async update(id, data) {
            try {
                const res = await new AccessoryResource().update(id, data);
                return res;
            } catch (error) {
                console.error('Accessory update error:', error);
                throw error;
            }
        }
    }
});

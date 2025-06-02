// resources/js/store/ElectricalProtection/brandStore.js
import { defineStore } from 'pinia';
import BrandResource from '@api/ElectricalProtection/brandResource.js';

export const useBrandStore = defineStore('brand', {
    state: () => ({
        brands: [],         // Для таблицы (с пагинацией)
        dropdownBrands: [], // Для выпадающих списков (все записи)
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
                const res = await new BrandResource().listPaginated({
                    page: params.page || this.pagination.current_page,
                    per_page: params.per_page || this.pagination.per_page,
                    search: params.search || ''
                });

                this.brands = res.data;
                this.pagination = {
                    total: res.meta.total,
                    per_page: res.meta.per_page,
                    current_page: res.meta.current_page,
                    last_page: res.meta.last_page
                };
            } catch (error) {
                console.error('Brand fetch Paginated error:', error);
            } finally {
                this.loading = false;
            }
        },

        // Для выпадающих списков (все записи)
        async fetchAllForDropdown() {
            if (this.dropdownBrands.length > 0) return; // Уже загружены

            this.loading = true;
            try {
                const res = await new BrandResource().listForDropdown();
                this.dropdownBrands = res.data;
            } catch (error) {
                console.error('Brand fetch dropdown error:', error);
            } finally {
                this.loading = false;
            }
        },

        async delete(id) {
            try {
                await new BrandResource().destroy(id);
                // Перезагружаем данные с сохранением параметров
                await this.fetchPaginated({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page,
                });
            } catch (error) {
                console.error('Brand delete error:', error);
                throw error;
            }
        },

        async create(data) {
            try {
                await new BrandResource().store(data);
                // Перезагружаем данные с сохранением параметров
                await this.fetchPaginated({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page,
                });
            } catch (error) {
                console.error('Brand create error:', error);
                throw error;
            }
        },

        async update(id, data) {
            try {
                await new BrandResource().update(id, data);
                // Перезагружаем данные с сохранением параметров
                await this.fetchPaginated({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page,
                });
            } catch (error) {
                console.error('Brand update error:', error);
                throw error;
            }
        }
    }
});

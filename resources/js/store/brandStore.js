import { defineStore } from 'pinia';
import BrandResource from '@/api/brandResource';

export const useBrandStore = defineStore('brand', {
    state: () => ({
        brands: [],
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
                const res = await new BrandResource().list({
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
                console.error('Brand fetch error:', error);
            } finally {
                this.loading = false;
            }
        },

        async delete(id) {
            try {
                await new BrandResource().destroy(id);
                // Перезагружаем данные с сохранением параметров
                await this.fetchAll({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page,
                    search: this.searchQuery
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
                await this.fetchAll({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page,
                    search: this.searchQuery
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
                await this.fetchAll({
                    page: this.pagination.current_page,
                    per_page: this.pagination.per_page,
                    search: this.searchQuery
                });
            } catch (error) {
                console.error('Brand update error:', error);
                throw error;
            }
        }
    }
});

import { defineStore } from 'pinia';
import { SocialMediaLinkResource } from '@/components/SocialMediaLinks/api/core/SocialMediaLinkResource';

export const useSocialMediaLinksStore = defineStore('socialMediaLinks', {
    state: () => ({
        links: [],
        loading: false,
        error: null
    }),

    getters: {
        // Сортированные ссылки по порядку
        sortedLinks: (state) => {
            return [...state.links].sort((a, b) => a.order - b.order);
        },

        // Количество ссылок
        linkCount: (state) => state.links.length
    },

    actions: {
        // Загрузка всех ссылок
        async fetchLinks() {
            this.loading = true;
            try {
                const resource = new SocialMediaLinkResource();
                const response = await resource.getLinks();
                this.links = response;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Создание новой ссылки
        async createLink(data) {
            try {
                const resource = new SocialMediaLinkResource();
                const newLink = await resource.createLink(data);

                // Добавляем в локальное состояние
                this.links.push(newLink);

                return newLink;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        // Обновление существующей ссылки
        async updateLink(id, data) {
            try {
                const resource = new SocialMediaLinkResource();
                const updatedLink = await resource.updateLink(id, data);

                // Обновляем в локальном состоянии
                const index = this.links.findIndex(link => link.id === id);
                if (index !== -1) {
                    this.links.splice(index, 1, updatedLink);
                }

                return updatedLink;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        // Удаление ссылки
        async deleteLink(id) {
            try {
                const resource = new SocialMediaLinkResource();
                await resource.deleteLink(id);

                // Удаляем из локального состояния
                this.links = this.links.filter(link => link.id !== id);
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        // Изменение порядка ссылок
        async reorderLinks(newOrder) {
            try {
                const resource = new SocialMediaLinkResource();
                await resource.reorderLinks(newOrder);

                // Обновляем порядок в локальном состоянии
                this.links = this.links.map(link => {
                    const newIndex = newOrder.indexOf(link.id);
                    if (newIndex !== -1) {
                        return { ...link, order: newIndex };
                    }
                    return link;
                }).sort((a, b) => a.order - b.order);

                return true;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        // Обновление порядка в локальном состоянии без отправки на сервер
        updateLocalOrder(newOrder) {
            this.links = this.links.map(link => {
                const newIndex = newOrder.indexOf(link.id);
                if (newIndex !== -1) {
                    return { ...link, order: newIndex };
                }
                return link;
            }).sort((a, b) => a.order - b.order);
        }
    }
});

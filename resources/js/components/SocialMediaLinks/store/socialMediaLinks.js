import { defineStore } from 'pinia';
import { SocialMediaLinkResource } from '@/components/SocialMediaLinks/api/core/SocialMediaLinkResource';

// Определяем store для управления ссылками
export const useSocialMediaLinksStore = defineStore('socialMediaLinks', {
    // Состояние (state)
    state: () => ({
        links: [], // Массив всех ссылок
        loading: false, // Флаг загрузки
        error: null // Ошибка, если произошла
    }),

    // Вычисляемые свойства (getters)
    getters: {
        // Получить отсортированные по order_column ссылки
        sortedLinks: (state) => {
            // Создаем копию массива, чтобы не мутировать исходный
            return [...state.links].sort((a, b) => a.order_column - b.order_column);
        },

        // Получить количество ссылок
        linkCount: (state) => state.links.length
    },

    // Действия (actions)
    actions: {
        // Асинхронно загрузить все ссылки с сервера
        async fetchLinks() {
            this.loading = true;
            this.error = null; // Сбрасываем ошибку при новом запросе
            try {
                const resource = new SocialMediaLinkResource();
                const response = await resource.getLinks();
                // Обновляем локальное состояние
                this.links = response;
            } catch (error) {
                this.error = error.message;
                // Пробрасываем ошибку, чтобы вызывающий код мог обработать
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Асинхронно создать новую ссылку
        async createLink(data) {
            try {
                const resource = new SocialMediaLinkResource();
                const newLink = await resource.createLink(data);
                // Добавляем новую ссылку в локальное состояние
                this.links.push(newLink);
                return newLink;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        // Асинхронно обновить существующую ссылку
        async updateLink(id, data) {
            try {
                const resource = new SocialMediaLinkResource();
                const updatedLink = await resource.updateLink(id, data);
                // Находим индекс обновленной ссылки в локальном состоянии
                const index = this.links.findIndex(link => link.id === id);
                if (index !== -1) {
                    // Заменяем ссылку в локальном состоянии
                    this.links.splice(index, 1, updatedLink);
                }
                return updatedLink;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        // Асинхронно удалить ссылку
        async deleteLink(id) {
            try {
                const resource = new SocialMediaLinkResource();
                // Выполняем удаление на сервере
                await resource.deleteLink(id);
                // Удаляем ссылку из локального состояния
                this.links = this.links.filter(link => link.id !== id);
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        // Асинхронно переупорядочить ссылки
        async reorderLinks(newOrder) {
            try {
                const resource = new SocialMediaLinkResource();
                // Отправляем новый порядок на сервер
                await resource.reorderLinks(newOrder);

                // Обновляем локальное состояние в соответствии с новым порядком
                this.links = this.links.map(link => {
                    const newIndex = newOrder.indexOf(link.id);
                    if (newIndex !== -1) {
                        // Возвращаем копию ссылки с обновленным order_column
                        return { ...link, order_column: newIndex };
                    }
                    // Если ID нет в новом порядке, возвращаем как есть (хотя это маловероятно)
                    return link;
                }).sort((a, b) => a.order_column - b.order_column);

                return true;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        }
    }
});

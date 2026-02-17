import { BaseResource } from '@components/ContactManagement/SocialMediaLinks/api/core/BaseResource.js';

export class SocialMediaLinkResource extends BaseResource {
    // Устанавливаем базовый путь для этого ресурса
    constructor() {
        super('social-media-links'); // Это будет добавлено к VITE_API_BASE_URL
    }

    // Получить все ссылки
    async getLinks() {
        return this.get();
    }

    // Создать новую ссылку
    async createLink(data) {
        return this.post('', data);
    }

    // Обновить существующую ссылку
    async updateLink(id, data) {
        return this.put(`/${id}`, data);
    }

    // Удалить ссылку
    async deleteLink(id) {
        return this.delete(`/${id}`);
    }

    // Переупорядочить ссылки
    async reorderLinks(order) {
        return this.post('/reorder', { order }); // Отправляем объект { order: [...] }
    }
}

import { BaseResource } from '@/components/SocialMediaLinks/api/core/BaseResource';

export class SocialMediaLinkResource extends BaseResource {
    constructor() {
        super('social-media-links');
    }

    async getLinks() {
        return this.get();
    }

    async createLink(data) {
        // Добавляем протокол, если его нет
        if (data.url && !data.url.startsWith('http://') && !data.url.startsWith('https://')) {
            data.url = 'https://' + data.url;
        }
        return this.post('', data);
    }

    async updateLink(id, data) {
        return this.put(`/${id}`, data);
    }

    async deleteLink(id) {
        return this.delete(`/${id}`);
    }

    async reorderLinks(order) {
        return this.post('/reorder', { order });
    }
}

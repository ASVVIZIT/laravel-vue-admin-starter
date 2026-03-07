// ============================================================================
// CHANNEL RESOURCE — API РЕСУРС ДЛЯ КАНАЛОВ СВЯЗИ
// ============================================================================
// 📁 Путь: resources/js/components/ContactManagement/CompanyContactChannels/api/core/ChannelResource.js
// ✅ Используется: channelStore.js
// ✅ Безопасно менять — влияет только на API вызовы каналов
// ✅ Зависит от: BaseResource.js, request.js
// ============================================================================

import { BaseResource } from './BaseResource.js';

export class ChannelResource extends BaseResource {
    constructor() {
        // ✅ БАЗОВЫЙ ПУТЬ — channels (независимо от компаний)
        super('channels');
    }

    // ========================================================================
    // GET CHANNELS COUNT — Получить общее количество каналов
    // ========================================================================
    async getChannelsCount(params = {}) {
        console.log('🔵 [ChannelResource] getChannelsCount:', { params });
        return this.get('meta/total', params);
    }

    // ========================================================================
    // GET ALL CHANNELS — Получить все каналы (с пагинацией)
    // ========================================================================
    async getChannels(params = {}) {
        console.log('🔵 [ChannelResource] getChannels:', { params });
        return this.get('', params);
    }

    // ========================================================================
    // GET CHANNELS BY COMPANY — Получить каналы компании
    // ========================================================================
    async getChannelsByCompany(companyId, params = {}) {
        console.log('🔵 [ChannelResource] getChannelsByCompany:', { companyId, params });
        return this.get(`companies/${companyId}/contact-channels`, params);
    }

    // ========================================================================
    // GET CHANNEL — Получить один канал
    // ========================================================================
    async getChannel(channelId) {
        console.log('🔵 [ChannelResource] getChannel:', { channelId });
        return this.get(`/${channelId}`);
    }

    // ========================================================================
    // CREATE CHANNEL — Создать канал
    // ========================================================================
    async createChannel(data) {
        console.log('🔵 [ChannelResource] createChannel:', { data });
        return this.post('', data);
    }

    // ========================================================================
    // UPDATE CHANNEL — Обновить канал
    // ========================================================================
    async updateChannel(channelId, data) {
        console.log('🔵 [ChannelResource] updateChannel:', { channelId, data });
        return this.put(`/${channelId}`, data);
    }

    // ========================================================================
    // DELETE CHANNEL — Удалить канал
    // ========================================================================
    async deleteChannel(channelId) {
        console.log('🔵 [ChannelResource] deleteChannel:', { channelId });
        return this.delete(`/${channelId}`);
    }

    // ========================================================================
    // REORDER CHANNELS — Обновить порядок каналов
    // ========================================================================
    async reorderChannels(order) {
        console.log('🔵 [ChannelResource] reorderChannels:', { order });
        return this.put('/reorder', { order });
    }

    // ========================================================================
    // BATCH UPDATE CHANNELS — Массовое обновление каналов
    // ========================================================================
    async batchUpdateChannels(channels) {
        console.log('🔵 [ChannelResource] batchUpdateChannels:', { count: channels.length });
        const promises = channels.map(channel =>
            this.updateChannel(channel.id, channel)
        );
        return Promise.all(promises);
    }
}

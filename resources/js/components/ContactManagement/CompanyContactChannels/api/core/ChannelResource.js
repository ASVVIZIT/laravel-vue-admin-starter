// ============================================================================
// CHANNEL RESOURCE — API РЕСУРС ДЛЯ КАНАЛОВ СВЯЗИ
// ============================================================================
// 📁 Путь: resources/js/api/core/ChannelResource.js
// ✅ Используется: channelStore.js
// ✅ Безопасно менять — влияет только на API вызовы каналов
// ============================================================================

import { BaseResource } from './BaseResource.js';

export class ChannelResource extends BaseResource {
    constructor() {
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
    // SYNC CHANNELS — Синхронизация каналов (для IndexedDB)
    // ========================================================================
    async syncChannels(params = {}) {
        console.log('🔵 [ChannelResource] syncChannels:', { params });
        return this.get('sync', params);
    }

    // ========================================================================
    // REORDER CHANNELS — Обновить порядок каналов
    // ========================================================================
    async reorderChannels(order) {
        console.log('🔵 [ChannelResource] reorderChannels:', { order });
        return this.put('reorder', { order });
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
    // GET CHANNELS BY COMPANY — Получить каналы компании
    // ========================================================================
    async getChannelsByCompany(companyId, params = {}) {
        console.log('🔵 [ChannelResource] getChannelsByCompany:', { companyId, params });
        return this.get(`companies/${companyId}/contact-channels`, params);
    }

    // ========================================================================
    // CREATE CHANNEL BY COMPANY — Создать канал компании
    // ========================================================================
    async createChannelByCompany(companyId, data) {
        console.log('🔵 [ChannelResource] createChannelByCompany:', { companyId, data });
        return this.post(`companies/${companyId}/contact-channels`, data);
    }

    // ========================================================================
    // REORDER CHANNELS BY COMPANY — Сортировка каналов компании
    // ========================================================================
    async reorderChannelsByCompany(companyId, order) {
        console.log('🔵 [ChannelResource] reorderChannelsByCompany:', { companyId, order });
        return this.put(`companies/${companyId}/contact-channels/reorder`, { order });
    }
}

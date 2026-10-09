import { defineStore } from 'pinia'
import videoMessage from '@/modules/Video/utils/videoMessage/videoMessage.js';

export const useVideoGalleryStore = defineStore('videoGallery', {
    state: () => ({
        columns: 2,
        muted: true,
        looping: false,
        autoPlay: true,
        showMeta: true,
        settingsPanelOpen: false,
        refreshCache: false,
        videosPerPage: 24,
        scanBatchSize: 1,
        scanMode: 'manual' // 'single', 'batch', 'manual'
    }),

    actions: {
        init() {
            const saved = localStorage.getItem('videoGallerySettings');
            if (saved) {
                try {
                    const settings = JSON.parse(saved);
                    this.columns = settings.columns ?? 2;
                    this.muted = settings.muted ?? true;
                    this.looping = settings.looping ?? false;
                    this.autoPlay = settings.autoPlay ?? true;
                    this.showMeta = settings.showMeta ?? true;
                    this.settingsPanelOpen = settings.settingsPanelOpen ?? false;
                    this.videosPerPage = settings.videosPerPage ?? 24;
                    this.refreshCache = settings.refreshCache ?? false;
                    this.scanBatchSize = settings.scanBatchSize || 1;
                    this.scanMode = settings.scanMode || 'manual';
                } catch (e) {
                    console.error('Ошибка загрузки настроек:', e);
                    this.resetToDefaults();
                }
            } else {
                this.resetToDefaults();
            }
        },

        resetToDefaults() {
            this.columns = 2;
            this.muted = true;
            this.looping = false;
            this.autoPlay = true;
            this.showMeta = true;
            this.settingsPanelOpen = false;
            this.refreshCache = false;
            this.videosPerPage = 24;
            this.scanBatchSize = 1;
            this.scanMode = 'manual';
            this.saveSettings();
            videoMessage.success('Настройки сброшены к значениям по умолчанию');
        },

        saveSettings() {
            const settings = {
                columns: this.columns,
                muted: this.muted,
                looping: this.looping,
                autoPlay: this.autoPlay,
                showMeta: this.showMeta,
                settingsPanelOpen: this.settingsPanelOpen,
                refreshCache: this.refreshCache,
                videosPerPage: this.videosPerPage,
                scanBatchSize: this.scanBatchSize,
                scanMode: this.scanMode,
            };
            localStorage.setItem('videoGallerySettings', JSON.stringify(settings));
            videoMessage.success('Настройки сохранены');
        },

        toggleRefreshCache() {
            this.refreshCache = !this.refreshCache;
            videoMessage.info(this.refreshCache ?
                'Кеш будет обновляться при загрузке' :
                'Используется кешированная версия');
            this.saveSettings();
        },

        toggleAutoPlay() {
            this.autoPlay = !this.autoPlay;
            videoMessage.info(this.autoPlay ? 'Автозапуск включен' : 'Автозапуск выключен');
            this.saveSettings();
        },

        toggleMeta() {
            this.showMeta = !this.showMeta;
            videoMessage.info(this.showMeta ? 'Показ метаданных включен' : 'Показ метаданных выключен');
            this.saveSettings();
        },

        toggleSettingsPanel() {
            this.settingsPanelOpen = !this.settingsPanelOpen;
            this.saveSettings();
        },

        setVideosPerPage(value) {
            this.videosPerPage = value;
            this.saveSettings();
        }
    }
});

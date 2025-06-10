import { defineStore } from 'pinia';
import MessageResource from '@api/GlobalChat/messageResource.js';

export const messageStore = defineStore('message', {
    state: () => ({
        messages: [],
        loading: false,
        connectionStatus: 'Соединение...'
    }),
    actions: {
        async fetchMessages() {
            this.loading = true;
            try {
                const res = await new MessageResource().list();
                this.messages = res.data || [];
                this.sortMessages();
            } catch (error) {
                console.error('Ошибка загрузки сообщений:', error);
            } finally {
                this.loading = false;
            }
        },

        async sendMessage(data) {
            this.loading = true;
            try {
                const response = await new MessageResource().send(data);
                return response;
            } catch (error) {
                console.error('Ошибка отправки сообщения:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        addMessage(message) {
            if (!this.messages.some(m => m.id === message.id)) {
                this.messages.push(message);
                this.sortMessages();
            }
        },

        removeOptimisticMessage(tempId) {
            this.messages = this.messages.filter(m => m.id !== tempId);
            this.sortMessages();
        },

        setConnectionStatus(status) {
            this.connectionStatus = status;
        },

        sortMessages() {
            this.messages.sort((a, b) =>
                new Date(a.created_at) - new Date(b.created_at)
            );
        }
    }
});

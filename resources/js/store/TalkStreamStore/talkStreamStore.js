import { defineStore } from 'pinia';
import createEcho from '@/plugins/echo';
import { userStore } from '@/store/user';

export const talkStreamStore = defineStore('talkStream', {
    state: () => ({
        echo: null,
        isConnected: false,
        connectionError: null,
        messages: [],
        activeCalls: []
    }),

    actions: {
        init() {
            if (!this.echo) return;

            const useUserStore = userStore();

            try {
                this.echo = createEcho();

                // Обработчики соединения
                this.echo.connector.socket.on('connect', () => {
                    this.isConnected = true;
                    this.connectionError = null;
                    this.subscribeToUserChannel(useUserStore.id);
                });

                this.echo.connector.socket.on('error', (error) => {
                    this.connectionError = error.message;
                    this.isConnected = false;
                });

                this.echo.connector.socket.on('disconnect', () => {
                    this.isConnected = false;
                });

            } catch (error) {
                console.error('WebSocket init error:', error);
                this.connectionError = error.message;
            }
        },

        subscribeToUserChannel(userId) {
            if (!this.echo) return;

            this.echo.private(`talkstream.${userId}`)
                .listen('.message.received', (event) => {
                    this.messages.push(event.message);
                })
                .listen('.call.incoming', (event) => {
                    this.handleIncomingCall(event.call);
                });
        },

        handleIncomingCall(callData) {
            this.activeCalls.push(callData);
        },

        disconnect() {
            if (this.echo) {
                this.echo.disconnect();
                this.echo = null;
            }
            this.isConnected = false;
        }
    }
});

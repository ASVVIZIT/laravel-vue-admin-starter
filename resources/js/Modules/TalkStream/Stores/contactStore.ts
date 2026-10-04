// resources/js/Modules/TalkStream/Stores/contactStore.ts

import { defineStore } from 'pinia'
import { TalkStreamAPI } from '../api/talkstream'
import type { Contact, User } from '../types'
import { useUserStore } from '@/store/userStore'

export const useContactStore = defineStore('contact', {
    state: () => ({
        contacts: [] as Contact[],
        selectedContact: null as Contact | null,
        onlineUsers: [] as number[],
        loading: false
    }),

    actions: {
        /**
         * Загрузка списка контактов
         */
        async fetchContacts() {
            this.loading = true
            try {
                const response = await TalkStreamAPI.getContacts()
                if (response.data) {
                    this.contacts = response.data
                }
            } catch (error) {
                console.error('[ContactStore] Failed to fetch contacts:', error)
            } finally {
                this.loading = false
            }
        },

        /**
         * Выбор контакта для чата
         */
        selectContact(contact: Contact) {
            this.selectedContact = contact
            try {
                localStorage.setItem('selectedContactId', String(contact.id))
            } catch (e) {
                // ignore storage errors
            }
        },

        /**
         * Проверка, онлайн ли пользователь
         */
        isOnline(userId: number): boolean {
            return this.onlineUsers.includes(userId)
        },

        /**
         * Обновление статуса онлайн (вызывается из Presence Handler)
         */
        updateUserOnline(userId: number, isOnline: boolean) {
            if (isOnline) {
                if (!this.onlineUsers.includes(userId)) {
                    this.onlineUsers.push(userId)
                }
            } else {
                this.onlineUsers = this.onlineUsers.filter(id => id !== userId)
            }
        },

        /**
         * Очистка выбранного контакта
         */
        clearSelection() {
            this.selectedContact = null
        }
    },

    getters: {
        /**
         * Получить текущего выбранного собеседника
         */
        activeContact: (state): Contact | null => {
            return state.selectedContact
        }
    }
})

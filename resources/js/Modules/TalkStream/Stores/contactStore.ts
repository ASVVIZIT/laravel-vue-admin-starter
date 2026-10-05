import { defineStore } from 'pinia'
import { TalkStreamAPI } from '@/modules/TalkStream/api/talkstream'
import type { Contact } from '@/modules/TalkStream/types'

export const useContactStore = defineStore('contact', {
    state: () => ({
        contacts: [] as Contact[],
        selectedContact: null as Contact | null,
        onlineUsers: [] as number[],
        userFrom: null as Contact | null,
        userId: null as number | null,
        loading: false,
    }),

    actions: {
        /**
         * Загрузка списка контактов с сервера
         */
        async fetchContacts(): Promise<void> {
            this.loading = true
            try {
                const response = await TalkStreamAPI.getContacts()
                if (response.data) {
                    this.contacts = response.data
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('[ContactStore] Failed to fetch contacts:', errorMessage)
            } finally {
                this.loading = false
            }
        },

        /**
         * Алиас для загрузки контактов
         */
        async loadContacts(): Promise<void> {
            return this.fetchContacts()
        },

        /**
         * Выбор активного контакта
         */
        selectContact(contact: Contact | null): void {
            this.selectedContact = contact
            if (contact) {
                try {
                    localStorage.setItem('selectedContactId', String(contact.id))
                    localStorage.setItem('last-selected-contact', String(contact.id))
                } catch (e) {
                    // Игнорируем ошибки хранилища
                }
            }
        },

        /**
         * Проверка онлайн-статуса пользователя
         */
        isOnline(userId: number | undefined | null): boolean {
            if (!userId) return false
            return this.onlineUsers.includes(userId)
        },

        /**
         * Проверка: является ли этот контакт текущим выбранным?
         */
        isContactSelected(userId: number): boolean {
            return this.selectedContact?.id === userId
        },

        /**
         * Обновление онлайн-статуса пользователя
         * @param userId ID пользователя
         * @param isOnline Статус (true = онлайн, false = оффлайн)
         */
        updateUserOnline(userId: number, isOnline: boolean): void {
            if (isOnline) {
                if (!this.onlineUsers.includes(userId)) {
                    this.onlineUsers.push(userId)
                }
            } else {
                this.onlineUsers = this.onlineUsers.filter(id => id !== userId)
            }
        },

        /**
         * Установить статус онлайн (алиас)
         */
        setOnline(userId: number): void {
            this.updateUserOnline(userId, true)
        },

        /**
         * Установить статус оффлайн (алиас)
         */
        setOffline(userId: number): void {
            this.updateUserOnline(userId, false)
        },

        /**
         * Обновление данных текущего пользователя (userFrom) из списка контактов
         */
        async refreshUserFrom(): Promise<void> {
            try {
                // Если контакты еще не загружены, загружаем их
                if (this.contacts.length === 0) {
                    await this.fetchContacts()
                }

                // Ищем себя в списке контактов
                if (this.userId) {
                    const me = this.contacts.find(c => c.id === this.userId)
                    if (me) {
                        this.userFrom = me
                    }
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.warn('[ContactStore] refreshUserFrom failed:', errorMessage)
            }
        },

        /**
         * Сброс выбора контакта
         */
        clearSelection(): void {
            this.selectedContact = null
        },

        /**
         * Полный сброс стора
         */
        reset(): void {
            this.contacts = []
            this.selectedContact = null
            this.onlineUsers = []
            this.userFrom = null
            this.userId = null
            this.loading = false
        }
    },

    getters: {
        /**
         * Получить текущий активный контакт
         */
        activeContact: (state): Contact | null => state.selectedContact,

        /**
         * Количество контактов
         */
        contactsCount: (state): number => state.contacts.length,

        /**
         * Количество онлайн пользователей
         */
        onlineCount: (state): number => state.onlineUsers.length
    }
})

import { login, logout, getInfo } from '@/api/auth'
import { isLogged, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '../router'
import { defineStore } from "pinia"
import { permissionStore } from "@/store/permission"
import { useTalkStreamStore } from "@/Modules/TalkStream/Stores/talkStreamStore"
import { updateEchoToken } from "@/Modules/TalkStream/plugins/echoTalkStream"

export const userStore = defineStore('user', {
    state: () => {
        return {
            id: null,
            token: null,
            name: '',
            email: '',
            avatar: '',
            roles: [],
            permissions: [],
        }
    },
    actions: {
        async refreshToken(newToken) {
            setToken(newToken);
            updateEchoToken(newToken);

            const talkStreamStore = useTalkStreamStore();
            if (talkStreamStore.isConnected) {
                talkStreamStore.disconnect();
                talkStreamStore.initWebSockets();
            }
        },

        login(userInfo) {
            const { email, password } = userInfo
            return new Promise((resolve, reject) => {
                login({ email: email.trim(), password })
                    .then(response => {
                        setToken(response.token)
                        resolve()

                        const talkStream = useTalkStreamStore()
                        talkStream.initWebSockets()
                    })
                    .catch(error => {
                        console.log(error)
                        reject(error)
                    })
            })
        },

        async fetchInfo() {
            try {
                const res = await this.getInfo()
                const data = res.data

                this.$patch({
                    id: data.id,
                    name: data.name,
                    avatar: data.avatar,
                    email: data.email,
                    roles: data.roles,
                    permissions: data.permissions
                })

                return data
            } catch (e) {
                console.error('[userStore] Ошибка загрузки информации о пользователе:', e)
                this.reset()
            }
        },

        reset() {
            this.$reset()
        },

        getInfo() {
            return new Promise((resolve, reject) => {
                getInfo()
                    .then(response => {
                        const { data } = response

                        if (!data) {
                            reject('Verification failed, please Login again.')
                        }

                        const { roles, name, email, avatar, permissions, id } = data
                        if (!roles || roles.length <= 0) {
                            reject('getInfo: roles must be a non-null array!')
                        }

                        this.$patch({
                            id,
                            name,
                            email,
                            roles,
                            permissions,
                            avatar
                        })

                        resolve(data)

                        const talkStream = useTalkStreamStore()
                        if (!talkStream.isConnected) {
                            talkStream.initWebSockets()
                        }
                    })
                    .catch(error => {
                        console.log(error)
                        reject(error)
                    })
            })
        },

        logout() {
            return new Promise((resolve, reject) => {
                logout()
                    .then(() => {
                        this.$patch({
                            token: '',
                            roles: []
                        })
                        removeToken()
                        resetRouter()

                        const talkStream = useTalkStreamStore()
                        talkStream.disconnect()

                        resolve()
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
        },

        resetToken() {
            return new Promise(resolve => {
                this.$patch({
                    token: '',
                    roles: []
                })
                removeToken()
                resolve()
            })
        },

        changeRoles(role) {
            return new Promise(async resolve => {
                const roles = [role.name]
                const permissions = role.permissions.map(permission => permission.name)
                this.$patch({
                    permissions,
                    roles
                })
                resetRouter()

                const usePermissionStore = permissionStore()
                const accessRoutes = await usePermissionStore.generateRoutes(roles, permissions)

                accessRoutes.forEach((item) => {
                    router.addRoute(item)
                })

                resolve()
            })
        },
    }
})

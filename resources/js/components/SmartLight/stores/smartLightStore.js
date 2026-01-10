import { defineStore } from 'pinia';
import { SmartLightResource } from '@/components/SmartLight/api/core/SmartLightResource.js';

export const useSmartLightStore = defineStore('smartLight', {
    state: () => ({
        devices: [],
        globalSettings: {
            global_server_url: '',
            default_critical_voltage: 3.2,
            default_sleep_interval: 600,
            default_emergency_sleep_interval: 3600,
            default_wifi_ssid: '',
            default_wifi_password: '',
            timezone: 'Europe/Moscow',
            log_level: 'info',
            telemetry_retention_days: 30
        },
        loading: false,
        error: null,
        lastCommandTimestamp: 0,
        COMMAND_DEBOUNCE: 1000
    }),

    getters: {
        realDevices: state => {
            return state.devices.filter(device => !device.is_fake);
        },
        fakeDevices: state => {
            return state.devices.filter(device => device.is_fake);
        },
        hasFakeDevices: state => {
            return state.fakeDevices.length > 0;
        }
    },

    actions: {
        async fetchDevices() {
            const now = Date.now();
            if (now - this.lastCommandTimestamp < this.COMMAND_DEBOUNCE) {
                return {
                    success: false,
                    message: 'Частые запросы',
                    error: 'Слишком частые запросы'
                };
            }

            this.loading = true;
            this.error = null;

            const resource = new SmartLightResource();

            try {
                const response = await resource.getDevices();

                // Проверяем структуру ответа
                if (!response.data) {
                    throw new Error('Invalid devices response structure');
                }

                // Создаем полный объект устройства
                this.devices = response.data.map(device => {
                    return {
                        ...device,
                        intensity: device.intensity || 100,
                        voltage: device.voltage || 3.7,
                        status: device.status || 'OFF',
                        is_fake: device.is_fake || false,
                        image_on_url: device.image_on_url || '/images/smart-light-default-on.png',
                        image_off_url: device.image_off_url || '/images/smart-light-default-off.png'
                    };
                });

                this.lastCommandTimestamp = now;
                return {
                    success: true,
                    message: 'Устройства загружены',
                    data: this.devices
                };
            } catch (err) {
                this.error = 'Не удалось загрузить устройства';
                return {
                    success: false,
                    message: 'Ошибка загрузки устройств',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async fetchGlobalSettings() {
            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                const response = await resource.getGlobalSettings();

                // Проверяем структуру ответа
                if (!response.data) {
                    throw new Error('Invalid global settings response');
                }

                // Объединяем настройки
                this.globalSettings = {
                    ...this.globalSettings,
                    ...response.data
                };

                return {
                    success: true,
                    message: 'Настройки загружены',
                    data: this.globalSettings
                };
            } catch (err) {
                this.error = 'Не удалось загрузить настройки';
                return {
                    success: false,
                    message: 'Ошибка загрузки настроек',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async updateGlobalSettings(settings) {
            const now = Date.now();
            if (now - this.lastCommandTimestamp < this.COMMAND_DEBOUNCE) {
                return {
                    success: false,
                    message: 'Частые запросы',
                    error: 'Слишком частые запросы'
                };
            }

            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                const response = await resource.updateGlobalSettings(settings);

                // Объединяем настройки
                this.globalSettings = {
                    ...this.globalSettings,
                    ...response.data
                };

                this.lastCommandTimestamp = now;
                return {
                    success: true,
                    message: 'Настройки обновлены',
                    data: this.globalSettings
                };
            } catch (err) {
                this.error = 'Не удалось сохранить настройки';
                return {
                    success: false,
                    message: 'Ошибка сохранения настроек',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async resetGlobalSettings() {
            const now = Date.now();
            if (now - this.lastCommandTimestamp < this.COMMAND_DEBOUNCE) {
                return {
                    success: false,
                    message: 'Частые запросы',
                    error: 'Слишком частые запросы'
                };
            }

            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                const response = await resource.resetGlobalSettings();

                // Объединяем настройки
                this.globalSettings = {
                    ...this.globalSettings,
                    ...response.data
                };

                this.lastCommandTimestamp = now;
                return {
                    success: true,
                    message: 'Настройки сброшены',
                    data: this.globalSettings
                };
            } catch (err) {
                this.error = 'Не удалось сбросить настройки';
                return {
                    success: false,
                    message: 'Ошибка сброса настроек',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async sendCommand(deviceId, command, intensity = 100) {
            const now = Date.now();
            if (now - this.lastCommandTimestamp < this.COMMAND_DEBOUNCE) {
                return {
                    success: false,
                    message: 'Частые запросы',
                    error: 'Слишком частые запросы'
                };
            }

            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                const device = this.devices.find(d => d.device_id === deviceId);
                if (!device) {
                    throw new Error('Device not found');
                }

                // Для фейковых устройств эмулируем ответ
                if (device.is_fake) {
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Обновляем данные в сторе
                    const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
                    if (deviceIndex !== -1) {
                        this.devices[deviceIndex].status = command;
                        this.devices[deviceIndex].intensity = intensity;

                        // Эмулируем изменение напряжения для фейковых устройств
                        if (command === 'OFF') {
                            this.devices[deviceIndex].voltage = Math.max(2.5, this.devices[deviceIndex].voltage - 0.02);
                        } else {
                            this.devices[deviceIndex].voltage = Math.min(4.3, this.devices[deviceIndex].voltage + 0.02);
                        }
                    }

                    this.lastCommandTimestamp = now;
                    return {
                        success: true,
                        message: 'Команда эмулирована',
                        data: {
                            command,
                            intensity,
                            device_id: deviceId
                        }
                    };
                }

                // Для реальных устройств отправляем реальный запрос
                const response = await resource.sendCommand(deviceId, command, intensity);

                // Обновляем данные в сторе
                const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
                if (deviceIndex !== -1) {
                    this.devices[deviceIndex].status = command;
                    this.devices[deviceIndex].intensity = intensity;
                }

                this.lastCommandTimestamp = now;
                return response;
            } catch (err) {
                this.error = 'Не удалось отправить команду';
                return {
                    success: false,
                    message: 'Ошибка отправки команды',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async forceSleep(deviceId) {
            const now = Date.now();
            if (now - this.lastCommandTimestamp < this.COMMAND_DEBOUNCE) {
                return {
                    success: false,
                    message: 'Частые запросы',
                    error: 'Слишком частые запросы'
                };
            }

            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                const device = this.devices.find(d => d.device_id === deviceId);
                if (!device) {
                    throw new Error('Device not found');
                }

                // Для фейковых устройств эмулируем ответ
                if (device.is_fake) {
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Обновляем данные в сторе
                    const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
                    if (deviceIndex !== -1) {
                        this.devices[deviceIndex].status = 'SLEEPING';
                        this.devices[deviceIndex].voltage = 2.9;
                    }

                    this.lastCommandTimestamp = now;
                    return {
                        success: true,
                        message: 'Команда сна эмулирована',
                        data: {
                            device_id: deviceId,
                            sleep_interval: device.emergency_sleep_interval
                        }
                    };
                }

                // Для реальных устройств отправляем реальный запрос
                const response = await resource.forceSleep(deviceId);

                // Обновляем данные в сторе
                const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
                if (deviceIndex !== -1) {
                    this.devices[deviceIndex].status = 'SLEEPING';
                }

                this.lastCommandTimestamp = now;
                return response;
            } catch (err) {
                this.error = 'Не удалось отправить команду сна';
                return {
                    success: false,
                    message: 'Ошибка отправки команды сна',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        }
    }
});

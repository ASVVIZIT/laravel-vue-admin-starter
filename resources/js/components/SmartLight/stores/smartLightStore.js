import { defineStore } from 'pinia';
import { SmartLightResource } from '@/components/SmartLight/api/core/SmartLightResource.js';

export const useSmartLightStore = defineStore('smartLight', {
    state: () => ({
        devices: [],
        selectedDevice: null,
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
                this.devices = response.data.map(device => ({
                    ...device,
                    intensity: device.intensity || 100,
                    voltage: device.voltage || 3.7,
                    status: device.status || 'OFF',
                    image_on_url: device.image_on_url || '/images/smart-light-default-on.png',
                    image_off_url: device.image_off_url || '/images/smart-light-default-off.png'
                }));

                // Если есть выбранное устройство, обновляем ссылку
                if (this.selectedDevice) {
                    const updatedDevice = this.devices.find(
                        d => d.device_id === this.selectedDevice.device_id
                    );
                    if (updatedDevice) {
                        this.selectedDevice = { ...updatedDevice };
                    }
                }

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

                if (device.is_fake) {
                    // Эмулируем ответ для фейковых устройств
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

                        // Обновляем выбранное устройство, если это текущее выбранное
                        if (this.selectedDevice && this.selectedDevice.device_id === deviceId) {
                            this.selectedDevice = { ...this.devices[deviceIndex] };
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

                // Для реальных устройств
                const response = await resource.sendCommand(deviceId, command, intensity);

                // Обновляем данные в сторе
                const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
                if (deviceIndex !== -1) {
                    this.devices[deviceIndex].status = command;
                    this.devices[deviceIndex].intensity = intensity;

                    // Обновляем выбранное устройство, если это текущее выбранное
                    if (this.selectedDevice && this.selectedDevice.device_id === deviceId) {
                        this.selectedDevice = { ...this.devices[deviceIndex] };
                    }
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

                if (device.is_fake) {
                    // Эмуляция для фейковых устройств
                    const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
                    if (deviceIndex !== -1) {
                        this.devices[deviceIndex].status = 'SLEEPING';
                        this.devices[deviceIndex].voltage = 2.9;

                        // Обновляем выбранное устройство, если это текущее выбранное
                        if (this.selectedDevice && this.selectedDevice.device_id === deviceId) {
                            this.selectedDevice = { ...this.devices[deviceIndex] };
                        }
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

                // Для реальных устройств
                const response = await resource.forceSleep(deviceId);

                // Обновляем данные в сторе
                const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
                if (deviceIndex !== -1) {
                    this.devices[deviceIndex].status = 'SLEEPING';

                    // Обновляем выбранное устройство, если это текущее выбранное
                    if (this.selectedDevice && this.selectedDevice.device_id === deviceId) {
                        this.selectedDevice = { ...this.devices[deviceIndex] };
                    }
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
        },

        async wakeUp(deviceId) {
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

                if (device.is_fake) {
                    // Эмуляция для фейковых устройств
                    const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
                    if (deviceIndex !== -1) {
                        this.devices[deviceIndex].status = 'ON';
                        this.devices[deviceIndex].voltage = 3.7;

                        // Обновляем выбранное устройство, если это текущее выбранное
                        if (this.selectedDevice && this.selectedDevice.device_id === deviceId) {
                            this.selectedDevice = { ...this.devices[deviceIndex] };
                        }
                    }

                    this.lastCommandTimestamp = now;
                    return {
                        success: true,
                        message: 'Устройство пробуждено',
                        data: {
                            device_id: deviceId,
                            status: 'ON'
                        }
                    };
                }

                // Для реальных устройств
                const response = await resource.wakeUp(deviceId);

                // Обновляем данные в сторе
                const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
                if (deviceIndex !== -1) {
                    this.devices[deviceIndex].status = 'ON';

                    // Обновляем выбранное устройство, если это текущее выбранное
                    if (this.selectedDevice && this.selectedDevice.device_id === deviceId) {
                        this.selectedDevice = { ...this.devices[deviceIndex] };
                    }
                }

                this.lastCommandTimestamp = now;
                return response;
            } catch (err) {
                this.error = 'Не удалось разбудить устройство';
                return {
                    success: false,
                    message: 'Ошибка пробуждения',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        // Метод для выбора устройства
        selectDevice(deviceId) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (device) {
                this.selectedDevice = { ...device };
                return true;
            }
            return false;
        },

        // Методы для прямого обновления свойств
        updateDeviceStatus(deviceId, status) {
            const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
            if (deviceIndex !== -1) {
                this.devices[deviceIndex].status = status;

                // Обновляем выбранное устройство, если это текущее
                if (this.selectedDevice && this.selectedDevice.device_id === deviceId) {
                    this.selectedDevice = { ...this.devices[deviceIndex] };
                }
            }
        },

        updateDeviceVoltage(deviceId, voltage) {
            const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
            if (deviceIndex !== -1) {
                this.devices[deviceIndex].voltage = voltage;

                // Обновляем статус, если напряжение критическое
                if (voltage <= this.devices[deviceIndex].critical_voltage) {
                    this.devices[deviceIndex].status = 'SLEEPING';
                }

                // Обновляем выбранное устройство, если это текущее
                if (this.selectedDevice && this.selectedDevice.device_id === deviceId) {
                    this.selectedDevice = { ...this.devices[deviceIndex] };
                }
            }
        },

        updateDeviceIntensity(deviceId, intensity) {
            const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
            if (deviceIndex !== -1) {
                this.devices[deviceIndex].intensity = intensity;

                // Обновляем выбранное устройство, если это текущее
                if (this.selectedDevice && this.selectedDevice.device_id === deviceId) {
                    this.selectedDevice = { ...this.devices[deviceIndex] };
                }
            }
        },

        updateDeviceCriticalVoltage(deviceId, voltage) {
            const deviceIndex = this.devices.findIndex(d => d.device_id === deviceId);
            if (deviceIndex !== -1) {
                this.devices[deviceIndex].critical_voltage = voltage;

                // Обновляем выбранное устройство, если это текущее
                if (this.selectedDevice && this.selectedDevice.device_id === deviceId) {
                    this.selectedDevice = { ...this.devices[deviceIndex] };
                }
            }
        }
    }
});

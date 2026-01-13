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
        realDevices: state => state.devices.filter(device => !device.is_fake),
        fakeDevices: state => state.devices.filter(device => device.is_fake),
        hasFakeDevices: state => state.fakeDevices.length > 0,
        selectedDeviceId: state => state.selectedDevice ? state.selectedDevice.device_id : null
    },

    actions: {
        selectDevice(deviceId) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (device) {
                this.selectedDevice = { ...device };
            }
        },

        updateDeviceVoltage(deviceId, voltage) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (device) {
                const wasSleeping = device.status === 'SLEEPING';
                const isCritical = voltage <= device.critical_voltage;

                // Создаем обновленное устройство
                const updatedDevice = {
                    ...device,
                    voltage
                };

                // Обрабатываем переход в спящий режим
                if (isCritical && !wasSleeping) {
                    updatedDevice.status = 'SLEEPING';
                } else if (!isCritical && wasSleeping) {
                    // Если напряжение восстановилось, выходим из спящего режима
                    updatedDevice.status = 'ON';
                }

                // Обновляем устройство в массиве
                const index = this.devices.findIndex(d => d.device_id === deviceId);
                if (index !== -1) {
                    this.devices[index] = updatedDevice;
                }

                // Обновляем выбранное устройство
                if (this.selectedDevice?.device_id === deviceId) {
                    this.selectedDevice = { ...updatedDevice };
                }
            }
        },

        updateDeviceIntensity(deviceId, intensity) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (device) {
                // Создаем обновленное устройство
                const updatedDevice = {
                    ...device,
                    intensity
                };

                // Обновляем устройство в массиве
                const index = this.devices.findIndex(d => d.device_id === deviceId);
                if (index !== -1) {
                    this.devices[index] = updatedDevice;
                }

                // Обновляем выбранное устройство
                if (this.selectedDevice?.device_id === deviceId) {
                    this.selectedDevice = { ...updatedDevice };
                }
            }
        },

        updateDeviceStatus(deviceId, status) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (device) {
                // Проверяем, изменился ли статус
                if (device.status === status) return;

                // Создаем обновленное устройство
                const updatedDevice = {
                    ...device,
                    status
                };

                // Для фейковых устройств
                if (device.is_fake) {
                    if (status === 'SLEEPING' && device.status !== 'SLEEPING') {
                        updatedDevice.voltage = 2.9;
                    } else if (status === 'ON' && device.status === 'SLEEPING') {
                        updatedDevice.voltage = 3.7;
                        updatedDevice.intensity = 100;
                    }
                }

                // Обновляем устройство в массиве
                const index = this.devices.findIndex(d => d.device_id === deviceId);
                if (index !== -1) {
                    this.devices[index] = updatedDevice;
                }

                // Обновляем выбранное устройство
                if (this.selectedDevice?.device_id === deviceId) {
                    this.selectedDevice = { ...updatedDevice };
                }
            }
        },

        updateDeviceCriticalVoltage(deviceId, criticalVoltage) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (device) {
                // Создаем обновленное устройство
                const updatedDevice = {
                    ...device,
                    critical_voltage: criticalVoltage
                };

                // Обновляем устройство в массиве
                const index = this.devices.findIndex(d => d.device_id === deviceId);
                if (index !== -1) {
                    this.devices[index] = updatedDevice;
                }

                // Обновляем выбранное устройство
                if (this.selectedDevice?.device_id === deviceId) {
                    this.selectedDevice = { ...updatedDevice };
                }
            }
        },

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
                    status: device.status || 'OFF'
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

        async sendCommand(deviceId, status, intensity) {
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
                const response = await resource.sendCommand(deviceId, status, intensity);

                if (response.success) {
                    this.lastCommandTimestamp = now;
                    return {
                        success: true,
                        message: 'Команда отправлена',
                        data: response.data
                    };
                } else {
                    throw new Error(response.message || 'Ошибка отправки команды');
                }
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
            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                const response = await resource.forceSleep(deviceId);

                if (response.success) {
                    // Обновляем статус в сторе
                    this.updateDeviceStatus(deviceId, 'SLEEPING');
                    return {
                        success: true,
                        message: 'Устройство переведено в спящий режим'
                    };
                } else {
                    throw new Error(response.message || 'Ошибка перевода в сон');
                }
            } catch (err) {
                this.error = 'Не удалось перевести устройство в сон';
                return {
                    success: false,
                    message: 'Ошибка перевода в сон',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async wakeDevice(deviceId) {
            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                // Для реальных устройств
                if (!this.devices.find(d => d.device_id === deviceId)?.is_fake) {
                    const response = await resource.wakeDevice(deviceId);

                    if (!response.success) {
                        throw new Error(response.message || 'Ошибка пробуждения');
                    }
                }

                // Восстанавливаем емкость аккумулятора
                this.updateDeviceVoltage(deviceId, 3.7);

                // Переключаем в режим ON
                this.updateDeviceStatus(deviceId, 'ON');
                this.updateDeviceIntensity(deviceId, 100);

                this.lastCommandTimestamp = Date.now();
                return {
                    success: true,
                    message: 'Устройство пробуждено'
                };
            } catch (err) {
                this.error = 'Не удалось пробудить устройство';
                return {
                    success: false,
                    message: 'Ошибка пробуждения',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        }
    }
});

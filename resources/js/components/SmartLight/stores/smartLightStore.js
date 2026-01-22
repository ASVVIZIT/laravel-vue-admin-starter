import { reactive, computed } from 'vue';
import { logDebug, isFullyVisible } from '@/components/SmartLight/api/utils/webglSupport.js';

// Типы устройств
const DEVICE_TYPES = {
    REAL: 'real',
    FAKE: 'fake'
};

// Состояние устройства
const DEVICE_STATE = {
    ON: 'ON',
    OFF: 'OFF',
    SLEEPING: 'SLEEPING'
};

// Создаем Store
const createSmartLightStore = () => {
    const store = reactive({
        devices: [],
        realDevices: computed(() => store.devices.filter(device => !device.is_fake)),
        fakeDevices: computed(() => store.devices.filter(device => device.is_fake)),
        selectedDevice: computed(() => {
            if (!store.selectedDeviceId) return null;
            return store.devices.find(device => device.device_id === store.selectedDeviceId) || null;
        }),
        selectedDeviceId: null,
        interfaceSettings: {
            global3DMode: true,
            device3DMode: {},
            lastTab: 'real'
        },

        // Методы Store
        init() {
            logDebug('SmartLightStore', 'Инициализация Store');

            // Загружаем настройки из localStorage
            try {
                const storedSettings = localStorage.getItem('smartlight_interface_settings');
                if (storedSettings) {
                    const settings = JSON.parse(storedSettings);
                    store.interfaceSettings.global3DMode = settings.global3DMode;
                    store.interfaceSettings.device3DMode = settings.device3DMode || {};
                    store.interfaceSettings.lastTab = settings.lastTab || 'real';
                }
            } catch (e) {
                logDebug('SmartLightStore', 'Ошибка загрузки настроек', { error: e.message });
            }

            // Загружаем фейковые устройства
            store.loadFakeDevices();

            // Загружаем реальные устройства
            store.loadRealDevices();
        },

        initInterfaceSettings() {
            logDebug('SmartLightStore', 'Инициализация настроек интерфейса');

            // Загружаем настройки из localStorage
            const storedSettings = localStorage.getItem('smartlight_interface_settings');
            if (storedSettings) {
                try {
                    const settings = JSON.parse(storedSettings);
                    store.interfaceSettings.global3DMode = settings.global3DMode;
                    store.interfaceSettings.device3DMode = settings.device3DMode || {};
                    store.interfaceSettings.lastTab = settings.lastTab || 'real';
                } catch (e) {
                    logDebug('SmartLightStore', 'Ошибка загрузки настроек интерфейса', { error: e.message });
                }
            }
        },

        saveInterfaceSettings() {
            logDebug('SmartLightStore', 'Сохранение настроек интерфейса');

            // Сохраняем настройки в localStorage
            localStorage.setItem('smartlight_interface_settings', JSON.stringify({
                global3DMode: store.interfaceSettings.global3DMode,
                device3DMode: store.interfaceSettings.device3DMode,
                lastTab: store.interfaceSettings.lastTab
            }));
        },

        getDevice(deviceId) {
            logDebug('SmartLightStore', 'Получение устройства', { deviceId });
            return store.devices.find(device => device.device_id === deviceId);
        },

        selectDevice(deviceId) {
            logDebug('SmartLightStore', 'Выбор устройства', { deviceId });
            store.selectedDeviceId = deviceId;

            // Сохраняем в localStorage
            localStorage.setItem('smartlight_selected_device', deviceId);
        },

        updateDeviceStatus(deviceId, status) {
            logDebug('SmartLightStore', 'Обновление статуса устройства', {
                deviceId,
                status
            });

            const device = store.getDevice(deviceId);
            if (device) {
                device.status = status;

                // Сохраняем в localStorage
                localStorage.setItem(`smartlight_device_status_${deviceId}`, status);
            }
        },

        updateDeviceVoltage(deviceId, voltage) {
            logDebug('SmartLightStore', 'Обновление напряжения', {
                deviceId,
                voltage
            });

            const device = store.getDevice(deviceId);
            if (device) {
                device.voltage = voltage;

                // Сохраняем в localStorage
                localStorage.setItem(`smartlight_device_voltage_${deviceId}`, voltage);
            }
        },

        updateDeviceIntensity(deviceId, intensity) {
            logDebug('SmartLightStore', 'Обновление интенсивности', {
                deviceId,
                intensity
            });

            const device = store.getDevice(deviceId);
            if (device) {
                device.intensity = intensity;

                // Сохраняем в localStorage
                localStorage.setItem(`smartlight_device_intensity_${deviceId}`, intensity);
            }
        },

        updateDeviceCriticalVoltage(deviceId, criticalVoltage) {
            logDebug('SmartLightStore', 'Обновление критического напряжения', {
                deviceId,
                criticalVoltage
            });

            const device = store.getDevice(deviceId);
            if (device) {
                device.critical_voltage = criticalVoltage;

                // Сохраняем в localStorage
                localStorage.setItem(`smartlight_device_critical_voltage_${deviceId}`, criticalVoltage);
            }
        },

        getDevice3DMode(deviceId) {
            logDebug('SmartLightStore', 'Получение режима отображения', {
                deviceId,
                device3DMode: store.interfaceSettings.device3DMode[deviceId],
                global3DMode: store.interfaceSettings.global3DMode
            });

            // Если для устройства задан индивидуальный режим, используем его
            if (store.interfaceSettings.device3DMode[deviceId] !== undefined) {
                return store.interfaceSettings.device3DMode[deviceId];
            }

            // Иначе используем глобальный режим
            return store.interfaceSettings.global3DMode;
        },

        setDevice3DMode(deviceId, mode) {
            logDebug('SmartLightStore', 'Установка режима отображения', {
                deviceId,
                mode
            });

            store.interfaceSettings.device3DMode[deviceId] = mode;
            store.saveInterfaceSettings();
        },

        setGlobal3DMode(mode) {
            logDebug('SmartLightStore', 'Установка глобального режима отображения', {
                mode
            });

            store.interfaceSettings.global3DMode = mode;

            // Сбрасываем индивидуальные настройки
            store.interfaceSettings.device3DMode = {};

            store.saveInterfaceSettings();
        },

        forceInit3D(deviceId) {
            logDebug('SmartLightStore', 'Принудительная инициализация 3D', { deviceId });

            // Ищем контейнер
            const deviceCard = document.querySelector(`[data-device-id="${deviceId}"]`);

            if (deviceCard) {
                logDebug('SmartLightStore', 'Найден DeviceCard', { deviceId });

                // Вызываем метод forceInit, если он доступен
                if (deviceCard.forceInit) {
                    deviceCard.forceInit();
                } else if (deviceCard.__vueParentComponent?.ctx?.forceInit) {
                    deviceCard.__vueParentComponent.ctx.forceInit();
                }
            } else {
                logDebug('SmartLightStore', 'DeviceCard не найден', { deviceId });
            }
        },

        deviceRuntime(deviceId) {
            logDebug('SmartLightStore', 'Вычисление времени работы', { deviceId });

            const device = store.getDevice(deviceId);
            if (!device) return '00:00:00';

            // Здесь будет логика вычисления времени
            return '00:00:00';
        },

        deviceSafeIntensityRange(deviceId) {
            logDebug('SmartLightStore', 'Получение безопасного диапазона', { deviceId });

            return {
                min: 0,
                max: 100
            };
        },

        deviceBatteryColor(deviceId) {
            logDebug('SmartLightStore', 'Получение цвета нормального уровня', { deviceId });

            const device = store.getDevice(deviceId);
            if (!device) return '#67c23a';

            const voltage = device.voltage || 3.7;
            if (voltage < 3.0) return '#8c8c8c';
            if (voltage < 3.4) return '#ff9800';
            return '#67c23a';
        },

        deviceCriticalColor(deviceId) {
            logDebug('SmartLightStore', 'Получение цвета критического уровня', { deviceId });

            const device = store.getDevice(deviceId);
            if (!device) return '#ffcccb';

            const voltage = device.voltage || 3.7;
            if (voltage < 3.0) return '#ff0000';
            if (voltage < 3.4) return '#ff9800';
            return '#ffcccb';
        },

        deviceNormalProgress(device) {
            logDebug('SmartLightStore', 'Вычисление нормального прогресса', {
                deviceId: device.device_id
            });

            const min = store.calculateGroupMinVoltage(device.device_id);
            const max = store.calculateGroupMaxVoltage(device.device_id);
            const critical = store.calculateGroupCriticalVoltage(device.device_id);

            if (device.voltage <= critical) {
                return 0;
            }

            const normalVoltage = device.voltage - critical;
            const maxNormalVoltage = max - critical;
            return Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));
        },

        deviceCriticalProgress(device) {
            logDebug('SmartLightStore', 'Вычисление критического прогресса', {
                deviceId: device.device_id
            });

            const min = store.calculateGroupMinVoltage(device.device_id);
            const max = store.calculateGroupMaxVoltage(device.device_id);
            const critical = store.calculateGroupCriticalVoltage(device.device_id);

            if (device.voltage >= critical) {
                return 0;
            }

            const criticalVoltageValue = critical - device.voltage;
            const criticalVoltageRange = critical - min;
            return Math.min(100, Math.max(0, (criticalVoltageValue / criticalVoltageRange) * 100));
        },

        deviceCriticalThresholdPosition(device) {
            logDebug('SmartLightStore', 'Вычисление позиции критического порога', {
                deviceId: device.device_id
            });

            const min = store.calculateGroupMinVoltage(device.device_id);
            const max = store.calculateGroupMaxVoltage(device.device_id);
            const critical = store.calculateGroupCriticalVoltage(device.device_id);

            return ((critical - min) / (max - min)) * 100;
        },

        deviceCurrentLevelPosition(device) {
            logDebug('SmartLightStore', 'Вычисление позиции текущего уровня', {
                deviceId: device.device_id
            });

            const min = store.calculateGroupMinVoltage(device.device_id);
            const max = store.calculateGroupMaxVoltage(device.device_id);

            return ((device.voltage - min) / (max - min)) * 100;
        },

        calculateGroupMinVoltage(deviceId) {
            logDebug('SmartLightStore', 'Получение минимального напряжения', { deviceId });

            // Определяем тип аккумулятора по ID устройства
            if (deviceId.includes('18650')) {
                return 2.5;
            } else if (deviceId.includes('21700')) {
                return 2.5;
            } else if (deviceId.includes('po')) {
                return 3.0;
            } else if (deviceId.includes('acid')) {
                return 1.8;
            } else {
                return 2.5;
            }
        },

        calculateGroupMaxVoltage(deviceId) {
            logDebug('SmartLightStore', 'Получение максимального напряжения', { deviceId });

            // Определяем тип аккумулятора по ID устройства
            if (deviceId.includes('18650')) {
                return 4.3;
            } else if (deviceId.includes('21700')) {
                return 4.3;
            } else if (deviceId.includes('po')) {
                return 4.3;
            } else if (deviceId.includes('acid')) {
                return 2.4;
            } else {
                return 4.3;
            }
        },

        calculateGroupCriticalVoltage(deviceId) {
            logDebug('SmartLightStore', 'Получение критического напряжения', { deviceId });

            // Определяем тип аккумулятора по ID устройства
            if (deviceId.includes('18650')) {
                return 3.0;
            } else if (deviceId.includes('21700')) {
                return 3.0;
            } else if (deviceId.includes('po')) {
                return 3.0;
            } else if (deviceId.includes('acid')) {
                return 2.0;
            } else {
                return 3.0;
            }
        },

        // Методы для работы с устройствами
        async fetchDevices() {
            logDebug('SmartLightStore', 'Загрузка устройств');

            // Здесь будет реальная загрузка устройств
            // Для демонстрации создаем фейковые устройства
            store.loadFakeDevices();
        },

        loadFakeDevices() {
            logDebug('SmartLightStore', 'Загрузка фейковых устройств');

            // Создаем фейковые устройства
            store.devices = [
                {
                    device_id: 'fake-001',
                    name: 'Фейковое устройство 1',
                    status: 'ON',
                    voltage: 3.7,
                    intensity: 100,
                    is_fake: true,
                    battery_type_id: 'li-ion-18650'
                },
                {
                    device_id: 'fake-002',
                    name: 'Фейковое устройство 2',
                    status: 'OFF',
                    voltage: 3.5,
                    intensity: 0,
                    is_fake: true,
                    battery_type_id: 'li-ion-18650'
                }
            ];
        },

        loadRealDevices() {
            logDebug('SmartLightStore', 'Загрузка реальных устройств');

            // Здесь будет загрузка реальных устройств
            // store.devices.push(...realDevices);
        },

        forceSleep(deviceId) {
            logDebug('SmartLightStore', 'Перевод в спящий режим', { deviceId });

            return new Promise(resolve => {
                setTimeout(() => {
                    const device = store.getDevice(deviceId);
                    if (device) {
                        device.status = 'SLEEPING';
                        resolve({ success: true });
                    } else {
                        resolve({ success: false, message: 'Устройство не найдено' });
                    }
                }, 200);
            });
        },

        wakeDevice(deviceId) {
            logDebug('SmartLightStore', 'Пробуждение устройства', { deviceId });

            return new Promise(resolve => {
                setTimeout(() => {
                    const device = store.getDevice(deviceId);
                    if (device) {
                        device.status = 'ON';
                        resolve({ success: true });
                    } else {
                        resolve({ success: false, message: 'Устройство не найдено' });
                    }
                }, 200);
            });
        },

        sendCommand(deviceId, command, intensity) {
            logDebug('SmartLightStore', 'Отправка команды', {
                deviceId,
                command,
                intensity
            });

            return new Promise(resolve => {
                setTimeout(() => {
                    const device = store.getDevice(deviceId);
                    if (device) {
                        device.status = command;
                        device.intensity = intensity;
                        resolve({ success: true });
                    } else {
                        resolve({ success: false, message: 'Устройство не найдено' });
                    }
                }, 200);
            });
        }
    });

    return store;
};

// Создаем и инициализируем Store
const smartLightStore = createSmartLightStore();
smartLightStore.init();

// Экспортируем Store
export const useSmartLightStore = () => {
    return smartLightStore;
};

import {getBatteryTypeByIdStore} from "@components/SmartLight/stores/smartlight/types/batteryTypes.js";

/**
 * ============================================================================
 * BULB TYPES — ТИПЫ ЛАМП (ПОЛНАЯ ВЕРСИЯ)
 * ============================================================================
 * 📁 Путь: stores/smartlight/types/bulbTypes.js
 * ✅ Используется: typesStore, BulbRenderer, PowerService
 * ============================================================================
 */

export const BULB_TYPES = {
    'classic': {
        id: 'classic',
        name: 'Классическая',
        category: 'incandescent',
        shape: 'pear',
        baseType: 'E27',
        nominalVoltage: 3.7,
        minVoltage: 2.5,
        maxVoltage: 4.3,
        minIntensity: 0,
        maxIntensity: 100,
        nominalIntensity: 100,
        colorTemperature: 2700,
        lightEfficiency: 10,
        filamentMaterial: 'tungsten',
        lifespan: 1000,
        dimensions: { height: 120, width: 80, unit: 'px' },
        visualFeatures: {
            glass: {
                shape: 'pear',
                thickness: 0.5,
                baseColor: '#ffffff',
                activeColor: '#ffffcc',
                criticalColor: '#ff9800',
                offColor: '#e6e6e6',
                glassOpacity: 0.8,
                transmission: 0.9,
                roughness: 0.1,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1
            },
            filament: {
                visible: true,
                color: '#ffff00',
                glow: true,
                glowIntensity: 0.8,
                rotation: true,
                rotationSpeed: 0.003,
                supportInner: true
            },
            light: {
                type: 'point',
                color: '#ffffcc',
                intensity: 1,
                distance: 10,
                decay: 2,
                castShadow: true
            },
            base: {
                material: 'metal',
                color: '#444444',
                threading: true
            },
            effects: {
                fluid: false,
                heatDistortion: true,
                glow: true,
                rotation: true
            }
        },
        groupSupport: {
            enabled: false,
            maxCount: 1,
            configuration: []
        },
        powerManagement: {
            sharedPowerSource: true,
            controllerRuntime: 86400,
            minControllerVoltage: 2.5,
            powerManagementMode: 'conservative'
        }
    },
    'led': {
        id: 'led',
        name: 'LED',
        category: 'led',
        shape: 'round',
        baseType: 'E27',
        nominalVoltage: 3.7,
        minVoltage: 2.5,
        maxVoltage: 4.3,
        minIntensity: 10,
        maxIntensity: 100,
        nominalIntensity: 100,
        colorTemperature: 4000,
        colorRange: { min: 2700, max: 6500 },
        lightEfficiency: 80,
        filamentMaterial: 'semiconductor',
        lifespan: 25000,
        dimensions: { height: 100, width: 70, unit: 'px' },
        visualFeatures: {
            glass: {
                shape: 'round',
                thickness: 0.3,
                baseColor: '#f0f0f0',
                activeColor: '#ffffff',
                criticalColor: '#ff9800',
                offColor: '#e6e6e6',
                glassOpacity: 0.95,
                transmission: 0.8,
                roughness: 0.2,
                clearcoat: 0.8,
                clearcoatRoughness: 0.2
            },
            filament: {
                visible: false,
                ledArray: { count: 8, arrangement: 'circular' },
                glow: true,
                glowIntensity: 0.9,
                rotation: false,
                supportInner: false
            },
            light: {
                type: 'point',
                color: '#ffffff',
                intensity: 1.2,
                distance: 15,
                decay: 1.5,
                castShadow: true
            },
            base: {
                material: 'plastic',
                color: '#333333',
                threading: true
            },
            effects: {
                fluid: false,
                heatDistortion: false,
                glow: true,
                rotation: false,
                flicker: true,
                flickerIntensity: 0.05,
                flickerFrequency: 0.02
            }
        },
        groupSupport: {
            enabled: true,
            maxCount: 10,
            configuration: ['linear', 'circular']
        },
        powerManagement: {
            sharedPowerSource: true,
            controllerRuntime: 86400,
            minControllerVoltage: 2.5,
            powerManagementMode: 'conservative'
        },
        smartFeatures: {
            colorControl: true,
            scheduling: true,
            remoteControl: true,
            energyMonitoring: true,
            voiceControl: true,
            integration: ['smart_home']
        }
    },
    'halogen': {
        id: 'halogen',
        name: 'Галогенная',
        category: 'halogen',
        shape: 'candle',
        baseType: 'E14',
        nominalVoltage: 3.7,
        minVoltage: 2.5,
        maxVoltage: 4.3,
        minIntensity: 20,
        maxIntensity: 100,
        nominalIntensity: 100,
        colorTemperature: 3000,
        lightEfficiency: 15,
        filamentMaterial: 'tungsten_halogen',
        lifespan: 2000,
        dimensions: { height: 100, width: 60, unit: 'px' },
        visualFeatures: {
            glass: {
                shape: 'candle',
                thickness: 0.4,
                baseColor: '#f5f5f5',
                activeColor: '#ffffcc',
                criticalColor: '#ff9800',
                offColor: '#e6e6e6',
                glassOpacity: 0.7,
                transmission: 0.8,
                roughness: 0.15,
                clearcoat: 0.9,
                clearcoatRoughness: 0.15
            },
            filament: {
                visible: true,
                color: '#ffff00',
                glow: true,
                glowIntensity: 0.9,
                rotation: true,
                rotationSpeed: 0.002,
                supportInner: true,
                halogenEffect: true
            },
            light: {
                type: 'point',
                color: '#ffffff',
                intensity: 1.1,
                distance: 12,
                decay: 1.8,
                castShadow: true
            },
            base: {
                material: 'ceramic',
                color: '#666666',
                threading: true
            },
            effects: {
                fluid: false,
                heatDistortion: true,
                glow: true,
                rotation: true,
                halogenEffect: true
            }
        },
        groupSupport: {
            enabled: false,
            maxCount: 1,
            configuration: []
        },
        powerManagement: {
            sharedPowerSource: true,
            controllerRuntime: 72000,
            minControllerVoltage: 2.5,
            powerManagementMode: 'balanced'
        }
    }
};

/**
 * Получает тип лампочки по ID
 */
export const getBulbTypeByIdStore = (bulbTypeId) => {
    return BULB_TYPES[bulbTypeId] || BULB_TYPES.classic;
};

/**
 * Возвращает типы ламп для выпадающего списка
 */
export const getBulbTypesForDropdownStore = () => {
    return Object.entries(BULB_TYPES).map(([id, type]) => ({
        id,
        label: type.name,
        value: id
    }));
};

export default BULB_TYPES;

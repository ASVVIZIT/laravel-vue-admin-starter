/**
 * Данные о типах лампочек
 * Вынесены из стора для улучшения поддержки
 */

export const BULB_TYPES = [
    {
        id: 'classic',
        name: 'Классическая лампочка накаливания',
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
        dimensions: {
            height: 120,
            width: 80,
            unit: 'px'
        },
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
        }
    },
    {
        id: 'led',
        name: 'Современная LED-лампочка',
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
        colorRange: {
            min: 2700,
            max: 6500
        },
        lightEfficiency: 80,
        filamentMaterial: 'semiconductor',
        lifespan: 25000,
        dimensions: {
            height: 100,
            width: 70,
            unit: 'px'
        },
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
                ledArray: {
                    count: 8,
                    arrangement: 'circular'
                },
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
        }
    },
    {
        id: 'halogen',
        name: 'Галогенная лампочка',
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
        filamentMaterial: 'tungsten_halogene',
        lifespan: 2000,
        dimensions: {
            height: 100,
            width: 60,
            unit: 'px'
        },
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
        }
    },
    {
        id: 'smart-led',
        name: 'Умная LED-лампочка',
        category: 'smart-led',
        shape: 'sphere',
        baseType: 'E27',
        nominalVoltage: 3.7,
        minVoltage: 2.5,
        maxVoltage: 4.3,
        minIntensity: 1,
        maxIntensity: 100,
        nominalIntensity: 100,
        colorTemperature: 2700,
        colorRange: {
            min: 2700,
            max: 6500
        },
        lightEfficiency: 90,
        filamentMaterial: 'rgb_led',
        lifespan: 30000,
        dimensions: {
            height: 90,
            width: 90,
            unit: 'px'
        },
        visualFeatures: {
            glass: {
                shape: 'sphere',
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
                ledArray: {
                    count: 12,
                    arrangement: 'circular'
                },
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
                castShadow: true,
                colorTemperature: 2700
            },
            base: {
                material: 'plastic',
                color: '#333333',
                threading: true,
                electronicsVisible: true
            },
            effects: {
                fluid: false,
                heatDistortion: false,
                glow: true,
                rotation: false,
                flicker: true,
                flickerIntensity: 0.03,
                flickerFrequency: 0.01,
                colorTransition: true,
                colorTransitionDuration: 2
            }
        },
        groupSupport: {
            enabled: true,
            maxCount: 15,
            configuration: ['linear', 'grid', 'circular']
        },
        smartFeatures: {
            colorControl: true,
            scheduling: true,
            remoteControl: true,
            energyMonitoring: true,
            voiceControl: true,
            integration: ['smart_home']
        }
    }
];

export const getBulbTypeById = (id) => {
    return BULB_TYPES.find(type => type.id === id);
};

export const getBulbTypeByCategory = (category) => {
    return BULB_TYPES.filter(type => type.category === category);
};

export const getBulbTypeByShape = (shape) => {
    return BULB_TYPES.filter(type => type.shape === shape);
};

/**
 * Возвращает безопасный диапазон интенсивности для типа лампочки
 * @param {string} bulbTypeId - ID типа лампочки
 * @returns {Object} Объект с min и max
 */
export const getSafeIntensityRange = (bulbTypeId) => {
    const bulbType = BULB_TYPES.find(type => type.id === bulbTypeId);

    if (!bulbType) {
        return {
            min: 0,
            max: 100
        };
    }

    return {
        min: bulbType.minIntensity,
        max: bulbType.maxIntensity
    };
};

/**
 * Возвращает данные о лампочке для визуализации
 * @param {Object} bulbType - Тип лампочки
 * @param {Object} device - Данные устройства
 * @returns {Object} Данные для визуализации
 */
export const getBulbVisualData = (bulbType, device) => {
    if (!bulbType) {
        bulbType = BULB_TYPES.find(type => type.id === 'classic');
    }

    return {
        ...bulbType,
        status: device.status,
        intensity: device.intensity,
        colorTemperature: device.color_temperature || bulbType.colorTemperature,
        voltage: device.voltage
    };
};

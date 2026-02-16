/**
 * Типы источников питания
 *
 * Содержит только данные типов источников питания без бизнес-логики
 *
 * @file stores/smartlight/types/powerSupplyTypes.js
 */

export const POWER_SUPPLY_TYPES = {
    'standard': {
        id: 'standard',
        name: 'Стандартный источник',
        category: 'standard',
        description: 'Стандартный источник питания',
        voltageRange: { min: 2.5, max: 4.3, unit: 'V' },
        currentRange: { min: 0, max: 1000, unit: 'mA' },
        powerManagement: {
            sharedPowerSource: true,
            controllerRuntime: 86400,
            minControllerVoltage: 2.5,
            powerManagementMode: 'balanced'
        },
        visualFeatures: {
            connectionStyle: 'straight',
            connectorColor: '#409eff',
            cableColor: '#607d8b',
            glowEffect: false,
            glowColor: '#ffeb3b',
            glowIntensity: 0.3,
            connectionPoint: {
                size: 4,
                color: '#ff5722',
                shape: 'circle'
            }
        }
    },
    'solar': {
        id: 'solar',
        name: 'Солнечная батарея',
        category: 'renewable',
        description: 'Солнечная батарея для автономного питания',
        voltageRange: { min: 2.5, max: 6.0, unit: 'V' },
        currentRange: { min: 0, max: 500, unit: 'mA' },
        powerManagement: {
            sharedPowerSource: true,
            controllerRuntime: 43200,
            minControllerVoltage: 2.5,
            powerManagementMode: 'solar'
        },
        visualFeatures: {
            connectionStyle: 'wavy',
            connectorColor: '#ff9800',
            cableColor: '#9e9e9e',
            glowEffect: true,
            glowColor: '#ffeb3b',
            glowIntensity: 0.8,
            connectionPoint: {
                size: 6,
                color: '#ffeb3b',
                shape: 'hexagon'
            }
        },
        solarFeatures: {
            efficiency: 0.15,
            maxPowerOutput: 5,
            solarPanelSize: { width: 100, height: 60, unit: 'mm' },
            solarPanelMaterial: 'mono-crystalline',
            temperatureCoefficient: -0.004
        }
    },
    'grid': {
        id: 'grid',
        name: 'Сетевой источник',
        category: 'grid',
        description: 'Сетевой источник питания',
        voltageRange: { min: 2.5, max: 4.3, unit: 'V' },
        currentRange: { min: 0, max: 1000, unit: 'mA' },
        powerManagement: {
            sharedPowerSource: true,
            controllerRuntime: 86400,
            minControllerVoltage: 2.5,
            powerManagementMode: 'grid'
        },
        visualFeatures: {
            connectionStyle: 'curved',
            connectorColor: '#2196f3',
            cableColor: '#607d8b',
            glowEffect: true,
            glowColor: '#2196f3',
            glowIntensity: 0.5,
            connectionPoint: {
                size: 5,
                color: '#2196f3',
                shape: 'square'
            }
        },
        gridFeatures: {
            stableVoltage: true,
            ripple: 0.05,
            voltageRegulator: 'linear',
            powerFactor: 0.95,
            efficiency: 0.85
        }
    }
};

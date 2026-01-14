/**
 * Данные о типах аккумуляторов
 * Вынесены из стора для улучшения поддержки
 */

export const BATTERY_TYPES = [
    {
        id: 'li-ion-18650',
        name: 'Li-ion 18650',
        category: 'cylindrical',
        chemistry: 'Li-ion',
        nominalVoltage: 3.7,
        minVoltage: 2.5,
        maxVoltage: 4.2,
        criticalVoltage: 3.0,
        nominalCapacity: 3500,
        dimensions: {
            diameter: 18,
            height: 65,
            unit: 'mm'
        },
        shape: 'cylinder',
        chargeCycles: 500,
        weight: 45,
        energyDensity: 250,
        temperatureRange: {
            min: -20,
            max: 60,
            unit: '°C'
        },
        safetyFeatures: [
            'protection_circuit',
            'thermal_shutdown',
            'pressure_relief_valve'
        ],
        visualFeatures: {
            fluidEffect: true,
            liquidColor: '#67c23a',
            criticalColor: '#f56c6c',
            baseColor: '#ebeef5',
            capColor: '#ffa640',
            liquidPattern: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255, 255, 255, 0.3) 3px, rgba(255, 255, 255, 0.3) 6px',
            criticalThresholdStyle: 'dashed',
            currentLevelStyle: 'solid',
            glowEffect: true,
            glowColor: '#ffd54f',
            glowIntensity: 0.5
        },
        groupSupport: {
            series: true,
            parallel: true,
            series_parallel: true,
            maxInGroup: 10
        },
        groupVisualization: {
            series: {
                spacing: 10,
                connectionStyle: 'curved'
            },
            parallel: {
                spacing: 5,
                connectionStyle: 'straight'
            }
        },
        defaultSettings: {
            voltage: 3.7,
            critical_voltage: 3.0,
            capacity: 3500
        },
        degradation: {
            capacityLossPerCycle: 0.0005,
            voltageLossPerCycle: 0.0001,
            criticalVoltageDrift: 0.00005
        },
        selfDischarge: {
            rate: 5,
            temperatureFactor: 0.1
        }
    },
    {
        id: 'li-ion-21700',
        name: 'Li-ion 21700',
        category: 'cylindrical',
        chemistry: 'Li-ion',
        nominalVoltage: 3.7,
        minVoltage: 2.5,
        maxVoltage: 4.2,
        criticalVoltage: 3.0,
        nominalCapacity: 5000,
        dimensions: {
            diameter: 21,
            height: 70,
            unit: 'mm'
        },
        shape: 'cylinder',
        chargeCycles: 600,
        weight: 60,
        energyDensity: 270,
        temperatureRange: {
            min: -20,
            max: 60,
            unit: '°C'
        },
        safetyFeatures: [
            'protection_circuit',
            'thermal_shutdown',
            'pressure_relief_valve'
        ],
        visualFeatures: {
            fluidEffect: true,
            liquidColor: '#409eff',
            criticalColor: '#f56c6c',
            baseColor: '#ebeef5',
            capColor: '#ffa640',
            liquidPattern: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255, 255, 255, 0.3) 3px, rgba(255, 255, 255, 0.3) 6px',
            criticalThresholdStyle: 'dashed',
            currentLevelStyle: 'solid',
            glowEffect: true,
            glowColor: '#ffd54f',
            glowIntensity: 0.5
        },
        groupSupport: {
            series: true,
            parallel: true,
            series_parallel: true,
            maxInGroup: 8
        },
        groupVisualization: {
            series: {
                spacing: 12,
                connectionStyle: 'curved'
            },
            parallel: {
                spacing: 7,
                connectionStyle: 'straight'
            }
        },
        defaultSettings: {
            voltage: 3.7,
            critical_voltage: 3.0,
            capacity: 5000
        },
        degradation: {
            capacityLossPerCycle: 0.0004,
            voltageLossPerCycle: 0.00008,
            criticalVoltageDrift: 0.00004
        },
        selfDischarge: {
            rate: 4.5,
            temperatureFactor: 0.08
        }
    },
    {
        id: 'li-po',
        name: 'Li-Po',
        category: 'rectangular',
        chemistry: 'Li-polymer',
        nominalVoltage: 3.7,
        minVoltage: 2.8,
        maxVoltage: 4.35,
        criticalVoltage: 3.2,
        nominalCapacity: 2500,
        dimensions: {
            width: 50,
            height: 35,
            depth: 5,
            unit: 'mm'
        },
        shape: 'rectangle',
        chargeCycles: 300,
        weight: 30,
        energyDensity: 200,
        temperatureRange: {
            min: -20,
            max: 60,
            unit: '°C'
        },
        safetyFeatures: [
            'protection_circuit',
            'thermal_shutdown'
        ],
        visualFeatures: {
            fluidEffect: true,
            liquidColor: '#409eff',
            criticalColor: '#f56c6c',
            baseColor: '#f5f7fa',
            capColor: '#ffcc00',
            liquidPattern: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255, 255, 255, 0.3) 3px, rgba(255, 255, 255, 0.3) 6px',
            criticalThresholdStyle: 'dashed',
            currentLevelStyle: 'solid',
            glowEffect: true,
            glowColor: '#ffd54f',
            glowIntensity: 0.5
        },
        groupSupport: {
            series: true,
            parallel: true,
            series_parallel: false,
            maxInGroup: 6
        },
        groupVisualization: {
            series: {
                spacing: 8,
                connectionStyle: 'straight'
            },
            parallel: {
                spacing: 4,
                connectionStyle: 'straight'
            }
        },
        defaultSettings: {
            voltage: 3.7,
            critical_voltage: 3.2,
            capacity: 2500
        },
        degradation: {
            capacityLossPerCycle: 0.0006,
            voltageLossPerCycle: 0.00012,
            criticalVoltageDrift: 0.00006
        },
        selfDischarge: {
            rate: 6,
            temperatureFactor: 0.12
        }
    },
    {
        id: 'lead-acid',
        name: 'Lead-acid',
        category: 'rectangular',
        chemistry: 'Lead-acid',
        nominalVoltage: 12.0,
        minVoltage: 10.5,
        maxVoltage: 14.4,
        criticalVoltage: 11.0,
        nominalCapacity: 50000,
        dimensions: {
            width: 90,
            height: 170,
            depth: 50,
            unit: 'mm'
        },
        shape: 'rectangle',
        chargeCycles: 300,
        weight: 1500,
        energyDensity: 40,
        temperatureRange: {
            min: -20,
            max: 50,
            unit: '°C'
        },
        safetyFeatures: [
            'ventilation',
            'acid_leak_protection'
        ],
        visualFeatures: {
            fluidEffect: true,
            liquidColor: '#67c23a',
            criticalColor: '#f56c6c',
            baseColor: '#ebeef5',
            capColor: '#c0c0c0',
            liquidPattern: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255, 255, 255, 0.3) 3px, rgba(255, 255, 255, 0.3) 6px',
            criticalThresholdStyle: 'dashed',
            currentLevelStyle: 'solid',
            glowEffect: false,
            glowColor: '#ffd54f',
            glowIntensity: 0
        },
        groupSupport: {
            series: true,
            parallel: true,
            series_parallel: true,
            maxInGroup: 4
        },
        groupVisualization: {
            series: {
                spacing: 15,
                connectionStyle: 'straight'
            },
            parallel: {
                spacing: 10,
                connectionStyle: 'straight'
            }
        },
        defaultSettings: {
            voltage: 12.0,
            critical_voltage: 11.0,
            capacity: 50000
        },
        degradation: {
            capacityLossPerCycle: 0.001,
            voltageLossPerCycle: 0.0002,
            criticalVoltageDrift: 0.0001
        },
        selfDischarge: {
            rate: 15,
            temperatureFactor: 0.05
        }
    }
];

export const getBatteryTypeById = (id) => {
    return BATTERY_TYPES.find(type => type.id === id);
};

export const getBatteryTypeByCategory = (category) => {
    return BATTERY_TYPES.filter(type => type.category === category);
};

export const getBatteryTypeByChemistry = (chemistry) => {
    return BATTERY_TYPES.filter(type => type.chemistry === chemistry);
};

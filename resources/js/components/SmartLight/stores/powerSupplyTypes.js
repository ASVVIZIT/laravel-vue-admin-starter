/**
 * Данные об источниках питания
 * Вынесены из стора для улучшения поддержки
 */

export const POWER_SUPPLY_TYPES = [
    {
        id: 'standard-5v',
        name: 'Стандартный источник 5V',
        type: 'standard',
        nominalVoltage: 5.0,
        minVoltage: 4.75,
        maxVoltage: 5.25,
        efficiency: 85,
        maxOutputCurrent: 2.0,
        ripple: 50,
        temperatureRange: {
            min: 0,
            max: 40,
            unit: '°C'
        },
        dimensions: {
            width: 50,
            height: 30,
            depth: 25,
            unit: 'mm'
        },
        visualFeatures: {
            fluidEffect: false,
            glowEffect: true,
            glowColor: '#409eff',
            glowIntensity: 0.6,
            connectionStyle: 'standard',
            connectionColor: '#409eff',
            connectionThickness: 1.5
        },
        groupSupport: {
            series: false,
            parallel: true,
            maxInGroup: 2
        }
    },
    {
        id: 'solar-charger',
        name: 'Солнечная зарядка',
        type: 'solar',
        nominalVoltage: 3.7,
        minVoltage: 3.0,
        maxVoltage: 4.4,
        efficiency: 70,
        maxOutputCurrent: 1.5,
        ripple: 100,
        temperatureRange: {
            min: -20,
            max: 60,
            unit: '°C'
        },
        dimensions: {
            width: 100,
            height: 80,
            depth: 20,
            unit: 'mm'
        },
        visualFeatures: {
            fluidEffect: true,
            glowEffect: true,
            glowColor: '#ffd54f',
            glowIntensity: 0.4,
            connectionStyle: 'solar',
            connectionColor: '#e6a23c',
            connectionThickness: 2.5
        },
        groupSupport: {
            series: true,
            parallel: true,
            maxInGroup: 5
        }
    },
    {
        id: 'powerbank',
        name: 'Powerbank',
        type: 'powerbank',
        nominalVoltage: 3.7,
        minVoltage: 3.0,
        maxVoltage: 4.2,
        efficiency: 80,
        maxOutputCurrent: 3.0,
        ripple: 30,
        temperatureRange: {
            min: 0,
            max: 40,
            unit: '°C'
        },
        dimensions: {
            width: 90,
            height: 50,
            depth: 20,
            unit: 'mm'
        },
        visualFeatures: {
            fluidEffect: true,
            glowEffect: true,
            glowColor: '#409eff',
            glowIntensity: 0.5,
            connectionStyle: 'powerbank',
            connectionColor: '#409eff',
            connectionThickness: 2.0
        },
        groupSupport: {
            series: false,
            parallel: true,
            maxInGroup: 3
        }
    },
    {
        id: 'ac-adapter',
        name: 'Сетевой адаптер',
        type: 'ac',
        nominalVoltage: 3.7,
        minVoltage: 3.6,
        maxVoltage: 3.8,
        efficiency: 75,
        maxOutputCurrent: 1.0,
        ripple: 20,
        temperatureRange: {
            min: 15,
            max: 35,
            unit: '°C'
        },
        dimensions: {
            width: 40,
            height: 40,
            depth: 20,
            unit: 'mm'
        },
        visualFeatures: {
            fluidEffect: false,
            glowEffect: true,
            glowColor: '#67c23a',
            glowIntensity: 0.7,
            connectionStyle: 'ac-adapter',
            connectionColor: '#67c23a',
            connectionThickness: 1.0
        },
        groupSupport: {
            series: false,
            parallel: false,
            maxInGroup: 1
        }
    },
    {
        id: 'usb-charger',
        name: 'USB-зарядка',
        type: 'usb',
        nominalVoltage: 5.0,
        minVoltage: 4.5,
        maxVoltage: 5.5,
        efficiency: 78,
        maxOutputCurrent: 2.4,
        ripple: 80,
        temperatureRange: {
            min: 0,
            max: 45,
            unit: '°C'
        },
        dimensions: {
            width: 30,
            height: 30,
            depth: 15,
            unit: 'mm'
        },
        visualFeatures: {
            fluidEffect: false,
            glowEffect: true,
            glowColor: '#409eff',
            glowIntensity: 0.5,
            connectionStyle: 'usb',
            connectionColor: '#409eff',
            connectionThickness: 1.5
        },
        groupSupport: {
            series: false,
            parallel: true,
            maxInGroup: 2
        }
    }
];

export const getPowerSupplyById = (id) => {
    return POWER_SUPPLY_TYPES.find(supply => supply.id === id);
};

export const getPowerSupplyByType = (type) => {
    return POWER_SUPPLY_TYPES.filter(supply => supply.type === type);
};

export const calculateEffectiveVoltage = (supplyId, batteryVoltage) => {
    const supply = getPowerSupplyById(supplyId);
    if (!supply) return batteryVoltage;

    // Учитываем падение напряжения на соединениях
    const connectionLoss = 0.1;
    return Math.min(supply.maxVoltage, Math.max(supply.minVoltage, batteryVoltage - connectionLoss));
};

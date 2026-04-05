/**
 * ============================================================================
 * VISUALIZATION CONFIG STORE — КОНФИГУРАЦИИ ВИЗУАЛИЗАЦИИ
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useVisualizationConfigStore = defineStore('smartlight-visualization', () => {
    // === КОНФИГУРАЦИИ БАТАРЕЙ ===
    const batteryTypes = ref([
        {
            id: 'li-ion-18650',
            name: 'Li-Ion 18650',
            elementType: 'battery',
            visualConfig: {
                geometry: {
                    type: 'cylinder',
                    dimensions: { radius: 0.5, height: 4, segments: 32 }
                },
                material: {
                    body: { color: 0xf5f7fa, transparent: true, opacity: 0.25 },
                    fill: { color: 0x67c23a, transparent: true, opacity: 0.9 },
                    cap: { color: 0xffa640, roughness: 0.4, metalness: 0.8 }
                },
                scale: 1.15,
                animation: { rotate: true, speed: 0.01 }
            },
            specs: {
                minVoltage: 2.5,
                maxVoltage: 4.2,
                nominalVoltage: 3.7,
                capacity: 3500
            }
        },
        {
            id: 'li-ion-21700',
            name: 'Li-Ion 21700',
            elementType: 'battery',
            visualConfig: {
                geometry: {
                    type: 'cylinder',
                    dimensions: { radius: 0.55, height: 4.2, segments: 32 }
                },
                material: {
                    body: { color: 0xebeef5, transparent: true, opacity: 0.25 },
                    fill: { color: 0x409eff, transparent: true, opacity: 0.9 },
                    cap: { color: 0xffa640, roughness: 0.4, metalness: 0.8 }
                },
                scale: 1.2,
                animation: { rotate: true, speed: 0.01 }
            },
            specs: {
                minVoltage: 2.5,
                maxVoltage: 4.2,
                nominalVoltage: 3.7,
                capacity: 5000
            }
        },
        {
            id: 'li-po',
            name: 'Li-Po',
            elementType: 'battery',
            visualConfig: {
                geometry: {
                    type: 'box',
                    dimensions: { width: 2.5, height: 0.3, depth: 1.5 }
                },
                material: {
                    body: { color: 0xe8e8e8, transparent: true, opacity: 0.9 },
                    fill: { color: 0x67c23a, transparent: true, opacity: 0.8 },
                    wires: { positive: 0xf56c6c, negative: 0x333333 }
                },
                scale: 1.0,
                animation: { rotate: true, speed: 0.01, pulse: true }
            },
            specs: {
                minVoltage: 3.0,
                maxVoltage: 4.2,
                nominalVoltage: 3.7,
                capacity: 2200
            }
        }
    ]);

    // === КОНФИГУРАЦИИ ЛАМП ===
    const bulbTypes = ref([
        {
            id: 'classic',
            name: 'Лампа накаливания',
            elementType: 'bulb',
            visualConfig: {
                geometry: {
                    type: 'sphere',
                    dimensions: { radius: 0.5, segments: 32 }
                },
                material: {
                    glass: { color: 0xffffff, transparent: true, opacity: 0.4, transmission: 0.9 },
                    filament: { color: 0xffff00, transparent: true, opacity: 0.3 },
                    base: { color: 0x888888, roughness: 0.6, metalness: 0.8 }
                },
                light: {
                    type: 'point',
                    color: 0xffffcc,
                    intensity: 0.8,
                    distance: 10
                },
                scale: 1.5,
                animation: { rotate: true, speed: 0.005 }
            }
        },
        {
            id: 'led',
            name: 'LED лампа',
            elementType: 'bulb',
            visualConfig: {
                geometry: {
                    type: 'hemisphere',
                    dimensions: { radius: 0.5, segments: 32 }
                },
                material: {
                    dome: { color: 0xffffff, transparent: true, opacity: 0.6 },
                    chips: { count: 5, color: 0xffffff, opacity: 0.3 },
                    heatsink: { color: 0xcccccc }
                },
                light: {
                    type: 'point',
                    color: 0xffffff,
                    intensity: 0.8,
                    distance: 10
                },
                scale: 1.5,
                animation: { rotate: true, speed: 0.005 }
            }
        },
        {
            id: 'smart-rgb',
            name: 'Smart RGB',
            elementType: 'bulb',
            visualConfig: {
                geometry: {
                    type: 'hemisphere',
                    dimensions: { radius: 0.5, segments: 32 }
                },
                material: {
                    dome: { color: 0xffffff, transparent: true, opacity: 0.6, clearcoat: 1.0 },
                    chips: { count: 5, colors: [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00] },
                    heatsink: { color: 0xcccccc }
                },
                light: {
                    type: 'point',
                    color: 0xffffff,
                    intensity: 0.8,
                    distance: 10,
                    rgbSupport: true
                },
                scale: 1.5,
                animation: { rotate: true, speed: 0.005 }
            }
        }
    ]);

    // === КОНФИГУРАЦИИ ПИТАНИЯ ===
    const powerTypes = ref([
        {
            id: 'ac-220v',
            name: 'AC 220V',
            elementType: 'power',
            visualConfig: {
                geometry: {
                    type: 'box',
                    dimensions: { width: 1, height: 1.2, depth: 0.3 }
                },
                material: {
                    body: { color: 0xffffff, roughness: 0.5, metalness: 0.3 },
                    holes: { color: 0x333333 },
                    indicator: { color: 0x666666, activeColor: 0x67c23a }
                },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005 }
            }
        },
        {
            id: 'dc-12v',
            name: 'DC 12V',
            elementType: 'power',
            visualConfig: {
                geometry: {
                    type: 'box',
                    dimensions: { width: 1, height: 0.6, depth: 0.4 }
                },
                material: {
                    body: { color: 0x333333, roughness: 0.5, metalness: 0.3 },
                    wires: { positive: 0xf56c6c, negative: 0x333333 },
                    indicator: { color: 0x666666, activeColor: 0x67c23a }
                },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005 }
            }
        },
        {
            id: 'dc-24v',
            name: 'DC 24V',
            elementType: 'power',
            visualConfig: {
                geometry: {
                    type: 'box',
                    dimensions: { width: 1.2, height: 0.7, depth: 0.5 }
                },
                material: {
                    body: { color: 0x2d3436, roughness: 0.5, metalness: 0.4 },
                    terminals: { count: 4, positive: 0xf56c6c, negative: 0x333333 },
                    indicator: { color: 0x666666, activeColor: 0x67c23a },
                    heatsink: { color: 0x999999, fins: 5 }
                },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005 }
            }
        },
        {
            id: 'solar',
            name: 'Solar Panel',
            elementType: 'power',
            visualConfig: {
                geometry: {
                    type: 'box',
                    dimensions: { width: 1.2, height: 0.05, depth: 0.8 }
                },
                material: {
                    panel: { color: 0x1a237e, roughness: 0.3, metalness: 0.5 },
                    cells: { color: 0x283593, count: 6 },
                    sun: { color: 0xff9800, opacity: 0.6 }
                },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005, sunRotate: true }
            }
        }
    ]);

    // === GETTERS ===
    const getBatteryConfig = (typeId) => {
        return batteryTypes.value.find(t => t.id === typeId);
    };

    const getBulbConfig = (typeId) => {
        return bulbTypes.value.find(t => t.id === typeId);
    };

    const getPowerConfig = (typeId) => {
        return powerTypes.value.find(t => t.id === typeId);
    };

    const getVisualConfig = (elementType, typeId) => {
        if (elementType === 'battery') return getBatteryConfig(typeId);
        if (elementType === 'bulb') return getBulbConfig(typeId);
        if (elementType === 'power') return getPowerConfig(typeId);
        return null;
    };

    return {
        // State
        batteryTypes,
        bulbTypes,
        powerTypes,
        // Getters
        getBatteryConfig,
        getBulbConfig,
        getPowerConfig,
        getVisualConfig
    };
});

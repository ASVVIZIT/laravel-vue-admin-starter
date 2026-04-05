/**
 * ============================================================================
 * VISUALIZATION CONFIG STORE — КОНФИГУРАЦИИ ВИЗУАЛИЗАЦИИ
 * ============================================================================
 * 📁 Путь: stores/smartlight/visualizationConfigStore.js
 * ✅ Назначение: Хранение конфигов визуализации для всех типов устройств
 * ✅ Используется: BatteryRenderer, BulbRenderer, PowerSupplyRenderer, UniversalThreeScene
 * ✅ Рефакторинг: геттеры получили суффикс Store(), формат развёрнут для читаемости
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useVisualizationConfigStore = defineStore('smartlight-visualization', () => {
    // === КОНФИГУРАЦИИ БАТАРЕЙ ===
    const batteryTypes = ref([
        {
            id: 'li-ion-18650',
            name: 'Li-Ion 18650',
            shortName: '18650',
            elementType: 'battery',
            visualConfig: {
                geometry: { type: 'cylinder', dimensions: { radius: 0.5, height: 4, segments: 32 } },
                material: { body: { color: 0xf5f7fa, transparent: true, opacity: 0.25, roughness: 0.1 }, fill: { color: 0x67c23a, transparent: true, opacity: 0.9 }, cap: { color: 0xffa640, roughness: 0.4, metalness: 0.8 } },
                colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
                scale: 1.15,
                animation: { rotate: true, speed: 0.01 }
            },
            specs: { minVoltage: 2.5, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 3500, chemistry: 'li-ion' },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/Battery18650Svg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/Battery18650Three.vue')
            }
        },
        {
            id: 'li-ion-21700',
            name: 'Li-Ion 21700',
            shortName: '21700',
            elementType: 'battery',
            visualConfig: {
                geometry: { type: 'cylinder', dimensions: { radius: 0.55, height: 4.2, segments: 32 } },
                material: { body: { color: 0xebeef5, transparent: true, opacity: 0.25, roughness: 0.1 }, fill: { color: 0x409eff, transparent: true, opacity: 0.9 }, cap: { color: 0xffa640, roughness: 0.4, metalness: 0.8 } },
                colors: { normal: 0x409eff, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
                scale: 1.2,
                animation: { rotate: true, speed: 0.01 }
            },
            specs: { minVoltage: 2.5, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 5000, chemistry: 'li-ion' },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/Battery21700Svg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/Battery21700Three.vue')
            }
        },
        {
            id: 'li-po',
            name: 'Li-Po',
            shortName: 'Li-Po',
            elementType: 'battery',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 2.5, height: 0.3, depth: 1.5 } },
                material: { body: { color: 0xe8e8e8, transparent: true, opacity: 0.9, roughness: 0.3 }, fill: { color: 0x67c23a, transparent: true, opacity: 0.8 }, wires: { positive: 0xf56c6c, negative: 0x333333 } },
                colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
                scale: 1.0,
                animation: { rotate: true, speed: 0.01, pulse: true }
            },
            specs: { minVoltage: 3.0, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 2200, chemistry: 'li-po' },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryLiPoSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryLiPoThree.vue')
            }
        }
    ]);

    // === КОНФИГУРАЦИИ ЛАМП ===
    const bulbTypes = ref([
        {
            id: 'classic',
            name: 'Лампа накаливания',
            shortName: 'Classic',
            elementType: 'bulb',
            visualConfig: {
                geometry: { type: 'sphere', dimensions: { radius: 0.5, segments: 32 } },
                material: { glass: { color: 0xffffff, transparent: true, opacity: 0.4, roughness: 0.1, clearcoat: 1.0 }, filament: { color: 0xffff00, transparent: true, opacity: 0.3 }, base: { color: 0x888888, roughness: 0.6, metalness: 0.8 } },
                light: { type: 'point', color: 0xffffcc, intensity: 0.8, distance: 10 },
                colors: { on: 0xffff00, sleeping: 0xff9800, off: 0x666666, error: 0xf56c6c },
                scale: 1.5,
                animation: { rotate: true, speed: 0.005 }
            },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbClassicSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbClassicThree.vue')
            }
        },
        {
            id: 'led',
            name: 'LED лампа',
            shortName: 'LED',
            elementType: 'bulb',
            visualConfig: {
                geometry: { type: 'hemisphere', dimensions: { radius: 0.5, segments: 32 } },
                material: { dome: { color: 0xffffff, transparent: true, opacity: 0.6, roughness: 0.2 }, chips: { count: 5, color: 0xffffff, opacity: 0.3 }, heatsink: { color: 0xcccccc }, base: { color: 0xffffff } },
                light: { type: 'point', color: 0xffffff, intensity: 0.8, distance: 10 },
                colors: { on: 0xffffff, sleeping: 0xff9800, off: 0x666666, error: 0xf56c6c },
                scale: 1.5,
                animation: { rotate: true, speed: 0.005 }
            },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbLedSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbLedThree.vue')
            }
        },
        {
            id: 'smart-rgb',
            name: 'Smart RGB',
            shortName: 'RGB',
            elementType: 'bulb',
            visualConfig: {
                geometry: { type: 'hemisphere', dimensions: { radius: 0.5, segments: 32 } },
                material: { dome: { color: 0xffffff, transparent: true, opacity: 0.6, clearcoat: 1.0 }, chips: { count: 5, colors: [0xff0000, 0x00ff00, 0x0000ff], opacity: 0.3 }, heatsink: { color: 0xcccccc }, base: { color: 0xffffff } },
                light: { type: 'point', color: 0xffffff, intensity: 0.8, distance: 10, rgbSupport: true },
                colors: { on: 0xffffff, sleeping: 0xff9800, off: 0x666666, error: 0xf56c6c },
                scale: 1.5,
                animation: { rotate: true, speed: 0.005 }
            },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbSmartRgbSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbSmartRgbThree.vue')
            }
        }
    ]);

    // === КОНФИГУРАЦИИ ПИТАНИЯ ===
    const powerTypes = ref([
        {
            id: 'ac-220v',
            name: 'AC 220V',
            shortName: 'AC 220V',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 1, height: 1.2, depth: 0.3 } },
                material: { body: { color: 0xffffff, roughness: 0.5, metalness: 0.3 }, holes: { color: 0x333333 }, indicator: { color: 0x666666, activeColor: 0x67c23a } },
                colors: { on: 0x67c23a, off: 0x909399, error: 0xf56c6c },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005 }
            },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerAc220vSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerAc220vThree.vue')
            }
        },
        {
            id: 'dc-12v',
            name: 'DC 12V',
            shortName: 'DC 12V',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 1, height: 0.6, depth: 0.4 } },
                material: { body: { color: 0x333333, roughness: 0.5, metalness: 0.3 }, wires: { positive: 0xf56c6c, negative: 0x333333 }, indicator: { color: 0x666666, activeColor: 0x67c23a } },
                colors: { on: 0x67c23a, off: 0x909399, error: 0xf56c6c },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005 }
            },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerDc12vSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerDc12vThree.vue')
            }
        },
        {
            id: 'dc-24v',
            name: 'DC 24V',
            shortName: 'DC 24V',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 1.2, height: 0.7, depth: 0.5 } },
                material: { body: { color: 0x2d3436, roughness: 0.5, metalness: 0.4 }, terminals: { count: 4, positive: 0xf56c6c, negative: 0x333333 }, indicator: { color: 0x666666, activeColor: 0x67c23a } },
                colors: { on: 0x67c23a, off: 0x909399, error: 0xf56c6c },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005 }
            },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerDc24vSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerDc24vThree.vue')
            }
        },
        {
            id: 'solar',
            name: 'Solar Panel',
            shortName: 'Solar',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 1.2, height: 0.05, depth: 0.8 } },
                material: { panel: { color: 0x1a237e, roughness: 0.3, metalness: 0.5 }, cells: { color: 0x283593, count: 6 }, sun: { color: 0xff9800, opacity: 0.6 } },
                colors: { on: 0xff9800, off: 0x909399, error: 0xf56c6c },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005, sunRotate: true }
            },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerSolarSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerSolarThree.vue')
            }
        }
    ]);

    // === GETTERS (с суффиксом Store) ===
    const getBatteryConfigStore = (typeId) => batteryTypes.value.find(t => t.id === typeId);
    const getBulbConfigStore = (typeId) => bulbTypes.value.find(t => t.id === typeId);
    const getPowerConfigStore = (typeId) => powerTypes.value.find(t => t.id === typeId);

    const getVisualConfigStore = (elementType, typeId) => {
        if (elementType === 'battery') return getBatteryConfigStore(typeId);
        if (elementType === 'bulb') return getBulbConfigStore(typeId);
        if (elementType === 'power') return getPowerConfigStore(typeId);
        return null;
    };

    const getVueComponentStore = (elementType, typeId, mode) => {
        const config = getVisualConfigStore(elementType, typeId);
        if (!config?.vueComponents) return null;
        return mode === '3d' ? config.vueComponents.three : config.vueComponents.svg;
    };

    return {
        batteryTypes,
        bulbTypes,
        powerTypes,
        getBatteryConfigStore,
        getBulbConfigStore,
        getPowerConfigStore,
        getVisualConfigStore,
        getVueComponentStore
    };
});

export default useVisualizationConfigStore;

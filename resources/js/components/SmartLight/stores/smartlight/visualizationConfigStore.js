/**
 * ============================================================================
 * VISUALIZATION CONFIG STORE — РАСШИРЕННЫЕ КОНФИГУРАЦИИ ВИЗУАЛИЗАЦИИ
 * ============================================================================
 * 📁 Путь: stores/smartlight/visualizationConfigStore.js
 * ✅ Назначение: Единый источник истины для ВСЕХ типов визуализации
 * ✅ Расширено: добавлены щелочные, свинцовые, специализированные типы
 * ✅ Используется: Все рендереры + UniversalThreeScene
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useVisualizationConfigStore = defineStore('smartlight-visualization', () => {
    // ========================================================================
    // БАТАРЕИ — РАСШИРЕННЫЙ СПИСОК
    // ========================================================================
    const batteryTypes = ref([
        // === Li-Ion цилиндрические ===
        {
            id: 'li-ion-18650',
            name: 'Li-Ion 18650',
            shortName: '18650',
            elementType: 'battery',
            visualConfig: {
                geometry: { type: 'cylinder', dimensions: { radius: 0.5, height: 4, segments: 32 } },
                material: {
                    body: { color: 0xf5f7fa, transparent: true, opacity: 0.25, roughness: 0.1 },
                    fill: { color: 0x67c23a, transparent: true, opacity: 0.9 },
                    cap: { color: 0xffa640, roughness: 0.4, metalness: 0.8 }
                },
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
                material: {
                    body: { color: 0xebeef5, transparent: true, opacity: 0.25, roughness: 0.1 },
                    fill: { color: 0x409eff, transparent: true, opacity: 0.9 },
                    cap: { color: 0xffa640, roughness: 0.4, metalness: 0.8 }
                },
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
                material: {
                    body: { color: 0xe8e8e8, transparent: true, opacity: 0.9, roughness: 0.3 },
                    fill: { color: 0x67c23a, transparent: true, opacity: 0.8 },
                    wires: { positive: 0xf56c6c, negative: 0x333333 }
                },
                colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
                scale: 1.0,
                animation: { rotate: true, speed: 0.01, pulse: true }
            },
            specs: { minVoltage: 3.0, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 2200, chemistry: 'li-po' },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryLiPoSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryLiPoThree.vue')
            }
        },
        // === Алкалиновые (одноразовые) ===
        {
            id: 'alkaline-aa',
            name: 'Алкалиновая AA',
            shortName: 'AA',
            elementType: 'battery',
            visualConfig: {
                geometry: { type: 'cylinder', dimensions: { radius: 0.4, height: 3.5, segments: 24 } },
                material: {
                    body: { color: 0xffffff, transparent: false, opacity: 1.0, roughness: 0.2 },
                    fill: { color: 0x909399, transparent: true, opacity: 0.5 },
                    cap: { color: 0xc0c4cc, roughness: 0.5, metalness: 0.3 }
                },
                colors: { normal: 0x909399, warning: 0xe6a23c, critical: 0xf56c6c, off: 0xc0c4cc },
                scale: 1.0,
                animation: { rotate: false }
            },
            specs: { minVoltage: 0.9, maxVoltage: 1.5, nominalVoltage: 1.5, capacity: 2800, chemistry: 'alkaline' },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryCylindricalSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryAAThree.vue')
            }
        },
        {
            id: 'alkaline-aaa',
            name: 'Алкалиновая AAA',
            shortName: 'AAA',
            elementType: 'battery',
            visualConfig: {
                geometry: { type: 'cylinder', dimensions: { radius: 0.3, height: 3.0, segments: 24 } },
                material: {
                    body: { color: 0xffffff, transparent: false, opacity: 1.0, roughness: 0.2 },
                    fill: { color: 0x909399, transparent: true, opacity: 0.5 },
                    cap: { color: 0xc0c4cc, roughness: 0.5, metalness: 0.3 }
                },
                colors: { normal: 0x909399, warning: 0xe6a23c, critical: 0xf56c6c, off: 0xc0c4cc },
                scale: 0.85,
                animation: { rotate: false }
            },
            specs: { minVoltage: 0.9, maxVoltage: 1.5, nominalVoltage: 1.5, capacity: 1200, chemistry: 'alkaline' },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryCylindricalSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryAAAThree.vue')
            }
        },
        // === Ni-MH перезаряжаемые ===
        {
            id: 'ni-mh-aa',
            name: 'Ni-MH AA',
            shortName: 'NiMH',
            elementType: 'battery',
            visualConfig: {
                geometry: { type: 'cylinder', dimensions: { radius: 0.4, height: 3.5, segments: 24 } },
                material: {
                    body: { color: 0xe6a23c, transparent: false, opacity: 1.0, roughness: 0.3 },
                    fill: { color: 0xf56c6c, transparent: true, opacity: 0.6 },
                    cap: { color: 0x909399, roughness: 0.4, metalness: 0.5 }
                },
                colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0xc0c4cc },
                scale: 1.0,
                animation: { rotate: false }
            },
            specs: { minVoltage: 1.0, maxVoltage: 1.4, nominalVoltage: 1.2, capacity: 2000, chemistry: 'ni-mh' },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryCylindricalSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryAAThree.vue')
            }
        },
        // === Свинцово-кислотные ===
        {
            id: 'lead-acid-12v',
            name: 'Свинцово-кислотная 12В',
            shortName: 'Pb-12V',
            elementType: 'battery',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 3.0, height: 1.5, depth: 2.0 } },
                material: {
                    body: { color: 0x333333, transparent: false, opacity: 1.0, roughness: 0.6 },
                    fill: { color: 0x1a237e, transparent: true, opacity: 0.7 },
                    terminals: { positive: 0xf56c6c, negative: 0x333333 }
                },
                colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
                scale: 0.9,
                animation: { rotate: false }
            },
            specs: { minVoltage: 10.5, maxVoltage: 14.4, nominalVoltage: 12.0, capacity: 7000, chemistry: 'lead-acid' },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryLeadAcidSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryLeadAcidThree.vue')
            }
        },
        // === Призматические (LiFePO4 и др.) ===
        {
            id: 'li-fe-po4',
            name: 'LiFePO4 32650',
            shortName: 'LiFePO4',
            elementType: 'battery',
            visualConfig: {
                geometry: { type: 'cylinder', dimensions: { radius: 0.6, height: 4.5, segments: 32 } },
                material: {
                    body: { color: 0x4caf50, transparent: true, opacity: 0.3, roughness: 0.2 },
                    fill: { color: 0x81c784, transparent: true, opacity: 0.9 },
                    cap: { color: 0xffa640, roughness: 0.4, metalness: 0.8 }
                },
                colors: { normal: 0x4caf50, warning: 0xff9800, critical: 0xf44336, off: 0x9e9e9e },
                scale: 1.25,
                animation: { rotate: true, speed: 0.008 }
            },
            specs: { minVoltage: 2.0, maxVoltage: 3.65, nominalVoltage: 3.2, capacity: 6000, chemistry: 'li-fe-po4' },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryPrismaticSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryPrismaticThree.vue')
            }
        }
    ]);

    // ========================================================================
    // ЛАМПЫ — РАСШИРЕННЫЙ СПИСОК
    // ========================================================================
    const bulbTypes = ref([
        {
            id: 'classic',
            name: 'Лампа накаливания',
            shortName: 'Classic',
            elementType: 'bulb',
            visualConfig: {
                geometry: { type: 'sphere', dimensions: { radius: 0.5, segments: 32 } },
                material: {
                    glass: { color: 0xffffff, transparent: true, opacity: 0.4, roughness: 0.1, clearcoat: 1.0 },
                    filament: { color: 0xffff00, transparent: true, opacity: 0.3 },
                    base: { color: 0x888888, roughness: 0.6, metalness: 0.8 }
                },
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
                material: {
                    dome: { color: 0xffffff, transparent: true, opacity: 0.6, roughness: 0.2 },
                    chips: { count: 5, color: 0xffffff, opacity: 0.3 },
                    heatsink: { color: 0xcccccc },
                    base: { color: 0xffffff }
                },
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
                material: {
                    dome: { color: 0xffffff, transparent: true, opacity: 0.6, clearcoat: 1.0 },
                    chips: { count: 5, colors: [0xff0000, 0x00ff00, 0x0000ff], opacity: 0.3 },
                    heatsink: { color: 0xcccccc },
                    base: { color: 0xffffff }
                },
                light: { type: 'point', color: 0xffffff, intensity: 0.8, distance: 10, rgbSupport: true },
                colors: { on: 0xffffff, sleeping: 0xff9800, off: 0x666666, error: 0xf56c6c },
                scale: 1.5,
                animation: { rotate: true, speed: 0.005 }
            },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbSmartRgbSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbSmartRgbThree.vue')
            }
        },
        {
            id: 'halogen',
            name: 'Галогенная',
            shortName: 'Halogen',
            elementType: 'bulb',
            visualConfig: {
                geometry: { type: 'capsule', dimensions: { radius: 0.3, length: 1.0, segments: 24 } },
                material: {
                    glass: { color: 0xffeb3b, transparent: true, opacity: 0.5, roughness: 0.1 },
                    filament: { color: 0xff9800, transparent: true, opacity: 0.8 },
                    base: { color: 0x666666, roughness: 0.7, metalness: 0.6 }
                },
                light: { type: 'point', color: 0xffecb3, intensity: 1.0, distance: 8 },
                colors: { on: 0xff9800, sleeping: 0xffb74d, off: 0x9e9e9e, error: 0xf44336 },
                scale: 1.3,
                animation: { rotate: true, speed: 0.003 }
            },
            specs: { efficiency: 15, colorTemp: 3000, lifespan: 2000 },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbHalogenSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbHalogenThree.vue')
            }
        },
        {
            id: 'cfl',
            name: 'Компактная люминесцентная',
            shortName: 'CFL',
            elementType: 'bulb',
            visualConfig: {
                geometry: { type: 'torus', dimensions: { radius: 0.4, tube: 0.1, segments: 32 } },
                material: {
                    glass: { color: 0xe3f2fd, transparent: true, opacity: 0.7, roughness: 0.2 },
                    base: { color: 0x90a4ae, roughness: 0.5, metalness: 0.4 }
                },
                light: { type: 'point', color: 0xe1f5fe, intensity: 0.9, distance: 12 },
                colors: { on: 0x81d4fa, sleeping: 0xb3e5fc, off: 0xb0bec5, error: 0xef5350 },
                scale: 1.4,
                animation: { rotate: false }
            },
            specs: { efficiency: 60, colorTemp: 4000, lifespan: 8000 },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbCflSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbCflThree.vue')
            }
        },
        {
            id: 'led-strip',
            name: 'LED лента',
            shortName: 'LED Strip',
            elementType: 'bulb',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 2.0, height: 0.1, depth: 0.2 } },
                material: {
                    strip: { color: 0xf5f5f5, roughness: 0.3, metalness: 0.2 },
                    chips: { count: 10, color: 0xffeb3b, opacity: 0.9 }
                },
                light: { type: 'point', color: 0xffeb3b, intensity: 0.7, distance: 5 },
                colors: { on: 0xffeb3b, sleeping: 0xffcc80, off: 0xbdbdbd, error: 0xef5350 },
                scale: 1.0,
                animation: { rotate: false }
            },
            specs: { efficiency: 85, colorTemp: 3000, lifespan: 25000 },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbLedStripSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbLedStripThree.vue')
            }
        },
        {
            id: 'tube',
            name: 'Трубчатая лампа',
            shortName: 'Tube',
            elementType: 'bulb',
            visualConfig: {
                geometry: { type: 'cylinder', dimensions: { radius: 0.15, height: 3.0, segments: 16 } },
                material: {
                    glass: { color: 0xe3f2fd, transparent: true, opacity: 0.8, roughness: 0.1 },
                    base: { color: 0x90a4ae, roughness: 0.5, metalness: 0.4 }
                },
                light: { type: 'point', color: 0xe1f5fe, intensity: 0.9, distance: 15 },
                colors: { on: 0x81d4fa, sleeping: 0xb3e5fc, off: 0xb0bec5, error: 0xef5350 },
                scale: 1.2,
                animation: { rotate: false }
            },
            specs: { efficiency: 70, colorTemp: 4000, lifespan: 15000 },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbTubeSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbTubeThree.vue')
            }
        }
    ]);

    // ========================================================================
    // ИСТОЧНИКИ ПИТАНИЯ — ПОЛНЫЙ СПИСОК
    // ========================================================================
    const powerSupplyTypes = ref([
        {
            id: 'standard',
            name: 'Стандартный источник',
            shortName: 'Standard',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 1, height: 0.8, depth: 0.5 } },
                material: {
                    body: { color: 0xffffff, roughness: 0.5, metalness: 0.3 },
                    indicator: { color: 0x666666, activeColor: 0x67c23a }
                },
                colors: { on: 0x67c23a, off: 0x909399, error: 0xf56c6c },
                scale: 1.0,
                animation: { rotate: false }
            },
            specs: { voltageRange: { min: 2.5, max: 4.3 }, currentRange: { min: 0, max: 1000 } },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerStandardSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerStandardThree.vue')
            }
        },
        {
            id: 'ac-220v',
            name: 'AC 220V',
            shortName: 'AC 220V',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 1, height: 1.2, depth: 0.3 } },
                material: {
                    body: { color: 0xffffff, roughness: 0.5, metalness: 0.3 },
                    holes: { color: 0x333333 },
                    indicator: { color: 0x666666, activeColor: 0x67c23a }
                },
                colors: { on: 0x67c23a, off: 0x909399, error: 0xf56c6c },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005 }
            },
            specs: { voltageRange: { min: 198, max: 242 }, frequency: 50 },
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
                material: {
                    body: { color: 0x333333, roughness: 0.5, metalness: 0.3 },
                    wires: { positive: 0xf56c6c, negative: 0x333333 },
                    indicator: { color: 0x666666, activeColor: 0x67c23a }
                },
                colors: { on: 0x67c23a, off: 0x909399, error: 0xf56c6c },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005 }
            },
            specs: { voltageRange: { min: 10.5, max: 14.4 }, currentRange: { min: 0, max: 5000 } },
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
                material: {
                    body: { color: 0x2d3436, roughness: 0.5, metalness: 0.4 },
                    terminals: { count: 4, positive: 0xf56c6c, negative: 0x333333 },
                    indicator: { color: 0x666666, activeColor: 0x67c23a }
                },
                colors: { on: 0x67c23a, off: 0x909399, error: 0xf56c6c },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005 }
            },
            specs: { voltageRange: { min: 20.0, max: 30.0 }, currentRange: { min: 0, max: 3000 } },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerDc24vSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerDc24vThree.vue')
            }
        },
        {
            id: 'solar',
            name: 'Солнечная панель',
            shortName: 'Solar',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 1.2, height: 0.05, depth: 0.8 } },
                material: {
                    panel: { color: 0x1a237e, roughness: 0.3, metalness: 0.5 },
                    cells: { color: 0x283593, count: 6 },
                    sun: { color: 0xff9800, opacity: 0.6 }
                },
                colors: { on: 0xff9800, off: 0x909399, error: 0xf56c6c },
                scale: 1.0,
                animation: { rotate: true, speed: 0.005, sunRotate: true }
            },
            specs: { voltageRange: { min: 2.5, max: 6.0 }, currentRange: { min: 0, max: 500 } },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerSolarSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerSolarThree.vue')
            }
        },
        {
            id: 'usb-5v',
            name: 'USB 5V',
            shortName: 'USB',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 0.8, height: 0.3, depth: 0.4 } },
                material: {
                    body: { color: 0x2196f3, roughness: 0.4, metalness: 0.6 },
                    connector: { color: 0x90a4ae, roughness: 0.3, metalness: 0.9 },
                    indicator: { color: 0x666666, activeColor: 0x4caf50 }
                },
                colors: { on: 0x4caf50, off: 0x90a4ae, error: 0xf44336 },
                scale: 0.9,
                animation: { rotate: false }
            },
            specs: { voltageRange: { min: 4.5, max: 5.5 }, currentRange: { min: 0, max: 2000 } },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerUsb5vSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerUsb5vThree.vue')
            }
        },
        {
            id: 'battery-pack',
            name: 'Батарейный отсек',
            shortName: 'Pack',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 2.0, height: 0.6, depth: 1.0 } },
                material: {
                    body: { color: 0x424242, roughness: 0.6, metalness: 0.2 },
                    slots: { count: 4, color: 0x757575 },
                    indicator: { color: 0x666666, activeColor: 0xff9800 }
                },
                colors: { on: 0xff9800, off: 0x757575, error: 0xf44336 },
                scale: 1.1,
                animation: { rotate: false }
            },
            specs: { voltageRange: { min: 1.5, max: 12.0 }, currentRange: { min: 0, max: 3000 } },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerBatteryPackSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerBatteryPackThree.vue')
            }
        },
        {
            id: 'generator',
            name: 'Бензогенератор',
            shortName: 'Generator',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 1.5, height: 1.0, depth: 0.8 } },
                material: {
                    body: { color: 0x455a64, roughness: 0.6, metalness: 0.7 },
                    exhaust: { color: 0x37474f },
                    indicator: { color: 0x666666, activeColor: 0x4caf50 }
                },
                colors: { on: 0x4caf50, off: 0x90a4ae, error: 0xf44336 },
                scale: 1.0,
                animation: { rotate: false, pulse: true }
            },
            specs: { voltageRange: { min: 180, max: 240 }, currentRange: { min: 0, max: 10000 } },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerGeneratorSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerGeneratorThree.vue')
            }
        },
        {
            id: 'ups',
            name: 'Источник бесперебойного питания',
            shortName: 'UPS',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 1.5, height: 1.0, depth: 0.8 } },
                material: {
                    body: { color: 0x37474f, roughness: 0.5, metalness: 0.7 },
                    display: { color: 0x00bcd4, emissive: 0x0097a7, emissiveIntensity: 0.5 },
                    vents: { color: 0x263238 }
                },
                colors: { on: 0x00bcd4, off: 0x546e7a, error: 0xef5350 },
                scale: 1.0,
                animation: { rotate: false, pulse: true }
            },
            specs: { voltageRange: { min: 180, max: 260 }, currentRange: { min: 0, max: 5000 } },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerUpsSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerUpsThree.vue')
            }
        },
        {
            id: 'dc-switch',
            name: 'Регулируемый БП',
            shortName: 'DC Switch',
            elementType: 'power',
            visualConfig: {
                geometry: { type: 'box', dimensions: { width: 1.2, height: 0.8, depth: 0.5 } },
                material: {
                    body: { color: 0x424242, roughness: 0.5, metalness: 0.6 },
                    knob: { color: 0x409eff, roughness: 0.3, metalness: 0.8 },
                    scale: { color: 0x909399 }
                },
                colors: { on: 0x67c23a, off: 0x909399, error: 0xf56c6c },
                scale: 1.0,
                animation: { rotate: false }
            },
            specs: {
                voltageOptions: [5, 9, 12, 15, 17, 19, 21],
                defaultVoltage: 12,
                currentRange: { min: 0, max: 3000 }
            },
            vueComponents: {
                svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerDcSwitchSvg.vue'),
                three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerDcSwitchThree.vue')
            }
        }
    ]);

    // ========================================================================
    // GETTERS (универсальные)
    // ========================================================================
    const getBatteryConfigStore = (typeId) => batteryTypes.value.find(t => t.id === typeId);
    const getBulbConfigStore = (typeId) => bulbTypes.value.find(t => t.id === typeId);
    const getPowerSupplyConfigStore = (typeId) => powerSupplyTypes.value.find(t => t.id === typeId);

    const getVisualConfigStore = (elementType, typeId) => {
        switch (elementType) {
            case 'battery': return getBatteryConfigStore(typeId);
            case 'bulb': return getBulbConfigStore(typeId);
            case 'power': return getPowerSupplyConfigStore(typeId);
            default: return null;
        }
    };

    const getVueComponentStore = (elementType, typeId, mode) => {
        const config = getVisualConfigStore(elementType, typeId);
        if (!config?.vueComponents) return null;
        return mode === '3d' ? config.vueComponents.three : config.vueComponents.svg;
    };

    // ========================================================================
    // EXPOSE
    // ========================================================================
    return {
        batteryTypes,
        bulbTypes,
        powerSupplyTypes,
        getBatteryConfigStore,
        getBulbConfigStore,
        getPowerSupplyConfigStore,
        getVisualConfigStore,
        getVueComponentStore
    };
});

export default useVisualizationConfigStore;

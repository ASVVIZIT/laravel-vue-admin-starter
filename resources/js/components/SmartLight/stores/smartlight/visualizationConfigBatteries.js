/**
 * ============================================================================
 * VISUALIZATION CONFIG — BATTERY TYPES (ПОЛНЫЙ)
 * ============================================================================
 * 📁 Путь: stores/smartlight/visualizationConfigBatteries.js
 * ✅ Включает: Li-Ion (все размеры), Alkaline, Ni-MH, Li-Po, LiFePO4, Lead-Acid
 * ============================================================================
 */

export const batteryTypes = [
    // ========================================================================
    // Li-Ion ЦИЛИНДРИЧЕСКИЕ
    // ========================================================================
    {
        id: 'li-ion-10440',
        name: 'Li-Ion 10440 (AAA-формат)',
        shortName: '10440',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.28, h: 3.0, seg: 24 },
            materials: {
                body: { color: 0xe8eaf0, transparent: true, opacity: 0.15, roughness: 0.1, clearcoat: 1 },
                fill: { opacity: 0.9, metalness: 0.2, roughness: 0.3 },
                cap: { color: 0xff9800, metalness: 0.8 },
                ring: { r: 0.01, tubeSeg: 8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
            animation: { rotate: true, speed: 0.008 }
        },
        specs: { minVoltage: 2.5, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 350, chemistry: 'li-ion' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/Battery10440Three.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/Battery10440Svg.vue')
        }
    },
    {
        id: 'li-ion-14500',
        name: 'Li-Ion 14500 (AA-формат, короткий)',
        shortName: '14500',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.38, h: 3.2, seg: 24 },
            materials: {
                body: { color: 0xe8eaf0, transparent: true, opacity: 0.15, roughness: 0.1, clearcoat: 1 },
                fill: { opacity: 0.9, metalness: 0.2, roughness: 0.3 },
                cap: { color: 0xff9800, metalness: 0.8 },
                ring: { r: 0.012, tubeSeg: 8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
            animation: { rotate: true, speed: 0.008 }
        },
        specs: { minVoltage: 2.5, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 900, chemistry: 'li-ion' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/Battery14500Three.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/Battery14500Svg.vue')
        }
    },
    {
        id: 'li-ion-14650',
        name: 'Li-Ion 14650 (AA-формат)',
        shortName: '14650',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.38, h: 4.0, seg: 32 },
            materials: {
                body: { color: 0xe8eaf0, transparent: true, opacity: 0.15, roughness: 0.1, clearcoat: 1 },
                fill: { opacity: 0.9, metalness: 0.2, roughness: 0.3 },
                cap: { color: 0xff9800, metalness: 0.8 },
                ring: { r: 0.012, tubeSeg: 8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
            animation: { rotate: true, speed: 0.008 }
        },
        specs: { minVoltage: 2.5, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 800, chemistry: 'li-ion' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/Battery14650Three.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/Battery14650Svg.vue')
        }
    },
    {
        id: 'li-ion-16340',
        name: 'Li-Ion 16340 (RCR123A)',
        shortName: '16340',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.42, h: 2.2, seg: 24 },
            materials: {
                body: { color: 0xe8eaf0, transparent: true, opacity: 0.15, roughness: 0.1, clearcoat: 1 },
                fill: { opacity: 0.9, metalness: 0.2, roughness: 0.3 },
                cap: { color: 0xff9800, metalness: 0.8 },
                ring: { r: 0.015, tubeSeg: 8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
            animation: { rotate: true, speed: 0.008 }
        },
        specs: { minVoltage: 2.5, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 880, chemistry: 'li-ion' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/Battery16340Three.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/Battery16340Svg.vue')
        }
    },
    {
        id: 'li-ion-18350',
        name: 'Li-Ion 18350 (короткий)',
        shortName: '18350',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.48, h: 2.3, seg: 32 },
            materials: {
                body: { color: 0xe8eaf0, transparent: true, opacity: 0.15, roughness: 0.1, clearcoat: 1 },
                fill: { opacity: 0.9, metalness: 0.2, roughness: 0.3 },
                cap: { color: 0xff9800, metalness: 0.8 },
                ring: { r: 0.015, tubeSeg: 8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
            animation: { rotate: true, speed: 0.008 }
        },
        specs: { minVoltage: 2.5, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 1200, chemistry: 'li-ion' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/Battery18350Three.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/Battery18350Svg.vue')
        }
    },
    {
        id: 'li-ion-18650',
        name: 'Li-Ion 18650',
        shortName: '18650',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.5, h: 4.0, seg: 32 },
            materials: {
                body: { color: 0xf5f7fa, transparent: true, opacity: 0.15, roughness: 0.1, clearcoat: 1 },
                fill: { opacity: 0.9, metalness: 0.2, roughness: 0.3 },
                cap: { color: 0xffa640, metalness: 0.8 },
                ring: { r: 0.02, tubeSeg: 8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
            animation: { rotate: true, speed: 0.008 }
        },
        specs: { minVoltage: 2.5, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 3500, chemistry: 'li-ion' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/Battery18650Three.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/Battery18650Svg.vue')
        }
    },
    {
        id: 'li-ion-21700',
        name: 'Li-Ion 21700',
        shortName: '21700',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.55, h: 4.8, seg: 32 },
            materials: {
                body: { color: 0xebeef5, transparent: true, opacity: 0.15, roughness: 0.1, clearcoat: 1 },
                fill: { opacity: 0.9, metalness: 0.2, roughness: 0.3 },
                cap: { color: 0xffa640, metalness: 0.8 },
                ring: { r: 0.02, tubeSeg: 8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x409eff, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
            animation: { rotate: true, speed: 0.008 }
        },
        specs: { minVoltage: 2.5, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 5000, chemistry: 'li-ion' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/Battery21700Three.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/Battery21700Svg.vue')
        }
    },
    {
        id: 'li-ion-26650',
        name: 'Li-Ion 26650',
        shortName: '26650',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.68, h: 4.2, seg: 32 },
            materials: {
                body: { color: 0xe8eaf0, transparent: true, opacity: 0.15, roughness: 0.1, clearcoat: 1 },
                fill: { opacity: 0.9, metalness: 0.2, roughness: 0.3 },
                cap: { color: 0xff9800, metalness: 0.8 },
                ring: { r: 0.025, tubeSeg: 8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
            animation: { rotate: true, speed: 0.008 }
        },
        specs: { minVoltage: 2.5, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 5500, chemistry: 'li-ion' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/Battery26650Three.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/Battery26650Svg.vue')
        }
    },

    // ========================================================================
    // ЩЕЛОЧНЫЕ (ALAKLINE)
    // ========================================================================
    {
        id: 'alkaline-aa',
        name: 'Алкалиновая AA',
        shortName: 'Alkaline AA',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.45, h: 3.2, seg: 24 },
            materials: {
                body: { color: 0xf5f5f5, transparent: true, opacity: 0.2, roughness: 0.3 },
                fill: { opacity: 0.85 },
                cap: { color: 0xc0c4cc, metalness: 0.4 },
                ring: { r: 0.015, tubeSeg: 8 }
            },
            thresholds: [0.3, 0.6],
            colors: { normal: 0x909399, warning: 0xe6a23c, critical: 0xf56c6c, off: 0xc0c4cc },
            animation: { rotate: false }
        },
        specs: { minVoltage: 0.9, maxVoltage: 1.6, nominalVoltage: 1.5, capacity: 2800, chemistry: 'alkaline' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryAlkalineAaThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryAlkalineAaSvg.vue')
        }
    },
    {
        id: 'alkaline-aaa',
        name: 'Алкалиновая AAA',
        shortName: 'Alkaline AAA',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.32, h: 2.8, seg: 24 },
            materials: {
                body: { color: 0xf5f5f5, transparent: true, opacity: 0.2, roughness: 0.3 },
                fill: { opacity: 0.85 },
                cap: { color: 0xc0c4cc, metalness: 0.4 },
                ring: { r: 0.012, tubeSeg: 8 }
            },
            thresholds: [0.3, 0.6],
            colors: { normal: 0x909399, warning: 0xe6a23c, critical: 0xf56c6c, off: 0xc0c4cc },
            animation: { rotate: false }
        },
        specs: { minVoltage: 0.9, maxVoltage: 1.6, nominalVoltage: 1.5, capacity: 1200, chemistry: 'alkaline' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryAlkalineAaaThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryAlkalineAaaSvg.vue')
        }
    },

    // ========================================================================
    // Ni-MH ПЕРЕЗАРЯЖАЕМЫЕ
    // ========================================================================
    {
        id: 'nimh-aa',
        name: 'Ni-MH AA',
        shortName: 'NiMH AA',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.45, h: 3.2, seg: 24 },
            materials: {
                body: { color: 0xe6f7ea, transparent: true, opacity: 0.15, roughness: 0.2 },
                fill: { opacity: 0.9, color: 0x4caf50 },
                cap: { color: 0x909399, metalness: 0.5 },
                ring: { r: 0.015, tubeSeg: 8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0xc0c4cc },
            animation: { rotate: false }
        },
        specs: { minVoltage: 1.0, maxVoltage: 1.5, nominalVoltage: 1.2, capacity: 2500, chemistry: 'ni-mh' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryNiMhAaThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryNiMhAaSvg.vue')
        }
    },
    {
        id: 'nimh-aaa',
        name: 'Ni-MH AAA',
        shortName: 'NiMH AAA',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.32, h: 2.8, seg: 24 },
            materials: {
                body: { color: 0xe6f7ea, transparent: true, opacity: 0.15, roughness: 0.2 },
                fill: { opacity: 0.9, color: 0x4caf50 },
                cap: { color: 0x909399, metalness: 0.5 },
                ring: { r: 0.012, tubeSeg: 8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0xc0c4cc },
            animation: { rotate: false }
        },
        specs: { minVoltage: 1.0, maxVoltage: 1.5, nominalVoltage: 1.2, capacity: 1100, chemistry: 'ni-mh' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryNiMhAaaThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryNiMhAaaSvg.vue')
        }
    },

    // ========================================================================
    // Li-Po, LiFePO4, Lead-Acid
    // ========================================================================
    {
        id: 'li-po',
        name: 'Li-Po',
        shortName: 'Li-Po',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-box',
            geometry: { w: 2.5, h: 0.4, d: 1.5 },
            materials: {
                body: { color: 0xe8e8e8, transparent: true, opacity: 0.2, roughness: 0.3 },
                fill: { color: 0x67c23a, opacity: 0.9 },
                terminal: { color: 0xf56c6c, metalness: 0.8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
            animation: { rotate: false, pulse: true }
        },
        specs: { minVoltage: 3.0, maxVoltage: 4.2, nominalVoltage: 3.7, capacity: 2200, chemistry: 'li-po' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryLiPoThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryLiPoSvg.vue')
        }
    },
    {
        id: 'li-fe-po4-32650',
        name: 'LiFePO4 32650',
        shortName: 'LiFePO4',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-cylindrical',
            geometry: { r: 0.6, h: 4.8, seg: 32 },
            materials: {
                body: { color: 0x4caf50, transparent: true, opacity: 0.3, roughness: 0.2 },
                fill: { opacity: 0.9 },
                cap: { color: 0xffa640, metalness: 0.8 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x4caf50, warning: 0xff9800, critical: 0xf44336, off: 0x9e9e9e },
            animation: { rotate: true, speed: 0.006 }
        },
        specs: { minVoltage: 2.0, maxVoltage: 3.65, nominalVoltage: 3.2, capacity: 6000, chemistry: 'li-fe-po4' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryLiFePo4Three.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryLiFePo4Svg.vue')
        }
    },
    {
        id: 'lead-acid-12v',
        name: 'Свинцово-кислотная 12В',
        shortName: 'Pb-12V',
        elementType: 'battery',
        visualConfig: {
            type: 'battery-box',
            geometry: { w: 3.0, h: 1.5, d: 2.0 },
            materials: {
                body: { color: 0x333333, transparent: true, opacity: 0.3, roughness: 0.6 },
                fill: { color: 0x1a237e, opacity: 0.8 },
                terminal: { color: 0xf56c6c, metalness: 0.8, roughness: 0.4 }
            },
            thresholds: [0.2, 0.5, 0.8],
            colors: { normal: 0x67c23a, warning: 0xe6a23c, critical: 0xf56c6c, off: 0x909399 },
            animation: { rotate: false }
        },
        specs: { minVoltage: 10.5, maxVoltage: 14.4, nominalVoltage: 12.0, capacity: 7000, chemistry: 'lead-acid' },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/batteries/BatteryLeadAcidThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/batteries/BatteryLeadAcidSvg.vue')
        }
    }
]

export default batteryTypes

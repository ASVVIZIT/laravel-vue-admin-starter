/**
 * ============================================================================
 * VISUALIZATION CONFIG — BULB TYPES
 * ============================================================================
 * 📁 Путь: stores/smartlight/visualizationConfigBulbs.js
 * ✅ Назначение: Конфигурации 3D/SVG визуализации для всех типов ламп
 * ✅ Расширение: Добавить новый тип = добавить объект в массив
 * ============================================================================
 */

/**
 * @typedef {Object} BulbVisualConfig
 * @property {string} type - Идентификатор типа для базового компонента
 * @property {Object} geometry - Параметры геометрии
 * @property {Object} materials - Параметры материалов
 * @property {Object} colors - Цвета для статусов
 * @property {Object} light - Параметры источника света
 * @property {Object} animation - Параметры анимации
 */

/**
 * @type {Array<Object>}
 */
export const bulbTypes = [
    {
        id: 'classic',
        name: 'Лампа накаливания',
        shortName: 'Classic',
        elementType: 'bulb',
        visualConfig: {
            type: 'bulb-classic',
            geometry: {
                glass: { r: 0.5, seg: 48 },
                neck: { r: 0.2, h: 0.3, seg: 16 },
                base: { rTop: 0.2, rBot: 0.25, h: 0.35, seg: 16 },
                filament: { turns: 5, r: 0.08, h: 0.5, seg: 64 }
            },
            materials: {
                glass: { transparent: true, opacity: 0.2, roughness: 0.05, clearcoat: 1 },
                base: { color: 0xb5a642, metalness: 0.9, roughness: 0.3 },
                pins: { color: 0xc0c4cc, metalness: 0.8 },
                filament: { emissive: 0xffaa44, emissiveIntensity: 1.0, roughness: 0.4 }
            },
            colors: { on: 0xffddaa, sleeping: 0xff9800, off: 0x444444 },
            light: { type: 'point', color: 0xffddaa, distance: 6, decay: 2 },
            animation: { rotate: true, speed: 0.008 }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbClassicThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbClassicSvg.vue')
        }
    },
    {
        id: 'led',
        name: 'LED лампа',
        shortName: 'LED',
        elementType: 'bulb',
        visualConfig: {
            type: 'bulb-led',
            geometry: {
                dome: { r: 0.5, seg: 32 },
                pcb: { w: 0.5, h: 0.02, d: 0.5 },
                chips: 5,
                heatsink: { h: 0.4, r: 0.25 }
            },
            materials: {
                dome: { color: 0xffffff, transparent: true, opacity: 0.6, roughness: 0.4 },
                pcb: { color: 0x1a5c1a },
                chip: { color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5 },
                heatsink: { color: 0xcccccc, metalness: 0.8 }
            },
            colors: { on: 0xffffff, sleeping: 0xff9800, off: 0x666666 },
            light: { type: 'point', color: 0xffffff, distance: 8, decay: 2 },
            animation: { rotate: true, speed: 0.008 }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbLedThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbLedSvg.vue')
        }
    },
    {
        id: 'smart-rgb',
        name: 'Smart RGB',
        shortName: 'RGB',
        elementType: 'bulb',
        visualConfig: {
            type: 'bulb-led',
            geometry: {
                dome: { r: 0.5, seg: 32 },
                pcb: { w: 0.5, h: 0.02, d: 0.5 },
                chips: 5,
                heatsink: { h: 0.4, r: 0.25 }
            },
            materials: {
                dome: { color: 0xffffff, transparent: true, opacity: 0.7, roughness: 0.3 },
                pcb: { color: 0x0a0a0a },
                chip: { color: 0xff0000, emissive: 0xff0000 },
                heatsink: { color: 0x888888, metalness: 0.8 }
            },
            colors: { on: 0xffffff, sleeping: 0xff9800, off: 0x333333 },
            light: { type: 'point', color: 0xff0000, distance: 8, decay: 2, rgbSupport: true },
            animation: { rotate: true, speed: 0.008 }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbSmartRgbThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbSmartRgbSvg.vue')
        }
    },
    {
        id: 'halogen',
        name: 'Галогенная',
        shortName: 'Halogen',
        elementType: 'bulb',
        visualConfig: {
            type: 'bulb-capsule',
            geometry: {
                capsule: { r: 0.15, len: 0.8, seg: 16 },
                reflector: { r: 0.4, h: 0.3 }
            },
            materials: {
                glass: { color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.05 },
                filament: { emissive: 0xffcc66, emissiveIntensity: 2.0 },
                reflector: { color: 0xdddddd, metalness: 0.9, roughness: 0.2 }
            },
            colors: { on: 0xffcc66, sleeping: 0xffb74d, off: 0x9e9e9e },
            light: { type: 'spot', color: 0xffddaa, distance: 12, decay: 2, angle: 0.4 },
            animation: { rotate: true, speed: 0.006 }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbHalogenThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbHalogenSvg.vue')
        }
    },
    {
        id: 'cfl',
        name: 'Люминесцентная',
        shortName: 'CFL',
        elementType: 'bulb',
        visualConfig: {
            type: 'bulb-tube-u',
            geometry: {
                tube: { r: 0.08, len: 1.2, seg: 32 },
                base: { r: 0.2, h: 0.3 }
            },
            materials: {
                tube: { color: 0xe6f7ff, emissive: 0xe6f7ff, opacity: 0.9, transparent: true },
                base: { color: 0x90a4ae, metalness: 0.5 }
            },
            colors: { on: 0xe1f5fe, sleeping: 0xb3e5fc, off: 0xb0bec5 },
            light: { type: 'area', color: 0xe1f5fe, intensity: 0.8 },
            animation: { rotate: false }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbCflThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbCflSvg.vue')
        }
    },
    {
        id: 'led-strip',
        name: 'LED лента',
        shortName: 'Strip',
        elementType: 'bulb',
        visualConfig: {
            type: 'bulb-strip',
            geometry: {
                substrate: { w: 2.0, h: 0.02, d: 0.12 },
                chips: 10,
                chipSz: 0.06
            },
            materials: {
                substrate: { color: 0xf5f5f5 },
                chip: { emissive: 0xffdd88, emissiveIntensity: 1.0 },
                resistor: { color: 0x111111 }
            },
            colors: { on: 0xffdd88, sleeping: 0xffcc80, off: 0x555555 },
            light: { type: 'none' },
            animation: { rotate: false }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbLedStripThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbLedStripSvg.vue')
        }
    },
    {
        id: 'tube',
        name: 'Трубчатая',
        shortName: 'Tube',
        elementType: 'bulb',
        visualConfig: {
            type: 'bulb-tube',
            geometry: {
                glass: { r: 0.12, len: 2.5, seg: 16 },
                caps: { r: 0.13, h: 0.15 }
            },
            materials: {
                glass: { color: 0xe1f5fe, transparent: true, opacity: 0.4, roughness: 0.1 },
                cap: { color: 0x90a4ae, metalness: 0.7 }
            },
            colors: { on: 0xe1f5fe, sleeping: 0xb3e5fc, off: 0xb0bec5 },
            light: { type: 'point', color: 0xe1f5fe, distance: 10, decay: 2 },
            animation: { rotate: false }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/bulbs/BulbTubeThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/bulbs/BulbTubeSvg.vue')
        }
    }
]

export default bulbTypes

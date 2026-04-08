/**
 * ============================================================================
 * VISUALIZATION CONFIG — POWER SUPPLY TYPES
 * ============================================================================
 * 📁 Путь: stores/smartlight/visualizationConfigPower.js
 * ✅ Назначение: Конфигурации 3D/SVG визуализации для всех типов источников питания
 * ✅ Расширение: Добавить новый тип = добавить объект в массив
 * ============================================================================
 */

/**
 * @type {Array<Object>}
 */
export const powerSupplyTypes = [
    {
        id: 'standard',
        name: 'Стандартный БП',
        shortName: 'Standard',
        elementType: 'power',
        visualConfig: {
            type: 'power-box',
            geometry: { w: 1.5, h: 0.8, d: 0.5 },
            materials: {
                body: { color: 0xffffff, metalness: 0.3, roughness: 0.5 },
                indicator: { color: 0x666666, activeColor: 0x67c23a }
            },
            colors: { on: 0x67c23a, off: 0x909399, error: 0xf56c6c },
            animation: { rotate: false }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerStandardThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerStandardSvg.vue')
        }
    },
    {
        id: 'ac-220v',
        name: 'AC 220V',
        shortName: 'AC 220V',
        elementType: 'power',
        visualConfig: {
            type: 'power-box',
            geometry: { w: 1.5, h: 1.2, d: 0.3 },
            materials: {
                body: { color: 0xffffff, roughness: 0.5 },
                socket: { color: 0x333333 },
                indicator: { activeColor: 0x67c23a }
            },
            colors: { on: 0x67c23a, off: 0x909399 },
            animation: { rotate: true, speed: 0.005 }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerAc220vThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerAc220vSvg.vue')
        }
    },
    {
        id: 'dc-12v',
        name: 'DC 12V',
        shortName: 'DC 12V',
        elementType: 'power',
        visualConfig: {
            type: 'power-box',
            geometry: { w: 1.8, h: 0.6, d: 0.4 },
            materials: {
                body: { color: 0x333333 },
                wires: { pos: 0xf56c6c, neg: 0x333333 },
                indicator: { activeColor: 0x67c23a }
            },
            colors: { on: 0x67c23a, off: 0x909399 },
            animation: { rotate: true, speed: 0.005 }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerDc12vThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerDc12vSvg.vue')
        }
    },
    {
        id: 'dc-24v',
        name: 'DC 24V',
        shortName: 'DC 24V',
        elementType: 'power',
        visualConfig: {
            type: 'power-box',
            geometry: { w: 2.0, h: 0.7, d: 0.5 },
            materials: {
                body: { color: 0x2d3436, metalness: 0.4 },
                terminals: { color: 0xf56c6c },
                indicator: { activeColor: 0x67c23a }
            },
            colors: { on: 0x67c23a, off: 0x909399 },
            animation: { rotate: true, speed: 0.005 }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerDc24vThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerDc24vSvg.vue')
        }
    },
    {
        id: 'solar',
        name: 'Солнечная панель',
        shortName: 'Solar',
        elementType: 'power',
        visualConfig: {
            type: 'power-solar',
            geometry: { w: 1.5, h: 0.05, d: 1.0 },
            materials: {
                panel: { color: 0x1a237e, metalness: 0.5, roughness: 0.3 },
                cells: { color: 0x283593 },
                sun: { color: 0xff9800, opacity: 0.6 }
            },
            colors: { on: 0xff9800, off: 0x909399, error: 0xf56c6c },
            animation: { rotate: true, speed: 0.005 }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerSolarThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerSolarSvg.vue')
        }
    },
    {
        id: 'usb-5v',
        name: 'USB 5V',
        shortName: 'USB',
        elementType: 'power',
        visualConfig: {
            type: 'power-box',
            geometry: { w: 1.0, h: 0.3, d: 0.4 },
            materials: {
                body: { color: 0x2196f3, metalness: 0.6 },
                port: { color: 0x90a4ae, metalness: 0.9 },
                indicator: { activeColor: 0x4caf50 }
            },
            colors: { on: 0x4caf50, off: 0x90a4ae, error: 0xf44336 },
            animation: { rotate: false }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerUsb5vThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerUsb5vSvg.vue')
        }
    },
    {
        id: 'battery-pack',
        name: 'Батарейный отсек',
        shortName: 'Pack',
        elementType: 'power',
        visualConfig: {
            type: 'power-box',
            geometry: { w: 2.0, h: 0.6, d: 1.0 },
            materials: {
                body: { color: 0x424242, roughness: 0.6 },
                slots: { color: 0x757575 },
                indicator: { activeColor: 0xff9800 }
            },
            colors: { on: 0xff9800, off: 0x757575, error: 0xf44336 },
            animation: { rotate: false }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerBatteryPackThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerBatteryPackSvg.vue')
        }
    },
    {
        id: 'generator',
        name: 'Бензогенератор',
        shortName: 'Gen',
        elementType: 'power',
        visualConfig: {
            type: 'power-box',
            geometry: { w: 1.8, h: 1.0, d: 0.8 },
            materials: {
                body: { color: 0x455a64, metalness: 0.7 },
                exhaust: { color: 0x37474f },
                indicator: { activeColor: 0x4caf50 }
            },
            colors: { on: 0x4caf50, off: 0x90a4ae, error: 0xf44336 },
            animation: { rotate: false, pulse: true }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerGeneratorThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerGeneratorSvg.vue')
        }
    },
    {
        id: 'ups',
        name: 'ИБП',
        shortName: 'UPS',
        elementType: 'power',
        visualConfig: {
            type: 'power-box',
            geometry: { w: 1.6, h: 1.0, d: 0.8 },
            materials: {
                body: { color: 0x37474f, metalness: 0.7 },
                display: { color: 0x00bcd4, emissive: 0x0097a7 },
                vents: { color: 0x263238 }
            },
            colors: { on: 0x00bcd4, off: 0x546e7a, error: 0xef5350 },
            animation: { rotate: false, pulse: true }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerUpsThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerUpsSvg.vue')
        }
    },
    {
        id: 'dc-switch',
        name: 'Регулируемый БП',
        shortName: 'DC Sw',
        elementType: 'power',
        visualConfig: {
            type: 'power-box',
            geometry: { w: 1.4, h: 0.8, d: 0.5 },
            materials: {
                body: { color: 0x424242, metalness: 0.6 },
                knob: { color: 0x409eff, metalness: 0.8 },
                scale: { color: 0x909399 }
            },
            colors: { on: 0x67c23a, off: 0x909399, error: 0xf56c6c },
            animation: { rotate: false }
        },
        vueComponents: {
            three: () => import('@/components/SmartLight/components/visualization/threeJs/power/PowerDcSwitchThree.vue'),
            svg: () => import('@/components/SmartLight/components/visualization/svg/power/PowerDcSwitchSvg.vue')
        }
    }
]

export default powerSupplyTypes

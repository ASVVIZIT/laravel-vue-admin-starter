/**
 * Фабрика блоков
 */
import { blockDefaults } from './blockDefaults'

let counter = 0

export const blockFactory = {
    create(type, overrides = {}) {
        counter++
        const defaults = blockDefaults[type] || {}
        return {
            id: overrides.id || `${type}-${counter}`,
            type,
            enabled: overrides.enabled !== undefined ? overrides.enabled : true,
            order: overrides.order || counter,
            settings: { ...defaults, ...overrides }
        }
    },

    createMany(configs) {
        return configs.map(c => this.create(c.type, c))
    },

    isValid(block) {
        return !!(
            block &&
            typeof block.id === 'string' &&
            typeof block.type === 'string' &&
            typeof block.enabled === 'boolean' &&
            typeof block.order === 'number' &&
            block.settings
        )
    },

    filterValid(blocks) {
        if (!Array.isArray(blocks)) return []
        return blocks.filter(this.isValid)
    }
}

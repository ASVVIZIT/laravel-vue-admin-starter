/**
 * Реестр компонентов блоков
 */
import LandingHeroBlock from '../blocks/LandingHeroBlock.vue'
import LandingCountdownBlock from '../blocks/LandingCountdownBlock.vue'
import LandingProgressBlock from '../blocks/LandingProgressBlock.vue'
import LandingTechStackBlock from '../blocks/LandingTechStackBlock.vue'
import LandingFeaturesBlock from '../blocks/LandingFeaturesBlock.vue'
import LandingFooterBlock from '../blocks/LandingFooterBlock.vue'

export const blockComponents = {
    hero: LandingHeroBlock,
    countdown: LandingCountdownBlock,
    progress: LandingProgressBlock,
    techstack: LandingTechStackBlock,
    features: LandingFeaturesBlock,
    footer: LandingFooterBlock
}

export function getBlockComponent(type) {
    return blockComponents[type] || null
}

export function getAvailableBlockTypes() {
    return Object.keys(blockComponents)
}

/**
 * ============================================================================
 * PUBLIC COMPONENTS REGISTRY
 * ============================================================================
 * Централизованный экспорт всех компонентов публичной части заглушки сайта на Laravel 10 Vue 3.5
 * ============================================================================
 */
// Main
export { default as Landing } from './PublicLanding.vue'

// UI компоненты
export { default as BaseCard } from './ui/BaseCard.vue'
export { default as BaseBadge } from './ui/BaseBadge.vue'
export { default as ProgressBar } from './ui/ProgressBar.vue'
export { default as SectionTitle } from './ui/SectionTitle.vue'

// Widgets
export { default as AnimatedBackground } from './widgets/AnimatedBackground.vue'
export { default as CountdownUnit } from './widgets/CountdownUnit.vue'
export { default as TechItem } from './widgets/TechItem.vue'
export { default as FeatureCard } from './widgets/FeatureCard.vue'

// Sections
export { default as HeroSection } from './sections/HeroSection.vue'
export { default as CountdownSection } from './sections/CountdownSection.vue'
export { default as ProgressSection } from './sections/ProgressSection.vue'
export { default as TechStackSection } from './sections/TechStackSection.vue'
export { default as FeaturesSection } from './sections/FeaturesSection.vue'
export { default as FooterSection } from './sections/FooterSection.vue'

<script setup>
import { provide } from 'vue'
import { ACCORDION_CONTEXT } from '@/constants/contextKeys'

// Явно передаем объект контекста
const contextValue = {
    isAccordion: true,
    version: '1.0'
}

// Предоставляем слоты дочерним компонентам
provide(ACCORDION_CONTEXT, contextValue)
console.log('[Accordion] Контекст предоставлен:', contextValue)
</script>

<template>
    <div class="accordion accordion-wrapper-container">
        <slot></slot>
    </div>
</template>

<style lang="scss">
.accordion {
    width: 100%;
    max-width: 800px;
    margin: 20px auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;

    .accordion-wrapper-container {
        height: calc(100vh - 0px);
        display: block;
        position: relative;
        width: 100%;
        padding: 0px;
        overflow: auto;
    }
}
</style>

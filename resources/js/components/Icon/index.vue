<template>
    <i :class="classes" aria-hidden="true"></i>
</template>
<script>
export default {
    name: 'Icon'
}
</script>

<script setup>
// Импорт необходимых функций Vue и Pinia
// Import necessary Vue functions and Pinia
import { computed, watch } from 'vue';
import { useIconStore } from '@/store/icon'; // Импорт хранилища Pinia / Import Pinia store

// Определение пропсов компонента
// Define component props
const props = defineProps({
    className: {
        type: String,
        default: '',
    },
});

// Инициализация хранилища Pinia
// Initialize Pinia store
const iconStore = useIconStore();

// Следим за изменениями пропса className и сохраняем в хранилище
// Watch for className prop changes and save to store
watch(() => props.className, (newClassName) => {
    if (newClassName) {
        iconStore.updateLastUsedClass(newClassName);
    }
});

// Вычисляемое свойство для формирования классов
// Computed property for class composition
const classes = computed(() => {
    return props.className
        ? `custom-icon bi bi-${props.className}`
        : 'custom-icon';
});
</script>

<style scope lang="scss">
.sub-el-icon,
.nav-icon {
    display: inline-block;
    font-size: 18px;
    margin-right: 12px;
    position: relative;
}

.custom-icon {
    width: 1em;
    height: 1em;
    font-size: 1.5rem;
    position: relative;
    fill: currentColor;
    vertical-align: -2px;
}
</style>

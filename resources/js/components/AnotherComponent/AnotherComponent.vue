<script setup>
defineProps({
    chartData: {
        type: Array,
        default: () => []
    }
})
</script>

<template>
    <div class="custom-content">
        <h4>Кастомный компонент 1</h4>
        <ul v-if="chartData.length">
            <li v-for="(item, index) in chartData"
                :id="'chart-item-' + index"
                :key="index"
            >
            {{ item }}
            </li>
        </ul>
        <div v-else>Нет данных для отображения</div>
    </div>
</template>

<style lang="scss">
.custom-content {
    padding: 5px;
    background: #f8f9fa;

    .custom-input {
        width: 100%;
        margin: 1px;
        border: 2px solid #13c56f;
        border-radius: 4px;
    }
}
</style>

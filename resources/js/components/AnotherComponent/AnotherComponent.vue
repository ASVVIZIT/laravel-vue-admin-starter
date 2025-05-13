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
    <h3 class="custom-title">Кастомный компонент 1</h3>
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
  padding: 10px;
  background: #cfd2d5;
  .custom-title {
    margin: 0 auto;
    margin-bottom: 3px;
  }
  .custom-input {
    width: 100%;
    margin: 0px;
    border: 2px solid #33a16b;
    border-radius: 4px;
  }
}
</style>

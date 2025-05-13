<script setup>
defineProps({
  initialValue: {
    type: String,
    default: 'Default value 2'
  }
})
</script>

<template>
  <div class="custom-content">
    <h3 class="custom-title">Кастомный компонент 2</h3>
    <input
        type="text"
        :value="initialValue"
        class="custom-input"
    />
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

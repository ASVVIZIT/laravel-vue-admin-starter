<template>
  <div class="app-container scroll-y">
    <div class="dynamic-table__wrapper">
      <div class="dynamic-table__header">
        <h1>Dynamic Table System</h1>
      </div>
      <DynamicTable :template-id="1" />
    </div>
  </div>
</template>

<script setup>
import DynamicTable from '@/components/DynamicTable/DynamicTable.vue';
</script>

<style lang="scss" scoped>
.app-container {
  background-color: var(--el-color-info-light-9);
  .dynamic-table__wrapper  {
    margin: 2px;
    padding: 2px 10px;
  }
  .dynamic-table__header {
    margin: 2px;
    padding: 2px 10px;
    background-color: var(--el-color-info-light-7);
  }
}

</style>

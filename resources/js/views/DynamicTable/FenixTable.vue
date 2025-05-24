<template>
  <div class="app-container scroll-y">
    <div>
      <h1>Dynamic Table System</h1>
      <DynamicTable :template-id="1" />
    </div>
  </div>
</template>

<script setup>
import DynamicTable from '@/components/DynamicTable/DynamicTable.vue';
</script>

<style scoped>

</style>

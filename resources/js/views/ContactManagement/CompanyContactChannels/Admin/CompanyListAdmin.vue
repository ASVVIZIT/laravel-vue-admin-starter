<template>
  <div class="company-list-admin">
    <h3>Управление компаниями</h3>
    <company-list />
  </div>
</template>

<script setup>
// Импортируем компонент CompanyList
import CompanyList from '@/components/ContactManagement/CompanyContactChannels/components/Admin/CompanyList.vue';
</script>

<style scoped>
.company-list-admin {
  padding: 5px;
}

.company-list-admin h3 {
  margin: 0 0 10px 0;
}
</style>

<template>
  <div>
    <table class="table">
      <thead>
      <tr>
        <th @click="sortBy('name')">Название</th>
        <th @click="sortBy('code')">Код</th>
        <th>Описание</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="type in types.data" :key="type.id">
        <td>{{ type.name }}</td>
        <td>{{ type.code }}</td>
        <td>{{ type.description }}</td>
      </tr>
      </tbody>
    </table>
    <div class="pagination">
      <button
          v-for="page in types.meta.last_page"
          :key="page"
          @click="loadPage(page)"
          :class="{ active: page === types.meta.current_page }"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const types = ref({ data: [], meta: {} });
const sortField = ref('name');
const sortOrder = ref('asc');

const fetchTypes = async (page = 1) => {
  const response = await axios.get('/api/device-types', {
    params: {
      page,
      sort_by: sortField.value,
      sort_order: sortOrder.value
    }
  });
  types.value = response.data;
};

const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
  fetchTypes();
};

const loadPage = (page) => {
  fetchTypes(page);
};

onMounted(() => fetchTypes());
</script>

<style scoped>
.table { width: 100%; border-collapse: collapse; }
th { cursor: pointer; background: #f5f5f5; padding: 10px; }
td { padding: 8px; border-bottom: 1px solid #ddd; }
.pagination { margin-top: 20px; }
.active { background: #007bff; color: white; }
</style>

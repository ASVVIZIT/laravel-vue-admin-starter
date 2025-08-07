<template>
  <el-table :loading="loading" :data="list" style="width: 100%; padding-top: 15px">
    <el-table-column label="Order No" min-width="200">
      <template #default="{ row }">
        {{ row.order_no?.substring(0, 30) }}
      </template>
    </el-table-column>
    <el-table-column label="Price" width="195" align="center">
      <template #default="scope">¥ {{ toThousandFilter(scope.row.price) }}</template>
    </el-table-column>
    <el-table-column label="Status" width="100" align="center">
      <template #default="{ row }">
        <el-tag :size="store.size" :type="statusFilter(row.status)">
          {{ capitalizeFirstLetter(row.status) }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { fetchList } from '@/api/order';
import { toRefs, reactive, onBeforeMount } from 'vue';
import { appStore } from '@/store/appStore';

// Инициализация хранилищ
const store = appStore();

const resData = reactive({
  list: [],
  loading: true
})
onBeforeMount(() => {
  fetchData()
})
const statusFilter = (status) => {
  const statusMap = {
    success: 'success',
    pending: 'info',
    error: 'danger'
  }
  return statusMap[status]
}
const toThousandFilter = (num) => {
  return (+num || 0).toString().replace(/^-?\d+/g, (m) => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}

// Новая функция для преобразования первой буквы
const capitalizeFirstLetter = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const fetchData = async () => {
  const { data } = await fetchList();
  resData.list = data.items.slice(0, 22);
  resData.loading = false;
}

//Экспортируйте атрибуты на страницу для использования
let { list, loading } = toRefs(resData)
</script>

<style scoped lang="scss"></style>

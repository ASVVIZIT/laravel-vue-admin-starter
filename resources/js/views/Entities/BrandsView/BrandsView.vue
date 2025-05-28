<template>
  <div>
    <h2>Бренды</h2>
    <EntityTable
        entityName="brands"
        :columns="[
        { prop: 'name', label: 'Название' },
        { prop: 'country', label: 'Страна' },
        { prop: 'website', label: 'Сайт' },
      ]"
        :fetchData="fetchBrands"
        :deleteData="deleteBrand"
        @update="onUpdate"
    />
  </div>
</template>

<script setup>
import EntityTable from '@/components/EntityTable/EntityTable.vue'
import { appEntityStore } from '@store/entity'
import axios from 'axios'

const storeEntity = appEntityStore()

const fetchBrands = async () => {
  const response = await axios.get('/api/entities/ep_brands')
  console.log('response ', response)
  return response.data
}

const deleteBrand = async (id) => {
  await axios.delete(`/api/entities/ep_brands/${id}`)
  storeEntity.clearEntity('brands')
}

const onUpdate = () => {
  fetchBrands().then((data) => {
    storeEntity.entities.brands = data
  })
}
</script>

<template>
  <el-button>Добавить</el-button>
  <el-table :data="items" :size="store.size" border stripe style="width: 100%">
    <el-table-column v-for="col in columns" :key="col.prop" :prop="col.prop" :label="col.label" />
    <el-table-column label="Действия">
      <template #default="scope">
        <el-button :size="store.size" @click="edit(scope.row)" size="small">Редактировать</el-button>
        <el-button :size="store.size" @click="onDelete(scope.row.id)" type="danger" size="small">Удалить</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- Форма редактирования -->
  <el-dialog
      v-model="dialogVisible"
      title="Редактирование"
      :width="store.size === 'small' ? '40%' : '60%'"
  >
    <el-form :model="currentItem" label-width="120px">
      <el-form-item v-for="field in props.fields" :key="field.key" :label="field.label">
        <el-input v-if="field.type === 'text'" :size="store.size" v-model="currentItem[field.key]" />
        <el-checkbox v-if="field.type === 'checkbox'" v-model="currentItem[field.key]"></el-checkbox>
        <el-select v-if="field.type === 'select'" v-model="currentItem[field.key]">
          <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :size="store.size" @click="dialogVisible = false">Отмена</el-button>
      <el-button :size="store.size" type="primary" @click="saveChanges">Сохранить</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

import { appEntityStore } from '@store/entity'
import { appStore } from '@store/app'

const props = defineProps({
  entityName: String,
  columns: Array,
  fields: Array,
  fetchData: Function,
  deleteData: Function,
})

const emit = defineEmits(['update'])

const storeEntity = appEntityStore()
const store = appStore()

const items = ref([])
const dialogVisible = ref(false)
const currentItem = ref({})
const currentId = ref(null)

// Загрузка данных
storeEntity.loadEntities(props.entityName, props.fetchData).then(() => {

  console.log('storeEntity', storeEntity)
  items.value = storeEntity.entities[props.entityName] || []
})

// Редактирование
const edit = (item) => {
  currentId.value = item.id
  currentItem.value = { ...item }
  dialogVisible.value = true
}

// Сохранение изменений
const saveChanges = () => {
  // Вызовите API PUT / PATCH здесь
  console.log('Saving:', currentItem.value)
  dialogVisible.value = false
  emit('update')
}

// Удаление
const onDelete = (id) => {
  if (confirm('Вы уверены?')) {
    props.deleteData(id).then(() => {
      items.value = items.value.filter((item) => item.id !== id)
    })
  }
}
</script>

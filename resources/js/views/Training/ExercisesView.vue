<template>
  <div class="training-exercises-view">
    <div class="view-header">
      <h2 class="page-title">
        <el-icon><List /></el-icon>
        Справочник упражнений
      </h2>
      <el-input
          v-model="search"
          placeholder="Поиск..."
          size="small"
          class="search-input"
          clearable
          @input="filterExercises"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <el-row :gutter="12">
      <el-col
          v-for="group in groupedExercises"
          :key="group.type"
          :span="8"
          :xs="24"
          :sm="12"
          :md="8"
      >
        <LayoutCardWrapper :title="getTypeLabel(group.type)" :icon="getTypeIcon(group.type)" bordered shadow>
          <div class="exercise-list">
            <div
                v-for="ex in group.items"
                :key="ex.id"
                class="exercise-item"
                @click="selectExercise(ex)"
            >
              <span class="exercise-name">{{ ex.name }}</span>
              <el-tag size="small" :type="getTagType(ex.type)">{{ ex.default_unit }}</el-tag>
            </div>
          </div>
        </LayoutCardWrapper>
      </el-col>
    </el-row>

    <div v-if="!filteredExercises.length" class="empty-state">
      <el-icon><InfoFilled /></el-icon>
      <p>Упражнения не найдены</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { List, Search, InfoFilled } from '@element-plus/icons-vue'
import { useTrainingExerciseStore } from '@components/Training/stores/trainingExerciseStore.js'
import { getExerciseTagType, getExerciseIcon } from '@components/Training/utils/trainingFormattersUtils.js'
import LayoutCardWrapper from '@components/Training/components/layout/wrappers/TrainingLayoutCardWrapper.vue'

const exerciseStore = useTrainingExerciseStore()
const search = ref('')
const filteredExercises = ref([])

onMounted(async () => {
  if (!exerciseStore.exercisesLoaded) {
    await exerciseStore.fetchExercisesStore()
  }
  filteredExercises.value = exerciseStore.exercises
})

const groupedExercises = computed(() => {
  const groups = {}
  filteredExercises.value.forEach(ex => {
    if (!groups[ex.type]) groups[ex.type] = { type: ex.type, items: [] }
    groups[ex.type].items.push(ex)
  })
  return Object.values(groups)
})

const filterExercises = () => {
  const term = search.value.toLowerCase()
  filteredExercises.value = exerciseStore.exercises.filter(ex =>
      ex.name.toLowerCase().includes(term) ||
      ex.type.toLowerCase().includes(term)
  )
}

const getTypeLabel = (type) => ({
  bodyweight: 'Собственный вес',
  weighted: 'С отягощением',
  cardio: 'Кардио',
  other: 'Другое'
}[type] || type)

const getTypeIcon = (type) => getExerciseIcon(type)
const getTagType = (type) => getExerciseTagType(type)

const selectExercise = (ex) => {
  console.log('Selected exercise:', ex)
}
</script>

<style scoped>
.training-exercises-view { padding: 12px; font-size: 12px; }
.view-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 0 16px; border-bottom: 1px solid #ebeef5; margin-bottom: 16px; }
.page-title { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 16px; font-weight: 600; color: #303133; }
.page-title .el-icon { color: #409eff; font-size: 18px; }
.search-input { width: 200px; }
.exercise-list { display: flex; flex-direction: column; gap: 6px; padding: 4px 0; }
.exercise-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-radius: 4px; cursor: pointer; transition: background 0.15s; }
.exercise-item:hover { background: #f5f7fa; }
.exercise-name { font-size: 12px; color: #303133; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 0; color: #909399; gap: 8px; }
.empty-state .el-icon { font-size: 32px; }
@media (max-width: 768px) { .view-header { flex-direction: column; align-items: flex-start; gap: 8px; } .search-input { width: 100%; } }
</style>

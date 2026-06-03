<template>
  <LayoutCardWrapper title="Новая тренировка" :icon="EditPen" bordered shadow class="training-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="small" @submit.prevent="handleSubmit">
      <el-form-item label="Упражнение" prop="exercise_id">
        <el-select v-model="form.exercise_id" placeholder="Выберите упражнение" filterable @change="onExerciseChange">
          <el-option v-for="ex in exerciseStore.exercises" :key="ex.id" :label="ex.name" :value="ex.id">
            <span>{{ ex.name }}</span>
            <el-tag size="small" :type="getExerciseTagType(ex.type)" class="ml-2">{{ ex.type }}</el-tag>
          </el-option>
        </el-select>
      </el-form-item>

      <el-row :gutter="8">
        <el-col :span="12">
          <el-form-item label="Дата" prop="date">
            <el-date-picker v-model="form.date" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" placeholder="Выберите дату" :disabled-date="disableFutureDates" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Время" prop="time">
            <el-time-picker v-model="form.time" format="HH:mm" value-format="HH:mm" placeholder="Выберите время" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Подходы" prop="sets">
        <div class="sets-container">
          <SetRow v-for="(set, idx) in form.sets" :key="`set-${idx}`" v-model="form.sets[idx]" :index="idx" :exercise-type="selectedExercise?.type" :removable="form.sets.length > 1" @remove="removeSet(idx)" />
          <el-button type="primary" link size="small" @click="addSet">
            <el-icon><Plus /></el-icon> Добавить подход
          </el-button>
        </div>
      </el-form-item>

      <el-row :gutter="8">
        <el-col :span="12">
          <el-form-item>
            <el-checkbox v-model="form.is_public">Публичная запись</el-checkbox>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Поделиться с">
            <el-select
                v-model="form.shared_with"
                multiple
                filterable
                remote
                reserve-keyword
                clearable
                placeholder="Введите имя для поиска"
                :remote-method="searchUsers"
                :loading="userLoading"
                size="small"
            >
              <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="8">
        <el-col :span="16">
          <el-form-item label="Заметки">
            <el-input v-model="form.notes" type="textarea" :rows="2" maxlength="500" show-word-limit placeholder="Как прошла тренировка?" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Оценка" prop="rating">
            <el-rate v-model="form.rating" :max="5" show-text size="small" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="loading">{{ isEdit ? 'Обновить' : 'Сохранить' }}</el-button>
        <el-button @click="handleReset">Сбросить</el-button>
        <el-button v-if="isEdit" type="danger" @click="handleDelete">Удалить</el-button>
      </el-form-item>
    </el-form>
  </LayoutCardWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, Plus } from '@element-plus/icons-vue'

import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import { useTrainingForm } from '@/components/Training/composables/useTrainingForm.js'
import { getExerciseTagType } from '@/components/Training/utils/appFormattersUtils.js'
import { TrainingUserResource } from '@/components/Training/api/core/resource/TrainingUserResource.js'

import LayoutCardWrapper from '@/components/Training/components/layout/wrappers/LayoutCardWrapper.vue'
import SetRow from './SetRow.vue'

const props = defineProps({
  logId: { type: [Number, String], default: null },
  initialData: { type: Object, default: null }
})

const emit = defineEmits(['saved', 'deleted', 'cancelled'])

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()

const formRef = ref(null)
const loading = ref(false)
const isEdit = computed(() => !!props.logId)

const userOptions = ref([])
const userLoading = ref(false)

const { form, selectedExercise, rules, addSet, removeSet, resetForm, loadFormData, validateForm, getPlainPayload } =
    useTrainingForm(props.initialData, exerciseStore.exercises)

onMounted(async () => {
  if (!exerciseStore.exercisesLoaded) await exerciseStore.fetchExercisesStore()
  if (props.logId && props.initialData) loadFormData(props.initialData)
})

const disableFutureDates = (date) => date > new Date()

const onExerciseChange = () => {}

const searchUsers = async (query) => {
  if (!query || query.trim().length < 2) {
    userOptions.value = []
    return
  }

  userLoading.value = true
  try {
    const resource = new TrainingUserResource()
    const users = await resource.searchUsers(query, { per_page: 10 })

    // ✅ Правильный маппинг для el-select
    userOptions.value = (users || []).map(u => ({
      id: u.id,
      name: u.name || u.email || `Пользователь #${u.id}`,
      email: u.email
    }))
  } catch (e) {
    console.error('[TrainingLogForm] searchUsers error:', e)
    userOptions.value = []
  } finally {
    userLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    await validateForm(formRef.value)
    loading.value = true
    const payload = getPlainPayload()

    if (isEdit.value) {
      await logStore.updateLog(props.logId, payload)
      ElMessage.success('Запись обновлена')
    } else {
      await logStore.createLog(payload)
      ElMessage.success('Запись создана')
      resetForm()
    }
    emit('saved')
  } catch (errors) {
    if (typeof errors === 'object') Object.values(errors).forEach(msg => ElMessage.error(msg[0]))
    else ElMessage.error(errors?.message || 'Ошибка')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  if (isEdit.value && props.initialData) loadFormData(props.initialData)
  else resetForm()
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('Удалить запись?', 'Подтверждение', { type: 'warning' })
    await logStore.deleteLog(props.logId)
    emit('deleted')
  } catch {}
}
</script>

<style scoped>
.training-form { font-size: 12px; }
:deep(.el-form-item__label) { font-size: 11px; font-weight: 500; }
:deep(.el-select), :deep(.el-date-editor), :deep(.el-time-picker) { width: 100%; }
.sets-container { display: flex; flex-direction: column; gap: 4px; padding: 4px 0; }
.ml-2 { margin-left: 8px; }
:deep(.el-rate) { font-size: 14px; }
:deep(.el-textarea__inner) { font-size: 12px; }
</style>

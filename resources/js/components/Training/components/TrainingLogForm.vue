<template>
  <LayoutCardWrapper :title="isEdit ? 'Редактирование записи' : 'Новая тренировка'" :icon="EditPen" bordered shadow class="training-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="small" @submit.prevent="handleSubmit">
      <el-form-item label="Упражнение" prop="exercise_id">
        <el-select v-model="form.exercise_id" placeholder="Выберите упражнение" filterable>
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
        <!-- 🔥 АЛЕРТ ПОЯВЛЯЕТСЯ ТОЛЬКО КОГДА canUndo = true -->
        <div v-if="canUndo" class="undo-alert">
          <div class="undo-alert-content">
            <span class="undo-text">
              ⚠ Старые подходы заморожены.
              <span v-if="undoTimeLeft > 0" class="undo-timer">({{ undoTimeLeft }}с)</span>
            </span>
            <div class="undo-actions">
              <el-button link size="small" @click="undoTypeChange" :class="['undo-btn', { 'undo-btn-expired': undoExpired }]">
                ↶ Вернуть
              </el-button>
              <el-button v-if="originalData" link type="info" size="small" @click="resetToOriginal">
                🔄 К исходным
              </el-button>
            </div>
          </div>
        </div>

        <div class="sets-container">
          <!-- 🔥 ЗАМОРОЖЕННЫЕ СТРОКИ (видны только если есть frozenSets) -->
          <div v-if="frozenSets.length > 0" class="frozen-section">
            <div class="frozen-label">🔒 Предыдущие подходы (тип: {{ TYPE_LABELS[frozenType] || frozenType }})</div>
            <SetRow
                v-for="(set, idx) in frozenSets"
                :key="`frozen-${idx}`"
                :model-value="set"
                :index="idx"
                :exercise-type="frozenType"
                :removable="false"
                :frozen="true"
            />
          </div>

          <!-- 🔥 АКТИВНЫЕ СТРОКИ (текущий тип) -->
          <SetRow
              v-for="(set, idx) in form.sets"
              :key="`active-${idx}`"
              v-model="form.sets[idx]"
              :index="idx"
              :exercise-type="exerciseType"
              :removable="form.sets.length > 1"
              :frozen="false"
              @remove="removeSet(idx)"
          />
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
            <el-select v-model="form.shared_with" multiple filterable remote reserve-keyword clearable
                       placeholder="Введите имя для поиска" :remote-method="searchUsers" :loading="userLoading" size="small">
              <el-option v-for="user in userOptions" :key="user.id" :label="user.name" :value="user.id" />
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

      <el-form-item class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="loading">{{ isEdit ? 'Обновить' : 'Сохранить' }}</el-button>
        <el-button @click="handleCancel">Отмена</el-button>
        <el-button v-if="isEdit" type="danger" @click="handleDelete">Удалить</el-button>
      </el-form-item>
    </el-form>
  </LayoutCardWrapper>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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

const { form, selectedExercise, rules, addSet, removeSet, resetForm, loadFormData, validateForm, getPlainPayload, exerciseType } =
    useTrainingForm(props.initialData, exerciseStore.exercises)

const TYPE_LABELS = {
  bodyweight: ' Свой вес',
  weighted: '️ С отягощением',
  cardio: '❤️ Кардио',
  other: ' Другое'
}

// ============================================================================
// 🔥 СОСТОЯНИЕ ЗАМОРОЗКИ
// ============================================================================
const frozenSets = ref([])
const frozenType = ref(null)
const frozenExerciseId = ref(null)
const canUndo = ref(false)
const undoExpired = ref(false)
const undoTimeLeft = ref(20)
let undoCountdownTimer = null
const isProcessingChange = ref(false)
const originalData = ref(null)

// ============================================================================
// 🔥 ТАЙМЕР И ОТКАТ
// ============================================================================
const clearUndoState = () => {
  canUndo.value = false
  undoExpired.value = false
  undoTimeLeft.value = 20
  frozenSets.value = []
  frozenType.value = null
  frozenExerciseId.value = null
  if (undoCountdownTimer) { clearInterval(undoCountdownTimer); undoCountdownTimer = null }
}

const startUndoTimer = () => {
  if (undoCountdownTimer) clearInterval(undoCountdownTimer)
  canUndo.value = true
  undoExpired.value = false
  undoTimeLeft.value = 20
  undoCountdownTimer = setInterval(() => {
    undoTimeLeft.value--
    if (undoTimeLeft.value <= 0) { clearInterval(undoCountdownTimer); undoCountdownTimer = null; undoExpired.value = true }
  }, 1000)
}

const undoTypeChange = () => {
  if (frozenSets.value.length === 0 || !frozenExerciseId.value) return
  isProcessingChange.value = true
  form.exercise_id = frozenExerciseId.value
  form.sets = JSON.parse(JSON.stringify(frozenSets.value))
  clearUndoState()
  isProcessingChange.value = false
  ElMessage.success('Предыдущий тип и подходы восстановлены')
}

const resetToOriginal = () => {
  if (!originalData.value) return
  loadFormData(originalData.value)
  clearUndoState()
  ElMessage.info('Восстановлены исходные данные')
}

// ============================================================================
// 🔥 ПРЯМОЙ WATCH БЕЗ КОНФЛИКТОВ
// ============================================================================
watch(() => form.exercise_id, (newId, oldId) => {
  if (isProcessingChange.value || newId === oldId || !newId || !oldId) return

  const oldEx = exerciseStore.exercises.find(e => String(e.id) === String(oldId))
  const newEx = exerciseStore.exercises.find(e => String(e.id) === String(newId))
  const oldType = oldEx?.type
  const newType = newEx?.type

  if (!oldType || !newType || oldType === newType) return

  const hadData = form.sets.some(s => s.reps || s.weight || s.duration || s.distance || s.notes)

  if (hadData) {
    // 1. Замораживаем текущие
    frozenSets.value = JSON.parse(JSON.stringify(form.sets))
    frozenType.value = oldType
    frozenExerciseId.value = oldId
    startUndoTimer()

    // 2. Создаём ОДНУ пустую строку нового типа
    form.sets = [{ reps: null, weight: null, duration: null, distance: null, notes: '' }]
  } else {
    // Пустая форма → просто меняем тип
    form.sets = [{ reps: null, weight: null, duration: null, distance: null, notes: '' }]
  }
})

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================================
watch(() => [props.logId, props.initialData], ([newLogId, newInitialData]) => {
  clearUndoState()
  if (newLogId && newInitialData) {
    loadFormData(newInitialData)
    originalData.value = JSON.parse(JSON.stringify(newInitialData))
  } else {
    resetForm()
    originalData.value = null
  }
}, { immediate: true })

onMounted(async () => {
  if (!exerciseStore.exercisesLoaded) await exerciseStore.fetchExercisesStore()
})
onUnmounted(() => clearUndoState())

const disableFutureDates = (date) => date > new Date()

// ============================================================================
// СОХРАНЕНИЕ
// ============================================================================
const handleSubmit = async () => {
  try {
    await validateForm(formRef.value)
    if (frozenSets.value.length > 0) {
      try {
        await ElMessageBox.confirm(
            `Сохранить с типом "${TYPE_LABELS[exerciseType.value] || exerciseType.value}"?\n\n⚠️ ${frozenSets.value.length} замороженных подходов будут утеряны.`,
            'Подтверждение', { type: 'warning', confirmButtonText: 'Да, сохранить', cancelButtonText: 'Отмена' }
        )
      } catch { return }
    }

    loading.value = true
    const payload = getPlainPayload()
    if (isEdit.value) {
      await logStore.updateLog(props.logId, payload)
      originalData.value = JSON.parse(JSON.stringify({ ...props.initialData, ...payload, id: props.logId }))
      clearUndoState()
      ElMessage.success('Запись обновлена')
    } else {
      await logStore.createLog(payload)
      ElMessage.success('Запись создана')
      resetForm()
      originalData.value = null
    }
    emit('saved')
  } catch (errors) {
    const msgs = errors && typeof errors === 'object' ? Object.values(errors).flat() : [errors?.message || 'Ошибка']
    msgs.forEach(m => ElMessage.error(m))
  } finally { loading.value = false }
}

// ============================================================================
// ОСТАЛЬНОЕ
// ============================================================================
const searchUsers = async (query) => {
  if (!query || query.trim().length < 2) { userOptions.value = []; return }
  userLoading.value = true
  try {
    const users = await new TrainingUserResource().searchUsers(query, { per_page: 10 })
    userOptions.value = (users || []).map(u => ({ id: u.id, name: u.name || u.email || `Пользователь #${u.id}`, email: u.email }))
  } catch (e) { userOptions.value = []; ElMessage.error('Ошибка поиска') }
  finally { userLoading.value = false }
}

const handleCancel = () => { clearUndoState(); emit('cancelled') }

const handleDelete = async () => {
  const name = selectedExercise.value?.name || props.initialData?.exercise?.name || 'запись'
  const date = form.date || props.initialData?.date || 'неизвестная дата'
  try {
    await ElMessageBox.confirm(`Удалить "${name}" от ${date}?`, 'Подтверждение', { type: 'warning' })
    await logStore.deleteLog(props.logId)
    clearUndoState()
    emit('deleted', { logId: props.logId, exercise: name, date, userId: props.initialData?.user_id, source: 'TrainingLogForm' })
  } catch (err) { if (err !== 'cancel' && !err?.toString?.().includes('cancel')) ElMessage.error('Не удалось удалить') }
}
</script>

<style scoped>
.training-form { font-size: 12px; }
:deep(.el-form-item) { margin-bottom: 12px; }
:deep(.el-form-item__label) { font-size: 11px; font-weight: 500; padding-bottom: 4px; }
:deep(.el-select), :deep(.el-date-editor), :deep(.el-time-picker) { width: 100%; }
.sets-container { display: flex; flex-direction: column; gap: 4px; padding: 4px 0; }
.ml-2 { margin-left: 8px; }
:deep(.el-rate) { font-size: 14px; }
:deep(.el-textarea__inner) { font-size: 12px; }
.form-actions { margin-top: 16px; padding-top: 12px; border-top: 1px solid #ebeef5; }
.form-actions :deep(.el-button) { font-size: 12px; padding: 8px 16px; }

.undo-alert { margin-bottom: 10px; padding: 8px 12px; background: #fdf6ec; border: 1px solid #faecd8; border-radius: 6px; font-size: 11px; animation: slideDown 0.3s ease; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.undo-alert-content { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.undo-text { color: #606266; font-weight: 500; }
.undo-timer { color: #e6a23c; font-weight: 600; margin-left: 4px; }
.undo-actions { display: flex; gap: 8px; align-items: center; }
.undo-btn { color: #e6a23c !important; font-weight: 600; }
.undo-btn:hover { color: #d48806 !important; }
.undo-btn-expired { color: #909399 !important; opacity: 0.7; }
.undo-btn-expired:hover { color: #606266 !important; opacity: 1; }

.frozen-section { margin-bottom: 12px; padding: 8px; background: #f5f7fa; border: 1px dashed #dcdfe6; border-radius: 6px; }
.frozen-label { font-size: 10px; color: #909399; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #e4e7ed; font-weight: 500; }
@media (max-width: 768px) { .undo-alert-content { flex-direction: column; align-items: flex-start; } }
</style>

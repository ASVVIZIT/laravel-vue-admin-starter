<template>
  <LayoutCardWrapper bordered class="training-form" :show-title="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="form-scroll-wrapper">

      <div class="main-layout-grid">
        <div class="grid-col-left">
          <el-form-item label="Упражнение" prop="exercise_id">
            <el-select v-model="form.exercise_id" filterable placeholder="Выберите упражнение..." @change="onExerciseChange">
              <el-option v-for="ex in exerciseStore.exercises" :key="ex.id" :label="ex.name" :value="ex.id">
                <span>{{ ex.name }}</span>
                <el-tag size="small" :type="getTagColor(ex.type)" class="ml-2">{{ ex.type }}</el-tag>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="Оценка" prop="rating">
            <el-rate v-model="form.rating" :max="5" show-text />
          </el-form-item>

          <el-form-item label="Подходы">
            <div class="sets-wrapper">
              <div v-if="frozenData.exercise" class="frozen-block">
                <div class="frozen-header">🔒 Было: <b>{{ frozenData.exercise.name }}</b></div>
                <div class="frozen-scroll-list">
                  <SetRow v-for="(set, i) in frozenData.sets" :key="'f-'+i" :model-value="set" :index="i"
                          :exercise-type="frozenData.exercise.type" :frozen="true" :removable="false" :status="'success'" />
                </div>
                <div class="frozen-actions">
                  <el-button link type="primary" @click="restoreFrozen">↶ Восстановить</el-button>
                  <el-button link type="danger" @click="frozenData = { sets: [], exercise: null }">Удалить</el-button>
                </div>
              </div>

              <div class="sets-divider" v-if="frozenData.exercise"><span>Текущие подходы</span></div>

              <div class="sets-list">
                <div class="set-row-header">
                  <span class="h-status">#</span>
                  <span v-if="currentConfig.visibleFields.includes('reps')" class="h-reps">
                    {{ currentConfig.getFieldLabel('reps') }}
                  </span>
                  <span v-if="currentConfig.visibleFields.includes('weight')" class="h-value">
                    {{ currentConfig.getFieldLabel('weight') }}
                  </span>
                  <span v-if="currentConfig.visibleFields.includes('duration')" class="h-value">
                    {{ currentConfig.getFieldLabel('duration') }}
                  </span>
                  <span v-if="currentConfig.visibleFields.includes('distance')" class="h-value">
                    {{ currentConfig.getFieldLabel('distance') }}
                  </span>
                  <span class="h-notes">{{ currentConfig.getFieldLabel('notes') }}</span>
                  <span class="h-actions"></span>
                </div>

                <SetRow v-for="(set, i) in form.sets" :key="'a-'+i" v-model="form.sets[i]" :index="i"
                        :exercise-type="currentExerciseType" :removable="form.sets.length > 1"
                        :errors="setErrors[i] ?? {}" :status="setStatus[i]" @remove="removeSet(i)"
                        :ref="(el) => { if (el) setRefs[i] = el }" />
              </div>

              <el-button link type="primary" @click="addSet" class="add-set-btn">
                <el-icon><Plus /></el-icon> Добавить подход
              </el-button>
            </div>
          </el-form-item>
        </div>

        <div class="grid-col-right">
          <el-row :gutter="8" style="width: 100%">
            <el-col :span="12"><el-form-item label="Дата" prop="date"><el-date-picker v-model="form.date" value-format="YYYY-MM-DD" :disabled-date="disableFutureDates" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="Время" prop="time"><el-time-picker v-model="form.time" value-format="HH:mm" /></el-form-item></el-col>
          </el-row>

          <el-form-item label="Доступ"><el-checkbox v-model="form.is_public">Публичная запись</el-checkbox></el-form-item>

          <!-- 🔹 Поделиться с - с иконкой помощи -->
          <el-form-item>
            <template #label>
              <span>Поделиться с</span>
              <el-tooltip placement="top" effect="light">
                <template #content>
                  <div class="sharing-tooltip">
                    <p><strong>Как это работает:</strong></p>
                    <p>Выбранные пользователи получат доступ к просмотру этой тренировки.</p>
                    <p style="margin-top: 8px;"><strong>Цвета в поиске:</strong></p>
                    <p>🔵 <b>Синий</b> — новый пользователь (можно добавить)</p>
                    <p>⚪ <b>Серый</b> — уже добавлен в список</p>
                    <p style="margin-top: 8px;">💡 <i>Мультивыбор активен — можно кликать по нескольким подряд.</i></p>
                  </div>
                </template>
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
            <TrainingUserSharingSelector
                v-model="form.shared_with"
                placeholder="Найдите пользователя..."
                :max-visible-tags="4"
            />
          </el-form-item>

          <el-form-item label="Заметки">
            <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="Общий комментарий..." maxlength="255" show-word-limit />
          </el-form-item>
        </div>
      </div>

      <el-form-item class="actions-block">
        <el-button type="primary" @click="handleSubmit" :loading="loading">Сохранить</el-button>
        <el-button @click="handleCancel">Отмена</el-button>
        <el-button v-if="isEdit" type="danger" @click="handleDelete">Удалить</el-button>
      </el-form-item>

    </el-form>
  </LayoutCardWrapper>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, QuestionFilled } from '@element-plus/icons-vue'
import { useTrainingForm } from '@/components/Training/composables/useTrainingForm.js'
import { useSetValidation } from '@/components/Training/composables/useSetValidation.js'
import LayoutCardWrapper from '@/components/Training/components/layout/wrappers/LayoutCardWrapper.vue'
import SetRow from './SetRow.vue'
import TrainingUserSharingSelector from './TrainingUserSharingSelector.vue'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import { useExerciseFields } from '@/components/Training/composables/useExerciseFields.js'

const props = defineProps({ logId: { type: [Number, String] }, initialData: Object })
const emit = defineEmits(['saved', 'cancelled', 'deleted'])

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()
const { validateSet } = useSetValidation()
const { form, addSet, removeSet, resetForm, loadFormData, getPlainPayload, selectedExercise, rules } =
    useTrainingForm(props.initialData, exerciseStore.exercises)

const frozenData = ref({ sets: [], exercise: null })
const setRefs = ref([])
const formRef = ref(null)
const loading = ref(false)
const submitAttempted = ref(false)
const setErrors = ref([])

const currentExerciseType = computed(() => {
  if (!form.value || !form.value.exercise_id) return 'bodyweight'
  const ex = exerciseStore.exercises.find(e => e.id == form.value.exercise_id)
  return ex ? ex.type : 'bodyweight'
})

const currentConfig = computed(() => useExerciseFields(currentExerciseType.value))
const isEdit = computed(() => !!props.logId)

const isSetComplete = (s, type) => {
  if (!s.reps) return false
  if (type === 'weighted' && !s.weight) return false
  if (type === 'cardio' && !s.duration) return false
  return true
}

const setStatus = computed(() => form.value.sets.map(s => {
  const hasData = !!(s.reps ?? s.weight ?? s.duration ?? s.distance ?? s.notes?.trim())
  if (!hasData) return 'warning'
  const complete = isSetComplete(s, currentExerciseType.value)
  return complete ? 'success' : (submitAttempted.value ? 'error' : 'warning')
}))

const runSetValidation = () => {
  if (!form.value || !form.value.sets) return
  setErrors.value = form.value.sets.map(s => {
    const hasData = !!(s.reps ?? s.weight ?? s.duration ?? s.distance ?? s.notes?.trim())
    if (!hasData) return {}
    return validateSet(s, currentExerciseType.value).errors || {}
  })
}

watch(() => form.value.sets, runSetValidation, { deep: true })
watch(currentExerciseType, runSetValidation)

onMounted(() => {
  runSetValidation()
  if (!exerciseStore.exercisesLoaded) exerciseStore.fetchExercisesStore()
})

const disableFutureDates = (d) => d > new Date()
const getTagColor = (t) => {
  const type = String(t || '').trim().toLowerCase()
  return type === 'weighted' ? 'warning' : (type === 'bodyweight' ? 'success' : 'info')
}

const onExerciseChange = () => {
  submitAttempted.value = false
  const newEx = exerciseStore.exercises.find(e => e.id == form.value.exercise_id)
  const oldExId = frozenData.value.exercise?.id || props.initialData?.exercise_id
  const oldEx = exerciseStore.exercises.find(e => e.id == oldExId)
  const oldType = oldEx?.type
  const newType = newEx?.type

  if (oldType && newType && oldType !== newType) {
    const validFilled = form.value.sets.filter(s => isSetComplete(s, oldType))
    if (validFilled.length > 0) {
      frozenData.value = { sets: JSON.parse(JSON.stringify(validFilled)), exercise: { id: oldEx.id, name: oldEx.name, type: oldType } }
      ElMessage.info(`Заморожено ${validFilled.length}`)
    }
    form.value.sets.forEach(s => {
      if (newType === 'bodyweight') { s.weight = null; s.duration = null; s.distance = null }
      if (newType === 'weighted') { s.duration = null; s.distance = null }
      if (newType === 'cardio') { s.weight = null }
    })
    form.value.sets = [{ reps: null, weight: null, duration: null, distance: null, notes: '' }]
  }
}

const restoreFrozen = () => {
  if (!frozenData.value.exercise) return
  form.value.exercise_id = frozenData.value.exercise.id
  form.value.sets = JSON.parse(JSON.stringify(frozenData.value.sets))
  frozenData.value = { sets: [], exercise: null }
  ElMessage.success('Восстановлено')
}

const handleSubmit = async () => {
  submitAttempted.value = true
  runSetValidation()
  try { await formRef.value.validate() } catch { submitAttempted.value = false; return }

  const activeSets = form.value.sets.filter(s => isSetComplete(s, currentExerciseType.value))
  if (activeSets.length === 0) return ElMessage.warning('Добавьте хотя бы один полный подход')

  const firstErrorIndex = setStatus.value.findIndex(st => st === 'error')
  if (firstErrorIndex !== -1) {
    ElMessage.warning(`Заполните обязательные поля в подходе #${firstErrorIndex + 1}`)
    const firstField = Object.keys(setErrors.value[firstErrorIndex] ?? {})[0] || 'reps'
    setRefs.value[firstErrorIndex]?.focusField(firstField)
    return
  }

  if (frozenData.value.exercise) {
    try { await ElMessageBox.confirm(`Сохранить и удалить ${frozenData.value.sets.length} замороженных подходов?`, 'Подтверждение', { type: 'warning' }) } catch { submitAttempted.value = false; return }
  }

  try {
    loading.value = true
    const payload = { ...getPlainPayload(), sets: activeSets }
    if (props.logId) { await logStore.updateLog(props.logId, payload); ElMessage.success('Обновлено') }
    else { await logStore.createLog(payload); ElMessage.success('Создано'); resetForm() }
    emit('saved')
  } catch (e) { ElMessage.error(e?.message || 'Ошибка') } finally { loading.value = false; submitAttempted.value = false }
}

const handleCancel = () => { submitAttempted.value = false; frozenData.value = { sets: [], exercise: null }; resetForm(); emit('cancelled') }
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('Удалить запись?', 'Подтверждение', { type: 'warning' })
    await logStore.deleteLog(props.logId)
    emit('deleted')
  } catch (e) { if (e !== 'cancel') ElMessage.error('Не удалось удалить') }
}

watch(() => [props.logId, props.initialData], ([id, data]) => {
  frozenData.value = { sets: [], exercise: null }
  submitAttempted.value = false

  if (id && data) {
    loadFormData(data)
  } else {
    resetForm()
  }
}, { immediate: true })
</script>

<style scoped>
.training-form {
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.form-scroll-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-layout-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  align-items: start;
  width: 100%;
}

.grid-col-left,
.grid-col-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

:deep(.el-form-item) { margin-bottom: 4px !important; }
:deep(.el-form-item__label) { margin-bottom: 2px !important; font-size: 12px; line-height: 1; display: inline-flex; align-items: center; gap: 4px; }
:deep(.el-input),
:deep(.el-input-number),
:deep(.el-select),
:deep(.el-date-picker),
:deep(.el-time-picker) {
  height: 28px !important;
  line-height: 28px !important;
}
:deep(.el-textarea__inner) { padding: 4px 8px !important; font-size: 12px !important; }
:deep(.el-button) { height: 28px !important; padding: 0 10px !important; font-size: 12px !important; }

/* 🔹 Иконка помощи */
.help-icon {
  font-size: 13px;
  color: #909399;
  cursor: help;
  transition: color 0.2s;
  flex-shrink: 0;
}

.help-icon:hover {
  color: #409eff;
}

/* 🔹 Тултип */
.sharing-tooltip {
  max-width: 280px;
  font-size: 12px;
  line-height: 1.5;
}

.sharing-tooltip p {
  margin: 4px 0;
}

.sharing-tooltip strong {
  color: #303133;
}

.sets-wrapper { width: 100%; }
.sets-list {
  max-height: 260px;
  overflow-y: auto;
  padding: 0 0 8px 0;
  border: 1px dashed #e4e7ed;
  border-radius: 2px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}
.sets-list::-webkit-scrollbar { width: 4px; }
.sets-list::-webkit-scrollbar-thumb { background: #c0c4cc; border-radius: 2px; }
.add-set-btn { margin-top: 4px; padding: 0; display: inline-flex; align-items: center; gap: 4px; font-size: 12px; height: auto; }

.set-row-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  box-sizing: border-box;
  padding: 0 2px;
  margin: 0;
  border-left: 1px solid #dcdfe6;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  border-top: 1px solid #dcdfe6;
  width: 100%;
  user-select: none;
}
.h-status { width: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #909399; line-height: 1; }
.h-reps { width: 80px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #606266; font-weight: 600; line-height: 1; }
.h-value { width: 90px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #606266; font-weight: 600; line-height: 1; }
.h-notes { flex: 1 1 auto; min-width: 0; display: flex; align-items: center; font-size: 9px; color: #606266; font-weight: 600; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.h-actions { width: 24px; flex-shrink: 0; }

.frozen-block { background: #f5f7fa; border: 1px dashed #c0c4cc; padding: 4px; border-radius: 2px; margin-bottom: 4px; }
.frozen-header { font-size: 11px; color: #606266; margin-bottom: 2px; font-weight: 600; }
.frozen-actions { display: flex; gap: 4px; margin-top: 2px; font-size: 11px; }
.frozen-scroll-list { max-height: 100px; overflow-y: auto; margin-bottom: 2px; }
.frozen-scroll-list::-webkit-scrollbar { width: 3px; }
.frozen-scroll-list::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 1px; }

.sets-divider { border-bottom: 1px dashed #dcdfe6; margin: 4px 0; position: relative; text-align: center; }
.sets-divider span { background: #fafafa; padding: 0 4px; color: #909399; font-size: 9px; position: absolute; top: -6px; left: 50%; transform: translateX(-50%); }
.ml-2 { margin-left: 4px; }

.actions-block { grid-column: 1 / -1; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; display: flex; gap: 8px; }

@media (max-width: 1024px) {
  .main-layout-grid { grid-template-columns: 1fr; gap: 12px; }
  .grid-col-right { border-top: 1px solid #ebeef5; padding-top: 8px; margin-top: 4px; }
  .sets-list { max-height: 320px; }
}

@media (max-width: 768px) {
  .main-layout-grid { gap: 8px; }
  .grid-col-left, .grid-col-right { gap: 6px; }
  :deep(.el-form-item) { margin-bottom: 4px; }
  :deep(.el-form-item__label) { font-size: 11px; margin-bottom: 1px; }
  :deep(.el-input),
  :deep(.el-input-number),
  :deep(.el-select),
  :deep(.el-date-picker),
  :deep(.el-time-picker) { height: 32px !important; line-height: 32px !important; }
  :deep(.el-button) { height: 32px !important; padding: 0 8px !important; font-size: 11px !important; }
  .sets-list { max-height: 240px; }
  .frozen-scroll-list { max-height: 80px; }
  .actions-block { flex-direction: column; gap: 6px; }
  .actions-block .el-button { width: 100%; }
}
</style>

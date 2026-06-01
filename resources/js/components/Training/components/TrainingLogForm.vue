<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, Plus, Delete } from '@element-plus/icons-vue'

// ✅ ИМПОРТЫ С ПРЕФИКСОМ TRAINING
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
const userResource = new TrainingUserResource()  // ✅ С префиксом

const formRef = ref(null)
const loading = ref(false)
const isEdit = computed(() => !!props.logId)

// ===== Поиск пользователей (через TrainingUserResource) =====
const userOptions = ref([])
const userLoading = ref(false)
const currentUserId = ref(window.__CURRENT_USER_ID__ || null)

const searchUsers = async (query) => {
  if (!query || query.trim().length < 2) {
    userOptions.value = []
    return
  }

  userLoading.value = true
  try {
    const users = await userResource.searchUsers(query)
    userOptions.value = users.filter(u => u.id !== currentUserId.value)
  } catch (e) {
    console.error('[TrainingUserResource] Search error:', e)
    userOptions.value = []
    ElMessage.warning('Не удалось загрузить пользователей')
  } finally {
    userLoading.value = false
  }
}

const loadInitialUserNames = async () => {
  if (!props.initialData?.shared_with?.length) return

  userLoading.value = true
  try {
    const ids = props.initialData.shared_with.filter(id => id !== currentUserId.value)
    if (ids.length === 0) return

    const users = await userResource.getUsersByIds(ids)
    userOptions.value = users
  } catch (e) {
    console.error('[TrainingUserResource] Load by IDs error:', e)
    userOptions.value = props.initialData.shared_with
        .filter(id => id !== currentUserId.value)
        .map(id => ({ id, name: `User #${id}` }))
  } finally {
    userLoading.value = false
  }
}

// ===== Форма =====
const { form, selectedExercise, rules, addSet, removeSet, resetForm, loadFormData, validateForm, getPlainPayload } =
    useTrainingForm(props.initialData, exerciseStore.exercises)

onMounted(async () => {
  if (!exerciseStore.exercisesLoaded) await exerciseStore.fetchExercisesStore()

  if (props.logId && props.initialData) {
    loadFormData(props.initialData)
    await loadInitialUserNames()
  }

  if (userOptions.value.length === 0) searchUsers('a')
})

const onExerciseChange = () => {
  form.value.sets = form.value.sets.map(set => ({
    reps: set.reps,
    weight: null,
    duration: null,
    distance: null,
    notes: set.notes
  }))
}

const disableFutureDates = (date) => date > new Date()

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
    if (typeof errors === 'object') {
      Object.values(errors).forEach(msg => ElMessage.error(msg[0]))
    } else {
      ElMessage.error(errors?.message || 'Ошибка сохранения')
    }
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  if (isEdit.value && props.initialData) loadFormData(props.initialData)
  else resetForm()
  ElMessage.info('Форма сброшена')
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('Удалить эту запись?', 'Подтверждение', {
      type: 'warning',
      confirmButtonText: 'Удалить',
      cancelButtonText: 'Отмена'
    })
    await logStore.deleteLog(props.logId)
    ElMessage.success('Запись удалена')
    emit('deleted')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('Ошибка удаления')
  }
}
</script>

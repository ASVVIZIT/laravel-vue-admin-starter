<template>
  <el-dialog
      v-model="visible"
      :title="t('user.profile.emailChange.title')"
      width="500px"
      :close-on-click-modal="false"
      @close="resetForm"
  >
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        label-position="right"
    >
      <el-form-item :label="t('user.profile.emailChange.currentEmail')">
        <el-input :value="currentEmail" disabled />
      </el-form-item>

      <el-form-item :label="t('user.profile.emailChange.newEmail')" prop="newEmail">
        <el-input
            v-model="form.newEmail"
            type="email"
            :placeholder="t('user.profile.fields.email.placeholder')"
            autocomplete="off"
        />
      </el-form-item>

      <el-alert
          :title="t('user.profile.emailChange.infoText') || 'На текущий email будет отправлена ссылка для подтверждения'"
          type="info"
          :closable="false"
          show-icon
          style="margin-top: 10px;"
      />
    </el-form>

    <template #footer>
      <el-button @click="visible = false">
        {{ t('user.profile.emailChange.cancelButton') }}
      </el-button>
      <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
      >
        {{ t('user.profile.emailChange.requestButton') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import UserResource from '@/api/user'

const { t } = useI18n({ useScope: 'global' })
const userResource = new UserResource('users')
const formRef = ref(null)

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  currentEmail: { type: String, default: '' },
  userId: { type: [Number, String], required: true } // 🔥 КРИТИЧЕСКИ ВАЖНО: ID пользователя, чей email меняем
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const form = ref({
  newEmail: ''
})

const rules = {
  newEmail: [
    { required: true, message: t('validation.general.required') || 'Обязательное поле', trigger: 'blur' },
    { type: 'email', message: t('validation.general.email') || 'Некорректный формат email', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value && value.toLowerCase() === props.currentEmail.toLowerCase()) {
          callback(new Error(t('user.profile.emailChange.sameAsCurrent') || 'Новый email не должен совпадать с текущим'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const resetForm = () => {
  form.value.newEmail = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // 🔥 ПЕРЕДАЕМ userId ПЕРВЫМ АРГУМЕНТОМ, чтобы бэкенд знал, чей именно email менять
    await userResource.requestEmailChange(props.userId, form.value.newEmail)

    ElMessage.success(t('user.profile.emailChange.successMessage'))
    visible.value = false
    emit('success')

  } catch (error) {
    if (error !== false) { // Игнорируем ошибку валидации el-form
      ElMessage.error(error.response?.data?.message || t('user.profile.emailChange.errorMessage'))
    }
  } finally {
    loading.value = false
  }
}

// Сброс формы при закрытии
watch(visible, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style lang="scss" scoped>
// Стили минимальны, так как используются стандартные классы Element Plus
</style>

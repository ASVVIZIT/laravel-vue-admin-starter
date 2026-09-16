<template>
  <el-dialog
      v-model="visible"
      :title="isEdit ? $t('diagnostics.system_users.form_edit_title') : $t('diagnostics.system_users.form_create_title')"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
  >
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        :disabled="submitting"
    >
      <el-form-item :label="$t('diagnostics.system_users.name')" prop="name">
        <el-input
            v-model="form.name"
            :placeholder="$t('diagnostics.system_users.placeholder_name')"
            maxlength="255"
        />
      </el-form-item>

      <el-form-item :label="$t('diagnostics.system_users.email')" prop="email">
        <el-input
            v-model="form.email"
            type="email"
            :placeholder="$t('diagnostics.system_users.placeholder_email')"
            maxlength="255"
        />
      </el-form-item>

      <el-form-item :label="$t('diagnostics.system_users.role')" prop="system_role">
        <el-select
            v-model="form.system_role"
            :placeholder="$t('diagnostics.system_users.placeholder_role')"
            style="width: 100%"
        >
          <el-option
              v-for="role in roles"
              :key="role"
              :label="role"
              :value="role"
          />
        </el-select>
      </el-form-item>

      <el-form-item
          :label="isEdit ? $t('diagnostics.system_users.password_edit_label') : $t('diagnostics.system_users.password')"
          prop="password"
      >
        <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="isEdit ? $t('diagnostics.system_users.placeholder_password_edit') : $t('diagnostics.system_users.placeholder_password')"
        />
        <div v-if="isEdit" class="form-hint">
          {{ $t('diagnostics.system_users.password_edit_hint') }}
        </div>
      </el-form-item>

      <el-form-item
          v-if="form.password"
          :label="$t('diagnostics.system_users.password_confirm')"
          prop="password_confirmation"
      >
        <el-input
            v-model="form.password_confirmation"
            type="password"
            show-password
            :placeholder="$t('diagnostics.system_users.placeholder_password_confirm')"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :disabled="submitting" @click="visible = false">
        {{ $t('diagnostics.actions.cancel') }}
      </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? $t('diagnostics.actions.save_changes') : $t('diagnostics.actions.create') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
// ref, reactive, computed, watch — авто-импорт
import { useI18n } from 'vue-i18n'
import diagnostics from '@/api/diagnostics'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, default: null },
  roles: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.user?.id)

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  name: '',
  email: '',
  system_role: '',
  password: '',
  password_confirmation: ''
})

const validatePasswordMatch = (rule, value, callback) => {
  if (form.password && value !== form.password) {
    callback(new Error(t('diagnostics.system_users.password_mismatch')))
  } else {
    callback()
  }
}

const rules = computed(() => ({
  name: [{ required: true, message: t('diagnostics.system_users.required_name'), trigger: 'blur' }],
  email: [
    { required: true, message: t('diagnostics.system_users.required_email'), trigger: 'blur' },
    { type: 'email', message: t('diagnostics.system_users.invalid_email'), trigger: 'blur' }
  ],
  system_role: [{ required: true, message: t('diagnostics.system_users.required_role'), trigger: 'change' }],
  password: isEdit.value
      ? [{ min: 6, message: t('diagnostics.system_users.password_min'), trigger: 'blur' }]
      : [
        { required: true, message: t('diagnostics.system_users.required_password'), trigger: 'blur' },
        { min: 6, message: t('diagnostics.system_users.password_min'), trigger: 'blur' }
      ],
  password_confirmation: [
    { validator: validatePasswordMatch, trigger: 'blur' }
  ]
}))

watch(visible, (isOpen) => {
  if (isOpen && props.user) {
    form.name = props.user.name
    form.email = props.user.email
    form.system_role = props.user.system_role
    form.password = ''
    form.password_confirmation = ''
  } else if (isOpen) {
    form.name = ''
    form.email = ''
    form.system_role = props.roles[0] || ''
    form.password = ''
    form.password_confirmation = ''
  }
})

/**
 * Обработка сабмита формы.
 * catch без ElMessage.error — интерцептор request.js сам показывает ошибку бэкенда.
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    if (isEdit.value) {
      const payload = {
        name: form.name,
        email: form.email,
        system_role: form.system_role
      }
      if (form.password) {
        payload.password = form.password
        payload.password_confirmation = form.password_confirmation
      }
      const res = await diagnostics.updateSystemUser(props.user.id, payload)
      ElMessage.success(t('diagnostics.system_users.message_update_success'))
      emit('saved', res.data.user)
    } else {
      const res = await diagnostics.storeSystemUser({
        name: form.name,
        email: form.email,
        system_role: form.system_role,
        password: form.password,
        password_confirmation: form.password_confirmation
      })
      ElMessage.success(t('diagnostics.system_users.message_create_success'))
      emit('saved', res.data.user)
    }
    visible.value = false
  } catch {
    // Ошибка уже показана интерцептором request.js
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.3;
}
</style>

<template>
  <el-dialog
      v-model="visible"
      :title="$t('table.user.form.title.create')"
      :width="size === 'small' ? '40%' : '60%'"
      :size="size"
  >
    <div v-loading="loading" class="form-container">
      <el-form
          ref="formRef"
          status-icon
          :rules="rules"
          :model="form"
          label-position="right"
          label-width="170px"
          style="max-width: 600px;"
      >
        <el-form-item :label="$t('table.user.form.fields.role.title')" prop="role">
          <el-select :size="size" v-model="form.role" class="filter-item" :placeholder="$t('table.user.form.fields.role.placeholder')" filterable clearable>
            <el-option v-for="item in availableRoles" :key="item" :label="uppercaseFirst(item)" :value="item"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.user.form.fields.name.title')" prop="name">
          <el-input :size="size" v-model="form.name" type="text" :placeholder="$t('table.user.form.fields.name.placeholder')" clearable />
        </el-form-item>
        <el-form-item :label="$t('table.user.form.fields.email.title')" prop="email">
          <el-input :size="size" v-model="form.email" type="email" :placeholder="$t('table.user.form.fields.email.placeholder')" clearable />
        </el-form-item>
        <el-form-item :label="$t('table.user.form.fields.password.title')" prop="password">
          <el-input :size="size" v-model="form.password" type="password" show-password :placeholder="$t('table.user.form.fields.password.placeholder')" clearable />
        </el-form-item>
        <el-form-item :label="$t('table.user.form.fields.confirmPassword.title')" prop="confirmPassword">
          <el-input :size="size" v-model="form.confirmPassword" type="password" show-password :placeholder="$t('table.user.form.fields.confirmPassword.placeholder')" clearable />
        </el-form-item>
        <el-form-item :label="$t('table.user.form.fields.sex.title')">
          <el-radio-group v-model="form.sex">
            <el-radio :size="size" :value="0">{{ $t('table.user.form.fields.male.title') }}</el-radio>
            <el-radio :size="size" :value="1">{{ $t('table.user.form.fields.female.title') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('table.user.form.fields.birthday.title')">
          <el-date-picker
              v-model="form.birthday_model"
              :size="size"
              type="datetime"
              :placeholder="$t('table.user.form.fields.birthday.placeholder')"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
          />
        </el-form-item>
        <el-form-item :label="$t('table.user.form.fields.description.title')">
          <el-input
              v-model="form.description"
              :size="size"
              maxlength="255"
              :placeholder="$t('table.user.form.fields.description.placeholder')"
              show-word-limit
              type="textarea"
              clearable
          />
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button :size="size" @click="visible = false">{{ $t('table.general.cancel') }}</el-button>
        <el-button :size="size" type="primary" @click="handleSubmit">{{ $t('table.general.confirm') }}</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import createValidators from '@/utils/validators'
import UserResource from '@/api/user'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  size: { type: String, default: 'small' },
  roles: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'success'])
const { t } = useI18n()
const userResource = new UserResource()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const loading = ref(false)

const availableRoles = computed(() => {
  const hasAdmin = props.roles.some(r => ['superadmin', 'admin'].includes(r))
  return hasAdmin ? props.roles : props.roles.filter(r => !['superadmin', 'admin'].includes(r))
})

const form = ref({
  role: 'user', name: '', email: '', password: '', confirmPassword: '',
  sex: 0, birthday_model: null, description: ''
})

const v = createValidators(form.value)
const rules = {
  name: [v.required(), v.minLength(2)],
  email: [v.required(), v.email()],
  password: [v.required(), v.minLength(6)],
  confirmPassword: [v.required(), v.match('password', t('validation.general.matchPassword'))]
}

watch(() => props.modelValue, (val) => {
  if (val) {
    form.value = { role: 'user', name: '', email: '', password: '', confirmPassword: '', sex: 0, birthday_model: null, description: '' }
    formRef.value?.clearValidate()
  }
})

const handleSubmit = async () => {
  if (!await formRef.value?.validate()) return
  loading.value = true
  try {
    const userData = {
      ...form.value,
      roles: [form.value.role],
      birthday: form.value.birthday_model || null
    }
    await userResource.store(userData)
    ElMessage.success(t('table.user.elMessage.created.success.message'))
    visible.value = false
    emit('success')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || t('table.user.elMessage.created.success.error'))
  } finally {
    loading.value = false
  }
}

const uppercaseFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: left;
  padding-top: 0;
  margin-left: 150px;
}
</style>

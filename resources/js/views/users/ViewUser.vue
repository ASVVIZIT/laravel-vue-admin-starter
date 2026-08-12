<template>
  <el-card class="app-container">
    <div class="view-header">
      <h2>{{ t('users.viewTitle') }}: {{ user.name }}</h2>
      <el-tag :type="getStatusTagType(user.status_type)" effect="dark" size="large">
        {{ getStatusLabel(user.status_type) }}
      </el-tag>
    </div>

    <div v-if="user.id" class="user-details">
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('table.user.columns.id')">{{ user.id }}</el-descriptions-item>
        <el-descriptions-item :label="t('table.user.columns.name')">{{ user.name }}</el-descriptions-item>
        <el-descriptions-item :label="t('table.user.columns.email')">{{ user.email }}</el-descriptions-item>
        <el-descriptions-item :label="t('table.user.columns.role')">
          <el-tag
              v-for="role in user.roles"
              :key="role"
              :type="roleConfig.getColor(role)"
              class="role-tag"
              effect="dark"
          >
            {{ role }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('table.user.form.fields.sex.title')">
          {{ user.sex === 0 ? t('table.user.form.fields.male.title') : t('table.user.form.fields.female.title') }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('table.user.form.fields.birthday.title')">
          {{ user.birthday ? dayjs(user.birthday).format('YYYY-MM-DD') : '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('table.user.form.fields.description.title')" :span="2">
          {{ user.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('users.status.label')">
          <el-tag :type="getStatusTagType(user.status_type)" effect="dark">
            {{ getStatusLabel(user.status_type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('users.deletedAt')">
          {{ user.deleted_at ? dayjs(user.deleted_at).format('YYYY-MM-DD HH:mm:ss') : '-' }}
        </el-descriptions-item>

        <el-descriptions-item :label="'Email подтвержден'">
          <el-tag :type="user.email_verified ? 'success' : 'danger'" size="small">
            {{ user.email_verified ? 'Да' : 'Нет' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="'Первичная проверка'">
          {{ user.email_verified_at ? dayjs(user.email_verified_at).format('DD.MM.YYYY HH:mm') : '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="'Последняя перепроверка'">
          {{ user.email_reverified_at ? dayjs(user.email_reverified_at).format('DD.MM.YYYY HH:mm') : 'Не проводилась' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="action-buttons">
        <el-button @click="goBack" :size="store.size">
          {{ t('table.general.cancel') }}
        </el-button>
        <el-button
            v-if="user.status_type === 'trashed' && checkPermission(['manage user'])"
            type="success"
            :size="store.size"
            @click="handleRestoreUser"
        >
          {{ t('users.actions.restore') }}
        </el-button>
      </div>
    </div>

    <div v-else v-loading="loading" class="loading-container">
      <p>{{ t('common.submitting') }}</p>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserResource from '@/api/user'
import checkPermission from '@/utils/permission'
import { appStore } from '@/store/appStore'
import dayjs from 'dayjs'

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const store = appStore()
const userResource = new UserResource()

const user = ref({})
const loading = ref(true)

const roleConfig = {
  colors: {
    superadmin: 'danger',
    admin: 'danger',
    manager: 'warning',
    editor: 'primary',
    user: 'success',
    visitor: 'info'
  },
  getColor(role) {
    return this.colors[role] || 'info'
  }
}

const getStatusTagType = (statusType) => {
  const types = {
    active: 'success',
    banned: 'danger',
    trashed: 'info',
    unverified: 'warning'
  }
  return types[statusType] || 'info'
}

const getStatusLabel = (statusType) => {
  return t(`users.status.${statusType}`)
}

const loadUser = async () => {
  loading.value = true
  try {
    const userId = route.params.id
    console.log('[ViewUser] Loading user:', userId)

    const response = await userResource.show(userId)
    console.log('[ViewUser] Response:', response)

    // Обработка разных форматов ответа
    // Вариант 1: { data: { user: {...} } }
    // Вариант 2: { user: {...} } (прямой ресурс)
    // Вариант 3: { id: ..., name: ... } (сырой объект)

    if (response?.data?.user) {
      user.value = response.data.user
    } else if (response?.data?.id) {
      user.value = response.data
    } else if (response?.user) {
      user.value = response.user
    } else if (response?.id) {
      user.value = response
    } else {
      console.error('[ViewUser] Unexpected response format:', response)
      ElMessage.error('Неверный формат ответа сервера')
      goBack()
      return
    }

    console.log('[ViewUser] User loaded:', user.value)
  } catch (error) {
    console.error('[ViewUser] Error:', error)
    ElMessage.error(error.response?.data?.error || error.message || 'Ошибка загрузки пользователя')
    goBack()
  } finally {
    loading.value = false
  }
}

const handleRestoreUser = async () => {
  try {
    await ElMessageBox.confirm(
        t('users.dialogs.restoreConfirm', { name: user.value.name }),
        t('users.dialogs.restoreTitle'),
        {
          confirmButtonText: t('table.general.confirm'),
          cancelButtonText: t('table.general.cancel'),
          type: 'warning'
        }
    )
    await userResource.restore(user.value.id)
    ElMessage.success(t('users.messages.restoreSuccess'))
    goBack()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('users.messages.restoreError'))
    }
  }
}

const goBack = () => {
  router.push('/administrator/users')
}

onMounted(() => {
  loadUser()
})
</script>

<style lang="scss" scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
  }
}

.user-details {
  .role-tag {
    margin: 2px;
  }
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  gap: 10px;
}

.loading-container {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

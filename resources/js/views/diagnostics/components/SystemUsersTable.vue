<template>
  <el-card shadow="never" class="system-users">
    <template #header>
      <div class="header">
        <span>{{ $t('diagnostics.system_users.title') }}</span>
        <div class="header-actions">
          <el-tag type="info" size="small" class="mr-2">
            {{ $t('diagnostics.system_users.count', { count: users.length }) }}
          </el-tag>
          <el-button
              type="warning"
              size="small"
              @click="handleReset"
              :loading="resetting"
              :icon="IconEpRefresh"
          >
            {{ $t('diagnostics.system_users.reset') }}
          </el-button>
        </div>
      </div>
    </template>

    <el-table :data="users" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" :label="$t('diagnostics.system_users.name')" />
      <el-table-column prop="email" :label="$t('diagnostics.system_users.email')" />
      <el-table-column prop="system_role" :label="$t('diagnostics.system_users.role')" width="140" />
      <el-table-column :label="$t('diagnostics.system_users.verified')" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.email_verified_at ? 'success' : 'warning'" size="small">
            {{ row.email_verified_at ? '✓' : '✗' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('diagnostics.system_users.banned')" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.banned ? 'danger' : 'success'" size="small">
            {{ row.banned ? '✓' : '✗' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('diagnostics.system_users.trashed')" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.deleted_at ? 'danger' : 'success'" size="small">
            {{ row.deleted_at ? '✓' : '✗' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
// ref, onMounted, ElMessage, ElMessageBox подхватываются автоматически через unplugin-auto-import
// IconEpRefresh подхватывается через unplugin-icons (или можно оставить импорт, если резолвер так настроен)
import IconEpRefresh from '~icons/ep/refresh'
import diagnosticsApi from '@/api/diagnostics'

const users = ref([])
const loading = ref(false)
const resetting = ref(false)

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await diagnosticsApi.getSystemUsers()
    // Безопасный доступ: учитываем, что request.js может возвращать как res.data, так и res.data.data
    users.value = res.data?.users || res.data?.data?.users || []
  } catch (error) {
    console.error('Ошибка загрузки системных пользователей:', error)
    const errorMsg = error.response?.data?.message || 'Ошибка загрузки системных пользователей'
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
        'Это действие полностью удалит текущих тестовых пользователей и создаст их заново с паролями по умолчанию. Продолжить?',
        'Подтверждение сброса',
        {
          type: 'warning',
          confirmButtonText: 'Да, сбросить',
          cancelButtonText: 'Отмена'
        }
    )

    resetting.value = true
    await diagnosticsApi.resetSystemUsers()
    ElMessage.success('Системные пользователи успешно сброшены')

    // Перезагружаем таблицу
    await fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Ошибка при сбросе пользователей:', error)
      const errorMsg = error.response?.data?.message || 'Ошибка при сбросе пользователей'
      ElMessage.error(errorMsg)
    }
  } finally {
    resetting.value = false
  }
}

onMounted(fetchUsers)
</script>

<style scoped lang="scss">
.system-users {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-actions {
    display: flex;
    align-items: center;
  }
  .mr-2 {
    margin-right: 12px;
  }
}
</style>

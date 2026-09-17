<template>
  <div class="system-users-wrapper">
    <!-- Шапка: счётчик + кнопки Создать / Сбросить -->
    <div class="system-users-header">
      <div class="users-info">
        <el-tag type="info" effect="plain">
          {{ $t('diagnostics.system_users.count', { count: users.length }) }}
        </el-tag>
      </div>
      <div class="users-actions-top">
        <el-button type="primary" :icon="IconEpPlus" @click="openCreate">
          {{ $t('diagnostics.system_users.create') }}
        </el-button>
        <el-button
            type="warning"
            :icon="IconEpRefresh"
            :loading="resetting"
            @click="handleReset"
        >
          {{ $t('diagnostics.system_users.reset') }}
        </el-button>
      </div>
    </div>

    <!-- Таблица системных пользователей -->
    <el-table
        :data="users"
        v-loading="loading"
        style="width: 100%"
        border
        :row-class-name="rowClassName"
    >
      <el-table-column prop="name" :label="$t('diagnostics.system_users.name')" min-width="210" />
      <el-table-column prop="email" :label="$t('diagnostics.system_users.email')" min-width="240" />

      <el-table-column prop="system_role" :label="$t('diagnostics.system_users.role')" width="160">
        <template #default="{ row }">
          <el-tag size="small">{{ row.system_role }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('diagnostics.system_users.verified')" width="180" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.email_verified_at" type="success" size="small">
            {{ $t('diagnostics.system_users.verified') }}
          </el-tag>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('diagnostics.system_users.banned')" width="150" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.banned" type="danger" size="small">
            {{ $t('diagnostics.system_users.banned') }}
          </el-tag>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- Корзина: тег «Удалён» + иконка окончательного удаления (бонус-режим) -->
      <el-table-column :label="$t('diagnostics.system_users.trashed')" width="110" align="center">
        <template #default="{ row }">
          <div v-if="row.deleted_at" class="trashed-cell">
            <el-tag type="info" effect="dark" size="small">
              {{ $t('diagnostics.system_users.trashed') }}
            </el-tag>
            <el-tooltip
                :content="$t('diagnostics.system_users.tooltip_force_delete')"
                placement="top"
                effect="dark"
            >
              <el-icon
                  class="force-delete-icon"
                  @click.stop="handleForceDelete(row)"
              >
                <IconEpDelete />
              </el-icon>
            </el-tooltip>
          </div>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>

      <!-- P2: колонка действий (кнопки всегда видны, disabled + tooltip) -->
      <el-table-column :label="$t('diagnostics.action')" width="420" align="center" fixed="right">
        <template #default="{ row }">
          <SystemUserActions
              :user="row"
              :loading="actionLoadingId === row.id"
              @edit="openEdit"
              @delete="handleDelete"
              @restore="handleRestore"
              @ban="handleBan"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- Модалка создания / редактирования -->
    <UserFormModal
        v-model="formVisible"
        :user="currentUser"
        :roles="roles"
        @saved="onUserSaved"
    />
  </div>
</template>

<script setup>
// ref, onMounted, ElMessage, ElMessageBox — авто-импорт (unplugin-auto-import)
import { useI18n } from 'vue-i18n'
import IconEpPlus from '~icons/ep/plus'
import IconEpRefresh from '~icons/ep/refresh'
import IconEpDelete from '~icons/ep/delete'
import diagnostics from '@/api/diagnostics'
import SystemUserActions from './actions/SystemUserActions.vue'
import UserFormModal from './UserFormModal.vue'

const { t } = useI18n()

const loading = ref(false)
const resetting = ref(false)
const users = ref([])
const roles = ref([])

const formVisible = ref(false)
const currentUser = ref(null)

// id строки, над которой идёт операция (блокирует кнопки строки)
const actionLoadingId = ref(null)

/**
 * Загрузка списка системных пользователей.
 * catch без ElMessage.error — интерцептор request.js сам показывает ошибку.
 */
const loadUsers = async () => {
  loading.value = true
  try {
    const res = await diagnostics.getSystemUsers()
    users.value = res.data.users
    roles.value = res.data.roles || []
  } catch {
    // Ошибка уже показана интерцептором request.js
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})

// Удалённые строки — приглушённые
const rowClassName = ({ row }) => (row.deleted_at ? 'row-trashed' : '')

// ============================================================================
// СОЗДАНИЕ / РЕДАКТИРОВАНИЕ
// ============================================================================

const openCreate = () => {
  currentUser.value = null
  formVisible.value = true
}

const openEdit = (user) => {
  currentUser.value = user
  formVisible.value = true
}

const onUserSaved = () => {
  loadUsers()
}

// ============================================================================
// УДАЛЕНИЕ / ВОССТАНОВЛЕНИЕ / БАН / СБРОС
// catch-блоки БЕЗ ElMessage.error — интерцептор request.js уже показывает ошибку
// ============================================================================

const handleDelete = async (user) => {
  try {
    await ElMessageBox.confirm(
        t('diagnostics.system_users.confirm_delete', { name: user.name }),
        t('diagnostics.system_users.confirm_delete_title'),
        {
          confirmButtonText: t('diagnostics.actions.confirm'),
          cancelButtonText: t('diagnostics.actions.cancel'),
          type: 'warning'
        }
    )
  } catch {
    return // отмена
  }

  actionLoadingId.value = user.id
  try {
    await diagnostics.deleteSystemUser(user.id)
    ElMessage.success(t('diagnostics.system_users.message_delete_success'))
    loadUsers()
  } catch {
    // Ошибка уже показана интерцептором
  } finally {
    actionLoadingId.value = null
  }
}

const handleRestore = async (user) => {
  try {
    await ElMessageBox.confirm(
        t('diagnostics.system_users.confirm_restore', { name: user.name }),
        t('diagnostics.system_users.confirm_restore_title'),
        {
          confirmButtonText: t('diagnostics.actions.confirm'),
          cancelButtonText: t('diagnostics.actions.cancel'),
          type: 'info'
        }
    )
  } catch {
    return
  }

  actionLoadingId.value = user.id
  try {
    await diagnostics.restoreSystemUser(user.id)
    ElMessage.success(t('diagnostics.system_users.message_restore_success'))
    loadUsers()
  } catch {
    // Ошибка уже показана интерцептором
  } finally {
    actionLoadingId.value = null
  }
}

/**
 * Бонус-режим: окончательное удаление из корзины (force delete).
 * Необратимо — модалка с type: 'error' и красной кнопкой подтверждения.
 */
const handleForceDelete = async (user) => {
  try {
    await ElMessageBox.confirm(
        t('diagnostics.system_users.confirm_force_delete', { name: user.name }),
        t('diagnostics.system_users.confirm_force_delete_title'),
        {
          confirmButtonText: t('diagnostics.actions.confirm'),
          cancelButtonText: t('diagnostics.actions.cancel'),
          type: 'error',
          confirmButtonClass: 'el-button--danger'
        }
    )
  } catch {
    return // отмена
  }

  actionLoadingId.value = user.id
  try {
    await diagnostics.forceDeleteSystemUser(user.id)
    ElMessage.success(t('diagnostics.system_users.message_force_delete_success'))
    loadUsers()
  } catch {
    // Ошибка уже показана интерцептором request.js
  } finally {
    actionLoadingId.value = null
  }
}

const handleBan = async (user) => {
  // Задел на будущее. Кнопка disabled в SystemUserActions, сюда не попадём.
  // Когда будет готов бэкенд — вызовем diagnostics.banSystemUser(user.id)
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
        t('diagnostics.system_users.confirm_reset'),
        t('diagnostics.system_users.confirm_reset_title'),
        {
          confirmButtonText: t('diagnostics.actions.confirm'),
          cancelButtonText: t('diagnostics.actions.cancel'),
          type: 'warning'
        }
    )
  } catch {
    return
  }

  resetting.value = true
  try {
    await diagnostics.resetSystemUsers()
    ElMessage.success(t('diagnostics.system_users.message_reset_success'))
    loadUsers()
  } catch {
    // Ошибка уже показана интерцептором
  } finally {
    resetting.value = false
  }
}
</script>

<style scoped lang="scss">
.system-users-wrapper {
  .system-users-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;

    .users-info {
      display: flex;
      align-items: center;
    }

    .users-actions-top {
      display: flex;
      gap: 8px;
    }
  }

  .text-muted {
    color: #909399;
  }

  // Корзина: тег «Удалён» + круглая danger-кнопка в одну линию
  .trashed-cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  // Круглая danger-кнопка окончательного удаления
  .force-delete-btn {
    // Компактный размер, чтобы влезать в колонку 110px вместе с тегом
    --el-button-size: 24px;

    // Чуть мягче стандартного danger на строке, которая и так приглушённая
    opacity: 0.85;
    transition: opacity 0.2s, transform 0.15s;

    &:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    // Когда кнопка в loading — не прыгает
    &:deep(.el-loading-spinner) {
      margin-top: -8px;
    }
  }

  // Иконка корзины: danger-красная, hover — темнее и чуть крупнее
  .force-delete-icon {
    color: #f56c6c;
    cursor: pointer;
    font-size: 14px;
    transition: color 0.2s, transform 0.15s;

    &:hover {
      color: #c45656;
      transform: scale(1.15);
    }
  }

  // Приглушённые строки удалённых пользователей.
  // ВАЖНО: без opacity — иначе fixed-колонка просвечивает при горизонтальном скролле
  :deep(.row-trashed) {
    td {
      background-color: #fafafa !important;
      color: #909399 !important;
    }

    // Сплошной фон для зафиксированной колонки действий
    td.el-table-fixed-column--right {
      background-color: #ffffff !important;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
    }
  }
}
</style>

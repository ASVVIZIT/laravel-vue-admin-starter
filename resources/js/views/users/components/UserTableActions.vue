<template>
  <div class="user-table-actions">
    <!-- ========================================== -->
    <!-- ЕСЛИ ЭТО АДМИНИСТРАТОР (superadmin/admin)  -->
    <!-- ========================================== -->
    <div v-if="isAdmin(row.roles)" class="admin-actions">
      <!-- 1. Кнопка "Редактировать" -->
      <el-tooltip :content="$t('users.actions.edit')" placement="top" v-if="checkPermission(['manage user edit'])">
        <el-button type="primary" :size="size" :round="true" @click="$emit('action', 'edit-item', row)">
          <el-icon><EditPen /></el-icon>
        </el-button>
      </el-tooltip>

      <!-- 2. Кнопка "Права" -->
      <el-tooltip :content="$t('users.actions.permissions')" placement="top" v-if="checkPermission(['manage permission'])">
        <el-button type="permission" :size="size" :round="true" @click="$emit('action', 'edit-permission-item', row)">
          <el-icon><Finished /></el-icon>
        </el-button>
      </el-tooltip>

      <!-- Компактная группа тегов с распределением прав -->
      <div class="permissions-tags-group" v-if="checkPermission(['manage permission']) && row.perm_counts">
        <el-tooltip :content="$t('users.permissions.tooltip.role_view')" placement="top">
          <el-tag size="small" class="perm-tag role-tag">{{ row.perm_counts.role_view }}</el-tag>
        </el-tooltip>
        <el-tooltip :content="$t('users.permissions.tooltip.role_manage')" placement="top">
          <el-tag size="small" class="perm-tag role-tag">{{ row.perm_counts.role_manage }}</el-tag>
        </el-tooltip>
        <el-tooltip :content="$t('users.permissions.tooltip.user_view')" placement="top">
          <el-tag size="small" class="perm-tag user-tag">{{ row.perm_counts.user_view }}/{{ row.perm_counts.total_user_view }}</el-tag>
        </el-tooltip>
        <el-tooltip :content="$t('users.permissions.tooltip.user_manage')" placement="top">
          <el-tag size="small" class="perm-tag user-tag">{{ row.perm_counts.user_manage }}/{{ row.perm_counts.total_user_manage }}</el-tag>
        </el-tooltip>
      </div>

      <!-- Подсказка о возможностях редактирования -->
      <span class="admin-hint">
        {{ $t('users.actions.adminEditHint') || 'Профиль доступен, права защищены' }}
      </span>
    </div>

    <!-- ========================================== -->
    <!-- ЕСЛИ ЭТО НЕ АДМИНИСТРАТОР                  -->
    <!-- ========================================== -->
    <div v-else>
      <el-button-group :size="size">
        <!-- СТАТУС: УДАЛЁННЫЙ (Soft-deleted) -->
        <template v-if="getUserActionType(row) === 'trashed'">
          <el-tooltip :content="$t('users.actions.view')" placement="top">
            <el-button type="info" :size="size" :round="true" @click="$emit('action', 'view-item', row)">
              <el-icon><View /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip :content="$t('users.actions.restore')" placement="top" v-if="checkPermission(['manage user'])">
            <el-button type="success" :size="size" :round="true" @click="$emit('action', 'restore-item', row)">
              <el-icon><RefreshRight /></el-icon>
            </el-button>
          </el-tooltip>
        </template>

        <!-- СТАТУС: ЗАБАНЕННЫЙ -->
        <template v-else-if="getUserActionType(row) === 'banned'">
          <el-tooltip :content="$t('users.actions.unban')" placement="top" v-if="checkPermission(['manage user'])">
            <el-button type="success" :size="size" :round="true" @click="$emit('action', 'unban-item', row)">
              <el-icon><Unlock /></el-icon>
            </el-button>
          </el-tooltip>
        </template>

        <!-- СТАТУС: АКТИВНЫЙ / НЕПОДТВЕРЖДЁННЫЙ -->
        <template v-else>
          <el-tooltip :content="$t('users.actions.edit')" placement="top" v-if="checkPermission(['manage user edit'])">
            <el-button type="primary" :size="size" :round="true" @click="$emit('action', 'edit-item', row)">
              <el-icon><EditPen /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip :content="$t('users.actions.delete')" placement="top" v-if="checkPermission(['manage user delete'])">
            <el-button type="danger" :size="size" :round="false" @click="$emit('action', 'delete-item', row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip :content="$t('users.actions.ban')" placement="top" v-if="checkPermission(['manage user'])">
            <el-button type="warning" :size="size" :round="true" @click="$emit('action', 'ban-item', row)">
              <el-icon><Lock /></el-icon>
            </el-button>
          </el-tooltip>
        </template>

        <!-- Кнопка "Права" + Группа тегов для обычных пользователей -->
        <template v-if="checkPermission(['manage permission'])">
          <el-tooltip :content="$t('users.actions.permissions')" placement="top">
            <el-button type="permission" :size="size" :round="true" @click="$emit('action', 'edit-permission-item', row)">
              <el-icon><Finished /></el-icon>
            </el-button>
          </el-tooltip>

          <div class="permissions-tags-group" v-if="row.perm_counts">
            <el-tooltip :content="$t('users.permissions.tooltip.role_view')" placement="top">
              <el-tag size="small" class="perm-tag role-tag">{{ row.perm_counts.role_view }}</el-tag>
            </el-tooltip>
            <el-tooltip :content="$t('users.permissions.tooltip.role_manage')" placement="top">
              <el-tag size="small" class="perm-tag role-tag">{{ row.perm_counts.role_manage }}</el-tag>
            </el-tooltip>
            <el-tooltip :content="$t('users.permissions.tooltip.user_view')" placement="top">
              <el-tag size="small" class="perm-tag user-tag">{{ row.perm_counts.user_view }}/{{ row.perm_counts.total_user_view }}</el-tag>
            </el-tooltip>
            <el-tooltip :content="$t('users.permissions.tooltip.user_manage')" placement="top">
              <el-tag size="small" class="perm-tag user-tag">{{ row.perm_counts.user_manage }}/{{ row.perm_counts.total_user_manage }}</el-tag>
            </el-tooltip>
          </div>
        </template>
      </el-button-group>
    </div>

    <!-- ========================================== -->
    <!-- 🔥 АДМИНИСТРАТИВНОЕ ПОДТВЕРЖДЕНИЕ EMAIL (ВНЕ ЗАВИСИМОСТИ ОТ РОЛИ ПОЛЬЗОВАТЕЛЯ В СТРОКЕ) -->
    <!-- ========================================== -->
    <template v-if="row.has_pending_email_change && checkPermission(['confirm user email'])">
      <el-divider direction="vertical" />

      <!-- Кнопка 1: Подтвердить старую почту -->
      <el-tooltip :content="$t('users.actions.adminConfirmOld')" placement="top" v-if="!row.old_email_confirmed">
        <el-button type="warning" :size="size" :round="true" @click="$emit('action', 'admin-confirm-old', row)">
          <el-icon><Message /></el-icon>
        </el-button>
      </el-tooltip>

      <!-- Кнопка 2: Подтвердить новую почту -->
      <el-tooltip :content="$t('users.actions.adminConfirmNew')" placement="top" v-if="row.old_email_confirmed">
        <el-button type="success" :size="size" :round="true" @click="$emit('action', 'admin-confirm-new', row)">
          <el-icon><CircleCheck /></el-icon>
        </el-button>
      </el-tooltip>
    </template>
  </div>
</template>

<script setup>
import { EditPen, Delete, Lock, Unlock, View, RefreshRight, Finished, Message, CircleCheck } from '@element-plus/icons-vue'
import { getUserActionType, isAdmin } from '@/utils/userStatus'
import checkPermission from '@/utils/permission'

const props = defineProps({
  row: { type: Object, required: true },
  size: { type: String, default: 'small' }
})

defineEmits(['action'])
</script>

<style lang="scss" scoped>
.user-table-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 6px;

  .admin-hint {
    font-style: italic;
    font-weight: 300;
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    white-space: nowrap;
  }
}

// Контейнер для группы тегов
.permissions-tags-group {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
}

// Базовые стили для мини-тегов
.perm-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 5px;
  height: 18px;
  line-height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
  cursor: help;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

// Серые теги для прав, унаследованных от роли
.role-tag {
  background-color: var(--el-fill-color);
  border: 1px solid var(--el-border-color);
  color: var(--el-text-color-regular);
}

// Цветные (зеленоватые) теги для персональных прав пользователя
.user-tag {
  background-color: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-7);
  color: var(--el-color-success);
}
</style>

<template>
  <div class="user-table-actions">
    <el-button-group :size="size">
      <!-- Админы (superadmin/admin) — только view + permissions, защищён от редактирования -->
      <template v-if="isAdmin(row.roles)">
        <el-tooltip :content="$t('users.actions.edit')" placement="top" v-if="checkPermission(['manage user edit'])">
          <el-button type="primary" :size="size" :round="true" @click="$emit('action', 'edit-item', row)">
            <el-icon><EditPen /></el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip :content="$t('users.actions.permissions')" placement="top" v-if="checkPermission(['manage permission'])">
          <el-button type="permission" :size="size" :round="true" @click="$emit('action', 'edit-permission-item', row)">
            <el-icon><Finished /></el-icon>
          </el-button>
        </el-tooltip>
      </template>

      <template v-else>
        <!-- 🔴 Удалённые (trashed) -->
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

        <!-- 🔴 Забаненные (banned) -->
        <template v-else-if="getUserActionType(row) === 'banned'">
          <el-tooltip :content="$t('users.actions.unban')" placement="top" v-if="checkPermission(['manage user'])">
            <el-button type="success" :size="size" :round="true" @click="$emit('action', 'unban-item', row)">
              <el-icon><Unlock /></el-icon>
            </el-button>
          </el-tooltip>
        </template>

        <!-- 🟡 Не подтверждённые (unverified) — 🔥 НОВАЯ ВЕТКА P0-ФИКС -->
        <template v-else-if="getUserActionType(row) === 'unverified'">
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

        <!-- 🟢 Активные (active) — стандартный набор -->
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

        <!-- Права доступа (permissions) — для всех не-админов -->
        <el-tooltip :content="$t('users.actions.permissions')" placement="top" v-if="checkPermission(['manage permission'])">
          <el-button type="permission" :size="size" :round="true" @click="$emit('action', 'edit-permission-item', row)">
            <el-icon><Finished /></el-icon>
          </el-button>
        </el-tooltip>
      </template>

      <!-- 🔥 Кнопки подтверждения email (админский поток смены email) -->
      <el-tooltip :content="$t('users.actions.adminConfirmOld')" placement="top" v-if="showEmailConfirm && !row.old_email_confirmed">
        <el-button type="warning" :size="size" :round="true" @click="$emit('action', 'admin-confirm-old', row)">
          <el-icon><Message /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip :content="$t('users.actions.adminConfirmNew')" placement="top" v-if="showEmailConfirm && row.old_email_confirmed">
        <el-button type="success" :size="size" :round="true" @click="$emit('action', 'admin-confirm-new', row)">
          <el-icon><CircleCheck /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip :content="$t('users.actions.resendNewEmail')" placement="top" v-if="showEmailConfirm && row.old_email_confirmed">
        <el-button type="primary" plain :size="size" :round="true" class="resend-email-btn" @click="$emit('action', 'resend-new-email', row)">
          <el-icon><Message /></el-icon>
          <el-icon class="resend-indicator"><Promotion /></el-icon>
        </el-button>
      </el-tooltip>
    </el-button-group>

    <!-- 📊 Сигнал статистики прав (тултип с деталями) -->
    <el-tooltip v-if="showStats" placement="top" effect="dark" popper-class="perm-stats-popper">
      <template #content>
        <div class="perm-stats-tooltip">
          <div class="stat-line">
            <span><i class="dot dot-role-view"></i>{{ $t('users.permissions.tooltip.role_view') }}</span>
            <b>{{ row.perm_counts.role_view }}</b>
          </div>
          <div class="stat-line">
            <span><i class="dot dot-role-manage"></i>{{ $t('users.permissions.tooltip.role_manage') }}</span>
            <b>{{ row.perm_counts.role_manage }}</b>
          </div>
          <div class="stat-line">
            <span><i class="dot dot-user-view"></i>{{ $t('users.permissions.tooltip.user_view') }}</span>
            <b>{{ row.perm_counts.user_view }}/{{ row.perm_counts.total_user_view }}</b>
          </div>
          <div class="stat-line">
            <span><i class="dot dot-user-manage"></i>{{ $t('users.permissions.tooltip.user_manage') }}</span>
            <b>{{ row.perm_counts.user_manage }}/{{ row.perm_counts.total_user_manage }}</b>
          </div>
        </div>
      </template>
      <span class="stats-signal">
        <i v-for="(bar, index) in statsBars" :key="index" :class="'bar bar-' + (index + 1)" :style="{ height: bar + '%' }"></i>
      </span>
    </el-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { EditPen, Delete, Lock, Unlock, View, RefreshRight, Finished, Message, CircleCheck, Promotion } from '@element-plus/icons-vue'
import { getUserActionType, isAdmin } from '@/utils/userStatus'
import checkPermission from '@/utils/permission'

const props = defineProps({
  row: { type: Object, required: true },
  size: { type: String, default: 'small' }
})

defineEmits(['action'])

const showEmailConfirm = computed(() => props.row.has_pending_email_change && checkPermission(['confirm user email']))

const showStats = computed(() => checkPermission(['manage permission']) && !!props.row.perm_counts)

const statsBars = computed(() => {
  const counts = props.row.perm_counts
  if (!counts) return [20, 20, 20, 20]
  const values = [counts.role_view, counts.role_manage, counts.user_view, counts.user_manage]
  const max = Math.max(...values, 1)
  return values.map(v => Math.max(20, Math.round((v / max) * 100)))
})
</script>

<style lang="scss" scoped>
.user-table-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  row-gap: 4px;
}

.resend-email-btn {
  position: relative;

  .resend-indicator {
    position: absolute;
    top: -6px;
    right: -6px;
    font-size: 9px;
    color: #fff;
    background: var(--el-color-primary);
    border-radius: 50%;
    padding: 2px;
    box-shadow: 0 0 0 1px var(--el-fill-color-blank);
  }
}

.stats-signal {
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  height: 16px;
  width: 22px;
  padding: 2px 4px;
  margin: 2px 0;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-fill-color-light);
  cursor: help;
  flex-shrink: 0;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary-light-5);
  }

  .bar {
    width: 3px;
    border-radius: 1px;
    min-height: 2px;
  }

  .bar-1 { background: #909399; }
  .bar-2 { background: #606266; }
  .bar-3 { background: #67c23a; }
  .bar-4 { background: #85ce61; }
}
</style>

<style lang="scss">
.perm-stats-tooltip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  line-height: 1.4;

  .stat-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    span {
      display: inline-flex;
      align-items: center;
    }

    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 2px;
      margin-right: 6px;
    }

    .dot-role-view { background: #909399; }
    .dot-role-manage { background: #606266; }
    .dot-user-view { background: #67c23a; }
    .dot-user-manage { background: #85ce61; }
  }
}
</style>

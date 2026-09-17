<template>
  <div class="system-user-actions">
    <ActionButton
        v-for="(action, key) in actionsConfig"
        :key="key"
        :type="action.type"
        :icon="action.icon"
        :label-key="action.labelKey"
        :disabled="action.disabled"
        :disabled-reason-key="action.disabledReasonKey"
        :loading="loading && activeAction === key"
        :hide-label="action.hideLabel"
        @click="handleAction(key, action.event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import IconEpEdit from '~icons/ep/edit'
import IconEpDelete from '~icons/ep/delete'
import IconEpRefreshLeft from '~icons/ep/refresh-left'
import IconEpLock from '~icons/ep/lock' // 🔥 Иконка для Бана
import ActionButton from './ActionButton.vue'

const props = defineProps({
  user: { type: Object, required: true },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['edit', 'delete', 'restore', 'ban'])

const isTrashed = computed(() => !!props.user.deleted_at)

// 🔥 Единый конфиг кнопок действий
const actionsConfig = computed(() => ({
  edit: {
    type: 'primary',
    icon: IconEpEdit,
    labelKey: 'diagnostics.actions.edit',
    disabled: isTrashed.value,
    disabledReasonKey: isTrashed.value ? 'diagnostics.system_users.tooltip_edit_trashed' : null,
    event: 'edit'
  },
  delete: {
    type: 'danger',
    icon: IconEpDelete,
    labelKey: 'diagnostics.actions.delete',
    disabled: isTrashed.value,
    disabledReasonKey: isTrashed.value ? 'diagnostics.system_users.tooltip_delete_trashed' : null,
    event: 'delete'
  },
  restore: {
    type: 'success',
    icon: IconEpRefreshLeft,
    labelKey: 'diagnostics.actions.restore',
    disabled: !isTrashed.value,
    disabledReasonKey: !isTrashed.value ? 'diagnostics.system_users.tooltip_restore_alive' : null,
    event: 'restore'
  },
  ban: {
    type: 'warning',
    icon: IconEpLock,
    labelKey: 'diagnostics.actions.ban',
    disabled: true, // Пока нет бэкенда
    disabledReasonKey: null,
    tooltipKey: 'diagnostics.actions.ban_user', // 🔥 Реальное действие
    event: 'ban',
    hideLabel: false
  }
}))

const activeAction = computed(() => props.loading ? Object.keys(actionsConfig.value).find(key => actionsConfig.value[key].event === props.user._currentAction) : null)

const handleAction = (key, event) => {
  // Можно добавить локальный лоадинг для конкретной кнопки, если нужно
  emit(event, props.user)
}
</script>

<style scoped lang="scss">
.system-user-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  // 🔥 МЕДИА-ЗАПРОС: на экранах < 800px скрываем текст, оставляем только иконки
  @media (max-width: 800px) {
    :deep(.action-label) {
      display: none !important;
    }
    :deep(.action-button) {
      padding: 5px !important; // Делаем кнопку квадратной под размер иконки
      min-width: 32px;
    }
  }
}
</style>

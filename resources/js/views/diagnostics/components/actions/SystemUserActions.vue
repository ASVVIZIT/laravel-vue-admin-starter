<template>
  <div class="system-user-actions">
    <!-- Редактировать -->
    <ActionButton
        type="primary"
        :icon="IconEpEdit"
        label-key="diagnostics.actions.edit"
        :disabled="!canEdit"
        :disabled-reason-key="editDisabledReason"
        :loading="loading"
        @click="emit('edit', user)"
    />

    <!-- Удалить -->
    <ActionButton
        type="danger"
        :icon="IconEpDelete"
        label-key="diagnostics.actions.delete"
        :disabled="!canDelete"
        :disabled-reason-key="deleteDisabledReason"
        :loading="loading"
        @click="emit('delete', user)"
    />

    <!-- Восстановить -->
    <ActionButton
        type="success"
        :icon="IconEpRefreshLeft"
        label-key="diagnostics.actions.restore"
        :disabled="!canRestore"
        :disabled-reason-key="restoreDisabledReason"
        :loading="loading"
        @click="emit('restore', user)"
    />
  </div>
</template>

<script setup>
// computed — авто-импорт (unplugin-auto-import)
import IconEpEdit from '~icons/ep/edit'
import IconEpDelete from '~icons/ep/delete'
import IconEpRefreshLeft from '~icons/ep/refresh-left'
import ActionButton from './ActionButton.vue'

const props = defineProps({
  user: { type: Object, required: true },
  // id обрабатываемой строки приходит из таблицы через проп loading
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['edit', 'delete', 'restore'])

// Пользователь в корзине (soft-deleted)
const isTrashed = computed(() => !!props.user.deleted_at)

// Редактировать: нельзя, если удалён
const canEdit = computed(() => !isTrashed.value)
const editDisabledReason = computed(() =>
    isTrashed.value ? 'diagnostics.system_users.tooltip_edit_trashed' : null
)

// Удалить: нельзя, если уже удалён
const canDelete = computed(() => !isTrashed.value)
const deleteDisabledReason = computed(() =>
    isTrashed.value ? 'diagnostics.system_users.tooltip_delete_trashed' : null
)

// Восстановить: можно только если удалён
const canRestore = computed(() => isTrashed.value)
const restoreDisabledReason = computed(() =>
    !isTrashed.value ? 'diagnostics.system_users.tooltip_restore_alive' : null
)
</script>

<style scoped lang="scss">
.system-user-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
</style>

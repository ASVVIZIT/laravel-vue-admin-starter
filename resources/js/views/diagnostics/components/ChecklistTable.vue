<template>
  <div class="checklist-wrapper">
    <div class="summary-bar">
      <el-tag type="success" effect="dark">OK: {{ summary.ok }}</el-tag>
      <el-tag type="warning" effect="dark">WARN: {{ summary.warn }}</el-tag>
      <el-tag type="danger" effect="dark">FAIL: {{ summary.fail }}</el-tag>
    </div>

    <el-table :data="checks" v-loading="loading" style="width: 100%; margin-top: 15px" border>
      <el-table-column prop="id" :label="$t('diagnostics.check_id')" width="200" />

      <el-table-column :label="$t('diagnostics.status')" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" effect="light">
            <component :is="getStatusIcon(row.status)" class="mr-1" />
            {{ $t(`diagnostics.status_${row.status}`) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="details" :label="$t('diagnostics.details')" />

      <!-- Колонка действий делегирует всё компоненту блока кнопок -->
      <el-table-column :label="$t('diagnostics.action')" width="150" align="center">
        <template #default="{ row }">
          <ChecklistActions :check="row" @fix="openFixModal" />
        </template>
      </el-table-column>
    </el-table>

    <FixActionModal
        v-model="fixModalVisible"
        :check="currentCheck"
    />
  </div>
</template>

<script setup>
// ref — авто-импорт (unplugin-auto-import)
import IconEpSuccess from '~icons/ep/success-filled'
import IconEpWarning from '~icons/ep/warning-filled'
import IconEpCircleCloseFilled from '~icons/ep/circle-close-filled'
import FixActionModal from './FixActionModal.vue'
import ChecklistActions from './actions/ChecklistActions.vue'

defineProps({
  checks: { type: Array, default: () => [] },
  summary: { type: Object, default: () => ({ ok: 0, warn: 0, fail: 0 }) },
  loading: { type: Boolean, default: false }
})

const fixModalVisible = ref(false)
const currentCheck = ref(null)

const getStatusType = (status) => {
  const map = { ok: 'success', warn: 'warning', fail: 'danger' }
  return map[status] || 'info'
}

const getStatusIcon = (status) => {
  const map = { ok: IconEpSuccess, warn: IconEpWarning, fail: IconEpCircleCloseFilled }
  return map[status] || IconEpWarning
}

const openFixModal = (check) => {
  currentCheck.value = check
  fixModalVisible.value = true
}
</script>

<style scoped lang="scss">
.checklist-wrapper {
  .summary-bar {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  .mr-1 {
    margin-right: 4px;
    vertical-align: -2px;
  }
}
</style>

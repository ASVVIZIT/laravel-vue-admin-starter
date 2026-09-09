<template>
  <div class="diagnostics-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t('diagnostics.title') }}</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane
            v-for="entity in registry"
            :key="entity.key"
            :label="$t(`diagnostics.entities.${entity.key}`)"
            :name="entity.key"
        >
          <!-- Контент для сущности users -->
          <div v-if="entity.key === 'users'" class="entity-content">
            <ChecklistTable :checks="checks" :summary="summary" :loading="loading" />
          </div>

          <!-- Заглушка для будущих сущностей -->
          <div v-else class="entity-placeholder">
            <el-empty :description="$t('diagnostics.coming_soon')" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useDiagnosticsStore } from '@/store/diagnosticsStore'
import ChecklistTable from './components/ChecklistTable.vue'

const diagnosticsStore = useDiagnosticsStore()
const activeTab = ref('users')

const registry = ref([])
const checks = ref([])
const summary = ref({ ok: 0, warn: 0, fail: 0 })
const loading = ref(false)

onMounted(async () => {
  await diagnosticsStore.fetchConfig()
  registry.value = diagnosticsStore.registry
  if (registry.value.length > 0) {
    await loadEntityChecks(registry.value[0].key)
  }
})

watch(() => diagnosticsStore.activeEntity, (newVal) => {
  activeTab.value = newVal
})

watch(() => diagnosticsStore.checks, (newVal) => {
  checks.value = newVal
})

watch(() => diagnosticsStore.summary, (newVal) => {
  summary.value = newVal
})

watch(() => diagnosticsStore.loading, (newVal) => {
  loading.value = newVal
})

const handleTabChange = async (entityKey) => {
  await loadEntityChecks(entityKey)
}

const loadEntityChecks = async (entityKey) => {
  await diagnosticsStore.fetchChecks(entityKey)
}
</script>

<style scoped lang="scss">
.diagnostics-container {
  padding: 20px;
}
.card-header {
  font-size: 18px;
  font-weight: 600;
}
.entity-content {
  padding-top: 10px;
}
.entity-placeholder {
  padding: 40px 0;
  text-align: center;
}
</style>

<template>
  <div class="diagnostics-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t('diagnostics.title') }}</span>
        </div>
      </template>

      <!-- 🔥 Общий HelpBlock на главной странице -->
      <HelpBlock
          title-key="diagnostics.help.main_title"
          description-key="diagnostics.help.main_desc"
      />

      <el-tabs v-model="activeTab">
        <!-- Вкладки сущностей из реестра -->
        <el-tab-pane
            v-for="entity in registry"
            :key="entity.key"
            :label="$t(`diagnostics.entities.${entity.key}`)"
            :name="entity.key"
        >
          <div v-if="entity.key === 'users'" class="entity-content">
            <!-- 🔥 HelpBlock для вкладки Users -->
            <HelpBlock
                title-key="diagnostics.help.users_title"
                description-key="diagnostics.help.users_desc"
            />
            <ChecklistTable :checks="checks" :summary="summary" :loading="loading" />
          </div>
          <div v-else class="entity-placeholder">
            <el-empty :description="$t('diagnostics.coming_soon')" />
          </div>
        </el-tab-pane>

        <!-- B3: Инспектор email -->
        <el-tab-pane :label="$t('diagnostics.email_inspector.tab')" name="email_inspector">
          <!-- 🔥 HelpBlock для инспектора -->
          <HelpBlock
              title-key="diagnostics.help.inspector_title"
              description-key="diagnostics.help.inspector_desc"
          />
          <EmailInspector />
        </el-tab-pane>

        <!-- B3: Системные пользователи -->
        <el-tab-pane :label="$t('diagnostics.system_users.tab')" name="system_users">
          <!-- 🔥 HelpBlock для системных пользователей -->
          <HelpBlock
              title-key="diagnostics.help.system_users_title"
              description-key="diagnostics.help.system_users_desc"
          />
          <SystemUsersTable />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
// ref, onMounted подхватываются автоматически через unplugin-auto-import
import { useDiagnosticsStore } from '@/store/diagnosticsStore'
import ChecklistTable from './components/ChecklistTable.vue'
import EmailInspector from './components/EmailInspector.vue'
import SystemUsersTable from './components/SystemUsersTable.vue'
import HelpBlock from './components/HelpBlock.vue'

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

const loadEntityChecks = async (entityKey) => {
  loading.value = true
  try {
    await diagnosticsStore.fetchChecks(entityKey)
    checks.value = diagnosticsStore.checks
    summary.value = diagnosticsStore.summary
  } finally {
    loading.value = false
  }
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
  /* padding-top убран — HelpBlock сам даёт отступ */
}
.entity-placeholder {
  padding: 40px 0;
  text-align: center;
}
</style>

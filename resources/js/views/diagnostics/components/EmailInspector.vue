<template>
  <el-card shadow="never" class="email-inspector">
    <template #header>
      <span>{{ $t('diagnostics.email_inspector.title') }}</span>
    </template>

    <el-form @submit.prevent="inspect">
      <el-form-item>
        <el-input
            v-model="email"
            :placeholder="$t('diagnostics.email_inspector.placeholder')"
            type="email"
            clearable
        >
          <template #append>
            <el-button @click="inspect" :loading="loading">
              {{ $t('diagnostics.email_inspector.check') }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <el-descriptions v-if="result" :column="2" border class="mt-3">
      <el-descriptions-item :label="$t('diagnostics.email_inspector.email')" :span="2">
        {{ result.email }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('diagnostics.email_inspector.valid_format')">
        <el-tag :type="result.valid_format ? 'success' : 'danger'" size="small">
          {{ result.valid_format ? '✓' : '✗' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item :label="$t('diagnostics.email_inspector.mx_records')">
        <el-tag :type="result.mx_records ? 'success' : (result.mx_records === null ? 'info' : 'warning')" size="small">
          {{ result.mx_records === true ? '✓' : (result.mx_records === false ? '✗' : '—') }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item :label="$t('diagnostics.email_inspector.domain')" v-if="result.domain">
        {{ result.domain }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('diagnostics.email_inspector.registered')">
        <el-tag :type="result.registered ? 'success' : 'info'" size="small">
          {{ result.registered ? '✓' : '✗' }}
        </el-tag>
      </el-descriptions-item>
      <template v-if="result.registered">
        <el-descriptions-item :label="$t('diagnostics.email_inspector.user_id')">
          {{ result.user_id }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('diagnostics.email_inspector.is_system')">
          <el-tag :type="result.is_system ? 'warning' : 'success'" size="small">
            {{ result.is_system ? $t('common.yes') : $t('common.no') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('diagnostics.email_inspector.system_role')" v-if="result.system_role">
          {{ result.system_role }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('diagnostics.email_inspector.verified')">
          <el-tag :type="result.verified ? 'success' : 'warning'" size="small">
            {{ result.verified ? '✓' : '✗' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('diagnostics.email_inspector.banned')">
          <el-tag :type="result.banned ? 'danger' : 'success'" size="small">
            {{ result.banned ? '✓' : '✗' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('diagnostics.email_inspector.trashed')">
          <el-tag :type="result.trashed ? 'danger' : 'success'" size="small">
            {{ result.trashed ? '✓' : '✗' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('diagnostics.email_inspector.status_type')" :span="2">
          <el-tag size="small">{{ result.status_type }}</el-tag>
        </el-descriptions-item>
      </template>
    </el-descriptions>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import diagnosticsApi from '@/api/diagnostics'
import { ElMessage } from 'element-plus'

const email = ref('')
const result = ref(null)
const loading = ref(false)

const inspect = async () => {
  if (!email.value) {
    ElMessage.warning('Введите email')
    return
  }

  loading.value = true
  result.value = null
  try {
    const res = await diagnosticsApi.inspectEmail(email.value)
    result.value = res.data?.card || null
  } catch (error) {
    ElMessage.error('Ошибка проверки email')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.email-inspector {
  .mt-3 {
    margin-top: 16px;
  }
}
</style>

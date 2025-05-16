<template>
  <div class="dashboard-container scroll-y">
    <Admin v-if="hasAdminRole" />
    <Editor v-else-if="hasEditorRole" />
    <DefaultView v-else />
  </div>
</template>

<script setup>
import Admin from './Admin'
import Editor from './Editor'
import Default from './Default'
import { computed } from 'vue'
import { userStore } from '@/store/user'
const useUserStore = userStore()
const roles = computed(() => useUserStore.roles || [])

// Явные проверки для разных ролей
const hasAdminRole = computed(() =>
    roles.value.some(r => ['admin', 'superadmin'].includes(r))
)

const hasEditorRole = computed(() =>
    roles.value.includes('editor')
)

</script>

<style scoped lang="scss"></style>

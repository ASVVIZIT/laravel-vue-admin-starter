<template>
  <div class="dashboard-container scroll-y">
    <Admin v-if="hasAdminRole" />
    <Editor v-else-if="hasEditorRole" />
    <Tester v-else-if="hasTesterRole" />
    <Default v-else />
  </div>
</template>

<script setup>
import Admin from './Admin'
import Editor from './Editor'
import Tester from './Tester'
import Default from './Default'
import { computed } from 'vue'
import { userStore } from '@/store/userStore'
const useUserStore = userStore()
const roles = computed(() => useUserStore.roles || [])

// Явные проверки для разных ролей
const hasAdminRole = computed(() =>
    roles.value.some(r => ['admin', 'superadmin'].includes(r))
)

const hasEditorRole = computed(() =>
    roles.value.includes('editor')
)

const hasTesterRole = computed(() =>
    roles.value.includes('tester')
)

</script>

<style scoped lang="scss"></style>

<template>
  <div className="channel-list-admin-page">
    <ChannelList
        :company-id="null"
        :disabled="false"
        :show-add-button="true"
        :show-edit-button="true"
        :show-delete-button="true"
        :allow-reorder="true"
        :use-store="true"
        @close="handleClose"
        @update="handleUpdate"
        @delete="handleDelete"
    />
  </div>
</template>

<script setup>
/**
 * ============================================================================
 * CHANNEL LIST ADMIN PAGE — ВСЕ КАНАЛЫ (НЕЗАВИСИМО ОТ КОМПАНИЙ)
 * ============================================================================
 * 📁 Путь: resources/js/views/ContactManagement/CompanyContactChannels/Admin/ChannelListAdmin.vue
 * ✅ Используется: Роут /contact-management/channels
 * ✅ Безопасно менять — влияет только на отображение списка каналов
 * ============================================================================
 */

import {useRouter} from 'vue-router';
import ChannelList from '@/components/ContactManagement/CompanyContactChannels/components/Admin/ChannelList.vue';

const router = useRouter();

// ============================================================================
// HANDLE CLOSE
// ============================================================================
function handleClose() {
  router.push('/contact-management/channels');
}

// ============================================================================
// HANDLE UPDATE
// ============================================================================
function handleUpdate(channel) {
  console.log('🟢 [ChannelListAdmin] Channel updated:', channel);
}

// ============================================================================
// HANDLE DELETE
// ============================================================================
function handleDelete(channel) {
  console.log('🟢 [ChannelListAdmin] Channel deleted:', channel);
}
</script>

<style scoped>
/**
 * ============================================================================
 * STYLES
 * ============================================================================
 */
.channel-list-admin-page {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
  box-sizing: border-box;
}
</style>

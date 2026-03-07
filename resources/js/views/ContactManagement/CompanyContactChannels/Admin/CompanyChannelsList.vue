<!-- resources/js/views/ContactManagement/CompanyContactChannels/Admin/CompanyChannelsList.vue -->
<template>
  <div class="company-channels-page">
    <ChannelList
        v-if="companyId"
        :company-id="companyId"
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
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ChannelList from '@/components/ContactManagement/CompanyContactChannels/components/Admin/ChannelList.vue';

const router = useRouter();
const route = useRoute();

const companyId = computed(() => route.params.id);

function handleClose() {
  router.push('/contact-management/companies');
}

function handleUpdate(channel) {
  console.log('🟢 Channel updated:', channel);
}

function handleDelete(channel) {
  console.log('🟢 Channel deleted:', channel);
}
</script>

<style scoped>
.company-channels-page {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #f5f7fa;
}
</style>

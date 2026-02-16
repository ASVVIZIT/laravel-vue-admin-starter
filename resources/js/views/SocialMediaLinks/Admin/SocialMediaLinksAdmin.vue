<template>
  <div class="social-media-links-admin">
    <h3>Управление соцсетями для отзывов</h3>
    <social-media-list />
  </div>
</template>

<script setup>
import SocialMediaList from '@/components/SocialMediaLinks/components/Admin/SocialMediaList.vue';
</script>

<style scoped>
.social-media-links-admin {
  padding: 5px;
}

.social-media-links-admin h3 {
  margin: 0 0 10px 0;
}
</style>

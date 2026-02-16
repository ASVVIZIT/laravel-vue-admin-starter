<template>
  <div class="social-media-links-admin">
    <h1>Управление соцсетями для отзывов</h1>
    <social-media-list />
  </div>
</template>

<script setup>
import SocialMediaList from '@/components/SocialMediaLinks/components/Admin/SocialMediaList.vue';
</script>

<style scoped>
.social-media-links-admin {
  padding: 20px;
}
</style>

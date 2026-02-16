<template>
  <div class="reviews-page">
    <h1>Сканируйте QR-код, чтобы получить 10% скидку!</h1>

    <div v-if="loading">
      <div class="loading-message">Загрузка данных...</div>
    </div>

    <div v-else-if="error">
      <div class="error-message">Ошибка: {{ error }}</div>
    </div>

    <div v-else-if="sortedLinks.length === 0">
      <div class="empty-message">Нет доступных соцсетей</div>
    </div>

    <div v-else class="review-cards-grid">
      <review-card
          v-for="link in sortedLinks"
          :key="link.id"
          :icon="link.icon"
          :name="link.name"
          :url="link.url"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSocialMediaLinksStore } from '@/components/SocialMediaLinks/store/socialMediaLinks';
import ReviewCard from '@/components/SocialMediaLinks/components/Public/ReviewCard.vue';

const store = useSocialMediaLinksStore();
const loading = ref(true);
const error = ref(null);

const sortedLinks = computed(() => store.sortedLinks);

onMounted(async () => {
  try {
    await store.fetchLinks();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.reviews-page {
  text-align: center;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  margin-bottom: 30px;
  font-size: 28px;
  color: #333;
  font-weight: 600;
}

.loading-message {
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-message {
  padding: 30px;
  color: #666;
  font-size: 16px;
}

.error-message {
  padding: 30px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  max-width: 500px;
  margin: 0 auto;
  color: #e74c3c;
}

.review-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 0;
}
</style>

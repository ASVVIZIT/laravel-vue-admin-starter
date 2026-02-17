<template>
  <div class="reviews-page">
    <!-- Основной заголовок -->
    <h3>Просим Вас оставить отзыв о покупке в 2гис!</h3>

    <!-- Эмоциональный блок с звёздами и текстом -->
    <div class="emotional-block-main">
      <div class="stars-container">
        <i class="star-icon filled">★</i>
        <i class="star-icon filled">★</i>
        <i class="star-icon filled">★</i>
        <i class="star-icon filled">★</i>
        <i class="star-icon filled">★</i>
      </div>
      <div class="review-request-text">Оцените и оставьте отзыв</div>
    </div>
    <!-- /Эмоциональный блок -->

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
import { useSocialMediaLinksStore } from '@components/ContactManagement/SocialMediaLinks/store/socialMediaLinks.js';
import ReviewCard from '@components/ContactManagement/SocialMediaLinks/components/Public/ReviewCard.vue';

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
  padding: 20px 20px;
  max-width: 1100px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h3 {
  margin-bottom: 20px; /* Уменьшили отступ снизу */
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

/* --- Стили для эмоционального блока --- */
.emotional-block-main {
  background-color: #f0f0f0; /* Светло-серый фон */
  padding: 12px 20px; /* Добавим немного отступов по бокам */
  border-radius: 8px;
  display: inline-block; /* Чтобы блок был по центру, но только по ширине контента */
  margin: 10px auto 30px; /* Отступ сверху от h3, снизу до карточек */
  box-sizing: border-box;
}

.stars-container {
  display: flex;
  justify-content: center;
  gap: 3px; /* Маленький отступ между звёздами */
}

.star-icon {
  font-size: 26px; /* Размер звёзд */
  color: #ddd; /* Цвет не выбранной звезды */
}

.star-icon.filled {
  color: #FFD700; /* Цвет выбранной звезды (золотой) */
}

.review-request-text {
  font-size: 14px;
  color: #666;
  margin-top: 6px; /* Отступ между звёздами и текстом */
  font-weight: 500;
  line-height: 1.2; /* Плотнее к звёздам */
}
/* --- /Стили для эмоционального блока --- */

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
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 20px;
  max-height: 450px;
  overflow-y: auto;
}

/* Стили для мобильных устройств */
@media (max-width: 768px) {
  .review-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    padding: 15px 20px;
  }

  h3 {
    font-size: 20px;
    margin-bottom: 5px;
  }

  .emotional-block-main {
    margin: 10px auto 20px; /* Уменьшили отступ снизу на мобильных */
    padding: 10px 15px; /* Уменьшили внутренние отступы */
  }

  .star-icon {
    font-size: 23px; /* Уменьшили размер звёзд на мобильных */
  }

  .review-request-text {
    font-size: 12px; /* Уменьшили размер текста на мобильных */
    margin-top: 4px; /* Уменьшили отступ текста */
  }
}

/* Стили для экранов меньше 480px */
@media (max-width: 480px) {
  .review-cards-grid {
    grid-template-columns: 1fr;
    max-height: 410px;
    gap: 15px;
  }

  .emotional-block-main {
    padding: 8px 12px; /* Дополнительно уменьшили внутренние отступы */
  }

  .star-icon {
    font-size: 22px; /* Еще меньше звёзд */
  }

  .review-request-text {
    font-size: 11px; /* Еще меньше текст */
  }
}
</style>

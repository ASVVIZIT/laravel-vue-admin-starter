<template>
  <div class="review-card" @click="openLink">
    <div class="icon-container">
      <i :class="icon" class="social-icon"></i>
    </div>
    <span class="name">{{ name }}</span>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
});

const openLink = () => {
  // Проверяем, что URL не пустой
  if (!props.url || !props.url.trim()) {
    console.error('Invalid URL:', props.url);
    return;
  }

  // Нормализуем URL
  let normalizedUrl = props.url.trim();

  // Добавляем протокол, если его нет
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  // Проверяем валидность URL
  try {
    new URL(normalizedUrl);
    window.open(normalizedUrl, '_blank');
  } catch (e) {
    console.error('Invalid URL format:', normalizedUrl);
    // Если URL недействителен, попробуем использовать только домен
    const domain = normalizedUrl.replace(/[^a-z0-9.-]/gi, '');
    if (domain) {
      window.open(`https://${domain}`, '_blank');
    } else {
      console.error('Could not open link:', props.url);
    }
  }
};
</script>

<style scoped>
.review-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  max-width: 250px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.icon-container {
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
}

.social-icon {
  font-size: 48px;
  color: #333;
}

.name {
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-top: 5px;
  font-size: 16px;
  line-height: 1.4;
}
</style>

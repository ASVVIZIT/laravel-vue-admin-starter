<template>
  <div class="review-card" @click="openLink">
    <!-- Иконка соцсети -->
    <component :is="getIconComponent(icon)" class="social-icon" />
    <span class="name">{{ name }}</span>
    <!-- QR-код -->
    <qr-code-generator :url="url" :name="name" :size="120" />
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
// Импортируем иконки Element Plus
import {
  VideoCamera as VideoCameraIcon,
  ChatLineSquare as ChatLineSquareIcon,
  Position as PositionIcon,
  Guide as GuideIcon,
  Picture as PictureIcon,
  Connection as ConnectionIcon,
  Link as LinkIcon,
  Monitor as MonitorIcon
} from '@element-plus/icons-vue';
// Импортируем компонент QR-кода
import QrCodeGenerator from '@/components/SocialMediaLinks/components/Admin/QrCodeGenerator.vue';

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

// --- Карта соответствия иконок ---
const iconMap = {
  'fab fa-instagram': PictureIcon,
  'fab fa-facebook': ConnectionIcon,
  'fab fa-vk': GuideIcon,
  'fab fa-telegram': ChatLineSquareIcon,
  'fab fa-youtube': VideoCameraIcon,
  'fab fa-tiktok': MonitorIcon,
  'fab fa-twitter': PositionIcon,
  'fab fa-pinterest': PictureIcon,
  'fab fa-whatsapp': ChatLineSquareIcon,
  'fab fa-linkedin': LinkIcon,
  'default': LinkIcon
};
// --- /Карта соответствия иконок ---

// --- Функция для получения компонента по строке иконки ---
const getIconComponent = (iconString) => {
  const mappedComponent = iconMap[iconString];
  return mappedComponent || iconMap.default;
};
// --- /Функция для получения компонента по строке иконки ---

// Функция открытия ссылки
const openLink = () => {
  if (!props.url || !props.url.trim()) {
    console.error('Invalid URL:', props.url);
    return;
  }

  let normalizedUrl = props.url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  try {
    new URL(normalizedUrl);
    window.open(normalizedUrl, '_blank');
  } catch (e) {
    console.error('Invalid URL format:', normalizedUrl);
    const domain = normalizedUrl.replace(/[^a-z0-9.-]/gi, '');
    if (domain) {
      window.open(`https://${domain}`, '_blank');
    }
  }
};
</script>

<style scoped>
.review-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.social-icon {
  font-size: 48px;
  color: #333;
  margin-bottom: 10px;
  width: 1em;
  height: 1em;
  vertical-align: middle;
}

.name {
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-top: 5px;
  margin-bottom: 10px;
  font-size: 16px;
  line-height: 1.4;
}

/* Стили для QR-кода внутри карточки */
.review-card :deep(.qr-wrapper),
.review-card :deep(.qr-container) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.review-card :deep(.qr-image) {
  margin-bottom: 10px;
}

.review-card :deep(.qr-buttons) {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  align-items: center;
}
</style>

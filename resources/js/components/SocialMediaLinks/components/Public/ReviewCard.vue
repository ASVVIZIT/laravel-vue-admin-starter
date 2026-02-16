<template>
  <div class="review-card" @click="openLink">
    <!-- Иконка соцсети -->
    <component :is="getIconComponent(icon)" class="social-icon" />
    <span class="name">{{ name }}</span>
    <!-- QR-код -->
    <qr-code-generator v-if="url && url.trim()" :url="url" :name="name" :size="120" />
    <div v-else class="missing-url-warning">QR-код недоступен: URL отсутствует.</div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
// Импортируем иконки Element Plus (резервные)
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
// --- Импортируем стор FenixIcon ---
import { useFenixIconsStore } from '@/components/FenixIconVue/store/fenixIconsStore';

// --- Инициализируем стор FenixIcon ---
const fenixIconStore = useFenixIconsStore();
// --- /Инициализируем стор FenixIcon ---

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

// --- Карта соответствия иконок (теперь использует стор FenixIcon с резервом) ---
const iconMap = {
  // Пытаемся получить Fenix2gis, если нет - используем резервную иконку Element Plus
  'fab fa-2gis': fenixIconStore.getIconByName('Fenix2gis') || GuideIcon, // Резерв: GuideIcon
  'fab fa-vk': fenixIconStore.getIconByName('FenixVk') || GuideIcon, // Резерв: GuideIcon
  'fab fa-telegram': fenixIconStore.getIconByName('FenixTelegram') || ChatLineSquareIcon, // Резерв: ChatLineSquareIcon
  'fab fa-whatsapp': fenixIconStore.getIconByName('FenixWhatsApp') || ChatLineSquareIcon, // Резерв: ChatLineSquareIcon
  'fab fa-instagram': fenixIconStore.getIconByName('FenixInstagram') || PictureIcon, // Резерв: PictureIcon
  'fab fa-facebook': fenixIconStore.getIconByName('FenixFacebook') || ConnectionIcon, // Резерв: ConnectionIcon
  'fab fa-youtube': fenixIconStore.getIconByName('FenixYoutube') || VideoCameraIcon, // Резерв: VideoCameraIcon
  'fab fa-tiktok': fenixIconStore.getIconByName('FenixTikTok') || MonitorIcon, // Резерв: MonitorIcon
  'fab fa-twitter': fenixIconStore.getIconByName('FenixTwitter') || PositionIcon, // Резерв: PositionIcon
  'fab fa-pinterest': fenixIconStore.getIconByName('FenixPinterest') || PictureIcon, // Резерв: PictureIcon
  'fab fa-linkedin': fenixIconStore.getIconByName('FenixLinkedIn') || LinkIcon, // Резерв: LinkIcon
  'default': LinkIcon // Резервная иконка по умолчанию
};
// --- /Карта соответствия иконок ---

// --- Функция для получения компонента по строке иконки ---
const getIconComponent = (iconString) => {
  const mappedComponent = iconMap[iconString];
  // Проверяем, что компонент найден в map (сначала ищем в Fenix, потом резервный EP)
  if (mappedComponent) {
    return mappedComponent;
  } else {
    console.warn(`Иконка для '${iconString}' не найдена в map, используется резервная.`); // Логирование
    return iconMap.default; // Используем резервную иконку
  }
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

// Добавим логирование для отладки
console.log('ReviewCard props:', props);
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

/* Обновлённый стиль для .social-icon */
.social-icon {
  font-size: 48px;
  color: #333;
  margin-bottom: 10px;
  width: 3em; /* Установлено для правильного масштаба */
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

.missing-url-warning {
  color: #999;
  font-size: 12px;
  text-align: center;
  margin-top: 10px;
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

/* Обновлённый стиль для .square-button-style */
.review-card :deep(.square-button-style) {
  width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
  margin-left: 0 !important;
  border-radius: 4px !important;
}
</style>

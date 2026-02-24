<template>
  <div class="review-card" @click="openLink">
    <component :is="getIconComponent(icon)" class="social-icon" />
    <span class="name">{{ name }}</span>
    <qr-code-generator v-if="url && url.trim()" :url="url" :name="name" :size="120" />
    <div v-else class="missing-url-warning">QR-код недоступен: URL отсутствует.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
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
import QrCodeGenerator from '@components/ContactManagement/SocialMediaLinks/components/Admin/QrCodeGenerator.vue';
import { useFenixIconsStore } from '@components/FenixIconVue/store/fenixIconsStore.js';

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

const fenixIconStore = useFenixIconsStore();

// ✅ ИСПРАВЛЕНО: Вычисляемое свойство + markRaw
const iconMap = computed(() => ({
  'fab fa-2gis': fenixIconStore.getIconByName('Fenix2gis') || GuideIcon,
  'fab fa-vk': fenixIconStore.getIconByName('FenixVk') || GuideIcon,
  'fab fa-telegram': fenixIconStore.getIconByName('FenixTelegram') || ChatLineSquareIcon,
  'fab fa-whatsapp': fenixIconStore.getIconByName('FenixWhatsApp') || ChatLineSquareIcon,
  'fab fa-instagram': fenixIconStore.getIconByName('FenixInstagram') || PictureIcon,
  'fab fa-facebook': fenixIconStore.getIconByName('FenixFacebook') || ConnectionIcon,
  'fab fa-youtube': fenixIconStore.getIconByName('FenixYoutube') || VideoCameraIcon,
  'fab fa-tiktok': fenixIconStore.getIconByName('FenixTikTok') || MonitorIcon,
  'fab fa-twitter': fenixIconStore.getIconByName('FenixTwitter') || PositionIcon,
  'fab fa-x-twitter': fenixIconStore.getIconByName('FenixTwitter') || PositionIcon,
  'fab fa-pinterest': fenixIconStore.getIconByName('FenixPinterest') || PictureIcon,
  'fab fa-linkedin': fenixIconStore.getIconByName('FenixLinkedIn') || LinkIcon,
  'default': LinkIcon
}));

const getIconComponent = (iconString) => {
  const mappedComponent = iconMap.value[iconString];
  if (mappedComponent) {
    return mappedComponent;
  } else {
    if (import.meta.env.DEV) {
      console.warn(`Иконка для '${iconString}' не найдена, используется резервная.`);
    }
    return iconMap.value.default;
  }
};

const openLink = () => {
  if (!props.url || !props.url.trim()) {
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
  width: 3em;
  height: 3em;
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

.review-card :deep(.square-button-style) {
  width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
  margin-left: 0 !important;
  border-radius: 4px !important;
}
</style>

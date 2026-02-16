<template>
  <div class="qr-container">
    <div v-if="!normalizedUrl || !normalizedUrl.trim()" class="no-url-message">
      <span>URL не указан</span>
    </div>
    <img v-else :src="qrUrl" alt="QR-код" class="qr-image" />
    <div class="qr-actions" v-if="normalizedUrl && normalizedUrl.trim()">
      <el-button type="primary" size="small" @click="downloadQr">Скачать QR</el-button>
      <el-button size="small" @click="regenerateQr">Сгенерировать принудительно</el-button>
    </div>
    <div v-if="regenerationMessage" class="regeneration-message">{{ regenerationMessage }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import QRCode from 'qrcode';
import { ElMessage } from 'element-plus';

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 150
  }
});

const qrUrl = ref('');
const regenerationMessage = ref('');
const normalizedUrl = ref('');

const normalizeUrl = (url) => {
  if (!url) return '';

  url = url.trim();

  // Добавляем протокол, если его нет
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    // Парсим URL
    const parsed = new URL(url);

    // Приводим домен к нижнему регистру
    parsed.hostname = parsed.hostname.toLowerCase();

    // Возвращаем нормализованный URL
    return parsed.toString();
  } catch (e) {
    // Если не удалось распарсить, возвращаем базовый URL с именем
    return `https://${url.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
  }
};

const generateQr = async () => {
  normalizedUrl.value = normalizeUrl(props.url);

  // Проверяем, что URL не пустой
  if (!normalizedUrl.value || !normalizedUrl.value.trim()) {
    qrUrl.value = '';
    return;
  }

  try {
    qrUrl.value = await QRCode.toDataURL(normalizedUrl.value, {
      width: props.size,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (e) {
    console.error('Ошибка генерации QR-кода:', e);
    qrUrl.value = '';
    ElMessage.error('Ошибка генерации QR-кода');
  }
};

onMounted(() => {
  generateQr();
});

const downloadQr = () => {
  if (!qrUrl.value) return;

  const link = document.createElement('a');
  link.href = qrUrl.value;
  link.download = `${props.name}-qr.png`;
  link.click();
};

const regenerateQr = async () => {
  await generateQr();
  if (qrUrl.value) {
    regenerationMessage.value = 'QR-код успешно перегенерирован';

    // Очищаем сообщение через 3 секунды
    setTimeout(() => {
      regenerationMessage.value = '';
    }, 3000);
  }
};
</script>

<style scoped>
.qr-container {
  text-align: center;
  margin: 5px 0;
  position: relative;
}

.qr-image {
  max-width: 100%;
  height: auto;
  margin-bottom: 5px;
}

.qr-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.regeneration-message {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: #4caf50;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
}

.no-url-message {
  padding: 10px;
  color: #999;
  font-size: 14px;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

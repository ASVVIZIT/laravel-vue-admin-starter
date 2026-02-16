<template>
  <div class="qr-wrapper">
    <div v-if="!normalizedUrl || !normalizedUrl.trim()" class="no-url-message">
      <span>URL не указан</span>
    </div>
    <div v-else class="qr-container">
      <!-- Колонка с кнопками слева -->
      <div class="qr-buttons-column">
        <el-button
            size="small"
            type="success"
            plain
            circle
            @click.stop="downloadQr"
            :icon="DownloadIcon"
            class="square-button"
        >
        </el-button>
        <el-button
            size="small"
            type="warning"
            plain
            circle
            @click.stop="regenerateQr"
            :icon="RefreshIcon"
            class="square-button"
        >
        </el-button>
        <el-button
            size="small"
            type="primary"
            plain
            circle
            @click.stop="showLargeQrModal = true"
            :icon="ZoomInIcon"
            class="square-button"
        >
        </el-button>
        <!-- Кнопка "Открыть в новом окне" -->
        <el-button
            size="small"
            type="info"
            plain
            circle
            @click.stop="openLargeQrInNewWindow"
            :icon="LinkIcon"
            class="square-button"
        >
        </el-button>
        <!-- Кнопка "Печать" -->
        <el-button
            size="small"
            type="default"
            plain
            circle
            @click.stop="printLargeQr"
            :icon="PrinterIcon"
            class="square-button"
        >
        </el-button>
      </div>
      <!-- Колонка с QR-кодом справа -->
      <img :src="qrUrl" alt="QR-код" class="qr-image" />
    </div>

    <el-dialog
        v-model="showLargeQrModal"
        title="QR-код"
        width="500px"
        :modal-append-to-body="true"
        append-to-body
    >
      <div class="large-qr-container">
        <img :src="largeQrUrl" alt="Увеличенный QR-код" class="large-qr-image" v-if="largeQrUrl" />
        <div v-else class="loading-large-qr">Загрузка увеличенного QR-кода...</div>
      </div>
      <template #footer>
        <el-button @click="showLargeQrModal = false">Закрыть</el-button>
        <el-button type="primary" @click.stop="downloadLargeQr">
          Скачать увеличенный QR
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import QRCode from 'qrcode';
import { ElMessage } from 'element-plus';
// Импортируем все нужные иконки
import { Download as DownloadIcon, Refresh as RefreshIcon, ZoomIn as ZoomInIcon, Printer as PrinterIcon, Link as LinkIcon, Close as CloseIcon } from '@element-plus/icons-vue';

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
    default: 100 // Убедитесь, что default значение установлено
  }
});

const qrUrl = ref('');
const largeQrUrl = ref('');
const normalizedUrl = ref('');
const showLargeQrModal = ref(false);

const normalizeUrl = (url) => {
  if (!url) return '';
  url = url.trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.toString();
  } catch (e) {
    return '';
  }
};

const generateQr = async (targetSize = props.size) => {
  const normUrl = normalizeUrl(props.url);
  if (!normUrl || !normUrl.trim()) {
    return '';
  }
  try {
    const dataUrl = await QRCode.toDataURL(normUrl, {
      width: targetSize,
      color: { dark: '#000000', light: '#ffffff' }
    });
    return dataUrl;
  } catch (e) {
    console.error('QR generation error:', e);
    ElMessage.error('Ошибка генерации QR-кода');
    return '';
  }
};

const generateQrNormal = async () => {
  normalizedUrl.value = normalizeUrl(props.url);
  if (!normalizedUrl.value || !normalizedUrl.value.trim()) {
    qrUrl.value = '';
    return;
  }
  qrUrl.value = await generateQr(props.size);
};

// Увеличиваем размер увеличенного QR-кода пропорционально (например, 3.45 от базового)
const LARGE_QR_SIZE = Math.round(props.size * 3.45);

const generateLargeQr = async () => {
  largeQrUrl.value = await generateQr(LARGE_QR_SIZE);
};

onMounted(async () => {
  await generateQrNormal();
  await generateLargeQr();
});

const updateQrCodes = async () => {
  await generateQrNormal();
  await generateLargeQr();
};

watch(() => props.url, updateQrCodes);

const downloadQr = () => {
  if (!qrUrl.value) return;
  const link = document.createElement('a');
  link.href = qrUrl.value;
  link.download = `${props.name}-qr-${props.size}.png`;
  link.click();
};

const downloadLargeQr = () => {
  if (!largeQrUrl.value) return;
  const link = document.createElement('a');
  link.href = largeQrUrl.value;
  link.download = `${props.name}-qr-large.png`;
  link.click();
};

const openLargeQrInNewWindow = () => {
  if (!largeQrUrl.value) return;
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Увеличенный QR-код для ${props.name}</title></head>
        <body style="display:flex; justify-content:center; align-items:center; margin:0; background:#fff;">
          <img src="${largeQrUrl.value}" alt="Увеличенный QR-код" style="max-width: 100vw; max-height: 100vh;" />
        </body>
      </html>
    `);
    newWindow.document.close();
  } else {
    ElMessage.warning('Открытие в новом окне заблокировано. Пожалуйста, разрешите всплывающие окна для этого сайта.');
  }
};

const printLargeQr = () => {
  if (!largeQrUrl.value) return;

  // Извлекаем домен из нормализованного URL
  let domain = 'Неизвестный домен';
  try {
    const urlObj = new URL(normalizeUrl(props.url));
    domain = urlObj.hostname;
  } catch (e) {
    console.error('Ошибка извлечения домена для печати:', e);
  }

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Печать QR-кода для ${props.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 20px;
              margin: 0;
              background: white;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
            }
            .print-title {
              font-size: 20px;
              font-weight: bold;
              margin: 0;
            }
            .print-domain {
              font-size: 18px;
              color: #666;
              margin: 5px 0 0 0;
            }
            .print-qr-container {
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .print-qr-image {
              width: ${LARGE_QR_SIZE}px;
              height: ${LARGE_QR_SIZE}px;
              max-width: 100%;
              max-height: 100vh;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="print-title">${props.name}</div>
            <div class="print-domain">${domain}</div>
          </div>
          <div class="print-qr-container">
            <img src="${largeQrUrl.value}" alt="QR-код для печати" class="print-qr-image" />
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  } else {
    ElMessage.warning('Печать заблокирована. Пожалуйста, разрешите всплывающие окна для этого сайта.');
  }
};

const regenerateQr = async () => {
  await generateQrNormal();
  await generateLargeQr();
  ElMessage.success('QR-код перегенерирован');
};
</script>

<style scoped>
/* Основной контейнер */
.qr-wrapper {
  /* display: flex; убрано, так как теперь layout внутри .qr-container */
  /* align-items и gap также убраны */
}

/* Контейнер для колонок кнопок и QR-кода */
.qr-container {
  display: flex;
  align-items: row; /* Выравнивание по верхнему краю */
  gap: 5px; /* Отступ между колонками */
}

/* Колонка с кнопками */
.qr-buttons-column {
  display: flex;
  flex-direction: row; /* Кнопки в столбик */
  gap: 5px; /* Отступ между кнопками */
  /* Узкая колонка, размер определяется содержимым (ширина кнопок) */
  flex-shrink: 0; /* Не сжимаем колонку кнопок */
  align-self: stretch; /* Растягиваем на высоту контента .qr-container, если нужно */
}

/* QR-код */
.qr-image {
  width: v-bind('props.size + "px"'); /* Используем динамический размер */
  height: v-bind('props.size + "px"');
  flex-shrink: 0; /* Не сжимаем изображение */
}

/* Стили для квадратных кнопок */
.square-button {
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  margin-left: 0 !important;
  border-radius: 4px !important;
}

.no-url-message {
  padding: 10px;
  color: #999;
  font-size: 12px;
  text-align: center;
  min-width: 80px; /* Примерная ширина для выравнивания */
}

/* Стили для увеличенного QR в модалке */
.large-qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: v-bind('LARGE_QR_SIZE + "px"'); /* Минимальная высота под размер увеличенного QR */
}

.large-qr-image {
  width: v-bind('LARGE_QR_SIZE + "px"'); /* Используем динамический размер */
  height: v-bind('LARGE_QR_SIZE + "px"');
  max-width: 100%;
  height: auto;
}

.loading-large-qr {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>

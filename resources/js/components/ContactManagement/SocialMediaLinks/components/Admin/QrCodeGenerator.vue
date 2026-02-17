<template>
  <div class="qr-wrapper fenix-qr">
    <!-- Добавим проверку и вывод сообщения, если URL пуст -->
    <div v-if="!props.url || !props.url.trim()" class="no-url-message fenix-qr__no-url">
      <span>URL не указан</span>
    </div>
    <div v-else-if="!normalizedUrl || !normalizedUrl.trim()" class="no-url-message fenix-qr__no-url">
      <span>URL недействителен</span>
    </div>
    <div v-else class="qr-container fenix-qr__container">
      <!-- Колонка (в вертикальном контейнере) с кнопками над QR-кодом -->
      <div class="qr-buttons-row fenix-qr__buttons-row">
        <el-button
            size="small"
            type="success"
            plain
            circle
            @click.stop="downloadQr"
            :icon="DownloadIcon"
            class="square-button fenix-qr__btn"
        >
        </el-button>
        <el-button
            size="small"
            type="warning"
            plain
            circle
            @click.stop="regenerateQr"
            :icon="RefreshIcon"
            class="square-button fenix-qr__btn"
        >
        </el-button>
        <el-button
            size="small"
            type="primary"
            plain
            circle
            @click.stop="showLargeQrModal = true"
            :icon="ZoomInIcon"
            class="square-button fenix-qr__btn"
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
            class="square-button fenix-qr__btn"
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
            class="square-button fenix-qr__btn"
        >
        </el-button>
      </div>
      <!-- QR-код расположен ниже блока кнопок -->
      <img :src="qrUrl" alt="QR-код" class="qr-image fenix-qr__image" />
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
  url = url.trim(); // Удаляем пробелы в начале и конце
  if (!url) return ''; // Если после удаления пробелов строка пуста
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.toString();
  } catch (e) {
    console.error('Error normalizing URL:', e); // Логируем ошибку нормализации
    return '';
  }
};

const generateQr = async (targetSize = props.size) => {
  const normUrl = normalizeUrl(props.url);
  if (!normUrl || !normUrl.trim()) {
    console.warn('Cannot generate QR: normalized URL is empty or invalid for', props.url); // Логируем проблему
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
  console.log('QrCodeGenerator normalizedUrl:', normalizedUrl.value); // Логируем нормализованный URL
  if (!normalizedUrl.value || !normalizedUrl.value.trim()) {
    qrUrl.value = '';
    console.warn('QrCodeGenerator: Setting qrUrl to empty string due to invalid normalizedUrl.');
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
  console.log('QrCodeGenerator mounted, props.url:', props.url); // Логируем props.url при монтировании
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
          <img src="${largeQrUrl.value}" alt="Увеличенный QR-код" style="max-width: 100vw; max-height: 100vh; border: 2px solid #d5cece; border-radius: 10px;" />
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
            .print-logo {
              width: 60px;
              height: 60px;
              margin-bottom: 10px;
            }
            .print-title {
              font-size: 30px;
              font-weight: bold;
              margin: 0;
            }
            .print-domain {
              font-size: 30px;
              color: #666;
              margin: 5px 0 0 0;
            }
            .print-qr-container {
              display: flex;
              justify-content: center;
              align-items: center;
              border: 2px solid #d5cece;
              border-radius: 10px;
              padding: 10px;
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
            <img src="/images/logo-icon.png" alt="Логотип" class="print-logo" />
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
/* Повышаем специфичность стилей */
.qr-wrapper.fenix-qr {
  display: flex; /* Flexbox для вертикального размещения блока кнопок и QR-кода */
  flex-direction: column; /* Основная ось - вертикальная */
  align-items: center; /* Выравнивание дочерних элементов по центру по поперечной оси (горизонтали) */
  gap: 5px; /* Отступ между блоком кнопок и QR-кодом */
}

/* Контейнер для блока кнопок и QR-кода */
.qr-container.fenix-qr__container {
  display: flex !important; /* !important для повышения приоритета */
  flex-direction: column !important; /* !important: Теперь основная ось вертикальная */
  align-items: center !important; /* !important: Центрируем дочерние элементы (кнопки, QR) по горизонтали */
  gap: 5px !important; /* !important для повышения приоритета */
  flex-wrap: nowrap; /* Запрещаем перенос */
}

/* Новый класс для строки (ряда) кнопок */
.qr-buttons-row.fenix-qr__buttons-row {
  display: flex !important; /* !important для повышения приоритета */
  flex-direction: row !important; /* !important: Кнопки в ряд */
  gap: 5px !important; /* !important: Отступ между кнопками */
  /* Убираем flex-shrink: 0 и align-self: stretch, так как теперь это ряд внутри колонки */
  /* align-self: flex-start; - если хотим прижать кнопки к верху, но обычно не нужно при flex-direction: column у родителя */
  flex-wrap: nowrap; /* Запрещаем перенос кнопок в ряду */
}

/* QR-код */
.qr-image.fenix-qr__image {
  width: v-bind('props.size + "px"'); /* Используем динамический размер */
  height: v-bind('props.size + "px"');
  /* flex-shrink: 0 !important; - можно оставить, если не хотим, чтобы изображение сжималось */
  border: 2px solid #d5cece;
  border-radius: 10px;
  /* align-self: center; - необязательно, так как родитель qr-container выравнивает по центру */
}

/* Стили для квадратных кнопок */
.square-button.fenix-qr__btn {
  width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
  margin-left: 0 !important;
  border-radius: 4px !important;
}

.no-url-message.fenix-qr__no-url {
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
  border: 2px solid #d5cece;
  border-radius: 10px;
}

.loading-large-qr {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>

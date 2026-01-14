<template>
  <div class="battery-container" :class="containerClass">
    <!-- Индикатор загрузки -->
    <div v-if="loading" class="battery-loader">
      <div class="loader-spinner"></div>
      <span>Загрузка аккумулятора...</span>
    </div>

    <!-- Индикатор ошибки -->
    <div v-else-if="error" class="battery-error">
      <Warning class="error-icon" />
      <span>{{ error }}</span>
    </div>

    <!-- Основной контент -->
    <div v-else class="battery-content">
      <slot name="visualization"></slot>
      <slot name="controls"></slot>
    </div>

    <!-- Fallback на CSS-версию -->
    <div v-if="fallbackVisible" class="battery-css-fallback">
      <slot name="fallback"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Warning } from '@element-plus/icons-vue';

const props = defineProps({
  voltage: {
    type: Number,
    required: true,
    default: 3.7
  },
  criticalVoltage: {
    type: Number,
    required: true,
    default: 3.2
  },
  batteryType: {
    type: String,
    default: 'cylindrical'
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupConfiguration: {
    type: Object,
    default: () => ({
      type: 'single',
      count: 1,
      connections: []
    })
  },
  webGLSupported: {
    type: Boolean,
    default: true
  }
});

const loading = ref(true);
const error = ref(null);
const fallbackVisible = computed(() => {
  return !props.webGLSupported || !props.webGLReady || !!error.value;
});

// Вычисляем класс контейнера
const containerClass = computed(() => {
  const classes = [];

  if (props.isGroup) {
    classes.push('battery-group');
    classes.push(`battery-group-${props.groupConfiguration.type}`);
  } else {
    classes.push('battery-single');
  }

  return classes.join(' ');
});

// Инициализация
onMounted(() => {
  loading.value = true;

  // Симулируем время инициализации
  setTimeout(() => {
    loading.value = false;
    error.value = null;

    // Симулируем ошибку инициализации (для тестирования)
    if (Math.random() > 0.99) {
      loading.value = false;
      error.value = 'Ошибка загрузки 3D-модели';
    }
  }, 500);
});
</script>

<style scoped>
.battery-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100px;
  min-height: 50px;
}

.battery-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #606266;
}

.loader-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f0f0f0;
  border-top: 2px solid #e6a23c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.battery-error {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #f56c6c;
  padding: 0.5rem;
  border: 1px solid #f56c6c;
  border-radius: 4px;
}

.error-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.battery-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.battery-css-fallback {
  width: 100%;
  height: 100%;
}
</style>

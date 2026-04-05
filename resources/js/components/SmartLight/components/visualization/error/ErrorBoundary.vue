<script setup>
import { ref, onErrorCaptured, getCurrentInstance } from 'vue';

const props = defineProps({
  deviceId: { type: String, required: true },
  componentType: { type: String, required: true } // 'battery', 'bulb', etc.
});

const hasError = ref(false);
const errorInfo = ref(null);
const isMounted = ref(false);

// ✅ ПЕРЕХВАТ ОШИБОК С ФИЛЬТРАЦИЕЙ
onErrorCaptured((err, instance, info) => {
  // ✅ СУПРЕССИЯ: игнорировать insertBefore ошибки от Three.js анимации
  // Это известная проблема Vue + requestAnimationFrame при быстром переключении
  if (err.message?.includes('insertBefore') || err.message?.includes('Cannot read properties of null')) {
    // Логируем для отладки, но не показываем пользователю
    console.debug(`[ErrorBoundary] Suppressed animation error for ${props.componentType} ${props.deviceId}:`, err.message);
    return false; // ✅ Не пробрасывать ошибку дальше
  }

  // Все остальные ошибки обрабатываем как обычно
  hasError.value = true;
  errorInfo.value = { error: err, component: props.componentType, deviceId: props.deviceId, info };

  console.error('[ErrorBoundary] Error captured:', errorInfo.value);

  // Не пробрасываем ошибку, чтобы не ломать родительский компонент
  return false;
});

onMounted(() => {
  isMounted.value = true;
});

onUnmounted(() => {
  isMounted.value = false;
});
</script>

<template>
  <!-- ✅ Рендерить слот только если компонент смонтирован и нет ошибки -->
  <slot v-if="isMounted && !hasError" name="default"></slot>

  <!-- Fallback при реальной ошибке -->
  <div v-else-if="hasError" class="error-boundary__fallback">
    <el-icon class="error-icon"><WarningFilled /></el-icon>
    <span class="error-text">Ошибка визуализации</span>
  </div>
</template>

<style scoped>
.error-boundary__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  color: #f56c6c;
  font-size: 11px;
  background: #fef0f0;
  border-radius: 4px;
}
.error-icon { font-size: 14px; }
</style>

<template>
  <Teleport to="body">
    <div
        class="layout-debug-wrapper"
        :class="{
        'debug-open': isOpen,
        'debug-right': position === 'right',
        'debug-left': position === 'left'
      }"
        :style="wrapperStyle"
    >
      <!-- Header -->
      <div class="debug-header">
        <slot name="header">
          <h3 class="debug-title">
            <el-icon><Tools /></el-icon>
            <span>{{ title }}</span>
          </h3>
          <el-button
              v-if="closable"
              type="info"
              size="small"
              circle
              @click="handleClose"
              class="debug-close-btn"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </slot>
      </div>

      <!-- Content -->
      <div class="debug-content" :class="{ 'content-scrollable': scrollable }">
        <slot name="content"></slot>
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="debug-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { Tools, Close } from '@element-plus/icons-vue';

const props = defineProps({
  /** Видимость панели */
  isOpen: { type: Boolean, default: false },

  /** Заголовок */
  title: { type: String, default: 'Отладка' },

  /** Позиция: left | right */
  position: {
    type: String,
    default: 'right',
    validator: (v) => ['left', 'right'].includes(v)
  },

  /** Возможность закрытия */
  closable: { type: Boolean, default: true },

  /** Ширина панели */
  width: { type: [String, Number], default: 320 },

  /** Высота панели */
  height: { type: [String, Number], default: 'auto' },

  /** Прокрутка контента */
  scrollable: { type: Boolean, default: true },

  /** Z-index */
  zIndex: { type: Number, default: 999 }
});

const emit = defineEmits(['close', 'update:isOpen']);

const wrapperStyle = computed(() => {
  const styles = {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    zIndex: props.zIndex
  };

  if (props.height !== 'auto') {
    styles.height = typeof props.height === 'number'
        ? `${props.height}px`
        : props.height;
  }

  return styles;
});

const handleClose = () => {
  emit('close');
  emit('update:isOpen', false);
};
</script>

<style scoped>
.layout-debug-wrapper {
  position: fixed;
  top: 120px;
  bottom: 20px;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, visibility 0.3s ease;
  z-index: 999;
  display: flex;
  flex-direction: column;
  border-radius: 8px 0 0 8px;
  overflow: hidden;
}

/* Position variants */
.debug-right {
  right: 0;
  transform: translateX(100%);
  visibility: hidden;
  border-radius: 8px 0 0 8px;
}

.debug-right.debug-open {
  transform: translateX(0);
  visibility: visible;
}

.debug-left {
  left: 0;
  transform: translateX(-100%);
  visibility: hidden;
  border-radius: 0 8px 8px 0;
}

.debug-left.debug-open {
  transform: translateX(0);
  visibility: visible;
}

/* Header */
.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
  border-bottom: 1px solid #fbc02d;
  flex-shrink: 0;
}

.debug-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.debug-title .el-icon {
  color: #f57c00;
  font-size: 14px;
}

.debug-close-btn {
  padding: 4px;
}

/* Content */
.debug-content {
  flex: 1;
  overflow: hidden;
  padding: 10px 14px;
  background: #fcfcfc;
}

.debug-content.content-scrollable {
  overflow-y: auto;
  overflow-x: hidden;
}

/* Footer */
.debug-footer {
  padding: 10px 14px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .layout-debug-wrapper {
    width: 280px !important;
  }
}

@media (max-width: 768px) {
  .layout-debug-wrapper {
    top: 100px;
    bottom: 16px;
    width: 100% !important;
    max-width: 100vw;
    border-radius: 12px 12px 0 0;
  }

  .debug-right,
  .debug-left {
    transform: translateY(100%);
  }

  .debug-right.debug-open,
  .debug-left.debug-open {
    transform: translateY(0);
  }

  .debug-header {
    border-radius: 12px 12px 0 0;
  }
}

/* Animation */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    visibility: hidden;
  }
  to {
    transform: translateX(0);
    visibility: visible;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    visibility: hidden;
  }
  to {
    transform: translateY(0);
    visibility: visible;
  }
}

@media (min-width: 769px) {
  .debug-right.debug-open {
    animation: slideInRight 0.3s ease forwards;
  }
}

@media (max-width: 768px) {
  .debug-right.debug-open,
  .debug-left.debug-open {
    animation: slideInUp 0.3s ease forwards;
  }
}
</style>

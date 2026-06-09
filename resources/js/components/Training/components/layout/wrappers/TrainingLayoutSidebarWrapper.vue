<template>
  <Teleport to="body">
    <div
        class="layout-sidebar-wrapper"
        :class="{
        'sidebar-open': isOpen,
        'sidebar-right': position === 'right',
        'sidebar-left': position === 'left'
      }"
        :style="wrapperStyle"
    >
      <!-- Overlay -->
      <div
          v-if="isOpen && overlay"
          class="sidebar-overlay"
          @click="handleOverlayClick"
      ></div>

      <!-- Sidebar Content -->
      <div class="sidebar-content-wrapper">
        <!-- Header -->
        <div class="sidebar-header">
          <slot name="header">
            <h3 class="sidebar-title">
              <el-icon v-if="icon">
                <component :is="icon" />
              </el-icon>
              <span>{{ title }}</span>
            </h3>
            <el-button
                v-if="closable"
                type="info"
                size="small"
                circle
                @click="handleClose"
                class="sidebar-close-btn"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </slot>
        </div>

        <!-- Body -->
        <div class="sidebar-body" :class="{ 'body-scrollable': scrollable }">
          <slot name="content">
            <div class="sidebar-empty">
              <el-icon><InfoFilled /></el-icon>
              <p>{{ emptyText }}</p>
            </div>
          </slot>
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="sidebar-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { Close, InfoFilled } from '@element-plus/icons-vue';

const props = defineProps({
  /** Видимость сайдбара */
  isOpen: { type: Boolean, default: false },

  /** Заголовок */
  title: { type: String, default: 'Панель' },

  /** Иконка в заголовке */
  icon: { type: Object, default: null },

  /** Позиция: left | right */
  position: {
    type: String,
    default: 'right',
    validator: (v) => ['left', 'right'].includes(v)
  },

  /** Возможность закрытия */
  closable: { type: Boolean, default: true },

  /** Оверлей при открытии */
  overlay: { type: Boolean, default: true },

  /** Текст для пустого состояния */
  emptyText: { type: String, default: 'Нет данных для отображения' },

  /** Прокрутка контента */
  scrollable: { type: Boolean, default: true },

  /** Ширина сайдбара */
  width: { type: [String, Number], default: 360 },

  /** Z-index */
  zIndex: { type: Number, default: 1000 }
});

const emit = defineEmits(['close', 'update:isOpen']);

const wrapperStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  zIndex: props.zIndex
}));

const handleClose = () => {
  emit('close');
  emit('update:isOpen', false);
};

const handleOverlayClick = () => {
  if (props.closable) {
    handleClose();
  }
};
</script>

<style scoped>
.layout-sidebar-wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  height: 100vh;
  background: #fff;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease, visibility 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

/* Position variants */
.sidebar-right {
  right: 0;
  transform: translateX(100%);
  visibility: hidden;
}

.sidebar-right.sidebar-open {
  transform: translateX(0);
  visibility: visible;
}

.sidebar-left {
  left: 0;
  transform: translateX(-100%);
  visibility: hidden;
}

.sidebar-left.sidebar-open {
  transform: translateX(0);
  visibility: visible;
}

/* Overlay */
.sidebar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

/* Content Wrapper */
.sidebar-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 1;
}

/* Header */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f5f7fa 100%);
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.sidebar-title .el-icon {
  color: #409eff;
  font-size: 16px;
}

.sidebar-close-btn {
  padding: 4px;
}

/* Body */
.sidebar-body {
  flex: 1;
  overflow: hidden;
  padding: 12px 16px;
}

.sidebar-body.body-scrollable {
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  gap: 12px;
  text-align: center;
}

.sidebar-empty .el-icon {
  font-size: 48px;
  color: #c0c4cc;
}

.sidebar-empty p {
  margin: 0;
  font-size: 13px;
}

/* Footer */
.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .layout-sidebar-wrapper {
    width: 100% !important;
    max-width: 100vw;
  }

  .sidebar-header {
    padding: 10px 14px;
  }

  .sidebar-body {
    padding: 10px 14px;
  }
}

/* Animation */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    visibility: hidden;
  }
  to {
    transform: translateX(0);
    visibility: visible;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    visibility: hidden;
  }
  to {
    transform: translateX(0);
    visibility: visible;
  }
}

.sidebar-right.sidebar-open {
  animation: slideIn 0.3s ease forwards;
}

.sidebar-left.sidebar-open {
  animation: slideInLeft 0.3s ease forwards;
}
</style>

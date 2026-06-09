<template>
  <div
      class="layout-panel-wrapper"
      :class="wrapperClass"
      :style="wrapperStyle"
  >
    <!-- Header -->
    <div v-if="title || $slots.header" class="panel-header">
      <slot name="header">
        <h3 class="panel-title">
          <el-icon v-if="icon">
            <component :is="icon" />
          </el-icon>
          <span>{{ title }}</span>
        </h3>
        <slot name="header-actions"></slot>
      </slot>
    </div>

    <!-- Content -->
    <div class="panel-content" :class="{ 'content-scrollable': scrollable }">
      <slot></slot>
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="panel-footer">
      <slot name="footer"></slot>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="panel-loading-overlay">
      <el-skeleton :rows="3" animated />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** Заголовок панели */
  title: { type: String, default: '' },

  /** Иконка в заголовке */
  icon: { type: Object, default: null },

  /** Рамка вокруг панели */
  bordered: { type: Boolean, default: true },

  /** Тень панели */
  shadow: { type: Boolean, default: false },

  /** Сворачиваемая панель */
  collapsible: { type: Boolean, default: false },

  /** Прокрутка контента */
  scrollable: { type: Boolean, default: false },

  /** Максимальная высота контента */
  maxHeight: { type: [String, Number], default: 'none' },

  /** Состояние загрузки */
  loading: { type: Boolean, default: false },

  /** Отступы внутри панели */
  padding: {
    type: String,
    default: 'normal',
    validator: (v) => ['none', 'small', 'normal', 'large'].includes(v)
  }
});

const wrapperClass = computed(() => ({
  'layout-panel-wrapper--bordered': props.bordered,
  'layout-panel-wrapper--shadow': props.shadow,
  'layout-panel-wrapper--collapsible': props.collapsible,
  [`layout-panel-wrapper--padding-${props.padding}`]: true
}));

const wrapperStyle = computed(() => {
  const styles = {};
  if (props.maxHeight !== 'none') {
    styles.maxHeight = typeof props.maxHeight === 'number'
        ? `${props.maxHeight}px`
        : props.maxHeight;
  }
  return styles;
});
</script>

<style scoped>
.layout-panel-wrapper {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.layout-panel-wrapper--bordered {
  border: 1px solid #e4e7ed;
}

.layout-panel-wrapper--shadow {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.layout-panel-wrapper--collapsible {
  cursor: pointer;
}

.layout-panel-wrapper--collapsible:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

/* Padding variants */
.layout-panel-wrapper--padding-none .panel-content { padding: 0; }
.layout-panel-wrapper--padding-small .panel-content { padding: 8px; }
.layout-panel-wrapper--padding-normal .panel-content { padding: 16px; }
.layout-panel-wrapper--padding-large .panel-content { padding: 24px; }

/* Header */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f5f7fa 100%);
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.panel-title .el-icon {
  color: #409eff;
  font-size: 16px;
}

/* Content */
.panel-content {
  flex: 1;
  overflow: hidden;
}

.panel-content.content-scrollable {
  overflow-y: auto;
  overflow-x: hidden;
}

/* Footer */
.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  flex-shrink: 0;
}

/* Loading Overlay */
.panel-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .panel-header {
    padding: 10px 12px;
  }

  .panel-title {
    font-size: 13px;
  }

  .layout-panel-wrapper--padding-normal .panel-content {
    padding: 12px;
  }
}
</style>
